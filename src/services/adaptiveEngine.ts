import type {
  AdaptiveLearningProfile,
  AgeRangeKey,
  CEFRLevel,
  CityMapProgressionState,
  DynamicAdaptationMode,
  FlashcardProgress,
  LearningAttempt,
  LearningObjectiveId,
  LearningSpeedLevel,
  PlacementTestResult,
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
import type { DialogueLevelId } from '../data/atelierDialoguesTypes';
import { getErrorJournal } from '../utils/errorJournal';

export interface GradeMetaInfo {
  id: SchoolGrade;
  label: string;
  shortLabel: string;
  cycle: 'Collège' | 'Lycée';
  targetCefr: CEFRLevel;
  cefrBand: CEFRLevel[];
  focusSummary: string;
  defaultAgeRange: AgeRangeKey;
}

export const SCHOOL_GRADES_META: GradeMetaInfo[] = [
  {
    id: '6e',
    label: '6e — Cycle 3',
    shortLabel: '6e',
    cycle: 'Collège',
    targetCefr: 'A1',
    cefrBand: ['A1', 'A2'],
    focusSummary: 'Bases essentielles, présent simple, vie quotidienne et phonétique initiale.',
    defaultAgeRange: '11-12'
  },
  {
    id: '5e',
    label: '5e — Cycle 4',
    shortLabel: '5e',
    cycle: 'Collège',
    targetCefr: 'A1',
    cefrBand: ['A1', 'A2'],
    focusSummary: 'Récits au prétérit, comparatifs, loisirs et dialogues pratiques.',
    defaultAgeRange: '11-12'
  },
  {
    id: '4e',
    label: '4e — Cycle 4',
    shortLabel: '4e',
    cycle: 'Collège',
    targetCefr: 'A2',
    cefrBand: ['A2', 'B1'],
    focusSummary: 'Present perfect, modaux de capacité/conseil et compréhension culturelle.',
    defaultAgeRange: '13-14'
  },
  {
    id: '3e',
    label: '3e — Brevet',
    shortLabel: '3e',
    cycle: 'Collège',
    targetCefr: 'A2',
    cefrBand: ['A2', 'B1'],
    focusSummary: 'Consolidation collège, voix passive, argumentation courte et fluidité orale.',
    defaultAgeRange: '13-14'
  },
  {
    id: '2nde',
    label: 'Seconde — Lycée',
    shortLabel: '2nde',
    cycle: 'Lycée',
    targetCefr: 'B1',
    cefrBand: ['B1', 'B2'],
    focusSummary: 'Transition lycée, axes culturels, conditionnels et analyse de documents.',
    defaultAgeRange: '15-16'
  },
  {
    id: '1re',
    label: 'Première — E3C/Bac',
    shortLabel: '1re',
    cycle: 'Lycée',
    targetCefr: 'B2',
    cefrBand: ['B1', 'B2', 'C1'],
    focusSummary: 'Expression structurée, nuance lexicale, presse internationale et débat.',
    defaultAgeRange: '15-16'
  },
  {
    id: 'terminale',
    label: 'Terminale — Bac/LLCE',
    shortLabel: 'Tle',
    cycle: 'Lycée',
    targetCefr: 'B2',
    cefrBand: ['B2', 'C1', 'C2'],
    focusSummary: 'Maîtrise académique, rhétorique diplomatique, synthèse et aisance orale.',
    defaultAgeRange: '17-18+'
  }
];

export const AGE_RANGES_META: Array<{ id: AgeRangeKey; label: string; bracket: string }> = [
  { id: '11-12', label: '11–12 ans', bracket: 'Collège (6e–5e)' },
  { id: '13-14', label: '13–14 ans', bracket: 'Collège (4e–3e)' },
  { id: '15-16', label: '15–16 ans', bracket: 'Lycée (2nde–1re)' },
  { id: '17-18+', label: '17–18+ ans', bracket: 'Terminale & Sup.' }
];

export const LEARNING_OBJECTIVES_META: Array<{
  id: LearningObjectiveId;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'school_excellence',
    label: 'Excellence Scolaire',
    icon: 'school',
    description: 'Maîtriser le programme officiel (6e–Tle) et augmenter la moyenne.'
  },
  {
    id: 'exam_prep',
    label: 'Brevet / Bac / Certifications',
    icon: 'workspace_premium',
    description: 'Réussir les épreuves écrites, orales et compréhensions d’examen.'
  },
  {
    id: 'oral_fluency',
    label: 'Aisance Orale & Accent',
    icon: 'record_voice_over',
    description: 'Parler avec fluidité et justesse phonétique UK / US.'
  },
  {
    id: 'vocabulary_mastery',
    label: 'Vocabulaire Durable (SM-2)',
    icon: 'style',
    description: 'Mémoriser durablement idiomes, collocations et lexique riche.'
  },
  {
    id: 'travel_culture',
    label: 'Voyages & Culture Monde',
    icon: 'flight_takeoff',
    description: 'Interagir à l’étranger et comprendre médias et récits authentiques.'
  },
  {
    id: 'everyday_confidence',
    label: 'Confiance au Quotidien',
    icon: 'forum',
    description: 'Oser s’exprimer sans blocage dans les conversations de tous les jours.'
  }
];

export const PREFERRED_DURATIONS: number[] = [10, 15, 20, 30, 45];

export const ALL_SKILL_KEYS: SkillKey[] = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'writing',
  'speaking',
  'pronunciation'
];

export const FOUR_MAJOR_SKILLS: Array<'listening' | 'speaking' | 'reading' | 'writing'> = [
  'listening',
  'speaking',
  'reading',
  'writing'
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
  ruleExplanationFr: string;
  examplesEn: string[];
  guidedTipFr: string;
}

