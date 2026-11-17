import {
  ALL_200_LESSONS,
  CURIOSITIES,
  QUIZ_QUESTIONS,
  type SchoolGrade,
  type SchoolLesson
} from './curriculum';
import { GRAMMAR_6E_ITEMS } from './grammar6eData';
import {
  ANTONYM_SYNONYM_ITEMS,
  FILL_THE_BLANK_ITEMS,
  IDIOM_HUNTER_ITEMS,
  UK_VS_US_ITEMS,
  WORD_SCRAMBLE_DEBUTANT_BANK,
  WORD_SCRAMBLE_EXPERT_BANK,
  WORD_SCRAMBLE_INTERMEDIAIRE_BANK,
  WORD_SCRAMBLE_MASTER_BANK
} from './twentyGamesData';

export const MAX_CITY_LEVEL = 600;
export const TOTAL_CITY_CHAPTERS = MAX_CITY_LEVEL * 10;

export interface CityDistrict {
  id: SchoolGrade;
  name: string;
  subtitle: string;
  classLabel: string;
  cefrLabel: string;
  cefrBase: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  startLevel: number;
  endLevel: number;
  sectorSize: number;
  monumentName: string;
  monumentIcon: string;
  accentHex: string;
  badgeText: string;
  description: string;
}

export interface CityLevelSector {
  id: string;
  districtId: SchoolGrade;
  sectorIndex: number; // 1-based within district
  romanLabel: string;
  startLevel: number;
  endLevel: number;
  title: string;
}

export interface CityLevelNode {
  levelNumber: number; // 1..600
  districtId: SchoolGrade;
  districtName: string;
  classLabel: string;
  cefrLabel: string;
  cefrBase: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  landmarkTitle: string;
  themeFocus: string;
  icon: string;
  isDistrictGate: boolean;
}

export interface CityChapterMeta {
  chapterNumber: number; // 1..10
  title: string;
  categoryLabel: string;
  categoryIcon: string;
  isBossChapter: boolean;
}

export interface CityQuestionMcq {
  id: string;
  type: 'mcq';
  categoryTag: string;
  promptEn?: string;
  questionFr: string;
  options: string[];
  correctIndex: number;
  explanationFr: string;
  audioText: string;
}

export interface CityQuestionWordFind {
  id: string;
  type: 'word_find';
  categoryTag: string;
  questionFr: string;
  clueText: string;
  phonetic?: string;
  targetWord: string; // Uppercase A-Z letters only
  scrambledLetters: string[];
  explanationFr: string;
  audioText: string;
}

export type CityChapterQuestion = CityQuestionMcq | CityQuestionWordFind;

export interface CityChapterData {
  levelNumber: number;
  chapterNumber: number;
  meta: CityChapterMeta;
  levelMeta: CityLevelNode;
  questions: CityChapterQuestion[];
}

