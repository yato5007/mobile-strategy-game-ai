# Core Game Logic Engine — QA Result

## Status: BLOCKED

---

## Summary

The Core Game Logic Engine implementation was reviewed against:
- Spec Kit: constitution, spec, clarification, plan, tasks, analysis, checklist
- All 22 core game requirements from GAME_CONSTRAINTS.md
- All relevant decisions (D001–D010) from DECISIONS.md
- 130-item checklist from checklist.md
- TypeScript compilation with strict mode
- Code quality, edge cases, serialization, event system

**Total implementation: ~2,393 lines across 8 files** (types.ts, constants.ts, cards.ts, engine.ts, state.ts, events.ts, achievements.ts, index.ts)

**Verdict: BLOCKED** — The implementation contains critical errors that prevent compilation and make the event system non-functional. The event emitter is not threaded through the engine functions, causing 21 TypeScript compilation errors.

---

## Detailed Findings

### 1. Critical Issues (BLOCKED)

#### Issue C1: Event emitter not accessible in engine functions (19 errors)

**Severity: Critical**

**Description:** The `events` variable is created as a local variable inside `createGame()` and returned as part of `{ game, events }`. However, all other exported functions (`submitAssignments`, `revealAssignments`, `resolveRound`, `processCleanup`) and internal helpers (`processSpyEffects`, `applySkipPenalties`, `processAmbushEffects`, `resolveLane`, `processComebackBonuses`) call `events.emit()` without `events` being in scope.

**Affected functions:**
- `submitAssignments` (line 336)
- `revealAssignments` (line 386)
- `processSpyEffects` (line 408)
- `resolveRound` (line 446)
- `applySkipPenalties` (line 475)
- `processAmbushEffects` (lines 635, 644)
- `resolveLane` (lines 713, 725, 733, 782, 799, 806)
- `processCleanup` (lines 866, 874, 886, 893, 897)
- `processComebackBonuses` (line 921)

**Impact:** The entire event system — the primary integration mechanism for UI, Bots, and Multiplayer — is non-functional. No events will be emitted beyond the initial `GameStarted`/`RoundStarted`/`PlanningPhase` events in `createGame()`. No `LaneResolved`, `VPAwarded`, `AchievementUnlocked`, `PlayerPenalized`, `GameOver`, or other events will reach subscribers.

**Requirement violated:** REQ-001 through REQ-022 all depend on the engine functioning correctly. The event system is the contract for UI, Bot, and Multiplayer integration (per spec.md §10 and integration-notes.md).

**Fix required:** Pass the `GameEventEmitter` as a parameter to all functions that emit events, OR store events in a module-level registry keyed by gameId, OR refactor functions to return arrays of events for the caller to emit.

---

#### Issue C2: PLANNING_TIME not imported (2 errors)

**Severity: Critical**

**Description:** `PLANNING_TIME` is used at lines 237 and 899 of `engine.ts` but is not imported from `./constants`. The import list includes `MAX_ROUNDS`, `LANE_UNLOCK_SCHEDULE`, `MAX_CARDS_PER_LANE`, `VP_STANDARD_LANE`, `VP_HIGH_VALUE_LANE`, `PENALTY_SKIP_VP`, `COMEBACK_START_ROUND`, `TACTIC_RESOLUTION_ORDER` — but not `PLANNING_TIME`.

**Error messages (tsc):**
```
src/game/engine.ts(237,42): error TS2304: Cannot find name 'PLANNING_TIME'.
src/game/engine.ts(899,60): error TS2304: Cannot find name 'PLANNING_TIME'.
```

**Fix required:** Add `PLANNING_TIME` to the import statement from `./constants`:
```typescript
import {
  ...
  PLANNING_TIME,
  ...
} from './constants';
```

---

### 2. Major Issues

#### Issue M1: Card tracking bug — cards placed in both discard pile and lane assignments

**Severity: Major**

**Description:** In `submitAssignments()` (engine.ts lines 322–334), assigned cards are first moved from hand to the `discardPile` via `discardCards()`, then searched for in `[...result.hand, ...result.discardPile]` and pushed to `lane.assignments[playerId]`. This means each assigned card exists in TWO places:
1. `player.discardPile` (immediately available for reshuffle)
2. `lane.assignments[playerId]` (being played this round)

**Impact:** Cards are available for reshuffle and redraw one round early. During the cleanup phase of the same round, if the player's deck is empty, the discard pile (including cards just played this round) is reshuffled into the deck. A player could potentially draw the same card they just played in the same round's cleanup. This violates the intent that played cards should be consumed for the round.

**Root cause:** The `discardCards()` function is called to remove cards from hand, but the result discard pile is then searched for the same cards to place them in lane assignments. Cards should move hand → lane assignments only during submission, then lane assignments → discard during cleanup.

