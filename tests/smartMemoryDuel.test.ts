import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { WebSocket } from 'ws';
import type {
  SmartMemoryDuelRoom,
  SmartMemoryRecord
} from '../src/firebase/types.ts';
import { SMART_MEMORY_CATALOG } from '../src/data/smartMemoryBank.ts';
import {
  applyAnswerToDuelRoom,
  buildDuelCardExercise,
  computeDuelAnswerPoints,
  createInitialDuelRoom,
  DUEL_TOTAL_CARDS,
  evaluateDuelOptionSubmission,
  mergeDuelRoomsIdempotent,
  resolveDuelWinner,
  selectDuelSpacedRepetitionDeck
} from '../src/utils/smartMemoryDuelEngine.ts';
import {
  attachSmartMemoryDuelWebSocket,
  DUEL_WS_PATH,
  type DuelWsServerMessage
} from '../server/smartMemoryDuelServer.ts';

const WORKSPACE_ROOT = process.cwd();

function waitForMatchingState(
  ws: WebSocket,
  predicate: (room: SmartMemoryDuelRoom) => boolean
): Promise<SmartMemoryDuelRoom> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off('message', onMsg);
      reject(new Error('Timed out waiting for expected WebSocket duel:state'));
    }, 4000);

    const onMsg = (raw: Buffer) => {
      const msg = JSON.parse(raw.toString()) as DuelWsServerMessage;
      if (msg.type === 'duel:error') {
        clearTimeout(timer);
        ws.off('message', onMsg);
        reject(new Error(`${msg.code}: ${msg.message}`));
        return;
      }
      if (msg.type === 'duel:state' && predicate(msg.room)) {
        clearTimeout(timer);
        ws.off('message', onMsg);
        resolve(msg.room);
      }
    };

    ws.on('message', onMsg);
  });
}

