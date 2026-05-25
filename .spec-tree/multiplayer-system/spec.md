# Multiplayer System — Specification

## 1. Architecture Layers

### 1.1 Abstraction
```
interface MultiplayerAdapter {
  // Lifecycle
  initialize(config: MultiplayerConfig): Promise<void>;
  destroy(): void;
  
  // Game Session
  createSession(gameState: SerializedGameState): Promise<SessionId>;
  joinSession(sessionId: SessionId, playerId: PlayerId): Promise<void>;
  
  // State Sync
  submitAction(action: PlayerAction): Promise<void>;
  onStateUpdate(handler: (state: SerializedGameState) => void): void;
  onEvent(handler: (event: GameEvent) => void): void;
  
  // Player Management
  getConnectedPlayers(): PlayerId[];
  onPlayerJoined(handler: (playerId: PlayerId) => void): void;
  onPlayerLeft(handler: (playerId: PlayerId) => void): void;
}
```

### 1.2 Implementations
- `MockMultiplayerAdapter` — local same-device simulation.
- `SupabaseMultiplayerAdapter` — future real online.

## 2. Mock Multiplayer Adapter

### 2.1 Architecture
- All players run on the same device.
- Game engine runs once, shared state.
- Bot AI makes decisions for bot slots.
- Human player uses UI for decisions.
- Phase synchronization via event emitter.

### 2.2 Flow
1. Lobby configures player slots (human vs bot + bot configs).
2. `createGame(config)` creates the game + events.
3. State subscribed via `events.subscribe()`.
4. When planning phase starts, each player (human + bots) makes decisions.
5. Human decisions via UI → `submitAssignments(game, pid, assignments, events)`.
6. Bot decisions via BotController → same function.
7. When all players submitted → `revealAssignments(game, events)`.
8. → `resolveRound(game, events)`.
9. → `processCleanup(game, events)`.
10. Repeat until game over.

### 2.3 Turn Management
- All players plan simultaneously (true to game design).
- Phase advances when all connected players have submitted.
- Timeout fallback: after PLANNING_TIME seconds, auto-submit for missing.
- Timer managed by React state (useEffect with countdown).

## 3. Supabase Realtime Adapter (Future)

### 3.1 Preparation
- All game state is JSON-serializable (already enforced).
- Player actions are plain objects (SubmitAction defined in types).
- Event system broadcasts via Supabase Realtime channels.
- Adapter implements the MultiplayerAdapter interface.

### 3.2 Architecture (Future)
- Supabase Realtime channel per game session.
- Each player connects to the channel.
- Actions sent as broadcast messages.
- State snapshots sent periodically.
- Event replay on reconnect.

## 4. Integration

- **UI**: MultiplayerAdapter implementation chosen based on mode (local/Supabase).
- **Bot**: BotController uses same submitAssignments as human.
- **Core Engine**: All state changes flow through engine functions + events.
- **State Management**: Zustand store wraps MultiplayerAdapter events.