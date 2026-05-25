/**
 * Mock Multiplayer Adapter
 *
 * Local same-device simulation of 4-player multiplayer.
 * All players run on the same device with a shared game engine instance.
 * Human players submit actions via the UI → submitAction().
 * Bot players submit automatically via BotDecisionProvider.
 *
 * ## Responsibilities
 * - Create and manage the shared GameState + GameEventEmitter.
 * - Track connected players and manage connection simulation.
 * - Control the game lifecycle: Planning → Reveal → Resolution → Cleanup.
 * - Collect all player submissions and advance phases when complete.
 * - Enforce the planning phase timeout (PLANNING_TIME seconds).
 * - Handle player disconnection (skip penalty, still advance).
 * - Emit state snapshots and events for UI rendering.
 *
 * ## Phase Flow
 * ```
 * PlanningPhase ──→ RevealPhase ──→ ResolutionPhase ──→ CleanupPhase
 *      ↑                                                      │
 *      └────────────────── (repeat) ──────────────────────────┘
 *      ↓
 *   GameOver (after maxRounds)
 * ```
 *
 * ## Usage
 * ```typescript
 * const adapter = new MockMultiplayerAdapter();
 * adapter.initialize({ gameConfig: { mode: 'ffa', playerSlots: [false, true, true, true] } });
 * adapter.submitAction({ type: 'submit_assignments', playerId: 0, assignments: [...] });
 * const state = adapter.getGameState();
 * adapter.onStateUpdate((s) => console.log('State updated', s));
 * adapter.destroy();
 * ```
 *
 * @module multiplayer/mockMultiplayerAdapter
 */

import type {
  GameState,
  GameEvent,
  GameEventEmitter,
  PlayerId,
  SubmitAction,
  CardAssignment,
} from '../game/types';

import {
  createGame,
  submitAssignments as engineSubmitAssignments,
  isPlanningComplete,
  forceSubmitRemaining,
  revealAssignments,
  resolveRound,
  processCleanup,
  cloneGameState,
  PLANNING_TIME,
} from '../game';

import type {
  MultiplayerAdapter,
  MultiplayerConfig,
  BotDecisionProvider,
  UnsubscribeFn,
} from './types';

// ─── Constants ─────────────────────────────────────────────────

/**
 * All game event types emitted by the engine.
 * Used to subscribe to every possible engine event for forwarding.
 */
const ALL_ENGINE_EVENT_TYPES: GameEvent['type'][] = [
  'GameStarted',
  'RoundStarted',
  'PlanningPhase',
  'PlayerSubmitted',
  'RevealPhase',
  'ResolutionPhase',
  'LaneResolved',
  'VPAwarded',
  'RoundComplete',
  'AchievementUnlocked',
  'ComebackBonus',
  'GameOver',
  'PlayerPenalized',
  'SpyInfo',
  'Error',
];

// ─── Default Bot Strategy ──────────────────────────────────────

/**
 * Default bot decision provider.
 *
 * Uses a simple random heuristic: plays 1-2 random cards on random active lanes.
 * This is a placeholder until the full BotController system is implemented.
 * The strategy ensures the bot is always active (never skips voluntarily).
 *
 * @param playerId - The bot player ID.
 * @param game - The current game state.
 * @returns A SubmitAction with random card assignments.
 */
function defaultBotDecisionProvider(
  playerId: PlayerId,
  game: GameState,
): SubmitAction {
  const player = game.players[playerId];
  if (!player) {
    return { type: 'submit_assignments', playerId, assignments: [] };
  }

  const activeLanes = game.lanes.filter((l) => l.isActive);
  if (activeLanes.length === 0 || player.hand.length === 0) {
    return { type: 'submit_assignments', playerId, assignments: [] };
  }

  // Play 1-2 random cards on random lanes
  const assignments: CardAssignment[] = [];
  const cardsToPlay = Math.min(
    player.hand.length,
    Math.floor(Math.random() * 2) + 1, // 1 or 2 cards
  );

  for (let i = 0; i < cardsToPlay; i++) {
    const lane = activeLanes[Math.floor(Math.random() * activeLanes.length)];
    assignments.push({
      cardId: player.hand[i].id,
      laneIndex: lane.index,
    });
  }

  return { type: 'submit_assignments', playerId, assignments };
}

