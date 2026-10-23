/**
 * English Boost MZ - IndexedDB Persistent Offline Storage
 * High-performance browser database for offline lessons, attempts history,
 * and background synchronisation queue.
 */

import type { LearningAttempt, UserProfile, FlashcardProgress } from '../firebase/types';

const DB_NAME = 'english_boost_mz_db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id?: number;
  action: 'ADD_ATTEMPT' | 'UPDATE_PROFILE' | 'FLASHCARD_PROGRESS';
  payload: any;
  userId?: string;
  createdAt: string;
  attemptsCount: number;
}

export interface IndexedDBStats {
  attemptsCount: number;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  dbReady: boolean;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize or retrieve the IndexedDB database instance
 */
export function getIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Attempts Store (historical lessons, dictations, quizzes)
      if (!db.objectStoreNames.contains('attempts')) {
        const attemptsStore = db.createObjectStore('attempts', { keyPath: 'attemptId' });
        attemptsStore.createIndex('completedAt', 'completedAt', { unique: false });
        attemptsStore.createIndex('moduleId', 'moduleId', { unique: false });
        attemptsStore.createIndex('moduleType', 'moduleType', { unique: false });
        attemptsStore.createIndex('syncedToCloud', 'syncedToCloud', { unique: false });
      }

      // 2. Sync Queue Store (actions pending network reconnection)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        queueStore.createIndex('action', 'action', { unique: false });
      }

      // 3. User Profile Store (persisted offline identity & stats)
      if (!db.objectStoreNames.contains('user_profile')) {
        db.createObjectStore('user_profile', { keyPath: 'uid' });
      }

      // 4. Flashcards Progress Store
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: 'cardId' });
      }

      // 5. App Metadata / Sync Meta
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Save or update a learning attempt in IndexedDB
 */
export async function saveAttemptToIndexedDB(
  attempt: LearningAttempt,
  syncedToCloud: boolean = false
): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['attempts'], 'readwrite');
      const store = transaction.objectStore('attempts');
      const record = {
        ...attempt,
        syncedToCloud: syncedToCloud ? 1 : 0,
        savedAt: new Date().toISOString()
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to save attempt to IndexedDB:', error);
  }
}

/**
 * Retrieve all learning attempts from IndexedDB, sorted by completedAt descending
 */
export async function getAllAttemptsFromIndexedDB(): Promise<LearningAttempt[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['attempts'], 'readonly');
      const store = transaction.objectStore('attempts');
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as Array<LearningAttempt & { syncedToCloud?: number }>;
        results.sort((a, b) => {
          const dateA = new Date(a.completedAt || 0).getTime();
          const dateB = new Date(b.completedAt || 0).getTime();
          return dateB - dateA;
        });
        resolve(results);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to get attempts from IndexedDB:', error);
    return [];
  }
}

/**
 * Mark a list of attemptIds as synced to cloud in IndexedDB
 */
export async function markAttemptsAsSyncedInIndexedDB(attemptIds: string[]): Promise<void> {
  if (!attemptIds.length) return;
  try {
    const db = await getIndexedDB();
    const transaction = db.transaction(['attempts'], 'readwrite');
    const store = transaction.objectStore('attempts');

    for (const id of attemptIds) {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, syncedToCloud: 1 };
          store.put(updated);
        }
      };
    }
  } catch (error) {
    console.warn('Failed to mark attempts as synced in IndexedDB:', error);
  }
}

/**
 * Enqueue an operation into the IndexedDB sync_queue
 */
export async function enqueueSyncOperation(
  action: SyncQueueItem['action'],
  payload: any,
  userId?: string
): Promise<number | undefined> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const item: Omit<SyncQueueItem, 'id'> = {
        action,
        payload,
        userId,
        createdAt: new Date().toISOString(),
        attemptsCount: 0
      };

      const req = store.add(item);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to enqueue sync item in IndexedDB:', error);
    return undefined;
  }
}

/**
 * Retrieve all pending operations from the sync_queue
 */
export async function getPendingSyncOperations(): Promise<SyncQueueItem[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const req = store.getAll();

      req.onsuccess = () => resolve((req.result as SyncQueueItem[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to get sync queue from IndexedDB:', error);
    return [];
  }
}

/**
 * Remove an operation from the sync_queue after successful cloud sync
 */
export async function removeSyncOperation(queueId: number): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const req = store.delete(queueId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to remove sync queue item:', error);
  }
}

/**
 * Save user profile in IndexedDB for 100% offline access
 */
export async function saveProfileToIndexedDB(profile: UserProfile): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_profile'], 'readwrite');
      const store = transaction.objectStore('user_profile');
      const req = store.put(profile);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to save profile to IndexedDB:', error);
  }
}

/**
 * Retrieve user profile from IndexedDB
 */
export async function getProfileFromIndexedDB(uid: string): Promise<UserProfile | null> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_profile'], 'readonly');
      const store = transaction.objectStore('user_profile');
      const req = store.get(uid);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to get profile from IndexedDB:', error);
    return null;
  }
}

/**
 * Save flashcard progress in IndexedDB
 */
export async function saveFlashcardToIndexedDB(card: FlashcardProgress): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['flashcards'], 'readwrite');
      const store = transaction.objectStore('flashcards');
      const req = store.put(card);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to save flashcard to IndexedDB:', error);
  }
}

/**
 * Get all flashcards from IndexedDB
 */
export async function getAllFlashcardsFromIndexedDB(): Promise<FlashcardProgress[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['flashcards'], 'readonly');
      const store = transaction.objectStore('flashcards');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to retrieve flashcards from IndexedDB:', error);
    return [];
  }
}

/**
 * Record last sync timestamp in metadata store
 */
export async function recordLastSyncTime(timestamp: string = new Date().toISOString()): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const req = store.put({ key: 'last_sync_time', value: timestamp });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to set last sync time:', error);
  }
}

/**
 * Get summary stats about the local IndexedDB database
 */
export async function getIndexedDBStats(): Promise<IndexedDBStats> {
  try {
    const db = await getIndexedDB();
    const attempts = await getAllAttemptsFromIndexedDB();
    const queue = await getPendingSyncOperations();

    const lastSync = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(['metadata'], 'readonly');
      const store = tx.objectStore('metadata');
      const req = store.get('last_sync_time');
      req.onsuccess = () => resolve(req.result?.value || null);
      req.onerror = () => resolve(null);
    });

    return {
      attemptsCount: attempts.length,
      pendingSyncCount: queue.length,
      lastSyncTime: lastSync,
      dbReady: true
    };
  } catch (e) {
    return {
      attemptsCount: 0,
      pendingSyncCount: 0,
      lastSyncTime: null,
      dbReady: false
    };
  }
}
