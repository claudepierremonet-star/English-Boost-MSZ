import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  computeSmartMemoryRetentionForecast,
  getLocalDateKey
} from '../src/utils/smartMemoryEngine.ts';
import type { SmartMemoryRecord } from '../src/firebase/types.ts';

const WORKSPACE_ROOT = process.cwd();

function makeRecord(overrides: Partial<SmartMemoryRecord>): SmartMemoryRecord {
  return {
    itemId: overrides.itemId || 'sm-item-1',
    normalizedKey: overrides.normalizedKey || 'vocab::resilience',
    itemType: 'vocabulary',
    english: 'resilience',
    french: 'résilience',
    pronunciation: '/rɪˈzɪl.i.əns/',
    exampleSentence: 'Resilience builds mastery.',
    cefrLevel: 'B2',
    topic: 'Mindset',
    difficulty: 'medium',
    state: 'review',
    repetitions: 2,
    intervalDays: 3,
    easeFactor: 2.5,
    retentionScore: 78,
    totalReviews: 2,
    correctReviews: 2,
    nextReviewDate: '2026-11-28T10:00:00.000Z',
    timezone: 'UTC',
    recallHistory: [],
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-28T10:00:00.000Z',
    ...overrides
  };
}

describe('SmartMemory 7-Day Retention Forecast Timeline', () => {
  it('buckets overdue, today, and upcoming 6 days accurately and excludes cards beyond 7 days', () => {
    const now = new Date('2026-11-28T12:00:00.000Z');
    const tz = 'UTC';

    const records: SmartMemoryRecord[] = [
      // Overdue (yesterday) -> Day 0
      makeRecord({
        itemId: 'overdue-1',
        nextReviewDate: '2026-11-27T09:00:00.000Z',
        nextReviewLocalDay: '2026-11-27',
        intervalDays: 1
      }),
      // Due today -> Day 0
      makeRecord({
        itemId: 'today-1',
        nextReviewDate: '2026-11-28T10:00:00.000Z',
        nextReviewLocalDay: '2026-11-28',
        intervalDays: 2
      }),
      // Due tomorrow (offset 1)
      makeRecord({
        itemId: 'day1-a',
        nextReviewDate: '2026-11-29T10:00:00.000Z',
        nextReviewLocalDay: '2026-11-29',
        intervalDays: 4
      }),
      makeRecord({
        itemId: 'day1-b',
        nextReviewDate: '2026-11-29T15:00:00.000Z',
        nextReviewLocalDay: '2026-11-29',
        intervalDays: 6
      }),
      // Due +4 days
      makeRecord({
        itemId: 'day4-a',
        nextReviewDate: '2026-12-02T10:00:00.000Z',
        nextReviewLocalDay: '2026-12-02',
        intervalDays: 9
      }),
      // Due +6 days (last day of 7-day forecast)
      makeRecord({
        itemId: 'day6-a',
        nextReviewDate: '2026-12-04T10:00:00.000Z',
        nextReviewLocalDay: '2026-12-04',
        intervalDays: 14
      }),
      // Beyond 7-day horizon (+12 days) -> excluded
      makeRecord({
        itemId: 'day12-far',
        nextReviewDate: '2026-12-10T10:00:00.000Z',
        nextReviewLocalDay: '2026-12-10',
        intervalDays: 20
      }),
      // Duplicate itemId -> deduplicated
      makeRecord({
        itemId: 'day1-a',
        nextReviewDate: '2026-11-29T10:00:00.000Z',
        nextReviewLocalDay: '2026-11-29',
        intervalDays: 4
      })
    ];

    const forecast = computeSmartMemoryRetentionForecast(records, now, tz, 7);
    assert.equal(forecast.length, 7);

    assert.equal(forecast[0].dayOffset, 0);
    assert.equal(forecast[0].dayLabel, 'Auj.');
    assert.equal(forecast[0].dueCount, 2);
    assert.equal(forecast[0].overdueIncludedCount, 2);
    assert.equal(forecast[0].cumulativeCount, 2);
    assert.equal(forecast[0].projectedIntervalAvgDays, 1.5);

    assert.equal(forecast[1].dayOffset, 1);
    assert.equal(forecast[1].dayLabel, 'Dem.');
    assert.equal(forecast[1].dueCount, 2);
    assert.equal(forecast[1].cumulativeCount, 4);
    assert.equal(forecast[1].projectedIntervalAvgDays, 5);

    assert.equal(forecast[2].dueCount, 0);
    assert.equal(forecast[3].dueCount, 0);
    assert.equal(forecast[4].dueCount, 1);
    assert.equal(forecast[4].cumulativeCount, 5);
    assert.equal(forecast[5].dueCount, 0);
    assert.equal(forecast[6].dueCount, 1);
    assert.equal(forecast[6].cumulativeCount, 6);
  });

  it('aligns forecast days accurately across distinct time zones without nextReviewLocalDay cached', () => {
    const now = new Date('2026-11-29T03:00:00.000Z'); // Still 2026-11-28 22:00 in New York, already 2026-11-29 12:00 in Tokyo
    const record = makeRecord({
      itemId: 'tz-check',
      nextReviewDate: '2026-11-29T18:00:00.000Z',
      nextReviewLocalDay: undefined,
      intervalDays: 3
    });

    const nyForecast = computeSmartMemoryRetentionForecast([record], now, 'America/New_York', 7);
    const tokyoForecast = computeSmartMemoryRetentionForecast([record], now, 'Asia/Tokyo', 7);

    assert.equal(nyForecast[0].localDateKey, getLocalDateKey(now, 'America/New_York'));
    assert.equal(nyForecast[1].dueCount, 1); // Nov 29 afternoon NY is Tomorrow relative to Nov 28 night NY

    assert.equal(tokyoForecast[0].localDateKey, getLocalDateKey(now, 'Asia/Tokyo'));
    assert.equal(tokyoForecast[1].dueCount, 1); // Nov 29 18:00Z = Nov 30 03:00 Tokyo -> Tomorrow relative to Nov 29 Tokyo
  });

  it('renders Retention Forecast D3 chart inside SmartMemoryHubModal overview tab', () => {
    const chartSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryRetentionForecastChart.tsx'),
      'utf8'
    );
    assert.ok(chartSrc.includes("from 'd3'"));
    assert.ok(chartSrc.includes('Retention Forecast'));

    const hubSrc = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryHubModal.tsx'),
      'utf8'
    );
    assert.ok(hubSrc.includes('computeSmartMemoryRetentionForecast'));
    assert.ok(hubSrc.includes('SmartMemoryRetentionForecastChart'));
  });
});
