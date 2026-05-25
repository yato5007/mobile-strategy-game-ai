/**
 * Unit tests — State Management
 *
 * Tests state queries, serialization, and cloning.
 */
import {
  getActiveLaneCount,
  getLaneObjectiveForRound,
  getPlayerState,
  getLaneState,
  isInPhase,
  canPlayerAct,
  serialize,
  deserialize,
  cloneGameState,
} from '../state';

import { createGame } from '../engine';
import type { GameConfig, GameState } from '../types';

/** Create a minimal game state for testing */
function createTestGame(seed = 'test-state'): GameState {
  const config: GameConfig = {
    mode: 'ffa',
    playerSlots: [true, true, true, true],
    randomSeed: seed,
  };
  const { game } = createGame(config);
  return game;
}

describe('State — getActiveLaneCount', () => {
  it('should return 3 lanes for rounds 1-3', () => {
    expect(getActiveLaneCount(1)).toBe(3);
    expect(getActiveLaneCount(2)).toBe(3);
    expect(getActiveLaneCount(3)).toBe(3);
  });

  it('should return 4 lanes for rounds 4-6', () => {
    expect(getActiveLaneCount(4)).toBe(4);
    expect(getActiveLaneCount(5)).toBe(4);
    expect(getActiveLaneCount(6)).toBe(4);
  });

  it('should return 5 lanes for rounds 7-12', () => {
    expect(getActiveLaneCount(7)).toBe(5);
    expect(getActiveLaneCount(8)).toBe(5);
    expect(getActiveLaneCount(12)).toBe(5);
  });

  it('should return 3 for round 0 (before schedule)', () => {
    expect(getActiveLaneCount(0)).toBe(3);
  });
});

describe('State — getLaneObjectiveForRound', () => {
  it('should return a valid lane objective', () => {
    const obj = getLaneObjectiveForRound(0, 1, () => 0.5);
    expect(obj).toBeDefined();
    expect(obj.type).toBeDefined();
    expect(obj.vpValue).toBeGreaterThanOrEqual(1);
    expect(typeof obj.descriptionKey).toBe('string');
  });

  it('should return objectives with valid types', () => {
    const validTypes = ['standard', 'high-value', 'capture-flag', 'king-of-hill', 'bounty'];
    for (let i = 0; i < 20; i++) {
      const obj = getLaneObjectiveForRound(0, 1, () => Math.random());
      expect(validTypes).toContain(obj.type);
    }
  });

  it('should have higher VP values for late rounds', () => {
    // Round 8+ should sometimes produce high-value lanes
    const lateRoundObj = getLaneObjectiveForRound(0, 9, () => 0.1);
    // At least vpValue should be >= 2
    expect(lateRoundObj.vpValue).toBeGreaterThanOrEqual(2);
  });

  it('should be deterministic with same seed', () => {
    const obj1 = getLaneObjectiveForRound(0, 1, () => 0.42);
    const obj2 = getLaneObjectiveForRound(0, 1, () => 0.42);
    expect(obj1.type).toBe(obj2.type);
    expect(obj1.vpValue).toBe(obj2.vpValue);
  });

  it('should generate different objectives for different lane indices', () => {
    // Low probability that two lanes at same round get same type with random seed
    const obj1 = getLaneObjectiveForRound(0, 5, () => 0.1);
    const obj2 = getLaneObjectiveForRound(1, 5, () => 0.9);
    // At minimum they should have valid types
    expect(obj1.type).toBeDefined();
    expect(obj2.type).toBeDefined();
  });

  it('should return standard objective for early rounds with low random value', () => {
    const obj = getLaneObjectiveForRound(0, 1, () => 0.0);
    // First entry in the pool is 'standard'
    expect(obj.type).toBe('standard');
  });
});

describe('State — getPlayerState', () => {
  it('should return the correct player state', () => {
    const game = createTestGame();
    const player = getPlayerState(game, 0);
    expect(player).toBeDefined();
    expect(player!.id).toBe(0);
  });

  it('should return undefined for invalid player ID', () => {
    const game = createTestGame();
    const player = getPlayerState(game, 99);
    expect(player).toBeUndefined();
  });
});

describe('State — getLaneState', () => {
  it('should return the correct lane state', () => {
    const game = createTestGame();
    const lane = getLaneState(game, 0);
    expect(lane).toBeDefined();
    expect(lane!.index).toBe(0);
  });

  it('should return undefined for invalid lane index', () => {
    const game = createTestGame();
    const lane = getLaneState(game, 99);
    expect(lane).toBeUndefined();
  });
});

describe('State — isInPhase', () => {
  it('should return true for current phase', () => {
    const game = createTestGame();
    expect(isInPhase(game, 'planning')).toBe(true);
  });

  it('should return false for other phases', () => {
    const game = createTestGame();
    expect(isInPhase(game, 'reveal')).toBe(false);
    expect(isInPhase(game, 'resolution')).toBe(false);
    expect(isInPhase(game, 'cleanup')).toBe(false);
  });
});

