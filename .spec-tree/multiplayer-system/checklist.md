# Multiplayer System — Checklist

## Interface & Types

- [ ] 1. `MultiplayerAdapter` interface defined with all lifecycle, state sync, and player management methods.
- [ ] 2. `SerializedGameState` type defined (alias for or identical to `GameState`).
- [ ] 3. `SubmitAction` type defined (plain object with `type`, `playerId`, `assignments`).
- [ ] 4. `SessionId` type defined (string).
- [ ] 5. `MultiplayerConfig` type defined (includes `mode`, `playerSlots`, `gameConfig`).
- [ ] 6. Adapter factory function created: `createMultiplayerAdapter(config): MultiplayerAdapter`.
- [ ] 7. Factory returns `MockMultiplayerAdapter` for local mode and throws for unknown modes.

## Mock Multiplayer Adapter

- [ ] 8. `MockMultiplayerAdapter` class implements all methods of `MultiplayerAdapter`.
- [ ] 9. `initialize()` creates the game engine instance via `createGame(config)`.
- [ ] 10. `createSession()` returns a mock session ID.
- [ ] 11. `joinSession()` marks player as connected in `PlayerState.isConnected`.
- [ ] 12. `submitAction()` validates action type, calls `submitAssignments()` on the engine.
- [ ] 13. `submitAction()` emits `PlayerSubmitted` event after successful submission.
- [ ] 14. `submitAction()` checks `isPlanningComplete()` after each submission and auto-advances if all players have submitted.
- [ ] 15. Phase advancement sequence is correct: planning complete → reveal → resolve → cleanup → next round.
- [ ] 16. `onStateUpdate()` fires with the current game state after each phase transition.
- [ ] 17. `onEvent()` forwards all engine events to subscribers.

## Phase Synchronization

- [ ] 18. All 4 players must submit before phase advances (planning → reveal).
- [ ] 19. Late submissions after phase advance are ignored (validated by engine).
- [ ] 20. Double submissions are handled (second replaces first, no error).
- [ ] 21. Phase advancement is atomic — no partial state transitions.
- [ ] 22. `roundPhase` in `GameState` correctly reflects current phase at all times.

## Timeout Fallback

- [ ] 23. Planning phase has a deadline computed as `startTime + PLANNING_TIME`.
- [ ] 24. `setTimeout` triggers `forceSubmitRemaining()` at the deadline.
- [ ] 25. Timeout is cleared if all players submit before the deadline.
- [ ] 26. `forceSubmitRemaining()` handles players who have not yet submitted.
- [ ] 27. Penalty (-1 VP) is applied correctly for players with 0-card assignments.
- [ ] 28. After force-submit, the adapter re-checks `isPlanningComplete()` and advances if complete.
- [ ] 29. Race condition handled: if timeout fires while all players have just submitted, force-submit is skipped.

## Player Disconnect Handling

- [ ] 30. `onPlayerLeft(handler)` subscribes to player disconnect events.
- [ ] 31. Disconnected player's `isConnected` is set to `false`.
- [ ] 32. Game continues without the disconnected player (remaining players can submit).
- [ ] 33. Timeout fallback still applies to disconnected players who haven't submitted.
- [ ] 34. `getConnectedPlayers()` returns only currently connected players.
- [ ] 35. `onPlayerJoined` handler fires when a player reconnects (mock: reconnection restores state).

## Game Mode Support (FFA & 2v2)

- [ ] 36. Adapter works in FFA mode (4 individual players).
- [ ] 37. Adapter works in 2v2 mode (2 teams of 2).
- [ ] 38. In 2v2 mode, team members share planning view (can see each other's assignments).
- [ ] 39. In 2v2 mode, opponents cannot see each other's assignments (hidden info preserved).
- [ ] 40. In 2v2 mode, submit validation enforces per-player (not per-team) submission.

## State Serialization

- [ ] 41. `GameState` is JSON.stringify-safe (no functions, no non-serializable fields).
- [ ] 42. `JSON.parse(JSON.stringify(gameState))` produces an equivalent state.
- [ ] 43. Unit test exists: create game → play 3 rounds → serialize → deserialize → verify equivalence.
- [ ] 44. All game events are JSON-serializable (plain object discriminated union).
- [ ] 45. `SubmitAction` is JSON-serializable.

## Lifecycle & Cleanup

- [ ] 46. `destroy()` clears timers, unsubscribes event handlers, releases engine reference.
- [ ] 47. No memory leaks after game ends (timers cleared, handlers unsubscribed).
- [ ] 48. Adapter can be initialized again after `destroy()` (reusable).

## Integration

- [ ] 49. Adapter connects to UI via Zustand store (or similar state management).
- [ ] 50. UI displays countdown timer based on adapter's phase deadline.
- [ ] 51. BotController is invoked for bot players during planning phase.
- [ ] 52. Bot decisions are submitted through the same `submitAction()` path as human decisions.
- [ ] 53. Full game flow works end-to-end: lobby → game → rounds → results.
- [ ] 54. `GameOver` event is emitted correctly and UI transitions to results screen.

## Supabase Realtime Preparation (Future)

- [ ] 55. `SupabaseMultiplayerAdapter` stub exists with placeholder methods.
- [ ] 56. Supabase Realtime channel design documented (channel name, message types, presence tracking).
- [ ] 57. State snapshot and event replay strategy documented.
- [ ] 58. Migration guide from mock to real adapter documented in `integration-notes.md`.

## Documentation

- [ ] 59. README or inline comments explain how to run mock multiplayer.
- [ ] 60. `integration-notes.md` documents how adapter integrates with UI, bots, and engine.

---

**Total Items: 60**

**Status**: □ Not started
