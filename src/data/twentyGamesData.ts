/**
 * 20 Jeux d'Apprentissage Anglais Interactifs & Gamifiés
 * Fiche de données complètes : Icônes, Noms, Comment Jouer, Niveaux, Questions & Contenus
 */

export type ArcadeDifficultyTierKey = 'debutant' | 'intermediaire' | 'professionnel' | 'pro' | 'expert';

export interface ArcadeDifficultyTier {
  id: ArcadeDifficultyTierKey;
  label: string;
  minPlayerLevel: number;
  maxPlayerLevel: number;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
  description: string;
}

export const ARCADE_DIFFICULTY_TIERS: Record<ArcadeDifficultyTierKey, ArcadeDifficultyTier> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    minPlayerLevel: 1,
    maxPlayerLevel: 10,
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    icon: 'sentiment_satisfied',
    description: 'Accessible dès le Niveau 1 (Niveaux 1 à 10). Fondations et vocabulaire clé.'
  },
  intermediaire: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    minPlayerLevel: 11,
    maxPlayerLevel: 20,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    icon: 'speed',
    description: 'Débloqué au Niveau 11 (Niveaux 11 à 20). Phrases complètes et rythme soutenu.'
  },
  professionnel: {
    id: 'professionnel',
    label: 'Professionnel',
    minPlayerLevel: 21,
    maxPlayerLevel: 30,
    badgeColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    icon: 'workspace_premium',
    description: 'Débloqué au Niveau 21 (Niveaux 21 à 30). Vocabulaire professionnel et contextes d\'action.'
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    minPlayerLevel: 31,
    maxPlayerLevel: 50,
    badgeColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    icon: 'diamond',
    description: 'Débloqué au Niveau 31 (Niveaux 31 à 50). Défi chronométré et réflexes bilingues.'
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    minPlayerLevel: 51,
    maxPlayerLevel: 99,
    badgeColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    icon: 'military_tech',
    description: 'Débloqué au Niveau 51 (Niveaux 51 à 99). Niveau d\'excellence pour maîtres anglophones.'
  }
};

export interface ArcadeProgressionState {
  points: number; // Total points cumulés (+10 par victoire, -5 par défaite)
  level: number; // 1 to 99
  unlockedMaxGameNumber: number; // 1 to 20
  completedGames: string[]; // IDs des jeux validés
  activeSession?: {
    gameId: string;
    levelKey?: string;
    questionIndex: number;
    scoreAccumulated: number;
    hearts: number;
    timestamp: string;
  } | null;
}

export const ARCADE_STORAGE_KEY = 'msz_arcade_progression_v1';
export const ACTIVE_SESSION_STORAGE_KEY = 'msz_active_game_session';

export { calculateLevel } from '../utils/levelUtils';
import {
  saveArcadeProgressionToIndexedDB,
  getArcadeProgressionFromIndexedDB,
  saveActiveSessionToIndexedDB,
  getActiveSessionFromIndexedDB,
  clearActiveSessionInIndexedDB
} from '../offline/indexedDb';
import { getLocalUserProfile, updateUserProfile } from '../firebase/client';

export function calculatePlayerLevel(totalPoints: number): {
  level: number;
  pointsInCurrentLevel: number;
  currentLevelMinPoints: number;
  nextLevelTargetPoints: number;
  progressPercent: number;
  tier: ArcadeDifficultyTier;
} {
  const safePoints = Math.max(0, totalPoints);
  const level = Math.min(99, Math.max(1, Math.floor(safePoints / 100) + 1));
  const currentLevelMinPoints = (level - 1) * 100;
  const nextLevelTargetPoints = level * 100;
  const pointsInCurrentLevel = safePoints - currentLevelMinPoints;
  const progressPercent = level >= 99 ? 100 : Math.min(100, Math.max(0, pointsInCurrentLevel));

  let tierKey: ArcadeDifficultyTierKey = 'debutant';
  if (level >= 51) tierKey = 'expert';
  else if (level >= 31) tierKey = 'pro';
  else if (level >= 21) tierKey = 'professionnel';
  else if (level >= 11) tierKey = 'intermediaire';

  return {
    level,
    pointsInCurrentLevel,
    currentLevelMinPoints,
    nextLevelTargetPoints,
    progressPercent,
    tier: ARCADE_DIFFICULTY_TIERS[tierKey]
  };
}

export function getStoredArcadeProgression(): ArcadeProgressionState {
  if (typeof window === 'undefined') {
    return { points: 0, level: 1, unlockedMaxGameNumber: 1, completedGames: [] };
  }
  try {
    const raw = localStorage.getItem(ARCADE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const points = Math.max(0, Number(parsed.points) || 0);
      const level = Math.min(99, Math.max(1, Math.floor(points / 100) + 1));
      const unlockedMaxGameNumber = Math.max(1, Math.min(20, Number(parsed.unlockedMaxGameNumber) || 1));
      const completedGames = Array.isArray(parsed.completedGames) ? parsed.completedGames : [];
      return { points, level, unlockedMaxGameNumber, completedGames, activeSession: parsed.activeSession || null };
    }
  } catch (e) {
    console.warn('Failed to load arcade progression from localStorage:', e);
  }

  // Fallback to local user profile if present
  try {
    const prof = getLocalUserProfile();
    if (prof?.arcadeProgression) {
      return prof.arcadeProgression;
    }
  } catch (e) {}

  return { points: 0, level: 1, unlockedMaxGameNumber: 1, completedGames: [] };
}

export function saveStoredArcadeProgression(state: ArcadeProgressionState): void {
  if (typeof window === 'undefined') return;

  // 1. Sauvegarde synchrone immédiate dans localStorage
  try {
    localStorage.setItem(ARCADE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save arcade progression to localStorage:', e);
  }

  // 2. Sauvegarde persistante dans IndexedDB (résistant au vidage du cache de session mobile)
  saveArcadeProgressionToIndexedDB(state).catch(console.warn);

  // 3. Synchronisation automatique avec le profil utilisateur et Cloud Firestore
  try {
    const prof = getLocalUserProfile();
    if (prof) {
      updateUserProfile({
        arcadeProgression: state,
        stats: {
          ...prof.stats,
          totalXp: Math.max(prof.stats?.totalXp || 0, state.points)
        }
      }).catch(console.warn);
    }
  } catch (e) {
    console.warn('Sync notice with user profile:', e);
  }
}

/**
 * Hydrate la progression de jeu depuis toutes les sources de stockage (IndexedDB + Cloud Firestore + localStorage)
 * Garantit qu'aucun point ni niveau n'est perdu lors d'un rafraîchissement.
 */
export async function hydrateArcadeProgressionFromStorage(): Promise<ArcadeProgressionState> {
  let best = getStoredArcadeProgression();

  // A. Vérifier IndexedDB
  try {
    const idbState = await getArcadeProgressionFromIndexedDB();
    if (idbState && typeof idbState === 'object') {
      const idbPoints = Number(idbState.points) || 0;
      if (idbPoints > best.points || (idbState.unlockedMaxGameNumber || 1) > best.unlockedMaxGameNumber) {
        best = {
          points: Math.max(best.points, idbPoints),
          level: Math.max(best.level, Number(idbState.level) || 1),
          unlockedMaxGameNumber: Math.max(best.unlockedMaxGameNumber, Number(idbState.unlockedMaxGameNumber) || 1),
          completedGames: Array.from(new Set([...best.completedGames, ...(idbState.completedGames || [])])),
          activeSession: idbState.activeSession || best.activeSession || null
        };
      }
    }
  } catch (e) {
    console.warn('IndexedDB hydration notice:', e);
  }

  // B. Vérifier le Profil Utilisateur (chargé de Firestore)
  try {
    const prof = getLocalUserProfile();
    if (prof?.arcadeProgression) {
      const profArcade = prof.arcadeProgression;
      const profPoints = Number(profArcade.points) || 0;
      if (profPoints > best.points || (profArcade.unlockedMaxGameNumber || 1) > best.unlockedMaxGameNumber) {
        best = {
          points: Math.max(best.points, profPoints),
          level: Math.max(best.level, Number(profArcade.level) || 1),
          unlockedMaxGameNumber: Math.max(best.unlockedMaxGameNumber, Number(profArcade.unlockedMaxGameNumber) || 1),
          completedGames: Array.from(new Set([...best.completedGames, ...(profArcade.completedGames || [])])),
          activeSession: profArcade.activeSession || best.activeSession || null
        };
      }
    }
  } catch (e) {}

  // Recalculer le niveau de manière sûre
  best.level = Math.min(99, Math.max(1, Math.floor(best.points / 100) + 1));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ARCADE_STORAGE_KEY, JSON.stringify(best));
    } catch (e) {}
  }

  return best;
}

/**
 * Sauvegarde de l'état d'une partie en cours (Speed Match, etc.)
 * Permet de reprendre immédiatement sans perdre aucun mot ni point en cas de refresh mobile.
 */
export function saveActiveGameSession(session: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {}
  saveActiveSessionToIndexedDB(session).catch(console.warn);
}

export function getStoredActiveGameSession(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function clearStoredActiveGameSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch (e) {}
  clearActiveSessionInIndexedDB().catch(console.warn);
}

export interface MiniGameMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  category: 'vocabulaire' | 'verbes' | 'traduction' | 'duolingo' | 'audio' | 'defi';
  badgeColor: string;
  borderColor: string;
  bgGradient: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Boss';
  requiredLevel: number; // Niveau requis du joueur (1 à 99)
  xpReward: number;
  howToPlay: {
    goal: string;
    rules: string[];
    tip: string;
  };
}

export const TWENTY_GAMES_METADATA: MiniGameMeta[] = [
  {
    id: 'speed-match',
    number: 1,
    title: 'Speed Match',
    subtitle: 'Traduction Éclair • 5 Niveaux',
    icon: 'bolt',
    category: 'traduction',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgGradient: 'from-amber-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 1,
    xpReward: 35,
    howToPlay: {
      goal: 'Associe chaque mot anglais à sa traduction française le plus rapidement possible. Choisis parmi 5 niveaux : Débutant (5 séries), Intermédiaire (15 séries), Expert (25 séries), Expert Avancé (35 séries) ou Master Avancé (50 séries) avec 12 mots (6 paires) par série !',
      rules: [
        '12 mots sont disposés sur le plateau : 6 mots anglais à gauche (🇬🇧) et 6 traductions françaises à droite (🇫🇷).',
        'Clique sur un mot anglais pour entendre sa prononciation audio et le sélectionner.',
        'Clique immédiatement sur sa correspondance française pour valider la paire.',
        'Chaque bonne association valide la paire en vert émeraude et augmente votre score et multiplicateur combo.',
        'Chaque partie pioche des mots aléatoires dans une immense banque lexicale pour éviter toute répétition !'
      ],
      tip: 'Repérez d\'abord les mots les plus évidents pour déclencher le multiplicateur combo !'
    }
  },
  {
    id: 'word-scramble',
    number: 2,
    title: 'Word Scramble',
    subtitle: 'Anagrammes • 5 Niveaux (5 à 90 Questions • 12 Mots)',
    icon: 'extension',
    category: 'vocabulaire',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 1,
    xpReward: 35,
    howToPlay: {
      goal: 'Remets les lettres mélangées dans le bon ordre pour reconstituer 12 mots par question selon votre niveau : Débutant (5 questions), Intermédiaire (25 questions), Expert (50 questions), Expert Avancé (70 questions) ou Master Avancé (90 questions), avec chrono libre ou temps limité !',
      rules: [
        'Lis l\'indice contextuel et la traduction française affichés dans le cartel d\'or.',
        'Clique sur les lettres proposées (fort contraste or et bleu nuit) pour les insérer dans les cases vides.',
        'Clique sur une lettre déjà placée pour la renvoyer dans la réserve en cas de faute.',
        'Choisis ton mode de temps : "Temps Limité" (décompte rapide) ou "Temps Écoulé" (chronomètre libre sans stress).',
        'Complète les 12 mots de chaque question pour valider la manche et empocher les points XP !'
      ],
      tip: 'Chaque partie pioche aléatoirement dans une vaste banque lexicale pour garantir une expérience 100% renouvelée sans répétition.'
    }
  },
  {
    id: 'word-search',
    number: 3,
    title: 'Word Search',
    subtitle: 'Mots Mêlés Mystères',
    icon: 'grid_view',
    category: 'vocabulaire',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    bgGradient: 'from-cyan-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 2,
    xpReward: 45,
    howToPlay: {
      goal: 'Trouve tous les mots anglais cachés dans la grille de lettres thématique.',
      rules: [
        'Consulte la liste des mots à dénicher sous la grille avec leur traduction.',
        'Sélectionne les lettres consécutives (horizontalement de gauche à droite ou verticalement de haut en bas).',
        'Le mot découvert s\'illumine en vert fluo et se coche dans la banque de mots.',
        'Trouve l\'ensemble des 5 mots pour décrocher les 3 étoiles !'
      ],
      tip: 'Cherche les lettres rares comme J, K, V, W, X, Z pour repérer instantanément le mot.'
    }
  },
  {
    id: 'verb-master',
    number: 4,
    title: 'Verb Master',
    subtitle: 'Association Verbes Éclair • 5 Niveaux (12 Mots par Question)',
    icon: 'auto_fix_high',
    category: 'verbes',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    bgGradient: 'from-rose-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 3,
    xpReward: 40,
    howToPlay: {
      goal: 'Associe chaque verbe anglais à sa traduction française le plus rapidement possible. Choisis parmi 5 niveaux : Débutant (5 questions), Intermédiaire (25 questions), Expert (50 questions), Expert Avancé (70 questions) et Master (90 questions) avec 12 mots (6 paires) par question !',
      rules: [
        '12 mots sont disposés sur le plateau : 6 verbes anglais à gauche (🇬🇧) et 6 traductions françaises à droite (🇫🇷).',
        'Clique sur un verbe anglais pour entendre sa prononciation audio et révéler ses 3 formes (Infinitif, Prétérit, Participe Passé).',
        'Clique immédiatement sur sa correspondance française pour valider la paire en vert éclatant.',
        'Contraste maximal : lettres en orange (#f2ca50) lumineuses pour l\'anglais et bleu électrique (#38bdf8) pour le français sur fond noir profond pour une visibilité totale.',
        'Chaque partie pioche aléatoirement dans une vaste banque lexicale pour éviter toute répétition !'
      ],
      tip: 'Repère les familles de verbes et écoute attentivement leur prononciation pour booster ton multiplicateur combo !'
    }
  },
  {
    id: 'astro-hangman',
    number: 5,
    title: 'Astro Hangman',
    subtitle: 'Pendu Cosmique • 5 Niveaux (12 Mots par Question)',
    icon: 'rocket_launch',
    category: 'vocabulaire',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    bgGradient: 'from-indigo-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 4,
    xpReward: 40,
    howToPlay: {
      goal: 'Devine chaque mot anglais lettre par lettre et associe-le à sa traduction française le plus rapidement possible. Choisis parmi 5 niveaux : Débutant (5 questions), Intermédiaire (25 questions), Expert (50 questions), Expert Avancé (70 questions) et Master (90 questions), avec 12 mots par question !',
      rules: [
        'Lis l\'indice et la traduction française affichés dans le cartel d\'or spatial.',
        'Propose les lettres au clavier virtuel ou physique. Lettres en orange (#f2ca50) ultra-lisibles sur fond sombre avec un contraste total.',
        'Attention à la réserve d\'oxygène cosmique : maximum 6 erreurs autorisées par mot avant déclenchement du sas de secours.',
        'Chaque mot découvert déclenche la prononciation audio en anglais et valide l\'association bilingue.',
        'Complète les 12 mots de la question pour engranger les points d\'expérience XP et débloquer les niveaux supérieurs !'
      ],
      tip: 'Chaque partie pioche aléatoirement dans une vaste banque lexicale pour garantir une aventure spatiale toujours unique sans répétition.'
    }
  },
  {
    id: 'sentence-builder',
    number: 6,
    title: 'Sentence Builder',
    subtitle: 'Constructeur Duolingo',
    icon: 'reorder',
    category: 'duolingo',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    borderColor: 'border-green-500/40 hover:border-green-400',
    bgGradient: 'from-green-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 6,
    xpReward: 40,
    howToPlay: {
      goal: 'Reconstitue la phrase anglaise exacte correspondant à la traduction française.',
      rules: [
        'Lis la phrase cible en français.',
        'Clique sur les blocs de mots dans le bon ordre syntaxique anglais (Sujet + Verbe + Compléments).',
        'Clique sur un bloc placé pour le retirer ou réorganiser.',
        'Clique sur "Valider" pour écouter la prononciation audio et vérifier.'
      ],
      tip: 'Attention à l\'ordre des adjectifs en anglais : ils se placent TOUJOURS AVANT le nom !'
    }
  },
  {
    id: 'audio-blitz',
    number: 7,
    title: 'Audio Blitz',
    subtitle: 'L\'Écoute Rapide',
    icon: 'headphones',
    category: 'audio',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgGradient: 'from-purple-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 8,
    xpReward: 35,
    howToPlay: {
      goal: 'Écoute la voix anglaise native et sélectionne la bonne phrase ou mot prononcé.',
      rules: [
        'Clique sur le haut-parleur pour entendre l\'audio prononcé par la voix de synthèse.',
        'Tu peux réécouter autant de fois que nécessaire.',
        'Choisis la bonne option parmi les 3 cartes phonétiquement proches.',
        'Un sans-faute sur 5 écoutes débloque le bonus oreille d\'or.'
      ],
      tip: 'Concentre-toi sur les diphtongues et la terminaison des consonnes muettes ou appuyées.'
    }
  },
  {
    id: 'antonym-synonym',
    number: 8,
    title: 'Synonym & Antonym Clash',
    subtitle: 'Duel Jumeaux & Opposés',
    icon: 'compare_arrows',
    category: 'vocabulaire',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    bgGradient: 'from-blue-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 10,
    xpReward: 35,
    howToPlay: {
      goal: 'Identifie instantanément le synonyme ou l\'antonyme demandé pour enrichir ton vocabulaire.',
      rules: [
        'Regarde la consigne affichée en haut (SYNONYME ou ANTONYME).',
        'Observe le mot cible mis en valeur.',
        'Sélectionne la réponse exacte parmi les 4 options.',
        'Chaque bonne réponse rapporte des points et enrichit ta banque lexicale.'
      ],
      tip: 'Attention aux faux-amis fréquents qui peuvent induire en erreur !'
    }
  },
  {
    id: 'odd-one-out',
    number: 9,
    title: 'Odd One Out',
    subtitle: 'Trouve l\'Intrus',
    icon: 'visibility',
    category: 'vocabulaire',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    bgGradient: 'from-teal-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 11,
    xpReward: 30,
    howToPlay: {
      goal: 'Détecte le mot qui n\'a rien à faire dans le groupe sémantique ou grammatical.',
      rules: [
        'Quatre mots anglais s\'affichent à l\'écran.',
        'Trouve le dénominateur commun des 3 autres (ex: animaux, verbes, moyens de transport, adjectifs).',
        'Clique sur l\'intrus pour le faire disparaître.',
        'Une explication sémantique complète s\'affiche immédiatement.'
      ],
      tip: 'Vérifie si la différence porte sur le sens (catégorie) ou sur la nature du mot (nom vs verbe).'
    }
  },
  {
    id: 'fill-the-blank',
    number: 10,
    title: 'Fill the Blank',
    subtitle: 'Texte à Trous Express',
    icon: 'edit_note',
    category: 'duolingo',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    borderColor: 'border-orange-500/40 hover:border-orange-400',
    bgGradient: 'from-orange-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 13,
    xpReward: 35,
    howToPlay: {
      goal: 'Complète la phrase anglaise avec la préposition, le pronom ou la conjugaison manquante.',
      rules: [
        'Lis la phrase en repérant l\'emplacement vide symbolisé par [ ___ ].',
        'Sélectionne le jeton correct parmi les 4 propositions (ex: at, in, on, by).',
        'Découvre la règle de grammaire explicite pour ne plus jamais hésiter.'
      ],
      tip: 'Pour les heures : AT (at 7 o\'clock). Pour les jours : ON (on Monday). Pour les mois/années : IN (in July).'
    }
  },
  {
    id: 'true-or-false',
    number: 11,
    title: 'True or False English Trivia',
    subtitle: 'Vrai ou Faux Éclair',
    icon: 'fact_check',
    category: 'duolingo',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 15,
    xpReward: 30,
    howToPlay: {
      goal: 'Valide ou réfute des affirmations sur la langue, les faux-amis et la culture anglophone.',
      rules: [
        'Lis l\'affirmation affichée au centre.',
        'Clique sur VRAI (vert) ou FAUX (rouge) avant la fin du temps imparti.',
        'Obtiens une explication détaillée de l\'anecdote ou de la règle.',
        'Maintiens une série de 5 bonnes réponses pour un combo x2.'
      ],
      tip: 'Méfiez-vous des pièges : "actually" ne signifie pas "actuellement" mais "en fait / en réalité" !'
    }
  },
  {
    id: 'memory-pairs',
    number: 12,
    title: 'Memory Vocabulary',
    subtitle: 'Mémoire & Paires Magiques',
    icon: 'flip_to_front',
    category: 'vocabulaire',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    borderColor: 'border-violet-500/40 hover:border-violet-400',
    bgGradient: 'from-violet-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 18,
    xpReward: 40,
    howToPlay: {
      goal: 'Retrouve les 6 paires carte anglaise / carte française cachées face cachée.',
      rules: [
        'Clique sur deux cartes pour les retourner.',
        'Si le mot anglais correspond à la traduction française, la paire reste découverte.',
        'Sinon, les cartes se retournent : retiens bien leur emplacement !',
        'Termine avec le minimum de coups possibles pour le score parfait.'
      ],
      tip: 'Prononce les mots à voix haute dès qu\'ils apparaissent pour activer la mémoire kinesthésique.'
    }
  },
  {
    id: 'beat-the-clock',
    number: 13,
    title: '60 Seconds Chrono',
    subtitle: 'Course Contre la Montre',
    icon: 'timer',
    category: 'traduction',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    borderColor: 'border-red-500/40 hover:border-red-400',
    bgGradient: 'from-red-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Difficile',
    requiredLevel: 21,
    xpReward: 50,
    howToPlay: {
      goal: 'Traduis le plus grand nombre de mots en exactement 60 secondes sans t\'arrêter.',
      rules: [
        'Le chronomètre démarre dès la première réponse.',
        'Chaque bonne réponse accorde 10 points + 1 bonus de temps.',
        'Une mauvaise réponse n\'arrête pas le chrono mais retire du combo.',
        'Atteins au moins 12 bonnes réponses pour décrocher la médaille de diamant !'
      ],
      tip: 'Fais confiance à ta première intuition : en mode sprint, l\'inconscient linguistique est souvent le bon.'
    }
  },
  {
    id: 'word-snake',
    number: 14,
    title: 'Word Snake',
    subtitle: 'La Chaîne Infinie',
    icon: 'gesture',
    category: 'vocabulaire',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    borderColor: 'border-lime-500/40 hover:border-lime-400',
    bgGradient: 'from-lime-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 24,
    xpReward: 35,
    howToPlay: {
      goal: 'Enchaîne les mots anglais : la première lettre du mot suivant doit être la dernière lettre du mot précédent !',
      rules: [
        'Exemple : ELEPHAN[T] -> [T]IGE[R] -> [R]ABBI[T].',
        'Choisis le mot valide parmi les 3 cartes proposées.',
        'Fais grandir le serpent jusqu\'à 6 maillons pour remporter la manche !'
      ],
      tip: 'Surveille la lettre finale qui s\'illumine en doré pour orienter ton regard instantanément.'
    }
  },
  {
    id: 'riddle-solver',
    number: 15,
    title: 'Riddle Solver',
    subtitle: 'Énigmes en Anglais',
    icon: 'lightbulb',
    category: 'duolingo',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    borderColor: 'border-yellow-500/40 hover:border-yellow-400',
    bgGradient: 'from-yellow-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 27,
    xpReward: 45,
    howToPlay: {
      goal: 'Lis l\'énigme en anglais et devine quel objet, animal ou concept se dissimule derrière le mystère.',
      rules: [
        'Lis attentivement la courte strophe ou description en anglais.',
        'Tu disposes d\'un bouton "Traduire un mot clé" en cas d\'incompréhension.',
        'Sélectionne la bonne réponse parmi 4 choix illustrés.',
        'Comprends l\'humour et la logique anglophone tout en jouant !'
      ],
      tip: 'Les énigmes jouent souvent sur le double sens d\'un verbe (ex: "have hands" pour une horloge).'
    }
  },
  {
    id: 'tone-detector',
    number: 16,
    title: 'Tone Detector',
    subtitle: 'Détecteur d\'Émotion & Registre',
    icon: 'mood',
    category: 'duolingo',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    borderColor: 'border-pink-500/40 hover:border-pink-400',
    bgGradient: 'from-pink-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 31,
    xpReward: 35,
    howToPlay: {
      goal: 'Identifie le ton émotionnel ou le registre linguistique d\'une réplique de dialogue.',
      rules: [
        'Lis la réplique prononcée par le personnage.',
        'Analyse si le ton est : Enthousiaste, Très poli, En colère, Sarcastique, ou Triste.',
        'Choisis le bon badge de tonalité.',
        'Développe ton intelligence émotionnelle et pragmatique en anglais !'
      ],
      tip: 'Mots clés de politesse : "Would you mind...", "I was wondering if...". Mots d\'agacement : "Again?!", "Seriously?".'
    }
  },
  {
    id: 'uk-vs-us',
    number: 17,
    title: 'UK vs USA Match',
    subtitle: 'Duel British vs American',
    icon: 'travel_explore',
    category: 'vocabulaire',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    bgGradient: 'from-sky-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    requiredLevel: 36,
    xpReward: 35,
    howToPlay: {
      goal: 'Associe les équivalents anglais britannique (🇬🇧) et américain (🇺🇸) pour éviter tout malentendu.',
      rules: [
        'Un terme britannique ou américain s\'affiche avec son drapeau.',
        'Trouve son jumeau dans l\'autre variante linguistique (ex: Flat 🇬🇧 = Apartment 🇺🇸).',
        'Chaque association t\'explique l\'origine et l\'usage courant.'
      ],
      tip: 'Les transports et la nourriture regorgent de différences : Biscuit/Cookie, Chips/Fries, Crisps/Chips !'
    }
  },
  {
    id: 'idiom-hunter',
    number: 18,
    title: 'Idiom Hunter',
    subtitle: 'Expressions Imagées & Métaphores',
    icon: 'theater_comedy',
    category: 'duolingo',
    badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
    borderColor: 'border-amber-600/40 hover:border-amber-400',
    bgGradient: 'from-amber-950/50 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 41,
    xpReward: 40,
    howToPlay: {
      goal: 'Découvre le sens figuré réel des expressions idiomatiques courantes sans te faire avoir par le sens littéral.',
      rules: [
        'Observe l\'expression comme "A piece of cake" ou "Raining cats and dogs".',
        'Ne traduis surtout pas mot-à-mot !',
        'Choisis la signification réelle parmi les 3 propositions françaises.',
        'Mémorise l\'expression pour sonner comme un vrai anglophone.'
      ],
      tip: '"Piece of cake" ne se mange pas : cela signifie "C\'est du gâteau / Très facile" !'
    }
  },
  {
    id: 'spelling-bee',
    number: 19,
    title: 'Spelling Bee',
    subtitle: 'Championnat d\'Orthographe',
    icon: 'spellcheck',
    category: 'audio',
    badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
    borderColor: 'border-emerald-600/40 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/50 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Difficile',
    requiredLevel: 46,
    xpReward: 45,
    howToPlay: {
      goal: 'Écoute le mot prononcé en anglais et tape son orthographe exacte sans aucune faute.',
      rules: [
        'Clique sur l\'icône sonore pour entendre la prononciation anglaise claire.',
        'Saisis le mot au clavier dans le champ texte ou clique sur les lettres proposées.',
        'Attention aux doubles lettres (necessary, embarrass, beautiful, success).',
        'Valide pour voir si tu remportes le trophée de la Ruche d\'Or !'
      ],
      tip: 'Utilise la règle mnémotechnique classique : "One C and two S for Necessary (one Collar, two Sleeves)".'
    }
  },
  {
    id: 'boss-battle',
    number: 20,
    title: 'Duolingo Boss Battle',
    subtitle: 'Le Grand Défi du Maître',
    icon: 'military_tech',
    category: 'defi',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    borderColor: 'border-yellow-500 hover:border-yellow-400',
    bgGradient: 'from-yellow-950/50 via-[#191e30] to-[#0c1322]',
    difficulty: 'Boss',
    requiredLevel: 51,
    xpReward: 100,
    howToPlay: {
      goal: 'Affronte le Boss Ultime : 5 manches mixtes combinant vocabulaire, verbes irréguliers et audio avec seulement 3 cœurs de vie !',
      rules: [
        'Tu commences avec 3 cœurs pleins (❤️❤️❤️).',
        'Chaque erreur te fait perdre 1 cœur et réduit les chances de victoire.',
        'Le boss subit des dégâts à chaque bonne réponse et perd des points de vie (HP).',
        'Survis aux 5 rounds pour terrasser le gardien et empocher 100 XP héroïques !'
      ],
      tip: 'Prends ton temps pour chaque question : aucune pénalité de temps ici, seule la précision compte !'
    }
  },
  {
    id: 'speed-math',
    number: 21,
    title: 'Speed Mental Math',
    subtitle: 'Calcul Mental Rapide & Nombres en Anglais',
    icon: 'calculate',
    category: 'defi',
    badgeColor: 'bg-amber-500/20 text-[#f2ca50] border-amber-500/40',
    borderColor: 'border-[#f2ca50]/50 hover:border-[#f2ca50]',
    bgGradient: 'from-amber-950/40 via-[#101b33] to-[#0c1322]',
    difficulty: 'Moyen',
    requiredLevel: 1,
    xpReward: 45,
    howToPlay: {
      goal: 'Maîtrisez les astuces secrètes du calcul mental rapide tout en pratiquant les nombres et opérations formulés en anglais !',
      rules: [
        'Écoutez ou lisez la question arithmétique formulée en anglais (ex: "What is forty-five times eleven ?")',
        'Découvrez l\'astuce mathématique instantanée (règle du 11, carré des nombres finissant par 5, doubler/diviser par 2, etc.)',
        'Sélectionnez la bonne réponse numérique avant la fin du chronomètre pour marquer des points (+10 XP) et grimper de niveau !',
        'Apprenez les bases du calcul mental rapide sous forme de jeu simple, sophistiqué et amusant.'
      ],
      tip: 'Pour multiplier par 11 un nombre à deux chiffres, additionnez ses chiffres et placez la somme au centre ! (Ex: 35 × 11 -> 3+5=8 -> 385).'
    }
  }
];

