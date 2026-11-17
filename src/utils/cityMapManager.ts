import {
  DEFAULT_CITY_MAP_PROGRESSION,
  getLocalUserProfile,
  LOCAL_CITY_MAP_KEY,
  mergeCityMapProgression,
  recordAttempt,
  updateUserProfile
} from '../firebase/client';
import type { CEFRLevel, CityMapProgressionState, UserProfile } from '../firebase/types';
import { getCityLevelByNumber, MAX_CITY_LEVEL, type CityChapterQuestion } from '../data/cityMapData';
import { computeAnswerKey, computeQuestionKey, hashContentKey } from '../data/cityBank5000';
import { awardMszCoins } from './mszCoinsManager';

export const LOCAL_SEEN_QUIZ_KEY = 'eb_msz_seen_quiz_history_v1';
export const LOCAL_COMPLETED_LESSONS_KEY = 'eb_msz_completed_lessons_v1';
export const LESSON_COMPLETED_EVENT = 'eb_lesson_completed';

interface StoredSeenQuizHistory {
  qHashes: string[];
  aHashes: string[];
}

export interface CityChapterCompletionResult {
  state: CityMapProgressionState;
  isNewChapterCompletion: boolean;
  justConqueredLevel: boolean;
  unlockedNextLevel: number | null;
  xpAwarded: number;
  coinsAwarded: number;
  completedChaptersCount: number;
}

/**
 * Retrieve the canonical merged City Map Progression (localStorage + profile)
 */
export function getCityMapProgression(): CityMapProgressionState {
  let storedRaw: CityMapProgressionState | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_CITY_MAP_KEY);
    if (raw) {
      storedRaw = JSON.parse(raw) as CityMapProgressionState;
    }
  } catch (e) {
    console.warn('Error reading city map progression from localStorage:', e);
  }

  const profile = getLocalUserProfile();
  return mergeCityMapProgression(storedRaw, profile.cityMapProgression || DEFAULT_CITY_MAP_PROGRESSION);
}

/**
 * Persist City Map Progression across localStorage, IndexedDB, Cloud Firestore, and broadcast DOM event
 */
export async function saveCityMapProgression(state: CityMapProgressionState): Promise<UserProfile> {
  const sanitized = mergeCityMapProgression(state, DEFAULT_CITY_MAP_PROGRESSION);
  try {
    localStorage.setItem(LOCAL_CITY_MAP_KEY, JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eb_city_map_updated', { detail: sanitized }));
    }
  } catch (e) {
    console.warn('Error writing city map progression locally:', e);
  }

  return updateUserProfile({ cityMapProgression: sanitized });
}

function readLocalSeenQuizStore(): StoredSeenQuizHistory {
  try {
    const raw = localStorage.getItem(LOCAL_SEEN_QUIZ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredSeenQuizHistory>;
      return {
        qHashes: Array.isArray(parsed.qHashes) ? parsed.qHashes.filter((s) => typeof s === 'string') : [],
        aHashes: Array.isArray(parsed.aHashes) ? parsed.aHashes.filter((s) => typeof s === 'string') : []
      };
    }
  } catch (e) {
    console.warn('Error reading seen quiz history from localStorage:', e);
  }
  return { qHashes: [], aHashes: [] };
}

/**
 * Retrieve union of all seen question & answer hashes (full local history + Firestore-synced progression)
 */
export function getSeenQuizHistory(): {
  seenQuestionHashes: Set<string>;
  seenAnswerHashes: Set<string>;
} {
  const localStore = readLocalSeenQuizStore();
  const prog = getCityMapProgression();

  return {
    seenQuestionHashes: new Set<string>([...localStore.qHashes, ...(prog.seenQuestionHashes || [])]),
    seenAnswerHashes: new Set<string>([...localStore.aHashes, ...(prog.seenAnswerHashes || [])])
  };
}

