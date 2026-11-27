import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  compareOrthographyAndPhonetics,
  getWordPhonetics
} from '../src/utils/speechRecognitionHelper.ts';
import {
  tokenizeIpaPhonemes,
  analyzeReferencePhonemes,
  playAutomatedVocalFeedback
} from '../src/utils/phonemeFeedbackEngine.ts';
import { selectAndLoadSkillsForTask } from '../skills/skillsStore.ts';
import { SPEAKING_ITEMS } from '../src/data/curriculum.ts';

const WORKSPACE_ROOT = process.cwd();

describe('Studio d’Élocution Skill & Reference Phoneme Engine', () => {
  it('loads the real audio-music-intelligence Skill instructions for Studio d’Élocution without simulation', () => {
    const result = selectAndLoadSkillsForTask(
      WORKSPACE_ROOT,
      "Studio d'Élocution : analyse audio, transcription mot-à-mot, phonèmes de référence, rétroaction vocale automatisée TTS"
    );

    assert.equal(result.context.hasSimulatedSkills, false);
    const audioSkill = result.context.loadedSkills.find(
      (s) => s.skillId === 'audio-music-intelligence'
    );
    assert.ok(audioSkill, 'Expected audio-music-intelligence skill to be loaded for Studio d’Élocution');
    assert.equal(audioSkill.loadStatus, 'loaded');
    assert.ok((audioSkill.instructionsMarkdown || '').includes('alignement mot-à-mot'));
  });

  it('provides genuine UK and US IPA reference phonemes for all SPEAKING_ITEMS curriculum passages', () => {
    for (const item of SPEAKING_ITEMS) {
      const words = item.textToRead
        .replace(/[«»“”".,!?;:—]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      for (const word of words) {
        const lookupUk = getWordPhonetics(word, 'en-GB');
        const lookupUs = getWordPhonetics(word, 'en-US');
        assert.equal(
          lookupUk.isFromLexicon,
          true,
          `Expected lexicon IPA entry for curriculum word "${word}" in ${item.id}`
        );
        assert.ok(lookupUk.phoneticUk.startsWith('/') && lookupUk.phoneticUk.endsWith('/'));
        assert.ok(lookupUs.phoneticUs.startsWith('/') && lookupUs.phoneticUs.endsWith('/'));
      }
    }

    const morningUk = getWordPhonetics('morning', 'en-GB');
    const morningUs = getWordPhonetics('morning', 'en-US');
    assert.equal(morningUk.activePhonetic, '/ˈmɔː.nɪŋ/');
    assert.equal(morningUs.activePhonetic, '/ˈmɔːr.nɪŋ/');
  });

  it('tokenizes multi-character IPA symbols accurately from reference hints', () => {
    const tokens = tokenizeIpaPhonemes('/ðə ˌjuːnɪˈvɜːsɪti ˈɑːkaɪvz kənˈteɪn ˈθaʊzəndz/');
    assert.ok(tokens.includes('ð'));
    assert.ok(tokens.includes('uː'));
    assert.ok(tokens.includes('ɜː'));
    assert.ok(tokens.includes('ɑː'));
    assert.ok(tokens.includes('aɪ'));
    assert.ok(tokens.includes('eɪ'));
    assert.ok(tokens.includes('θ'));
    assert.ok(tokens.includes('aʊ'));
    assert.ok(tokens.includes('ə'));
  });

  it('identifies reference-phoneme deviations and builds bilingual coaching + model drills', () => {
    const target = 'The university archives contain thousands of rare manuscripts.';
    const hints = '/ðə ˌjuːnɪˈvɜːsɪti ˈɑːkaɪvz kənˈteɪn ˈθaʊzəndz əv reə ˈmænjʊskrɪpts/';
    // User omits "thousands" and mispronounces "archives"
    const spoken = 'The university archive contain of rare manuscript';

    const report = compareOrthographyAndPhonetics(target, spoken, 'en-GB');
    const evaluation = analyzeReferencePhonemes({
      expectedText: target,
      phoneticHints: hints,
      report,
      targetAccent: 'en-GB'
    });

    assert.equal(evaluation.vocalFeedbackPlan.hasSpeechDetected, true);
    assert.ok(evaluation.phonemeAccuracyScore > 0 && evaluation.phonemeAccuracyScore < 100);
    assert.ok(evaluation.uncertainSegmentsCount >= 1);
    assert.ok(evaluation.deviations.some((d) => d.word.toLowerCase() === 'thousands'));

    const thousandsDev = evaluation.deviations.find((d) => d.word.toLowerCase() === 'thousands')!;
    assert.equal(thousandsDev.keyPhoneme, '/θ/');
    assert.ok(thousandsDev.articulationTipFr.length > 15);
    assert.ok(evaluation.vocalFeedbackPlan.coachingScriptFr.includes('thousands'));
    assert.ok(evaluation.vocalFeedbackPlan.modelDrillWords.includes('thousands'));
    assert.equal(evaluation.wordTimings.length, 8);
  });

  it('never fabricates omitted words on silence and triggers clean vocal coaching fallback', () => {
    const target = 'Good morning! It is wonderful to meet you today.';
    const report = compareOrthographyAndPhonetics(target, '', 'en-GB');
    const evaluation = analyzeReferencePhonemes({
      expectedText: target,
      phoneticHints: '/ɡʊd ˈmɔːnɪŋ/',
      report,
      targetAccent: 'en-GB'
    });

    assert.equal(evaluation.phonemeAccuracyScore, 0);
    assert.equal(evaluation.vocalFeedbackPlan.hasSpeechDetected, false);
    assert.equal(evaluation.uncertainSegmentsCount, 9);
    assert.ok(evaluation.vocalFeedbackPlan.coachingScriptFr.includes('Aucune parole'));
    assert.ok(evaluation.phonemeStatuses.every((s) => s.status === 'uncertain'));

    // Verify vocal sequencer executes cleanly in Node environment without window
    const phases: string[] = [];
    const cancel = playAutomatedVocalFeedback(evaluation.vocalFeedbackPlan, {
      mode: 'coaching_only',
      onPhaseChange: (phase) => phases.push(phase)
    });
    assert.ok(phases.includes('coaching_fr'));
    cancel();
    assert.equal(phases[phases.length - 1], 'idle');
  });

  it('verifies SpeakingStudioModal integrates PhonemeVocalFeedbackPanel and selectSkillsForTask', () => {
    const modalSource = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'SpeakingStudioModal.tsx'),
      'utf-8'
    );
    assert.ok(modalSource.includes('selectSkillsForTask'));
    assert.ok(modalSource.includes('analyzeReferencePhonemes'));
    assert.ok(modalSource.includes('playAutomatedVocalFeedback'));
    assert.ok(modalSource.includes('PhonemeVocalFeedbackPanel'));
  });
});
