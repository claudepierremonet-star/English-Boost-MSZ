import {
  getWordPhonetics,
  type OrthographicDiffToken,
  type PhoneticCorrectionReport
} from './speechRecognitionHelper';
import type { AcousticAnalysisResult } from './speechAcousticAnalyzer';
import { speakFrenchText, speakText, stopSpeech } from '../services/speechService';

export interface PhonemeArticulationGuide {
  symbol: string;
  labelFr: string;
  category:
    | 'dental_fricative'
    | 'vowel_long'
    | 'vowel_short'
    | 'diphthong'
    | 'affricate'
    | 'nasal'
    | 'schwa'
    | 'rhotic'
    | 'consonant';
  articulationFr: string;
  spokenCoachingFr: string;
  commonMistakeFr: string;
}

const MULTI_CHAR_IPA_PHONEMES = [
  'tʃ',
  'dʒ',
  'eɪ',
  'aɪ',
  'ɔɪ',
  'aʊ',
  'əʊ',
  'oʊ',
  'ɪə',
  'eə',
  'ʊə',
  'iː',
  'uː',
  'ɑː',
  'ɔː',
  'ɜː',
  'ɝː',
  'ɔːr',
  'ɑːr'
];

export const PHONEME_ARTICULATION_GUIDE: Record<string, PhonemeArticulationGuide> = {
  'θ': {
    symbol: 'θ',
    labelFr: 'Fricative dentale sourde',
    category: 'dental_fricative',
    articulationFr:
      'Placez délicatement le bout de la langue entre les incisives supérieures et inférieures et soufflez sans faire vibrer les cordes vocales.',
    spokenCoachingFr:
      'placez le bout de la langue entre les dents pour souffler doucement le son t h sourd, sans dire s ni t',
    commonMistakeFr: 'Souvent remplacée à tort par /s/, /t/ ou /f/ en français.'
  },
  'ð': {
    symbol: 'ð',
    labelFr: 'Fricative dentale voisée',
    category: 'dental_fricative',
    articulationFr:
      'Effleurez le bord des incisives supérieures avec la pointe de la langue tout en faisant vibrer la gorge.',
    spokenCoachingFr:
      'faites vibrer la langue doucement contre les incisives supérieures pour le t h voisé, sans dire z ni d',
    commonMistakeFr: 'Souvent substituée par /z/ ou /d/.'
  },
  'ɜː': {
    symbol: 'ɜː',
    labelFr: 'Voyelle centrale longue (UK RP)',
    category: 'vowel_long',
    articulationFr:
      'Relâchez la mâchoire au centre de la bouche et tenez le son longuement sans relever la langue vers un R roulé.',
    spokenCoachingFr:
      'tenez la voyelle centrale longue au milieu de la bouche sans prononcer le R britannique',
    commonMistakeFr: 'Ajout d’un /r/ dur à la place de l’allongement vocalique RP.'
  },
  'ɝː': {
    symbol: 'ɝː',
    labelFr: 'Voyelle rhotique centrale (US GenAm)',
    category: 'rhotic',
    articulationFr:
      'Reculez légèrement le corps de la langue vers le palais mou pour colorer la voyelle centrale avec le R américain.',
    spokenCoachingFr:
      'reculez légèrement la langue vers le palais pour faire résonner la voyelle R américaine',
    commonMistakeFr: 'R uvulaire français provenant du fond de la gorge.'
  },
  'ɔː': {
    symbol: 'ɔː',
    labelFr: 'Voyelle postérieure arrondie longue',
    category: 'vowel_long',
    articulationFr:
      'Arrondissez nettement les lèvres et maintenez la voyelle ouverte deux fois plus longtemps qu’une voyelle brève.',
    spokenCoachingFr:
      'arrondissez les lèvres et allongez franchement la voyelle ouverte O',
    commonMistakeFr: 'Voyelle trop brève ou coupée net.'
  },
  'ɑː': {
    symbol: 'ɑː',
    labelFr: 'Voyelle ouverte postérieure longue',
    category: 'vowel_long',
    articulationFr:
      'Abaissez la mâchoire et ouvrez l’arrière de la gorge pour produire un A profond et soutenu.',
    spokenCoachingFr:
      'ouvrez bien la mâchoire vers l’arrière pour un A long et posé',
    commonMistakeFr: 'Son trop fermé vers /a/ bref antérieur.'
  },
  'iː': {
    symbol: 'iː',
    labelFr: 'Voyelle fermée tendue longue',
    category: 'vowel_long',
    articulationFr:
      'Étirez légèrement les commissures des lèvres et maintenez la tension de la voyelle I.',
    spokenCoachingFr:
      'tendez clairement les lèvres et tenez le son I sur la durée',
    commonMistakeFr: 'Confusion fréquente avec le /ɪ/ bref relâché.'
  },
  'ɪ': {
    symbol: 'ɪ',
    labelFr: 'Voyelle brève relâchée',
    category: 'vowel_short',
    articulationFr:
      'Relâchez la langue et écourtez l’impulsion entre « i » et « é » très bref.',
    spokenCoachingFr:
      'gardez une impulsion courte et relâchée sur la voyelle brève',
    commonMistakeFr: 'Tendance à tendre exagérément la voyelle comme un « i » français.'
  },
  'uː': {
    symbol: 'uː',
    labelFr: 'Voyelle postérieure haute longue',
    category: 'vowel_long',
    articulationFr:
      'Projetez doucement les lèvres en cercle étroit et tenez le son OU avec stabilité.',
    spokenCoachingFr:
      'avancez les lèvres en rond pour soutenir le son OU long',
    commonMistakeFr: 'Confusion avec la voyelle courte /ʊ/.'
  },
  'ʊ': {
    symbol: 'ʊ',
    labelFr: 'Voyelle brève arrondie relâchée',
    category: 'vowel_short',
    articulationFr:
      'Gardez les lèvres souples et produisez un OU très bref sans tension musculaire.',
    spokenCoachingFr:
      'relâchez les lèvres pour un OU bref et naturel',
    commonMistakeFr: 'Prononciation trop longue ou trop fermée.'
  },
  'æ': {
    symbol: 'æ',
    labelFr: 'Voyelle antérieure ouverte (« ash »)',
    category: 'vowel_short',
    articulationFr:
      'Abaissez nettement la mâchoire inférieure tout en gardant l’avant de la langue plat, entre A et È.',
    spokenCoachingFr:
      'ouvrez nettement la mâchoire entre A et È pour la voyelle ouverte',
    commonMistakeFr: 'Souvent fermée en /e/ (« bed » au lieu de « bad »).'
  },
  'ə': {
    symbol: 'ə',
    labelFr: 'Schwa (voyelle neutre inaccentuée)',
    category: 'schwa',
    articulationFr:
      'Laissez la langue totalement au repos au centre et effleurez la syllabe sans aucun appui.',
    spokenCoachingFr:
      'allégez la syllabe non accentuée en un souffle neutre très discret',
    commonMistakeFr: 'Articulation excessive de toutes les syllabes à la française.'
  },
  'tʃ': {
    symbol: 'tʃ',
    labelFr: 'Affriquée sourde',
    category: 'affricate',
    articulationFr:
      'Bloquez brièvement l’air avec l’avant de la langue au palais (/t/) avant de relâcher un chuintement sec (/ʃ/).',
    spokenCoachingFr:
      'marquez une attaque sèche T suivie immédiatement du son CH',
    commonMistakeFr: 'Omission de l’attaque occlusive /t/ (prononcer « sh » au lieu de « tch »).'
  },
  'dʒ': {
    symbol: 'dʒ',
    labelFr: 'Affriquée voisée',
    category: 'affricate',
    articulationFr:
      'Appuyez la langue sur la crête alvéolaire comme pour un /d/ avant de libérer un /ʒ/ sonore.',
    spokenCoachingFr:
      'appuyez fermement l’attaque D puis relâchez le son J avec vibration',
    commonMistakeFr: 'Affaiblissement en « j » français sans attaque /d/.'
  },
  'ŋ': {
    symbol: 'ŋ',
    labelFr: 'Consonne nasale vélaire',
    category: 'nasal',
    articulationFr:
      'Soulevez l’arrière de la langue contre le palais mou et laissez résonner par le nez sans exploser de G final.',
    spokenCoachingFr:
      'faites résonner la finale nasale au fond du palais sans prononcer de G dur',
    commonMistakeFr: 'Ajout d’un /ɡ/ dur final ou prononciation /n/.'
  },
  'eɪ': {
    symbol: 'eɪ',
    labelFr: 'Diphtongue montante /eɪ/',
    category: 'diphthong',
    articulationFr:
      'Démarrez sur un É net et glissez progressivement vers un I bref sans couper le souffle.',
    spokenCoachingFr:
      'glissez souplement du son É vers un I bref pour compléter la diphtongue',
    commonMistakeFr: 'Réduction en voyelle pure immobile comme le « é » français.'
  },
  'aɪ': {
    symbol: 'aɪ',
    labelFr: 'Diphtongue /aɪ/',
    category: 'diphthong',
    articulationFr:
      'Ouvrez largement sur A puis fermez doucement vers un I léger en fin de syllabe.',
    spokenCoachingFr:
      'ouvrez bien le A initial puis glissez vers un I léger',
    commonMistakeFr: 'Diphtongue trop plate ou écourtée.'
  },
  'aʊ': {
    symbol: 'aʊ',
    labelFr: 'Diphtongue /aʊ/',
    category: 'diphthong',
    articulationFr:
      'Partez d’un A ouvert et arrondissez progressivement les lèvres vers OU.',
    spokenCoachingFr:
      'partez d’un A ouvert et arrondissez vers OU sans séparer les deux sons',
    commonMistakeFr: 'Rupture en deux syllabes distinctes.'
  },
  'əʊ': {
    symbol: 'əʊ',
    labelFr: 'Diphtongue britannique /əʊ/',
    category: 'diphthong',
    articulationFr:
      'Débutez au centre neutre (schwa) puis arrondissez délicatement vers OU.',
    spokenCoachingFr:
      'partez du centre de la bouche puis arrondissez doucement vers OU à l’anglaise',
    commonMistakeFr: 'Prononciation d’un « o » fermé français immobile.'
  },
  'oʊ': {
    symbol: 'oʊ',
    labelFr: 'Diphtongue américaine /oʊ/',
    category: 'diphthong',
    articulationFr:
      'Commencez sur un O arrondi sonore et refermez progressivement vers OU.',
    spokenCoachingFr:
      'arrondissez franchement le O initial et refermez vers OU',
    commonMistakeFr: 'Voyelle monocorde sans glissement.'
  }
};

