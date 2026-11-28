import type { CEFRLevel, LearningAttempt } from '../firebase/types';
import { SPEAKING_ITEMS } from '../data/curriculum';
import {
  PHONEME_ARTICULATION_GUIDE,
  tokenizeIpaPhonemes,
  type PhonemeArticulationGuide,
  type PhonemeMasteryStatus
} from './phonemeFeedbackEngine';
import { getWordPhonetics } from './speechRecognitionHelper';

export const SPEAKING_PHONEME_TELEMETRY_KEY = 'eb_msz_speaking_phoneme_telemetry_v1';
export const SPEAKING_PHONEME_UPDATED_EVENT = 'eb_speaking_phoneme_updated';
const MAX_STORED_SESSIONS = 120;

export interface ComplexPhonemeConfig {
  symbol: string;
  defaultDrillWord: string;
  complexityRank: number;
  frPitfallNote: string;
}

/**
 * Top 8 complex English phonemes for French-speaking learners,
 * backed directly by PHONEME_ARTICULATION_GUIDE.
 */
export const COMPLEX_PHONEME_CONFIGS: readonly ComplexPhonemeConfig[] = [
  {
    symbol: 'θ',
    defaultDrillWord: 'thousands',
    complexityRank: 1,
    frPitfallNote: 'Interdentale sourde absente du français'
  },
  {
    symbol: 'ð',
    defaultDrillWord: 'whether',
    complexityRank: 2,
    frPitfallNote: 'Interdentale voisée absente du français'
  },
  {
    symbol: 'ɜː',
    defaultDrillWord: 'university',
    complexityRank: 3,
    frPitfallNote: 'Voyelle centrale longue sans R uvulaire'
  },
  {
    symbol: 'tʃ',
    defaultDrillWord: 'century',
    complexityRank: 4,
    frPitfallNote: 'Attaque occlusive /t/ suivie de /ʃ/'
  },
  {
    symbol: 'dʒ',
    defaultDrillWord: 'journey',
    complexityRank: 5,
    frPitfallNote: 'Affriquée voisée avec appui /d/ net'
  },
  {
    symbol: 'ŋ',
    defaultDrillWord: 'morning',
    complexityRank: 6,
    frPitfallNote: 'Nasale vélaire sans explosion de /g/'
  },
  {
    symbol: 'æ',
    defaultDrillWord: 'standard',
    complexityRank: 7,
    frPitfallNote: 'Voyelle antérieure très ouverte entre A et È'
  },
  {
    symbol: 'əʊ',
    defaultDrillWord: 'only',
    complexityRank: 8,
    frPitfallNote: 'Diphtongue glissée au lieu d’un O fixe'
  }
];

const COMPLEX_SYMBOL_SET = new Set(COMPLEX_PHONEME_CONFIGS.map((c) => c.symbol));

export interface SpeakingPhonemeStatusSnapshot {
  symbol: string;
  status: PhonemeMasteryStatus;
  occurrences: number;
  exampleWords: string[];
}

export interface SpeakingPhonemeSessionSnapshot {
  sessionId: string;
  moduleId: string;
  title: string;
  level: CEFRLevel;
  targetAccent: 'en-GB' | 'en-US';
  phonemeAccuracyScore: number;
  overallScore: number;
  recordedAt: string;
  validated?: boolean;
  source?: 'studio_recording' | 'speaking_attempt';
  phonemeStatuses: SpeakingPhonemeStatusSnapshot[];
}

export type ComplexPhonemeMasteryStatus =
  | 'mastered'
  | 'to_refine'
  | 'missed'
  | 'unassessed';

export interface ComplexPhonemeMasteryItem {
  symbol: string;
  displaySymbol: string;
  labelFr: string;
  frPitfallNote: string;
  category: PhonemeArticulationGuide['category'];
  articulationFr: string;
  commonMistakeFr: string;
  masteryPercent: number | null;
  status: ComplexPhonemeMasteryStatus;
  sessionsCount: number;
  occurrencesCount: number;
  trend: 'up' | 'stable' | 'down' | 'none';
  trendDelta: number;
  exampleWords: string[];
  drillWord: string;
  lastPracticedAt: string | null;
}

