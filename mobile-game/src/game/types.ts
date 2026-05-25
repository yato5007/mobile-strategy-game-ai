/**
 * Core Game Logic Engine — Type Definitions
 *
 * All types are plain objects / primitives for JSON serializability.
 * No classes or functions in state types.
 */

// ─── Identifiers ───────────────────────────────────────────────

/** Player ID (0-3) */
export type PlayerId = number;

/** Team ID for 2v2 mode: 0 = players {0,1}, 1 = players {2,3} */
export type TeamId = 0 | 1;

/** Unique card identifier (string for readability) */
export type CardId = string;

/** Achievement identifier */
export type AchievementId = string;

/** Lane index (0-based) */
export type LaneIndex = number;

// ─── Enums / Unions ────────────────────────────────────────────

/** Game mode */
export type GameMode = 'ffa' | '2v2';

/** Card type categories */
export type CardType = 'unit' | 'tactic' | 'objective' | 'comeback';

/** Tactic effect type identifiers */
export type TacticEffectType =
  | 'bluff'
  | 'sabotage'
  | 'reinforce'
  | 'spy'
  | 'shield'
  | 'retreat'
  | 'ambush';

/** Phases within a single round */
export type RoundPhase = 'planning' | 'reveal' | 'resolution' | 'cleanup';

/** Overall game phase */
export type GamePhase = 'waiting-for-players' | 'in-progress' | 'completed';

/** Lane objective type — determines bonus conditions */
export type LaneObjectiveType =
  | 'standard'       // Normal lane, no special bonus
  | 'high-value'     // 3 VP instead of 2
  | 'capture-flag'   // Requires an Objective card to claim bonus
  | 'king-of-hill'   // Winner gets +1 bonus VP next round if they defend
  | 'bounty';        // Bonus VP for whoever wins with highest strength difference

// ─── Card Types ────────────────────────────────────────────────

/** Parameters for a tactic effect */
export interface TacticEffect {
  effectType: TacticEffectType;
  /** Target player ID (for sabotage, spy). null = auto-select (highest opponent). */
  targetPlayerId?: PlayerId | null;
  /** Target lane index (null = same lane the card is played on). */
  targetLaneIndex?: LaneIndex | null;
  /** Magnitude (e.g., sabotage = 2, reinforce = 3). */
  magnitude?: number;
}

/** A game card */
export interface Card {
  id: CardId;
  type: CardType;
  /** Name localization key */
  nameKey: string;
  /** Strength value used in lane resolution */
  strength: number;
  /** Tactic effect (null for non-tactic cards) */
  tacticEffect: TacticEffect | null;
  /** Description localization key */
  descriptionKey: string;
  /** Whether this card is a comeback card */
  isComeback: boolean;
}

// ─── Lane Types ────────────────────────────────────────────────

/** Round objective for a lane */
export interface LaneObjective {
  type: LaneObjectiveType;
  /** Base VP value for winning this lane */
  vpValue: number;
  /** Bonus VP for meeting the objective condition */
  bonusVp: number;
  /** Localization key for objective description */
  descriptionKey: string;
}

/** State of a lane at a given point */
export interface LaneState {
  index: LaneIndex;
  isActive: boolean;
  objective: LaneObjective;
  /** Total strength contributed by each player (calculated during resolution) */
  totalStrengthPerPlayer: Record<PlayerId, number>;
  /** Winner after resolution (null if no clear winner or tie) */
  winner: PlayerId | null;
  /** Whether this lane ended in a tie */
  isTie: boolean;
  /** VP awarded to each player from this lane resolution */
  vpAwarded: Record<PlayerId, number>;
  /** Cards assigned to this lane this round (per player) */
  assignments: Record<PlayerId, Card[]>;
  /** Number of consecutive rounds the same player has won this lane */
  streak: number;
  /** Set of player IDs who have played a Shield tactic card on this lane (resolution temp) */
  shieldedPlayers: PlayerId[];
}

// ─── Player State ──────────────────────────────────────────────

/** A single card assignment during planning */
export interface CardAssignment {
  cardId: CardId;
  laneIndex: LaneIndex;
}

/** Persistent state for a single player */
export interface PlayerState {
  id: PlayerId;
  /** Player's team (0 or 1; in FFA, all have unique team IDs if needed) */
  teamId: TeamId;
  /** Current hand of cards */
  hand: Card[];
  /** Discard pile */
  discardPile: Card[];
  /** Deck (remaining cards to draw) */
  deck: Card[];
  /** Total victory points */
  vpTotal: number;
  /** Accumulated lane wins (for tie-breaker) */
  laneWins: number;
  /** Round in which they first scored VP (for tie-breaker) */
  firstScoreRound: number | null;
  /** Cards assigned for current round (during planning) */
  currentAssignments: CardAssignment[];
  /** Whether they have finalized their submission */
  hasSubmitted: boolean;
  /** Whether the player is connected */
  isConnected: boolean;
  /** Whether the player is a bot (for engine bookkeeping) */
  isBot: boolean;
  /** Achievements earned this match */
  earnedAchievements: AchievementId[];
}

