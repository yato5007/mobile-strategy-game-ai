/**
 * Balance Simulator
 *
 * Runs automated matches with various bot configurations to:
 * - Detect dominant strategies (>55% win rate).
 * - Verify comeback mechanics work.
 * - Ensure match duration ≤ 30 minutes (simulated).
 * - Test both FFA and 2v2 modes.
 * - Verify all bot difficulty levels and styles are viable.
 *
 * Pure TypeScript — no React Native imports.
 * Designed for development and QA use only (not part of the game runtime).
 */

import {
  createGame,
  submitAssignments,
  isPlanningComplete,
  forceSubmitRemaining,
  revealAssignments,
  resolveRound,
  processCleanup,
  getStandings,
  getGameResult,
  isGameOver,
} from '../game';

import { createBot } from '../bot';
import type { GameConfig, GameState, GameEventEmitter, PlayerId, Standing, SubmitAction } from '../game/types';
import type { BotConfig, BotController } from '../bot';

// ─── Public Types ───────────────────────────────────────────────

/** Configuration for a single bot player slot */
export interface SimulatorBotSlot {
  /** Bot config to use for this slot */
  config: BotConfig;
  /** Optional human-readable label */
  label?: string;
}

/**
 * Configuration for a single simulation game.
 */
export interface SimulationConfig {
  /** Game mode */
  mode: 'ffa' | '2v2';
  /** Bot configurations for each player slot (length must be 4) */
  bots: BotConfig[];
  /** Optional seed for deterministic random */
  randomSeed?: string;
}

/** Aggregated simulation result */
export interface SimulationResult {
  /** Total number of games simulated */
  totalGames: number;
  /** Win rates by bot style key (e.g., "aggressive" → 0.38) */
  winRates: Record<string, number>;
  /** Win rates by bot difficulty key (e.g., "hard" → 0.45) */
  winRatesByDifficulty: Record<string, number>;
  /** Win rates by combined style+difficulty key (e.g., "aggressive+hard") */
  winRatesByCombo: Record<string, number>;
  /** Average match duration in simulated seconds */
  avgMatchDuration: number;
  /** Average number of rounds played per match */
  avgRounds: number;
  /** Percentage of games where a trailing player/team came back to win */
  comebackWinRate: number;
  /** Percentage of games where the round-1 leader went on to win */
  earlyLeaderWinRate: number;
  /** List of strategies with >55% win rate (flags) */
  dominantStrategies: string[];
  /** Detailed per-mode results */
  modeResults: {
    ffa: ModeResult;
    '2v2': ModeResult;
  };
  /** All balance flags found */
  balanceFlags: BalanceFlag[];
  /** Raw game logs (each game's final scores per player) */
  gameLogs: GameLogEntry[];
}

/** Per-mode result breakdown */
export interface ModeResult {
  gamesPlayed: number;
  winRates: Record<string, number>;
  avgScore: number;
  avgScoreSpread: number;
}

/** A single game's log entry */
export interface GameLogEntry {
  gameId: string;
  mode: 'ffa' | '2v2';
  winnerId: PlayerId | null;
  winningTeamId: PlayerId | null;
  isDraw: boolean;
  finalScores: number[];
  botStyles: string[];
  botDifficulties: string[];
  botCombo: string[];
  totalRounds: number;
  roundOneLeader: PlayerId | null;
  comebackWinner: boolean;
}

/** Balance flag describing a potential issue */
export interface BalanceFlag {
  type: 'dominant_strategy' | 'no_comeback' | 'match_too_long' | 'strategy_always_wins' | 'early_leader_dominance';
  severity: 'warning' | 'critical';
  description: string;
  data: Record<string, unknown>;
}

/**
 * Run a multi-game balance simulation.
 *
 * @param configs - Array of simulation configs to run (each config describes one bot lineup)
 * @param gamesPerConfig - Number of games to run per config
 * @returns Aggregated simulation results
 */
