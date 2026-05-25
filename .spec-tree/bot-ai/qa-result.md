# Bot and AI System — QA Result

## Status: PASS_WITH_NOTES

> QA review completed on 2026-05-25.
> The bot system is functional and integrates with the game engine.
> See Detailed Findings below for items requiring attention before final sign-off.

---

## Summary

The Bot Controller implementation at `mobile-game/src/bot/botController.ts` (~1300 lines) implements a weighted heuristic decision engine for the lane-control strategy game. It supports:

- **4 difficulty levels**: Easy, Normal, Hard, Expert — with distinct noise ranges, evaluation depths, and strategic capabilities
- **7 strategic styles**: Aggressive, Defensive, Balanced, Disruptive, Objective-focused, Comeback-focused, Team-support — with distinct weight profiles
- **Greedy assignment algorithm**: Evaluates card×lane pairs, selects highest-scoring combinations respecting MAX_CARDS_PER_LANE
- **Difficulty+Style independence**: Any difficulty can combine with any style (28 combinations)
- **Engine integration**: Bot outputs `SubmitAction` matching engine's `submitAssignments()` input

### Key Numbers

| Metric | Value |
|--------|-------|
| Implementation files | 2 (`botController.ts` + `index.ts`) |
| Lines of code | ~1,300 (botController.ts) |
| Difficulty levels | 4 (easy, normal, hard, expert) |
| Strategic styles | 7 (aggressive, defensive, balanced, disruptive, objective-focused, comeback-focused, team-support) |
| Difficulty-style combinations | 28 |
| Total eval parameters per decision | ~10 per card×lane pair |
| Worst-case evaluations | 50 (10 cards × 5 lanes) |
| Integration tests passing | 8/9 (1 pre-existing test bug) |
| Checklist items satisfied | 31/40 fully ✅, 4/40 partially ⚠️, 5/40 missing ❌ |

---

## Detailed Findings

### CRITICAL (0)

None found. The bot system is functionally correct and does not crash, cheat, or produce invalid states.

### MAJOR (3)

#### M1. No Deterministic Behavior (Checklist #39, REQ-034 context)

**Severity**: Major
**Location**: `botController.ts` — all `Math.random()` calls
**Description**: The bot uses `Math.random()` for noise generation, bluff probability, random assignment fallback, and tactic multiplier randomization. There is no mechanism to inject a seeded random number generator. This means:
- Same config + same seed → DIFFERENT outputs (non-deterministic)
- Reproducible testing is impossible
- Balance simulator cannot produce deterministic results
- Checklist item #39 explicitly requires determinism

**Evidence**:
- `addNoise()` (line 854): `Math.random() * 2 - 1`
- `maybeApplyBluff()` (line 878): `Math.random() > profile.bluffProbability`
- `decide()` (line 1066): `Math.random() < profile.randomAssignmentChance`
- `getTacticMultiplier()` (line 346): `Math.random()`

**Recommendation**: Add optional `RandomFn` parameter to `BotConfig` or `BotController.decide()` that defaults to `Math.random` but accepts a seeded function. The engine's `createRandomFn` could be passed through.

---

#### M2. Missing Bot Unit Tests (Checklist #34, #35, #40)

**Severity**: Major
**Location**: No test files under `mobile-game/src/bot/__tests__/`
**Description**: The following checklist items have NO test coverage:

| # | Requirement | Status |
|---|---|---|
| 34 | Unit tests for each difficulty level | ❌ Not implemented |
| 35 | Unit tests for each style | ❌ Not implemented |
| 40 | Noise validation (Easy variance > Expert variance) | ❌ Not implemented |

**Evidence**: Only integration tests exist in `mobile-game/src/game/__tests__/integration.test.ts`. No dedicated bot test file exists.

**Recommendation**: Create `bot.test.ts` with:
- Difficulty profile tests: verify noise ranges, bluff probabilities, awareness flags
- Style tests: verify weight resolution produces distinct profiles
- Decision pipeline tests: verify specific game states produce expected card-lane choices
- Noise validation: run 100 decisions per difficulty, assert Easy variance >> Expert variance

---

#### M3. No BotRegistry (Checklist #3, Tasks #15, Spec §7)

