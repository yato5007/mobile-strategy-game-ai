/**
 * Unit tests — Types
 *
 * Verifies all interfaces and types are correctly structured.
 */
import type {
  Card,
  TacticEffect,
  LaneObjective,
  LaneState,
  PlayerState,
  GameState,
  GameConfig,
  CardAssignment,
  Standing,
  GameResult,
  ValidationResult,
  SubmitAction,
  AchievementDefinition,
  GameEvent,
  GameEventEmitter,
} from '../types';

describe('Types — Interface Structure', () => {
  describe('Card', () => {
    it('should create a valid unit card structure', () => {
      const card: Card = {
        id: 'unit-scout-1',
        type: 'unit',
        nameKey: 'card.scout',
        strength: 1,
        tacticEffect: null,
        descriptionKey: 'card.scout.desc',
        isComeback: false,
      };
      expect(card.type).toBe('unit');
      expect(card.strength).toBe(1);
      expect(card.tacticEffect).toBeNull();
      expect(card.isComeback).toBe(false);
    });

    it('should create a valid tactic card structure', () => {
      const tacticEffect: TacticEffect = {
        effectType: 'sabotage',
        targetPlayerId: null,
        targetLaneIndex: null,
        magnitude: 2,
      };
      const card: Card = {
        id: 'tactic-sabotage-1',
        type: 'tactic',
        nameKey: 'card.sabotage',
        strength: 0,
        tacticEffect,
        descriptionKey: 'card.sabotage.desc',
        isComeback: false,
      };
      expect(card.type).toBe('tactic');
      expect(card.strength).toBe(0);
      expect(card.tacticEffect?.effectType).toBe('sabotage');
      expect(card.tacticEffect?.magnitude).toBe(2);
    });

    it('should create a valid comeback card', () => {
      const card: Card = {
        id: 'comeback-determination-1',
        type: 'comeback',
        nameKey: 'card.determination',
        strength: 0,
        tacticEffect: { effectType: 'reinforce', magnitude: 4 },
        descriptionKey: 'card.determination.desc',
        isComeback: true,
      };
      expect(card.isComeback).toBe(true);
      expect(card.type).toBe('comeback');
    });
  });

  describe('TacticEffect', () => {
    it('should support all tactic effect types', () => {
      const types: TacticEffect['effectType'][] = [
        'bluff', 'sabotage', 'reinforce', 'spy', 'shield', 'retreat', 'ambush',
      ];
      expect(types).toHaveLength(7);

      for (const t of types) {
        const effect: TacticEffect = { effectType: t };
        expect(effect.effectType).toBe(t);
      }
    });
  });

  describe('LaneObjective', () => {
    it('should create a standard lane objective', () => {
      const obj: LaneObjective = {
        type: 'standard',
        vpValue: 2,
        bonusVp: 0,
        descriptionKey: 'objective.standard',
      };
      expect(obj.type).toBe('standard');
      expect(obj.vpValue).toBe(2);
    });

    it('should support all lane objective types', () => {
      const types: LaneObjective['type'][] = [
        'standard', 'high-value', 'capture-flag', 'king-of-hill', 'bounty',
      ];
      expect(types).toHaveLength(5);
    });
  });

  describe('LaneState', () => {
    it('should initialize with zero strengths and empty assignments', () => {
      const lane: LaneState = {
        index: 0,
        isActive: true,
        objective: { type: 'standard', vpValue: 2, bonusVp: 0, descriptionKey: 'objective.standard' },
        totalStrengthPerPlayer: { 0: 0, 1: 0, 2: 0, 3: 0 },
        winner: null,
        isTie: false,
        vpAwarded: { 0: 0, 1: 0, 2: 0, 3: 0 },
        assignments: { 0: [], 1: [], 2: [], 3: [] },
        streak: 0,
        shieldedPlayers: [],
      };
      expect(lane.totalStrengthPerPlayer[0]).toBe(0);
      expect(lane.assignments[0]).toEqual([]);
      expect(lane.shieldedPlayers).toEqual([]);
    });
  });

  describe('PlayerState', () => {
    it('should create a valid player state', () => {
      const player: PlayerState = {
        id: 0,
        teamId: 0,
        hand: [],
        discardPile: [],
        deck: [],
        vpTotal: 0,
        laneWins: 0,
        firstScoreRound: null,
        currentAssignments: [],
        hasSubmitted: false,
        isConnected: true,
        isBot: true,
        earnedAchievements: [],
      };
      expect(player.vpTotal).toBe(0);
      expect(player.hasSubmitted).toBe(false);
      expect(player.isBot).toBe(true);
    });
  });

  describe('GameConfig', () => {
    it('should create FFA config with all bots', () => {
      const config: GameConfig = {
        mode: 'ffa',
        playerSlots: [true, true, true, true],
      };
      expect(config.mode).toBe('ffa');
      expect(config.playerSlots.every(Boolean)).toBe(true);
    });

    it('should create 2v2 config with optional seed', () => {
      const config: GameConfig = {
        mode: '2v2',
        playerSlots: [true, true, true, true],
        maxRounds: 12,
        randomSeed: 'test-seed',
      };
      expect(config.mode).toBe('2v2');
      expect(config.randomSeed).toBe('test-seed');
    });
  });

  describe('GameState', () => {
    it('should have all required fields', () => {
      const lane: LaneState = {
        index: 0,
        isActive: true,
        objective: { type: 'standard', vpValue: 2, bonusVp: 0, descriptionKey: 'objective.standard' },
        totalStrengthPerPlayer: { 0: 0, 1: 0, 2: 0, 3: 0 },
        winner: null,
        isTie: false,
        vpAwarded: { 0: 0, 1: 0, 2: 0, 3: 0 },
        assignments: { 0: [], 1: [], 2: [], 3: [] },
        streak: 0,
        shieldedPlayers: [],
      };
      const player: PlayerState = {
        id: 0, teamId: 0, hand: [], discardPile: [], deck: [],
        vpTotal: 0, laneWins: 0, firstScoreRound: null,
        currentAssignments: [], hasSubmitted: false,
        isConnected: true, isBot: false, earnedAchievements: [],
      };
      const game: GameState = {
        gameId: 'test-game',
        mode: 'ffa',
        maxRounds: 12,
        currentRound: 1,
        gamePhase: 'in-progress',
        roundPhase: 'planning',
        players: [player, { ...player, id: 1 }, { ...player, id: 2 }, { ...player, id: 3 }],
        lanes: [lane, { ...lane, index: 1 }, { ...lane, index: 2 }],
        awardedAchievements: [],
        firstBloodAwarded: false,
        roundsCompleted: 0,
        phaseTimestamps: {},
      };
      expect(game.players).toHaveLength(4);
      expect(game.lanes).toHaveLength(3);
      expect(game.gamePhase).toBe('in-progress');
    });
  });

  describe('CardAssignment', () => {
    it('should create a valid assignment', () => {
      const assignment: CardAssignment = { cardId: 'unit-scout-1', laneIndex: 0 };
      expect(assignment.cardId).toBe('unit-scout-1');
      expect(assignment.laneIndex).toBe(0);
    });
  });

  describe('Standing', () => {
    it('should create a valid standing', () => {
      const standing: Standing = {
        playerId: 0,
        teamId: 0,
        vpTotal: 5,
        laneWins: 3,
        firstScoreRound: 1,
        rank: 1,
      };
      expect(standing.rank).toBe(1);
      expect(standing.vpTotal).toBe(5);
    });
  });

  describe('GameResult', () => {
    it('should create a valid game result with winner', () => {
      const result: GameResult = {
        winnerId: 0,
        winningTeamId: null,
        isDraw: false,
        finalStandings: [],
        totalRoundsPlayed: 12,
      };
      expect(result.winnerId).toBe(0);
      expect(result.isDraw).toBe(false);
    });

    it('should create a valid draw result', () => {
      const result: GameResult = {
        winnerId: null,
        winningTeamId: null,
        isDraw: true,
        finalStandings: [],
        totalRoundsPlayed: 12,
      };
      expect(result.isDraw).toBe(true);
    });
  });

  describe('ValidationResult', () => {
    it('should represent success', () => {
      const result: ValidationResult = { valid: true, errors: [] };
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should represent failure with errors', () => {
      const result: ValidationResult = { valid: false, errors: ['Card not in hand', 'Lane inactive'] };
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('SubmitAction', () => {
    it('should create a submit action', () => {
      const action: SubmitAction = {
        type: 'submit_assignments',
        playerId: 0,
        assignments: [{ cardId: 'unit-scout-1', laneIndex: 1 }],
      };
      expect(action.type).toBe('submit_assignments');
      expect(action.assignments).toHaveLength(1);
    });
  });

  describe('AchievementDefinition', () => {
    it('should create an achievement', () => {
      const achievement: AchievementDefinition = {
        id: 'first-blood',
        nameKey: 'achievement.first-blood',
        descriptionKey: 'achievement.first-blood.desc',
        vpReward: 2,
        maxTriggers: 1,
        allowedModes: ['ffa', '2v2'],
        condition: () => false,
      };
      expect(achievement.id).toBe('first-blood');
      expect(achievement.maxTriggers).toBe(1);
      expect(achievement.condition()).toBe(false);
    });
  });

  describe('GameEvent — Discriminated Union', () => {
    it('should create a game started event', () => {
      const event: GameEvent = {
        type: 'GameStarted',
        payload: { gameId: 'g1', mode: 'ffa', players: [0, 1, 2, 3] },
      };
      expect(event.type).toBe('GameStarted');
    });

    it('should create a lane resolved event', () => {
      const event: GameEvent = {
        type: 'LaneResolved',
        payload: {
          laneIndex: 0, winner: 0, isTie: false,
          vpAwarded: { 0: 2, 1: 0, 2: 0, 3: 0 },
          strengths: { 0: 5, 1: 2, 2: 0, 3: 0 },
        },
      };
      expect(event.type).toBe('LaneResolved');
      expect(event.payload.winner).toBe(0);
    });

    it('should create a game over event', () => {
      const event: GameEvent = {
        type: 'GameOver',
        payload: {
          winner: 2, winningTeamId: null,
          finalScores: { 0: 10, 1: 8, 2: 14, 3: 6 },
        },
      };
      expect(event.type).toBe('GameOver');
      expect(event.payload.winner).toBe(2);
    });
  });

  describe('GameEventEmitter', () => {
    it('should have the correct method signatures', () => {
      const emitter: GameEventEmitter = {
        subscribe: () => () => {},
        emit: () => {},
        clear: () => {},
      };
      expect(typeof emitter.subscribe).toBe('function');
      expect(typeof emitter.emit).toBe('function');
      expect(typeof emitter.clear).toBe('function');

      const unsubscribe = emitter.subscribe('GameStarted', () => {});
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
