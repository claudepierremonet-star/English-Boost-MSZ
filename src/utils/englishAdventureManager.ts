import type {
  AdventureDifficultyTier,
  AdventureIslandId,
  AdventureXpMultiplierBoost,
  CEFRLevel,
  DynamicAdaptationMode,
  EnglishAdventureState,
  UserProfile
} from '../firebase/types';
import {
  DEFAULT_ENGLISH_ADVENTURE_STATE,
  LOCAL_ADVENTURE_KEY,
  getLocalUserProfile,
  mergeEnglishAdventureState,
  recordAttempt,
  recordImmutableAdventureClaim,
  updateUserProfile
} from '../firebase/client';
import {
  ADVENTURE_AVATARS,
  ADVENTURE_CARDS,
  ADVENTURE_ISLANDS,
  ADVENTURE_THEMES,
  ADVENTURE_TROPHIES,
  type AdventureAvatar,
  type AdventureCollectibleCard,
  type AdventureIsland,
  type AdventureMission,
  type AdventureQuestion,
  type AdventureThemeReward,
  type AdventureTrophy
} from '../data/englishAdventureData';
import { creditAdventureCoins } from './mszCoinsManager';
import {
  getActiveXpBoostStatus,
  type AdventureDailyChallenge
} from './adventureDailyChallenges';

export const ENGLISH_ADVENTURE_UPDATED_EVENT = 'eb_english_adventure_updated';

export const ISLAND_SEQUENCE: AdventureIslandId[] = [
  'vocabulary_kingdom',
  'grammar_castle',
  'listening_ocean',
  'speaking_city',
  'reading_forest',
  'writing_academy',
  'advanced_universe'
];

export function getEnglishAdventureState(profile?: UserProfile | null): EnglishAdventureState {
  let localRaw: Partial<EnglishAdventureState> | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_ADVENTURE_KEY);
    if (raw) {
      localRaw = JSON.parse(raw) as Partial<EnglishAdventureState>;
    }
  } catch {
    localRaw = null;
  }

  const fallbackProfileAdv = profile?.englishAdventure || getLocalUserProfile().englishAdventure;
  return mergeEnglishAdventureState(localRaw, fallbackProfileAdv || DEFAULT_ENGLISH_ADVENTURE_STATE);
}

export function saveEnglishAdventureState(state: EnglishAdventureState): void {
  try {
    localStorage.setItem(LOCAL_ADVENTURE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ENGLISH_ADVENTURE_UPDATED_EVENT, { detail: state }));
    }
  } catch (e) {
    console.warn('Failed to persist English Adventure state locally:', e);
  }
}

export function isIslandUnlocked(state: EnglishAdventureState, islandId: AdventureIslandId): boolean {
  if (islandId === 'vocabulary_kingdom') return true;
  if (state.unlockedIslandIds.includes(islandId)) return true;
  const idx = ISLAND_SEQUENCE.indexOf(islandId);
  if (idx > 0 && state.bossDefeatedIslandIds.includes(ISLAND_SEQUENCE[idx - 1])) {
    return true;
  }
  return false;
}

export function isMissionUnlocked(
  state: EnglishAdventureState,
  island: AdventureIsland,
  mission: AdventureMission
): boolean {
  if (!isIslandUnlocked(state, island.id)) return false;
  if (!mission.prerequisiteMissionIds || mission.prerequisiteMissionIds.length === 0) return true;
  return mission.prerequisiteMissionIds.every((reqId) => state.completedMissionIds.includes(reqId));
}

export function getAdaptiveDifficultyForIsland(
  state: EnglishAdventureState,
  islandId: AdventureIslandId,
  adaptiveMode?: DynamicAdaptationMode
): AdventureDifficultyTier {
  const stored = state.difficultyTierByIsland?.[islandId];
  if (stored === 'scaffolded' || stored === 'standard' || stored === 'mastery') {
    return stored;
  }
  if (adaptiveMode === 'scaffolded') return 'scaffolded';
  if (adaptiveMode === 'accelerated') return 'mastery';
  return 'standard';
}