export const CITY_DISTRICTS: CityDistrict[] = [
  {
    id: '6e',
    name: 'Quartier des Fondations',
    subtitle: 'Cycle 3 · Premiers repères lexicaux & syntaxe de base',
    classLabel: '6e',
    cefrLabel: 'CECRL A1',
    cefrBase: 'A1',
    startLevel: 1,
    endLevel: 90,
    sectorSize: 15,
    monumentName: "Place de l'Alphabet & Horloge d'Initiation",
    monumentIcon: 'location_city',
    accentHex: '#f2ca50',
    badgeText: 'Niv. 1 – 90',
    description:
      'Construisez les avenues fondamentales : salutations, be/have, présent simple, vie quotidienne et premiers mots assemblés.'
  },
  {
    id: '5e',
    name: 'Esplanade Syntaxique',
    subtitle: 'Cycle 4 · Récits, prétérit et déplacements urbains',
    classLabel: '5e',
    cefrLabel: 'CECRL A1+',
    cefrBase: 'A1',
    startLevel: 91,
    endLevel: 180,
    sectorSize: 15,
    monumentName: 'Viaduc du Prétérit & Square Victoria',
    monumentIcon: 'domain',
    accentHex: '#38bdf8',
    badgeText: 'Niv. 91 – 180',
    description:
      'Maîtrisez le prétérit régulier et irrégulier, les comparatifs, la description précise et les dialogues du quotidien.'
  },
  {
    id: '4e',
    name: 'Avenue des Verbes',
    subtitle: 'Cycle 4 · Temps composés, modaux & culture anglophone',
    classLabel: '4e',
    cefrLabel: 'CECRL A2',
    cefrBase: 'A2',
    startLevel: 181,
    endLevel: 270,
    sectorSize: 15,
    monumentName: 'Gare Victorienne & Galerie des Temps',
    monumentIcon: 'account_balance',
    accentHex: '#34d399',
    badgeText: 'Niv. 181 – 270',
    description:
      'Consolidation A2 : present perfect, modaux de politesse, prépositions anglaises et différenciation UK / US.'
  },
  {
    id: '3e',
    name: 'Carrefour du Brevet',
    subtitle: 'Fin de Collège · Argumentation & autonomie pratique',
    classLabel: '3e',
    cefrLabel: 'CECRL A2+',
    cefrBase: 'A2',
    startLevel: 271,
    endLevel: 360,
    sectorSize: 15,
    monumentName: 'Grand Théâtre du Brevet & Arche Royale',
    monumentIcon: 'theater_comedy',
    accentHex: '#a78bfa',
    badgeText: 'Niv. 271 – 360',
    description:
      'Préparez le passage au lycée avec des structures conditionnelles, la voix passive et le lexique de citoyenneté.'
  },
  {
    id: '2nde',
    name: 'Palais de la Nuance',
    subtitle: 'Lycée · Expression structurée & registres comparés',
    classLabel: '2nde',
    cefrLabel: 'CECRL B1',
    cefrBase: 'B1',
    startLevel: 361,
    endLevel: 440,
    sectorSize: 16,
    monumentName: 'Serre Académique & Promenade de Piccadilly',
    monumentIcon: 'apartment',
    accentHex: '#fbbf24',
    badgeText: 'Niv. 361 – 440',
    description:
      'Déployez une syntaxe nuancée : connecteurs logiques, expressions idiomatiques et précision de l’écrit journalistique.'
  },
  {
    id: '1re',
    name: 'Observatoire Rhétorique',
    subtitle: 'Lycée · Analyse critique, essais et discours soutenu',
    classLabel: '1re',
    cefrLabel: 'CECRL B2',
    cefrBase: 'B2',
    startLevel: 441,
    endLevel: 520,
    sectorSize: 16,
    monumentName: 'Pont Royal & Tour du Discours',
    monumentIcon: 'castle',
    accentHex: '#fb7185',
    badgeText: 'Niv. 441 – 520',
    description:
      'Dominez les nuances argumentatives B2, la voix passive avancée, les nuances lexicales et l’oratoire parlementaire.'
  },
  {
    id: 'terminale',
    name: "Citadelle d'Oxford",
    subtitle: 'Excellence · Maîtrise stylistique, diplomatique & littéraire',
    classLabel: 'Terminale',
    cefrLabel: 'CECRL C1/C2',
    cefrBase: 'C1',
    startLevel: 521,
    endLevel: 600,
    sectorSize: 16,
    monumentName: 'Dôme Bodléien & Cour Suprême de l’Éloquence',
    monumentIcon: 'temple_hindu',
    accentHex: '#f59e0b',
    badgeText: 'Niv. 521 – 600',
    description:
      'Couronnement du plan principal : inversions formelles, subjonctif anglais, lexique C1/C2 rare et dialectique d’Oxford.'
  }
];

