import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { SMART_MEMORY_CATALOG } from '../src/data/smartMemoryBank.ts';
import {
  buildSmartMemoryExercise,
  computeAdaptiveSmartMemorySchedule,
  computeSmartMemoryProgressStats,
  computeSmartMemoryRecommendations,
  generateTodaysMemoryChallenge,
  getLocalDateKey,
  isItemDueForReview,
  LEARNING_MODE_METADATA
} from '../src/utils/smartMemoryEngine.ts';
import type { SmartMemoryLearningMode, SmartMemoryRecord } from '../src/firebase/types.ts';
import type { ErrorJournalItem } from '../src/utils/errorJournal.ts';

const WORKSPACE_ROOT = process.cwd();

describe('SMART MEMORY Catalog & Anti-Duplication', () => {
  it('contains vocabulary, expressions, grammar rules, and irregular verbs with zero duplicate records and valid Firestore IDs', () => {
    const idRegex = /^[a-zA-Z0-9_-]{1,128}$/;
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const countsByType = new Map<string, number>();

    for (const item of SMART_MEMORY_CATALOG) {
      assert.ok(idRegex.test(item.itemId), `Invalid Firestore ID: ${item.itemId}`);
      assert.ok(!seenIds.has(item.itemId), `Duplicate itemId: ${item.itemId}`);
      assert.ok(!seenKeys.has(item.normalizedKey), `Duplicate normalizedKey: ${item.normalizedKey}`);
      seenIds.add(item.itemId);
      seenKeys.add(item.normalizedKey);

      assert.ok(item.english.trim().length > 0);
      assert.ok(item.french.trim().length > 0);
      assert.ok(item.pronunciation.trim().length > 0);
      assert.ok(item.exampleSentence.trim().length > 0);
      assert.ok(item.topic.trim().length > 0);
      assert.ok(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(item.cefrLevel));
      assert.ok(['easy', 'medium', 'hard'].includes(item.difficulty));

      countsByType.set(item.itemType, (countsByType.get(item.itemType) || 0) + 1);
    }

    assert.ok((countsByType.get('vocabulary') || 0) >= 100);
    assert.ok((countsByType.get('expression') || 0) >= 20);
    assert.ok((countsByType.get('grammar') || 0) >= 40);
    assert.ok((countsByType.get('irregular_verb') || 0) >= 25);
  });
});

describe('SMART MEMORY Adaptive Spaced Repetition Algorithm', () => {
  const sampleItem = SMART_MEMORY_CATALOG[0];
  const now = new Date('2026-11-28T10:00:00.000Z');

  it('schedules earlier review on incorrect, soon on hard, larger on correct, and largest on easy', () => {
    const inc = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      undefined,
      { outcome: 'incorrect', responseTimeMs: 4200, confidence: 2, mode: 'flashcards' },
      now,
      'Europe/Paris'
    );
    const hard = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      undefined,
      { outcome: 'hard', responseTimeMs: 6500, confidence: 2, mode: 'flashcards' },
      now,
      'Europe/Paris'
    );
    const correct = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      undefined,
      { outcome: 'correct', responseTimeMs: 3200, confidence: 2, mode: 'flashcards' },
      now,
      'Europe/Paris'
    );
    const easy = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      undefined,
      { outcome: 'easy', responseTimeMs: 1800, confidence: 3, mode: 'flashcards' },
      now,
      'Europe/Paris'
    );

    assert.ok(inc.intervalDays < hard.intervalDays);
    assert.ok(hard.intervalDays < correct.intervalDays);
    assert.ok(correct.intervalDays < easy.intervalDays);
    assert.equal(inc.repetitions, 0);
    assert.equal(inc.state, 'learning');
    assert.equal(correct.recallHistory.length, 1);
  });

  it('incorporates response time and confidence as learning signals', () => {
    const baseRecord = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      undefined,
      { outcome: 'correct', responseTimeMs: 4000, confidence: 2, mode: 'en_to_fr' },
      now,
      'UTC'
    );
    const secondStep = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      baseRecord,
      { outcome: 'correct', responseTimeMs: 3000, confidence: 2, mode: 'en_to_fr' },
      now,
      'UTC'
    );

    const fastHighConf = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      secondStep,
      { outcome: 'correct', responseTimeMs: 2100, confidence: 3, mode: 'write_from_memory' },
      now,
      'UTC'
    );
    const slowLowConf = computeAdaptiveSmartMemorySchedule(
      sampleItem,
      secondStep,
      { outcome: 'correct', responseTimeMs: 16000, confidence: 1, mode: 'write_from_memory' },
      now,
      'UTC'
    );

    assert.ok(fastHighConf.intervalDays > slowLowConf.intervalDays);
    assert.ok(fastHighConf.easeFactor > slowLowConf.easeFactor);
  });

  it('handles scheduling accurately across distinct time zones', () => {
    const utcInstant = new Date('2026-11-29T01:30:00.000Z');
    const nyDateKey = getLocalDateKey(utcInstant, 'America/New_York');
    const tokyoDateKey = getLocalDateKey(utcInstant, 'Asia/Tokyo');
    assert.equal(nyDateKey, '2026-11-28');
    assert.equal(tokyoDateKey, '2026-11-29');

    assert.equal(
      isItemDueForReview('2026-11-29T01:00:00.000Z', utcInstant),
      true
    );
    assert.equal(
      isItemDueForReview('2026-11-29T02:00:00.000Z', utcInstant),
      false
    );
  });
});

