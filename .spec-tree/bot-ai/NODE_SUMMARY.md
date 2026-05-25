# Bot and AI System — Node Summary

## Purpose

Design and implement strategic AI opponents (bots) for the mobile strategy game. Bots fill empty player slots, provide practice opponents, and enable automated testing through the balance simulator.

## Parent Link

- **Parent node**: `root` (project root)
- **Dependency node**: `core-game-logic` (depth 1) — provides game state, card data, lane data, engine functions
- **Consumed by**: `balance-testing` (depth 1, sibling), `multiplayer-system` (depth 1, sibling), `ui-and-ux` (depth 1, sibling)

## Decisions Made

| Decision | Reference | Summary |
|---|---|---|
| Weighted heuristic system (not ML) | D006 | Predictable, testable, no training data needed |
| 4 difficulty levels (Easy/Normal/Hard/Expert) | D006, GAME_CONSTRAINTS §Bot 3-4 | Covers all required difficulties |
| 7 strategic styles | D006, GAME_CONSTRAINTS §Bot Style | Includes all required examples |
| Difficulty = decision quality, Style = personality | D006 | Clear separation of concerns |
| No hidden info access | D006, GAME_CONSTRAINTS §Bot 6 | Bots use same GameState as humans |
| Bot coordination via shared state in 2v2 | D005 | Teammates see each other's hands/assignments |
| Single-file implementation | Implementation | Keeps all bot logic in `botController.ts` for simplicity |
| Greedy assignment algorithm | Implementation | Fast, predictable, adequate for all difficulty levels |
| Bluff as post-processing step | Implementation | Keeps core scoring clean; strategic distortion applied after optimal scoring |

## Alternatives Rejected

| Alternative | Reason for Rejection |
|---|---|
| Machine learning bots | Requires training data, infrastructure, overkill |
| Pure rule-based bots | Too rigid, easy to exploit |
| Monte Carlo simulation bots | Computationally heavy for mobile, over-engineered |
| Only 3 difficulty levels | GAME_CONSTRAINTS requires E/N/H/E minimum |
| Only 3-4 styles | GAME_CONSTRAINTS specifies 7 required types |
| Bots with privileged info | Explicitly forbidden — would violate fairness |
| Multi-file split for each style + difficulty | Unnecessary complexity at this stage; single file is simpler to integrate and test |

## Dependencies

- **Core Game Logic Engine** — `GameState`, `CardAssignment`, `SubmitAction`, `Card`, `PlayerState`, `LaneState`, `cloneGameState`, `getStandings`
- **TypeScript** — Language for implementation
- **Existing types** — `PlayerState.isBot` field, `GameConfig.playerSlots` array

## Integration Risks

| Risk | Notes |
|---|---|
| Bot engine must not modify game state directly | BotController clones state at start of `decide()` via `cloneGameState()` |
| Bot decision timing must be bounded | Algorithm is O(cards × lanes) — worst case ~20 cards × 5 lanes = 100 evaluations. Well under 100ms. |
| Bot must not expose hidden info to UI | The UI branch must not render bot "thoughts" that reveal hidden info |
| Balance simulator depends on bot API | Bot API is stable via `createBot()` factory and `BotController` interface |

## Implementation Status

- **Spec Kit**: Constitution ✅, Specification ✅, Plan ✅, Tasks ✅
- **Clarification**: ✅
- **Analysis**: ✅
- **Checklist**: ✅
- **Implementation**: ✅ (botController.ts + index.ts — ~705 lines total)
- **QA**: NOT_STARTED
- **Review**: NOT_STARTED
- **Integration**: Placement notes written (see integration-notes.md)

## Tests

Planned tests (not yet implemented):

- Unit tests for each difficulty level (noise range, evaluation depth, bluff probability).
- Unit tests for each style (weight multipliers, bias calculations).
- Integration tests for FFA and 2v2 modes.
- Determinism test (same seed → same output — note: current implementation uses `Math.random()`, seed-based RNG would need to be injected).
- Performance test (<100ms per bot decision).

## Next Step

1. Create comprehensive tests (Task 19) — unit tests for heuristics, difficulty profiles, style weights, and full decision pipeline.
2. Integrate with game engine — add `runPlanningPhase()` orchestrator.
3. QA review of bot decisions across all difficulty × style combinations.
4. Reviewer sign-off on the bot system.

## Node State

**Current state**: IN_PROGRESS (implementation complete, testing and integration pending)
**Children**: None (leaf node — implementable at this level)
