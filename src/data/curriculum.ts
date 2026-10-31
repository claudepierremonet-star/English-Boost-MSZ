import type { CEFRLevel } from '../firebase/types';

export interface HeroPreset {
  id: string;
  name: string;
  tag: string;
  url: string;
  alt: string;
  position: string;
}

export const HERO_PRESETS: HeroPreset[] = [
  {
    id: 'oxford',
    name: 'Oxford Bodleian Vaults',
    tag: 'OXF',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDUt7tXU9wnM6he8dZmJ-f_kK3fqOWMbi8qT3c_zVAS6297z1RG31BeL6T5Ic9HM-oREHnKKw6xDRbX5U-LYC1gYXpAAEWhXBIJ2brXJ7znTNlvjnUYz0qKE8jmrLIoPVQxBhel2DjVHZivpbxXBQMgrFkYD3HDZd_AqauHO-Nqw3WxuLstxT6EEptnEYUM9BaBMwN6SxEjbhgbDEiSDZkOqQRKLSIwxieCQ7JvmB3J6f8FgntpUwD',
    alt: 'Ancient Gothic Oxford university library interior with mahogany wood arches and thousands of antique leather-bound books',
    position: 'center 40%'
  },
  {
    id: 'cambridge',
    name: "Cambridge King's High Hall",
    tag: 'CAM',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsrQSe08L1T3HheT_3YqbdLMZ3Tv_4eDckSA7YFY-7M6Rt9KcoSn-i1B78zuF36wasVNXoONyNoxQb1pIWNDLonaU5amtG72JPJGrPKNwK4-qMQqvxu9ANX8f5T19k0iAVUhVf1boN4boioDeIx-lEuXY12LhENaROddNkZpMmyV1j5bJJfZLWs87Ll7dpLGtB5pqExcGwGiEKDT8ApSjSzNxGHKx5I8Afs2QhS1BmWaz5wTYFpv2z',
    alt: 'Gothic grand dining hall with high vaulted ceilings stained glass windows and long polished oak banquet tables lit by candlelight',
    position: 'center 65%'
  },
  {
    id: 'victoria',
    name: 'Victoria Club Archives',
    tag: 'VIC',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbtzzwVEHl_Kov-a2pmE9uZWoNljB8pgY0aKD4tAn10RcLdFeIrtqcxwtOcTzU1t4L5V6AEUIa2tV9ZWoaFsdR2ikNhRWKYwIASwo0ZCpKzgGj3k9HKx1yY6nCo8zN5JpOw9xYik7gr7m9-sG7MohCIejqISqKav-CnBO2U9A59ZVzpuWTihgJ4UOhDw9dmi98TmU2VjOf-NxlZ76EzfqAaG1maGvvFdwLXNJQSu_fK_AztnLXuRec',
    alt: 'Classic wooden writing desk with fountain pen illuminated manuscript parchment magnifying glass and a warm green banker lamp',
    position: 'center 20%'
  }
];

export interface StudyFolio {
  id: string;
  folioNumber: string;
  folioRoman: string;
  badge: string;
  level: CEFRLevel;
  title: string;
  subtitle: string;
  duration: string;
  progressPercent: number;
  exercisesCount: number;
  accent: string;
  lexemes: string;
  quote: string;
  author: string;
  iconName: string;
}

