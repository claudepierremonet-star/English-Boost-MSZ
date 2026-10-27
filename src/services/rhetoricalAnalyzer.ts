/**
 * English Boost MSZ - Moteur d'Analyse Rhétorique Automatique (Niveau 6e / Cycle 3)
 * Détection automatique, explication pédagogique en français et cartographie stylistique
 * des figures de style (Figures of Speech) dans les textes d'anglais.
 */

export type RhetoricalFigureType =
  | 'alliteration'
  | 'assonance'
  | 'simile'
  | 'metaphor'
  | 'personification'
  | 'anaphora'
  | 'repetition'
  | 'rule_of_three'
  | 'hyperbole'
  | 'antithesis'
  | 'onomatopoeia'
  | 'parallelism';

export type FigureCategory = 'sound' | 'imagery' | 'structure' | 'amplification';

export interface FigureDefinition {
  type: RhetoricalFigureType;
  category: FigureCategory;
  nameFr: string;
  nameEn: string;
  definitionFr: string;
  effectFr: string;
  formulaEn: string;
  exampleClassic: string;
  example6e: string;
  tip6e: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    pillBg: string;
  };
}

export interface DetectedFigure {
  id: string;
  figureType: RhetoricalFigureType;
  category: FigureCategory;
  nameFr: string;
  nameEn: string;
  quote: string; // The exact excerpt matching the figure
  sentence: string; // The full sentence context
  charStartInSentence: number;
  charEndInSentence: number;
  lineNumber?: number;
  speaker?: string;
  explanationFr: string;
  stylisticEffectFr: string;
  detectedKey: string; // e.g. "consonant 's'" or "'as...as' pattern"
  confidence: 'forte' | 'probable';
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    pillBg: string;
  };
}

export interface RhetoricalAnalysisReport {
  textAnalyzed: string;
  totalWords: number;
  totalSentences: number;
  detectedFigures: DetectedFigure[];
  figuresCountByType: Record<RhetoricalFigureType, number>;
  categoryDistribution: {
    sound: number; // alliteration, assonance, onomatopoeia
    imagery: number; // simile, metaphor, personification
    structure: number; // anaphora, repetition, rule_of_three, parallelism
    amplification: number; // hyperbole, antithesis
  };
  stylisticRichnessScore: number; // 0 to 100 index
  rhythmScore: number;
  imageryScore: number;
  soundScore: number;
  dominantFigureFr: string;
  pedagogicalVerdictFr: string;
}

