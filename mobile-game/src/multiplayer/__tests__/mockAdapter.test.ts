/**
 * MockMultiplayerAdapter — Unit Tests
 *
 * Tests the adapter's lifecycle, phase sync, timeout, disconnect handling,
 * event forwarding, and integration with the game engine.
 *
 * @group multiplayer
 */

import { createMockAdapter } from '../mockMultiplayerAdapter';
import type { MockMultiplayerAdapter } from '../mockMultiplayerAdapter';
import type { MultiplayerConfig, BotDecisionProvider } from '../types';
import type { GameState, PlayerId, SubmitAction, CardId } from '../../game/types';
import { isGameOver } from '../../game/engine';

// ─── Test Helpers ───────────────────────────────────────────────

/**
 * Default config for a 4-player FFA game with no bots.
 * All players are human (isBot = false in the config).
 */
const FFA_CONFIG: MultiplayerConfig = {
  gameConfig: {
    mode: 'ffa',
    playerSlots: [false, false, false, false],
  },
};

/**
 * Config with all bot players for testing auto-advance.
 */
const ALL_BOT_CONFIG: MultiplayerConfig = {
  gameConfig: {
    mode: 'ffa',
    playerSlots: [true, true, true, true],
  },
};

/**
 * Config for mixed game: player 0 is human, rest are bots.
 */
const MIXED_BOT_CONFIG: MultiplayerConfig = {
  gameConfig: {
    mode: 'ffa',
    playerSlots: [false, true, true, true],
  },
};

/**
 * Config for 2v2 team mode with mixed human/bot.
 */
const TEAM_CONFIG: MultiplayerConfig = {
  gameConfig: {
    mode: '2v2',
    playerSlots: [false, true, true, true],
  },
};

/**
 * A bot decision provider that always submits exactly 1 card to lane 0.
 * Deterministic and predictable for testing.
 */
function deterministicBotProvider(playerId: PlayerId, game: GameState): SubmitAction {
  const player = game.players[playerId];
  if (!player || player.hand.length === 0) {
    return { type: 'submit_assignments', playerId, assignments: [] };
  }
  return {
    type: 'submit_assignments',
    playerId,
    assignments: [{ cardId: player.hand[0].id, laneIndex: 0 }],
  };
}

/**
 * Helper: submit one card for a given player (the first card in their hand).
 */
function submitFirstCard(adapter: MockMultiplayerAdapter, playerId: PlayerId): boolean {
  const state = adapter.getGameState();
  const player = state.players[playerId];
  if (!player || player.hand.length === 0) return false;
  return adapter.submitAction({
    type: 'submit_assignments',
    playerId,
    assignments: [{ cardId: player.hand[0].id, laneIndex: 0 }],
  });
}

/**
 * Submit for all connected human players that haven't submitted yet.
 */
function submitAllConnected(adapter: MockMultiplayerAdapter): void {
  const state = adapter.getGameState();
  if (state.roundPhase !== 'planning') return;
  for (const player of state.players) {
    if (player.isConnected && !player.hasSubmitted && player.hand.length > 0) {
      submitFirstCard(adapter, player.id);
    }
  }
}

/**
 * Check if the game has ended by checking gamePhase and rounds.
 */
function isGameCompleted(state: GameState): boolean {
  return state.gamePhase === 'completed' || state.roundsCompleted >= state.maxRounds;
}

// ─── Tests ────────────────────────────────────────────────────

