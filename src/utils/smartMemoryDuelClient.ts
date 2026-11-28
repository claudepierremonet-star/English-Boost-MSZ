import type { CEFRLevel, SmartMemoryDuelMode, SmartMemoryDuelRoom } from '../firebase/types';
import {
  auth,
  createSmartMemoryDuelInFirestore,
  getSmartMemoryDuelFromFirestore,
  isFirebaseConfigured,
  joinSmartMemoryDuelInFirestore,
  mergeDuelRoomsIdempotent,
  submitSmartMemoryDuelProgressInFirestore,
  subscribeToSmartMemoryDuelInFirestore
} from '../firebase/client';
import {
  createInitialDuelRoom,
  DUEL_TOTAL_CARDS,
  generateDuelRoomCode,
  normalizeDuelRoomCode
} from './smartMemoryDuelEngine';
import type { DuelWsServerMessage } from '../../server/smartMemoryDuelServer';

const TAB_UID_STORAGE_KEY = 'eb_smart_memory_duel_tab_uid_v1';

export interface DuelParticipantIdentity {
  uid: string;
  displayName: string;
  isFirebaseAuthenticated: boolean;
}

/**
 * Returns the active participant identity:
 * - Firebase Auth UID when signed in with Google
 * - Per-tab sessionStorage UID otherwise (allows real 2-player duels across two tabs without collision)
 */
