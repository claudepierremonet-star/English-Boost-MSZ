import type {
  AdventureIslandId,
  AdventureDifficultyTier,
  CEFRLevel,
  SkillKey
} from '../firebase/types';
import type { AppTheme } from '../theme/ThemeContext';

export type AdventureQuestionType =
  | 'multiple_choice'
  | 'pair_match'
  | 'sentence_build'
  | 'listening_audio'
  | 'speaking_prompt'
  | 'reading_passage'
  | 'writing_prompt';

export interface AdventurePairItem {
  id: string;
  left: string;
  right: string;
}

export interface AdventureQuestion {
  id: string;
  type: AdventureQuestionType;
  skillTested: SkillKey;
  cefrLevel: CEFRLevel;
  isRetentionCheck?: boolean; // Tests prior knowledge retention rather than speed
  promptFr: string;
  promptEn: string;
  passageTitle?: string;
  passageText?: string;
  audioScript?: string;
  audioAccent?: 'en-GB' | 'en-US';
  targetSpeechPhrase?: string;
  acceptedSpeechKeywords?: string[];
  options?: string[];
  correctIndex?: number;
  pairs?: AdventurePairItem[];
  sentenceTokens?: string[];
  expectedSentence?: string;
  writingMinWords?: number;
  writingRequiredKeywords?: string[];
  writingModelAnswer?: string;
  hintFr: string;
  explanationFr: string;
  grammarRule?: string;
}

export type AdventureMissionKind =
  | 'learning_mission'
  | 'mini_game'
  | 'unlockable_challenge'
  | 'boss_challenge';

export interface AdventureMission {
  id: string;
  islandId: AdventureIslandId;
  order: number;
  kind: AdventureMissionKind;
  kindLabelFr: string;
  title: string;
  objectiveFr: string;
  cefrLevel: CEFRLevel;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  passAccuracyRequired: number; // e.g. 60 for normal, 70 for boss
  baseXp: number;
  baseCoins: number;
  prerequisiteMissionIds: string[];
  questions: AdventureQuestion[];
  masteryBonusQuestions?: AdventureQuestion[]; // Added automatically in 'mastery' adaptive tier
}

export interface AdventureIsland {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  id: AdventureIslandId;
  name: string;
  frenchSubtitle: string;
  territoryLore: string;
  skillFocus: SkillKey | 'advanced';
  skillLabelFr: string;
  cefrRange: string;
  accentHex: string;
  secondaryHex: string;
  icon: string;
  motif: 'citadel' | 'castle' | 'lighthouse' | 'amphitheater' | 'forest' | 'academy' | 'observatory';
  coords: { xPct: number; yPct: number; elevation: number };
  bossName: string;
  bossTitle: string;
  unlocksNextIslandId?: AdventureIslandId;
  rewardTrophyId: string;
  rewardCardId: string;
  rewardAvatarId?: string;
  rewardThemeId?: string;
  missions: AdventureMission[];
  scaffoldedPracticeQuestions: AdventureQuestion[];
}

export interface AdventureTrophy {
  id: string;
  title: string;
  subtitle: string;
  descriptionFr: string;
  icon: string;
  tier: 'silver' | 'gold' | 'platinum' | 'imperial';
  unlockConditionFr: string;
}

export interface AdventureCollectibleCard {
  id: string;
  name: string;
  islandId: AdventureIslandId;
  serialPrefix: string;
  rarity: 'Rare' | 'Épique' | 'Légendaire' | 'Impériale';
  loreFr: string;
  englishMotto: string;
  accentHex: string;
  icon: string;
}

export interface AdventureAvatar {
  id: string;
  name: string;
  titleFr: string;
  icon: string;
  accentHex: string;
  bgGradient: string;
  unlockRequirementFr: string;
}

export interface AdventureThemeReward {
  id: AppTheme;
  name: string;
  subtitleFr: string;
  previewBg: string;
  previewAccent: string;
  unlockRequirementFr: string;
}

export const ADVENTURE_TROPHIES: AdventureTrophy[] = [
  {
    id: 'trophy_vocab_king',
    title: 'Sceptre du Lexique',
    subtitle: 'Vocabulary Kingdom',
    descriptionFr: 'Décerné pour avoir triomphé du Souverain du Lexique avec précision sémantique.',
    icon: 'auto_stories',
    tier: 'silver',
    unlockConditionFr: 'Vaincre le Boss de l’Île 1 (≥ 70% de précision)'
  },
  {
    id: 'trophy_grammar_castle',
    title: 'Clé du Donjon Syntaxique',
    subtitle: 'Grammar Castle',
    descriptionFr: 'Décerné aux architectes maîtrisant temps, modaux et structure complexe.',
    icon: 'castle',
    tier: 'silver',
    unlockConditionFr: 'Vaincre le Boss de l’Île 2 (≥ 70% de précision)'
  },
  {
    id: 'trophy_listening_ocean',
    title: 'Astrolabe Acoustique',
    subtitle: 'Listening Ocean',
    descriptionFr: 'Récompense une écoute fine des accents britannique et américain sans précipitation.',
    icon: 'hearing',
    tier: 'gold',
    unlockConditionFr: 'Vaincre le Boss de l’Île 3 (≥ 70% de précision)'
  },
  {
    id: 'trophy_speaking_city',
    title: 'Laurier de l’Orateur',
    subtitle: 'Speaking City',
    descriptionFr: 'Distingue l’élocution claire, la nuance conversationnelle et le registre adapté.',
    icon: 'record_voice_over',
    tier: 'gold',
    unlockConditionFr: 'Vaincre le Boss de l’Île 4 (≥ 70% de précision)'
  },
  {
    id: 'trophy_reading_forest',
    title: 'Lanternes des Archives',
    subtitle: 'Reading Forest',
    descriptionFr: 'Honore l’analyse logique et l’interprétation fidèle de textes authentiques.',
    icon: 'menu_book',
    tier: 'platinum',
    unlockConditionFr: 'Vaincre le Boss de l’Île 5 (≥ 70% de précision)'
  },
  {
    id: 'trophy_writing_academy',
    title: 'Plume de Chancellerie',
    subtitle: 'Writing Academy',
    descriptionFr: 'Consacre la cohérence argumentative, la précision lexicale et l’élégance écrite.',
    icon: 'history_edu',
    tier: 'platinum',
    unlockConditionFr: 'Vaincre le Boss de l’Île 6 (≥ 70% de précision)'
  },
  {
    id: 'trophy_universe_crown',
    title: 'Couronne de l’Univers Anglais',
    subtitle: 'Advanced English Universe',
    descriptionFr: 'Distinction suprême pour la maîtrise transversale des 7 territoires.',
    icon: 'crown',
    tier: 'imperial',
    unlockConditionFr: 'Vaincre le Boss Final de l’Île 7'
  },
  {
    id: 'trophy_precision_100',
    title: 'Sceau d’Exactitude Pure',
    subtitle: 'Précision 100%',
    descriptionFr: 'Obtenir 100% de précision sur une mission sans chercher la vitesse.',
    icon: 'verified',
    tier: 'gold',
    unlockConditionFr: 'Réaliser 100% de précision sur n’importe quelle mission'
  },
  {
    id: 'trophy_consistency_streak',
    title: 'Constance Académique',
    subtitle: '3 Missions ≥ 85%',
    descriptionFr: 'Maintenir au moins 85% de justesse sur 3 missions consécutives.',
    icon: 'timeline',
    tier: 'platinum',
    unlockConditionFr: '3 missions réussies à ≥ 85% d’exactitude'
  }
];

export const ADVENTURE_CARDS: AdventureCollectibleCard[] = [
  {
    id: 'adv_card_lexicon',
    name: 'Chroniqueur des Collocations',
    islandId: 'vocabulary_kingdom',
    serialPrefix: 'ADV-VOCAB',
    rarity: 'Rare',
    loreFr: 'Gardien des alliances de mots justes et des registres subtils d’Oxford.',
    englishMotto: 'Precision of word shapes clarity of thought.',
    accentHex: '#f2ca50',
    icon: 'style'
  },
  {
    id: 'adv_card_syntax',
    name: 'Maître des Bâtisseurs',
    islandId: 'grammar_castle',
    serialPrefix: 'ADV-GRAM',
    rarity: 'Rare',
    loreFr: 'Sculpteur des propositions conditionnelles et des concordances temporelles.',
    englishMotto: 'Structure gives wings to complex ideas.',
    accentHex: '#38bdf8',
    icon: 'architecture'
  },
  {
    id: 'adv_card_sonar',
    name: 'Guetteur du Phare Atlantique',
    islandId: 'listening_ocean',
    serialPrefix: 'ADV-LISTEN',
    rarity: 'Épique',
    loreFr: 'Perçoit chaque intonation de Londres à Boston au cœur des brumes marines.',
    englishMotto: 'To listen deeply is to understand twice.',
    accentHex: '#2dd4bf',
    icon: 'waves'
  },
  {
    id: 'adv_card_orator',
    name: 'Héraut de la Cité Éloquente',
    islandId: 'speaking_city',
    serialPrefix: 'ADV-SPEAK',
    rarity: 'Épique',
    loreFr: 'Maîtrise la nuance diplomatique, le rythme et la prononciation naturelle.',
    englishMotto: 'Speak with calm assurance and measured grace.',
    accentHex: '#fb923c',
    icon: 'campaign'
  },
  {
    id: 'adv_card_archive',
    name: 'Archiviste de la Canopée',
    islandId: 'reading_forest',
    serialPrefix: 'ADV-READ',
    rarity: 'Légendaire',
    loreFr: 'Déchiffre l’implicite et les connecteurs logiques enfouis dans chaque essai.',
    englishMotto: 'Between the lines lies the author’s true intent.',
    accentHex: '#34d399',
    icon: 'park'
  },
  {
    id: 'adv_card_quill',
    name: 'Chancelier du Scriptorium',
    islandId: 'writing_academy',
    serialPrefix: 'ADV-WRITE',
    rarity: 'Légendaire',
    loreFr: 'Façonne des paragraphes PEEL rigoureux et des synthèses mémorables.',
    englishMotto: 'Every sentence ought to earn its place on the page.',
    accentHex: '#f472b6',
    icon: 'edit_note'
  },
  {
    id: 'adv_card_cosmos',
    name: 'Souverain de l’Univers Anglais',
    islandId: 'advanced_universe',
    serialPrefix: 'ADV-UNIV',
    rarity: 'Impériale',
    loreFr: 'Détient la synthèse des sept arts linguistiques de l’Archipel MSZ.',
    englishMotto: 'Mastery is built through patience, accuracy, and reflection.',
    accentHex: '#a78bfa',
    icon: 'planet'
  }
];

