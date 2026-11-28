import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer, WebSocket } from 'ws';
import type {
  CEFRLevel,
  SmartMemoryDuelMode,
  SmartMemoryDuelRoom
} from '../src/firebase/types.ts';
import { SMART_MEMORY_CATALOG } from '../src/data/smartMemoryBank.ts';
import {
  applyAnswerToDuelRoom,
  createInitialDuelRoom,
  DUEL_TOTAL_CARDS,
  generateDuelRoomCode,
  normalizeDuelRoomCode
} from '../src/utils/smartMemoryDuelEngine.ts';

export const DUEL_WS_PATH = '/ws/smart-memory-duel';
const ROOM_TTL_MS = 1000 * 60 * 90; // 90 minutes

interface CreatePayload {
  duelId?: string;
  hostUid: string;
  hostName: string;
  cefrLevel: CEFRLevel;
  mode: SmartMemoryDuelMode;
  cardIds: string[];
}

interface JoinPayload {
  duelId: string;
  guestUid: string;
  guestName: string;
  fallbackRoom?: SmartMemoryDuelRoom | null;
}

interface SyncPayload {
  duelId: string;
}

interface AnswerPayload {
  duelId: string;
  playerUid: string;
  cardIndex: number;
  selectedOptionId: string;
  responseTimeMs: number;
}

export type DuelWsClientMessage =
  | { type: 'duel:create'; payload: CreatePayload }
  | { type: 'duel:join'; payload: JoinPayload }
  | { type: 'duel:sync'; payload: SyncPayload }
  | { type: 'duel:answer'; payload: AnswerPayload }
  | { type: 'duel:ping' };

export type DuelWsServerMessage =
  | { type: 'duel:state'; room: SmartMemoryDuelRoom }
  | { type: 'duel:error'; code: string; message: string }
  | { type: 'duel:pong' };

const VALID_CEFR = new Set<CEFRLevel>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const VALID_MODES = new Set<SmartMemoryDuelMode>([
  'mixed',
  'en_to_fr',
  'fr_to_en',
  'multiple_choice',
  'complete_sentence'
]);

export class SmartMemoryDuelHubServer {
  private readonly rooms = new Map<string, SmartMemoryDuelRoom>();
  private readonly roomSockets = new Map<string, Set<WebSocket>>();
  private readonly socketRooms = new Map<WebSocket, Set<string>>();