export interface PhoneticMasterySummary {
  overallMasteryPercent: number | null;
  assessedPhonemesCount: number;
  totalTrackedPhonemes: number;
  masteredCount: number;
  toRefineCount: number;
  missedCount: number;
  totalSpeakingSessions: number;
  weakestPhoneme: ComplexPhonemeMasteryItem | null;
  strongestPhoneme: ComplexPhonemeMasteryItem | null;
  recentSessions: SpeakingPhonemeSessionSnapshot[];
  phonemes: ComplexPhonemeMasteryItem[];
}

/**
 * Normalize raw IPA phoneme symbols into the canonical complex phoneme keys.
 * Maps rhotic /ɝː/ -> /ɜː/ and US /oʊ/ -> /əʊ/ so UK & US recordings consolidate cleanly.
 */
export function normalizeComplexPhonemeSymbol(rawSymbol: string): string | null {
  const clean = rawSymbol.replace(/[\/\sˈˌ]/g, '');
  if (!clean) return null;
  if (clean === 'ɝː' || clean === 'ɜ') return 'ɜː';
  if (clean === 'oʊ') return 'əʊ';
  return COMPLEX_SYMBOL_SET.has(clean) ? clean : null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusToBaseScore(status: PhonemeMasteryStatus): number {
  switch (status) {
    case 'mastered':
      return 95;
    case 'to_refine':
      return 68;
    case 'uncertain':
      return 46;
    case 'missed':
      return 32;
  }
}

function deriveStatusFromPercent(percent: number): ComplexPhonemeMasteryStatus {
  if (percent >= 80) return 'mastered';
  if (percent >= 58) return 'to_refine';
  return 'missed';
}

function isValidStatus(value: unknown): value is PhonemeMasteryStatus {
  return (
    value === 'mastered' ||
    value === 'to_refine' ||
    value === 'missed' ||
    value === 'uncertain'
  );
}

/**
 * Persist a real Studio d'Élocution phoneme evaluation snapshot without creating duplicates.
 */
export function saveSpeakingPhonemeTelemetry(
  snapshot: SpeakingPhonemeSessionSnapshot
): SpeakingPhonemeSessionSnapshot[] {
  const existing = getSpeakingPhonemeTelemetry();
  const normalizedSnapshot: SpeakingPhonemeSessionSnapshot = {
    ...snapshot,
    phonemeAccuracyScore: clampPercent(snapshot.phonemeAccuracyScore),
    overallScore: clampPercent(snapshot.overallScore),
    source: snapshot.source ?? 'studio_recording',
    phonemeStatuses: snapshot.phonemeStatuses.map((st) => ({
      symbol: st.symbol.startsWith('/') ? st.symbol : `/${st.symbol}/`,
      status: isValidStatus(st.status) ? st.status : 'uncertain',
      occurrences: Math.max(1, Math.round(st.occurrences || 1)),
      exampleWords: Array.isArray(st.exampleWords) ? st.exampleWords.slice(0, 4) : []
    }))
  };

  const idx = existing.findIndex((s) => s.sessionId === normalizedSnapshot.sessionId);
  const updated =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? normalizedSnapshot : item))
      : [normalizedSnapshot, ...existing];

  updated.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
  const trimmed = updated.slice(0, MAX_STORED_SESSIONS);

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SPEAKING_PHONEME_TELEMETRY_KEY, JSON.stringify(trimmed));
      window.dispatchEvent(
        new CustomEvent(SPEAKING_PHONEME_UPDATED_EVENT, { detail: normalizedSnapshot })
      );
    } catch (err) {
      console.warn('Unable to persist speaking phoneme telemetry:', err);
    }
  }

  return trimmed;
}

/**
 * Read persisted Studio d'Élocution phoneme snapshots safely.
 */
export function getSpeakingPhonemeTelemetry(): SpeakingPhonemeSessionSnapshot[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SPEAKING_PHONEME_TELEMETRY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is SpeakingPhonemeSessionSnapshot =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          typeof (entry as SpeakingPhonemeSessionSnapshot).sessionId === 'string' &&
          typeof (entry as SpeakingPhonemeSessionSnapshot).recordedAt === 'string' &&
          Array.isArray((entry as SpeakingPhonemeSessionSnapshot).phonemeStatuses)
      )
      .sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
  } catch {
    return [];
  }
}

