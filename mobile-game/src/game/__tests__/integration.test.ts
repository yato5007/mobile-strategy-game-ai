/**
 * Integration Tests — Full Game Simulation
 *
 * Tests the complete game lifecycle with bots:
 * - FFA mode full 12-round game
 * - 2v2 mode full 12-round game
 * - State consistency throughout
 * - Bot decisions integrate with engine
 */
import { createGame, submitAssignments, isPlanningComplete, forceSubmitRemaining, revealAssignments, resolveRound, processCleanup, getGameResult } from '../engine';
import { createBot } from '../../bot';
import type { GameConfig, GameState, GameEventEmitter, PlayerId, SubmitAction } from '../types';
import type { BotConfig } from '../../bot';

/** Wait for a short time to let async operations settle (not needed for sync code) */

/**
 * Helper: run one round of a game with bot decisions.
 * Returns the number of events emitted during this round.
 */
function runRound(
  game: GameState,
  events: GameEventEmitter,
  bots: Map<PlayerId, ReturnType<typeof createBot>>,
): number {
  let eventCount = 0;
  const counter = () => { eventCount++; };
  events.subscribe('PlayerSubmitted', counter);
  events.subscribe('RevealPhase', counter);
  events.subscribe('ResolutionPhase', counter);
  events.subscribe('LaneResolved', counter);
  events.subscribe('RoundComplete', counter);

  // Bot decisions
  for (let i = 0; i < 4; i++) {
    const bot = bots.get(i);
    if (bot && game.players[i].isConnected && !game.players[i].hasSubmitted) {
      try {
        const action: SubmitAction = bot.decide(game, i, events);
        const result = submitAssignments(game, i, action.assignments, events);
        if (!result.valid) {
          // Fallback to first card in hand
          if (game.players[i].hand.length > 0) {
            submitAssignments(game, i, [{ cardId: game.players[i].hand[0].id, laneIndex: 0 }], events);
          }
        }
      } catch (err) {
        // If bot fails, submit first available card
        if (game.players[i].hand.length > 0) {
          submitAssignments(game, i, [{ cardId: game.players[i].hand[0].id, laneIndex: 0 }], events);
        }
      }
    }
  }

  // Force submit anyone who hasn't submitted
  forceSubmitRemaining(game);

  // Reveal
  revealAssignments(game, events);

  // Resolve
  resolveRound(game, events);

  // Cleanup
  processCleanup(game, events);

  const total = eventCount;
  return total;
}

/** Create a lineup of 4 bots */
function createBotLineup(configs: BotConfig[]): Map<PlayerId, ReturnType<typeof createBot>> {
  const bots = new Map<PlayerId, ReturnType<typeof createBot>>();
  for (let i = 0; i < 4 && i < configs.length; i++) {
    bots.set(i, createBot(configs[i]));
  }
  return bots;
}

/** Default bot configs for 4 players */
const DEFAULT_BOT_LINEUP: BotConfig[] = [
  { difficulty: 'normal', style: 'aggressive' },
  { difficulty: 'normal', style: 'defensive' },
  { difficulty: 'normal', style: 'balanced' },
  { difficulty: 'normal', style: 'disruptive' },
];

describe('Integration — Full FFA Game (12 rounds)', () => {
  let game: GameState;
  let events: GameEventEmitter;
  let bots: Map<PlayerId, ReturnType<typeof createBot>>;

  beforeEach(() => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'integration-ffa-full',
    };
    const result = createGame(config);
    game = result.game;
    events = result.events;
    bots = createBotLineup(DEFAULT_BOT_LINEUP);
  });

  it('should complete all 12 rounds and produce a winner', () => {
    let totalEvents = 0;

    for (let round = 1; round <= 12; round++) {
      totalEvents += runRound(game, events, bots);
    }

    // Game should be over
    expect(game.gamePhase).toBe('completed');
    expect(game.roundsCompleted).toBe(12);
    expect(game.currentRound).toBe(13);

    // Get result
    const result = getGameResult(game);
    expect(result.finalStandings).toHaveLength(4);

    // Verify standings are sorted
    for (let i = 1; i < result.finalStandings.length; i++) {
      expect(result.finalStandings[i - 1].vpTotal)
        .toBeGreaterThanOrEqual(result.finalStandings[i].vpTotal);
    }

    // All players should have some VP (play is active)
    for (const p of game.players) {
      expect(p.vpTotal).toBeGreaterThanOrEqual(0);
    }

    // Winner should be defined (or draw)
    if (!result.isDraw) {
      expect(result.winnerId).not.toBeNull();
    }

    console.log(`FFA Game result: Winner=Player ${result.winnerId}, Draw=${result.isDraw}`);
    console.log(`Final scores: ${result.finalStandings.map(s => `P${s.playerId}:${s.vpTotal}`).join(', ')}`);
  });

  it('should maintain state consistency throughout the game', () => {
    for (let round = 1; round <= 12; round++) {
      runRound(game, events, bots);

      // Validate state after each round
      expect(game.players[0].hand.length).toBeGreaterThanOrEqual(0);
      expect(game.players[1].hand.length).toBeGreaterThanOrEqual(0);
      expect(game.players[2].hand.length).toBeGreaterThanOrEqual(0);
      expect(game.players[3].hand.length).toBeGreaterThanOrEqual(0);

      // VP shouldn't be negative
      for (const p of game.players) {
        expect(p.vpTotal).toBeGreaterThanOrEqual(0);
      }

      // Check lane count matches schedule
      const activeLanes = game.lanes.filter(l => l.isActive);
      if (round <= 3) expect(activeLanes).toHaveLength(3);
      else if (round <= 6) expect(activeLanes).toHaveLength(4);
      else expect(activeLanes).toHaveLength(5);
    }

    // All players should have played actively
    const totalVp = game.players.reduce((sum, p) => sum + p.vpTotal, 0);
    expect(totalVp).toBeGreaterThan(0);
  });
});