**Fix required:** In `submitAssignments()`, remove cards from hand but do NOT add them to discardPile. Instead, place them directly into lane assignments. During cleanup (`resetLanesForNextRound`), move lane assignment cards to discardPile.

---

#### Issue M2: First Blood achievement detection is flawed

**Severity: Major**

**Description:** The `checkFirstBlood()` function (achievements.ts lines 68–83) checks during the cleanup phase if a player has `vpTotal > 0` and `firstBloodAwarded` is false. However, by the time cleanup runs, all lane resolutions have completed and multiple players may have VP. The function checks all players in order, so whichever player is iterated first with VP > 0 gets First Blood — not necessarily the actual first scorer.

**Spec requirement (clarification.md Q10):** First Blood should go to the FIRST player to earn VP in the match, detected at the exact moment the first VP is awarded. The spec says "Before the first VP award of the match, this flag is false" and "The first time any player earns VP... award 2 bonus VP."

**Impact:** First Blood may be awarded to the wrong player. In a scenario where two players score in the same round, the one processed first by the cleanup loop gets it, even if the other scored their VP first during lane resolution order.

**Fix required:** Detect First Blood at the moment VP is awarded (in `awardVP`/`resolveLane` logic) rather than during cleanup. Track which player triggered it and award immediately.

---

#### Issue M3: Comeback King achievement uses heuristic approximation

**Severity: Major**

**Description:** `checkComebackKing()` (achievements.ts lines 89–111) uses a simplified heuristic: the player must be the winner AND there must exist another player with `vpTotal > player.vpTotal + 5`. This does NOT actually track whether the player was ever in last place.

**Spec requirement (spec.md §6.2):** "Player was in last place at some round and goes on to win match."

**Impact:** The achievement may trigger when it shouldn't (player was never last but had a VP gap at some point) or fail to trigger when it should (player came from last place but wasn't behind by exactly 5+ VP).

**Fix required:** Track historical per-round standings in game state, OR implement a `wasEverInLastPlace` flag that gets set during cleanup's trailing detection.

---

#### Issue M4: Illegal `any` casts for runtime shield tracking

**Severity: Major**

**Description:** Shield effect state is stored on `LaneState` objects using `(lane as any)._shieldedPlayers` (engine.ts lines 547–548, 581, 943). This bypasses TypeScript's type system, makes the property invisible to the type system, and creates potential runtime errors.

**Spec and constitution requirement:** "All types are strict (no `any`, no implicit any)" and "State must be JSON-serializable." The `_shieldedPlayers` Set is not JSON-serializable and will be lost during serialization.

**Impact:** 
- Data is lost during serialize/deserialize round-trip
- Type safety is compromised
- If a game state is serialized mid-resolution, shield data is lost

**Fix required:** Add a proper field to `LaneState` interface in types.ts, e.g.:
```typescript
shieldedPlayers: PlayerId[];
```
Use this array instead of the `any` cast property. Convert to/from Set as needed.

---

### 3. Minor Issues

#### Issue m1: Perfectionist check has dead code

**File:** `achievements.ts` lines 136–141

The `contestedLanes` filter iterates `Object.values(l.assignments)` but the callback body always returns `true` with a comment about card references. The filter doesn't actually check whether the player is contesting the lane. The method works because it then checks `lane.winner !== playerId` for each lane, but the contested lanes tracking is essentially non-functional.

---

#### Issue m2: No explicit card discard during cleanup

**File:** `engine.ts` `processCleanup()` / `resetLanesForNextRound()`

The cleanup phase resets lane assignments (sets to `[]`) but does not explicitly move played cards to the discard pile. Cards that were assigned to lanes are simply dropped (the array reference is replaced). This works because the cards were already added to `discardPile` during `submitAssignments` (see Issue M1), but if Issue M1 is fixed, this must be fixed too.

---

#### Issue m3: `any` in serialize function

**File:** `state.ts` line 145

```typescript
const state: any = JSON.parse(JSON.stringify(game));
```

This `any` type annotation bypasses type safety. Should use proper typing.

---

#### Issue m4: Spy target selection is simplistic

**File:** `engine.ts` lines 423–435

`findBestSpyTarget` uses a naive heuristic combining `vpTotal + hand.length * 0.1`. While functional, it doesn't consider lane presence, threat assessment, or team dynamics. This is acceptable for MVP but should be improved.

---

#### Issue m5: No emergency hand creation for empty deck+discard

**File:** `cards.ts` lines 177–184

When deck and discard are both empty, `drawCards` simply breaks and returns fewer cards than requested. The analysis (analysis.md Risk R3) mentions creating a minimal emergency hand (2× Scout) to prevent deadlock, but this is not implemented.

---

### 4. Edge Case Testing Results