export const ADVENTURE_AVATARS: AdventureAvatar[] = [
  {
    id: 'avatar_scholar_initiate',
    name: 'Érudit de l’Archipel',
    titleFr: 'Emblème Initial',
    icon: 'school',
    accentHex: '#f2ca50',
    bgGradient: 'from-[#28334e] to-[#111827]',
    unlockRequirementFr: 'Disponible dès le départ'
  },
  {
    id: 'avatar_lexicon_warden',
    name: 'Gardien du Lexique',
    titleFr: 'Île 1 Conquise',
    icon: 'auto_stories',
    accentHex: '#f2ca50',
    bgGradient: 'from-[#423210] to-[#171c2b]',
    unlockRequirementFr: 'Vaincre le Boss du Vocabulary Kingdom'
  },
  {
    id: 'avatar_atlantic_navigator',
    name: 'Navigateur Atlantique',
    titleFr: 'Île 3 Conquise',
    icon: 'sailing',
    accentHex: '#2dd4bf',
    bgGradient: 'from-[#0d3b3e] to-[#0c1322]',
    unlockRequirementFr: 'Vaincre le Boss de Listening Ocean'
  },
  {
    id: 'avatar_eloquent_envoy',
    name: 'Émissaire Éloquent',
    titleFr: 'Île 4 Conquise',
    icon: 'record_voice_over',
    accentHex: '#fb923c',
    bgGradient: 'from-[#45210e] to-[#151b2b]',
    unlockRequirementFr: 'Vaincre le Boss de Speaking City'
  },
  {
    id: 'avatar_grand_chancellor',
    name: 'Chancelier des Lettres',
    titleFr: 'Île 6 Conquise',
    icon: 'history_edu',
    accentHex: '#f472b6',
    bgGradient: 'from-[#3d1734] to-[#151b2b]',
    unlockRequirementFr: 'Vaincre le Boss de Writing Academy'
  },
  {
    id: 'avatar_celestial_sovereign',
    name: 'Souverain Céleste',
    titleFr: 'Maître des 7 Îles',
    icon: 'crown',
    accentHex: '#a78bfa',
    bgGradient: 'from-[#2f1d59] to-[#0c1322]',
    unlockRequirementFr: 'Vaincre le Boss de l’Advanced English Universe'
  }
];

export const ADVENTURE_THEMES: AdventureThemeReward[] = [
  {
    id: 'parchment-royal',
    name: 'Parchemin Royal',
    subtitleFr: 'Ivoire parcheminé & laiton doré (Clair)',
    previewBg: '#f4efe3',
    previewAccent: '#9a6700',
    unlockRequirementFr: 'Vaincre le Boss de Grammar Castle (Île 2)'
  },
  {
    id: 'sapphire-ocean',
    name: 'Saphir Atlantique',
    subtitleFr: 'Abysses marines & lueur cyan horlogère',
    previewBg: '#061124',
    previewAccent: '#38bdf8',
    unlockRequirementFr: 'Vaincre le Boss de Listening Ocean (Île 3)'
  },
  {
    id: 'emerald-grove',
    name: 'Émeraude de la Canopée',
    subtitleFr: 'Forêt nocturne émeraude & or antique',
    previewBg: '#061411',
    previewAccent: '#34d399',
    unlockRequirementFr: 'Vaincre le Boss de Reading Forest (Île 5)'
  },
  {
    id: 'obsidian-imperial',
    name: 'Obsidienne Impériale',
    subtitleFr: 'Nuit cosmique améthyste & or impérial',
    previewBg: '#0c0918',
    previewAccent: '#a78bfa',
    unlockRequirementFr: 'Vaincre le Boss Final de l’Île 7'
  }
];

