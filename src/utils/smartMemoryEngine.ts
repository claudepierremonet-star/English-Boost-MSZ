import type {
  CEFRLevel,
  SmartMemoryConfidence,
  SmartMemoryDifficulty,
  SmartMemoryItemType,
  SmartMemoryLearningMode,
  SmartMemoryRecallEntry,
  SmartMemoryRecallOutcome,
  SmartMemoryRecord
} from '../firebase/types';
import {
  SMART_MEMORY_CATALOG,
  type SmartMemoryCatalogItem
} from '../data/smartMemoryBank';
import type { ErrorJournalItem } from './errorJournal';

export interface SmartMemorySignalInput {
  outcome: SmartMemoryRecallOutcome;
  responseTimeMs: number;
  confidence: SmartMemoryConfidence;
  mode: SmartMemoryLearningMode;
}

export type ChallengePillarKey =
  | 'forgotten_words'
  | 'difficult_expressions'
  | 'previous_mistakes'
  | 'grammar_rules'
  | 'irregular_verbs';

export interface ChallengeQueueEntry {
  item: SmartMemoryCatalogItem;
  pillar: ChallengePillarKey;
  pillarLabelFr: string;
  reasonFr: string;
  record?: SmartMemoryRecord;
}

export interface TodaysMemoryChallengePlan {
  localDateKey: string;
  timezone: string;
  pillars: Array<{
    key: ChallengePillarKey;
    labelFr: string;
    icon: string;
    count: number;
    items: ChallengeQueueEntry[];
  }>;
  orderedQueue: ChallengeQueueEntry[];
  totalItems: number;
}

export interface SmartMemoryWeakTopicRecommendation {
  topic: string;
  weaknessScore: number; // 0..100 higher = weaker
  accuracyPct: number;
  dueCount: number;
  mistakesCount: number;
  avgResponseTimeMs: number;
  dominantType: SmartMemoryItemType;
  reasonFr: string;
  targetedItems: SmartMemoryCatalogItem[];
}

export interface SmartMemoryWeeklyDayStat {
  localDateKey: string;
  dayLabel: string;
  reviewsCount: number;
  correctCount: number;
  accuracyPct: number;
  avgResponseTimeMs: number;
}

export interface SmartMemoryRetentionForecastDay {
  dayOffset: number;
  localDateKey: string;
  dayLabel: string;
  shortDateLabel: string;
  dueCount: number;
  cumulativeCount: number;
  overdueIncludedCount: number;
  projectedIntervalAvgDays: number;
}

export interface SmartMemoryProgressStats {
  wordsMastered: number;
  wordsLearning: number;
  wordsToReview: number;
  trackedTotal: number;
  catalogTotal: number;
  retentionRate: number;
  totalReviews: number;
  weeklyActivity: SmartMemoryWeeklyDayStat[];
  byType: Record<
    SmartMemoryItemType,
    { total: number; tracked: number; mastered: number; due: number }
  >;
}

export interface SmartMemoryModeExercise {
  mode: SmartMemoryLearningMode;
  item: SmartMemoryCatalogItem;
  promptEn?: string;
  promptFr: string;
  hintText?: string;
  sentenceWithBlank?: string;
  expectedText: string;
  acceptedAnswers: string[];
  options?: Array<{ id: string; label: string; subLabel?: string; isCorrect: boolean }>;
  pairs?: Array<{ pairId: string; leftEn: string; rightFr: string; pronunciation: string }>;
  scrambledLetters?: string[];
}

export const LEARNING_MODE_METADATA: Array<{
  id: SmartMemoryLearningMode;
  labelFr: string;
  shortLabel: string;
  icon: string;
  descriptionFr: string;
}> = [
  {
    id: 'flashcards',
    labelFr: '1. Flashcards',
    shortLabel: 'Flashcards',
    icon: 'style',
    descriptionFr: 'Rappel actif recto-verso avec IPA, exemple et audio UK/US.'
  },
  {
    id: 'en_to_fr',
    labelFr: '2. Anglais -> Français',
    shortLabel: 'EN -> FR',
    icon: 'translate',
    descriptionFr: 'Traduisez l’item anglais vers sa nuance française exacte.'
  },
  {
    id: 'fr_to_en',
    labelFr: '3. Français -> Anglais',
    shortLabel: 'FR -> EN',
    icon: 'swap_horiz',
    descriptionFr: 'Retrouvez la formulation anglaise précise depuis le français.'
  },
  {
    id: 'listen_identify',
    labelFr: '4. Listen & Identify',
    shortLabel: 'Écoute',
    icon: 'hearing',
    descriptionFr: 'Écoutez la prononciation native et identifiez le bon concept.'
  },
  {
    id: 'spell_word',
    labelFr: '5. Spell the Word',
    shortLabel: 'Orthographe',
    icon: 'spellcheck',
    descriptionFr: 'Reconstituez l’orthographe exacte sans erreur de lettre.'
  },
  {
    id: 'complete_sentence',
    labelFr: '6. Complete the Sentence',
    shortLabel: 'Phrase à trous',
    icon: 'edit_note',
    descriptionFr: 'Complétez la phrase contextuelle avec le mot ou temps juste.'
  },
  {
    id: 'multiple_choice',
    labelFr: '7. Multiple Choice',
    shortLabel: 'QCM',
    icon: 'checklist_rtl',
    descriptionFr: 'Choix multiple ciblant sens, règle grammaticale ou 3 formes verbales.'
  },
  {
    id: 'match_pairs',
    labelFr: '8. Match Pairs',
    shortLabel: 'Paires',
    icon: 'join_inner',
    descriptionFr: 'Associez rapidement 4 paires anglais <-> français.'
  },
  {
    id: 'write_from_memory',
    labelFr: '9. Write from Memory',
    shortLabel: 'Rappel libre',
    icon: 'keyboard',
    descriptionFr: 'Production écrite libre depuis la mémoire à long terme.'
  }
];

