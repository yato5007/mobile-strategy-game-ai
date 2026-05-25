/**
 * Multiplayer System — Type Definitions
 *
 * Types for the multiplayer adapter system.
 * Defines the MultiplayerAdapter interface, configuration types,
 * and supporting types for both mock and future real network adapters.
 *
 * @module multiplayer/types
 */

import type {
  GameConfig,
  GameState,
  GameEvent,
  PlayerId,
  SubmitAction,
} from '../game/types';

// ─── Identifiers ───────────────────────────────────────────────

/**
 * Unique session identifier for online multiplayer games.
 * Used by the future Supabase adapter to identify game sessions.
 */
export type SessionId = string;

// ─── Configuration ─────────────────────────────────────────────

/**
 * Function that generates a bot's submit action based on the current game state.
 *
 * The adapter calls this for each bot player slot at the start of every
 * planning phase. The provider examines the game state and returns a
 * SubmitAction containing the bot's card assignments.
 *
 * @param playerId - The bot player's ID (0-3).
 * @param gameState - The current game state (read-only; do not mutate).
 * @returns A SubmitAction for the bot player.
 */
export type BotDecisionProvider = (
  playerId: PlayerId,
  gameState: GameState,
) => SubmitAction;

/**
 * Configuration for initializing a multiplayer adapter.
 *
 * @property gameConfig - Game configuration passed to the engine's createGame().
 * @property botDecisionProvider - Optional. Custom bot decision logic.
 *   If omitted, a default random heuristic is used.
 */
export interface MultiplayerConfig {
  /** Game configuration (mode, player slots, max rounds, seed, etc.) */
  gameConfig: GameConfig;

  /**
   * Optional provider for bot decisions.
   * If not provided, a default random decision-maker is used.
   */
  botDecisionProvider?: BotDecisionProvider;
}

// ─── Event Subscriptions ───────────────────────────────────────

/**
 * Unsubscribe function returned by event subscription methods.
 * Call it to remove the handler from future notifications.
 */
export type UnsubscribeFn = () => void;

// ─── Adapter Interface ─────────────────────────────────────────

/**
 * MultiplayerAdapter interface.
 *
 * Abstract interface for multiplayer implementations.
 * All multiplayer modes (local mock, future online Supabase) implement this.
 *
 * The adapter owns the game engine instance and controls phase progression.
 * External code reads state via getGameState() and submits actions via submitAction().
 *
 * ## Implementations
 * - MockMultiplayerAdapter: Local same-device simulation (all 4 players local).
 * - SupabaseMultiplayerAdapter: Future real online multiplayer (each player on separate device).
 */
export interface MultiplayerAdapter {
  // ─── Lifecycle ─────────────────────────────────────

  /**
   * Initialize the adapter with the given configuration.
   * Creates the game engine instance, sets up initial state, starts the first
   * planning phase, and triggers bot decisions for bot player slots.
   *
   * If the adapter was previously initialized, it is destroyed first.
   *
   * @param config - Multiplayer configuration including game config and bot provider.
   */
  initialize(config: MultiplayerConfig): void;

  /**
   * Destroy the adapter and release all resources.
   * Clears timers, unsubscribes from engine events, clears external handlers,
   * and resets internal state. Safe to call multiple times.
   */
  destroy(): void;

  // ─── Player Actions ────────────────────────────────

  /**
   * Submit a player action (card assignments for the current planning phase).
   *
   * For human players: called by the UI layer when the player confirms their
   * card assignments. For bot players: called internally by the adapter via
   * the BotDecisionProvider.
   *
   * The action is validated by the game engine. Returns true if accepted,
   * false if invalid (wrong phase, missing cards, etc.).
   *
   * When all connected players have submitted, the adapter automatically
   * advances the game through reveal → resolution → cleanup phases.
   *
   * @param action - The submit action containing player ID and card assignments.
   * @returns true if the action was accepted and processed; false if invalid.
   */
  submitAction(action: SubmitAction): boolean;