// ─── Game State ────────────────────────────────────────────────

/** Configuration to start a new game */
export interface GameConfig {
  mode: GameMode;
  /** Array of 4 booleans indicating which slots are bots */
  playerSlots: [boolean, boolean, boolean, boolean];
  /** Total rounds (default: 12) */
  maxRounds?: number;
  /** Seed for deterministic random (testing) */
  randomSeed?: string;
}

/** The complete game state — plain object, JSON-serializable */
export interface GameState {
  /** Unique game identifier */
  gameId: string;
  mode: GameMode;
  maxRounds: number;
  currentRound: number;
  gamePhase: GamePhase;
  roundPhase: RoundPhase;
  players: [PlayerState, PlayerState, PlayerState, PlayerState];
  lanes: LaneState[];
  /** Which achievements have been awarded this match (global set) */
  awardedAchievements: AchievementId[];
  /** First blood flag */
  firstBloodAwarded: boolean;
  /** Accumulated rounds completed */
  roundsCompleted: number;
  /** Random state for deterministic play (optional) */
  _rngState?: number;
  /** Timestamps for phase transitions (for timing) */
  phaseTimestamps: {
    planningStartedAt?: number;
    revealStartedAt?: number;
    resolveStartedAt?: number;
    cleanupStartedAt?: number;
  };
}

// ─── Result Types ──────────────────────────────────────────────

/** Standing of a player in the current scoreboard */
export interface Standing {
  playerId: PlayerId;
  teamId: TeamId;
  vpTotal: number;
  laneWins: number;
  firstScoreRound: number | null;
  rank: number;
}

/** Final game result */
export interface GameResult {
  winnerId: PlayerId | null;       // null = draw
  winningTeamId: TeamId | null;    // null = draw or FFA
  isDraw: boolean;
  finalStandings: Standing[];
  totalRoundsPlayed: number;
}

// ─── Event Types ───────────────────────────────────────────────

/** All possible game events (discriminated union) */
export type GameEvent =
  | { type: 'GameStarted'; payload: { gameId: string; mode: GameMode; players: PlayerId[] } }
  | { type: 'RoundStarted'; payload: { roundNumber: number; phase: RoundPhase } }
  | { type: 'PlanningPhase'; payload: { roundNumber: number; deadline: number } }
  | { type: 'PlayerSubmitted'; payload: { playerId: PlayerId; assignmentCount: number } }
  | { type: 'RevealPhase'; payload: { roundNumber: number; assignments: Record<PlayerId, CardAssignment[]> } }
  | { type: 'ResolutionPhase'; payload: { roundNumber: number } }
  | { type: 'LaneResolved'; payload: { laneIndex: LaneIndex; winner: PlayerId | null; isTie: boolean; vpAwarded: Record<PlayerId, number>; strengths: Record<PlayerId, number> } }
  | { type: 'VPAwarded'; payload: { playerId: PlayerId; vpAmount: number; source: string; laneIndex?: LaneIndex } }
  | { type: 'RoundComplete'; payload: { roundNumber: number; scores: Record<PlayerId, number> } }
  | { type: 'AchievementUnlocked'; payload: { playerId: PlayerId; achievementId: AchievementId; vpReward: number } }
  | { type: 'ComebackBonus'; payload: { playerId: PlayerId; extraCards: Card[] } }
  | { type: 'GameOver'; payload: { winner: PlayerId | null; winningTeamId: TeamId | null; finalScores: Record<PlayerId, number> } }
  | { type: 'PlayerPenalized'; payload: { playerId: PlayerId; reason: string; vpLoss: number } }
  | { type: 'SpyInfo'; payload: { playerId: PlayerId; targetPlayerId: PlayerId; revealedCards: Card[] } }
  | { type: 'Error'; payload: { message: string; code: string } };

/** Event handler type */
export type GameEventHandler = (event: GameEvent) => void;

/** Event subscription interface */
export interface GameEventEmitter {
  subscribe: (eventType: GameEvent['type'], handler: GameEventHandler) => () => void;
  emit: (event: GameEvent) => void;
  clear: () => void;
}

// ─── Achievement Types ─────────────────────────────────────────

export interface AchievementDefinition {
  id: AchievementId;
  nameKey: string;
  descriptionKey: string;
  vpReward: number;
  maxTriggers: number;  // 1 for most achievements
  allowedModes: GameMode[];
  /** Condition function: returns true if achievement should be awarded */
  condition: (state: GameState, playerId: PlayerId) => boolean;
}

// ─── Validation Result ─────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Player action — submitting card assignments for a round */
export interface SubmitAction {
  type: 'submit_assignments';
  playerId: PlayerId;
  assignments: CardAssignment[];
}