const LANDMARK_ARCHETYPES: Record<SchoolGrade, Array<{ title: string; focus: string; icon: string }>> = {
  '6e': [
    { title: 'Porte de Big Ben', focus: 'Salutations & Auxiliaire Be', icon: 'schedule' },
    { title: 'Square des Couleurs', focus: 'Lexique Élémentaire & Articles', icon: 'palette' },
    { title: 'Allée des Écoliers', focus: 'Matériel & Vie Scolaire', icon: 'backpack' },
    { title: 'Place de la Famille', focus: 'Possessifs & Verbe Have Got', icon: 'family_restroom' },
    { title: 'Kiosque des Nombres', focus: 'Heure, Dates & Quantités', icon: 'calculate' },
    { title: 'Jardin des Animaux', focus: 'Pluriels & Descriptions', icon: 'pets' },
    { title: 'Fontaine du Présent', focus: 'Présent Simple & Habitudes', icon: 'water_drop' },
    { title: 'Rue des Saveurs', focus: 'Nourriture & Goûts (Like/Love)', icon: 'restaurant' },
    { title: 'Terrasse des Saisons', focus: 'Météo & Temps qu’il fait', icon: 'wb_sunny' },
    { title: 'Bibliothèque Primaire', focus: 'Adverbes de Fréquence', icon: 'menu_book' },
    { title: 'Passage des Loisirs', focus: 'Sports & Activités (Can/Can’t)', icon: 'sports_soccer' },
    { title: 'Pavillon de la Maison', focus: 'Pièces & Prépositions de Lieu', icon: 'home' },
    { title: 'Arcade des Transports', focus: 'Déplacements & Directions', icon: 'directions_bus' },
    { title: 'Belgique Street', focus: 'Présent Continu (Be + -ing)', icon: 'directions_walk' },
    { title: 'Beffroi des Fondations', focus: 'Bilan Général Niveau 6e', icon: 'emoji_events' }
  ],
  '5e': [
    { title: 'Pont de Tamise', focus: 'Prétérit du Verbe Be (Was/Were)', icon: 'bridge' },
    { title: 'Gare du Passé', focus: 'Verbes Réguliers en -ed', icon: 'train' },
    { title: 'Cour des Chroniques', focus: 'Verbes Irréguliers Clés', icon: 'history_edu' },
    { title: 'Halles Victoriennes', focus: 'Dénombrables & Indénombrables', icon: 'storefront' },
    { title: 'Promenade des Héros', focus: 'Récits d’Aventure & Héritage', icon: 'explore' },
    { title: 'Esplanade de l’Avenir', focus: 'Futur Proche (Be Going To)', icon: 'upcoming' },
    { title: 'Atelier des Comparaisons', focus: 'Comparatifs de Supériorité', icon: 'balance' },
    { title: 'Galerie des Superlatifs', focus: 'Superlatifs Courts & Longs', icon: 'star' },
    { title: 'Carrefour des Modaux', focus: 'Must, Mustn’t & Obligation', icon: 'gavel' },
    { title: 'Square du Royaume', focus: 'Géographie & Culture Britannique', icon: 'flag' },
    { title: 'Théâtre de Rue', focus: 'Questions Ouvertes au Passé', icon: 'question_answer' },
    { title: 'Belvédère des Arts', focus: 'Musique, Cinéma & Talents', icon: 'music_note' },
    { title: 'Observatoire Urbain', focus: 'Description Physique & Morale', icon: 'visibility' },
    { title: 'Porte de Greenwich', focus: 'Marqueurs Temporels (Ago/Since)', icon: 'public' },
    { title: 'Viaduc du Prétérit', focus: 'Grande Épreuve Niveau 5e', icon: 'military_tech' }
  ],
  '4e': [
    { title: 'Station Soho', focus: 'Present Perfect (Expérience)', icon: 'subway' },
    { title: 'Avenue des Voyages', focus: 'For vs Since & Durées', icon: 'flight_takeoff' },
    { title: 'Quartier Médias', focus: 'Presse & Information Numérique', icon: 'newspaper' },
    { title: 'Conservatoire Royal', focus: 'Modaux de Conseil (Should/Ought)', icon: 'record_voice_over' },
    { title: 'Passage Transatlantique', focus: 'Anglais UK vs US', icon: 'compare_arrows' },
    { title: 'Place des Sciences', focus: 'Voix Passive Élémentaire', icon: 'science' },
    { title: 'Boulevard de l’Écologie', focus: 'Environnement & Avenir (Will)', icon: 'eco' },
    { title: 'Tribune des Débats', focus: 'Opinion & Connecteurs Simples', icon: 'forum' },
    { title: 'Atelier des Phrasal Verbs', focus: 'Verbes à Particule Essentiels', icon: 'extension' },
    { title: 'Galerie des Relatifs', focus: 'Who, Which, Where & That', icon: 'link' },
    { title: 'Hôtel de Ville', focus: 'Vie Civique & Engagements', icon: 'account_balance' },
    { title: 'Docklands Industriels', focus: 'Prétérit Continu vs Simple', icon: 'precision_manufacturing' },
    { title: 'Pavillon Américain', focus: 'Civilisation Nord-Américaine', icon: 'star_half' },
    { title: 'Square des Contrastes', focus: 'Antonymes & Synonymes A2', icon: 'contrast' },
    { title: 'Gare Victorienne', focus: 'Grand Examen Niveau 4e', icon: 'workspace_premium' }
  ],
  '3e': [
    { title: 'Bastion du Brevet', focus: 'Conditionnel Type 1 & 2', icon: 'shield' },
    { title: 'Forum Citoyen', focus: 'Valeurs, Droits & Société', icon: 'groups' },
    { title: 'Bibliothèque des Lettres', focus: 'Discours Indirect Simple', icon: 'auto_stories' },
    { title: 'Salle des Congrès', focus: 'Expression du Regret & Hypothèse', icon: 'psychology' },
    { title: 'Galerie des Métiers', focus: 'Orientation & Compétences', icon: 'work' },
    { title: 'Pont de Westminster', focus: 'Temps du Récit & Past Perfect', icon: 'castle' },
    { title: 'Coupole des Arts', focus: 'Patrimoine Culturel Anglophone', icon: 'museum' },
    { title: 'Laboratoire d’Innovation', focus: 'Progrès & Technologies', icon: 'biotech' },
    { title: 'Allée des Nuances', focus: 'Faux Amis & Pièges Classiques', icon: 'warning' },
    { title: 'Studio des Idiomes', focus: 'Expressions Courantes Imagées', icon: 'lightbulb' },
    { title: 'Cour des Orateurs', focus: 'Argumenter & Nuancer son Propos', icon: 'campaign' },
    { title: 'Porte de Camden', focus: 'Prépositions & Collocations', icon: 'alt_route' },
    { title: 'Observatoire Historique', focus: 'Grands Repères Historiques', icon: 'history' },
    { title: 'Rotonde Littéraire', focus: 'Compréhension de Texte B1', icon: 'library_books' },
    { title: 'Grand Théâtre du Brevet', focus: 'Certificat de Maîtrise 3e', icon: 'verified' }
  ],
  '2nde': [
    { title: 'Serre Botanique', focus: 'Développement Durable & Climat', icon: 'park' },
    { title: 'Palais de Piccadilly', focus: 'Réseaux, Médias & Société', icon: 'hub' },
    { title: 'Chancellerie du Style', focus: 'Registres Formel & Courant', icon: 'edit_note' },
    { title: 'Colonnade Syntaxique', focus: 'Infinitif vs Gérondif (-ing)', icon: 'architecture' },
    { title: 'Square des Métiers d’Art', focus: 'Création, Design & Savoir-faire', icon: 'brush' },
    { title: 'Tribunal de la Logique', focus: 'Concession (Although/Despite)', icon: 'gavel' },
    { title: 'Atrium des Cultures', focus: 'Vivre Ensemble & Diversité', icon: 'diversity_3' },
    { title: 'Salon Victorien', focus: 'Modaux de Probabilité (Must/May)', icon: 'flare' },
    { title: 'Cour des Explorateurs', focus: 'Mobilité & Découverte du Monde', icon: 'travel_explore' },
    { title: 'Cabinet des Synonymes', focus: 'Précision Lexicale B1+', icon: 'spellcheck' },
    { title: 'Galerie des Particules', focus: 'Phrasal Verbs B1', icon: 'auto_fix_high' },
    { title: 'Rotonde de l’Économie', focus: 'Travail, Échange & Innovation', icon: 'trending_up' },
    { title: 'Cloître des Essais', focus: 'Structuration Argumentative', icon: 'article' },
    { title: 'Palais de la Nuance', focus: 'Consécration Niveau 2nde', icon: 'diamond' }
  ],
  '1re': [
    { title: 'Observatoire Royal', focus: 'Identités & Échanges Culturels', icon: 'telescope' },
    { title: 'Arche de Bloomsbury', focus: 'Fictions & Réalités Littéraires', icon: 'book_5' },
    { title: 'Tower of Rhetoric', focus: 'Espaces Publics & Privés', icon: 'account_balance' },
    { title: 'Pont des Idées', focus: 'Progrès Scientifique & Éthique', icon: 'psychology_alt' },
    { title: 'Salle des Traités', focus: 'Conditionnels Mixtes & Regrets', icon: 'handshake' },
    { title: 'Galerie des Citations', focus: 'Discours Rapporté Avancé', icon: 'format_quote' },
    { title: 'Forum Parlementaire', focus: 'Citoyenneté & Mondes Virtuels', icon: 'public' },
    { title: 'Cénacle Poétique', focus: 'Figures de Style & Cadence', icon: 'auto_awesome' },
    { title: 'Bureau de Presse', focus: 'Analyse Éditoriale & Économie', icon: 'feed' },
    { title: 'Chambre Haute', focus: 'Subordonnées & Emphase (Cleft)', icon: 'layers' },
    { title: 'Cour de Cambridge', focus: 'Nuances Lexicales B2', icon: 'school' },
    { title: 'Promenade des Sages', focus: 'Idiomes Académiques & Proverbes', icon: 'tips_and_updates' },
    { title: 'Tour du Discours', focus: 'Synthèse Critique & Cohérence', icon: 'analytics' },
    { title: 'Pont Royal B2', focus: 'Grande Épreuve Niveau 1re', icon: 'military_tech' }
  ],
  terminale: [
    { title: 'Porte de Bodley', focus: 'Inversions Négatives (Never have I)', icon: 'door_front' },
    { title: 'Cour Chesterfield', focus: 'Subjonctif & Style Diplomatique', icon: 'crown' },
    { title: 'Bibliothèque Ducale', focus: 'Lexique C1/C2 Rare & Étymologie', icon: 'history_edu' },
    { title: 'Tribune de Chatham', focus: 'Rhétorique Politique & État', icon: 'record_voice_over' },
    { title: 'Chambre des Lords', focus: 'Réfutation Courtoise & Nuance', icon: 'balance' },
    { title: 'Observatoire Macro', focus: 'Gouvernance Mondiale & Finance', icon: 'monitoring' },
    { title: 'Dôme Philosophique', focus: 'Épistémologie & Pensée Critique', icon: 'neurology' },
    { title: 'Colonnade Juridique', focus: 'Jurisprudence & Contrats', icon: 'policy' },
    { title: 'Salon des Belles-Lettres', focus: 'Prose Classique & Stylistique', icon: 'ink_pen' },
    { title: 'Cercle des Lexicographes', focus: 'Subtilités & Collisions Sémantiques', icon: 'dictionary' },
    { title: 'Sanctuaire d’Éloquence', focus: 'Cadence Oratoire C2', icon: 'spatial_audio_off' },
    { title: 'Citadelle d’Oxford', focus: 'Couronnement d’Excellence C1/C2', icon: 'workspace_premium' }
  ]
};