export function runBalanceSimulation(
  configs: SimulationConfig[],
  gamesPerConfig: number = 100,
): SimulationResult {
  if (gamesPerConfig < 1) {
    throw new Error('gamesPerConfig must be at least 1');
  }

  const allLogs: GameLogEntry[] = [];
  const modeResults: { ffa: GameLogEntry[]; '2v2': GameLogEntry[] } = { ffa: [], '2v2': [] };

  for (const config of configs) {
    for (let gameIdx = 0; gameIdx < gamesPerConfig; gameIdx++) {
      const seed = config.randomSeed
        ? `${config.randomSeed}-g${gameIdx}`
        : undefined;

      const log = simulateSingleGame(config.mode, config.bots, seed);
      allLogs.push(log);

      if (config.mode === 'ffa') {
        modeResults.ffa.push(log);
      } else {
        modeResults['2v2'].push(log);
      }
    }
  }

  return analyzeResults(allLogs, modeResults);
}

// ─── Single Game Simulation ─────────────────────────────────────

/**
 * Simulate a single complete game from start to finish.
 * Returns detailed log data about the game.
 */
function simulateSingleGame(
  mode: 'ffa' | '2v2',
  botConfigs: BotConfig[],
  seed?: string,
): GameLogEntry {
  // Validate bot configs
  if (botConfigs.length !== 4) {
    throw new Error(`Expected 4 bot configs, got ${botConfigs.length}`);
  }

  // Create game
  const gameConfig: GameConfig = {
    mode,
    playerSlots: [true, true, true, true],
    maxRounds: 12,
    randomSeed: seed,
  };

  const { game, events } = createGame(gameConfig);

  // Create bots
  const bots: BotController[] = botConfigs.map(cfg => createBot(cfg));

  // Track round-1 leader
  let roundOneLeader: PlayerId | null = null;

  // Track if the winner was ever in last place (comeback detection)
  const trailingTracker: Set<PlayerId> = new Set();

  // Simulated time tracking
  const startTime = Date.now();

  // Play all rounds
  for (let round = 1; round <= 12; round++) {
    // Each bot decides
    for (let pid = 0; pid < 4; pid++) {
      if (game.players[pid].isConnected && !game.players[pid].hasSubmitted) {
        try {
          const action: SubmitAction = bots[pid].decide(game, pid as PlayerId, events);
          const result = submitAssignments(game, pid as PlayerId, action.assignments, events);
          if (!result.valid) {
            // Fallback: submit first card
            if (game.players[pid].hand.length > 0) {
              submitAssignments(game, pid as PlayerId, [
                { cardId: game.players[pid].hand[0].id, laneIndex: 0 },
              ], events);
            }
          }
        } catch (err) {
          // Bot threw an error — submit first card
          if (game.players[pid].hand.length > 0) {
            submitAssignments(game, pid as PlayerId, [
              { cardId: game.players[pid].hand[0].id, laneIndex: 0 },
            ], events);
          }
        }
      }
    }

    // Force submit stragglers
    if (!isPlanningComplete(game)) {
      forceSubmitRemaining(game);
    }

    // Advance phases
    revealAssignments(game, events);
    resolveRound(game, events);

    // Track round-1 leader after first resolution
    if (round === 1) {
      const standings = getStandings(game);
      if (standings.length > 0) {
        roundOneLeader = standings[0].playerId;
      }
    }

    // Track trailing players (bottom half in FFA, trailing team in 2v2)
    if (round >= 2) {
      for (let pid = 0; pid < 4; pid++) {
        if (isPlayerTrailing(game, pid as PlayerId)) {
          trailingTracker.add(pid as PlayerId);
        }
      }
    }

    // Cleanup (draws cards, checks achievements, advances round)
    processCleanup(game, events);

    // Check if game ended
    if (isGameOver(game)) break;
  }

  const endTime = Date.now();
  const simulatedDurationMs = endTime - startTime;

  // Get final result
  const result = getGameResult(game);
  const finalScores = [0, 1, 2, 3].map(pid => game.players[pid].vpTotal);

  // Determine if winner was a comeback
  const comebackWinner = result.winnerId !== null && trailingTracker.has(result.winnerId);

  return {
    gameId: game.gameId,
    mode,
    winnerId: result.winnerId,
    winningTeamId: result.winningTeamId,
    isDraw: result.isDraw,
    finalScores,
    botStyles: botConfigs.map(c => c.style),
    botDifficulties: botConfigs.map(c => c.difficulty),
    botCombo: botConfigs.map(c => `${c.style}+${c.difficulty}`),
    totalRounds: game.roundsCompleted,
    roundOneLeader,
    comebackWinner,
  };
}