export const STUDY_FOLIOS: StudyFolio[] = [
  {
    id: 'folio-1',
    folioNumber: 'FOLIO I',
    folioRoman: 'I',
    badge: "FOLIO D'OR • PRIORITÉ",
    level: 'C2',
    title: 'Diplomatic Rhetoric & Treaties',
    subtitle: "L'art de la réfutation feutrée : comment formuler un désaccord courtois sans concéder de terrain.",
    duration: '3h 45m',
    progressPercent: 72,
    exercisesCount: 3,
    accent: 'British RP',
    lexemes: '68 Lexèmes C2',
    quote: '“Style is the dress of thoughts; and let them be ever so just, if your style is homely and vulgar, they will appear to as much disadvantage as a lord in rags.”',
    author: 'Lord Chesterfield • Letters to His Son (1774)',
    iconName: 'gavel'
  },
  {
    id: 'folio-2',
    folioNumber: 'FOLIO II',
    folioRoman: 'II',
    badge: "FOLIO D'ARGENT • RHÉTORIQUE",
    level: 'C1',
    title: 'The Westminster Parliamentary Oratory',
    subtitle: 'Cadence oratoire de la Chambre des Lords, figures d’antithèse et répliques péremptoires.',
    duration: '2h 30m',
    progressPercent: 45,
    exercisesCount: 5,
    accent: 'Contradictoire',
    lexemes: 'Archives Hansard',
    quote: '“A speech is not merely an assemblage of eloquent words, but an engine of statecraft designed to disarm resistance through irresistible cadence.”',
    author: 'Lord Chatham • Debates on Conciliation (1775)',
    iconName: 'account_balance'
  },
  {
    id: 'folio-3',
    folioNumber: 'FOLIO III',
    folioRoman: 'III',
    badge: 'FOLIO DE CUIR • DIALECTIQUE',
    level: 'C2',
    title: 'Oxbridge Dialectics & Stylistics',
    subtitle: 'Dissertations académiques, métaphores étendues et prose victorienne soutenue.',
    duration: '4h 10m',
    progressPercent: 20,
    exercisesCount: 4,
    accent: 'Syllogismes',
    lexemes: 'Cambridge C2',
    quote: '“He who writes with precision forces the chaotic manifold of human intellect into an immutable crystal of understanding.”',
    author: 'Dr. Samuel Johnson • The Rambler (1751)',
    iconName: 'history_edu'
  },
  {
    id: 'folio-4',
    folioNumber: 'FOLIO IV',
    folioRoman: 'IV',
    badge: 'FOLIO VELIN • JURISPRUDENCE',
    level: 'C2',
    title: 'High Court Judicial Nuance',
    subtitle: 'Structure du syllogisme juridique, réfutations courtoises et cas de droit coutumier.',
    duration: '3h 15m',
    progressPercent: 10,
    exercisesCount: 3,
    accent: 'Précision Absolue',
    lexemes: 'Phraséologie Bespoke',
    quote: '“Equity does not bend the law, but polishes its razor edge so that justice may divide guilt from misfortune without shredding virtue.”',
    author: 'Lord Mansfield • High Court Precedents (1780)',
    iconName: 'balance'
  }
];

export interface CurioWord {
  id: string;
  term: string;
  phonetic: string;
  frenchDef: string;
  englishDef: string;
  etymology: string;
  level: CEFRLevel;
  collocation: string;
}

export const CURIOSITIES: CurioWord[] = [
  {
    id: 'perspicacity',
    term: 'Perspicacity',
    phonetic: '/ˌpɜː.spɪˈkæs.ə.ti/',
    frenchDef: 'Clairvoyance aiguë et finesse de jugement rapide dans les situations complexes.',
    englishDef: 'The quality of having a ready insight into things; acute discernment.',
    etymology: 'Latin: perspicax (sharp-sighted), from perspicere (to look closely).',
    level: 'C2',
    collocation: 'remarkable diplomatic perspicacity'
  },
  {
    id: 'sobriquet',
    term: 'Sobriquet',
    phonetic: '/ˈsəʊ.brɪ.keɪ/',
    frenchDef: 'Surnom affectueux ou appellation familière attribuée avec esprit.',
    englishDef: 'A person’s nickname; an affectionate or humorous epithet.',
    etymology: 'Old French: soubriquet (a chuck under the chin, tap of familiarity).',
    level: 'C2',
    collocation: 'earned the aristocratic sobriquet'
  },
  {
    id: 'equivocal',
    term: 'Equivocal',
    phonetic: '/ɪˈkwɪv.ə.kəl/',
    frenchDef: 'Qui prête délibérément à double interprétation ; subtilement ambigu ou fuyant.',
    englishDef: 'Open to more than one interpretation; deliberately ambiguous.',
    etymology: 'Late Latin: aequivocus, from aequus (equal) and vox (voice).',
    level: 'C1',
    collocation: 'an intentionally equivocal diplomatic dispatch'
  },
  {
    id: 'meretricious',
    term: 'Meretricious',
    phonetic: '/ˌmɛr.ɪˈtrɪʃ.əs/',
    frenchDef: 'D’un éclat trompeur, superficiel ou dépourvu de valeur intrinsèque.',
    englishDef: 'Apparently attractive but having in reality no substance, integrity, or value.',
    etymology: 'Latin: meretricius, from meretrix (courtesan).',
    level: 'C2',
    collocation: 'meretricious rhetorical flourishes'
  },
  {
    id: 'pusillanimous',
    term: 'Pusillanimous',
    phonetic: '/ˌpjuː.sɪˈlæn.ɪ.məs/',
    frenchDef: 'Qui manque de courage ou d’audace morale ; lâche ou excessivement timoré.',
    englishDef: 'Showing a lack of courage or determination; timid.',
    etymology: 'Latin: pusillus (very small) and animus (spirit, mind).',
    level: 'C2',
    collocation: 'a pusillanimous concession to public outcry'
  },
  {
    id: 'verisimilitude',
    term: 'Verisimilitude',
    phonetic: '/ˌvɛr.ɪ.sɪˈmɪl.ɪ.tjuːd/',
    frenchDef: 'Apparence de vérité ou vraisemblance frappante dans un récit ou plaidoyer.',
    englishDef: 'The appearance of being true or real.',
    etymology: 'Latin: verus (true) and similis (like).',
    level: 'C2',
    collocation: 'imbued with extraordinary historical verisimilitude'
  }
];