describe('Smart Memory Duel Engine & Real-Time WebSocket Sync', () => {
  it('selects an exact 10-card spaced repetition duel deck prioritizing due & weak items', () => {
    const now = new Date('2026-11-28T12:00:00.000Z');
    const overdueItem = SMART_MEMORY_CATALOG[10];
    const incorrectWeakItem = SMART_MEMORY_CATALOG[11];
    const farMasteredItem = SMART_MEMORY_CATALOG[0];

    const records: SmartMemoryRecord[] = [
      {
        itemId: overdueItem.itemId,
        normalizedKey: overdueItem.normalizedKey,
        itemType: overdueItem.itemType,
        english: overdueItem.english,
        french: overdueItem.french,
        pronunciation: overdueItem.pronunciation,
        exampleSentence: overdueItem.exampleSentence,
        cefrLevel: overdueItem.cefrLevel,
        topic: overdueItem.topic,
        difficulty: overdueItem.difficulty,
        easeFactor: 2.0,
        intervalDays: 1,
        repetitions: 1,
        retentionScore: 40,
        lastOutcome: 'hard',
        lastResponseTimeMs: 4200,
        lastConfidence: 1,
        nextReviewDate: '2026-11-27T08:00:00.000Z',
        nextReviewLocalDay: '2026-11-27',
        lastReviewedAt: '2026-11-26T08:00:00.000Z',
        timezone: 'Europe/Paris',
        state: 'review',
        totalReviews: 3,
        correctReviews: 1,
        recallHistory: [],
        createdAt: '2026-11-25T08:00:00.000Z',
        updatedAt: '2026-11-26T08:00:00.000Z'
      },
      {
        itemId: incorrectWeakItem.itemId,
        normalizedKey: incorrectWeakItem.normalizedKey,
        itemType: incorrectWeakItem.itemType,
        english: incorrectWeakItem.english,
        french: incorrectWeakItem.french,
        pronunciation: incorrectWeakItem.pronunciation,
        exampleSentence: incorrectWeakItem.exampleSentence,
        cefrLevel: incorrectWeakItem.cefrLevel,
        topic: incorrectWeakItem.topic,
        difficulty: incorrectWeakItem.difficulty,
        easeFactor: 1.7,
        intervalDays: 0,
        repetitions: 0,
        retentionScore: 25,
        lastOutcome: 'incorrect',
        lastResponseTimeMs: 6500,
        lastConfidence: 1,
        nextReviewDate: '2026-11-28T06:00:00.000Z',
        nextReviewLocalDay: '2026-11-28',
        lastReviewedAt: '2026-11-28T05:00:00.000Z',
        timezone: 'Europe/Paris',
        state: 'learning',
        totalReviews: 2,
        correctReviews: 0,
        recallHistory: [],
        createdAt: '2026-11-25T08:00:00.000Z',
        updatedAt: '2026-11-28T05:00:00.000Z'
      },
      {
        itemId: farMasteredItem.itemId,
        normalizedKey: farMasteredItem.normalizedKey,
        itemType: farMasteredItem.itemType,
        english: farMasteredItem.english,
        french: farMasteredItem.french,
        pronunciation: farMasteredItem.pronunciation,
        exampleSentence: farMasteredItem.exampleSentence,
        cefrLevel: farMasteredItem.cefrLevel,
        topic: farMasteredItem.topic,
        difficulty: farMasteredItem.difficulty,
        easeFactor: 2.8,
        intervalDays: 30,
        repetitions: 6,
        retentionScore: 98,
        lastOutcome: 'easy',
        lastResponseTimeMs: 1200,
        lastConfidence: 3,
        nextReviewDate: '2026-12-28T12:00:00.000Z',
        nextReviewLocalDay: '2026-12-28',
        lastReviewedAt: '2026-11-28T09:00:00.000Z',
        timezone: 'Europe/Paris',
        state: 'mastered',
        totalReviews: 6,
        correctReviews: 6,
        recallHistory: [],
        createdAt: '2026-11-01T08:00:00.000Z',
        updatedAt: '2026-11-28T09:00:00.000Z'
      }
    ];

    const deck = selectDuelSpacedRepetitionDeck(
      SMART_MEMORY_CATALOG,
      records,
      overdueItem.cefrLevel,
      DUEL_TOTAL_CARDS,
      now
    );

    assert.equal(deck.length, 10);
    const uniqueIds = new Set(deck.map((d) => d.itemId));
    assert.equal(uniqueIds.size, 10);
    assert.ok(uniqueIds.has(overdueItem.itemId));
    assert.ok(uniqueIds.has(incorrectWeakItem.itemId));

    // Covers all 4 linguistic families
    const types = new Set(deck.map((d) => d.itemType));
    assert.ok(types.has('vocabulary'));
    assert.ok(types.has('expression'));
    assert.ok(types.has('grammar'));
    assert.ok(types.has('irregular_verb'));
  });

  it('computes deterministic speed + streak points and resolves tie-breakers accurately', () => {
    const fastStreak0 = computeDuelAnswerPoints({
      isCorrect: true,
      responseTimeMs: 1000,
      currentStreak: 0
    });
    assert.equal(fastStreak0.nextStreak, 1);
    assert.ok(fastStreak0.pointsAwarded > 140);

    const streak3 = computeDuelAnswerPoints({
      isCorrect: true,
      responseTimeMs: 2000,
      currentStreak: 2
    });
    assert.equal(streak3.nextStreak, 3);
    assert.ok(streak3.pointsAwarded >= 130 + 30);

    const miss = computeDuelAnswerPoints({
      isCorrect: false,
      responseTimeMs: 1000,
      currentStreak: 4
    });
    assert.equal(miss.pointsAwarded, 0);
    assert.equal(miss.nextStreak, 0);

    const deck = selectDuelSpacedRepetitionDeck(SMART_MEMORY_CATALOG, [], 'B1', 10);
    const baseRoom = {
      ...createInitialDuelRoom({
        duelId: 'TEST99',
        hostUid: 'host-1',
        hostName: 'Alice',
        cefrLevel: 'B1',
        mode: 'mixed',
        cardIds: deck.map((d) => d.itemId)
      }),
      status: 'finished' as const,
      guestUid: 'guest-2',
      guestName: 'Bob',
      hostScore: 1200,
      guestScore: 1200,
      hostCorrectCount: 8,
      guestCorrectCount: 8,
      hostTotalTimeMs: 19500,
      guestTotalTimeMs: 17200
    };

    // Exact score & accuracy tie -> faster total time wins
    assert.equal(resolveDuelWinner(baseRoom), 'guest-2');
    assert.equal(
      resolveDuelWinner({ ...baseRoom, guestTotalTimeMs: 19500 }),
      'draw'
    );
  });

  it('applies answers idempotently and merges snapshots monotonically', () => {
    const deck = selectDuelSpacedRepetitionDeck(SMART_MEMORY_CATALOG, [], 'B1', 10);
    let room: SmartMemoryDuelRoom = {
      ...createInitialDuelRoom({
        duelId: 'ROOM42',
        hostUid: 'uid-host',
        hostName: 'Clara',
        cefrLevel: 'B1',
        mode: 'mixed',
        cardIds: deck.map((d) => d.itemId)
      }),
      status: 'active',
      guestUid: 'uid-guest',
      guestName: 'Hugo',
      startedAt: '2026-11-28T10:00:00.000Z'
    };

    const firstEx = buildDuelCardExercise(deck[0], 'mixed', 0, SMART_MEMORY_CATALOG);
    const correctOpt = firstEx.options!.find((o) => o.isCorrect)!;

    room = applyAnswerToDuelRoom({
      room,
      playerUid: 'uid-host',
      cardIndex: 0,
      selectedOptionId: correctOpt.id,
      responseTimeMs: 1800
    });
    const scoreAfterFirst = room.hostScore;

    // Duplicate answer on same cardIndex must be ignored
    const duplicateAttempt = applyAnswerToDuelRoom({
      room,
      playerUid: 'uid-host',
      cardIndex: 0,
      selectedOptionId: correctOpt.id,
      responseTimeMs: 900
    });
    assert.equal(duplicateAttempt.hostAnswers.length, 1);
    assert.equal(duplicateAttempt.hostScore, scoreAfterFirst);

    // Outdated incoming snapshot must not erase host progress
    const staleIncoming = createInitialDuelRoom({
      duelId: 'ROOM42',
      hostUid: 'uid-host',
      hostName: 'Clara',
      cefrLevel: 'B1',
      mode: 'mixed',
      cardIds: deck.map((d) => d.itemId)
    });
    const merged = mergeDuelRoomsIdempotent(room, staleIncoming);
    assert.equal(merged.status, 'active');
    assert.equal(merged.hostAnswers.length, 1);
    assert.equal(merged.guestUid, 'uid-guest');
  });

  it('runs a real-time 2-player 10-card duel over WebSocket /ws/smart-memory-duel to finished scoreboard', async () => {
    const httpServer = http.createServer((_req, res) => {
      res.writeHead(200);
      res.end('ok');
    });
    attachSmartMemoryDuelWebSocket(httpServer);

    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve()));
    const address = httpServer.address();
    assert.ok(address && typeof address === 'object');
    const wsUrl = `ws://127.0.0.1:${address.port}${DUEL_WS_PATH}`;

    const hostWs = new WebSocket(wsUrl);
    const guestWs = new WebSocket(wsUrl);

    try {
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          hostWs.once('open', () => resolve());
          hostWs.once('error', reject);
        }),
        new Promise<void>((resolve, reject) => {
          guestWs.once('open', () => resolve());
          guestWs.once('error', reject);
        })
      ]);

      const deck = selectDuelSpacedRepetitionDeck(SMART_MEMORY_CATALOG, [], 'B1', 10);
      const cardIds = deck.map((d) => d.itemId);

      // Host creates room
      const createdPromise = waitForMatchingState(
        hostWs,
        (room) => room.status === 'waiting' && room.cardIds.length === 10
      );
      hostWs.send(
        JSON.stringify({
          type: 'duel:create',
          payload: {
            hostUid: 'ws-host-uid',
            hostName: 'Sophie',
            cefrLevel: 'B1',
            mode: 'mixed',
            cardIds
          }
        })
      );
      const createdRoom = await createdPromise;
      assert.equal(createdRoom.duelId.length, 6);

      // Guest joins room -> both sockets immediately receive status: 'active'
      const hostActivePromise = waitForMatchingState(
        hostWs,
        (room) => room.status === 'active' && room.guestUid === 'ws-guest-uid'
      );
      const guestActivePromise = waitForMatchingState(
        guestWs,
        (room) => room.status === 'active' && room.guestUid === 'ws-guest-uid'
      );
      guestWs.send(
        JSON.stringify({
          type: 'duel:join',
          payload: {
            duelId: createdRoom.duelId,
            guestUid: 'ws-guest-uid',
            guestName: 'Lucas'
          }
        })
      );
      const [hostActive, guestActive] = await Promise.all([
        hostActivePromise,
        guestActivePromise
      ]);
      assert.deepEqual(hostActive.cardIds, guestActive.cardIds);

      // Both participants finish all 10 cards (host gets 9/10, guest gets 7/10)
      const hostFinishedPromise = waitForMatchingState(
        hostWs,
        (room) => room.status === 'finished'
      );
      const guestFinishedPromise = waitForMatchingState(
        guestWs,
        (room) => room.status === 'finished'
      );

      for (let i = 0; i < DUEL_TOTAL_CARDS; i++) {
        const item = deck[i];
        const ex = buildDuelCardExercise(item, 'mixed', i, SMART_MEMORY_CATALOG);
        const correctOpt = ex.options!.find((o) => o.isCorrect)!;
        const wrongOpt = ex.options!.find((o) => !o.isCorrect)!;

        const hostPick = i < 9 ? correctOpt.id : wrongOpt.id;
        const guestPick = i < 7 ? correctOpt.id : wrongOpt.id;

        hostWs.send(
          JSON.stringify({
            type: 'duel:answer',
            payload: {
              duelId: createdRoom.duelId,
              playerUid: 'ws-host-uid',
              cardIndex: i,
              selectedOptionId: hostPick,
              responseTimeMs: 1400
            }
          })
        );

        guestWs.send(
          JSON.stringify({
            type: 'duel:answer',
            payload: {
              duelId: createdRoom.duelId,
              playerUid: 'ws-guest-uid',
              cardIndex: i,
              selectedOptionId: guestPick,
              responseTimeMs: 2100
            }
          })
        );

        // Validate server evaluation helper stays consistent
        assert.equal(
          evaluateDuelOptionSubmission({
            item,
            duelMode: 'mixed',
            cardIndex: i,
            selectedOptionId: hostPick,
            catalogPool: SMART_MEMORY_CATALOG
          }).isCorrect,
          i < 9
        );
      }

      const [finalHost, finalGuest] = await Promise.all([
        hostFinishedPromise,
        guestFinishedPromise
      ]);

      assert.equal(finalHost.hostAnsweredCount, 10);
      assert.equal(finalHost.guestAnsweredCount, 10);
      assert.equal(finalHost.hostCorrectCount, 9);
      assert.equal(finalHost.guestCorrectCount, 7);
      assert.equal(finalHost.winnerUid, 'ws-host-uid');
      assert.equal(finalGuest.winnerUid, 'ws-host-uid');
      assert.ok(finalHost.hostScore > finalHost.guestScore);
    } finally {
      hostWs.close();
      guestWs.close();
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  });

  it('wires Firestore schema/rules, SmartMemoryHubModal duel tab, and App.tsx ?duel= deep-link', () => {
    const blueprint = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'firebase-blueprint.json'),
      'utf8'
    );
    const rules = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'firestore.rules'),
      'utf8'
    );
    const modal = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryHubModal.tsx'),
      'utf8'
    );
    const duelPanel = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/components/SmartMemoryDuelPanel.tsx'),
      'utf8'
    );
    const appTsx = fs.readFileSync(
      path.join(WORKSPACE_ROOT, 'src/App.tsx'),
      'utf8'
    );

    assert.ok(blueprint.includes('smartMemoryDuels'));
    assert.ok(rules.includes('match /smartMemoryDuels/{duelId}'));
    assert.ok(modal.includes("id: 'duel'"));
    assert.ok(modal.includes('<SmartMemoryDuelPanel'));
    assert.ok(duelPanel.includes('Tableau de Score Détaillé (10 Cartes)'));
    assert.ok(appTsx.includes("new URLSearchParams(window.location.search).get('duel')"));
  });
});