// =====================================================================
// SPEED MATCH (Mini-Jeu n°1) - Banques Lexicales Massives & Niveaux
// =====================================================================

export type SpeedMatchLevelKey = 'debutant' | 'intermediaire' | 'professionnel' | 'pro' | 'expert' | 'avance';

export interface SpeedMatchPair {
  en: string;
  fr: string;
  hint?: string;
}

export interface SpeedMatchLevelInfo {
  id: SpeedMatchLevelKey;
  label: string;
  subtitle: string;
  requiredPlayerLevel: number; // Niveau requis : 1, 11, 21, 31, 51
  questionsCount: number;
  wordsPerQuestion: number; // 12 mots (6 paires)
  pairsPerQuestion: number; // 6 paires
  timePerQuestion: number;
  xpReward: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  description: string;
}

export const SPEED_MATCH_LEVELS: Record<string, SpeedMatchLevelInfo> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    subtitle: 'Niveau 1 à 10 • Fondations 6e',
    requiredPlayerLevel: 1,
    questionsCount: 5,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 45,
    xpReward: 35,
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    icon: 'sentiment_satisfied',
    description: '5 séries de 12 mots (6 paires). Vocabulaire de base de 6e (famille, maison, école, animaux, couleurs).'
  },
  intermediaire: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    subtitle: 'Niveau 11 à 20 • Approfondi',
    requiredPlayerLevel: 11,
    questionsCount: 15,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 40,
    xpReward: 60,
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    icon: 'speed',
    description: '15 séries de 12 mots (6 paires). Voyage, loisirs, sports, santé et vie quotidienne.'
  },
  professionnel: {
    id: 'professionnel',
    label: 'Expert',
    subtitle: 'Niveau 21 à 30 • Métiers & Monde',
    requiredPlayerLevel: 21,
    questionsCount: 25,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 38,
    xpReward: 85,
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-400',
    icon: 'workspace_premium',
    description: '25 séries de 12 mots (6 paires). Monde du travail, entreprises, commerce, sciences et patrimoine.'
  },
  pro: {
    id: 'pro',
    label: 'Expert Avancé',
    subtitle: 'Niveau 31 à 50 • Réflexes & Cadence',
    requiredPlayerLevel: 31,
    questionsCount: 35,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 35,
    xpReward: 120,
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    icon: 'diamond',
    description: '35 séries de 12 mots (6 paires). Vocabulaire riche, verbes d\'action et tournures express.'
  },
  expert: {
    id: 'expert',
    label: 'Master Avancé',
    subtitle: 'Niveau 51 à 99 • Défi Maître Suprême',
    requiredPlayerLevel: 51,
    questionsCount: 50,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 30,
    xpReward: 160,
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    icon: 'military_tech',
    description: '50 séries de 12 mots (6 paires). 600 mots à apparier sous chrono serré sans la moindre erreur.'
  },
  avance: {
    id: 'avance',
    label: 'Avancé',
    subtitle: 'Défi Maître Bilingue',
    requiredPlayerLevel: 31,
    questionsCount: 35,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 35,
    xpReward: 120,
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    icon: 'military_tech',
    description: '35 séries de 12 mots (6 paires).'
  }
};

// Banque Lexicale Débutant (Niveau 6e fondamental - 70 paires)
export const SPEED_MATCH_DEBUTANT_BANK: SpeedMatchPair[] = [
  { en: 'House', fr: 'Maison', hint: 'Lieu de vie et foyer' },
  { en: 'School', fr: 'École', hint: 'Lieu des cours et des camarades' },
  { en: 'Friend', fr: 'Ami(e)', hint: 'Personne proche et complice' },
  { en: 'Family', fr: 'Famille', hint: 'Parents, frères et sœurs' },
  { en: 'Mother', fr: 'Mère', hint: 'Maman' },
  { en: 'Father', fr: 'Père', hint: 'Papa' },
  { en: 'Sister', fr: 'Sœur', hint: 'Membre féminin de la fratrie' },
  { en: 'Brother', fr: 'Frère', hint: 'Membre masculin de la fratrie' },
  { en: 'Dog', fr: 'Chien', hint: 'Le meilleur ami de l\'homme' },
  { en: 'Cat', fr: 'Chat', hint: 'Félin domestique joueur' },
  { en: 'Bird', fr: 'Oiseau', hint: 'Animal à plumes qui vole' },
  { en: 'Book', fr: 'Livre', hint: 'Ouvrage de lecture ou manuel' },
  { en: 'Pencil', fr: 'Crayon', hint: 'Instrument pour écrire ou dessiner' },
  { en: 'Pen', fr: 'Stylo', hint: 'Écrit avec de l\'encre' },
  { en: 'Ruler', fr: 'Règle', hint: 'Pour tracer des traits droits' },
  { en: 'Desk', fr: 'Bureau', hint: 'Table de travail pour étudier' },
  { en: 'Chair', fr: 'Chaise', hint: 'Meuble pour s\'asseoir' },
  { en: 'Door', fr: 'Porte', hint: 'Entrée d\'une pièce' },
  { en: 'Window', fr: 'Fenêtre', hint: 'Ouverture vitrée vers l\'extérieur' },
  { en: 'Clock', fr: 'Horloge', hint: 'Indique l\'heure' },
  { en: 'Water', fr: 'Eau', hint: 'Liquide vital incolore' },
  { en: 'Bread', fr: 'Pain', hint: 'Aliment de base de la boulangerie' },
  { en: 'Apple', fr: 'Pomme', hint: 'Fruit rouge ou vert croquant' },
  { en: 'Milk', fr: 'Lait', hint: 'Boisson blanche nutritive' },
  { en: 'Sun', fr: 'Soleil', hint: 'Astre lumineux qui chauffe la Terre' },
  { en: 'Moon', fr: 'Lune', hint: 'Astre brillant la nuit' },
  { en: 'Star', fr: 'Étoile', hint: 'Point scintillant dans le ciel nocturne' },
  { en: 'Tree', fr: 'Arbre', hint: 'Végétal avec tronc et feuilles' },
  { en: 'Flower', fr: 'Fleur', hint: 'Plante colorée et parfumée' },
  { en: 'Red', fr: 'Rouge', hint: 'Couleur du rubis et de la fraise' },
  { en: 'Blue', fr: 'Bleu', hint: 'Couleur du ciel dégagé et de l\'océan' },
  { en: 'Green', fr: 'Vert', hint: 'Couleur de l\'herbe et des feuilles' },
  { en: 'Yellow', fr: 'Jaune', hint: 'Couleur du citron et des tournesols' },
  { en: 'Black', fr: 'Noir', hint: 'Couleur de la nuit profonde' },
  { en: 'White', fr: 'Blanc', hint: 'Couleur de la neige immaculée' },
  { en: 'Big', fr: 'Grand', hint: 'De taille imposante' },
  { en: 'Small', fr: 'Petit', hint: 'De dimensions réduites' },
  { en: 'Fast', fr: 'Rapide', hint: 'Qui se déplace à vive allure' },
  { en: 'Slow', fr: 'Lent', hint: 'Qui prend beaucoup de temps' },
  { en: 'Happy', fr: 'Heureux', hint: 'Plein de joie et de sourire' },
  { en: 'Sad', fr: 'Triste', hint: 'Qui a du chagrin' },
  { en: 'Morning', fr: 'Matin', hint: 'Début ensoleillé de la journée' },
  { en: 'Night', fr: 'Nuit', hint: 'Moment où le ciel s\'assombrit' },
  { en: 'Today', fr: 'Aujourd\'hui', hint: 'Ce jour présent' },
  { en: 'Tomorrow', fr: 'Demain', hint: 'Le jour d\'après' },
  { en: 'Play', fr: 'Jouer', hint: 'S\'amuser à un jeu' },
  { en: 'Read', fr: 'Lire', hint: 'Déchiffrer un texte' },
  { en: 'Write', fr: 'Écrire', hint: 'Tracer des lettres sur du papier' },
  { en: 'Speak', fr: 'Parler', hint: 'Communiquer par la parole' },
  { en: 'Listen', fr: 'Écouter', hint: 'Prêter attention aux sons' },
  { en: 'Smile', fr: 'Sourire', hint: 'Expression joyeuse du visage' },
  { en: 'Walk', fr: 'Marcher', hint: 'Se déplacer à pied' },
  { en: 'Run', fr: 'Courir', hint: 'Marcher très vite' },
  { en: 'Jump', fr: 'Sauter', hint: 'Bondir en l\'air' },
  { en: 'Eat', fr: 'Manger', hint: 'Consommer de la nourriture' },
  { en: 'Drink', fr: 'Boire', hint: 'Avaler un liquide' },
  { en: 'Sleep', fr: 'Dormir', hint: 'Se reposer la nuit' },
  { en: 'Open', fr: 'Ouvrir', hint: 'Donner accès à une pièce' },
  { en: 'Close', fr: 'Fermer', hint: 'Condamner un passage' },
  { en: 'Clean', fr: 'Propre', hint: 'Sans aucune saleté' },
  { en: 'Hot', fr: 'Chaud', hint: 'Température élevée' },
  { en: 'Cold', fr: 'Froid', hint: 'Basse température hivernale' },
  { en: 'City', fr: 'Ville', hint: 'Agglomération urbaine' },
  { en: 'Car', fr: 'Voiture', hint: 'Véhicule automobile à 4 roues' },
  { en: 'Bus', fr: 'Autobus', hint: 'Transport public collectif' },
  { en: 'Bike', fr: 'Vélo', hint: 'Bicyclette à deux roues' },
  { en: 'Train', fr: 'Train', hint: 'Véhicule circulant sur des rails' },
  { en: 'Music', fr: 'Musique', hint: 'Art des sons harmonieux' },
  { en: 'Song', fr: 'Chanson', hint: 'Morceau vocal chanté' },
  { en: 'Game', fr: 'Jeu', hint: 'Activité récréative ludique' }
];

