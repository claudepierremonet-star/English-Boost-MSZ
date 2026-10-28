/**
 * Utilitaire de gestion des niveaux et calculs d'expérience (100 pts par niveau, Niveaux 1 à 99)
 */

export const POINTS_PER_LEVEL = 100;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 99;
export const WIN_POINTS_DELTA = 10;
export const LOSS_POINTS_DELTA = -5;

export type DifficultyTierName = 'Débutant' | 'Intermédiaire' | 'Professionnel' | 'Pro' | 'Expert';

export interface LevelProgressInfo {
  level: number;
  totalXp: number;
  pointsInCurrentLevel: number;
  currentLevelMinPoints: number;
  nextLevelTargetPoints: number;
  progressPercent: number;
  pointsToNextLevel: number;
  tier: DifficultyTierName;
}

/**
 * Calcule le niveau du joueur en fonction de son total de points / XP.
 * Règle : 100 points par niveau (Niveau 1: 0-99 pts, Niveau 2: 100-199 pts... Niveau 99 max).
 * 
 * @param totalXp Total des points / XP cumulés (≥ 0)
 * @returns Le niveau calculé compris entre 1 et 99
 */
export function calculateLevel(totalXp: number): number {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const calculated = Math.floor(safeXp / POINTS_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, calculated));
}

/**
 * Fournit le détail complet de la progression dans le niveau en cours.
 */
export function getLevelProgress(totalXp: number): LevelProgressInfo {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const level = calculateLevel(safeXp);
  const currentLevelMinPoints = (level - 1) * POINTS_PER_LEVEL;
  const nextLevelTargetPoints = level * POINTS_PER_LEVEL;
  const pointsInCurrentLevel = safeXp - currentLevelMinPoints;
  const progressPercent = level >= MAX_LEVEL ? 100 : Math.min(100, Math.max(0, pointsInCurrentLevel));
  const pointsToNextLevel = level >= MAX_LEVEL ? 0 : Math.max(0, nextLevelTargetPoints - safeXp);

  let tier: DifficultyTierName = 'Débutant';
  if (level >= 51) tier = 'Expert';
  else if (level >= 31) tier = 'Pro';
  else if (level >= 21) tier = 'Professionnel';
  else if (level >= 11) tier = 'Intermédiaire';

  return {
    level,
    totalXp: safeXp,
    pointsInCurrentLevel,
    currentLevelMinPoints,
    nextLevelTargetPoints,
    progressPercent,
    pointsToNextLevel,
    tier
  };
}

/**
 * Calcule le nouveau total d'XP après un gain (+10 pts) ou une perte (-5 pts).
 * Le total d'XP ne peut jamais être négatif (plafonné à 0 au minimum).
 */
export function applyChallengePointsDelta(
  currentXp: number,
  isSuccess: boolean | number
): {
  delta: number;
  newTotalXp: number;
  oldLevel: number;
  newLevel: number;
  isLevelUp: boolean;
} {
  const safeCurrent = Math.max(0, Number(currentXp) || 0);
  let delta = 0;

  if (typeof isSuccess === 'boolean') {
    delta = isSuccess ? WIN_POINTS_DELTA : LOSS_POINTS_DELTA;
  } else if (typeof isSuccess === 'number') {
    if (isSuccess > 0) {
      delta = isSuccess === 10 ? 10 : WIN_POINTS_DELTA;
    } else if (isSuccess <= 0) {
      delta = LOSS_POINTS_DELTA;
    }
  } else {
    delta = WIN_POINTS_DELTA;
  }

  const newTotalXp = Math.max(0, safeCurrent + delta);
  const oldLevel = calculateLevel(safeCurrent);
  const newLevel = calculateLevel(newTotalXp);

  return {
    delta,
    newTotalXp,
    oldLevel,
    newLevel,
    isLevelUp: newLevel > oldLevel
  };
}
