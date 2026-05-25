# Bot and AI System — Analysis

## 1. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Bots are too predictable** — players learn to exploit fixed heuristics | Medium | Style × Difficulty combinations create 28 distinct bot behaviors. Rotating objectives add variability. Balance simulator tests detect exploitability. |
| **Heuristic system favors one play style** — bots of all styles converge to similar decisions | High | Weight profiles must be designed to produce genuinely distinct play patterns. Reviewer MUST test that Aggressive and Defensive bots make observably different choices in the same game state. |
| **Expert bots are unbeatable** — too strong, discouraging players | Medium | Expert bots are intentionally near-perfect within the heuristic model. Their strength can be tuned by adjusting noise floor or limiting lookahead. Configurable difficulty allows players to choose appropriate challenge. |
| **2v2 team coordination is too weak** — bots don't cooperate effectively | Medium | Team-support style explicitly addresses this. If testing shows poor coordination, the shared state protocol can be enhanced. Initial implementation uses simple complementary lane assignment. |
| **Noise-based difficulty feels artificial** — Easy bots just make "dumb" mistakes rather than playing weaker strategy | Low | Acceptable trade-off for simplicity. The alternative (separate evaluation models per difficulty) is significantly more complex. Noise creates sufficient realism for a mobile game. |
| **Bot decision time exceeds planning phase limit** — never submits | Low | Bot computation is O(cards × lanes), dominated by small numbers (max 10 cards × 5 lanes = 50 evaluations). Even on mobile hardware, this completes in <100ms. If needed, add a timeout fallback. |
| **Memory leaks from bot instances** in long simulation runs | Low | Bot instances are stateless functions — no persistent state. The game state snapshot is ephemeral. Risk is negligible. |

---

## 2. Dependencies

### Required (must exist before bot implementation)

| Dependency | Source | What It Provides |
|---|---|---|
| `GameState` type | core-game-logic/types.ts | Complete game state structure |
| `Card`, `CardAssignment`, `LaneState` types | core-game-logic/types.ts | Card and lane data structures |
| `submitAssignments` function | core-game-logic/engine.ts | How bots submit their decisions |
| `getStandings` function | core-game-logic/state.ts | VP standings for opponent-aware decisions |
| `getActiveLaneCount`, `getLaneObjectiveForRound` | core-game-logic/state.ts | Lane evaluation data |
| `cloneGameState` function | core-game-logic/state.ts | Bot-safe state snapshot (no mutation of real state) |
| `PlayerState.isBot` field | core-game-logic/types.ts | Engine bookkeeping for bot identification |

### Optional (enhance bot quality if available)

| Dependency | Source | What It Provides |
|---|---|---|
| Previous round reveal data | Game events from engine history | Opponent pattern learning |
| Card pool data (which cards are in rotation) | core-game-logic/constants.ts | Better card value estimation |

### Dependent (systems that depend on bots)

| System | What Bots Provide |
|---|---|
| **Balance Testing** | Bot instances for automated simulation |
| **Mock Multiplayer** | Bot-filled player slots for local testing |
| **UI & UX** | Bot configuration in lobby screen |
| **Game Engine** | Bot submit flow (identical to human) |

---

## 3. Key Decisions

All decisions documented in `DECISIONS.md` — key bot-related decisions:

### D006: Weighted Heuristic System (Not ML)
- **Why**: Predictable, testable, no training data needed.
- **Impact**: Bot behavior is fully deterministic (with controlled noise).

### D004: Comeback Mechanic
- **Impact on bots**: Trailing-position evaluation influences lane selection + card conservation.

### D005: 2v2 Team Model
- **Impact on bots**: Shared info protocol between bot teammates.

### D008: Anti-Dominant Strategy
- **Impact on bots**: Bot diversity (7 styles × 4 difficulties) is a key defense against dominant strategies. Balance simulator uses bots to test.

---

## 4. Edge Cases

| Edge Case | Resolution |
|---|---|
| **Bot hand is empty** (shouldn't happen by rules, but defensive) | Fallback: submit a single-card assignment of any card from discard pile? No — rules don't allow that. Better: return empty array; engine assigns penalty. Document as impossible under normal game flow. |
| **All opponents are bots** | Normal operation. Bots play against each other fully. Used for balance testing. |
| **Mixed human + bot players** | Bots play at their configured difficulty/style. Humans play normally. No special handling needed. |
| **Bot disconnects mid-game** | Engine's `forceSubmitRemaining` handles missing submissions. Bot reconnection is out of scope (future online multiplayer concern). |
| **Bot assigned to a lane that becomes inactive mid-round** | Impossible — lane activity is determined at round start and doesn't change mid-round. |
| **Bot difficulty changed mid-match** | Not allowed. Configuration is set at match creation. Bot behavior must be consistent for the entire match. |
| **Extreme score gap (>10 VP)** | Bot's comeback evaluation should activate more aggressively. If gap is insurmountable, bot shifts to "spoil" mode (focus on denying VP to the leader). |
| **Bot receives corrupted game state** | Defensive programming: null-check all accessed properties. Return a safe default assignment (first valid card to first active lane). |

---

## 5. Algorithmic Complexity

- **Worst case**: 10 cards in hand × 5 lanes = 50 (card, lane) pairs to evaluate.
- **Per evaluation**: ~10 arithmetic operations + 2 weight lookups.
- **Total operations per bot per round**: ~500 operations.
- **Memory per decision**: ~2KB (temporary scoring arrays).
- **Expected execution time**: <10ms on modern mobile hardware.

No performance concerns. The heuristic approach is lightweight.

---

## 6. Test Strategy

| Test Type | What to Test |
|---|---|
| **Unit tests** | Each difficulty level produces expected noise range. Each style produces expected preference patterns. |
| **Integration tests** | Bot submits valid assignments through `submitAssignments`. Engine accepts bot assignments. |
| **FFA tests** | Bot operates correctly with 3 other bots (any config). No crashes, all submit. |
| **2v2 tests** | Bot teammates coordinate. Team-support bots demonstrate cooperative behavior. |
| **Edge case tests** | Bot with empty hand (error handling). Bot during disconnect. Bot at extreme VP gaps. |
| **Determinism tests** | Same config + same seed produces same decisions (for reproducibility). |
| **Noise validation tests** | Easy bot has significantly higher variance in decisions than Expert bot. |

---

## 7. Open Questions

1. Should bots have a "personality name" displayed in the UI (e.g., "The Tactician" for Expert + Balanced)?
2. Should bot difficulty be adjustable between rounds (currently not, but could be a feature)?
3. Should the bot registry support custom/modded bot behaviors?
4. How should bot performance be reported back to the balance simulator beyond win/loss?
   - Proposed: Log all bot decisions + reasoning for post-match analysis.
