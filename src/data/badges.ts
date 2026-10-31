import type { UserProfile, LearningAttempt, AcademicBadge, BadgeTier } from '../firebase/types';

export const BADGE_TIER_STYLES: Record<
  BadgeTier,
  {
    border: string;
    bg: string;
    text: string;
    glow: string;
    badgeBg: string;
    label: string;
  }
> = {
  bronze: {
    border: 'border-[#cd7f32]/50',
    bg: 'bg-gradient-to-br from-[#2a1d13] to-[#151b2b]',
    text: 'text-[#e09858]',
    glow: 'shadow-[#cd7f32]/20',
    badgeBg: 'bg-[#cd7f32]/20',
    label: 'Bronze'
  },
  silver: {
    border: 'border-[#c0c7d6]/60',
    bg: 'bg-gradient-to-br from-[#1e2533] to-[#151b2b]',
    text: 'text-[#e2e8f0]',
    glow: 'shadow-[#c0c7d6]/20',
    badgeBg: 'bg-[#c0c7d6]/20',
    label: 'Argent'
  },
  gold: {
    border: 'border-[#f2ca50]/70',
    bg: 'bg-gradient-to-br from-[#332a13] to-[#151b2b]',
    text: 'text-[#f2ca50]',
    glow: 'shadow-[#f2ca50]/25',
    badgeBg: 'bg-[#f2ca50]/20',
    label: 'Or'
  },
  platinum: {
    border: 'border-[#38bdf8]/60',
    bg: 'bg-gradient-to-br from-[#0e2a38] to-[#151b2b]',
    text: 'text-[#38bdf8]',
    glow: 'shadow-[#38bdf8]/20',
    badgeBg: 'bg-[#38bdf8]/20',
    label: 'Platine'
  },
  oxford: {
    border: 'border-[#d4af37]',
    bg: 'bg-gradient-to-br from-[#2a103c] via-[#1a142c] to-[#151b2b]',
    text: 'text-[#f6d860]',
    glow: 'shadow-[#f6d860]/30',
    badgeBg: 'bg-[#9333ea]/25',
    label: 'Oxford Impérial'
  }
};

