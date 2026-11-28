import type { GrammarBattleQuestion } from '../data/ecosystemChallengesData';
import {
  compareOrthographyAndPhonetics,
  type OrthographicDiffToken,
  type PhoneticCorrectionReport
} from './speechRecognitionHelper';
import {
  analyzeReferencePhonemes,
  type PhonemeEvaluationResult
} from './phonemeFeedbackEngine';

export type VoiceGrammarStatus =
  | 'correct'
  | 'wrong_option'
  | 'incomplete_or_unrecognized'
  | 'silent';

export type UtteranceScope = 'full_sentence' | 'target_phrase' | 'silent';

export interface GrammarDiffToken {
  id: string;
  text: string;
  expected?: string;
  kind: 'match' | 'grammar_error' | 'missing' | 'extra';
}

export interface GrammarBattleVoiceEvaluation {
  status: VoiceGrammarStatus;
  utteranceScope: UtteranceScope;
  rawTranscript: string;
  normalizedTranscript: string;
  matchedOptionIndex: number | null;
  matchedOptionText: string | null;
  isGrammarCorrect: boolean;
  confidence: number; // 0..1
  expectedAnswerText: string;
  expectedSentence: string;
  comparisonTarget: string;
  grammarFeedbackFr: string;
  correctionHintFr: string;
  grammarDiffTokens: GrammarDiffToken[];
  phoneticReport: PhoneticCorrectionReport | null;
  phonemeEvaluation: PhonemeEvaluationResult | null;
}