const ROMAN_SECTORS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function getDistrictSectors(district: CityDistrict): CityLevelSector[] {
  const sectors: CityLevelSector[] = [];
  const step = Math.max(10, district.sectorSize);
  let cursor = district.startLevel;
  let idx = 1;
  while (cursor <= district.endLevel) {
    const end = Math.min(district.endLevel, cursor + step - 1);
    const roman = ROMAN_SECTORS[idx - 1] || String(idx);
    sectors.push({
      id: `${district.id}-s${idx}`,
      districtId: district.id,
      sectorIndex: idx,
      romanLabel: roman,
      startLevel: cursor,
      endLevel: end,
      title: `Secteur ${roman} · Niv. ${cursor}–${end}`
    });
    cursor = end + 1;
    idx++;
  }
  return sectors;
}

export function getSectorForLevel(levelNumber: number): CityLevelSector {
  const district = getDistrictForLevel(levelNumber);
  const sectors = getDistrictSectors(district);
  return (
    sectors.find((s) => levelNumber >= s.startLevel && levelNumber <= s.endLevel) ||
    sectors[0]
  );
}

export const CITY_LEVELS: CityLevelNode[] = (() => {
  const result: CityLevelNode[] = [];
  for (const district of CITY_DISTRICTS) {
    const archetypes = LANDMARK_ARCHETYPES[district.id];
    const count = district.endLevel - district.startLevel + 1;
    for (let offset = 0; offset < count; offset++) {
      const levelNumber = district.startLevel + offset;
      const arch = archetypes[offset % archetypes.length];
      const sectorIndex = Math.floor(offset / district.sectorSize) + 1;
      const roman = ROMAN_SECTORS[sectorIndex - 1] || String(sectorIndex);
      const isFinal600 = levelNumber === MAX_CITY_LEVEL;
      const title = isFinal600
        ? "Citadelle Suprême d'Oxford"
        : sectorIndex > 1
        ? `${arch.title} · ${roman}`
        : arch.title;
      const focus = isFinal600
        ? 'Couronnement Final · Niveau 600'
        : arch.focus;
      result.push({
        levelNumber,
        districtId: district.id,
        districtName: district.name,
        classLabel: district.classLabel,
        cefrLabel: district.cefrLabel,
        cefrBase: district.cefrBase,
        landmarkTitle: title,
        themeFocus: focus,
        icon: arch.icon,
        isDistrictGate: levelNumber === district.endLevel
      });
    }
  }
  return result;
})();

