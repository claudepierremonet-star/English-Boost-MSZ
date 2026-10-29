import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
  type Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage
} from 'firebase/storage';
import type {
  UserProfile,
  LearningAttempt,
  FlashcardProgress,
  CEFRLevel,
  LeaderboardEntry,
  LeagueTier
} from './types';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Read config from provisioned JSON with environment variable fallback
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseAppletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseAppletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseAppletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if actual configuration exists and is active
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'remixed-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    const dbId = (firebaseAppletConfig as any).firestoreDatabaseId;
    db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback mode:', err);
  }
}

// Test live server connection to Firestore
async function testFirestoreConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline-persisted mode.');
    }
  }
}

if (isFirebaseConfigured) {
  testFirestoreConnection();
}

import {
  saveAttemptToIndexedDB,
  getAllAttemptsFromIndexedDB,
  markAttemptsAsSyncedInIndexedDB,
  enqueueSyncOperation,
  saveProfileToIndexedDB,
  saveFlashcardToIndexedDB
} from '../offline/indexedDb';

export { auth, db, storage };

// Local storage keys for resilient fallback / offline operation
const LOCAL_USER_KEY = 'eb_msz_user_profile';
const LOCAL_ATTEMPTS_KEY = 'eb_msz_attempts';
const LOCAL_CARDS_KEY = 'eb_msz_cards_progress';

// Default guest profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  uid: 'lord_chesterfield_scholar',
  displayName: 'Lord Chesterfield Scholar',
  email: 'm.said.zaaf@editorial.msz',
  photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-j7VL5y1DulQO0ZUCmnVFKLzFgtqJ6ouE2w9tmtLT3GVTZ_f2HPrOXW27YcfNEv8XdaJBOR-xtCBTw965W8fuNDTngB1zPJOHyM4UEWMFLgliMGJq6IIA71cgZEZSfEarfPuCe6iC30vMqY3q7oyRonk89ZQ92-zclRrEwZWtP5qiv_HZvOnkMcB32962jQBrwbJAe0qa8CYPLZB8qH35jyDTntTaFWJh6C8_OVoDa8wDvwlgBHr',
  level: 'C1',
  heroImageURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDUt7tXU9wnM6he8dZmJ-f_kK3fqOWMbi8qT3c_zVAS6297z1RG31BeL6T5Ic9HM-oREHnKKw6xDRbX5U-LYC1gYXpAAEWhXBIJ2brXJ7znTNlvjnUYz0qKE8jmrLIoPVQxBhel2DjVHZivpbxXBQMgrFkYD3HDZd_AqauHO-Nqw3WxuLstxT6EEptnEYUM9BaBMwN6SxEjbhgbDEiSDZkOqQRKLSIwxieCQ7JvmB3J6f8FgntpUwD',
  stats: {
    streakDays: 24,
    totalXp: 4850,
    weeklyXp: 2450,
    completedModules: 14,
    totalModules: 18,
    masteryPercentage: 78,
    studyMinutesToday: 25,
    studyMinutesTarget: 30,
    totalImmersionMinutes: 5200,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  arcadeProgression: {
    points: 0,
    level: 1,
    unlockedMaxGameNumber: 1,
    completedGames: []
  }
};

/**
 * Retrieve local cached user profile
 */
export function getLocalUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Synchronize with standalone arcade storage key if present
      const arcadeRaw = localStorage.getItem('msz_arcade_progression_v1');
      if (arcadeRaw) {
        try {
          const parsedArcade = JSON.parse(arcadeRaw);
          if (!parsed.arcadeProgression || (parsedArcade.points || 0) > (parsed.arcadeProgression.points || 0)) {
            parsed.arcadeProgression = parsedArcade;
          }
        } catch (e) {}
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading local user profile', e);
  }
  const defaultProf = { ...DEFAULT_USER_PROFILE };
  try {
    const arcadeRaw = localStorage.getItem('msz_arcade_progression_v1');
    if (arcadeRaw) {
      defaultProf.arcadeProgression = JSON.parse(arcadeRaw);
    }
  } catch (e) {}
  return defaultProf;
}