// ─── Adapter Class ─────────────────────────────────────────────

/**
 * MockMultiplayerAdapter — local same-device multiplayer simulation.
 *
 * Implements the MultiplayerAdapter interface for local testing and development.
 * All 4 players share a single GameState in memory. Bot players make decisions
 * via the BotDecisionProvider. Phase progression is automatic when all connected
 * players have submitted or the planning timeout expires.
 *
 * ## Lifecycle
 * 1. Construct the adapter.
 * 2. Call initialize(config) to create the game and start the first planning phase.
 * 3. Call submitAction() for human player submissions.
 * 4. Call destroy() when done to release resources.
 *
 * ## Thread Safety
 * All methods are synchronous. The mock adapter runs entirely in a single
 * event-loop tick. Phase transitions are atomic from the caller's perspective.
 */
export class MockMultiplayerAdapter implements MultiplayerAdapter {
  /** The current game state (mutated in-place by engine functions). */
  private game: GameState | null = null;

  /** The engine's event emitter for this game session. */
  private events: GameEventEmitter | null = null;

  /** Stored configuration (used during lifecycle). */
  private config: MultiplayerConfig | null = null;

  /** The bot decision provider (custom or default). */
  private botDecisionProvider: BotDecisionProvider | null = null;

  /** Whether the adapter has been fully initialized. */
  private initialized = false;

  /** Active planning phase timeout ID (null if no timer running). */
  private planningTimerId: ReturnType<typeof setTimeout> | null = null;

  // ─── Subscription Sets ──────────────────────────────

  /** External state update handlers (called on every meaningful change). */
  private readonly stateHandlers = new Set<(state: GameState) => void>();

  /** External game event handlers (called for every engine event). */
  private readonly eventHandlers = new Set<(event: GameEvent) => void>();

  /** External player-joined handlers. */
  private readonly joinedHandlers = new Set<(playerId: PlayerId) => void>();

  /** External player-left handlers. */
  private readonly leftHandlers = new Set<(playerId: PlayerId) => void>();

  /** Unsubscribe functions for engine event subscriptions. */
  private engineUnsubscribers: (() => void)[] = [];

  // ─── Lifecycle ─────────────────────────────────────

  /**
   * Initialize the adapter with the given configuration.
   *
   * Creates the game engine instance, subscribes to engine events,
   * starts the first planning phase, triggers bot decisions for
   * bot player slots, and notifies state/event handlers.
   *
   * If already initialized, the previous session is destroyed first.
   *
   * @param config - Multiplayer configuration.
   */
  initialize(config: MultiplayerConfig): void {
    // Clean up any previous session
    if (this.initialized) {
      this.destroy();
    }

    this.config = config;
    this.botDecisionProvider =
      config.botDecisionProvider ?? defaultBotDecisionProvider;

    // Create the game engine instance (emits initial events synchronously)
    const { game, events } = createGame(config.gameConfig);
    this.game = game;
    this.events = events;

    // Subscribe to engine events for forwarding and internal handling
    this.engineUnsubscribers = this.subscribeToEngineEvents();

    // Notify external handlers that all players start connected
    for (const player of game.players) {
      if (player.isConnected) {
        for (const handler of this.joinedHandlers) {
          handler(player.id);
        }
      }
    }

    // Replay initial engine events (GameStarted, RoundStarted, PlanningPhase)
    // that were emitted inside createGame() before we subscribed.
    this.replayInitialEvents();

    // Manually handle the initial planning phase (reset sync, start timer,
    // trigger bot decisions).
    this.onEnterPlanningPhase(game.currentRound);

    this.initialized = true;

    // Notify external handlers of initial state
    this.notifyStateHandlers();
  }

  /**
   * Destroy the adapter and release all resources.
   *
   * Clears the planning timer, unsubscribes from engine events,
   * clears all external handler sets, and resets internal state.
   * Safe to call multiple times.
   */
  destroy(): void {
    this.clearPlanningTimer();

    // Unsubscribe from engine events
    for (const unsub of this.engineUnsubscribers) {
      unsub();
    }
    this.engineUnsubscribers = [];

    // Clear engine event emitter
    if (this.events) {
      this.events.clear();
    }

    // Reset state
    this.game = null;
    this.events = null;
    this.config = null;
    this.botDecisionProvider = null;
    this.initialized = false;

    // Clear external handlers
    this.stateHandlers.clear();
    this.eventHandlers.clear();
    this.joinedHandlers.clear();
    this.leftHandlers.clear();
  }

