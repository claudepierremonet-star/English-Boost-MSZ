import type {
  CEFRLevel,
  SmartMemoryDuelAnswerRecord,
  SmartMemoryDuelMode,
  SmartMemoryDuelRoom,
  SmartMemoryLearningMode,
  SmartMemoryRecord
} from '../firebase/types';
import {
  SMART_MEMORY_CATALOG,
  type SmartMemoryCatalogItem
} from '../data/smartMemoryBank';
import {
  buildSmartMemoryExercise,
  isItemDueForReview,
  type SmartMemoryModeExercise
} from './smartMemoryEngine';

export const DUEL_TOTAL_CARDS = 10;

const DUEL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const CEFR_RANK: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

const MIXED_DUEL_MODES: Array<
  Exclude<SmartMemoryDuelMode, 'mixed'> & SmartMemoryLearningMode
> = ['en_to_fr', 'fr_to_en', 'multiple_choice', 'complete_sentence'];

export function generateDuelRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code +=
      DUEL_CODE_ALPHABET[Math.floor(Math.random() * DUEL_CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeDuelRoomCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 16);
}

/**
 * Selects an exact 10-card spaced repetition duel deck prioritizing:
 * 1) Overdue/due SRS items from student's Smart Memory records
 * 2) Weak/incorrect/low-retention items
 * 3) Balanced CEFR-matched items across vocabulary, expression, grammar, and irregular verbs.
 */
export function selectDuelSpacedRepetitionDeck(
  catalog: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG,
  records: SmartMemoryRecord[] = [],
  targetLevel: CEFRLevel = 'B1',
  count: number = DUEL_TOTAL_CARDS,
  nowDate: Date = new Date()
): SmartMemoryCatalogItem[] {
  const byId = new Map<string, SmartMemoryRecord>();
  for (const r of records) {
    if (r?.itemId) byId.set(r.itemId, r);
  }

  const targetRank = CEFR_RANK[targetLevel] ?? 3;

  const scored = catalog.map((item, idx) => {
    const rec = byId.get(item.itemId);
    const cefrDist = Math.abs((CEFR_RANK[item.cefrLevel] ?? 3) - targetRank);
    let priority = 50 + cefrDist * 14;

    if (rec) {
      const due = isItemDueForReview(rec.nextReviewDate, nowDate);
      if (due) priority -= 38;
      if (rec.lastOutcome === 'incorrect') priority -= 25;
      else if (rec.lastOutcome === 'hard') priority -= 15;
      priority += (rec.retentionScore - 50) * 0.25;
    } else if (item.difficulty === 'medium' || item.difficulty === 'hard') {
      priority -= 4;
    }

    // Mild deterministic rotation using current hour/day so sequential duels vary naturally
    const dayHourJitter = ((nowDate.getUTCHours() * 13 + idx * 7) % 11) * 0.6;
    return { item, priority: priority + dayHourJitter };
  });

  scored.sort((a, b) => a.priority - b.priority);

  const selected: SmartMemoryCatalogItem[] = [];
  const usedIds = new Set<string>();

  // Ensure balanced variety across types if available
  const desiredTypes = ['vocabulary', 'expression', 'grammar', 'irregular_verb'] as const;
  for (const itemType of desiredTypes) {
    const match = scored.find(
      (entry) => entry.item.itemType === itemType && !usedIds.has(entry.item.itemId)
    );
    if (match && selected.length < count) {
      selected.push(match.item);
      usedIds.add(match.item.itemId);
    }
  }

  for (const entry of scored) {
    if (selected.length >= count) break;
    if (!usedIds.has(entry.item.itemId)) {
      selected.push(entry.item);
      usedIds.add(entry.item.itemId);
    }
  }

  return selected.slice(0, count);
}

/**
 * Resolves the exact interactive mode for card N inside a duel.
 */
export function getDuelCardMode(
  duelMode: SmartMemoryDuelMode,
  cardIndex: number
): Extract<
  SmartMemoryLearningMode,
  'en_to_fr' | 'fr_to_en' | 'multiple_choice' | 'complete_sentence'
