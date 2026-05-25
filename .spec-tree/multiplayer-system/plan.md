# Multiplayer System — Plan

## Phases

### Phase 1: MultiplayerAdapter Interface
1. Define MultiplayerAdapter interface with all methods.
2. Define types: SerializedGameState, PlayerAction, SessionId.
3. Create adapter factory (returns mock or future real adapter).

### Phase 2: Mock Multiplayer Adapter
1. Create MockMultiplayerAdapter class.
2. Implement multi-player simulation (all players on one device).
3. Wire game engine events to adapter events.
4. Handle phase synchronization (all players plan → reveal).
5. Handle timeout fallback for idle players.
6. Handle player disconnect/reconnect (mock).

### Phase 3: Supabase Adapter Preparation (Future)
1. Define SupabaseMultiplayerAdapter stub.
2. Document channel structure and state sync protocol.
3. Ensure all state is serializable (already done in engine).
4. Create migration guide from mock to real adapter.

### Phase 4: Integration
1. Connect adapter to UI (lobby → game → results flow).
2. Connect adapter to bot system (bots fill empty slots).
3. Test full game flow with mock adapter.
4. Verify state synchronization works correctly.
