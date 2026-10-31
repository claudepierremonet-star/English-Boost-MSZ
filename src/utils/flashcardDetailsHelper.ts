/**
 * Flashcard Details & Pedagogical Linguistics Helper
 * Provides rich linguistic breakdowns, grammatical categories, mnemonics,
 * syllabification, register indications, and accent guides for each word.
 */

export interface WordLinguisticDetails {
  partOfSpeech: {
    code: 'n.' | 'v.' | 'adj.' | 'adv.' | 'expr.';
    label: string;
    description: string;
    color: string;
  };
  syllables: string;
  register: {
    label: string;
    sublabel: string;
    tone: string;
    badgeColor: string;
  };
  mnemonic: string;
  phoneticsDetailed: {
    ukDescription: string;
    usDescription: string;
    stressRule: string;
  };
}

/**
 * Determine the part of speech from the English term, French definition, and category
 */
export function getWordLinguisticDetails(
  term: string,
  frenchDef: string,
  category: string,
  gradeLevel?: string,
  etymology?: string
): WordLinguisticDetails {
  const cleanTerm = term.trim().toLowerCase();
  const cleanFr = frenchDef.toLowerCase();

  // 1. Part of speech detection
  let code: 'n.' | 'v.' | 'adj.' | 'adv.' | 'expr.' = 'n.';
  let label = 'Nom commun';
  let description = 'Substantif désignant une entité, un concept ou un objet';
  let color = 'bg-blue-500/15 text-blue-300 border-blue-500/30';

  if (cleanTerm.startsWith('to ') || cleanFr.startsWith('faire ') || cleanFr.startsWith('être ') || cleanFr.startsWith('agir ') || cleanFr.endsWith('er') && !cleanFr.startsWith('le ') && !cleanFr.startsWith('un ')) {
    code = 'v.';
    label = 'Verbe d’action / d’état';
    description = 'Exprime une action, un processus ou une posture rhétorique';
    color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else if (cleanTerm.endsWith('ly') || cleanFr.startsWith('de façon ') || cleanFr.startsWith('d’une manière ') || cleanFr.endsWith('ment')) {
    code = 'adv.';
    label = 'Adverbe de modalité';
    description = 'Modifie un verbe, un adjectif ou une proposition entière';
    color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (
    cleanTerm.includes(' ') && !cleanTerm.startsWith('to ') ||
    cleanTerm.includes('-')
  ) {
    code = 'expr.';
    label = 'Locution / Expression';
    description = 'Unité phraséologique figée au sens contextuel précis';
    color = 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30';
  } else if (
    cleanTerm.endsWith('ous') ||
    cleanTerm.endsWith('ful') ||
    cleanTerm.endsWith('less') ||
    cleanTerm.endsWith('ive') ||
    cleanTerm.endsWith('able') ||
    cleanTerm.endsWith('ible') ||
    cleanTerm.endsWith('ic') ||
    cleanTerm.endsWith('al') ||
    cleanFr.startsWith('qui ') ||
    cleanFr.startsWith('digne ') ||
    cleanFr.startsWith('propre à ') ||
    cleanFr.startsWith('relatif à ')
  ) {
    code = 'adj.';
    label = 'Adjectif qualificatif';
    description = 'Précise une propriété distinctive ou une nuance sémantique';
    color = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  }

  // 2. Estimate syllables and primary stress
  const syllables = estimateSyllables(cleanTerm.replace(/^to\s+/, ''));

  // 3. Register according to grade level
  const register = getRegisterInfo(gradeLevel);

  // 4. Memory mnemonic hook
  const mnemonic = buildMnemonic(term, frenchDef, etymology || '');

  // 5. Phonetic accentuation breakdown
  const phoneticsDetailed = buildPhoneticBreakdown(cleanTerm);

  return {
    partOfSpeech: { code, label, description, color },
    syllables,
    register,
    mnemonic,
    phoneticsDetailed
  };
}

/**
 * Break down a word into hyphenated syllables with primary accent highlight
 */
function estimateSyllables(word: string): string {
  if (word.length <= 4) return word.toLowerCase();
  
  // Approximate English syllabification
  const formatted = word
    .replace(/(qu)/gi, '$1-')
    .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz]{2,3})([aeiouy])/gi, '$1$2·$3')
    .replace(/([aeiouy])([bcdfghjklmnpqrstvwxz])([aeiouy])/gi, '$1·$2$3')
    .replace(/··+/g, '·')
    .replace(/^[·-]|[·-]$/g, '');

  return formatted || word;
}

/**
 * Academic register and pedagogical role by school level
 */
