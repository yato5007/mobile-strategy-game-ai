# Multiplayer System — Analysis

## 1. Risk Analysis

### R1: State Synchronization Bugs
- **Severity**: Critical
- **Likelihood**: Medium
- **Description**: The core game engine is deterministic for a given set of inputs. However, the adapter layer manages when inputs are accepted and when phases advance. If the adapter and engine disagree on phase state (e.g., adapter thinks planning is complete but engine disagrees), the game can enter an inconsistent state.
- **Mitigation**:
  - Adapter uses the engine's own `isPlanningComplete()` check.
  - Phase advancement is guarded by assertions (check that all players have submitted before calling `revealAssignments`).
  - Unit tests covering phase edge cases: late submission, double submission, timeout overlap.
- **Detection**: Integration tests that simulate all 4 players with varied timing.

### R2: Timeout Edge Cases
- **Severity**: High
- **Likelihood**: Medium
- **Description**: Race conditions between player submission and timeout firing. If a player submits at the exact moment the timeout fires, both paths may execute.
- **Mitigation**:
  - `setTimeout` is cleared when all players submit.
  - The adapter uses a flag (`phaseLocked`) to prevent double advancement.
  - The engine's `submitAssignments` already handles idempotent submission (setting `hasSubmitted = true` regardless of prior state).
  - If `isPlanningComplete` is already true when timeout fires, the force-submit is skipped.
- **Detection**: Stress tests with simultaneous submissions.

### R3: Serialization Failures
- **Severity**: High (for future Supabase adapter)
- **Likelihood**: Low
- **Description**: GameState types are plain objects, but a future change could introduce a non-serializable field (class instance, function, Symbol). This would break JSON round-trip silently.
- **Mitigation**:
  - Add a `JSON.stringify` round-trip test in CI that serializes and deserializes a mid-game state.
  - Code review rule: all new fields in `GameState`, `PlayerState`, `LaneState`, `Card`, `GameEvent` must be JSON-serializable.
  - All types are defined as `interface` (not `class`) — maintain this convention.
- **Detection**: Unit test `StateRoundTripTest` that creates a game, plays 3 rounds, serializes, deserializes, and verifies equivalence.

### R4: Timer Drift (Mock Adapter)
- **Severity**: Low
- **Likelihood**: Medium
- **Description**: JavaScript `setTimeout` is not guaranteed to fire at exactly the specified time, especially under heavy UI load. This could cause the timeout to fire slightly late.
- **Mitigation**:
  - The deadline is an absolute timestamp (`Date.now() + PLANNING_TIME`).
  - The timer checks `Date.now() >= deadline` rather than relying on the fire time.
  - A 500ms grace window is allowed (force-submit triggers only after deadline + 500ms).
- **Detection**: Manual testing with simulated lag.

### R5: Player Disconnect During Critical Phase
- **Severity**: Medium
- **Likelihood**: Low
- **Description**: A player disconnects during the reveal or resolution phase (not during planning). The phase advancement is atomic (no player input needed), so the game can continue, but the UI for the disconnected player may be out of sync.
- **Mitigation**:
  - In mock mode, disconnect is handled by setting `isConnected = false`. The engine continues without them.
  - In future Supabase mode, the channel handles reconnection with state snapshot request.
  - The UI should display "Player X disconnected" without blocking the game.

### R6: 2v2 Shared Planning View Sync
- **Severity**: Medium
- **Likelihood**: Medium
- **Description**: In 2v2 mode, teammates can see each other's cards and assignments. The adapter must ensure that this view is consistent across both team members.
- **Mitigation**:
  - Mock: Single in-memory state shared by all. Teammates see each other's assignments by reading the shared state.
  - Supabase (future): Broadcast `SubmitAction` includes team visibility metadata. Each client filters visibility based on team membership.
- **Detection**: Test game with 2v2 mode and verify that team members see each other's assignments while opponents do not.

## 2. Dependency Analysis

### Core Engine (Critical Dependency)
- `createGame(config)` → returns `{ game: GameState, events: GameEventEmitter }`
- `submitAssignments(game, playerId, assignments, events)` → void
- `isPlanningComplete(game)` → boolean
- `forceSubmitRemaining(game)` → void
- `revealAssignments(game, events)` → void
- `resolveRound(game, events)` → void
- `processCleanup(game, events)` → void
- `isGameOver(game)` → boolean
- `getGameResult(game)` → GameResult
- **Contract**: All engine functions are pure (mutate game state in place) and emit events.
- **Risk**: If engine API changes, adapter must be updated. Mitigate by keeping adapter thin.