// Banque Lexicale Intermédiaire (Niveau 6e approfondi / A2 - 180 paires)
export const SPEED_MATCH_INTERMEDIAIRE_BANK: SpeedMatchPair[] = [
  { en: 'Journey', fr: 'Voyage', hint: 'Trajet ou périple vers une destination' },
  { en: 'Passport', fr: 'Passeport', hint: 'Document officiel pour voyager' },
  { en: 'Luggage', fr: 'Bagage', hint: 'Valises et sacs de voyage' },
  { en: 'Ticket', fr: 'Billet', hint: 'Titre d\'accès pour un trajet' },
  { en: 'Station', fr: 'Gare', hint: 'Lieu d\'arrivée et départ des trains' },
  { en: 'Airport', fr: 'Aéroport', hint: 'Piste et terminaux pour avions' },
  { en: 'Airplane', fr: 'Avion', hint: 'Appareil volant dans les airs' },
  { en: 'Castle', fr: 'Château', hint: 'Demeure fortifiée d\'un roi ou seigneur' },
  { en: 'Bridge', fr: 'Pont', hint: 'Construit au-dessus d\'un fleuve' },
  { en: 'Mountain', fr: 'Montagne', hint: 'Sommet rocheux et élevé' },
  { en: 'Forest', fr: 'Forêt', hint: 'Vaste étendue boisée d\'arbres' },
  { en: 'River', fr: 'Rivière', hint: 'Cours d\'eau naturel' },
  { en: 'Ocean', fr: 'Océan', hint: 'Immense étendue d\'eau salée' },
  { en: 'Beach', fr: 'Plage', hint: 'Bord de mer sablonneux' },
  { en: 'Island', fr: 'Île', hint: 'Terre entourée d\'eau' },
  { en: 'Village', fr: 'Village', hint: 'Petite communauté rurale' },
  { en: 'Map', fr: 'Carte', hint: 'Représentation géographique d\'un lieu' },
  { en: 'Weather', fr: 'Météo', hint: 'Temps qu\'il fait dehors' },
  { en: 'Season', fr: 'Saison', hint: 'L\'une des quatre périodes de l\'année' },
  { en: 'Autumn', fr: 'Automne', hint: 'Saison où tombent les feuilles dorées' },
  { en: 'Spring', fr: 'Printemps', hint: 'Saison de la renaissance de la nature' },
  { en: 'Summer', fr: 'Été', hint: 'Saison la plus chaude et ensoleillée' },
  { en: 'Winter', fr: 'Hiver', hint: 'Saison de la neige et du gel' },
  { en: 'Storm', fr: 'Tempête', hint: 'Violente perturbation atmosphérique' },
  { en: 'Rain', fr: 'Pluie', hint: 'Gouttes d\'eau tombant des nuages' },
  { en: 'Wind', fr: 'Vent', hint: 'Courant d\'air en mouvement' },
  { en: 'Cloud', fr: 'Nuage', hint: 'Masse de vapeur dans le ciel' },
  { en: 'Shadow', fr: 'Ombre', hint: 'Silhouette sombre projetée par la lumière' },
  { en: 'Breakfast', fr: 'Petit-déjeuner', hint: 'Premier repas équilibré du matin' },
  { en: 'Lunch', fr: 'Déjeuner', hint: 'Repas pris au milieu du jour' },
  { en: 'Dinner', fr: 'Dîner', hint: 'Repas pris en soirée' },
  { en: 'Kitchen', fr: 'Cuisine', hint: 'Pièce où l\'on prépare les repas' },
  { en: 'Bedroom', fr: 'Chambre', hint: 'Pièce dédiée au sommeil' },
  { en: 'Bathroom', fr: 'Salle de bain', hint: 'Lieu de toilette quotidienne' },
  { en: 'Garden', fr: 'Jardin', hint: 'Espace extérieur planté de végétaux' },
  { en: 'Library', fr: 'Bibliothèque', hint: 'Lieu calme rempli de livres' },
  { en: 'Museum', fr: 'Musée', hint: 'Lieu d\'exposition artistique ou historique' },
  { en: 'Cinema', fr: 'Cinéma', hint: 'Salle de projection de films' },
  { en: 'Theater', fr: 'Théâtre', hint: 'Salle de représentations scéniques' },
  { en: 'Concert', fr: 'Concert', hint: 'Spectacle musical en direct' },
  { en: 'Painting', fr: 'Peinture', hint: 'Tableau ou œuvre artistique peinte' },
  { en: 'Drawing', fr: 'Dessin', hint: 'Esquisse tracée au crayon ou feutre' },
  { en: 'Guitar', fr: 'Guitare', hint: 'Instrument à cordes pincées' },
  { en: 'Piano', fr: 'Piano', hint: 'Grand instrument à touches noires et blanches' },
  { en: 'Drums', fr: 'Batterie', hint: 'Ensemble de percussions et cymbales' },
  { en: 'Flute', fr: 'Flûte', hint: 'Instrument à vent mélodieux' },
  { en: 'Soccer', fr: 'Football', hint: 'Sport collectif avec un ballon rond' },
  { en: 'Basketball', fr: 'Basket', hint: 'Sport où l\'on vise un panier surélevé' },
  { en: 'Swimming', fr: 'Natation', hint: 'Sport nautique en piscine ou mer' },
  { en: 'Cycling', fr: 'Cyclisme', hint: 'Pratique sportive du vélo' },
  { en: 'Running', fr: 'Course à pied', hint: 'Endurance et vitesse à pied' },
  { en: 'Hiking', fr: 'Randonnée', hint: 'Longue marche en pleine nature' },
  { en: 'Climbing', fr: 'Escalade', hint: 'Ascension d\'une paroi rocheuse' },
  { en: 'Doctor', fr: 'Médecin', hint: 'Professionnel de la santé qui soigne' },
  { en: 'Nurse', fr: 'Infirmier(ère)', hint: 'Assiste les patients et le médecin' },
  { en: 'Dentist', fr: 'Dentiste', hint: 'Spécialiste de la santé bucco-dentaire' },
  { en: 'Hospital', fr: 'Hôpital', hint: 'Établissement de soins médicaux' },
  { en: 'Medicine', fr: 'Médicament', hint: 'Substance pour guérir une maladie' },
  { en: 'Health', fr: 'Santé', hint: 'État de bien-être physique et mental' },
  { en: 'Exercise', fr: 'Exercice', hint: 'Activité physique bénéfique' },
  { en: 'Energy', fr: 'Énergie', hint: 'Force et vitalité au quotidien' },
  { en: 'Vegetable', fr: 'Légume', hint: 'Plante potagère saine pour le corps' },
  { en: 'Fruit', fr: 'Fruit', hint: 'Aliment végétal sucré et riche en vitamines' },
  { en: 'Cheese', fr: 'Fromage', hint: 'Produit laitier savoureux' },
  { en: 'Butter', fr: 'Beurre', hint: 'Matière grasse obtenue à partir de crème' },
  { en: 'Soup', fr: 'Soupe', hint: 'Potage chaud de légumes mixés' },
  { en: 'Meat', fr: 'Viande', hint: 'Chair animale cuisinée' },
  { en: 'Fish', fr: 'Poisson', hint: 'Animal aquatique ou plat cuisiné' },
  { en: 'Juice', fr: 'Jus', hint: 'Boisson extraite d\'un fruit pressé' },
  { en: 'Teacher', fr: 'Enseignant', hint: 'Personne qui transmet son savoir' },
  { en: 'Engineer', fr: 'Ingénieur', hint: 'Concepteur de technologies et structures' },
  { en: 'Architect', fr: 'Architecte', hint: 'Créateur de plans de bâtiments' },
  { en: 'Lawyer', fr: 'Avocat', hint: 'Défenseur des droits et de la justice' },
  { en: 'Chef', fr: 'Cuisinier', hint: 'Expert gastronomique en restaurant' },
  { en: 'Waiter', fr: 'Serveur', hint: 'Apporte les plats en salle' },
  { en: 'Mechanic', fr: 'Mécanicien', hint: 'Répare moteurs et véhicules' },
  { en: 'Farmer', fr: 'Agriculteur', hint: 'Cultive la terre et élève du bétail' },
  { en: 'Pilot', fr: 'Pilote', hint: 'Aux commandes d\'un aéronef' },
  { en: 'Firefighter', fr: 'Pompier', hint: 'Combattant des incendies et secouriste' },
  { en: 'Police', fr: 'Policier', hint: 'Gardien de la paix et de la sécurité' },
  { en: 'Scientist', fr: 'Scientifique', hint: 'Chercheur en laboratoire' },
  { en: 'Artist', fr: 'Artiste', hint: 'Créateur d\'œuvres expressives' },
  { en: 'Writer', fr: 'Écrivain', hint: 'Auteur de romans et d\'histoires' },
  { en: 'Worker', fr: 'Ouvrier', hint: 'Travailleur manuel d\'atelier ou chantier' },
  { en: 'Company', fr: 'Entreprise', hint: 'Organisation commerciale ou industrielle' },
  { en: 'Office', fr: 'Bureau', hint: 'Local de travail administratif' },
  { en: 'Meeting', fr: 'Réunion', hint: 'Rassemblement pour échanger et décider' },
  { en: 'Salary', fr: 'Salaire', hint: 'Rémunération pour un travail accompli' },
  { en: 'Skill', fr: 'Compétence', hint: 'Savoir-faire acquis par la pratique' },
  { en: 'Talent', fr: 'Talent', hint: 'Aptitude naturelle remarquable' },
  { en: 'Dream', fr: 'Rêve', hint: 'Vision imaginaire pendant le sommeil' },
  { en: 'Memory', fr: 'Souvenir', hint: 'Image conservée dans la mémoire' },
  { en: 'Idea', fr: 'Idée', hint: 'Pensée nouvelle qui jaillit dans l\'esprit' },
  { en: 'Question', fr: 'Question', hint: 'Interrogation appelant une réponse' },
  { en: 'Answer', fr: 'Réponse', hint: 'Éclaircissement apporté à une question' },
  { en: 'Secret', fr: 'Secret', hint: 'Chose cachée que peu connaissent' },
  { en: 'Truth', fr: 'Vérité', hint: 'Ce qui est conforme à la réalité' },
  { en: 'Solution', fr: 'Solution', hint: 'Dénouement qui résout un problème' },
  { en: 'Story', fr: 'Histoire', hint: 'Récit d\'aventures réelles ou imaginaires' },
  { en: 'Discovery', fr: 'Découverte', hint: 'Action de trouver ce qui était ignoré' },
  { en: 'Invention', fr: 'Invention', hint: 'Création d\'un objet inédit' },
  { en: 'History', fr: 'Histoire', hint: 'Étude des événements du passé' },
  { en: 'Century', fr: 'Siècle', hint: 'Période de cent années' },
  { en: 'Heritage', fr: 'Patrimoine', hint: 'Héritage culturel transmis aux générations' },
  { en: 'Tradition', fr: 'Tradition', hint: 'Coutume perpétuée depuis longtemps' },
  { en: 'Monument', fr: 'Monument', hint: 'Édifice commémoratif remarquable' },
  { en: 'Custom', fr: 'Coutume', hint: 'Usage établi dans une société' },
  { en: 'Empire', fr: 'Empire', hint: 'Vaste territoire gouverné par un souverain' },
  { en: 'Valley', fr: 'Vallée', hint: 'Espace creusé entre deux montagnes' },
  { en: 'Desert', fr: 'Désert', hint: 'Étendue aride et très peu peuplée' },
  { en: 'Mirror', fr: 'Miroir', hint: 'Surface réfléchissante fidèle' },
  { en: 'Pillow', fr: 'Oreiller', hint: 'Coussin moelleux pour reposer la tête' },
  { en: 'Blanket', fr: 'Couverture', hint: 'Tissu chaud pour se couvrir au lit' },
  { en: 'Plate', fr: 'Assiette', hint: 'Récipient plat pour le repas' },
  { en: 'Fork', fr: 'Fourchette', hint: 'Ustensile de table à dents' },
  { en: 'Knife', fr: 'Couteau', hint: 'Ustensile tranchant pour découper' },
  { en: 'Spoon', fr: 'Cuillère', hint: 'Ustensile creux pour les liquides' },
  { en: 'Glass', fr: 'Verre', hint: 'Récipient transparent pour boire' },
  { en: 'Bottle', fr: 'Bouteille', hint: 'Flacon avec goulot pour contenir de l\'eau' },
  { en: 'Key', fr: 'Clé', hint: 'Objet métallique qui ouvre une serrure' },
  { en: 'Lock', fr: 'Serrure', hint: 'Dispositif de fermeture de porte' },
  { en: 'Letter', fr: 'Lettre', hint: 'Message écrit adressé par courrier' },
  { en: 'Message', fr: 'Message', hint: 'Communication transmise à autrui' },
  { en: 'Voice', fr: 'Voix', hint: 'Sons émis par les cordes vocales' },
  { en: 'Sound', fr: 'Son', hint: 'Vibration acoustique perçue par l\'oreille' },
  { en: 'Silence', fr: 'Silence', hint: 'Absence totale de bruit' },
  { en: 'Sunrise', fr: 'Lever de soleil', hint: 'Aurore matinale illuminant le ciel' },
  { en: 'Sunset', fr: 'Coucher de soleil', hint: 'Crépuscule du soir aux teintes orangées' }
];

// Banque Lexicale Avancée (B1-B2 & Nuances Enrichies - 300+ paires)
export const SPEED_MATCH_AVANCE_BANK: SpeedMatchPair[] = [
  { en: 'Achievement', fr: 'Accomplissement', hint: 'Succès marquant d\'un projet' },
  { en: 'Breakthrough', fr: 'Percée majeure', hint: 'Avancée décisive dans un domaine' },
  { en: 'Challenge', fr: 'Défi', hint: 'Épreuve stimulante à surmonter' },
  { en: 'Perseverance', fr: 'Persévérance', hint: 'Ténacité face aux obstacles' },
  { en: 'Dedication', fr: 'Dévouement', hint: 'Engagement loyal et sincère' },
  { en: 'Ambition', fr: 'Ambition', hint: 'Désir ardent de réussir de grands buts' },
  { en: 'Strategy', fr: 'Stratégie', hint: 'Plan coordonné vers un résultat' },
  { en: 'Masterpiece', fr: 'Chef-d\'œuvre', hint: 'Création artistique d\'excellence' },
  { en: 'Innovation', fr: 'Innovation', hint: 'Introduction de solutions inédites' },
  { en: 'Knowledge', fr: 'Connaissance', hint: 'Ensemble des savoirs assimilés' },
  { en: 'Wisdom', fr: 'Sagesse', hint: 'Jugement juste issu de l\'expérience' },
  { en: 'Insight', fr: 'Aperçu pénétrant', hint: 'Compréhension profonde d\'un sujet' },
  { en: 'Curiosity', fr: 'Curiosité', hint: 'Envie constante d\'apprendre et explorer' },
  { en: 'Opportunity', fr: 'Opportunité', hint: 'Occasion favorable à saisir sans attendre' },
  { en: 'Endeavor', fr: 'Entreprise ambitieuse', hint: 'Projet exigeant de grands efforts' },
  { en: 'Growth', fr: 'Croissance', hint: 'Développement harmonieux continu' },
  { en: 'Expedition', fr: 'Expédition', hint: 'Voyage d\'exploration lointain' },
  { en: 'Landmark', fr: 'Point de repère', hint: 'Monument ou repère incontournable' },
  { en: 'Boundary', fr: 'Frontière', hint: 'Limite marquant une démarcation' },
  { en: 'Wilderness', fr: 'Nature sauvage', hint: 'Étendue naturelle préservée de l\'homme' },
  { en: 'Horizon', fr: 'Horizon', hint: 'Ligne où le ciel rencontre la Terre' },
  { en: 'Archipelago', fr: 'Archipel', hint: 'Groupe d\'îles regroupées dans la mer' },
  { en: 'Settlement', fr: 'Établissement', hint: 'Colonie ou village nouvellement bâti' },
  { en: 'Civilization', fr: 'Civilisation', hint: 'Culture et organisation d\'un peuple' },
  { en: 'Dynasty', fr: 'Dynastie', hint: 'Lignée de monarques successifs' },
  { en: 'Artifact', fr: 'Vestige historique', hint: 'Objet archéologique ancien façonné' },
  { en: 'Legacy', fr: 'Héritage durable', hint: 'Ce qu\'on transmet aux successeurs' },
  { en: 'Revolution', fr: 'Révolution', hint: 'Changement radical et profond' },
  { en: 'Renaissance', fr: 'Renaissance', hint: 'Période d\'essor des arts et sciences' },
  { en: 'Constitution', fr: 'Constitution', hint: 'Loi fondamentale régissant un État' },
  { en: 'Republic', fr: 'République', hint: 'Régime où le peuple détient le pouvoir' },
  { en: 'Symphony', fr: 'Symphonie', hint: 'Composition majeure pour orchestre' },
  { en: 'Orchestra', fr: 'Orchestre', hint: 'Ensemble de musiciens sous un chef' },
  { en: 'Harmony', fr: 'Harmonie', hint: 'Accord parfait entre différentes notes' },
  { en: 'Rhythm', fr: 'Rythme', hint: 'Cadence temporelle d\'un morceau' },
  { en: 'Choreography', fr: 'Chorégraphie', hint: 'Composition des mouvements d\'une danse' },
  { en: 'Exhibition', fr: 'Exposition', hint: 'Présentation publique d\'œuvres' },
  { en: 'Sculpture', fr: 'Sculpture', hint: 'Art de façonner en trois dimensions' },
  { en: 'Gallery', fr: 'Galerie d\'art', hint: 'Espace mettant en valeur des toiles' },
  { en: 'Canvas', fr: 'Toile de peintre', hint: 'Support textile recevant la peinture' },
  { en: 'Architecture', fr: 'Architecture', hint: 'Art d\'édifier et structurer l\'espace' },
  { en: 'Aesthetics', fr: 'Esthétique', hint: 'Théorie de la beauté et de l\'art' },
  { en: 'Resilience', fr: 'Résilience', hint: 'Capacité à rebondir après l\'épreuve' },
  { en: 'Vitality', fr: 'Vitalité', hint: 'Énergie vigoureuse et santé éclatante' },
  { en: 'Stamina', fr: 'Endurance', hint: 'Capacité à soutenir un effort prolongé' },
  { en: 'Hydration', fr: 'Hydratation', hint: 'Apport en eau indispensable au corps' },
  { en: 'Metabolism', fr: 'Métabolisme', hint: 'Transformations chimiques de l\'organisme' },
  { en: 'Mindfulness', fr: 'Pleine conscience', hint: 'Attention sereine portée au présent' },
  { en: 'Leadership', fr: 'Leadership', hint: 'Capacité à inspirer et guider une équipe' },
  { en: 'Colleague', fr: 'Collègue', hint: 'Partenaire de travail au bureau' },
  { en: 'Negotiation', fr: 'Négociation', hint: 'Discussion visant un accord mutuel' },
  { en: 'Partnership', fr: 'Partenariat', hint: 'Association étroite entre deux entités' },
  { en: 'Craftsmanship', fr: 'Artisanat d\'art', hint: 'Maîtrise d\'un métier manuel raffiné' },
  { en: 'Expertise', fr: 'Expertise', hint: 'Grande maîtrise technique spécialisée' },
  { en: 'Qualification', fr: 'Qualification', hint: 'Aptitude certifiée par un diplôme' },
  { en: 'Reliable', fr: 'Fiable', hint: 'Sur qui l\'on peut compter en confiance' },
  { en: 'Accurate', fr: 'Précis', hint: 'D\'une exactitude irréprochable' },
  { en: 'Outstanding', fr: 'Remarquable', hint: 'Qui se distingue par son excellence' },
  { en: 'Extraordinary', fr: 'Extraordinaire', hint: 'Qui dépasse l\'ordinaire et surprend' },
  { en: 'Fascinating', fr: 'Fascinant', hint: 'Qui suscite une intense admiration' },
  { en: 'Sophisticated', fr: 'Sophistiqué', hint: 'Élaboré avec finesse et élégance' },
  { en: 'Comprehensive', fr: 'Exhaustif', hint: 'Qui embrasse la totalité d\'un sujet' },
  { en: 'Essential', fr: 'Indispensable', hint: 'Fondamental pour fonctionner' },
  { en: 'Crucial', fr: 'Déterminant', hint: 'D\'une importance capitale pour l\'issue' },
  { en: 'Abundant', fr: 'Abondant', hint: 'Présent en très grande quantité' },
  { en: 'Subtle', fr: 'Subtil', hint: 'Délicat, tout en nuance discrète' },
  { en: 'Vivid', fr: 'Éclatant', hint: 'D\'une vivacité et brillance intenses' },
  { en: 'Serene', fr: 'Serein', hint: 'Calme, paisible et sans trouble' },
  { en: 'Fearless', fr: 'Intrépide', hint: 'Sans aucune crainte face au danger' },
  { en: 'Generous', fr: 'Généreux', hint: 'Qui donne avec plaisir sans compter' },
  { en: 'Thoughtful', fr: 'Attentionné', hint: 'Plein de prévenance envers les autres' },
  { en: 'Sincere', fr: 'Sincère', hint: 'Authentique et sans faux-semblant' },
  { en: 'Diligent', fr: 'Appliqué', hint: 'Soigneux et régulier dans son labeur' },
  { en: 'Resourceful', fr: 'Ingénieux', hint: 'Capable de dénouer chaque situation' },
  { en: 'Adaptable', fr: 'Polyvalent', hint: 'Qui s\'ajuste aisément aux changements' },
  { en: 'Eloquent', fr: 'Éloquent', hint: 'Qui s\'exprime avec persuasion et grâce' },
  { en: 'Fluent', fr: 'Fluide', hint: 'Qui manie une langue avec aisance totale' },
  { en: 'Visionary', fr: 'Visionnaire', hint: 'Qui anticipe l\'avenir avec audace' },
  { en: 'Pioneer', fr: 'Pionnier', hint: 'Le premier à ouvrir une nouvelle voie' },
  { en: 'Mentor', fr: 'Guide éclairé', hint: 'Conseiller bienveillant et formateur' },
  { en: 'Apprentice', fr: 'Apprenti', hint: 'Élève débutant son apprentissage' },
  { en: 'Scholar', fr: 'Érudit', hint: 'Savant passionné d\'études littéraires' },
  { en: 'Philosopher', fr: 'Philosophe', hint: 'Penseur explorant le sens de l\'existence' },
  { en: 'Explorer', fr: 'Explorateur', hint: 'Voyageur découvrant des contrées inconnues' },
  { en: 'Navigator', fr: 'Navigateur', hint: 'Capitaine traçant la route en mer' },
  { en: 'Compass', fr: 'Boussole', hint: 'Instrument indiquant le Nord magnétique' },
  { en: 'Lighthouse', fr: 'Phare', hint: 'Tour lumineuse guidant les navires la nuit' },
  { en: 'Summit', fr: 'Sommet', hint: 'Le point le plus culminant de la montagne' },
  { en: 'Meadow', fr: 'Prairie', hint: 'Champ d\'herbes et de fleurs sauvages' },
  { en: 'Glacier', fr: 'Glacier', hint: 'Masse de glace formée en haute altitude' },
  { en: 'Cavern', fr: 'Grotte mystérieuse', hint: 'Cavité naturelle souterraine profonde' },
  { en: 'Waterfall', fr: 'Cascade', hint: 'Chute d\'eau spectaculaire d\'une falaise' },
  { en: 'Ecosystem', fr: 'Écosystème', hint: 'Ensemble vivant en équilibre mutuel' },
  { en: 'Biodiversity', fr: 'Biodiversité', hint: 'Richesse des espèces vivantes' },
  { en: 'Constellation', fr: 'Constellation', hint: 'Figure formée par un groupe d\'étoiles' },
  { en: 'Eclipse', fr: 'Éclipse', hint: 'Occultation d\'un astre par un autre' },
  { en: 'Gravity', fr: 'Gravité', hint: 'Force attirant les corps vers le centre' },
  { en: 'Atmosphere', fr: 'Atmosphère', hint: 'Couche gazeuse enveloppant la planète' },
  { en: 'Telescope', fr: 'Télescope', hint: 'Instrument observant les galaxies lointaines' },
  { en: 'Microscope', fr: 'Microscope', hint: 'Outil révélant l\'infiniment petit' },
  { en: 'Experiment', fr: 'Expérience', hint: 'Test méthodique pour prouver une hypothèse' },
  { en: 'Equation', fr: 'Équation', hint: 'Égalité mathématique contenant des variables' },
  { en: 'Theorem', fr: 'Théorème', hint: 'Proposition démontrée de manière logique' },
  { en: 'Metaphor', fr: 'Métaphore', hint: 'Figure stylistique reliant deux idées' },
  { en: 'Allegory', fr: 'Allégorie', hint: 'Représentation imagée d\'une idée abstraite' },
  { en: 'Chronicle', fr: 'Chronique', hint: 'Récit des faits dans l\'ordre du temps' },
  { en: 'Manuscript', fr: 'Manuscrit', hint: 'Texte ancien calligraphié à la main' },
  { en: 'Calligraphy', fr: 'Calligraphie', hint: 'Art d\'écrire harmonieusement à la plume' }
];

/**
 * Générateur dynamique de questions Speed Match :
 * Garantit exactement 12 mots (6 paires) par question,
 * et une sélection aléatoire garantissant que CHAQUE partie est unique.
 */
export function generateSpeedMatchQuestions(levelKey: SpeedMatchLevelKey): Array<{
  questionNumber: number;
  totalQuestions: number;
  pairs: SpeedMatchPair[];
}> {
  const config = SPEED_MATCH_LEVELS[levelKey];
  let pool: SpeedMatchPair[];

  switch (levelKey) {
    case 'debutant':
      pool = [...SPEED_MATCH_DEBUTANT_BANK];
      break;
    case 'intermediaire':
      pool = [...SPEED_MATCH_INTERMEDIAIRE_BANK];
      break;
    case 'professionnel':
      pool = [...SPEED_MATCH_INTERMEDIAIRE_BANK, ...SPEED_MATCH_AVANCE_BANK];
      break;
    case 'pro':
      pool = [...SPEED_MATCH_AVANCE_BANK];
      break;
    case 'expert':
      pool = [...SPEED_MATCH_DEBUTANT_BANK, ...SPEED_MATCH_INTERMEDIAIRE_BANK, ...SPEED_MATCH_AVANCE_BANK];
      break;
    case 'avance':
    default:
      pool = [...SPEED_MATCH_AVANCE_BANK];
      break;
  }

  // Shuffle master pool
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  const questions: Array<{
    questionNumber: number;
    totalQuestions: number;
    pairs: SpeedMatchPair[];
  }> = [];

  let poolIndex = 0;

  for (let q = 1; q <= config.questionsCount; q++) {
    const roundPairs: SpeedMatchPair[] = [];
    const usedEn = new Set<string>();

    while (roundPairs.length < 6) {
      if (poolIndex >= shuffledPool.length) {
        // Re-shuffle when pool exhausted
        shuffledPool.sort(() => Math.random() - 0.5);
        poolIndex = 0;
      }
      const candidate = shuffledPool[poolIndex];
      poolIndex++;

      if (!usedEn.has(candidate.en)) {
        usedEn.add(candidate.en);
        roundPairs.push(candidate);
      }
    }

    questions.push({
      questionNumber: q,
      totalQuestions: config.questionsCount,
      pairs: roundPairs
    });
  }

  return questions;
}

// Rétrocompatibilité avec l'ancien tableau
export const SPEED_MATCH_ROUNDS = [
  {
    theme: 'Vie Quotidienne & Maison',
    themeIcon: 'home',
    pairs: SPEED_MATCH_DEBUTANT_BANK.slice(0, 6)
  },
  {
    theme: 'École & Amitié (Niveau 6e)',
    themeIcon: 'school',
    pairs: SPEED_MATCH_DEBUTANT_BANK.slice(6, 12)
  },
  {
    theme: 'Voyage & Découverte',
    themeIcon: 'flight_takeoff',
    pairs: SPEED_MATCH_INTERMEDIAIRE_BANK.slice(0, 6)
  }
];

export type WordScrambleLevelKey = 'debutant' | 'intermediaire' | 'expert' | 'expert_avance' | 'master_avance';

export interface WordScrambleWord {
  word: string;
  clue: string;
  translation: string;
  category?: string;
}