// ─── Trailing Detection ─────────────────────────────────────────

/** Check if a player is in a trailing position (simplified version) */
function isPlayerTrailing(game: GameState, playerId: PlayerId): boolean {
  const player = game.players[playerId];
  if (!player || !player.isConnected) return false;

  if (game.mode === '2v2') {
    const teamId = player.teamId;
    const myTeamVp = game.players
      .filter(p => p.teamId === teamId)
      .reduce((s, p) => s + p.vpTotal, 0);
    const otherTeamVp = game.players
      .filter(p => p.teamId !== teamId && p.isConnected)
      .reduce((s, p) => s + p.vpTotal, 0);
    return myTeamVp < otherTeamVp;
  }

  // FFA: bottom half
  const sorted = [...game.players]
    .filter(p => p.isConnected)
    .sort((a, b) => a.vpTotal - b.vpTotal);

  if (sorted.length <= 1) return false;
  const medianIdx = Math.floor(sorted.length / 2);
  return sorted.indexOf(player) <= medianIdx && player.vpTotal < sorted[sorted.length - 1].vpTotal;
}

// ─── Result Analysis ────────────────────────────────────────────

/**
 * Analyze raw game logs and produce aggregated results with balance flags.
 */
function analyzeResults(
  allLogs: GameLogEntry[],
  modeResults: { ffa: GameLogEntry[]; '2v2': GameLogEntry[] },
): SimulationResult {
  const totalGames = allLogs.length;

  if (totalGames === 0) {
    return {
      totalGames: 0,
      winRates: {},
      winRatesByDifficulty: {},
      winRatesByCombo: {},
      avgMatchDuration: 0,
      avgRounds: 0,
      comebackWinRate: 0,
      earlyLeaderWinRate: 0,
      dominantStrategies: [],
      modeResults: {
        ffa: { gamesPlayed: 0, winRates: {}, avgScore: 0, avgScoreSpread: 0 },
        '2v2': { gamesPlayed: 0, winRates: {}, avgScore: 0, avgScoreSpread: 0 },
      },
      balanceFlags: [],
      gameLogs: [],
    };
  }

  // ─── Win rates by style ─────────────────────────────────────
  const styleWins: Record<string, number> = {};
  const styleGames: Record<string, number> = {};

  // ─── Win rates by difficulty ────────────────────────────────
  const diffWins: Record<string, number> = {};
  const diffGames: Record<string, number> = {};

  // ─── Win rates by combo ─────────────────────────────────────
  const comboWins: Record<string, number> = {};
  const comboGames: Record<string, number> = {};

  // ─── Comeback and early leader tracking ─────────────────────
  let comebackGames = 0;
  let earlyLeaderGames = 0;
  let earlyLeaderWins = 0;
  let totalRoundsSum = 0;

  for (const log of allLogs) {
    totalRoundsSum += log.totalRounds;

    if (log.isDraw) continue; // Skip draws for win-rate analysis

    // Find the winner's style/difficulty/combo
    if (log.winnerId !== null) {
      const winnerIdx = log.winnerId;
      const winnerStyle = log.botStyles[winnerIdx];
      const winnerDiff = log.botDifficulties[winnerIdx];
      const winnerCombo = log.botCombo[winnerIdx];

      styleWins[winnerStyle] = (styleWins[winnerStyle] ?? 0) + 1;
      diffWins[winnerDiff] = (diffWins[winnerDiff] ?? 0) + 1;
      comboWins[winnerCombo] = (comboWins[winnerCombo] ?? 0) + 1;
    }

    // Count games per style/difficulty/combo (each game = 4 slots)
    for (let i = 0; i < 4; i++) {
      const style = log.botStyles[i];
      const diff = log.botDifficulties[i];
      const combo = log.botCombo[i];

      styleGames[style] = (styleGames[style] ?? 0) + 1;
      diffGames[diff] = (diffGames[diff] ?? 0) + 1;
      comboGames[combo] = (comboGames[combo] ?? 0) + 1;
    }

    // Comeback tracking
    if (log.comebackWinner) {
      comebackGames++;
    }

    // Early leader tracking
    if (log.roundOneLeader !== null) {
      earlyLeaderGames++;
      if (log.winnerId === log.roundOneLeader) {
        earlyLeaderWins++;
      }
    }
  }

  // Calculate win rates
  const winRates: Record<string, number> = {};
  for (const [style, wins] of Object.entries(styleWins)) {
    const total = styleGames[style] ?? 1;
    winRates[style] = wins / total;
  }

  const winRatesByDifficulty: Record<string, number> = {};
  for (const [diff, wins] of Object.entries(diffWins)) {
    const total = diffGames[diff] ?? 1;
    winRatesByDifficulty[diff] = wins / total;
  }

  const winRatesByCombo: Record<string, number> = {};
  for (const [combo, wins] of Object.entries(comboWins)) {
    const total = comboGames[combo] ?? 1;
    winRatesByCombo[combo] = wins / total;
  }

  // ─── Mode Results ───────────────────────────────────────────

  const ffaResult = analyzeModeResults(modeResults.ffa);
  const tvResult = analyzeModeResults(modeResults['2v2']);

  // ─── Balance Flags ──────────────────────────────────────────

  const balanceFlags: BalanceFlag[] = [];

  // Dominant strategy detection
  const dominantStrategies: string[] = [];
  for (const [style, rate] of Object.entries(winRates)) {
    if (rate > 0.55) {
      dominantStrategies.push(style);
      balanceFlags.push({
        type: 'dominant_strategy',
        severity: rate > 0.65 ? 'critical' : 'warning',
        description: `Strategy "${style}" has ${(rate * 100).toFixed(1)}% win rate (threshold: 55%)`,
        data: { strategy: style, winRate: rate, threshold: 0.55 },
      });
    }
  }

  // Comeback rate
  const comebackWinRate = totalGames > 0 ? comebackGames / totalGames : 0;
  if (comebackWinRate < 0.10) {
    balanceFlags.push({
      type: 'no_comeback',
      severity: comebackWinRate < 0.05 ? 'critical' : 'warning',
      description: `Comeback win rate is ${(comebackWinRate * 100).toFixed(1)}% (threshold: ≥10%)`,
      data: { comebackWinRate, threshold: 0.10 },
    });
  }

  // Early leader dominance
  const earlyLeaderWinRate = earlyLeaderGames > 0 ? earlyLeaderWins / earlyLeaderGames : 0;
  if (earlyLeaderWinRate > 0.70) {
    balanceFlags.push({
      type: 'early_leader_dominance',
      severity: earlyLeaderWinRate > 0.85 ? 'critical' : 'warning',
      description: `Early leader wins ${(earlyLeaderWinRate * 100).toFixed(1)}% of games (threshold: ≤70%)`,
      data: { earlyLeaderWinRate, threshold: 0.70 },
    });
  }

  // Average match duration
  // Simulated: each round = PLANNING_TIME + REVEAL_TIME + RESOLUTION_TIME
  // Just use 70 seconds per round for the estimate
  const avgRounds = totalGames > 0 ? totalRoundsSum / totalGames : 0;
  const avgMatchDuration = avgRounds * 70; // Rough estimate in seconds (45+5+20)

  if (avgMatchDuration > 30 * 60) {
    balanceFlags.push({
      type: 'match_too_long',
      severity: 'critical',
      description: `Average match duration is ${(avgMatchDuration / 60).toFixed(1)} minutes (threshold: 30 min)`,
      data: { avgMatchDuration, threshold: 1800 },
    });
  }

  return {
    totalGames,
    winRates,
    winRatesByDifficulty,
    winRatesByCombo,
    avgMatchDuration,
    avgRounds,
    comebackWinRate,
    earlyLeaderWinRate,
    dominantStrategies,
    modeResults: {
      ffa: ffaResult,
      '2v2': tvResult,
    },
    balanceFlags,
    gameLogs: allLogs,
  };
}