### Bot System (Strong Dependency)
- `BotController.makeDecision(game, playerId, difficulty, style)` → `CardAssignment[]`
- **Contract**: Bot returns assignments synchronously. Adapter calls this during planning phase.
- **Risk**: If a bot takes too long (unlikely with heuristic AI), it could delay the planning phase. Mitigate by running bot decisions synchronously (blocking ≤1ms).

### UI System (Integration Dependency)
- Adapter emits events → UI subscribes → UI re-renders.
- Adapter exposes `getConnectedPlayers()` → UI shows player list.
- Adapter exposes timer → UI shows countdown.
- **Risk**: UI may re-render too frequently (on every event). Mitigate by batching state updates (Zustand store).

### State Management (Integration Dependency)
- Zustand store wraps adapter events.
- Store updates `gameState`, `phase`, `connectedPlayers`, `timer`.
- **Risk**: Store and adapter may have conflicting state. Mitigate by making the adapter the single source of truth; store is a derived cache.

## 3. Key Decisions

### D001: Local Mock First (Confirmed)
- **Decision**: Implement `MockMultiplayerAdapter` first. `SupabaseMultiplayerAdapter` is a stub.
- **Rationale**: De-risks development. Core game logic and UI are validated without network complexity. The adapter interface is proven before real network implementation.
- **Alternatives**: Full online from start (rejected: too complex, delays prototype).
- **See**: `DECISIONS.md` D007 (root level).

### D002: Adapter Wraps Engine (Not the Other Way)
- **Decision**: The adapter creates and owns the engine instance (`{ game, events }`). The UI/bot system interacts with the adapter, not the engine directly.
- **Rationale**: Prevents external mutation of game state. The adapter controls when phases advance.
- **Alternatives**: UI calls engine directly (rejected: bypasses sync logic, couples UI to engine).

### D003: Phase Advancement Owned by Adapter
- **Decision**: The adapter decides when to call `revealAssignments`, `resolveRound`, `processCleanup`. The engine provides the checks (`isPlanningComplete`).
- **Rationale**: The adapter knows about player connections, timeouts, and submission status. The engine is stateless with respect to these concerns.
- **Alternatives**: Engine auto-advances (rejected: engine would need to know about disconnected players and timeouts — scope creep).

### D004: Timer Managed by UI, Enforced by Adapter
- **Decision**: The UI displays the countdown timer. The adapter enforces the deadline with `setTimeout`.
- **Rationale**: Separation of concerns. The UI is responsible for display. The adapter is responsible for enforcement. Both use the same deadline timestamp.
- **Alternatives**: Adapter manages both display and enforcement (rejected: couples UI to adapter implementation).

### D005: JSON Round-Trip Guaranteed by Type Convention
- **Decision**: All game state types must be plain interfaces with only JSON-safe fields. No classes, no functions, no `Map`/`Set`.
- **Rationale**: Guarantees serialization works without additional conversion logic. Simplifies future Supabase adapter.
- **Alternatives**: Custom serializer/deserializer (rejected: adds maintenance burden, bug surface).

### D006: 2v2 Shared Planning View via Shared State (Mock)
- **Decision**: In mock mode, team members share the same in-memory state. The UI filters visibility based on `game.mode` and `player.teamId`.
- **Rationale**: Simplest implementation. Works because all players are on the same device.
- **Alternatives**: Separate state per player (rejected: unnecessary complexity for mock).

## 4. Assumptions

1. All engine API functions (`submitAssignments`, `revealAssignments`, etc.) remain synchronous.
2. GameState is always accessible in memory for mock mode.
3. Bot decisions are deterministic for a given seed (for replay testing).
4. The UI will never call engine functions directly — always through the adapter.
5. Phase transitions are instantaneous (no animation delay affects phase advancement).
6. The game will not support mid-game player slot changes (human ↔ bot) in the initial implementation.

## 5. Success Criteria

The multiplayer system is considered complete when:

1. `MockMultiplayerAdapter` works for a full 12-round game with 4 human players (simulated on one device).
2. Phase synchronization correctly advances planning → reveal → resolve → cleanup.
3. Timeout fallback correctly force-submits idle players.
4. Player disconnect is handled gracefully (game continues, disconnected player marked).
5. Both FFA and 2v2 modes work with the adapter.
6. State serialization round-trip is verified (unit test).
7. The adapter interface is stable and documented.
8. The Supabase Realtime adapter plan is documented (no implementation required yet).