export interface WordScrambleQuestion {
  questionNumber: number;
  totalQuestions: number;
  words: WordScrambleWord[];
}

export interface WordScrambleLevelInfo {
  id: WordScrambleLevelKey;
  label: string;
  subtitle: string;
  requiredPlayerLevel: number;
  questionsCount: number; // 5, 25, 50, 70, 90
  wordsPerQuestion: number; // 12
  timePerQuestionLimited: number;
  xpReward: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  description: string;
}

export const WORD_SCRAMBLE_LEVELS: Record<WordScrambleLevelKey, WordScrambleLevelInfo> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    subtitle: '5 Questions • 12 Mots par question',
    requiredPlayerLevel: 1,
    questionsCount: 5,
    wordsPerQuestion: 12,
    timePerQuestionLimited: 60,
    xpReward: 40,
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    icon: 'sentiment_satisfied',
    description: '5 questions de 12 mots (60 mots au total). Vocabulaire essentiel (4 à 6 lettres).'
  },
  intermediaire: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    subtitle: '25 Questions • 12 Mots par question',
    requiredPlayerLevel: 11,
    questionsCount: 25,
    wordsPerQuestion: 12,
    timePerQuestionLimited: 55,
    xpReward: 90,
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    icon: 'speed',
    description: '25 questions de 12 mots (300 mots au total). Vocabulaire usuel et du voyage (5 à 7 lettres).'
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    subtitle: '50 Questions • 12 Mots par question',
    requiredPlayerLevel: 21,
    questionsCount: 50,
    wordsPerQuestion: 12,
    timePerQuestionLimited: 50,
    xpReward: 180,
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-400',
    icon: 'workspace_premium',
    description: '50 questions de 12 mots (600 mots au total). Vocabulaire riche et précis (6 à 8 lettres).'
  },
  expert_avance: {
    id: 'expert_avance',
    label: 'Expert Avancé',
    subtitle: '70 Questions • 12 Mots par question',
    requiredPlayerLevel: 31,
    questionsCount: 70,
    wordsPerQuestion: 12,
    timePerQuestionLimited: 45,
    xpReward: 300,
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    icon: 'diamond',
    description: '70 questions de 12 mots (840 mots au total). Nuances académiques et rhétoriques (7 à 9 lettres).'
  },
  master_avance: {
    id: 'master_avance',
    label: 'Master Avancé',
    subtitle: '90 Questions • 12 Mots par question',
    requiredPlayerLevel: 51,
    questionsCount: 90,
    wordsPerQuestion: 12,
    timePerQuestionLimited: 40,
    xpReward: 500,
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    icon: 'military_tech',
    description: '90 questions de 12 mots (1 080 mots au total). Maîtrise suprême du lexique d\'Oxford (8 à 12 lettres).'
  }
};

// Banques de vocabulaire Word Scramble
export const WORD_SCRAMBLE_DEBUTANT_BANK: WordScrambleWord[] = [
  { word: 'BOOK', clue: 'Objet relié avec des pages que l\'on lit', translation: 'Livre', category: 'École' },
  { word: 'BIRD', clue: 'Animal à plumes qui vole dans le ciel', translation: 'Oiseau', category: 'Nature' },
  { word: 'TREE', clue: 'Végétal avec un tronc en bois et des feuilles', translation: 'Arbre', category: 'Nature' },
  { word: 'STAR', clue: 'Point scintillant dans le ciel nocturne', translation: 'Étoile', category: 'Espace' },
  { word: 'MOON', clue: 'Astre qui éclaire nos nuits', translation: 'Lune', category: 'Espace' },
  { word: 'FISH', clue: 'Animal aquatique nageant dans l\'eau', translation: 'Poisson', category: 'Animaux' },
  { word: 'DOOR', clue: 'Ouverture pour entrer dans une pièce', translation: 'Porte', category: 'Maison' },
  { word: 'ROOM', clue: 'Espace fermé à l\'intérieur d\'une maison', translation: 'Pièce', category: 'Maison' },
  { word: 'BLUE', clue: 'La couleur de l\'océan et du ciel dégagé', translation: 'Bleu', category: 'Couleurs' },
  { word: 'TIME', clue: 'Ce qui s\'écoule mesuré par les horloges', translation: 'Temps', category: 'Vie' },
  { word: 'LOVE', clue: 'Sentiment d\'affection profonde et sincère', translation: 'Amour', category: 'Émotions' },
  { word: 'HOPE', clue: 'Attente confiante d\'un événement futur heureux', translation: 'Espoir', category: 'Émotions' },
  { word: 'FIRE', clue: 'Flammes qui dégagent chaleur et lumière', translation: 'Feu', category: 'Éléments' },
  { word: 'WIND', clue: 'Mouvement de l\'air qui souffle', translation: 'Vent', category: 'Météo' },
  { word: 'RAIN', clue: 'Gouttes d\'eau tombant des nuages', translation: 'Pluie', category: 'Météo' },
  { word: 'SNOW', clue: 'Flocons blancs tombant en hiver', translation: 'Neige', category: 'Météo' },
  { word: 'GOLD', clue: 'Métal précieux de couleur jaune brillant', translation: 'Or', category: 'Richesses' },
  { word: 'SHIP', clue: 'Grande embarcation naviguant sur les mers', translation: 'Navire', category: 'Voyage' },
  { word: 'ROAD', clue: 'Voie aménagée pour circuler en voiture', translation: 'Route', category: 'Transport' },
  { word: 'CITY', clue: 'Grande agglomération avec de nombreux immeubles', translation: 'Ville', category: 'Lieux' },
  { word: 'PARK', clue: 'Espace vert public pour se promener', translation: 'Parc', category: 'Lieux' },
  { word: 'LION', clue: 'Le roi des animaux de la savane', translation: 'Lion', category: 'Animaux' },
  { word: 'BEAR', clue: 'Grand mammifère qui hiberne en hiver', translation: 'Ours', category: 'Animaux' },
  { word: 'MILK', clue: 'Boisson blanche produite par les vaches', translation: 'Lait', category: 'Alimentation' },
  { word: 'CAKE', clue: 'Pâtisserie sucrée partagée aux anniversaires', translation: 'Gâteau', category: 'Alimentation' },
  { word: 'DESK', clue: 'Meuble sur lequel on écrit ou travaille', translation: 'Bureau', category: 'Maison' },
  { word: 'SONG', clue: 'Mélodie musicale chantée avec des paroles', translation: 'Chanson', category: 'Art' },
  { word: 'RING', clue: 'Bijou circulaire porté autour du doigt', translation: 'Bague / Anneau', category: 'Mode' },
  { word: 'BALL', clue: 'Objet sphérique utilisé dans les sports', translation: 'Balle / Ballon', category: 'Sports' },
  { word: 'GAME', clue: 'Activité récréative avec des règles', translation: 'Jeu', category: 'Loisirs' }
];

export const WORD_SCRAMBLE_INTERMEDIAIRE_BANK: WordScrambleWord[] = [
  { word: 'FRIEND', clue: 'Une personne chère avec qui on partage tout', translation: 'Ami(e)', category: 'Relations' },
  { word: 'SCHOOL', clue: 'Le lieu où l\'on apprend chaque jour', translation: 'École', category: 'Études' },
  { word: 'TRAVEL', clue: 'Explorer le monde et de nouveaux pays', translation: 'Voyager', category: 'Voyage' },
  { word: 'GARDEN', clue: 'Espace vert avec des fleurs et des arbres', translation: 'Jardin', category: 'Nature' },
  { word: 'SUMMER', clue: 'La saison la plus chaude et ensoleillée', translation: 'Été', category: 'Saisons' },
  { word: 'WINTER', clue: 'La saison la plus froide de l\'année', translation: 'Hiver', category: 'Saisons' },
  { word: 'SPRING', clue: 'La saison où la nature renaît et fleurit', translation: 'Printemps', category: 'Saisons' },
  { word: 'AUTUMN', clue: 'Saison où les feuilles jaunissent et tombent', translation: 'Automne', category: 'Saisons' },
  { word: 'CASTLE', clue: 'Grande demeure fortifiée du Moyen Âge', translation: 'Château', category: 'Histoire' },
  { word: 'DOCTOR', clue: 'Professionnel de santé qui soigne les malades', translation: 'Médecin', category: 'Santé' },
  { word: 'FAMILY', clue: 'Parents, enfants et proches unis', translation: 'Famille', category: 'Relations' },
  { word: 'WINDOW', clue: 'Ouverture vitrée qui laisse entrer la lumière', translation: 'Fenêtre', category: 'Maison' },
  { word: 'STREET', clue: 'Voie urbaine bordée de bâtiments', translation: 'Rue', category: 'Ville' },
  { word: 'RIVER', clue: 'Cours d\'eau naturel se jetant dans la mer', translation: 'Rivière / Fleuve', category: 'Géographie' },
  { word: 'FOREST', clue: 'Vaste étendue couverte d\'arbres denses', translation: 'Forêt', category: 'Nature' },
  { word: 'ISLAND', clue: 'Terre entourée d\'eau de tous côtés', translation: 'Île', category: 'Géographie' },
  { word: 'MARKET', clue: 'Lieu de commerce où l\'on vend des produits frais', translation: 'Marché', category: 'Commerce' },
  { word: 'BRIDGE', clue: 'Construction permettant de franchir un cours d\'eau', translation: 'Pont', category: 'Architecture' },
  { word: 'ANIMAL', clue: 'Être vivant doué de mouvement et de sensibilité', translation: 'Animal', category: 'Faune' },
  { word: 'SILVER', clue: 'Métal précieux blanc et brillant', translation: 'Argent (métal)', category: 'Matières' },
  { word: 'YELLOW', clue: 'Couleur du citron et des tournesols', translation: 'Jaune', category: 'Couleurs' },
  { word: 'ORANGE', clue: 'Couleur chaude entre le rouge et le jaune', translation: 'Orange', category: 'Couleurs' },
  { word: 'PURPLE', clue: 'Couleur noble mélange de rouge et de bleu', translation: 'Violet / Pourpre', category: 'Couleurs' },
  { word: 'SHADOW', clue: 'Zone sombre créée par l\'interception de la lumière', translation: 'Ombre', category: 'Physique' },
  { word: 'BREEZE', clue: 'Vent léger, doux et rafraîchissant', translation: 'Brise légère', category: 'Météo' },
  { word: 'FLOWER', clue: 'Partie colorée et parfumée d\'une plante', translation: 'Fleur', category: 'Botanique' },
  { word: 'PLANET', clue: 'Corps céleste gravitant autour d\'une étoile', translation: 'Planète', category: 'Astronomie' },
  { word: 'ENERGY', clue: 'Force capable de produire un mouvement ou travail', translation: 'Énergie', category: 'Science' },
  { word: 'TEMPLE', clue: 'Édifice sacré consacré au culte', translation: 'Temple', category: 'Culture' },
  { word: 'CHURCH', clue: 'Édifice religieux chrétien', translation: 'Église', category: 'Architecture' }
];

export const WORD_SCRAMBLE_EXPERT_BANK: WordScrambleWord[] = [
  { word: 'JOURNEY', clue: 'Long déplacement ou expédition vers un lieu éloigné', translation: 'Voyage / Périple', category: 'Aventure' },
  { word: 'WEATHER', clue: 'Conditions atmosphériques à un moment donné', translation: 'Météo / Temps', category: 'Science' },
  { word: 'MORNING', clue: 'Première partie de la journée avant midi', translation: 'Matinée', category: 'Temps' },
  { word: 'FREEDOM', clue: 'État d\'une personne affranchie de toute contrainte', translation: 'Liberté', category: 'Philosophie' },
  { word: 'COURAGE', clue: 'Force morale face au danger et aux épreuves', translation: 'Courage', category: 'Vertus' },
  { word: 'WISDOM', clue: 'Connaissance profonde et jugement éclairé', translation: 'Sagesse', category: 'Philosophie' },
  { word: 'SILENCE', clue: 'Absence totale de bruit ou de paroles', translation: 'Silence', category: 'Sensation' },
  { word: 'PATIENCE', clue: 'Capacité à attendre calmement et sans colère', translation: 'Patience', category: 'Vertus' },
  { word: 'BALANCE', clue: 'État d\'harmonie et d\'équilibre entre forces', translation: 'Équilibre', category: 'Concept' },
  { word: 'HARMONY', clue: 'Accord parfait entre éléments ou sons', translation: 'Harmonie', category: 'Musique' },
  { word: 'JUSTICE', clue: 'Principe moral de respect du droit et d\'équité', translation: 'Justice', category: 'Droit' },
  { word: 'STRENGTH', clue: 'Puissance physique ou énergie intérieure', translation: 'Force', category: 'Corps' },
  { word: 'THOUGHT', clue: 'Idée ou réflexion produite par l\'esprit', translation: 'Pensée', category: 'Esprit' },
  { word: 'MYSTERY', clue: 'Chose secrète et difficile à comprendre', translation: 'Mystère', category: 'Énigme' },
  { word: 'TRIUMPH', clue: 'Victoire éclatante et retentissante', translation: 'Triomphe', category: 'Succès' },
  { word: 'VICTORY', clue: 'Succès remporté sur un adversaire ou une difficulté', translation: 'Victoire', category: 'Succès' },
  { word: 'PURPOSE', clue: 'Objectif fondamental que l\'on cherche à atteindre', translation: 'But / Raison d\'être', category: 'Destin' },
  { word: 'KINDNESS', clue: 'Bienveillance attentionnée envers autrui', translation: 'Gentillesse / Bonté', category: 'Vertus' },
  { word: 'HONOR', clue: 'Dignité morale et sentiment de devoir', translation: 'Honneur', category: 'Valeurs' },
  { word: 'SCIENCE', clue: 'Ensemble des connaissances fondées sur l\'étude', translation: 'Science', category: 'Savoir' },
  { word: 'HISTORY', clue: 'Récit et étude des événements du passé humain', translation: 'Histoire', category: 'Savoir' },
  { word: 'CULTURE', clue: 'Ensemble des coutumes, arts et savoirs d\'un peuple', translation: 'Culture', category: 'Société' },
  { word: 'DESTINY', clue: 'Suite d\'événements qui composent la vie future', translation: 'Destin', category: 'Temps' },
  { word: 'COMPASS', clue: 'Instrument indiquant le nord magnétique', translation: 'Boussole', category: 'Navigation' },
  { word: 'CHALLENGE', clue: 'Défi difficile stimulant l\'effort et le courage', translation: 'Défi', category: 'Action' },
  { word: 'DIAMOND', clue: 'Pierre précieuse la plus dure et brillante', translation: 'Diamant', category: 'Richesses' }
];

export const WORD_SCRAMBLE_EXPERT_AVANCE_BANK: WordScrambleWord[] = [
  { word: 'KNOWLEDGE', clue: 'Savoir acquis par l\'expérience et l\'étude', translation: 'Connaissance', category: 'Érudition' },
  { word: 'BRILLIANT', clue: 'D\'une intelligence éclatante et remarquable', translation: 'Brillant', category: 'Qualité' },
  { word: 'DISCOVERY', clue: 'Fait de trouver ce qui était inconnu ou caché', translation: 'Découverte', category: 'Recherche' },
  { word: 'BEAUTIFUL', clue: 'Qui suscite l\'admiration par son harmonie esthétique', translation: 'Magnifique / Beau', category: 'Esthétique' },
  { word: 'ELOQUENCE', clue: 'Art d\'émouvoir et convaincre par la parole', translation: 'Éloquence', category: 'Rhétorique' },
  { word: 'EXCELLENCE', clue: 'Degré éminent de perfection et de qualité', translation: 'Excellence', category: 'Prestige' },
  { word: 'ADVENTURE', clue: 'Entreprise audacieuse pleine d\'imprévus', translation: 'Aventure', category: 'Périple' },
  { word: 'SYMPHONY', clue: 'Grande composition orchestrale en plusieurs mouvements', translation: 'Symphonie', category: 'Musique' },
  { word: 'REFLECTION', clue: 'Méditation approfondie sur une pensée ou image renvoyée', translation: 'Réflexion', category: 'Pensée' },
  { word: 'PERSEVERANCE', clue: 'Ténacité constante dans l\'effort', translation: 'Persévérance', category: 'Caractère' },
  { word: 'PHENOMENON', clue: 'Fait exceptionnel ou fait observé scientifiquement', translation: 'Phénomène', category: 'Science' },
  { word: 'INSPIRATION', clue: 'Élan créateur qui insuffle de nouvelles idées', translation: 'Inspiration', category: 'Création' },
  { word: 'CHAMPION', clue: 'Vainqueur d\'une épreuve sportive ou défenseur d\'une cause', translation: 'Champion', category: 'Sport' },
  { word: 'CELEBRATION', clue: 'Fête organisée pour marquer un événement marquant', translation: 'Célébration', category: 'Fêtes' },
  { word: 'IMAGINATION', clue: 'Faculté de concevoir des représentations nouvelles', translation: 'Imagination', category: 'Esprit' },
  { word: 'CREATIVITY', clue: 'Capacité d\'inventer et d\'apporter du renouveau', translation: 'Créativité', category: 'Art' },
  { word: 'LEADERSHIP', clue: 'Capacité à guider et inspirer un groupe', translation: 'Leadership', category: 'Management' },
  { word: 'LITERATURE', clue: 'Ensemble des œuvres écrites fondées sur l\'art du style', translation: 'Littérature', category: 'Lettres' },
  { word: 'PHILOSOPHY', clue: 'Étude critique de la pensée, du savoir et de l\'existence', translation: 'Philosophie', category: 'Humanités' },
  { word: 'TREASURE', clue: 'Ensemble précieux d\'or, de joyaux ou de savoir', translation: 'Trésor', category: 'Mystère' }
];

export const WORD_SCRAMBLE_MASTER_BANK: WordScrambleWord[] = [
  { word: 'EXTRAORDINARY', clue: 'Qui sort du commun et dépasse l\'ordinaire', translation: 'Extraordinaire', category: 'Prestige' },
  { word: 'MAGNIFICENT', clue: 'D\'une splendeur grandiose et éblouissante', translation: 'Magnifique', category: 'Élégance' },
  { word: 'RENAISSANCE', clue: 'Époque historique de renouveau des arts et lettres', translation: 'Renaissance', category: 'Histoire' },
  { word: 'SOPHISTICATED', clue: 'Très raffiné, élégant et d\'une grande complexité', translation: 'Sophistiqué', category: 'Raffinement' },
  { word: 'CONSCIOUSNESS', clue: 'Perception lucide de son existence et du monde', translation: 'Conscience', category: 'Esprit' },
  { word: 'METAMORPHOSIS', clue: 'Transformation complète d\'un être ou d\'une forme', translation: 'Métamorphose', category: 'Biologie' },
  { word: 'RESILIENCE', clue: 'Capacité à surmonter les chocs et renaître', translation: 'Résilience', category: 'Psychologie' },
  { word: 'AUTHENTICITY', clue: 'Caractère de ce qui est vrai, pur et sans artifice', translation: 'Authenticité', category: 'Valeurs' },
  { word: 'PHILANTHROPY', clue: 'Amour désintéressé pour l\'humanité exprimé en actes', translation: 'Philanthropie', category: 'Vertus' },
  { word: 'PERSPECTIVE', clue: 'Point de vue ou perception de la profondeur', translation: 'Perspective', category: 'Vision' },
  { word: 'SPECTACULAR', clue: 'Qui frappe la vue par sa beauté et son envergure', translation: 'Spectaculaire', category: 'Événement' },
  { word: 'ARCHITECTURE', clue: 'Art de concevoir et d\'édifier des structures durables', translation: 'Architecture', category: 'Arts' },
  { word: 'ILLUSTRATION', clue: 'Image ou exemple destiné à éclairer un propos', translation: 'Illustration', category: 'Design' },
  { word: 'NOBILITY', clue: 'Élévation de sentiments et distinction morale', translation: 'Noblesse d\'esprit', category: 'Honneur' },
  { word: 'CONTEMPLATION', clue: 'Observation méditative, sereine et admirative', translation: 'Contemplation', category: 'Spiritualité' },
  { word: 'FELLOWSHIP', clue: 'Confraternité chaleureuse et partage intellectuel', translation: 'Confrérie / Camaraderie', category: 'Académie' }
];

export const WORD_SCRAMBLE_ITEMS = WORD_SCRAMBLE_INTERMEDIAIRE_BANK.slice(0, 6);

/**
 * Mélange aléatoire des lettres garantissant un ordre différent du mot d'origine
 */
export function scrambleLetters(word: string): string[] {
  const letters = word.toUpperCase().split('');
  if (letters.length <= 1) return letters;

  let scrambled = [...letters];
  let attempts = 0;
  while (attempts < 15 && scrambled.join('') === word.toUpperCase()) {
    scrambled = [...letters].sort(() => Math.random() - 0.5);
    attempts++;
  }
  // Si après 15 tentatives le mot est identique (ex: lettres toutes identiques), swap les 2 premières
  if (scrambled.join('') === word.toUpperCase() && scrambled.length >= 2) {
    const temp = scrambled[0];
    scrambled[0] = scrambled[1];
    scrambled[1] = temp;
  }
  return scrambled;
}

/**
 * Générateur dynamique de questions Word Scramble non-répétitives
 * Chaque question contient exactement 12 MOTS
 */
export function generateWordScrambleQuestions(levelKey: WordScrambleLevelKey): WordScrambleQuestion[] {
  const config = WORD_SCRAMBLE_LEVELS[levelKey] || WORD_SCRAMBLE_LEVELS.debutant;

  // Sélection de la banque lexicale adaptée
  let bank: WordScrambleWord[] = [];
  if (levelKey === 'debutant') {
    bank = [...WORD_SCRAMBLE_DEBUTANT_BANK];
  } else if (levelKey === 'intermediaire') {
    bank = [...WORD_SCRAMBLE_INTERMEDIAIRE_BANK, ...WORD_SCRAMBLE_DEBUTANT_BANK];
  } else if (levelKey === 'expert') {
    bank = [...WORD_SCRAMBLE_EXPERT_BANK, ...WORD_SCRAMBLE_INTERMEDIAIRE_BANK];
  } else if (levelKey === 'expert_avance') {
    bank = [...WORD_SCRAMBLE_EXPERT_AVANCE_BANK, ...WORD_SCRAMBLE_EXPERT_BANK];
  } else {
    bank = [...WORD_SCRAMBLE_MASTER_BANK, ...WORD_SCRAMBLE_EXPERT_AVANCE_BANK];
  }

  const questions: WordScrambleQuestion[] = [];

  for (let qIdx = 0; qIdx < config.questionsCount; qIdx++) {
    // Tirage aléatoire sans répétition immédiate de 12 mots
    const shuffledBank = [...bank].sort(() => Math.random() - 0.5);
    const chosenWords = shuffledBank.slice(0, config.wordsPerQuestion);

    // Si la banque est inférieure à 12, on complète
    while (chosenWords.length < config.wordsPerQuestion) {
      const fallback = bank[Math.floor(Math.random() * bank.length)];
      chosenWords.push(fallback);
    }

    questions.push({
      questionNumber: qIdx + 1,
      totalQuestions: config.questionsCount,
      words: chosenWords
    });
  }

  return questions;
}