export interface AdaptiveTierMeta {
  tier: AdventureDifficultyTier;
  labelFr: string;
  rationaleFr: string;
  accentClass: string;
}

export function getAdaptiveTierMeta(tier: AdventureDifficultyTier): AdaptiveTierMeta {
  switch (tier) {
    case 'scaffolded':
      return {
        tier,
        labelFr: 'Soutien Guidé',
        rationaleFr: 'Indices pédagogiques ouverts d’emblée, amorce progressive et audio ralenti disponible.',
        accentClass: 'text-amber-300'
      };
    case 'mastery':
      return {
        tier,
        labelFr: 'Excellence',
        rationaleFr: 'Questions bonus d’approfondissement débloquées suite à une précision soutenue (≥85%).',
        accentClass: 'text-emerald-300'
      };
    default:
      return {
        tier: 'standard',
        labelFr: 'Standard',
        rationaleFr: 'Parcours équilibré selon votre profil CECRL et votre historique d’exactitude.',
        accentClass: 'text-[#d4c78f]'
      };
  }
}

export interface IslandProgressStats {
  unlocked: boolean;
  bossDefeated: boolean;
  completedCount: number;
  totalMissions: number;
  earnedStars: number;
  maxStars: number;
  masteryPct: number;
  prereqCompletedCount: number;
  prereqTotalCount: number;
  bossUnlocked: boolean;
  nextRecommendedMission: AdventureMission;
}

export function getIslandProgressStats(
  state: EnglishAdventureState,
  island: AdventureIsland
): IslandProgressStats {
  const unlocked = isIslandUnlocked(state, island.id);
  const bossDefeated = state.bossDefeatedIslandIds.includes(island.id);
  const completedCount = island.missions.filter((m) =>
    state.completedMissionIds.includes(m.id)
  ).length;
  const totalMissions = island.missions.length;
  const earnedStars = island.missions.reduce(
    (sum, m) => sum + (state.missionStars?.[m.id] || 0),
    0
  );
  const maxStars = totalMissions * 3;
  const nonBoss = island.missions.filter((m) => m.kind !== 'boss_challenge');
  const prereqCompletedCount = nonBoss.filter((m) =>
    state.completedMissionIds.includes(m.id)
  ).length;
  const bossMission = island.missions.find((m) => m.kind === 'boss_challenge');
  const bossUnlocked = bossMission ? isMissionUnlocked(state, island, bossMission) : false;

  const avgBest =
    island.missions.reduce((acc, m) => acc + (state.missionBestAccuracy?.[m.id] || 0), 0) /
    Math.max(1, totalMissions);

  const nextRecommendedMission =
    island.missions.find(
      (m) => isMissionUnlocked(state, island, m) && !state.completedMissionIds.includes(m.id)
    ) ||
    island.missions[island.missions.length - 1] ||
    island.missions[0];

  return {
    unlocked,
    bossDefeated,
    completedCount,
    totalMissions,
    earnedStars,
    maxStars,
    masteryPct: Math.round(avgBest),
    prereqCompletedCount,
    prereqTotalCount: nonBoss.length,
    bossUnlocked,
    nextRecommendedMission
  };
}

export function buildAdaptiveQuestionsForMission(
  mission: AdventureMission,
  island: AdventureIsland,
  tier: AdventureDifficultyTier
): AdventureQuestion[] {
  const base = [...mission.questions];
  if (tier === 'mastery' && mission.masteryBonusQuestions && mission.masteryBonusQuestions.length > 0) {
    return [...base, ...mission.masteryBonusQuestions];
  }
  if (tier === 'scaffolded' && mission.kind !== 'boss_challenge' && island.scaffoldedPracticeQuestions.length > 0) {
    const warmup = island.scaffoldedPracticeQuestions[0];
    if (warmup && !base.some((q) => q.id === warmup.id)) {
      return [warmup, ...base.slice(0, Math.max(2, base.length - 1))];
    }
  }
  return base;
}

