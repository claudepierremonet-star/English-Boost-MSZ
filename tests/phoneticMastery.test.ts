import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import type { LearningAttempt } from '../src/firebase/types.ts';
import {
  COMPLEX_PHONEME_CONFIGS,
  computeComplexPhonemeMastery,
  mergeSpeakingSessions,
  normalizeComplexPhonemeSymbol,
  type SpeakingPhonemeSessionSnapshot
} from '../src/utils/phoneticMasteryEngine.ts';

const WORKSPACE_ROOT = process.cwd();

describe('Phonetic Mastery Engine & Dashboard Integration', () => {
  it('returns honest unassessed state with null metrics when no Studio recordings exist', () => {
    const summary = computeComplexPhonemeMastery([], []);
    assert.equal(summary.overallMasteryPercent, null);
    assert.equal(summary.assessedPhonemesCount, 0);
    assert.equal(summary.totalTrackedPhonemes, COMPLEX_PHONEME_CONFIGS.length);
    assert.equal(summary.totalSpeakingSessions, 0);
    assert.equal(summary.weakestPhoneme, null);
    for (const item of summary.phonemes) {
      assert.equal(item.masteryPercent, null);
      assert.equal(item.status, 'unassessed');
      assert.equal(item.sessionsCount, 0);
      assert.equal(item.trend, 'none');
    }
  });

  it('normalizes UK/US variants cleanly and aggregates mastery and upward trends across sessions', () => {
    assert.equal(normalizeComplexPhonemeSymbol('/θ/'), 'θ');
    assert.equal(normalizeComplexPhonemeSymbol('ɝː'), 'ɜː');
    assert.equal(normalizeComplexPhonemeSymbol('/oʊ/'), 'əʊ');

    const earlierSession: SpeakingPhonemeSessionSnapshot = {
      sessionId: 'spk-100',
      moduleId: 'spk-b1',
      title: 'Academic Archival Research',
      level: 'B1',
      targetAccent: 'en-GB',
      phonemeAccuracyScore: 54,
      overallScore: 54,
      recordedAt: '2026-11-26T10:00:00.000Z',
      phonemeStatuses: [
        { symbol: '/θ/', status: 'missed', occurrences: 2, exampleWords: ['thousands', 'eighteenth'] },
        { symbol: '/ð/', status: 'to_refine', occurrences: 2, exampleWords: ['the'] },
        { symbol: '/ɜː/', status: 'mastered', occurrences: 1, exampleWords: ['university'] }
      ]
    };

    const recentSession: SpeakingPhonemeSessionSnapshot = {
      sessionId: 'spk-101',
      moduleId: 'spk-b1',
      title: 'Academic Archival Research',
      level: 'B1',
      targetAccent: 'en-US',
      phonemeAccuracyScore: 92,
      overallScore: 92,
      recordedAt: '2026-11-28T09:00:00.000Z',
      phonemeStatuses: [
        { symbol: '/θ/', status: 'mastered', occurrences: 2, exampleWords: ['thousands'] },
        { symbol: '/ð/', status: 'mastered', occurrences: 1, exampleWords: ['the'] },
        { symbol: '/ɝː/', status: 'mastered', occurrences: 1, exampleWords: ['university'] }
      ]
    };

    const summary = computeComplexPhonemeMastery([recentSession, earlierSession], []);
    assert.equal(summary.totalSpeakingSessions, 2);
    assert.equal(summary.assessedPhonemesCount, 3);
    assert.ok(summary.overallMasteryPercent !== null && summary.overallMasteryPercent >= 70);

    const theta = summary.phonemes.find((p) => p.symbol === 'θ')!;
    assert.equal(theta.sessionsCount, 2);
    assert.equal(theta.trend, 'up');
    assert.ok(theta.trendDelta > 20);
    assert.ok(theta.exampleWords.includes('thousands'));

    const centralVowel = summary.phonemes.find((p) => p.symbol === 'ɜː')!;
    assert.equal(centralVowel.sessionsCount, 2);
    assert.equal(centralVowel.status, 'mastered');
  });

  it('hydrates historical speaking LearningAttempt entries while deduplicating nearby snapshots', () => {
    const attemptFromCurriculum: LearningAttempt = {
      attemptId: 'att_spk_old',
      moduleId: 'spk-a1',
      moduleType: 'speaking',
      title: 'Daily Greeting & Morning Courtesies',
      level: 'A1',
      score: 86,
      durationSeconds: 20,
      completedAt: '2026-11-25T08:00:00.000Z'
    };

    const attemptNearbyDuplicate: LearningAttempt = {
      attemptId: 'att_spk_dup',
      moduleId: 'spk-b1',
      moduleType: 'speaking',
      title: 'Academic Archival Research',
      level: 'B1',
      score: 90,
      durationSeconds: 18,
      completedAt: '2026-11-28T09:00:30.000Z'
    };

    const snapshot: SpeakingPhonemeSessionSnapshot = {
      sessionId: 'spk-101',
      moduleId: 'spk-b1',
      title: 'Academic Archival Research',
      level: 'B1',
      targetAccent: 'en-GB',
      phonemeAccuracyScore: 90,
      overallScore: 90,
      recordedAt: '2026-11-28T09:00:00.000Z',
      phonemeStatuses: [
        { symbol: '/θ/', status: 'mastered', occurrences: 2, exampleWords: ['thousands'] }
      ]
    };

    const merged = mergeSpeakingSessions([snapshot], [attemptFromCurriculum, attemptNearbyDuplicate]);
    assert.equal(merged.length, 2);
    assert.ok(merged.some((s) => s.sessionId === 'att_spk_old'));
    assert.ok(!merged.some((s) => s.sessionId === 'att_spk_dup'));

    const summary = computeComplexPhonemeMastery([snapshot], [attemptFromCurriculum]);
    const nasalNg = summary.phonemes.find((p) => p.symbol === 'ŋ')!;
    assert.equal(nasalNg.sessionsCount, 1);
    assert.equal(nasalNg.status, 'mastered');
    assert.ok(nasalNg.exampleWords.some((w) => w.toLowerCase() === 'morning'));
  });

  it('verifies SpeakingStudioModal, Recharts circular gauge in PhoneticMasteryWidget, and DashboardView source wiring', () => {
    const studioSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SpeakingStudioModal.tsx'),
      'utf8'
    );
    const widgetSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/PhoneticMasteryWidget.tsx'),
      'utf8'
    );
    const dashboardSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/DashboardView.tsx'),
      'utf8'
    );

    assert.ok(studioSrc.includes('saveSpeakingPhonemeTelemetry'));
    assert.ok(studioSrc.includes('phonemeStatuses'));
    assert.ok(widgetSrc.includes("from 'recharts'"));
    assert.ok(widgetSrc.includes('<RadialBarChart'));
    assert.ok(widgetSrc.includes('<RadialBar'));
    assert.ok(widgetSrc.includes('<PolarAngleAxis'));
    assert.ok(widgetSrc.includes('<ResponsiveContainer'));
    assert.ok(dashboardSrc.includes('PhoneticMasteryWidget'));
    assert.ok(dashboardSrc.includes("onLaunchEcosystemModule?.('speaking')"));
  });
});
