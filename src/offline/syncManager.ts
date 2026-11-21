/**
 * English Boost MZ - Offline & Online Synchronization Manager
 * Coordinates bidirectional sync between IndexedDB and Firebase Cloud Firestore.
 */

import {
  getPendingSyncOperations,
  removeSyncOperation,
  markAttemptsAsSyncedInIndexedDB,
  recordLastSyncTime,
  getIndexedDBStats,
  type SyncQueueItem,
  type IndexedDBStats
} from './indexedDb';
import {
  isFirebaseConfigured,
  db,
  auth,
  reconcileUserProfileWithFirestore,
  OperationType,
  handleFirestoreError
} from '../firebase/client';
import type { UserProfile } from '../firebase/types';
import { doc, setDoc } from 'firebase/firestore';

const AUTO_SYNC_PREF_KEY = 'eb_msz_auto_sync_enabled_v1';

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  totalOfflineRecords: number;
  syncError: string | null;
}

export interface ManualSyncResult {
  status: 'success' | 'offline' | 'unauthenticated' | 'not_configured' | 'error';
  syncedCount: number;
  attemptsSynced: number;
  errorsCount: number;
  profileSynced: boolean;
  syncedProfile?: UserProfile;
  message: string;
}

type SyncListener = (state: SyncStatusState) => void;

function readAutoSyncPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(AUTO_SYNC_PREF_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private autoSyncEnabled: boolean = readAutoSyncPreference();
  private pendingCount: number = 0;
  private totalOfflineRecords: number = 0;
  private lastSyncTime: string | null = null;
  private syncError: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Initial stats fetch
      this.refreshStats();

      // Check sync queue every 45 seconds if online and auto-sync is enabled
      this.autoSyncInterval = window.setInterval(() => {
        if (this.autoSyncEnabled && this.isOnline && !this.isSyncing) {
          this.syncPendingData();
        }
      }, 45000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncStatusState {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.autoSyncEnabled,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      totalOfflineRecords: this.totalOfflineRecords,
      syncError: this.syncError
    };
  }

  public setAutoSyncEnabled(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(AUTO_SYNC_PREF_KEY, String(enabled));
      } catch {
        // Ignore storage quota errors
      }
    }
    this.notify();

    // If re-enabled while online with queued items, kick off a sync cleanly
    if (enabled && this.isOnline && !this.isSyncing && this.pendingCount > 0) {
      this.syncPendingData();
    }
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error('Error notifying sync listener', e);
      }
    });
  }

  public async refreshStats(): Promise<IndexedDBStats> {
    const stats = await getIndexedDBStats();
    this.pendingCount = stats.pendingSyncCount;
    this.totalOfflineRecords = stats.attemptsCount;
    this.lastSyncTime = stats.lastSyncTime;
    this.notify();
    return stats;
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncError = null;
    this.notify();
    // Auto-sync immediately when connection is restored (if autoSyncEnabled)
    if (this.autoSyncEnabled) {
      setTimeout(() => {
        this.syncPendingData();
      }, 1200);
    }
  }

  private handleOffline() {
    this.isOnline = false;
    this.notify();
  }

  /**
   * User-triggered immediate bidirectional Firestore synchronization when online.
   */
  public async syncNow(): Promise<ManualSyncResult> {
    if (this.isSyncing) {
      return {
        status: 'error',
        syncedCount: 0,
        attemptsSynced: 0,
        errorsCount: 0,
        profileSynced: false,
        message: 'Une synchronisation Firestore est déjà en cours.'
      };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline = false;
      this.syncError = 'Appareil hors-ligne : impossible de joindre Cloud Firestore.';
      this.notify();
      return {
        status: 'offline',
        syncedCount: 0,
        attemptsSynced: 0,
        errorsCount: 0,
        profileSynced: false,
        message: this.syncError
      };
    }

    this.isOnline = true;

    if (!isFirebaseConfigured || !db) {
      this.syncError = 'Configuration Firebase manquante.';
      this.notify();
      return {
        status: 'not_configured',
        syncedCount: 0,
        attemptsSynced: 0,
        errorsCount: 0,
        profileSynced: false,
        message: this.syncError
      };
    }

    if (!auth?.currentUser) {
      this.syncError = null;
      this.notify();
      return {
        status: 'unauthenticated',
        syncedCount: 0,
        attemptsSynced: 0,
        errorsCount: 0,
        profileSynced: false,
        message: 'Connectez votre compte Google pour synchroniser vos données avec Cloud Firestore.'
      };
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    let syncedCount = 0;
    let errorsCount = 0;
    let attemptsSynced = 0;
    let profileSynced = false;
    let syncedProfile: UserProfile | undefined;

    try {
      const queueResult = await this.processQueueInternal();
      syncedCount = queueResult.syncedCount;
      errorsCount = queueResult.errorsCount;

      const reconcileResult = await reconcileUserProfileWithFirestore();
      profileSynced = reconcileResult.synced;
      attemptsSynced = reconcileResult.attemptsSynced;
      syncedProfile = reconcileResult.profile;

      if (profileSynced) {
        const nowIso = new Date().toISOString();
        await recordLastSyncTime(nowIso);
        this.lastSyncTime = nowIso;
      }

      const totalItems = syncedCount + attemptsSynced;
      return {
        status: errorsCount > 0 && !profileSynced ? 'error' : 'success',
        syncedCount,
        attemptsSynced,
        errorsCount,
        profileSynced,
        syncedProfile,
        message:
          totalItems > 0
            ? `Synchronisation Firestore réussie : profil & ${totalItems} élément(s) mis à jour.`
            : 'Profil et progression à jour avec Cloud Firestore.'
      };
    } catch (e: any) {
      console.warn('Manual Firestore sync failed:', e);
      this.syncError = e?.message || 'Erreur lors de la synchronisation Cloud Firestore.';
      return {
        status: 'error',
        syncedCount,
        attemptsSynced,
        errorsCount: errorsCount + 1,
        profileSynced,
        message: this.syncError || 'Erreur de synchronisation Cloud Firestore.'
      };
    } finally {
      this.isSyncing = false;
      await this.refreshStats();
    }
  }

  /**
   * Process all queued operations and push to Cloud Firestore
   */
  public async syncPendingData(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (this.isSyncing) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline = false;
      this.notify();
      return { syncedCount: 0, errorsCount: 0 };
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    let syncedCount = 0;
    let errorsCount = 0;

    try {
      const result = await this.processQueueInternal();
      syncedCount = result.syncedCount;
      errorsCount = result.errorsCount;

      if (auth?.currentUser && errorsCount === 0 && syncedCount > 0) {
        const nowIso = new Date().toISOString();
        await recordLastSyncTime(nowIso);
        this.lastSyncTime = nowIso;
      }
    } catch (e: any) {
      console.warn('Sync manager global sync error:', e);
      this.syncError = e?.message || 'Erreur de synchronisation';
    } finally {
      this.isSyncing = false;
      await this.refreshStats();
    }

    return { syncedCount, errorsCount };
  }

  private async processQueueInternal(): Promise<{ syncedCount: number; errorsCount: number }> {
    let syncedCount = 0;
    let errorsCount = 0;
    const syncedAttemptIds: string[] = [];

    const queue = await getPendingSyncOperations();
    this.pendingCount = queue.length;
    this.notify();

    for (const item of queue) {
      if (!item.id) continue;

      try {
        const success = await this.executeSyncItem(item);
        if (success) {
          await removeSyncOperation(item.id);
          syncedCount++;
          if (item.action === 'ADD_ATTEMPT' && item.payload?.attemptId) {
            syncedAttemptIds.push(item.payload.attemptId);
          }
        } else {
          errorsCount++;
        }
      } catch (itemErr: any) {
        console.warn('Sync item processing error:', itemErr);
        errorsCount++;
      }
    }

    if (syncedAttemptIds.length > 0) {
      await markAttemptsAsSyncedInIndexedDB(syncedAttemptIds);
    }

    return { syncedCount, errorsCount };
  }

  /**
   * Execute a single queued operation against Cloud Firestore
   */
  private async executeSyncItem(item: SyncQueueItem): Promise<boolean> {
    const authUid = auth?.currentUser?.uid;
    if (!isFirebaseConfigured || !db || !authUid) {
      // Wait cleanly until signed in with Firebase Auth
      return false;
    }

    // Remap offline guest operations to the authenticated user's UID
    const isGuestItem = !item.userId || item.userId === 'lord_chesterfield_scholar' || item.userId.startsWith('guest_');
    const targetUid = isGuestItem ? authUid : item.userId!;

    // If queue item belongs to another real user account, don't retry forever under current user's auth
    if (targetUid !== authUid) {
      return true;
    }

    switch (item.action) {
      case 'ADD_ATTEMPT': {
        const attempt = item.payload;
        if (!attempt?.attemptId) return true;
        const attemptPath = `users/${targetUid}/attempts/${attempt.attemptId}`;
        try {
          const attemptRef = doc(db, 'users', targetUid, 'attempts', attempt.attemptId);
          await setDoc(attemptRef, attempt, { merge: true });
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('Missing or insufficient permissions')) {
            handleFirestoreError(err, OperationType.WRITE, attemptPath);
          }
          throw err;
        }
      }

      case 'UPDATE_PROFILE': {
        const profile = item.payload;
        if (!profile || typeof profile !== 'object') return true;
        const userPath = `users/${targetUid}`;
        try {
          const userRef = doc(db, 'users', targetUid);
          await setDoc(userRef, profile, { merge: true });
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('Missing or insufficient permissions')) {
            handleFirestoreError(err, OperationType.WRITE, userPath);
          }
          throw err;
        }
      }

      case 'FLASHCARD_PROGRESS': {
        const card = item.payload;
        if (!card?.cardId) return true;
        const cardPath = `users/${targetUid}/flashcardProgress/${card.cardId}`;
        try {
          const cardRef = doc(db, 'users', targetUid, 'flashcardProgress', card.cardId);
          await setDoc(cardRef, card, { merge: true });
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('Missing or insufficient permissions')) {
            handleFirestoreError(err, OperationType.WRITE, cardPath);
          }
          throw err;
        }
      }

      default:
        return true;
    }
  }
}

// Singleton Sync Manager instance
export const syncManager = new SyncManager();
