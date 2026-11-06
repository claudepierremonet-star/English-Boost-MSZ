/**
 * Speech Recognition, Orthographic & Phonetic Correction Engine
 * 
 * Provides:
 * 1. Web Speech API browser integration (SpeechRecognition / webkitSpeechRecognition)
 *    supporting British English (en-GB) and American English (en-US).
 * 2. Token-level orthographic alignment (Levenshtein, Soundex & typo detection).
 * 3. Immediate phonetic diagnosis with IPA transcriptions (UK/US), silent letter detection,
 *    dental fricatives (/θ/, /ð/), vowel quantity, and tonic stress coaching.
 * 4. Error journal recording integration.
 */

// Web Speech API interface declarations for strict TypeScript environments
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: IWindowSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: IWindowSpeechRecognition, ev: { error: string; message?: string }) => void) | null;
  onresult: ((this: IWindowSpeechRecognition, ev: {
    resultIndex: number;
    results: {
      length: number;
      item: (index: number) => {
        length: number;
        isFinal: boolean;
        item: (idx: number) => { transcript: string; confidence: number };
        [index: number]: { transcript: string; confidence: number };
      };
      [index: number]: {
        length: number;
        isFinal: boolean;
        [index: number]: { transcript: string; confidence: number };
      };
    };
  }) => void) | null;
}

export type TokenStatus = 'correct' | 'near_match' | 'misspelled' | 'omitted' | 'extra';

export interface OrthographicDiffToken {
  id: string;
  word: string;
  expected?: string;
  status: TokenStatus;
  similarityScore: number; // 0 to 1
  phoneticUk?: string;
  phoneticUs?: string;
  phoneticTip?: string;
  silentLetters?: string[];
  stressPattern?: string;
  frenchDef?: string;
}

export interface PhoneticPitfall {
  category: 'silent_letter' | 'dental_fricative' | 'vowel_length' | 'rhoticity' | 'tonic_stress' | 'consonant_cluster';
  categoryLabel: string;
  word: string;
  phoneticUk: string;
  phoneticUs: string;
  explanation: string;
  remedy: string;
}

export interface PhoneticCorrectionReport {
  overallScore: number; // Combines orthography + phonetic clarity
  orthographicScore: number;
  phoneticScore: number;
  targetAccent: 'en-GB' | 'en-US';
  totalExpectedWords: number;
  spokenWordsCount: number;
  exactMatchesCount: number;
  nearMatchesCount: number;
  misspelledCount: number;
  omittedCount: number;
  extraCount: number;
  tokens: OrthographicDiffToken[];
  pitfalls: PhoneticPitfall[];
  summaryMessage: string;
  strengths: string[];
  pedagogicalAdvice: string[];
}

/**
 * Check if the current browser environment supports the SpeechRecognition Web API
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: new () => IWindowSpeechRecognition;
    webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Phonetic Dictionary and Rules for Curriculum & Common Speaking Words
 */