  private send(ws: WebSocket, msg: DuelWsServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  private broadcast(duelId: string, msg: DuelWsServerMessage): void {
    const sockets = this.roomSockets.get(duelId);
    if (!sockets) return;
    const raw = JSON.stringify(msg);
    for (const client of sockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    }
  }

  private subscribeSocket(ws: WebSocket, duelId: string): void {
    if (!this.roomSockets.has(duelId)) {
      this.roomSockets.set(duelId, new Set());
    }
    this.roomSockets.get(duelId)!.add(ws);

    if (!this.socketRooms.has(ws)) {
      this.socketRooms.set(ws, new Set());
    }
    this.socketRooms.get(ws)!.add(duelId);
  }

  private pruneExpiredRooms(): void {
    const now = Date.now();
    for (const [duelId, room] of this.rooms.entries()) {
      const updatedMs = new Date(room.updatedAt).getTime();
      if (Number.isFinite(updatedMs) && now - updatedMs > ROOM_TTL_MS) {
        this.rooms.delete(duelId);
        this.roomSockets.delete(duelId);
      }
    }
  }

  public getRoom(duelId: string): SmartMemoryDuelRoom | undefined {
    return this.rooms.get(normalizeDuelRoomCode(duelId));
  }

  public handleDisconnect(ws: WebSocket): void {
    const joined = this.socketRooms.get(ws);
    if (joined) {
      for (const duelId of joined) {
        this.roomSockets.get(duelId)?.delete(ws);
      }
      this.socketRooms.delete(ws);
    }
  }

  public handleMessage(ws: WebSocket, rawData: string): void {
    this.pruneExpiredRooms();
    let parsed: DuelWsClientMessage;
    try {
      parsed = JSON.parse(rawData) as DuelWsClientMessage;
    } catch {
      this.send(ws, {
        type: 'duel:error',
        code: 'INVALID_JSON',
        message: 'Message WebSocket invalide.'
      });
      return;
    }

    if (!parsed || typeof parsed.type !== 'string') return;

    if (parsed.type === 'duel:ping') {
      this.send(ws, { type: 'duel:pong' });
      return;
    }

    if (parsed.type === 'duel:create') {
      const p = parsed.payload;
      if (!p || !p.hostUid || !Array.isArray(p.cardIds) || p.cardIds.length !== DUEL_TOTAL_CARDS) {
        this.send(ws, {
          type: 'duel:error',
          code: 'INVALID_CREATE_PAYLOAD',
          message: 'Le duel doit contenir exactement 10 cartes Smart Memory valides.'
        });
        return;
      }

      const requestedId = p.duelId ? normalizeDuelRoomCode(p.duelId) : '';
      let duelId = requestedId || generateDuelRoomCode();
      while (this.rooms.has(duelId) && !requestedId) {
        duelId = generateDuelRoomCode();
      }

      const cefrLevel: CEFRLevel = VALID_CEFR.has(p.cefrLevel) ? p.cefrLevel : 'B1';
      const mode: SmartMemoryDuelMode = VALID_MODES.has(p.mode) ? p.mode : 'mixed';
      const validIds = p.cardIds.filter((id) =>
        SMART_MEMORY_CATALOG.some((item) => item.itemId === id)
      );
      if (validIds.length !== DUEL_TOTAL_CARDS) {
        this.send(ws, {
          type: 'duel:error',
          code: 'INVALID_CARD_IDS',
          message: 'Certaines cartes du duel sont introuvables dans le catalogue.'
        });
        return;
      }

      const existing = this.rooms.get(duelId);
      const room =
        existing ??
        createInitialDuelRoom({
          duelId,
          hostUid: String(p.hostUid).slice(0, 128),
          hostName: String(p.hostName || 'Joueur 1').slice(0, 80),
          cefrLevel,
          mode,
          cardIds: validIds
        });

      this.rooms.set(duelId, room);
      this.subscribeSocket(ws, duelId);
      this.send(ws, { type: 'duel:state', room });
      return;
    }

    if (parsed.type === 'duel:join') {
      const p = parsed.payload;
      const duelId = normalizeDuelRoomCode(p?.duelId || '');
      if (!duelId || !p?.guestUid) {
        this.send(ws, {
          type: 'duel:error',
          code: 'INVALID_JOIN_PAYLOAD',
          message: 'Code de duel ou identifiant joueur manquant.'
        });
        return;
      }

      let room = this.rooms.get(duelId);
      if (!room && p.fallbackRoom && p.fallbackRoom.duelId === duelId) {
        room = p.fallbackRoom;
        this.rooms.set(duelId, room);
      }

      if (!room) {
        this.send(ws, {
          type: 'duel:error',
          code: 'ROOM_NOT_FOUND',
          message: `Aucun duel actif trouvé avec le code « ${duelId} ».`
        });
        return;
      }

      // Same player reconnecting as host or guest
      if (room.hostUid === p.guestUid || room.guestUid === p.guestUid) {
        this.subscribeSocket(ws, duelId);
        this.send(ws, { type: 'duel:state', room });
        return;
      }

      if (room.guestUid && room.guestUid !== p.guestUid) {
        this.send(ws, {
          type: 'duel:error',
          code: 'ROOM_FULL',
          message: 'Ce duel comporte déjà 2 participants.'
        });
        return;
      }

      if (room.status === 'finished') {
        this.send(ws, {
          type: 'duel:error',
          code: 'DUEL_FINISHED',
          message: 'Ce duel est déjà terminé.'
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const updated: SmartMemoryDuelRoom = {
        ...room,
        guestUid: String(p.guestUid).slice(0, 128),
        guestName: String(p.guestName || 'Joueur 2').slice(0, 80),
        status: 'active',
        startedAt: room.startedAt ?? nowIso,
        updatedAt: nowIso
      };

      this.rooms.set(duelId, updated);
      this.subscribeSocket(ws, duelId);
      this.broadcast(duelId, { type: 'duel:state', room: updated });
      return;
    }

    if (parsed.type === 'duel:sync') {
      const duelId = normalizeDuelRoomCode(parsed.payload?.duelId || '');
      const room = this.rooms.get(duelId);
      if (!room) {
        this.send(ws, {
          type: 'duel:error',
          code: 'ROOM_NOT_FOUND',
          message: `Salon « ${duelId} » introuvable ou expiré.`
        });
        return;
      }
      this.subscribeSocket(ws, duelId);
      this.send(ws, { type: 'duel:state', room });
      return;
    }

    if (parsed.type === 'duel:answer') {
      const p = parsed.payload;
      const duelId = normalizeDuelRoomCode(p?.duelId || '');
      const room = this.rooms.get(duelId);
      if (!room) {
        this.send(ws, {
          type: 'duel:error',
          code: 'ROOM_NOT_FOUND',
          message: `Salon « ${duelId} » introuvable.`
        });
        return;
      }

      const nextRoom = applyAnswerToDuelRoom({
        room,
        playerUid: p.playerUid,
        cardIndex: Number(p.cardIndex),
        selectedOptionId: String(p.selectedOptionId || ''),
        responseTimeMs: Number(p.responseTimeMs) || 3000
      });

      this.rooms.set(duelId, nextRoom);
      this.subscribeSocket(ws, duelId);
      this.broadcast(duelId, { type: 'duel:state', room: nextRoom });
    }
  }
}

export function attachSmartMemoryDuelWebSocket(
  httpServer: {
    on: (
      event: 'upgrade',
      listener: (req: IncomingMessage, socket: Duplex, head: Buffer) => void
    ) => void;
  }
): SmartMemoryDuelHubServer {
  const hub = new SmartMemoryDuelHubServer();
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data) => {
      hub.handleMessage(ws, data.toString());
    });
    ws.on('close', () => {
      hub.handleDisconnect(ws);
    });
  });

  httpServer.on('upgrade', (req, socket, head) => {
    try {
      const pathname = new URL(req.url || '/', 'http://localhost').pathname;
      if (pathname !== DUEL_WS_PATH) {
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } catch {
      // Ignore unrelated upgrade requests cleanly
    }
  });

  return hub;
}