export function getDistrictForLevel(levelNumber: number): CityDistrict {
  return (
    CITY_DISTRICTS.find((d) => levelNumber >= d.startLevel && levelNumber <= d.endLevel) ||
    CITY_DISTRICTS[0]
  );
}

export function getCityLevelByNumber(levelNumber: number): CityLevelNode {
  return (
    CITY_LEVELS.find((l) => l.levelNumber === levelNumber) ||
    CITY_LEVELS[0]
  );
}

export const CHAPTER_TEMPLATES: CityChapterMeta[] = [
  { chapterNumber: 1, title: 'Chapitre I · Fondations Lexicales', categoryLabel: 'Vocabulaire', categoryIcon: 'translate', isBossChapter: false },
  { chapterNumber: 2, title: 'Chapitre II · Forge des Lettres', categoryLabel: 'Trouver le Mot', categoryIcon: 'spellcheck', isBossChapter: false },
  { chapterNumber: 3, title: 'Chapitre III · Règles de Syntaxe', categoryLabel: 'Grammaire', categoryIcon: 'school', isBossChapter: false },
  { chapterNumber: 4, title: 'Chapitre IV · Précision du Quartier', categoryLabel: 'Contexte', categoryIcon: 'quiz', isBossChapter: false },
  { chapterNumber: 5, title: 'Chapitre V · Orthographe Savante', categoryLabel: 'Trouver le Mot', categoryIcon: 'extension', isBossChapter: false },
  { chapterNumber: 6, title: 'Chapitre VI · Verbes & Temps', categoryLabel: 'Conjugaison', categoryIcon: 'auto_fix_high', isBossChapter: false },
  { chapterNumber: 7, title: 'Chapitre VII · Nuances & Opposés', categoryLabel: 'Sémantique', categoryIcon: 'compare_arrows', isBossChapter: false },
  { chapterNumber: 8, title: 'Chapitre VIII · Phrases à Compléter', categoryLabel: 'Cloze Test', categoryIcon: 'edit_note', isBossChapter: false },
  { chapterNumber: 9, title: 'Chapitre IX · Décryptage Lexicographique', categoryLabel: 'Trouver le Mot', categoryIcon: 'psychology', isBossChapter: false },
  { chapterNumber: 10, title: 'Chapitre X · Épreuve du Monument', categoryLabel: 'Conquête Finale', categoryIcon: 'emoji_events', isBossChapter: true }
];

// Deterministic pseudo-random generator for reproducible chapters
function seededRand(seed: number): () => number {
  let state = (seed % 2147483647) || 1;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sanitizeAlphaWord(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, '');
}

const FALLBACK_WORD_POOL = [
  { word: 'KNOWLEDGE', clue: 'Connaissance, savoir acquis par l’étude', phonetic: '/ˈnɒl.ɪdʒ/' },
  { word: 'COURAGE', clue: 'Bravoure face à une difficulté', phonetic: '/ˈkʌr.ɪdʒ/' },
  { word: 'WISDOM', clue: 'Sagesse et discernement', phonetic: '/ˈwɪz.dəm/' },
  { word: 'HORIZON', clue: 'Ligne où le ciel semble toucher la terre', phonetic: '/həˈraɪ.zən/' },
  { word: 'FREEDOM', clue: 'Liberté individuelle ou collective', phonetic: '/ˈfriː.dəm/' },
  { word: 'LANGUAGE', clue: 'Langage, moyen d’expression structuré', phonetic: '/ˈlæŋ.ɡwɪdʒ/' },
  { word: 'BUILDING', clue: 'Bâtiment, édifice architectural', phonetic: '/ˈbɪl.dɪŋ/' },
  { word: 'JOURNEY', clue: 'Voyage ou périple d’un point à un autre', phonetic: '/ˈdʒɜː.ni/' },
  { word: 'LIBRARY', clue: 'Bibliothèque conservant les ouvrages', phonetic: '/ˈlaɪ.brər.i/' },
  { word: 'VICTORY', clue: 'Victoire remportée sur un défi', phonetic: '/ˈvɪk.tər.i/' }
];

