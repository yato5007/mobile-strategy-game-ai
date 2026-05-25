/**
 * Core Game Logic Engine — Public API
 *
 * Barrel export for the game logic engine.
 * All external consumers (UI, Bots, Multiplayer) should import from here.
 */

// ─── Types ─────────────────────────────────────────────────────

export type {
  PlayerId,
  TeamId,
  CardId,
  AchievementId,
  LaneIndex,
  GameMode,
  CardType,
  TacticEffectType,
  RoundPhase,
  GamePhase,
  LaneObjectiveType,
  Card,
  TacticEffect,
  LaneObjective,
  LaneState,
  CardAssignment,
  PlayerState,
  GameState,
  GameConfig,
  Standing,
  GameResult,
  GameEvent,
  GameEventHandler,
  GameEventEmitter,
  AchievementDefinition,
  ValidationResult,
  SubmitAction,
} from './types';

// ─── Constants ─────────────────────────────────────────────────

export {
  MAX_ROUNDS,
  LANE_COUNT_BASE,
  LANE_COUNT_MAX,
  LANE_UNLOCK_SCHEDULE,
  PLANNING_TIME,
  REVEAL_TIME,
  RESOLUTION_TIME,
  STARTING_HAND_SIZE,
  DRAW_PER_ROUND,
  MAX_CARDS_PER_LANE,
  VP_STANDARD_LANE,
  VP_HIGH_VALUE_LANE,
  PENALTY_SKIP_VP,
  COMEBACK_EXTRA_DRAW,
  COMEBACK_START_ROUND,
  ACHIEVEMENT_VP,
  TACTIC_RESOLUTION_ORDER,
  STAPLE_UNITS,
  STAPLE_TACTICS,
  ROTATING_CARD_POOL,
  COMEBACK_CARDS,
} from './constants';

// ─── Cards ─────────────────────────────────────────────────────

export {
  createDeck,
  shuffleDeck,
  drawCards,
  discardCards,
  drawStartingHand,
  drawTurnCards,
  drawComebackCard,
  drawComebackDraw,
  resetCardIdCounter,
  pickRandomRotatingCards,
} from './cards';

// ─── Engine ────────────────────────────────────────────────────

export {
  createGame,
  validateAssignment,
  submitAssignments,
  isPlanningComplete,
  forceSubmitRemaining,
  revealAssignments,
  resolveRound,
  processCleanup,
  getStandings,
  isGameOver,
  getGameResult,
} from './engine';

// ─── State ─────────────────────────────────────────────────────

export {
  getActiveLaneCount,
  getLaneObjectiveForRound,
  getPlayerState,
  getLaneState,
  isInPhase,
  canPlayerAct,
  serialize,
  deserialize,
  cloneGameState,
} from './state';

// ─── Events ────────────────────────────────────────────────────

export {
  createEventEmitter,
} from './events';

// ─── Achievements ──────────────────────────────────────────────

export {
  ACHIEVEMENTS,
  checkAchievements,
} from './achievements';