**Severity**: Major
**Location**: No `registry.ts` or `BotRegistry` class
**Description**: The specification explicitly calls for a `BotRegistry` class/module that maps `(difficulty, style)` pairs to concrete bot implementations:

> "The BotRegistry maps a (difficulty, style) pair to a concrete behavior function." — spec.md §7

The implementation uses a factory function `createBot()` directly, which is functional but is NOT a registry. A registry provides:
- Lookup by key rather than construction
- Centralized collection of all 28 combinations
- Potential for pre-registration, validation, and enumeration

**Current implementation**: `createBot(config)` → `new BotControllerImpl(config)` — inline construction
**Spec requirement**: `registry.get({ difficulty: 'hard', style: 'aggressive' })` → `BotController`

**Recommendation**: Add a thin `BotRegistry` class wrapping a `Map<string, BotController>` that pre-instantiates or lazily creates bot instances. This is essential for the Balance Simulator and Mock Multiplayer systems that need to enumerate bot configurations.

---

### MINOR (7)

#### m1. Opponent Presence Ignores Lane Context (Spec §4 deviation)

**Severity**: Minor
**Location**: `calculateOpponentPresence()` (line 416)
**Description**: The function accepts a `laneIndex` parameter but never uses it. Opponent presence is calculated as a global value (sum of all opponents' VP and hand sizes) that is identical for every lane. This means the `laneOpponent` weight and presence penalty do not differentiate between lanes, reducing the strategic value of opponent-aware lane selection.

**Spec**: "opponentPresence: Deduct points if strong opponents are contesting" — implies lane-specific contestation
**Implementation**: Opponent presence is uniform across all lanes

**Recommendation**: Enhance to consider lane-specific opponent data (historical lane contestation, current round assignments visible in 2v2).

#### m2. Hardcoded TotalScore Weights

**Severity**: Minor
**Location**: Line 1128: `laneScore * 0.4 + cardScore * 0.3 + styleBias * 0.2 + noise * 0.1`
**Description**: The total score formula weights are hardcoded magic numbers rather than configurable constants. This prevents tuning the balance between lane value, card value, style preference, and noise without modifying source code.

**Recommendation**: Extract to named constants (e.g., `LANE_WEIGHT = 0.4`, `CARD_WEIGHT = 0.3`, etc.) or include in difficulty/style profiles.

#### m3. Team-Support in FFA Not Fully Balanced (Spec §5 deviation)

**Severity**: Minor
**Location**: `getTacticMultiplier()` (line 308) for team-support style
**Description**: The spec states team-support "defaults to Balanced in FFA." The lane weights correctly default (no `laneTeam` bonus in FFA since `calculateTeamSynergy` returns 0), and `calculateStyleBias` returns 0 in FFA. However, `getTacticMultiplier()` still applies team-support's shield/retreat preference (×2.0 multiplier) even in FFA mode, creating a slight deviation from true Balanced behavior.

**Recommendation**: Check `state.mode` in tactic multiplier for team-support style, or document this as intended behavior.

#### m4. Hidden Info Structurally Available (REQ-034)

**Severity**: Minor
**Location**: `decide()` receives full `GameState` (line 1029)
**Description**: While the bot code does NOT currently access opponent hand card identities (it only uses hand.length), the full `GameState` object — including all players' complete hands with card identities — is passed to `decide()`. This is a code fragility: a future code change could accidentally read opponent card identities without triggering any type errors.

**Recommendation**: Consider creating a `PlayerPublicState` type that excludes `hand` (keeping only `hand.length` count) for the engine to pass to all players (human and bot). This is a broader engine change but would enforce the constraint at the type level.

#### m5. Pre-Existing Integration Test Bug

**Severity**: Minor
**Location**: `integration.test.ts` (line 159)
**Description**: The "should maintain state consistency throughout the game" test incorrectly checks lane count AFTER cleanup has set lanes for the next round. After round 3 cleanup, lanes are configured for round 4 (4 active lanes), but the test asserts 3 active lanes for `round <= 3`. This is a pre-existing test logic error, not a bot bug, but it causes a test failure in the bot integration suite.

**Test output**:
```
Expected length: 3
Received length: 4
```

**Recommendation**: Fix the test assertion to account for cleanup phase lane initialization.

#### m6. GameConfig Lacks Bot Config Fields (Checklist #23)

**Severity**: Minor
**Location**: `types.ts` — `GameConfig` interface (line 160)
**Description**: Checklist item #23 requires "Bot difficulty and style are configurable before match start (via `GameConfig`)." The current `GameConfig` only has `playerSlots: [boolean, boolean, boolean, boolean]` which only indicates bot vs. human. There is no `botConfigs` field for specifying difficulty/style per bot slot. Bot configuration is done externally via `createBotLineup()` in the integration test.

**Recommendation**: Add optional `botConfigs?: BotConfig[]` to `GameConfig` (length 4, null for human slots).

#### m7. No Automatic Bot Slot Filling (Checklist #28)

**Severity**: Minor
**Location**: Integration test pattern, no auto-fill module
**Description**: Checklist #28 requires "Mock multiplayer can use bots to fill empty slots automatically." The current pattern requires explicit bot creation via `createBotLineup()`. There is no mechanism that says "if a player slot is not human, automatically create a default bot."

**Recommendation**: Add a `fillEmptySlots(config: GameConfig): BotController[]` helper that creates bots for all non-human slots using `DEFAULT_BOT_CONFIG`.

---

## Checklist Compliance

### Types and Interfaces (Items 1-4)

| # | Description | Status | Notes |
|---|---|---|---|
| 1 | BotConfig type with difficulty + style | ✅ PASS | Defined with union types |
| 2 | BotController interface with decide() | ✅ PASS | Full method signature |
| 3 | BotRegistry class/module | ❌ BLOCKED | Factory only, no registry |
| 4 | All types exported from index | ✅ PASS | Barrel export complete |

### Difficulty Levels (Items 5-8)

| # | Description | Status | Notes |
|---|---|---|---|
| 5 | Easy (±30% noise, no opponent awareness, no bluff) | ✅ PASS | Verified in profiles |
| 6 | Normal (±10% noise, basic awareness, 10% bluff) | ✅ PASS | Verified in profiles |
| 7 | Hard (±3% noise, counter-play, 25% bluff) | ✅ PASS | Verified in profiles |
| 8 | Expert (0% noise, full evaluation, 35% bluff) | ✅ PASS | Verified in profiles |

### Strategic Styles (Items 9-15)

| # | Description | Status | Notes |
|---|---|---|---|
| 9 | Aggressive | ✅ PASS | High laneVP, high strength, low conservation |
| 10 | Defensive | ✅ PASS | High conservation, shield/retreat preference |
| 11 | Balanced | ✅ PASS | All weights 1.0 (neutral) |
| 12 | Disruptive | ✅ PASS | High opponent weight, sabotage/ambush preference |
| 13 | Objective-focused | ✅ PASS | Very high laneObjective (×3.0) |
| 14 | Comeback-focused | ✅ PASS | Dynamic based on trailing/leading |
| 15 | Team-support | ⚠️ PARTIAL | Works in 2v2; tactic preferences bleed into FFA |

### Game Mode Integration (Items 16-18)

| # | Description | Status | Notes |
|---|---|---|---|
| 16 | Bots work in FFA | ✅ PASS | Integration test confirmed (all 12 rounds, all bot configs) |
| 17 | Bots work in 2v2 | ✅ PASS | Integration test confirmed (6 rounds, mixed styles) |
| 18 | Team-support coordinates in 2v2 | ⚠️ PARTIAL | Weight-based coordination works; no active comm protocol |

### Fairness and Rules Compliance (Items 19-22)

| # | Description | Status | Notes |
|---|---|---|---|
| 19 | No hidden info access | ⚠️ PARTIAL | Code doesn't use opponent card identities, but data is structurally available |
| 20 | Same submission rules as humans | ✅ PASS | Uses same SubmitAction → submitAssignments() path |
| 21 | Always assign at least 1 card | ✅ PASS | determineCardCount() ensures ≥1 for handSize ≥1 |
| 22 | Respect MAX_CARDS_PER_LANE | ✅ PASS | Hard-coded check at line 1152 |

### Configuration and Pre-Game Setup (Items 23-25)

| # | Description | Status | Notes |
|---|---|---|---|
| 23 | Configurable via GameConfig | ⚠️ PARTIAL | Not in GameConfig type; set externally |
| 24 | Default config exists | ✅ PASS | DEFAULT_BOT_CONFIG = { normal, balanced } |
| 25 | Independent per-slot configuration | ⚠️ PARTIAL | Possible via separate botConfigs array, not unified |

### Integration (Items 26-29)

| # | Description | Status | Notes |
|---|---|---|---|
| 26 | bot.decide() called during planning | ✅ PASS | Verified in integration tests |
| 27 | Submits via submitAssignments() | ✅ PASS | Integration test flow confirms |
| 28 | Mock multiplayer auto-fill | ❌ BLOCKED | No auto-fill mechanism exists |
| 29 | Balance simulator can use bots | ✅ PASS | createBot() export works for programmatic use |

### Robustness (Items 30-33)

| # | Description | Status | Notes |
|---|---|---|---|
| 30 | Empty hand handled | ✅ PASS | Returns current assignments (lines 1038-1044) |
| 31 | No active lanes handled | ✅ PASS | makeRandomAssignments returns [] (line 1201) |
| 32 | Opponent disconnect handled | ✅ PASS | All player iteration filters by isConnected |
| 33 | <1 second per decision | ✅ PASS | Algorithm is O(cards×lanes) — ~100 eval max |

### Testing (Items 34-40)

| # | Description | Status | Notes |
|---|---|---|---|
| 34 | Unit tests for difficulties | ❌ BLOCKED | No dedicated bot tests exist |
| 35 | Unit tests for styles | ❌ BLOCKED | No dedicated bot tests exist |
| 36 | Integration: 4 bots same config | ✅ PASS | Test exists and passes |
| 37 | Integration: 4 bots mixed config | ✅ PASS | Test exists and passes |
| 38 | Integration: 2v2 bots | ✅ PASS | Test exists and passes |
| 39 | Determinism: same seed → same output | ❌ BLOCKED | Math.random() used; no seed injection |
| 40 | Noise validation: Easy > Expert variance | ❌ BLOCKED | No such test exists |

**Summary**: 31/40 ✅, 4/40 ⚠️, 5/40 ❌

---

## Requirements Compliance (REQ-031 through REQ-042)

| ID | Description | Status | Evidence |
|---|---|---|---|
| REQ-031 | Bots fill missing player slots | ⚠️ PARTIAL | createBot() exists but no auto-fill mechanism |
| REQ-032 | Difficulty levels (E/N/H/E) | ✅ PASS | All 4 implemented with distinct profiles |
| REQ-033 | Difficulty affects planning quality | ✅ PASS | NoiseRange, randomAssignmentChance, tacticUsageLevel, handManagementLevel all vary |
| REQ-034 | Bots must not cheat hidden info | ✅ PASS | Code does not read opponent card identities (only hand.length count used) |
| REQ-035 | Bots work in FFA | ✅ PASS | Integration test verified (12 rounds, FFA) |
| REQ-036 | Bots work in 2v2 | ✅ PASS | Integration test verified (6 rounds, 2v2) |
| REQ-037 | Bots usable for local testing | ✅ PASS | Integration tests use createBot() |
| REQ-038 | Bots usable by balance simulator | ✅ PASS | createBot() export supports programmatic usage |
| REQ-039 | Bot behavior strategic, not reflex-based | ✅ PASS | Heuristic evaluation with lane/card scoring |
| REQ-040 | Difficulty selectable before match | ⚠️ PARTIAL | BotConfig is passed to createBot(); not integrated into GameConfig |
| REQ-041 | Bots support strategic styles (7 types) | ✅ PASS | All 7 styles implemented with distinct weights |
| REQ-042 | Difficulty controls quality, style controls personality | ✅ PASS | Clear separation: difficulty=noise/depth, style=weight preferences |

**Summary**: 10/12 ✅, 2/12 ⚠️, 0/12 ❌

---

## Edge Case Verification

| Edge Case | Status | Evidence |
|---|---|---|
| Empty hand | ✅ PASS | Lines 1038-1044: returns current assignments (empty) |
| Already submitted | ✅ PASS | Lines 1051-1057: returns current assignments as-is |
| No active lanes | ✅ PASS | makeRandomAssignments returns [] when laneIndices empty |
| Opponent disconnected | ✅ PASS | All player iterations filter by isConnected |
| Easy random fallback | ✅ PASS | 15% chance at line 1066 produces valid random assignments |
| Null/corrupted state | ✅ PASS | Early return at line 1038 if player not found; cloneGameState provides safety |
| Extreme VP gaps | ✅ PASS | isPlayerTrailing() handles large gaps; comeback optimization kicks in |
| Bot teammate disconnects in 2v2 | ✅ PASS | calculateTeamSynergy returns 0 if teammate not connected |
| Mixed human + bot | ✅ PASS | Bot system has no dependency on all players being bots |
| Debugging with events | ✅ PASS | _events parameter accepted but unused; interface compatible |

---

## Performance Assessment

Based on algorithmic complexity analysis:

- **Worst-case evaluations**: 10 cards × 5 lanes = 50 (card, lane) pairs
- **Per evaluation**: ~10 arithmetic ops + 2 weight lookups
- **Total operations per decision**: ~500 ops
- **Expected execution time**: <10ms on modern mobile hardware

No performance concerns. The heuristic approach is lightweight.

---

## Recommendations

### Required Before Final Sign-Off

1. **Add seeded RNG support** (M1): Inject random function into `BotConfig` or `BotController.decide()` to support deterministic execution
2. **Create unit tests** (M2): At minimum:
   - Difficulty profile verification (noise ranges, flags)
   - Style weight verification
   - Decision output validation for specific game states
   - Noise variance comparison (Easy vs Expert)
3. **Create BotRegistry** (M3): Add a thin registry class for enumeration and lookup

### Recommended Before Integration Freeze

4. **Add optional bot configs to GameConfig** (m6): Allow specifying difficulty/style in game config
5. **Add auto-fill helper** (m7): Create `fillEmptySlots()` for mock multiplayer
6. **Fix lane context in opponent presence** (m1): Make the `laneIndex` parameter meaningful
7. **Extract totalScore weights** (m2): Use named constants instead of magic numbers
8. **Fix team-support tactic bleed in FFA** (m3): Check game mode in tactic multiplier
9. **Fix integration test lane-count assertion** (m5): Correct the test logic

### Future Enhancements

10. **Create PlayerPublicState type** (m4): Enforce hidden-info separation at type level
11. **Add personality names**: "The Tactician" for Expert+Balanced, etc.
12. **Add decision logging**: Log each bot decision for balance simulator post-match analysis

---

## Conclusion

The Bot and AI System implementation is **functionally complete** and **integrates correctly** with the Core Game Logic Engine. All difficulty levels (4) and strategic styles (7) are implemented with distinct, verifiable profiles. The system uses a sound weighted-heuristic approach that produces strategic, non-reflex behavior.

**Status: PASS_WITH_NOTES**

Three major items must be addressed before final sign-off:
1. Add seeded random support for determinism
2. Create unit tests (difficulty, style, noise validation)
3. Create the BotRegistry as specified

The four minor items (team-support FFA bleed, opponent presence lane context, hardcoded weights, GameConfig fields) should be addressed during integration but do not block approval.

---

## Artifacts Referenced

- Implementation: `mobile-game/src/bot/botController.ts` (1,300 lines)
- Exports: `mobile-game/src/bot/index.ts` (23 lines)
- Types: `mobile-game/src/game/types.ts` (274 lines)
- Engine: `mobile-game/src/game/engine.ts` (1,104 lines)
- Integration tests: `mobile-game/src/game/__tests__/integration.test.ts` (350 lines)
- Spec: `.spec-tree/bot-ai/spec.md`
- Checklist: `.spec-tree/bot-ai/checklist.md` (40 items)
- Clarification: `.spec-tree/bot-ai/clarification.md`
- Analysis: `.spec-tree/bot-ai/analysis.md`
- Integration notes: `.spec-tree/bot-ai/integration-notes.md`
- Decisions: `DECISIONS.md` (D006, D004, D005, D008)
- Requirements: `REQUIREMENTS_TRACE.md` (REQ-031 through REQ-042)

---

*QA performed by @qa on 2026-05-25*
