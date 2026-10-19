export type CEFRLevel = 'B1' | 'B2' | 'C1' | 'C2';

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

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  level: CEFRLevel;
  heroImageURL: string;
  stats: UserStats;
  isAnonymous?: boolean;
}

export interface LearningAttempt {
  attemptId: string;
  moduleId: string;
  moduleType: 'dictation' | 'flashcard' | 'quiz' | 'speaking' | 'daily_challenge';
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