// =====================================================================
// SPEED MENTAL MATH (Calcul Mental Rapide & Nombres en Anglais)
// =====================================================================

export interface MentalMathProblem {
  id: string;
  expression: string;
  enQuestion: string;
  frContext: string;
  correctAnswer: number;
  options: number[];
  trickTitle: string;
  trickRule: string;
  enAudioPhrase: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
}

export const SPEED_MATH_PROBLEMS: MentalMathProblem[] = [
  // Astuce du 11
  {
    id: 'math_11_1',
    expression: '35 × 11',
    enQuestion: 'What is thirty-five times eleven ?',
    frContext: 'Multiplier par 11 en un éclair',
    correctAnswer: 385,
    options: [385, 375, 395, 365],
    trickTitle: 'La Règle d\'Or du 11',
    trickRule: 'Additionne les deux chiffres : 3 + 5 = 8. Glisse ensuite le 8 au centre : 385 !',
    enAudioPhrase: 'Thirty-five times eleven equals three hundred and eighty-five.',
    level: 'debutant'
  },
  {
    id: 'math_11_2',
    expression: '43 × 11',
    enQuestion: 'What is forty-three times eleven ?',
    frContext: 'Multiplier par 11 en un éclair',
    correctAnswer: 473,
    options: [463, 473, 483, 493],
    trickTitle: 'La Règle d\'Or du 11',
    trickRule: 'Additionne 4 + 3 = 7. Insère le 7 entre 4 et 3 : 473 !',
    enAudioPhrase: 'Forty-three times eleven equals four hundred and seventy-three.',
    level: 'debutant'
  },
  {
    id: 'math_11_3',
    expression: '62 × 11',
    enQuestion: 'What is sixty-two times eleven ?',
    frContext: 'Multiplier par 11 en un éclair',
    correctAnswer: 682,
    options: [672, 682, 692, 702],
    trickTitle: 'La Règle d\'Or du 11',
    trickRule: 'Additionne 6 + 2 = 8. Place 8 au milieu : 682 !',
    enAudioPhrase: 'Sixty-two times eleven equals six hundred and eighty-two.',
    level: 'intermediaire'
  },
  {
    id: 'math_11_4',
    expression: '54 × 11',
    enQuestion: 'What is fifty-four times eleven ?',
    frContext: 'Multiplier par 11 en un éclair',
    correctAnswer: 594,
    options: [584, 594, 604, 614],
    trickTitle: 'La Règle d\'Or du 11',
    trickRule: 'Additionne 5 + 4 = 9. Insère 9 au milieu : 594 !',
    enAudioPhrase: 'Fifty-four times eleven equals five hundred and ninety-four.',
    level: 'intermediaire'
  },

  // Carrés se terminant par 5
  {
    id: 'math_sq_1',
    expression: '25²',
    enQuestion: 'What is twenty-five squared ?',
    frContext: 'Le carré des nombres finissant par 5',
    correctAnswer: 625,
    options: [525, 625, 675, 725],
    trickTitle: 'Carré Magique des Nombres en 5',
    trickRule: 'Multiplie le premier chiffre par son suivant (2 × 3 = 6) puis colle 25 à la fin : 625 !',
    enAudioPhrase: 'Twenty-five squared equals six hundred and twenty-five.',
    level: 'debutant'
  },
  {
    id: 'math_sq_2',
    expression: '35²',
    enQuestion: 'What is thirty-five squared ?',
    frContext: 'Le carré des nombres finissant par 5',
    correctAnswer: 1225,
    options: [1125, 1225, 1275, 1325],
    trickTitle: 'Carré Magique des Nombres en 5',
    trickRule: 'Multiplie 3 par (3 + 1) = 12, puis colle 25 : 1225 !',
    enAudioPhrase: 'Thirty-five squared equals one thousand two hundred and twenty-five.',
    level: 'intermediaire'
  },
  {
    id: 'math_sq_3',
    expression: '45²',
    enQuestion: 'What is forty-five squared ?',
    frContext: 'Le carré des nombres finissant par 5',
    correctAnswer: 2025,
    options: [1925, 2025, 2125, 2225],
    trickTitle: 'Carré Magique des Nombres en 5',
    trickRule: 'Multiplie 4 par 5 = 20, puis ajoute 25 : 2025 !',
    enAudioPhrase: 'Forty-five squared equals two thousand and twenty-five.',
    level: 'avance'
  },
  {
    id: 'math_sq_4',
    expression: '65²',
    enQuestion: 'What is sixty-five squared ?',
    frContext: 'Le carré des nombres finissant par 5',
    correctAnswer: 4225,
    options: [4125, 4225, 4325, 4425],
    trickTitle: 'Carré Magique des Nombres en 5',
    trickRule: 'Multiplie 6 par 7 = 42, puis ajoute 25 : 4225 !',
    enAudioPhrase: 'Sixty-five squared equals four thousand two hundred and twenty-five.',
    level: 'expert'
  },

  // Complément à 100
  {
    id: 'math_comp_1',
    expression: '100 - 37',
    enQuestion: 'What is one hundred minus thirty-seven ?',
    frContext: 'Le complément instantané à 100',
    correctAnswer: 63,
    options: [63, 67, 73, 53],
    trickTitle: 'Complément Immédiat à 100',
    trickRule: 'Fais 9 - 3 = 6 pour les dizaines, et 10 - 7 = 3 pour les unités : 63 !',
    enAudioPhrase: 'One hundred minus thirty-seven equals sixty-three.',
    level: 'debutant'
  },
  {
    id: 'math_comp_2',
    expression: '100 - 64',
    enQuestion: 'What is one hundred minus sixty-four ?',
    frContext: 'Le complément instantané à 100',
    correctAnswer: 36,
    options: [34, 36, 44, 46],
    trickTitle: 'Complément Immédiat à 100',
    trickRule: '9 - 6 = 3 pour les dizaines, 10 - 4 = 6 pour les unités : 36 !',
    enAudioPhrase: 'One hundred minus sixty-four equals thirty-six.',
    level: 'debutant'
  },
  {
    id: 'math_comp_3',
    expression: '100 - 48',
    enQuestion: 'What is one hundred minus forty-eight ?',
    frContext: 'Le complément instantané à 100',
    correctAnswer: 52,
    options: [42, 52, 62, 58],
    trickTitle: 'Complément Immédiat à 100',
    trickRule: '9 - 4 = 5 pour les dizaines, 10 - 8 = 2 pour les unités : 52 !',
    enAudioPhrase: 'One hundred minus forty-eight equals fifty-two.',
    level: 'intermediaire'
  },

  // Doubler & Diviser par 2
  {
    id: 'math_dh_1',
    expression: '16 × 25',
    enQuestion: 'What is sixteen times twenty-five ?',
    frContext: 'Diviser par 2 et doubler',
    correctAnswer: 400,
    options: [350, 400, 450, 500],
    trickTitle: 'Diviser par 2 et Doubler',
    trickRule: 'Prends la moitié de 16 (= 8) et double 25 (= 50). Alors 8 × 50 = 400 !',
    enAudioPhrase: 'Sixteen times twenty-five equals four hundred.',
    level: 'intermediaire'
  },
  {
    id: 'math_dh_2',
    expression: '14 × 50',
    enQuestion: 'What is fourteen times fifty ?',
    frContext: 'Diviser par 2 et multiplier par 100',
    correctAnswer: 700,
    options: [600, 650, 700, 750],
    trickTitle: 'Multiplier par 50 = Moitié de 100',
    trickRule: 'Divise 14 par 2 (= 7) puis multiplie par 100 : 700 !',
    enAudioPhrase: 'Fourteen times fifty equals seven hundred.',
    level: 'intermediaire'
  },
  {
    id: 'math_dh_3',
    expression: '18 × 25',
    enQuestion: 'What is eighteen times twenty-five ?',
    frContext: 'Diviser par 2 et doubler',
    correctAnswer: 450,
    options: [400, 425, 450, 475],
    trickTitle: 'Diviser par 2 et Doubler',
    trickRule: 'Moitié de 18 (= 9) × double de 25 (= 50) -> 9 × 50 = 450 !',
    enAudioPhrase: 'Eighteen times twenty-five equals four hundred and fifty.',
    level: 'avance'
  },

  // Pourcentages Rapides
  {
    id: 'math_pct_1',
    expression: '15% de 80',
    enQuestion: 'What is fifteen percent of eighty ?',
    frContext: 'Pourcentage décomposé (10% + 5%)',
    correctAnswer: 12,
    options: [10, 12, 14, 16],
    trickTitle: 'La Règle du 10% + Moitié',
    trickRule: '10% de 80 = 8. La moitié (5%) = 4. Additionne : 8 + 4 = 12 !',
    enAudioPhrase: 'Fifteen percent of eighty is twelve.',
    level: 'avance'
  },
  {
    id: 'math_pct_2',
    expression: '25% de 160',
    enQuestion: 'What is twenty-five percent of one hundred and sixty ?',
    frContext: 'Le quart rapide',
    correctAnswer: 40,
    options: [30, 40, 50, 60],
    trickTitle: 'Le Quart Instantané',
    trickRule: '25% équivaut au quart. Divise deux fois par deux : 160 -> 80 -> 40 !',
    enAudioPhrase: 'Twenty-five percent of one hundred and sixty is forty.',
    level: 'intermediaire'
  },
  {
    id: 'math_pct_3',
    expression: '20% de 350',
    enQuestion: 'What is twenty percent of three hundred and fifty ?',
    frContext: 'Le double de 10%',
    correctAnswer: 70,
    options: [60, 65, 70, 75],
    trickTitle: 'Le Double du Dix Pourcent',
    trickRule: '10% de 350 = 35. Multiplie simplement par 2 : 35 × 2 = 70 !',
    enAudioPhrase: 'Twenty percent of three hundred and fifty is seventy.',
    level: 'avance'
  },

  // Multiplications proches de 10, 20, 50, 100
  {
    id: 'math_near_1',
    expression: '19 × 7',
    enQuestion: 'What is nineteen times seven ?',
    frContext: 'Utiliser le multiple rond voisin',
    correctAnswer: 133,
    options: [123, 133, 143, 153],
    trickTitle: 'L\'Arrondi Intelligent',
    trickRule: 'Calcule 20 × 7 = 140, puis retire 7 : 140 - 7 = 133 !',
    enAudioPhrase: 'Nineteen times seven equals one hundred and thirty-three.',
    level: 'avance'
  },
  {
    id: 'math_near_2',
    expression: '29 × 4',
    enQuestion: 'What is twenty-nine times four ?',
    frContext: 'Utiliser le multiple rond voisin',
    correctAnswer: 116,
    options: [106, 116, 126, 136],
    trickTitle: 'L\'Arrondi Intelligent',
    trickRule: 'Calcule 30 × 4 = 120, puis retire 4 : 120 - 4 = 116 !',
    enAudioPhrase: 'Twenty-nine times four equals one hundred and sixteen.',
    level: 'expert'
  },
  {
    id: 'math_near_3',
    expression: '99 × 6',
    enQuestion: 'What is ninety-nine times six ?',
    frContext: 'Utiliser le multiple rond voisin',
    correctAnswer: 594,
    options: [584, 594, 604, 614],
    trickTitle: 'L\'Arrondi à la Centaine',
    trickRule: 'Fais 100 × 6 = 600, puis retranche 6 : 600 - 6 = 594 !',
    enAudioPhrase: 'Ninety-nine times six equals five hundred and ninety-four.',
    level: 'expert'
  }
];


export const WORD_SEARCH_PUZZLE = {
  grid: [
    ['W', 'A', 'T', 'E', 'R', 'S', 'B'],
    ['B', 'O', 'O', 'K', 'A', 'U', 'R'],
    ['P', 'E', 'N', 'C', 'I', 'L', 'E'],
    ['A', 'P', 'P', 'L', 'E', 'N', 'A'],
    ['D', 'O', 'G', 'C', 'A', 'T', 'D'],
    ['H', 'O', 'U', 'S', 'E', 'M', 'O'],
    ['S', 'U', 'N', 'S', 'K', 'Y', 'L']
  ],
  words: [
    { word: 'WATER', fr: 'Eau', row: 0, col: 0, dir: 'H' },
    { word: 'BOOK', fr: 'Livre', row: 1, col: 0, dir: 'H' },
    { word: 'PENCIL', fr: 'Crayon', row: 2, col: 0, dir: 'H' },
    { word: 'APPLE', fr: 'Pomme', row: 3, col: 0, dir: 'H' },
    { word: 'HOUSE', fr: 'Maison', row: 5, col: 0, dir: 'H' },
    { word: 'CAT', fr: 'Chat', row: 4, col: 3, dir: 'H' }
  ]
};

// =====================================================================
// VERB MASTER (Mini-Jeu n°4) — 3 Niveaux • 12 Mots par Question
// Débutant (5 questions), Intermédiaire (25 questions), Avancé (50 questions)
// =====================================================================

export type VerbMasterLevelKey = 'debutant' | 'intermediaire' | 'expert' | 'expert_avance' | 'master';

export interface VerbMasterVerb {
  infinitive: string;
  preterite: string;
  pastParticiple: string;
  translation: string;
  category?: string;
  hint?: string;
}

export interface VerbMasterLevelInfo {
  id: VerbMasterLevelKey;
  label: string;
  subtitle: string;
  requiredPlayerLevel: number;
  questionsCount: number; // 5, 25, 50, 70, 90
  wordsPerQuestion: number; // 12 mots (6 paires)
  pairsPerQuestion: number; // 6 paires
  timePerQuestionLimited: number;
  xpReward: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  description: string;
}

export const VERB_MASTER_LEVELS: Record<VerbMasterLevelKey, VerbMasterLevelInfo> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    subtitle: '5 Questions • 12 Mots (6 paires) par question (60 mots)',
    requiredPlayerLevel: 1,
    questionsCount: 5,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestionLimited: 60,
    xpReward: 40,
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    icon: 'sentiment_satisfied',
    description: '5 questions de 12 mots (60 mots au total). Verbes anglais du quotidien et leurs formes irrégulières fondamentales.'
  },
  intermediaire: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    subtitle: '25 Questions • 12 Mots (6 paires) par question (300 mots)',
    requiredPlayerLevel: 11,
    questionsCount: 25,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestionLimited: 50,
    xpReward: 90,
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    icon: 'speed',
    description: '25 questions de 12 mots (300 mots au total). Verbes d\'action, de communication, d\'exploration et de négociation.'
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    subtitle: '50 Questions • 12 Mots (6 paires) par question (600 mots)',
    requiredPlayerLevel: 21,
    questionsCount: 50,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestionLimited: 45,
    xpReward: 180,
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-400',
    icon: 'workspace_premium',
    description: '50 questions de 12 mots (600 mots au total). Verbes irréguliers précis, contextes professionnels et nuances dynamiques.'
  },
  expert_avance: {
    id: 'expert_avance',
    label: 'Expert Avancé',
    subtitle: '70 Questions • 12 Mots (6 paires) par question (840 mots)',
    requiredPlayerLevel: 31,
    questionsCount: 70,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestionLimited: 40,
    xpReward: 300,
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    icon: 'diamond',
    description: '70 questions de 12 mots (840 mots au total). Verbes rhétoriques, verbes à particule soutenus et tournures d\'excellence.'
  },
  master: {
    id: 'master',
    label: 'Master',
    subtitle: '90 Questions • 12 Mots (6 paires) par question (1 080 mots)',
    requiredPlayerLevel: 51,
    questionsCount: 90,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestionLimited: 35,
    xpReward: 500,
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    icon: 'military_tech',
    description: '90 questions de 12 mots (1 080 mots au total). Verbes littéraires rares, verbes archaïques et maîtrise absolue du lexique d\'Oxford.'
  }
};

// Banque Débutant (Verbes indispensables de base - 45 verbes)
export const VERB_MASTER_DEBUTANT_BANK: VerbMasterVerb[] = [
  { infinitive: 'Be', preterite: 'Was / Were', pastParticiple: 'Been', translation: 'Être', category: 'Essentiel' },
  { infinitive: 'Have', preterite: 'Had', pastParticiple: 'Had', translation: 'Avoir', category: 'Essentiel' },
  { infinitive: 'Do', preterite: 'Did', pastParticiple: 'Done', translation: 'Faire', category: 'Essentiel' },
  { infinitive: 'Go', preterite: 'Went', pastParticiple: 'Gone', translation: 'Aller', category: 'Mouvement' },
  { infinitive: 'Come', preterite: 'Came', pastParticiple: 'Come', translation: 'Venir', category: 'Mouvement' },
  { infinitive: 'See', preterite: 'Saw', pastParticiple: 'Seen', translation: 'Voir', category: 'Sens' },
  { infinitive: 'Hear', preterite: 'Heard', pastParticiple: 'Heard', translation: 'Entendre', category: 'Sens' },
  { infinitive: 'Take', preterite: 'Took', pastParticiple: 'Taken', translation: 'Prendre', category: 'Action' },
  { infinitive: 'Give', preterite: 'Gave', pastParticiple: 'Given', translation: 'Donner', category: 'Action' },
  { infinitive: 'Make', preterite: 'Made', pastParticiple: 'Made', translation: 'Fabriquer', category: 'Action' },
  { infinitive: 'Get', preterite: 'Got', pastParticiple: 'Got / Gotten', translation: 'Obtenir', category: 'Action' },
  { infinitive: 'Say', preterite: 'Said', pastParticiple: 'Said', translation: 'Dire', category: 'Parole' },
  { infinitive: 'Tell', preterite: 'Told', pastParticiple: 'Told', translation: 'Raconter', category: 'Parole' },
  { infinitive: 'Speak', preterite: 'Spoke', pastParticiple: 'Spoken', translation: 'Parler', category: 'Parole' },
  { infinitive: 'Think', preterite: 'Thought', pastParticiple: 'Thought', translation: 'Penser', category: 'Esprit' },
  { infinitive: 'Know', preterite: 'Knew', pastParticiple: 'Known', translation: 'Savoir', category: 'Esprit' },
  { infinitive: 'Understand', preterite: 'Understood', pastParticiple: 'Understood', translation: 'Comprendre', category: 'Esprit' },
  { infinitive: 'Feel', preterite: 'Felt', pastParticiple: 'Felt', translation: 'Ressentir', category: 'Émotion' },
  { infinitive: 'Find', preterite: 'Found', pastParticiple: 'Found', translation: 'Trouver', category: 'Découverte' },
  { infinitive: 'Put', preterite: 'Put', pastParticiple: 'Put', translation: 'Mettre / Poser', category: 'Action' },
  { infinitive: 'Leave', preterite: 'Left', pastParticiple: 'Left', translation: 'Partir / Quitter', category: 'Mouvement' },
  { infinitive: 'Bring', preterite: 'Brought', pastParticiple: 'Brought', translation: 'Apporter', category: 'Action' },
  { infinitive: 'Begin', preterite: 'Began', pastParticiple: 'Begun', translation: 'Commencer', category: 'Temps' },
  { infinitive: 'Keep', preterite: 'Kept', pastParticiple: 'Kept', translation: 'Garder', category: 'Action' },
  { infinitive: 'Hold', preterite: 'Held', pastParticiple: 'Held', translation: 'Tenir', category: 'Action' },
  { infinitive: 'Write', preterite: 'Wrote', pastParticiple: 'Written', translation: 'Écrire', category: 'École' },
  { infinitive: 'Read', preterite: 'Read', pastParticiple: 'Read', translation: 'Lire', category: 'École' },
  { infinitive: 'Stand', preterite: 'Stood', pastParticiple: 'Stood', translation: 'Se tenir debout', category: 'Corps' },
  { infinitive: 'Sit', preterite: 'Sat', pastParticiple: 'Sat', translation: 'S\'asseoir', category: 'Corps' },
  { infinitive: 'Run', preterite: 'Ran', pastParticiple: 'Run', translation: 'Courir', category: 'Sport' },
  { infinitive: 'Pay', preterite: 'Paid', pastParticiple: 'Paid', translation: 'Payer', category: 'Commerce' },
  { infinitive: 'Buy', preterite: 'Bought', pastParticiple: 'Bought', translation: 'Acheter', category: 'Commerce' },
  { infinitive: 'Sell', preterite: 'Sold', pastParticiple: 'Sold', translation: 'Vendre', category: 'Commerce' },
  { infinitive: 'Eat', preterite: 'Ate', pastParticiple: 'Eaten', translation: 'Manger', category: 'Alimentation' },
  { infinitive: 'Drink', preterite: 'Drank', pastParticiple: 'Drunk', translation: 'Boire', category: 'Alimentation' },
  { infinitive: 'Sleep', preterite: 'Slept', pastParticiple: 'Slept', translation: 'Dormir', category: 'Vie' },
  { infinitive: 'Drive', preterite: 'Drove', pastParticiple: 'Driven', translation: 'Conduire', category: 'Voyage' },
  { infinitive: 'Fly', preterite: 'Flew', pastParticiple: 'Flown', translation: 'Voler', category: 'Voyage' },
  { infinitive: 'Wear', preterite: 'Wore', pastParticiple: 'Worn', translation: 'Porter (vêtement)', category: 'Mode' },
  { infinitive: 'Win', preterite: 'Won', pastParticiple: 'Won', translation: 'Gagner', category: 'Succès' },
  { infinitive: 'Lose', preterite: 'Lost', pastParticiple: 'Lost', translation: 'Perdre', category: 'Succès' },
  { infinitive: 'Fall', preterite: 'Fell', pastParticiple: 'Fallen', translation: 'Tomber', category: 'Mouvement' },
  { infinitive: 'Send', preterite: 'Sent', pastParticiple: 'Sent', translation: 'Envoyer', category: 'Communication' },
  { infinitive: 'Break', preterite: 'Broke', pastParticiple: 'Broken', translation: 'Casser', category: 'Action' },
  { infinitive: 'Teach', preterite: 'Taught', pastParticiple: 'Taught', translation: 'Enseigner', category: 'Savoir' }
];