  // ─── Player Actions ────────────────────────────────

  /**
   * Submit a player action (card assignments for current planning phase).
   *
   * Validates and processes the submission through the game engine.
   * If accepted, checks whether all connected players have submitted and,
   * if so, advances the game through reveal → resolution → cleanup phases.
   *
   * @param action - The submit action to process.
   * @returns true if the action was accepted; false if invalid.
   */
  submitAction(action: SubmitAction): boolean {
    if (!this.game || !this.events) {
      return false;
    }

    const result = engineSubmitAssignments(
      this.game,
      action.playerId,
      action.assignments,
      this.events,
    );

    if (result.valid) {
      // Notify external handlers of updated state
      this.notifyStateHandlers();

      // Check if all connected players have submitted → advance phase
      this.checkAndAdvancePhase();
    }

    return result.valid;
  }

  // ─── State Queries ─────────────────────────────────

  /**
   * Get a deep-cloned snapshot of the current game state.
   *
   * The returned object is safe to mutate. Each call produces a fresh clone.
   *
   * @returns Deep-cloned GameState, or throws if not initialized.
   * @throws {Error} If the adapter is not initialized.
   */
  getGameState(): GameState {
    if (!this.game) {
      throw new Error(
        'MockMultiplayerAdapter is not initialized. Call initialize() first.',
      );
    }
    return cloneGameState(this.game);
  }

  /**
   * Get the list of currently connected player IDs.
   *
   * @returns Array of player IDs (0-3) with isConnected === true.
   */
  getConnectedPlayers(): PlayerId[] {
    if (!this.game) return [];
    return this.game.players
      .filter((p) => p.isConnected)
      .map((p) => p.id);
  }

  // ─── Connection Management ─────────────────────────

  /**
   * Simulate a player connecting to the game.
   *
   * @param playerId - The player ID to connect (0-3).
   */
  connectPlayer(playerId: PlayerId): void {
    if (!this.game) return;

    const player = this.game.players[playerId];
    if (!player || player.isConnected) return;

    player.isConnected = true;

    // Notify external handlers
    for (const handler of this.joinedHandlers) {
      handler(playerId);
    }

    this.notifyStateHandlers();
  }

  /**
   * Simulate a player disconnecting from the game.
   *
   * Sets isConnected to false. If the disconnected player had not submitted
   * in the current planning phase, the phase can still advance once all
   * remaining connected players have submitted (or the timeout fires).
   *
   * @param playerId - The player ID to disconnect (0-3).
   */
  disconnectPlayer(playerId: PlayerId): void {
    if (!this.game) return;

    const player = this.game.players[playerId];
    if (!player || !player.isConnected) return;

    player.isConnected = false;

    // Notify external handlers
    for (const handler of this.leftHandlers) {
      handler(playerId);
    }

    this.notifyStateHandlers();

    // Check if planning is now complete without this player
    if (isPlanningComplete(this.game)) {
      this.clearPlanningTimer();
      this.advanceToNextPhase();
    }
  }

  // ─── Status ────────────────────────────────────────

  /**
   * Check whether the adapter has been initialized.
   *
   * @returns true if initialize() has been called and destroy() has not.
   */
  isInitialized(): boolean {
    return this.initialized && this.game !== null && this.events !== null;
  }

  // ─── Event Subscriptions ───────────────────────────