const CONTRACTION_EXPANSIONS: Array<[RegExp, string]> = [
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bhadn't\b/g, 'had not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bshouldn't\b/g, 'should not'],
  [/\bmustn't\b/g, 'must not'],
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bi've\b/g, 'i have'],
  [/\byou've\b/g, 'you have'],
  [/\bwe've\b/g, 'we have'],
  [/\bthey've\b/g, 'they have'],
  [/\bi'll\b/g, 'i will'],
  [/\byou'll\b/g, 'you will'],
  [/\bshe'll\b/g, 'she will'],
  [/\bhe'll\b/g, 'he will'],
  [/\bit'll\b/g, 'it will'],
  [/\bwe'll\b/g, 'we will'],
  [/\bthey'll\b/g, 'they will']
];

const NUMBER_WORDS: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
  '19': 'nineteenth'
};

/**
 * Normalize English speech transcript or target text for deterministic comparison
 */
export function normalizeEnglishSpeech(input: string): string {
  if (!input) return '';
  let text = input
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[«»“”"]/g, ' ')
    .replace(/[.,!?;:()[\]{}—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of CONTRACTION_EXPANSIONS) {
    text = text.replace(pattern, replacement);
  }

  text = text
    .split(/\s+/)
    .map((tok) => NUMBER_WORDS[tok] ?? tok)
    .join(' ')
    .replace(/[^a-z0-9'\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Build a complete grammatical English sentence by substituting option into the prompt blank
 */
export function buildCandidateGrammarSentence(
  question: GrammarBattleQuestion,
  optionIndex: number
): string {
  const optionText = question.options[optionIndex] ?? '';
  if (question.promptEn.includes('___')) {
    return question.promptEn.replace('___', optionText).replace(/\s+/g, ' ').trim();
  }
  return `${question.promptEn} ${optionText}`.replace(/\s+/g, ' ').trim();
}

/**
 * Build the canonical correct sentence for a GrammarBattleQuestion
 */
export function buildTargetGrammarSentence(question: GrammarBattleQuestion): string {
  return buildCandidateGrammarSentence(question, question.correctIndex);
}

function charLevenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}

/**
 * Order-preserving Longest Common Subsequence ratio on word tokens
 */
function tokenSequenceSimilarity(expectedTokens: string[], spokenTokens: string[]): number {
  if (expectedTokens.length === 0 && spokenTokens.length === 0) return 1;
  if (expectedTokens.length === 0 || spokenTokens.length === 0) return 0;

  const m = expectedTokens.length;
  const n = spokenTokens.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (expectedTokens[i - 1] === spokenTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = dp[m][n];
  return (2 * lcs) / (m + n);
}

/**
 * Determine if normalizedSpoken contains normalizedOption as an exact ordered sequence of words
 */
function containsOrderedPhrase(spokenTokens: string[], optionTokens: string[]): boolean {
  if (optionTokens.length === 0 || spokenTokens.length < optionTokens.length) return false;
  for (let i = 0; i <= spokenTokens.length - optionTokens.length; i++) {
    let matched = true;
    for (let j = 0; j < optionTokens.length; j++) {
      if (spokenTokens[i + j] !== optionTokens[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

interface CandidateMatchScore {
  optionIndex: number;
  optionText: string;
  normalizedOption: string;
  candidateSentence: string;
  phraseExactMatch: boolean;
  sentenceExactMatch: boolean;
  phraseScore: number;
  sentenceScore: number;
  combinedScore: number;
}

/**
 * Match spoken voice transcript against all candidate options (supporting both full-sentence speech and blank-only answers)
 */
export function matchSpokenGrammarAnswer(
  transcript: string,
  question: GrammarBattleQuestion
): {
  matchedOptionIndex: number | null;
  confidence: number;
  utteranceScope: UtteranceScope;
  normalizedTranscript: string;
} {
  const normalizedTranscript = normalizeEnglishSpeech(transcript);
  if (!normalizedTranscript) {
    return {
      matchedOptionIndex: null,
      confidence: 0,
      utteranceScope: 'silent',
      normalizedTranscript: ''
    };
  }

  const spokenTokens = normalizedTranscript.split(' ').filter(Boolean);
  const promptStripped = normalizeEnglishSpeech(question.promptEn.replace('___', ' '));
  const promptTokens = promptStripped.split(' ').filter(Boolean);

  // Determine whether the student spoke surrounding sentence context or just the target phrase
  const promptOverlap = spokenTokens.filter((t) => promptTokens.includes(t)).length;
  const utteranceScope: UtteranceScope =
    spokenTokens.length >= Math.max(3, Math.ceil(promptTokens.length * 0.35)) && promptOverlap >= 2
      ? 'full_sentence'
      : 'target_phrase';

  // Extract context window immediately before and after '___' to disambiguate slot words accurately
  const blankIdx = question.promptEn.indexOf('___');
  const beforeBlankTokens =
    blankIdx >= 0
      ? normalizeEnglishSpeech(question.promptEn.slice(0, blankIdx)).split(' ').filter(Boolean).slice(-2)
      : [];
  const afterBlankTokens =
    blankIdx >= 0
      ? normalizeEnglishSpeech(question.promptEn.slice(blankIdx + 3)).split(' ').filter(Boolean).slice(0, 2)
      : [];

  const scoredCandidates: CandidateMatchScore[] = question.options.map((opt, idx) => {
    const normalizedOption = normalizeEnglishSpeech(opt);
    const optionTokens = normalizedOption.split(' ').filter(Boolean);
    const candidateSentence = buildCandidateGrammarSentence(question, idx);
    const normalizedCandidateSentence = normalizeEnglishSpeech(candidateSentence);
    const candidateTokens = normalizedCandidateSentence.split(' ').filter(Boolean);

    const sentenceExactMatch = normalizedTranscript === normalizedCandidateSentence;
    const phraseExactStandalone = normalizedTranscript === normalizedOption;
    const phraseContainedOrdered = containsOrderedPhrase(spokenTokens, optionTokens);

    // Context-anchored slot phrase: e.g. "sister usually listens to english", "not only did she deliver"
    const contextualPhraseTokens = [...beforeBlankTokens, ...optionTokens, ...afterBlankTokens];
    const contextualMatch =
      contextualPhraseTokens.length > optionTokens.length &&
      containsOrderedPhrase(spokenTokens, contextualPhraseTokens);

    const phraseCharSim = charLevenshteinSimilarity(normalizedTranscript, normalizedOption);
    const phraseTokenSim = tokenSequenceSimilarity(optionTokens, spokenTokens);
    let phraseScore = Math.max(phraseCharSim, phraseTokenSim);
    if (phraseExactStandalone) {
      phraseScore = 1.0;
    } else if (contextualMatch) {
      phraseScore = 0.99;
    } else if (phraseContainedOrdered) {
      // Slightly prefer longer exact matches (e.g. "had acted" over "acted", "listens to" over "listen")
      phraseScore = Math.max(phraseScore, 0.88 + Math.min(0.08, optionTokens.length * 0.03));
    }

    const sentenceCharSim = charLevenshteinSimilarity(
      normalizedTranscript,
      normalizedCandidateSentence
    );
    const sentenceTokenSim = tokenSequenceSimilarity(candidateTokens, spokenTokens);
    const sentenceScore = sentenceExactMatch
      ? 1.0
      : sentenceTokenSim * 0.6 + sentenceCharSim * 0.4;

    const combinedScore =
      utteranceScope === 'full_sentence'
        ? Math.max(sentenceScore, contextualMatch ? 0.98 : sentenceScore * 0.72 + phraseScore * 0.28)
        : Math.max(phraseScore, sentenceScore * 0.85);

    return {
      optionIndex: idx,
      optionText: opt,
      normalizedOption,
      candidateSentence,
      phraseExactMatch: phraseExactStandalone || contextualMatch || phraseContainedOrdered,
      sentenceExactMatch,
      phraseScore,
      sentenceScore,
      combinedScore
    };
  });

  scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore);
  const best = scoredCandidates[0];
  const second = scoredCandidates[1];

  if (!best) {
    return {
      matchedOptionIndex: null,
      confidence: 0,
      utteranceScope,
      normalizedTranscript
    };
  }

  // Verify the spoken input actually matches one of the candidates rather than unrelated noise
  const minThreshold = utteranceScope === 'full_sentence' ? 0.56 : 0.62;
  if (best.combinedScore < minThreshold) {
    return {
      matchedOptionIndex: null,
      confidence: Number(best.combinedScore.toFixed(2)),
      utteranceScope,
      normalizedTranscript
    };
  }

  // If full sentence was spoken and top two options are tied with identical score (meaning user spoke the prompt but omitted/mangled the blank completely)
  if (
    utteranceScope === 'full_sentence' &&
    second &&
    Math.abs(best.combinedScore - second.combinedScore) < 0.005 &&
    !best.phraseExactMatch &&
    !second.phraseExactMatch
  ) {
    return {
      matchedOptionIndex: null,
      confidence: Number(best.combinedScore.toFixed(2)),
      utteranceScope,
      normalizedTranscript
    };
  }

  return {
    matchedOptionIndex: best.optionIndex,
    confidence: Number(Math.min(1, best.combinedScore).toFixed(2)),
    utteranceScope,
    normalizedTranscript
  };
}

function mapOrthographicToGrammarDiff(tokens: OrthographicDiffToken[]): GrammarDiffToken[] {
  return tokens.map((tok) => {
    if (tok.status === 'correct') {
      return {
        id: `gd-${tok.id}`,
        text: tok.expected || tok.word,
        expected: tok.expected,
        kind: 'match'
      };
    }
    if (tok.status === 'omitted') {
      return {
        id: `gd-${tok.id}`,
        text: tok.expected || tok.word,
        expected: tok.expected,
        kind: 'missing'
      };
    }
    if (tok.status === 'extra') {
      return {
        id: `gd-${tok.id}`,
        text: tok.word,
        kind: 'extra'
      };
    }
    return {
      id: `gd-${tok.id}`,
      text: tok.word,
      expected: tok.expected,
      kind: 'grammar_error'
    };
  });
}

/**
 * Produce full immediate Voice-to-Text Grammar Correction & Phonetic Analysis for GrammarBattleModal
 */
export function evaluateGrammarBattleVoice(
  transcript: string,
  question: GrammarBattleQuestion,
  targetAccent: 'en-GB' | 'en-US' = 'en-GB'
): GrammarBattleVoiceEvaluation {
  const expectedAnswerText = question.options[question.correctIndex] ?? '';
  const expectedSentence = buildTargetGrammarSentence(question);
  const match = matchSpokenGrammarAnswer(transcript, question);

  if (match.utteranceScope === 'silent' || !match.normalizedTranscript) {
    return {
      status: 'silent',
      utteranceScope: 'silent',
      rawTranscript: '',
      normalizedTranscript: '',
      matchedOptionIndex: null,
      matchedOptionText: null,
      isGrammarCorrect: false,
      confidence: 0,
      expectedAnswerText,
      expectedSentence,
      comparisonTarget: expectedSentence,
      grammarFeedbackFr:
        'Aucune parole distincte n’a été détectée par le microphone. Parlez nettement près du micro puis réessayez.',
      correctionHintFr:
        'Prononcez soit la réponse cible, soit la phrase anglaise complète à voix haute.',
      grammarDiffTokens: [],
      phoneticReport: null,
      phonemeEvaluation: null
    };
  }

  const comparisonTarget =
    match.utteranceScope === 'target_phrase' ? expectedAnswerText : expectedSentence;

  const phoneticReport = compareOrthographyAndPhonetics(
    comparisonTarget,
    transcript,
    targetAccent
  );

  const phonemeEvaluation = analyzeReferencePhonemes({
    expectedText: comparisonTarget,
    report: phoneticReport,
    targetAccent
  });

  const grammarDiffTokens = mapOrthographicToGrammarDiff(phoneticReport.tokens);
  const matchedOptionText =
    match.matchedOptionIndex !== null ? question.options[match.matchedOptionIndex] : null;
  const isGrammarCorrect = match.matchedOptionIndex === question.correctIndex;

  let status: VoiceGrammarStatus = 'incomplete_or_unrecognized';
  let grammarFeedbackFr = '';
  let correctionHintFr = '';

  if (match.matchedOptionIndex === null) {
    status = 'incomplete_or_unrecognized';
    grammarFeedbackFr = `Votre énoncé (« ${transcript.trim()} ») ne correspond clairement à aucune des 4 structures grammaticales proposées.`;
    correctionHintFr = `Forme attendue : « ${expectedAnswerText} » dans « ${expectedSentence} ».`;
  } else if (isGrammarCorrect) {
    status = 'correct';
    const phonScore = phonemeEvaluation.phonemeAccuracyScore;
    if (phonScore >= 85) {
      grammarFeedbackFr = `Syntaxe exacte (« ${expectedAnswerText} ») et articulation phonémique maîtrisée à ${phonScore}% !`;
    } else {
      grammarFeedbackFr = `Structure grammaticale validée (« ${expectedAnswerText} »). Affinez encore les phonèmes surlignés (${phonScore}%).`;
    }
    correctionHintFr = question.explanationFr;
  } else {
    status = 'wrong_option';
    grammarFeedbackFr = `Erreur grammaticale détectée : vous avez prononcé la forme « ${matchedOptionText} » alors que la règle exige « ${expectedAnswerText} ».`;
    correctionHintFr = question.explanationFr;
  }

  return {
    status,
    utteranceScope: match.utteranceScope,
    rawTranscript: transcript.trim(),
    normalizedTranscript: match.normalizedTranscript,
    matchedOptionIndex: match.matchedOptionIndex,
    matchedOptionText,
    isGrammarCorrect,
    confidence: match.confidence,
    expectedAnswerText,
    expectedSentence,
    comparisonTarget,
    grammarFeedbackFr,
    correctionHintFr,
    grammarDiffTokens,
    phoneticReport,
    phonemeEvaluation
  };
}