const KNOWN_PHONETICS: Record<string, { uk: string; us: string; stress: string; tip?: string; silent?: string[]; fr?: string }> = {
  // Common greetings & A1/A2
  good: { uk: '/ɡʊd/', us: '/ɡʊd/', stress: 'Monosyllabe', tip: 'Voyelle courte /ʊ/ relâchée (comme dans "book"), pas un long /uː/.' },
  morning: { uk: '/ˈmɔː.nɪŋ/', us: '/ˈmɔːr.nɪŋ/', stress: 'MOR-ning', tip: 'En UK RP, ne prononcez pas le "r" central, allongez la voyelle /ɔː/. En US, rétroflexion douce.', fr: 'Matin / Matinée' },
  wonderful: { uk: '/ˈwʌn.də.fəl/', us: '/ˈwʌn.dɚ.fəl/', stress: 'WON-der-ful', tip: 'Accent primaire fort sur WON. Le "der" est un schwa /də/ très court.', fr: 'Merveilleux' },
  today: { uk: '/təˈdeɪ/', us: '/təˈdeɪ/', stress: 'to-DAY', tip: 'La première syllabe est réduite à un schwa /tə/ quasi inaudible, l’accent est sur DAY.', fr: 'Aujourd’hui' },
  london: { uk: '/ˈlʌn.dən/', us: '/ˈlʌn.dən/', stress: 'LON-don', tip: 'Voyelle ouverte /ʌ/ sur LON, puis schwa /dən/.', fr: 'Londres' },
  pleasant: { uk: '/ˈplez.ənt/', us: '/ˈplez.ənt/', stress: 'PLEA-sant', tip: 'Le digramme "ea" se prononce /e/ bref (comme dans "bed"), pas /iː/.', fr: 'Agréable' },
  journey: { uk: '/ˈdʒɜː.ni/', us: '/ˈdʒɝː.ni/', stress: 'JOUR-ney', tip: 'Débutez par l’affriquée /dʒ/. En UK voyelle centrale longue /ɜː/.', fr: 'Voyage / Trajet' },
  excuse: { uk: '/ɪkˈskjuːz/', us: '/ɪkˈskjuːz/', stress: 'ex-CUSE', tip: 'Le verbe se termine par le son voisé /z/, tandis que le nom se termine par /s/.', fr: 'Excuser' },
  platform: { uk: '/ˈplæt.fɔːm/', us: '/ˈplæt.fɔːrm/', stress: 'PLAT-form', tip: 'Son /æ/ très ouvert sur PLAT. /fɔːm/ en UK sans "r".', fr: 'Quai de gare' },
  oxford: { uk: '/ˈɒks.fəd/', us: '/ˈɑːks.fɚd/', stress: 'OX-ford', tip: 'Accent tonique net sur OX. La seconde syllabe "ford" s’affaiblit en /fəd/.', fr: 'Oxford' },
  departs: { uk: '/dɪˈpɑːts/', us: '/dɪˈpɑːrts/', stress: 'de-PARTS', tip: 'Attaque douce sur /dɪ/, explosion sonore sur PARTS.', fr: 'Part / Décolle' },
  archives: { uk: '/ˈɑː.kaɪvz/', us: '/ˈɑːr.kaɪvz/', stress: 'AR-chives', tip: 'Le groupe "ch" se prononce /k/ (d’origine grecque arkheion), jamais "ch" français !', fr: 'Archives historiques', silent: ['ch=/k/'] },
  contain: { uk: '/kənˈteɪn/', us: '/kənˈteɪn/', stress: 'con-TAIN', tip: 'La syllabe "con" se réduit en schwa /kən/.', fr: 'Contiennent' },
  thousands: { uk: '/ˈθaʊ.zəndz/', us: '/ˈθaʊ.zəndz/', stress: 'THOU-sands', tip: 'Fricative sourde /θ/ (langue délicatement entre les incisives), ne dites pas "s" ni "z" !', fr: 'Des milliers' },
  manuscripts: { uk: '/ˈmæn.jə.skrɪpts/', us: '/ˈmæn.jə.skrɪpts/', stress: 'MAN-u-scripts', tip: 'Accent tonique sur MAN. Articulez le cluster final consonant /pts/.', fr: 'Manuscrits' },
  eighteenth: { uk: '/ˌeɪˈtiːnθ/', us: '/ˌeɪˈtiːnθ/', stress: 'eigh-TEENTH', tip: 'Terminaison en /θ/. Les lettres "gh" sont rigoureusement muettes !', silent: ['gh'], fr: 'Dix-huitième' },
  century: { uk: '/ˈsen.tʃər.i/', us: '/ˈsen.tʃɚ.i/', stress: 'CEN-tu-ry', tip: 'Le "tu" produit une affriquée /tʃ/ (comme dans "tchèque").', fr: 'Siècle' },
  premature: { uk: '/ˌprem.əˈtʃʊər/', us: '/ˌpriː.məˈtʊr/', stress: 'pre-ma-TURE', tip: 'En UK accent sur la dernière syllabe TURE avec /tʃʊə/, en US souvent /priː.məˈtʊr/.', fr: 'Prématuré' },
  decidedly: { uk: '/dɪˈsaɪ.dɪd.li/', us: '/dɪˈsaɪ.dɪd.li/', stress: 'de-CI-ded-ly', tip: 'Accent net sur CI /saɪ/. La terminaison "-ed-" se prononce /ɪd/.', fr: 'Résolument' },
  imprudent: { uk: '/ɪmˈpruː.dənt/', us: '/ɪmˈpruː.dənt/', stress: 'im-PRU-dent', tip: 'Accent primaire sur PRU. Voyelle longue /uː/.', fr: 'Imprudent' },
  contingencies: { uk: '/kənˈtɪn.dʒən.siz/', us: '/kənˈtɪn.dʒən.siz/', stress: 'con-TIN-gen-cies', tip: 'Accent tonique sur TIN. Le "g" est doux /dʒ/.', fr: 'Éventualités / Imprévus' },
  evaluated: { uk: '/ɪˈvæl.ju.eɪ.tɪd/', us: '/ɪˈvæl.ju.eɪ.t̬ɪd/', stress: 'e-VAL-u-a-ted', tip: 'Accent sur VAL. En US, le "t" intérieur subit le flap américain [t̬].', fr: 'Évalué' },
  prudence: { uk: '/ˈpruː.dəns/', us: '/ˈpruː.dəns/', stress: 'PRU-dence', tip: 'Accent tonique ferme sur PRU. Le "c" final se prononce /s/.', fr: 'Prudence cardinale' },
  virtues: { uk: '/ˈvɜː.tʃuːz/', us: '/ˈvɝː.tʃuːz/', stress: 'VIR-tues', tip: 'En UK pas de "r", voyelle centrale /ɜː/. Fin en "s" voisé /z/.', fr: 'Vertus' },
  political: { uk: '/pəˈlɪt.ɪ.kəl/', us: '/pəˈlɪt̬.ə.kəl/', stress: 'po-LIT-i-cal', tip: 'Le "po-" initial est un schwa très discret /pə/. Accent fort sur LIT.', fr: 'Politique' },
  moral: { uk: '/ˈmɒr.əl/', us: '/ˈmɔːr.əl/', stress: 'MOR-al', tip: 'En UK voyelle courte ouverte /ɒ/, en US /ɔːr/.', fr: 'Morale' },
  distinguished: { uk: '/dɪˈstɪŋ.ɡwɪʃt/', us: '/dɪˈstɪŋ.ɡwɪʃt/', stress: 'dis-TIN-guished', tip: 'Accent sur TIN. Terminaison "-ed" prononcée /t/ après /ʃ/.', fr: 'Distingué' },
  colleagues: { uk: '/ˈkɒl.iːɡz/', us: '/ˈkɑː.liːɡz/', stress: 'COL-leagues', tip: 'Les lettres "-ues" finales sont muettes, arrêt net sur /ɡz/.', silent: ['ues'], fr: 'Collègues' },
  interdependence: { uk: '/ˌɪn.tə.dɪˈpen.dəns/', us: '/ˌɪn.t̬ɚ.dɪˈpen.dəns/', stress: 'in-ter-de-PEN-dence', tip: 'Accent tonique primaire sur PEN. Multiples syllabes unstressed.', fr: 'Interdépendance' },
  sovereign: { uk: '/ˈsɒv.rɪn/', us: '/ˈsɑːv.rən/', stress: 'SOV-ereign', tip: 'Le "g" est entièrement silencieux ! Se prononce en deux syllabes [SOV-rin].', silent: ['g'], fr: 'Souverain' }
};

