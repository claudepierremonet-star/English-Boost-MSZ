import type {
  AdaptiveLearningProfile,
  CEFRLevel,
  CityMapProgressionState,
  FlashcardProgress,
  LearningAttempt,
  SchoolGrade,
  SkillEvaluation,
  SkillKey,
  UserProfile
} from '../firebase/types';
import {
  ALL_200_LESSONS,
  FLASHCARD_ITEMS,
  type SchoolLesson
} from '../data/curriculum';

export interface GradeMetaInfo {
  id: SchoolGrade;
  label: string;
  shortLabel: string;
  cycle: 'Collège' | 'Lycée';
  targetCefr: CEFRLevel;
  cefrBand: CEFRLevel[];
  focusSummary: string;
}

export const SCHOOL_GRADES_META: GradeMetaInfo[] = [
  {
    id: '6e',
    label: '6e — Cycle 3',
    shortLabel: '6e',
    cycle: 'Collège',
    targetCefr: 'A1',
    cefrBand: ['A1', 'A2'],
    focusSummary: 'Bases essentielles, présent simple, vie quotidienne et phonétique initiale.'
  },
  {
    id: '5e',
    label: '5e — Cycle 4',
    shortLabel: '5e',
    cycle: 'Collège',
    targetCefr: 'A1',
    cefrBand: ['A1', 'A2'],
    focusSummary: 'Récits au prétérit, comparatifs, loisirs et dialogues pratiques.'
  },
  {
    id: '4e',
    label: '4e — Cycle 4',
    shortLabel: '4e',
    cycle: 'Collège',
    targetCefr: 'A2',
    cefrBand: ['A2', 'B1'],
    focusSummary: 'Present perfect, modaux de capacité/conseil et compréhension culturelle.'
  },
  {
    id: '3e',
    label: '3e — Brevet',
    shortLabel: '3e',
    cycle: 'Collège',
    targetCefr: 'A2',
    cefrBand: ['A2', 'B1'],
    focusSummary: 'Consolidation collège, voix passive, argumentation courte et fluidité orale.'
  },
  {
    id: '2nde',
    label: 'Seconde — Lycée',
    shortLabel: '2nde',
    cycle: 'Lycée',
    targetCefr: 'B1',
    cefrBand: ['B1', 'B2'],
    focusSummary: 'Transition lycée, axes culturels, conditionnels et analyse de documents.'
  },
  {
    id: '1re',
    label: 'Première — E3C/Bac',
    shortLabel: '1re',
    cycle: 'Lycée',
    targetCefr: 'B2',
    cefrBand: ['B1', 'B2', 'C1'],
    focusSummary: 'Expression structurée, nuance lexicale, presse internationale et débat.'
  },
  {
    id: 'terminale',
    label: 'Terminale — Bac/LLCE',
    shortLabel: 'Tle',
    cycle: 'Lycée',
    targetCefr: 'B2',
    cefrBand: ['B2', 'C1', 'C2'],
    focusSummary: 'Maîtrise académique, rhétorique diplomatique, synthèse et aisance orale.'
  }
];

export const ALL_SKILL_KEYS: SkillKey[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'writing',
  'speaking',
  'pronunciation'
];

export interface SkillMetaInfo {
  key: SkillKey;
  labelFr: string;
  labelEn: string;
  icon: string;
  recommendedModuleLabel: string;
  recommendedAction:
    | 'flashcards'
    | 'grammar_battle'
    | 'listening_cinema'
    | 'escape_room'
    | 'tutor'
    | 'speaking'
    | 'dialogues';
}

