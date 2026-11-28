import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { GRAMMAR_BATTLE_QUESTIONS } from '../src/data/ecosystemChallengesData.ts';
import {
  buildTargetGrammarSentence,
  evaluateGrammarBattleVoice,
  matchSpokenGrammarAnswer,
  normalizeEnglishSpeech
} from '../src/utils/grammarBattleVoiceEngine.ts';

const WORKSPACE_ROOT = process.cwd();

describe('Grammar Battle Voice-to-Text Engine', () => {
  it('builds complete target grammar sentences for every battle question without blanks left behind', () => {
    assert.ok(GRAMMAR_BATTLE_QUESTIONS.length >= 16);
    for (const q of GRAMMAR_BATTLE_QUESTIONS) {
      const sentence = buildTargetGrammarSentence(q);
      assert.ok(!sentence.includes('___'), `Question ${q.id} still has blank placeholder`);
      assert.ok(sentence.includes(q.options[q.correctIndex]), `Missing answer in ${q.id}`);
    }
  });

  it('matches spoken full sentences and standalone target phrases cleanly', () => {
    const q1 = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-j1')!;
    const fullEval = evaluateGrammarBattleVoice(
      'My sister usually listens to English podcasts before sleeping.',
      q1,
      'en-GB'
    );
    assert.equal(fullEval.status, 'correct');
    assert.equal(fullEval.utteranceScope, 'full_sentence');
    assert.equal(fullEval.matchedOptionIndex, q1.correctIndex);
    assert.equal(fullEval.isGrammarCorrect, true);
    assert.ok(fullEval.phonemeEvaluation);
    assert.ok(fullEval.phonemeEvaluation.phonemeAccuracyScore >= 90);

    const phraseEval = evaluateGrammarBattleVoice('listens to', q1, 'en-US');
    assert.equal(phraseEval.status, 'correct');
    assert.equal(phraseEval.utteranceScope, 'target_phrase');
    assert.equal(phraseEval.matchedOptionIndex, q1.correctIndex);
    assert.ok(phraseEval.phonemeEvaluation);
    assert.equal(phraseEval.phonemeEvaluation.phonemeAccuracyScore, 100);
  });

  it('normalizes ASR digits and contractions when matching grammar sentences', () => {
    const qSinceFor = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-s2')!;
    const evalNum = evaluateGrammarBattleVoice(
      'She has studied theatre at school for 4 years',
      qSinceFor,
      'en-GB'
    );
    assert.equal(evalNum.status, 'correct');
    assert.equal(evalNum.matchedOptionIndex, 1);
    assert.equal(normalizeEnglishSpeech("don't"), 'do not');
  });

  it('distinguishes word-order inversions and subtle verb inflections accurately', () => {
    const qInversion = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-t1')!;
    const wrongOrder = evaluateGrammarBattleVoice(
      'Not only she did deliver an eloquent speech, but she also answered every question calmly.',
      qInversion,
      'en-GB'
    );
    assert.equal(wrongOrder.status, 'wrong_option');
    assert.equal(wrongOrder.matchedOptionIndex, 0); // 'she did'
    assert.equal(wrongOrder.isGrammarCorrect, false);
    assert.ok(wrongOrder.grammarFeedbackFr.includes('she did'));
    assert.ok(wrongOrder.grammarFeedbackFr.includes('did she'));

    const rightOrder = evaluateGrammarBattleVoice(
      'Not only did she deliver an eloquent speech, but she also answered every question calmly.',
      qInversion,
      'en-GB'
    );
    assert.equal(rightOrder.status, 'correct');
    assert.equal(rightOrder.matchedOptionIndex, 1); // 'did she'
  });

  it('detects wrong grammatical option and provides actionable grammar diff and phoneme analysis', () => {
    const q1 = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-j1')!;
    const wrongEval = evaluateGrammarBattleVoice(
      'My sister usually listen to English podcasts before sleeping',
      q1,
      'en-GB'
    );
    assert.equal(wrongEval.status, 'wrong_option');
    assert.equal(wrongEval.matchedOptionIndex, 0);
    assert.equal(wrongEval.isGrammarCorrect, false);
    assert.ok(wrongEval.grammarDiffTokens.some((t) => t.kind === 'grammar_error' || t.kind === 'missing'));
    assert.ok(wrongEval.phonemeEvaluation);
    assert.ok(wrongEval.phonemeEvaluation.vocalFeedbackPlan.coachingScriptFr.length > 20);
  });

  it('never fabricates positive scores on silent/empty transcripts or unrelated noise', () => {
    const qCond = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-l1')!;
    const silentEval = evaluateGrammarBattleVoice('   ', qCond, 'en-GB');
    assert.equal(silentEval.status, 'silent');
    assert.equal(silentEval.matchedOptionIndex, null);
    assert.equal(silentEval.isGrammarCorrect, false);
    assert.equal(silentEval.phonemeEvaluation, null);

    const unrelatedMatch = matchSpokenGrammarAnswer('bananas helicopters tomorrow morning', qCond);
    assert.equal(unrelatedMatch.matchedOptionIndex, null);

    const unrelatedEval = evaluateGrammarBattleVoice('bananas helicopters tomorrow morning', qCond, 'en-US');
    assert.equal(unrelatedEval.status, 'incomplete_or_unrecognized');
    assert.equal(unrelatedEval.isGrammarCorrect, false);
  });

  it('produces reference phoneme statuses and articulatory tips for dental fricatives and long vowels', () => {
    const qSinceFor = GRAMMAR_BATTLE_QUESTIONS.find((q) => q.id === 'gb-s2')!;
    const evalRes = evaluateGrammarBattleVoice(
      'She has studied theatre at school since four years',
      qSinceFor,
      'en-GB'
    );
    assert.equal(evalRes.status, 'wrong_option');
    assert.ok(evalRes.phonemeEvaluation);
    const hasTrackedPhonemes = evalRes.phonemeEvaluation.phonemeStatuses.length > 0;
    assert.equal(hasTrackedPhonemes, true);
    assert.ok(evalRes.phonemeEvaluation.deviations.length >= 1);
  });
});

describe('GrammarBattleModal Voice-to-Text Integration', () => {
  it('wires SpeechRecognitionController, evaluateGrammarBattleVoice, and PhonemeVocalFeedbackPanel', () => {
    const modalSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/GrammarBattleModal.tsx'),
      'utf8'
    );
    assert.ok(modalSource.includes('SpeechRecognitionController'));
    assert.ok(modalSource.includes('isSpeechRecognitionAvailable'));
    assert.ok(modalSource.includes('evaluateGrammarBattleVoice'));
    assert.ok(modalSource.includes('PhonemeVocalFeedbackPanel'));
    assert.ok(modalSource.includes('playAutomatedVocalFeedback'));
    assert.ok(modalSource.includes('abortVoiceCapture'));
  });
});
