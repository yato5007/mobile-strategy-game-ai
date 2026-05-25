# Multiplayer System — Integration Notes

## 1. Integration with Core Game Engine

### Contract
- The adapter calls engine functions exclusively. No other system should call engine functions directly during gameplay.
- Engine functions mutate `GameState` in place and emit events via `GameEventEmitter`.
- The adapter must preserve the engine's determinism — it must not modify game state outside the engine functions.

### Files
- Engine location: `mobile-game/src/game/engine.ts`
- Engine types: `mobile-game/src/game/types.ts`
- Engine constants: `mobile-game/src/game/constants.ts`
- Adapter location: `mobile-game/src/multiplayer/adapter.ts` (proposed)

### Lifecycle
```
createGame(config) → { game, events }
  ↓
[Adapter wraps { game, events }]
  ↓
[Loop for each round]
  ↓
events.emit(PlanningPhase) → UI shows planning screen
  ↓
For each player: submitAssignments(game, playerId, assignments, events)
  ↓
isPlanningComplete(game) → true → events.emit(RevealPhase)
  ↓
revealAssignments(game, events) → events.emit(ResolutionPhase)
  ↓
resolveRound(game, events) → multiple LaneResolved events
  ↓
processCleanup(game, events) → events.emit(RoundComplete)
  ↓
[Check isGameOver → if not, loop]
```

## 2. Integration with Bot System

### Contract
- Bot players make decisions through `BotController.makeDecision(game, playerId, difficulty, style)`.
- The returned `CardAssignment[]` is submitted to the adapter via `submitAction()`.
- The adapter does not need to know whether a submission comes from a human or a bot.

### Flow
```
Adapter detects planning phase → determines which slots are bots
  ↓
For each bot slot: BotController.makeDecision(...)
  ↓
submitAction({ type: 'submit_assignments', playerId, assignments })
  ↓
Adapter processes via engine.submitAssignments(...)
```

### Where
- Bot decision should be called in the adapter's planning phase handler.
- The adapter should only invoke the bot controller for slots where `PlayerState.isBot === true`.
- Bot difficulty/style is provided via `GameConfig` (stored somewhere accessible to the adapter).

### File
- Bot controller location: `mobile-game/src/bot/botController.ts` (proposed)
- Adapter imports and calls `BotController.makeDecision()`.

## 3. Integration with UI System

### Contract
- The UI subscribes to adapter events (`onStateUpdate`, `onEvent`) and renders game state.
- The UI displays a timer based on the planning deadline.
- The UI calls `submitAction()` when the human player confirms their assignments.
- The UI uses `getConnectedPlayers()` to show player connection status.

### Flow
```
UI → Adapter.initialize(config)
  ↓
Adapter emits onStateUpdate(gameState) → UI re-renders
  ↓
Adapter emits onEvent(GameEvent) → UI shows notifications/animations
  ↓
Player clicks "Submit" → UI calls adapter.submitAction(action)
  ↓
Adapter processes → emits events → UI updates
```

### State Management (Zustand Store)
```typescript
// Proposed store shape
interface MultiplayerStore {
  adapter: MultiplayerAdapter | null;
  gameState: GameState | null;
  phase: RoundPhase | null;
  connectedPlayers: PlayerId[];
  currentPlayerId: PlayerId;
  timer: { deadline: number; remaining: number } | null;
}
```

### Navigation Flow
```
LobbyScreen → configures player slots → MultiplayerAdapter.createSession()
  ↓
GameScreen → plays rounds via adapter
  ↓
ResultsScreen → shown when GameOver event fires
```

### RTL Awareness
- The adapter itself is RTL-agnostic. RTL handling is the UI's responsibility.
- However, the adapter should provide player order consistently (player 0 = first slot in lobby). The UI will reverse the display order in RTL mode.

## 4. Integration with State Management (Zustand)

### Proposed Store Name
- `multiplayerStore.ts` in `mobile-game/src/store/`

### Store Actions
```typescript
interface MultiplayerActions {
  initializeAdapter: (config: MultiplayerConfig) => Promise<void>;
  startLocalGame: (config: GameConfig) => Promise<void>;
  submitAssignments: (assignments: CardAssignment[]) => Promise<void>;
  destroyAdapter: () => void;
}
```

### Event → Store Flow
```
Adapter emits onStateUpdate(state) → store.setState({ gameState: state })
Adapter emits onEvent(event) → store may derive info (e.g., phase changes)
Adapter emits onPlayerJoined/Left → store.setState({ connectedPlayers: [...] })
```

## 5. Supabase Realtime Adapter Preparation

### Channel Design
```
Channel: "game:{gameId}"
  - Broadcast messages (type: 'broadcast'):
    - { type: "submit_action", payload: SubmitAction }
    - { type: "state_snapshot", payload: SerializedGameState }
    - { type: "event_replay", payload: GameEvent[] }
  - Presence tracking:
    - player connected/disconnected
```

### Migration Strategy
1. `MultiplayerAdapter` interface is shared between mock and real adapters.
2. Application code uses `createMultiplayerAdapter(config)` — config determines which adapter.
3. For Supabase mode, config includes `supabaseUrl` and `supabaseKey`.
4. Both adapters use the same `GameState` serialization.
5. The UI code is adapter-agnostic — it only interacts with the interface.

### Files for Future
- `mobile-game/src/multiplayer/supabaseAdapter.ts` (future)
- `mobile-game/src/multiplayer/channelProtocol.ts` (future — message types, serialization)

## 6. Testing Strategy

### Unit Tests
- Test `MockMultiplayerAdapter` in isolation (mock engine).
- Test phase synchronization with varied submission orders.
- Test timeout fallback timing.
- Test disconnect/reconnect flow.

### Integration Tests
- Full game with mock adapter, 2 human + 2 bots.
- Full game with 4 bots (all bot match) via mock adapter.
- Full game in 2v2 mode with mock adapter.
- State serialization round-trip (create → play 3 rounds → serialize → deserialize → compare).

### Edge Cases
- All players submit simultaneously.
- One player disconnects before submitting.
- Timeout fires at the exact moment of submission.
- 2v2 mode with one team member disconnecting.

## 7. File Structure (Proposed)

```
mobile-game/src/multiplayer/
├── adapter.ts              # MultiplayerAdapter interface + factory
├── mockAdapter.ts          # MockMultiplayerAdapter implementation
├── supabaseAdapter.ts      # SupabaseMultiplayerAdapter (future stub)
├── types.ts                # Multiplayer-specific types (SessionId, MultiplayerConfig)
├── index.ts                # Public exports
```

## 8. Cross-Cutting Concerns

### Error Handling
- All adapter methods should return `Promise<void>` with errors thrown as exceptions.
- The UI layer should catch and display errors (e.g., "Failed to submit assignments").
- Adapter should never silently swallow engine errors.

### Performance
- Mock adapter has no network overhead. Phase transitions are synchronous.
- Event subscriptions should be lightweight. Avoid heavy computation in event handlers.
- Use `useCallback` / `useMemo` in React to prevent unnecessary re-renders.

### Accessibility
- Timer display should be accessible (screen reader announces remaining time).
- Disconnect notifications should be announced.
- Turn/phase changes should be announced.

---

**Integration Status**: Design complete. Integration-ready for implementation phase.