function buildWordFindQuestion(
  id: string,
  categoryTag: string,
  rawWord: string,
  clueText: string,
  explanationFr: string,
  rand: () => number,
  phonetic?: string,
  audioOverride?: string
): CityQuestionWordFind {
  let clean = sanitizeAlphaWord(rawWord);
  let finalClue = clueText;
  let finalPhonetic = phonetic;
  let finalAudio = audioOverride || rawWord;

  if (clean.length < 3 || clean.length > 12) {
    const fallback = FALLBACK_WORD_POOL[Math.floor(rand() * FALLBACK_WORD_POOL.length)];
    clean = fallback.word;
    finalClue = fallback.clue;
    finalPhonetic = fallback.phonetic;
    finalAudio = fallback.word.toLowerCase();
  }

  // Scramble letters ensuring order differs from target when length >= 2
  const chars = clean.split('');
  let scrambled = seededShuffle(chars, rand);
  if (chars.length > 1 && scrambled.join('') === clean) {
    scrambled = [...chars.slice(1), chars[0]];
  }

  return {
    id,
    type: 'word_find',
    categoryTag,
    questionFr: 'Trouvez et assemblez le mot anglais correspondant :',
    clueText: finalClue,
    phonetic: finalPhonetic,
    targetWord: clean,
    scrambledLetters: scrambled,
    explanationFr,
    audioText: finalAudio
  };
}

/**
 * Generates deterministic, grade-matched, 4-question content for any (levelNumber 1..600, chapterNumber 1..10).
 */