/**
 * Save user profile locally
 */
export function saveLocalUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    if (profile.arcadeProgression) {
      localStorage.setItem('msz_arcade_progression_v1', JSON.stringify(profile.arcadeProgression));
    }
  } catch (e) {
    console.error('Error saving local user profile', e);
  }
}

/**
 * Authenticate with Google (Sign Up or Sign In)
 * Stores scholar identity and syncs all study metrics to Cloud Firestore
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      // Sync with Firestore users/{uid}
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      let profile: UserProfile;
      if (snap.exists()) {
        profile = snap.data() as UserProfile;
        // Merge with existing local progress if current session has higher values
        const currentLocal = getLocalUserProfile();
        if (currentLocal && (currentLocal.stats?.totalXp || 0) > (profile.stats?.totalXp || 0)) {
          profile.stats = {
            ...profile.stats,
            totalXp: Math.max(profile.stats.totalXp, currentLocal.stats.totalXp),
            weeklyXp: Math.max(profile.stats.weeklyXp, currentLocal.stats.weeklyXp),
            completedModules: Math.max(profile.stats.completedModules, currentLocal.stats.completedModules),
            streakDays: Math.max(profile.stats.streakDays, currentLocal.stats.streakDays)
          };
          await updateDoc(userRef, { stats: profile.stats });
        }
      } else {
        // First-time scholar registration with Google
        const currentLocal = getLocalUserProfile();
        profile = {
          uid: user.uid,
          displayName: user.displayName || 'Lord Chesterfield Scholar',
          email: user.email || '',
          photoURL: user.photoURL || DEFAULT_USER_PROFILE.photoURL,
          level: currentLocal.level || 'C1',
          heroImageURL: currentLocal.heroImageURL || DEFAULT_USER_PROFILE.heroImageURL,
          stats: {
            ...DEFAULT_USER_PROFILE.stats,
            ...(currentLocal.stats || {})
          }
        };
        await setDoc(userRef, profile);

        // Migrate all local and IndexedDB learning attempts to Cloud Firestore
        try {
          const idbAttempts = await getAllAttemptsFromIndexedDB();
          if (idbAttempts && idbAttempts.length > 0) {
            const attemptsCol = collection(db, 'users', user.uid, 'attempts');
            for (const att of idbAttempts.slice(0, 50)) {
              await addDoc(attemptsCol, att);
            }
            await markAttemptsAsSyncedInIndexedDB(idbAttempts.map(a => a.attemptId));
          }
        } catch (migErr) {
          console.warn('Initial attempts migration notice:', migErr);
        }
      }

      saveLocalUserProfile(profile);
      await saveProfileToIndexedDB(profile);
      return profile;
    } catch (error) {
      console.error('Firebase Google Sign-In error:', error);
      throw error;
    }
  }

  // Graceful offline/demo fallback
  const local = getLocalUserProfile();
  saveLocalUserProfile(local);
  return local;
}

/**
 * Helper to check if current scholar is authenticated via Google
 */
export function isUserSignedInWithGoogle(): boolean {
  return Boolean(auth?.currentUser && !auth.currentUser.isAnonymous);
}

/**
 * Get the current active Firebase Auth user object
 */
export function getCurrentFirebaseUser(): User | null {
  return auth?.currentUser || null;
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
  }
  // Reset or preserve local state
}

/**
 * Listen for Auth state changes
 */