> {
  if (duelMode !== 'mixed') {
    return duelMode;
  }
  return MIXED_DUEL_MODES[Math.abs(cardIndex) % MIXED_DUEL_MODES.length];
}

/**
 * Builds the deterministic 4-option duel question for a given card index and mode.
 * Identical on both host and guest devices!
 */
export function buildDuelCardExercise(
  item: SmartMemoryCatalogItem,
  duelMode: SmartMemoryDuelMode,
  cardIndex: number,
  catalogPool: SmartMemoryCatalogItem[] = SMART_MEMORY_CATALOG
): SmartMemoryModeExercise {
  const cardMode = getDuelCardMode(duelMode, cardIndex);
  return buildSmartMemoryExercise(item, cardMode, catalogPool);
}

/**
 * Evaluates a player's submitted option ID against the authoritative catalog item & mode.
 */
export function evaluateDuelOptionSubmission(params: {
  item: SmartMemoryCatalogItem;
  duelMode: SmartMemoryDuelMode;
  cardIndex: number;
  selectedOptionId: string;
  catalogPool?: SmartMemoryCatalogItem[];
}): { isCorrect: boolean; correctOptionId: string } {
  const { item, duelMode, cardIndex, selectedOptionId, catalogPool = SMART_MEMORY_CATALOG } =
    params;
  const exercise = buildDuelCardExercise(item, duelMode, cardIndex, catalogPool);
  const correctOpt = exercise.options?.find((o) => o.isCorrect);
  const chosenOpt = exercise.options?.find((o) => o.id === selectedOptionId);
  return {
    isCorrect: Boolean(chosenOpt?.isCorrect),
    correctOptionId: correctOpt?.id ?? item.itemId
  };
}

/**
 * Deterministic scoring formula for real-time duel answers:
 * - Correct answer: 100 base points + speed bonus (0..50) + streak bonus (0..75)
 * - Incorrect answer: 0 points, streak resets to 0.
 */
export function computeDuelAnswerPoints(params: {
  isCorrect: boolean;
  responseTimeMs: number;
  currentStreak: number;
}): { pointsAwarded: number; nextStreak: number } {
  const clampedMs = Math.max(400, Math.min(60_000, Math.round(params.responseTimeMs)));
  if (!params.isCorrect) {
    return { pointsAwarded: 0, nextStreak: 0 };
  }
  const nextStreak = Math.max(1, params.currentStreak + 1);
  const speedBonus = Math.max(0, Math.min(50, Math.round(50 - (clampedMs / 1000) * 3.5)));
  const streakBonus = Math.min(5, nextStreak - 1) * 15;
  return {
    pointsAwarded: 100 + speedBonus + streakBonus,
    nextStreak
  };
}

/**
 * Resolves the winner once both participants finish all cards.
 * Primary: score, Tie-breaker 1: correctCount, Tie-breaker 2: lower totalTimeMs.
 */
export function resolveDuelWinner(room: SmartMemoryDuelRoom): string {
  if (room.hostScore !== room.guestScore) {
    return room.hostScore > room.guestScore
      ? room.hostUid
      : room.guestUid || room.hostUid;
  }
  if (room.hostCorrectCount !== room.guestCorrectCount) {
    return room.hostCorrectCount > room.guestCorrectCount
      ? room.hostUid
      : room.guestUid || room.hostUid;
  }
  if (room.hostTotalTimeMs !== room.guestTotalTimeMs) {
    return room.hostTotalTimeMs < room.guestTotalTimeMs
      ? room.hostUid
      : room.guestUid || room.hostUid;
  }
  return 'draw';
}