export interface DictationItem {
  id: string;
  title: string;
  source: string;
  level: CEFRLevel;
  durationLabel: string;
  canonicalText: string;
  notes: Array<{
    term: string;
    register: string;
    explanation: string;
  }>;
  targetWord?: string;
  phonetic?: string;
  frenchDef?: string;
  englishDef?: string;
  etymology?: string;
  collocations?: string[];
  nuanceComparisons?: Array<{ word: string; distinction: string }>;
  gradeLevel?: '6e' | '5e' | '4e' | '3e' | '2nde' | '1re' | 'terminale';
  gradeLabel?: string;
  theme?: string;
  themeLabel?: string;
}

export const CLASSIC_DICTATION_ITEMS: DictationItem[] = [
  {
    id: 'dict-1',
    title: 'The Bretton Woods Paradigm',
    source: 'Macro-Économie & Diplomatie Financière',
    level: 'C1',
    durationLabel: '14 sec',
    canonicalText: "The central bank's reluctance to curb quantitative easing inadvertently exacerbated inflationary pressures across sovereign debt markets.",
    targetWord: 'To curb',
    phonetic: '/tə kɜːb/',
    frenchDef: 'Réfréner, contenir ou freiner une dynamique haussière.',
    englishDef: 'To restrain, check, or keep in control.',
    etymology: "Du vieux français 'courber' (plier, restreindre), issu du latin classique 'curvare'.",
    collocations: ['curb inflation', 'curb spending', 'curb quantitative easing'],
    nuanceComparisons: [
      { word: 'To curb', distinction: 'Freiner fermement une force en marche' },
      { word: 'To stop', distinction: 'Arrêter net et immédiatement' }
    ],
    gradeLevel: 'terminale',
    gradeLabel: 'Terminale (Lycée C1)',
    theme: 'monde_travail_metiers',
    themeLabel: 'Monde du travail & Métiers',
    notes: [
      {
        term: 'To curb [something]',
        register: 'Verbe de registre soutenu',
        explanation: 'Signifie réfréner, freiner ou contenir une dynamique haussière. Très fréquent dans les revues financières (Financial Times, The Economist).'
      },
      {
        term: 'Inadvertently',
        register: 'Adverbe modal',
        explanation: 'Traduit une action involontaire ou incidente (« par mégarde / sans intention délibérée »). Orthographe avec « -tently » souvent piégeuse à l’écoute.'
      },
      {
        term: 'Quantitative Easing (QE)',
        register: 'Terme technique macro',
        explanation: 'Assouplissement quantitatif : rachat d’obligations d’État par une banque centrale injectant de la liquidité sur le marché secondaire.'
      }
    ]
  },
  {
    id: 'dict-2',
    title: 'The Economist : Monetary Sovereignty',
    source: 'The Economist Editorial',
    level: 'C2',
    durationLabel: '18 sec',
    canonicalText: 'Seldom does an institution wield such unbridled prerogative without precipitating profound structural fissures across multilateral alliances.',
    targetWord: 'Unbridled',
    phonetic: '/ʌnˈbraɪ.dəld/',
    frenchDef: 'Effréné, sans entraves, déployé sans modération.',
    englishDef: 'Uncontrolled, unconstrained, unrestrained.',
    etymology: "Préfixe négatif 'un-' et 'bridle' (la bride équestre), issu du vieil anglais 'brīdel'.",
    collocations: ['unbridled prerogative', 'unbridled enthusiasm', 'unbridled power'],
    nuanceComparisons: [
      { word: 'Unbridled', distinction: 'Sens métaphorique : sans bride, fougueux' },
      { word: 'Wild', distinction: 'Sauvage par nature originelle' }
    ],
    gradeLevel: 'terminale',
    gradeLabel: 'Terminale (Lycée C2)',
    theme: 'geographie_politique_art',
    themeLabel: 'Géographie, Société & Arts',
    notes: [
      {
        term: 'Seldom does [subject] [verb]',
        register: 'Inversion négative soutenue',
        explanation: 'Tournure d’éloquence formelle où l’adverbe restrictif en tête de phrase déclenche l’inversion sujet-auxiliaire.'
      },
      {
        term: 'Unbridled',
        register: 'Adjectif littéraire',
        explanation: 'Littéralement « sans bride », effréné, sans entraves.'
      },
      {
        term: 'Structural fissures',
        register: 'Métaphore géopolitique',
        explanation: 'Fractures structurelles durables affaiblissant un édifice diplomatique.'
      }
    ]
  },
  {
    id: 'dict-3',
    title: 'Diplomatic Courtesies',
    source: 'Foreign Office Despatches',
    level: 'B2',
    durationLabel: '12 sec',
    canonicalText: 'Although the committee reached a tentative consensus, several delegates voiced serious reservations regarding the proposed timetable.',
    targetWord: 'Tentative',
    phonetic: '/ˈten.tə.tɪv/',
    frenchDef: 'Accord de principe provisoire, susceptible d’ajustements ultérieurs.',
    englishDef: 'Not certain or fixed; provisional.',
    etymology: "Du latin médiéval 'tentativus' (destiné à tester), dérivé de 'tentare' (essayer, toucher).",
    collocations: ['tentative consensus', 'tentative timetable', 'tentative agreement'],
    nuanceComparisons: [
      { word: 'Tentative', distinction: 'Provisoire et prudent avant validation' },
      { word: 'Definitive', distinction: 'Final, irréversible' }
    ],
    gradeLevel: '1re',
    gradeLabel: 'Première (Lycée B2)',
    theme: 'monde_travail_metiers',
    themeLabel: 'Monde du travail & Métiers',
    notes: [
      {
        term: 'Tentative consensus',
        register: 'Locution diplomatique',
        explanation: 'Accord de principe provisoire, susceptible d’ajustements ultérieurs.'
      },
      {
        term: 'Voiced reservations',
        register: 'Collocation usuelle',
        explanation: 'Émettre des réserves ou formuler des objections formelles.'
      }
    ]
  },
  {
    id: 'dict-4',
    title: 'Academic Archival Research',
    source: 'Bodleian Library Annals',
    level: 'B1',
    durationLabel: '10 sec',
    canonicalText: 'The university library contains thousands of rare manuscripts and historical documents from the eighteenth century.',
    targetWord: 'Manuscripts',
    phonetic: '/ˈmæn.jə.skrɪpts/',
    frenchDef: 'Manuscrits anciens et documents rédigés à la main conservés en bibliothèque.',
    englishDef: 'Books, documents, or pieces of music written by hand rather than typed or printed.',
    etymology: "Du latin médiéval 'manuscriptum', de 'manu' (par la main) et 'scriptus' (écrit).",
    collocations: ['rare manuscripts', 'ancient manuscripts', 'historical documents'],
    nuanceComparisons: [
      { word: 'Manuscript', distinction: 'Document écrit à la main' },
      { word: 'Print', distinction: 'Ouvrage imprimé mécaniquement' }
    ],
    gradeLevel: '3e',
    gradeLabel: '3e (Collège palier B1)',
    theme: 'histoire_patrimoine',
    themeLabel: 'Histoire & Patrimoine',
    notes: [
      {
        term: 'Rare manuscripts',
        register: 'Vocabulaire académique',
        explanation: 'Manuscrits anciens conservés dans les départements d’archives spécialisées.'
      }
    ]
  }
];

