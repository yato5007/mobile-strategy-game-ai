# Bot and AI System — Constitution

## Purpose
Design and implement strategic AI opponents with multiple difficulty levels and strategic play styles for the mobile strategy game.

## Scope
- Bot decision engine (weighted heuristic system).
- Difficulty levels: Easy, Normal, Hard, Expert.
- Strategic styles: Aggressive, Defensive, Balanced, Disruptive, Objective-focused, Comeback-focused, Team-support.
- Lane evaluation heuristics.
- Card selection and assignment logic.
- Team-aware AI for 2v2 mode.
- Comeback-awareness for trailing position play.
- Bot configuration (difficulty + style per bot slot).
- Integration with game engine (bots submit assignments like human players).
- Bot personality framework (style controls preferences, difficulty controls quality).

## Out of Scope
- Game logic (owned by Core Game Logic Engine).
- UI for bot selection (owned by UI branch).
- Balance simulator execution (owned by Balance branch).

## Dependencies
- Core Game Logic Engine (game state, card data, lane data, events).
- Types and data structures from core-game-logic.

## Key Constraints
1. Bots must not cheat by seeing hidden information.
2. Bots must follow the same rules as human players.
3. Bot behavior must be strategic, not reflex-based.
4. Difficulty affects decision quality, not rules.
5. Style affects personality and strategy preference.
6. Bots must work in both FFA and 2v2 modes.
7. Bots must be usable by the Balance Simulator.