const CEFR_RANK: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

/**
 * Safely resolves the student's current IANA timezone.
 */
export function getUserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz && tz.length > 0 ? tz : 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Formats a Date into YYYY-MM-DD in the specified IANA timezone so day boundaries stay accurate globally.
 */
export function getLocalDateKey(
  dateInput: Date | string | number = new Date(),
  timeZone: string = getUserTimezone()
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Shifts a Date by a fractional number of days (preserving exact UTC instant).
 */
export function addDaysUtc(baseDate: Date, days: number): Date {
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Checks whether an item is due for review at `nowDate`.
 */
export function isItemDueForReview(
  nextReviewDateIso: string | undefined,
  nowDate: Date = new Date()
): boolean {
  if (!nextReviewDateIso) return true;
  const dueMs = Date.parse(nextReviewDateIso);
  if (Number.isNaN(dueMs)) return true;
  return dueMs <= nowDate.getTime();
}

/**
 * Normalizes text answers for fair grading (case-insensitive, smart quotes & spaces normalized).
 */
export function normalizeAnswerText(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ');
}

/**
 * Computes the next adaptive spaced repetition state from accuracy, response time, and confidence.
 */
export function computeAdaptiveSmartMemorySchedule(
  item: SmartMemoryCatalogItem,
  existing: SmartMemoryRecord | undefined,
  signal: SmartMemorySignalInput,
  nowDate: Date = new Date(),
  timeZone: string = getUserTimezone()
): SmartMemoryRecord {
  const nowIso = nowDate.toISOString();
  const safeResponseMs = Math.max(400, Math.min(300000, Math.round(signal.responseTimeMs || 3500)));
  const confidence: SmartMemoryConfidence = signal.confidence === 1 || signal.confidence === 3 ? signal.confidence : 2;

  const prevReps = existing?.repetitions ?? 0;
  const prevInterval = existing?.intervalDays ?? 0;
  const prevEase = existing?.easeFactor ?? 2.5;
  const prevTotalReviews = existing?.totalReviews ?? 0;
  const prevCorrectReviews = existing?.correctReviews ?? 0;
  const prevRetention = existing?.retentionScore ?? 55;

  // Response speed signal multiplier: fast recall rewards confidence; very slow recall moderates interval growth
  const speedMultiplier =
    safeResponseMs <= 3500 ? 1.14 : safeResponseMs <= 8000 ? 1.0 : safeResponseMs <= 14000 ? 0.9 : 0.82;

  // Confidence multiplier: hesitant=0.84, medium=1.0, confident=1.15
  const confidenceMultiplier = confidence === 1 ? 0.84 : confidence === 3 ? 1.15 : 1.0;

  let nextReps = prevReps;
  let nextEase = prevEase;
  let nextIntervalDays = prevInterval;
  let nextState: SmartMemoryRecord['state'] = 'learning';
  let nextDifficulty: SmartMemoryDifficulty = existing?.difficulty ?? item.difficulty;
  let nextRetention = prevRetention;
  let isCorrectOutcome = false;

  if (signal.outcome === 'incorrect') {
    // Schedule an earlier review: 2h if overconfident mistake, else 4h
    nextReps = 0;
    nextEase = Math.max(1.3, Number((prevEase - 0.25).toFixed(2)));
    const hoursEarlier = confidence === 3 ? 2 : 4;
    nextIntervalDays = Number((hoursEarlier / 24).toFixed(3));
    nextState = 'learning';
    nextDifficulty = 'hard';
    nextRetention = Math.max(12, Math.round(prevRetention * 0.68));
  } else if (signal.outcome === 'hard') {
    // Review soon: 12h to 18h (or 24h if already long-term item), moderated by confidence
    nextReps = Math.max(1, prevReps);
    nextEase = Math.max(1.3, Number((prevEase - 0.12).toFixed(2)));
    const soonHours = confidence === 1 || safeResponseMs > 10000 ? 12 : 18;
    nextIntervalDays = Number((soonHours / 24).toFixed(3));
    nextState = 'learning';
    nextDifficulty = nextEase < 1.9 ? 'hard' : 'medium';
    nextRetention = Math.max(35, Math.min(82, Math.round(prevRetention * 0.9 + 8)));
    isCorrectOutcome = true;
  } else if (signal.outcome === 'correct') {
    // Increase interval progressively using adaptive SM-2 blended with speed & confidence signals
    isCorrectOutcome = true;
    nextReps = prevReps + 1;
    const easeDelta = (safeResponseMs <= 5000 ? 0.05 : 0.01) + (confidence === 3 ? 0.04 : confidence === 1 ? -0.04 : 0);
    nextEase = Math.min(3.5, Math.max(1.3, Number((prevEase + easeDelta).toFixed(2))));

    let rawDays: number;
    if (nextReps === 1) {
      rawDays = 1.5 * speedMultiplier * confidenceMultiplier;
    } else if (nextReps === 2) {
      rawDays = 4 * speedMultiplier * confidenceMultiplier;
    } else {
      const baseGrowth = Math.max(prevInterval, 2) * nextEase * speedMultiplier * confidenceMultiplier;
      rawDays = Math.max(prevInterval + 1, baseGrowth);
    }

    nextIntervalDays = Math.min(365, Math.max(1, Number(rawDays.toFixed(1))));
    nextState = nextReps >= 4 && nextIntervalDays >= 14 ? 'mastered' : 'review';
    nextDifficulty = nextEase >= 2.65 ? 'easy' : nextEase <= 1.85 ? 'hard' : 'medium';
    const gain = confidence === 3 ? 14 : confidence === 2 ? 10 : 6;
    nextRetention = Math.min(98, Math.max(58, Math.round(prevRetention + gain)));
  } else {
    // 'easy' -> increase interval further beyond 'correct'
    isCorrectOutcome = true;
    nextReps = prevReps + 1;
    nextEase = Math.min(3.8, Number((prevEase + 0.16).toFixed(2)));

    let rawDays: number;
    if (nextReps === 1) {
      rawDays = 4 * speedMultiplier;
    } else if (nextReps === 2) {
      rawDays = 9 * speedMultiplier * confidenceMultiplier;
    } else {
      const boostedGrowth = Math.max(prevInterval, 3) * nextEase * 1.38 * speedMultiplier * confidenceMultiplier;
      rawDays = Math.max(prevInterval + 3, boostedGrowth);
    }

    nextIntervalDays = Math.min(365, Math.max(3, Number(rawDays.toFixed(1))));
    nextState = nextReps >= 3 && nextIntervalDays >= 10 ? 'mastered' : 'review';
    nextDifficulty = 'easy';
    nextRetention = Math.min(100, Math.max(76, Math.round(prevRetention + 18)));
  }

  const nextReviewDateObj = addDaysUtc(nowDate, nextIntervalDays);
  const nextReviewIso = nextReviewDateObj.toISOString();
  const nextReviewLocalDay = getLocalDateKey(nextReviewDateObj, timeZone);
  const todayLocalDay = getLocalDateKey(nowDate, timeZone);

  const historyEntry: SmartMemoryRecallEntry = {
    reviewedAt: nowIso,
    localDateKey: todayLocalDay,
    timezone: timeZone,
    mode: signal.mode,
    outcome: signal.outcome,
    responseTimeMs: safeResponseMs,
    confidence,
    intervalDaysAfter: nextIntervalDays
  };

  const prevHistory = Array.isArray(existing?.recallHistory) ? existing.recallHistory : [];
  const nextHistory = [...prevHistory, historyEntry].slice(-25);

  return {
    itemId: item.itemId,
    normalizedKey: item.normalizedKey,
    itemType: item.itemType,
    english: item.english,
    french: item.french,
    pronunciation: item.pronunciation,
    exampleSentence: item.exampleSentence,
    cefrLevel: item.cefrLevel,
    topic: item.topic,
    difficulty: nextDifficulty,
    state: nextState,
    repetitions: nextReps,
    intervalDays: nextIntervalDays,
    easeFactor: nextEase,
    retentionScore: nextRetention,
    nextReviewDate: nextReviewIso,
    lastReviewedAt: nowIso,
    timezone: timeZone,
    nextReviewLocalDay,
    totalReviews: prevTotalReviews + 1,
    correctReviews: prevCorrectReviews + (isCorrectOutcome ? 1 : 0),
    lastOutcome: signal.outcome,
    lastResponseTimeMs: safeResponseMs,
    lastConfidence: confidence,
    lastMode: signal.mode,
    recallHistory: nextHistory,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };
}

/**
 * Generates Today's Memory Challenge containing all 5 personalized pillars:
 * 1. Forgotten words
 * 2. Difficult expressions
 * 3. Previous mistakes
 * 4. Grammar rules
 * 5. Irregular verbs
 */
export function generateTodaysMemoryChallenge(
  catalog: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG,
  records: SmartMemoryRecord[] = [],
  errorJournal: ErrorJournalItem[] = [],
  userLevel: CEFRLevel = 'B1',
  nowDate: Date = new Date(),
  timeZone: string = getUserTimezone()
): TodaysMemoryChallengePlan {
  const localDateKey = getLocalDateKey(nowDate, timeZone);
  const recordsMap = new Map<string, SmartMemoryRecord>();
  for (const r of records) {
    if (r?.itemId) recordsMap.set(r.itemId, r);
  }

  const usedIds = new Set<string>();
  const targetRank = CEFR_RANK[userLevel] ?? 3;
  const sortByRelevanceAndDue = (a: SmartMemoryCatalogItem, b: SmartMemoryCatalogItem) => {
    const recA = recordsMap.get(a.itemId);
    const recB = recordsMap.get(b.itemId);
    const dueA = isItemDueForReview(recA?.nextReviewDate, nowDate) ? 1 : 0;
    const dueB = isItemDueForReview(recB?.nextReviewDate, nowDate) ? 1 : 0;
    if (dueA !== dueB) return dueB - dueA;

    const easeA = recA?.easeFactor ?? 2.5;
    const easeB = recB?.easeFactor ?? 2.5;
    if (easeA !== easeB) return easeA - easeB;

    const distA = Math.abs((CEFR_RANK[a.cefrLevel] ?? 3) - targetRank);
    const distB = Math.abs((CEFR_RANK[b.cefrLevel] ?? 3) - targetRank);
    return distA - distB;
  };

  // Day hash offset for clean daily rotation on unseen items
  const daySeed = localDateKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  // Pillar 1: Previous Mistakes (unresolved ErrorJournal items or records with incorrect/hard lastOutcome)
  const unresolvedTerms = new Set(
    errorJournal
      .filter((e) => !e.resolved)
      .map((e) => normalizeAnswerText(e.term))
  );
  const mistakesCandidates = catalog
    .filter((item) => {
      const rec = recordsMap.get(item.itemId);
      const inJournal = unresolvedTerms.has(normalizeAnswerText(item.english));
      const hadError = rec && (rec.lastOutcome === 'incorrect' || rec.lastOutcome === 'hard' || rec.retentionScore < 60);
      return inJournal || Boolean(hadError);
    })
    .sort(sortByRelevanceAndDue);

  const mistakeEntries: ChallengeQueueEntry[] = [];
  for (const item of mistakesCandidates.slice(0, 3)) {
    usedIds.add(item.itemId);
    const rec = recordsMap.get(item.itemId);
    mistakeEntries.push({
      item,
      pillar: 'previous_mistakes',
      pillarLabelFr: 'Erreurs Précédentes',
      reasonFr: rec?.lastOutcome === 'incorrect' ? 'Rappel manqué récemment' : 'Identifié dans le journal d’erreurs',
      record: rec
    });
  }
  if (mistakeEntries.length < 3) {
    // Fallback to hardest items near user level if student has < 3 recorded errors yet
    const hardFallbacks = catalog
      .filter((it) => !usedIds.has(it.itemId) && (it.difficulty === 'hard' || it.difficulty === 'medium'))
      .sort(sortByRelevanceAndDue);
    for (let i = 0; i < hardFallbacks.length && mistakeEntries.length < 3; i++) {
      const picked = hardFallbacks[(i + daySeed) % hardFallbacks.length];
      if (!usedIds.has(picked.itemId)) {
        usedIds.add(picked.itemId);
        mistakeEntries.push({
          item: picked,
          pillar: 'previous_mistakes',
          pillarLabelFr: 'Erreurs Précédentes',
          reasonFr: 'Point de vigilance orthographique & sémantique',
          record: recordsMap.get(picked.itemId)
        });
      }
    }
  }

  // Pillar 2: Forgotten Words (vocabulary overdue or low retention or unseen level-matched)
  const vocabPool = catalog
    .filter((it) => it.itemType === 'vocabulary' && !usedIds.has(it.itemId))
    .sort((a, b) => {
      const ra = recordsMap.get(a.itemId);
      const rb = recordsMap.get(b.itemId);
      const scoreA = ra ? (isItemDueForReview(ra.nextReviewDate, nowDate) ? 0 : 100) + ra.retentionScore : 50 + Math.abs((CEFR_RANK[a.cefrLevel] ?? 3) - targetRank) * 10;
      const scoreB = rb ? (isItemDueForReview(rb.nextReviewDate, nowDate) ? 0 : 100) + rb.retentionScore : 50 + Math.abs((CEFR_RANK[b.cefrLevel] ?? 3) - targetRank) * 10;
      return scoreA - scoreB;
    });
  const forgottenEntries: ChallengeQueueEntry[] = [];
  for (let i = 0; i < vocabPool.length && forgottenEntries.length < 4; i++) {
    const idx = recordsMap.has(vocabPool[i].itemId) ? i : (i + daySeed) % vocabPool.length;
    const picked = vocabPool[idx];
    if (!usedIds.has(picked.itemId)) {
      usedIds.add(picked.itemId);
      const rec = recordsMap.get(picked.itemId);
      forgottenEntries.push({
        item: picked,
        pillar: 'forgotten_words',
        pillarLabelFr: 'Mots Oubliés',
        reasonFr: rec && isItemDueForReview(rec.nextReviewDate, nowDate) ? 'Échéance dépassée — rappel critique' : `Consolidation lexicale (${picked.cefrLevel})`,
        record: rec
      });
    }
  }

  // Pillar 3: Difficult Expressions
  const exprPool = catalog
    .filter((it) => it.itemType === 'expression' && !usedIds.has(it.itemId))
    .sort(sortByRelevanceAndDue);
  const exprEntries: ChallengeQueueEntry[] = [];
  for (let i = 0; i < exprPool.length && exprEntries.length < 3; i++) {
    const idx = recordsMap.has(exprPool[i].itemId) ? i : (i + daySeed * 2) % exprPool.length;
    const picked = exprPool[idx];
    if (!usedIds.has(picked.itemId)) {
      usedIds.add(picked.itemId);
      const rec = recordsMap.get(picked.itemId);
      exprEntries.push({
        item: picked,
        pillar: 'difficult_expressions',
        pillarLabelFr: 'Expressions Difficiles',
        reasonFr: rec ? `Rétention ${rec.retentionScore}% · Expression idiomatique` : `Expression idiomatique (${picked.cefrLevel})`,
        record: rec
      });
    }
  }

  // Pillar 4: Grammar Rules
  const gramPool = catalog
    .filter((it) => it.itemType === 'grammar' && !usedIds.has(it.itemId))
    .sort(sortByRelevanceAndDue);
  const gramEntries: ChallengeQueueEntry[] = [];
  for (let i = 0; i < gramPool.length && gramEntries.length < 3; i++) {
    const idx = recordsMap.has(gramPool[i].itemId) ? i : (i + daySeed * 3) % gramPool.length;
    const picked = gramPool[idx];
    if (!usedIds.has(picked.itemId)) {
      usedIds.add(picked.itemId);
      gramEntries.push({
        item: picked,
        pillar: 'grammar_rules',
        pillarLabelFr: 'Règles de Grammaire',
        reasonFr: `Règle clé · ${picked.topic}`,
        record: recordsMap.get(picked.itemId)
      });
    }
  }

  // Pillar 5: Irregular Verbs
  const verbPool = catalog
    .filter((it) => it.itemType === 'irregular_verb' && !usedIds.has(it.itemId))
    .sort(sortByRelevanceAndDue);
  const verbEntries: ChallengeQueueEntry[] = [];
  for (let i = 0; i < verbPool.length && verbEntries.length < 3; i++) {
    const idx = recordsMap.has(verbPool[i].itemId) ? i : (i + daySeed * 5) % verbPool.length;
    const picked = verbPool[idx];
    if (!usedIds.has(picked.itemId)) {
      usedIds.add(picked.itemId);
      verbEntries.push({
        item: picked,
        pillar: 'irregular_verbs',
        pillarLabelFr: 'Verbes Irréguliers',
        reasonFr: `3 formes · ${picked.cefrLevel}`,
        record: recordsMap.get(picked.itemId)
      });
    }
  }

  const pillars: TodaysMemoryChallengePlan['pillars'] = [
    {
      key: 'forgotten_words',
      labelFr: 'Mots Oubliés',
      icon: 'psychology_alt',
      count: forgottenEntries.length,
      items: forgottenEntries
    },
    {
      key: 'difficult_expressions',
      labelFr: 'Expressions Difficiles',
      icon: 'forum',
      count: exprEntries.length,
      items: exprEntries
    },
    {
      key: 'previous_mistakes',
      labelFr: 'Erreurs Précédentes',
      icon: 'report_problem',
      count: mistakeEntries.length,
      items: mistakeEntries
    },
    {
      key: 'grammar_rules',
      labelFr: 'Règles de Grammaire',
      icon: 'gavel',
      count: gramEntries.length,
      items: gramEntries
    },
    {
      key: 'irregular_verbs',
      labelFr: 'Verbes Irréguliers',
      icon: 'bolt',
      count: verbEntries.length,
      items: verbEntries
    }
  ];

  // Interleave items across all 5 pillars so the student experiences balanced cognitive variety
  const orderedQueue: ChallengeQueueEntry[] = [];
  const maxLen = Math.max(...pillars.map((p) => p.items.length), 0);
  for (let idx = 0; idx < maxLen; idx++) {
    for (const pillar of pillars) {
      if (pillar.items[idx]) {
        orderedQueue.push(pillar.items[idx]);
      }
    }
  }

  return {
    localDateKey,
    timezone: timeZone,
    pillars,
    orderedQueue,
    totalItems: orderedQueue.length
  };
}

/**
 * Identifies the weakest vocabulary/grammar categories and automatically builds targeted revision sessions.
 */
export function computeSmartMemoryRecommendations(
  catalog: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG,
  records: SmartMemoryRecord[] = [],
  userLevel: CEFRLevel = 'B1',
  nowDate: Date = new Date()
): SmartMemoryWeakTopicRecommendation[] {
  const byTopic = new Map<
    string,
    {
      items: SmartMemoryCatalogItem[];
      records: SmartMemoryRecord[];
      dueCount: number;
      mistakesCount: number;
      totalReviews: number;
      correctReviews: number;
      responseSum: number;
      responseCount: number;
      typeCounts: Record<SmartMemoryItemType, number>;
    }
  >();

  const recordById = new Map<string, SmartMemoryRecord>();
  for (const r of records) {
    if (r?.itemId) recordById.set(r.itemId, r);
  }

  for (const item of catalog) {
    const topic = item.topic || 'Général';
    if (!byTopic.has(topic)) {
      byTopic.set(topic, {
        items: [],
        records: [],
        dueCount: 0,
        mistakesCount: 0,
        totalReviews: 0,
        correctReviews: 0,
        responseSum: 0,
        responseCount: 0,
        typeCounts: { vocabulary: 0, expression: 0, grammar: 0, irregular_verb: 0 }
      });
    }
    const bucket = byTopic.get(topic)!;
    bucket.items.push(item);
    bucket.typeCounts[item.itemType] += 1;

    const rec = recordById.get(item.itemId);
    if (rec) {
      bucket.records.push(rec);
      bucket.totalReviews += rec.totalReviews;
      bucket.correctReviews += rec.correctReviews;
      if (isItemDueForReview(rec.nextReviewDate, nowDate)) {
        bucket.dueCount += 1;
      }
      if (rec.lastOutcome === 'incorrect' || rec.lastOutcome === 'hard') {
        bucket.mistakesCount += 1;
      }
      if (typeof rec.lastResponseTimeMs === 'number' && rec.lastResponseTimeMs > 0) {
        bucket.responseSum += rec.lastResponseTimeMs;
        bucket.responseCount += 1;
      }
    }
  }

  const recommendations: SmartMemoryWeakTopicRecommendation[] = [];
  const targetRank = CEFR_RANK[userLevel] ?? 3;

  for (const [topic, bucket] of byTopic.entries()) {
    const accuracyPct =
      bucket.totalReviews > 0
        ? Math.round((bucket.correctReviews / bucket.totalReviews) * 100)
        : 72;
    const avgResponseTimeMs =
      bucket.responseCount > 0 ? Math.round(bucket.responseSum / bucket.responseCount) : 4500;

    // Higher weakness score => weaker category needing immediate targeted revision
    const untrackedPenalty = bucket.records.length === 0 ? 18 : 0;
    const accuracyGap = Math.max(0, 100 - accuracyPct);
    const latencyPenalty = Math.min(20, Math.round(Math.max(0, avgResponseTimeMs - 3000) / 500));
    const weaknessScore = Math.min(
      100,
      Math.round(
        accuracyGap * 0.55 +
          bucket.mistakesCount * 14 +
          bucket.dueCount * 8 +
          latencyPenalty +
          untrackedPenalty
      )
    );

    const dominantType = (Object.entries(bucket.typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'vocabulary') as SmartMemoryItemType;

    const targetedItems = [...bucket.items]
      .sort((a, b) => {
        const ra = recordById.get(a.itemId);
        const rb = recordById.get(b.itemId);
        const retA = ra?.retentionScore ?? 60;
        const retB = rb?.retentionScore ?? 60;
        if (retA !== retB) return retA - retB;
        return (
          Math.abs((CEFR_RANK[a.cefrLevel] ?? 3) - targetRank) -
          Math.abs((CEFR_RANK[b.cefrLevel] ?? 3) - targetRank)
        );
      })
      .slice(0, 8);

    const reasonFr =
      bucket.mistakesCount > 0
        ? `${bucket.mistakesCount} erreur(s) récente(s) · Rétention ${accuracyPct}%`
        : bucket.dueCount > 0
        ? `${bucket.dueCount} révision(s) en attente · Rétention ${accuracyPct}%`
        : bucket.records.length === 0
        ? `Catégorie peu explorée pour le palier ${userLevel}`
        : `Consolidation recommandée (${accuracyPct}% de précision)`;

    recommendations.push({
      topic,
      weaknessScore,
      accuracyPct,
      dueCount: bucket.dueCount,
      mistakesCount: bucket.mistakesCount,
      avgResponseTimeMs,
      dominantType,
      reasonFr,
      targetedItems
    });
  }

  return recommendations
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);
}

/**
 * Computes Smart Memory overall mastery metrics and 7-day weekly learning activity
 * anchored strictly to the user's local timezone calendar.
 */
export function computeSmartMemoryProgressStats(
  catalog: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG,
  records: SmartMemoryRecord[] = [],
  nowDate: Date = new Date(),
  timeZone: string = getUserTimezone()
): SmartMemoryProgressStats {
  const byId = new Map<string, SmartMemoryRecord>();
  for (const r of records) {
    if (r?.itemId) byId.set(r.itemId, r);
  }

  let wordsMastered = 0;
  let wordsLearning = 0;
  let wordsToReview = 0;
  let totalReviews = 0;
  let correctReviews = 0;

  const byType: SmartMemoryProgressStats['byType'] = {
    vocabulary: { total: 0, tracked: 0, mastered: 0, due: 0 },
    expression: { total: 0, tracked: 0, mastered: 0, due: 0 },
    grammar: { total: 0, tracked: 0, mastered: 0, due: 0 },
    irregular_verb: { total: 0, tracked: 0, mastered: 0, due: 0 }
  };

  for (const item of catalog) {
    byType[item.itemType].total += 1;
    const rec = byId.get(item.itemId);
    if (!rec) continue;

    byType[item.itemType].tracked += 1;
    totalReviews += rec.totalReviews;
    correctReviews += rec.correctReviews;

    const due = isItemDueForReview(rec.nextReviewDate, nowDate);
    if (due) {
      wordsToReview += 1;
      byType[item.itemType].due += 1;
    }

    if (rec.state === 'mastered') {
      wordsMastered += 1;
      byType[item.itemType].mastered += 1;
    } else if (rec.state === 'learning' || rec.state === 'review') {
      wordsLearning += 1;
    }
  }

  // Also ensure unseen items count baseline or due indicator is never confusing: if 0 tracked yet, surface initial review queue size
  if (byId.size === 0 && catalog.length > 0) {
    wordsToReview = Math.min(16, catalog.length);
  }

  const retentionRate =
    totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  // Build 7-day local calendar timeline ending today in user's timezone
  const dayBuckets = new Map<
    string,
    { reviewsCount: number; correctCount: number; respSum: number }
  >();

  for (const rec of byId.values()) {
    for (const h of rec.recallHistory || []) {
      const localKey = h.localDateKey || getLocalDateKey(h.reviewedAt, timeZone);
      if (!dayBuckets.has(localKey)) {
        dayBuckets.set(localKey, { reviewsCount: 0, correctCount: 0, respSum: 0 });
      }
      const b = dayBuckets.get(localKey)!;
      b.reviewsCount += 1;
      if (h.outcome !== 'incorrect') {
        b.correctCount += 1;
      }
      b.respSum += h.responseTimeMs || 0;
    }
  }

  const weeklyActivity: SmartMemoryWeeklyDayStat[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const dayDate = addDaysUtc(nowDate, -offset);
    const localKey = getLocalDateKey(dayDate, timeZone);
    let dayLabel = localKey.slice(5);
    try {
      dayLabel = new Intl.DateTimeFormat('fr-FR', {
        timeZone,
        weekday: 'short'
      })
        .format(dayDate)
        .replace('.', '');
      dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
    } catch {
      // keep fallback
    }
    const bucket = dayBuckets.get(localKey);
    const reviewsCount = bucket?.reviewsCount ?? 0;
    const correctCount = bucket?.correctCount ?? 0;
    weeklyActivity.push({
      localDateKey: localKey,
      dayLabel,
      reviewsCount,
      correctCount,
      accuracyPct: reviewsCount > 0 ? Math.round((correctCount / reviewsCount) * 100) : 0,
      avgResponseTimeMs: reviewsCount > 0 ? Math.round((bucket?.respSum ?? 0) / reviewsCount) : 0
    });
  }

  return {
    wordsMastered,
    wordsLearning,
    wordsToReview,
    trackedTotal: byId.size,
    catalogTotal: catalog.length,
    retentionRate,
    totalReviews,
    weeklyActivity,
    byType
  };
}

/**
 * Computes a 7-day Retention Forecast timeline based on each record's nextReviewDate
 * and current spaced-repetition interval in the student's local timezone.
 */
export function computeSmartMemoryRetentionForecast(
  records: SmartMemoryRecord[] = [],
  nowDate: Date = new Date(),
  timeZone: string = getUserTimezone(),
  daysCount: number = 7
): SmartMemoryRetentionForecastDay[] {
  const safeDays = Math.max(1, Math.min(30, Math.floor(daysCount)));
  const todayKey = getLocalDateKey(nowDate, timeZone);

  const dayBuckets: Array<{
    dayOffset: number;
    localDateKey: string;
    dayLabel: string;
    shortDateLabel: string;
    dueCount: number;
    overdueIncludedCount: number;
    intervalSum: number;
  }> = [];

  const indexByKey = new Map<string, number>();

  for (let offset = 0; offset < safeDays; offset++) {
    const dayDate = addDaysUtc(nowDate, offset);
    const localKey = getLocalDateKey(dayDate, timeZone);
    let dayLabel = localKey.slice(5);
    let shortDateLabel = `${localKey.slice(8, 10)}/${localKey.slice(5, 7)}`;

    try {
      if (offset === 0) {
        dayLabel = 'Auj.';
      } else if (offset === 1) {
        dayLabel = 'Dem.';
      } else {
        const formatted = new Intl.DateTimeFormat('fr-FR', {
          timeZone,
          weekday: 'short'
        })
          .format(dayDate)
          .replace('.', '');
        dayLabel = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }
      shortDateLabel = new Intl.DateTimeFormat('fr-FR', {
        timeZone,
        day: '2-digit',
        month: '2-digit'
      }).format(dayDate);
    } catch {
      // keep fallback
    }

    indexByKey.set(localKey, offset);
    dayBuckets.push({
      dayOffset: offset,
      localDateKey: localKey,
      dayLabel,
      shortDateLabel,
      dueCount: 0,
      overdueIncludedCount: 0,
      intervalSum: 0
    });
  }

  // Deduplicate by itemId to avoid double-counting records
  const uniqueById = new Map<string, SmartMemoryRecord>();
  for (const r of records) {
    if (r?.itemId) uniqueById.set(r.itemId, r);
  }

  for (const rec of uniqueById.values()) {
    const dueKey = rec.nextReviewLocalDay || getLocalDateKey(rec.nextReviewDate, timeZone);
    const intervalVal = Number.isFinite(rec.intervalDays) ? Math.max(0, rec.intervalDays) : 0;

    if (dueKey <= todayKey) {
      dayBuckets[0].dueCount += 1;
      dayBuckets[0].intervalSum += intervalVal;
      if (dueKey < todayKey || isItemDueForReview(rec.nextReviewDate, nowDate)) {
        dayBuckets[0].overdueIncludedCount += 1;
      }
    } else {
      const targetIdx = indexByKey.get(dueKey);
      if (targetIdx !== undefined && dayBuckets[targetIdx]) {
        dayBuckets[targetIdx].dueCount += 1;
        dayBuckets[targetIdx].intervalSum += intervalVal;
      }
    }
  }

  let runningCumulative = 0;
  return dayBuckets.map((b) => {
    runningCumulative += b.dueCount;
    return {
      dayOffset: b.dayOffset,
      localDateKey: b.localDateKey,
      dayLabel: b.dayLabel,
      shortDateLabel: b.shortDateLabel,
      dueCount: b.dueCount,
      cumulativeCount: runningCumulative,
      overdueIncludedCount: b.overdueIncludedCount,
      projectedIntervalAvgDays:
        b.dueCount > 0 ? Number((b.intervalSum / b.dueCount).toFixed(1)) : 0
    };
  });
}

/**
 * Deterministically picks distractor items from the catalog pool without duplicating the target item.
 */
function pickDistractors(
  target: SmartMemoryCatalogItem,
  pool: SmartMemoryCatalogItem[],
  count: number = 3
): SmartMemoryCatalogItem[] {
  const candidates = pool.filter(
    (it) =>
      it.itemId !== target.itemId &&
      normalizeAnswerText(it.english) !== normalizeAnswerText(target.english) &&
      normalizeAnswerText(it.french) !== normalizeAnswerText(target.french)
  );
  const sameType = candidates.filter((c) => c.itemType === target.itemType);
  const ordered = sameType.length >= count ? sameType : candidates;

  // Deterministic stride based on target itemId hash
  const seed = target.itemId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const picked: SmartMemoryCatalogItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < ordered.length && picked.length < count; i++) {
    const cand = ordered[(seed + i * 7) % ordered.length];
    if (!used.has(cand.itemId)) {
      used.add(cand.itemId);
      picked.push(cand);
    }
  }
  return picked;
}

function deterministicShuffle<T>(arr: T[], seedStr: string): T[] {
  const copy = [...arr];
  let seed = seedStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 17);
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = seed % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Builds an interactive exercise prompt for any of the 9 SMART MEMORY learning modes.
 */
export function buildSmartMemoryExercise(
  item: SmartMemoryCatalogItem,
  mode: SmartMemoryLearningMode,
  catalogPool: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG
): SmartMemoryModeExercise {
  const distractors = pickDistractors(item, catalogPool, 3);
  const primaryEnglishToken =
    item.itemType === 'irregular_verb'
      ? item.english.split('·')[0].trim()
      : item.english;

  const acceptedAnswers = Array.from(
    new Set(
      [
        item.english,
        primaryEnglishToken,
        item.clozeTarget,
        ...(item.itemType === 'irregular_verb'
          ? [item.english.replace(/\s*·\s*/g, ' '), item.english.replace(/\s*·\s*/g, '/')]
          : [])
      ]
        .filter(Boolean)
        .map((s) => normalizeAnswerText(s))
    )
  );

  switch (mode) {
    case 'flashcards':
      return {
        mode,
        item,
        promptEn: item.english,
        promptFr: item.french,
        hintText: item.grammarRule || item.exampleSentence,
        expectedText: item.english,
        acceptedAnswers
      };

    case 'en_to_fr': {
      const options = deterministicShuffle(
        [
          { id: item.itemId, label: item.french, isCorrect: true },
          ...distractors.map((d) => ({
            id: d.itemId,
            label: d.french,
            isCorrect: false
          }))
        ],
        `en2fr_${item.itemId}`
      );
      return {
        mode,
        item,
        promptEn: item.english,
        promptFr: 'Sélectionnez la traduction française exacte :',
        hintText: item.pronunciation,
        expectedText: item.french,
        acceptedAnswers: [normalizeAnswerText(item.french)],
        options
      };
    }

    case 'fr_to_en': {
      const options = deterministicShuffle(
        [
          {
            id: item.itemId,
            label: item.english,
            subLabel: item.pronunciation,
            isCorrect: true
          },
          ...distractors.map((d) => ({
            id: d.itemId,
            label: d.english,
            subLabel: d.pronunciation,
            isCorrect: false
          }))
        ],
        `fr2en_${item.itemId}`
      );
      return {
        mode,
        item,
        promptFr: item.french,
        hintText: `${item.topic} · ${item.cefrLevel}`,
        expectedText: item.english,
        acceptedAnswers,
        options
      };
    }

    case 'listen_identify': {
      const options = deterministicShuffle(
        [
          {
            id: item.itemId,
            label: item.english,
            subLabel: item.french,
            isCorrect: true
          },
          ...distractors.map((d) => ({
            id: d.itemId,
            label: d.english,
            subLabel: d.french,
            isCorrect: false
          }))
        ],
        `listen_${item.itemId}`
      );
      return {
        mode,
        item,
        promptEn: item.english,
        promptFr: 'Écoutez la prononciation audio et identifiez le bon élément :',
        hintText: `Niveau ${item.cefrLevel} · ${item.topic}`,
        expectedText: item.english,
        acceptedAnswers,
        options
      };
    }

    case 'spell_word': {
      const spellTarget =
        item.itemType === 'vocabulary' || item.itemType === 'irregular_verb'
          ? primaryEnglishToken
          : item.clozeTarget || primaryEnglishToken;
      const letters = Array.from(spellTarget.replace(/\s+/g, ''));
      const scrambledLetters = deterministicShuffle(letters, `spell_${item.itemId}`);
      return {
        mode,
        item,
        promptFr: item.french,
        hintText: `${item.pronunciation} · ${spellTarget.length} caractères`,
        expectedText: spellTarget,
        acceptedAnswers: Array.from(new Set([normalizeAnswerText(spellTarget), ...acceptedAnswers])),
        scrambledLetters
      };
    }

    case 'complete_sentence': {
      const blankTarget = item.clozeTarget || primaryEnglishToken;
      const escaped = blankTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const blankRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      const sentenceWithBlank = blankRegex.test(item.exampleSentence)
        ? item.exampleSentence.replace(blankRegex, '______')
        : `${item.exampleSentence} (______ )`;

      const options = deterministicShuffle(
        [
          { id: item.itemId, label: blankTarget, isCorrect: true },
          ...distractors.map((d) => ({
            id: d.itemId,
            label: d.clozeTarget || d.english.split('·')[0].trim(),
            isCorrect: false
          }))
        ],
        `cloze_${item.itemId}`
      );

      return {
        mode,
        item,
        promptEn: sentenceWithBlank,
        promptFr: `Complétez la phrase (${item.french}) :`,
        sentenceWithBlank,
        expectedText: blankTarget,
        acceptedAnswers: [normalizeAnswerText(blankTarget), ...acceptedAnswers],
        options
      };
    }

    case 'multiple_choice': {
      const isGrammarOrVerb = item.itemType === 'grammar' || item.itemType === 'irregular_verb';
      const options = deterministicShuffle(
        [
          {
            id: item.itemId,
            label: isGrammarOrVerb ? item.english : item.french,
            subLabel: isGrammarOrVerb ? item.exampleSentence : item.pronunciation,
            isCorrect: true
          },
          ...distractors.map((d) => ({
            id: d.itemId,
            label: isGrammarOrVerb ? d.english : d.french,
            subLabel: isGrammarOrVerb ? d.exampleSentence : d.pronunciation,
            isCorrect: false
          }))
        ],
        `mcq_${item.itemId}`
      );
      return {
        mode,
        item,
        promptEn: isGrammarOrVerb ? item.french : item.english,
        promptFr: isGrammarOrVerb
          ? 'Quelle structure ou forme verbale correspond à cette règle ?'
          : `Choisissez la définition exacte de « ${item.english} » :`,
        hintText: item.grammarRule || item.exampleSentence,
        expectedText: isGrammarOrVerb ? item.english : item.french,
        acceptedAnswers,
        options
      };
    }

    case 'match_pairs': {
      const pairCohort = [item, ...distractors].slice(0, 4);
      const pairs = pairCohort.map((entry) => ({
        pairId: entry.itemId,
        leftEn: entry.english,
        rightFr: entry.french,
        pronunciation: entry.pronunciation
      }));
      return {
        mode,
        item,
        promptFr: 'Associez chaque terme anglais à sa traduction française :',
        expectedText: item.english,
        acceptedAnswers,
        pairs
      };
    }

    case 'write_from_memory': {
      const target =
        item.itemType === 'irregular_verb'
          ? item.english
          : primaryEnglishToken;
      const firstLetterHint = target
        .split(/\s+/)
        .map((w) => (w.length > 1 ? `${w[0]}${'_'.repeat(Math.min(5, w.length - 1))}` : w))
        .join(' ');
      return {
        mode,
        item,
        promptFr: item.french,
        hintText: `Indice : ${firstLetterHint} · ${item.pronunciation}`,
        expectedText: target,
        acceptedAnswers
      };
    }
  }
}
