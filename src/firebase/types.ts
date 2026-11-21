export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SchoolGrade = '6e' | '5e' | '4e' | '3e' | '2nde' | '1re' | 'terminale';

export type SkillKey =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'pronunciation';

export interface SkillEvaluation {
  skill: SkillKey;
  score: number; // 0..100
  attemptsCount: number;
  lastPracticedAt?: string;
  trend: 'up' | 'stable' | 'needs_focus';
}

export interface AdaptiveLearningProfile {
  schoolGrade: SchoolGrade;
  assessedCefrLevel: CEFRLevel;
  overallReadiness: number; // 0..100
  skills: Record<SkillKey, SkillEvaluation>;
  weakestSkills: SkillKey[];
  strongestSkills: SkillKey[];
  recommendedLessonIds: string[];
  dueVocabularyCount: number;
  updatedAt: string;
}

export type DailyMissionCategory =
  | 'vocabulary'
  | 'listening'
  | 'grammar'
  | 'speaking'
  | 'reading'
  | 'tutor';

export interface DailyMissionItem {
  id: string;
  category: DailyMissionCategory;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  coinsReward: number;
  completed: boolean;
  claimed: boolean;
  actionTarget:
    | 'flashcards'
    | 'listening_cinema'
    | 'grammar_battle'
    | 'escape_room'
    | 'speaking'
    | 'tutor'
    | 'dialogues';
}

export interface DailyMissionsState {
  dateKey: string;
  missions: DailyMissionItem[];
  streakProtected: boolean;
  updatedAt: string;
}

export interface TutorSavedNote {
  id: string;
  title: string;
  category: 'tutor_tip' | 'writing_feedback' | 'drill';
  contentEn: string;
  explanationFr: string;
  cefrLevel: CEFRLevel;
  schoolGrade: SchoolGrade;
  createdAt: string;
}

export type TutorConversationMode =
  | 'free_conversation'
  | 'school_english'
  | 'everyday_english'
  | 'travel_english'
  | 'restaurant_english'
  | 'job_interview'
  | 'debate_argumentation'
  | 'exam_preparation'
  | 'storytelling';

export type TutorMistakeCategory =
  | 'grammar'
  | 'vocabulary'
  | 'structure'
  | 'unnatural'
  | 'pronunciation';

export interface TutorCorrectionItem {
  category: TutorMistakeCategory;
  original: string;
  corrected: string;
  explanation: string;
  explanationFr?: string;
  additionalExample: string;
}

export interface TutorWeaknessRecord {
  id: string;
  category: TutorMistakeCategory;
  patternKey: string;
  originalSample: string;
  correctedForm: string;
  ruleSummary: string;
  additionalExample: string;
  occurrences: number;
  lastSeenAt: string;
}

export interface TutorSessionSummary {
  sessionId: string;
  mode: TutorConversationMode;
  modeLabel: string;
  schoolGrade: SchoolGrade;
  cefrLevel: CEFRLevel;
  turnsCount: number;
  mistakesCount: number;
  fluencyScore: number;
  strengths: string[];
  weaknessesIdentified: Array<{
    category: TutorMistakeCategory;
    label: string;
    tip: string;
  }>;
  recommendedFocus: string;
  encouragementEn: string;
  summaryFr: string;
  nextPracticePrompt: string;
  xpEarned: number;
  durationSeconds: number;
  completedAt: string;
}

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

export interface CityMapProgressionState {
  unlockedLevel: number; // 1..600 — unlocks N+1 only when all 10 chapters of N are completed
  completedChaptersByLevel: Record<string, number[]>; // key: String(levelNumber), value: completed chapter indices [1..10]
  conqueredLevels: number[]; // list of conquered level numbers [1..600]
  chapterBestScores?: Record<string, number>; // key: "${level}-${chapter}", value: best percentage 0..100
  chapterStars?: Record<string, number>; // key: "${level}-${chapter}", value: 1..3 stars
  totalStars: number;
  lastPlayedLevel?: number;
  seenQuestionHashes?: string[]; // bounded latest 2500 compact question hashes for cross-device anti-repetition
  seenAnswerHashes?: string[]; // bounded latest 2500 compact answer hashes for cross-device anti-repetition
  updatedAt: string;
}

export type ChartAnnotationCategory = 'milestone' | 'exam' | 'streak' | 'note';

export interface ProgressChartAnnotation {
  id: string;
  granularity: 'weekly' | 'daily';
  pointKey: string;
  pointLabel: string;
  text: string;
  category: ChartAnnotationCategory;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  level: CEFRLevel;
  schoolGrade?: SchoolGrade;
  heroImageURL: string;
  stats: UserStats;
  isAnonymous?: boolean;
  unlockedBadgeIds?: string[];
  arcadeProgression?: ArcadeProgressionState;
  cityMapProgression?: CityMapProgressionState;
  mszCoinsBalance?: number;
  ownedCardInstances?: Array<{
    characterId: string;
    editionNumber: number;
    maxSupply: number;
    serialCode: string;
    obtainedAt: string;
    obtainedPrice: number;
  }>;
  equippedCharacterId?: string;
  favoriteLessonIds?: string[];
  chartAnnotations?: ProgressChartAnnotation[];
  adaptiveProfile?: AdaptiveLearningProfile;
  dailyMissions?: DailyMissionsState;
  tutorSavedNotes?: TutorSavedNote[];
  tutorWeaknesses?: TutorWeaknessRecord[];
}

export type AttemptModuleType =
  | 'dictation'
  | 'flashcard'
  | 'quiz'
  | 'speaking'
  | 'daily_challenge'
  | 'grammar'
  | 'reading'
  | 'writing'
  | 'escape_room'
  | 'listening_cinema'
  | 'grammar_battle'
  | 'tutor'
  | 'dialogue'
  | 'city_map'
  | 'arcade';

export interface LearningAttempt {
  attemptId: string;
  moduleId: string;
  moduleType: AttemptModuleType;
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
