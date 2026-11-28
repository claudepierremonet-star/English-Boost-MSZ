import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  buildConfettiParticles,
  DAILY_REVIEW_CELEBRATION_THRESHOLD,
  shouldCelebrateDailyReview
} from '../src/components/SmartMemoryCelebration.tsx';

const WORKSPACE_ROOT = process.cwd();

describe('SmartMemory Daily Review Framer Motion Celebration', () => {
  it('triggers celebration strictly when a daily_review session finishes with more than 10 cards', () => {
    assert.equal(DAILY_REVIEW_CELEBRATION_THRESHOLD, 10);

    // Exactly 10 cards or fewer should NOT trigger
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'daily_review',
        completedCardsCount: 10
      }),
      false
    );
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'daily_review',
        completedCardsCount: 4
      }),
      false
    );

    // Unfinished session should NOT trigger
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: false,
        sessionKind: 'daily_review',
        completedCardsCount: 16
      }),
      false
    );

    // Targeted or single-card sessions should NOT trigger daily celebration
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'targeted',
        completedCardsCount: 12
      }),
      false
    );
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'single',
        completedCardsCount: 12
      }),
      false
    );

    // 11+ cards completed in finished daily_review MUST trigger celebration
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'daily_review',
        completedCardsCount: 11
      }),
      true
    );
    assert.equal(
      shouldCelebrateDailyReview({
        sessionFinished: true,
        sessionKind: 'daily_review',
        completedCardsCount: 16
      }),
      true
    );
  });

  it('builds deterministic Framer Motion confetti particle trajectories across all shapes', () => {
    const particles = buildConfettiParticles(36);
    assert.equal(particles.length, 36);
    const shapes = new Set(particles.map((p) => p.shape));
    assert.ok(shapes.has('ribbon'));
    assert.ok(shapes.has('diamond'));
    assert.ok(shapes.has('circle'));
    assert.ok(shapes.has('star'));

    for (const p of particles) {
      assert.ok(p.duration > 1.5 && p.duration < 4);
      assert.ok(p.fallY > 200);
      assert.ok(p.color.startsWith('#'));
    }
  });

  it('uses Framer Motion (motion, AnimatePresence, useReducedMotion) and integrates into SmartMemoryHubModal', () => {
    const celebSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryCelebration.tsx'),
      'utf8'
    );
    assert.ok(celebSrc.includes("from 'framer-motion'"));
    assert.ok(celebSrc.includes('AnimatePresence'));
    assert.ok(celebSrc.includes('useReducedMotion'));
    assert.ok(!celebSrc.includes('canvas-confetti'));

    const hubSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryHubModal.tsx'),
      'utf8'
    );
    assert.ok(hubSrc.includes('SmartMemoryCelebration'));
    assert.ok(hubSrc.includes('shouldCelebrateDailyReview'));
    assert.ok(hubSrc.includes("'daily_review'"));
  });
});