/**
 * Analyze results for a single mode (FFA or 2v2).
 */
function analyzeModeResults(logs: GameLogEntry[]): ModeResult {
  if (logs.length === 0) {
    return { gamesPlayed: 0, winRates: {}, avgScore: 0, avgScoreSpread: 0 };
  }

  const styleWins: Record<string, number> = {};
  const styleGames: Record<string, number> = {};
  let totalScoreSum = 0;
  let totalSpreadSum = 0;

  for (const log of logs) {
    if (!log.isDraw && log.winnerId !== null) {
      const style = log.botStyles[log.winnerId];
      styleWins[style] = (styleWins[style] ?? 0) + 1;
    }
    for (let i = 0; i < 4; i++) {
      styleGames[log.botStyles[i]] = (styleGames[log.botStyles[i]] ?? 0) + 1;
      totalScoreSum += log.finalScores[i];
    }
    const sorted = [...log.finalScores].sort((a, b) => b - a);
    totalSpreadSum += sorted[0] - sorted[sorted.length - 1];
  }

  const winRates: Record<string, number> = {};
  for (const [style, wins] of Object.entries(styleWins)) {
    const total = styleGames[style] ?? 1;
    winRates[style] = wins / total;
  }

  return {
    gamesPlayed: logs.length,
    winRates,
    avgScore: totalScoreSum / (logs.length * 4),
    avgScoreSpread: totalSpreadSum / logs.length,
  };
}