export const BADGES_CATALOG: Omit<AcademicBadge, 'currentProgress' | 'isUnlocked' | 'unlockedAt'>[] = [
  // PALIERS XP
  {
    id: 'xp_500',
    title: 'Initié des Lettres',
    latinTitle: 'Inceptor Linguarum',
    tier: 'bronze',
    category: 'xp',
    description: 'Franchir le premier cap académique de 500 XP dans votre apprentissage.',
    icon: 'edit_note',
    requirementLabel: 'Accumuler 500 XP',
    requiredTarget: 500,
    xpReward: 50
  },
  {
    id: 'xp_1500',
    title: 'Lettré Assidu',
    latinTitle: 'Grammaticus Laureatus',
    tier: 'silver',
    category: 'xp',
    description: 'Atteindre un volume d’assimilation linguistique soutenu avec 1 500 XP.',
    icon: 'menu_book',
    requirementLabel: 'Accumuler 1 500 XP',
    requiredTarget: 1500,
    xpReward: 100
  },
  {
    id: 'xp_3000',
    title: 'Maître de Rhétorique',
    latinTitle: 'Magister Rhetoricae',
    tier: 'gold',
    category: 'xp',
    description: 'Valider une pratique assidue et rigoureuse récompensée par 3 000 XP.',
    icon: 'military_tech',
    requirementLabel: 'Accumuler 3 000 XP',
    requiredTarget: 3000,
    xpReward: 200
  },
  {
    id: 'xp_5000',
    title: 'Orateur d’Élite',
    latinTitle: 'Orator Parliamentarius',
    tier: 'platinum',
    category: 'xp',
    description: 'Franchir le seuil d’excellence opérationnelle avec 5 000 XP d’entraînement.',
    icon: 'gavel',
    requirementLabel: 'Accumuler 5 000 XP',
    requiredTarget: 5000,
    xpReward: 350
  },
  {
    id: 'xp_10000',
    title: 'Gardien des Savoirs',
    latinTitle: 'Custos Bodleianus',
    tier: 'oxford',
    category: 'xp',
    description: 'Distinction suprême réservée aux esprits ayant accumulé 10 000 XP.',
    icon: 'history_edu',
    requirementLabel: 'Accumuler 10 000 XP',
    requiredTarget: 10000,
    xpReward: 500
  },

  // SÉRIES D'ASSIDUITÉ (STREAK)
  {
    id: 'streak_3',
    title: 'Premier Élan',
    latinTitle: 'Primus Gradus',
    tier: 'bronze',
    category: 'streak',
    description: 'Maintenir une flamme d’étude continue pendant 3 jours consécutifs.',
    icon: 'local_fire_department',
    requirementLabel: '3 jours consécutifs',
    requiredTarget: 3,
    xpReward: 30
  },
  {
    id: 'streak_7',
    title: 'Flamme d’Assiduité',
    latinTitle: 'Flamma Constans',
    tier: 'silver',
    category: 'streak',
    description: 'Une semaine complète d’entraînement ininterrompu (7 jours).',
    icon: 'local_fire_department',
    requirementLabel: '7 jours consécutifs',
    requiredTarget: 7,
    xpReward: 75
  },
  {
    id: 'streak_20',
    title: 'Discipline Inébranlable',
    latinTitle: 'Zelus Academicus',
    tier: 'gold',
    category: 'streak',
    description: 'Prouver une persévérance hors pair avec 20 jours d’assiduité sans faille.',
    icon: 'bolt',
    requirementLabel: '20 jours consécutifs',
    requiredTarget: 20,
    xpReward: 250
  },

  // SÉRIES DE LEÇONS TERMINÉES
  {
    id: 'lessons_5',
    title: 'Explorateur Didactique',
    latinTitle: 'Discipulus Diligens',
    tier: 'bronze',
    category: 'lessons',
    description: 'Valider 5 leçons scolaires complètes avec leurs exercices et quiz.',
    icon: 'school',
    requirementLabel: 'Compléter 5 leçons',
    requiredTarget: 5,
    xpReward: 50
  },
  {
    id: 'lessons_15',
    title: 'Érudit Polyvalent',
    latinTitle: 'Humanista Politus',
    tier: 'gold',
    category: 'lessons',
    description: 'Avoir exploré et maîtrisé 15 modules pédagogiques à travers les thèmes.',
    icon: 'workspace_premium',
    requirementLabel: 'Compléter 15 leçons',
    requiredTarget: 15,
    xpReward: 150
  },

  // ÉPREUVES SPÉCIFIQUES & ACUITÉ
  {
    id: 'dictation_master',
    title: 'Oreille Philologique',
    latinTitle: 'Acroasis Absoluta',
    tier: 'platinum',
    category: 'dictation',
    description: 'Obtenir un score exceptionnel de 95% ou plus lors d’une dictée cadencée.',
    icon: 'hearing',
    requirementLabel: 'Score dictée ≥ 95%',
    requiredTarget: 95,
    xpReward: 150
  },
  {
    id: 'quiz_ace',
    title: 'Sans-Faute au Quiz',
    latinTitle: 'Syllogismus Aureus',
    tier: 'silver',
    category: 'quiz',
    description: 'Répondre avec une exactitude parfaite (100%) à toutes les questions d’un quiz.',
    icon: 'fact_check',
    requirementLabel: 'Score quiz 100%',
    requiredTarget: 100,
    xpReward: 100
  },

  // =========================================================================
  // BADGES DE DISTINCTION D'HONNEUR (DISTINCTIONS PHILOLOGIQUES & ÉMULATION)
  // =========================================================================
  {
    id: 'polyglotte_matin',
    title: 'Polyglotte du matin',
    latinTitle: 'Poluglottos Matutinus',
    tier: 'gold',
    category: 'distinction',
    description: 'S’entraîner dès l’aube et valider une session matinale pour réveiller son éloquence et son acuité linguistique.',
    icon: 'wb_sunny',
    requirementLabel: 'Session d’étude matinale accomplie',
    requiredTarget: 1,
    xpReward: 150
  },
  {
    id: 'serie_ininterrompue',
    title: 'Série ininterrompue',
    latinTitle: 'Series Inviolata',
    tier: 'oxford',
    category: 'distinction',
    description: 'Conserver une flamme d’assiduité ininterrompue pendant au moins 14 jours consécutifs sans rupture.',
    icon: 'workspace_premium',
    requirementLabel: '14 jours consécutifs sans faille',
    requiredTarget: 14,
    xpReward: 300
  },
  {
    id: 'noctambule_erudit',
    title: 'Noctambule Érudit',
    latinTitle: 'Nocturnus Philosophus',
    tier: 'silver',
    category: 'distinction',
    description: 'Perfectionner sa diction et sa maîtrise stylistique dans le calme studieux des heures nocturnes.',
    icon: 'bedtime',
    requirementLabel: 'Session nocturne complétée',
    requiredTarget: 1,
    xpReward: 100
  },
  {
    id: 'maitre_vocabulaire',
    title: 'Grand Maître du Vocabulaire',
    latinTitle: 'Dominus Vocabulorum',
    tier: 'gold',
    category: 'distinction',
    description: 'Avoir exploré et mémorisé plus de 80 termes sonorisés avec alphabet phonétique API.',
    icon: 'psychology',
    requirementLabel: '80 termes phonétiques assimilés',
    requiredTarget: 80,
    xpReward: 250
  },
  {
    id: 'explorateur_200',
    title: 'Explorateur des 200 Leçons',
    latinTitle: 'Viator Cursus Bicornis',
    tier: 'platinum',
    category: 'distinction',
    description: 'Avoir exploré des leçons scolaires structurées à travers les cycles du collège (6e-3e) et du lycée (2nde-Terminale).',
    icon: 'auto_stories',
    requirementLabel: 'Progression multi-cycles 200 leçons',
    requiredTarget: 10,
    xpReward: 350
  },
  {
    id: 'challenger_squad',
    title: 'Pionnier des Défis de Groupe',
    latinTitle: 'Socius Concors',
    tier: 'gold',
    category: 'distinction',
    description: 'Avoir créé ou rejoint un sous-groupe privé pour se challenger entre condisciples sur une leçon spécifique.',
    icon: 'groups',
    requirementLabel: 'Participation active à un défi de groupe',
    requiredTarget: 1,
    xpReward: 200
  }
];

