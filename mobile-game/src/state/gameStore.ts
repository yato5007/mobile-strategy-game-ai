/**
 * Game Store — Zustand store wrapping the multiplayer adapter and game engine.
 *
 * Responsibilities:
 * - Manages the multiplayer adapter lifecycle
 * - Provides game state to UI components
 * - Handles player actions (select card, assign to lane, confirm)
 * - Subscribes to game events for reactive updates
 */
import { create } from 'zustand';
import type {
  GameState,
  PlayerId,
  CardId,
  LaneIndex,
  CardAssignment,
  Card,
  GameResult,
  GameEvent,
} from '../game/types';
import { submitAssignments, cloneGameState, getGameResult } from '../game';
import type { MultiplayerAdapter } from '../multiplayer/types';
import { MockMultiplayerAdapter } from '../multiplayer/mockMultiplayerAdapter';
import { createBot } from '../bot/botController';
import type { Difficulty, Style, BotConfig } from '../bot/botController';

// ─── Types ──────────────────────────────────────────────────────

export interface PlayerSlotConfig {
  isBot: boolean;
  difficulty?: Difficulty;
  style?: Style;
}

export interface GameConfigUI {
  mode: 'ffa' | '2v2';
  playerSlots: PlayerSlotConfig[];
}

export interface GameStoreState {
  // Adapter
  adapter: MultiplayerAdapter | null;

  // Game state (from engine)
  gameState: GameState | null;
  phase: 'planning' | 'reveal' | 'resolution' | 'cleanup';
  currentRound: number;
  maxRounds: number;
  gameOver: boolean;
  gameResult: GameResult | null;

  // Human player identity
  humanPlayerId: PlayerId;

  // UI-managed selection state
  selectedCardId: CardId | null;
  pendingAssignments: CardAssignment[];
  revealedCards: Record<PlayerId, CardAssignment[]>;

  // Game configuration
  gameConfig: GameConfigUI | null;

  // Error state
  error: string | null;

  // Actions
  initializeGame: (config: GameConfigUI, humanPlayerId: PlayerId) => void;
  selectCard: (cardId: CardId | null) => void;
  assignToLane: (laneIndex: LaneIndex) => void;
  removeFromLane: (laneIndex: LaneIndex) => void;
  confirmAssignments: () => boolean;
  submitBotAction: (playerId: PlayerId) => boolean;
  syncFromEngine: () => void;
  resetGame: () => void;
  getHumanHand: () => Card[];
}

// ─── Bot Decision Provider ──────────────────────────────────────

/**
 * Create a bot decision provider using the BotController system.
 * Wraps the bot controller's decide() method to match the adapter's interface.
 */
const createBotDecisionProvider = (
  playerConfigs: PlayerSlotConfig[],
) => {
  const botControllers = new Map<PlayerId, ReturnType<typeof createBot>>();

  return (playerId: PlayerId, gameState: GameState) => {
    const config = playerConfigs[playerId];
    if (!config || !config.isBot) {
      return {
        type: 'submit_assignments' as const,
        playerId,
        assignments: [],
      };
    }

    // Create or reuse bot controller
    if (!botControllers.has(playerId)) {
      const botConfig: BotConfig = {
        difficulty: config.difficulty ?? 'normal',
        style: config.style ?? 'balanced',
      };
      botControllers.set(playerId, createBot(botConfig));
    }

    const controller = botControllers.get(playerId)!;
    const result = controller.decide(
      gameState,
      playerId,
      // Events emitter - use a no-op wrapper since bots don't need it
      { subscribe: () => () => {}, emit: () => {}, clear: () => {} },
    );

    return result;
  };
};