export function subscribeToAuthState(callback: (profile: UserProfile | null) => void): () => void {
  if (isFirebaseConfigured && auth && db) {
    const firestoreDb = db;
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userRef = doc(firestoreDb, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const currentLocal = getLocalUserProfile();

            // Merge arcade progression defensively: keep the highest points, level & completed games
            const localArcade = currentLocal.arcadeProgression;
            const firestoreArcade = data.arcadeProgression;
            const maxPoints = Math.max(localArcade?.points || 0, firestoreArcade?.points || 0);
            const maxLevel = Math.max(localArcade?.level || 1, firestoreArcade?.level || 1);
            const maxUnlocked = Math.max(localArcade?.unlockedMaxGameNumber || 1, firestoreArcade?.unlockedMaxGameNumber || 1);
            const mergedCompleted = Array.from(
              new Set([...(localArcade?.completedGames || []), ...(firestoreArcade?.completedGames || [])])
            );

            data.arcadeProgression = {
              points: maxPoints,
              level: maxLevel,
              unlockedMaxGameNumber: maxUnlocked,
              completedGames: mergedCompleted,
              activeSession: localArcade?.activeSession || firestoreArcade?.activeSession || null
            };

            data.stats = {
              ...data.stats,
              totalXp: Math.max(data.stats?.totalXp || 0, currentLocal.stats?.totalXp || 0, maxPoints),
              weeklyXp: Math.max(data.stats?.weeklyXp || 0, currentLocal.stats?.weeklyXp || 0)
            };

            saveLocalUserProfile(data);
            saveProfileToIndexedDB(data).catch(console.warn);

            // Sync to Firestore if local had higher values
            if ((localArcade?.points || 0) > (firestoreArcade?.points || 0)) {
              setDoc(
                userRef,
                { arcadeProgression: data.arcadeProgression, stats: data.stats },
                { merge: true }
              ).catch(console.warn);
            }

            callback(data);
            return;
          }
        } catch (e) {
          console.warn('Error fetching Firestore user document:', e);
        }
      }
      callback(getLocalUserProfile());
    });
  }

  // If not configured, immediately broadcast local user profile
  callback(getLocalUserProfile());
  return () => {};
}

/**
 * Update user level or stats
 */
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = getLocalUserProfile();
  const updated: UserProfile = {
    ...current,
    ...profile,
    stats: {
      ...current.stats,
      ...(profile.stats || {})
    },
    arcadeProgression: profile.arcadeProgression || current.arcadeProgression
  };
  saveLocalUserProfile(updated);
  saveProfileToIndexedDB(updated).catch(console.warn);

  if (navigator.onLine && isFirebaseConfigured && db && auth?.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, profile as Record<string, unknown>, { merge: true });
    } catch (e) {
      console.warn('Firestore update error, queuing sync:', e);
      await enqueueSyncOperation('UPDATE_PROFILE', profile, auth.currentUser.uid);
    }
  } else if (!navigator.onLine) {
    await enqueueSyncOperation('UPDATE_PROFILE', profile, auth?.currentUser?.uid);
  }

  return updated;
}

/**
 * Save an exercise / dictation / quiz attempt
 * Target: IndexedDB (persistent) + Cloud Firestore (users/{uid}/attempts/{attemptId})
 */
export async function recordAttempt(attempt: Omit<LearningAttempt, 'attemptId' | 'completedAt'>): Promise<LearningAttempt> {
  const newAttempt: LearningAttempt = {
    ...attempt,
    attemptId: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    completedAt: new Date().toISOString()
  };

  // 1. Save directly into persistent IndexedDB (works 100% offline)
  await saveAttemptToIndexedDB(newAttempt, false);

  // 2. Also keep in localStorage as fallback
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    const list: LearningAttempt[] = raw ? JSON.parse(raw) : [];
    list.unshift(newAttempt);
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Local attempt save error', e);
  }

  // 3. Update user stats locally and in IndexedDB
  const profile = getLocalUserProfile();
  profile.stats.weeklyXp += 50;
  profile.stats.totalXp += 50;
  profile.stats.completedModules = Math.min(profile.stats.totalModules, profile.stats.completedModules + 1);
  profile.stats.masteryPercentage = Math.round((profile.stats.completedModules / profile.stats.totalModules) * 100);
  saveLocalUserProfile(profile);
  saveProfileToIndexedDB(profile).catch(console.warn);

  // 4. If online & Cloud Firestore available, push to Firestore
  if (navigator.onLine && isFirebaseConfigured && db && auth?.currentUser) {
    try {
      const attemptsCol = collection(db, 'users', auth.currentUser.uid, 'attempts');
      await addDoc(attemptsCol, newAttempt);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { stats: profile.stats });
      // Mark as synced in IndexedDB
      await markAttemptsAsSyncedInIndexedDB([newAttempt.attemptId]);
      return newAttempt;
    } catch (e) {
      console.warn('Firestore attempt save error, queuing for sync:', e);
      await enqueueSyncOperation('ADD_ATTEMPT', newAttempt, auth.currentUser.uid);
    }
  } else {
    // Queued in IndexedDB for auto-sync once internet connection is available
    await enqueueSyncOperation('ADD_ATTEMPT', newAttempt, auth?.currentUser?.uid);
  }

  return newAttempt;
}

