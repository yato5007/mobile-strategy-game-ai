# Core Game Logic Engine — Integration Notes

## How This Connects to Other Systems

### UI and User Experience
- **Contract**: UI imports from `mobile-game/src/game/index.ts` (public API only).
- **State**: UI subscribes to game events to update display.
- **Actions**: UI calls `createGame()` to start, `submitAssignments()` to play.
- **No reverse dependency**: Game logic never imports UI code.
- **Events consumed**: All GameEvent types — UI renders based on events.

### Bot and AI System
- **Contract**: Bot imports game types and calls engine functions.
- **State**: Bot reads `GameState` to make decisions (hand, lane states, scores).
- **Actions**: Bot calls `submitAssignments()` with AI-chosen assignments.
- **Events**: Bot subscribes to events for game flow synchronization.

### Multiplayer System
- **Contract**: Game state is serializable (`serialize()` / `deserialize()`).
- **Sync**: State is transmitted as JSON over Supabase Realtime.
- **Actions**: Player actions (`SubmitAction`) are sent as messages; host/authority runs engine.
- **Mock multiplayer**: Same engine works locally with all 4 slots — no changes needed.

### Balance and Testing
- **Contract**: Test files import from `mobile-game/src/game/index.ts`.
- **Testing**: Pure functions are easy to unit test (state in, state out).
- **Simulator**: `createGame()` with seed for deterministic matches.
- **Bot integration**: Balance simulator runs engine + bots together.

## Shared Data Types

The following types are shared across all systems (defined in types.ts):
- `GameState` — Complete game state
- `GameEvent` — All possible events
- `Card`, `PlayerState`, `LaneState` — Component types
- `GameConfig` — Match configuration
- `Standing`, `GameResult` — Query results
- `ValidationResult` — Action validation

## Contract Changes
If this module changes its public API:
1. Update `index.ts` exports.
2. Notify @integration-architect.
3. Update dependent branches (UI, Bots, Multiplayer).

## Version / Protocol
- Game state schema version: 1.0 (plain JSON)
- Event protocol: in-process event emitter (future: network events with same types)

## Testing Dependencies
- Unit tests for engine: none external (pure functions)
- Integration tests: minimal mocking needed (JSON state in/out)
- Balance tests: needs bot AI module to be available
