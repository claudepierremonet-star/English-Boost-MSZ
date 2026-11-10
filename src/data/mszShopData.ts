/**
 * MSZ Collectible Icons & Characters Data
 * Inspired by luxury collectible card games (Pokémon TCG Secret Rare aesthetic)
 * 
 * Strict Limited Edition Rules:
 * - Each character is capped at exactly 100 card copies (1/100 to 100/100).
 * - Each card has an individual unique identity code (e.g. MSZ-ECLAT-#001/100).
 * - NO DUPLICATE CARDS: Strictly featuring the 8 authentic character artworks:
 *   1. ÉCLAT (Niv. 5 - Classique Commune)
 *   2. VOLT (Niv. 12 - Rare)
 *   3. NYX (Niv. 25 - Astrale Rare+)
 *   4. SOLARIA (Niv. 45 - Solaire Épique)
 *   5. INFERNO (Niv. 62 - Incandescente Légendaire)
 *   6. UMBRA (Niv. 78 - Ténébreuse Légendaire+)
 *   7. FROST (Niv. 90 - Boréale Mythique)
 *   8. ETERNIS (Niv. 100 - Souveraine Suprême)
 */

export type CharacterRarity = 'Commune' | 'Rare' | 'Épique' | 'Légendaire' | 'Mythique' | 'Souveraine';

export interface RarityConfig {
  key: CharacterRarity;
  label: string;
  icon: string;
  badgeClass: string;
  cardBorderClass: string;
  glowShadow: string;
  goldenBorder: boolean;
  accentColor: string;
  gradientText: string;
  description: string;
  tierTag: string;
  levelRange: string;
}

export const RARITY_ORDER: CharacterRarity[] = [
  'Commune',
  'Rare',
  'Épique',
  'Légendaire',
  'Mythique',
  'Souveraine'
];

