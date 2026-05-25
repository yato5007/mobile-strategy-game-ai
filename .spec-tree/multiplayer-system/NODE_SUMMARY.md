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

## 4. Alternatives Rejected

| Alternative | Reason for Rejection |
|---|---|
| Full online multiplayer from start | Too complex; would delay prototype significantly |
| Engine auto-advances phases | Engine would need knowledge of connections and timeouts |
| Custom serializer/deserializer | Adds maintenance burden; plain objects suffice via type convention |
| Separate state per player (mock) | Unnecessary complexity for same-device mock mode |
| Peer-to-peer networking | Harder to implement; trust issues |

## 5. Dependencies

- **Core Game Logic Engine** (critical): Provides `createGame`, `submitAssignments`, `isPlanningComplete`, `forceSubmitRemaining`, `revealAssignments`, `resolveRound`, `processCleanup`, `isGameOver`, `getGameResult`.
- **Bot System** (strong): `BotController.makeDecision()` for bot player slots.
- **UI System** (integration): Displays game state, player list, timer, and phase transitions.
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

## 7. Integration Risks

1. **Phase sync desync**: If adapter and engine disagree on phase state, game may block or skip phases. Mitigated by using engine's `isPlanningComplete()` as single source of truth.
2. **Timer race conditions**: Simultaneous submission and timeout firing. Mitigated by clearing timeout on submission, checking `phaseLocked` flag.
3. **Serialization creep**: Future non-serializable fields added to state. Mitigated by CI round-trip test and code review.
4. **2v2 visibility leaks**: Opponents seeing each other's assignments. Mitigated by UI-level filtering based on team membership.

## 8. Implementation Status

| Component | Status |
|---|---|
| MultiplayerAdapter interface | 🔄 TODO (Task 1) |
| SerializedGameState / SubmitAction types | 🔄 TODO (Task 2) |
| Adapter factory | 🔄 TODO (Task 3) |
| MockMultiplayerAdapter class | 🔄 TODO (Task 4) |
| Engine event wiring | 🔄 TODO (Task 5) |
| Phase sync | 🔄 TODO (Task 6) |
| Timeout fallback | 🔄 TODO (Task 7) |
| Player disconnect | 🔄 TODO (Task 8) |
| Supabase Realtime documentation | 🔄 TODO (Task 9) |
| UI integration | 🔄 TODO (Task 10) |
| Full game test | 🔄 TODO (Task 11) |

## 9. Tests

- Unit: `MultiplayerAdapter` interface compliance for mock adapter.
- Unit: Phase synchronization with all 4 players submitting at different times.
- Unit: Timeout fallback when players do not submit.
- Unit: Player disconnect and reconnect (mock).
- Unit: State serialization round-trip (JSON).
- Integration: Full game (FFA and 2v2) from lobby to results via mock adapter.
- Integration: Bot decisions submitted through adapter.

## 10. Next Steps

1. Implement Tasks 1–3: interface, types, factory.
2. Implement Task 4: `MockMultiplayerAdapter` class.
3. Implement Task 5: wire engine events.
4. Implement Tasks 6–8: phase sync, timeout, disconnect.
5. Test full game flow (Task 11).
6. Document Supabase adapter plan (Task 9).
7. Integrate with UI (Task 10).

---

**Node State**: TODO
**Last Updated**: 2026-05-25