/**
 * Clean text for tokenization
 */
function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9']/g, '').trim();
}

/**
 * Calculate Levenshtein Distance between two words
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Simple English Soundex Algorithm for phonetic similarity detection
 */
function soundex(str: string): string {
  if (!str) return '';
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  const firstLetter = s[0];
  const mappings: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let code = firstLetter;
  let prev = mappings[firstLetter] || '0';

  for (let i = 1; i < s.length && code.length < 4; i++) {
    const char = s[i];
    const digit = mappings[char] || '0';
    if (digit !== '0' && digit !== prev) {
      code += digit;
      prev = digit;
    } else if (digit === '0') {
      prev = '0';
    }
  }

  return (code + '000').slice(0, 4);
}

/**
 * Detect phonetic difficulty patterns in an expected word
 */
function inspectPhoneticDifficulty(
  word: string,
  targetAccent: 'en-GB' | 'en-US'
): {
  phoneticUk: string;
  phoneticUs: string;
  pitfall?: PhoneticPitfall;
  tip?: string;
  silent?: string[];
  stress?: string;
  fr?: string;
} {
  const clean = cleanWord(word);
  const known = KNOWN_PHONETICS[clean];

  let ukPhonetic = known?.uk || `/${clean}/`;
  let usPhonetic = known?.us || `/${clean}/`;
  const stress = known?.stress || (clean.length > 5 ? 'Syllabe initiale' : 'Monosyllabe');
  const silent = known?.silent || [];
  const fr = known?.fr;

  let pitfall: PhoneticPitfall | undefined;

  // Rule 1: Silent letters detection
  if (/^(kn|wr|ps|gn)/i.test(clean) || /(mb|bt|sc|igh|alk|eigh)$/i.test(clean) || clean === 'doubt' || clean === 'subtle' || clean === 'island') {
    let silentLetter = 'lettre';
    if (/^kn/i.test(clean)) silentLetter = 'k initial';
    else if (/^wr/i.test(clean)) silentLetter = 'w initial';
    else if (/mb$/i.test(clean)) silentLetter = 'b final';
    else if (/bt$/i.test(clean) || clean === 'doubt' || clean === 'subtle') silentLetter = 'b';
    else if (/igh/i.test(clean)) silentLetter = 'gh';

    pitfall = {
      category: 'silent_letter',
      categoryLabel: 'Lettre Muette (Silent Letter)',
      word,
      phoneticUk: ukPhonetic,
      phoneticUs: usPhonetic,
      explanation: `Dans « ${word} », le « ${silentLetter} » est rigoureusement muet en anglais natif.`,
      remedy: `N'articulez pas la lettre muette. Passez directement au son vocalique ou consonantique suivant.`
    };
  }
  // Rule 2: Dental Fricative (/θ/ ou /ð/)
  else if (/th/i.test(clean)) {
    pitfall = {
      category: 'dental_fricative',
      categoryLabel: 'Fricative Dentale (/θ/ ou /ð/)',
      word,
      phoneticUk: ukPhonetic,
      phoneticUs: usPhonetic,
      explanation: `Le digramme « th » dans « ${word} » exige un placement lingual précis (bout de langue effleurant les incisives supérieures).`,
      remedy: `Évitez de substituer un /s/ ou un /z/ francophone. Soufflez l'air doucement entre la langue et les dents.`
    };
  }
  // Rule 3: British Non-Rhoticity vs American Rhoticity
  else if (/r/i.test(clean) && !/^[r]/i.test(clean)) {
    if (targetAccent === 'en-GB') {
      pitfall = {
        category: 'rhoticity',
        categoryLabel: 'Rhotisme Britannique (Non-Rhotic RP)',
        word,
        phoneticUk: ukPhonetic,
        phoneticUs: usPhonetic,
        explanation: `En anglais britannique RP, le « r » devant consonne ou en fin de mot ne roule jamais. Il allonge la voyelle ou se dissout en schwa /ə/.`,
        remedy: `Arrondissez la voyelle sans relever la pointe de la langue.`
      };
    } else {
      pitfall = {
        category: 'rhoticity',
        categoryLabel: 'Rhotisme Américain (Rhotic GenAm)',
        word,
        phoneticUk: ukPhonetic,
        phoneticUs: usPhonetic,
        explanation: `En américain général, le « r » est prononcé de manière rétrofléxie avec la langue reculée vers le palais.`,
        remedy: `Rétractez le corps de la langue vers le palais mou pour faire sonner le /r/ américain chaud et plein.`
      };
    }
  }

  return {
    phoneticUk: ukPhonetic,
    phoneticUs: usPhonetic,
    pitfall,
    tip: known?.tip,
    silent,
    stress,
    fr
  };
}