export function generateChapterContent(levelNumber: number, chapterNumber: number): CityChapterData {
  const safeLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, Math.floor(levelNumber)));
  const safeChapter = Math.max(1, Math.min(10, Math.floor(chapterNumber)));
  const levelMeta = getCityLevelByNumber(safeLevel);
  const meta = CHAPTER_TEMPLATES[safeChapter - 1] || CHAPTER_TEMPLATES[0];
  const rand = seededRand(safeLevel * 997 + safeChapter * 131 + 42);

  // Filter curriculum lessons matching this district grade (fallback to all lessons if needed)
  const gradeLessons: SchoolLesson[] = ALL_200_LESSONS.filter(
    (l) => l.class_level === levelMeta.districtId
  );
  const lessonPool = gradeLessons.length > 0 ? gradeLessons : ALL_200_LESSONS;

  // Gather grade-appropriate vocabulary items
  const vocabPool = lessonPool.flatMap((les) =>
    (les.vocabulary || []).map((v) => ({ ...v, lessonTitle: les.title }))
  );
  // Gather grade-appropriate quiz items
  const quizPool = lessonPool.flatMap((les) =>
    (les.quiz || []).map((q) => ({ ...q, lessonTitle: les.title, grammarTitle: les.grammar?.title }))
  );

  const questions: CityChapterQuestion[] = [];

  // Helper to build a vocabulary MCQ
  const makeVocabMcq = (idxOffset: number): CityQuestionMcq => {
    const vIdx = (safeLevel * 7 + safeChapter * 3 + idxOffset) % vocabPool.length;
    const item = vocabPool[vIdx];
    const distractors = vocabPool
      .filter((other) => other.translation_fr !== item.translation_fr)
      .sort(() => rand() - 0.5)
      .slice(0, 3)
      .map((d) => d.translation_fr);

    const uniqueOptions = Array.from(new Set([item.translation_fr, ...distractors])).slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Option lexicale ${uniqueOptions.length + 1}`);
    }
    const shuffled = seededShuffle(uniqueOptions, rand);
    return {
      id: `l${safeLevel}-c${safeChapter}-voc-${idxOffset}`,
      type: 'mcq',
      categoryTag: `Vocabulaire · ${levelMeta.classLabel}`,
      promptEn: `${item.term} (${item.part_of_speech || 'mot'})`,
      questionFr: `Quelle est la traduction exacte de « ${item.term} » ?`,
      options: shuffled,
      correctIndex: shuffled.indexOf(item.translation_fr),
      explanationFr: `« ${item.term} » (${item.phonetic || ''}) signifie « ${item.translation_fr} ». Exemple : ${item.example_en} (${item.example_fr})`,
      audioText: item.example_en || item.term
    };
  };

  // Helper to build a curriculum quiz / grammar MCQ
  const makeLessonQuizMcq = (idxOffset: number): CityQuestionMcq => {
    if (quizPool.length > 0) {
      const qIdx = (safeLevel * 5 + safeChapter * 4 + idxOffset) % quizPool.length;
      const q = quizPool[qIdx];
      const safeCorrect = q.options[q.correct_index] || q.options[0];
      const shuffled = seededShuffle(q.options, rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-cur-${idxOffset}`,
        type: 'mcq',
        categoryTag: q.grammarTitle ? `Grammaire · ${levelMeta.classLabel}` : `Quiz · ${levelMeta.classLabel}`,
        questionFr: q.question,
        options: shuffled,
        correctIndex: shuffled.indexOf(safeCorrect),
        explanationFr: q.explanation,
        audioText: safeCorrect
      };
    }
    return makeVocabMcq(idxOffset + 2);
  };

  // Helper to build a word-find puzzle using district vocab or scramble banks
  const makeDistrictWordFind = (idxOffset: number): CityQuestionWordFind => {
    // Try vocabPool first for single clean English words (3..11 letters)
    const cleanVocab = vocabPool.filter((v) => {
      const clean = sanitizeAlphaWord(v.term);
      return !v.term.includes(' ') && clean.length >= 4 && clean.length <= 10;
    });

    if (cleanVocab.length > 0 && idxOffset % 2 === 0) {
      const chosen = cleanVocab[(safeLevel * 11 + safeChapter * 5 + idxOffset) % cleanVocab.length];
      return buildWordFindQuestion(
        `l${safeLevel}-c${safeChapter}-wf-${idxOffset}`,
        `Trouver le Mot · ${levelMeta.classLabel}`,
        chosen.term,
        `Traduction : « ${chosen.translation_fr} » — Ex : ${chosen.example_en.replace(
          new RegExp(chosen.term, 'gi'),
          '_____'
        )}`,
        `Le mot exact est « ${chosen.term} » (${chosen.translation_fr}).`,
        rand,
        chosen.phonetic,
        chosen.term
      );
    }

    const bank =
      safeLevel <= 150
        ? WORD_SCRAMBLE_DEBUTANT_BANK
        : safeLevel <= 330
        ? WORD_SCRAMBLE_INTERMEDIAIRE_BANK
        : safeLevel <= 480
        ? WORD_SCRAMBLE_EXPERT_BANK
        : WORD_SCRAMBLE_MASTER_BANK;
    const item = bank[(safeLevel * 3 + safeChapter * 7 + idxOffset) % bank.length];
    return buildWordFindQuestion(
      `l${safeLevel}-c${safeChapter}-wfb-${idxOffset}`,
      `Forge des Lettres · ${levelMeta.classLabel}`,
      item.word,
      `${item.clue} (${item.translation})`,
      `Mot reconstitué : « ${item.word} » = ${item.translation}.`,
      rand,
      undefined,
      item.word.toLowerCase()
    );
  };

  // Helper for Grammar 6e / Cloze / Nuance / Idiom / Advanced Quiz
  const makeSpecialtyMcq = (idxOffset: number): CityQuestionMcq => {
    if (safeLevel <= 180 && GRAMMAR_6E_ITEMS.length > 0) {
      const g = GRAMMAR_6E_ITEMS[(safeLevel * 4 + safeChapter + idxOffset) % GRAMMAR_6E_ITEMS.length];
      const correctSentence = g.exercise.correct_tokens.join(' ').replace(/\s+([?.!,])/g, '$1');
      const tokens = [...g.exercise.correct_tokens];
      const swapped1 =
        tokens.length > 2
          ? [tokens[1], tokens[0], ...tokens.slice(2)].join(' ').replace(/\s+([?.!,])/g, '$1')
          : `${correctSentence} not`;
      const swapped2 =
        tokens.length > 3
          ? [...tokens.slice(0, -2), tokens[tokens.length - 1], tokens[tokens.length - 2]]
              .join(' ')
              .replace(/\s+([?.!,])/g, '$1')
          : `Is ${correctSentence.toLowerCase()}`;
      const swapped3 = `Always ${correctSentence.toLowerCase()}`;
      const opts = Array.from(new Set([correctSentence, swapped1, swapped2, swapped3])).slice(0, 4);
      while (opts.length < 4) opts.push(`${tokens[0] || 'This'} is incorrect form ${opts.length}.`);
      const shuffled = seededShuffle(opts, rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-g6-${idxOffset}`,
        type: 'mcq',
        categoryTag: `Syntaxe · ${g.category}`,
        promptEn: g.structure_formula,
        questionFr: `Comment formule-t-on correctement : « ${g.exercise.french_prompt} » ?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(correctSentence),
        explanationFr: `${g.rule} — ${g.exercise.explanation}`,
        audioText: correctSentence
      };
    }

    if (safeLevel >= 441 && QUIZ_QUESTIONS.length > 0) {
      const adv = QUIZ_QUESTIONS[(safeLevel + safeChapter + idxOffset) % QUIZ_QUESTIONS.length];
      const correctOpt = adv.options.find((o) => o.isCorrect) || adv.options[0];
      const shuffled = seededShuffle(adv.options.map((o) => o.text), rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-adv-${idxOffset}`,
        type: 'mcq',
        categoryTag: `Rhétorique · ${adv.category}`,
        promptEn: adv.promptSentence,
        questionFr: adv.questionText,
        options: shuffled,
        correctIndex: shuffled.indexOf(correctOpt.text),
        explanationFr: correctOpt.explanation,
        audioText: adv.promptSentence
      };
    }

    const poolPick = (safeLevel + safeChapter + idxOffset) % 4;
    if (poolPick === 0) {
      const fb = FILL_THE_BLANK_ITEMS[(safeLevel + safeChapter + idxOffset) % FILL_THE_BLANK_ITEMS.length];
      const shuffled = seededShuffle(fb.options, rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-fb-${idxOffset}`,
        type: 'mcq',
        categoryTag: `Prépositions & Syntaxe`,
        promptEn: fb.sentence,
        questionFr: 'Choisissez le mot manquant pour compléter cette phrase anglaise :',
        options: shuffled,
        correctIndex: shuffled.indexOf(fb.correct),
        explanationFr: fb.rule,
        audioText: fb.sentence.replace('___', fb.correct)
      };
    }
    if (poolPick === 1) {
      const syn = ANTONYM_SYNONYM_ITEMS[(safeLevel + safeChapter + idxOffset) % ANTONYM_SYNONYM_ITEMS.length];
      const shuffled = seededShuffle(syn.options, rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-syn-${idxOffset}`,
        type: 'mcq',
        categoryTag: syn.type === 'SYNONYME' ? 'Synonyme Précis' : 'Antonyme Exact',
        promptEn: syn.target,
        questionFr: `Sélectionnez le ${syn.type.toLowerCase()} de « ${syn.target} » :`,
        options: shuffled,
        correctIndex: shuffled.indexOf(syn.correct),
        explanationFr: syn.explanation,
        audioText: `${syn.target}. ${syn.correct}`
      };
    }
    if (poolPick === 2) {
      const uk = UK_VS_US_ITEMS[(safeLevel + safeChapter + idxOffset) % UK_VS_US_ITEMS.length];
      const shuffled = seededShuffle(uk.options, rand);
      return {
        id: `l${safeLevel}-c${safeChapter}-ukus-${idxOffset}`,
        type: 'mcq',
        categoryTag: 'Culture UK / US',
        promptEn: uk.uk,
        questionFr: `Quel est l’équivalent américain de « ${uk.uk} » ?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(uk.correct),
        explanationFr: uk.explanation,
        audioText: uk.uk.replace(/🇬🇧|🇺🇸/g, '').trim()
      };
    }
    const idiom = IDIOM_HUNTER_ITEMS[(safeLevel + safeChapter + idxOffset) % IDIOM_HUNTER_ITEMS.length];
    const shuffled = seededShuffle(idiom.options, rand);
    return {
      id: `l${safeLevel}-c${safeChapter}-idm-${idxOffset}`,
      type: 'mcq',
      categoryTag: 'Expression Idiomatique',
      promptEn: idiom.idiom,
      questionFr: `Que signifie l’expression « ${idiom.idiom} » ?`,
      options: shuffled,
      correctIndex: shuffled.indexOf(idiom.correct),
      explanationFr: `Sens littéral : « ${idiom.literal} ». En contexte : ${idiom.example}`,
      audioText: idiom.idiom
    };
  };

  // Compose 4 tailored questions per chapter based on chapter specialization
  if (safeChapter === 2 || safeChapter === 5 || safeChapter === 9) {
    // Word-find emphasis + supporting MCQ
    questions.push(makeDistrictWordFind(0));
    questions.push(makeLessonQuizMcq(1));
    questions.push(makeDistrictWordFind(2));
    if (safeLevel >= 380 && CURIOSITIES.length > 0 && safeChapter === 9) {
      const curio = CURIOSITIES[(safeLevel + safeChapter) % CURIOSITIES.length];
      questions.push(
        buildWordFindQuestion(
          `l${safeLevel}-c${safeChapter}-curio`,
          `Lexique Rare · ${curio.level}`,
          curio.term,
          `${curio.frenchDef} (${curio.etymology})`,
          `« ${curio.term} » : ${curio.frenchDef}`,
          rand,
          curio.phonetic,
          curio.term
        )
      );
    } else {
      questions.push(makeSpecialtyMcq(3));
    }
  } else if (safeChapter === 10) {
    // Chapter 10: Monument Conquest Finale (4 varied questions covering all skills)
    questions.push(makeLessonQuizMcq(0));
    questions.push(makeSpecialtyMcq(1));
    questions.push(makeDistrictWordFind(2));
    questions.push(makeVocabMcq(3));
  } else {
    // Balanced mix of curriculum quiz, vocabulary, grammar/specialty, and word-find
    questions.push(makeVocabMcq(0));
    questions.push(makeLessonQuizMcq(1));
    questions.push(makeSpecialtyMcq(2));
    questions.push(makeDistrictWordFind(3));
  }

  return {
    levelNumber: safeLevel,
    chapterNumber: safeChapter,
    meta,
    levelMeta,
    questions
  };
}