export function resolveDuelParticipantIdentity(
  fallbackDisplayName: string
): DuelParticipantIdentity {
  const firebaseUser = isFirebaseConfigured ? auth?.currentUser : null;
  if (firebaseUser?.uid) {
    return {
      uid: firebaseUser.uid,
      displayName: (
        firebaseUser.displayName ||
        fallbackDisplayName ||
        'Joueur'
      ).slice(0, 80),
      isFirebaseAuthenticated: true
    };
  }

  let tabUid = '';
  if (typeof sessionStorage !== 'undefined') {
    tabUid = sessionStorage.getItem(TAB_UID_STORAGE_KEY) || '';
    if (!tabUid) {
      tabUid = `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        sessionStorage.setItem(TAB_UID_STORAGE_KEY, tabUid);
      } catch {
        // ignore storage quota
      }
    }
  } else {
    tabUid = `mem_${Math.random().toString(36).slice(2, 9)}`;
  }

  return {
    uid: tabUid,
    displayName: (fallbackDisplayName || 'Joueur').slice(0, 80),
    isFirebaseAuthenticated: false
  };
}

export function buildDuelInviteUrl(duelId: string): string {
  if (typeof window === 'undefined') return `?duel=${duelId}`;
  const url = new URL(window.location.href);
  url.searchParams.set('duel', duelId);
  return url.toString();
}

function resolveWebSocketUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/smart-memory-duel`;
}

export interface DuelTransportCallbacks {
  onRoomUpdate: (room: SmartMemoryDuelRoom) => void;
  onConnectionChange: (state: 'connecting' | 'connected' | 'reconnecting' | 'error') => void;
  onError: (message: string) => void;
}

/**
 * Real-time duel connection managing server-authoritative WebSocket transport
 * plus Cloud Firestore onSnapshot synchronization for authenticated cross-device play.
 */
export class SmartMemoryDuelSessionClient {
  private ws: WebSocket | null = null;
  private activeDuelId: string | null = null;
  private latestRoom: SmartMemoryDuelRoom | null = null;
  private callbacks: DuelTransportCallbacks;
  private unsubscribeFirestore: (() => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private disposed = false;

  constructor(callbacks: DuelTransportCallbacks) {
    this.callbacks = callbacks;
  }

  private mergeAndEmit(incoming: SmartMemoryDuelRoom): void {
    const merged = this.latestRoom
      ? mergeDuelRoomsIdempotent(this.latestRoom, incoming)
      : incoming;
    this.latestRoom = merged;
    this.callbacks.onRoomUpdate(merged);
  }

  private attachFirestoreListener(duelId: string): void {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    if (isFirebaseConfigured && auth?.currentUser) {
      this.unsubscribeFirestore = subscribeToSmartMemoryDuelInFirestore(
        duelId,
        (remoteRoom) => {
          this.mergeAndEmit(remoteRoom);
        },
        (err) => {
          console.warn('Firestore duel snapshot warning:', err);
        }
      );
    }
  }

  private ensureWebSocket(): Promise<WebSocket | null> {
    const wsUrl = resolveWebSocketUrl();
    if (!wsUrl || typeof WebSocket === 'undefined') {
      return Promise.resolve(null);
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    }

    this.callbacks.onConnectionChange(
      this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    );

    return new Promise((resolve) => {
      try {
        const socket = new WebSocket(wsUrl);
        let settled = false;

        const timeout = setTimeout(() => {
          if (!settled) {
            settled = true;
            resolve(null);
          }
        }, 4500);

        socket.onopen = () => {
          if (this.disposed) {
            socket.close();
            return;
          }
          clearTimeout(timeout);
          this.ws = socket;
          this.reconnectAttempts = 0;
          this.callbacks.onConnectionChange('connected');

          if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'duel:ping' }));
            }
          }, 20_000);

          if (this.activeDuelId) {
            socket.send(
              JSON.stringify({
                type: 'duel:sync',
                payload: { duelId: this.activeDuelId }
              })
            );
          }

          if (!settled) {
            settled = true;
            resolve(socket);
          }
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(String(event.data)) as DuelWsServerMessage;
            if (msg.type === 'duel:state') {
              this.mergeAndEmit(msg.room);
            } else if (msg.type === 'duel:error') {
              // If WS lost room (e.g., server restart or cross-instance) and Firestore has it, keep Firestore active
              if (msg.code === 'ROOM_NOT_FOUND' && this.latestRoom) {
                return;
              }
              this.callbacks.onError(msg.message);
            }
          } catch {
            // ignore malformed frame
          }
        };

        socket.onerror = () => {
          clearTimeout(timeout);
          if (!settled) {
            settled = true;
            resolve(null);
          }
        };

        socket.onclose = () => {
          if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
          }
          if (this.ws === socket) {
            this.ws = null;
          }
          if (!this.disposed && this.activeDuelId) {
            this.scheduleReconnect();
          }
        };
      } catch {
        resolve(null);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.disposed || !this.activeDuelId || this.reconnectTimer) return;
    const delayMs = Math.min(8000, 900 * Math.pow(1.6, this.reconnectAttempts));
    this.reconnectAttempts += 1;
    this.callbacks.onConnectionChange('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.disposed && this.activeDuelId) {
        this.ensureWebSocket();
      }
    }, delayMs);
  }

  public async createRoom(params: {
    hostIdentity: DuelParticipantIdentity;
    cefrLevel: CEFRLevel;
    mode: SmartMemoryDuelMode;
    cardIds: string[];
  }): Promise<SmartMemoryDuelRoom | null> {
    if (params.cardIds.length !== DUEL_TOTAL_CARDS) {
      this.callbacks.onError('La série doit contenir exactement 10 cartes.');
      return null;
    }

    const duelId = generateDuelRoomCode();
    const initialRoom = createInitialDuelRoom({
      duelId,
      hostUid: params.hostIdentity.uid,
      hostName: params.hostIdentity.displayName,
      cefrLevel: params.cefrLevel,
      mode: params.mode,
      cardIds: params.cardIds
    });

    this.activeDuelId = duelId;
    this.latestRoom = initialRoom;
    this.callbacks.onRoomUpdate(initialRoom);

    if (params.hostIdentity.isFirebaseAuthenticated) {
      await createSmartMemoryDuelInFirestore(initialRoom);
      this.attachFirestoreListener(duelId);
    }

    const socket = await this.ensureWebSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'duel:create',
          payload: {
            duelId,
            hostUid: params.hostIdentity.uid,
            hostName: params.hostIdentity.displayName,
            cefrLevel: params.cefrLevel,
            mode: params.mode,
            cardIds: params.cardIds
          }
        })
      );
    } else if (!params.hostIdentity.isFirebaseAuthenticated) {
      this.callbacks.onError(
        'Connexion WebSocket temps réel indisponible. Vérifiez votre connexion.'
      );
      return null;
    }

    return this.latestRoom;
  }

  public async joinRoom(params: {
    rawDuelCode: string;
    guestIdentity: DuelParticipantIdentity;
  }): Promise<SmartMemoryDuelRoom | null> {
    const duelId = normalizeDuelRoomCode(params.rawDuelCode);
    if (!duelId || duelId.length < 4) {
      this.callbacks.onError('Saisissez un code de duel valide (6 caractères).');
      return null;
    }

    this.activeDuelId = duelId;
    let fallbackRoom: SmartMemoryDuelRoom | null = null;

    if (params.guestIdentity.isFirebaseAuthenticated) {
      const joinedRemote = await joinSmartMemoryDuelInFirestore(
        duelId,
        params.guestIdentity.displayName
      );
      if (joinedRemote) {
        fallbackRoom = joinedRemote;
        this.mergeAndEmit(joinedRemote);
      } else {
        const fetched = await getSmartMemoryDuelFromFirestore(duelId);
        if (fetched) {
          fallbackRoom = fetched;
        }
      }
      this.attachFirestoreListener(duelId);
    }

    const socket = await this.ensureWebSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'duel:join',
          payload: {
            duelId,
            guestUid: params.guestIdentity.uid,
            guestName: params.guestIdentity.displayName,
            fallbackRoom
          }
        })
      );
    } else if (!fallbackRoom) {
      this.callbacks.onError(
        'Impossible de joindre le serveur de duel en temps réel.'
      );
      return null;
    }

    return this.latestRoom;
  }

  public async submitAnswer(params: {
    duelId: string;
    playerIdentity: DuelParticipantIdentity;
    cardIndex: number;
    selectedOptionId: string;
    responseTimeMs: number;
  }): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'duel:answer',
          payload: {
            duelId: params.duelId,
            playerUid: params.playerIdentity.uid,
            cardIndex: params.cardIndex,
            selectedOptionId: params.selectedOptionId,
            responseTimeMs: params.responseTimeMs
          }
        })
      );
    }

    if (params.playerIdentity.isFirebaseAuthenticated) {
      const updated = await submitSmartMemoryDuelProgressInFirestore({
        duelId: params.duelId,
        cardIndex: params.cardIndex,
        selectedOptionId: params.selectedOptionId,
        responseTimeMs: params.responseTimeMs
      });
      if (updated) {
        this.mergeAndEmit(updated);
      }
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.activeDuelId = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore close error
      }
      this.ws = null;
    }
  }
}
