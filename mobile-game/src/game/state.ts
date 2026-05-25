/**
 * Core Game Logic Engine — State Management
 *
 * State creation, queries, and serialization.
 */

import type {
  GameState,
  PlayerState,
  LaneState,
  LaneObjective,
  LaneIndex,
  PlayerId,
  GameConfig,
} from './types';

import {
  LANE_UNLOCK_SCHEDULE,
  VP_STANDARD_LANE,
  VP_HIGH_VALUE_LANE,
} from './constants';

// ─── Lane Objective Generation ─────────────────────────────────

/** Get the number of active lanes for a given round */
export function getActiveLaneCount(roundNumber: number): number {
  let count = LANE_UNLOCK_SCHEDULE[0][1];
  for (const [round, laneCount] of LANE_UNLOCK_SCHEDULE) {
    if (roundNumber >= round) {
      count = laneCount;
    }
  }
  return count;
}

/** Objectiev type pool for random selection */
const OBJECTIVE_POOL: {
  type: LaneObjective['type'];
  vpValue: number;
  bonusVp: number;
}[] = [
  { type: 'standard', vpValue: VP_STANDARD_LANE, bonusVp: 0 },
  { type: 'standard', vpValue: VP_STANDARD_LANE, bonusVp: 0 },
  { type: 'standard', vpValue: VP_STANDARD_LANE, bonusVp: 0 },
  { type: 'high-value', vpValue: VP_HIGH_VALUE_LANE, bonusVp: 0 },
  { type: 'high-value', vpValue: VP_HIGH_VALUE_LANE, bonusVp: 0 },
  { type: 'capture-flag', vpValue: VP_STANDARD_LANE, bonusVp: 2 },
  { type: 'king-of-hill', vpValue: VP_STANDARD_LANE, bonusVp: 1 },
  { type: 'bounty', vpValue: VP_STANDARD_LANE, bonusVp: 2 },
];

/** Description keys for each objective type */
const OBJECTIVE_DESC_KEYS: Record<string, string> = {
  'standard': 'objective.standard',
  'high-value': 'objective.high-value',
  'capture-flag': 'objective.capture-flag',
  'king-of-hill': 'objective.king-of-hill',
  'bounty': 'objective.bounty',
};

/**
 * Generate a lane objective for a given round and lane index.
 * Later rounds have higher probability of high-value and bonus objectives.
 */
export function getLaneObjectiveForRound(
  laneIndex: LaneIndex,
  roundNumber: number,
  randomFn?: () => number,
): LaneObjective {
  const rand = randomFn ?? Math.random;

  // Determine pool based on round
  let pool = OBJECTIVE_POOL;
  if (roundNumber >= 8) {
    // Late game: more high-value and bonus objectives
    pool = [
      ...OBJECTIVE_POOL,
      { type: 'high-value', vpValue: VP_HIGH_VALUE_LANE, bonusVp: 0 },
      { type: 'high-value', vpValue: VP_HIGH_VALUE_LANE, bonusVp: 0 },
      { type: 'capture-flag', vpValue: VP_STANDARD_LANE, bonusVp: 3 },
      { type: 'bounty', vpValue: VP_STANDARD_LANE, bonusVp: 3 },
    ];
  } else if (roundNumber >= 5) {
    // Mid game: slightly more variety
    pool = [
      ...OBJECTIVE_POOL,
      { type: 'high-value', vpValue: VP_HIGH_VALUE_LANE, bonusVp: 0 },
      { type: 'capture-flag', vpValue: VP_STANDARD_LANE, bonusVp: 2 },
    ];
  }

  const pick = pool[Math.floor(rand() * pool.length)];

  return {
    type: pick.type,
    vpValue: pick.vpValue,
    bonusVp: pick.bonusVp,
    descriptionKey: OBJECTIVE_DESC_KEYS[pick.type],
  };
}

// ─── State Queries ─────────────────────────────────────────────

/**
 * Get a player's current state.
 */
export function getPlayerState(game: GameState, playerId: PlayerId): PlayerState | undefined {
  return game.players[playerId];
}

/**
 * Get a lane's current state.
 */
export function getLaneState(game: GameState, laneIndex: LaneIndex): LaneState | undefined {
  return game.lanes[laneIndex];
}

/**
 * Check if the game is in a specific round phase.
 */
export function isInPhase(game: GameState, phase: string): boolean {
  return game.roundPhase === phase;
}

/**
 * Check if it's a specific player's turn to act (always true during planning for connected players).
 */
export function canPlayerAct(game: GameState, playerId: PlayerId): boolean {
  return (
    game.gamePhase === 'in-progress' &&
    game.roundPhase === 'planning' &&
    game.players[playerId]?.isConnected &&
    !game.players[playerId]?.hasSubmitted
  );
}

// ─── Serialization ─────────────────────────────────────────────

/**
 * Serialize game state to a plain JSON object.
 * Removes any non-serializable fields.
 */
export function serialize(game: GameState): string {
  // Create a deep copy that strips any runtime-only properties
  const state: any = JSON.parse(JSON.stringify(game));
  return JSON.stringify(state);
}

/**
 * Deserialize a JSON string back into GameState.
 * Note: Functions (like achievement conditions) are NOT serialized.
 * They must be re-attached by the module that owns them.
 */
export function deserialize(json: string): GameState {
  const state = JSON.parse(json) as GameState;
  // Ensure all required fields exist (safety)
  if (!state.players) throw new Error('Invalid game state: missing players');
  if (!state.lanes) throw new Error('Invalid game state: missing lanes');
  return state;
}

/**
 * Deep clone a game state (for safe mutation in testing).
 */
export function cloneGameState(game: GameState): GameState {
  return JSON.parse(JSON.stringify(game));
}