// ─── Convenience Runner ─────────────────────────────────────────

/**
 * Run a standard set of balance simulations covering all bot styles
 * in both FFA and 2v2 modes.
 *
 * @param gamesPerConfig - Number of games per bot lineup (default: 100)
 * @returns Aggregated simulation results
 */
export function runStandardBalanceTest(gamesPerConfig: number = 100): SimulationResult {
  const styles: BotConfig['style'][] = [
    'aggressive', 'defensive', 'balanced', 'disruptive',
    'objective-focused', 'comeback-focused', 'team-support',
  ];

  const configs: SimulationConfig[] = [];

  // FFA: All same style (one config per style)
  for (const style of styles) {
    configs.push({
      mode: 'ffa',
      bots: [
        { difficulty: 'normal', style },
        { difficulty: 'normal', style },
        { difficulty: 'normal', style },
        { difficulty: 'normal', style },
      ],
      randomSeed: `balance-ffa-${style}`,
    });
  }

  // FFA: Mixed styles
  configs.push({
    mode: 'ffa',
    bots: [
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'balanced' },
      { difficulty: 'normal', style: 'disruptive' },
    ],
    randomSeed: 'balance-ffa-mixed',
  });

  // 2v2: Balanced teams
  configs.push({
    mode: '2v2',
    bots: [
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'team-support' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'objective-focused' },
    ],
    randomSeed: 'balance-2v2-mixed',
  });

  // 2v2: Same style teams
  configs.push({
    mode: '2v2',
    bots: [
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'aggressive' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'normal', style: 'defensive' },
    ],
    randomSeed: 'balance-2v2-same',
  });

  // Mixed difficulty (FFA)
  configs.push({
    mode: 'ffa',
    bots: [
      { difficulty: 'easy', style: 'balanced' },
      { difficulty: 'normal', style: 'balanced' },
      { difficulty: 'hard', style: 'balanced' },
      { difficulty: 'expert', style: 'balanced' },
    ],
    randomSeed: 'balance-diff-mixed',
  });

  // Comeback scenario: give one player a handicap by making them easy bot with low starting VP
  configs.push({
    mode: 'ffa',
    bots: [
      { difficulty: 'expert', style: 'aggressive' },
      { difficulty: 'hard', style: 'balanced' },
      { difficulty: 'normal', style: 'defensive' },
      { difficulty: 'easy', style: 'comeback-focused' },
    ],
    randomSeed: 'balance-comeback',
  });

  return runBalanceSimulation(configs, gamesPerConfig);
}
