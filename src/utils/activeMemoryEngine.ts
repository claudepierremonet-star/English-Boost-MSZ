import type { CEFRLevel, FlashcardProgress } from '../firebase/types';
import { SPACED_REPETITION_500, type SpacedRepetitionCard } from '../data/spacedRepetition500';
import type { ErrorJournalItem } from './errorJournal';

export type FlashRecallRating = 'again' | 'good' | 'easy';
export type ConceptUrgency = 'due' | 'fragile' | 'new';

export interface ActiveMemoryConcept {
  cardId: string;
  term: string;
  phonetic: string;
  level: CEFRLevel;
  category: string;
  frenchDef: string;
  englishDef: string;
  etymology: string;
  pressExcerpt: string;
  collocations: string[];
  urgency: ConceptUrgency;
  priorityReason: string;
  retentionScore: number; // 0..100 estimated retention
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate?: string;
  errorItemId?: string;
  priorityScore: number;
}

export interface ActiveMemoryPlan {
  concepts: ActiveMemoryConcept[];
  dueCount: number;
  fragileCount: number;
  newCount: number;
  averageRetentionPct: number;
}

const CEFR_RANK: Record<CEFRLevel, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Estimates current memory retention (0..100%) for a concept from SM-2 parameters.
 */
export function estimateConceptRetention(
  progress?: FlashcardProgress,
  nowMs: number = Date.now()
): number {
  if (!progress) return 42;

  const base =
    progress.state === 'mastered'
      ? 86
      : progress.state === 'review'
      ? 68
      : 45;

  const repBonus = Math.min(10, (progress.repetitions || 0) * 3);
  const easeBonus = Math.round(((progress.easeFactor || 2.5) - 2.0) * 8);

  let decayPenalty = 0;
  if (progress.nextReviewDate) {
    const dueMs = Date.parse(progress.nextReviewDate);
    if (!Number.isNaN(dueMs) && nowMs > dueMs) {
      const overdueDays = (nowMs - dueMs) / (1000 * 60 * 60 * 24);
      decayPenalty = Math.min(38, Math.round(6 + overdueDays * 5));
    }
  }

  return clamp(base + repBonus + easeBonus - decayPenalty, 15, 99);
}

/**
 * Computes the updated SuperMemo-2 (SM-2) progress state after an Active Memory flash recall.
 */
export function computeNextSm2State(
  concept: Pick<ActiveMemoryConcept, 'cardId' | 'term'>,
  rating: FlashRecallRating,
  existing?: FlashcardProgress,
  nowDate: Date = new Date()
): FlashcardProgress {
  const prevReps = existing?.repetitions ?? 0;
  const prevInterval = existing?.intervalDays ?? 1;
  const prevEf = existing?.easeFactor ?? 2.5;

  let repetitions = prevReps;
  let intervalDays = prevInterval;
  let easeFactor = prevEf;
  let lastQualityScore = 3;
  let state: FlashcardProgress['state'] = 'review';

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.round(clamp(prevEf - 0.2, 1.3, 2.8) * 100) / 100;
    lastQualityScore = 1;
    state = 'learning';
  } else if (rating === 'good') {
    repetitions = prevReps + 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(4, Math.round(prevInterval * prevEf));
    }
    easeFactor = Math.round(clamp(prevEf, 1.3, 2.8) * 100) / 100;
    lastQualityScore = 3;
    state = repetitions >= 3 ? 'mastered' : 'review';
  } else {
    // 'easy'
    repetitions = prevReps + 1;
    if (repetitions === 1) {
      intervalDays = 7;
    } else {
      intervalDays = Math.max(7, Math.round(prevInterval * prevEf * 1.25));
    }
    easeFactor = Math.round(clamp(prevEf + 0.1, 1.3, 2.8) * 100) / 100;
    lastQualityScore = 5;
    state = 'mastered';
  }

  const nextDate = new Date(nowDate.getTime());
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    cardId: concept.cardId,
    term: concept.term,
    repetitions,
    intervalDays,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
    lastQualityScore,
    state
  };
}

function cardToConcept(
  card: SpacedRepetitionCard,
  urgency: ConceptUrgency,
  priorityReason: string,
  priorityScore: number,
  progress?: FlashcardProgress,
  errorItemId?: string,
  nowMs: number = Date.now()
): ActiveMemoryConcept {
  return {
    cardId: card.id,
    term: card.term,
    phonetic: card.phonetic,
    level: card.level,
    category: card.category,
    frenchDef: card.frenchDef,
    englishDef: card.englishDef,
    etymology: card.etymology,
    pressExcerpt: card.pressExcerpt,
    collocations: card.collocations,
    urgency,
    priorityReason,
    retentionScore: estimateConceptRetention(progress, nowMs),
    repetitions: progress?.repetitions ?? 0,
    intervalDays: progress?.intervalDays ?? 0,
    easeFactor: progress?.easeFactor ?? 2.5,
    nextReviewDate: progress?.nextReviewDate,
    errorItemId,
    priorityScore
  };
}

/**
 * Identifies and ranks the key concepts for Active Memory flash recall using:
 * 1) Unresolved Error Journal concepts (highest urgency)
 * 2) SM-2 overdue flashcards (nextReviewDate <= now)
 * 3) Fragile cards (low easeFactor or low quality score)
 * 4) CEFR-calibrated unreviewed concepts from SPACED_REPETITION_500
 */