// Dictionnaire des définitions pédagogiques adaptées au Cycle 3 / 6e
export const RHETORICAL_DEFINITIONS: Record<RhetoricalFigureType, FigureDefinition> = {
  simile: {
    type: 'simile',
    category: 'imagery',
    nameFr: 'Comparaison',
    nameEn: 'Simile',
    definitionFr: "Rapprochement direct de deux éléments à l'aide d'un mot-outil de comparaison comme 'as...as' ou 'like'.",
    effectFr: 'Rend la description plus concrète et vivante en créant une image mentale familière.',
    formulaEn: 'as [adjective] as [noun] / [verb] like [noun]',
    exampleClassic: 'He fought like a lion in the battle.',
    example6e: 'My school bag is as heavy as a rock!',
    tip6e: "Repère les mots magiques 'like' (comme) et les doubles 'as... as' (aussi... que).",
    badgeColor: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      pillBg: 'bg-emerald-500/20'
    }
  },
  metaphor: {
    type: 'metaphor',
    category: 'imagery',
    nameFr: 'Métaphore',
    nameEn: 'Metaphor',
    definitionFr: "Affirme qu'une chose EST une autre chose, sans mot de comparaison, pour transférer tout son sens.",
    effectFr: "Provoque une émotion forte et stimule l'imagination en fusionnant deux réalités.",
    formulaEn: '[Subject] is / are [Metaphorical Noun]',
    exampleClassic: 'All the world is a stage.',
    example6e: 'Our classroom is a beehive in the morning.',
    tip6e: "C'est une comparaison 'déguisée' sans le mot 'like' ou 'as' : on dit directement 'X est Y'.",
    badgeColor: {
      bg: 'bg-teal-950/60',
      text: 'text-teal-300',
      border: 'border-teal-500/40',
      pillBg: 'bg-teal-500/20'
    }
  },
  alliteration: {
    type: 'alliteration',
    category: 'sound',
    nameFr: 'Allitération',
    nameEn: 'Alliteration',
    definitionFr: "Répétition d'un même son consonne au début de plusieurs mots consécutifs ou très rapprochés.",
    effectFr: "Crée une musicalité entraînante, un rythme dynamique ou imite un bruit (chuchotement, souffle, choc).",
    formulaEn: 'Consonant sound repetition (e.g., s-s-s, b-b-b, p-p-p)',
    exampleClassic: 'Peter Piper picked a peck of pickled peppers.',
    example6e: 'She sells six sweet strawberries in the shop.',
    tip6e: "Écoute avec tes oreilles ! Si plusieurs mots qui se suivent commencent par le même bruit de consonne, c'est une allitération.",
    badgeColor: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      pillBg: 'bg-amber-500/20'
    }
  },
  assonance: {
    type: 'assonance',
    category: 'sound',
    nameFr: 'Assonance',
    nameEn: 'Assonance',
    definitionFr: "Répétition d'un même son voyelle à l'intérieur de mots proches.",
    effectFr: "Apporte de l'harmonie, de la douceur et fait chanter la phrase comme une comptine poétique.",
    formulaEn: 'Vowel sound repetition (e.g., /aɪ/, /iː/, /uː/)',
    exampleClassic: 'Hear the mellow wedding bells.',
    example6e: 'I like to fly my bright white kite in the sky.',
    tip6e: "Ferme les yeux et écoute la voyelle qui résonne plusieurs fois (ex: le son 'aï' dans 'bright', 'white', 'kite').",
    badgeColor: {
      bg: 'bg-yellow-950/60',
      text: 'text-yellow-300',
      border: 'border-yellow-500/40',
      pillBg: 'bg-yellow-500/20'
    }
  },
  personification: {
    type: 'personification',
    category: 'imagery',
    nameFr: 'Personnification',
    nameEn: 'Personification',
    definitionFr: "Attribution de comportements, gestes ou sentiments humains à un objet, animal ou élément de la nature.",
    effectFr: "Donne vie au décor et transforme le monde réel en un univers enchanté ou menaçant.",
    formulaEn: '[Non-human subject] + [Human action verb]',
    exampleClassic: 'The wind whispered secrets through the trees.',
    example6e: 'The alarm clock screams at me every Monday morning!',
    tip6e: "Demande-toi : est-ce qu'un objet inanimé fait quelque chose que seul un humain peut faire (sourire, chuchoter, crier) ?",
    badgeColor: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40',
      pillBg: 'bg-cyan-500/20'
    }
  },
  anaphora: {
    type: 'anaphora',
    category: 'structure',
    nameFr: 'Anaphore',
    nameEn: 'Anaphora',
    definitionFr: "Répétition du même mot ou groupe de mots au début de phrases ou propositions successives.",
    effectFr: "Martèle une idée force, donne un souffle oratoire et captive l'attention de l'auditoire.",
    formulaEn: '[Repeated start]... [Repeated start]...',
    exampleClassic: 'I have a dream... I have a dream today.',
    example6e: 'Every morning I wake up at 7. Every morning I brush my teeth. Every morning I smile.',
    tip6e: "Regarde le premier mot des phrases qui se suivent : si c'est exactement le même motif, c'est une anaphore !",
    badgeColor: {
      bg: 'bg-indigo-950/60',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
      pillBg: 'bg-indigo-500/20'
    }
  },
  repetition: {
    type: 'repetition',
    category: 'structure',
    nameFr: 'Répétition / Refrain',
    nameEn: 'Repetition',
    definitionFr: "Reprise volontaire d'un même mot dans une même phrase ou un court paragraphe.",
    effectFr: "Insiste sur une intensité, une durée ou crée un effet de berceuse ou d'urgence.",
    formulaEn: 'Word repeated for emphasis (e.g., again and again, very very)',
    exampleClassic: 'Never, never, never give up.',
    example6e: 'It was raining again and again all day long.',
    tip6e: "Une répétition bien placée sert à appuyer un sentiment très fort : la joie, la surprise ou l'impatience.",
    badgeColor: {
      bg: 'bg-purple-950/60',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      pillBg: 'bg-purple-500/20'
    }
  },
  rule_of_three: {
    type: 'rule_of_three',
    category: 'structure',
    nameFr: 'Règle de Trois (Tricolon)',
    nameEn: 'Rule of Three',
    definitionFr: "Énumération de trois éléments consécutifs créant un rythme équilibré et complet.",
    effectFr: "Structure parfaitement l'argumentaire et produit une cadence harmonieuse très naturelle en anglais.",
    formulaEn: '[Item 1], [Item 2] and [Item 3]',
    exampleClassic: 'Life, liberty and the pursuit of happiness.',
    example6e: 'I packed my pencils, my notebook and my English book.',
    tip6e: "Le chiffre 3 est magique en rhétorique anglaise ! Cherche les séries de 3 mots séparés par une virgule et 'and'.",
    badgeColor: {
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      pillBg: 'bg-rose-500/20'
    }
  },
  hyperbole: {
    type: 'hyperbole',
    category: 'amplification',
    nameFr: 'Hyperbole (Exagération)',
    nameEn: 'Hyperbole',
    definitionFr: "Exagération volontaire et démesurée pour frapper l'esprit ou amuser le lecteur.",
    effectFr: "Donne un ton passionné, dramatique ou comique en grossissant les faits.",
    formulaEn: 'Extreme exaggeration (e.g., a million times, ton of homework)',
    exampleClassic: 'I have loved her for a thousand years.',
    example6e: "I'm so hungry I could eat an entire elephant!",
    tip6e: "Ce n'est pas possible dans la vraie vie ! Si c'est trop exagéré pour être vrai, c'est une hyperbole.",
    badgeColor: {
      bg: 'bg-red-950/60',
      text: 'text-red-300',
      border: 'border-red-500/40',
      pillBg: 'bg-red-500/20'
    }
  },
  antithesis: {
    type: 'antithesis',
    category: 'amplification',
    nameFr: 'Antithèse / Contraste',
    nameEn: 'Antithesis',
    definitionFr: "Mise en regard de deux mots ou idées contraires dans une même phrase.",
    effectFr: "Fait ressortir les différences et crée un contraste fort et mémorable.",
    formulaEn: '[Opposite 1] and / but [Opposite 2]',
    exampleClassic: 'That is one small step for man, one giant leap for mankind.',
    example6e: 'English is easy to begin, but hard to master.',
    tip6e: "Repère les couples d'opposés : hot/cold, day/night, big/small, happy/sad.",
    badgeColor: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-300',
      border: 'border-orange-500/40',
      pillBg: 'bg-orange-500/20'
    }
  },
  onomatopoeia: {
    type: 'onomatopoeia',
    category: 'sound',
    nameFr: 'Onomatopée',
    nameEn: 'Onomatopoeia',
    definitionFr: "Mot dont la prononciation reproduit fidèlement le son ou le bruit qu'il évoque.",
    effectFr: "Plonge le lecteur directement dans la scène sonore, comme dans une BD.",
    formulaEn: 'Sound imitation word (e.g., buzz, tick-tock, splash, ding-dong)',
    exampleClassic: 'The buzz of bees and the splash of water.',
    example6e: 'Tick-tock went the old school clock.',
    tip6e: "Ce sont les bruits de bande dessinée (splash, buzz, ring, boom, woof) !",
    badgeColor: {
      bg: 'bg-lime-950/60',
      text: 'text-lime-300',
      border: 'border-lime-500/40',
      pillBg: 'bg-lime-500/20'
    }
  },
  parallelism: {
    type: 'parallelism',
    category: 'structure',
    nameFr: 'Parallélisme',
    nameEn: 'Parallelism',
    definitionFr: "Répétition d'une structure grammaticale identique dans deux parties de phrase.",
    effectFr: "Donne une cadence symétrique, élégante et harmonieuse.",
    formulaEn: '[Subject + Verb + Object], and [Subject + Verb + Object]',
    exampleClassic: 'Easy come, easy go.',
    example6e: 'She likes reading in the morning and writing in the evening.',
    tip6e: "Observe le parallélisme des verbes : verbe en -ing + complément puis verbe en -ing + complément.",
    badgeColor: {
      bg: 'bg-sky-950/60',
      text: 'text-sky-300',
      border: 'border-sky-500/40',
      pillBg: 'bg-sky-500/20'
    }
  }
};