import { SPACED_REPETITION_500 } from './spacedRepetition500';

export const DICTATION_ITEMS_500: DictationItem[] = SPACED_REPETITION_500.map((card) => ({
  id: `dict-${card.id}`,
  title: `${card.term} — ${card.category}`,
  source: `${card.pressSource} • ${card.themeLabel}`,
  level: card.level,
  durationLabel: `${Math.max(4, Math.min(18, Math.round(card.pressExcerpt.split(' ').length * 0.65)))} sec`,
  canonicalText: card.pressExcerpt,
  notes: [
    {
      term: card.term,
      register: `Mot cible • ${card.gradeLabel}`,
      explanation: `${card.frenchDef} (Phonétique : ${card.phonetic})`
    },
    {
      term: 'Origine & Philologie',
      register: 'Étymologie',
      explanation: card.etymology
    },
    ...card.collocations.map((c) => ({
      term: c,
      register: 'Collocation usuelle',
      explanation: 'Association idiomatique fréquente en anglais contemporain.'
    }))
  ],
  targetWord: card.term,
  phonetic: card.phonetic,
  frenchDef: card.frenchDef,
  englishDef: card.englishDef,
  etymology: card.etymology,
  collocations: card.collocations,
  nuanceComparisons: card.nuanceComparisons,
  gradeLevel: card.gradeLevel,
  gradeLabel: card.gradeLabel,
  theme: card.theme,
  themeLabel: card.themeLabel
}));