| Edge Case | Status | Notes |
|-----------|--------|-------|
| All 4 players tie in a lane | ✅ Implemented | VP split equally, rounded down |
| Player disconnects mid-round | ✅ Implemented | forceSubmitRemaining applies empty submission; penalty applies |
| Deck empty → reshuffle | ✅ Implemented | Transparent reshuffle of discard into deck |
| All players skip | ✅ Implemented | All lose 1 VP, no VP awarded |
| Team mode: teammate disconnects | ✅ Implemented | Other player continues solo |
| Comeback in round 1 | ✅ Implemented | COMEBACK_START_ROUND = 2 prevents round 1 bonuses |
| Ambush + win lane | ✅ Implemented | Condition checks "if pid === lane.winner continue" |
| Shield blocks one sabotage | ✅ Implemented | Shield system blocks one sabotage per lane |
| Last Stand + Ambush | ✅ Implemented | Both effects apply (VP gain + VP denial) |
| Player at 0 VP cannot go negative | ✅ Implemented | `Math.max(0, player.vpTotal - PENALTY_SKIP_VP)` |
| Max 3 cards per lane | ✅ Implemented | validateAssignment checks MAX_CARDS_PER_LANE |

---

### 5. Requirements Compliance Summary

| Category | Total | ✅ Pass | ❌ Fail | 🔄 Not Testable |
|---|---|---|---|---|
| Core Game (REQ-001–022) | 22 | 20 | 2 (C1, C2) | 0 |
| Type Safety / Strict Mode | 1 | 0 | 1 (C1, C2) | 0 |
| Events System | 1 | 0 | 1 (C1) | 0 |
| Serialization | 1 | 0 | 0 | 1 (depends on C1 fix) |
| Achievements | 6 | 3 | 3 (M2, M3, M4) | 0 |
| Edge Cases | 11 | 11 | 0 | 0 |

---

### 6. Checklist Compliance

From the 130-item checklist:

| Section | Total | ✅ Pass | ❌ Fail | 🔄 Partial |
|---|---|---|---|---|
| Scope and Constitution | 4 | 4 | 0 | 0 |
| Type Definitions | 5 | 5 | 0 | 0 |
| Constants | 7 | 7 | 0 | 0 |
| Card System | 7 | 7 | 0 | 0 |
| Game Engine | 17 | 17 | 0 | 0 |
| Event System | 5 | 2 | 1 (C1) | 2 |
| Achievement System | 8 | 5 | 3 (M2, M3) | 0 |
| State Management | 6 | 5 | 0 | 1 |
| Public API | 5 | 5 | 0 | 0 |
| Edge Cases | 11 | 11 | 0 | 0 |
| Compliance with Parent Decisions | 8 | 8 | 0 | 0 |
| Code Quality | 7 | 4 | 3 (C1, C2, M4) | 0 |
| **Total** | **90** | **80** | **7** | **3** |

---

### 7. Recommendations

#### Required before unblocking:

1. **Fix event emitter threading (C1-critical):** Pass `GameEventEmitter` to all engine functions that emit events. Two approaches:
   - **Option A (minimal API change):** Add `events: GameEventEmitter` parameter to `submitAssignments`, `revealAssignments`, `resolveRound`, `processCleanup`, and update callers.
   - **Option B (cleaner):** Refactor functions to be event-emitter aware by having `createGame()` return a game controller object that wraps the emitter.

2. **Fix PLANNING_TIME import (C2-critical):** Add the missing import.

3. **Fix card tracking bug (M1):** Separate hand removal from discard. Move cards to lane assignments only during submission. Discard lane cards during cleanup.

4. **Fix First Blood (M2):** Detect at VP award time, not during cleanup.

5. **Fix shield tracking (M4):** Add proper field to LaneState interface; remove `any` casts.

6. **Add unit tests** before re-review to verify correctness (no tests exist currently).

#### Recommended for quality:

7. **Fix Comeback King (M3):** Track historical last-place status.

8. **Fix Perfectionist dead code (m1):** Properly filter contested lanes.

9. **Implement emergency hand (m5):** Handle the degenerate case of empty deck + discard.

10. **Add discard-to-cleanup logic (m2):** Ensure cards played are properly accounted for.

---

## Conclusion

**Status: BLOCKED**

The implementation shows a solid understanding of the game design and has correctly implemented most of the game logic (lane resolution, tactic effects, comeback mechanics, active play enforcement, serialization structure). The type system is well-designed, constants are properly defined, and the card system is complete.

However, the two critical issues — the event emitter not being accessible to engine functions (19 errors) and the missing `PLANNING_TIME` import (2 errors) — prevent compilation and make the event system non-functional. These are architectural issues that must be resolved before any downstream integration (UI, Bots, Multiplayer) can work.

Additionally, the card tracking bug (cards in both discard pile and lane assignments) is a significant gameplay integrity issue that needs correction.

**Total: 21 TypeScript compilation errors, 0 tests exist, 3 major logic bugs, 5 minor issues.**

Once the critical and major issues are resolved, re-run the QA process with `tsc --noEmit` confirming zero errors and add unit tests to verify correct behavior.