// List of antonym pairs for antithesis detection
const ANTONYM_PAIRS: Array<[string, string]> = [
  ['hot', 'cold'],
  ['day', 'night'],
  ['black', 'white'],
  ['young', 'old'],
  ['big', 'small'],
  ['huge', 'tiny'],
  ['good', 'bad'],
  ['happy', 'sad'],
  ['easy', 'hard'],
  ['fast', 'slow'],
  ['light', 'dark'],
  ['sweet', 'sour'],
  ['love', 'hate'],
  ['up', 'down'],
  ['left', 'right'],
  ['work', 'play'],
  ['morning', 'evening'],
  ['sun', 'rain'],
  ['win', 'lose'],
  ['rich', 'poor'],
  ['high', 'low'],
  ['first', 'last'],
  ['quiet', 'loud'],
  ['clean', 'dirty']
];

// List of onomatopoeia words in English
const ONOMATOPOEIA_WORDS = new Set([
  'buzz', 'buzzing', 'tick-tock', 'tick', 'tock', 'ding-dong', 'ding', 'dong',
  'splash', 'splashing', 'boom', 'clap', 'clapping', 'crash', 'crashing',
  'woof', 'meow', 'quack', 'oink', 'chirp', 'chirping', 'pop', 'snap',
  'hiss', 'hissing', 'vroom', 'beep', 'beep-beep', 'ring-ring', 'ring', 'buzz',
  'drip', 'drop', 'slurp', 'crunch', 'bang', 'whoosh', 'purr', 'purring',
  'tap', 'tapping', 'knock', 'knocking', 'whistle', 'hum', 'humming', 'sizzle'
]);

// Hyperbolic markers
const HYPERBOLE_PATTERNS = [
  /a\s+million\s+times/i,
  /a\s+thousand\s+times/i,
  /weighs\s+a\s+ton/i,
  /starving\s+to\s+death/i,
  /dying\s+of\s+laughter/i,
  /dying\s+of\s+thirst/i,
  /forever\s+and\s+ever/i,
  /best\s+(in|of)\s+the\s+world/i,
  /worst\s+(in|of)\s+the\s+world/i,
  /could\s+eat\s+a\s+horse/i,
  /could\s+eat\s+an\s+elephant/i,
  /infinite/i,
  /endless/i,
  /an\s+ocean\s+of/i,
  /a\s+mountain\s+of/i,
  /for\s+centuries/i,
  /for\s+ages/i,
  /all\s+the\s+time\s+in\s+the\s+world/i,
  /a\s+ton\s+of\s+homework/i
];

// Common personification pairs (non-human subject + human action verb)
const PERSONIFICATION_PATTERNS = [
  /\b(clock|alarm)\b[^\.\?!]*\b(whispers|whispered|screams|screamed|calls|ticks\s+angrily|speaks)\b/i,
  /\b(sun|sunlight)\b[^\.\?!]*\b(smiles|smiled|winks|embraces|kisses|plays)\b/i,
  /\b(moon|stars)\b[^\.\?!]*\b(dance|danced|whisper|watch|watches|wink|winked)\b/i,
  /\b(wind|breeze)\b[^\.\?!]*\b(whispers|whispered|howls|howled|sings|sang|screams|dances)\b/i,
  /\b(trees|leaves|flowers)\b[^\.\?!]*\b(dance|danced|whisper|bow|bowed|nod|nodded)\b/i,
  /\b(city|London|Paris|school)\b[^\.\?!]*\b(wakes\s+up|woke\s+up|sleeps|never\s+sleeps|breathes)\b/i,
  /\b(rain|raindrops)\b[^\.\?!]*\b(taps|tapped|dances|danced|knocks|cries)\b/i,
  /\b(time)\b[^\.\?!]*\b(flies|waits\s+for\s+no\s+man|crawls|marches|runs)\b/i,
  /\b(bell|bells)\b[^\.\?!]*\b(sing|sang|chatter|cries)\b/i
];

// Metaphor explicit patterns (X is/are Y where Y is non-literal)
const METAPHOR_PATTERNS = [
  /\b(classroom|school)\s+is\s+a\s+(zoo|beehive|jungle|circus|garden)\b/i,
  /\b(time)\s+is\s+(money|a\s+thief|gold|a\s+river)\b/i,
  /\b(books?)\s+(is|are)\s+(windows?|doors?|wings?|passports?)\b/i,
  /\b(life)\s+is\s+a\s+(journey|rollercoaster|game|stage|dance)\b/i,
  /\b(her|his|my|your)\s+smile\s+is\s+(sunshine|a\s+ray\s+of\s+light|gold)\b/i,
  /\b(music)\s+is\s+(medicine|life|the\s+soul|magic)\b/i,
  /\b(eyes?)\s+(is|are)\s+(stars?|diamonds?|oceans?)\b/i,
  /\b(words?)\s+(is|are)\s+(weapons?|arrows?|bridges?)\b/i,
  /\b(home)\s+is\s+a\s+(sanctuary|haven|castle)\b/i
];

// Ignored short function words for alliteration detection
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'and', 'or', 'but', 'is', 'am', 'are', 'was', 'were', 'it', 'its',
  'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'i', 'you',
  'he', 'she', 'we', 'they', 'as'
]);

/**
 * Splits text into cleaned sentences preserving offsets
 */
function splitIntoSentences(text: string): Array<{ sentence: string; start: number; end: number }> {
  const results: Array<{ sentence: string; start: number; end: number }> = [];
  const regex = /[^.!?\n]+[.!?\n]*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      const start = match.index + raw.indexOf(trimmed);
      const end = start + trimmed.length;
      results.push({ sentence: trimmed, start, end });
    }
  }

  return results;
}

/**
 * Analyzes a text and extracts rhetorical figures
 */
