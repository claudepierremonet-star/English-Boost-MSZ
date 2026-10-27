/**
 * 20 Jeux d'Apprentissage Anglais Interactifs & Gamifiés
 * Fiche de données complètes : Icônes, Noms, Comment Jouer, Niveaux, Questions & Contenus
 */

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
    subtitle: 'Traduction Éclair • 3 Niveaux',
    icon: 'bolt',
    category: 'traduction',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgGradient: 'from-amber-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    xpReward: 35,
    howToPlay: {
      goal: 'Associe chaque mot anglais à sa traduction française le plus rapidement possible. Choisis parmi 3 niveaux : Débutant (5 séries), Intermédiaire (25 séries) ou Avancé (50 séries) avec 12 mots (6 paires) par série !',
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
    subtitle: 'Anagrammes en Folie',
    icon: 'extension',
    category: 'vocabulaire',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    xpReward: 30,
    howToPlay: {
      goal: 'Remets les lettres mélangées dans le bon ordre pour reconstituer le mot anglais secret.',
      rules: [
        'Lis l\'indice et la traduction française affichés en haut.',
        'Clique sur les lettres proposées pour les insérer dans les cases vides.',
        'Clique sur une lettre déjà placée pour la renvoyer dans la réserve en cas de faute.',
        'Utilise l\'indice gratuit si tu as un trou de mémoire !'
      ],
      tip: 'Commence souvent par repérer les consonnes initiales typiques de l\'anglais (Th, Wh, Sh, St).'
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
    subtitle: 'Chasse aux Verbes Irréguliers',
    icon: 'sports_martial_arts',
    category: 'verbes',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    bgGradient: 'from-rose-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Moyen',
    xpReward: 40,
    howToPlay: {
      goal: 'Maîtrise les 3 formes des verbes irréguliers anglais (Infinitif, Prétérit, Participe Passé).',
      rules: [
        'L\'infinitif et sa traduction s\'affichent à l\'écran.',
        'Sélectionne le Prétérit correct parmi les 3 propositions.',
        'Puis sélectionne le Participe Passé adéquat pour achever la combinaison.',
        'Enchaîne 5 verbes consécutifs sans faillir pour remporter le badge "Master of Tenses".'
      ],
      tip: 'Mémorise les familles sonores (ex: sing / sang / sung, ring / rang / rung).'
    }
  },
  {
    id: 'astro-hangman',
    number: 5,
    title: 'Astro Hangman',
    subtitle: 'Pendu Cosmique',
    icon: 'rocket_launch',
    category: 'vocabulaire',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    bgGradient: 'from-indigo-950/40 via-[#131b2e] to-[#0c1322]',
    difficulty: 'Facile',
    xpReward: 35,
    howToPlay: {
      goal: 'Devine le mot mystère lettre par lettre avant que la jauge d\'oxygène du cosmonaute ne tombe à zéro.',
      rules: [
        'Clique sur les touches du clavier virtuel pour proposer une lettre.',
        'Si la lettre est présente, elle s\'affiche dans le mot.',
        'Si elle est absente, votre astronaute perd 1 unité d\'oxygène (maximum 6 erreurs permises).',
        'Trouve le mot complet pour sauver la mission spatiale !'
      ],
      tip: 'Propose d\'abord les voyelles les plus fréquentes de l\'anglais (E, A, O, I) puis les consonnes R, T, N, S.'
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
  }
];

// =====================================================================
// SPEED MATCH (Mini-Jeu n°1) - Banques Lexicales Massives & Niveaux
// =====================================================================

export type SpeedMatchLevelKey = 'debutant' | 'intermediaire' | 'avance';

export interface SpeedMatchPair {
  en: string;
  fr: string;
  hint?: string;
}

export interface SpeedMatchLevelInfo {
  id: SpeedMatchLevelKey;
  label: string;
  subtitle: string;
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

export const SPEED_MATCH_LEVELS: Record<SpeedMatchLevelKey, SpeedMatchLevelInfo> = {
  debutant: {
    id: 'debutant',
    label: 'Débutant',
    subtitle: 'Niveau 6e Fondations',
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
    subtitle: 'Niveau 6e Approfondi',
    questionsCount: 25,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 40,
    xpReward: 75,
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    icon: 'speed',
    description: '25 séries de 12 mots (6 paires). Voyage, loisirs, sports, métiers, santé et vie quotidienne.'
  },
  avance: {
    id: 'avance',
    label: 'Avancé',
    subtitle: 'Défi Maître Bilingue',
    questionsCount: 50,
    wordsPerQuestion: 12,
    pairsPerQuestion: 6,
    timePerQuestion: 35,
    xpReward: 150,
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    icon: 'military_tech',
    description: '50 séries de 12 mots (6 paires). Vocabulaire riche, expressions, culture, verbes d\'action et nuances.'
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
    case 'avance':
      pool = [...SPEED_MATCH_AVANCE_BANK];
      break;
    default:
      pool = [...SPEED_MATCH_DEBUTANT_BANK];
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

export const WORD_SCRAMBLE_ITEMS = [
  { word: 'FRIEND', clue: 'Une personne chère avec qui on partage tout', translation: 'Ami(e)' },
  { word: 'SCHOOL', clue: 'Le lieu où l\'on apprend chaque jour', translation: 'École' },
  { word: 'TRAVEL', clue: 'Explorer le monde et de nouveaux pays', translation: 'Voyager' },
  { word: 'GARDEN', clue: 'Espace vert avec des fleurs et des arbres', translation: 'Jardin' },
  { word: 'SUMMER', clue: 'La saison la plus chaude et ensoleillée', translation: 'Été' },
  { word: 'CASTLE', clue: 'Grande demeure fortifiée du Moyen Âge', translation: 'Château' }
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
  },
  {
    infinitive: 'Write',
    translation: 'Écrire',
    preteriteOptions: ['Wrote', 'Written', 'Writed'],
    preteriteCorrect: 'Wrote',
    participleOptions: ['Written', 'Wrote', 'Writing'],
    participleCorrect: 'Written'
  },
  {
    infinitive: 'Take',
    translation: 'Prendre',
    preteriteOptions: ['Took', 'Taken', 'Taked'],
    preteriteCorrect: 'Took',
    participleOptions: ['Taken', 'Took', 'Taking'],
    participleCorrect: 'Taken'
  },
  {
    infinitive: 'Eat',
    translation: 'Manger',
    preteriteOptions: ['Ate', 'Eaten', 'Eated'],
    preteriteCorrect: 'Ate',
    participleOptions: ['Eaten', 'Ate', 'Eating'],
    participleCorrect: 'Eaten'
  }
];

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