export const RARITY_CONFIGS: Record<CharacterRarity, RarityConfig> = {
  Commune: {
    key: 'Commune',
    label: 'Commune',
    icon: 'verified',
    badgeClass: 'border border-cyan-400/60 text-cyan-300 bg-cyan-950/80 shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    cardBorderClass: 'border-cyan-400/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    glowShadow: '0 0 16px rgba(56,189,248,0.4)',
    goldenBorder: false,
    accentColor: '#38bdf8',
    gradientText: 'from-cyan-300 to-sky-100',
    description: 'Archétypes fondateurs de l’Académie, essentiels pour forger les réflexes d’élocution et la rapidité lexicale.',
    tierTag: 'TIER I • INITIATION',
    levelRange: 'Niveau 5'
  },
  Rare: {
    key: 'Rare',
    label: 'Rare',
    icon: 'auto_awesome',
    badgeClass: 'border border-blue-400/70 text-blue-200 bg-blue-950/85 shadow-[0_0_16px_rgba(59,130,246,0.45)]',
    cardBorderClass: 'border-blue-400/60 hover:border-blue-400 hover:shadow-[0_0_22px_rgba(59,130,246,0.4)]',
    glowShadow: '0 0 20px rgba(59,130,246,0.45)',
    goldenBorder: false,
    accentColor: '#60a5fa',
    gradientText: 'from-blue-300 to-indigo-100',
    description: 'Guerriers cinétiques et astraux canalisant la régularité du tempo phonétique et la rétention mémorielle.',
    tierTag: 'TIER II • AVANCÉ',
    levelRange: 'Niveaux 12 à 25'
  },
  Épique: {
    key: 'Épique',
    label: 'Épique',
    icon: 'diamond',
    badgeClass: 'border border-purple-400/80 text-purple-200 bg-purple-950/90 shadow-[0_0_20px_rgba(168,85,247,0.55)] font-bold',
    cardBorderClass: 'border-purple-400/70 hover:border-purple-300 hover:shadow-[0_0_26px_rgba(168,85,247,0.5)]',
    glowShadow: '0 0 24px rgba(168,85,247,0.55)',
    goldenBorder: false,
    accentColor: '#c084fc',
    gradientText: 'from-purple-300 to-pink-100',
    description: 'Titans du zénith solaire dissipant toute anxiété oratoire et instaurant une clarté royale.',
    tierTag: 'TIER III • ÉLITE SOLAIRE',
    levelRange: 'Niveau 45'
  },
  Légendaire: {
    key: 'Légendaire',
    label: 'Légendaire',
    icon: 'military_tech',
    badgeClass: 'border-2 border-amber-400 text-amber-200 bg-gradient-to-r from-amber-950/90 via-[#2a1a02] to-amber-900/90 shadow-[0_0_24px_rgba(245,158,11,0.7)] font-black ring-1 ring-amber-400/50',
    cardBorderClass: 'border-2 border-amber-400/80 hover:border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.65)]',
    glowShadow: '0 0 28px rgba(245,158,11,0.7)',
    goldenBorder: true,
    accentColor: '#f59e0b',
    gradientText: 'from-amber-200 via-yellow-100 to-amber-400',
    description: 'Entités d’énergie thermonucléaire et spectres abyssaux dotés d’une prestigieuse bordure dorée incandescente.',
    tierTag: 'TIER IV • BORDURE DORÉE PRESTIGE',
    levelRange: 'Niveaux 62 à 78'
  },
  Mythique: {
    key: 'Mythique',
    label: 'Mythique',
    icon: 'flare',
    badgeClass: 'border-2 border-emerald-400 text-emerald-200 bg-gradient-to-r from-emerald-950/95 via-[#022c22] to-teal-900/95 shadow-[0_0_28px_rgba(52,211,153,0.75)] font-black ring-1 ring-emerald-300/60',
    cardBorderClass: 'border-2 border-emerald-400/90 hover:border-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.45)] hover:shadow-[0_0_38px_rgba(52,211,153,0.75)]',
    glowShadow: '0 0 32px rgba(52,211,153,0.75)',
    goldenBorder: true,
    accentColor: '#34d399',
    gradientText: 'from-emerald-200 via-teal-100 to-emerald-400',
    description: 'Sentinelles des aurores polaires façonnées dans le givre éternel, conférant une précision grammaticale infaillible.',
    tierTag: 'TIER V • CRISTAL MYTHIQUE',
    levelRange: 'Niveau 90'
  },
  Souveraine: {
    key: 'Souveraine',
    label: 'Souveraine',
    icon: 'crown',
    badgeClass: 'border-2 border-[#ffd700] text-yellow-100 bg-gradient-to-r from-amber-600/95 via-yellow-400/90 to-amber-500/95 shadow-[0_0_35px_rgba(255,215,0,0.95)] font-black ring-2 ring-[#ffd700] shadow-amber-500/50',
    cardBorderClass: 'border-2 border-[#ffd700] ring-2 ring-[#ffd700]/60 shadow-[0_0_35px_rgba(255,215,0,0.65)] hover:shadow-[0_0_50px_rgba(255,215,0,0.9)]',
    glowShadow: '0 0 40px rgba(255,215,0,0.95)',
    goldenBorder: true,
    accentColor: '#ffd700',
    gradientText: 'from-yellow-100 via-amber-200 to-yellow-400',
    description: 'Le sommet absolu de la rareté MSZ : Bordure d’or pur 24K, couronne souveraine et aura céleste au Niveau 100.',
    tierTag: 'TIER SUPRÊME • OR PUR 24K',
    levelRange: 'Niveau 100 Absolu'
  }
};

export interface CharacterStats {
  elocution: number;  // 0 - 100
  memoire: number;    // 0 - 100
  vitesse: number;    // 0 - 100
  maitrise: number;   // 0 - 100
}

export interface MszCharacter {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryTag: string;
  price: number; // in MSZ Coins (Starts at 50 MSZ Coins)
  level: number; // Character Level strictly ascending (5 -> 100)
  rarity: CharacterRarity;
  image: string;
  element: string;
  maxSupply: number; // Hard cap: 100 copies per character
  initialMintCount: number; // Initial minted out of 100
  serialPrefix: string; // e.g. "MSZ-ECLAT"
  colorTheme: {
    primary: string;
    border: string;
    glow: string;
    gradient: string;
    badgeBg: string;
  };
  description: string;
  loreQuote: string;
  passiveBonus: string;
  stats: CharacterStats;
  isOfficialAsset: boolean;
}