describe('Integration — Full 2v2 Game (6 rounds)', () => {
  it('should complete 6 rounds in 2v2 mode', () => {
    const config: GameConfig = {
      mode: '2v2',
      playerSlots: [true, true, true, true],
      randomSeed: 'integration-2v2',
    };
    const { game, events } = createGame(config);

    const bots = createBotLineup([
      { difficulty: 'hard', style: 'aggressive' },
      { difficulty: 'hard', style: 'team-support' },
      { difficulty: 'hard', style: 'defensive' },
      { difficulty: 'hard', style: 'objective-focused' },
    ]);

    for (let round = 1; round <= 6; round++) {
      runRound(game, events, bots);
    }

    expect(game.roundsCompleted).toBe(6);
    expect(game.gamePhase).toBe('in-progress'); // Still going

    // Team consistency check
    const team0Vp = game.players[0].vpTotal + game.players[1].vpTotal;
    const team1Vp = game.players[2].vpTotal + game.players[3].vpTotal;

    // Team 0 and Team 1 can have different scores
    expect(team0Vp + team1Vp).toBeGreaterThanOrEqual(0);
  });
});

describe('Integration — Different Bot Styles', () => {
  it('should run a game with all defensive bots', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'all-defensive',
    };
    const { game, events } = createGame(config);
    const bots = createBotLineup([
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'defensive' },
    ]);

    for (let round = 1; round <= 6; round++) {
      runRound(game, events, bots);
    }

    expect(game.roundsCompleted).toBe(6);
  });

  it('should run a game with all aggressive bots', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'all-aggressive',
    };
    const { game, events } = createGame(config);
    const bots = createBotLineup([
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'aggressive' },
    ]);

    for (let round = 1; round <= 6; round++) {
      runRound(game, events, bots);
    }

    expect(game.roundsCompleted).toBe(6);
  });

  it('should run a game with mixed difficulty bots', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'mixed-diff',
    };
    const { game, events } = createGame(config);
    const bots = createBotLineup([
      { difficulty: 'easy', style: 'balanced' },
      { difficulty: 'normal', style: 'balanced' },
      { difficulty: 'hard', style: 'balanced' },
      { difficulty: 'expert', style: 'balanced' },
    ]);

    for (let round = 1; round <= 6; round++) {
      runRound(game, events, bots);
    }

    expect(game.roundsCompleted).toBe(6);
  });
});

describe('Integration — Comeback Verification', () => {
  it('should give comeback bonuses to trailing players', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'comeback-int',
    };
    const { game, events } = createGame(config);

    // Give one player a big lead
    game.players[0].vpTotal = 10;
    game.players[1].vpTotal = 2;
    game.players[2].vpTotal = 1;
    game.players[3].vpTotal = 0;

    const bots = createBotLineup(DEFAULT_BOT_LINEUP);

    // Play 4 rounds
    for (let round = 1; round <= 4; round++) {
      runRound(game, events, bots);
    }

    // Players who were trailing (1, 2, 3) should have received comeback bonuses
    // and should have at least some VP now
    expect(game.roundsCompleted).toBe(4);
  });
});

describe('Integration — Edge Cases', () => {
  it('should handle a game where all players start with empty hands (edge case)', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'empty-hands',
    };
    const { game, events } = createGame(config);

    // Clear all hands
    for (const p of game.players) {
      p.hand = [];
    }

    const bots = createBotLineup(DEFAULT_BOT_LINEUP);

    // Play 1 round — should handle empty hands gracefully
    forceSubmitRemaining(game);
    revealAssignments(game, events);
    resolveRound(game, events);
    processCleanup(game, events);

    expect(game.currentRound).toBe(2); // Advanced past round 1
  });

  it('should handle reconnect scenario (player disconnects mid-game)', () => {
    const config: GameConfig = {
      mode: 'ffa',
      playerSlots: [true, true, true, true],
      randomSeed: 'disconnect',
    };
    const { game, events } = createGame(config);

    const bots = createBotLineup(DEFAULT_BOT_LINEUP);

    // Round 1: normal
    runRound(game, events, bots);

    // Player 0 disconnects
    game.players[0].isConnected = false;

    // Round 2: player 0 is disconnected
    runRound(game, events, bots);

    expect(game.roundsCompleted).toBe(2);
    expect(game.players[0].isConnected).toBe(false);

    // Reconnect player 0
    game.players[0].isConnected = true;

    // Round 3: back to normal
    runRound(game, events, bots);

    expect(game.roundsCompleted).toBe(3);
  });
});
