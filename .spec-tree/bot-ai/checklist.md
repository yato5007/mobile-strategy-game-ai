# Bot and AI System — Checklist

> Check items off as they are completed.

## Types and Interfaces

- [ ] 1. `BotConfig` type defined with `difficulty` and `style` fields.
- [ ] 2. `BotController` interface defined with `decide(gameState, playerId, config): CardAssignment[]` method.
- [ ] 3. `BotRegistry` class/module created that maps (difficulty × style) to concrete bot implementations.
- [ ] 4. All types exported from a public index file for use by other systems.

## Difficulty Levels

- [ ] 5. Easy difficulty bot implemented (±30% noise, no opponent awareness, no bluffing, plays strongest card first).
- [ ] 6. Normal difficulty bot implemented (±10% noise, basic opponent awareness, 10% bluff rate).
- [ ] 7. Hard difficulty bot implemented (±3% noise, 2-round lookahead, active counter-play, 25% bluff rate).
- [ ] 8. Expert difficulty bot implemented (0% noise, full match lookahead, opponent prediction, 35% bluff rate).

## Strategic Styles

- [ ] 9. Aggressive style implemented (high weight on strength, prefers contesting high-value lanes).
- [ ] 10. Defensive style implemented (high weight on conservation, prefers shield/retreat tactics).
- [ ] 11. Balanced style implemented (adapts to game state, no strong preferences).
- [ ] 12. Disruptive style implemented (targets leader, prioritizes denial over own VP).
- [ ] 13. Objective-focused style implemented (prioritizes objective bonus lanes, saves objective cards).
- [ ] 14. Comeback-focused style implemented (aggressive when trailing, conservative when leading).
- [ ] 15. Team-support style implemented (2v2 coordination, sacrifices own VP for team VP, defaults to Balanced in FFA).

## Game Mode Integration

- [ ] 16. Bots work correctly in FFA mode (1v1v1v1) with 1, 2, 3, or 4 bots.
- [ ] 17. Bots work correctly in 2v2 mode with team-aware lane assignments.
- [ ] 18. Team-support style bots correctly coordinate with bot and human teammates in 2v2 mode.

## Fairness and Rules Compliance

- [ ] 19. Bots do NOT access hidden information (opponent hand contents, current assignments, unrevealed future objectives).
- [ ] 20. Bots follow the same submission rules as human players (validated by `validateAssignment`).
- [ ] 21. Bots always assign at least 1 card per round (no intentional skipping).
- [ ] 22. Bots respect `MAX_CARDS_PER_LANE` limit (max 3 cards per lane per player).

## Configuration and Pre-Game Setup

- [ ] 23. Bot difficulty and style are configurable before match start (via `GameConfig`).
- [ ] 24. Default bot configuration exists (e.g., Normal + Balanced for quick matches).
- [ ] 25. Each player slot can independently choose bot vs. human + difficulty + style.

## Integration

- [ ] 26. Bots are integrated with the game engine — `bot.decide()` is called during the planning phase for each bot slot.
- [ ] 27. Bot assignments are submitted via `submitAssignments()` just like human players.
- [ ] 28. Mock multiplayer can use bots to fill empty slots automatically.
- [ ] 29. Balance simulator can configure and run bots programmatically for automated testing.

## Robustness

- [ ] 30. Bot handles edge case: hand is empty (returns empty assignments, engine handles penalty).
- [ ] 31. Bot handles edge case: all lanes are inactive (only possible if no lanes exist — engine guarantees at least 3).
- [ ] 32. Bot handles edge case: opponent disconnected (continues normally).
- [ ] 33. Bot computation completes within the planning phase time limit (<1 second on mobile hardware).

## Testing

- [ ] 34. Unit tests exist for each difficulty level (verifying noise range, evaluation depth).
- [ ] 35. Unit tests exist for each style (verifying preference patterns in controlled game states).
- [ ] 36. Integration test: 4 bots (all same config) complete a full match without errors.
- [ ] 37. Integration test: 4 bots (mixed difficulties and styles) complete a full match without errors.
- [ ] 38. Integration test: 2 human + 2 bots in 2v2 mode complete without errors.
- [ ] 39. Determinism test: same config + same seed → same assignment output (for reproducibility).
- [ ] 40. Noise validation test: Easy bot decisions show significantly higher variance than Expert bot decisions.