export interface ShopCategory {
  id: number;
  name: string;
  tag: string;
  startingPrice: number;
  description: string;
  icon: string;
  accentColor: string;
  rankBadge: string;
}

export interface MarketListing {
  id: string;
  characterId: string;
  sellerUid: string;
  sellerName: string;
  sellerAvatar?: string;
  price: number;
  listedAt: string;
  serialNumber: string; // e.g. "MSZ-ECLAT-#042/100"
  editionNumber: number; // 42
  maxSupply: number; // 100
  condition: 'Mint / Neuf' | 'Near Mint' | 'Holo First Edition';
}

export interface MszTransaction {
  id: string;
  type: 'buy_shop' | 'buy_market' | 'sell_market' | 'reward_game' | 'reward_cursus';
  characterId?: string;
  characterName?: string;
  serialCode?: string; // e.g. "MSZ-ECLAT-#015/100"
  amount: number; // positive for gain, negative for expense
  date: string;
  description: string;
}

// 7 Progressive Categories strictly structured from Classic to Sovereign (No duplicate slots)
export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 1,
    name: 'Cyber Néon (Classique)',
    tag: 'CYBER-NEON-01',
    startingPrice: 50,
    description: 'Armures cybernétiques d’initiation à cadence phonétique réactive. Les archétypes fondateurs de l’Académie.',
    icon: 'electric_bolt',
    accentColor: '#38bdf8',
    rankBadge: 'Classique • Rangs 1-15'
  },
  {
    id: 2,
    name: 'Cosmic Void (Astrale)',
    tag: 'COSMIC-VOID-02',
    startingPrice: 150,
    description: 'Guerrière de la nuit stellaire et des éclipses lexicales, canalisant la pureté des constellations.',
    icon: 'auto_awesome',
    accentColor: '#c084fc',
    rankBadge: 'Astral • Rangs 16-30'
  },
  {
    id: 3,
    name: 'Solar Corona (Solaire)',
    tag: 'SOLAR-CORONA-03',
    startingPrice: 320,
    description: 'Souveraine du zénith solaire, conférant une projection oratoire éclatante et une clarté impériale.',
    icon: 'wb_sunny',
    accentColor: '#f59e0b',
    rankBadge: 'Épique • Rangs 31-50'
  },
  {
    id: 4,
    name: 'Pyro Plasma (Incandescente)',
    tag: 'PYRO-PLASMA-04',
    startingPrice: 580,
    description: 'Colosse d’énergie thermonucléaire né au cœur des éruptions solaires, calcinant toute hésitation vocale.',
    icon: 'local_fire_department',
    accentColor: '#ef4444',
    rankBadge: 'Légendaire • Rangs 51-70'
  },
  {
    id: 5,
    name: 'Abyssal Shadow (Ténébreuse)',
    tag: 'ABYSSAL-SHADOW-05',
    startingPrice: 890,
    description: 'Entité nocturne des fosses insondables, maîtresse des résonances profondes et des timbres barytons d’élite.',
    icon: 'dark_mode',
    accentColor: '#818cf8',
    rankBadge: 'Légendaire+ • Rangs 71-85'
  },
  {
    id: 6,
    name: 'Glaciation Cryo (Boréale)',
    tag: 'GLACIATION-CRYO-06',
    startingPrice: 1500,
    description: 'Sentinelle boréale façonnée dans le givre éternel des fjords, cristallisant une syntaxe d’une pureté chirurgicale.',
    icon: 'ac_unit',
    accentColor: '#34d399',
    rankBadge: 'Mythique • Rangs 86-95'
  },
  {
    id: 7,
    name: 'Mythic Sovereign (Souveraine)',
    tag: 'MYTHIC-SOVEREIGN-07',
    startingPrice: 2500,
    description: 'Le Gardien Éternel suprême de l’Écosystème MSZ, parangon de la perfection oratoire au niveau 100 absolu.',
    icon: 'crown',
    accentColor: '#ffd700',
    rankBadge: 'Souveraine Suprême • Niveau 100'
  }
];