export type SeenQuestionInput =
  | CityChapterQuestion
  | {
      questionKey?: string;
      answerKey?: string;
      qHash?: string;
      aHash?: string;
      type?: 'mcq' | 'word_find';
      promptEn?: string;
      questionFr?: string;
      targetWord?: string;
      answer?: string;
      options?: unknown[];
      correctIndex?: number;
    };

/**
 * Record displayed questions & their canonical answers immediately so players never encounter them twice.
 */
export function recordSeenQuizQuestions(items: SeenQuestionInput[]): void {
  if (!items || items.length === 0) return;

  const localStore = readLocalSeenQuizStore();
  const qSet = new Set<string>(localStore.qHashes);
  const aSet = new Set<string>(localStore.aHashes);
  let addedAny = false;

  for (const item of items) {
    let qHash = 'qHash' in item ? item.qHash : undefined;
    let aHash = 'aHash' in item ? item.aHash : undefined;

    if (!qHash) {
      if ('questionKey' in item && item.questionKey) {
        qHash = hashContentKey(item.questionKey);
      } else {
        const type = item.type === 'word_find' ? 'word_find' : 'mcq';
        const targetWord = 'targetWord' in item ? item.targetWord : undefined;
        const promptEn = 'promptEn' in item ? item.promptEn : undefined;
        const questionFr = item.questionFr || '';
        qHash = hashContentKey(
          computeQuestionKey({ type, promptEn, questionFr, targetWord })
        );
      }
    }

    if (!aHash) {
      if ('answerKey' in item && item.answerKey) {
        aHash = hashContentKey(item.answerKey);
      } else if (item.type === 'word_find' && 'targetWord' in item && item.targetWord) {
        aHash = hashContentKey(computeAnswerKey(item.targetWord));
      } else if ('options' in item && Array.isArray(item.options) && typeof item.correctIndex === 'number') {
        const rawAns = item.options[item.correctIndex];
        const ans = typeof rawAns === 'string' ? rawAns : '';
        if (ans) aHash = hashContentKey(computeAnswerKey(ans));
      } else if ('answer' in item && item.answer) {
        aHash = hashContentKey(computeAnswerKey(item.answer));
      }
    }

    if (qHash && !qSet.has(qHash)) {
      qSet.add(qHash);
      addedAny = true;
    }
    if (aHash && !aSet.has(aHash)) {
      aSet.add(aHash);
      addedAny = true;
    }
  }

  if (!addedAny) return;

  const nextQArr = Array.from(qSet);
  const nextAArr = Array.from(aSet);

  try {
    localStorage.setItem(
      LOCAL_SEEN_QUIZ_KEY,
      JSON.stringify({ qHashes: nextQArr, aHashes: nextAArr })
    );
  } catch (e) {
    console.warn('Error persisting seen quiz history locally:', e);
  }

  // Also persist compact bounded latest 2500 hashes into CityMapProgressionState (syncs to Firestore)
  const prog = getCityMapProgression();
  const nextProg: CityMapProgressionState = {
    ...prog,
    seenQuestionHashes: nextQArr.slice(-2500),
    seenAnswerHashes: nextAArr.slice(-2500),
    updatedAt: new Date().toISOString()
  };
  saveCityMapProgression(nextProg).catch(() => {});
}

export function clearSeenQuizHistory(): void {
  try {
    localStorage.removeItem(LOCAL_SEEN_QUIZ_KEY);
  } catch {}
  const prog = getCityMapProgression();
  saveCityMapProgression({
    ...prog,
    seenQuestionHashes: [],
    seenAnswerHashes: [],
    updatedAt: new Date().toISOString()
  }).catch(() => {});
}

/**
 * Record completion of a chapter (1..10) inside an unlocked level (1..600).
 * Strictly enforces sequential unlocking: Level N+1 unlocks ONLY when all 10 chapters of Level N are completed.
 */
