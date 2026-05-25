# Multiplayer System — Constitution

## Purpose
Implement multiplayer support starting with local mock multiplayer (same-device simulation) and preparing the architecture for future online multiplayer via Supabase Realtime.

## Scope
- Local mock multiplayer adapter (simulate 4 players on one device).
- Multiplayer session abstraction (interface for future real multiplayer).
- Game state synchronization protocol design.
- Turn/phase synchronization (planning → reveal → resolution → cleanup).
- Player connection/disconnection handling.
- Supabase Realtime adapter preparation (not full implementation).
- Player slot configuration (human vs bot).
- Game lobby abstraction.

## Out of Scope
- Online matchmaking (future scope).
- Full Supabase integration (adapter-ready only).
- Real-time chat.
- Persistent accounts.

## Dependencies
- Core Game Logic Engine (game state, events, serialization).
- UI branch (multiplayer screens).
- Bot branch (fill empty slots).

## Key Constraints
1. Mock multiplayer first (de-risk development).
2. Game state must be fully serializable for network transport.
3. Architecture must support future Supabase Realtime without major rewrite.
4. Support 4 players (FFA) and 2v2 modes.
5. Handle player disconnection gracefully.