export async function equipAdventureAvatar(avatarId: string): Promise<EnglishAdventureState> {
  const current = getEnglishAdventureState();
  if (!current.unlockedAvatarIds.includes(avatarId)) {
    return current;
  }
  const nextState: EnglishAdventureState = {
    ...current,
    equippedAvatarId: avatarId,
    updatedAt: new Date().toISOString()
  };
  saveEnglishAdventureState(nextState);
  await updateUserProfile({ englishAdventure: nextState });
  return nextState;
}

export interface AdventureMissionEvaluationInput {
  island: AdventureIsland;
  mission: AdventureMission;
  correctCount: number;
  totalCount: number;
  maxAccuracyStreak: number;
  retentionCorrectCount: number;
  retentionTotalCount: number;
  hintsUsed: number;
  durationSeconds: number;
  adaptiveTierUsed: AdventureDifficultyTier;
  cefrLevel: CEFRLevel;
  isScaffoldedPractice?: boolean;
  dailyChallenge?: AdventureDailyChallenge;
}

export interface AdventureMissionEvaluationResult {
  state: EnglishAdventureState;
  accuracy: number;
  passed: boolean;
  stars: number;
  xpAwarded: number;
  coinsAwarded: number;
  previousBestAccuracy: number;
  improvedOverPrevious: boolean;
  consistencyBonusAwarded: boolean;
  retentionBonusAwarded: boolean;
  nextTier: AdventureDifficultyTier;
  unlockedNextIsland?: AdventureIsland;
  unlockedTrophy?: AdventureTrophy;
  unlockedCard?: AdventureCollectibleCard;
  unlockedAvatar?: AdventureAvatar;
  unlockedTheme?: AdventureThemeReward;
  newlyClaimedLabels: string[];
  isDuplicateReplay: boolean;
  xpMultiplierApplied?: number;
  xpMultiplierBonus?: number;
  activatedXpBoost?: AdventureXpMultiplierBoost;
}

interface PendingClaim {
  claimId: string;
  labelFr: string;
  xp: number;
  coins: number;
}

function sanitizeClaimId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