export const SKILL_META: Record<SkillKey, SkillMetaInfo> = {
  vocabulary: {
    key: 'vocabulary',
    labelFr: 'Vocabulaire',
    labelEn: 'Vocabulary',
    icon: 'style',
    recommendedModuleLabel: 'Répétition Espacée SM-2',
    recommendedAction: 'flashcards',
    ruleExplanationFr:
      'Mémorisez toujours un mot avec sa collocation naturelle et son contexte (verbe + préposition) plutôt qu’isolé.',
    examplesEn: [
      'Make a decision (never *do a decision).',
      'She is keenly interested in renewable energy.'
    ],
    guidedTipFr: 'Activez le deck SM-2 par lots de 5 cartes en prononçant chaque exemple à voix haute.'
  },
  grammar: {
    key: 'grammar',
    labelFr: 'Grammaire',
    labelEn: 'Grammar',
    icon: 'gavel',
    recommendedModuleLabel: 'Grammar Battle',
    recommendedAction: 'grammar_battle',
    ruleExplanationFr:
      'Vérifiez toujours le repère temporel (since/for → Present Perfect ; yesterday/ago → Prétérit) et la concordance sujet-verbe.',
    examplesEn: [
      'I have studied English since 2022. (action toujours vraie)',
      'If she had known earlier, she would have helped.'
    ],
    guidedTipFr: 'Commencez par le mode Soutien du Quiz ou Grammar Battle pour décortiquer la règle avant d’accélérer.'
  },
  listening: {
    key: 'listening',
    labelFr: 'Compréhension Orale',
    labelEn: 'Listening',
    icon: 'movie',
    recommendedModuleLabel: 'Listening Cinema',
    recommendedAction: 'listening_cinema',
    ruleExplanationFr:
      'Repérez d’abord les mots accentués (noms, verbes d’action, négations) qui portent le sens malgré les liaisons rapides.',
    examplesEn: [
      '“Could you tell me where the station is?” (accent sur station)',
      '“I didn’t expect it to turn out so well.”'
    ],
    guidedTipFr: 'Écoutez une première fois à 0.85x avec sous-titres anglais, puis réécoutez sans sous-titres.'
  },
  reading: {
    key: 'reading',
    labelFr: 'Compréhension Écrite',
    labelEn: 'Reading',
    icon: 'lock_open',
    recommendedModuleLabel: 'English Escape Room',
    recommendedAction: 'escape_room',
    ruleExplanationFr:
      'Identifiez les connecteurs logiques (however, although, therefore) : ils annoncent l’intention réelle et la structure de l’auteur.',
    examplesEn: [
      'Although the data seemed promising, further tests revealed flaws.',
      'Consequently, the committee revised its strategy.'
    ],
    guidedTipFr: 'Surlignez les connecteurs d’opposition et reformulez chaque paragraphe en une phrase simple.'
  },
  writing: {
    key: 'writing',
    labelFr: 'Expression Écrite',
    labelEn: 'Writing',
    icon: 'edit_note',
    recommendedModuleLabel: 'Atelier d’Écriture IA',
    recommendedAction: 'tutor',
    ruleExplanationFr:
      'Structurez chaque paragraphe selon le schéma PEEL : Point (idée), Evidence (exemple), Explanation (lien), Link.',
    examplesEn: [
      'Firstly, digital tools boost autonomy. For instance, adaptive quizzes target weak spots.',
      'To put it briefly, balanced practice builds lasting fluency.'
    ],
    guidedTipFr: 'Rédigez d’abord 3 phrases courtes guidées avec le Tuteur IA avant d’ajouter des connecteurs.'
  },
  speaking: {
    key: 'speaking',
    labelFr: 'Fluidité Orale',
    labelEn: 'Speaking',
    icon: 'forum',
    recommendedModuleLabel: 'Simulateur de Conversations',
    recommendedAction: 'dialogues',
    ruleExplanationFr:
      'Utilisez des expressions relais (« Well, let me see… », « To be honest… ») pour garder la fluidité sans chercher vos mots en silence.',
    examplesEn: [
      'As far as I’m concerned, learning through dialogues feels much more natural.',
      'Could you clarify what you mean by that?'
    ],
    guidedTipFr: 'Répétez 3 répliques en Duo dans l’Atelier 500 Dialogues puis enregistrez votre réponse libre.'
  },
  pronunciation: {
    key: 'pronunciation',
    labelFr: 'Prononciation',
    labelEn: 'Pronunciation',
    icon: 'mic',
    recommendedModuleLabel: 'Studio d’Élocution UK/US',
    recommendedAction: 'speaking',
    ruleExplanationFr:
      'Distinguez les voyelles longues/courtes (/iː/ sheep vs /ɪ/ ship) et placez l’accent tonique sur la bonne syllabe.',
    examplesEn: [
      'PHOtograph / phoTOgraphy / photoGRAPHic (accent mobile)',
      'Think (/θɪŋk/, langue entre les dents) vs Sink (/sɪŋk/).'
    ],
    guidedTipFr: 'Comparez votre courbe sonore à celle du modèle natif dans le Studio d’Élocution.'
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

export function inferAgeRangeFromGrade(grade?: SchoolGrade): AgeRangeKey {
  const meta = getGradeMeta(grade);
  return meta.defaultAgeRange;
}

export function getGradeMeta(grade?: SchoolGrade): GradeMetaInfo {
  const found = SCHOOL_GRADES_META.find((g) => g.id === grade);
  return found || SCHOOL_GRADES_META[4]; // 2nde default
}

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function stepCefrLevel(level: CEFRLevel, delta: -1 | 0 | 1): CEFRLevel {
  const idx = Math.max(0, CEFR_ORDER.indexOf(level));
  const next = Math.max(0, Math.min(CEFR_ORDER.length - 1, idx + delta));
  return CEFR_ORDER[next];
}

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
      (f) =>
        !reviewedSet.has(f.id) &&
        (f.level === cefrLevel || CEFR_ORDER.indexOf(f.level) <= CEFR_ORDER.indexOf(cefrLevel) + 1)
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
): { score: number; count: number; lastPracticedAt?: string; avgDurationSec: number } {
  const filtered = attempts.filter((a) => matchingTypes.includes(a.moduleType));
  if (filtered.length === 0) {
    return { score: fallbackScore, count: 0, avgDurationSec: 0 };
  }
  const recent = filtered.slice(0, 12);
  const weightedSum = recent.reduce((acc, item, idx) => {
    const weight = recent.length - idx;
    return acc + Math.max(0, Math.min(100, item.score || 0)) * weight;
  }, 0);
  const totalWeight = recent.reduce((acc, _item, idx) => acc + (recent.length - idx), 0);
  const avg = Math.round(weightedSum / Math.max(1, totalWeight));
  const avgDurationSec = Math.round(
    recent.reduce((acc, item) => acc + Math.max(10, item.durationSeconds || 45), 0) / recent.length
  );
  return {
    score: avg,
    count: filtered.length,
    lastPracticedAt: filtered[0]?.completedAt,
    avgDurationSec
  };
}

export interface MultiSignalAssessment {
  compositeCefr: CEFRLevel;
  confidenceScore: number;
  signalsCount: number;
  signalSummaries: Array<{
    source: string;
    cefrEstimate: CEFRLevel;
    weightPct: number;
    detail: string;
  }>;
}

function scoreToCefr(score: number): CEFRLevel {
  if (score >= 90) return 'C2';
  if (score >= 78) return 'C1';
  if (score >= 64) return 'B2';
  if (score >= 48) return 'B1';
  if (score >= 32) return 'A2';
  return 'A1';
}

function cefrToNumericScore(level: CEFRLevel): number {
  const map: Record<CEFRLevel, number> = {
    A1: 24,
    A2: 42,
    B1: 58,
    B2: 72,
    C1: 86,
    C2: 96
  };
  return map[level] ?? 58;
}

/**
 * Multi-Signal CEFR Evaluation: combines Placement Test + Exercise History + SM-2 Retention +
 * City/Curriculum Progress + Tutor/Error Journal signals so a single quiz never dictates CEFR alone.
 */
export function computeMultiSignalCefr(
  user: UserProfile,
  attempts: LearningAttempt[],
  flashcards: FlashcardProgress[],
  cityProgression?: CityMapProgressionState
): MultiSignalAssessment {
  const gradeMeta = getGradeMeta(user.schoolGrade || inferGradeFromCefr(user.level || 'B1'));
  const placement: PlacementTestResult | undefined = user.placementTest;
  const signals: Array<{ source: string; score: number; cefrEstimate: CEFRLevel; weight: number; detail: string }> = [];

  // Signal 1: Grade + Profile Target baseline
  const profileBaseline = cefrToNumericScore(user.level || gradeMeta.targetCefr);
  signals.push({
    source: `Classe (${gradeMeta.shortLabel}) & Profil`,
    score: profileBaseline,
    cefrEstimate: user.level || gradeMeta.targetCefr,
    weight: 15,
    detail: `Référentiel ${gradeMeta.cycle} (${gradeMeta.targetCefr})`
  });

  // Signal 2: Multi-Skill Placement Diagnostic (if completed)
  if (placement && typeof placement.overallScore === 'number') {
    signals.push({
      source: 'Test de Placement (6 pôles)',
      score: placement.overallScore,
      cefrEstimate: placement.estimatedCefr,
      weight: 35,
      detail: `Vocab/Gram/Reading/Listening/Writing/Speaking : ${placement.overallScore}%`
    });
  }

  // Signal 3: Recent Learning Attempts across modules
  if (attempts.length > 0) {
    const recent = attempts.slice(0, 15);
    const avgAttScore = Math.round(
      recent.reduce((sum, a) => sum + Math.max(0, Math.min(100, a.score || 0)), 0) / recent.length
    );
    const weightedLevelSum = recent.reduce((sum, a) => sum + cefrToNumericScore(a.level || 'B1'), 0);
    const levelAvg = Math.round(weightedLevelSum / recent.length);
    const adjustedScore = Math.round(levelAvg * 0.55 + avgAttScore * 0.45);
    signals.push({
      source: 'Historique d’Exercices',
      score: adjustedScore,
      cefrEstimate: scoreToCefr(adjustedScore),
      weight: Math.min(30, 10 + recent.length * 2),
      detail: `${attempts.length} session(s) · Moyenne récente ${avgAttScore}%`
    });
  }

  // Signal 4: SM-2 Spaced Repetition Retention
  if (flashcards.length > 0) {
    const mastered = flashcards.filter((c) => c.state === 'mastered' || c.repetitions >= 3).length;
    const avgEase = flashcards.reduce((s, c) => s + (c.easeFactor || 2.5), 0) / flashcards.length;
    const retScore = Math.min(98, Math.round(35 + (mastered / Math.max(1, flashcards.length)) * 45 + (avgEase - 1.3) * 12));
    signals.push({
      source: 'Rétention SM-2 Vocabulaire',
      score: retScore,
      cefrEstimate: scoreToCefr(retScore),
      weight: 15,
      detail: `${mastered}/${flashcards.length} cartes ancrées · Ease ${avgEase.toFixed(1)}`
    });
  }

  // Signal 5: City Map & Curriculum Progression
  const completedLessonsCount = getLocalCompletedLessonIds().length;
  const conqueredCityCount = cityProgression?.conqueredLevels?.length || 0;
  if (completedLessonsCount > 0 || conqueredCityCount > 0) {
    const progScore = Math.min(96, 38 + conqueredCityCount * 2.5 + completedLessonsCount * 1.8);
    signals.push({
      source: 'Progression Cité & Cursus',
      score: Math.round(progScore),
      cefrEstimate: scoreToCefr(progScore),
      weight: 15,
      detail: `${completedLessonsCount} leçon(s) · ${conqueredCityCount} niv. Cité conquis`
    });
  }

  const totalWeight = signals.reduce((s, item) => s + item.weight, 0);
  const blendedNumeric = Math.round(
    signals.reduce((s, item) => s + item.score * item.weight, 0) / Math.max(1, totalWeight)
  );
  const compositeCefr = scoreToCefr(blendedNumeric);
  const confidenceScore = Math.min(99, Math.max(42, 32 + signals.length * 13 + (placement ? 10 : 0)));

  return {
    compositeCefr,
    confidenceScore,
    signalsCount: signals.length,
    signalSummaries: signals.map((sig) => ({
      source: sig.source,
      cefrEstimate: sig.cefrEstimate,
      weightPct: Math.round((sig.weight / Math.max(1, totalWeight)) * 100),
      detail: sig.detail
    }))
  };
}

export interface DynamicAdaptationDirective {
  mode: DynamicAdaptationMode;
  badgeLabel: string;
  headlineFr: string;
  summaryFr: string;
  targetCefrForExercises: CEFRLevel;
  recommendedAudioRate: number;
  enableGuidedHints: boolean;
  ruleExplanationFr: string;
  examplesEn: string[];
  advancedChallengeWords: Array<{ term: string; phonetic: string; frenchDef: string; exampleEn: string }>;
  nextChallengePrompt: string;
}

export interface TenMinuteSessionBlock {
  id: 'block_vocab_grammar' | 'block_listening_reading' | 'block_speaking' | 'block_writing';
  order: number;
  minutes: number;
  skillLabel: string;
  skillKey: SkillKey;
  title: string;
  subtitle: string;
  difficultyTag: string;
  actionTarget:
    | 'flashcards'
    | 'grammar_battle'
    | 'listening_cinema'
    | 'escape_room'
    | 'speaking'
    | 'dialogues'
    | 'tutor';
  icon: string;
}

export interface ModuleAdaptiveRecommendations {
  cursus: {
    recommendedGrade: SchoolGrade;
    adaptationBadge: string;
    rationaleFr: string;
    recommendedLessonIds: string[];
    focusGrammarRuleFr: string;
  };
  game: {
    recommendedGameId: string;
    recommendedGameTitle: string;
    recommendedExpressCefr: CEFRLevel;
    rationaleFr: string;
    adaptationBadge: string;
  };
  atelier: {
    recommendedEngineTitle: string;
    recommendedAction: 'dictation' | 'flashcards' | 'quiz' | 'speaking' | 'dialogues' | 'tutor' | 'grammar_battle' | 'listening_cinema' | 'escape_room';
    recommendedDialogueLevel: DialogueLevelId;
    recommendedAudioRate: number;
    rationaleFr: string;
    ruleTipFr: string;
    exampleEn: string;
  };
}

export interface AdaptiveAssessmentResult {
  profile: AdaptiveLearningProfile;
  gradeMeta: GradeMetaInfo;
  recommendedLessons: SchoolLesson[];
  primaryFocusSkill: SkillMetaInfo;
  dueVocabularyCount: number;
  upcomingWords: Array<{ id: string; term: string; phonetic: string; frenchDef: string; status: 'due' | 'new' }>;
  multiSignal: MultiSignalAssessment;
  dynamicDirective: DynamicAdaptationDirective;
  tenMinuteSession: TenMinuteSessionBlock[];
  modulePlans: ModuleAdaptiveRecommendations;
  majorSkillBalances: Array<{ key: 'listening' | 'speaking' | 'reading' | 'writing'; labelFr: string; score: number; icon: string }>;
  learningSpeed: LearningSpeedLevel;
  errorFrequency: number;
  vocabularyRetentionRate: number;
  skillBalanceScore: number;
}

/**
 * Computes Dynamic Pedagogical Adaptation (Scaffolding when struggling vs Acceleration when succeeding).
 */
export function buildDynamicDirective(
  baseCefr: CEFRLevel,
  weakestSkill: SkillKey,
  overallReadiness: number,
  recentAvgScore: number,
  errorFrequency: number,
  gradeMeta: GradeMetaInfo
): DynamicAdaptationDirective {
  const weakMeta = SKILL_META[weakestSkill];
  const isStruggling = recentAvgScore < 64 || errorFrequency >= 35 || overallReadiness < 60;
  const isExcelling = recentAvgScore >= 85 && errorFrequency < 22 && overallReadiness >= 78;

  const stretchPool = FLASHCARD_ITEMS.filter((c) => c.level === 'C1' || c.level === 'C2').slice(0, 3);
  const advancedChallengeWords = stretchPool.map((item) => ({
    term: item.term,
    phonetic: item.phonetic,
    frenchDef: item.frenchDef,
    exampleEn: item.pressExcerpt || item.englishDef
  }));

  if (isStruggling) {
    const steppedDown = stepCefrLevel(baseCefr, -1);
    return {
      mode: 'scaffolded',
      badgeLabel: 'Soutien Progressif Activé',
      headlineFr: `Consolidation guidée en ${weakMeta.labelFr}`,
      summaryFr:
        `Difficulté allégée temporairement vers ${steppedDown} (${gradeMeta.shortLabel}) avec rappels de règles, exemples bilingues et indices pas à pas.`,
      targetCefrForExercises: steppedDown,
      recommendedAudioRate: 0.85,
      enableGuidedHints: true,
      ruleExplanationFr: weakMeta.ruleExplanationFr,
      examplesEn: weakMeta.examplesEn,
      advancedChallengeWords,
      nextChallengePrompt: weakMeta.guidedTipFr
    };
  }

  if (isExcelling) {
    const steppedUp = stepCefrLevel(baseCefr, 1);
    return {
      mode: 'accelerated',
      badgeLabel: 'Défi Excellence Activé',
      headlineFr: `Montée en complexité vers ${steppedUp}`,
      summaryFr:
        `Excellente maîtrise (${recentAvgScore}% de précision). Vocabulaire ${steppedUp} avancé, audio rapide 1.1x et scénarios d'expression libre débloqués.`,
      targetCefrForExercises: steppedUp,
      recommendedAudioRate: 1.1,
      enableGuidedHints: false,
      ruleExplanationFr:
        'Perfectionnez vos nuances stylistiques : privilégiez les inversions élégantes, modaux nuancés et connecteurs concessifs.',
      examplesEn: [
        'Not only did the debate sharpen our arguments, but it also broadened our perspective.',
        'Were we to adopt this approach, fluency would accelerate significantly.'
      ],
      advancedChallengeWords,
      nextChallengePrompt:
        'Relevez un débat spontané avec le Tuteur IA ou lancez le Défi Express au niveau supérieur sans aide.'
    };
  }

  return {
    mode: 'balanced',
    badgeLabel: 'Progression Équilibrée',
    headlineFr: `Parcours calibré ${gradeMeta.shortLabel} · ${baseCefr}`,
    summaryFr:
      `Progression régulière entre les 4 piliers (Listening, Speaking, Reading, Writing) avec renforcement ciblé en ${weakMeta.labelFr}.`,
    targetCefrForExercises: baseCefr,
    recommendedAudioRate: 1.0,
    enableGuidedHints: false,
    ruleExplanationFr: weakMeta.ruleExplanationFr,
    examplesEn: weakMeta.examplesEn,
    advancedChallengeWords,
    nextChallengePrompt: weakMeta.guidedTipFr
  };
}

/**
 * Generates a balanced 10-minute daily personalized session tailored for Middle/High School students.
 */
export function buildTenMinuteDailySession(
  gradeMeta: GradeMetaInfo,
  directive: DynamicAdaptationDirective,
  skills: Record<SkillKey, SkillEvaluation>,
  objectives: LearningObjectiveId[] = []
): TenMinuteSessionBlock[] {
  const isLycee = gradeMeta.cycle === 'Lycée';
  const weakOrder = [...ALL_SKILL_KEYS].sort((a, b) => skills[a].score - skills[b].score);
  const weak1 = weakOrder[0];

  const wantsExam = objectives.includes('exam_prep');
  const diffLabel =
    directive.mode === 'scaffolded'
      ? `Guidé (${directive.targetCefrForExercises})`
      : directive.mode === 'accelerated'
      ? `Avancé (${directive.targetCefrForExercises})`
      : `Calibré (${directive.targetCefrForExercises})`;

  // Block 1 (2 min): Supporting Competencies (Vocabulary or Grammar)
  const focusVocab = skills.vocabulary.score <= skills.grammar.score || weak1 === 'vocabulary';
  const block1: TenMinuteSessionBlock = focusVocab
    ? {
        id: 'block_vocab_grammar',
        order: 1,
        minutes: 2,
        skillLabel: 'Vocabulaire (Support)',
        skillKey: 'vocabulary',
        title: directive.mode === 'accelerated' ? 'Flashcards SM-2 · Lexique Nuancé' : 'Réveil Lexical SM-2 (5 cartes)',
        subtitle: isLycee
          ? 'Collocations académiques & idiomes ciblés.'
          : 'Mots clés du programme avec écoute UK/US.',
        difficultyTag: diffLabel,
        actionTarget: 'flashcards',
        icon: 'style'
      }
    : {
        id: 'block_vocab_grammar',
        order: 1,
        minutes: 2,
        skillLabel: 'Grammaire (Support)',
        skillKey: 'grammar',
        title: directive.mode === 'scaffolded' ? 'Règle & Duel Guidé (Grammar Battle)' : 'Sprint Syntaxique · Grammar Battle',
        subtitle: isLycee
          ? 'Conditionnels, modaux & inversions Bac/E3C.'
          : 'Temps de base, modaux & structure de phrase.',
        difficultyTag: diffLabel,
        actionTarget: 'grammar_battle',
        icon: 'gavel'
      };

  // Block 2 (3 min): Balanced Reception — prioritize whichever of Listening or Reading is weaker
  const needListening = skills.listening.score <= skills.reading.score;
  const block2: TenMinuteSessionBlock = needListening
    ? {
        id: 'block_listening_reading',
        order: 2,
        minutes: 3,
        skillLabel: 'Listening (Compréhension Orale)',
        skillKey: 'listening',
        title: 'Listening Cinema · Épisode Adapté',
        subtitle:
          directive.mode === 'scaffolded'
            ? 'Vitesse 0.85x + script interactif disponible.'
            : 'Audio multi-voix & compréhension sans filtre.',
        difficultyTag: diffLabel,
        actionTarget: 'listening_cinema',
        icon: 'movie'
      }
    : {
        id: 'block_listening_reading',
        order: 2,
        minutes: 3,
        skillLabel: 'Reading (Compréhension Écrite)',
        skillKey: 'reading',
        title: wantsExam || isLycee ? 'Escape Room · Analyse d’Indices' : 'Escape Room · Lecture & Logique',
        subtitle: 'Déchiffrement de textes et déduction rapide.',
        difficultyTag: diffLabel,
        actionTarget: 'escape_room',
        icon: 'lock_open'
      };

  // Block 3 (3 min): Speaking & Pronunciation
  const needPron = skills.pronunciation.score < skills.speaking.score;
  const block3: TenMinuteSessionBlock = needPron
    ? {
        id: 'block_speaking',
        order: 3,
        minutes: 3,
        skillLabel: 'Speaking & Prononciation',
        skillKey: 'pronunciation',
        title: 'Studio d’Élocution · Accent UK/US',
        subtitle: 'Répétition phonétique et duel spectral 60 FPS.',
        difficultyTag: diffLabel,
        actionTarget: 'speaking',
        icon: 'mic'
      }
    : {
        id: 'block_speaking',
        order: 3,
        minutes: 3,
        skillLabel: 'Speaking (Expression Orale)',
        skillKey: 'speaking',
        title: '500 Dialogues · Jeu de Rôle Réel',
        subtitle: isLycee
          ? 'Scénarios argumentatifs & voyages.'
          : 'Questions-réponses du quotidien à 2 ou 3 voix.',
        difficultyTag: diffLabel,
        actionTarget: 'dialogues',
        icon: 'forum'
      };

  // Block 4 (2 min): Writing & Independent Synthesis
  const block4: TenMinuteSessionBlock = {
    id: 'block_writing',
    order: 4,
    minutes: 2,
    skillLabel: 'Writing (Expression Écrite)',
    skillKey: 'writing',
    title:
      directive.mode === 'accelerated'
        ? 'Défi d’Écriture Autonome (Tuteur IA)'
        : 'Mini-Rédaction Guidée (Tuteur IA)',
    subtitle:
      directive.mode === 'scaffolded'
        ? '3 phrases guidées avec correction bienveillante.'
        : 'Paragraph synthesis & instant AI style feedback.',
    difficultyTag: diffLabel,
    actionTarget: 'tutor',
    icon: 'edit_note'
  };

  return [block1, block2, block3, block4];
}

const TEN_MIN_SESSION_STORAGE_KEY = 'eb_msz_ten_min_session_v1';
export const TEN_MIN_SESSION_UPDATED_EVENT = 'eb_ten_min_session_updated';

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getCompletedTenMinBlockIds(): string[] {
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(TEN_MIN_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { date?: string; completedIds?: string[] };
      if (parsed.date === today && Array.isArray(parsed.completedIds)) {
        return parsed.completedIds;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function toggleTenMinBlockCompleted(blockId: string, forceComplete?: boolean): string[] {
  const today = getTodayDateKey();
  const current = getCompletedTenMinBlockIds();
  const exists = current.includes(blockId);
  let next: string[];
  if (forceComplete === true) {
    next = exists ? current : [...current, blockId];
  } else if (forceComplete === false) {
    next = current.filter((id) => id !== blockId);
  } else {
    next = exists ? current.filter((id) => id !== blockId) : [...current, blockId];
  }
  try {
    localStorage.setItem(
      TEN_MIN_SESSION_STORAGE_KEY,
      JSON.stringify({ date: today, completedIds: next })
    );
    window.dispatchEvent(new CustomEvent(TEN_MIN_SESSION_UPDATED_EVENT, { detail: next }));
  } catch {
    // ignore
  }
  return next;
}

/**
 * Centralized 7-Skill + 4-Major-Balance Adaptive Learning Engine
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
  const placement = user.placementTest;

  // Blend placement diagnostic if completed
  const pVocab = placement?.skillScores?.vocabulary;
  const pGrammar = placement?.skillScores?.grammar;
  const pListening = placement?.skillScores?.listening;
  const pReading = placement?.skillScores?.reading;
  const pWriting = placement?.skillScores?.writing;
  const pSpeaking = placement?.skillScores?.speaking;

  // 1. Vocabulary score blends SM-2 retention + flashcard attempts + placement
  const vocabAtt = scoreFromAttempts(attempts, ['flashcard', 'daily_challenge', 'arcade'], pVocab ?? baseline);
  const masteredCards = flashcards.filter((c) => c.state === 'mastered' || c.repetitions >= 3).length;
  const sm2Bonus = Math.min(18, masteredCards * 2 + Math.min(8, flashcards.length));
  const rawVocab =
    vocabAtt.count > 0
      ? Math.round(vocabAtt.score * 0.7 + (baseline + sm2Bonus) * 0.3)
      : pVocab !== undefined
      ? Math.round(pVocab * 0.75 + (baseline + sm2Bonus) * 0.25)
      : Math.min(96, baseline + sm2Bonus);
  const vocabScore = Math.min(100, rawVocab);

  // 2. Grammar score blends quiz, grammar drills, Grammar Battle, city map + placement
  const grammarAtt = scoreFromAttempts(attempts, ['grammar', 'grammar_battle', 'quiz'], pGrammar ?? Math.max(42, baseline - 2));
  const cityLevelsBonus = Math.min(12, (cityProgression?.conqueredLevels?.length || 0) * 2);
  const grammarScore = Math.min(
    100,
    grammarAtt.count > 0
      ? Math.round(grammarAtt.score * 0.8 + (pGrammar ?? baseline + cityLevelsBonus) * 0.2)
      : pGrammar !== undefined
      ? Math.round(pGrammar * 0.85 + Math.min(95, baseline + cityLevelsBonus) * 0.15)
      : Math.min(95, baseline - 2 + cityLevelsBonus)
  );

  // 3. Listening score blends Dictation, Listening Cinema, and Dialogues + placement
  const listeningAtt = scoreFromAttempts(attempts, ['listening_cinema', 'dictation', 'dialogue'], pListening ?? Math.max(40, baseline - 4));
  const listeningScore =
    listeningAtt.count > 0 && pListening !== undefined
      ? Math.round(listeningAtt.score * 0.75 + pListening * 0.25)
      : listeningAtt.score;

  // 4. Reading score blends Escape Room, Reading lessons, Completed Curriculum Modules + placement
  const readingAtt = scoreFromAttempts(attempts, ['reading', 'escape_room', 'daily_challenge'], pReading ?? Math.max(44, baseline));
  const completedLessons = getLocalCompletedLessonIds();
  const curriculumBonus = Math.min(14, (completedLessons.length + (user.stats?.completedModules || 0)) * 0.6);
  const readingScore = Math.min(
    100,
    readingAtt.count > 0
      ? readingAtt.score
      : pReading !== undefined
      ? Math.round(pReading * 0.8 + Math.min(100, baseline + curriculumBonus) * 0.2)
      : Math.round(readingAtt.score + curriculumBonus * 0.4)
  );

  // 5. Writing score blends AI Tutor Writing evaluator, Dictation precision, Writing drills + placement
  const writingAtt = scoreFromAttempts(attempts, ['writing', 'dictation', 'tutor'], pWriting ?? Math.max(38, baseline - 6));
  const writingScore =
    writingAtt.count > 0 && pWriting !== undefined
      ? Math.round(writingAtt.score * 0.75 + pWriting * 0.25)
      : writingAtt.score;

  // 6. Speaking Fluency blends Speaking Studio, Conversation Simulator, AI Tutor + placement
  const speakingAtt = scoreFromAttempts(attempts, ['speaking', 'dialogue', 'tutor'], pSpeaking ?? Math.max(39, baseline - 5));
  const speakingScore =
    speakingAtt.count > 0 && pSpeaking !== undefined
      ? Math.round(speakingAtt.score * 0.75 + pSpeaking * 0.25)
      : speakingAtt.score;

  // 7. Pronunciation score
  const pronunciationScores = attempts
    .filter((a) => a.moduleType === 'speaking')
    .map((a) => {
      const phoneticScore = typeof a.details?.phoneticScore === 'number' ? a.details.phoneticScore : a.score;
      return Math.max(0, Math.min(100, phoneticScore));
    });
  const pronScore =
    pronunciationScores.length > 0
      ? Math.round(pronunciationScores.slice(0, 10).reduce((s, n) => s + n, 0) / Math.min(10, pronunciationScores.length))
      : pSpeaking !== undefined
      ? Math.max(35, pSpeaking - 2)
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
    listening: buildEval('listening', listeningScore, listeningAtt.count, listeningAtt.lastPracticedAt),
    reading: buildEval('reading', readingScore, readingAtt.count + completedLessons.length, readingAtt.lastPracticedAt),
    writing: buildEval('writing', writingScore, writingAtt.count, writingAtt.lastPracticedAt),
    speaking: buildEval('speaking', speakingScore, speakingAtt.count, speakingAtt.lastPracticedAt),
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

  // Additional Personalized Metrics: Learning Speed, Error Frequency, Vocabulary Retention, 4-Skill Balance
  const recentFive = attempts.slice(0, 5);
  const recentAvgScore =
    recentFive.length > 0
      ? Math.round(recentFive.reduce((s, a) => s + (a.score || 0), 0) / recentFive.length)
      : placement?.overallScore ?? overallReadiness;

  const avgDur =
    recentFive.length > 0
      ? recentFive.reduce((s, a) => s + Math.max(15, a.durationSeconds || 55), 0) / recentFive.length
      : 60;
  const learningSpeed: LearningSpeedLevel =
    avgDur < 55 && recentAvgScore >= 75
      ? 'fast'
      : avgDur > 110 || recentAvgScore < 65
      ? 'methodical'
      : 'steady';

  let unresolvedJournalErrors = 0;
  try {
    unresolvedJournalErrors = getErrorJournal().filter((e) => !e.resolved).length;
  } catch {
    unresolvedJournalErrors = 0;
  }
  const tutorWeaknessCount = user.tutorWeaknesses?.length || 0;
  const rawErrorFreq = Math.round(
    (100 - recentAvgScore) * 0.65 + Math.min(25, unresolvedJournalErrors * 2.5 + tutorWeaknessCount * 2)
  );
  const errorFrequency = Math.max(4, Math.min(88, rawErrorFreq));

  const vocabularyRetentionRate =
    flashcards.length > 0
      ? Math.min(
          99,
          Math.max(
            25,
            Math.round(
              (flashcards.filter((c) => c.lastQualityScore >= 3 || c.state !== 'learning').length /
                flashcards.length) *
                75 +
                (masteredCards / flashcards.length) * 25
            )
          )
        )
      : Math.min(92, Math.max(45, vocabScore));

  const majorScores = FOUR_MAJOR_SKILLS.map((k) => skills[k].score);
  const maxMajor = Math.max(...majorScores);
  const minMajor = Math.min(...majorScores);
  const skillBalanceScore = Math.max(20, Math.min(100, 100 - Math.round((maxMajor - minMajor) * 1.35)));

  // Multi-Signal CEFR Evaluation
  const multiSignal = computeMultiSignalCefr(user, attempts, flashcards, cityProgression);
  const assessedCefrLevel = multiSignal.compositeCefr;

  // Dynamic Adaptation Directive (Scaffolding vs Balanced vs Accelerated)
  const dynamicDirective = buildDynamicDirective(
    assessedCefrLevel,
    weakestSkills[0],
    overallReadiness,
    recentAvgScore,
    errorFrequency,
    gradeMeta
  );

  // Personalized 10-minute Daily Balanced Session
  const tenMinuteSession = buildTenMinuteDailySession(
    gradeMeta,
    dynamicDirective,
    skills,
    user.learningObjectives
  );

  // Recommend personalized lessons from the 200-lesson curriculum
  const completedSet = new Set(completedLessons);
  const gradeLessons = ALL_200_LESSONS.filter((l) => l.class_level === schoolGrade);
  const levelMatched = gradeLessons.filter((l) => !completedSet.has(l.id));
  const pool = levelMatched.length >= 4 ? levelMatched : gradeLessons.length >= 4 ? gradeLessons : ALL_200_LESSONS;

  const primaryWeak = weakestSkills[0];
  const objectives = user.learningObjectives || [];
  const scoredPool = pool.map((lesson) => {
    let relevance = 0;
    if (lesson.cefr_level?.toUpperCase() === dynamicDirective.targetCefrForExercises) relevance += 5;
    if (lesson.cefr_level?.toUpperCase() === user.level) relevance += 3;
    if (lesson.cefr_level?.toUpperCase() === gradeMeta.targetCefr) relevance += 2;
    if (!completedSet.has(lesson.id)) relevance += 4;
    const textBlob = `${lesson.grammar?.rule || ''} ${lesson.grammar?.title || ''} ${lesson.theme_label} ${lesson.title}`.toLowerCase();
    if (primaryWeak === 'grammar' && (lesson.grammar?.rule || textBlob.includes('tense') || textBlob.includes('modal'))) relevance += 3;
    if (primaryWeak === 'listening' && (lesson.dialogue?.lines?.length ?? 0) > 0) relevance += 3;
    if (primaryWeak === 'vocabulary' && lesson.vocabulary?.length > 0) relevance += 3;
    if (objectives.includes('travel_culture') && textBlob.includes('voyage')) relevance += 2;
    if (objectives.includes('exam_prep') && (lesson.cycle === 'Lycée' || textBlob.includes('argument'))) relevance += 2;
    return { lesson, relevance };
  });
  scoredPool.sort((a, b) => b.relevance - a.relevance);
  const recommendedLessons = scoredPool.slice(0, 4).map((x) => x.lesson);

  // Cross-module concrete plans (Cursus, Game, Atelier)
  const gameMapBySkill: Record<SkillKey, { id: string; title: string }> = {
    listening: { id: 'audio-blitz', title: 'Audio Blitz' },
    grammar: { id: 'verb-master', title: 'Verb Master & Syntaxe' },
    vocabulary: { id: 'speed-match', title: 'Speed Match Éclair' },
    reading: { id: 'word-search', title: 'Grille Lexicale & Sens' },
    writing: { id: 'sentence-builder', title: 'Sentence Builder' },
    speaking: { id: 'tone-detector', title: 'Tone & Nuance Detector' },
    pronunciation: { id: 'spelling-bee', title: 'Spelling & Phonetics Bee' }
  };
  const chosenGame =
    dynamicDirective.mode === 'accelerated'
      ? { id: 'boss-battle', title: 'Boss Battle Final' }
      : gameMapBySkill[primaryWeak];

  const expressCandidates: CEFRLevel[] = ['A2', 'B1', 'B2', 'C1'];
  const mappedExpress = expressCandidates.includes(dynamicDirective.targetCefrForExercises)
    ? dynamicDirective.targetCefrForExercises
    : dynamicDirective.targetCefrForExercises === 'A1'
    ? 'A2'
    : 'C1';

  const dialogueLevelMap: Record<CEFRLevel, DialogueLevelId> = {
    A1: schoolGrade === '5e' ? '5e_A2' : '6e_A1',
    A2: schoolGrade === '4e' ? '4e_A2P' : '5e_A2',
    B1: schoolGrade === '2nde' ? '2nde_B1P' : '3e_B1',
    B2: '1re_B2',
    C1: 'Term_C1',
    C2: 'Term_C1'
  };
  const dialogueBand: DialogueLevelId = dialogueLevelMap[dynamicDirective.targetCefrForExercises];

  const atelierEngineBySkill: Record<SkillKey, {
    title: string;
    action: ModuleAdaptiveRecommendations['atelier']['recommendedAction'];
  }> = {
    vocabulary: { title: 'Spaced Repetition Cards (SM-2)', action: 'flashcards' },
    grammar: { title: 'Grammar Battle & Quiz', action: 'grammar_battle' },
    listening: { title: 'Dictation Engine & Listening Cinema', action: 'dictation' },
    reading: { title: 'English Escape Room', action: 'escape_room' },
    writing: { title: 'AI English Tutor & Correcteur', action: 'tutor' },
    speaking: { title: 'Atelier 500 Dialogues', action: 'dialogues' },
    pronunciation: { title: 'Studio d’Élocution UK/US', action: 'speaking' }
  };
  const atelierPick = atelierEngineBySkill[primaryWeak];

  const modulePlans: ModuleAdaptiveRecommendations = {
    cursus: {
      recommendedGrade: schoolGrade,
      adaptationBadge: dynamicDirective.badgeLabel,
      rationaleFr: `Leçons filtrées pour la classe de ${gradeMeta.shortLabel} (${dynamicDirective.targetCefrForExercises}) avec priorité sur ${SKILL_META[primaryWeak].labelFr}.`,
      recommendedLessonIds: recommendedLessons.map((l) => l.id),
      focusGrammarRuleFr: dynamicDirective.ruleExplanationFr
    },
    game: {
      recommendedGameId: chosenGame.id,
      recommendedGameTitle: chosenGame.title,
      recommendedExpressCefr: mappedExpress,
      rationaleFr:
        dynamicDirective.mode === 'accelerated'
          ? `Votre score élevé (${recentAvgScore}%) débloque les défis ${mappedExpress} et le Boss Battle !`
          : `Ce défi renforce directement votre axe prioritaire (${SKILL_META[primaryWeak].labelFr}) au niveau ${mappedExpress}.`,
      adaptationBadge: dynamicDirective.badgeLabel
    },
    atelier: {
      recommendedEngineTitle: atelierPick.title,
      recommendedAction: atelierPick.action,
      recommendedDialogueLevel: dialogueBand,
      recommendedAudioRate: dynamicDirective.recommendedAudioRate,
      rationaleFr: `Moteur conseillé pour équilibrer Listening / Speaking / Reading / Writing (équilibre actuel : ${skillBalanceScore}%).`,
      ruleTipFr: dynamicDirective.ruleExplanationFr,
      exampleEn: dynamicDirective.examplesEn[0] || ''
    }
  };

  const majorSkillBalances = FOUR_MAJOR_SKILLS.map((k) => ({
    key: k,
    labelFr: SKILL_META[k].labelFr,
    score: skills[k].score,
    icon: SKILL_META[k].icon
  }));

  const dueVocabularyCount = computeDueVocabularyCount(flashcards);
  const upcomingWords = getUpcomingReviewWords(flashcards, assessedCefrLevel, 5);
  const exerciseCompletionCount = attempts.length + completedLessons.length + (cityProgression?.conqueredLevels?.length || 0);

  const profile: AdaptiveLearningProfile = {
    schoolGrade,
    assessedCefrLevel,
    overallReadiness,
    skills,
    weakestSkills,
    strongestSkills,
    recommendedLessonIds: recommendedLessons.map((l) => l.id),
    dueVocabularyCount,
    learningSpeed,
    errorFrequency,
    vocabularyRetentionRate,
    exerciseCompletionCount,
    skillBalanceScore,
    adaptationMode: dynamicDirective.mode,
    multiSignalSourcesCount: multiSignal.signalsCount,
    confidenceScore: multiSignal.confidenceScore,
    updatedAt: new Date().toISOString()
  };

  return {
    profile,
    gradeMeta,
    recommendedLessons,
    primaryFocusSkill: SKILL_META[weakestSkills[0]],
    dueVocabularyCount,
    upcomingWords,
    multiSignal,
    dynamicDirective,
    tenMinuteSession,
    modulePlans,
    majorSkillBalances,
    learningSpeed,
    errorFrequency,
    vocabularyRetentionRate,
    skillBalanceScore
  };
}