describe("SMART MEMORY Today's Challenge, Recommendations, 9 Modes & Stats", () => {
  const now = new Date('2026-11-28T12:00:00.000Z');

  it('builds Today Memory Challenge with all 5 required pillars', () => {
    const fakeErrors: ErrorJournalItem[] = [
      {
        id: 'err_test_1',
        source: 'flashcard',
        term: SMART_MEMORY_CATALOG[0].english,
        translationFr: SMART_MEMORY_CATALOG[0].french,
        definition: SMART_MEMORY_CATALOG[0].exampleSentence,
        errorCount: 3,
        lastMissedAt: now.toISOString(),
        resolved: false
      }
    ];
    const plan = generateTodaysMemoryChallenge(
      SMART_MEMORY_CATALOG,
      [],
      fakeErrors,
      'B2',
      now,
      'Europe/Paris'
    );

    assert.equal(plan.pillars.length, 5);
    for (const pillar of plan.pillars) {
      assert.ok(pillar.count > 0, `Expected items in pillar ${pillar.key}`);
    }
    const keys = plan.pillars.map((p) => p.key);
    assert.deepEqual(keys, [
      'forgotten_words',
      'difficult_expressions',
      'previous_mistakes',
      'grammar_rules',
      'irregular_verbs'
    ]);
    const mistakesPillar = plan.pillars.find((p) => p.key === 'previous_mistakes')!;
    assert.ok(
      mistakesPillar.items.some((entry) => entry.item.itemId === SMART_MEMORY_CATALOG[0].itemId)
    );
  });

  it('identifies weakest categories and computes mastered/learning/review/retention/weekly stats', () => {
    const vocabItem = SMART_MEMORY_CATALOG.find((x) => x.itemType === 'vocabulary')!;
    const verbItem = SMART_MEMORY_CATALOG.find((x) => x.itemType === 'irregular_verb')!;

    let verbRec: SmartMemoryRecord | undefined;
    verbRec = computeAdaptiveSmartMemorySchedule(
      verbItem,
      verbRec,
      { outcome: 'incorrect', responseTimeMs: 9000, confidence: 1, mode: 'write_from_memory' },
      now,
      'Europe/Paris'
    );

    let vocabRec: SmartMemoryRecord | undefined;
    for (let i = 0; i < 4; i++) {
      vocabRec = computeAdaptiveSmartMemorySchedule(
        vocabItem,
        vocabRec,
        { outcome: 'easy', responseTimeMs: 1800, confidence: 3, mode: 'flashcards' },
        now,
        'Europe/Paris'
      );
    }

    const recs = [verbRec, vocabRec!];
    const recommendations = computeSmartMemoryRecommendations(
      SMART_MEMORY_CATALOG,
      recs,
      'B1',
      now
    );
    assert.ok(recommendations.length >= 1);
    assert.equal(recommendations[0].topic, verbItem.topic);
    assert.ok(recommendations[0].targetedItems.length > 0);

    const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const stats = computeSmartMemoryProgressStats(
      SMART_MEMORY_CATALOG,
      recs,
      fiveHoursLater,
      'Europe/Paris'
    );
    assert.equal(stats.wordsMastered, 1);
    assert.equal(stats.wordsLearning, 1);
    assert.equal(stats.wordsToReview, 1);
    assert.equal(stats.totalReviews, 5);
    assert.equal(stats.retentionRate, 80);
    assert.equal(stats.weeklyActivity.length, 7);
    assert.equal(stats.weeklyActivity[6].reviewsCount, 5);
  });

  it('supports all 9 interactive learning modes', () => {
    assert.equal(LEARNING_MODE_METADATA.length, 9);
    const sample = SMART_MEMORY_CATALOG.find((x) => x.itemType === 'irregular_verb')!;
    const modes: SmartMemoryLearningMode[] = LEARNING_MODE_METADATA.map((m) => m.id);

    for (const mode of modes) {
      const exercise = buildSmartMemoryExercise(sample, mode, SMART_MEMORY_CATALOG);
      assert.equal(exercise.mode, mode);
      assert.ok(exercise.promptFr.length > 0);
      assert.ok(exercise.expectedText.length > 0);
      if (
        mode === 'en_to_fr' ||
        mode === 'fr_to_en' ||
        mode === 'listen_identify' ||
        mode === 'complete_sentence' ||
        mode === 'multiple_choice'
      ) {
        assert.ok(exercise.options && exercise.options.length >= 2);
        assert.ok(exercise.options.some((o) => o.isCorrect));
      }
      if (mode === 'match_pairs') {
        assert.ok(exercise.pairs && exercise.pairs.length >= 2);
      }
      if (mode === 'spell_word') {
        assert.ok(exercise.scrambledLetters && exercise.scrambledLetters.length >= 2);
      }
    }
  });

  it('has hardened Firestore security rules and blueprint definitions matching SmartMemoryRecord', () => {
    const rules = fs.readFileSync(path.join(WORKSPACE_ROOT, 'firestore.rules'), 'utf-8');
    const blueprint = JSON.parse(
      fs.readFileSync(path.join(WORKSPACE_ROOT, 'firebase-blueprint.json'), 'utf-8')
    );

    assert.ok(rules.includes('match /smartMemoryRecords/{itemId}'));
    assert.ok(rules.includes('isValidSmartMemoryPayload'));
    assert.ok(rules.includes("'smart_memory'"));
    assert.ok(blueprint.entities.SmartMemoryRecord);
    assert.ok(blueprint.firestore['/users/{userId}/smartMemoryRecords/{itemId}']);
  });
});