function getRegisterInfo(gradeLevel?: string): {
  label: string;
  sublabel: string;
  tone: string;
  badgeColor: string;
} {
  switch (gradeLevel) {
    case '6e':
      return {
        label: 'A1 • Fondamentaux Immédiats (6e)',
        sublabel: 'Vocabulaire concret, visuel et quotidien',
        tone: 'Usage direct en classe et dans les situations simples',
        badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      };
    case '5e':
      return {
        label: 'A2 • Consolidation Pratique (5e)',
        sublabel: 'Description de soi, environnement et loisirs',
        tone: 'Expression usuelle avec connecteurs simples',
        badgeColor: 'text-teal-400 border-teal-500/40 bg-teal-500/10'
      };
    case '4e':
      return {
        label: 'A2+ • Approfondissement Narratif (4e)',
        sublabel: 'Récits au passé, sentiments et opinions',
        tone: 'Lexique narratif et descriptif enrichi',
        badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
      };
    case '3e':
      return {
        label: 'B1 • Seuil d’Autonomie (3e & Brevet)',
        sublabel: 'Argumentation concrète, faits de société',
        tone: 'Registre standard soutenu pour les épreuves orales et écrites',
        badgeColor: 'text-sky-400 border-sky-500/40 bg-sky-500/10'
      };
    case '2nde':
      return {
        label: 'B1+ • Transition Lycée (Seconde)',
        sublabel: 'Abstraction, analyse critique et culture générale',
        tone: 'Vocabulaire conceptuel et formulations académiques',
        badgeColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10'
      };
    case '1re':
      return {
        label: 'B2 • Rhétorique & Débat (Première)',
        sublabel: 'Nuances fines, presse d’actualité et éloquence',
        tone: 'Idéal pour l’expression nuancée et les synthèses de documents',
        badgeColor: 'text-violet-400 border-violet-500/40 bg-violet-500/10'
      };
    case 'terminale':
      return {
        label: 'C1 • Érudition & Concours (Terminale & Post-Bac)',
        sublabel: 'Précision stylistique, idiomes rares et diplomatie',
        tone: 'Niveau d’excellence équivalent aux éditoriaux du Financial Times',
        badgeColor: 'text-[#f2ca50] border-[#f2ca50]/50 bg-[#f2ca50]/15'
      };
    default:
      return {
        label: 'CECRL Avancé',
        sublabel: 'Lexique immersif et contextuel',
        tone: 'Emploi polyvalent en contexte authentique',
        badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      };
  }
}

/**
 * Builds an intuitive mnemonic memory hook
 */
function buildMnemonic(term: string, frenchDef: string, etymology: string): string {
  const cleanTerm = term.toLowerCase();
  
  if (etymology.includes('Latin:')) {
    const root = etymology.split('Latin:')[1]?.split(';')[0]?.split('.')[0]?.trim();
    if (root) {
      return `Rapprochez « ${term} » de sa racine latine (${root}) : visualise la filiation historique directe avec le français savant.`;
    }
  }

  if (etymology.includes('Greek:')) {
    const root = etymology.split('Greek:')[1]?.split(';')[0]?.split('.')[0]?.trim();
    if (root) {
      return `Pensez à l'origine grecque (${root}) qui structure nos concepts scientifiques et philosophiques.`;
    }
  }

  if (etymology.includes('Old French:') || etymology.includes('Anglo-Norman:')) {
    return `Ce mot a voyagé de l'ancien français vers l'anglais après 1066. Observez l'écho transparent avec la langue française !`;
  }

  if (cleanTerm.endsWith('tion') || cleanTerm.endsWith('sion')) {
    return `Terminaison en -tion : même base de sens qu'en français, avec un accent tonique situé impérativement sur l'avant-dernière syllabe.`;
  }

  return `Visualisez une scène concrète illustrant « ${term} » : mémorisez l'image associée à « ${frenchDef.split('.')[0]} » pour fixer la trace mnésique.`;
}

/**
 * Explains UK Received Pronunciation vs US General American accents
 */
function buildPhoneticBreakdown(term: string): {
  ukDescription: string;
  usDescription: string;
  stressRule: string;
} {
  const hasR = term.includes('r');
  const hasT = term.includes('t');
  const hasO = term.includes('o');

  let ukDescription = '🇬🇧 Oxford RP : Non-rhôtique (voyelles pures, pas de [r] en fin de syllabe).';
  let usDescription = '🇺🇸 General American : Rhôtisme rétroflexe marqué (/r/ bien articulé).';

  if (hasT && !term.startsWith('th')) {
    usDescription += ' Le "t" intervocalique se transforme en flap tap [ɾ].';
  }

  if (hasO) {
    ukDescription += ' Voyelle /ɒ/ brève arrondie.';
    usDescription += ' Déplacement vers la voyelle non arrondie /ɑː/.';
  }

  const stressRule = term.length > 7
    ? 'Accentuation primaire dominante sur la 1re ou 2e syllabe avec affaiblissement schwa (/ə/) des voyelles atones.'
    : 'Accent tonique franc et net, à dynamiser dès l’attaque de la syllabe principale.';

  return { ukDescription, usDescription, stressRule };
}