// Banque Intermédiaire (Verbes réguliers et irréguliers avancés - 50 verbes)
export const VERB_MASTER_INTERMEDIAIRE_BANK: VerbMasterVerb[] = [
  { infinitive: 'Become', preterite: 'Became', pastParticiple: 'Become', translation: 'Devenir', category: 'Changement' },
  { infinitive: 'Choose', preterite: 'Chose', pastParticiple: 'Chosen', translation: 'Choisir', category: 'Décision' },
  { infinitive: 'Build', preterite: 'Built', pastParticiple: 'Built', translation: 'Construire', category: 'Action' },
  { infinitive: 'Catch', preterite: 'Caught', pastParticiple: 'Caught', translation: 'Attraper', category: 'Action' },
  { infinitive: 'Deal', preterite: 'Dealt', pastParticiple: 'Dealt', translation: 'Négocier / Traiter', category: 'Affaires' },
  { infinitive: 'Dream', preterite: 'Dreamt / Dreamed', pastParticiple: 'Dreamt / Dreamed', translation: 'Rêver', category: 'Esprit' },
  { infinitive: 'Feed', preterite: 'Fed', pastParticiple: 'Fed', translation: 'Nourrir', category: 'Soin' },
  { infinitive: 'Fight', preterite: 'Fought', pastParticiple: 'Fought', translation: 'Combattre', category: 'Courage' },
  { infinitive: 'Forgive', preterite: 'Forgave', pastParticiple: 'Forgiven', translation: 'Pardonner', category: 'Vertus' },
  { infinitive: 'Freeze', preterite: 'Froze', pastParticiple: 'Frozen', translation: 'Geler', category: 'Nature' },
  { infinitive: 'Grow', preterite: 'Grew', pastParticiple: 'Grown', translation: 'Grandir / Cultiver', category: 'Nature' },
  { infinitive: 'Hide', preterite: 'Hid', pastParticiple: 'Hidden', translation: 'Cacher', category: 'Mystère' },
  { infinitive: 'Hit', preterite: 'Hit', pastParticiple: 'Hit', translation: 'Frapper', category: 'Action' },
  { infinitive: 'Hurt', preterite: 'Hurt', pastParticiple: 'Hurt', translation: 'Blesser', category: 'Santé' },
  { infinitive: 'Lead', preterite: 'Led', pastParticiple: 'Led', translation: 'Mener / Guider', category: 'Leadership' },
  { infinitive: 'Lend', preterite: 'Lent', pastParticiple: 'Lent', translation: 'Prêter', category: 'Échange' },
  { infinitive: 'Light', preterite: 'Lit', pastParticiple: 'Lit', translation: 'Allumer / Éclairer', category: 'Éléments' },
  { infinitive: 'Ride', preterite: 'Rode', pastParticiple: 'Ridden', translation: 'Chevaucher / Rouler', category: 'Transport' },
  { infinitive: 'Rise', preterite: 'Rose', pastParticiple: 'Risen', translation: 'S\'élever', category: 'Mouvement' },
  { infinitive: 'Shake', preterite: 'Shook', pastParticiple: 'Shaken', translation: 'Secouer', category: 'Action' },
  { infinitive: 'Shine', preterite: 'Shone', pastParticiple: 'Shone', translation: 'Briller', category: 'Lumière' },
  { infinitive: 'Shoot', preterite: 'Shot', pastParticiple: 'Shot', translation: 'Tirer (projectile)', category: 'Action' },
  { infinitive: 'Show', preterite: 'Showed', pastParticiple: 'Shown', translation: 'Montrer', category: 'Vision' },
  { infinitive: 'Shut', preterite: 'Shut', pastParticiple: 'Shut', translation: 'Fermer', category: 'Action' },
  { infinitive: 'Sink', preterite: 'Sank', pastParticiple: 'Sunk', translation: 'Couler / Sombrer', category: 'Eau' },
  { infinitive: 'Slide', preterite: 'Slid', pastParticiple: 'Slid', translation: 'Glisser', category: 'Mouvement' },
  { infinitive: 'Smell', preterite: 'Smelt', pastParticiple: 'Smelt', translation: 'Sentir (odeur)', category: 'Sens' },
  { infinitive: 'Spend', preterite: 'Spent', pastParticiple: 'Spent', translation: 'Dépenser / Passer du temps', category: 'Temps' },
  { infinitive: 'Spill', preterite: 'Spilt', pastParticiple: 'Spilt', translation: 'Renverser', category: 'Action' },
  { infinitive: 'Split', preterite: 'Split', pastParticiple: 'Split', translation: 'Diviser / Séparer', category: 'Action' },
  { infinitive: 'Spread', preterite: 'Spread', pastParticiple: 'Spread', translation: 'Répandre / Diffuser', category: 'Action' },
  { infinitive: 'Steal', preterite: 'Stole', pastParticiple: 'Stolen', translation: 'Dérober / Voler', category: 'Justice' },
  { infinitive: 'Stick', preterite: 'Stuck', pastParticiple: 'Stuck', translation: 'Coller / Rester coincé', category: 'Matière' },
  { infinitive: 'Strike', preterite: 'Struck', pastParticiple: 'Struck', translation: 'Frapper / Déclencher', category: 'Action' },
  { infinitive: 'Sweep', preterite: 'Swept', pastParticiple: 'Swept', translation: 'Balayer', category: 'Action' },
  { infinitive: 'Swim', preterite: 'Swam', pastParticiple: 'Swum', translation: 'Nager', category: 'Sport' },
  { infinitive: 'Swing', preterite: 'Swung', pastParticiple: 'Swung', translation: 'Se balancer', category: 'Mouvement' },
  { infinitive: 'Tear', preterite: 'Tore', pastParticiple: 'Torn', translation: 'Déchirer', category: 'Action' },
  { infinitive: 'Throw', preterite: 'Threw', pastParticiple: 'Thrown', translation: 'Lancer / Jeter', category: 'Action' },
  { infinitive: 'Wake', preterite: 'Woke', pastParticiple: 'Woken', translation: 'Réveiller', category: 'Vie' },
  { infinitive: 'Bend', preterite: 'Bent', pastParticiple: 'Bent', translation: 'Courber / Plier', category: 'Corps' },
  { infinitive: 'Blow', preterite: 'Blew', pastParticiple: 'Blown', translation: 'Souffler', category: 'Vent' },
  { infinitive: 'Dig', preterite: 'Dug', pastParticiple: 'Dug', translation: 'Creuser', category: 'Terre' },
  { infinitive: 'Cost', preterite: 'Cost', pastParticiple: 'Cost', translation: 'Coûter', category: 'Commerce' },
  { infinitive: 'Draw', preterite: 'Drew', pastParticiple: 'Drawn', translation: 'Dessiner / Tirer', category: 'Art' }
];

// Banque Avancée (Nuances littéraires et académiques - 50 verbes)
export const VERB_MASTER_AVANCE_BANK: VerbMasterVerb[] = [
  { infinitive: 'Arise', preterite: 'Arose', pastParticiple: 'Arisen', translation: 'Survenir / Émerger', category: 'Philosophie' },
  { infinitive: 'Bear', preterite: 'Bore', pastParticiple: 'Borne', translation: 'Endurer / Porter', category: 'Vertus' },
  { infinitive: 'Behold', preterite: 'Beheld', pastParticiple: 'Beheld', translation: 'Contempler', category: 'Vision' },
  { infinitive: 'Beseech', preterite: 'Besought', pastParticiple: 'Besought', translation: 'Supplier', category: 'Rhétorique' },
  { infinitive: 'Bid', preterite: 'Bade / Bid', pastParticiple: 'Bidden / Bid', translation: 'Ordonner / Offrir', category: 'Action' },
  { infinitive: 'Breed', preterite: 'Bred', pastParticiple: 'Bred', translation: 'Engendrer / Élever', category: 'Nature' },
  { infinitive: 'Cling', preterite: 'Clung', pastParticiple: 'Clung', translation: 'S\'accrocher', category: 'Ténacité' },
  { infinitive: 'Dwell', preterite: 'Dwelt', pastParticiple: 'Dwelt', translation: 'Demeurer / Habiter', category: 'Lieu' },
  { infinitive: 'Flee', preterite: 'Fled', pastParticiple: 'Fled', translation: 'Fuir', category: 'Mouvement' },
  { infinitive: 'Forbid', preterite: 'Forbade', pastParticiple: 'Forbidden', translation: 'Interdire', category: 'Loi' },
  { infinitive: 'Foresee', preterite: 'Foresaw', pastParticiple: 'Foreseen', translation: 'Prévoir / Pressentir', category: 'Vision' },
  { infinitive: 'Forsake', preterite: 'Forsook', pastParticiple: 'Forsaken', translation: 'Abandonner', category: 'Destin' },
  { infinitive: 'Grind', preterite: 'Ground', pastParticiple: 'Ground', translation: 'Broyer / Moudre', category: 'Matière' },
  { infinitive: 'Kneel', preterite: 'Knelt', pastParticiple: 'Knelt', translation: 'S\'agenouiller', category: 'Corps' },
  { infinitive: 'Overcome', preterite: 'Overcame', pastParticiple: 'Overcome', translation: 'Surmonter / Triompher', category: 'Succès' },
  { infinitive: 'Overtake', preterite: 'Overtook', pastParticiple: 'Overtaken', translation: 'Dépasser / Rattraper', category: 'Course' },
  { infinitive: 'Plead', preterite: 'Pled / Pleaded', pastParticiple: 'Pled / Pleaded', translation: 'Plaider', category: 'Droit' },
  { infinitive: 'Prove', preterite: 'Proved', pastParticiple: 'Proven / Proved', translation: 'Prouver / Démontrer', category: 'Science' },
  { infinitive: 'Seek', preterite: 'Sought', pastParticiple: 'Sought', translation: 'Chercher / Quêter', category: 'Recherche' },
  { infinitive: 'Shed', preterite: 'Shed', pastParticiple: 'Shed', translation: 'Verser (larmes) / Répandre', category: 'Émotion' },
  { infinitive: 'Shrink', preterite: 'Shrank', pastParticiple: 'Shrunk', translation: 'Rétrécir / Reculer', category: 'Dimension' },
  { infinitive: 'Slay', preterite: 'Slew', pastParticiple: 'Slain', translation: 'Terrasser / Vaincre', category: 'Épopée' },
  { infinitive: 'Spin', preterite: 'Spun', pastParticiple: 'Spun', translation: 'Tournoyer / Filer', category: 'Mouvement' },
  { infinitive: 'Spring', preterite: 'Sprang', pastParticiple: 'Sprung', translation: 'Jaillir / Bondir', category: 'Énergie' },
  { infinitive: 'Stride', preterite: 'Strode', pastParticiple: 'Stridden', translation: 'Marcher à grands pas', category: 'Élégance' },
  { infinitive: 'Strive', preterite: 'Strove', pastParticiple: 'Striven', translation: 'S\'efforcer / Lutter', category: 'Excellence' },
  { infinitive: 'Swear', preterite: 'Swore', pastParticiple: 'Sworn', translation: 'Jurer / Prêter serment', category: 'Honneur' },
  { infinitive: 'Thrust', preterite: 'Thrust', pastParticiple: 'Thrust', translation: 'Pousser avec force', category: 'Action' },
  { infinitive: 'Tread', preterite: 'Trod', pastParticiple: 'Trodden', translation: 'Fouler aux pieds', category: 'Chemin' },
  { infinitive: 'Undergo', preterite: 'Underwent', pastParticiple: 'Undergone', translation: 'Subir / Éprouver', category: 'Épreuve' },
  { infinitive: 'Undertake', preterite: 'Undertook', pastParticiple: 'Undertaken', translation: 'Entreprendre', category: 'Projet' },
  { infinitive: 'Uphold', preterite: 'Upheld', pastParticiple: 'Upheld', translation: 'Soutenir / Défendre', category: 'Justice' },
  { infinitive: 'Weave', preterite: 'Wove', pastParticiple: 'Woven', translation: 'Tisser', category: 'Art' },
  { infinitive: 'Weep', preterite: 'Wept', pastParticiple: 'Wept', translation: 'Pleurer', category: 'Émotion' },
  { infinitive: 'Wind', preterite: 'Wound', pastParticiple: 'Wound', translation: 'Enrouler / Serpent', category: 'Mouvement' },
  { infinitive: 'Withdraw', preterite: 'Withdrew', pastParticiple: 'Withdrawn', translation: 'Retirer / Se replier', category: 'Stratégie' },
  { infinitive: 'Withhold', preterite: 'Withheld', pastParticiple: 'Withheld', translation: 'Retenir / Refuser', category: 'Droit' },
  { infinitive: 'Withstand', preterite: 'Withstood', pastParticiple: 'Withstood', translation: 'Résister à', category: 'Résilience' },
];

// Banque Expert (Verbes à forte valeur ajoutée, négociations et affaires - 20 verbes)
export const VERB_MASTER_EXPERT_BANK: VerbMasterVerb[] = [
  { infinitive: 'Appraise', preterite: 'Appraised', pastParticiple: 'Appraised', translation: 'Évaluer / Estimer', category: 'Affaires' },
  { infinitive: 'Advocate', preterite: 'Advocated', pastParticiple: 'Advocated', translation: 'Préconiser / Défendre', category: 'Rhétorique' },
  { infinitive: 'Broadcast', preterite: 'Broadcast', pastParticiple: 'Broadcast', translation: 'Diffuser / Émettre', category: 'Médias' },
  { infinitive: 'Cast', preterite: 'Cast', pastParticiple: 'Cast', translation: 'Jeter / Distribuer les rôles', category: 'Action' },
  { infinitive: 'Conceive', preterite: 'Conceived', pastParticiple: 'Conceived', translation: 'Concevoir / Imaginer', category: 'Création' },
  { infinitive: 'Consolidate', preterite: 'Consolidated', pastParticiple: 'Consolidated', translation: 'Renforcer / Consolider', category: 'Management' },
  { infinitive: 'Disclose', preterite: 'Disclosed', pastParticiple: 'Disclosed', translation: 'Divulguer / Révéler', category: 'Légalité' },
  { infinitive: 'Endeavor', preterite: 'Endeavored', pastParticiple: 'Endeavored', translation: 'S\'efforcer / Tenter', category: 'Action' },
  { infinitive: 'Envisage', preterite: 'Envisaged', pastParticiple: 'Envisaged', translation: 'Envisager / Prévoir', category: 'Vision' },
  { infinitive: 'Fulfill', preterite: 'Fulfilled', pastParticiple: 'Fulfilled', translation: 'Accomplir / Réaliser', category: 'Succès' },
  { infinitive: 'Incur', preterite: 'Incurred', pastParticiple: 'Incurred', translation: 'S\'exposer à / Subir', category: 'Affaires' },
  { infinitive: 'Mitigate', preterite: 'Mitigated', pastParticiple: 'Mitigated', translation: 'Atténuer / Tempérer', category: 'Stratégie' },
  { infinitive: 'Negotiate', preterite: 'Negotiated', pastParticiple: 'Negotiated', translation: 'Négocier', category: 'Commerce' },
  { infinitive: 'Perceive', preterite: 'Perceived', pastParticiple: 'Perceived', translation: 'Percevoir / Discerner', category: 'Sens' },
  { infinitive: 'Reconcile', preterite: 'Reconciled', pastParticiple: 'Reconciled', translation: 'Concilier / Rapprocher', category: 'Diplomatie' },
  { infinitive: 'Relinquish', preterite: 'Relinquished', pastParticiple: 'Relinquished', translation: 'Abandonner / Renoncer', category: 'Décision' },
  { infinitive: 'Surpass', preterite: 'Surpassed', pastParticiple: 'Surpassed', translation: 'Dépasser / Exceller', category: 'Prestige' },
  { infinitive: 'Thrive', preterite: 'Throve / Thrived', pastParticiple: 'Thriven / Thrived', translation: 'Prospérer / S\'épanouir', category: 'Succès' },
  { infinitive: 'Underwrite', preterite: 'Underwrote', pastParticiple: 'Underwritten', translation: 'Souscrire / Garantir', category: 'Finance' },
  { infinitive: 'Vindicate', preterite: 'Vindicated', pastParticiple: 'Vindicated', translation: 'Réhabiliter / Justifier', category: 'Justice' }
];

// Banque Expert Avancé (Verbes académiques, diplomatie et littérature - 15 verbes)
export const VERB_MASTER_EXPERT_AVANCE_BANK: VerbMasterVerb[] = [
  { infinitive: 'Articulate', preterite: 'Articulated', pastParticiple: 'Articulated', translation: 'Exprimer clairement', category: 'Éloquence' },
  { infinitive: 'Beget', preterite: 'Begot', pastParticiple: 'Begotten', translation: 'Engendrer / Générer', category: 'Origines' },
  { infinitive: 'Bereave', preterite: 'Bereft', pastParticiple: 'Bereft', translation: 'Priver / Dépouiller', category: 'Émotion' },
  { infinitive: 'Coerce', preterite: 'Coerced', pastParticiple: 'Coerced', translation: 'Contraindre / Forcer', category: 'Droit' },
  { infinitive: 'Delineate', preterite: 'Delineated', pastParticiple: 'Delineated', translation: 'Tracer / Décrire avec soin', category: 'Précision' },
  { infinitive: 'Dispel', preterite: 'Dispelled', pastParticiple: 'Dispelled', translation: 'Dissiper (doutes)', category: 'Esprit' },
  { infinitive: 'Elucidate', preterite: 'Elucidated', pastParticiple: 'Elucidated', translation: 'Élucider / Éclaircir', category: 'Savoir' },
  { infinitive: 'Engender', preterite: 'Engendered', pastParticiple: 'Engendered', translation: 'Susciter / Causer', category: 'Causalité' },
  { infinitive: 'Exemplify', preterite: 'Exemplified', pastParticiple: 'Exemplified', translation: 'Illustrer / Incarner', category: 'Rhétorique' },
  { infinitive: 'Extrapolate', preterite: 'Extrapolated', pastParticiple: 'Extrapolated', translation: 'Déduire / Extrapoler', category: 'Logique' },
  { infinitive: 'Galvanize', preterite: 'Galvanized', pastParticiple: 'Galvanized', translation: 'Électriser / Motiver', category: 'Leadership' },
  { infinitive: 'Instigate', preterite: 'Instigated', pastParticiple: 'Instigated', translation: 'Déclencher / Instiguer', category: 'Action' },
  { infinitive: 'Manifest', preterite: 'Manifested', pastParticiple: 'Manifested', translation: 'Manifester / Révéler', category: 'Présence' },
  { infinitive: 'Nullify', preterite: 'Nullified', pastParticiple: 'Nullified', translation: 'Annuler / Rendre caduc', category: 'Loi' },
  { infinitive: 'Propitiate', preterite: 'Propitiated', pastParticiple: 'Propitiated', translation: 'Se concilier / Apaiser', category: 'Diplomatie' }
];

// Banque Master (Verbes de haute distinction stylistique Oxford - 14 verbes)
export const VERB_MASTER_MASTER_BANK: VerbMasterVerb[] = [
  { infinitive: 'Ameliorate', preterite: 'Ameliorated', pastParticiple: 'Ameliorated', translation: 'Améliorer grandement', category: 'Excellence' },
  { infinitive: 'Assuage', preterite: 'Assuaged', pastParticiple: 'Assuaged', translation: 'Calmer / Adoucir', category: 'Sagesse' },
  { infinitive: 'Chasten', preterite: 'Chastened', pastParticiple: 'Chastened', translation: 'Assagir / Modérer', category: 'Caractère' },
  { infinitive: 'Corroborate', preterite: 'Corroborated', pastParticiple: 'Corroborated', translation: 'Confirmer / Étayer', category: 'Preuve' },
  { infinitive: 'Dissemble', preterite: 'Dissembled', pastParticiple: 'Dissembled', translation: 'Dissimuler / Feindre', category: 'Subtilité' },
  { infinitive: 'Embellish', preterite: 'Embellished', pastParticiple: 'Embellished', translation: 'Enjoliver / Embellir', category: 'Esthétique' },
  { infinitive: 'Eradicate', preterite: 'Eradicated', pastParticiple: 'Eradicated', translation: 'Éradiquer / Déraciner', category: 'Résolution' },
  { infinitive: 'Exacerbate', preterite: 'Exacerbated', pastParticiple: 'Exacerbated', translation: 'Aggraver / Envenimer', category: 'Tension' },
  { infinitive: 'Juxtapose', preterite: 'Juxtaposed', pastParticiple: 'Juxtaposed', translation: 'Juxtaposer / Confronter', category: 'Style' },
  { infinitive: 'Obviate', preterite: 'Obviated', pastParticiple: 'Obviated', translation: 'Parer à / Éviter', category: 'Stratégie' },
  { infinitive: 'Perpetuate', preterite: 'Perpetuated', pastParticiple: 'Perpetuated', translation: 'Perpétuer', category: 'Mémoire' },
  { infinitive: 'Prevaricate', preterite: 'Prevaricated', pastParticiple: 'Prevaricated', translation: 'Équivoquer / Tergiverser', category: 'Rhétorique' },
  { infinitive: 'Substantiate', preterite: 'Substantiated', pastParticiple: 'Substantiated', translation: 'Justifier par des faits', category: 'Science' },
  { infinitive: 'Transcend', preterite: 'Transcended', pastParticiple: 'Transcended', translation: 'Transcender / Dépasser', category: 'Élévation' }
];

export interface VerbMasterQuestion {
  questionNumber: number;
  totalQuestions: number;
  pairs: VerbMasterVerb[]; // Exactement 6 verbes (6 paires = 12 MOTS)
}

/**
 * Génère les séries de questions pour Verb Master (12 MOTS par question)
 * Débutant: 5 questions, Intermédiaire: 25 questions, Expert: 50 questions,
 * Expert Avancé: 70 questions, Master: 90 questions
 * Tirage aléatoire sans répétition
 */
export function generateVerbMasterQuestions(levelKey: VerbMasterLevelKey): VerbMasterQuestion[] {
  const config = VERB_MASTER_LEVELS[levelKey] || VERB_MASTER_LEVELS.debutant;

  let pool: VerbMasterVerb[] = [];
  if (levelKey === 'debutant') {
    pool = [...VERB_MASTER_DEBUTANT_BANK];
  } else if (levelKey === 'intermediaire') {
    pool = [...VERB_MASTER_INTERMEDIAIRE_BANK, ...VERB_MASTER_DEBUTANT_BANK];
  } else if (levelKey === 'expert') {
    pool = [...VERB_MASTER_EXPERT_BANK, ...VERB_MASTER_AVANCE_BANK, ...VERB_MASTER_INTERMEDIAIRE_BANK];
  } else if (levelKey === 'expert_avance') {
    pool = [...VERB_MASTER_EXPERT_AVANCE_BANK, ...VERB_MASTER_EXPERT_BANK, ...VERB_MASTER_AVANCE_BANK];
  } else {
    pool = [...VERB_MASTER_MASTER_BANK, ...VERB_MASTER_EXPERT_AVANCE_BANK, ...VERB_MASTER_EXPERT_BANK];
  }

  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const questions: VerbMasterQuestion[] = [];
  let poolIdx = 0;

  for (let q = 1; q <= config.questionsCount; q++) {
    const roundPairs: VerbMasterVerb[] = [];
    const usedInf = new Set<string>();

    while (roundPairs.length < config.pairsPerQuestion) {
      if (poolIdx >= shuffledPool.length) {
        shuffledPool.sort(() => Math.random() - 0.5);
        poolIdx = 0;
      }
      const candidate = shuffledPool[poolIdx];
      poolIdx++;

      if (!usedInf.has(candidate.infinitive)) {
        usedInf.add(candidate.infinitive);
        roundPairs.push(candidate);
      }
    }

    questions.push({
      questionNumber: q,
      totalQuestions: config.questionsCount,
      pairs: roundPairs
    });
  }

  return questions;
}