/**
 * Compare target text and speech recognized transcript
 * Produces word-by-word orthographic diff & phonetic analysis
 */
export function compareOrthographyAndPhonetics(
  expectedText: string,
  spokenTranscript: string,
  targetAccent: 'en-GB' | 'en-US' = 'en-GB'
): PhoneticCorrectionReport {
  // Tokenize expected words while keeping original punctuation
  const rawExpectedTokens = expectedText.trim().split(/\s+/).filter(Boolean);
  const rawSpokenTokens = spokenTranscript.trim().split(/\s+/).filter(Boolean);

  const cleanExpected = rawExpectedTokens.map(cleanWord);
  const cleanSpoken = rawSpokenTokens.map(cleanWord);

  const tokens: OrthographicDiffToken[] = [];
  const pitfalls: PhoneticPitfall[] = [];

  let exactMatches = 0;
  let nearMatches = 0;
  let misspelledCount = 0;
  let omittedCount = 0;

  // Track matched spoken indices
  const usedSpokenIndices = new Set<number>();

  // Pass 1: Align expected words with spoken tokens
  rawExpectedTokens.forEach((rawWord, expIdx) => {
    const expClean = cleanExpected[expIdx];
    const phonInfo = inspectPhoneticDifficulty(rawWord, targetAccent);

    if (phonInfo.pitfall) {
      pitfalls.push(phonInfo.pitfall);
    }

    // Try finding exact match in a local sliding window (+/- 3 words)
    let bestSpokenIdx = -1;
    let bestSim = 0;
    let bestStatus: TokenStatus = 'omitted';

    const windowStart = Math.max(0, expIdx - 3);
    const windowEnd = Math.min(rawSpokenTokens.length, expIdx + 4);

    for (let sIdx = windowStart; sIdx < windowEnd; sIdx++) {
      if (usedSpokenIndices.has(sIdx)) continue;
      const spkClean = cleanSpoken[sIdx];

      if (spkClean === expClean) {
        bestSpokenIdx = sIdx;
        bestSim = 1.0;
        bestStatus = 'correct';
        break;
      }

      // Check distance & Soundex
      const dist = levenshteinDistance(expClean, spkClean);
      const maxLen = Math.max(expClean.length, spkClean.length);
      const sim = 1 - dist / Math.max(1, maxLen);
      const isSoundexMatch = soundex(expClean) === soundex(spkClean);

      if (sim > bestSim && sim >= 0.6) {
        bestSim = sim;
        bestSpokenIdx = sIdx;
        bestStatus = isSoundexMatch || sim >= 0.75 ? 'near_match' : 'misspelled';
      }
    }

    if (bestSpokenIdx !== -1) {
      usedSpokenIndices.add(bestSpokenIdx);
      const spokenWord = rawSpokenTokens[bestSpokenIdx];

      if (bestStatus === 'correct') {
        exactMatches++;
      } else if (bestStatus === 'near_match') {
        nearMatches++;
      } else {
        misspelledCount++;
      }

      tokens.push({
        id: `tok-exp-${expIdx}`,
        word: spokenWord,
        expected: rawWord,
        status: bestStatus,
        similarityScore: bestSim,
        phoneticUk: phonInfo.phoneticUk,
        phoneticUs: phonInfo.phoneticUs,
        phoneticTip: phonInfo.tip,
        silentLetters: phonInfo.silent,
        stressPattern: phonInfo.stress,
        frenchDef: phonInfo.fr
      });
    } else {
      // Omitted word
      omittedCount++;
      tokens.push({
        id: `tok-exp-omitted-${expIdx}`,
        word: rawWord,
        expected: rawWord,
        status: 'omitted',
        similarityScore: 0,
        phoneticUk: phonInfo.phoneticUk,
        phoneticUs: phonInfo.phoneticUs,
        phoneticTip: phonInfo.tip,
        silentLetters: phonInfo.silent,
        stressPattern: phonInfo.stress,
        frenchDef: phonInfo.fr
      });
    }
  });

  // Pass 2: Identify any extra / superfluous spoken words
  let extraCount = 0;
  rawSpokenTokens.forEach((rawSpk, sIdx) => {
    if (!usedSpokenIndices.has(sIdx)) {
      extraCount++;
      tokens.push({
        id: `tok-extra-${sIdx}`,
        word: rawSpk,
        status: 'extra',
        similarityScore: 0,
        phoneticTip: 'Mot superflu inséré lors de votre dictée.'
      });
    }
  });

  // Calculate scores
  const totalExpected = Math.max(1, rawExpectedTokens.length);
  const orthographicScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((exactMatches * 1.0 + nearMatches * 0.75) / totalExpected) * 100 - extraCount * 4
      )
    )
  );

  const phoneticScore = Math.max(
    20,
    Math.min(
      100,
      Math.round(
        orthographicScore * 0.85 + (pitfalls.length > 0 ? 12 : 15)
      )
    )
  );

  const overallScore = Math.round((orthographicScore * 0.55 + phoneticScore * 0.45));

  // Build feedback summary & pedagogical advice
  const strengths: string[] = [];
  const pedagogicalAdvice: string[] = [];

  if (exactMatches >= totalExpected * 0.8) {
    strengths.push('Excellente articulation globale et reconnaissance immédiate des termes cibles.');
  }
  if (nearMatches > 0) {
    pedagogicalAdvice.push(
      `${nearMatches} mot(s) ont une orthographe ou une sonorité proche : vérifiez les finales et les voyelles courtes.`
    );
  }
  if (omittedCount > 0) {
    pedagogicalAdvice.push(
      `${omittedCount} mot(s) attendu(s) n'ont pas été détectés : veillez à maintenir un débit régulier sans avaler les fins de phrases.`
    );
  }
  if (extraCount > 0) {
    pedagogicalAdvice.push(
      `${extraCount} mot(s) parasite(s) ou hésitation(s) repéré(s) : marquez des respirations nettes plutôt que des interjections vocales.`
    );
  }

  let summaryMessage = 'Bonne session de dictée et prononciation.';
  if (overallScore >= 90) {
    summaryMessage = 'Prestation remarquable ! Élocution claire, fidèle au modèle natif et sans faute orthographique notable.';
  } else if (overallScore >= 75) {
    summaryMessage = 'Bonne maîtrise de l’élocution. Quelques ajustements phonétiques et orthographiques recommandés ci-dessous.';
  } else {
    summaryMessage = 'Pratique stimulante. Portez votre attention sur le découpage syllabique et les mots surlignés ci-dessous.';
  }

  return {
    overallScore,
    orthographicScore,
    phoneticScore,
    targetAccent,
    totalExpectedWords: rawExpectedTokens.length,
    spokenWordsCount: rawSpokenTokens.length,
    exactMatchesCount: exactMatches,
    nearMatchesCount: nearMatches,
    misspelledCount,
    omittedCount,
    extraCount,
    tokens,
    pitfalls,
    summaryMessage,
    strengths,
    pedagogicalAdvice
  };
}