// The 8 Official Authentic Collectible Characters (Zero duplicates, strictly unique assets & identities)
export const MSZ_CHARACTERS: MszCharacter[] = [
  // ==========================================
  // 1. ÉCLAT (Classique / Commune - Niveau 5)
  // ==========================================
  {
    id: 'char_eclat',
    name: 'ÉCLAT',
    categoryId: 1,
    categoryName: 'Cyber Néon (Classique)',
    categoryTag: 'CYBER-NEON-01',
    price: 50, // Starts at 50 MSZ Coins
    level: 5,
    rarity: 'Commune',
    image: '/assets/aistudio/ECLAT.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 34,
    serialPrefix: 'MSZ-ECLAT',
    element: 'Cyber Lightning',
    colorTheme: {
      primary: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.65)',
      glow: 'rgba(56, 189, 248, 0.45)',
      gradient: 'from-[#0b1930] via-[#0d2847] to-[#1e1b4b]',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
    },
    description: 'Guerrier cybernétique doté d’un heaume à visière prismatique haute-fréquence. Sa vitesse de traitement synaptique décuple l’agilité lexicale et la réactivité orthographique lors des dictées rapides.',
    loreQuote: '« La clarté foudroyante de l’esprit précède chaque victoire linguistique. »',
    passiveBonus: '+5% d’XP gagnés en Speed Match & Dictée Vocale',
    stats: {
      elocution: 88,
      memoire: 86,
      vitesse: 95,
      maitrise: 84
    }
  },

  // ==========================================
  // 2. EKLAH (Cyber Néon / Initiation+ - Niveau 8)
  // ==========================================
  {
    id: 'char_eklah',
    name: 'EKLAH',
    categoryId: 1,
    categoryName: 'Cyber Néon (Classique)',
    categoryTag: 'CYBER-NEON-01',
    price: 65,
    level: 8,
    rarity: 'Commune',
    image: '/assets/aistudio/ECLAT_4c46a7cc.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 19,
    serialPrefix: 'MSZ-EKLAH',
    element: 'Radiant Resonance',
    colorTheme: {
      primary: '#0284c7',
      border: 'rgba(2, 132, 199, 0.6)',
      glow: 'rgba(2, 132, 199, 0.35)',
      gradient: 'from-[#071326] via-[#0b1e3b] to-[#161f36]',
      badgeBg: 'bg-sky-500/15 text-sky-200 border-sky-400/30'
    },
    description: 'Variante d’éveil cybernétique aux fréquences harmoniques stabilisées. Eklah amplifie l’amplitude phonique et renforce l’assurance oratoire, idéale pour consolider la mémoire auditive et la fluidité syntaxique.',
    loreQuote: '« Dans l’écho du verbe se révèle la résonance de la vérité. »',
    passiveBonus: '+6% de stabilité d’élocution et bonus d’oratoire en vitesse',
    stats: {
      elocution: 90,
      memoire: 87,
      vitesse: 96,
      maitrise: 86
    }
  },

  // ==========================================
  // 3. VOLT (Classique / Rare - Niveau 12)
  // ==========================================
  {
    id: 'char_volt',
    name: 'VOLT',
    categoryId: 1,
    categoryName: 'Cyber Néon (Classique)',
    categoryTag: 'CYBER-NEON-01',
    price: 75,
    level: 12,
    rarity: 'Rare',
    image: '/assets/aistudio/VOLT.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 28,
    serialPrefix: 'MSZ-VOLT',
    element: 'Plasma Voltage',
    colorTheme: {
      primary: '#06b6d4',
      border: 'rgba(6, 182, 212, 0.75)',
      glow: 'rgba(217, 70, 239, 0.45)',
      gradient: 'from-[#1a0b2e] via-[#161244] to-[#08203e]',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
    },
    description: 'Champion de l’énergie cinétique et des surtensions sonores. Son anneau néon focalise les fréquences d’accentuation pour un débit régulier et une diction percutante sans hésitation.',
    loreQuote: '« Rien ne résiste à une impulsion phonétique parfaitement calibrée. »',
    passiveBonus: '+2 MSZ Coins bonus sur la première série parfaite du jour',
    stats: {
      elocution: 92,
      memoire: 88,
      vitesse: 98,
      maitrise: 89
    }
  },

  // ==========================================
  // 4. NYX (Astrale / Rare+ - Niveau 25)
  // ==========================================
  {
    id: 'char_nyx',
    name: 'NYX',
    categoryId: 2,
    categoryName: 'Cosmic Void (Astrale)',
    categoryTag: 'COSMIC-VOID-02',
    price: 150,
    level: 25,
    rarity: 'Rare',
    image: '/assets/aistudio/NYX.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 21,
    serialPrefix: 'MSZ-NYX',
    element: 'Nocturnal Void Aura',
    colorTheme: {
      primary: '#c084fc',
      border: 'rgba(192, 132, 252, 0.8)',
      glow: 'rgba(168, 85, 247, 0.5)',
      gradient: 'from-[#19092b] via-[#2d124d] to-[#09152b]',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40'
    },
    description: 'Déesse de la nuit stellaire et des éclipses lexicales. Son champ de gravité quantique absorbe les hésitations pour laisser place à une articulation nocturne d’une pureté hypnotique.',
    loreQuote: '« Dans le silence des étoiles, la parole claire devient constellation. »',
    passiveBonus: '+15% de mémoire sur les répétitions espacées et racines philologiques',
    stats: {
      elocution: 94,
      memoire: 96,
      vitesse: 92,
      maitrise: 93
    }
  },

  // ==========================================
  // 5. SOLARIA (Solaire / Épique - Niveau 45)
  // ==========================================
  {
    id: 'char_solaria',
    name: 'SOLARIA',
    categoryId: 3,
    categoryName: 'Solar Corona (Solaire)',
    categoryTag: 'SOLAR-CORONA-03',
    price: 320,
    level: 45,
    rarity: 'Épique',
    image: '/assets/aistudio/SOLARIA.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 16,
    serialPrefix: 'MSZ-SOLARIA',
    element: 'Solar Corona Brilliance',
    colorTheme: {
      primary: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.85)',
      glow: 'rgba(245, 158, 11, 0.55)',
      gradient: 'from-[#301604] via-[#1c1834] to-[#081222]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50'
    },
    description: 'Souveraine du zénith solaire. Son halo d’or pur dissipe l’anxiété de la prise de parole en public et infuse chaque phonème d’une résonance et d’une prestance impériales.',
    loreQuote: '« Parlez avec la certitude du soleil qui se lève sur le monde. »',
    passiveBonus: '+20% d’XP gagnés sur les sessions du Studio d’Élocution',
    stats: {
      elocution: 97,
      memoire: 95,
      vitesse: 96,
      maitrise: 96
    }
  },

  // ==========================================
  // 6. INFERNO (Incandescente / Légendaire - Niveau 62)
  // ==========================================
  {
    id: 'char_inferno',
    name: 'INFERNO',
    categoryId: 4,
    categoryName: 'Pyro Plasma (Incandescente)',
    categoryTag: 'PYRO-PLASMA-04',
    price: 580,
    level: 62,
    rarity: 'Légendaire',
    image: '/assets/aistudio/INFERNO.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 14,
    serialPrefix: 'MSZ-INFERNO',
    element: 'Pyro Plasma Core',
    colorTheme: {
      primary: '#ef4444',
      border: 'rgba(239, 68, 68, 0.9)',
      glow: 'rgba(245, 158, 11, 0.65)',
      gradient: 'from-[#380606] via-[#210933] to-[#091224]',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-400/50'
    },
    description: 'Colosse d’énergie thermonucléaire né au cœur des éruptions coronales. Il calcine le doute et confère une projection vocale irrésistible aux discours officiels.',
    loreQuote: '« Que la passion oratoire brûle dans chaque syllabe prononcée. »',
    passiveBonus: 'Multiplie par 1.25 les gains de pièces sur tous les jeux d’arcade',
    stats: {
      elocution: 98,
      memoire: 96,
      vitesse: 99,
      maitrise: 97
    }
  },

  // ==========================================
  // 7. UMBRA (Ténébreuse / Légendaire+ - Niveau 78)
  // ==========================================
  {
    id: 'char_umbra',
    name: 'UMBRA',
    categoryId: 5,
    categoryName: 'Abyssal Shadow (Ténébreuse)',
    categoryTag: 'ABYSSAL-SHADOW-05',
    price: 890,
    level: 78,
    rarity: 'Légendaire',
    image: '/assets/aistudio/UMBRA.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 11,
    serialPrefix: 'MSZ-UMBRA',
    element: 'Abyssal Shadow Resonance',
    colorTheme: {
      primary: '#818cf8',
      border: 'rgba(129, 140, 248, 0.9)',
      glow: 'rgba(147, 51, 234, 0.6)',
      gradient: 'from-[#031c38] via-[#1a0f3d] to-[#0a1020]',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50'
    },
    description: 'Entité ténébreuse surgie des fosses abyssales les plus insondables. Elle commande aux fréquences graves et barytones, imposant un silence respectueux à chaque intervention.',
    loreQuote: '« Des profondeurs de l’ombre jaillit la parole la plus impériale. »',
    passiveBonus: 'Débloque les voix baryton ultra-graves de l’Académie +5 MSZ/j au plafond',
    stats: {
      elocution: 99,
      memoire: 98,
      vitesse: 94,
      maitrise: 99
    }
  },

  // ==========================================
  // 8. FROST (Boréale / Mythique - Niveau 90)
  // ==========================================
  {
    id: 'char_frost',
    name: 'FROST',
    categoryId: 6,
    categoryName: 'Glaciation Cryo (Boréale)',
    categoryTag: 'GLACIATION-CRYO-06',
    price: 1500,
    level: 90,
    rarity: 'Mythique',
    image: '/assets/aistudio/FROST.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 7,
    serialPrefix: 'MSZ-FROST',
    element: 'Glacial Borealis Cryo',
    colorTheme: {
      primary: '#34d399',
      border: 'rgba(52, 211, 153, 0.95)',
      glow: 'rgba(52, 211, 153, 0.65)',
      gradient: 'from-[#032e22] via-[#0d2a45] to-[#1c123d]',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
    },
    description: 'Sentinelle boréale façonnée dans la glace éternelle des fjords. Elle cristallise chaque règle grammaticale en réflexes infaillibles d’une pureté absolue.',
    loreQuote: '« La précision du verbe est aussi tranchante que le givre d’hiver. »',
    passiveBonus: 'Immunité totale contre la première erreur et plafond augmenté de +10 MSZ Coins',
    stats: {
      elocution: 100,
      memoire: 99,
      vitesse: 98,
      maitrise: 100
    }
  },

  // ==========================================
  // 9. ETERNIS (Souveraine Suprême - Niveau 100)
  // ==========================================
  {
    id: 'char_eternis',
    name: 'ETERNIS',
    categoryId: 7,
    categoryName: 'Mythic Sovereign (Souveraine)',
    categoryTag: 'MYTHIC-SOVEREIGN-07',
    price: 2500,
    level: 100,
    rarity: 'Souveraine',
    image: '/assets/aistudio/ETERNIS.png',
    isOfficialAsset: true,
    maxSupply: 100,
    initialMintCount: 3, // Ultra rare, only 3 minted worldwide
    serialPrefix: 'MSZ-ETERNIS',
    element: 'Primordial Genesis Crown',
    colorTheme: {
      primary: '#ffd700',
      border: 'rgba(255, 215, 0, 0.95)',
      glow: 'rgba(255, 215, 0, 0.85)',
      gradient: 'from-[#362602] via-[#241a3d] to-[#0d1633]',
      badgeBg: 'bg-amber-400/30 text-amber-100 border-amber-300/80 shadow-lg shadow-amber-500/30'
    },
    description: 'Le Gardien Éternel de l’Écosystème MSZ. Inspiré par les cartes Pokémon Secret Rare les plus légendaires, son heaume orné d’ailes quantiques canalise l’ensemble des dialectes et des chefs-d’œuvre de la langue anglaise.',
    loreQuote: '« Ce qui est forgé dans la persévérance ne périt jamais : sois éternel dans ton élocution. »',
    passiveBonus: 'Couronne dorée dans le profil + Triple XP permanent + Zéro frais de bourse P2P',
    stats: {
      elocution: 100,
      memoire: 100,
      vitesse: 100,
      maitrise: 100
    }
  }
];