  // ─── State Queries ─────────────────────────────────

  /**
   * Get a deep-cloned snapshot of the current game state.
   * The returned object is safe to mutate (e.g., for rendering derivations).
   *
   * @returns A deep clone of the current GameState.
   */
  getGameState(): GameState;

  /**
   * Get the list of currently connected player IDs.
   * Only connected players affect phase progression (isPlanningComplete).
   *
   * @returns Array of player IDs (0-3) that are currently connected.
   */
  getConnectedPlayers(): PlayerId[];

  // ─── Connection Management (Mock Only) ─────────────

  /**
   * Simulate a player connecting to the game.
   * Sets the player's isConnected flag to true and notifies onPlayerJoined handlers.
   * No effect if the player is already connected or the adapter is uninitialized.
   *
   * @param playerId - The player ID to connect.
   */
  connectPlayer(playerId: PlayerId): void;

  /**
   * Simulate a player disconnecting from the game.
   * Sets the player's isConnected flag to false and notifies onPlayerLeft handlers.
   * If the player had not submitted in the current planning phase, the phase
   * may still advance once all remaining connected players have submitted
   * (or the timeout fires).
   *
   * No effect if the player is already disconnected or the adapter is uninitialized.
   *
   * @param playerId - The player ID to disconnect.
   */
  disconnectPlayer(playerId: PlayerId): void;

  // ─── Status ────────────────────────────────────────

  /**
   * Check whether the adapter has been initialized and is active.
   *
   * @returns true if the adapter is initialized and has a valid game state.
   */
  isInitialized(): boolean;

  // ─── Event Subscriptions ───────────────────────────

  /**
   * Subscribe to game state update notifications.
   * The handler is called after every meaningful state change:
   * phase transitions, player submissions, connection changes, timeouts, etc.
   *
   * @param handler - Callback receiving a deep-cloned GameState snapshot.
   * @returns Unsubscribe function to remove the handler.
   */
  onStateUpdate(handler: (state: GameState) => void): UnsubscribeFn;

  /**
   * Subscribe to all game events emitted by the engine.
   * Events include: GameStarted, RoundStarted, PlanningPhase, PlayerSubmitted,
   * RevealPhase, ResolutionPhase, LaneResolved, VPAwarded, RoundComplete,
   * AchievementUnlocked, ComebackBonus, GameOver, PlayerPenalized, SpyInfo.
   *
   * @param handler - Callback receiving each GameEvent as it occurs.
   * @returns Unsubscribe function to remove the handler.
   */
  onEvent(handler: (event: GameEvent) => void): UnsubscribeFn;

  /**
   * Subscribe to player join events (triggered by connectPlayer).
   *
   * @param handler - Callback receiving the player ID that joined.
   * @returns Unsubscribe function to remove the handler.
   */
  onPlayerJoined(handler: (playerId: PlayerId) => void): UnsubscribeFn;

  /**
   * Subscribe to player leave events (triggered by disconnectPlayer).
   *
   * @param handler - Callback receiving the player ID that left.
   * @returns Unsubscribe function to remove the handler.
   */
  onPlayerLeft(handler: (playerId: PlayerId) => void): UnsubscribeFn;
}

// ─── Serialization Types ───────────────────────────────────────

/**
 * Serialized game state as a JSON string.
 * Guaranteed to be JSON.stringify/JSON.parse round-trippable.
 */
export type SerializedGameState = string;

// ─── Type Guards ───────────────────────────────────────────────

/**
 * Type guard: checks whether a value is a valid SubmitAction.
 *
 * @param value - The value to check.
 * @returns true if the value is a valid SubmitAction.
 */
export function isSubmitAction(value: unknown): value is SubmitAction {
  if (!value || typeof value !== 'object') return false;
  const action = value as Record<string, unknown>;
  return (
    action.type === 'submit_assignments' &&
    typeof action.playerId === 'number' &&
    Array.isArray(action.assignments)
  );
}