export function buildActiveMemoryConcepts(
  flashcards: FlashcardProgress[],
  errorItems: ErrorJournalItem[],
  cefrLevel: CEFRLevel = 'B2',
  limit: number = 8,
  nowMs: number = Date.now()
): ActiveMemoryPlan {
  const progressMap = new Map<string, FlashcardProgress>();
  for (const fp of flashcards) {
    if (fp?.cardId) {
      progressMap.set(fp.cardId, fp);
    }
  }

  const cardsById = new Map<string, SpacedRepetitionCard>();
  const cardsByTerm = new Map<string, SpacedRepetitionCard>();
  for (const card of SPACED_REPETITION_500) {
    cardsById.set(card.id, card);
    cardsByTerm.set(card.term.toLowerCase(), card);
  }

  const picked = new Map<string, ActiveMemoryConcept>();

  // 1. Unresolved error journal concepts (vigilance)
  const unresolvedErrors = errorItems.filter((e) => !e.resolved);
  for (const err of unresolvedErrors) {
    const matchedCard = cardsByTerm.get(err.term.toLowerCase());
    if (matchedCard && !picked.has(matchedCard.id)) {
      const fp = progressMap.get(matchedCard.id);
      picked.set(
        matchedCard.id,
        cardToConcept(
          matchedCard,
          'fragile',
          `Point de vigilance (${err.errorCount} erreur${err.errorCount > 1 ? 's' : ''})`,
          100 + Math.min(20, err.errorCount * 5),
          fp,
          err.id,
          nowMs
        )
      );
    } else if (!matchedCard) {
      const syntheticId = err.id;
      if (!picked.has(syntheticId)) {
        const levelVal: CEFRLevel =
          err.cefrLevel === 'A1' ||
          err.cefrLevel === 'A2' ||
          err.cefrLevel === 'B1' ||
          err.cefrLevel === 'B2' ||
          err.cefrLevel === 'C1' ||
          err.cefrLevel === 'C2'
            ? err.cefrLevel
            : cefrLevel;
        picked.set(syntheticId, {
          cardId: syntheticId,
          term: err.term,
          phonetic: err.phoneticsUk || err.phoneticsUs || '/ˈlɛk.sɪs/',
          level: levelVal,
          category: err.source === 'dictation' ? 'Vigilance Dictée' : 'Vigilance Lexique',
          frenchDef: err.translationFr,
          englishDef: err.definition,
          etymology: err.etymology || err.diffExplanation || 'Concept issu du journal des erreurs.',
          pressExcerpt: err.dictationSentence || `${err.term} — concept clé à consolider.`,
          collocations: [],
          urgency: 'fragile',
          priorityReason: `Point de vigilance (${err.errorCount} erreur${err.errorCount > 1 ? 's' : ''})`,
          retentionScore: 34,
          repetitions: 0,
          intervalDays: 1,
          easeFactor: 2.1,
          errorItemId: err.id,
          priorityScore: 95 + Math.min(20, err.errorCount * 4)
        });
      }
    }
  }

  // 2. Due SM-2 cards (nextReviewDate <= now)
  for (const fp of flashcards) {
    const dueMs = fp.nextReviewDate ? Date.parse(fp.nextReviewDate) : 0;
    const isDue = !fp.nextReviewDate || Number.isNaN(dueMs) || dueMs <= nowMs;
    if (isDue && !picked.has(fp.cardId)) {
      const card = cardsById.get(fp.cardId);
      if (card) {
        const overdueDays =
          !Number.isNaN(dueMs) && nowMs > dueMs
            ? Math.max(0, Math.floor((nowMs - dueMs) / (1000 * 60 * 60 * 24)))
            : 0;
        picked.set(
          card.id,
          cardToConcept(
            card,
            'due',
            overdueDays > 0 ? `Échéance SM-2 (+${overdueDays}j)` : 'Échéance SM-2 atteinte',
            88 + Math.min(15, overdueDays * 2),
            fp,
            undefined,
            nowMs
          )
        );
      }
    }
  }

  // 3. Fragile cards in progress (low easeFactor or low quality score)
  for (const fp of flashcards) {
    if (picked.has(fp.cardId)) continue;
    const isFragile =
      fp.state === 'learning' || (fp.lastQualityScore ?? 3) <= 2 || (fp.easeFactor ?? 2.5) < 2.35;
    if (isFragile) {
      const card = cardsById.get(fp.cardId);
      if (card) {
        picked.set(
          card.id,
          cardToConcept(
            card,
            'fragile',
            'Rétention fragile (SM-2)',
            72,
            fp,
            undefined,
            nowMs
          )
        );
      }
    }
  }

  // 4. Calibrated CEFR discovery cards from SPACED_REPETITION_500
  const targetRank = CEFR_RANK[cefrLevel] ?? 3;
  const unreviewed = SPACED_REPETITION_500.filter(
    (card) => !progressMap.has(card.id) && !picked.has(card.id)
  ).sort((a, b) => {
    const distA = Math.abs((CEFR_RANK[a.level] ?? 3) - targetRank);
    const distB = Math.abs((CEFR_RANK[b.level] ?? 3) - targetRank);
    return distA - distB;
  });

  for (const card of unreviewed) {
    if (picked.size >= limit) break;
    picked.set(
      card.id,
      cardToConcept(
        card,
        'new',
        `Concept clé calibré ${card.level}`,
        45 - Math.abs((CEFR_RANK[card.level] ?? 3) - targetRank) * 4,
        undefined,
        undefined,
        nowMs
      )
    );
  }

  const concepts = Array.from(picked.values())
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);

  const dueCount = concepts.filter((c) => c.urgency === 'due').length;
  const fragileCount = concepts.filter((c) => c.urgency === 'fragile').length;
  const newCount = concepts.filter((c) => c.urgency === 'new').length;
  const averageRetentionPct =
    concepts.length > 0
      ? Math.round(concepts.reduce((s, c) => s + c.retentionScore, 0) / concepts.length)
      : 0;

  return {
    concepts,
    dueCount,
    fragileCount,
    newCount,
    averageRetentionPct
  };
}
