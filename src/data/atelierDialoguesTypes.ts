export type DialogueThemeId =
  | 'vie_quotidienne'
  | 'loisirs'
  | 'metier'
  | 'business'
  | 'voyage'
  | 'gastronomie';

export type DialogueFormatId = 'duo' | 'trio' | 'groupe';

export type DialogueLevelId =
  | '6e_A1'
  | '5e_A2'
  | '4e_A2P'
  | '3e_B1'
  | '2nde_B1P'
  | '1re_B2'
  | 'Term_C1';

export interface DialogueThemeMeta {
  id: DialogueThemeId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  accentHex: string;
}

export interface DialogueLevelMeta {
  id: DialogueLevelId;
  label: string;
  shortLabel: string;
  cefr: string;
  tier: 1 | 2 | 3; // 1: Découverte/Élémentaire, 2: Intermédiaire, 3: Avancé/Expert
}

export interface DialogueSpeaker {
  id: string;
  name: string;
  roleFr: string;
  gender: 'female' | 'male';
  ukPersonaId: string;
  usPersonaId: string;
  pitchOffset: number;
  colorHex: string;
  initials: string;
}

export type TurnIntent = 'demande' | 'reponse' | 'precision' | 'conclusion';

export interface DialogueTurn {
  id: string;
  speakerId: string;
  intent: TurnIntent;
  en: string;
  fr: string;
  keyPhrase: string;
  keyIpa: string;
  keyMeaningFr: string;
  tipFr: string;
}

export interface DialogueKeyCard {
  id: string;
  term: string;
  ipa: string;
  frenchDef: string;
  englishContext: string;
  tipFr: string;
  themeLabel: string;
  level: string;
  dialogueNumber: number;
}

export interface AtelierDialogue {
  id: string;
  number: number; // 1 to 500
  theme: DialogueThemeId;
  themeLabel: string;
  format: DialogueFormatId;
  formatLabel: string;
  level: DialogueLevelId;
  levelLabel: string;
  cefr: string;
  title: string;
  titleFr: string;
  setting: string;
  learningGoal: string;
  speakers: DialogueSpeaker[];
  turns: DialogueTurn[];
  keyCards: DialogueKeyCard[];
}

export const DIALOGUE_THEMES: DialogueThemeMeta[] = [
  {
    id: 'vie_quotidienne',
    label: 'La Vie Quotidienne',
    shortLabel: 'Vie Quotidienne',
    icon: 'home_work',
    description: 'Courses, voisins, santé, banque, démarches, transports et discussions de tous les jours.',
    accentHex: '#f2ca50'
  },
  {
    id: 'loisirs',
    label: 'Les Loisirs & Passions',
    shortLabel: 'Loisirs',
    icon: 'sports_tennis',
    description: 'Sport, cinéma, concerts, musées, lecture, photographie, week-ends et clubs.',
    accentHex: '#38bdf8'
  },
  {
    id: 'metier',
    label: 'Le Métier & Carrière',
    shortLabel: 'Métier',
    icon: 'engineering',
    description: 'Entretiens, ateliers techniques, hôpital, enseignement, architecture, droit et collègues.',
    accentHex: '#a78bfa'
  },
  {
    id: 'business',
    label: 'Le Business & Affaires',
    shortLabel: 'Business',
    icon: 'business_center',
    description: 'Négociations clients, réunions stratégiques, contrats internationaux, finance et pitchs.',
    accentHex: '#34d399'
  },
  {
    id: 'voyage',
    label: 'Rencontres en Voyage',
    shortLabel: 'Voyage',
    icon: 'flight_takeoff',
    description: 'Aéroport, hôtel, gare, guide local, office du tourisme, taxi, habitants et compagnons.',
    accentHex: '#fb923c'
  },
  {
    id: 'gastronomie',
    label: 'La Gastronomie & Table',
    shortLabel: 'Gastronomie',
    icon: 'restaurant',
    description: 'Restaurants, sommelier, marchés fermiers, pâtisserie, allergies et ateliers culinaires.',
    accentHex: '#f472b6'
  }
];

export const DIALOGUE_FORMATS: Array<{ id: DialogueFormatId; label: string; badge: string; icon: string }> = [
  { id: 'duo', label: '2 Personnes (Duo)', badge: '2 pers.', icon: 'group' },
  { id: 'trio', label: '3 Personnes (Trio)', badge: '3 pers.', icon: 'groups_3' },
  { id: 'groupe', label: 'En Groupe (4 pers.)', badge: 'Groupe', icon: 'diversity_3' }
];

export const DIALOGUE_LEVELS: DialogueLevelMeta[] = [
  { id: '6e_A1', label: '6e • A1 Découverte', shortLabel: '6e (A1)', cefr: 'A1', tier: 1 },
  { id: '5e_A2', label: '5e • A2 Élémentaire', shortLabel: '5e (A2)', cefr: 'A2', tier: 1 },
  { id: '4e_A2P', label: '4e • A2+ Intermédiaire', shortLabel: '4e (A2+)', cefr: 'A2+', tier: 2 },
  { id: '3e_B1', label: '3e • B1 Seuil', shortLabel: '3e (B1)', cefr: 'B1', tier: 2 },
  { id: '2nde_B1P', label: '2nde • B1+ Consolidation', shortLabel: '2nde (B1+)', cefr: 'B1+', tier: 2 },
  { id: '1re_B2', label: '1re • B2 Avancé', shortLabel: '1re (B2)', cefr: 'B2', tier: 3 },
  { id: 'Term_C1', label: 'Term. • C1/C2 Maîtrise', shortLabel: 'Term. (C1)', cefr: 'C1', tier: 3 }
];

export interface ScenarioBlueprint {
  code: string;
  title: string;
  titleFr: string;
  setting: string;
  learningGoal: string;
  roles: Array<{ roleFr: string; gender: 'female' | 'male'; name: string }>;
  variants: Array<{
    focusTag: string;
    focusDetailEn: string;
    focusDetailFr: string;
    keyTerm: string;
    keyIpa: string;
    keyFr: string;
  }>;
  turnsTemplate: Array<{
    speakerSlot: number;
    intent: TurnIntent;
    enPattern: string;
    frPattern: string;
    keyPhrasePattern: string;
    keyIpa: string;
    keyMeaningFr: string;
    tipFr: string;
  }>;
}