export const DICTATION_ITEMS: DictationItem[] = [
  ...CLASSIC_DICTATION_ITEMS,
  ...DICTATION_ITEMS_500
];

export interface FlashcardItem {
  id: string;
  term: string;
  phonetic: string;
  level: CEFRLevel;
  category: string;
  frenchDef: string;
  englishDef: string;
  etymology: string;
  pressExcerpt: string;
  pressSource: string;
  collocations: string[];
  nuanceComparisons: Array<{ word: string; distinction: string }>;
  gradeLevel?: '6e' | '5e' | '4e' | '3e' | '2nde' | '1re' | 'terminale';
  gradeLabel?: string;
  theme?: string;
  themeLabel?: string;
}

export const FLASHCARD_ITEMS: FlashcardItem[] = SPACED_REPETITION_500;

export interface QuizQuestion {
  id: string;
  level: CEFRLevel;
  category: string;
  promptSentence: string;
  questionText: string;
  options: Array<{
    label: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    level: 'C1',
    category: 'Inversion Rhétorique & Emphase',
    promptSentence: '« Seldom ______ such rhetorical mastery in parliamentary debate. »',
    questionText: 'Choisissez la structure syntaxique inversée correcte pour compléter la proposition formelle :',
    options: [
      {
        label: 'A',
        text: 'had one heard',
        isCorrect: true,
        explanation: 'Correct. L’adverbe restrictif « Seldom » placé en tête de phrase déclenche l’inversion sujet-auxiliaire au pluperfect.'
      },
      {
        label: 'B',
        text: 'one has heard',
        isCorrect: false,
        explanation: 'Incorrect. Sans inversion sujet-verbe, la phrase perd sa validité d’emphase formelle.'
      },
      {
        label: 'C',
        text: 'did we saw',
        isCorrect: false,
        explanation: 'Incorrect. Double passé erroné : l’auxiliaire « did » doit être suivi de la base verbale « see ».'
      },
      {
        label: 'D',
        text: 'has witnessed one',
        isCorrect: false,
        explanation: 'Incorrect. L’ordre canonique de l’inversion place le sujet entre l’auxiliaire et le participe passé.'
      }
    ]
  },
  {
    id: 'q-2',
    level: 'C2',
    category: 'Subjonctif Présent & Droit Diplomatique',
    promptSentence: '« The prime minister insisted that the ambassador ______ immediately recalled to London. »',
    questionText: 'Quelle forme verbale respecte le subjonctif anglais mandaté après les verbes de requête formelle ?',
    options: [
      {
        label: 'A',
        text: 'be',
        isCorrect: true,
        explanation: 'Correct. Après « insisted that », la grammaire soutenue exige la base verbale nue (mandative subjunctive) sans flexion.'
      },
      {
        label: 'B',
        text: 'was',
        isCorrect: false,
        explanation: 'Incorrect. « Was » relève de l’indicatif et signale un fait avéré plutôt qu’une exigence formelle.'
      },
      {
        label: 'C',
        text: 'is',
        isCorrect: false,
        explanation: 'Incorrect. Forme indicative inadaptée au registre constitutionnel diplomatique.'
      },
      {
        label: 'D',
        text: 'should being',
        isCorrect: false,
        explanation: 'Incorrect. Syntaxe agrammaticale avec le modal « should ».'
      }
    ]
  },
  {
    id: 'q-3',
    level: 'B2',
    category: 'Collocations & Registre Écrit',
    promptSentence: '« The minister made a ______ effort to address the grievances of civil servants. »',
    questionText: 'Quel adjectif s’associe canoniquement à « effort » dans un rapport administratif officiel ?',
    options: [
      {
        label: 'A',
        text: 'concerted',
        isCorrect: true,
        explanation: 'Correct. « A concerted effort » est la collocation officielle standard pour désigner une initiative concertée et résolue.'
      },
      {
        label: 'B',
        text: 'solidary',
        isCorrect: false,
        explanation: 'Incorrect. « Solidary » est un anglicisme rare et inadapté pour qualifier un effort d’action.'
      },
      {
        label: 'C',
        text: 'conjointed',
        isCorrect: false,
        explanation: 'Incorrect. Terme archaïque ou anatomique non usité dans cette collocation.'
      },
      {
        label: 'D',
        text: 'collaborative-wise',
        isCorrect: false,
        explanation: 'Incorrect. Formation familière et non admise en style soutenu.'
      }
    ]
  }
];