  /**
   * Subscribe to game state updates.
   *
   * @param handler - Receives a deep-cloned GameState snapshot.
   * @returns Unsubscribe function.
   */
  onStateUpdate(handler: (state: GameState) => void): UnsubscribeFn {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to all game events.
   *
   * @param handler - Receives each GameEvent as it occurs.
   * @returns Unsubscribe function.
   */
  onEvent(handler: (event: GameEvent) => void): UnsubscribeFn {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to player join events.
   *
   * @param handler - Receives the player ID that joined.
   * @returns Unsubscribe function.
   */
  onPlayerJoined(handler: (playerId: PlayerId) => void): UnsubscribeFn {
    this.joinedHandlers.add(handler);
    return () => {
      this.joinedHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to player leave events.
   *
   * @param handler - Receives the player ID that left.
   * @returns Unsubscribe function.
   */
  onPlayerLeft(handler: (playerId: PlayerId) => void): UnsubscribeFn {
    this.leftHandlers.add(handler);
    return () => {
      this.leftHandlers.delete(handler);
    };
  }

  // ─── Private: Engine Event Subscriptions ───────────

  /**
   * Subscribe to all engine event types.
   *
   * Each engine event is forwarded to external event handlers.
   * Certain events (PlanningPhase, GameOver) trigger internal state management.
   *
   * @returns Array of unsubscribe functions.
   */
  private subscribeToEngineEvents(): (() => void)[] {
    if (!this.events) return [];

    const unsubs: (() => void)[] = [];

    for (const type of ALL_ENGINE_EVENT_TYPES) {
      const unsub = this.events.subscribe(type, (event: GameEvent) => {
        // Forward to all external event handlers
        this.forwardEvent(event);

        // Handle internal state transitions
        this.handleEngineEvent(event);
      });
      unsubs.push(unsub);
    }

    return unsubs;
  }

  /**
   * Handle an engine event for internal state management.
   *
   * @param event - The engine event to process.
   */
  private handleEngineEvent(event: GameEvent): void {
    switch (event.type) {
      case 'PlanningPhase': {
        // A new planning phase has started (from engine's processCleanup).
        // Reset sync state, start timer, trigger bot decisions.
        this.onEnterPlanningPhase(event.payload.roundNumber);
        break;
      }
      case 'GameOver': {
        // Game has ended. Notify state handlers one final time.
        this.notifyStateHandlers();
        break;
      }
      default: {
        // Other events don't need special internal handling.
        break;
      }
    }
  }

  // ─── Private: Phase Management ─────────────────────

  /**
   * Called when a planning phase begins (initial or new round).
   *
   * Resets submission tracking, starts the planning timer,
   * and triggers bot decisions for bot player slots.
   *
   * @param _roundNumber - The current round number (unused but informative).
   */
  private onEnterPlanningPhase(_roundNumber: number): void {
    // Start the planning phase timer
    this.startPlanningTimer();

    // Trigger bot decisions for bot player slots
    this.triggerBotDecisions();
  }

  /**
   * Trigger bot decisions for all bot player slots.
   *
   * For each bot player that is connected and hasn't submitted yet,
   * generate a SubmitAction via the BotDecisionProvider and submit it.
   */
  private triggerBotDecisions(): void {
    if (!this.game || !this.botDecisionProvider) return;

    for (const player of this.game.players) {
      if (player.isBot && player.isConnected && !player.hasSubmitted) {
        const decision = this.botDecisionProvider(player.id, this.game);
        // Submit via the internal path (avoids public method overhead)
        const result = engineSubmitAssignments(
          this.game,
          decision.playerId,
          decision.assignments,
          this.events!,
        );
        if (result.valid) {
          this.notifyStateHandlers();
        }
      }
    }

    // [FIX C1] After triggering all bot decisions, check if the phase
    // can advance. Without this, all-bot games stall for the full
    // PLANNING_TIME timeout before advancing.
    this.checkAndAdvancePhase();
  }

  /**
   * Check whether all connected players have submitted and, if so,
   * advance the game to the next phase.
   */
  private checkAndAdvancePhase(): void {
    if (!this.game) return;

    if (isPlanningComplete(this.game)) {
      this.clearPlanningTimer();
      this.advanceToNextPhase();
    }
  }

  /**
   * Advance the game through the full round lifecycle:
   * Planning → Reveal → Resolution → Cleanup.
   *
   * State handlers are notified after each phase transition so the UI
   * can render intermediate states (reveal, resolution results, etc.).
   */
  private advanceToNextPhase(): void {
    if (!this.game || !this.events) return;

    const currentPhase = this.game.roundPhase;

    if (currentPhase === 'planning') {
      // ── Planning → Reveal ───────────────────────────
      revealAssignments(this.game, this.events);
      this.notifyStateHandlers();

      // ── Reveal → Resolution ─────────────────────────
      resolveRound(this.game, this.events);
      this.notifyStateHandlers();

      // ── Resolution → Cleanup ────────────────────────
      processCleanup(this.game, this.events);
      this.notifyStateHandlers();

      // If the game ended during cleanup, state is already updated.
      // If the game continues, processCleanup emits PlanningPhase via
      // the engine events, which triggers onEnterPlanningPhase internally.
    }
    // If not in planning phase (should not happen), do nothing.
  }

  // ─── Private: Timer Management ─────────────────────

  /**
   * Start the planning phase timeout timer.
   *
   * After PLANNING_TIME seconds, force-submit any remaining players
   * and advance the game. Clears any existing timer first.
   */
  private startPlanningTimer(): void {
    this.clearPlanningTimer();

    this.planningTimerId = setTimeout(() => {
      this.handlePlanningTimeout();
    }, PLANNING_TIME * 1000); // Convert PLANNING_TIME (seconds) to ms
  }

  /**
   * Handle the planning phase timeout.
   *
   * Force-submits empty assignments for all connected players who have not
   * yet submitted. The game engine applies the skip penalty (-1 VP) for
   * players who submitted 0 cards during the resolution phase.
   *
   * After force-submitting, checks if the phase is now complete and advances.
   */
  private handlePlanningTimeout(): void {
    if (!this.game || !this.events) return;

    // [FIX C2] Guard against stale timeout callbacks that fire after the
    // phase has already advanced. This prevents the race condition where
    // a queued setTimeout callback calls forceSubmitRemaining() and
    // advanceToNextPhase() on a game that has already moved to a new round.
    if (this.game.roundPhase !== 'planning') {
      this.planningTimerId = null;
      return;
    }

    this.planningTimerId = null; // Timer already fired

    // Force-submit remaining connected players (engine applies skip penalties)
    forceSubmitRemaining(this.game);

    this.notifyStateHandlers();

    // Advance if all connected players have now submitted
    if (isPlanningComplete(this.game)) {
      this.advanceToNextPhase();
    }
  }

  /**
   * Clear the planning phase timer if it is active.
   * Safe to call even if no timer is running.
   */
  private clearPlanningTimer(): void {
    if (this.planningTimerId !== null) {
      clearTimeout(this.planningTimerId);
      this.planningTimerId = null;
    }
  }

  // ─── Private: Event Forwarding ─────────────────────

  /**
   * Forward a game event to all external event handlers.
   *
   * @param event - The game event to forward.
   */
  private forwardEvent(event: GameEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error(
          `[MockMultiplayerAdapter] Error in event handler for ${event.type}:`,
          err,
        );
      }
    }
  }

  /**
   * Replay the initial engine events that were emitted during createGame()
   * before we had a chance to subscribe to the event emitter.
   */
  private replayInitialEvents(): void {
    if (!this.game) return;

    const initialEvents: GameEvent[] = [
      {
        type: 'GameStarted',
        payload: {
          gameId: this.game.gameId,
          mode: this.game.mode,
          players: [0, 1, 2, 3],
        },
      },
      {
        type: 'RoundStarted',
        payload: {
          roundNumber: this.game.currentRound,
          phase: 'planning',
        },
      },
      {
        type: 'PlanningPhase',
        payload: {
          roundNumber: this.game.currentRound,
          deadline: PLANNING_TIME,
        },
      },
    ];

    for (const event of initialEvents) {
      this.forwardEvent(event);
    }
  }

  // ─── Private: State Notification ───────────────────

  /**
   * Notify all external state handlers with a deep-cloned game state snapshot.
   *
   * If the game state is null, this is a no-op.
   */
  private notifyStateHandlers(): void {
    if (!this.game) return;

    const snapshot = cloneGameState(this.game);
    for (const handler of this.stateHandlers) {
      try {
        handler(snapshot);
      } catch (err) {
        console.error(
          '[MockMultiplayerAdapter] Error in state update handler:',
          err,
        );
      }
    }
  }
}

// ─── Factory Function ──────────────────────────────────────────

/**
 * Create a new MockMultiplayerAdapter instance.
 *
 * This is the recommended way to instantiate the adapter.
 * The factory function can be swapped out in the future to return
 * different adapter implementations (e.g., Supabase) based on config.
 *
 * @returns A new MockMultiplayerAdapter instance.
 */
export function createMockAdapter(): MockMultiplayerAdapter {
  return new MockMultiplayerAdapter();
}