export async function completeCityChapter(
  levelNumber: number,
  chapterNumber: number,
  scorePercent: number,
  starsEarned: number,
  playerLevel: number = 1
): Promise<CityChapterCompletionResult> {
  const current = getCityMapProgression();
  const safeLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, Math.floor(levelNumber)));
  const safeChapter = Math.max(1, Math.min(10, Math.floor(chapterNumber)));
  const safeScore = Math.max(0, Math.min(100, Math.round(scorePercent)));
  const safeStars = Math.max(1, Math.min(3, Math.round(starsEarned)));

  // Enforce sequential lock guard
  if (safeLevel > current.unlockedLevel) {
    return {
      state: current,
      isNewChapterCompletion: false,
      justConqueredLevel: false,
      unlockedNextLevel: null,
      xpAwarded: 0,
      coinsAwarded: 0,
      completedChaptersCount: (current.completedChaptersByLevel[String(safeLevel)] || []).length
    };
  }

  const levelKey = String(safeLevel);
  const scoreKey = `${safeLevel}-${safeChapter}`;
  const prevChapters = current.completedChaptersByLevel[levelKey] || [];
  const isNewChapterCompletion = !prevChapters.includes(safeChapter);

  const nextChapters = Array.from(new Set([...prevChapters, safeChapter])).sort((a, b) => a - b);

  const nextCompletedMap: Record<string, number[]> = {
    ...current.completedChaptersByLevel,
    [levelKey]: nextChapters
  };

  const nextBestScores: Record<string, number> = {
    ...(current.chapterBestScores || {}),
    [scoreKey]: Math.max(current.chapterBestScores?.[scoreKey] || 0, safeScore)
  };

  const nextStarsMap: Record<string, number> = {
    ...(current.chapterStars || {}),
    [scoreKey]: Math.max(current.chapterStars?.[scoreKey] || 0, safeStars)
  };

  const wasAlreadyConquered = current.conqueredLevels.includes(safeLevel);
  const allTenCompleted = nextChapters.length >= 10;
  const justConqueredLevel = !wasAlreadyConquered && allTenCompleted;

  const conqueredSet = new Set<number>(current.conqueredLevels);
  if (allTenCompleted) {
    conqueredSet.add(safeLevel);
  }

  // Advance sequential unlock strictly when all 10 chapters of current frontier level are conquered
  let nextUnlockedLevel = current.unlockedLevel;
  let unlockedNextLevel: number | null = null;
  if (allTenCompleted && safeLevel >= current.unlockedLevel && safeLevel < MAX_CITY_LEVEL) {
    nextUnlockedLevel = safeLevel + 1;
    unlockedNextLevel = nextUnlockedLevel;
  }

  const totalStars = Object.values(nextStarsMap).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const nextState: CityMapProgressionState = {
    unlockedLevel: Math.min(MAX_CITY_LEVEL, Math.max(1, nextUnlockedLevel)),
    completedChaptersByLevel: nextCompletedMap,
    conqueredLevels: Array.from(conqueredSet).sort((a, b) => a - b),
    chapterBestScores: nextBestScores,
    chapterStars: nextStarsMap,
    totalStars,
    lastPlayedLevel: unlockedNextLevel ?? safeLevel,
    seenQuestionHashes: current.seenQuestionHashes || [],
    seenAnswerHashes: current.seenAnswerHashes || [],
    updatedAt: new Date().toISOString()
  };

  await saveCityMapProgression(nextState);

  const xpAwarded = justConqueredLevel ? 60 : isNewChapterCompletion ? 25 : 10;
  const levelMeta = getCityLevelByNumber(safeLevel);

  // Award MSZ Coins
  let coinsAwarded = 0;
  try {
    const coinRes = awardMszCoins(
      'city_map',
      justConqueredLevel ? `city-level-${safeLevel}` : `city-ch-${safeLevel}-${safeChapter}`,
      justConqueredLevel ? 3 : 1,
      playerLevel,
      justConqueredLevel
        ? `Conquête Niveau ${safeLevel} · ${levelMeta.landmarkTitle}`
        : `Plan 600 · Niv.${safeLevel} Chap.${safeChapter}`
    );
    coinsAwarded = coinRes.awarded;
  } catch (e) {
    console.warn('City map coin award notice:', e);
  }

  // Record persistent learning attempt
  const cefrForAttempt = (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelMeta.cefrBase)
    ? levelMeta.cefrBase
    : 'B1') as CEFRLevel;

  recordAttempt({
    moduleId: `city_map_l${safeLevel}_c${safeChapter}`,
    moduleType: 'quiz',
    title: `Plan Urbain Niv.${safeLevel} (${levelMeta.classLabel}) · Chapitre ${safeChapter}/10`,
    level: cefrForAttempt,
    score: safeScore,
    durationSeconds: 90,
    details: {
      levelNumber: safeLevel,
      chapterNumber: safeChapter,
      conqueredLevel: justConqueredLevel
    }
  }).catch(console.warn);

  return {
    state: nextState,
    isNewChapterCompletion,
    justConqueredLevel,
    unlockedNextLevel,
    xpAwarded,
    coinsAwarded,
    completedChaptersCount: nextChapters.length
  };
}

export function getCompletedSchoolLessonIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_COMPLETED_LESSONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export interface LessonCityProgressEventDetail {
  lessonId: string;
  lessonTitle?: string;
  advancedLevel: number | null;
  totalConqueredLevels: number;
  completedLessonsCount: number;
  timestamp: number;
}

/**
 * Called whenever a Cursus lesson is completed (quiz or dictation mastery).
 * Deduplicates per lessonId so each newly completed lesson conquers the active frontier
 * level in the 600-level City Map, saves state, and dispatches LESSON_COMPLETED_EVENT
 * so the Header segmented progress bar animates immediately.
 */
export async function completeSchoolLessonForCityProgress(
  lessonId: string,
  lessonTitle?: string
): Promise<{
  state: CityMapProgressionState;
  isFirstCompletion: boolean;
  advancedLevel: number | null;
  completedLessonsCount: number;
}> {
  const current = getCityMapProgression();
  const completedIds = getCompletedSchoolLessonIds();
  const isFirstCompletion = Boolean(lessonId) && !completedIds.includes(lessonId);

  let nextState = current;
  let advancedLevel: number | null = null;
  let nextLessonIds = completedIds;

  if (isFirstCompletion) {
    nextLessonIds = [...completedIds, lessonId];
    try {
      localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(nextLessonIds));
    } catch (e) {
      console.warn('Could not persist completed lesson IDs locally:', e);
    }

    // Conquer the current frontier level (all 10 chapters) and unlock the next one up to 600
    let targetLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, current.unlockedLevel || 1));
    const conqueredSet = new Set<number>(current.conqueredLevels || []);
    while (conqueredSet.has(targetLevel) && targetLevel < MAX_CITY_LEVEL) {
      targetLevel++;
    }

    if (!conqueredSet.has(targetLevel)) {
      conqueredSet.add(targetLevel);
      advancedLevel = targetLevel;

      const nextCompletedByLevel: Record<string, number[]> = {
        ...current.completedChaptersByLevel,
        [String(targetLevel)]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };

      const nextUnlocked = Math.min(MAX_CITY_LEVEL, targetLevel + 1);
      nextState = {
        ...current,
        unlockedLevel: Math.max(current.unlockedLevel, nextUnlocked),
        completedChaptersByLevel: nextCompletedByLevel,
        conqueredLevels: Array.from(conqueredSet).sort((a, b) => a - b),
        lastPlayedLevel: nextUnlocked,
        updatedAt: new Date().toISOString()
      };

      await saveCityMapProgression(nextState);
    }
  }

  if (typeof window !== 'undefined') {
    const detail: LessonCityProgressEventDetail = {
      lessonId,
      lessonTitle,
      advancedLevel,
      totalConqueredLevels: nextState.conqueredLevels.length,
      completedLessonsCount: nextLessonIds.length,
      timestamp: Date.now()
    };
    window.dispatchEvent(new CustomEvent<LessonCityProgressEventDetail>(LESSON_COMPLETED_EVENT, { detail }));
  }

  return {
    state: nextState,
    isFirstCompletion,
    advancedLevel,
    completedLessonsCount: nextLessonIds.length
  };
}