export interface SpeakingItem {
  id: string;
  level: CEFRLevel;
  title: string;
  source: string;
  textToRead: string;
  phoneticHints: string;
  rhythmTips: string;
  targetAccent: string;
}

export const SPEAKING_ITEMS: SpeakingItem[] = [
  {
    id: 'spk-a1',
    level: 'A1',
    title: 'Daily Greeting & Morning Courtesies',
    source: 'Everyday Politeness & Welcome',
    textToRead: '“Good morning! It is wonderful to meet you today in London, and I hope you have a pleasant journey.”',
    phoneticHints: '/ɡʊd ˈmɔːnɪŋ! ɪt ɪz ˈwʌndəfʊl tuː miːt juː təˈdeɪ/',
    rhythmTips: 'Accent tonique sur « morning » et « wonderful ». Veillez à ne pas prononcer le /r/ britannique dans « morning ».',
    targetAccent: 'Received Pronunciation (RP)'
  },
  {
    id: 'spk-a2',
    level: 'A2',
    title: 'Travel & Urban Navigation',
    source: 'London Underground Station Guide',
    textToRead: '“Excuse me, could you tell me which platform the train to Oxford departs from, and how long the journey takes?”',
    phoneticHints: '/ɪkˈskjuːz miː, kʊd juː tɛl miː wɪtʃ ˈplætfɔːm/',
    rhythmTips: 'Intonation montante de politesse sur « Excuse me », puis intonation descendante naturelle sur « takes ».',
    targetAccent: 'Received Pronunciation (RP)'
  },
  {
    id: 'spk-b1',
    level: 'B1',
    title: 'Academic Archival Research',
    source: 'Bodleian Library Orientation',
    textToRead: '“The university archives contain thousands of rare manuscripts and historical documents from the eighteenth century.”',
    phoneticHints: '/ðə ˌjuːnɪˈvɜːsɪti ˈɑːkaɪvz kənˈteɪn ˈθaʊzəndz əv reə ˈmænjʊskrɪpts/',
    rhythmTips: 'Attaque douce sur « archives », prononciation fricative soignée de /θ/ dans « thousands » et « eighteenth ».',
    targetAccent: 'Oxford Academic Standard'
  },
  {
    id: 'spk-1',
    level: 'C1',
    title: 'The Ambassador’s Demurral',
    source: 'Chatham House Address',
    textToRead: '“It would be premature, if not decidedly imprudent, to commit our delegation before all multilateral contingencies have been thoroughly evaluated.”',
    phoneticHints: '/ɪt wʊd biː ˌpriːməˈtʃʊər, ɪf nɒt dɪˈsaɪdɪdli ɪmˈpruːdənt/',
    rhythmTips: 'Marquez un léger temps de suspension après « premature », accentuez « decidedly », et adoucissez la terminaison de « contingencies ».',
    targetAccent: 'Received Pronunciation (RP)'
  },
  {
    id: 'spk-2',
    level: 'C2',
    title: 'Edmund Burke on Prudence',
    source: 'Reflections on the Revolution in France',
    textToRead: '“Prudence is not only the first in rank of the virtues political and moral, but she is the director, the regulator, the standard of them all.”',
    phoneticHints: '/ˈpruːdəns ɪz nɒt ˈəʊnli ðə fɜːst ɪn ræŋk/',
    rhythmTips: 'Cadence ternaire : « the director, the regulator, the standard » doit monter progressivement en intensité avant la résolution finale.',
    targetAccent: 'Oxford Academic Standard'
  },
  {
    id: 'spk-3',
    level: 'B2',
    title: 'Academic Keynote Introduction',
    source: 'Oxford Union Debates',
    textToRead: '“Distinguished colleagues and guests, tonight we examine whether economic interdependence can guarantee long-term peace among sovereign nations.”',
    phoneticHints: '/dɪˈstɪŋɡwɪʃt ˈkɒliːɡz ænd ɡɛsts/',
    rhythmTips: 'Attaque posée et solennelle sur « Distinguished », articulation nette de « economic interdependence ».',
    targetAccent: 'Contemporary British'
  }
];