// Initial Peer-to-Peer Marketplace Listings (Exclusively based on the 8 real characters with serial numbers)
export const INITIAL_MARKET_LISTINGS: MarketListing[] = [
  {
    id: 'mkt_list_01',
    characterId: 'char_eclat',
    sellerUid: 'user_oxford_scholar_09',
    sellerName: 'Archibald Sterling',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    price: 48,
    listedAt: 'Il y a 14 min',
    serialNumber: 'MSZ-ECLAT-#042/100',
    editionNumber: 42,
    maxSupply: 100,
    condition: 'Mint / Neuf'
  },
  {
    id: 'mkt_list_02',
    characterId: 'char_volt',
    sellerUid: 'user_cambridge_fellow_12',
    sellerName: 'Lady Eleanor Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    price: 72,
    listedAt: 'Il y a 32 min',
    serialNumber: 'MSZ-VOLT-#018/100',
    editionNumber: 18,
    maxSupply: 100,
    condition: 'Holo First Edition'
  },
  {
    id: 'mkt_list_03',
    characterId: 'char_nyx',
    sellerUid: 'user_astral_scholar',
    sellerName: 'Selene Moreau',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    price: 145,
    listedAt: 'Il y a 55 min',
    serialNumber: 'MSZ-NYX-#014/100',
    editionNumber: 14,
    maxSupply: 100,
    condition: 'Holo First Edition'
  },
  {
    id: 'mkt_list_04',
    characterId: 'char_solaria',
    sellerUid: 'user_diplomat_c2',
    sellerName: 'Countess Beatrix',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    price: 310,
    listedAt: 'Il y a 2 heures',
    serialNumber: 'MSZ-SOLARIA-#007/100',
    editionNumber: 7,
    maxSupply: 100,
    condition: 'Holo First Edition'
  },
  {
    id: 'mkt_list_05',
    characterId: 'char_inferno',
    sellerUid: 'user_nordic_linguist',
    sellerName: 'Commander Vane',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    price: 560,
    listedAt: 'Il y a 3 heures',
    serialNumber: 'MSZ-INFERNO-#012/100',
    editionNumber: 12,
    maxSupply: 100,
    condition: 'Mint / Neuf'
  },
  {
    id: 'mkt_list_06',
    characterId: 'char_umbra',
    sellerUid: 'user_shadow_adept',
    sellerName: 'Dorian Graves',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    price: 860,
    listedAt: 'Il y a 4 heures',
    serialNumber: 'MSZ-UMBRA-#005/100',
    editionNumber: 5,
    maxSupply: 100,
    condition: 'Holo First Edition'
  },
  {
    id: 'mkt_list_07',
    characterId: 'char_frost',
    sellerUid: 'user_polar_scholar',
    sellerName: 'Dr. Henrik Lindqvist',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    price: 1450,
    listedAt: 'Il y a 6 heures',
    serialNumber: 'MSZ-FROST-#003/100',
    editionNumber: 3,
    maxSupply: 100,
    condition: 'Mint / Neuf'
  },
  {
    id: 'mkt_list_08',
    characterId: 'char_eternis',
    sellerUid: 'user_grand_master_c2',
    sellerName: 'Aurelius Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    price: 2600,
    listedAt: 'Hier',
    serialNumber: 'MSZ-ETERNIS-#002/100',
    editionNumber: 2,
    maxSupply: 100,
    condition: 'Holo First Edition'
  }
];