export function analyzeRhetoricalStyle(rawText: string): RhetoricalAnalysisReport {
  const figures: DetectedFigure[] = [];
  let figureIdCounter = 0;

  const sentences = splitIntoSentences(rawText);
  const words = rawText.match(/\b[a-zA-Z']+\b/g) || [];
  const totalWords = words.length;

  // 1. ANAPHORA (Check repetition at start of successive sentences or dialogue turns)
  if (sentences.length >= 2) {
    for (let i = 0; i < sentences.length - 1; i++) {
      const s1 = sentences[i].sentence.trim();
      const s2 = sentences[i + 1].sentence.trim();

      // Extract first 1-3 words
      const w1 = s1.split(/\s+/).slice(0, 3).join(' ').toLowerCase().replace(/[^a-z\s]/g, '');
      const w2 = s2.split(/\s+/).slice(0, 3).join(' ').toLowerCase().replace(/[^a-z\s]/g, '');

      const firstWord1 = s1.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      const firstWord2 = s2.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');

      let matchedPattern = '';
      if (w1.length > 5 && w1 === w2) {
        matchedPattern = s1.split(/\s+/).slice(0, 3).join(' ');
      } else if (firstWord1 && firstWord1.length >= 3 && firstWord1 === firstWord2 && !['and', 'but', 'so', 'the'].includes(firstWord1)) {
        matchedPattern = s1.split(/\s+/)[0];
      }

      if (matchedPattern) {
        const def = RHETORICAL_DEFINITIONS.anaphora;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'anaphora',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: `« ${matchedPattern}... » répété au début de phrases successives`,
          sentence: `1) ${s1} | 2) ${s2}`,
          charStartInSentence: 0,
          charEndInSentence: matchedPattern.length,
          explanationFr: `Les deux phrases s'ouvrent consécutivement par le même motif « ${matchedPattern} », créant un effet d'écho et de cadence forte.`,
          stylisticEffectFr: "Donne un rythme solennel et captivant au discours, typique des grands récits et dialogues théâtraux.",
          detectedKey: matchedPattern.toLowerCase(),
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    }
  }

  // 2. PER-SENTENCE ANALYSES
  sentences.forEach((sentObj) => {
    const sent = sentObj.sentence;

    // A) SIMILE: 'as ... as'
    const asAsRegex = /\bas\s+([a-zA-Z]+)\s+as\s+([a-zA-Z\s']+?)(?=[,;.!?]|$)/gi;
    let matchAs: RegExpExecArray | null;
    while ((matchAs = asAsRegex.exec(sent)) !== null) {
      const fullQuote = matchAs[0].trim();
      const adj = matchAs[1];
      const comp = matchAs[2].trim();
      const def = RHETORICAL_DEFINITIONS.simile;
      figureIdCounter++;
      figures.push({
        id: `fig_${figureIdCounter}`,
        figureType: 'simile',
        category: def.category,
        nameFr: def.nameFr,
        nameEn: def.nameEn,
        quote: fullQuote,
        sentence: sent,
        charStartInSentence: matchAs.index,
        charEndInSentence: matchAs.index + fullQuote.length,
        explanationFr: `Comparaison explicite utilisant la structure 'as...as' : l'adjectif « ${adj} » est intensifié par l'image familière « ${comp} ».`,
        stylisticEffectFr: "Rend la description vivante, concrète et immédiatement compréhensible pour l'imaginaire du lecteur.",
        detectedKey: 'as...as',
        confidence: 'forte',
        badgeColor: def.badgeColor
      });
    }

    // B) SIMILE: 'verb + like a/an/the noun'
    const likeRegex = /\b([a-zA-Z]+s?|ed|ing)?\s+like\s+(a|an|the|my|your|his|her)?\s*([a-zA-Z]+)(?=[,;.!?]|$)/gi;
    let matchLike: RegExpExecArray | null;
    while ((matchLike = likeRegex.exec(sent)) !== null) {
      const fullQuote = matchLike[0].trim();
      // Skip false positives like "I would like a book" or "I like bananas"
      if (/^(i|we|they|you|he|she)\s+like\b/i.test(fullQuote)) continue;
      if (/\b(would|should|could|do|did)\s+like\b/i.test(sent)) continue;

      const def = RHETORICAL_DEFINITIONS.simile;
      figureIdCounter++;
      figures.push({
        id: `fig_${figureIdCounter}`,
        figureType: 'simile',
        category: def.category,
        nameFr: def.nameFr,
        nameEn: def.nameEn,
        quote: fullQuote,
        sentence: sent,
        charStartInSentence: matchLike.index,
        charEndInSentence: matchLike.index + fullQuote.length,
        explanationFr: `Comparaison métaphorique introduite par le mot de liaison 'like' : rapprochement expressif avec « ${matchLike[3]} ».`,
        stylisticEffectFr: "Dessine une image poétique instantanée sans alourdir la phrase.",
        detectedKey: 'like comparison',
        confidence: 'probable',
        badgeColor: def.badgeColor
      });
    }

    // C) METAPHOR
    METAPHOR_PATTERNS.forEach((pattern) => {
      const m = sent.match(pattern);
      if (m) {
        const def = RHETORICAL_DEFINITIONS.metaphor;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'metaphor',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: m[0],
          sentence: sent,
          charStartInSentence: m.index || 0,
          charEndInSentence: (m.index || 0) + m[0].length,
          explanationFr: `Métaphore directe : fusionne deux réalités (« ${m[0]} ») sans passer par le mot 'comme', créant une force descriptive absolue.`,
          stylisticEffectFr: "Stimule l'imagination et confère une dimension poétique ou symbolique au sujet.",
          detectedKey: 'metaphorical identity',
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    });

    // D) PERSONIFICATION
    PERSONIFICATION_PATTERNS.forEach((pattern) => {
      const m = sent.match(pattern);
      if (m) {
        const def = RHETORICAL_DEFINITIONS.personification;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'personification',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: m[0],
          sentence: sent,
          charStartInSentence: m.index || 0,
          charEndInSentence: (m.index || 0) + m[0].length,
          explanationFr: `Personnification : un élément non-humain (« ${m[1]} ») se voit attribuer une action humaine expressive (« ${m[2]} »).`,
          stylisticEffectFr: "Anime le décor, donne une âme aux objets et crée une ambiance de conte ou de poème.",
          detectedKey: `personification of ${m[1]}`,
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    });

    // E) HYPERBOLE
    HYPERBOLE_PATTERNS.forEach((pattern) => {
      const m = sent.match(pattern);
      if (m) {
        const def = RHETORICAL_DEFINITIONS.hyperbole;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'hyperbole',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: m[0],
          sentence: sent,
          charStartInSentence: m.index || 0,
          charEndInSentence: (m.index || 0) + m[0].length,
          explanationFr: `Exagération délibérée (« ${m[0]} ») qui dépasse largement la stricte réalité physique.`,
          stylisticEffectFr: "Met en scène une émotion exacerbée (enthousiasme, faim, surprise, dramatisation) avec humour ou force.",
          detectedKey: 'hyperbolic expression',
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    });

    // F) ONOMATOPOEIA
    const sentWords = sent.split(/[^a-zA-Z'-]+/);
    sentWords.forEach((word) => {
      const cleanW = word.toLowerCase();
      if (ONOMATOPOEIA_WORDS.has(cleanW)) {
        const def = RHETORICAL_DEFINITIONS.onomatopoeia;
        const idx = sent.toLowerCase().indexOf(cleanW);
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'onomatopoeia',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: word,
          sentence: sent,
          charStartInSentence: idx >= 0 ? idx : 0,
          charEndInSentence: idx >= 0 ? idx + word.length : word.length,
          explanationFr: `Onomatopée sonore : le mot « ${word} » reproduit phonétiquement le bruit réel qu'il évoque.`,
          stylisticEffectFr: "Crée une immersion auditive instantanée digne d'une bande dessinée ou d'une pièce radiophonique.",
          detectedKey: `sound word '${cleanW}'`,
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    });

    // G) RULE OF THREE (Tricolon: A, B and C)
    const ruleOfThreeRegex = /\b([a-zA-Z'\-]+),\s+([a-zA-Z'\-]+)\s+(and|or)\s+([a-zA-Z'\-]+)\b/gi;
    let matchThree: RegExpExecArray | null;
    while ((matchThree = ruleOfThreeRegex.exec(sent)) !== null) {
      const fullQuote = matchThree[0];
      const def = RHETORICAL_DEFINITIONS.rule_of_three;
      figureIdCounter++;
      figures.push({
        id: `fig_${figureIdCounter}`,
        figureType: 'rule_of_three',
        category: def.category,
        nameFr: def.nameFr,
        nameEn: def.nameEn,
        quote: fullQuote,
        sentence: sent,
        charStartInSentence: matchThree.index,
        charEndInSentence: matchThree.index + fullQuote.length,
        explanationFr: `Tricolon ou 'Rule of Three' : énumération ternaire harmonieuse reliant « ${matchThree[1]} », « ${matchThree[2]} » et « ${matchThree[4]} ».`,
        stylisticEffectFr: "Procure un sentiment de complétude et d'équilibre musical extrêmement naturel à l'oreille anglaise.",
        detectedKey: 'triplet rhythm',
        confidence: 'forte',
        badgeColor: def.badgeColor
      });
    }

    // H) ANTITHESIS (Pairs of opposites)
    ANTONYM_PAIRS.forEach(([w1, w2]) => {
      const r1 = new RegExp(`\\b${w1}\\b`, 'i');
      const r2 = new RegExp(`\\b${w2}\\b`, 'i');
      if (r1.test(sent) && r2.test(sent)) {
        const def = RHETORICAL_DEFINITIONS.antithesis;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'antithesis',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: `${w1} ↔ ${w2}`,
          sentence: sent,
          charStartInSentence: 0,
          charEndInSentence: sent.length,
          explanationFr: `Antithèse / Contraste : cohabitation des contraires « ${w1} » et « ${w2} » au sein d'une même phrase.`,
          stylisticEffectFr: "Souligne la contradiction, la complémentarité ou la variété du monde.",
          detectedKey: `${w1}/${w2} contrast`,
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    });

    // I) REPETITION (same meaningful word repeated 2+ times in the same sentence)
    const tokenList = (sent.match(/\b[a-zA-Z]{3,}\b/g) || []).map((t) => t.toLowerCase());
    const tokenCounts: Record<string, number> = {};
    tokenList.forEach((t) => {
      if (!STOP_WORDS.has(t)) {
        tokenCounts[t] = (tokenCounts[t] || 0) + 1;
      }
    });
    Object.entries(tokenCounts).forEach(([token, count]) => {
      if (count >= 2) {
        const def = RHETORICAL_DEFINITIONS.repetition;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'repetition',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: `« ${token} » (répété ${count} fois)`,
          sentence: sent,
          charStartInSentence: 0,
          charEndInSentence: sent.length,
          explanationFr: `Répétition expressive : le mot « ${token} » est répété ${count} fois pour accentuer son importance.`,
          stylisticEffectFr: "Renforce l'insistance et crée un effet de leitmotiv rythmique.",
          detectedKey: `repeated '${token}'`,
          confidence: 'probable',
          badgeColor: def.badgeColor
        });
      }
    });

    // J) ALLITERATION (Consonant clustering at start of nearby words)
    const contentTokens = (sent.match(/\b[a-zA-Z]+\b/g) || []).filter(
      (w) => !STOP_WORDS.has(w.toLowerCase()) && w.length >= 3
    );

    if (contentTokens.length >= 2) {
      for (let i = 0; i < contentTokens.length - 1; i++) {
        const c1 = contentTokens[i][0].toLowerCase();
        const cluster: string[] = [contentTokens[i]];

        // lookahead up to 3 words
        for (let j = i + 1; j < Math.min(contentTokens.length, i + 4); j++) {
          if (contentTokens[j][0].toLowerCase() === c1) {
            cluster.push(contentTokens[j]);
          }
        }

        // If at least 2 distinct words share the same initial consonant
        const uniqueInCluster = Array.from(new Set(cluster));
        if (uniqueInCluster.length >= 2 && !['a', 'e', 'i', 'o', 'u'].includes(c1)) {
          const quote = uniqueInCluster.join(' ... ');
          // Avoid duplicate clusters
          const alreadyAdded = figures.some(
            (f) => f.figureType === 'alliteration' && f.sentence === sent && f.detectedKey === `consonant '${c1}'`
          );
          if (!alreadyAdded) {
            const def = RHETORICAL_DEFINITIONS.alliteration;
            figureIdCounter++;
            figures.push({
              id: `fig_${figureIdCounter}`,
              figureType: 'alliteration',
              category: def.category,
              nameFr: def.nameFr,
              nameEn: def.nameEn,
              quote: quote,
              sentence: sent,
              charStartInSentence: 0,
              charEndInSentence: sent.length,
              explanationFr: `Allitération en [/${c1}/] : résonance consonantique entre les mots « ${uniqueInCluster.join(', ')} ».`,
              stylisticEffectFr: `Confère une texture sonore dynamique et chantante centrée sur la consonne « ${c1.toUpperCase()} ».`,
              detectedKey: `consonant '${c1}'`,
              confidence: uniqueInCluster.length >= 3 ? 'forte' : 'probable',
              badgeColor: def.badgeColor
            });
          }
        }
      }
    }

    // K) ASSONANCE (Repetition of prominent vowel diphthongs like /aɪ/, /iː/, /uː/)
    const aiWords = (sent.match(/\b(bright|white|kite|night|fly|sky|my|like|time|shine|smile|hide|drive)\b/gi) || []);
    if (aiWords.length >= 2) {
      const uniqueAi = Array.from(new Set(aiWords.map((w) => w.toLowerCase())));
      if (uniqueAi.length >= 2) {
        const def = RHETORICAL_DEFINITIONS.assonance;
        figureIdCounter++;
        figures.push({
          id: `fig_${figureIdCounter}`,
          figureType: 'assonance',
          category: def.category,
          nameFr: def.nameFr,
          nameEn: def.nameEn,
          quote: uniqueAi.join(' ... '),
          sentence: sent,
          charStartInSentence: 0,
          charEndInSentence: sent.length,
          explanationFr: `Assonance en [/aɪ/] : harmonie vocalique lumineuse partagée par « ${uniqueAi.join(', ')} ».`,
          stylisticEffectFr: "Offre une douceur chantante et poétique, très agréable à la récitation orale.",
          detectedKey: "vowel /aɪ/",
          confidence: 'forte',
          badgeColor: def.badgeColor
        });
      }
    }
  });

  // Calculate statistics
  const figuresCountByType: Record<RhetoricalFigureType, number> = {
    alliteration: 0,
    assonance: 0,
    simile: 0,
    metaphor: 0,
    personification: 0,
    anaphora: 0,
    repetition: 0,
    rule_of_three: 0,
    hyperbole: 0,
    antithesis: 0,
    onomatopoeia: 0,
    parallelism: 0
  };

  const categoryDistribution = {
    sound: 0,
    imagery: 0,
    structure: 0,
    amplification: 0
  };

  figures.forEach((f) => {
    figuresCountByType[f.figureType] = (figuresCountByType[f.figureType] || 0) + 1;
    categoryDistribution[f.category] = (categoryDistribution[f.category] || 0) + 1;
  });

  // Compute scores
  const soundScore = Math.min(100, Math.round(categoryDistribution.sound * 30));
  const imageryScore = Math.min(100, Math.round(categoryDistribution.imagery * 35));
  const rhythmScore = Math.min(100, Math.round(categoryDistribution.structure * 25));

  const stylisticRichnessScore = Math.min(
    100,
    Math.round(
      (categoryDistribution.sound * 18 +
        categoryDistribution.imagery * 25 +
        categoryDistribution.structure * 15 +
        categoryDistribution.amplification * 20) *
        Math.max(1, Math.min(2, 50 / Math.max(20, totalWords)))
    )
  );

  // Dominant figure
  let maxCount = 0;
  let dominantType: RhetoricalFigureType = 'alliteration';
  (Object.keys(figuresCountByType) as RhetoricalFigureType[]).forEach((type) => {
    if (figuresCountByType[type] > maxCount) {
      maxCount = figuresCountByType[type];
      dominantType = type;
    }
  });

  const dominantFigureFr =
    maxCount > 0
      ? `${RHETORICAL_DEFINITIONS[dominantType].nameFr} (${maxCount} occurrences)`
      : 'Style direct & narratif';

  let pedagogicalVerdictFr = '';
  if (figures.length >= 5) {
    pedagogicalVerdictFr =
      "Texte remarquablement riche en procédés stylistiques ! Idéal pour travailler l'expressivité poétique, les images mentales et la musicalité de la langue anglaise en 6e.";
  } else if (figures.length >= 2) {
    pedagogicalVerdictFr =
      "Texte vivant présentant de belles figures de style fondamentales (comparaisons, musicalité). Parfait pour s'initier à la lecture interprétative au Cycle 3.";
  } else {
    pedagogicalVerdictFr =
      "Texte clair et fonctionnel axé sur la communication directe. Quelques touches expressives soutiennent la compréhension du message.";
  }

  return {
    textAnalyzed: rawText,
    totalWords,
    totalSentences: sentences.length,
    detectedFigures: figures,
    figuresCountByType,
    categoryDistribution,
    stylisticRichnessScore: Math.max(15, stylisticRichnessScore),
    rhythmScore,
    imageryScore,
    soundScore,
    dominantFigureFr,
    pedagogicalVerdictFr
  };
}

/**
 * Curated classic and curriculum texts for 6e
 */
export interface CuratedRhetoricalText {
  id: string;
  titleFr: string;
  author: string;
  category: 'dialogue_6e' | 'poetry_6e' | 'story_6e' | 'culture_6e';
  descriptionFr: string;
  sourceTextEn: string;
  featuredFigures: RhetoricalFigureType[];
}

export const CURATED_6E_RHETORICAL_TEXTS: CuratedRhetoricalText[] = [
  {
    id: 'text_6e_daily_routine',
    titleFr: 'Dialogue 6e : Le Réveil Pressé',
    author: 'English Boost Curriculum 6e',
    category: 'dialogue_6e',
    descriptionFr: 'Dialogue de la vie quotidienne en 6e avec allitérations vives, personnification du réveil et règle de trois.',
    featuredFigures: ['personification', 'alliteration', 'rule_of_three', 'hyperbole'],
    sourceTextEn: `The alarm clock screams at seven o'clock! Tick-tock, tick-tock, time is running fast.
Every morning I wake up quickly. Every morning I wash my face. Every morning I smile at my cat.
I quickly grab my shoes, my blue backpack and my warm coat.
My school bag is as heavy as a rock! I have a million things to prepare today.
I run down the street like the wind to catch the big yellow school bus.`
  },
  {
    id: 'text_6e_london_adventure',
    titleFr: 'Récit 6e : Voyage à Londres',
    author: 'English Boost Curriculum 6e',
    category: 'culture_6e',
    descriptionFr: 'Exploration de Londres mêlant comparaisons, oppositions jour/nuit et onomatopées urbaines.',
    featuredFigures: ['simile', 'antithesis', 'onomatopoeia', 'rule_of_three'],
    sourceTextEn: `London is a bustling beehive of red buses and black taxis.
Big Ben shines like a golden crown in the misty afternoon.
We visited the British Museum, the Tower of London and Buckingham Palace.
Ding-dong, the church bells ring across the Thames!
London is busy during the day and quiet during the night.
Walking in Hyde Park, I felt as free as a bird.`
  },
  {
    id: 'text_6e_nature_poetry',
    titleFr: 'Poésie 6e : Le Cerf-Volant et le Vent',
    author: 'Poésie Classique Adaptée Cycle 3',
    category: 'poetry_6e',
    descriptionFr: 'Comptine poétique riche en assonances, allitérations douces et personnification du vent.',
    featuredFigures: ['assonance', 'alliteration', 'personification', 'simile'],
    sourceTextEn: `I like to fly my bright white kite high in the bright blue sky.
The whispering wind dances through the tall green trees.
Six sweet swallows sing softly on the silver fence.
The kite rises as light as a feather above the sunny hills.
The friendly sun smiles down and warms the cool green grass.`
  },
  {
    id: 'text_6e_rabbit_carroll',
    titleFr: 'Extrait 6e : Alice et le Lapin Blanc',
    author: "Lewis Carroll (D'après Alice au Pays des Merveilles)",
    category: 'story_6e',
    descriptionFr: "Extrait classique célèbre avec l'urgence du temps, répétitions expressives et comparaisons.",
    featuredFigures: ['repetition', 'simile', 'alliteration', 'hyperbole'],
    sourceTextEn: `Oh dear, oh dear! I shall be too late!
The little White Rabbit pulled a round watch from his pocket.
Tick-tock, tick-tock, the seconds were flying like arrows.
His eyes were as red as ripe cherries, and his coat was as white as snow.
I have waited for ages and ages! Time is money, my friends, time is gold!
He ran faster and faster into the deep dark mysterious rabbit hole.`
  },
  {
    id: 'text_6e_food_feast',
    titleFr: 'Dialogue 6e : Au Restaurant & Goûter Gourmand',
    author: 'English Boost Curriculum 6e',
    category: 'dialogue_6e',
    descriptionFr: 'Scène de repas gourmande pleine de saveurs, hyperboles amusantes et règle de trois.',
    featuredFigures: ['hyperbole', 'rule_of_three', 'antithesis', 'simile'],
    sourceTextEn: `I am so hungry I could eat an entire elephant!
For lunch, I ordered a fresh sandwich, a sweet red apple and a cold glass of milk.
The melted cheese is as hot as fire, but the homemade lemonade is as cold as ice.
This chocolate cake is the best in the world!
We enjoy good food and pleasant talk from morning until evening.`
  },
  {
    id: 'text_6e_sports_action',
    titleFr: 'Récit 6e : Le Grand Match de Football',
    author: 'English Boost Curriculum 6e',
    category: 'culture_6e',
    descriptionFr: 'Récit sportif dynamique avec parallélisme, allitérations dynamiques et onomatopées de frappe.',
    featuredFigures: ['alliteration', 'onomatopoeia', 'parallelism', 'rule_of_three'],
    sourceTextEn: `Brave boys and brave girls run across the big green field.
Kick, pass, and shoot for the golden goal!
Whistle! The referee signals the start of the final half.
Sam runs like a cheetah and strikes the ball with great power: boom!
The ball lands in the net, and the stadium roars with joy.
Work hard, play fair, and celebrate with your best friends.`
  }
];

/**
 * 15 Questions de Quiz Stylistique & Rhétorique pour 6e
 */
export interface RhetoricalQuizQuestion {
  id: string;
  quoteEn: string;
  translationFr: string;
  questionFr: string;
  options: {
    figureType: RhetoricalFigureType;
    labelFr: string;
  }[];
  correctFigureType: RhetoricalFigureType;
  explanationFr: string;
  clue6e: string;
}

export const RHETORICAL_QUIZ_QUESTIONS_6E: RhetoricalQuizQuestion[] = [
  {
    id: 'rq_1',
    quoteEn: 'My backpack is as heavy as a rock.',
    translationFr: 'Mon cartable est aussi lourd qu’un rocher.',
    questionFr: 'Quelle figure de style est utilisée dans cette phrase ?',
    options: [
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' }
    ],
    correctFigureType: 'simile',
    explanationFr: "La structure 'as...as' (aussi... que) rapproche directement le cartable d'un rocher à l'aide d'un mot de comparaison.",
    clue6e: "Repère les deux petits mots 'as ... as' !"
  },
  {
    id: 'rq_2',
    quoteEn: 'The alarm clock screams at seven o’clock.',
    translationFr: 'Le réveil hurle à sept heures pile.',
    questionFr: 'Que fait le réveil dans cette phrase ? De quelle figure s’agit-il ?',
    options: [
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'rule_of_three', labelFr: 'Une Règle de Trois (Rule of Three)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' }
    ],
    correctFigureType: 'personification',
    explanationFr: "Un réveil est un objet inanimé. L'auteur lui attribue l'action humaine de 'crier / hurler' (screams) pour rendre le réveil plus menaçant et vivant.",
    clue6e: "Est-ce qu'un réveil peut vraiment crier comme un être humain ?"
  },
  {
    id: 'rq_3',
    quoteEn: 'She sells six sweet strawberries.',
    translationFr: 'Elle vend six fraises bien sucrées.',
    questionFr: 'Quelle harmonie sonore est créée au début des mots ?',
    options: [
      { figureType: 'alliteration', labelFr: 'Une Allitération en [s] (Alliteration)' },
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'anaphora', labelFr: 'Une Anaphore (Anaphora)' }
    ],
    correctFigureType: 'alliteration',
    explanationFr: "Les mots 'She', 'sells', 'six', 'sweet', 'strawberries' répètent tous le son consonne [s], créant une musicalité rythmée et sifflante.",
    clue6e: "Écoute le début de chaque mot : quel son consonne se répète ?"
  },
  {
    id: 'rq_4',
    quoteEn: "I'm so hungry I could eat an entire elephant!",
    translationFr: "J'ai tellement faim que je pourrais manger un éléphant entier !",
    questionFr: 'Quelle figure amplifie la sensation de faim ?',
    options: [
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'rule_of_three', labelFr: 'Une Règle de Trois (Rule of Three)' }
    ],
    correctFigureType: 'hyperbole',
    explanationFr: "Manger un éléphant entier est impossible physiquement ! C'est une exagération démesurée et drôle pour exprimer une faim de loup.",
    clue6e: "C'est bien trop gros pour être vrai dans la réalité !"
  },
  {
    id: 'rq_5',
    quoteEn: 'I bought an apple, an orange and a banana.',
    translationFr: 'J’ai acheté une pomme, une orange et une banane.',
    questionFr: 'Comment s’appelle cette structure équilibrée en 3 éléments ?',
    options: [
      { figureType: 'rule_of_three', labelFr: 'La Règle de Trois (Rule of Three / Tricolon)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' }
    ],
    correctFigureType: 'rule_of_three',
    explanationFr: "La 'Rule of Three' regroupe 3 éléments coordonnés ('apple, orange and banana'), ce qui donne un rythme fluide et complet à la phrase.",
    clue6e: "Compte le nombre de fruits énumérés : 1, 2... et 3 !"
  },
  {
    id: 'rq_6',
    quoteEn: 'Tick-tock, tick-tock went the clock.',
    translationFr: 'Tic-tac, tic-tac faisait la pendule.',
    questionFr: 'Le mot « Tick-tock » reproduit le bruit réel. C’est :',
    options: [
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' }
    ],
    correctFigureType: 'onomatopoeia',
    explanationFr: "Une onomatopée imite phonétiquement un bruit naturel. 'Tick-tock' reproduit le son mécanique d'une horloge.",
    clue6e: "Pense aux bruits dans les bandes dessinées !"
  },
  {
    id: 'rq_7',
    quoteEn: 'London is busy in the day, but calm at night.',
    translationFr: 'Londres est animée le jour, mais calme la nuit.',
    questionFr: 'Quelle opposition de contraires structure cette phrase ?',
    options: [
      { figureType: 'antithesis', labelFr: 'Une Antithèse / Contraste (Antithesis)' },
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'anaphora', labelFr: 'Une Anaphore (Anaphora)' },
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' }
    ],
    correctFigureType: 'antithesis',
    explanationFr: "L'antithèse oppose 'busy' (animé) à 'calm' (calme), et 'day' (jour) à 'night' (nuit) pour souligner le double visage de la capitale.",
    clue6e: "Repère les deux moments opposés de la journée !"
  },
  {
    id: 'rq_8',
    quoteEn: 'Every morning I wake up. Every morning I practice English.',
    translationFr: 'Chaque matin je me réveille. Chaque matin je pratique l’anglais.',
    questionFr: 'La répétition de « Every morning » au début de chaque phrase est :',
    options: [
      { figureType: 'anaphora', labelFr: 'Une Anaphore (Anaphora)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'rule_of_three', labelFr: 'Une Règle de Trois (Rule of Three)' }
    ],
    correctFigureType: 'anaphora',
    explanationFr: "L'anaphore consiste à répéter le même groupe de mots ('Every morning') en tête de phrases consécutives pour insister sur la régularité.",
    clue6e: "Regarde le tout premier mot de chaque phrase."
  },
  {
    id: 'rq_9',
    quoteEn: 'Our classroom is a beehive in the morning.',
    translationFr: 'Notre classe est une ruche le matin.',
    questionFr: 'La classe est directement appelée « une ruche » sans mot de comparaison. C’est :',
    options: [
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' },
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' }
    ],
    correctFigureType: 'metaphor',
    explanationFr: "Contrairement à la comparaison qui dirait 'comme une ruche' (like a beehive), la métaphore affirme directement 'is a beehive' pour évoquer le bourdonnement des élèves.",
    clue6e: "Il n'y a pas le mot 'like' ou 'as', la phrase dit directement 'est une ruche'."
  },
  {
    id: 'rq_10',
    quoteEn: 'The whispering wind sang softly through the trees.',
    translationFr: 'Le vent qui chuchotait chantait doucement à travers les arbres.',
    questionFr: 'Le vent chante et chuchote : quelle figure donne vie à la nature ?',
    options: [
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' },
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'rule_of_three', labelFr: 'Une Règle de Trois (Rule of Three)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' }
    ],
    correctFigureType: 'personification',
    explanationFr: "Le vent se voit prêter deux capacités humaines : 'chuchoter' (whispering) et 'chanter' (sang).",
    clue6e: "Qui sait chanter et chuchoter normalement ?"
  },
  {
    id: 'rq_11',
    quoteEn: 'I like to fly my bright white kite high in the sky.',
    translationFr: 'J’aime faire voler mon cerf-volant blanc et brillant haut dans le ciel.',
    questionFr: 'La répétition du son voyelle [/aɪ/] (bright, white, kite, sky) est :',
    options: [
      { figureType: 'assonance', labelFr: 'Une Assonance en [/aɪ/] (Assonance)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' },
      { figureType: 'anaphora', labelFr: 'Une Anaphore (Anaphora)' }
    ],
    correctFigureType: 'assonance',
    explanationFr: "L'assonance est la répétition d'un même son VOYELLE ('aï' dans bright, white, kite, sky), créant une rime interne douce et chantante.",
    clue6e: "Attention, ce n'est pas une consonne mais un son VOYELLE qui résonne !"
  },
  {
    id: 'rq_12',
    quoteEn: 'Sam runs like a cheetah on the pitch.',
    translationFr: 'Sam court comme un guépard sur le terrain.',
    questionFr: 'L’emploi du mot « like » pour rapprocher Sam du guépard constitue :',
    options: [
      { figureType: 'simile', labelFr: 'Une Comparaison (Simile)' },
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' },
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' }
    ],
    correctFigureType: 'simile',
    explanationFr: "Le mot-outil 'like' introduit une comparaison explicite entre la vitesse de Sam et celle du félin le plus rapide du monde.",
    clue6e: "Cherche le mot anglais qui veut dire 'comme' !"
  },
  {
    id: 'rq_13',
    quoteEn: 'I have waited for you for a million years!',
    translationFr: 'Je t’ai attendu pendant un million d’années !',
    questionFr: 'Dire « un million d’années » pour signifier « un long moment » est :',
    options: [
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'metaphor', labelFr: 'Une Métaphore (Metaphor)' }
    ],
    correctFigureType: 'hyperbole',
    explanationFr: "Attendre un million d'années est impossible pour un être humain. C'est une hyperbole dramatique et expressive pour signifier son impatience.",
    clue6e: "C'est un chiffre immense impossible à vivre pour un humain !"
  },
  {
    id: 'rq_14',
    quoteEn: 'Work hard in the morning, play fair in the evening.',
    translationFr: 'Travaille dur le matin, joue loyalement le soir.',
    questionFr: 'La symétrie de construction entre les deux parties de la phrase est :',
    options: [
      { figureType: 'parallelism', labelFr: 'Un Parallélisme (Parallelism)' },
      { figureType: 'onomatopoeia', labelFr: 'Une Onomatopée (Onomatopoeia)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'hyperbole', labelFr: 'Une Hyperbole (Hyperbole)' }
    ],
    correctFigureType: 'parallelism',
    explanationFr: "Les deux propositions suivent exactement le même patron grammatical : [Verbe à l'impératif] + [Adverbe] + [in the + moment], créant un effet de miroir équilibré.",
    clue6e: "Observe comment les deux moitiés sont construites sur le même moule."
  },
  {
    id: 'rq_15',
    quoteEn: 'The friendly sun smiled down upon the children.',
    translationFr: 'Le soleil bienveillant souriait aux enfants.',
    questionFr: 'Attribuer un sourire au soleil est :',
    options: [
      { figureType: 'personification', labelFr: 'Une Personnification (Personification)' },
      { figureType: 'rule_of_three', labelFr: 'Une Règle de Trois (Rule of Three)' },
      { figureType: 'alliteration', labelFr: 'Une Allitération (Alliteration)' },
      { figureType: 'antithesis', labelFr: 'Une Antithèse (Antithesis)' }
    ],
    correctFigureType: 'personification',
    explanationFr: "Le soleil, astre céleste, est décrit avec un visage et des sentiments humains bienveillants ('friendly', 'smiled').",
    clue6e: "Le soleil n'a pas de bouche pour sourire : on le traite comme une personne !"
  }
];