// ============================================================================
// CURSUS SCOLAIRE 200 LEÇONS (6e À TERMINALE) PAR NIVEAU & PAR THÈME
// ============================================================================
import schoolCurriculumJson from './schoolCurriculumData.json';
import type {
  SchoolGrade,
  SchoolLesson,
  SchoolLevelInfo,
  SchoolThemeInfo,
  SchoolVocabularyItem,
  ModelPhrase,
  GrammarLessonPoint,
  DialogueLine,
  DictationLessonItem,
  SchoolQuizQuestion
} from './schoolCurriculum';

export type {
  SchoolGrade,
  SchoolLesson,
  SchoolLevelInfo,
  SchoolThemeInfo,
  SchoolVocabularyItem,
  ModelPhrase,
  GrammarLessonPoint,
  DialogueLine,
  DictationLessonItem,
  SchoolQuizQuestion
};

export interface ThemeCurriculumGroup {
  themeId: string;
  themeLabel: string;
  themeEn: string;
  themeIcon: string;
  lessonsCount: number;
  lessons: SchoolLesson[];
}

export interface GradeCurriculum {
  grade: SchoolGrade;
  label: string;
  cycle: string;
  cefr: string;
  goal: string;
  totalLessons: number;
  totalVocabulary: number;
  themes: ThemeCurriculumGroup[];
  themesMap: Record<string, ThemeCurriculumGroup>;
}

export interface Curriculum200Structure {
  metadata: {
    title: string;
    totalLessons: number;
    gradesCount: number;
    themesCount: number;
    version: string;
  };
  levels: SchoolLevelInfo[];
  themes: SchoolThemeInfo[];
  allLessons: SchoolLesson[];
  grades: GradeCurriculum[];
  byGrade: Record<SchoolGrade, GradeCurriculum>;
}

