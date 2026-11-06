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
  // 2. VOLT (Classique / Rare - Niveau 12)
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
  // 3. NYX (Astrale / Rare+ - Niveau 25)
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
  // 4. SOLARIA (Solaire / Épique - Niveau 45)
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
  // 5. INFERNO (Incandescente / Légendaire - Niveau 62)
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
  // 6. UMBRA (Ténébreuse / Légendaire+ - Niveau 78)
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
  // 7. FROST (Boréale / Mythique - Niveau 90)
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
  // 8. ETERNIS (Souveraine Suprême - Niveau 100)
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
