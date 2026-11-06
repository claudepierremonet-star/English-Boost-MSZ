/**
 * Philological & Etymological Enrichment Helper for Flashcards
 * Breaks down Latin, Greek, Old English (Anglo-Saxon), and Norman-French roots
 * to provide deep cognitive anchors and memorization hooks.
 */

export type EtymologyOriginType = 'latin' | 'greek' | 'old-english' | 'french-norman' | 'germanic' | 'other';

export interface EtymologyAnalysis {
  originType: EtymologyOriginType;
  originBadge: {
    label: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
  };
  rootWords: string[];
  historicalCentury: string;
  evolutionSummary: string;
  morphologicalBreakdown: {
    prefix?: string;
    prefixMeaning?: string;
    coreRoot: string;
    rootMeaning: string;
    suffix?: string;
    suffixMeaning?: string;
  };
  cognateWords: string[]; // Related words sharing the same root in English and French
  cognitiveAnchorTip: string;
}

export function analyzeEtymology(term: string, rawEtymology: string, category?: string): EtymologyAnalysis {
  const text = (rawEtymology || '').toLowerCase();
  const cleanTerm = term.trim().toLowerCase();

  let originType: EtymologyOriginType = 'latin';

  if (text.includes('grec') || text.includes('greek')) {
    originType = 'greek';
  } else if (text.includes('vieil anglais') || text.includes('old english') || text.includes('anglo-saxon') || text.includes('germanique')) {
    originType = 'old-english';
  } else if (text.includes('français') || text.includes('french') || text.includes('normand') || text.includes('anglo-norman')) {
    originType = 'french-norman';
  } else if (text.includes('latin') || text.includes('lat.')) {
    originType = 'latin';
  } else {
    // Determine by common suffixes/patterns
    if (cleanTerm.endsWith('logy') || cleanTerm.endsWith('phobia') || cleanTerm.endsWith('graph') || cleanTerm.endsWith('scope')) {
      originType = 'greek';
    } else if (cleanTerm.endsWith('tion') || cleanTerm.endsWith('sion') || cleanTerm.endsWith('able') || cleanTerm.endsWith('ible')) {
      originType = 'latin';
    } else {
      originType = 'old-english';
    }
  }

  const originBadges: Record<EtymologyOriginType, EtymologyAnalysis['originBadge']> = {
    latin: {
      label: '🏛️ Racine Latine Classique',
      icon: 'account_balance',
      color: 'text-amber-300',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30'
    },
    greek: {
      label: '🏺 Racine Grecque Antique',
      icon: 'history_edu',
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/30'
    },
    'old-english': {
      label: '🛡️ Souche Vieil Anglais (Anglo-Saxon)',
      icon: 'shield',
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30'
    },
    'french-norman': {
      label: '⚜️ Héritage Anglo-Normand (1066)',
      icon: 'castle',
      color: 'text-purple-300',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30'
    },
    germanic: {
      label: '🌲 Racine Proto-Germanique',
      icon: 'park',
      color: 'text-teal-300',
      bg: 'bg-teal-500/15',
      border: 'border-teal-500/30'
    },
    other: {
      label: '📜 Philologie Historique',
      icon: 'auto_stories',
      color: 'text-[#f2ca50]',
      bg: 'bg-[#f2ca50]/15',
      border: 'border-[#f2ca50]/30'
    }
  };

  // Extract root word candidates
  const extractedRoots: string[] = [];
  const quoteMatches = rawEtymology.match(/['"«]([^'"»]+)['"»]/g);
  if (quoteMatches) {
    quoteMatches.forEach((m) => {
      const w = m.replace(/['"«»]/g, '').trim();
      if (w.length > 2 && w.length < 25 && !extractedRoots.includes(w)) {
        extractedRoots.push(w);
      }
    });
  }

  // Deduce Century / Era
  let historicalCentury = 'Moyen Âge classique (XIIe - XIVe siècle)';
  if (originType === 'latin') {
    historicalCentury = 'Antiquité Romaine & Renaissance Humaniste (XVIe siècle)';
  } else if (originType === 'greek') {
    historicalCentury = 'Athènes Classique (Ve s. av. J.-C.) & Siècle des Lumières';
  } else if (originType === 'old-english') {
    historicalCentury = 'Période Anglo-Saxonne (Ve - XIe siècle, avant la Conquête de 1066)';
  } else if (originType === 'french-norman') {
    historicalCentury = 'Conquête Normande de 1066 (Guillaume le Conquérant) & Cour Royale des Plantagenêts';
  }

  // Morphological decomposition
  let prefix: string | undefined;
  let prefixMeaning: string | undefined;
  let suffix: string | undefined;
  let suffixMeaning: string | undefined;
  let coreRoot = extractedRoots[0] || term;
  let rootMeaning = 'Noyau sémantique originel';

  if (cleanTerm.startsWith('con') || cleanTerm.startsWith('com')) {
    prefix = 'con- / com-';
    prefixMeaning = 'Ensemble, avec, complètement (intensité)';
  } else if (cleanTerm.startsWith('dis') || cleanTerm.startsWith('de')) {
    prefix = 'dis- / de-';
    prefixMeaning = 'Séparation, inversion, retrait';
  } else if (cleanTerm.startsWith('pre')) {
    prefix = 'pre-';
    prefixMeaning = 'Avant, en avant de, anticipation';
  } else if (cleanTerm.startsWith('sub')) {
    prefix = 'sub-';
    prefixMeaning = 'Sous, en dessous, secrètement';
  } else if (cleanTerm.startsWith('un') || cleanTerm.startsWith('in') || cleanTerm.startsWith('im')) {
    prefix = cleanTerm.slice(0, 2) + '-';
    prefixMeaning = 'Négation, privation ou contraire';
  }

  if (cleanTerm.endsWith('tion') || cleanTerm.endsWith('sion')) {
    suffix = '-tion / -sion';
    suffixMeaning = 'Action, état ou résultat du processus';
  } else if (cleanTerm.endsWith('able') || cleanTerm.endsWith('ible')) {
    suffix = '-able / -ible';
    suffixMeaning = 'Capacité, possibilité passive d’être fait';
  } else if (cleanTerm.endsWith('ous') || cleanTerm.endsWith('ful')) {
    suffix = '-ous / -ful';
    suffixMeaning = 'Plein de, abondant en cette qualité';
  } else if (cleanTerm.endsWith('ly')) {
    suffix = '-ly';
    suffixMeaning = 'Manière, régularité temporelle (en français -ment)';
  }

  // Derive Cognates sharing the same root
  const cognateWords = deriveCognates(cleanTerm, originType);

  // Cognitive Anchor Tip
  const cognitiveAnchorTip = buildAnchorTip(cleanTerm, originType, rawEtymology);

  return {
    originType,
    originBadge: originBadges[originType],
    rootWords: extractedRoots.length > 0 ? extractedRoots : [cleanTerm],
    historicalCentury,
    evolutionSummary: rawEtymology || `Filiation philologique de ${cleanTerm}.`,
    morphologicalBreakdown: {
      prefix,
      prefixMeaning,
      coreRoot,
      rootMeaning,
      suffix,
      suffixMeaning
    },
    cognateWords,
    cognitiveAnchorTip
  };
}

function deriveCognates(term: string, origin: EtymologyOriginType): string[] {
  // Common roots and cognates
  const cognatesMap: Record<string, string[]> = {
    perspicacity: ['spectacle', 'inspect', 'aspect', 'spectator', 'conspicuous'],
    sobriquet: ['soubriquet (français)', 'bracket', 'sobriety'],
    equivocal: ['vocal', 'equivocate', 'vocabulary', 'advocate', 'vocation'],
    meretricious: ['merit', 'mercenary', 'meretriciel'],
    curb: ['courber (français)', 'curve', 'curvature', 'curbstone'],
    tentative: ['tenter (français)', 'tempt', 'attempt', 'tentacle'],
    unbridled: ['bridle', 'bride (équitation)', 'unbridle'],
    manuscripts: ['manual', 'manuscript', 'manufacture', 'script', 'describe'],
    board: ['bord (français)', 'border', 'boardroom', 'keyboard']
  };

  if (cognatesMap[term]) return cognatesMap[term];

  if (origin === 'latin') {
    return ['mots apparentés en français savant', 'vocabulaire académique international', 'termes juridiques & diplomatiques'];
  }
  if (origin === 'greek') {
    return ['vocabulaire scientifique', 'termes de rhétorique', 'lexique philosophique'];
  }
  return ['mots germaniques du quotidien', 'expressions idiomatiques anglo-saxonnes'];
}

function buildAnchorTip(term: string, origin: EtymologyOriginType, etym: string): string {
  if (origin === 'latin') {
    return `Astuce mnémotechnique : Le latin forme l'armature de l'anglais savant et soutenu. En reliant « ${term} » à son ancêtre latin, vous visualisez immédiatement le sens sans avoir à traduire mentalement mot à mot.`;
  }
  if (origin === 'greek') {
    return `Astuce mnémotechnique : Les racines grecques fonctionnent comme des blocs LEGO universels. Retenez le noyau originel pour débloquer automatiquement des dizaines de termes scientifiques et philosophiques apparentés.`;
  }
  if (origin === 'old-english') {
    return `Astuce mnémotechnique : Ce mot appartient au cœur historique du vieil anglais (anglo-saxon). Il exprime une idée concrète, sensorielle ou instinctive de la vie terrestre. Fixez-le avec une image visuelle forte.`;
  }
  return `Astuce mnémotechnique : Après 1066, les clercs et chevaliers normands ont enrichi l'anglais d'un lexique d'autorité et de raffinement. Observez la proximité saisissante avec notre langue française pour un ancrage immédiat.`;
}