function build200LessonsCurriculum(): Curriculum200Structure {
  const levels = schoolCurriculumJson.levels as SchoolLevelInfo[];
  const themes = schoolCurriculumJson.themes as SchoolThemeInfo[];
  const allLessons = schoolCurriculumJson.lessons as SchoolLesson[];

  const byGrade = {} as Record<SchoolGrade, GradeCurriculum>;
  const gradesList: GradeCurriculum[] = [];

  for (const lev of levels) {
    const gradeLessons = allLessons.filter((l) => l.class_level === lev.id);
    const themesGroups: ThemeCurriculumGroup[] = [];
    const themesMap: Record<string, ThemeCurriculumGroup> = {};

    let gradeVocabCount = 0;

    for (const th of themes) {
      const themeLessons = gradeLessons.filter((l) => l.theme_id === th.id);
      for (const les of themeLessons) {
        gradeVocabCount += les.vocabulary?.length || 0;
      }

      const group: ThemeCurriculumGroup = {
        themeId: th.id,
        themeLabel: th.label,
        themeEn: th.en,
        themeIcon: th.icon,
        lessonsCount: themeLessons.length,
        lessons: themeLessons
      };

      themesGroups.push(group);
      themesMap[th.id] = group;
    }

    const gradeData: GradeCurriculum = {
      grade: lev.id as SchoolGrade,
      label: lev.label,
      cycle: lev.cycle,
      cefr: lev.cefr,
      goal: lev.goal,
      totalLessons: gradeLessons.length,
      totalVocabulary: gradeVocabCount,
      themes: themesGroups,
      themesMap
    };

    byGrade[lev.id as SchoolGrade] = gradeData;
    gradesList.push(gradeData);
  }

  return {
    metadata: {
      title: 'English Boost MZ — Cursus 200 Leçons Scolaires (6e à Terminale)',
      totalLessons: allLessons.length,
      gradesCount: levels.length,
      themesCount: themes.length,
      version: (schoolCurriculumJson as { version?: string }).version || '3.0.0'
    },
    levels,
    themes,
    allLessons,
    grades: gradesList,
    byGrade
  };
}

/**
 * Structure officielle des 200 leçons organisées par niveau (6e à Terminale)
 * et par thème (10 thèmes pédagogiques transversaux).
 */
export const CURRICULUM_200_STRUCTURE: Curriculum200Structure = build200LessonsCurriculum();
export const SCHOOL_LEVELS_DATA: SchoolLevelInfo[] = CURRICULUM_200_STRUCTURE.levels;
export const SCHOOL_THEMES_DATA: SchoolThemeInfo[] = CURRICULUM_200_STRUCTURE.themes;
export const ALL_200_LESSONS: SchoolLesson[] = CURRICULUM_200_STRUCTURE.allLessons;

/**
 * Récupère le cursus complet d'un niveau scolaire donné (ex: '6e', '3e', 'terminale')
 * avec ses 10 thèmes et leurs leçons respectives.
 */
export function getCurriculumByGrade(grade: SchoolGrade): GradeCurriculum {
  return CURRICULUM_200_STRUCTURE.byGrade[grade] || CURRICULUM_200_STRUCTURE.grades[0];
}

/**
 * Récupère la liste des 10 thèmes pour un niveau donné avec le nombre de leçons.
 */
export function getThemesForGrade(grade: SchoolGrade): ThemeCurriculumGroup[] {
  return getCurriculumByGrade(grade).themes;
}

/**
 * Récupère les leçons filtrées par classe et optionnellement par thème.
 */
export function getLessonsForGradeAndTheme(grade: SchoolGrade, themeId?: string): SchoolLesson[] {
  const gradeCurriculum = getCurriculumByGrade(grade);
  if (!themeId || themeId === 'all') {
    return gradeCurriculum.themes.flatMap((tg) => tg.lessons);
  }
  return gradeCurriculum.themesMap[themeId]?.lessons || [];
}

/**
 * Recherche une leçon par son identifiant unique parmi les 200 leçons.
 */
export function getCurriculumLessonById(id: string): SchoolLesson | undefined {
  return CURRICULUM_200_STRUCTURE.allLessons.find((l) => l.id === id);
}

/**
 * Fournit les statistiques globales de couverture du cursus des 200 leçons.
 */
export function getCurriculum200Stats() {
  const { allLessons, grades } = CURRICULUM_200_STRUCTURE;
  let totalVocab = 0;
  let totalQuiz = 0;
  let totalDictation = 0;
  let totalMinutes = 0;

  for (const l of allLessons) {
    totalVocab += l.vocabulary?.length || 0;
    totalQuiz += l.quiz?.length || 0;
    if (l.dictation) totalDictation++;
    totalMinutes += l.estimated_minutes || 20;
  }

  return {
    totalLessons: allLessons.length,
    totalVocabulary: totalVocab,
    totalQuizQuestions: totalQuiz,
    totalDictations: totalDictation,
    totalEstimatedHours: Math.round(totalMinutes / 60),
    gradesSummary: grades.map((g) => ({
      grade: g.grade,
      label: g.label,
      cycle: g.cycle,
      cefr: g.cefr,
      lessonsCount: g.totalLessons,
      vocabularyCount: g.totalVocabulary
    }))
  };
}