export function createInitialDuelRoom(params: {
  duelId: string;
  hostUid: string;
  hostName: string;
  cefrLevel: CEFRLevel;
  mode: SmartMemoryDuelMode;
  cardIds: string[];
  nowIso?: string;
}): SmartMemoryDuelRoom {
  const nowIso = params.nowIso ?? new Date().toISOString();
  return {
    duelId: params.duelId,
    status: 'waiting',
    cefrLevel: params.cefrLevel,
    mode: params.mode,
    cardIds: params.cardIds.slice(0, DUEL_TOTAL_CARDS),
    hostUid: params.hostUid,
    hostName: params.hostName.trim().slice(0, 80) || 'Joueur 1',
    guestUid: null,
    guestName: null,
    hostScore: 0,
    hostCorrectCount: 0,
    hostAnsweredCount: 0,
    hostTotalTimeMs: 0,
    hostStreak: 0,
    hostBestStreak: 0,
    hostAnswers: [],
    guestScore: 0,
    guestCorrectCount: 0,
    guestAnsweredCount: 0,
    guestTotalTimeMs: 0,
    guestStreak: 0,
    guestBestStreak: 0,
    guestAnswers: [],
    winnerUid: null,
    createdAt: nowIso,
    startedAt: null,
    finishedAt: null,
    updatedAt: nowIso
  };
}

/**
 * Applies a player's answer idempotently to a duel room state.
 */
export function applyAnswerToDuelRoom(params: {
  room: SmartMemoryDuelRoom;
  playerUid: string;
  cardIndex: number;
  selectedOptionId: string;
  responseTimeMs: number;
  nowIso?: string;
  catalogPool?: SmartMemoryCatalogItem[];
}): SmartMemoryDuelRoom {
  const {
    room,
    playerUid,
    cardIndex,
    selectedOptionId,
    responseTimeMs,
    nowIso = new Date().toISOString(),
    catalogPool = SMART_MEMORY_CATALOG
  } = params;

  if (room.status === 'waiting') return room;
  if (cardIndex < 0 || cardIndex >= room.cardIds.length) return room;

  const isHost = playerUid === room.hostUid;
  const isGuest = room.guestUid !== null && playerUid === room.guestUid;
  if (!isHost && !isGuest) return room;

  const existingAnswers = isHost ? room.hostAnswers : room.guestAnswers;
  // Idempotency guard: do not re-score same cardIndex twice
  if (existingAnswers.some((a) => a.cardIndex === cardIndex)) {
    return room;
  }

  const itemId = room.cardIds[cardIndex];
  const item = catalogPool.find((c) => c.itemId === itemId);
  if (!item) return room;

  const { isCorrect } = evaluateDuelOptionSubmission({
    item,
    duelMode: room.mode,
    cardIndex,
    selectedOptionId,
    catalogPool
  });

  const currentStreak = isHost ? room.hostStreak : room.guestStreak;
  const { pointsAwarded, nextStreak } = computeDuelAnswerPoints({
    isCorrect,
    responseTimeMs,
    currentStreak
  });

  const clampedMs = Math.max(400, Math.min(60_000, Math.round(responseTimeMs)));
  const record: SmartMemoryDuelAnswerRecord = {
    cardIndex,
    itemId,
    selectedOptionId,
    isCorrect,
    responseTimeMs: clampedMs,
    pointsAwarded,
    answeredAt: nowIso
  };

  const nextAnswers = [...existingAnswers, record].sort(
    (a, b) => a.cardIndex - b.cardIndex
  );
  const nextCorrectCount = nextAnswers.filter((a) => a.isCorrect).length;
  const nextScore = nextAnswers.reduce((sum, a) => sum + a.pointsAwarded, 0);
  const nextTotalTimeMs = nextAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0);
  const prevBest = isHost ? room.hostBestStreak ?? 0 : room.guestBestStreak ?? 0;
  const nextBestStreak = Math.max(prevBest, nextStreak);

  const updated: SmartMemoryDuelRoom = {
    ...room,
    ...(isHost
      ? {
          hostAnswers: nextAnswers,
          hostAnsweredCount: nextAnswers.length,
          hostCorrectCount: nextCorrectCount,
          hostScore: nextScore,
          hostTotalTimeMs: nextTotalTimeMs,
          hostStreak: nextStreak,
          hostBestStreak: nextBestStreak
        }
      : {
          guestAnswers: nextAnswers,
          guestAnsweredCount: nextAnswers.length,
          guestCorrectCount: nextCorrectCount,
          guestScore: nextScore,
          guestTotalTimeMs: nextTotalTimeMs,
          guestStreak: nextStreak,
          guestBestStreak: nextBestStreak
        }),
    updatedAt: nowIso
  };

  const totalCards = updated.cardIds.length;
  if (
    updated.hostAnsweredCount >= totalCards &&
    updated.guestUid !== null &&
    updated.guestAnsweredCount >= totalCards
  ) {
    updated.status = 'finished';
    updated.finishedAt = updated.finishedAt ?? nowIso;
    updated.winnerUid = resolveDuelWinner(updated);
  }

  return updated;
}

