# Multiplayer System — Clarification

## 1. Mock vs Real Adapter

### MockMultiplayerAdapter
- All 4 players run on the same physical device.
- The game engine instance is shared in memory.
- Bot players make decisions through BotController (same `submitAssignments` API as human).
- Human players make decisions via UI (React state → `submitAssignments`).
- Phase advancement is triggered by an internal event bus — no network calls.
- No serialization/deserialization overhead needed (in-memory state reference).
- Timer management via React `useEffect` with `PLANNING_TIME` from constants.

### SupabaseMultiplayerAdapter (future)
- Each player runs on a separate device with their own game engine instance.
- State synchronization via Supabase Realtime broadcast channels.
- The game engine runs on each client independently — authoritative state is computed redundantly.
- All players start from the same initial `GameState` (created by the host or server).
- Actions (`SubmitAction`) are broadcast to the channel; all clients process them.
- State snapshots are sent periodically for late-joiners and reconnection.
- Event replay on reconnect: late-joiners receive missed events and replay them locally.

### Key Interface
```typescript
interface MultiplayerAdapter {
  initialize(config: MultiplayerConfig): Promise<void>;
  destroy(): void;
  createSession(gameState: SerializedGameState): Promise<SessionId>;
  joinSession(sessionId: SessionId, playerId: PlayerId): Promise<void>;
  submitAction(action: SubmitAction): Promise<void>;
  onStateUpdate(handler: (state: SerializedGameState) => void): void;
  onEvent(handler: (event: GameEvent) => void): void;
  getConnectedPlayers(): PlayerId[];
  onPlayerJoined(handler: (playerId: PlayerId) => void): void;
  onPlayerLeft(handler: (playerId: PlayerId) => void): void;
}
```

## 2. Game State Serialization (JSON Round-Trip)

### Current State
- `GameState`, `PlayerState`, `LaneState`, `Card`, `CardAssignment`, `GameEvent`, `SubmitAction` are all plain objects.
- No classes, no functions, no `Map`, `Set`, or `Date` objects in state.
- All fields are primitives (`string`, `number`, `boolean`) or arrays of plain objects.
- `JSON.stringify()` and `JSON.parse()` round-trip is guaranteed to produce an equivalent state.

### Serialization Contract
- `JSON.stringify(gameState)` must never throw.
- `JSON.parse(JSON.stringify(gameState))` must produce a functionally equivalent state.
- The `_rngState` field (optional number) is preserved but not used for authoritative resolution.
- `phaseTimestamps` (optional number fields) are informational only — not used in game logic.
- The adapter **must not** add non-serializable fields (functions, class instances, symbols).

### Future Supabase Consideration
- Serialized state size estimate: ~2-5 KB per snapshot (4 players × ~10 cards each + 5 lanes + metadata).
- Well within Supabase Realtime message size limits (typically 256 KB per message).

## 3. Phase Synchronization

### Current Flow (in-memory, mock adapter)
```
PlanningPhase
  → Each player (human or bot) calls `submitAssignments(game, playerId, assignments, events)`
  → `events.emit({ type: 'PlayerSubmitted', payload: { playerId, assignmentCount } })`
  → Adapter checks `isPlanningComplete(game)` after each submission
  → If complete, calls `revealAssignments(game, events)` and emits `RevealPhase`
  → Then `resolveRound(game, events)` emits `LaneResolved` events
  → Then `processCleanup(game, events)` emits `RoundComplete`
  → Next round starts with `PlanningPhase`

Players submitted: [true, true, false, false]  // waiting for 2 more
All submitted: [true, true, true, true]         // phase advances
```

### Phase Ownership
- The **adapter** (not the engine) is responsible for determining when to advance phases.
- The engine provides `isPlanningComplete(game)` as a pure check function.
- The adapter calls `revealAssignments`, `resolveRound`, `processCleanup` in order.

### Future Supabase Phase Sync
- Each client independently runs the same engine.
- When a client receives all `SubmitAction` broadcasts for a round, it advances the phase locally.
- If a client misses a broadcast, it requests a state snapshot.

### Edge Cases
- **Late submitter**: If a player submits after `isPlanningComplete` is true (race condition), the submission is ignored. The engine validates this.
- **Double submit**: Second submission replaces the first (via `validateAssignment` → replacement logic). Not an error.

## 4. Timeout Fallback