/**
 * Extract complex phoneme statuses from a historical speaking LearningAttempt
 * when explicit telemetry was stored in details or via curriculum SPEAKING_ITEMS IPA matching.
 */
function hydrateAttemptToSnapshot(
  attempt: LearningAttempt
): SpeakingPhonemeSessionSnapshot | null {
  if (attempt.moduleType !== 'speaking') return null;

  const details = attempt.details as Record<string, unknown> | undefined;
  const targetAccent: 'en-GB' | 'en-US' =
    details?.targetAccent === 'en-US' ? 'en-US' : 'en-GB';

  // Case 1: Attempt already saved structured phonemeStatuses in details
  if (details && Array.isArray(details.phonemeStatuses)) {
    const validStatuses: SpeakingPhonemeStatusSnapshot[] = details.phonemeStatuses
      .filter(
        (s): s is SpeakingPhonemeStatusSnapshot =>
          Boolean(s) &&
          typeof s === 'object' &&
          typeof (s as SpeakingPhonemeStatusSnapshot).symbol === 'string' &&
          isValidStatus((s as SpeakingPhonemeStatusSnapshot).status)
      )
      .map((s) => ({
        symbol: s.symbol,
        status: s.status,
        occurrences: Math.max(1, Number(s.occurrences) || 1),
        exampleWords: Array.isArray(s.exampleWords) ? s.exampleWords.slice(0, 4) : []
      }));

    if (validStatuses.length > 0) {
      return {
        sessionId:
          typeof details.phonemeSessionId === 'string'
            ? details.phonemeSessionId
            : attempt.attemptId,
        moduleId: attempt.moduleId,
        title: attempt.title,
        level: attempt.level,
        targetAccent,
        phonemeAccuracyScore:
          typeof details.phonemeAccuracyScore === 'number'
            ? clampPercent(details.phonemeAccuracyScore)
            : clampPercent(attempt.score),
        overallScore: clampPercent(attempt.score),
        recordedAt: attempt.completedAt,
        validated: true,
        source: 'speaking_attempt',
        phonemeStatuses: validStatuses
      };
    }
  }

  // Case 2: Reconstruct reference complex phonemes from SPEAKING_ITEMS curriculum text + IPA
  const cleanModuleId = attempt.moduleId.replace(/^duel-/, '');
  const matchedItem =
    SPEAKING_ITEMS.find((item) => item.id === cleanModuleId) ||
    SPEAKING_ITEMS.find((item) =>
      attempt.title.toLowerCase().includes(item.title.toLowerCase())
    );

  if (!matchedItem) return null;

  const words = matchedItem.textToRead
    .replace(/[«»“”".,!?;:—()]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const symbolBuckets = new Map<
    string,
    { occurrences: number; exampleWords: Set<string> }
  >();

  for (const sym of tokenizeIpaPhonemes(matchedItem.phoneticHints)) {
    const norm = normalizeComplexPhonemeSymbol(sym);
    if (!norm) continue;
    const entry = symbolBuckets.get(norm) || {
      occurrences: 0,
      exampleWords: new Set<string>()
    };
    entry.occurrences += 1;
    symbolBuckets.set(norm, entry);
  }

  for (const word of words) {
    const lookup = getWordPhonetics(word, targetAccent);
    const ipa = targetAccent === 'en-GB' ? lookup.phoneticUk : lookup.phoneticUs;
    const tokens = tokenizeIpaPhonemes(ipa);
    for (const sym of tokens) {
      const norm = normalizeComplexPhonemeSymbol(sym);
      if (!norm) continue;
      const entry = symbolBuckets.get(norm) || {
        occurrences: 0,
        exampleWords: new Set<string>()
      };
      entry.occurrences += 1;
      entry.exampleWords.add(word);
      symbolBuckets.set(norm, entry);
    }
  }

  if (symbolBuckets.size === 0) return null;

  const derivedStatus: PhonemeMasteryStatus =
    attempt.score >= 82 ? 'mastered' : attempt.score >= 58 ? 'to_refine' : 'missed';

  const phonemeStatuses: SpeakingPhonemeStatusSnapshot[] = Array.from(
    symbolBuckets.entries()
  ).map(([symbol, data]) => ({
    symbol: `/${symbol}/`,
    status: derivedStatus,
    occurrences: data.occurrences,
    exampleWords: Array.from(data.exampleWords).slice(0, 4)
  }));

  return {
    sessionId: attempt.attemptId,
    moduleId: attempt.moduleId,
    title: attempt.title,
    level: attempt.level,
    targetAccent,
    phonemeAccuracyScore: clampPercent(attempt.score),
    overallScore: clampPercent(attempt.score),
    recordedAt: attempt.completedAt,
    validated: true,
    source: 'speaking_attempt',
    phonemeStatuses
  };
}

/**
 * Merge persisted Studio d'Élocution snapshots with historical Firestore/IndexedDB speaking attempts,
 * deduplicating sessions recorded at the same time for the same exercise.
 */
export function mergeSpeakingSessions(
  snapshots: SpeakingPhonemeSessionSnapshot[],
  attempts: LearningAttempt[] = []
): SpeakingPhonemeSessionSnapshot[] {
  const merged = [...snapshots];
  const seenSessionIds = new Set(merged.map((s) => s.sessionId));

  for (const attempt of attempts) {
    if (attempt.moduleType !== 'speaking') continue;
    const hydrated = hydrateAttemptToSnapshot(attempt);
    if (!hydrated) continue;
    if (seenSessionIds.has(hydrated.sessionId)) continue;

    // Avoid duplicating a snapshot already saved right before clicking Validate
    const attemptTime = new Date(hydrated.recordedAt).getTime();
    const isDuplicateNearby = merged.some((existing) => {
      if (existing.moduleId !== hydrated.moduleId) return false;
      const diffMs = Math.abs(new Date(existing.recordedAt).getTime() - attemptTime);
      return diffMs <= 120_000;
    });

    if (!isDuplicateNearby) {
      merged.push(hydrated);
      seenSessionIds.add(hydrated.sessionId);
    }
  }

  return merged.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

/**
 * Compute authentic per-phoneme mastery metrics across the 8 most complex English phonemes.
 * Zero-data integrity: returns masteryPercent = null and status = 'unassessed' when no sessions exist.
 */
export function computeComplexPhonemeMastery(
  snapshots: SpeakingPhonemeSessionSnapshot[],
  attempts: LearningAttempt[] = []
): PhoneticMasterySummary {
  const allSessionsDesc = mergeSpeakingSessions(snapshots, attempts);
  const allSessionsAsc = [...allSessionsDesc].reverse();

  const buckets = new Map<
    string,
    {
      sessionScores: number[];
      occurrencesCount: number;
      exampleWords: Set<string>;
      lastPracticedAt: string | null;
    }
  >();

  for (const cfg of COMPLEX_PHONEME_CONFIGS) {
    buckets.set(cfg.symbol, {
      sessionScores: [],
      occurrencesCount: 0,
      exampleWords: new Set<string>(),
      lastPracticedAt: null
    });
  }

  for (const session of allSessionsAsc) {
    const perSessionStatusByNorm = new Map<
      string,
      { scores: number[]; occurrences: number; words: string[] }
    >();

    for (const entry of session.phonemeStatuses) {
      const norm = normalizeComplexPhonemeSymbol(entry.symbol);
      if (!norm || !buckets.has(norm)) continue;

      const base = statusToBaseScore(entry.status);
      const blended = clampPercent(base * 0.72 + session.phonemeAccuracyScore * 0.28);

      const current = perSessionStatusByNorm.get(norm) || {
        scores: [],
        occurrences: 0,
        words: []
      };
      current.scores.push(blended);
      current.occurrences += Math.max(1, entry.occurrences || 1);
      for (const w of entry.exampleWords || []) {
        if (w) current.words.push(w);
      }
      perSessionStatusByNorm.set(norm, current);
    }

    for (const [norm, agg] of perSessionStatusByNorm.entries()) {
      const bucket = buckets.get(norm)!;
      const avgSessionScore = clampPercent(
        agg.scores.reduce((sum, v) => sum + v, 0) / agg.scores.length
      );
      bucket.sessionScores.push(avgSessionScore);
      bucket.occurrencesCount += agg.occurrences;
      bucket.lastPracticedAt = session.recordedAt;
      for (const w of agg.words) {
        bucket.exampleWords.add(w);
      }
    }
  }

  const phonemes: ComplexPhonemeMasteryItem[] = COMPLEX_PHONEME_CONFIGS.map((cfg) => {
    const guide = PHONEME_ARTICULATION_GUIDE[cfg.symbol];
    const bucket = buckets.get(cfg.symbol)!;
    const sessionsCount = bucket.sessionScores.length;

    let masteryPercent: number | null = null;
    let status: ComplexPhonemeMasteryStatus = 'unassessed';
    let trend: ComplexPhonemeMasteryItem['trend'] = 'none';
    let trendDelta = 0;

    if (sessionsCount > 0) {
      // Weight slightly toward the latest two performances so real improvement shows up smoothly
      let weightedSum = 0;
      let weightTotal = 0;
      bucket.sessionScores.forEach((score, index) => {
        const recencyWeight = 1 + (index / Math.max(1, sessionsCount)) * 0.5;
        weightedSum += score * recencyWeight;
        weightTotal += recencyWeight;
      });
      masteryPercent = clampPercent(weightedSum / Math.max(1, weightTotal));
      status = deriveStatusFromPercent(masteryPercent);

      if (sessionsCount >= 2) {
        const latest = bucket.sessionScores[sessionsCount - 1];
        const priorSlice = bucket.sessionScores.slice(0, sessionsCount - 1);
        const priorAvg =
          priorSlice.reduce((sum, val) => sum + val, 0) / priorSlice.length;
        trendDelta = Math.round(latest - priorAvg);
        if (trendDelta >= 4) {
          trend = 'up';
        } else if (trendDelta <= -4) {
          trend = 'down';
        } else {
          trend = 'stable';
        }
      }
    }

    const exampleWords = Array.from(bucket.exampleWords).slice(0, 4);
    const drillWord = exampleWords[0] || cfg.defaultDrillWord;

    return {
      symbol: cfg.symbol,
      displaySymbol: `/${cfg.symbol}/`,
      labelFr: guide?.labelFr || `Phonème /${cfg.symbol}/`,
      frPitfallNote: cfg.frPitfallNote,
      category: guide?.category || 'consonant',
      articulationFr:
        guide?.articulationFr ||
        `Articulez nettement le phonème /${cfg.symbol}/ en anglais.`,
      commonMistakeFr: guide?.commonMistakeFr || cfg.frPitfallNote,
      masteryPercent,
      status,
      sessionsCount,
      occurrencesCount: bucket.occurrencesCount,
      trend,
      trendDelta,
      exampleWords,
      drillWord,
      lastPracticedAt: bucket.lastPracticedAt
    };
  });

  const assessed = phonemes.filter((p) => p.masteryPercent !== null);
  const assessedPhonemesCount = assessed.length;
  const masteredCount = assessed.filter((p) => p.status === 'mastered').length;
  const toRefineCount = assessed.filter((p) => p.status === 'to_refine').length;
  const missedCount = assessed.filter((p) => p.status === 'missed').length;

  const overallMasteryPercent =
    assessedPhonemesCount > 0
      ? clampPercent(
          assessed.reduce((sum, p) => sum + (p.masteryPercent ?? 0), 0) /
            assessedPhonemesCount
        )
      : null;

  const sortedByLowest = [...assessed].sort(
    (a, b) => (a.masteryPercent ?? 100) - (b.masteryPercent ?? 100)
  );
  const weakestPhoneme = sortedByLowest[0] ?? null;
  const strongestPhoneme = sortedByLowest[sortedByLowest.length - 1] ?? null;

  return {
    overallMasteryPercent,
    assessedPhonemesCount,
    totalTrackedPhonemes: phonemes.length,
    masteredCount,
    toRefineCount,
    missedCount,
    totalSpeakingSessions: allSessionsDesc.length,
    weakestPhoneme,
    strongestPhoneme,
    recentSessions: allSessionsDesc.slice(0, 4),
    phonemes
  };
}