/**
 * Tokenize an IPA transcription string into clean ordered phoneme symbols
 */
export function tokenizeIpaPhonemes(ipaString: string): string[] {
  if (!ipaString) return [];
  const cleaned = ipaString
    .replace(/[\/\[\]\.ˈˌ!?,;:—'"()]/g, '')
    .replace(/\s+/g, '')
    .replace(/t̬/g, 't');

  const phonemes: string[] = [];
  let idx = 0;

  while (idx < cleaned.length) {
    let matchedMulti = false;
    for (const multi of MULTI_CHAR_IPA_PHONEMES) {
      if (cleaned.startsWith(multi, idx)) {
        phonemes.push(multi);
        idx += multi.length;
        matchedMulti = true;
        break;
      }
    }
    if (matchedMulti) continue;

    const ch = cleaned[idx];
    if (ch && ch !== 'ː') {
      phonemes.push(ch);
    }
    idx += 1;
  }

  return phonemes;
}

export type PhonemeMasteryStatus = 'mastered' | 'to_refine' | 'missed' | 'uncertain';

export interface ReferencePhonemeStatus {
  symbol: string;
  labelFr: string;
  occurrences: number;
  status: PhonemeMasteryStatus;
  exampleWords: string[];
  guide?: PhonemeArticulationGuide;
}

export interface PhonemeDeviationItem {
  id: string;
  word: string;
  spokenWord: string;
  referencePhonemes: string;
  referencePhonemeTokens: string[];
  spokenPhonemes: string;
  keyPhoneme: string;
  phonemeCategory: string;
  articulationTipFr: string;
  spokenCoachingFr: string;
  drillPhraseEn: string;
  severity: 'critical' | 'moderate' | 'minor';
  confidence: number;
  startSec?: number;
  endSec?: number;
  status: OrthographicDiffToken['status'];
}

export interface WordTemporalAlignment {
  word: string;
  spokenWord: string;
  referencePhonemes: string;
  status: OrthographicDiffToken['status'];
  confidence: number;
  uncertain: boolean;
  startSec: number;
  endSec: number;
}

export interface AutomatedVocalFeedbackPlan {
  coachingScriptFr: string;
  modelDrillWords: string[];
  fullReferenceSentenceEn: string;
  targetAccent: 'en-GB' | 'en-US';
  hasSpeechDetected: boolean;
  priorityPhonemes: string[];
}

export interface PhonemeEvaluationResult {
  phonemeAccuracyScore: number;
  targetAccent: 'en-GB' | 'en-US';
  referenceHintPhonemes: string[];
  phonemeStatuses: ReferencePhonemeStatus[];
  deviations: PhonemeDeviationItem[];
  wordTimings: WordTemporalAlignment[];
  uncertainSegmentsCount: number;
  totalDurationSec: number;
  telemetry: {
    format: string;
    language: 'en-GB' | 'en-US';
    durationSec: number;
    avgConfidence: number;
    uncertainSegmentsCount: number;
  };
  vocalFeedbackPlan: AutomatedVocalFeedbackPlan;
}

function findPrimaryPedagogicalPhoneme(
  word: string,
  phonemeTokens: string[],
  spokenTokens: string[],
  targetAccent: 'en-GB' | 'en-US'
): { keyPhoneme: string; guide?: PhonemeArticulationGuide } {
  const spokenSet = new Set(spokenTokens);

  // First prefer a pedagogical phoneme present in expected that is absent in spoken
  for (const sym of phonemeTokens) {
    if (PHONEME_ARTICULATION_GUIDE[sym] && !spokenSet.has(sym)) {
      return { keyPhoneme: sym, guide: PHONEME_ARTICULATION_GUIDE[sym] };
    }
  }

  // Next prefer any pedagogical phoneme present in the word
  for (const sym of phonemeTokens) {
    if (PHONEME_ARTICULATION_GUIDE[sym]) {
      return { keyPhoneme: sym, guide: PHONEME_ARTICULATION_GUIDE[sym] };
    }
  }

  // Fallback check on spelling cues
  const lower = word.toLowerCase();
  if (/th/.test(lower)) {
    const sym = /^(the|this|that|they|them|whether|though)/.test(lower) ? 'ð' : 'θ';
    return { keyPhoneme: sym, guide: PHONEME_ARTICULATION_GUIDE[sym] };
  }
  if (targetAccent === 'en-GB' && /r/.test(lower)) {
    return { keyPhoneme: 'ɜː', guide: PHONEME_ARTICULATION_GUIDE['ɜː'] };
  }

  const fallbackSymbol = phonemeTokens[0] || lower.slice(0, 2) || 'ə';
  return {
    keyPhoneme: fallbackSymbol,
    guide: PHONEME_ARTICULATION_GUIDE[fallbackSymbol]
  };
}

function buildHumanCoachingFr(
  score: number,
  hasSpeech: boolean,
  deviations: PhonemeDeviationItem[],
  targetAccent: 'en-GB' | 'en-US'
): string {
  const accentName = targetAccent === 'en-GB' ? 'britannique' : 'américain';

  if (!hasSpeech) {
    return `Aucune parole distincte n'a été captée par le microphone. Rapprochez-vous du micro, écoutez d'abord les phonèmes de référence en anglais ${accentName}, puis réessayez calmement.`;
  }

  const topDeviations = deviations.slice(0, 2);
  if (topDeviations.length === 0) {
    return `Excellente maîtrise phonémique à ${score} pour cent en anglais ${accentName}. Votre articulation respecte les phonèmes de référence. Écoutons maintenant la phrase modèle pour ancrer la cadence native.`;
  }

  const intro =
    score >= 82
      ? `Très bonne précision phonémique à ${score} pour cent en anglais ${accentName}.`
      : score >= 60
      ? `Précision phonémique de ${score} pour cent en anglais ${accentName}. Voici vos axes prioritaires.`
      : `Précision phonémique actuelle de ${score} pour cent en anglais ${accentName}. Concentrons-nous sur deux phonèmes clés.`;

  const correctionClauses = topDeviations.map((dev, idx) => {
    const prefix = idx === 0 ? 'D’abord' : 'Ensuite';
    if (dev.status === 'omitted') {
      return `${prefix}, sur le mot « ${dev.word} » resté incertain ou non capté, ${dev.spokenCoachingFr}.`;
    }
    return `${prefix}, dans « ${dev.word} », ${dev.spokenCoachingFr}.`;
  });

  return `${intro} ${correctionClauses.join(' ')} Écoutez maintenant les phonèmes de référence.`;
}

/**
 * Analyze captured speech against reference phonemes (IPA hints + word IPA + acoustic alignment)
 * Strict adherence to audio-music-intelligence: never fabricate omitted words; mark uncertain segments.
 */
export function analyzeReferencePhonemes(params: {
  expectedText: string;
  phoneticHints?: string;
  report: PhoneticCorrectionReport;
  targetAccent: 'en-GB' | 'en-US';
  acousticResult?: AcousticAnalysisResult | null;
  audioFormat?: string;
}): PhonemeEvaluationResult {
  const {
    expectedText,
    phoneticHints = '',
    report,
    targetAccent,
    acousticResult = null,
    audioFormat = 'audio/webm'
  } = params;

  const hasSpeech = report.spokenWordsCount > 0;
  const referenceHintPhonemes = tokenizeIpaPhonemes(phoneticHints);
  const expectedTokens = report.tokens.filter((t) => t.status !== 'extra');

  const estimatedDuration =
    acousticResult?.userDuration ||
    acousticResult?.targetDuration ||
    Math.max(2.0, expectedTokens.length * 0.42);

  const phonemeMap = new Map<
    string,
    {
      symbol: string;
      occurrences: number;
      exampleWords: Set<string>;
      badHits: number;
      uncertainHits: number;
      goodHits: number;
    }
  >();

  const deviations: PhonemeDeviationItem[] = [];
  const wordTimings: WordTemporalAlignment[] = [];

  let phonemeScoreAccum = 0;
  let uncertainSegmentsCount = 0;

  expectedTokens.forEach((tok, idx) => {
    const targetWord = tok.expected || tok.word;
    const refLookup = getWordPhonetics(targetWord, targetAccent);
    const refIpa = targetAccent === 'en-GB' ? refLookup.phoneticUk : refLookup.phoneticUs;
    const refPhonemes = tokenizeIpaPhonemes(refIpa);

    const spokenIsOmitted = tok.status === 'omitted' || !hasSpeech;
    const spokenLookup = spokenIsOmitted ? null : getWordPhonetics(tok.word, targetAccent);
    const spokenIpa = spokenLookup
      ? targetAccent === 'en-GB'
        ? spokenLookup.phoneticUk
        : spokenLookup.phoneticUs
      : '[segment incertain / non capté]';
    const spokenPhonemes = spokenLookup ? tokenizeIpaPhonemes(spokenIpa) : [];

    // Compute acoustic/phoneme alignment confidence for this word
    const acousticSeg = acousticResult?.wordSegments?.[idx];
    const startSec = Number(
      ((acousticSeg ? acousticSeg.startTimeRatio : idx / Math.max(1, expectedTokens.length)) *
        estimatedDuration).toFixed(2)
    );
    const endSec = Number(
      ((acousticSeg ? acousticSeg.endTimeRatio : (idx + 1) / Math.max(1, expectedTokens.length)) *
        estimatedDuration).toFixed(2)
    );

    let wordPhonemeSim = 0;
    if (spokenIsOmitted) {
      wordPhonemeSim = 0;
    } else if (tok.status === 'correct') {
      wordPhonemeSim = acousticSeg?.status === 'to-refine' ? 0.82 : 1.0;
    } else {
      const spokenSet = new Set(spokenPhonemes);
      const overlap = refPhonemes.filter((p) => spokenSet.has(p)).length;
      const ipaRatio = overlap / Math.max(1, refPhonemes.length);
      wordPhonemeSim = Math.max(0.2, Math.min(0.85, (ipaRatio + tok.similarityScore) / 2));
    }

    phonemeScoreAccum += wordPhonemeSim;

    const isUncertain = spokenIsOmitted || tok.status === 'misspelled' || wordPhonemeSim < 0.65;
    if (isUncertain) uncertainSegmentsCount++;

    wordTimings.push({
      word: targetWord,
      spokenWord: spokenIsOmitted ? '[non capté]' : tok.word,
      referencePhonemes: refIpa,
      status: tok.status,
      confidence: Number(wordPhonemeSim.toFixed(2)),
      uncertain: isUncertain,
      startSec,
      endSec
    });

    // Aggregate pedagogical phoneme statuses
    const trackedSymbols = refPhonemes.filter((s) => Boolean(PHONEME_ARTICULATION_GUIDE[s]));
    for (const sym of trackedSymbols) {
      const existing = phonemeMap.get(sym) || {
        symbol: sym,
        occurrences: 0,
        exampleWords: new Set<string>(),
        badHits: 0,
        uncertainHits: 0,
        goodHits: 0
      };
      existing.occurrences += 1;
      existing.exampleWords.add(targetWord.replace(/[.,!?;:"'«»“”]/g, ''));

      if (spokenIsOmitted) {
        existing.uncertainHits += 1;
      } else if (tok.status === 'correct' && acousticSeg?.status !== 'to-refine') {
        existing.goodHits += 1;
      } else if (spokenPhonemes.includes(sym) && tok.status === 'near_match') {
        existing.goodHits += 1;
      } else {
        existing.badHits += 1;
      }
      phonemeMap.set(sym, existing);
    }

    // Record actionable phoneme deviations
    const needsPhonemeFeedback =
      hasSpeech &&
      (tok.status === 'omitted' ||
        tok.status === 'misspelled' ||
        tok.status === 'near_match' ||
        acousticSeg?.status === 'to-refine');

    if (needsPhonemeFeedback) {
      const { keyPhoneme, guide } = findPrimaryPedagogicalPhoneme(
        targetWord,
        refPhonemes,
        spokenPhonemes,
        targetAccent
      );

      const cleanTarget = targetWord.replace(/^[«"“]+|[»"”.,!?;:]+$/g, '') || targetWord;
      const articulationTipFr =
        refLookup.tip ||
        guide?.articulationFr ||
        `Articulez distinctement les phonèmes ${refIpa} avec l’accentuation « ${refLookup.stressPattern} ».`;

      const spokenCoachingFr =
        guide?.spokenCoachingFr ||
        `articulez nettement la syllabe accentuée de ${cleanTarget}`;

      const severity: PhonemeDeviationItem['severity'] =
        tok.status === 'omitted' || tok.status === 'misspelled'
          ? 'critical'
          : tok.status === 'near_match'
          ? 'moderate'
          : 'minor';

      deviations.push({
        id: `dev-${idx}-${cleanTarget}`,
        word: cleanTarget,
        spokenWord: spokenIsOmitted ? '[non capté / incertain]' : tok.word,
        referencePhonemes: refIpa,
        referencePhonemeTokens: refPhonemes,
        spokenPhonemes: spokenIpa,
        keyPhoneme: `/${keyPhoneme}/`,
        phonemeCategory: guide?.labelFr || 'Prosodie & Phonème Cible',
        articulationTipFr,
        spokenCoachingFr,
        drillPhraseEn: cleanTarget,
        severity,
        confidence: Number(wordPhonemeSim.toFixed(2)),
        startSec,
        endSec,
        status: tok.status
      });
    }
  });

  // Sort deviations by severity then lowest confidence
  const severityRank = { critical: 0, moderate: 1, minor: 2 };
  deviations.sort((a, b) => {
    const sDiff = severityRank[a.severity] - severityRank[b.severity];
    if (sDiff !== 0) return sDiff;
    return a.confidence - b.confidence;
  });

  const phonemeAccuracyScore = hasSpeech
    ? Math.max(
        0,
        Math.min(100, Math.round((phonemeScoreAccum / Math.max(1, expectedTokens.length)) * 100))
      )
    : 0;

  const phonemeStatuses: ReferencePhonemeStatus[] = Array.from(phonemeMap.values()).map((entry) => {
    const guide = PHONEME_ARTICULATION_GUIDE[entry.symbol];
    let status: PhonemeMasteryStatus = 'mastered';
    if (!hasSpeech) {
      status = 'uncertain';
    } else if (entry.badHits > 0) {
      status = entry.goodHits > 0 ? 'to_refine' : 'missed';
    } else if (entry.uncertainHits > 0 && entry.goodHits === 0) {
      status = 'uncertain';
    } else if (entry.uncertainHits > 0) {
      status = 'to_refine';
    }

    return {
      symbol: `/${entry.symbol}/`,
      labelFr: guide?.labelFr || `Phonème /${entry.symbol}/`,
      occurrences: entry.occurrences,
      status,
      exampleWords: Array.from(entry.exampleWords).slice(0, 4),
      guide
    };
  });

  const avgConfidence =
    wordTimings.length > 0
      ? Number(
          (
            wordTimings.reduce((acc, w) => acc + w.confidence, 0) / wordTimings.length
          ).toFixed(2)
        )
      : 0;

  const modelDrillWords =
    deviations.length > 0
      ? Array.from(new Set(deviations.slice(0, 3).map((d) => d.drillPhraseEn)))
      : expectedTokens
          .map((t) => (t.expected || t.word).replace(/^[«"“]+|[»"”.,!?;:]+$/g, ''))
          .filter((w) => w.length >= 6)
          .slice(0, 2);

  const coachingScriptFr = buildHumanCoachingFr(
    phonemeAccuracyScore,
    hasSpeech,
    deviations,
    targetAccent
  );

  return {
    phonemeAccuracyScore,
    targetAccent,
    referenceHintPhonemes,
    phonemeStatuses,
    deviations,
    wordTimings,
    uncertainSegmentsCount,
    totalDurationSec: Number(estimatedDuration.toFixed(2)),
    telemetry: {
      format: audioFormat,
      language: targetAccent,
      durationSec: Number(estimatedDuration.toFixed(2)),
      avgConfidence,
      uncertainSegmentsCount
    },
    vocalFeedbackPlan: {
      coachingScriptFr,
      modelDrillWords,
      fullReferenceSentenceEn: expectedText.replace(/[«»“”"]/g, '').trim(),
      targetAccent,
      hasSpeechDetected: hasSpeech,
      priorityPhonemes: Array.from(new Set(deviations.slice(0, 3).map((d) => d.keyPhoneme)))
    }
  };
}

export type VocalFeedbackPhase =
  | 'idle'
  | 'coaching_fr'
  | 'modeling_words_slow'
  | 'modeling_sentence';

export type VocalFeedbackPlaybackMode = 'full' | 'coaching_only' | 'drill_only';

/**
 * Play automated bilingual vocal feedback (French articulatory guidance + English reference phoneme modeling)
 */
export function playAutomatedVocalFeedback(
  plan: AutomatedVocalFeedbackPlan,
  callbacks?: {
    mode?: VocalFeedbackPlaybackMode;
    onPhaseChange?: (phase: VocalFeedbackPhase) => void;
    onComplete?: () => void;
    onError?: () => void;
  }
): () => void {
  const mode = callbacks?.mode ?? 'full';
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  stopSpeech();

  const cleanup = () => {
    cancelled = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    stopSpeech();
    callbacks?.onPhaseChange?.('idle');
  };

  const playSentenceModel = () => {
    if (cancelled) return;
    if (!plan.fullReferenceSentenceEn) {
      callbacks?.onPhaseChange?.('idle');
      callbacks?.onComplete?.();
      return;
    }
    callbacks?.onPhaseChange?.('modeling_sentence');
    speakText(plan.fullReferenceSentenceEn, plan.targetAccent, 'vocal-feedback-sentence-en', {
      rateMultiplier: 0.94,
      onEnd: () => {
        if (cancelled) return;
        callbacks?.onPhaseChange?.('idle');
        callbacks?.onComplete?.();
      },
      onError: () => {
        if (cancelled) return;
        callbacks?.onPhaseChange?.('idle');
        callbacks?.onError?.();
      }
    });
  };

  const playWordDrills = () => {
    if (cancelled) return;
    if (plan.modelDrillWords.length === 0) {
      playSentenceModel();
      return;
    }
    callbacks?.onPhaseChange?.('modeling_words_slow');
    const drillText = plan.modelDrillWords.join('. ');
    speakText(drillText, plan.targetAccent, 'vocal-feedback-drill-en', {
      rate: 0.78,
      naturalProsody: false,
      onEnd: () => {
        if (cancelled) return;
        timer = setTimeout(playSentenceModel, 260);
      },
      onError: () => {
        if (cancelled) return;
        timer = setTimeout(playSentenceModel, 200);
      }
    });
  };

  if (mode === 'drill_only') {
    playWordDrills();
    return cleanup;
  }

  callbacks?.onPhaseChange?.('coaching_fr');
  speakFrenchText(plan.coachingScriptFr, 'vocal-feedback-coach-fr', {
    onEnd: () => {
      if (cancelled) return;
      if (mode === 'coaching_only') {
        callbacks?.onPhaseChange?.('idle');
        callbacks?.onComplete?.();
        return;
      }
      timer = setTimeout(playWordDrills, 300);
    },
    onError: () => {
      if (cancelled) return;
      callbacks?.onPhaseChange?.('idle');
      callbacks?.onError?.();
    }
  });

  return cleanup;
}

/**
 * Immediate single-word phoneme model drill playback
 */
export function playSinglePhonemeWordDrill(
  word: string,
  accent: 'en-GB' | 'en-US',
  speed: 'slow' | 'normal' = 'slow'
): void {
  stopSpeech();
  const rate = speed === 'slow' ? 0.76 : 0.96;
  speakText(word, accent, `phoneme-drill-${word}-${speed}-${accent}`, {
    rate,
    naturalProsody: false
  });
}