/**
 * Save flashcard SM-2 review progress
 * Target: IndexedDB (persistent) + Cloud Firestore
 */
export async function saveFlashcardProgress(progress: FlashcardProgress): Promise<void> {
  // 1. IndexedDB persistent storage
  await saveFlashcardToIndexedDB(progress);

  // 2. Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_CARDS_KEY);
    const map: Record<string, FlashcardProgress> = raw ? JSON.parse(raw) : {};
    map[progress.cardId] = progress;
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Local card save error', e);
  }

  // 3. Firestore sync or queue
  if (navigator.onLine && isFirebaseConfigured && db && auth?.currentUser) {
    try {
      const cardRef = doc(db, 'users', auth.currentUser.uid, 'flashcardProgress', progress.cardId);
      await setDoc(cardRef, progress);
    } catch (e) {
      console.warn('Firestore flashcard save error, queuing sync:', e);
      await enqueueSyncOperation('FLASHCARD_PROGRESS', progress, auth.currentUser.uid);
    }
  } else {
    await enqueueSyncOperation('FLASHCARD_PROGRESS', progress, auth?.currentUser?.uid);
  }
}

/**
 * Compresses an image file client-side to prevent localStorage/Firestore quota limits.
 * Scales large photos to max 1600x1200px and outputs a high-definition JPEG data URL (~120KB-220KB).
 */
export async function compressImageToDataUrl(file: File, maxWidth = 1600, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof createImageBitmap !== 'undefined' && typeof document !== 'undefined') {
      createImageBitmap(file)
        .then((bitmap) => {
          let { width, height } = bitmap;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bitmap, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
            return;
          }
          fallbackFileReader(file, resolve);
        })
        .catch(() => {
          fallbackFileReader(file, resolve);
        });
    } else {
      fallbackFileReader(file, resolve);
    }
  });
}

function fallbackFileReader(file: File, resolve: (val: string) => void) {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => resolve(URL.createObjectURL(file));
  reader.readAsDataURL(file);
}

/**
 * Upload custom hero photography to Firebase Storage (with local compressed data URL fallback)
 */