// ─── Store ──────────────────────────────────────────────────────

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial state
  adapter: null,
  gameState: null,
  phase: 'planning',
  currentRound: 1,
  maxRounds: 12,
  gameOver: false,
  gameResult: null,
  humanPlayerId: 0,
  selectedCardId: null,
  pendingAssignments: [],
  revealedCards: {},
  gameConfig: null,
  error: null,

  // ─── Initialize Game ──────────────────────────────────

  initializeGame: (config: GameConfigUI, humanPlayerId: PlayerId) => {
    // Clean up any existing adapter
    const currentAdapter = get().adapter;
    if (currentAdapter) {
      currentAdapter.destroy();
    }

    // Create engine config
    const engineConfig = {
      mode: config.mode,
      playerSlots: config.playerSlots.map(
        (s) => s.isBot,
      ) as [boolean, boolean, boolean, boolean],
      maxRounds: 12,
    };

    // Create bot decision provider
    const botProvider = createBotDecisionProvider(config.playerSlots);

    // Create and initialize adapter
    const adapter = new MockMultiplayerAdapter();

    // Subscribe to state updates
    adapter.onStateUpdate((state: GameState) => {
      set({
        gameState: state,
        currentRound: state.currentRound,
        phase: state.roundPhase as GameStoreState['phase'],
        gameOver: state.gamePhase === 'completed',
      });
    });

    // Subscribe to game events
    adapter.onEvent((event: GameEvent) => {
      switch (event.type) {
        case 'GameOver':
          {
            const state = get().gameState;
            if (state) {
              const result = getGameResult(state);
              set({
                gameOver: true,
                gameResult: result,
              });
            }
          }
          break;
        case 'RevealPhase':
          set({
            revealedCards: event.payload.assignments,
          });
          break;
        case 'Error':
          set({ error: event.payload.message });
          break;
        default:
          break;
      }
    });

    // Initialize the adapter
    adapter.initialize({
      gameConfig: engineConfig,
      botDecisionProvider: botProvider,
    });

    // Get initial state
    const initialState = adapter.getGameState();

    set({
      adapter,
      gameState: initialState,
      gameConfig: config,
      humanPlayerId,
      phase: 'planning',
      currentRound: initialState.currentRound,
      maxRounds: initialState.maxRounds,
      gameOver: false,
      gameResult: null,
      selectedCardId: null,
      pendingAssignments: [],
      revealedCards: {},
      error: null,
    });
  },

  // ─── Card Selection ──────────────────────────────────

  selectCard: (cardId: CardId | null) => {
    set({ selectedCardId: cardId });
  },

  // ─── Assign to Lane ──────────────────────────────────

  assignToLane: (laneIndex: LaneIndex) => {
    const { selectedCardId, gameState, pendingAssignments } = get();

    if (!selectedCardId || !gameState) return;

    // Check if this lane is active
    const lane = gameState.lanes[laneIndex];
    if (!lane || !lane.isActive) return;

    // Check if we can assign more cards to this lane
    const laneCount = pendingAssignments.filter(
      (a) => a.laneIndex === laneIndex,
    ).length;
    if (laneCount >= 3) return; // Max 3 cards per lane

    // Check if card is already assigned (shouldn't happen but guard)
    const alreadyAssigned = pendingAssignments.find(
      (a) => a.cardId === selectedCardId,
    );
    if (alreadyAssigned) return;

    // Check if card exists in hand
    const player = gameState.players[get().humanPlayerId];
    const cardInHand = player.hand.find((c) => c.id === selectedCardId);
    if (!cardInHand) return;

    // Add assignment
    const newAssignment: CardAssignment = {
      cardId: selectedCardId,
      laneIndex,
    };

    set({
      pendingAssignments: [...pendingAssignments, newAssignment],
      selectedCardId: null, // Deselect after assignment
    });
  },

  // ─── Remove from Lane ────────────────────────────────

  removeFromLane: (laneIndex: LaneIndex) => {
    const { pendingAssignments } = get();

    // Find the most recent assignment to this lane
    const index = pendingAssignments
      .map((a, i) => ({ ...a, index: i }))
      .filter((a) => a.laneIndex === laneIndex)
      .pop();

    if (!index) return;

    const updated = [...pendingAssignments];
    updated.splice(index.index, 1);
    set({ pendingAssignments: updated });
  },

  // ─── Confirm Assignments ─────────────────────────────

  confirmAssignments: () => {
    const { adapter, humanPlayerId, pendingAssignments, gameState } = get();

    if (!adapter || !gameState) return false;

    // Validate: must assign at least 1 card
    if (pendingAssignments.length === 0) {
      set({ error: 'Must assign at least 1 card' });
      return false;
    }

    // Submit via adapter
    const success = adapter.submitAction({
      type: 'submit_assignments',
      playerId: humanPlayerId,
      assignments: pendingAssignments,
    });

    if (success) {
      // Sync state from adapter
      const newState = adapter.getGameState();
      set({
        gameState: newState,
        phase: newState.roundPhase as GameStoreState['phase'],
        currentRound: newState.currentRound,
        pendingAssignments: [],
        selectedCardId: null,
        error: null,
      });
    } else {
      set({ error: 'Invalid assignment' });
    }

    return success;
  },

  // ─── Submit Bot Action ───────────────────────────────

  submitBotAction: (playerId: PlayerId) => {
    const { adapter, gameState } = get();
    if (!adapter || !gameState) return false;

    // Find bot controller for this player
    const config = get().gameConfig;
    if (!config) return false;

    const slotConfig = config.playerSlots[playerId];
    if (!slotConfig || !slotConfig.isBot) return false;

    const bot = createBot({
      difficulty: slotConfig.difficulty ?? 'normal',
      style: slotConfig.style ?? 'balanced',
    });

    const decision = bot.decide(gameState, playerId, {
      subscribe: () => () => {},
      emit: () => {},
      clear: () => {},
    });

    return adapter.submitAction(decision);
  },

  // ─── Sync from Engine ────────────────────────────────

  syncFromEngine: () => {
    const { adapter } = get();
    if (!adapter) return;

    const state = adapter.getGameState();
    set({
      gameState: state,
      phase: state.roundPhase as GameStoreState['phase'],
      currentRound: state.currentRound,
      gameOver: state.gamePhase === 'completed',
    });
  },

  // ─── Reset Game ──────────────────────────────────────

  resetGame: () => {
    const { adapter } = get();
    if (adapter) {
      adapter.destroy();
    }

    set({
      adapter: null,
      gameState: null,
      phase: 'planning',
      currentRound: 1,
      maxRounds: 12,
      gameOver: false,
      gameResult: null,
      selectedCardId: null,
      pendingAssignments: [],
      revealedCards: {},
      gameConfig: null,
      error: null,
    });
  },

  // ─── Get Human Hand ──────────────────────────────────

  getHumanHand: () => {
    const { gameState, humanPlayerId } = get();
    if (!gameState) return [];
    return gameState.players[humanPlayerId]?.hand ?? [];
  },
}));