export const SKILL_META: Record<SkillKey, SkillMetaInfo> = {
  vocabulary: {
    key: 'vocabulary',
    labelFr: 'Vocabulaire',
    labelEn: 'Vocabulary',
    icon: 'style',
    recommendedModuleLabel: 'Répétition Espacée SM-2',
    recommendedAction: 'flashcards'
  },
  grammar: {
    key: 'grammar',
    labelFr: 'Grammaire',
    labelEn: 'Grammar',
    icon: 'gavel',
    recommendedModuleLabel: 'Grammar Battle',
    recommendedAction: 'grammar_battle'
  },
  listening: {
    key: 'listening',
    labelFr: 'Compréhension Orale',
    labelEn: 'Listening',
    icon: 'movie',
    recommendedModuleLabel: 'Listening Cinema',
    recommendedAction: 'listening_cinema'
  },
  reading: {
    key: 'reading',
    labelFr: 'Compréhension Écrite',
    labelEn: 'Reading',
    icon: 'lock_open',
    recommendedModuleLabel: 'English Escape Room',
    recommendedAction: 'escape_room'
  },
  writing: {
    key: 'writing',
    labelFr: 'Expression Écrite',
    labelEn: 'Writing',
    icon: 'edit_note',
    recommendedModuleLabel: 'Atelier d’Écriture IA',
    recommendedAction: 'tutor'
  },
  speaking: {
    key: 'speaking',
    labelFr: 'Fluidité Orale',
    labelEn: 'Speaking',
    icon: 'forum',
    recommendedModuleLabel: 'Simulateur de Conversations',
    recommendedAction: 'dialogues'
  },
  pronunciation: {
    key: 'pronunciation',
    labelFr: 'Prononciation',
    labelEn: 'Pronunciation',
    icon: 'mic',
    recommendedModuleLabel: 'Studio d’Élocution UK/US',
    recommendedAction: 'speaking'
  }
};

export function inferGradeFromCefr(level: CEFRLevel): SchoolGrade {
  switch (level) {
    case 'A1':
      return '6e';
    case 'A2':
      return '4e';
    case 'B1':
      return '2nde';
    case 'B2':
      return '1re';
    case 'C1':
    case 'C2':
      return 'terminale';
    default:
      return '2nde';
  }
}