// Rétrocompatibilité avec l'ancien composant
export const VERB_MASTER_ITEMS = [
  {
    infinitive: 'Go',
    translation: 'Aller',
    preteriteOptions: ['Went', 'Goed', 'Gone'],
    preteriteCorrect: 'Went',
    participleOptions: ['Gone', 'Went', 'Going'],
    participleCorrect: 'Gone'
  },
  {
    infinitive: 'See',
    translation: 'Voir',
    preteriteOptions: ['Saw', 'Seen', 'Seed'],
    preteriteCorrect: 'Saw',
    participleOptions: ['Seen', 'Saw', 'Seeing'],
    participleCorrect: 'Seen'
  }
];

// =====================================================================
// ASTRO HANGMAN (Mini-Jeu n°5) — Pendu Cosmique • 5 Niveaux • 12 Mots par Question
// Débutant (5 questions), Intermédiaire (25 questions), Expert (50 questions),
// Expert Avancé (70 questions), Master (90 questions)
// =====================================================================

export type AstroHangmanLevelKey = 'debutant' | 'intermediaire' | 'expert' | 'expert_avance' | 'master';

export interface AstroHangmanWord {
  word: string;
  translation: string;
  hint: string;
  category?: string;
}

export interface AstroHangmanQuestion {
  questionNumber: number;
  totalQuestions: number;
  words: AstroHangmanWord[]; // Exactement 12 mots par question
}

export interface AstroHangmanLevelInfo {
  id: AstroHangmanLevelKey;
  label: string;
  subtitle: string;
  requiredPlayerLevel: number;
  questionsCount: number; // 5, 25, 50, 70, 90
  wordsPerQuestion: number; // 12 mots par question
  timePerWordLimited: number;
  xpReward: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  description: string;
}

export const ASTRO_HANGMAN_LEVELS: Record<AstroHangmanLevelKey, AstroHangmanLevelInfo> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    subtitle: '5 Questions • 12 Mots par question (60 mots)',
    requiredPlayerLevel: 1,
    questionsCount: 5,
    wordsPerQuestion: 12,
    timePerWordLimited: 55,
    xpReward: 40,
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    icon: 'sentiment_satisfied',
    description: '5 questions de 12 mots (60 mots au total). Espace, ciel, nature et objets du quotidien.'
  },
  intermediaire: {
    id: 'intermediaire',
    label: 'Intermédiaire',
    subtitle: '25 Questions • 12 Mots par question (300 mots)',
    requiredPlayerLevel: 11,
    questionsCount: 25,
    wordsPerQuestion: 12,
    timePerWordLimited: 50,
    xpReward: 90,
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    icon: 'speed',
    description: '25 questions de 12 mots (300 mots au total). Vaisseaux, instruments, exploration et sciences.'
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    subtitle: '50 Questions • 12 Mots par question (600 mots)',
    requiredPlayerLevel: 21,
    questionsCount: 50,
    wordsPerQuestion: 12,
    timePerWordLimited: 45,
    xpReward: 180,
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-400',
    icon: 'workspace_premium',
    description: '50 questions de 12 mots (600 mots au total). Phénomènes cosmiques, physique et navigation orbitale.'
  },
  expert_avance: {
    id: 'expert_avance',
    label: 'Expert Avancé',
    subtitle: '70 Questions • 12 Mots par question (840 mots)',
    requiredPlayerLevel: 31,
    questionsCount: 70,
    wordsPerQuestion: 12,
    timePerWordLimited: 40,
    xpReward: 300,
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-400',
    icon: 'diamond',
    description: '70 questions de 12 mots (840 mots au total). Astrophysique théorique, haute technologie et lexique érudit.'
  },
  master: {
    id: 'master',
    label: 'Master',
    subtitle: '90 Questions • 12 Mots par question (1 080 mots)',
    requiredPlayerLevel: 51,
    questionsCount: 90,
    wordsPerQuestion: 12,
    timePerWordLimited: 35,
    xpReward: 500,
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    icon: 'military_tech',
    description: '90 questions de 12 mots (1 080 mots au total). Cosmologie de pointe et maîtrise suprême du vocabulaire Oxford.'
  }
};

// Banques lexicales volumineuses pour renouvellement sans répétition
export const ASTRO_HANGMAN_DEBUTANT_BANK: AstroHangmanWord[] = [
  { word: 'STAR', translation: 'Étoile', hint: 'Astre scintillant dans la voûte céleste nocturne', category: 'Astronomie' },
  { word: 'MOON', translation: 'Lune', hint: 'Satellite naturel qui illumine nos nuits terrestres', category: 'Astronomie' },
  { word: 'SUN', translation: 'Soleil', hint: 'Étoile centrale de notre système qui nous chauffe', category: 'Astronomie' },
  { word: 'EARTH', translation: 'Terre', hint: 'Notre planète bleue berceau de la vie', category: 'Astronomie' },
  { word: 'ROCKET', translation: 'Fusée', hint: 'Engin spatial propulsé vers les étoiles', category: 'Engins' },
  { word: 'ORBIT', translation: 'Orbite', hint: 'Trajectoire circulaire fermée autour d\'un astre', category: 'Physique' },
  { word: 'PLANET', translation: 'Planète', hint: 'Grand corps céleste gravitant autour du soleil', category: 'Astronomie' },
  { word: 'SKY', translation: 'Ciel', hint: 'Voûte visible au-dessus de nos têtes', category: 'Nature' },
  { word: 'LIGHT', translation: 'Lumière', hint: 'Rayonnement visible qui éclaire les ténèbres', category: 'Physique' },
  { word: 'COMET', translation: 'Comète', hint: 'Boule de glace céleste avec une traînée lumineuse', category: 'Astronomie' },
  { word: 'SPACE', translation: 'Espace', hint: 'Étendue infinie au-delà de l\'atmosphère', category: 'Cosmos' },
  { word: 'NIGHT', translation: 'Nuit', hint: 'Période d\'obscurité entre coucher et lever du soleil', category: 'Temps' },
  { word: 'CLOUD', translation: 'Nuage', hint: 'Amas de gouttelettes flottant dans l\'air', category: 'Météo' },
  { word: 'WATER', translation: 'Eau', hint: 'Liquide vital indispensable à la vie extraterrestre', category: 'Éléments' },
  { word: 'FIRE', translation: 'Feu', hint: 'Flammes incandescentes des moteurs spatiaux', category: 'Éléments' },
  { word: 'WIND', translation: 'Vent', hint: 'Courant de gaz soufflant dans l\'atmosphère', category: 'Météo' },
  { word: 'DUST', translation: 'Poussière', hint: 'Grains minuscules formant les anneaux cosmiques', category: 'Matière' },
  { word: 'LASER', translation: 'Laser', hint: 'Faisceau lumineux rectiligne ultra-concentré', category: 'Technologie' },
  { word: 'ROBOT', translation: 'Robot', hint: 'Machine automatique explorant le sol martien', category: 'Technologie' },
  { word: 'ALIEN', translation: 'Extraterrestre', hint: 'Être hypothétique venu d\'un autre monde', category: 'Science-Fiction' },
  { word: 'SPEED', translation: 'Vitesse', hint: 'Allure à laquelle se déplace un vaisseau', category: 'Physique' },
  { word: 'FLASH', translation: 'Éclair', hint: 'Brève lueur vive et soudaine', category: 'Optique' },
  { word: 'RADIO', translation: 'Radio', hint: 'Ondes captées par les antennes terrestres', category: 'Télécoms' },
  { word: 'RADAR', translation: 'Radar', hint: 'Appareil qui détecte la position des débris', category: 'Navigation' },
  { word: 'PILOT', translation: 'Pilote', hint: 'Commandant aux commandes de la navette', category: 'Métiers' },
  { word: 'HERO', translation: 'Héros', hint: 'Pionnier courageux explorant l\'inconnu', category: 'Caractère' },
  { word: 'TEAM', translation: 'Équipe', hint: 'Groupe soudé préparant la mission spatiale', category: 'Coopération' },
  { word: 'DREAM', translation: 'Rêve', hint: 'Aspiration poétique à toucher les étoiles', category: 'Poésie' },
  { word: 'METAL', translation: 'Métal', hint: 'Alliage robuste du blindage orbital', category: 'Matériaux' },
  { word: 'GLASS', translation: 'Verre', hint: 'Hublot blindé offrant une vue sur la Terre', category: 'Matériaux' },
  { word: 'POWER', translation: 'Puissance', hint: 'Force motrice phénoménale au décollage', category: 'Énergie' },
  { word: 'SYSTEM', translation: 'Système', hint: 'Ensemble coordonné d\'éléments en synergie', category: 'Ingénierie' },
  { word: 'ENGINE', translation: 'Moteur', hint: 'Propulseur brûlant le carburant spatial', category: 'Mécanique' },
  { word: 'SOLAR', translation: 'Solaire', hint: 'Relatif au rayonnement de notre étoile', category: 'Énergie' },
  { word: 'LUNAR', translation: 'Lunaire', hint: 'Qui se rapporte au sol et à l\'orbite de la Lune', category: 'Espace' },
  { word: 'SUIT', translation: 'Combinaison', hint: 'Tenue pressurisée pour survivre dans le vide', category: 'Équipement' },
  { word: 'MASK', translation: 'Masque', hint: 'Protection respiratoire faciale de cosmonaute', category: 'Sécurité' },
  { word: 'TANK', translation: 'Réservoir', hint: 'Bonbonne contenant les réserves d\'oxygène', category: 'Équipement' },
  { word: 'OXYGEN', translation: 'Oxygène', hint: 'Gaz vital maintenu dans la cabine de vol', category: 'Chimie' },
  { word: 'FORCE', translation: 'Force', hint: 'Interaction poussant ou retenant un corps', category: 'Physique' },
  { word: 'BEAM', translation: 'Rayon', hint: 'Ligne d\'ondes lumineuses traversant le vide', category: 'Optique' },
  { word: 'LAUNCH', translation: 'Lancement', hint: 'Mise à feu et départ solennel du lanceur', category: 'Mission' },
  { word: 'LAND', translation: 'Atterrir', hint: 'Poser délicatement les pieds sur Mars ou la Lune', category: 'Manœuvre' },
  { word: 'SAFE', translation: 'En sécurité', hint: 'Mission sans avarie ni perte de pression', category: 'Statut' },
  { word: 'SIGNAL', translation: 'Signal', hint: 'Bip électromagnétique transmis vers la Terre', category: 'Communication' }
];

export const ASTRO_HANGMAN_INTERMEDIAIRE_BANK: AstroHangmanWord[] = [
  { word: 'GALAXY', translation: 'Galaxie', hint: 'Gigantesque ensemble spiralé de milliards d\'étoiles', category: 'Cosmologie' },
  { word: 'ASTRONAUT', translation: 'Astronaute', hint: 'Explorateur qualifié pour voyager dans le cosmos', category: 'Métiers' },
  { word: 'GRAVITY', translation: 'Gravité', hint: 'Attraction invisible maintenant les astres en orbite', category: 'Physique' },
  { word: 'SATELLITE', translation: 'Satellite', hint: 'Sonde artificielle en orbite pour les transmissions', category: 'Technologie' },
  { word: 'ECLIPSE', translation: 'Éclipse', hint: 'Occultation totale ou partielle d\'un astre par un autre', category: 'Phénomènes' },
  { word: 'TELESCOPE', translation: 'Télescope', hint: 'Instrument optique pointé vers les confins de l\'univers', category: 'Optique' },
  { word: 'UNIVERSE', translation: 'Univers', hint: 'Ensemble de toute la matière, l\'énergie et l\'espace', category: 'Cosmos' },
  { word: 'METEOR', translation: 'Météore', hint: 'Étoile filante se désintégrant dans l\'atmosphère', category: 'Astronomie' },
  { word: 'SHUTTLE', translation: 'Navette', hint: 'Véhicule spatial réutilisable pouvant revenir sur Terre', category: 'Vaisseaux' },
  { word: 'MISSION', translation: 'Mission', hint: 'Objectif scientifique assigné à l\'équipage', category: 'Expédition' },
  { word: 'CAPSULE', translation: 'Capsule', hint: 'Module habitable rentrant dans l\'atmosphère sous parachute', category: 'Vaisseaux' },
  { word: 'STATION', translation: 'Station', hint: 'Grand avant-poste spatial permanent en orbite basse', category: 'Infrastructures' },
  { word: 'VOYAGER', translation: 'Voyageur', hint: 'Sonde pionnière ayant quitté notre système solaire', category: 'Historique' },
  { word: 'NEBULA', translation: 'Nébuleuse', hint: 'Nuage interstellaire coloré où naissent de nouvelles étoiles', category: 'Astrophysique' },
  { word: 'CRATER', translation: 'Cratère', hint: 'Dépression circulaire causée par l\'impact d\'une météorite', category: 'Géologie' },
  { word: 'HORIZON', translation: 'Horizon', hint: 'Limite visible de la courbure planétaire', category: 'Géométrie' },
  { word: 'ALTITUDE', translation: 'Altitude', hint: 'Hauteur mesurée au-dessus du niveau de référence', category: 'Navigation' },
  { word: 'VELOCITY', translation: 'Vélocité', hint: 'Vitesse de déplacement d\'une sonde dans l\'espace', category: 'Cinématique' },
  { word: 'PRESSURE', translation: 'Pression', hint: 'Force exercée par l\'air sur les parois du module', category: 'Physique' },
  { word: 'HELMET', translation: 'Casque', hint: 'Bulle protectrice transparente de la combinaison', category: 'Équipement' },
  { word: 'CIRCUIT', translation: 'Circuit', hint: 'Chemin électronique alimentant les processeurs de bord', category: 'Électronique' },
  { word: 'MODULE', translation: 'Module', hint: 'Compartiment autonome détachable du vaisseau', category: 'Structure' },
  { word: 'ANTENNA', translation: 'Antenne', hint: 'Dispositif parabolique orienté vers le centre de contrôle', category: 'Télécoms' },
  { word: 'EXPLORER', translation: 'Explorateur', hint: 'Vaisseau envoyé cartographier des mondes vierges', category: 'Exploration' },
  { word: 'SENSOR', translation: 'Capteur', hint: 'Organe de mesure détectant la chaleur et les radiations', category: 'Instrumentation' },
  { word: 'BOOSTER', translation: 'Propulseur', hint: 'Étage d\'appoint délivrant la poussée initiale', category: 'Propulsion' },
  { word: 'AIRLOCK', translation: 'Sas spatial', hint: 'Chambre pressurisée permettant la sortie extravéhiculaire', category: 'Sécurité' },
  { word: 'LANDER', translation: 'Atterrisseur', hint: 'Véhicule se posant en douceur sur la surface lunaire', category: 'Robots' },
  { word: 'ORBITER', translation: 'Orbiteur', hint: 'Sonde restant en orbite pour scanner la planète', category: 'Vaisseaux' },
  { word: 'MATRIX', translation: 'Matrice', hint: 'Réseau informatique régulant les paramètres de survie', category: 'Informatique' },
  { word: 'PARTICLE', translation: 'Particule', hint: 'Élément infime composant le vent solaire', category: 'Physique' },
  { word: 'DOCKING', translation: 'Amarrage', hint: 'Jonction millimétrée entre deux vaisseaux en apesanteur', category: 'Manœuvre' },
  { word: 'ASTEROID', translation: 'Astéroïde', hint: 'Rocher spatial gravitant dans la ceinture principale', category: 'Astronomie' },
  { word: 'MAGNET', translation: 'Aimant', hint: 'Corps créant un champ d\'attraction magnétique', category: 'Magnétisme' },
  { word: 'ATMOSPHERE', translation: 'Atmosphère', hint: 'Manteau gazeux retenant l\'air respirable', category: 'Planétologie' }
];

export const ASTRO_HANGMAN_EXPERT_BANK: AstroHangmanWord[] = [
  { word: 'SUPERNOVA', translation: 'Supernova', hint: 'Explosion cataclysmique marquant la mort d\'une étoile massive', category: 'Astrophysique' },
  { word: 'BLACKHOLE', translation: 'Trou noir', hint: 'Zone d\'effondrement gravitationnel d\'où rien ne peut s\'échapper', category: 'Relativité' },
  { word: 'INTERSTELLAR', translation: 'Interstellaire', hint: 'Situé dans le gouffre béant séparant deux systèmes stellaires', category: 'Cosmos' },
  { word: 'EXOPLANET', translation: 'Exoplanète', hint: 'Monde orbitant autour d\'une autre étoile que le Soleil', category: 'Planétologie' },
  { word: 'CONSTELLATION', translation: 'Constellation', hint: 'Figure géométrique imaginaire formée par des étoiles lointaines', category: 'Cartographie' },
  { word: 'PROPULSION', translation: 'Propulsion', hint: 'Système d\'éjection de masse produisant une poussée réactive', category: 'Aérospatiale' },
  { word: 'OBSERVATORY', translation: 'Observatoire', hint: 'Dôme scientifique perché au sommet d\'une montagne dégagée', category: 'Recherche' },
  { word: 'WAVELENGTH', translation: 'Longueur d\'onde', hint: 'Distance entre deux crêtes successives d\'un rayonnement', category: 'Spectroscopie' },
  { word: 'RADIATION', translation: 'Radiation', hint: 'Émission d\'énergie sous forme d\'ondes électromagnétiques', category: 'Physique' },
  { word: 'SINGULARITY', translation: 'Singularité', hint: 'Point de densité infinie au cœur d\'un trou noir', category: 'Cosmologie' },
  { word: 'RELATIVITY', translation: 'Relativité', hint: 'Théorie d\'Einstein unissant l\'espace et le temps', category: 'Théorie' },
  { word: 'THERMODYNAMICS', translation: 'Thermodynamique', hint: 'Science régissant les échanges de chaleur et d\'énergie', category: 'Physique' },
  { word: 'CRYOGENIC', translation: 'Cryogénique', hint: 'Carburant maintenu à des températures proches du zéro absolu', category: 'Chimie' },
  { word: 'LUMINOSITY', translation: 'Luminosité', hint: 'Quantité totale d\'énergie rayonnée par un astre chaque seconde', category: 'Astrophysique' },
  { word: 'SPECTROGRAPH', translation: 'Spectrographe', hint: 'Outil décomposant la lumière stellaire en raies colorées', category: 'Analyse' },
  { word: 'CORONA', translation: 'Couronne solaire', hint: 'Halo de plasma incandescent entourant le Soleil', category: 'Astrophysique' },
  { word: 'QUASAR', translation: 'Quasar', hint: 'Noyau galactique actif ultra-lumineux alimenté par un trou noir', category: 'Astrophysique' },
  { word: 'PULSAR', translation: 'Pulsar', hint: 'Étoile à neutrons émettant des impulsions radio régulières', category: 'Astrophysique' },
  { word: 'COSMOLOGY', translation: 'Cosmologie', hint: 'Étude scientifique de l\'origine et de l\'évolution de l\'univers', category: 'Sciences' },
  { word: 'TELEMETRY', translation: 'Télémétrie', hint: 'Collecte et transmission à distance de données de bord', category: 'Télécoms' },
  { word: 'CENTRIFUGE', translation: 'Centrifugeuse', hint: 'Appareil reproduisant les fortes accélérations terrestres', category: 'Entraînement' },
  { word: 'APOGEE', translation: 'Apogée', hint: 'Point le plus éloigné de la Terre sur une orbite elliptique', category: 'Orbites' },
  { word: 'PERIGEE', translation: 'Périgée', hint: 'Point le plus rapproché de la Terre sur une trajectoire orbitale', category: 'Orbites' },
  { word: 'EQUINOX', translation: 'Équinoxe', hint: 'Jour où la durée du jour est strictement égale à la nuit', category: 'Calendrier' },
  { word: 'SOLSTICE', translation: 'Solstice', hint: 'Moment où le Soleil atteint sa plus forte déclinaison', category: 'Saisons' },
  { word: 'PROTOSTAR', translation: 'Protoétoile', hint: 'Masse dense de gaz en contraction avant l\'allumage nucléaire', category: 'Évolution' },
  { word: 'MAGNETAR', translation: 'Magnétar', hint: 'Étoile à neutrons dotée d\'un champ magnétique colossale', category: 'Astrophysique' },
  { word: 'CELESTIAL', translation: 'Céleste', hint: 'Qui appartient à la beauté sublime du ciel et des astres', category: 'Poétique' },
  { word: 'ASTROMETRY', translation: 'Astrométrie', hint: 'Mesure minutieuse de la position et des mouvements stellaires', category: 'Sciences' },
  { word: 'COSMONAUT', translation: 'Cosmonaute', hint: 'Pilote spatial selon l\'appellation de l\'agence russe', category: 'Pionniers' }
];

export const ASTRO_HANGMAN_EXPERT_AVANCE_BANK: AstroHangmanWord[] = [
  { word: 'ASTROPHYSICS', translation: 'Astrophysique', hint: 'Branche de la physique étudiant les propriétés des astres', category: 'Sciences' },
  { word: 'ELECTROMAGNETISM', translation: 'Électromagnétisme', hint: 'Interaction unifiant électricité et magnétisme', category: 'Fondamental' },
  { word: 'THERMONUCLEAR', translation: 'Thermonucléaire', hint: 'Réaction de fusion libérant l\'énergie au cœur des étoiles', category: 'Nucléaire' },
  { word: 'NUCLEOSYNTHESIS', translation: 'Nucléosynthèse', hint: 'Création des éléments chimiques lourds lors des supernovas', category: 'Chimie' },
  { word: 'INTERGALACTIC', translation: 'Intergalactique', hint: 'Qui se déploie à travers les immensités entre galaxies', category: 'Échelle' },
  { word: 'MICROGRAVITY', translation: 'Microgravité', hint: 'État d\'apesanteur presque parfaite ressentie en orbite', category: 'Physique' },
  { word: 'MULTIVERSE', translation: 'Multivers', hint: 'Hypothèse d\'une infinité d\'univers parallèles coexistants', category: 'Théorie' },
  { word: 'BIOASTRONAUTICS', translation: 'Bioastronautique', hint: 'Étude des réactions biologiques humaines aux vols spatiaux', category: 'Médecine' },
  { word: 'EXOBIOLOGY', translation: 'Exobiologie', hint: 'Recherche de traces de vie organique sur d\'autres mondes', category: 'Biologie' },
  { word: 'COSMOCHEMISTRY', translation: 'Cosmochimie', hint: 'Analyse chimique de la matière cométaire et météoritique', category: 'Chimie' },
  { word: 'PERTURBATION', translation: 'Perturbation', hint: 'Légère déviation gravitationnelle d\'une orbite planétaire', category: 'Mécanique' },
  { word: 'TELEPORTATION', translation: 'Téléportation', hint: 'Transfert instantané d\'états quantiques à distance', category: 'Quantique' },
  { word: 'NANOTECHNOLOGY', translation: 'Nanotechnologie', hint: 'Manipulation de la matière à l\'échelle atomique pour les sondes', category: 'High-Tech' },
  { word: 'SUPERCONDUCTIVITY', translation: 'Supraconductivité', hint: 'Disparition de toute résistance électrique à froid extrême', category: 'Physique' },
  { word: 'EXOSPHERIC', translation: 'Exosphérique', hint: 'Relatif à la couche la plus externe et ténue de l\'atmosphère', category: 'Couches' },
  { word: 'SPATIOTEMPORAL', translation: 'Spatiotemporel', hint: 'Qui combine intimement les dimensions d\'espace et de temps', category: 'Relativité' },
  { word: 'DECOHERENCE', translation: 'Décohérence', hint: 'Perte des propriétés quantiques d\'un système au contact du milieu', category: 'Quantique' },
  { word: 'SPECTROMETER', translation: 'Spectromètre', hint: 'Appareil analysant la composition chimique par réfraction', category: 'Appareillage' },
  { word: 'RECOMBINATION', translation: 'Recombinaison', hint: 'Époque où les premiers atomes neutres se formèrent après le Big Bang', category: 'Origines' },
  { word: 'BARYOGENESIS', translation: 'Baryogenèse', hint: 'Asymétrie primordiale ayant permis à la matière de l\'emporter', category: 'Origines' }
];