export const ADVENTURE_ISLANDS: AdventureIsland[] = [
  // =========================================================================
  // ISLAND 1: VOCABULARY KINGDOM
  // =========================================================================
  {
    number: 1,
    id: 'vocabulary_kingdom',
    name: 'Vocabulary Kingdom',
    frenchSubtitle: 'Le Royaume du Lexique & des Collocations',
    territoryLore:
      'Une citadelle suspendue où chaque mot s’assemble par affinités naturelles, nuances sémantiques et précision académique.',
    skillFocus: 'vocabulary',
    skillLabelFr: 'Vocabulaire & Précision',
    cefrRange: 'A2 – B2',
    accentHex: '#f2ca50',
    secondaryHex: '#b4830c',
    icon: 'auto_stories',
    motif: 'citadel',
    coords: { xPct: 16, yPct: 79, elevation: 18 },
    bossName: 'Lord Lexicon Aurelius',
    bossTitle: 'Souverain des Alliances de Mots',
    unlocksNextIslandId: 'grammar_castle',
    rewardTrophyId: 'trophy_vocab_king',
    rewardCardId: 'adv_card_lexicon',
    rewardAvatarId: 'avatar_lexicon_warden',
    scaffoldedPracticeQuestions: [
      {
        id: 'vk-scaf-1',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'A2',
        promptFr: 'Soutien guidé : Quelle préposition accompagne toujours l’adjectif « interested » ?',
        promptEn: 'She is deeply interested ___ sustainable architecture.',
        options: ['on', 'in', 'at', 'to'],
        correctIndex: 1,
        hintFr: 'En anglais, on dit « interested IN something » (jamais « on » ni « at »).',
        explanationFr: 'On emploie systématiquement « interested in » suivi d’un nom ou d’un verbe en -ing.',
        grammarRule: 'Adjectif + préposition fixe : interested IN / keen ON / fond OF.'
      },
      {
        id: 'vk-scaf-2',
        type: 'multiple_choice',
        skillTested: 'vocabulary',
        cefrLevel: 'B1',
        promptFr: 'Soutien guidé : Quel verbe forme la collocation naturelle avec « a decision » ?',
        promptEn: 'Before we ___ a final decision, let us review the evidence.',
        options: ['do', 'make', 'create', 'put'],
        correctIndex: 1,
        hintFr: 'On utilise « make » pour créer un choix, un plan ou une décision.',
        explanationFr: 'La collocation authentique est « make a decision » (et jamais *do a decision).',
        grammarRule: 'MAKE a decision / a choice / progress vs DO homework / research.'
      }
    ],
    missions: [
      {
        id: 'vk-m1',
        islandId: 'vocabulary_kingdom',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Mission d’Apprentissage',
        title: 'Collocations & Faux-Amis',
        objectiveFr: 'Distinguer les alliances lexicales justes et éviter les faux-amis français-anglais.',
        cefrLevel: 'B1',
        difficultyRating: 1,
        passAccuracyRequired: 60,
        baseXp: 70,
        baseCoins: 12,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'vk-m1-q1',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B1',
            promptFr: 'Choisissez l’expression anglaise authentique (attention au faux-ami « actually »).',
            promptEn: '« En réalité, le rapport contient des données inédites. » → ___, the report contains unprecedented data.',
            options: ['Actually', 'Currently', 'Presently', 'Eventually'],
            correctIndex: 0,
            hintFr: '« Actually » signifie « en fait / en réalité », tandis que « currently » signifie « actuellement ».',
            explanationFr: '« Actually » traduit « en réalité / en fait ». « Currently » traduit « actuellement ».'
          },
          {
            id: 'vk-m1-q2',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B1',
            promptFr: 'Complétez avec la collocation exacte :',
            promptEn: 'The scientists ___ extensive research on renewable batteries.',
            options: ['made', 'conducted', 'fabricated', 'acted'],
            correctIndex: 1,
            hintFr: 'Avec « research », on utilise « conduct » ou « carry out » (jamais *make).',
            explanationFr: 'On dit « conduct research » ou « do research », jamais « make research ».'
          },
          {
            id: 'vk-m1-q3',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Rappel sémantique : Que signifie « comprehensive » dans un contexte académique ?',
            promptEn: 'The ministry published a comprehensive guide to climate policy.',
            options: [
              'Compréhensif et indulgent',
              'Complet et approfondi',
              'Difficile à comprendre',
              'Très court et résumé'
            ],
            correctIndex: 1,
            hintFr: '« Comprehensive » est un faux-ami célèbre : pensez à « qui englobe tout ».',
            explanationFr: '« Comprehensive » signifie complet / exhaustif (tandis que « compréhensif » se dit « understanding »).'
          },
          {
            id: 'vk-m1-q4',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            promptFr: 'Sélectionnez le verbe le plus précis :',
            promptEn: 'Early exposure to spoken English helps ___ lasting confidence.',
            options: ['foster', 'lend', 'borrow', 'assist'],
            correctIndex: 0,
            hintFr: 'Cherchez un verbe signifiant « favoriser / nourrir le développement de ».',
            explanationFr: '« Foster confidence / creativity » signifie favoriser et cultiver durablement.'
          }
        ],
        masteryBonusQuestions: [
          {
            id: 'vk-m1-m1',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'C1',
            promptFr: 'Défi Maîtrise : Choisissez le mot juste pour « rendre un argument plus convaincant / appuyer » :',
            promptEn: 'Clear historical examples will ___ your thesis during the debate.',
            options: ['bolster', 'dwindle', 'waive', 'evade'],
            correctIndex: 0,
            hintFr: '« Bolster » vient de l’idée de soutien / renfort structurel.',
            explanationFr: '« Bolster an argument » signifie étayer solidement une argumentation.'
          }
        ]
      },
      {
        id: 'vk-m2',
        islandId: 'vocabulary_kingdom',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Forge Lexicale',
        title: 'Synapse Pair Forge',
        objectiveFr: 'Associer chaque terme académique anglais à son équivalent ou nuance précise.',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 80,
        baseCoins: 14,
        prerequisiteMissionIds: ['vk-m1'],
        questions: [
          {
            id: 'vk-m2-q1',
            type: 'pair_match',
            skillTested: 'vocabulary',
            cefrLevel: 'B1',
            promptFr: 'Reliez chaque adjectif anglais à sa définition précise :',
            promptEn: 'Match each English word to its accurate French meaning.',
            pairs: [
              { id: 'p1', left: 'Reluctant', right: 'Réticent / peu disposé' },
              { id: 'p2', left: 'Scarce', right: 'Rare / insuffisant' },
              { id: 'p3', left: 'Thorough', right: 'Rigoureux / minutieux' },
              { id: 'p4', left: 'Reliable', right: 'Fiable / digne de confiance' }
            ],
            hintFr: '« Thorough » ressemble visuellement à « through » : un travail mené jusqu’au bout.',
            explanationFr: 'Reluctant (réticent), Scarce (rare), Thorough (minutieux), Reliable (fiable) sont essentiels dès le niveau B1.'
          },
          {
            id: 'vk-m2-q2',
            type: 'pair_match',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Associez ces collocations à leur contexte naturel :',
            promptEn: 'Pair each verb with the noun it naturally collocates with.',
            pairs: [
              { id: 'c1', left: 'Alleviate', right: 'poverty / pain' },
              { id: 'c2', left: 'Bridge', right: 'the cultural gap' },
              { id: 'c3', left: 'Meet', right: 'a strict deadline' },
              { id: 'c4', left: 'Raise', right: 'public awareness' }
            ],
            hintFr: 'On « comble un fossé » (bridge a gap) et on « respecte une échéance » (meet a deadline).',
            explanationFr: 'Ces quatre collocations valorisent immédiatement vos copies et prestations orales.'
          }
        ]
      },
      {
        id: 'vk-m3',
        islandId: 'vocabulary_kingdom',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Nuance & Register Vault',
        objectiveFr: 'Passer du registre familier au registre soutenu avec exactitude.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 65,
        baseXp: 95,
        baseCoins: 16,
        prerequisiteMissionIds: ['vk-m1', 'vk-m2'],
        questions: [
          {
            id: 'vk-m3-q1',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            promptFr: 'Remplacez « get better » par l’équivalent formel le plus juste :',
            promptEn: 'Targeted feedback helps students ___ their writing accuracy.',
            options: ['enhance', 'enlarge', 'happen', 'assist'],
            correctIndex: 0,
            hintFr: '« Enhance » signifie améliorer qualitativement.',
            explanationFr: '« Enhance » s’emploie pour améliorer la qualité, la précision ou la valeur d’une compétence.'
          },
          {
            id: 'vk-m3-q2',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Rappel des faux-amis : Que signifie « eventually » ?',
            promptEn: 'After months of practice, he eventually spoke effortlessly.',
            options: ['Éventuellement', 'Finalement / au bout du compte', 'Soudainement', 'Rarement'],
            correctIndex: 1,
            hintFr: 'Pour dire « éventuellement », on utilise « possibly » ou « perhaps ».',
            explanationFr: '« Eventually » signifie toujours « finalement / à terme ».'
          },
          {
            id: 'vk-m3-q3',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'C1',
            promptFr: 'Quel adjectif décrit un changement « omniprésent dans la société » ?',
            promptEn: 'Smartphones have become ___ in modern classrooms.',
            options: ['ubiquitous', 'ambiguous', 'ephemeral', 'mundane'],
            correctIndex: 0,
            hintFr: 'Du latin « ubique » (partout).',
            explanationFr: '« Ubiquitous » signifie omniprésent (très apprécié au niveau C1).'
          }
        ]
      },
      {
        id: 'vk-boss',
        islandId: 'vocabulary_kingdom',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Souverain du Lexique',
        objectiveFr: 'Combiner vocabulaire, lecture contextuelle et collocation écrite pour ouvrir Grammar Castle.',
        cefrLevel: 'B2',
        difficultyRating: 4,
        passAccuracyRequired: 70,
        baseXp: 140,
        baseCoins: 25,
        prerequisiteMissionIds: ['vk-m3'],
        questions: [
          {
            id: 'vk-boss-q1',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'B2',
            passageTitle: 'The Architecture of Precision',
            passageText:
              'When learners rely solely on broad words such as "good" or "thing", their ideas lose nuance. Choosing "compelling" instead of "good" immediately signals analytical maturity.',
            promptFr: 'Selon cet extrait, pourquoi remplacer « good » par « compelling » ?',
            promptEn: 'What effect does replacing generic words with precise vocabulary have?',
            options: [
              'It makes sentences artificially long.',
              'It preserves nuance and shows analytical maturity.',
              'It avoids using any adjectives.',
              'It replaces grammar rules.'
            ],
            correctIndex: 1,
            hintFr: 'Relisez la seconde phrase : « immediately signals analytical maturity ».',
            explanationFr: 'Un lexique précis conserve la nuance de la pensée et démontre une maturité analytique.'
          },
          {
            id: 'vk-boss-q2',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Complétez cette phrase diplomatique :',
            promptEn: 'We must ___ a balance between innovation and academic rigour.',
            options: ['hit', 'strike', 'beat', 'touch'],
            correctIndex: 1,
            hintFr: 'L’expression consacrée utilise le verbe « strike ».',
            explanationFr: 'On dit « strike a balance » (trouver un juste équilibre).'
          },
          {
            id: 'vk-boss-q3',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'B1',
            promptFr: 'Assemblez la phrase en respectant la collocation étudiée :',
            promptEn: 'Arrange the tokens to form a natural English sentence.',
            sentenceTokens: ['Consistent', 'practice', 'fosters', 'lasting', 'confidence'],
            expectedSentence: 'Consistent practice fosters lasting confidence',
            hintFr: 'Sujet (« Consistent practice ») + verbe (« fosters ») + complément.',
            explanationFr: '« Consistent practice fosters lasting confidence » associe parfaitement adjectifs et verbe précis.'
          },
          {
            id: 'vk-boss-q4',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'B1',
            promptFr: 'Rédigez une phrase en anglais utilisant « make a decision » OU « raise awareness » :',
            promptEn: 'Write one clear English sentence containing either "make a decision" or "raise awareness".',
            writingMinWords: 6,
            writingRequiredKeywords: ['decision', 'awareness'],
            writingModelAnswer: 'Students should take time to gather facts before they make a decision.',
            hintFr: 'Exemple de structure : « Our school organized a project to raise awareness about… ».',
            explanationFr: 'L’emploi actif d’une collocation dans une phrase complète ancre durablement le mot en mémoire.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 2: GRAMMAR CASTLE
  // =========================================================================
  {
    number: 2,
    id: 'grammar_castle',
    name: 'Grammar Castle',
    frenchSubtitle: 'La Forteresse de la Syntaxe & des Temps',
    territoryLore:
      'Une citadelle de pierre bleue où chaque pont-levis s’abaisse par la justesse des temps verbaux, modaux et propositions.',
    skillFocus: 'grammar',
    skillLabelFr: 'Grammaire & Syntaxe',
    cefrRange: 'A2 – B2',
    accentHex: '#38bdf8',
    secondaryHex: '#0284c7',
    icon: 'castle',
    motif: 'castle',
    coords: { xPct: 41, yPct: 65, elevation: 24 },
    bossName: 'Sir Syntaxis Vance',
    bossTitle: 'Gardien de la Concordance',
    unlocksNextIslandId: 'listening_ocean',
    rewardTrophyId: 'trophy_grammar_castle',
    rewardCardId: 'adv_card_syntax',
    rewardThemeId: 'parchment-royal',
    scaffoldedPracticeQuestions: [
      {
        id: 'gc-scaf-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'A2',
        promptFr: 'Rappel de règle : Avec « since 2021 », quel temps exprime une action commencée dans le passé et toujours vraie ?',
        promptEn: 'I ___ English since 2021.',
        options: ['studied', 'have studied', 'am study', 'was studying'],
        correctIndex: 1,
        hintFr: 'Le repère « since + point de départ » appelle presque toujours le Present Perfect.',
        explanationFr: 'On emploie le Present Perfect (« have studied ») pour relier le passé au présent avec since/for.',
        grammarRule: 'SINCE + date/moment précis → Present Perfect (have/has + participe passé).'
      }
    ],
    missions: [
      {
        id: 'gc-m1',
        islandId: 'grammar_castle',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Mission d’Apprentissage',
        title: 'Temps & Aspects du Verbe',
        objectiveFr: 'Choisir sans hésitation entre Prétérit, Present Perfect et Past Perfect.',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 75,
        baseCoins: 14,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'gc-m1-q1',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B1',
            promptFr: 'Identifiez la forme verbale imposée par le marqueur temporel :',
            promptEn: 'Yesterday evening, she ___ her essay before dinner.',
            options: ['has finished', 'finished', 'finishes', 'had finish'],
            correctIndex: 1,
            hintFr: '« Yesterday evening » est un moment révolu et daté dans le passé.',
            explanationFr: 'Tout marqueur passé daté et coupé du présent (« yesterday », « ago », « in 2019 ») impose le Prétérit simple.'
          },
          {
            id: 'gc-m1-q2',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B1',
            promptFr: 'Complétez avec la nuance d’antériorité :',
            promptEn: 'By the time the train arrived, we ___ already ___ our tickets.',
            options: ['have / bought', 'had / bought', 'were / buying', 'did / buy'],
            correctIndex: 1,
            hintFr: 'L’action d’acheter les billets s’est produite AVANT l’arrivée du train au passé.',
            explanationFr: 'Le Past Perfect (« had + participe passé ») exprime le passé du passé.'
          },
          {
            id: 'gc-m1-q3',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Rappel critique : Choisissez entre « for » et « since » :',
            promptEn: 'They have lived in Edinburgh ___ nearly six years.',
            options: ['since', 'for', 'during', 'ago'],
            correctIndex: 1,
            hintFr: '« Nearly six years » désigne une durée, pas un point de départ.',
            explanationFr: 'FOR + durée (six years) ; SINCE + point de départ (2018).'
          }
        ]
      },
      {
        id: 'gc-m2',
        islandId: 'grammar_castle',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Architecte Syntaxique',
        title: 'Syntax Architect',
        objectiveFr: 'Reconstruire des phrases anglaises impeccables à partir de blocs mélangés.',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 85,
        baseCoins: 15,
        prerequisiteMissionIds: ['gc-m1'],
        questions: [
          {
            id: 'gc-m2-q1',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'B1',
            promptFr: 'Assemblez une question indirecte polie (attention à l’ordre sujet-verbe !) :',
            promptEn: 'Build a polite indirect question.',
            sentenceTokens: ['Could', 'you', 'tell', 'me', 'where', 'the', 'library', 'is?'],
            expectedSentence: 'Could you tell me where the library is?',
            hintFr: 'Dans une question indirecte (« Could you tell me where… »), on n’inverse pas « the library is ».',
            explanationFr: 'Après « Could you tell me where », la proposition subordonnée retrouve l’ordre Sujet + Verbe : « the library is ».'
          },
          {
            id: 'gc-m2-q2',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Construisez un conditionnel de type 2 (hypothèse irréelle au présent) :',
            promptEn: 'Construct a second conditional sentence.',
            sentenceTokens: ['If', 'she', 'practised', 'daily,', 'her', 'fluency', 'would', 'improve'],
            expectedSentence: 'If she practised daily, her fluency would improve',
            hintFr: 'Structure : If + Prétérit, Sujet + would + Base Verbale.',
            explanationFr: 'Le conditionnel 2 associe le prétérit modal dans la subordonnée en « if » et « would + BV » dans la principale.'
          }
        ]
      },
      {
        id: 'gc-m3',
        islandId: 'grammar_castle',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Bastion des Modaux & Conditionnels',
        objectiveFr: 'Maîtriser les nuances modales de probabilité et de regret passé.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 65,
        baseXp: 95,
        baseCoins: 16,
        prerequisiteMissionIds: ['gc-m1', 'gc-m2'],
        questions: [
          {
            id: 'gc-m3-q1',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Exprimez un regret par rapport au passé :',
            promptEn: 'I should ___ earlier for the speaking exam.',
            options: ['have prepared', 'prepare', 'had prepared', 'preparing'],
            correctIndex: 0,
            hintFr: 'Regret/reproche au passé = should have + participe passé.',
            explanationFr: '« Should have + past participle » exprime ce qu’il aurait fallu faire dans le passé.'
          },
          {
            id: 'gc-m3-q2',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Quelle proposition traduit une quasi-certitude logique au passé ?',
            promptEn: 'The lights are all off; they ___ already.',
            options: ['must leave', 'must have left', 'can have left', 'should leave'],
            correctIndex: 1,
            hintFr: 'Déduction forte sur un fait passé = must have + participe passé.',
            explanationFr: '« Must have left » exprime une déduction quasi certaine concernant une action passée.'
          }
        ]
      },
      {
        id: 'gc-boss',
        islandId: 'grammar_castle',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Gardien de la Syntaxe',
        objectiveFr: 'Prouver votre maîtrise grammaticale en compréhension, reconstruction et rédaction.',
        cefrLevel: 'B2',
        difficultyRating: 4,
        passAccuracyRequired: 70,
        baseXp: 150,
        baseCoins: 28,
        prerequisiteMissionIds: ['gc-m3'],
        questions: [
          {
            id: 'gc-boss-q1',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Choisissez la forme passive correcte :',
            promptEn: 'A new cultural bridge ___ in this district next year.',
            options: ['will build', 'will be built', 'is building', 'has built'],
            correctIndex: 1,
            hintFr: 'Un pont ne se construit pas lui-même : utilisez la voix passive au futur.',
            explanationFr: 'Voix passive au futur : « will be + participe passé (built) ».'
          },
          {
            id: 'gc-boss-q2',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Ordonnez cette phrase exprimant la concession :',
            promptEn: 'Assemble this concessive sentence accurately.',
            sentenceTokens: ['Although', 'the', 'task', 'seemed', 'complex,', 'they', 'succeeded'],
            expectedSentence: 'Although the task seemed complex, they succeeded',
            hintFr: '« Although » introduit directement une proposition (sujet + verbe), sans « of ».',
            explanationFr: '« Although + proposition » s’oppose à « Despite + nom/V-ing ».'
          },
          {
            id: 'gc-boss-q3',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Écrivez une phrase au Conditionnel 2 ou 3 commençant par « If » :',
            promptEn: 'Write a complete conditional sentence beginning with "If" using "would".',
            writingMinWords: 7,
            writingRequiredKeywords: ['if', 'would'],
            writingModelAnswer: 'If students reviewed their mistakes regularly, they would progress much faster.',
            hintFr: 'Utilisez « If + sujet + prétérit, sujet + would + verbe ».',
            explanationFr: 'La maîtrise active du conditionnel permet d’argumenter sur des hypothèses nuancées.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 3: LISTENING OCEAN
  // =========================================================================
  {
    number: 3,
    id: 'listening_ocean',
    name: 'Listening Ocean',
    frenchSubtitle: 'L’Océan de l’Écoute & des Accents UK/US',
    territoryLore:
      'Un archipel maritime guidé par des phares acoustiques où chaque onde sonore entraîne l’oreille aux rythmes britanniques et américains.',
    skillFocus: 'listening',
    skillLabelFr: 'Compréhension Orale',
    cefrRange: 'A2 – C1',
    accentHex: '#2dd4bf',
    secondaryHex: '#0d9488',
    icon: 'waves',
    motif: 'lighthouse',
    coords: { xPct: 72, yPct: 75, elevation: 22 },
    bossName: 'Captain Echo Maris',
    bossTitle: 'Navigateur des Ondes Atlantiques',
    unlocksNextIslandId: 'speaking_city',
    rewardTrophyId: 'trophy_listening_ocean',
    rewardCardId: 'adv_card_sonar',
    rewardAvatarId: 'avatar_atlantic_navigator',
    rewardThemeId: 'sapphire-ocean',
    scaffoldedPracticeQuestions: [
      {
        id: 'lo-scaf-1',
        type: 'listening_audio',
        skillTested: 'listening',
        cefrLevel: 'A2',
        audioAccent: 'en-GB',
        audioScript: 'Excuse me, the museum closes at half past five, not at six.',
        promptFr: 'Écoute guidée (vitesse adaptée) : À quelle heure ferme le musée ?',
        promptEn: 'Listen carefully and identify the closing time.',
        options: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'],
        correctIndex: 1,
        hintFr: '« Half past five » signifie « cinq heures et demie » (5:30).',
        explanationFr: '« Half past five » correspond à 17h30 (5:30 PM). Attention aux négations finales (« not at six »).'
      }
    ],
    missions: [
      {
        id: 'lo-m1',
        islandId: 'listening_ocean',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Mission Acoustique',
        title: 'Échos de Londres & Boston',
        objectiveFr: 'Repérer les informations clés, horaires et intentions implicites à l’oral.',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 80,
        baseCoins: 15,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'lo-m1-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B1',
            audioAccent: 'en-GB',
            audioScript: 'Although the forecast promised sunshine, we had better carry an umbrella just in case.',
            promptFr: 'Écoutez la phrase britannique et identifiez le conseil donné :',
            promptEn: 'What does the speaker advise doing?',
            options: [
              'Leaving the umbrella at home because of the sun',
              'Bringing an umbrella despite the sunny forecast',
              'Cancelling the trip immediately',
              'Checking the forecast tomorrow'
            ],
            correctIndex: 1,
            hintFr: 'Repérez le connecteur « Although » et l’expression « had better carry ».',
            explanationFr: '« Had better carry an umbrella just in case » signifie qu’il vaut mieux prendre un parapluie par précaution.'
          },
          {
            id: 'lo-m1-q2',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B1',
            audioAccent: 'en-US',
            audioScript: 'I would have called you earlier, except my battery died right before the meeting.',
            promptFr: 'Écoutez la phrase américaine : Pourquoi l’interlocuteur n’a-t-il pas appelé ?',
            promptEn: 'Why did the speaker fail to call earlier?',
            options: [
              'They forgot about the meeting.',
              'Their phone battery ran out right before the meeting.',
              'The meeting was postponed.',
              'They were already on the phone.'
            ],
            correctIndex: 1,
            hintFr: 'Écoutez « my battery died ».',
            explanationFr: 'En anglais courant, « my battery died » signifie que le téléphone n’avait plus de batterie.'
          },
          {
            id: 'lo-m1-q3',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B2',
            audioAccent: 'en-GB',
            audioScript: 'Rarely have I seen an audience respond with such thoughtful questions.',
            promptFr: 'Quelle est l’attitude de l’orateur envers le public ?',
            promptEn: 'How does the speaker feel about the audience?',
            options: [
              'Impressed by their insightful questions',
              'Disappointed by their silence',
              'Confused by the schedule',
              'Annoyed by the interruptions'
            ],
            correctIndex: 0,
            hintFr: 'Notez l’inversion admirative « Rarely have I seen… » et l’adjectif « thoughtful ».',
            explanationFr: '« Rarely have I seen… » exprime l’admiration devant la qualité (« thoughtful ») des questions.'
          }
        ]
      },
      {
        id: 'lo-m2',
        islandId: 'listening_ocean',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Sonar Phonétique',
        title: 'Sonar Minimal Pairs',
        objectiveFr: 'Distinguer à l’oreille les paires minimales et accents toniques critiques.',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 85,
        baseCoins: 15,
        prerequisiteMissionIds: ['lo-m1'],
        questions: [
          {
            id: 'lo-m2-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B1',
            audioAccent: 'en-GB',
            audioScript: 'The coastal sheep grazed quietly along the emerald hillside.',
            promptFr: 'Quel mot venez-vous d’entendre dans l’énoncé ?',
            promptEn: 'Identify the exact word spoken in context.',
            options: ['ship (navire)', 'sheep (mouton)', 'cheap (bon marché)', 'shape (forme)'],
            correctIndex: 1,
            hintFr: 'Voyelle longue /iː/ + contexte pastoral (« grazed » = broutaient).',
            explanationFr: '« Sheep » (/ʃiːp/) a un /iː/ tendu et long, à la différence de « ship » (/ʃɪp/) bref.'
          },
          {
            id: 'lo-m2-q2',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B2',
            audioAccent: 'en-US',
            audioScript: 'We cannot afford to lose momentum right before the final presentation.',
            promptFr: 'Quel mot a été prononcé après « afford to » ?',
            promptEn: 'Choose the exact verb heard in the recording.',
            options: ['loose (lâche)', 'lose (perdre)', 'lost (perdu)', 'choose (choisir)'],
            correctIndex: 1,
            hintFr: 'Le verbe « lose » (/luːz/) s’écrit avec un seul « o » et se prononce avec un /z/ sonore.',
            explanationFr: '« Lose » (/luːz/, perdre) ≠ « loose » (/luːs/, desserré).'
          }
        ]
      },
      {
        id: 'lo-m3',
        islandId: 'listening_ocean',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Bulletin d’Information Rapide',
        objectiveFr: 'Saisir les nuances d’un message analytique britannique sans support textuel initial.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 65,
        baseXp: 100,
        baseCoins: 18,
        prerequisiteMissionIds: ['lo-m1', 'lo-m2'],
        questions: [
          {
            id: 'lo-m3-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B2',
            audioAccent: 'en-GB',
            audioScript: 'While urban cycling has surged by twenty percent, planners warn that safe lanes remain unevenly distributed.',
            promptFr: 'Que soulignent les urbanistes malgré la hausse du vélo en ville ?',
            promptEn: 'What concern do city planners raise?',
            options: [
              'Cycling rates have dropped sharply.',
              'Safe cycling lanes are not evenly available everywhere.',
              'Bicycles will be banned downtown.',
              'Public transport is completely free.'
            ],
            correctIndex: 1,
            hintFr: 'Écoutez la proposition après « warn that » (« unevenly distributed »).',
            explanationFr: '« Unevenly distributed » indique une répartition inégale des pistes sécurisées.'
          },
          {
            id: 'lo-m3-q2',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'C1',
            audioAccent: 'en-US',
            audioScript: 'At first glance the proposal appears costly; however, its long-term maintenance savings are substantial.',
            promptFr: 'Quelle est la conclusion principale de l’analyse économique ?',
            promptEn: 'What is the speaker’s main conclusion about the proposal?',
            options: [
              'It is far too expensive in the long run.',
              'Long-term maintenance savings outweigh the initial cost.',
              'It should be abandoned immediately.',
              'Maintenance costs will double next year.'
            ],
            correctIndex: 1,
            hintFr: 'Le pivot « however » annonce l’argument décisif sur les économies à long terme.',
            explanationFr: 'Malgré un coût initial apparent, les économies de maintenance à long terme sont substantielles.'
          }
        ]
      },
      {
        id: 'lo-boss',
        islandId: 'listening_ocean',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Léviathan des Détroits',
        objectiveFr: 'Combiner compréhension orale UK/US, vocabulaire et syntaxe pour atteindre Speaking City.',
        cefrLevel: 'B2',
        difficultyRating: 4,
        passAccuracyRequired: 70,
        baseXp: 155,
        baseCoins: 28,
        prerequisiteMissionIds: ['lo-m3'],
        questions: [
          {
            id: 'lo-boss-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B2',
            audioAccent: 'en-GB',
            audioScript: 'Provided that every member submits their notes by Friday, the committee can publish the synthesis on Monday.',
            promptFr: 'À quelle condition la synthèse sera-t-elle publiée lundi ?',
            promptEn: 'Under what condition will the committee publish on Monday?',
            options: [
              'If every member submits their notes by Friday',
              'If the meeting is moved to next month',
              'Only if nobody sends any notes',
              'Provided that Friday is a holiday'
            ],
            correctIndex: 0,
            hintFr: '« Provided that » signifie « à condition que ».',
            explanationFr: '« Provided that » exprime la condition indispensable (« à condition que »).'
          },
          {
            id: 'lo-boss-q2',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Quel synonyme de « on condition that » venez-vous d’entendre ?',
            promptEn: 'Which formal expression introduces a strict condition?',
            options: ['Provided that', 'Despite the fact', 'Whereas', 'Meanwhile'],
            correctIndex: 0,
            hintFr: 'Pensez à l’expression entendue à la question précédente.',
            explanationFr: '« Provided that » (tout comme « as long as ») introduit une condition formelle.'
          },
          {
            id: 'lo-boss-q3',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'B2',
            promptFr: 'Reconstruisez une phrase avec « Despite » :',
            promptEn: 'Build an accurate English sentence with "Despite".',
            sentenceTokens: ['Despite', 'the', 'heavy', 'rain,', 'the', 'ferry', 'departed', 'on', 'time'],
            expectedSentence: 'Despite the heavy rain, the ferry departed on time',
            hintFr: '« Despite » est suivi directement d’un groupe nominal (« the heavy rain »).',
            explanationFr: 'Règle clé : « Despite + nom » (jamais *Despite of).'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 4: SPEAKING CITY
  // =========================================================================
  {
    number: 4,
    id: 'speaking_city',
    name: 'Speaking City',
    frenchSubtitle: 'La Métropole de l’Élocution & du Dialogue',
    territoryLore:
      'Une métropole lumineuse d’amphithéâtres où la voix, le registre diplomatique et la fluidité orale ouvrent toutes les portes.',
    skillFocus: 'speaking',
    skillLabelFr: 'Expression Orale & Phonétique',
    cefrRange: 'B1 – C1',
    accentHex: '#fb923c',
    secondaryHex: '#ea580c',
    icon: 'record_voice_over',
    motif: 'amphitheater',
    coords: { xPct: 83, yPct: 48, elevation: 30 },
    bossName: 'Magistrate Clara Sterling',
    bossTitle: 'Maire de l’Éloquence Urbaine',
    unlocksNextIslandId: 'reading_forest',
    rewardTrophyId: 'trophy_speaking_city',
    rewardCardId: 'adv_card_orator',
    rewardAvatarId: 'avatar_eloquent_envoy',
    scaffoldedPracticeQuestions: [
      {
        id: 'sc-scaf-1',
        type: 'multiple_choice',
        skillTested: 'speaking',
        cefrLevel: 'A2',
        promptFr: 'Soutien oral : Quelle formule polie utiliser pour demander une répétition sans brusquer ?',
        promptEn: 'Choose the most polite and natural spoken phrasing.',
        options: [
          'Repeat again!',
          'Could you possibly say that again, please?',
          'What you say?',
          'Speak slowly now.'
        ],
        correctIndex: 1,
        hintFr: 'En anglais, « Could you possibly…? » adoucit immédiatement la demande.',
        explanationFr: '« Could you possibly say that again, please? » est poli, idiomatique et fluide.'
      }
    ],
    missions: [
      {
        id: 'sc-m1',
        islandId: 'speaking_city',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Studio d’Élocution',
        title: 'Place des Orateurs (Voix & Phrasé)',
        objectiveFr: 'Prononcer des phrases naturelles au micro (ou via validation textuelle de secours).',
        cefrLevel: 'B1',
        difficultyRating: 2,
        passAccuracyRequired: 60,
        baseXp: 85,
        baseCoins: 16,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'sc-m1-q1',
            type: 'speaking_prompt',
            skillTested: 'speaking',
            cefrLevel: 'B1',
            promptFr: 'Prononcez clairement cette phrase en anglais (ou saisissez-la si le micro est indisponible) :',
            promptEn: 'Read aloud with natural rhythm and clear articulation:',
            targetSpeechPhrase: 'I would really appreciate your perspective on this issue.',
            acceptedSpeechKeywords: ['appreciate', 'perspective', 'issue'],
            hintFr: 'Mettez l’accent tonique sur ap-PRE-ciate et per-SPEC-tive.',
            explanationFr: 'Cette formulation polie structure parfaitement une prise de parole en réunion ou en débat.'
          },
          {
            id: 'sc-m1-q2',
            type: 'speaking_prompt',
            skillTested: 'pronunciation',
            cefrLevel: 'B1',
            promptFr: 'Articulez le son /θ/ (« th » sourd) dans cette phrase :',
            promptEn: 'Speak clearly, distinguishing the "th" sound:',
            targetSpeechPhrase: 'Through thoughtful reflection, both authors reached a balanced conclusion.',
            acceptedSpeechKeywords: ['through', 'thoughtful', 'authors', 'conclusion'],
            hintFr: 'Placez doucement la pointe de la langue entre les dents pour « Through » et « thoughtful ».',
            explanationFr: 'La maîtrise du son /θ/ et des voyelles longues distingue immédiatement une prononciation soignée.'
          }
        ]
      },
      {
        id: 'sc-m2',
        islandId: 'speaking_city',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Registres & Répliques',
        title: 'Switchboard des Registres',
        objectiveFr: 'Associer chaque situation sociale à la réplique anglaise la plus juste.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 60,
        baseXp: 90,
        baseCoins: 16,
        prerequisiteMissionIds: ['sc-m1'],
        questions: [
          {
            id: 'sc-m2-q1',
            type: 'pair_match',
            skillTested: 'speaking',
            cefrLevel: 'B2',
            promptFr: 'Reliez chaque intention de parole à l’expression idiomatique adaptée :',
            promptEn: 'Match each conversational intention to the natural spoken phrase.',
            pairs: [
              { id: 'sp1', left: 'Désaccord poli', right: 'I see your point, though I view it differently.' },
              { id: 'sp2', left: 'Gagner du temps', right: 'That is a compelling question; let me think.' },
              { id: 'sp3', left: 'Clarifier une idée', right: 'To put it another way, accuracy matters most.' },
              { id: 'sp4', left: 'Conclure un exposé', right: 'All things considered, balance drives fluency.' }
            ],
            hintFr: 'Repérez « I see your point » pour nuancer sans confrontation directe.',
            explanationFr: 'Ces marqueurs discursifs assurent une fluidité naturelle lors des oraux de lycée et entretiens.'
          },
          {
            id: 'sc-m2-q2',
            type: 'multiple_choice',
            skillTested: 'speaking',
            cefrLevel: 'B2',
            promptFr: 'En entretien ou examen oral, quelle transition évite les silences hésitants ?',
            promptEn: 'Choose the most authentic filler when organizing a complex answer:',
            options: [
              'Err, wait, I don’t know.',
              'From my perspective, there are two key factors to consider.',
              'Stop asking hard questions.',
              'French is easier here.'
            ],
            correctIndex: 1,
            hintFr: 'Annoncez votre plan (« two key factors ») dès les premiers mots.',
            explanationFr: 'Structurer à voix haute avec « From my perspective… two key factors » rassure et montre votre maîtrise.'
          }
        ]
      },
      {
        id: 'sc-m3',
        islandId: 'speaking_city',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Diplomatie Orale en Direct',
        objectiveFr: 'Produire une réplique argumentée claire à l’oral.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 65,
        baseXp: 105,
        baseCoins: 18,
        prerequisiteMissionIds: ['sc-m1', 'sc-m2'],
        questions: [
          {
            id: 'sc-m3-q1',
            type: 'speaking_prompt',
            skillTested: 'speaking',
            cefrLevel: 'B2',
            promptFr: 'Énoncez cette prise de position nuancée :',
            promptEn: 'Deliver this diplomatic argument smoothly:',
            targetSpeechPhrase: 'While technology accelerates access to knowledge, genuine mastery still requires patient practice.',
            acceptedSpeechKeywords: ['technology', 'knowledge', 'mastery', 'practice'],
            hintFr: 'Marquez une légère pause à la virgule après « knowledge ».',
            explanationFr: 'La pause prosodique après une subordonnée en « While » rend votre discours limpide.'
          },
          {
            id: 'sc-m3-q2',
            type: 'multiple_choice',
            skillTested: 'pronunciation',
            cefrLevel: 'B2',
            promptFr: 'Où porte l’accent tonique principal dans le nom « phoTOgraphy » vs « PHOtograph » ?',
            promptEn: 'Where does the primary stress fall in the word "photography"?',
            options: ['1re syllabe (PHO-tography)', '2e syllabe (pho-TOG-raphy)', '3e syllabe (pho-to-GRA-phy)', '4e syllabe'],
            correctIndex: 1,
            hintFr: 'Les mots en -graphy portent presque toujours l’accent sur la syllabe juste avant -graphy.',
            explanationFr: 'PHOtograph (1re) → phoTOgraphy (2e) → photoGRAPHic (3e).'
          }
        ]
      },
      {
        id: 'sc-boss',
        islandId: 'speaking_city',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Maire de l’Éloquence',
        objectiveFr: 'Maîtriser écoute, phonétique et prise de parole structurée pour entrer dans Reading Forest.',
        cefrLevel: 'B2',
        difficultyRating: 4,
        passAccuracyRequired: 70,
        baseXp: 160,
        baseCoins: 30,
        prerequisiteMissionIds: ['sc-m3'],
        questions: [
          {
            id: 'sc-boss-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'B2',
            audioAccent: 'en-US',
            audioScript: 'Before jumping to conclusions, let us examine both sides of the debate objectively.',
            promptFr: 'Écoutez la réplique du Maire : Quelle démarche recommande-t-elle ?',
            promptEn: 'What does the speaker urge the panel to do?',
            options: [
              'Vote immediately without discussion',
              'Examine both sides objectively before concluding',
              'Ignore opposing arguments',
              'End the debate early'
            ],
            correctIndex: 1,
            hintFr: '« Jumping to conclusions » signifie conclure trop hâtivement.',
            explanationFr: 'L’expression « Before jumping to conclusions » appelle à l’objectivité.'
          },
          {
            id: 'sc-boss-q2',
            type: 'speaking_prompt',
            skillTested: 'speaking',
            cefrLevel: 'B2',
            promptFr: 'Prononcez cette réplique d’ouverture diplomatique :',
            promptEn: 'Speak (or type) the following diplomatic opening:',
            targetSpeechPhrase: 'To my mind, balanced communication depends on active listening as much as clear speaking.',
            acceptedSpeechKeywords: ['balanced', 'communication', 'listening', 'speaking'],
            hintFr: 'Articulez nettement « balanced communication ».',
            explanationFr: 'Vous combinez lexique de nuance (« To my mind ») et rythme équilibré.'
          },
          {
            id: 'sc-boss-q3',
            type: 'multiple_choice',
            skillTested: 'speaking',
            cefrLevel: 'B2',
            isRetentionCheck: true,
            promptFr: 'Quel marqueur signifie « autrement dit » pour reformuler à l’oral ?',
            promptEn: 'Which phrase signals a clear oral rephrasing?',
            options: ['To put it another way', 'Out of the blue', 'At any rate', 'By the way'],
            correctIndex: 0,
            hintFr: 'C’est une formule que vous avez croisée dans le mini-jeu Switchboard.',
            explanationFr: '« To put it another way » (ou « in other words ») clarifie élégamment votre propos.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 5: READING FOREST
  // =========================================================================
  {
    number: 5,
    id: 'reading_forest',
    name: 'Reading Forest',
    frenchSubtitle: 'La Forêt des Manuscrits & de l’Analyse',
    territoryLore:
      'Une canopée centenaire abritant essais littéraires, articles de presse et indices logiques tissés entre chaque paragraphe.',
    skillFocus: 'reading',
    skillLabelFr: 'Compréhension Écrite',
    cefrRange: 'B1 – C1',
    accentHex: '#34d399',
    secondaryHex: '#059669',
    icon: 'park',
    motif: 'forest',
    coords: { xPct: 57, yPct: 42, elevation: 32 },
    bossName: 'Archivist Sylvan Reed',
    bossTitle: 'Gardien des Archives Vivantes',
    unlocksNextIslandId: 'writing_academy',
    rewardTrophyId: 'trophy_reading_forest',
    rewardCardId: 'adv_card_archive',
    rewardThemeId: 'emerald-grove',
    scaffoldedPracticeQuestions: [
      {
        id: 'rf-scaf-1',
        type: 'reading_passage',
        skillTested: 'reading',
        cefrLevel: 'B1',
        passageTitle: 'Guided Reading Clue',
        passageText: 'Whereas paper maps show static roads, adaptive digital atlases update routes as learners progress.',
        promptFr: 'Soutien lecture : Quel rapport logique exprime « Whereas » en début de phrase ?',
        promptEn: 'What relationship does "Whereas" establish between paper maps and digital atlases?',
        options: ['Une cause', 'Une opposition / contraste', 'Une conséquence', 'Une chronologie'],
        correctIndex: 1,
        hintFr: '« Whereas » signifie « tandis que / alors que ».',
        explanationFr: '« Whereas » oppose deux réalités contrastées dans une même phrase.'
      }
    ],
    missions: [
      {
        id: 'rf-m1',
        islandId: 'reading_forest',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Mission d’Analyse',
        title: 'Canopée des Connecteurs',
        objectiveFr: 'Lire entre les lignes en décryptant opposition, concession et causalité.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 60,
        baseXp: 90,
        baseCoins: 16,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'rf-m1-q1',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'B2',
            passageTitle: 'Curiosity vs. Speed',
            passageText:
              'Educational researchers increasingly warn against rewarding mere speed in language drills. When students rush solely to beat a countdown timer, they often guess intuitively without consolidating grammatical patterns. Conversely, reflective feedback encourages durable neural retention.',
            promptFr: 'Selon ce passage, quel est le risque principal d’une pédagogie fondée uniquement sur la vitesse ?',
            promptEn: 'What drawback of speed-only drills do researchers highlight?',
            options: [
              'Students spend too much time reading.',
              'Learners guess hastily instead of consolidating durable grammar patterns.',
              'Timers prevent students from using audio.',
              'Reflective feedback slows down retention permanently.'
            ],
            correctIndex: 1,
            hintFr: 'Relisez la deuxième phrase : « guess intuitively without consolidating… ».',
            explanationFr: 'La précipitation pousse à deviner sans ancrer les structures en mémoire durable.'
          },
          {
            id: 'rf-m1-q2',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'B2',
            passageTitle: 'The Role of Context',
            passageText:
              'Memorizing isolated bilingual word lists yields fragile recall. Nevertheless, encountering those same terms inside short narratives, dialogues, and debates anchors both their register and syntactic behaviour.',
            promptFr: 'Quel rôle joue le mot « Nevertheless » dans le texte ?',
            promptEn: 'What does "Nevertheless" introduce here?',
            options: [
              'An example confirming that lists work best',
              'A nuanced contrast showing how context repairs fragile recall',
              'A historical date',
              'A conclusion rejecting all vocabulary study'
            ],
            correctIndex: 1,
            hintFr: '« Nevertheless » signifie « néanmoins / toutefois ».',
            explanationFr: 'Il marque le contraste entre les listes isolées (fragiles) et l’apprentissage en contexte (solide).'
          }
        ]
      },
      {
        id: 'rf-m2',
        islandId: 'reading_forest',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Chasseur d’Indices',
        title: 'Manuscript Evidence Hunter',
        objectiveFr: 'Identifier le ton de l’auteur, l’implicite et les connecteurs exacts.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 60,
        baseXp: 95,
        baseCoins: 17,
        prerequisiteMissionIds: ['rf-m1'],
        questions: [
          {
            id: 'rf-m2-q1',
            type: 'pair_match',
            skillTested: 'reading',
            cefrLevel: 'B2',
            promptFr: 'Associez chaque connecteur logique anglais à sa fonction exacte dans un essai :',
            promptEn: 'Match each logical linker to its rhetorical function.',
            pairs: [
              { id: 'lk1', left: 'Consequently', right: 'Conséquence logique' },
              { id: 'lk2', left: 'Albeit', right: 'Concession (« bien que »)' },
              { id: 'lk3', left: 'Moreover', right: 'Ajout d’un argument fort' },
              { id: 'lk4', left: 'Conversely', right: 'Opposition symétrique' }
            ],
            hintFr: '« Albeit » est un connecteur élégant équivalent à « although / even though ».',
            explanationFr: 'Repérer ces 4 balises permet de cartographier instantanément tout texte C1.'
          },
          {
            id: 'rf-m2-q2',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'B2',
            passageTitle: 'Urban Libraries Reimagined',
            passageText:
              'Far from becoming obsolete in the digital age, public libraries have reinvented themselves as civic sanctuaries—places where quiet reading coexists with collaborative mentorship.',
            promptFr: 'Quel est le ton dominant de l’auteur envers les bibliothèques publiques ?',
            promptEn: 'What is the author’s tone regarding public libraries?',
            options: ['Cynical and dismissive', 'Appreciative and optimistic', 'Indifferent', 'Nostalgic and pessimistic'],
            correctIndex: 1,
            hintFr: 'Notez « Far from becoming obsolete » et « civic sanctuaries ».',
            explanationFr: 'L’expression « civic sanctuaries » révèle un ton admiratif et optimiste.'
          }
        ]
      },
      {
        id: 'rf-m3',
        islandId: 'reading_forest',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Analyse d’Éditorial Inédit',
        objectiveFr: 'Dégager la thèse centrale et les présupposés d’un texte de presse C1.',
        cefrLevel: 'C1',
        difficultyRating: 4,
        passAccuracyRequired: 65,
        baseXp: 110,
        baseCoins: 20,
        prerequisiteMissionIds: ['rf-m1', 'rf-m2'],
        questions: [
          {
            id: 'rf-m3-q1',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'C1',
            passageTitle: 'The Paradox of Choice in Study Apps',
            passageText:
              'Offering fifty unguided exercises rarely empowers students; without diagnostic sequencing, abundance breeds cognitive fatigue. True autonomy flourishes when curated pathways adapt quietly to each learner’s evolving strengths.',
            promptFr: 'Quelle thèse l’auteur défend-il ?',
            promptEn: 'Which statement best summarizes the author’s argument?',
            options: [
              'More unguided exercises always guarantee higher scores.',
              'Curated, adaptive pathways foster autonomy better than overwhelming unguided choice.',
              'Students should avoid all digital learning pathways.',
              'Cognitive fatigue improves long-term memory.'
            ],
            correctIndex: 1,
            hintFr: 'Comparez la critique de « fifty unguided exercises » à « curated pathways adapt ».',
            explanationFr: 'L’autonomie réelle naît d’un guidage adaptatif structuré, pas d’une profusion désordonnée.'
          }
        ]
      },
      {
        id: 'rf-boss',
        islandId: 'reading_forest',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Gardien des Archives',
        objectiveFr: 'Synthétiser lecture critique, vocabulaire contextuel et écriture pour ouvrir Writing Academy.',
        cefrLevel: 'C1',
        difficultyRating: 4,
        passAccuracyRequired: 70,
        baseXp: 170,
        baseCoins: 32,
        prerequisiteMissionIds: ['rf-m3'],
        questions: [
          {
            id: 'rf-boss-q1',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'C1',
            passageTitle: 'Bilingual Minds',
            passageText:
              'Switching deliberately between two linguistic frameworks trains executive attention. Albeit demanding at first, this mental agility sharpens problem-solving well beyond language classrooms.',
            promptFr: 'Que signifie « Albeit demanding at first » dans ce contexte ?',
            promptEn: 'How should "Albeit demanding at first" be interpreted?',
            options: [
              'Because it never requires effort',
              'Although it requires sustained effort initially',
              'Unless students refuse to practise',
              'Therefore it stays restricted to classrooms'
            ],
            correctIndex: 1,
            hintFr: '« Albeit » introduit une concession.',
            explanationFr: 'Bien que cet entraînement soit exigeant au départ, il développe l’agilité cognitive.'
          },
          {
            id: 'rf-boss-q2',
            type: 'multiple_choice',
            skillTested: 'vocabulary',
            cefrLevel: 'C1',
            isRetentionCheck: true,
            promptFr: 'Dans le texte ci-dessus, quel mot signifie « délibérément / intentionnellement » ?',
            promptEn: 'Which adverb from the passage means "intentionally"?',
            options: ['deliberately', 'initially', 'well', 'solely'],
            correctIndex: 0,
            hintFr: 'Cherchez l’adverbe qui modifie « Switching ».',
            explanationFr: '« Deliberately » signifie délibérément / à dessein.'
          },
          {
            id: 'rf-boss-q3',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Résumez en une phrase anglaise avec « Although » ou « However » pourquoi lire en contexte aide à mémoriser :',
            promptEn: 'Write one analytical sentence using "although" or "however" explaining why reading in context aids retention.',
            writingMinWords: 8,
            writingRequiredKeywords: ['although', 'however'],
            writingModelAnswer: 'Although isolated lists look fast, reading in context however builds lasting vocabulary retention.',
            hintFr: 'Incluez « although » ou « however » dans une phrase complète.',
            explanationFr: 'Savoir reformuler une thèse lue en y intégrant un connecteur d’opposition valide la compréhension profonde.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 6: WRITING ACADEMY
  // =========================================================================
  {
    number: 6,
    id: 'writing_academy',
    name: 'Writing Academy',
    frenchSubtitle: 'L’Académie de Rédaction & de Rhétorique',
    territoryLore:
      'Un scriptorium impérial dédié à la clarté des essais, aux paragraphes PEEL et à l’élégance syntaxique.',
    skillFocus: 'writing',
    skillLabelFr: 'Expression Écrite',
    cefrRange: 'B1 – C1',
    accentHex: '#f472b6',
    secondaryHex: '#db2777',
    icon: 'edit_note',
    motif: 'academy',
    coords: { xPct: 22, yPct: 37, elevation: 36 },
    bossName: 'Chancellor Evelyn Prose',
    bossTitle: 'Chancelière du Style Académique',
    unlocksNextIslandId: 'advanced_universe',
    rewardTrophyId: 'trophy_writing_academy',
    rewardCardId: 'adv_card_quill',
    rewardAvatarId: 'avatar_grand_chancellor',
    scaffoldedPracticeQuestions: [
      {
        id: 'wa-scaf-1',
        type: 'sentence_build',
        skillTested: 'writing',
        cefrLevel: 'B1',
        promptFr: 'Soutien rédaction : Ordonnez une phrase d’introduction structurée (Topic Sentence) :',
        promptEn: 'Arrange the tokens into a clear topic sentence.',
        sentenceTokens: ['Firstly,', 'daily', 'reading', 'expands', 'both', 'vocabulary', 'and', 'empathy'],
        expectedSentence: 'Firstly, daily reading expands both vocabulary and empathy',
        hintFr: 'Commencez par l’articulateur « Firstly, » suivi du sujet « daily reading ».',
        explanationFr: 'Un paragraphe académique efficace débute par une idée directrice claire (« Topic Sentence »).'
      }
    ],
    missions: [
      {
        id: 'wa-m1',
        islandId: 'writing_academy',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Atelier d’Écriture',
        title: 'Architecture du Paragraphe PEEL',
        objectiveFr: 'Structurer Point, Evidence, Explanation et Link avec cohésion.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 60,
        baseXp: 95,
        baseCoins: 18,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'wa-m1-q1',
            type: 'multiple_choice',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Dans la méthode PEEL (Point – Evidence – Explanation – Link), quel est le rôle du « E » d’Explanation ?',
            promptEn: 'What is the purpose of the "Explanation" step in a PEEL paragraph?',
            options: [
              'To list unrelated vocabulary words',
              'To analyze how the example proves your central point',
              'To repeat the title word for word',
              'To end the essay without punctuation'
            ],
            correctIndex: 1,
            hintFr: 'Un exemple ne parle jamais tout seul : il faut expliciter son lien avec la thèse.',
            explanationFr: 'L’étape « Explanation » démontre précisément en quoi votre exemple soutient votre argument.'
          },
          {
            id: 'wa-m1-q2',
            type: 'multiple_choice',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Quelle phrase évite la répétition faible de « very » et élève le style ?',
            promptEn: 'Which revision replaces weak modifiers with concise academic style?',
            options: [
              'This result is very, very big and good.',
              'This finding proves pivotal for future curriculum design.',
              'The thing is super important for stuff.',
              'Very much people think this is nice.'
            ],
            correctIndex: 1,
            hintFr: 'Cherchez un adjectif fort (« pivotal ») et un nom précis (« finding »).',
            explanationFr: 'Un verbe + adjectif précis (« proves pivotal ») remplace avantageusement « is very important ».'
          }
        ]
      },
      {
        id: 'wa-m2',
        islandId: 'writing_academy',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Plume Synthétique',
        title: 'Rhetoric & Clause Stitcher',
        objectiveFr: 'Rédiger et assembler des phrases liées avec précision et nuance.',
        cefrLevel: 'B2',
        difficultyRating: 3,
        passAccuracyRequired: 60,
        baseXp: 105,
        baseCoins: 19,
        prerequisiteMissionIds: ['wa-m1'],
        questions: [
          {
            id: 'wa-m2-q1',
            type: 'sentence_build',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Reliez ces deux idées par une subordonnée relative explicative :',
            promptEn: 'Build a smooth complex sentence using "which".',
            sentenceTokens: ['Adaptive', 'feedback', 'targets', 'weaknesses,', 'which', 'accelerates', 'progress'],
            expectedSentence: 'Adaptive feedback targets weaknesses, which accelerates progress',
            hintFr: 'La virgule précède « which » quand celui-ci reprend toute la proposition précédente.',
            explanationFr: '« , which + verbe » permet de commenter brillamment toute la phrase précédente.'
          },
          {
            id: 'wa-m2-q2',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'B2',
            promptFr: 'Rédigez 1 à 2 phrases expliquant un avantage de la lecture régulière en anglais (utilisez « For instance » ou « Moreover ») :',
            promptEn: 'Write 1–2 sentences on one benefit of regular English reading using "for instance" or "moreover".',
            writingMinWords: 10,
            writingRequiredKeywords: ['for instance', 'moreover'],
            writingModelAnswer:
              'Regular reading strengthens grammar intuition. Moreover, it exposes learners to authentic idioms in natural contexts.',
            hintFr: 'Annoncez votre idée puis développez avec « Moreover, » ou « For instance, ».',
            explanationFr: 'L’articulation logique entre une affirmation et son illustration est le cœur de la note d’expression écrite.'
          }
        ]
      },
      {
        id: 'wa-m3',
        islandId: 'writing_academy',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Niveau Déblocable',
        title: 'Synthèse Persuasive',
        objectiveFr: 'Construire un court paragraphe argumenté complet intégrant concession et conclusion.',
        cefrLevel: 'C1',
        difficultyRating: 4,
        passAccuracyRequired: 65,
        baseXp: 120,
        baseCoins: 22,
        prerequisiteMissionIds: ['wa-m1', 'wa-m2'],
        questions: [
          {
            id: 'wa-m3-q1',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'C1',
            promptFr: 'Rédigez un mini-paragraphe (≥ 14 mots) répondant à : « Why is accuracy more valuable than speed when learning English? » (utilisez « because » ou « therefore ») :',
            promptEn: 'Write a concise analytical response (14+ words) including "because" or "therefore".',
            writingMinWords: 14,
            writingRequiredKeywords: ['because', 'therefore'],
            writingModelAnswer:
              'Accuracy matters far more than speed because careful reflection builds lasting mastery; therefore, patient practice always pays off.',
            hintFr: 'Mentionnez « accuracy », « speed » et reliez par « because » ou « therefore ».',
            explanationFr: 'Votre réponse relie cause, nuance et conséquence de manière autonome.'
          }
        ]
      },
      {
        id: 'wa-boss',
        islandId: 'writing_academy',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss du Territoire',
        title: 'Chancelière de la Prose',
        objectiveFr: 'Combiner révision grammaticale, lecture stylistique et écriture persuasive pour atteindre l’Univers Avancé.',
        cefrLevel: 'C1',
        difficultyRating: 5,
        passAccuracyRequired: 70,
        baseXp: 180,
        baseCoins: 34,
        prerequisiteMissionIds: ['wa-m3'],
        questions: [
          {
            id: 'wa-boss-q1',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'C1',
            promptFr: 'Corrigez l’erreur classique de virgule (« comma splice ») :',
            promptEn: 'Which sentence joins two independent clauses correctly?',
            options: [
              'She revised carefully, she improved her score.',
              'She revised carefully; consequently, she improved her score.',
              'She revised carefully therefore she improved.',
              'Revised carefully, and improved score.'
            ],
            correctIndex: 1,
            hintFr: 'Deux propositions indépendantes ne peuvent pas être reliées par une simple virgule : utilisez un point-virgule ou un coordonnant.',
            explanationFr: '« ; consequently, » relie proprement deux propositions indépendantes sans faute de ponctuation.'
          },
          {
            id: 'wa-boss-q2',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'C1',
            passageTitle: 'Style & Conciseness',
            passageText: 'Vigorous writing is concise. A sentence should contain no unnecessary words, just as a bridge requires no spare bolts.',
            promptFr: 'Quel principe stylistique cette métaphore illustre-t-elle ?',
            promptEn: 'What writing principle is conveyed by the bridge analogy?',
            options: [
              'Every sentence should remain concise and purposeful.',
              'Long paragraphs are always superior.',
              'Avoid verbs whenever possible.',
              'Technical metaphors confuse readers.'
            ],
            correctIndex: 0,
            hintFr: 'Relisez : « no unnecessary words ».',
            explanationFr: 'Comme un pont bien conçu, chaque mot d’une phrase doit remplir une fonction précise.'
          },
          {
            id: 'wa-boss-q3',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'C1',
            promptFr: 'Épreuve Finale de Plume (≥ 14 mots) : Rédigez une phrase élégante utilisant « although » ou « while » et un terme précis (« accuracy », « fluency », « mastery », « insight ») :',
            promptEn: 'Craft one polished sentence (14+ words) with "although" or "while" about language mastery.',
            writingMinWords: 14,
            writingRequiredKeywords: ['although', 'while'],
            writingModelAnswer:
              'Although mastering subtle idioms demands patience, consistent reading and speaking transform effort into lasting eloquence.',
            hintFr: 'Débutez par « Although » ou « While », posez une virgule, puis concluez votre idée principale.',
            explanationFr: 'Bravo ! Vous maniez la subordination concessive avec naturel et élégance.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // ISLAND 7: ADVANCED ENGLISH UNIVERSE
  // =========================================================================
  {
    number: 7,
    id: 'advanced_universe',
    name: 'Advanced English Universe',
    frenchSubtitle: 'L’Univers Supérieur · Maîtrise C1/C2',
    territoryLore:
      'L’observatoire céleste au sommet de l’Archipel, où rhétorique, inversions stylistiques, écoute rapide, lecture et expression fusionnent.',
    skillFocus: 'advanced',
    skillLabelFr: 'Maîtrise Multi-Compétences',
    cefrRange: 'B2 – C2',
    accentHex: '#a78bfa',
    secondaryHex: '#7c3aed',
    icon: 'public',
    motif: 'observatory',
    coords: { xPct: 50, yPct: 17, elevation: 44 },
    bossName: 'Sovereign Orion Chesterfield',
    bossTitle: 'Archonte de l’Univers Anglais',
    rewardTrophyId: 'trophy_universe_crown',
    rewardCardId: 'adv_card_cosmos',
    rewardAvatarId: 'avatar_celestial_sovereign',
    rewardThemeId: 'obsidian-imperial',
    scaffoldedPracticeQuestions: [
      {
        id: 'au-scaf-1',
        type: 'multiple_choice',
        skillTested: 'grammar',
        cefrLevel: 'B2',
        promptFr: 'Soutien C1 : Après « Not only » en début de phrase, que se passe-t-il ?',
        promptEn: 'Not only ___ the exam, but she also earned top honours.',
        options: ['she passed', 'did she pass', 'passed she', 'was she pass'],
        correctIndex: 1,
        hintFr: 'L’inversion négative en tête de phrase reprend l’ordre d’une question : auxiliaire + sujet + verbe.',
        explanationFr: '« Not only did she pass… » : l’auxiliaire « did » se place avant le sujet « she ».',
        grammarRule: 'Adverbe restrictif/négatif en tête (Not only, Never, Seldom, Rarely) → Auxiliaire + Sujet + Verbe.'
      }
    ],
    missions: [
      {
        id: 'au-m1',
        islandId: 'advanced_universe',
        order: 1,
        kind: 'learning_mission',
        kindLabelFr: 'Maîtrise Stylistique',
        title: 'Inversions, Subjonctif & Clivage',
        objectiveFr: 'Manier les structures syntaxiques d’excellence de niveau C1/C2.',
        cefrLevel: 'C1',
        difficultyRating: 4,
        passAccuracyRequired: 65,
        baseXp: 115,
        baseCoins: 20,
        prerequisiteMissionIds: [],
        questions: [
          {
            id: 'au-m1-q1',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'C1',
            promptFr: 'Complétez cette inversion élégante :',
            promptEn: 'Seldom ___ such poise during a live parliamentary debate.',
            options: ['we have witnessed', 'have we witnessed', 'witnessed we', 'did we witnessed'],
            correctIndex: 1,
            hintFr: '« Seldom » en tête de phrase déclenche l’inversion auxiliaire + sujet.',
            explanationFr: '« Seldom have we witnessed… » met magnifiquement l’accent sur la rareté de l’événement.'
          },
          {
            id: 'au-m1-q2',
            type: 'multiple_choice',
            skillTested: 'grammar',
            cefrLevel: 'C2',
            promptFr: 'Identifiez le subjonctif anglais formel (mandative subjunctive) :',
            promptEn: 'The dean insisted that every candidate ___ present at nine sharp.',
            options: ['is', 'be', 'was', 'being'],
            correctIndex: 1,
            hintFr: 'Après « insist that / recommend that », le subjonctif formel utilise la base verbale nue.',
            explanationFr: 'Au registre soutenu, « insist that + sujet + Base Verbale (be) » exprime une exigence formelle.'
          }
        ]
      },
      {
        id: 'au-m2',
        islandId: 'advanced_universe',
        order: 2,
        kind: 'mini_game',
        kindLabelFr: 'Mini-Jeu : Matrice d’Idiomes',
        title: 'Diplomatic Idiom Matrix',
        objectiveFr: 'Associer les idiomes d’élite à leur signification nuancée exacte.',
        cefrLevel: 'C1',
        difficultyRating: 4,
        passAccuracyRequired: 65,
        baseXp: 120,
        baseCoins: 22,
        prerequisiteMissionIds: ['au-m1'],
        questions: [
          {
            id: 'au-m2-q1',
            type: 'pair_match',
            skillTested: 'vocabulary',
            cefrLevel: 'C1',
            promptFr: 'Reliez chaque expression idiomatique C1/C2 à son sens exact :',
            promptEn: 'Match each advanced idiom to its accurate meaning.',
            pairs: [
              { id: 'id1', left: 'Read between the lines', right: 'Saisir le sens implicite' },
              { id: 'id2', left: 'A blessing in disguise', right: 'Un mal pour un bien' },
              { id: 'id3', left: 'Cut corners', right: 'Bâcler pour gagner du temps' },
              { id: 'id4', left: 'Play devil’s advocate', right: 'Tester une thèse par la contradiction' }
            ],
            hintFr: '« Cut corners » évoque le fait de rogner les angles au détriment de la solidité.',
            explanationFr: 'Ces 4 expressions idiomatiques enrichissent immédiatement analyses et débats.'
          },
          {
            id: 'au-m2-q2',
            type: 'sentence_build',
            skillTested: 'grammar',
            cefrLevel: 'C1',
            promptFr: 'Assemblez une phrase clivée emphatique (« It is… that… ») :',
            promptEn: 'Arrange the tokens into an emphatic cleft sentence.',
            sentenceTokens: ['It', 'is', 'consistent', 'accuracy', 'that', 'ultimately', 'builds', 'fluency'],
            expectedSentence: 'It is consistent accuracy that ultimately builds fluency',
            hintFr: 'La structure clivée « It is X that… » met en relief l’élément central.',
            explanationFr: 'Les phrases clivées (« It is … that … ») sont un outil rhétorique majeur au niveau C1/C2.'
          }
        ]
      },
      {
        id: 'au-m3',
        islandId: 'advanced_universe',
        order: 3,
        kind: 'unlockable_challenge',
        kindLabelFr: 'Défi Suprême Déblocable',
        title: 'Rhétorique & Synthèse d’Oxford',
        objectiveFr: 'Croiser écoute soutenue et style de haut niveau avant l’épreuve finale.',
        cefrLevel: 'C2',
        difficultyRating: 5,
        passAccuracyRequired: 70,
        baseXp: 135,
        baseCoins: 24,
        prerequisiteMissionIds: ['au-m1', 'au-m2'],
        questions: [
          {
            id: 'au-m3-q1',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'C1',
            audioAccent: 'en-GB',
            audioScript: 'Were we to prioritize superficial speed over thoughtful comprehension, genuine linguistic elegance would inevitably erode.',
            promptFr: 'Écoutez cette phrase conditionnelle inversée : Quelle mise en garde contient-elle ?',
            promptEn: 'Listen carefully and identify the warning expressed.',
            options: [
              'Favoring superficial speed over comprehension weakens linguistic elegance.',
              'Linguistic elegance depends entirely on speed drills.',
              'Comprehension should be ignored at advanced levels.',
              'Slow reading prevents fluency forever.'
            ],
            correctIndex: 0,
            hintFr: '« Were we to… » équivaut à « If we were to… » (conditionnel formel inversé).',
            explanationFr: 'L’inversion « Were we to prioritize… » exprime avec élégance une hypothèse critique.'
          }
        ]
      },
      {
        id: 'au-boss',
        islandId: 'advanced_universe',
        order: 4,
        kind: 'boss_challenge',
        kindLabelFr: 'Boss Final de l’Archipel',
        title: 'Souverain de l’Univers Anglais',
        objectiveFr: 'Épreuve ultime unissant Vocabulaire, Grammaire, Écoute, Lecture, Parole et Écriture.',
        cefrLevel: 'C2',
        difficultyRating: 5,
        passAccuracyRequired: 70,
        baseXp: 240,
        baseCoins: 45,
        prerequisiteMissionIds: ['au-m3'],
        questions: [
          {
            id: 'au-boss-q1',
            type: 'reading_passage',
            skillTested: 'reading',
            cefrLevel: 'C2',
            passageTitle: 'Lord Chesterfield’s Maxim',
            passageText:
              'True eloquence is never mere ornament; it marries clarity of reasoning with courtesy of tone, ensuring that complex truths remain accessible without losing depth.',
            promptFr: 'Selon ce passage, sur quoi repose la véritable éloquence ?',
            promptEn: 'What defines true eloquence in this passage?',
            options: [
              'Using obscure ornaments to impress listeners',
              'Combining clear reasoning and courteous tone to convey depth accessibly',
              'Avoiding complex subjects altogether',
              'Speaking as rapidly as possible'
            ],
            correctIndex: 1,
            hintFr: 'Repérez l’alliance entre « clarity of reasoning » et « courtesy of tone ».',
            explanationFr: 'L’éloquence authentique unit rigueur intellectuelle et courtoisie expressive.'
          },
          {
            id: 'au-boss-q2',
            type: 'listening_audio',
            skillTested: 'listening',
            cefrLevel: 'C1',
            audioAccent: 'en-US',
            audioScript: 'Not until learners reflect on their own errors do those grammar rules become second nature.',
            promptFr: 'Écoutez la phrase : À quel moment les règles deviennent-elles une seconde nature ?',
            promptEn: 'When do grammar rules become second nature according to the speaker?',
            options: [
              'Only after learners actively reflect on their errors',
              'Before making any mistakes at all',
              'When exercises are completed silently without feedback',
              'As soon as timers expire'
            ],
            correctIndex: 0,
            hintFr: 'Notez « Not until learners reflect… do those rules… ».',
            explanationFr: 'La réflexion active sur ses erreurs transforme la règle abstraite en réflexe durable.'
          },
          {
            id: 'au-boss-q3',
            type: 'speaking_prompt',
            skillTested: 'speaking',
            cefrLevel: 'C1',
            promptFr: 'Déclarez votre profession de foi d’érudit (à l’oral ou par saisie) :',
            promptEn: 'Speak or enter this closing statement with poise:',
            targetSpeechPhrase: 'Accuracy, curiosity, and steady reflection turn every challenge into lasting mastery.',
            acceptedSpeechKeywords: ['accuracy', 'curiosity', 'reflection', 'mastery'],
            hintFr: 'Articulez clairement le rythme ternaire : « Accuracy, curiosity, and steady reflection ».',
            explanationFr: 'Rythme ternaire parfaitement équilibré, signature de l’orateur C1/C2.'
          },
          {
            id: 'au-boss-q4',
            type: 'writing_prompt',
            skillTested: 'writing',
            cefrLevel: 'C1',
            promptFr: 'Synthèse Finale (≥ 14 mots) : Expliquez en anglais ce que votre parcours sur les 7 îles vous a apporté (utilisez un connecteur : « therefore », « moreover », « although » ou « because ») :',
            promptEn: 'Write a 14+ word closing reflection using "therefore", "moreover", "although", or "because".',
            writingMinWords: 14,
            writingRequiredKeywords: ['therefore', 'moreover', 'although', 'because'],
            writingModelAnswer:
              'Although advanced English demands steady effort, combining listening, reading, and writing builds genuine confidence; therefore, I feel ready for any challenge.',
            hintFr: 'Reliez deux compétences (ex. listening & writing) à l’aide d’un connecteur formel.',
            explanationFr: 'Couronnement accompli ! Vous avez démontré une maîtrise complète sur l’ensemble des sept territoires.'
          }
        ]
      }
    ]
  }
];

export function getIslandById(islandId: AdventureIslandId): AdventureIsland {
  return ADVENTURE_ISLANDS.find((i) => i.id === islandId) || ADVENTURE_ISLANDS[0];
}

export function getMissionById(missionId: string): { island: AdventureIsland; mission: AdventureMission } | null {
  for (const island of ADVENTURE_ISLANDS) {
    const mission = island.missions.find((m) => m.id === missionId);
    if (mission) return { island, mission };
  }
  return null;
}

export function getTierLabelFr(tier: AdventureDifficultyTier): string {
  switch (tier) {
    case 'scaffolded':
      return 'Soutien Guidé';
    case 'mastery':
      return 'Défi Maîtrise';
    default:
      return 'Calibré';
  }
}
