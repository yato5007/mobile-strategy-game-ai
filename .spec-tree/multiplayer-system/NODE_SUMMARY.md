# NODE_SUMMARY.md — Multiplayer System

## 1. Purpose

Implement multiplayer support for the strategy game, starting with a local mock adapter (same-device simulation of 4 players) and preparing the architecture for future online multiplayer via Supabase Realtime. The adapter manages player connections, phase synchronization, timeout fallback, and game state serialization — all while keeping the core game engine pure and stateless with respect to network concerns.

## 2. Parent Link

- **Parent Node**: `root` (entire project)
- **Parent Requirements**: REQ-003 (multiplayer), REQ-004 (no turn waiting), REQ-012 (4 players), REQ-013 (2v2), REQ-014 (FFA), REQ-054 (mock first), REQ-055 (Supabase later)
- **Related Siblings**: `core-game-logic` (engine dependency), `bot-ai` (bot decisions dependency), `ui` (state display dependency)

## 3. Decisions Made

| ID | Decision | Rationale |
|---|---|---|
| D001 | Local mock adapter first; Supabase adapter is a stub | De-risk development; validate core logic before network |
| D002 | Adapter wraps and owns the engine instance | Prevents external mutation; adapter controls phase flow |
| D003 | Phase advancement owned by adapter, not engine | Adapter handles connection/timeout concerns |
| D004 | Timer displayed by UI, enforced by adapter | Separation of display vs enforcement concerns |
| D005 | All state types must be JSON-serializable (plain objects) | Guarantees network transport without extra conversion |
| D006 | 2v2 shared planning via shared state (mock mode) | Simplest approach for same-device simulation |
| D007 | Bot decisions via injectable provider function | Allows custom bot logic without adapter modification |
| D008 | State deep-cloned on getGameState() | Prevents external mutation of internal engine state |

## 4. Alternatives Rejected

| Alternative | Reason for Rejection |
|---|---|
| Full online multiplayer from start | Too complex; would delay prototype significantly |
| Engine auto-advances phases | Engine would need knowledge of connections and timeouts |
| Custom serializer/deserializer | Adds maintenance burden; plain objects suffice via type convention |
| Separate state per player (mock) | Unnecessary complexity for same-device mock mode |
| Peer-to-peer networking | Harder to implement; trust issues |
| Bot logic embedded in adapter | Violates separation of concerns; BotController should be separate |

## 5. Dependencies

- **Core Game Logic Engine** (critical): Provides `createGame`, `submitAssignments`, `isPlanningComplete`, `forceSubmitRemaining`, `revealAssignments`, `resolveRound`, `processCleanup`, `isGameOver`, `getGameResult`, `cloneGameState`.
- **Bot System** (strong): `BotDecisionProvider` interface. Full `BotController` implementation expected as a future integration.
- **UI System** (integration): Displays game state, player list, timer, and phase transitions via `onStateUpdate` / `onEvent` subscriptions.
- **State Management** (integration): Zustand store wrapping adapter events.

## 6. Architecture Overview

```
┌─────────────────────────────────────────────┐
│              MultiplayerAdapter              │
│  (interface: submit, subscribe, manage)      │
├──────────────────┬──────────────────────────┤
│  MockAdapter     │  SupabaseAdapter (future) │
│  (same-device)   │  (per-device, networked)  │
└────────┬─────────┴──────────┬───────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────┐
│           Core Game Engine                  │
│  (deterministic, pure state transformations)│
└─────────────────────────────────────────────┘
```

### Mock Adapter Internal Flow

```
Initialize
  ├── createGame(config) → { game, events }
  ├── Subscribe to engine events
  ├── Replay initial events to external handlers
  ├── onEnterPlanningPhase()
  │     ├── startPlanningTimer()
  │     └── triggerBotDecisions()
  └── notifyStateHandlers()

Submit Action (human or bot)
  ├── engine.submitAssignments()
  ├── notifyStateHandlers()
  └── checkAndAdvancePhase()
        └── (if all submitted) advanceToNextPhase()
              ├── revealAssignments() → notify
              ├── resolveRound() → notify
              └── processCleanup() → notify
                    └── (engine emits next PlanningPhase or GameOver)

Timeout
  ├── forceSubmitRemaining() → engine applies -1 VP penalty
  ├── notifyStateHandlers()
  └── checkAndAdvancePhase() → advanceToNextPhase()

Disconnect
  ├── player.isConnected = false
  ├── notify leftHandlers
  ├── notifyStateHandlers()
  └── checkAndAdvancePhase() (skip disconnected player)
```

## 7. Integration Risks

1. **Phase sync desync**: If adapter and engine disagree on phase state, game may block or skip phases. Mitigated by using engine's `isPlanningComplete()` as single source of truth.
2. **Timer race conditions**: Simultaneous submission and timeout firing. Mitigated by `clearPlanningTimer()` at the start of `checkAndAdvancePhase()` and `advanceToNextPhase()`.
3. **Serialization creep**: Future non-serializable fields added to state. Mitigated by CI round-trip test and code review.
4. **2v2 visibility leaks**: Opponents seeing each other's assignments. Mitigated by UI-level filtering based on team membership (adapter is RTL-agnostic).
5. **Bot decision blocking**: If a bot provider throws, the adapter catches and logs the error. The bot slot remains unsubmitted until timeout.

## 8. Implementation Status

| Component | Status |
|---|---|
| MultiplayerAdapter interface | ✅ IMPLEMENTED (`types.ts`) |
| MultiplayerConfig, SessionId, SerializedGameState types | ✅ IMPLEMENTED (`types.ts`) |
| Adapter factory (`createMockAdapter`) | ✅ IMPLEMENTED (`mockMultiplayerAdapter.ts`) |
| MockMultiplayerAdapter class | ✅ IMPLEMENTED (`mockMultiplayerAdapter.ts`) |
| Engine event wiring | ✅ IMPLEMENTED (15 event types subscribed) |
| Phase sync (planning → reveal → resolve → cleanup) | ✅ IMPLEMENTED |
| Planning timeout fallback (45s) | ✅ IMPLEMENTED |
| Player disconnect handling (connect/disconnect) | ✅ IMPLEMENTED |
| Default bot decision provider (random heuristic) | ✅ IMPLEMENTED |
| Supabase Realtime documentation | 🔄 TODO (Task 9) |
| UI integration (Zustand store) | 🔄 TODO (Task 10) |
| Full game test with mock adapter | 🔄 TODO (Task 11) |

## 9. Tests

- Unit: `MultiplayerAdapter` interface compliance for mock adapter.
- Unit: Phase synchronization with all 4 players submitting at different times.
- Unit: Timeout fallback when players do not submit.
- Unit: Player disconnect and reconnect (mock).
- Unit: State deep-clone returns independent copy.
- Integration: Full game (FFA and 2v2) from lobby to results via mock adapter.
- Integration: Bot decisions submitted through adapter.

## 10. Next Steps

1. Implement unit tests for MockMultiplayerAdapter (Task 11).
2. Implement Supabase adapter plan documentation (Task 9).
3. Connect adapter to UI via Zustand store (Task 10).
4. Test full game flow with mock adapter, including edge cases.

---

**Node State**: LEAF_READY_FOR_IMPLEMENTATION → IMPLEMENTED
**Last Updated**: 2026-05-25
**Implementation**: Tasks 1-8 complete. Tasks 9-11 remain.