export function getGradeMeta(grade?: SchoolGrade): GradeMetaInfo {
  const found = SCHOOL_GRADES_META.find((g) => g.id === grade);
  return found || SCHOOL_GRADES_META[4]; // 2nde default
}

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function getLocalCompletedLessonIds(): string[] {
  try {
    const raw = localStorage.getItem('eb_msz_completed_lessons_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function markLessonCompletedLocally(lessonId: string): string[] {
  const current = getLocalCompletedLessonIds();
  if (current.includes(lessonId)) return current;
  const next = [...current, lessonId].slice(-250);
  try {
    localStorage.setItem('eb_msz_completed_lessons_v1', JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function computeDueVocabularyCount(flashcards: FlashcardProgress[]): number {
  const nowMs = Date.now();
  const dueRecorded = flashcards.filter((c) => {
    if (!c.nextReviewDate) return true;
    const ms = Date.parse(c.nextReviewDate);
    return Number.isNaN(ms) || ms <= nowMs;
  }).length;

  // Baseline unseen priority deck cards if learner has reviewed few flashcards yet
  const reviewedCount = flashcards.length;
  const starterQueue = reviewedCount < 15 ? Math.max(4, 12 - reviewedCount) : 0;
  return dueRecorded + starterQueue;
}

function getDueVocabIdsSet(flashcards: FlashcardProgress[]): Set<string> {
  const nowMs = Date.now();
  const dueIds = new Set<string>();
  for (const card of flashcards) {
    const ms = card.nextReviewDate ? Date.parse(card.nextReviewDate) : 0;
    if (!card.nextReviewDate || Number.isNaN(ms) || ms <= nowMs) {
      dueIds.add(card.cardId);
    }
  }
  return dueIds;
}

export function getUpcomingReviewWords(
  flashcards: FlashcardProgress[],
  cefrLevel: CEFRLevel,
  limit: number = 5
): Array<{ id: string; term: string; phonetic: string; frenchDef: string; status: 'due' | 'new' }> {
  const dueIds = getDueVocabIdsSet(flashcards);
  const dueItems = FLASHCARD_ITEMS.filter((f) => dueIds.has(f.id)).slice(0, limit);

  const results: Array<{ id: string; term: string; phonetic: string; frenchDef: string; status: 'due' | 'new' }> =
    dueItems.map((f) => ({
      id: f.id,
      term: f.term,
      phonetic: f.phonetic,
      frenchDef: f.frenchDef,
      status: 'due'
    }));

  if (results.length < limit) {
    const reviewedSet = new Set(flashcards.map((c) => c.cardId));
    const levelCandidates = FLASHCARD_ITEMS.filter(
      (f) => !reviewedSet.has(f.id) && (f.level === cefrLevel || CEFR_ORDER.indexOf(f.level) <= CEFR_ORDER.indexOf(cefrLevel) + 1)
    );
    const pool = levelCandidates.length > 0 ? levelCandidates : FLASHCARD_ITEMS.filter((f) => !reviewedSet.has(f.id));
    for (const item of pool) {
      if (results.length >= limit) break;
      results.push({
        id: item.id,
        term: item.term,
        phonetic: item.phonetic,
        frenchDef: item.frenchDef,
        status: 'new'
      });
    }
  }

  return results;
}

function scoreFromAttempts(
  attempts: LearningAttempt[],
  matchingTypes: LearningAttempt['moduleType'][],
  fallbackScore: number
): { score: number; count: number; lastPracticedAt?: string } {
  const filtered = attempts.filter((a) => matchingTypes.includes(a.moduleType));
  if (filtered.length === 0) {
    return { score: fallbackScore, count: 0 };
  }
  const recent = filtered.slice(0, 12);
  const weightedSum = recent.reduce((acc, item, idx) => {
    const weight = recent.length - idx;
    return acc + Math.max(0, Math.min(100, item.score || 0)) * weight;
  }, 0);
  const totalWeight = recent.reduce((acc, _item, idx) => acc + (recent.length - idx), 0);
  const avg = Math.round(weightedSum / Math.max(1, totalWeight));
  return {
    score: avg,
    count: filtered.length,
    lastPracticedAt: filtered[0]?.completedAt
  };
}

export interface AdaptiveAssessmentResult {
  profile: AdaptiveLearningProfile;
  gradeMeta: GradeMetaInfo;
  recommendedLessons: SchoolLesson[];
  primaryFocusSkill: SkillMetaInfo;
  dueVocabularyCount: number;
  upcomingWords: Array<{ id: string; term: string; phonetic: string; frenchDef: string; status: 'due' | 'new' }>;
}

/**
 * Centralized 7-Skill Adaptive Learning Engine
 * Evaluates Vocabulary, Grammar, Listening, Reading, Writing, Speaking & Pronunciation
 * calibrated simultaneously by the student's French school grade (6e -> Terminale) and CEFR level (A1 -> C2).
 */
export function evaluateAdaptiveLearning(
  user: UserProfile,
  attempts: LearningAttempt[] = [],
  flashcards: FlashcardProgress[] = [],
  cityProgression?: CityMapProgressionState
): AdaptiveAssessmentResult {
  const schoolGrade: SchoolGrade = user.schoolGrade || inferGradeFromCefr(user.level || 'B1');
  const gradeMeta = getGradeMeta(schoolGrade);
  const cefrIdx = Math.max(0, CEFR_ORDER.indexOf(user.level || gradeMeta.targetCefr));
  const baseline = Math.min(82, Math.max(46, Math.round((user.stats?.masteryPercentage || 58) * 0.72 + cefrIdx * 4)));

  // 1. Vocabulary score blends SM-2 retention + flashcard attempts
  const vocabAtt = scoreFromAttempts(attempts, ['flashcard', 'daily_challenge', 'arcade'], baseline);
  const masteredCards = flashcards.filter((c) => c.state === 'mastered' || c.repetitions >= 3).length;
  const sm2Bonus = Math.min(18, masteredCards * 2 + Math.min(8, flashcards.length));
  const vocabScore = Math.min(100, Math.round(vocabAtt.score * 0.75 + (baseline + sm2Bonus) * 0.25));

  // 2. Grammar score blends quiz, grammar drills, Grammar Battle, and city map
  const grammarAtt = scoreFromAttempts(attempts, ['grammar', 'grammar_battle', 'quiz'], Math.max(42, baseline - 2));
  const cityLevelsBonus = Math.min(12, (cityProgression?.conqueredLevels?.length || 0) * 2);
  const grammarScore = Math.min(100, grammarAtt.count > 0 ? Math.round(grammarAtt.score * 0.85 + Math.min(100, baseline + cityLevelsBonus) * 0.15) : Math.min(95, baseline - 2 + cityLevelsBonus));

  // 3. Listening score blends Dictation, Listening Cinema, and Dialogues
  const listeningAtt = scoreFromAttempts(attempts, ['listening_cinema', 'dictation', 'dialogue'], Math.max(40, baseline - 4));

  // 4. Reading score blends Escape Room, Reading lessons, and Completed Curriculum Modules
  const readingAtt = scoreFromAttempts(attempts, ['reading', 'escape_room', 'daily_challenge'], Math.max(44, baseline));
  const completedLessons = getLocalCompletedLessonIds();
  const curriculumBonus = Math.min(14, (completedLessons.length + (user.stats?.completedModules || 0)) * 0.6);
  const readingScore = Math.min(100, readingAtt.count > 0 ? readingAtt.score : Math.round(readingAtt.score + curriculumBonus * 0.4));

  // 5. Writing score blends AI Tutor Writing evaluator, Dictation precision, and Writing drills
  const writingAtt = scoreFromAttempts(attempts, ['writing', 'dictation', 'tutor'], Math.max(38, baseline - 6));

  // 6. Speaking Fluency blends Speaking Studio, Real-Life Conversation Simulator, and AI Tutor roleplay
  const speakingAtt = scoreFromAttempts(attempts, ['speaking', 'dialogue', 'tutor'], Math.max(39, baseline - 5));

  // 7. Pronunciation score looks specifically at phonetic/accent scores if present, or speaking trials
  const pronunciationScores = attempts
    .filter((a) => a.moduleType === 'speaking')
    .map((a) => {
      const phoneticScore = typeof a.details?.phoneticScore === 'number' ? a.details.phoneticScore : a.score;
      return Math.max(0, Math.min(100, phoneticScore));
    });
  const pronScore =
    pronunciationScores.length > 0
      ? Math.round(pronunciationScores.slice(0, 10).reduce((s, n) => s + n, 0) / Math.min(10, pronunciationScores.length))
      : Math.max(40, baseline - 5);

  const buildEval = (
    skill: SkillKey,
    score: number,
    count: number,
    lastPracticedAt?: string
  ): SkillEvaluation => {
    const trend: SkillEvaluation['trend'] =
      score >= 78 ? 'up' : score < 62 || count === 0 ? 'needs_focus' : 'stable';
    return {
      skill,
      score: Math.max(15, Math.min(100, score)),
      attemptsCount: count,
      lastPracticedAt,
      trend
    };
  };

  const skills: Record<SkillKey, SkillEvaluation> = {
    vocabulary: buildEval('vocabulary', vocabScore, vocabAtt.count + flashcards.length, vocabAtt.lastPracticedAt),
    grammar: buildEval('grammar', grammarScore, grammarAtt.count, grammarAtt.lastPracticedAt),
    listening: buildEval('listening', listeningAtt.score, listeningAtt.count, listeningAtt.lastPracticedAt),
    reading: buildEval('reading', readingScore, readingAtt.count + completedLessons.length, readingAtt.lastPracticedAt),
    writing: buildEval('writing', writingAtt.score, writingAtt.count, writingAtt.lastPracticedAt),
    speaking: buildEval('speaking', speakingAtt.score, speakingAtt.count, speakingAtt.lastPracticedAt),
    pronunciation: buildEval('pronunciation', pronScore, pronunciationScores.length, speakingAtt.lastPracticedAt)
  };

  const sortedByWeakest = [...ALL_SKILL_KEYS].sort((a, b) => {
    const diff = skills[a].score - skills[b].score;
    if (diff !== 0) return diff;
    return skills[a].attemptsCount - skills[b].attemptsCount;
  });

  const weakestSkills = sortedByWeakest.slice(0, 2);
  const strongestSkills = [...sortedByWeakest].reverse().slice(0, 2);

  const overallReadiness = Math.round(
    ALL_SKILL_KEYS.reduce((sum, key) => sum + skills[key].score, 0) / ALL_SKILL_KEYS.length
  );

  // Calibrate effective CEFR proficiency based on grade target + readiness
  let assessedCefrLevel: CEFRLevel = user.level || gradeMeta.targetCefr;
  if (attempts.length >= 4) {
    if (overallReadiness >= 90 && cefrIdx < CEFR_ORDER.length - 1) {
      assessedCefrLevel = CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, cefrIdx + 1)];
    } else if (overallReadiness < 45 && cefrIdx > 0) {
      assessedCefrLevel = CEFR_ORDER[Math.max(0, cefrIdx - 1)];
    }
  }

  // Recommend personalized lessons from the 200-lesson curriculum
  const completedSet = new Set(completedLessons);
  const gradeLessons = ALL_200_LESSONS.filter((l) => l.class_level === schoolGrade);
  const levelMatched = gradeLessons.filter((l) => !completedSet.has(l.id));
  const pool = levelMatched.length >= 4 ? levelMatched : gradeLessons.length >= 4 ? gradeLessons : ALL_200_LESSONS;

  // Rank lessons prioritizing CEFR alignment & weak skills keywords
  const primaryWeak = weakestSkills[0];
  const scoredPool = pool.map((lesson) => {
    let relevance = 0;
    if (lesson.cefr_level?.toUpperCase() === user.level) relevance += 5;
    if (lesson.cefr_level?.toUpperCase() === gradeMeta.targetCefr) relevance += 3;
    if (!completedSet.has(lesson.id)) relevance += 4;
    const textBlob = `${lesson.grammar?.rule || ''} ${lesson.grammar?.title || ''} ${lesson.theme_label} ${lesson.title}`.toLowerCase();
    if (primaryWeak === 'grammar' && (lesson.grammar?.rule || textBlob.includes('tense') || textBlob.includes('modal'))) relevance += 3;
    if (primaryWeak === 'listening' && (lesson.dialogue?.lines?.length ?? 0) > 0) relevance += 3;
    if (primaryWeak === 'vocabulary' && lesson.vocabulary?.length > 0) relevance += 3;
    return { lesson, relevance };
  });
  scoredPool.sort((a, b) => b.relevance - a.relevance);
  const recommendedLessons = scoredPool.slice(0, 4).map((x) => x.lesson);

  const dueVocabularyCount = computeDueVocabularyCount(flashcards);
  const upcomingWords = getUpcomingReviewWords(flashcards, user.level || gradeMeta.targetCefr, 5);

  const profile: AdaptiveLearningProfile = {
    schoolGrade,
    assessedCefrLevel,
    overallReadiness,
    skills,
    weakestSkills,
    strongestSkills,
    recommendedLessonIds: recommendedLessons.map((l) => l.id),
    dueVocabularyCount,
    updatedAt: new Date().toISOString()
  };

  return {
    profile,
    gradeMeta,
    recommendedLessons,
    primaryFocusSkill: SKILL_META[weakestSkills[0]],
    dueVocabularyCount,
    upcomingWords
  };
}