export async function evaluateAndSubmitAdventureMission(
  input: AdventureMissionEvaluationInput
): Promise<AdventureMissionEvaluationResult> {
  const {
    island,
    mission,
    correctCount,
    totalCount,
    maxAccuracyStreak,
    retentionCorrectCount,
    retentionTotalCount,
    hintsUsed,
    durationSeconds,
    cefrLevel,
    isScaffoldedPractice = false,
    dailyChallenge
  } = input;
  const isDailyChallenge = Boolean(dailyChallenge);

  const currentState = getEnglishAdventureState();
  const safeTotal = Math.max(1, totalCount);
  const accuracy = Math.max(0, Math.min(100, Math.round((correctCount / safeTotal) * 100)));
  const passThreshold = isScaffoldedPractice ? 50 : mission.passAccuracyRequired;
  const passed = accuracy >= passThreshold;

  // Pedagogical stars prioritize accuracy & consistency, never speed
  const stars = !passed ? 0 : accuracy >= 95 && maxAccuracyStreak >= 3 ? 3 : accuracy >= 80 ? 2 : 1;

  const retentionPassed = retentionTotalCount > 0 && retentionCorrectCount === retentionTotalCount;
  const consistencyPassed = passed && accuracy >= 80 && maxAccuracyStreak >= 3;

  const prevBestAccuracy = currentState.missionBestAccuracy?.[mission.id] || 0;
  const prevAttempts = currentState.missionAttemptsCount?.[mission.id] || 0;
  const prevStars = currentState.missionStars?.[mission.id] || 0;

  // Dynamic adaptive difficulty for next runs on this island
  let nextTier: AdventureDifficultyTier = 'standard';
  if (accuracy < 60 || hintsUsed >= 2) {
    nextTier = 'scaffolded';
  } else if (accuracy >= 85 && hintsUsed <= 1) {
    nextTier = 'mastery';
  }

  const nextConsecutiveHigh =
    passed && accuracy >= 85 ? (currentState.consecutiveHighAccuracyCount || 0) + 1 : 0;

  const claimedSet = new Set(currentState.claimedRewardIds || []);
  const candidates: PendingClaim[] = [];

  if (isDailyChallenge && dailyChallenge) {
    if (passed) {
      candidates.push({
        claimId: sanitizeClaimId(
          `adv_daily_${dailyChallenge.dateKey}_${dailyChallenge.pairId}_${dailyChallenge.cefrLevel}`
        ),
        labelFr: `Défi Quotidien (${dailyChallenge.skillPairLabelFr} · ${dailyChallenge.cefrLevel})`,
        xp: dailyChallenge.baseXp,
        coins: dailyChallenge.baseCoins
      });

      if (consistencyPassed) {
        candidates.push({
          claimId: sanitizeClaimId(
            `adv_daily_${dailyChallenge.dateKey}_${dailyChallenge.pairId}_consistency`
          ),
          labelFr: 'Prime de Constance Duo (≥80% & série de 3)',
          xp: 20,
          coins: 5
        });
      }
    }
  } else if (isScaffoldedPractice) {
    if (passed) {
      candidates.push({
        claimId: sanitizeClaimId(`adv_prac_${island.id}_clear`),
        labelFr: `Consolidation guidée · ${island.name}`,
        xp: 25,
        coins: 5
      });
    }
  } else if (passed) {
    candidates.push({
      claimId: sanitizeClaimId(`adv_m_${mission.id}_clear`),
      labelFr: `Validation : ${mission.title}`,
      xp: mission.baseXp,
      coins: mission.baseCoins
    });

    if (consistencyPassed) {
      candidates.push({
        claimId: sanitizeClaimId(`adv_m_${mission.id}_consistency`),
        labelFr: 'Prime de Constance (≥80% & série de 3)',
        xp: 20,
        coins: 0
      });
    }

    if (retentionPassed) {
      candidates.push({
        claimId: sanitizeClaimId(`adv_m_${mission.id}_retention`),
        labelFr: 'Prime de Rétention des Acquis',
        xp: 15,
        coins: 0
      });
    }

    if (stars === 3) {
      candidates.push({
        claimId: sanitizeClaimId(`adv_m_${mission.id}_3star`),
        labelFr: 'Maîtrise 3 Étoiles (≥95%)',
        xp: 30,
        coins: 10
      });
    }

    if (prevAttempts > 0 && accuracy > prevBestAccuracy) {
      for (const milestone of [70, 80, 90, 100]) {
        if (accuracy >= milestone && prevBestAccuracy < milestone) {
          candidates.push({
            claimId: sanitizeClaimId(`adv_m_${mission.id}_imp_${milestone}`),
            labelFr: `Amélioration vérifiée (palier ${milestone}%)`,
            xp: 15,
            coins: 0
          });
        }
      }
    }

    if (mission.kind === 'boss_challenge') {
      candidates.push({
        claimId: sanitizeClaimId(`adv_boss_${island.id}_defeat`),
        labelFr: `Victoire sur ${island.bossName}`,
        xp: 40,
        coins: 15
      });
    }
  }

  if (accuracy === 100 && !isScaffoldedPractice) {
    candidates.push({
      claimId: 'adv_trophy_precision_100',
      labelFr: 'Trophée : Sceau d’Exactitude Pure (100%)',
      xp: 35,
      coins: 10
    });
  }

  if (nextConsecutiveHigh >= 3 && !isScaffoldedPractice) {
    candidates.push({
      claimId: 'adv_trophy_consistency_streak',
      labelFr: 'Trophée : Constance Académique (3 missions ≥85%)',
      xp: 40,
      coins: 10
    });
  }

  const nowIso = new Date().toISOString();
  let totalXpAwarded = 0;
  let totalCoinsAwarded = 0;
  const newlyClaimedLabels: string[] = [];
  let consistencyBonusAwarded = false;
  let retentionBonusAwarded = false;

  for (const cand of candidates) {
    if (claimedSet.has(cand.claimId)) continue;
    const verifiedNew = await recordImmutableAdventureClaim({
      claimId: cand.claimId,
      missionId: mission.id,
      islandId: island.id,
      xpAwarded: cand.xp,
      coinsAwarded: cand.coins,
      accuracy,
      claimedAt: nowIso
    });
    if (!verifiedNew) {
      claimedSet.add(cand.claimId);
      continue;
    }
    claimedSet.add(cand.claimId);
    totalXpAwarded += cand.xp;
    totalCoinsAwarded += cand.coins;
    newlyClaimedLabels.push(cand.labelFr);
    if (cand.claimId.endsWith('_consistency')) consistencyBonusAwarded = true;
    if (cand.claimId.endsWith('_retention')) retentionBonusAwarded = true;
  }

  // Apply active temporary XP multiplier on non-daily adventure missions
  const activeBoostStatus = getActiveXpBoostStatus(currentState);
  let xpMultiplierApplied: number | undefined;
  let xpMultiplierBonus: number | undefined;

  if (!isDailyChallenge && activeBoostStatus.active && activeBoostStatus.boost && totalXpAwarded > 0) {
    const mult = activeBoostStatus.boost.multiplier;
    const boosted = Math.min(1500, Math.round(totalXpAwarded * mult));
    const bonus = Math.max(0, boosted - totalXpAwarded);
    if (bonus > 0) {
      xpMultiplierApplied = mult;
      xpMultiplierBonus = bonus;
      totalXpAwarded = boosted;
      newlyClaimedLabels.push(
        `Multiplicateur Défi Quotidien ×${mult} (+${bonus} XP bonus)`
      );
    }
  }

  // Enforce strict per-evaluation guardrails aligned with firestore.rules
  totalXpAwarded = Math.min(1500, Math.max(0, totalXpAwarded));
  totalCoinsAwarded = Math.min(100, Math.max(0, totalCoinsAwarded));

  // Activate or extend temporary XP multiplier if a Daily Challenge was freshly completed
  let nextActiveXpBoost: AdventureXpMultiplierBoost | null = activeBoostStatus.active
    ? activeBoostStatus.boost
    : null;
  let activatedXpBoost: AdventureXpMultiplierBoost | undefined;

  const existingDailyIds = new Set<string>(currentState.completedDailyChallengeIds || []);
  const wasDailyAlreadyCompleted = Boolean(dailyChallenge && existingDailyIds.has(dailyChallenge.id));

  if (isDailyChallenge && dailyChallenge && passed) {
    existingDailyIds.add(dailyChallenge.id);
    if (!wasDailyAlreadyCompleted || totalXpAwarded > 0) {
      const nowMs = Date.now();
      const maxHorizonMs = nowMs + 6 * 60 * 60_000; // hard 6h cap
      const rewardMs = dailyChallenge.boostDurationMinutes * 60_000;
      const existingExpMs = nextActiveXpBoost ? Date.parse(nextActiveXpBoost.expiresAt) : nowMs;
      const baseAnchor = Number.isFinite(existingExpMs) && existingExpMs > nowMs ? existingExpMs : nowMs;
      const newExpiresMs = Math.min(maxHorizonMs, baseAnchor + rewardMs);
      const safeMultiplier = Math.min(
        2.0,
        Math.max(
          nextActiveXpBoost?.multiplier || 1.0,
          dailyChallenge.xpMultiplierReward
        )
      );

      const newBoost: AdventureXpMultiplierBoost = {
        multiplier: Math.round(safeMultiplier * 100) / 100,
        sourceChallengeId: dailyChallenge.id.slice(0, 100),
        sourceChallengeTitle: dailyChallenge.title.slice(0, 140),
        skillPairLabelFr: dailyChallenge.skillPairLabelFr.slice(0, 100),
        cefrLevel: dailyChallenge.cefrLevel,
        activatedAt: nowIso,
        expiresAt: new Date(newExpiresMs).toISOString()
      };
      nextActiveXpBoost = newBoost;
      activatedXpBoost = newBoost;
    }
  }

  // Unlock territories, trophies, cards, avatars, themes on Boss defeat or trophy conditions
  const nextUnlockedIslands = new Set<AdventureIslandId>(currentState.unlockedIslandIds);
  const nextCompletedMissions = new Set<string>(currentState.completedMissionIds);
  const nextBossDefeated = new Set<AdventureIslandId>(currentState.bossDefeatedIslandIds);
  const nextTrophies = new Set<string>(currentState.unlockedTrophyIds);
  const nextCards = new Set<string>(currentState.unlockedCardIds);
  const nextAvatars = new Set<string>(currentState.unlockedAvatarIds);
  const nextThemes = new Set<string>(currentState.unlockedThemeIds);

  let unlockedNextIsland: AdventureIsland | undefined;
  let unlockedTrophy: AdventureTrophy | undefined;
  let unlockedCard: AdventureCollectibleCard | undefined;
  let unlockedAvatar: AdventureAvatar | undefined;
  let unlockedTheme: AdventureThemeReward | undefined;

  if (!isDailyChallenge && !isScaffoldedPractice && passed) {
    nextCompletedMissions.add(mission.id);

    if (mission.kind === 'boss_challenge') {
      const wasBossAlreadyDefeated = nextBossDefeated.has(island.id);
      nextBossDefeated.add(island.id);

      if (island.unlocksNextIslandId) {
        if (!nextUnlockedIslands.has(island.unlocksNextIslandId)) {
          unlockedNextIsland = ADVENTURE_ISLANDS.find((isl) => isl.id === island.unlocksNextIslandId);
        }
        nextUnlockedIslands.add(island.unlocksNextIslandId);
      }

      if (island.rewardTrophyId) {
        if (!nextTrophies.has(island.rewardTrophyId) || !wasBossAlreadyDefeated) {
          unlockedTrophy = ADVENTURE_TROPHIES.find((t) => t.id === island.rewardTrophyId);
        }
        nextTrophies.add(island.rewardTrophyId);
      }

      if (island.rewardCardId) {
        if (!nextCards.has(island.rewardCardId) || !wasBossAlreadyDefeated) {
          unlockedCard = ADVENTURE_CARDS.find((c) => c.id === island.rewardCardId);
        }
        nextCards.add(island.rewardCardId);
      }

      if (island.rewardAvatarId) {
        if (!nextAvatars.has(island.rewardAvatarId) || !wasBossAlreadyDefeated) {
          unlockedAvatar = ADVENTURE_AVATARS.find((a) => a.id === island.rewardAvatarId);
        }
        nextAvatars.add(island.rewardAvatarId);
      }

      if (island.rewardThemeId) {
        if (!nextThemes.has(island.rewardThemeId) || !wasBossAlreadyDefeated) {
          unlockedTheme = ADVENTURE_THEMES.find((th) => th.id === island.rewardThemeId);
        }
        nextThemes.add(island.rewardThemeId);
      }
    }
  }

  if (accuracy === 100 && !isScaffoldedPractice) {
    if (!nextTrophies.has('trophy_precision_100')) {
      unlockedTrophy =
        unlockedTrophy || ADVENTURE_TROPHIES.find((t) => t.id === 'trophy_precision_100');
    }
    nextTrophies.add('trophy_precision_100');
  }

  if (nextConsecutiveHigh >= 3 && !isScaffoldedPractice) {
    if (!nextTrophies.has('trophy_consistency_streak')) {
      unlockedTrophy =
        unlockedTrophy || ADVENTURE_TROPHIES.find((t) => t.id === 'trophy_consistency_streak');
    }
    nextTrophies.add('trophy_consistency_streak');
  }

  const recordIslandStats = !isDailyChallenge && !isScaffoldedPractice;

  const nextBestAccuracy = {
    ...currentState.missionBestAccuracy,
    ...(recordIslandStats
      ? { [mission.id]: Math.max(prevBestAccuracy, accuracy) }
      : {})
  };

  const nextStarsMap = {
    ...currentState.missionStars,
    ...(recordIslandStats
      ? { [mission.id]: Math.max(prevStars, stars) }
      : {})
  };

  const nextAttemptsMap = {
    ...currentState.missionAttemptsCount,
    ...(recordIslandStats
      ? { [mission.id]: prevAttempts + 1 }
      : {})
  };

  const totalStars = Object.values(nextStarsMap).reduce((sum, s) => sum + (Number(s) || 0), 0);

  const nextState: EnglishAdventureState = {
    unlockedIslandIds: ISLAND_SEQUENCE.filter((id) => nextUnlockedIslands.has(id)),
    completedMissionIds: Array.from(nextCompletedMissions),
    bossDefeatedIslandIds: ISLAND_SEQUENCE.filter((id) => nextBossDefeated.has(id)),
    missionBestAccuracy: nextBestAccuracy,
    missionStars: nextStarsMap,
    missionAttemptsCount: nextAttemptsMap,
    claimedRewardIds: Array.from(claimedSet).slice(-180),
    unlockedTrophyIds: Array.from(nextTrophies),
    unlockedAvatarIds: Array.from(nextAvatars),
    equippedAvatarId: currentState.equippedAvatarId || 'avatar_scholar_initiate',
    unlockedThemeIds: Array.from(nextThemes),
    unlockedCardIds: Array.from(nextCards),
    difficultyTierByIsland: isDailyChallenge
      ? currentState.difficultyTierByIsland
      : {
          ...currentState.difficultyTierByIsland,
          [island.id]: nextTier
        },
    consecutiveHighAccuracyCount: nextConsecutiveHigh,
    totalStars,
    adventureXpEarned: (currentState.adventureXpEarned || 0) + totalXpAwarded,
    adventureCoinsEarned: (currentState.adventureCoinsEarned || 0) + totalCoinsAwarded,
    completedDailyChallengeIds: Array.from(existingDailyIds).slice(-60),
    activeXpBoost: nextActiveXpBoost,
    updatedAt: nowIso
  };

  saveEnglishAdventureState(nextState);

  if (totalCoinsAwarded > 0) {
    creditAdventureCoins(
      totalCoinsAwarded,
      isDailyChallenge && dailyChallenge
        ? `Défi Quotidien Adventure · ${dailyChallenge.skillPairLabelFr}`
        : `English Adventure · ${island.name} (${mission.title})`
    );
  }

  await updateUserProfile({ englishAdventure: nextState });

  await recordAttempt(
    {
      moduleId: isDailyChallenge && dailyChallenge
        ? dailyChallenge.id
        : isScaffoldedPractice
        ? `adv_practice_${island.id}`
        : `adv_${mission.id}`,
      moduleType: isDailyChallenge ? 'daily_challenge' : 'adventure',
      title: isDailyChallenge && dailyChallenge
        ? `Défi Quotidien Adventure · ${dailyChallenge.skillPairLabelFr} (${dailyChallenge.cefrLevel})`
        : `English Adventure · ${island.name} — ${mission.title}`,
      level: cefrLevel || mission.cefrLevel,
      score: accuracy,
      durationSeconds: Math.max(15, Math.round(durationSeconds || 60)),
      details: {
        islandId: isDailyChallenge ? 'daily_challenge' : island.id,
        missionKind: isDailyChallenge ? 'daily_dual_skill' : mission.kind,
        skills: dailyChallenge?.skills,
        stars,
        xpAwarded: totalXpAwarded,
        coinsAwarded: totalCoinsAwarded,
        xpMultiplierApplied,
        xpMultiplierBonus,
        adaptiveTier: nextTier
      }
    },
    { skipXpIncrement: true }
  );

  return {
    state: nextState,
    accuracy,
    passed,
    stars,
    xpAwarded: totalXpAwarded,
    coinsAwarded: totalCoinsAwarded,
    previousBestAccuracy: prevBestAccuracy,
    improvedOverPrevious: accuracy > prevBestAccuracy && prevAttempts > 0,
    consistencyBonusAwarded,
    retentionBonusAwarded,
    nextTier,
    unlockedNextIsland,
    unlockedTrophy,
    unlockedCard,
    unlockedAvatar,
    unlockedTheme,
    newlyClaimedLabels,
    isDuplicateReplay: passed && totalXpAwarded === 0 && totalCoinsAwarded === 0 && !activatedXpBoost,
    xpMultiplierApplied,
    xpMultiplierBonus,
    activatedXpBoost
  };
}