/**
 * Controller class managing Web Speech API recognition lifecycle
 */
export class SpeechRecognitionController {
  private recognition: IWindowSpeechRecognition | null = null;
  private isListening: boolean = false;
  private targetLang: string = 'en-GB';
  private accumulatedFinalTranscript: string = '';
  private currentInterimTranscript: string = '';

  public onTranscriptChange?: (finalText: string, interimText: string) => void;
  public onStatusChange?: (status: 'listening' | 'stopped' | 'error', errorMessage?: string) => void;

  constructor(targetAccent: 'en-GB' | 'en-US' = 'en-GB') {
    this.targetLang = targetAccent;
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      SpeechRecognition?: new () => IWindowSpeechRecognition;
      webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
    };

    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.targetLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChange?.('listening');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStatusChange?.('stopped');
      };

      this.recognition.onerror = (ev) => {
        console.warn('Speech recognition event error:', ev.error);
        let msg = 'Erreur lors de la capture vocale.';
        if (ev.error === 'not-allowed') {
          msg = 'Autorisation du microphone refusée dans le navigateur.';
        } else if (ev.error === 'no-speech') {
          msg = 'Aucune parole détectée. Veuillez parler distinctement près du microphone.';
        } else if (ev.error === 'network') {
          msg = 'Problème réseau lié au service de reconnaissance vocale du navigateur.';
        }
        this.onStatusChange?.('error', msg);
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';
          if (res.isFinal) {
            this.accumulatedFinalTranscript += ' ' + transcriptChunk.trim();
          } else {
            interim += ' ' + transcriptChunk;
          }
        }
        this.currentInterimTranscript = interim.trim();
        this.onTranscriptChange?.(
          this.accumulatedFinalTranscript.trim(),
          this.currentInterimTranscript
        );
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public setAccent(accent: 'en-GB' | 'en-US') {
    this.targetLang = accent;
    if (this.recognition) {
      this.recognition.lang = accent;
    }
  }

  public start() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      this.onStatusChange?.('error', 'Reconnaissance vocale non disponible sur ce navigateur.');
      return;
    }

    this.accumulatedFinalTranscript = '';
    this.currentInterimTranscript = '';

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start exception:', err);
    }
  }

  public stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop exception:', err);
      }
    }
    this.isListening = false;
    return (this.accumulatedFinalTranscript + ' ' + this.currentInterimTranscript).trim();
  }

  public abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // no-op
      }
    }
    this.isListening = false;
    this.accumulatedFinalTranscript = '';
    this.currentInterimTranscript = '';
  }

  public getFullTranscript(): string {
    return (this.accumulatedFinalTranscript + ' ' + this.currentInterimTranscript).trim();
  }
}