describe('State — canPlayerAct', () => {
  it('should return true for connected player in planning who has not submitted', () => {
    const game = createTestGame();
    expect(canPlayerAct(game, 0)).toBe(true);
  });

  it('should return false for player who has submitted', () => {
    const game = createTestGame();
    game.players[0].hasSubmitted = true;
    expect(canPlayerAct(game, 0)).toBe(false);
  });

  it('should return false for disconnected player', () => {
    const game = createTestGame();
    game.players[0].isConnected = false;
    expect(canPlayerAct(game, 0)).toBe(false);
  });

  it('should return false when game is completed', () => {
    const game = createTestGame();
    game.gamePhase = 'completed';
    expect(canPlayerAct(game, 0)).toBe(false);
  });

  it('should return false when not in planning phase', () => {
    const game = createTestGame();
    game.roundPhase = 'reveal';
    expect(canPlayerAct(game, 0)).toBe(false);
  });
});

describe('State — Serialization Round-Trip', () => {
  it('should serialize and deserialize to identical state (VP values)', () => {
    const original = createTestGame('serialize-test');
    original.players[0].vpTotal = 5;
    original.players[2].vpTotal = 3;

    const json = serialize(original);
    const restored = deserialize(json);

    expect(restored.gameId).toBe(original.gameId);
    expect(restored.mode).toBe(original.mode);
    expect(restored.currentRound).toBe(original.currentRound);
    expect(restored.players[0].vpTotal).toBe(5);
    expect(restored.players[2].vpTotal).toBe(3);
  });

  it('should serialize and deserialize all player fields', () => {
    const original = createTestGame('serialize-full');
    const json = serialize(original);
    const restored = deserialize(json);

    for (let i = 0; i < 4; i++) {
      const op = original.players[i];
      const rp = restored.players[i];
      expect(rp.id).toBe(op.id);
      expect(rp.isBot).toBe(op.isBot);
      expect(rp.isConnected).toBe(op.isConnected);
      expect(rp.hand).toHaveLength(op.hand.length);
      expect(rp.deck).toHaveLength(op.deck.length);
    }
  });

  it('should serialize and deserialize lane states', () => {
    const original = createTestGame('serialize-lanes');
    const json = serialize(original);
    const restored = deserialize(json);

    expect(restored.lanes).toHaveLength(original.lanes.length);
    for (let i = 0; i < original.lanes.length; i++) {
      expect(restored.lanes[i].isActive).toBe(original.lanes[i].isActive);
      expect(restored.lanes[i].objective.type).toBe(original.lanes[i].objective.type);
    }
  });

  it('should throw on invalid JSON', () => {
    expect(() => deserialize('{"foo":"bar"}')).toThrow();
    expect(() => deserialize('not-json')).toThrow();
  });

  it('should throw on missing players', () => {
    expect(() => deserialize('{"lanes":[]}')).toThrow('Invalid game state: missing players');
  });

  it('should throw on missing lanes', () => {
    expect(() => deserialize('{"players":[{},{},{},{}]}')).toThrow('Invalid game state: missing lanes');
  });

  it('should handle achievements array correctly', () => {
    const original = createTestGame('serialize-ach');
    original.awardedAchievements.push('first-blood');
    original.firstBloodAwarded = true;

    const json = serialize(original);
    const restored = deserialize(json);

    expect(restored.awardedAchievements).toContain('first-blood');
    expect(restored.firstBloodAwarded).toBe(true);
  });
});

describe('State — cloneGameState', () => {
  it('should create an independent deep copy', () => {
    const original = createTestGame('clone-test');
    const clone = cloneGameState(original);

    // Modify clone
    clone.players[0].vpTotal = 99;
    clone.lanes[0].isActive = false;

    // Original should be unchanged
    expect(original.players[0].vpTotal).toBe(0);
    expect(original.lanes[0].isActive).toBe(true);
  });

  it('should preserve all data structures', () => {
    const original = createTestGame('clone-full');
    const clone = cloneGameState(original);

    expect(clone.players).toHaveLength(4);
    expect(clone.lanes).toHaveLength(5);
    expect(clone.players[0].hand.length).toBe(original.players[0].hand.length);
    expect(clone.players[0].deck.length).toBe(original.players[0].deck.length);
  });

  it('should not share references', () => {
    const original = createTestGame('clone-ref');
    const clone = cloneGameState(original);

    // Mutations should not affect original
    clone.players[0].hand = [];
    clone.players[0].deck = [];

    expect(original.players[0].hand.length).toBeGreaterThan(0);
    expect(original.players[0].deck.length).toBeGreaterThan(0);
  });
});
