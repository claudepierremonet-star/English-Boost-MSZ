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
import { isFirebaseConfigured, db, auth } from '../firebase/client';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  totalOfflineRecords: number;
  syncError: string | null;
}

type SyncListener = (state: SyncStatusState) => void;

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
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

      // Check sync queue every 45 seconds if online
      this.autoSyncInterval = window.setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
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
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTime,
      totalOfflineRecords: this.totalOfflineRecords,
      syncError: this.syncError
    };
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
    // Auto-sync immediately when connection is restored
    setTimeout(() => {
      this.syncPendingData();
    }, 1200);
  }

  private handleOffline() {
    this.isOnline = false;
    this.notify();
  }

  /**
   * Process all queued operations and push to Cloud Firestore
   */
  public async syncPendingData(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (this.isSyncing) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    if (!navigator.onLine) {
      this.isOnline = false;
      this.notify();
      return { syncedCount: 0, errorsCount: 0 };
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    let syncedCount = 0;
    let errorsCount = 0;
    const syncedAttemptIds: string[] = [];

    try {
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

      const nowIso = new Date().toISOString();
      await recordLastSyncTime(nowIso);
      this.lastSyncTime = nowIso;
    } catch (e: any) {
      console.warn('Sync manager global sync error:', e);
      this.syncError = e?.message || 'Erreur de synchronisation';
    } finally {
      this.isSyncing = false;
      await this.refreshStats();
    }

    return { syncedCount, errorsCount };
  }

  /**
   * Execute a single queued operation against Cloud Firestore
   */
  private async executeSyncItem(item: SyncQueueItem): Promise<boolean> {
    const targetUid = item.userId || auth?.currentUser?.uid;

    if (!isFirebaseConfigured || !db || !targetUid) {
      // If Firestore is not configured or no user session, item remains safely stored locally
      return false;
    }

    switch (item.action) {
      case 'ADD_ATTEMPT': {
        const attempt = item.payload;
        const attemptsCol = collection(db, 'users', targetUid, 'attempts');
        await addDoc(attemptsCol, attempt);
        return true;
      }

      case 'UPDATE_PROFILE': {
        const profile = item.payload;
        const userRef = doc(db, 'users', targetUid);
        await setDoc(userRef, profile, { merge: true });
        return true;
      }

      case 'FLASHCARD_PROGRESS': {
        const card = item.payload;
        if (!card?.cardId) return false;
        const cardRef = doc(db, 'users', targetUid, 'flashcardProgress', card.cardId);
        await setDoc(cardRef, card);
        return true;
      }

      default:
        return false;
    }
  }
}

// Singleton Sync Manager instance
export const syncManager = new SyncManager();
