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

## Alternatives Rejected

| Alternative | Reason for Rejection |
|---|---|
| Machine learning bots | Requires training data, infrastructure, overkill |
| Pure rule-based bots | Too rigid, easy to exploit |
| Monte Carlo simulation bots | Computationally heavy for mobile, over-engineered |
| Only 3 difficulty levels | GAME_CONSTRAINTS requires E/N/H/E minimum |
| Only 3-4 styles | GAME_CONSTRAINTS specifies 7 required types |
| Bots with privileged info | Explicitly forbidden — would violate fairness |

## Dependencies

- **Core Game Logic Engine** — `GameState`, `CardAssignment`, `submitAssignments`, `getStandings`, card types, lane types
- **TypeScript** — Language for implementation
- **Existing types** — `PlayerState.isBot` field, `GameConfig.playerSlots` array

## Integration Risks

| Risk | Notes |
|---|---|
| Bot engine must not modify game state directly | Bots use `cloneGameState` or equivalent read-only snapshot |
| Bot decision timing must be bounded | Worst-case <100ms on mobile; add timeout fallback if needed |
| Bot must not expose hidden info to UI | The UI branch must not render bot "thoughts" that reveal hidden info |
| Balance simulator depends on bot API | Bot interface must be stable before balance branch begins |

## Implementation Status

- **Spec Kit**: Constitution ✅, Specification ✅, Plan ✅, Tasks ✅
- **Clarification**: Completed (this cycle)
- **Analysis**: Completed (this cycle)
- **Checklist**: Created (this cycle)
- **Implementation**: NOT_STARTED
- **QA**: NOT_STARTED
- **Review**: NOT_STARTED
- **Integration**: Placement notes written (this cycle)

## Tests

- Unit tests for each difficulty level (noise range, evaluation depth).
- Unit tests for each style (preference patterns).
- Integration tests for FFA and 2v2 modes.
- Determinism test (same seed → same output).
- Performance test (<1 second per bot decision).

## Next Step

Implement tasks in order:
1. Task 1-3: Bot types, interface, evaluation heuristics.
2. Task 4-7: Difficulty levels (Easy → Expert).
3. Task 8-14: Strategic styles.
4. Task 15: BotRegistry.
5. Task 16: Engine integration.
6. Task 17-19: Testing.

## Node State

**Current state**: IN_PROGRESS (Spec Kit phase nearly complete, implementation pending)
**Children**: None (leaf node — implementable at this level)
