import type { SchoolGrade } from './curriculum';
import type { CEFRLevel } from '../firebase/types';
import {
  CITY_BANK_5000_ITEMS,
  computeAnswerKey,
  computeQuestionKey,
  getGradeBankItems,
  getLevelDedicatedItems,
  hashContentKey,
  normalizeBankKey
} from './cityBank5000';
import type { CityBankEntry } from './cityBank5000_types';

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
  questionKey?: string;
  answerKey?: string;
  qHash?: string;
  aHash?: string;
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
  questionKey?: string;
  answerKey?: string;
  qHash?: string;
  aHash?: string;
}

export type CityChapterQuestion = CityQuestionMcq | CityQuestionWordFind;

export interface CityChapterData {
  levelNumber: number;
  chapterNumber: number;
  meta: CityChapterMeta;
  levelMeta: CityLevelNode;
  questions: CityChapterQuestion[];
}

export interface ChapterGenerationOptions {
  excludeQuestionHashes?: Set<string>;
  excludeAnswerHashes?: Set<string>;
  sessionNonce?: number;
}

export interface GeneralQuizOption {
  label: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface GeneralQuizQuestionItem {
  id: string;
  category: string;
  level: CEFRLevel;
  promptSentence: string;
  questionText: string;
  options: GeneralQuizOption[];
  questionKey: string;
  answerKey: string;
  qHash: string;
  aHash: string;
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

export interface CityLevelBlock50 {
  id: string;
  blockIndex: number; // 1..12
  startLevel: number;
  endLevel: number;
  rangeLabel: string; // e.g. "1–50"
  title: string; // e.g. "Niveaux 1–50"
  classLabels: string[];
  cefrLabels: string[];
  levels: CityLevelNode[];
}

export function getLevelBlocksOf50(blockSize: number = 50): CityLevelBlock50[] {
  const blocks: CityLevelBlock50[] = [];
  const step = Math.max(1, blockSize);
  let blockIndex = 1;

  for (let start = 1; start <= MAX_CITY_LEVEL; start += step) {
    const end = Math.min(MAX_CITY_LEVEL, start + step - 1);
    const levels = CITY_LEVELS.slice(start - 1, end);
    const classLabels = Array.from(new Set(levels.map((l) => l.classLabel)));
    const cefrLabels = Array.from(new Set(levels.map((l) => l.cefrBase)));

    blocks.push({
      id: `block-${start}-${end}`,
      blockIndex,
      startLevel: start,
      endLevel: end,
      rangeLabel: `${start}–${end}`,
      title: `Niveaux ${start}–${end}`,
      classLabels,
      cefrLabels,
      levels
    });
    blockIndex++;
  }

  return blocks;
}

export function getBlock50ForLevel(levelNumber: number, blockSize: number = 50): CityLevelBlock50 {
  const blocks = getLevelBlocksOf50(blockSize);
  return (
    blocks.find((b) => levelNumber >= b.startLevel && levelNumber <= b.endLevel) || blocks[0]
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
  { word: 'FREEDOM', clue: 'Liberté individuelle ou collective', phonetic: '/ˈfriː.dəm/' }
];

function buildWordFindQuestion(
  id: string,
  categoryTag: string,
  rawWord: string,
  clueText: string,
  explanationFr: string,
  rand: () => number,
  phonetic?: string,
  audioOverride?: string,
  questionKey?: string,
  answerKey?: string
): CityQuestionWordFind {
  let clean = sanitizeAlphaWord(rawWord);
  let finalClue = clueText;
  let finalPhonetic = phonetic;
  let finalAudio = audioOverride || rawWord;

  if (clean.length < 3 || clean.length > 14) {
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

  const resolvedQKey =
    questionKey || computeQuestionKey({ type: 'word_find', questionFr: finalClue, targetWord: clean });
  const resolvedAKey = answerKey || computeAnswerKey(clean);

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
    audioText: finalAudio,
    questionKey: resolvedQKey,
    answerKey: resolvedAKey,
    qHash: hashContentKey(resolvedQKey),
    aHash: hashContentKey(resolvedAKey)
  };
}

const GRADE_ORDER: SchoolGrade[] = ['6e', '5e', '4e', '3e', '2nde', '1re', 'terminale'];

function getOrderedGradeProximity(targetGrade: SchoolGrade): SchoolGrade[] {
  const targetIdx = Math.max(0, GRADE_ORDER.indexOf(targetGrade));
  return [...GRADE_ORDER].sort((a, b) => {
    const da = Math.abs(GRADE_ORDER.indexOf(a) - targetIdx);
    const db = Math.abs(GRADE_ORDER.indexOf(b) - targetIdx);
    if (da !== db) return da - db;
    return GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b);
  });
}

function buildMcqOptionsFromEntry(
  entry: CityBankEntry,
  rand: () => number,
  fallbackPool: CityBankEntry[]
): { options: string[]; correctIndex: number } {
  const seenNorm = new Set<string>([normalizeBankKey(entry.answer)]);
  const distractors: string[] = [];

  for (const d of entry.distractors) {
    const trimmed = String(d || '').trim();
    const norm = normalizeBankKey(trimmed);
    if (trimmed && norm && !seenNorm.has(norm)) {
      seenNorm.add(norm);
      distractors.push(trimmed);
      if (distractors.length >= 3) break;
    }
  }

  // Borrow genuine domain-appropriate answers from fallbackPool if fewer than 3 distractors
  if (distractors.length < 3 && fallbackPool.length > 0) {
    const startOffset = Math.floor(rand() * fallbackPool.length);
    for (let step = 0; step < fallbackPool.length && distractors.length < 3; step++) {
      const candidate = fallbackPool[(startOffset + step * 7) % fallbackPool.length];
      if (candidate.kind === 'word_find') continue;
      const ans = candidate.answer.trim();
      const norm = normalizeBankKey(ans);
      if (ans && norm && !seenNorm.has(norm) && ans.length <= 90) {
        seenNorm.add(norm);
        distractors.push(ans);
      }
    }
  }

  // Emergency borrow across global bank if still < 3
  if (distractors.length < 3) {
    const startOffset = Math.floor(rand() * CITY_BANK_5000_ITEMS.length);
    for (let step = 0; step < CITY_BANK_5000_ITEMS.length && distractors.length < 3; step++) {
      const candidate = CITY_BANK_5000_ITEMS[(startOffset + step * 13) % CITY_BANK_5000_ITEMS.length];
      if (candidate.kind === 'word_find') continue;
      const ans = candidate.answer.trim();
      const norm = normalizeBankKey(ans);
      if (ans && norm && !seenNorm.has(norm)) {
        seenNorm.add(norm);
        distractors.push(ans);
      }
    }
  }

  const allOpts = seededShuffle([entry.answer, ...distractors.slice(0, 3)], rand);
  return {
    options: allOpts,
    correctIndex: Math.max(0, allOpts.indexOf(entry.answer))
  };
}

function bankEntryToQuestion(
  entry: CityBankEntry,
  idPrefix: string,
  rand: () => number,
  fallbackPool: CityBankEntry[]
): CityChapterQuestion {
  const qHash = hashContentKey(entry.questionKey);
  const aHash = hashContentKey(entry.answerKey);

  if (entry.kind === 'word_find') {
    return buildWordFindQuestion(
      `${idPrefix}-${entry.id}`,
      entry.category,
      entry.answer,
      entry.questionFr,
      entry.explanationFr,
      rand,
      entry.phonetic,
      entry.audioText,
      entry.questionKey,
      entry.answerKey
    );
  }

  const { options, correctIndex } = buildMcqOptionsFromEntry(entry, rand, fallbackPool);

  return {
    id: `${idPrefix}-${entry.id}`,
    type: 'mcq',
    categoryTag: entry.category,
    promptEn: entry.promptEn || undefined,
    questionFr: entry.questionFr,
    options,
    correctIndex,
    explanationFr: entry.explanationFr,
    audioText: entry.audioText || entry.answer,
    questionKey: entry.questionKey,
    answerKey: entry.answerKey,
    qHash,
    aHash
  };
}

type ChapterSlotPreference = 'vocab' | 'grammar' | 'word_find' | 'any_mcq';

function entryMatchesSlot(entry: CityBankEntry, slot: ChapterSlotPreference): boolean {
  if (slot === 'word_find') return entry.kind === 'word_find';
  if (slot === 'grammar') return entry.kind === 'grammar';
  if (slot === 'vocab') return entry.kind === 'vocab';
  return entry.kind !== 'word_find';
}

/**
 * Generates level-appropriate 4-question chapter content drawing from the 9,000+ item bank,
 * strictly skipping every question and answer already seen by the player.
 */
export function generateChapterContent(
  levelNumber: number,
  chapterNumber: number,
  options?: ChapterGenerationOptions
): CityChapterData {
  const safeLevel = Math.max(1, Math.min(MAX_CITY_LEVEL, Math.floor(levelNumber)));
  const safeChapter = Math.max(1, Math.min(10, Math.floor(chapterNumber)));
  const levelMeta = getCityLevelByNumber(safeLevel);
  const meta = CHAPTER_TEMPLATES[safeChapter - 1] || CHAPTER_TEMPLATES[0];
  const nonce = options?.sessionNonce || 0;
  const rand = seededRand(safeLevel * 997 + safeChapter * 131 + (nonce % 999983) + 42);

  const excludeQ = options?.excludeQuestionHashes;
  const excludeA = options?.excludeAnswerHashes;

  // Prioritized candidate sequence:
  // 1. Dedicated items mapped specifically to this exact level (1..600)
  // 2. Remaining items in the same district grade (shuffled)
  // 3. Adjacent grade bands sorted by proximity
  const dedicated = seededShuffle(getLevelDedicatedItems(safeLevel), rand);
  const sameGrade = seededShuffle(getGradeBankItems(levelMeta.districtId), rand);

  const orderedPool: CityBankEntry[] = [];
  const addedEntryIds = new Set<string>();
  const pushUniqueEntry = (e: CityBankEntry) => {
    if (!addedEntryIds.has(e.id)) {
      addedEntryIds.add(e.id);
      orderedPool.push(e);
    }
  };

  dedicated.forEach(pushUniqueEntry);
  sameGrade.forEach(pushUniqueEntry);

  for (const grade of getOrderedGradeProximity(levelMeta.districtId)) {
    if (grade === levelMeta.districtId) continue;
    const bandItems = seededShuffle(getGradeBankItems(grade), rand);
    bandItems.forEach(pushUniqueEntry);
  }

  // Chapter slot specialization matching the 10 chapter archetypes
  let slots: ChapterSlotPreference[];
  if (safeChapter === 2 || safeChapter === 5 || safeChapter === 9) {
    slots = ['word_find', 'grammar', 'word_find', 'vocab'];
  } else if (safeChapter === 3 || safeChapter === 6 || safeChapter === 8) {
    slots = ['grammar', 'vocab', 'grammar', 'word_find'];
  } else if (safeChapter === 10) {
    slots = ['grammar', 'vocab', 'word_find', 'any_mcq'];
  } else {
    slots = ['vocab', 'grammar', 'vocab', 'word_find'];
  }

  const pickedQHashes = new Set<string>();
  const pickedAHashes = new Set<string>();
  const pickedEntries: CityBankEntry[] = [];

  const isEligible = (e: CityBankEntry, respectHistory: boolean): boolean => {
    const qh = hashContentKey(e.questionKey);
    const ah = hashContentKey(e.answerKey);
    if (pickedQHashes.has(qh) || pickedAHashes.has(ah)) return false;
    if (respectHistory) {
      if (excludeQ?.has(qh) || excludeA?.has(ah)) return false;
    }
    return true;
  };

  const pickForSlot = (slot: ChapterSlotPreference): CityBankEntry | undefined => {
    // Pass 1: Match slot preference AND unseen globally
    for (const entry of orderedPool) {
      if (entryMatchesSlot(entry, slot) && isEligible(entry, true)) {
        return entry;
      }
    }
    // Pass 2: Any unseen entry across entire 9,000+ pool (even if slot kind differs)
    for (const entry of orderedPool) {
      if (isEligible(entry, true)) {
        return entry;
      }
    }
    // Pass 3 (only if ALL 9,000+ unique items in the app were seen): rotate while keeping current chapter disjoint
    for (const entry of orderedPool) {
      if (entryMatchesSlot(entry, slot) && isEligible(entry, false)) {
        return entry;
      }
    }
    for (const entry of orderedPool) {
      if (isEligible(entry, false)) {
        return entry;
      }
    }
    return undefined;
  };

  for (const slot of slots) {
    const chosen = pickForSlot(slot);
    if (chosen) {
      pickedQHashes.add(hashContentKey(chosen.questionKey));
      pickedAHashes.add(hashContentKey(chosen.answerKey));
      pickedEntries.push(chosen);
    }
  }

  const questions: CityChapterQuestion[] = pickedEntries.map((entry, idx) =>
    bankEntryToQuestion(entry, `l${safeLevel}-c${safeChapter}-q${idx}`, rand, sameGrade)
  );

  return {
    levelNumber: safeLevel,
    chapterNumber: safeChapter,
    meta,
    levelMeta,
    questions
  };
}

const CEFR_TO_GRADES: Record<CEFRLevel, SchoolGrade[]> = {
  A1: ['6e', '5e', '4e', '3e', '2nde', '1re', 'terminale'],
  A2: ['4e', '3e', '5e', '2nde', '6e', '1re', 'terminale'],
  B1: ['2nde', '3e', '1re', '4e', 'terminale', '5e', '6e'],
  B2: ['1re', '2nde', 'terminale', '3e', '4e', '5e', '6e'],
  C1: ['terminale', '1re', '2nde', '3e', '4e', '5e', '6e'],
  C2: ['terminale', '1re', '2nde', '3e', '4e', '5e', '6e']
};

/**
 * Generates an unseen batch of General Quiz MCQ questions tailored to the user's CEFR level,
 * strictly avoiding previously seen questions and answers.
 */
export function generateGeneralQuizSession(
  cefrLevel: CEFRLevel,
  count: number = 10,
  options?: ChapterGenerationOptions
): GeneralQuizQuestionItem[] {
  const nonce = options?.sessionNonce || 0;
  const rand = seededRand(Date.now() % 1000003 + nonce * 193 + count * 31);
  const excludeQ = options?.excludeQuestionHashes;
  const excludeA = options?.excludeAnswerHashes;

  const gradePriority = CEFR_TO_GRADES[cefrLevel] || CEFR_TO_GRADES.B2;
  const orderedMcqs: CityBankEntry[] = [];
  const seenIds = new Set<string>();

  for (const g of gradePriority) {
    const gradeMcqs = seededShuffle(
      getGradeBankItems(g).filter((e) => e.kind !== 'word_find'),
      rand
    );
    // Prioritize grammar nuances & richer quiz items mixed cleanly with vocab
    for (const e of gradeMcqs) {
      if (!seenIds.has(e.id)) {
        seenIds.add(e.id);
        orderedMcqs.push(e);
      }
    }
  }

  const pickedQHashes = new Set<string>();
  const pickedAHashes = new Set<string>();
  const selectedEntries: CityBankEntry[] = [];

  const isEligible = (e: CityBankEntry, checkHistory: boolean): boolean => {
    const qh = hashContentKey(e.questionKey);
    const ah = hashContentKey(e.answerKey);
    if (pickedQHashes.has(qh) || pickedAHashes.has(ah)) return false;
    if (checkHistory && (excludeQ?.has(qh) || excludeA?.has(ah))) return false;
    return true;
  };

  for (const entry of orderedMcqs) {
    if (selectedEntries.length >= count) break;
    if (isEligible(entry, true)) {
      pickedQHashes.add(hashContentKey(entry.questionKey));
      pickedAHashes.add(hashContentKey(entry.answerKey));
      selectedEntries.push(entry);
    }
  }

  // Fallback pass only if full 9,000+ database was exhausted
  if (selectedEntries.length < count) {
    for (const entry of orderedMcqs) {
      if (selectedEntries.length >= count) break;
      if (isEligible(entry, false)) {
        pickedQHashes.add(hashContentKey(entry.questionKey));
        pickedAHashes.add(hashContentKey(entry.answerKey));
        selectedEntries.push(entry);
      }
    }
  }

  const labels = ['A', 'B', 'C', 'D'];
  return selectedEntries.map((entry, idx) => {
    const { options: mcqOptions, correctIndex } = buildMcqOptionsFromEntry(entry, rand, orderedMcqs);
    return {
      id: `gq-${nonce}-${idx}-${entry.id}`,
      category: entry.category,
      level: cefrLevel,
      promptSentence: entry.promptEn || entry.questionFr,
      questionText: entry.promptEn ? entry.questionFr : 'Sélectionnez la formulation ou traduction exacte :',
      options: mcqOptions.map((text, optIdx) => ({
        label: labels[optIdx] || String(optIdx + 1),
        text,
        isCorrect: optIdx === correctIndex,
        explanation: entry.explanationFr
      })),
      questionKey: entry.questionKey,
      answerKey: entry.answerKey,
      qHash: hashContentKey(entry.questionKey),
      aHash: hashContentKey(entry.answerKey)
    };
  });
}
