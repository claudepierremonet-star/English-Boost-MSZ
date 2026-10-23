/**
 * English Boost MZ - Overlapping Stacked Collections Data
 * Multi-domain datasets for:
 * 1. 课程分类 (Course Categories)
 * 2. 学习收藏 (Study Collections & Bookmarks)
 * 3. 词汇集 (Vocabulary Sets & Decks)
 * 4. 个人资料 (Academic Profile & Dossier)
 */

import type { CEFRLevel } from '../firebase/types';

export type StackCategoryType = 'courses' | 'collections' | 'vocabulary' | 'profile';

export interface StackCardItem {
  id: string;
  category: StackCategoryType;
  title: string;
  subtitle: string;
  badge: string;
  romanId: string;
  level: CEFRLevel | string;
  accent: string;
  iconName: string;
  itemsCount: string;
  duration?: string;
  quote: string;
  author: string;
  actionLabel: string;
  actionType: 'study' | 'flashcards' | 'dictation' | 'quiz' | 'profile' | 'cursus';
}

export const STACKED_COLLECTIONS_DATA: Record<StackCategoryType, {
  label: string;
  labelCn: string;
  description: string;
  icon: string;
  items: StackCardItem[];
}> = {
  courses: {
    label: 'Cursus & Catégories',
    labelCn: '课程分类',
    description: 'Disciplines maîtresses d’éloquence diplomatique et d’académisme victorien',
    icon: 'school',
    items: [
      {
        id: 'course-1',
        category: 'courses',
        title: 'Diplomatic Rhetoric & Treaties',
        subtitle: "L'art de la réfutation courtoise : structuration formelle d'un désaccord sans concession de souveraineté.",
        badge: "FOLIO I • PRIORITÉ",
        romanId: 'I',
        level: 'C2',
        accent: 'British RP',
        iconName: 'gavel',
        itemsCount: '68 Lexèmes C2',
        duration: '3h 45m',
        quote: '“Style is the dress of thoughts; and let them be ever so just, if your style is homely and vulgar, they will appear to as much disadvantage as a lord in rags.”',
        author: 'Lord Chesterfield • Letters to His Son (1774)',
        actionLabel: 'Étudier',
        actionType: 'dictation'
      },
      {
        id: 'course-2',
        category: 'courses',
        title: 'Westminster Parliamentary Oratory',
        subtitle: 'Cadence oratoire de la Chambre des Lords, figures d’antithèse et répliques péremptoires.',
        badge: "FOLIO II • TRIBUNAL",
        romanId: 'II',
        level: 'C1',
        accent: 'Contradictoire',
        iconName: 'account_balance',
        itemsCount: 'Archives Hansard',
        duration: '2h 30m',
        quote: '“A speech is not merely an assemblage of eloquent words, but an engine of statecraft designed to disarm resistance through irresistible cadence.”',
        author: 'Lord Chatham • Debates on Conciliation (1775)',
        actionLabel: 'Déclamer',
        actionType: 'study'
      },
      {
        id: 'course-3',
        category: 'courses',
        title: 'Oxbridge Dialectics & Stylistics',
        subtitle: 'Dissertations académiques, métaphores étendues et prose victorienne soutenue.',
        badge: 'FOLIO III • DIALECTIQUE',
        romanId: 'III',
        level: 'C2',
        accent: 'Syllogismes',
        iconName: 'history_edu',
        itemsCount: 'Cambridge C2',
        duration: '4h 10m',
        quote: '“He who writes with precision forces the chaotic manifold of human intellect into an immutable crystal of understanding.”',
        author: 'Dr. Samuel Johnson • The Rambler (1751)',
        actionLabel: 'Analyser',
        actionType: 'flashcards'
      },
      {
        id: 'course-4',
        category: 'courses',
        title: 'High Court Judicial Nuance',
        subtitle: 'Structure du syllogisme juridique, réfutations courtoises et cas de droit coutumier.',
        badge: 'FOLIO IV • JURISPRUDENCE',
        romanId: 'IV',
        level: 'C2',
        accent: 'Précision Absolue',
        iconName: 'balance',
        itemsCount: 'Phraséologie Bespoke',
        duration: '3h 15m',
        quote: '“Equity does not bend the law, but polishes its razor edge so that justice may divide guilt from misfortune without shredding virtue.”',
        author: 'Lord Mansfield • High Court Precedents (1780)',
        actionLabel: 'Explorer',
        actionType: 'quiz'
      },
      {
        id: 'course-5',
        category: 'courses',
        title: 'Macroeconomic Statecraft & Reserves',
        subtitle: 'Analyse monétaire internationale, dépêches de banques centrales et équilibres de Bretton Woods.',
        badge: 'FOLIO V • ÉCONOMIE',
        romanId: 'V',
        level: 'C1',
        accent: 'The Economist',
        iconName: 'query_stats',
        itemsCount: 'Finance Internationale',
        duration: '2h 50m',
        quote: '“Monetary sovereignty requires not merely strong treasuries, but the linguistic fortitude to dictate terms in the lingua franca of global commerce.”',
        author: 'John Maynard Keynes • Essays in Persuasion (1931)',
        actionLabel: 'Étudier',
        actionType: 'dictation'
      },
      {
        id: 'course-6',
        category: 'courses',
        title: 'Bespoke Epistolary & Executive Protocol',
        subtitle: 'Correspondance protocolaire de chancellerie, formules de salutation haute et dépêches confidentielles.',
        badge: 'FOLIO VI • CHANCELLERIE',
        romanId: 'VI',
        level: 'C2',
        accent: 'Diplomatique',
        iconName: 'mail',
        itemsCount: 'Formules Déférentes',
        duration: '2h 15m',
        quote: '“A letter is a permanent ambassador of character; every sentence either fortifies trust or leaves an irreparable breach in authority.”',
        author: 'Talleyrand • Mémoires Diplomatiques (1814)',
        actionLabel: 'Rédiger',
        actionType: 'study'
      }
    ]
  },

  collections: {
    label: 'Recueils & Favoris',
    labelCn: '学习收藏',
    description: 'Anthologies personnelles de tournures rhétoriques et d’extraits littéraires certifiés',
    icon: 'bookmarks',
    items: [
      {
        id: 'col-1',
        category: 'collections',
        title: 'Anthologie des Inversions Négatives',
        subtitle: 'Structures oratoires souveraines débutant par Seldom, Scarcely, Little did ou In no circumstances.',
        badge: 'RECUEIL MAÎTRE',
        romanId: 'I',
        level: 'C2',
        accent: 'Syntaxe Royale',
        iconName: 'auto_stories',
        itemsCount: '24 Tournures Clés',
        duration: 'Cadence C2',
        quote: '“Seldom does history reward the timid with anything beyond the polite obscurity of an overlooked footnote.”',
        author: 'Oxford Hansard Archives',
        actionLabel: 'Réviser',
        actionType: 'flashcards'
      },
      {
        id: 'col-2',
        category: 'collections',
        title: 'Formules Diplomatiques de Réfutation',
        subtitle: 'Atténuateurs formels, litotes diplomatiques et techniques d’encadrement rhétorique.',
        badge: 'RECUEIL STRATÉGIQUE',
        romanId: 'II',
        level: 'C1',
        accent: 'Quai d’Orsay & Whitehall',
        iconName: 'verified',
        itemsCount: '18 Modèles Prêts',
        duration: 'Protocole',
        quote: '“To decline without offense is an art that distinguishes the statesman from the mere disputant.”',
        author: 'Sir Harold Nicolson • Diplomacy (1939)',
        actionLabel: 'Consulter',
        actionType: 'study'
      },
      {
        id: 'col-3',
        category: 'collections',
        title: 'Pépites Philologiques & Étymologies',
        subtitle: 'Mots précieux d’origine gréco-latine ayant conservé leur racine savante et leur pouvoir d’évocation.',
        badge: 'CURIOSITÉS C2',
        romanId: 'III',
        level: 'C2',
        accent: 'Lexicographie',
        iconName: 'menu_book',
        itemsCount: '42 Lemmes Rares',
        duration: 'Étude Calme',
        quote: '“Words are not arbitrary sounds; they are ancestral monuments erected by generations of thinkers.”',
        author: 'C.S. Lewis • Studies in Words (1960)',
        actionLabel: 'Explorer',
        actionType: 'flashcards'
      },
      {
        id: 'col-4',
        category: 'collections',
        title: 'Éditoriaux du Financial Times & Lexique Macro',
        subtitle: 'Extraction hebdomadaire des termes économiques et financiers les plus influents des marchés.',
        badge: 'REVUE DE PRESSE',
        romanId: 'IV',
        level: 'C1',
        accent: 'Financial Times',
        iconName: 'newspaper',
        itemsCount: '35 Collocations',
        duration: 'Hebdomadaire',
        quote: '“Clarity of thought precedes clarity of markets; ambiguity is always taxed at the highest premium.”',
        author: 'Martin Wolf • Economic Commentaries',
        actionLabel: 'Réviser',
        actionType: 'flashcards'
      },
      {
        id: 'col-5',
        category: 'collections',
        title: 'Maximes Morales & Aphorismes d’Oxford',
        subtitle: 'Citations courtes à mémoriser pour enrichir dissertations, introductions de discours et synthèses.',
        badge: 'FLORILÈGE ÉLITE',
        romanId: 'V',
        level: 'C2',
        accent: 'Aphorismes',
        iconName: 'format_quote',
        itemsCount: '50 Aphorismes',
        duration: 'Méditation',
        quote: '“Knowledge without elegance is a diamond in the rough; cut it with language and it illuminates the room.”',
        author: 'Lord Chesterfield • Maxims (1777)',
        actionLabel: 'Lire',
        actionType: 'study'
      }
    ]
  },

  vocabulary: {
    label: 'Decks de Vocabulaire SM-2',
    labelCn: '词汇集',
    description: 'Jeux de flashcards mémorisées selon l’algorithme de répétition espacée SM-2',
    icon: 'style',
    items: [
      {
        id: 'voc-1',
        category: 'vocabulary',
        title: 'Deck C2 : Orfèvrerie & Nuances Morales',
        subtitle: 'Perspicacity, Sobriquet, Meretricious, Pusillanimous, Verisimilitude, Equivocal.',
        badge: 'DECK MAÎTRE SM-2',
        romanId: 'I',
        level: 'C2',
        accent: 'Haute Rétention',
        iconName: 'style',
        itemsCount: '50 Cartes Dues',
        duration: '8 min / session',
        quote: '“A single exact word renders ten pages of vague description completely obsolete.”',
        author: 'Gustave Flaubert • Correspondance',
        actionLabel: 'Lancer SM-2',
        actionType: 'flashcards'
      },
      {
        id: 'voc-2',
        category: 'vocabulary',
        title: 'Deck C1 : Collocations Académiques',
        subtitle: 'Pour lier arguments, pondérer des hypothèses et formuler des restrictions élégantes.',
        badge: 'DECK C1 ESSENTIEL',
        romanId: 'II',
        level: 'C1',
        accent: 'Connecteurs Logiques',
        iconName: 'bolt',
        itemsCount: '45 Cartes',
        duration: '6 min',
        quote: '“Logic is the skeleton, but collocations are the sinews that make prose move with grace.”',
        author: 'Oxford University Press',
        actionLabel: 'Réviser',
        actionType: 'flashcards'
      },
      {
        id: 'voc-3',
        category: 'vocabulary',
        title: 'Deck Diplomatique : Traités & Négociations',
        subtitle: 'Termes juridico-politiques : prerogative, impasse, conciliation, moratorium, sovereignty.',
        badge: 'DECK GOUVERNANCE',
        romanId: 'III',
        level: 'C2',
        accent: 'Whitehall Lexicon',
        iconName: 'shield',
        itemsCount: '38 Cartes',
        duration: '7 min',
        quote: '“In diplomacy, the punctuation of a treaty has decided the boundaries of empires.”',
        author: 'Metternich • Diplomatic Papers',
        actionLabel: 'Entraîner',
        actionType: 'flashcards'
      },
      {
        id: 'voc-4',
        category: 'vocabulary',
        title: 'Deck Curiosités Verbales & Argot Soutenu',
        subtitle: 'Expressions de salon, quolibets d’esprit et euphémismes de l’aristocratie victorienne.',
        badge: 'CURIOSITÉS RARES',
        romanId: 'IV',
        level: 'C2',
        accent: 'Victorien',
        iconName: 'auto_awesome',
        itemsCount: '32 Cartes',
        duration: '5 min',
        quote: '“Wit is educated insolence; it must sparkle without burning the tapestry.”',
        author: 'Aristotle & Wilde',
        actionLabel: 'Découvrir',
        actionType: 'flashcards'
      },
      {
        id: 'voc-5',
        category: 'vocabulary',
        title: 'Deck Phrasal Verbs de Registre Supérieur',
        subtitle: 'Verbes à particule littéraires : to gloss over, to shore up, to bear out, to weed out.',
        badge: 'IDIOMATIQUE HAUTE',
        romanId: 'V',
        level: 'B2+',
        accent: 'Idiotismes Nobles',
        iconName: 'psychology',
        itemsCount: '60 Cartes',
        duration: '10 min',
        quote: '“To master English phrasal verbs is to inhabit the very pulse of the Anglo-Saxon imagination.”',
        author: 'Fowler • Modern English Usage',
        actionLabel: 'Réviser',
        actionType: 'flashcards'
      },
      {
        id: 'voc-6',
        category: 'vocabulary',
        title: 'Deck Faux-Amis & Chausse-Trapes Stylistiques',
        subtitle: 'Désamorçage des pièges fréquents : actually, eventually, sympathetic, comprehensive, fastidious.',
        badge: 'PRÉCISION TOTALE',
        romanId: 'VI',
        level: 'C1',
        accent: 'Anti-Calques',
        iconName: 'report_problem',
        itemsCount: '40 Cartes',
        duration: '6 min',
        quote: '“A false cognate is a traitor wearing the livery of a familiar friend.”',
        author: 'Académie Philologique',
        actionLabel: 'Corriger',
        actionType: 'flashcards'
      }
    ]
  },

  profile: {
    label: 'Dossier Académique',
    labelCn: '个人资料',
    description: 'Historique des diplômes validés, certifications de niveau et carnet d’assiduité',
    icon: 'account_circle',
    items: [
      {
        id: 'prof-1',
        category: 'profile',
        title: 'Certificat de Maîtrise C2 • Oxford Scholastic',
        subtitle: 'Agrégation de rhétorique et analyse de style diplomatique avec félicitations du jury.',
        badge: 'TITRE CERTIFIÉ',
        romanId: 'I',
        level: 'C2',
        accent: 'Mention Très Honorable',
        iconName: 'military_tech',
        itemsCount: 'Top 3% Mondial',
        duration: 'Validé Oct 2026',
        quote: '“Certum est, quia impossibile est — la rigueur intellectuelle est l’unique noblesse qui résiste au temps.”',
        author: 'Chancellerie Académique',
        actionLabel: 'Consulter',
        actionType: 'profile'
      },
      {
        id: 'prof-2',
        category: 'profile',
        title: 'Bilan Continu : 78% du Cursus Consolidé',
        subtitle: '14 modules validés sur 18 avec un score moyen supérieur à 92% aux dictées et quiz.',
        badge: 'RELEVÉ DE NOTES',
        romanId: 'II',
        level: 'C1/C2',
        accent: 'Contrôle Continu',
        iconName: 'analytics',
        itemsCount: '14 Modules Validés',
        duration: 'Assiduité 24J',
        quote: '“Excellence is not an act, but a habit; repetitio est mater studiorum.”',
        author: 'Registre des Épreuves',
        actionLabel: 'Voir Métriques',
        actionType: 'profile'
      },
      {
        id: 'prof-3',
        category: 'profile',
        title: 'Registre de Rétention Espacée SM-2',
        subtitle: '348 lexèmes consolidés à long terme avec un indice de stabilité de mémoire de 8.6/10.',
        badge: 'MÉMOIRE ACTIVE',
        romanId: 'III',
        level: 'C2',
        accent: '92.4% Rétention',
        iconName: 'psychology',
        itemsCount: '348 Mots Actifs',
        duration: 'SM-2 Sync',
        quote: '“Memory is the treasury and guardian of all intellectual acquisitions.”',
        author: 'Cicéron • De Oratore',
        actionLabel: 'Réviser',
        actionType: 'flashcards'
      },
      {
        id: 'prof-4',
        category: 'profile',
        title: 'Coffre-Fort Persistant IndexedDB & Cloud',
        subtitle: 'Chiffrement local AES-256 avec synchronisation bidirectionnelle automatique Cloud Firestore.',
        badge: 'SÉCURITÉ & SYNC',
        romanId: 'IV',
        level: 'Souverain',
        accent: 'Zéro Dépendance',
        iconName: 'database',
        itemsCount: 'Offline Ready',
        duration: 'Temps Réel',
        quote: '“Autonomie absolue : la connaissance accumulée ne doit dépendre d’aucun réseau pour être consultée.”',
        author: 'Spécification Technique MSZ',
        actionLabel: 'Détails Sync',
        actionType: 'profile'
      }
    ]
  }
};