const STATUS_ORDER: Record<SmartMemoryDuelRoom['status'], number> = {
  waiting: 0,
  active: 1,
  finished: 2
};

/**
 * Monotonic idempotent merge of two duel room snapshots from WebSocket / Firestore.
 */
export function mergeDuelRoomsIdempotent(
  primary: SmartMemoryDuelRoom,
  incoming: SmartMemoryDuelRoom
): SmartMemoryDuelRoom {
  if (primary.duelId !== incoming.duelId) return incoming;

  const status =
    STATUS_ORDER[incoming.status] >= STATUS_ORDER[primary.status]
      ? incoming.status
      : primary.status;

  const hostUsesIncoming =
    incoming.hostAnswers.length >= primary.hostAnswers.length;
  const guestUsesIncoming =
    incoming.guestAnswers.length >= primary.guestAnswers.length;

  const merged: SmartMemoryDuelRoom = {
    ...primary,
    ...incoming,
    status,
    guestUid: incoming.guestUid ?? primary.guestUid,
    guestName: incoming.guestName ?? primary.guestName,
    startedAt: primary.startedAt ?? incoming.startedAt,
    ...(hostUsesIncoming
      ? {
          hostScore: incoming.hostScore,
          hostCorrectCount: incoming.hostCorrectCount,
          hostAnsweredCount: incoming.hostAnsweredCount,
          hostTotalTimeMs: incoming.hostTotalTimeMs,
          hostStreak: incoming.hostStreak,
          hostBestStreak: Math.max(
            primary.hostBestStreak ?? 0,
            incoming.hostBestStreak ?? 0
          ),
          hostAnswers: incoming.hostAnswers
        }
      : {
          hostScore: primary.hostScore,
          hostCorrectCount: primary.hostCorrectCount,
          hostAnsweredCount: primary.hostAnsweredCount,
          hostTotalTimeMs: primary.hostTotalTimeMs,
          hostStreak: primary.hostStreak,
          hostBestStreak: primary.hostBestStreak ?? 0,
          hostAnswers: primary.hostAnswers
        }),
    ...(guestUsesIncoming
      ? {
          guestScore: incoming.guestScore,
          guestCorrectCount: incoming.guestCorrectCount,
          guestAnsweredCount: incoming.guestAnsweredCount,
          guestTotalTimeMs: incoming.guestTotalTimeMs,
          guestStreak: incoming.guestStreak,
          guestBestStreak: Math.max(
            primary.guestBestStreak ?? 0,
            incoming.guestBestStreak ?? 0
          ),
          guestAnswers: incoming.guestAnswers
        }
      : {
          guestScore: primary.guestScore,
          guestCorrectCount: primary.guestCorrectCount,
          guestAnsweredCount: primary.guestAnsweredCount,
          guestTotalTimeMs: primary.guestTotalTimeMs,
          guestStreak: primary.guestStreak,
          guestBestStreak: primary.guestBestStreak ?? 0,
          guestAnswers: primary.guestAnswers
        })
  };

  if (
    merged.hostAnsweredCount >= merged.cardIds.length &&
    merged.guestUid &&
    merged.guestAnsweredCount >= merged.cardIds.length
  ) {
    merged.status = 'finished';
    merged.winnerUid = merged.winnerUid ?? resolveDuelWinner(merged);
    merged.finishedAt = merged.finishedAt ?? new Date().toISOString();
  }

  return merged;
}