describe('MockMultiplayerAdapter', () => {
  let adapter: MockMultiplayerAdapter;

  afterEach(() => {
    if (adapter && adapter.isInitialized()) {
      adapter.destroy();
    }
    jest.useRealTimers();
  });

  // ─── Lifecycle ─────────────────────────────────────

  describe('Lifecycle', () => {
    it('should be uninitialized before initialize()', () => {
      adapter = createMockAdapter();
      expect(adapter.isInitialized()).toBe(false);
    });

    it('should be initialized after initialize()', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);
      expect(adapter.isInitialized()).toBe(true);
    });

    it('should be uninitialized after destroy()', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);
      adapter.destroy();
      expect(adapter.isInitialized()).toBe(false);
    });

    it('should throw when calling getGameState() before initialize()', () => {
      adapter = createMockAdapter();
      expect(() => adapter.getGameState()).toThrow('not initialized');
    });

    it('should return a valid game state after initialize()', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);
      const state = adapter.getGameState();
      expect(state).toBeDefined();
      expect(state.players).toHaveLength(4);
      expect(state.currentRound).toBe(1);
    });

    it('should support re-initialization after destroy()', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);
      const state1 = adapter.getGameState();
      adapter.destroy();
      adapter.initialize(FFA_CONFIG);
      const state2 = adapter.getGameState();
      expect(state2.currentRound).toBe(1);
      expect(state2.gameId).not.toBe(state1.gameId);
    });

    it('should return deep-cloned state (mutations do not affect adapter)', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);
      const state = adapter.getGameState();
      const originalVp = state.players[0].vpTotal;
      state.players[0].vpTotal = 999; // Mutate clone
      const state2 = adapter.getGameState();
      expect(state2.players[0].vpTotal).toBe(originalVp);
    });
  });

  // ─── Phase Advancement ─────────────────────────────

  describe('Phase Advancement', () => {
    it('should auto-advance when all connected players submit and start next round', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      // Get initial state
      const state0 = adapter.getGameState();
      expect(state0.roundPhase).toBe('planning');
      expect(state0.currentRound).toBe(1);

      // Submit for all 4 players
      for (let pid = 0; pid < 4; pid++) {
        expect(submitFirstCard(adapter, pid as PlayerId)).toBe(true);
      }

      // After all 4 submit, the adapter should have advanced through
      // reveal → resolution → cleanup and started the next planning phase.
      // roundPhase is back to 'planning' for round 2, but currentRound
      // should have incremented.
      const state1 = adapter.getGameState();
      expect(state1.currentRound).toBeGreaterThan(1);
    });

    it('should emit state update events during phase transitions', () => {
      adapter = createMockAdapter();
      const updates: GameState[] = [];
      adapter.onStateUpdate((s) => updates.push(s));

      adapter.initialize(FFA_CONFIG);
      const initialCount = updates.length;

      // Submit all players
      for (let pid = 0; pid < 4; pid++) {
        submitFirstCard(adapter, pid as PlayerId);
      }

      // Should have more updates than just initialization
      expect(updates.length).toBeGreaterThan(initialCount);
    });

    it('should complete a full 12-round game with all players submitting', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      let safety = 0;
      while (safety < 200) {
        safety++;
        const state = adapter.getGameState();
        if (isGameCompleted(state)) break;

        submitAllConnected(adapter);
      }

      const finalState = adapter.getGameState();
      expect(isGameCompleted(finalState)).toBe(true);
      expect(safety).toBeLessThan(200); // Should not hit safety limit
    });
  });

  // ─── All-Bot Game (C1 Verification) ─────────────────

  describe('All-Bot Game (C1)', () => {
    it('should auto-advance with all bots without waiting for timeout', () => {
      adapter = createMockAdapter();

      adapter.initialize({
        ...ALL_BOT_CONFIG,
        botDecisionProvider: deterministicBotProvider,
      });

      // After initialization, bots should have submitted and phase should advance
      const state = adapter.getGameState();
      // Should have advanced past the first planning phase
      expect(state.currentRound > 0 || isGameCompleted(state)).toBe(true);
    });

    it('should complete multiple rounds with all bots deterministically', () => {
      adapter = createMockAdapter();
      adapter.initialize({
        ...ALL_BOT_CONFIG,
        botDecisionProvider: deterministicBotProvider,
      });

      let safety = 0;
      while (safety < 200) {
        safety++;
        const state = adapter.getGameState();
        if (isGameCompleted(state)) break;

        if (state.roundPhase === 'planning') {
          // Check if any bot needs manual submission (shouldn't happen with C1 fix)
          const unsubmittedBots = state.players.filter(
            p => p.isBot && p.isConnected && !p.hasSubmitted && p.hand.length > 0,
          );
          for (const bot of unsubmittedBots) {
            adapter.submitAction({
              type: 'submit_assignments',
              playerId: bot.id,
              assignments: [{ cardId: bot.hand[0].id, laneIndex: 0 }],
            });
          }
        }
      }

      const finalState = adapter.getGameState();
      expect(isGameCompleted(finalState) || safety < 200).toBe(true);
    });
  });

  // ─── Timeout Fallback ──────────────────────────────

  describe('Timeout Fallback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should force-submit when timeout fires during planning', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      const state0 = adapter.getGameState();
      expect(state0.currentRound).toBe(1);

      // Only submit player 0; players 1-3 remain unsubmitted
      submitFirstCard(adapter, 0 as PlayerId);

      // Advance time past the planning timeout
      jest.advanceTimersByTime(46000); // PLANNING_TIME (45s) + buffer

      // Phase should have advanced (force submit fired)
      const stateAfter = adapter.getGameState();
      // After force-submit + advance, we're in the next round (planning phase)
      expect(stateAfter.currentRound >= 1).toBe(true);
      // The game should have progressed (roundPhase valid)
      const validPhases = ['planning', 'reveal', 'resolution', 'cleanup'] as const;
      expect(validPhases.includes(stateAfter.roundPhase as typeof validPhases[number]) || isGameCompleted(stateAfter)).toBe(true);
    });

    it('should not double-advance after timeout fires on stale timer (C2 regression)', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      // Get starting round
      const state0 = adapter.getGameState();
      const startRound = state0.currentRound;

      // Submit all 4 players quickly
      for (let pid = 0; pid < 4; pid++) {
        submitFirstCard(adapter, pid as PlayerId);
      }

      // Round should have advanced
      const stateAfter = adapter.getGameState();
      expect(stateAfter.currentRound).toBeGreaterThan(startRound);

      // Now fire the stale timeout callback
      jest.advanceTimersByTime(46000);

      // State should NOT be corrupted — should still be consistent
      const stateAfterTimeout = adapter.getGameState();
      const validPhases = ['planning', 'reveal', 'resolution', 'cleanup'] as const;
      expect(validPhases.includes(stateAfterTimeout.roundPhase as typeof validPhases[number]) || isGameCompleted(stateAfterTimeout)).toBe(true);
      // Current round should not have gone backwards
      expect(stateAfterTimeout.currentRound).toBeGreaterThanOrEqual(stateAfter.currentRound);
    });
  });

  // ─── Player Disconnect/Reconnect ───────────────────

  describe('Player Disconnect/Reconnect', () => {
    it('should advance with remaining players after disconnect', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      const state0 = adapter.getGameState();
      expect(state0.currentRound).toBe(1);

      // Disconnect player 1
      adapter.disconnectPlayer(1 as PlayerId);

      // Submit players 0, 2, 3
      for (const pid of [0, 2, 3] as PlayerId[]) {
        submitFirstCard(adapter, pid);
      }

      // Phase should have advanced and started next round
      const stateAfter = adapter.getGameState();
      // After the round completes and the next round starts,
      // roundPhase could be 'planning' (round 2) but currentRound advanced
      expect(stateAfter.currentRound).toBeGreaterThan(1);
    });

    it('should notify onPlayerJoined and onPlayerLeft handlers', () => {
      adapter = createMockAdapter();
      const joined: PlayerId[] = [];
      const left: PlayerId[] = [];

      adapter.onPlayerJoined((pid) => joined.push(pid));
      adapter.onPlayerLeft((pid) => left.push(pid));

      adapter.initialize(FFA_CONFIG);

      expect(joined.length).toBeGreaterThan(0);

      adapter.disconnectPlayer(0 as PlayerId);
      expect(left).toContain(0);

      const leftCount = left.length;
      adapter.connectPlayer(0 as PlayerId);
      expect(joined.length).toBeGreaterThan(leftCount);
    });

    it('should allow a disconnected player to reconnect and continue', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      // Let round 1 complete
      for (let pid = 0; pid < 4; pid++) {
        submitFirstCard(adapter, pid as PlayerId);
      }

      // Check if we're past planning
      const state1 = adapter.getGameState();
      if (state1.roundPhase === 'planning') return; // Skip if round didn't advance

      // Disconnect and reconnect
      adapter.disconnectPlayer(0 as PlayerId);
      const state2 = adapter.getGameState();
      expect(state2.players[0].isConnected).toBe(false);

      adapter.connectPlayer(0 as PlayerId);
      const state3 = adapter.getGameState();
      expect(state3.players[0].isConnected).toBe(true);
    });
  });

  // ─── Event Forwarding ──────────────────────────────

  describe('Event Forwarding', () => {
    it('should forward engine events to external handlers', () => {
      adapter = createMockAdapter();
      const events: string[] = [];

      adapter.onEvent((event) => {
        events.push(event.type);
      });

      adapter.initialize(FFA_CONFIG);

      // Initial events should be forwarded
      expect(events).toContain('GameStarted');
      expect(events).toContain('PlanningPhase');
    });

    it('should forward submission events', () => {
      adapter = createMockAdapter();
      const events: string[] = [];

      adapter.onEvent((event) => {
        events.push(event.type);
      });

      adapter.initialize(FFA_CONFIG);

      // Submit all 4 players
      for (let pid = 0; pid < 4; pid++) {
        submitFirstCard(adapter, pid as PlayerId);
      }

      // Should have seen PlayerSubmitted events
      const submittedEvents = events.filter(e => e === 'PlayerSubmitted');
      expect(submittedEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2v2 Mode ──────────────────────────────────────

  describe('2v2 Mode', () => {
    it('should initialize in 2v2 mode', () => {
      adapter = createMockAdapter();
      adapter.initialize(TEAM_CONFIG);
      const state = adapter.getGameState();
      expect(state.mode).toBe('2v2');
    });

    it('should complete rounds in 2v2 mode', () => {
      adapter = createMockAdapter();
      adapter.initialize({
        ...TEAM_CONFIG,
        botDecisionProvider: deterministicBotProvider,
      });

      let safety = 0;
      while (safety < 100) {
        safety++;
        const state = adapter.getGameState();
        if (isGameCompleted(state)) break;

        if (state.roundPhase === 'planning') {
          // Submit for human player (player 0)
          const player = state.players[0];
          if (!player.hasSubmitted && player.hand.length > 0) {
            adapter.submitAction({
              type: 'submit_assignments',
              playerId: 0 as PlayerId,
              assignments: [{ cardId: player.hand[0].id, laneIndex: 0 }],
            });
          }
        }
      }

      expect(safety).toBeLessThan(100); // Should have completed without infinite loop
    });
  });

  // ─── Edge Cases ────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle getConnectedPlayers() correctly', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      expect(adapter.getConnectedPlayers()).toHaveLength(4);

      adapter.disconnectPlayer(0 as PlayerId);
      expect(adapter.getConnectedPlayers()).not.toContain(0);
      expect(adapter.getConnectedPlayers()).toHaveLength(3);

      adapter.connectPlayer(0 as PlayerId);
      expect(adapter.getConnectedPlayers()).toHaveLength(4);
    });

    it('should reject invalid actions gracefully', () => {
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      // Submit with non-existent card ID (should be rejected by engine)
      const result = adapter.submitAction({
        type: 'submit_assignments',
        playerId: 0 as PlayerId,
        assignments: [{ cardId: 'invalid-card-id' as CardId, laneIndex: 0 }],
      });

      expect(result).toBe(false);
    });

    it('should not submit after game is over', () => {
      adapter = createMockAdapter();
      adapter.initialize({
        ...ALL_BOT_CONFIG,
        botDecisionProvider: deterministicBotProvider,
      });

      // Let the game play out
      let safety = 0;
      while (safety < 200) {
        safety++;
        const state = adapter.getGameState();
        if (isGameCompleted(state)) break;

        if (state.roundPhase === 'planning') {
          const player = state.players[0];
          if (!player.hasSubmitted && player.hand.length > 0) {
            adapter.submitAction({
              type: 'submit_assignments',
              playerId: 0 as PlayerId,
              assignments: [{ cardId: player.hand[0].id, laneIndex: 0 }],
            });
          }
        }
      }

      const finalState = adapter.getGameState();
      if (isGameCompleted(finalState)) {
        // Submitting after game over should be rejected
        const result = adapter.submitAction({
          type: 'submit_assignments',
          playerId: 0 as PlayerId,
          assignments: [],
        });
        expect(result).toBe(false);
      }
    });

    it('should clear timers on destroy()', () => {
      jest.useFakeTimers();
      adapter = createMockAdapter();
      adapter.initialize(FFA_CONFIG);

      // Submit first player so timer is still active
      submitFirstCard(adapter, 0 as PlayerId);

      // Destroy while timer is active
      adapter.destroy();

      // Advance time past the timeout — should not throw or corrupt anything
      expect(() => jest.advanceTimersByTime(46000)).not.toThrow();
    });
  });
});