export async function uploadHeroPhoto(file: File): Promise<string> {
  // Always produce a web-optimized, compressed data URL first (safe for localStorage & Firestore)
  const compressedDataUrl = await compressImageToDataUrl(file);

  // If Firebase Storage is active, also attempt upload to storage bucket
  if (isFirebaseConfigured && storage && auth?.currentUser) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileRef = storageRef(storage, `users/${auth.currentUser.uid}/hero_${Date.now()}.${fileExt}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      await updateUserProfile({ heroImageURL: downloadURL });
      return downloadURL;
    } catch (e) {
      console.warn('Firebase Storage upload error, falling back to compressed local image data:', e);
    }
  }

  // Update profile with compressed image
  await updateUserProfile({ heroImageURL: compressedDataUrl });
  return compressedDataUrl;
}

export interface SevenDayDataPoint {
  day: string;
  dateKey: string;
  score: number;
  xp: number;
  label: string;
  module: string;
  attemptsCount: number;
  source: 'firestore' | 'indexeddb' | 'cache';
}

export interface SevenDayHistoryResult {
  history: SevenDayDataPoint[];
  source: 'firestore' | 'indexeddb' | 'cache';
  averageScore: number;
  peakScore: number;
  peakDay: string;
  totalAttemptsCount: number;
  recentAttempts: LearningAttempt[];
}

// Initial realistic benchmark seed data aligned with the user's 24-day streak
const BENCHMARK_7_DAYS = [
  { dayOffset: 6, score: 82, xp: 280, label: 'Lundi', module: 'Dictée C1 — Fondamentaux' },
  { dayOffset: 5, score: 86, xp: 340, label: 'Mardi', module: 'Flashcards SM-2' },
  { dayOffset: 4, score: 85, xp: 310, label: 'Mercredi', module: 'Grammar & Nuance Quiz' },
  { dayOffset: 3, score: 94, xp: 420, label: 'Jeudi', module: 'The Nuance Matrix' },
  { dayOffset: 2, score: 89, xp: 360, label: 'Vendredi', module: 'Speaking Studio' },
  { dayOffset: 1, score: 92, xp: 390, label: 'Samedi', module: 'Dictée C1 — Élysée' },
  { dayOffset: 0, score: 96, xp: 450, label: 'Dimanche', module: 'The Bretton Woods Paradigm' }
];

/**
 * Fetch all learning attempts from Cloud Firestore (users/{uid}/attempts)
 * with IndexedDB durable offline persistence and localStorage fallback.
 */
export async function getUserLearningAttempts(userId?: string): Promise<{ attempts: LearningAttempt[]; source: 'firestore' | 'indexeddb' | 'cache' }> {
  const targetUid = userId || auth?.currentUser?.uid;

  // 1. If online and Firestore configured, fetch from Firestore and mirror into IndexedDB
  if (navigator.onLine && isFirebaseConfigured && db && targetUid) {
    try {
      const attemptsCol = collection(db, 'users', targetUid, 'attempts');
      const q = query(attemptsCol, orderBy('completedAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const attempts: LearningAttempt[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as LearningAttempt;
          attempts.push(item);
          // Mirror in IndexedDB for offline access
          saveAttemptToIndexedDB(item, true).catch(() => {});
        });
        return { attempts, source: 'firestore' };
      }
    } catch (e) {
      console.warn('Firestore getDocs attempts error, reading IndexedDB:', e);
    }
  }

  // 2. Persistent IndexedDB query (always works offline)
  try {
    const idbAttempts = await getAllAttemptsFromIndexedDB();
    if (idbAttempts && idbAttempts.length > 0) {
      return { attempts: idbAttempts, source: 'indexeddb' };
    }
  } catch (e) {
    console.warn('Error reading from IndexedDB:', e);
  }

  // 3. Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    if (raw) {
      const parsed: LearningAttempt[] = JSON.parse(raw);
      if (parsed && parsed.length > 0) {
        return { attempts: parsed, source: 'cache' };
      }
    }
  } catch (e) {
    console.error('Error reading local attempts', e);
  }

  return { attempts: [], source: 'indexeddb' };
}

/**
 * Compute the 7-day score evolution from Firestore attempts history
 */
export async function getSevenDayScoreHistory(userId?: string): Promise<SevenDayHistoryResult> {
  const { attempts, source } = await getUserLearningAttempts(userId);

  const daysShortFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const daysLongFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const now = new Date();
  const history: SevenDayDataPoint[] = [];

  // Construct the last 7 calendar days array (day 6 ago to today 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayDate = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayDate}`;

    const dayOfWeek = d.getDay();
    const dayShort = daysShortFr[dayOfWeek];
    const dayLong = daysLongFr[dayOfWeek];

    // Filter attempts for this calendar day
    const dayAttempts = attempts.filter((att) => {
      if (!att.completedAt) return false;
      return att.completedAt.startsWith(dateKey);
    });

    if (dayAttempts.length > 0) {
      // Calculate average score for the day from real Firestore data
      const totalScore = dayAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const avgScore = Math.round(totalScore / dayAttempts.length);
      const totalXp = dayAttempts.length * 50;
      const latestModule = dayAttempts[0]?.title || 'Module Révisé';

      history.push({
        day: dayShort,
        dateKey,
        score: avgScore,
        xp: totalXp,
        label: i === 0 ? "Aujourd'hui" : dayLong,
        module: latestModule,
        attemptsCount: dayAttempts.length,
        source: source
      });
    } else {
      // Benchmark fallback aligned with the user's verified stats
      const bench = BENCHMARK_7_DAYS.find((b) => b.dayOffset === i) || BENCHMARK_7_DAYS[6 - i];
      history.push({
        day: dayShort,
        dateKey,
        score: bench.score,
        xp: bench.xp,
        label: i === 0 ? "Aujourd'hui" : dayLong,
        module: bench.module,
        attemptsCount: 1,
        source: 'cache'
      });
    }
  }

  const scores = history.map((h) => h.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const peak = Math.max(...scores);
  const peakPoint = history.find((h) => h.score === peak);

  return {
    history,
    source,
    averageScore: avg,
    peakScore: peak,
    peakDay: peakPoint ? peakPoint.day : 'Dim',
    totalAttemptsCount: attempts.length,
    recentAttempts: attempts.slice(0, 5)
  };
}

/**
 * Editorial Oxford Scholar Benchmark for healthy peer competition
 */
const BENCHMARK_SCHOLARS: Array<Omit<LeaderboardEntry, 'rank' | 'isCurrentUser' | 'league'>> = [
  {
    uid: 'scholar_oxford_eleanor',
    displayName: 'Eleanor Vance (Oxford Univ)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    level: 'C2',
    weeklyXp: 2890,
    totalXp: 14200,
    streakDays: 42,
    badgeLabel: 'Valedictorian',
    change: 'same'
  },
  {
    uid: 'scholar_cambridge_arthur',
    displayName: 'Arthur Pendelton (Cambridge)',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 'C1',
    weeklyXp: 2680,
    totalXp: 11800,
    streakDays: 29,
    badgeLabel: 'Lexicographer',
    change: 'up'
  },
  {
    uid: 'scholar_sorbonne_helene',
    displayName: 'Hélène de Saint-Germain (Sorbonne)',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    level: 'C1',
    weeklyXp: 2490,
    totalXp: 9600,
    streakDays: 21,
    badgeLabel: 'Grammarian',
    change: 'same'
  },
  {
    uid: 'scholar_ens_julien',
    displayName: 'Julien Moreau (ENS Lyon)',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: 'B2',
    weeklyXp: 2280,
    totalXp: 8100,
    streakDays: 18,
    badgeLabel: 'Phonetician',
    change: 'up'
  },
  {
    uid: 'scholar_edinburgh_sophie',
    displayName: 'Sophie Althaus (Edinburgh)',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: 'C2',
    weeklyXp: 2140,
    totalXp: 13500,
    streakDays: 35,
    badgeLabel: 'Master of Oratory',
    change: 'down'
  },
  {
    uid: 'scholar_trinity_marcus',
    displayName: 'Marcus Thorne (Trinity Dublin)',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    level: 'B2',
    weeklyXp: 1940,
    totalXp: 6700,
    streakDays: 14,
    badgeLabel: 'Essayist',
    change: 'up'
  },
  {
    uid: 'scholar_ucl_amelie',
    displayName: 'Amélie Bernard (UCL London)',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    level: 'B1',
    weeklyXp: 1720,
    totalXp: 5400,
    streakDays: 12,
    badgeLabel: 'Active Scholar',
    change: 'same'
  },
  {
    uid: 'scholar_polytech_lucas',
    displayName: 'Lucas Fontaine (Polytechnique)',
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    level: 'B2',
    weeklyXp: 1560,
    totalXp: 4800,
    streakDays: 9,
    badgeLabel: 'Speed Master',
    change: 'down'
  },
  {
    uid: 'scholar_geneva_charlotte',
    displayName: 'Charlotte Dufour (Genève)',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    level: 'B1',
    weeklyXp: 1390,
    totalXp: 3950,
    streakDays: 8,
    badgeLabel: 'Cadence Pro',
    change: 'up'
  },
  {
    uid: 'scholar_bordeaux_thomas',
    displayName: 'Thomas Lemaire (Bordeaux)',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    level: 'B1',
    weeklyXp: 1180,
    totalXp: 3200,
    streakDays: 6,
    badgeLabel: 'New Challenger',
    change: 'same'
  }
];

function computeLeague(rank: number): LeagueTier {
  if (rank <= 3) return 'Oxford Fellow';
  if (rank <= 6) return 'Ligue Diamant';
  if (rank <= 12) return 'Ligue Émeraude';
  if (rank <= 20) return 'Ligue Saphir';
  return 'Ligue Améthyste';
}

const LOCAL_CHEERS_KEY = 'eb_msz_peer_cheers_v1';

/**
 * Send an encouraging cheer / nod to a peer scholar
 */
export async function sendPeerCheer(targetUserId: string): Promise<number> {
  try {
    const raw = localStorage.getItem(LOCAL_CHEERS_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[targetUserId] = (map[targetUserId] || 0) + 1;
    localStorage.setItem(LOCAL_CHEERS_KEY, JSON.stringify(map));
    return map[targetUserId];
  } catch {
    return 1;
  }
}

/**
 * Retrieve cheer counts
 */
export function getLocalCheers(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_CHEERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Fetch and construct the Weekly Leaderboard among connected learners
 * Merges real Firestore profiles with academic peers and accurately positions the current user
 */
export async function fetchWeeklyLeaderboard(
  currentUser?: UserProfile,
  sortBy: 'weekly' | 'total' = 'weekly'
): Promise<LeaderboardEntry[]> {
  const activeUser = currentUser || getLocalUserProfile();
  const rawCheers = getLocalCheers();
  const userWeeklyXp = activeUser.stats?.weeklyXp || 0;
  const userTotalXp = activeUser.stats?.totalXp || 0;

  // Initialize pool with benchmark scholars
  const scholarsMap = new Map<string, Omit<LeaderboardEntry, 'rank' | 'league'>>();

  for (const b of BENCHMARK_SCHOLARS) {
    scholarsMap.set(b.uid, {
      ...b,
      isCurrentUser: false,
      cheerCount: rawCheers[b.uid] || 3
    });
  }

  // Attempt to fetch real Firestore registered users if available
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy(sortBy === 'weekly' ? 'stats.weeklyXp' : 'stats.totalXp', 'desc'),
        limit(25)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data && docSnap.id) {
          const isMe = docSnap.id === activeUser.uid;
          scholarsMap.set(docSnap.id, {
            uid: docSnap.id,
            displayName: data.displayName || (isMe ? activeUser.displayName : 'Apprenant MSZ'),
            photoURL: data.photoURL || activeUser.photoURL,
            level: data.level || 'C1',
            weeklyXp: data.stats?.weeklyXp || 0,
            totalXp: data.stats?.totalXp || 0,
            streakDays: data.stats?.streakDays || 1,
            isCurrentUser: isMe,
            badgeLabel: data.level === 'C2' ? 'Oxford Fellow' : 'Scholar',
            change: 'same',
            cheerCount: rawCheers[docSnap.id] || 0
          });
        }
      });
    } catch (err) {
      console.warn('Leaderboard Firestore query deferred, using local synced peers:', err);
    }
  }

  // Ensure current user is present with latest real stats
  scholarsMap.set(activeUser.uid, {
    uid: activeUser.uid,
    displayName: `${activeUser.displayName || 'Moi-même'} (Vous)`,
    photoURL: activeUser.photoURL,
    level: activeUser.level || 'C1',
    weeklyXp: userWeeklyXp,
    totalXp: userTotalXp,
    streakDays: activeUser.stats?.streakDays || 1,
    isCurrentUser: true,
    badgeLabel: userWeeklyXp > 2500 ? 'Leader Semaine' : 'Challenger',
    change: 'up',
    cheerCount: rawCheers[activeUser.uid] || 5
  });

  // Convert to array and sort according to requested metric
  const list = Array.from(scholarsMap.values());
  list.sort((a, b) => {
    if (sortBy === 'weekly') {
      if (b.weeklyXp !== a.weeklyXp) return b.weeklyXp - a.weeklyXp;
      return b.totalXp - a.totalXp;
    } else {
      if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
      return b.weeklyXp - a.weeklyXp;
    }
  });

  // Assign ranks and academic leagues
  const ranked: LeaderboardEntry[] = list.map((item, idx) => {
    const rank = idx + 1;
    return {
      ...item,
      rank,
      isCurrentUser: item.uid === activeUser.uid,
      league: computeLeague(rank)
    };
  });

  return ranked;
}

