export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserStats {
  streakDays: number;
  totalXp: number;
  weeklyXp: number;
  completedModules: number;
  totalModules: number;
  masteryPercentage: number;
  studyMinutesToday: number;
  studyMinutesTarget: number;
  totalImmersionMinutes: number;
  lastActiveDate: string;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'oxford';
export type BadgeCategory = 'xp' | 'streak' | 'lessons' | 'dictation' | 'quiz' | 'mastery' | 'distinction';

export interface AcademicBadge {
  id: string;
  title: string;
  latinTitle: string;
  tier: BadgeTier;
  category: BadgeCategory;
  description: string;
  icon: string;
  requirementLabel: string;
  requiredTarget: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface ArcadeProgressionState {
  points: number;
  level: number;
  unlockedMaxGameNumber: number;
  completedGames: string[];
  activeSession?: {
    gameId: string;
    levelKey?: string;
    questionIndex: number;
    scoreAccumulated: number;
    hearts: number;
    timestamp: string;
  } | null;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  level: CEFRLevel;
  heroImageURL: string;
  stats: UserStats;
  isAnonymous?: boolean;
  unlockedBadgeIds?: string[];
  arcadeProgression?: ArcadeProgressionState;
}

export interface LearningAttempt {
  attemptId: string;
  moduleId: string;
  moduleType: 'dictation' | 'flashcard' | 'quiz' | 'speaking' | 'daily_challenge' | 'grammar';
  title: string;
  level: CEFRLevel;
  score: number;
  durationSeconds: number;
  completedAt: string;
  details?: Record<string, unknown>;
}

export interface FlashcardProgress {
  cardId: string;
  term: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  lastQualityScore: number;
  state: 'learning' | 'review' | 'mastered';
}

export interface DailyChallengeState {
  date: string;
  challengeId: string;
  completed: boolean;
  score?: number;
  xpEarned?: number;
}

export type LeagueTier = 'Oxford Fellow' | 'Ligue Diamant' | 'Ligue Émeraude' | 'Ligue Saphir' | 'Ligue Améthyste';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  level: CEFRLevel;
  weeklyXp: number;
  totalXp: number;
  streakDays: number;
  rank: number;
  isCurrentUser: boolean;
  league: LeagueTier;
  change?: 'up' | 'down' | 'same';
  cheerCount?: number;
  badgeLabel?: string;
}

