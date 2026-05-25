# Core Game Logic Engine — Constitution

## Identity
This is a depth-1 child branch of the root Recursive Spec Kit tree. It owns the pure game logic for the lane-control simultaneous strategy game.

## Mission
Define, implement, and validate the complete game logic engine — the rules, state, phases, cards, lane resolution, scoring, achievements, and comeback mechanics — as pure TypeScript with zero UI dependency.

## Scope (What This Node Owns)
- Game state type definitions (PlayerId, Card, LaneState, GameState, etc.)
- Game constants (max rounds, lane count, VP values, timings)
- Card system (card type definitions, deck generation, shuffle/draw logic)
- Round lifecycle management (plan → reveal → resolve → cleanup)
- Lane resolution and comparison logic (strength calc, tie-breaking, VP award)
- Victory point tracking and win condition calculation
- Achievement definitions and checking ("Control All Lanes", "First Blood", etc.)
- Comeback mechanic implementation (last-place detection, bonus cards)
- Active play enforcement (mandatory card assignment, skip penalties)
- Game initialization and state transitions
- State serialization (plain objects for future network sync)
- Event system (type-safe event emitter for UI/bot/multiplayer subscription)
- Public API barrel export (`index.ts`)

## Out of Scope (This Node Does NOT Own)
- UI rendering, animations, or touch interactions
- Bot AI decision-making (lane evaluation heuristics, difficulty styles)
- Multiplayer networking or state synchronization protocols
- Localization or text translation
- Balance simulation or automated testing (unit tests are in scope, balance sim is separate)
- Real-time timers or clock management (timing constants are defined; enforcement is UI)
- Visual card art, themes, or design system

## Boundaries and Contracts
1. The engine MUST accept player actions (assignments) and produce game state transitions.
2. Player actions MUST be validated before application.
3. The engine MUST NOT assume any particular player type (human, bot, mock).
4. All game state MUST be serializable to plain JSON.
5. The engine MUST emit typed events that UI, bots, and multiplayer can subscribe to.
6. The engine MUST be fully testable without any UI or network infrastructure.
7. The engine MUST NOT import or reference any React, React Native, or DOM APIs.

## Parent
- Root node (`.spec-tree/root/`)
- Inherits: game format (lane-control simultaneous strategy), round structure, VP system, comeback rules, active play enforcement

## Children (Depth 2 — If Needed)
If this node becomes too large, it may split into:
- Card System (card types, deck, draw mechanics)
- Round Engine (phase transitions, lane resolution)
- Achievement System (definitions, checking, rewards)
- Game State Manager (state creation, serialization, queries)

These will only be created if this node's implementation becomes unwieldy as a single unit. Initial attempt is to build as one cohesive module with internal separation.

## Key Constraints from Parent
1. Match = fixed rounds (10–12), no early termination.
2. Must assign ≥1 card per round (active play enforcement, -1 VP penalty if not).
3. Comeback bonuses for trailing players (extra draw + comeback card).
4. "Control All Lanes" achievement: team-only in 2v2; "Dominate 3 Lanes" in FFA.
5. Hidden information: planned assignments are hidden until reveal.
6. Bluffing must be viable; tactic cards provide non-linear effects.
7. Hand management must matter.
8. Lane choices must involve risk assessment.
9. State must be serializable for future multiplayer sync.

## Success Criteria
1. Engine compiles with strict TypeScript (no `any`, no implicit any).
2. All types are defined and coherent.
3. Round lifecycle produces correct state transitions in unit tests.
4. Lane resolution correctly handles wins, ties, sabotages, and special cards.
5. Comeback bonuses correctly target trailing players.
6. Active play enforcement penalizes skipped assignments.
7. Achievements trigger under correct conditions and only once per match.
8. All state is JSON-serializable.
9. No UI imports exist in any game logic file.
10. Public API exports all necessary types and functions.
