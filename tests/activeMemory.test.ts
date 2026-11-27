import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  buildActiveMemoryConcepts,
  computeNextSm2State,
  estimateConceptRetention
} from '../src/utils/activeMemoryEngine.ts';
import type { FlashcardProgress } from '../src/firebase/types.ts';
import type { ErrorJournalItem } from '../src/utils/errorJournal.ts';
import { getRegistrySnapshot } from '../skills/skillsStore.ts';
import { selectRelevantSkills } from '../skills/skillEngine.ts';
import { SPACED_REPETITION_500 } from '../src/data/spacedRepetition500.ts';

const WORKSPACE_ROOT = process.cwd();

describe('Active Memory Spaced Repetition Engine (SM-2)', () => {
  it('prioritizes unresolved error terms, due SM-2 cards, and CEFR-calibrated concepts', () => {
    const now = Date.parse('2026-11-27T12:00:00Z');
    const dueCard = SPACED_REPETITION_500[0];
    const masteredFutureCard = SPACED_REPETITION_500[1];

    const flashcards: FlashcardProgress[] = [
      {
        cardId: dueCard.id,
        term: dueCard.term,
        repetitions: 2,
        intervalDays: 3,
        easeFactor: 2.5,
        nextReviewDate: new Date(now - 2 * 86400000).toISOString(),
        lastQualityScore: 3,
        state: 'review'
      },
      {
        cardId: masteredFutureCard.id,
        term: masteredFutureCard.term,
        repetitions: 5,
        intervalDays: 14,
        easeFactor: 2.7,
        nextReviewDate: new Date(now + 10 * 86400000).toISOString(),
        lastQualityScore: 5,
        state: 'mastered'
      }
    ];

    const errors: ErrorJournalItem[] = [
      {
        id: 'err_test_1',
        source: 'flashcard',
        term: 'Equivocal',
        translationFr: 'Équivoque',
        definition: 'Open to double interpretation.',
        cefrLevel: 'C1',
        errorCount: 2,
        lastMissedAt: new Date(now - 3600000).toISOString(),
        resolved: false
      }
    ];

    const plan = buildActiveMemoryConcepts(flashcards, errors, 'B2', 6, now);

    assert.equal(plan.concepts.length, 6);
    assert.equal(plan.concepts[0].term, 'Equivocal');
    assert.equal(plan.concepts[0].urgency, 'fragile');
    assert.ok(plan.concepts.some((c) => c.cardId === dueCard.id && c.urgency === 'due'));
    assert.ok(!plan.concepts.some((c) => c.cardId === masteredFutureCard.id));
    assert.ok(plan.dueCount >= 1);
    assert.ok(plan.fragileCount >= 1);
    assert.ok(plan.averageRetentionPct >= 15 && plan.averageRetentionPct <= 99);
  });

  it('computes accurate SuperMemo-2 intervals across again, good, and easy flash recall ratings', () => {
    const concept = { cardId: 'card-test-1', term: 'Pragmatic' };
    const nowDate = new Date('2026-11-27T12:00:00Z');

    const step1Good = computeNextSm2State(concept, 'good', undefined, nowDate);
    assert.equal(step1Good.repetitions, 1);
    assert.equal(step1Good.intervalDays, 1);
    assert.equal(step1Good.state, 'review');

    const step2Good = computeNextSm2State(concept, 'good', step1Good, nowDate);
    assert.equal(step2Good.repetitions, 2);
    assert.equal(step2Good.intervalDays, 3);

    const step3Easy = computeNextSm2State(concept, 'easy', step2Good, nowDate);
    assert.equal(step3Easy.repetitions, 3);
    assert.ok(step3Easy.intervalDays >= 7);
    assert.equal(step3Easy.state, 'mastered');
    assert.ok(step3Easy.easeFactor > step2Good.easeFactor);

    const resetAgain = computeNextSm2State(concept, 'again', step3Easy, nowDate);
    assert.equal(resetAgain.repetitions, 0);
    assert.equal(resetAgain.intervalDays, 1);
    assert.equal(resetAgain.state, 'learning');
    assert.ok(resetAgain.easeFactor < step3Easy.easeFactor);
  });

  it('penalizes retention score when review due date is overdue', () => {
    const now = Date.parse('2026-11-27T12:00:00Z');
    const fresh = estimateConceptRetention(
      {
        cardId: 'c1',
        term: 'Nuance',
        repetitions: 3,
        intervalDays: 7,
        easeFactor: 2.5,
        nextReviewDate: new Date(now + 5 * 86400000).toISOString(),
        lastQualityScore: 4,
        state: 'mastered'
      },
      now
    );

    const overdue = estimateConceptRetention(
      {
        cardId: 'c1',
        term: 'Nuance',
        repetitions: 3,
        intervalDays: 7,
        easeFactor: 2.5,
        nextReviewDate: new Date(now - 6 * 86400000).toISOString(),
        lastQualityScore: 4,
        state: 'mastered'
      },
      now
    );

    assert.ok(fresh > overdue);
    assert.ok(overdue >= 15 && fresh <= 99);
  });
});

describe('Active Memory Skill Selection & DashboardView Wiring', () => {
  it('matches active spaced-repetition Skills from skills/index.json and renders ActiveMemoryPanel in DashboardView', () => {
    const snapshot = getRegistrySnapshot(WORKSPACE_ROOT);
    const sel = selectRelevantSkills(
      'Répétition espacée SM-2, mémoire active et rappel flash des concepts clés',
      snapshot.skills
    );
    const ids = sel.selected.map((s) => s.skill.id);
    assert.ok(ids.includes('ai-agent-development') || ids.includes('data-analytics'));

    const panelFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'ActiveMemoryPanel.tsx'),
      'utf-8'
    );
    const dashboardFile = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src', 'components', 'DashboardView.tsx'),
      'utf-8'
    );

    assert.ok(panelFile.includes('selectSkillsForTask'));
    assert.ok(panelFile.includes('buildActiveMemoryConcepts'));
    assert.ok(panelFile.includes('computeNextSm2State'));
    assert.ok(panelFile.includes('saveFlashcardProgress'));
    assert.ok(panelFile.includes('Mémoire Active'));

    assert.ok(dashboardFile.includes('ActiveMemoryPanel'));
  });
});
