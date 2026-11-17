import {
  DEFAULT_CITY_MAP_PROGRESSION,
  getLocalUserProfile,
  LOCAL_CITY_MAP_KEY,
  mergeCityMapProgression,
  recordAttempt,
  updateUserProfile
} from '../firebase/client';
import type { CEFRLevel, CityMapProgressionState, UserProfile } from '../firebase/types';
import { getCityLevelByNumber, MAX_CITY_LEVEL } from '../data/cityMapData';
import { awardMszCoins } from './mszCoinsManager';

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