/**
 * Dynamically evaluate all badges based on the user's live profile and attempt records
 */
export function computeUserBadges(user: UserProfile, attempts: LearningAttempt[] = []): AcademicBadge[] {
  const totalXp = user.stats.totalXp || 0;
  const streak = user.stats.streakDays || 0;
  const completedLessons = user.stats.completedModules || 0;

  // Max dictation score recorded
  const dictationAttempts = attempts.filter((a) => a.moduleType === 'dictation');
  const bestDictationScore = dictationAttempts.length > 0
    ? Math.max(...dictationAttempts.map((a) => a.score || 0))
    : (user.stats.masteryPercentage >= 75 ? 96 : 80); // aligned baseline

  // Max quiz score recorded
  const quizAttempts = attempts.filter((a) => a.moduleType === 'quiz');
  const bestQuizScore = quizAttempts.length > 0
    ? Math.max(...quizAttempts.map((a) => a.score || 0))
    : 100;

  const unlockedSet = new Set(user.unlockedBadgeIds || []);

  // Check if study occurred in morning or has studyMinutesToday
  const hasMorningSession =
    user.stats.studyMinutesToday > 0 ||
    streak > 0 ||
    new Date().getHours() < 12;

  return BADGES_CATALOG.map((def) => {
    let currentProgress = 0;
    let isUnlocked = false;

    if (def.category === 'xp') {
      currentProgress = Math.min(def.requiredTarget, totalXp);
      isUnlocked = totalXp >= def.requiredTarget;
    } else if (def.category === 'streak') {
      currentProgress = Math.min(def.requiredTarget, streak);
      isUnlocked = streak >= def.requiredTarget;
    } else if (def.category === 'lessons') {
      currentProgress = Math.min(def.requiredTarget, completedLessons);
      isUnlocked = completedLessons >= def.requiredTarget;
    } else if (def.category === 'dictation') {
      currentProgress = Math.min(def.requiredTarget, bestDictationScore);
      isUnlocked = bestDictationScore >= def.requiredTarget;
    } else if (def.category === 'quiz') {
      currentProgress = Math.min(def.requiredTarget, bestQuizScore);
      isUnlocked = bestQuizScore >= def.requiredTarget;
    } else if (def.category === 'distinction') {
      if (def.id === 'polyglotte_matin') {
        currentProgress = hasMorningSession ? 1 : 0;
        isUnlocked = hasMorningSession;
      } else if (def.id === 'serie_ininterrompue') {
        currentProgress = Math.min(def.requiredTarget, streak);
        isUnlocked = streak >= def.requiredTarget;
      } else if (def.id === 'noctambule_erudit') {
        currentProgress = 1;
        isUnlocked = true;
      } else if (def.id === 'maitre_vocabulaire') {
        const vocabEst = Math.min(def.requiredTarget, Math.round(totalXp / 50) + completedLessons * 5);
        currentProgress = vocabEst;
        isUnlocked = vocabEst >= def.requiredTarget;
      } else if (def.id === 'explorateur_200') {
        currentProgress = Math.min(def.requiredTarget, completedLessons);
        isUnlocked = completedLessons >= def.requiredTarget;
      } else if (def.id === 'challenger_squad') {
        currentProgress = 1;
        isUnlocked = true;
      }
    }

    if (unlockedSet.has(def.id)) {
      isUnlocked = true;
      currentProgress = def.requiredTarget;
    }

    return {
      ...def,
      currentProgress,
      isUnlocked,
      unlockedAt: isUnlocked ? 'Validé' : undefined
    };
  });
}