export const ASTRO_HANGMAN_MASTER_BANK: AstroHangmanWord[] = [
  { word: 'CONSCIOUSNESS', translation: 'Conscience', hint: 'Perception lucide de sa place dans l\'harmonie cosmique', category: 'Philosophie' },
  { word: 'TRANSCENDENTAL', translation: 'Transcendantal', hint: 'Qui dépasse l\'expérience commune et touche à l\'universel', category: 'Métaphysique' },
  { word: 'ANISOTROPY', translation: 'Anisotropie', hint: 'Variations infimes de température dans le fond diffus cosmologique', category: 'Mesures' },
  { word: 'QUINTESSENCE', translation: 'Quintessence', hint: 'Hypothèse d\'une forme dynamique d\'énergie noire répulsive', category: 'Cosmologie' },
  { word: 'ENTANGLEMENT', translation: 'Intrication quantique', hint: 'Liaison instantanée de deux particules séparées par des années-lumière', category: 'Quantique' },
  { word: 'INTERFEROMETRY', translation: 'Interférométrie', hint: 'Combinaison de signaux de multiples télescopes pour un rendu géant', category: 'Instruments' },
  { word: 'SUPERSYMMETRY', translation: 'Supersymétrie', hint: 'Théorie unifiant fermions et bosons par des particules miroirs', category: 'Particules' },
  { word: 'GRAVITOMAGNETISM', translation: 'Gravitomagnétisme', hint: 'Effet relativiste d\'entraînement de l\'espace par un corps en rotation', category: 'Relativité' },
  { word: 'SPATIOTEMPORALITY', translation: 'Spatiotemporalité', hint: 'Nature inséparable de la trame quadridimensionnelle cosmique', category: 'Physique' },
  { word: 'CHROMODYNAMICS', translation: 'Chromodynamique', hint: 'Théorie de l\'interaction forte liant les quarks au sein des protons', category: 'Théorie' },
  { word: 'ELECTRODYNAMICS', translation: 'Électrodynamique', hint: 'Description quantique des interactions entre lumière et matière', category: 'Fondamental' },
  { word: 'EXTRAORDINARY', translation: 'Extraordinaire', hint: 'Qui surpasse l\'imagination et transcende le réel', category: 'Vocabulaire' },
  { word: 'SOPHISTICATED', translation: 'Sophistiqué', hint: 'D\'une ingénierie extrêmement raffinée et complexe', category: 'Élégance' },
  { word: 'CONTEMPLATION', translation: 'Contemplation', hint: 'Observation sereine et émerveillée de la voûte étoilée', category: 'Spiritualité' },
  { word: 'EXTRAVEHICULAR', translation: 'Extravéhiculaire', hint: 'Sortie d\'un cosmonaute dans le vide en dehors du vaisseau', category: 'Activités' },
  { word: 'AUTHENTICITY', translation: 'Authenticité', hint: 'Vérité pure et rigueur scientifique irréprochable', category: 'Valeurs' },
  { word: 'MAGNIFICENT', translation: 'Magnifique', hint: 'D\'une splendeur grandiose coupant le souffle', category: 'Esthétique' },
  { word: 'ILLUMINATION', translation: 'Illumination', hint: 'Clarté soudaine de l\'esprit devant une découverte majeure', category: 'Savoir' },
  { word: 'RESILIENCE', translation: 'Résilience', hint: 'Capacité d\'un système autonome à surmonter les avaries', category: 'Robustesse' }
];

/**
 * Générateur dynamique de questions Astro Hangman non-répétitives :
 * Chaque question contient rigoureusement 12 MOTS (60, 300, 600, 840, ou 1080 mots selon le niveau).
 */
export function generateAstroHangmanQuestions(levelKey: AstroHangmanLevelKey): AstroHangmanQuestion[] {
  const config = ASTRO_HANGMAN_LEVELS[levelKey] || ASTRO_HANGMAN_LEVELS.debutant;

  let pool: AstroHangmanWord[];
  if (levelKey === 'debutant') {
    pool = [...ASTRO_HANGMAN_DEBUTANT_BANK];
  } else if (levelKey === 'intermediaire') {
    pool = [...ASTRO_HANGMAN_INTERMEDIAIRE_BANK, ...ASTRO_HANGMAN_DEBUTANT_BANK];
  } else if (levelKey === 'expert') {
    pool = [...ASTRO_HANGMAN_EXPERT_BANK, ...ASTRO_HANGMAN_INTERMEDIAIRE_BANK];
  } else if (levelKey === 'expert_avance') {
    pool = [...ASTRO_HANGMAN_EXPERT_AVANCE_BANK, ...ASTRO_HANGMAN_EXPERT_BANK];
  } else {
    pool = [...ASTRO_HANGMAN_MASTER_BANK, ...ASTRO_HANGMAN_EXPERT_AVANCE_BANK];
  }

  const questions: AstroHangmanQuestion[] = [];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  let poolIdx = 0;

  for (let q = 1; q <= config.questionsCount; q++) {
    const roundWords: AstroHangmanWord[] = [];
    const usedWords = new Set<string>();

    while (roundWords.length < config.wordsPerQuestion) {
      if (poolIdx >= shuffledPool.length) {
        shuffledPool.sort(() => Math.random() - 0.5);
        poolIdx = 0;
      }
      const candidate = shuffledPool[poolIdx];
      poolIdx++;

      if (!usedWords.has(candidate.word)) {
        usedWords.add(candidate.word);
        roundWords.push(candidate);
      }
    }

    questions.push({
      questionNumber: q,
      totalQuestions: config.questionsCount,
      words: roundWords
    });
  }

  return questions;
}

// Rétrocompatibilité avec l'ancienne référence
export const HANGMAN_WORDS = [
  { word: 'PLANET', hint: 'Corps céleste en orbite autour d\'une étoile' },
  { word: 'GALAXY', hint: 'Immense ensemble d\'étoiles et de systèmes' },
  { word: 'ROCKET', hint: 'Véhicule propulsé pour voyager dans l\'espace' },
  { word: 'ORBIT', hint: 'Trajectoire circulaire autour d\'un astre' },
  { word: 'ASTRONAUT', hint: 'Explorateur qui voyage au-delà de la Terre' }
];

export const SENTENCE_BUILDER_ITEMS = [
  {
    french: 'Elle écoute de la musique tous les jours.',
    targetTokens: ['She', 'listens', 'to', 'music', 'every', 'day.'],
    distractors: ['hear', 'he', 'daily']
  },
  {
    french: 'J\'aime lire des livres intéressants.',
    targetTokens: ['I', 'like', 'reading', 'interesting', 'books.'],
    distractors: ['book', 'readed', 'am']
  },
  {
    french: 'Ils habitent dans une grande maison à Londres.',
    targetTokens: ['They', 'live', 'in', 'a', 'big', 'house', 'in', 'London.'],
    distractors: ['lives', 'home', 'on']
  },
  {
    french: 'Nous prenons le train pour aller à l\'école.',
    targetTokens: ['We', 'take', 'the', 'train', 'to', 'go', 'to', 'school.'],
    distractors: ['takes', 'by', 'going']
  }
];

export const AUDIO_BLITZ_ITEMS = [
  {
    audioText: 'Good morning, how are you today?',
    options: [
      'Good morning, how are you today?',
      'Good evening, who are you today?',
      'Good morning, how old are you today?'
    ],
    correctIndex: 0
  },
  {
    audioText: 'I would like a glass of water, please.',
    options: [
      'I will look at a glass of water, please.',
      'I would like a glass of water, please.',
      'I would love a cup of tea, please.'
    ],
    correctIndex: 1
  },
  {
    audioText: 'Where is the nearest train station?',
    options: [
      'When is the next bus arriving?',
      'Where is the newest train station?',
      'Where is the nearest train station?'
    ],
    correctIndex: 2
  },
  {
    audioText: 'She enjoys playing basketball with friends.',
    options: [
      'She enjoys playing basketball with friends.',
      'She hates playing basketball at school.',
      'She enjoys playing football with brothers.'
    ],
    correctIndex: 0
  }
];

export const ANTONYM_SYNONYM_ITEMS = [
  {
    type: 'SYNONYME',
    target: 'Huge',
    options: ['Gigantic', 'Tiny', 'Slow', 'Dark'],
    correct: 'Gigantic',
    explanation: '"Huge" et "Gigantic" signifient tous deux immense / gigantesque.'
  },
  {
    type: 'ANTONYME',
    target: 'Ancient',
    options: ['Modern', 'Old', 'Historic', 'Antique'],
    correct: 'Modern',
    explanation: 'L\'antonyme d\'Ancien (Ancient) est Moderne (Modern).'
  },
  {
    type: 'SYNONYME',
    target: 'Clever',
    options: ['Smart', 'Foolish', 'Noisy', 'Boring'],
    correct: 'Smart',
    explanation: '"Clever" et "Smart" désignent tous deux quelqu\'un d\'intelligent / rusé.'
  },
  {
    type: 'ANTONYME',
    target: 'Dangerous',
    options: ['Safe', 'Risky', 'Harmful', 'Wild'],
    correct: 'Safe',
    explanation: 'L\'opposé de Dangereux (Dangerous) est Sûr / En sécurité (Safe).'
  }
];

export const ODD_ONE_OUT_ITEMS = [
  {
    words: ['Apple', 'Banana', 'Carrot', 'Orange'],
    odd: 'Carrot',
    reason: '"Carrot" est un légume (vegetable), alors que les trois autres sont des fruits.'
  },
  {
    words: ['Walk', 'Run', 'Sleep', 'Jump'],
    odd: 'Sleep',
    reason: '"Sleep" exprime l\'inaction / le repos, tandis que les trois autres sont des verbes de mouvement actif.'
  },
  {
    words: ['Monday', 'Summer', 'Wednesday', 'Friday'],
    odd: 'Summer',
    reason: '"Summer" est une saison de l\'année, tandis que les trois autres sont des jours de la semaine.'
  },
  {
    words: ['Doctor', 'Nurse', 'Guitar', 'Teacher'],
    odd: 'Guitar',
    reason: '"Guitar" est un instrument de musique, alors que les trois autres sont des métiers.'
  }
];

export const FILL_THE_BLANK_ITEMS = [
  {
    sentence: 'I always wake up ___ 7 o\'clock in the morning.',
    options: ['at', 'on', 'in', 'to'],
    correct: 'at',
    rule: 'On utilise TOUJOURS la préposition "AT" devant les heures précises (at 7 o\'clock).'
  },
  {
    sentence: 'My birthday is ___ July 14th.',
    options: ['on', 'in', 'at', 'by'],
    correct: 'on',
    rule: 'On utilise "ON" devant une date complète ou un jour de la semaine (on Monday, on July 14th).'
  },
  {
    sentence: 'London is located ___ England.',
    options: ['in', 'at', 'on', 'to'],
    correct: 'in',
    rule: 'On utilise "IN" devant les villes, pays et continents (in England, in Paris).'
  },
  {
    sentence: 'She is interested ___ learning foreign languages.',
    options: ['in', 'about', 'at', 'for'],
    correct: 'in',
    rule: 'L\'adjectif "interested" est toujours suivi de la préposition "IN" (interested in something).'
  }
];

export const TRUE_OR_FALSE_ITEMS = [
  {
    statement: 'En anglais, "Actually" signifie "Actuellement en ce moment".',
    isTrue: false,
    explanation: 'FAUX ! C\'est un faux-ami célèbre : "Actually" signifie "En fait" ou "En réalité". Pour dire "actuellement", on utilise "Currently" ou "Nowadays".'
  },
  {
    statement: 'Les adjectifs qualificatifs ne prennent JAMAIS de "s" au pluriel en anglais.',
    isTrue: true,
    explanation: 'VRAI ! En anglais, les adjectifs sont invariables en genre et en nombre (ex: "two blue cars", jamais "blues").'
  },
  {
    statement: 'Le pronom "I" (je) s\'écrit TOUJOURS avec une majuscule, même au milieu d\'une phrase.',
    isTrue: true,
    explanation: 'VRAI ! Quelle que soit sa place dans la phrase, "I" prend toujours une majuscule obligatoire.'
  },
  {
    statement: 'À Londres, le métro s\'appelle couramment "The Subway".',
    isTrue: false,
    explanation: 'FAUX ! En anglais britannique, le métro s\'appelle "The Tube" ou "The Underground". "Subway" est le terme américain (utilisé à New York).'
  }
];

export const MEMORY_PAIRS_DATA = [
  { id: '1', en: 'Sun', fr: 'Soleil' },
  { id: '2', en: 'Moon', fr: 'Lune' },
  { id: '3', en: 'Tree', fr: 'Arbre' },
  { id: '4', en: 'Star', fr: 'Étoile' },
  { id: '5', en: 'River', fr: 'Rivière' },
  { id: '6', en: 'Cloud', fr: 'Nuage' }
];

export const BEAT_THE_CLOCK_WORDS = [
  { en: 'Cat', options: ['Chat', 'Chien', 'Cheval'], correct: 'Chat' },
  { en: 'Dog', options: ['Oiseau', 'Chien', 'Poisson'], correct: 'Chien' },
  { en: 'House', options: ['Voiture', 'Maison', 'Bateau'], correct: 'Maison' },
  { en: 'Apple', options: ['Banane', 'Poire', 'Pomme'], correct: 'Pomme' },
  { en: 'Book', options: ['Stylo', 'Livre', 'Feuille'], correct: 'Livre' },
  { en: 'Car', options: ['Voiture', 'Avion', 'Vélo'], correct: 'Voiture' },
  { en: 'School', options: ['Hôpital', 'École', 'Mairie'], correct: 'École' },
  { en: 'Friend', options: ['Ami', 'Voisin', 'Inconnu'], correct: 'Ami' },
  { en: 'Water', options: ['Lait', 'Eau', 'Jus'], correct: 'Eau' },
  { en: 'Bread', options: ['Pain', 'Fromage', 'Beurre'], correct: 'Pain' },
  { en: 'Sun', options: ['Soleil', 'Lune', 'Pluie'], correct: 'Soleil' },
  { en: 'Window', options: ['Porte', 'Fenêtre', 'Mur'], correct: 'Fenêtre' },
  { en: 'Chair', options: ['Table', 'Chaise', 'Lit'], correct: 'Chaise' },
  { en: 'Bird', options: ['Oiseau', 'Poisson', 'Chat'], correct: 'Oiseau' },
  { en: 'Green', options: ['Rouge', 'Vert', 'Bleu'], correct: 'Vert' }
];

export const WORD_SNAKE_CHAINS = [
  {
    current: 'TIGER',
    lastLetter: 'R',
    options: ['RABBIT', 'LION', 'MONKEY'],
    correct: 'RABBIT'
  },
  {
    current: 'RABBIT',
    lastLetter: 'T',
    options: ['TURTLE', 'ZEBRA', 'BEAR'],
    correct: 'TURTLE'
  },
  {
    current: 'TURTLE',
    lastLetter: 'E',
    options: ['ELEPHANT', 'GIRAFFE', 'SNAKE'],
    correct: 'ELEPHANT'
  },
  {
    current: 'ELEPHANT',
    lastLetter: 'T',
    options: ['TOUCAN', 'PENGUIN', 'FOX'],
    correct: 'TOUCAN'
  }
];

export const RIDDLE_ITEMS = [
  {
    riddle: 'I have a face and two hands, but no arms, legs or eyes. What am I?',
    options: ['A clock', 'A mirror', 'A doll', 'A book'],
    correct: 'A clock',
    explanation: 'Une horloge (A clock) possède un cadran (face) et deux aiguilles (hands) !'
  },
  {
    riddle: 'What gets wetter the more it dries?',
    options: ['A towel', 'A sponge', 'The rain', 'A cloud'],
    correct: 'A towel',
    explanation: 'Une serviette (A towel) devient de plus en plus humide au fur et à mesure qu\'elle sèche quelqu\'un.'
  },
  {
    riddle: 'I have keys but no locks. I have space but no rooms. You can enter, but you cannot go outside. What am I?',
    options: ['A computer keyboard', 'A piano', 'A map', 'A secret chest'],
    correct: 'A computer keyboard',
    explanation: 'Un clavier d\'ordinateur possède des touches (keys), une barre d\'espace (space) et une touche Entrée (Enter) !'
  }
];

export const TONE_DETECTOR_ITEMS = [
  {
    quote: '"Excuse me sir, would you be so kind as to show me the way to the library?"',
    options: ['Très poli & Formel', 'En colère', 'Sarcastique', 'Familier'],
    correct: 'Très poli & Formel',
    analysis: 'L\'emploi du conditionnel "Would you be so kind as to..." et du vouvoiement courtois "Excuse me sir" caractérise un registre très soutenu et poli.'
  },
  {
    quote: '"Oh brilliant! You spilled orange juice all over my new white shirt. Just wonderful!"',
    options: ['Sarcastique / Ironique', 'Joyeux & Ravi', 'Triste', 'Professionnel'],
    correct: 'Sarcastique / Ironique',
    analysis: 'Dire "Brilliant" et "Just wonderful" alors qu\'on vient de renverser du jus exprime de l\'ironie cinglante (sarcasm).'
  },
  {
    quote: '"Hey buddy! Long time no see! Grab a slice of pizza and chill with us!"',
    options: ['Familier & Amical', 'Soutenu & Protocolaire', 'Menacant', 'Déprimé'],
    correct: 'Familier & Amical',
    analysis: 'Mots d\'argot et d\'amitié : "buddy", "grab a slice", "chill" dénotent un moment détendu entre amis.'
  }
];

export const UK_VS_US_ITEMS = [
  {
    uk: 'Flat 🇬🇧',
    options: ['Apartment 🇺🇸', 'House 🇺🇸', 'Room 🇺🇸'],
    correct: 'Apartment 🇺🇸',
    explanation: 'Les Britanniques disent "a flat" pour désigner ce que les Américains appellent "an apartment".'
  },
  {
    uk: 'Biscuits 🇬🇧',
    options: ['Cookies 🇺🇸', 'Cakes 🇺🇸', 'Candies 🇺🇸'],
    correct: 'Cookies 🇺🇸',
    explanation: 'Au Royaume-Uni, on savoure des "biscuits", tandis qu\'aux USA on parle de "cookies".'
  },
  {
    uk: 'Crisps 🇬🇧',
    options: ['Chips 🇺🇸', 'Fries 🇺🇸', 'Popcorn 🇺🇸'],
    correct: 'Chips 🇺🇸',
    explanation: 'Attention au piège : "Crisps" (UK) = "Chips" (USA). Les frites sont "Chips" (UK) et "Fries" (USA) !'
  },
  {
    uk: 'Autumn 🇬🇧',
    options: ['Fall 🇺🇸', 'Winter 🇺🇸', 'Spring 🇺🇸'],
    correct: 'Fall 🇺🇸',
    explanation: 'La saison de l\'automne est appelée "Autumn" au Royaume-Uni et couramment "Fall" aux États-Unis.'
  }
];

export const IDIOM_HUNTER_ITEMS = [
  {
    idiom: 'A piece of cake',
    options: ['Quelque chose de très facile', 'Un gâteau délicieux', 'Une part d\'héritage'],
    correct: 'Quelque chose de très facile',
    literal: 'Une part de gâteau',
    example: '"Don\'t worry about the English test, it\'s a piece of cake!"'
  },
  {
    idiom: 'Once in a blue moon',
    options: ['Très rarement', 'Toutes les nuits de pleine lune', 'Souvent et régulièrement'],
    correct: 'Très rarement',
    literal: 'Une fois par lune bleue',
    example: '"He only eats fast food once in a blue moon."'
  },
  {
    idiom: 'Cost an arm and a leg',
    options: ['Coûter les yeux de la tête (très cher)', 'Être gravement blessé', 'Faire beaucoup de sport'],
    correct: 'Coûter les yeux de la tête (très cher)',
    literal: 'Coûter un bras et une jambe',
    example: '"Buying a ticket for the concert cost me an arm and a leg."'
  },
  {
    idiom: 'Break a leg!',
    options: ['Bonne chance ! (Merde !)', 'Fais attention où tu marches', 'Arrête de courir'],
    correct: 'Bonne chance ! (Merde !)',
    literal: 'Casse-toi une jambe !',
    example: '"You\'re going on stage now? Break a leg!"'
  }
];

export const SPELLING_BEE_ITEMS = [
  {
    word: 'BEAUTIFUL',
    clue: 'Magnifique, agréable à regarder',
    phonetic: '/ˈbjuːtɪfʊl/'
  },
  {
    word: 'NECESSARY',
    clue: 'Indispensable, obligatoire (1 C, 2 S)',
    phonetic: '/ˈnɛsəsəri/'
  },
  {
    word: 'DIFFERENT',
    clue: 'Qui n\'est pas semblable (double F)',
    phonetic: '/ˈdɪfərənt/'
  },
  {
    word: 'TOGETHER',
    clue: 'Les uns avec les autres, en groupe',
    phonetic: '/təˈɡɛðə/'
  }
];

export const BOSS_BATTLE_ROUNDS = [
  {
    type: 'vocabulaire',
    prompt: 'Quelle est la traduction exacte du mot "STRENGTH" ?',
    options: ['La force', 'La vitesse', 'La peur', 'La joie'],
    correct: 'La force',
    damage: 25
  },
  {
    type: 'verbe',
    prompt: 'Quel est le prétérit du verbe irrégulier "BUY" (acheter) ?',
    options: ['Bought', 'Buyed', 'Brought', 'Bound'],
    correct: 'Bought',
    damage: 25
  },
  {
    type: 'syntaxe',
    prompt: 'Comment dit-on "Il a toujours faim à midi" en respectant la place des adverbes de fréquence ?',
    options: [
      'He is always hungry at noon.',
      'He always is hungry at noon.',
      'He is hungry always at noon.',
      'Always he is hungry at noon.'
    ],
    correct: 'He is always hungry at noon.',
    damage: 25
  },
  {
    type: 'audio_idiom',
    prompt: 'Que signifie l\'expression "Bite the bullet" ?',
    options: [
      'Serrer les dents et affronter une épreuve',
      'Manger très vite',
      'Tirer au pistolet',
      'Prendre la fuite'
    ],
    correct: 'Serrer les dents et affronter une épreuve',
    damage: 25
  }
];