### Behavior
- Each planning phase has a deadline: `startTime + PLANNING_TIME` (in milliseconds).
- `PLANNING_TIME` is defined in constants (default: 60 seconds for human, 1 second for bot).
- The adapter tracks the deadline and runs a timer.
- When the deadline passes, any player who has not submitted is **force-submitted** with:
  - **Empty assignment penalty**: `forceSubmitRemaining(game)` auto-assigns nothing.
  - The engine applies the skip penalty: -1 VP for missing players.
- The adapter emits a `PlayerSubmitted` event on behalf of the timeout player (with 0 assignments).
- After force-submit, the adapter checks `isPlanningComplete` again and advances if all are done.

### Timer Implementation (Mock)
- UI layer: React `useEffect` with `setInterval` that counts down from `PLANNING_TIME`.
- Adapter layer: `setTimeout` that triggers `forceSubmitRemaining` at the deadline.
- If all players submit before the deadline, the timeout is cleared.

### Future Supabase
- Server-side timeout: the server (or host client) enforces the deadline.
- If a client disconnects, the server waits a grace period before force-submitting.
- If the timeout fires and the player is disconnected, the adapter marks them as disconnected + force-submitted.

## 5. Player Disconnect Handling

### Mock Adapter (local)
- Disconnection is simulated (e.g., via a "Disconnect Player" button in debug UI).
- When a player is disconnected:
  1. `PlayerState.isConnected` is set to `false`.
  2. Adapter emits `onPlayerLeft(playerId)`.
  3. If the disconnected player has not submitted, the timeout fallback handles them.
  4. The game continues for remaining players.
  5. If a disconnected player "reconnects" (mock), their state is restored from the shared game state.
  6. The planning timer is not reset on reconnect — the player must catch up.

### Reconnection
- **Mock**: Reconnection is instant because state is shared in memory. The player resumes from the current round phase.
- **Supabase (future)**: Reconnecting client requests the latest state snapshot and missed events. They rejoin the channel and resume from the current round.

### Bot Replacement
- Option (future): When a human disconnects and does not reconnect within a grace period, the slot can be replaced by a bot.
- This is **out of scope** for the initial mock adapter but should be architecturally possible.
- The `isBot` flag on `PlayerState` can be toggled mid-game (engine already supports it).

## 6. Supabase Realtime Channel Design (Future)

### Channel Structure
```
Channel: "game:{gameId}"
  - Type: broadcast (for actions)
  - Type: presence (for connection tracking)

Messages (broadcast type "broadcast"):
  1. { type: "submit_action", payload: SubmitAction }
  2. { type: "state_snapshot", payload: SerializedGameState }
  3. { type: "event_replay", payload: GameEvent[] }
  4. { type: "player_disconnect", payload: { playerId: PlayerId } }
  5. { type: "player_reconnect", payload: { playerId: PlayerId, lastEventId: number } }
```

### Connection Lifecycle
1. Host creates game → inserts row into `games` table → gets `gameId`.
2. Host shares `gameId` (via invite link or lobby code).
3. Each player joins the channel `game:{gameId}`.
4. Presence tracking detects when all 4 players are connected → game starts.
5. During play, each `SubmitAction` is broadcast.
6. All clients process actions locally (optimistic update).
7. State snapshots are sent every 5 rounds or on explicit request.

### Why Broadcast and Not Row-Level Updates
- Real-time requirements: phase transitions must be synchronous.
- Row-level updates would introduce latency and race conditions.
- Broadcast messages are fire-and-forget — each client independently drives its local engine.

## 7. Unresolved Questions (To Be Resolved by Implementation)

1. **Should the adapter own the game engine instance or receive one?**
   - Decision: The adapter wraps the engine. The adapter creates the game via `createGame(config)` and holds the `{ game, events }` pair. This prevents external mutation.

2. **Should the mock adapter support "pause" (debug only)?**
   - Decision: Not in initial implementation. Pausing can be added later if needed for debugging.

3. **What happens if all players disconnect?**
   - Decision: The game continues with bot replacements (future) or ends with the current state as final. For mock, at least 1 human must be connected.

4. **Is the host authoritative in Supabase mode?**
   - Decision: Initial design is fully peer-to-peer (each client computes the same state). If desyncs occur, a future version may designate the host as authoritative. For now, trust the deterministic engine.

5. **Grace period on disconnect before bot replacement?**
   - Decision: Not implemented in initial mock. Documented as future improvement.

---

**Clarification Status:** All major clarifications resolved. See `tasks.md` for implementation order.
