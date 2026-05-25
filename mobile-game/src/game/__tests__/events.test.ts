/**
 * Unit tests — Event System
 *
 * Tests event emitter subscribe/emit/clear patterns.
 */
import { createEventEmitter } from '../events';
import type { GameEvent } from '../types';

describe('Event System — createEventEmitter', () => {
  it('should create an emitter with subscribe, emit, and clear methods', () => {
    const emitter = createEventEmitter();
    expect(typeof emitter.subscribe).toBe('function');
    expect(typeof emitter.emit).toBe('function');
    expect(typeof emitter.clear).toBe('function');
  });

  it('should subscribe to an event and receive emissions', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    emitter.subscribe('GameStarted', handler);
    const event: GameEvent = {
      type: 'GameStarted',
      payload: { gameId: 'g1', mode: 'ffa', players: [0, 1, 2, 3] },
    };
    emitter.emit(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should not receive events of a different type', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    emitter.subscribe('GameStarted', handler);
    emitter.emit({
      type: 'RoundStarted',
      payload: { roundNumber: 1, phase: 'planning' },
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support multiple subscribers to the same event', () => {
    const emitter = createEventEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    emitter.subscribe('GameOver', handler1);
    emitter.subscribe('GameOver', handler2);

    const event: GameEvent = {
      type: 'GameOver',
      payload: {
        winner: 0, winningTeamId: null,
        finalScores: { 0: 10, 1: 8, 2: 6, 3: 4 },
      },
    };
    emitter.emit(event);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should remove a subscription when unsubscribe is called', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    const unsubscribe = emitter.subscribe('LaneResolved', handler);

    const event: GameEvent = {
      type: 'LaneResolved',
      payload: {
        laneIndex: 0, winner: 0, isTie: false,
        vpAwarded: { 0: 2, 1: 0, 2: 0, 3: 0 },
        strengths: { 0: 5, 1: 2, 2: 0, 3: 0 },
      },
    };
    emitter.emit(event);
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitter.emit(event);
    expect(handler).toHaveBeenCalledTimes(1); // Still 1 — not called second time
  });

  it('should not crash if a handler throws', () => {
    const emitter = createEventEmitter();
    const throwingHandler = jest.fn().mockImplementation(() => {
      throw new Error('Handler error');
    });
    const normalHandler = jest.fn();

    emitter.subscribe('PlayerSubmitted', throwingHandler);
    emitter.subscribe('PlayerSubmitted', normalHandler);

    const event: GameEvent = {
      type: 'PlayerSubmitted',
      payload: { playerId: 0, assignmentCount: 2 },
    };

    // Should not throw
    expect(() => emitter.emit(event)).not.toThrow();
    expect(normalHandler).toHaveBeenCalledTimes(1);
  });

  it('should clear all handlers', () => {
    const emitter = createEventEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    emitter.subscribe('RoundStarted', handler1);
    emitter.subscribe('VPAwarded', handler2);

    emitter.clear();

    emitter.emit({ type: 'RoundStarted', payload: { roundNumber: 2, phase: 'planning' } });
    emitter.emit({ type: 'VPAwarded', payload: { playerId: 0, vpAmount: 2, source: 'lane-win', laneIndex: 0 } });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should handle multiple event types independently', () => {
    const emitter = createEventEmitter();
    const gameStartedHandler = jest.fn();
    const gameOverHandler = jest.fn();

    emitter.subscribe('GameStarted', gameStartedHandler);
    emitter.subscribe('GameOver', gameOverHandler);

    emitter.emit({ type: 'GameStarted', payload: { gameId: 'g1', mode: 'ffa', players: [0, 1, 2, 3] } });
    expect(gameStartedHandler).toHaveBeenCalledTimes(1);
    expect(gameOverHandler).not.toHaveBeenCalled();

    emitter.emit({ type: 'GameOver', payload: { winner: 0, winningTeamId: null, finalScores: { 0: 10, 1: 8, 2: 6, 3: 4 } } });
    expect(gameOverHandler).toHaveBeenCalledTimes(1);
  });

  it('should support unsubscribing before any events', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    const unsubscribe = emitter.subscribe('PlanningPhase', handler);
    unsubscribe();
    // Should not crash
    emitter.emit({ type: 'PlanningPhase', payload: { roundNumber: 1, deadline: 45 } });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle empty subscriber lists gracefully', () => {
    const emitter = createEventEmitter();
    // No subscribers — should not throw
    expect(() => {
      emitter.emit({ type: 'GameStarted', payload: { gameId: 'g1', mode: 'ffa', players: [0, 1, 2, 3] } });
    }).not.toThrow();
  });

  it('should handle unsubscribe for an event that no longer has handlers', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    const unsubscribe = emitter.subscribe('ResolutionPhase', handler);
    expect(() => unsubscribe()).not.toThrow();
    // After unsubscribing, the internal map should clean up
  });

  it('should emit the correct payload for SpyInfo events', () => {
    const emitter = createEventEmitter();
    const handler = jest.fn();

    emitter.subscribe('SpyInfo', handler);
    const event: GameEvent = {
      type: 'SpyInfo',
      payload: { playerId: 0, targetPlayerId: 1, revealedCards: [] },
    };
    emitter.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
    expect(handler.mock.calls[0][0].payload.playerId).toBe(0);
    expect(handler.mock.calls[0][0].payload.revealedCards).toEqual([]);
  });

  it('should support the full event lifecycle', () => {
    const emitter = createEventEmitter();
    const events: GameEvent[] = [];

    // Subscribe all game events
    const unsubscribers = [
      emitter.subscribe('GameStarted', e => events.push(e)),
      emitter.subscribe('RoundStarted', e => events.push(e)),
      emitter.subscribe('PlanningPhase', e => events.push(e)),
      emitter.subscribe('PlayerSubmitted', e => events.push(e)),
      emitter.subscribe('RevealPhase', e => events.push(e)),
      emitter.subscribe('ResolutionPhase', e => events.push(e)),
      emitter.subscribe('LaneResolved', e => events.push(e)),
      emitter.subscribe('RoundComplete', e => events.push(e)),
      emitter.subscribe('GameOver', e => events.push(e)),
      emitter.subscribe('VPAwarded', e => events.push(e)),
      emitter.subscribe('AchievementUnlocked', e => events.push(e)),
      emitter.subscribe('ComebackBonus', e => events.push(e)),
      emitter.subscribe('PlayerPenalized', e => events.push(e)),
      emitter.subscribe('SpyInfo', e => events.push(e)),
      emitter.subscribe('Error', e => events.push(e)),
    ];

    // Emit one event of each type
    const testEvents: GameEvent[] = [
      { type: 'GameStarted', payload: { gameId: 'g1', mode: 'ffa', players: [0, 1, 2, 3] } },
      { type: 'RoundStarted', payload: { roundNumber: 1, phase: 'planning' } },
      { type: 'PlanningPhase', payload: { roundNumber: 1, deadline: 45 } },
      { type: 'PlayerSubmitted', payload: { playerId: 0, assignmentCount: 2 } },
      { type: 'RevealPhase', payload: { roundNumber: 1, assignments: {} } },
      { type: 'ResolutionPhase', payload: { roundNumber: 1 } },
      { type: 'LaneResolved', payload: { laneIndex: 0, winner: 0, isTie: false, vpAwarded: { 0: 2, 1: 0, 2: 0, 3: 0 }, strengths: { 0: 5, 1: 2, 2: 0, 3: 0 } } },
      { type: 'VPAwarded', payload: { playerId: 0, vpAmount: 2, source: 'lane-win' } },
      { type: 'AchievementUnlocked', payload: { playerId: 0, achievementId: 'first-blood', vpReward: 2 } },
      { type: 'ComebackBonus', payload: { playerId: 3, extraCards: [] } },
      { type: 'RoundComplete', payload: { roundNumber: 1, scores: { 0: 2, 1: 0, 2: 0, 3: 0 } } },
      { type: 'GameOver', payload: { winner: 0, winningTeamId: null, finalScores: { 0: 10, 1: 8, 2: 6, 3: 4 } } },
      { type: 'PlayerPenalized', payload: { playerId: 1, reason: 'No cards assigned', vpLoss: 1 } },
      { type: 'SpyInfo', payload: { playerId: 0, targetPlayerId: 1, revealedCards: [] } },
      { type: 'Error', payload: { message: 'Test error', code: 'ERR001' } },
    ];

    for (const evt of testEvents) {
      emitter.emit(evt);
    }

    expect(events).toHaveLength(15);

    // Cleanup
    for (const unsub of unsubscribers) {
      unsub();
    }
  });
});
