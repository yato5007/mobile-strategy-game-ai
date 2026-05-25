# Multiplayer System — QA Result

**Status**: BLOCKED

**Date**: 2026-05-25
**QA Agent**: spec-critic / qa

---

## Summary

The Multiplayer System implementation provides a solid foundation for local mock multiplayer. The `MultiplayerAdapter` interface is well-designed, the `MockMultiplayerAdapter` class correctly wraps the game engine, and the Zustand store integration (`gameStore.ts`) demonstrates end-to-end connectivity. However, **two critical bugs** and **one major missing artifact** block this from passing QA:

1. **All-Bot Game Stall**: `triggerBotDecisions()` never calls `checkAndAdvancePhase()`, causing all-bot games to stall for the full 45-second planning timeout before advancing.
2. **Timer Race Condition**: A stale `setTimeout` callback can fire after a phase has already advanced, causing `forceSubmitRemaining()` and `advanceToNextPhase()` to run on the wrong game phase, corrupting state.
3. **No Adapter Tests**: There are zero unit tests for the `MockMultiplayerAdapter` class. All existing tests test the engine and bots directly, bypassing the adapter.

---

## Detailed Findings

### 🔴 Critical Issues

#### C1. All-Bot Game Stalls (Phase Lock)

**File**: `mockMultiplayerAdapter.ts`, lines 545-563  
**Severity**: Critical  
**Description**: The `triggerBotDecisions()` method submits bot decisions via `engineSubmitAssignments()` but never calls `checkAndAdvancePhase()` afterward. When all players are bots, after all decisions are submitted:
- `isPlanningComplete(game)` becomes `true`
- But `advanceToNextPhase()` is never triggered
- The game stalls in the planning phase until the 45-second timeout fires

**Trace**:
```
initialize()
  → onEnterPlanningPhase()
    → triggerBotDecisions()
      → engineSubmitAssignments(bot1) ✓
      → engineSubmitAssignments(bot2) ✓
      → engineSubmitAssignments(bot3) ✓
      → engineSubmitAssignments(bot4) ✓
      → [MISSING: checkAndAdvancePhase()]
    → returns to initialize()
  → notifyStateHandlers()
  → game stalls for 45s waiting for timeout
```

**Fix Required**: Add a `checkAndAdvancePhase()` call at the end of `triggerBotDecisions()`, or after it in `onEnterPlanningPhase()`.

---

#### C2. Stale Timeout Race Condition (Double Phase Advance)

**File**: `mockMultiplayerAdapter.ts`, lines 618-660  
**Severity**: Critical  
**Description**: A `setTimeout` callback can be queued by the event loop before `clearPlanningTimer()` is called. When the stale callback fires:
1. `this.game` has already advanced to the next round (different phase)
2. `forceSubmitRemaining(this.game)` incorrectly force-submits all players in the new round
3. `advanceToNextPhase()` runs reveal → resolve → cleanup on the wrong state
4. Game state is corrupted — score double-counting, broken phase transitions

**Scenario**:
```
Round 1 Planning: timer set for t=45s
  → t=45s: setTimeout callback queued by event loop
  → All players submit → checkAndAdvancePhase() → clearPlanningTimer() (too late, callback already queued)
  → advanceToNextPhase() runs Round 1 resolution + cleanup → Round 2 starts
  → Stale timeout callback fires
  → handlePlanningTimeout() runs forceSubmitRemaining() on Round 2 state
  → advanceToNextPhase() runs a SECOND time, corrupting state
```

**Fix Required**: Check that the adapter is still in the planning phase at the start of `handlePlanningTimeout()`, e.g.:
```typescript
if (!this.game || this.game.roundPhase !== 'planning') {
  this.planningTimerId = null;
  return;
}
```

Alternatively, track which round the timer was set for and verify it matches `game.currentRound`.

---

#### C3. No Adapter Unit Tests

**Location**: `mobile-game/src/multiplayer/__tests__/` — does not exist  
**Severity**: Critical  
**Description**: The `MockMultiplayerAdapter` class has zero dedicated unit tests. Existing tests (`engine.test.ts`, `integration.test.ts`) test the engine and bot system directly, bypassing the adapter entirely. The following scenarios are untested at the adapter level:

| Scenario | Tested? |
|---|---|
| All 4 players submit via adapter | ❌ |
| Phase auto-advance on full submission | ❌ |
| Timeout fallback via adapter timer | ❌ |
| Player disconnect during planning | ❌ |
| Player reconnect mid-game | ❌ |
| 2v2 mode through adapter | ❌ |
| All-bot game via adapter | ❌ |
| State serialization (deep clone) | ❌ (engine tests exist for engine state) |
| Double submissions | ❌ |
| Late submissions after phase advance | ❌ |
| `destroy()` cleanup (timers cleared) | ❌ |
| Adapter re-initialization after `destroy()` | ❌ |

**Fix Required**: Create `mobile-game/src/multiplayer/__tests__/mockAdapter.test.ts` with tests covering all critical paths. At minimum:
- Full game flow via adapter (all bots + 1 human)
- Timeout fallback
- Player disconnect/reconnect
- Phase auto-advance
- Event forwarding
- `destroy()` lifecycle

---

### 🟠 Major Issues

#### M1. `createSession` / `joinSession` Missing from Interface

**Files**: `types.ts` vs `spec.md`, `clarification.md`  
**Severity**: Major  
**Description**: The `spec.md` and `clarification.md` define:
```typescript
createSession(gameState: SerializedGameState): Promise<SessionId>;
joinSession(sessionId: SessionId, playerId: PlayerId): Promise<void>;
```
These are **absent** from the actual `MultiplayerAdapter` interface in `types.ts`. The interface instead folds session creation into `initialize()`.

**Impact**: If the `SupabaseMultiplayerAdapter` (future) needs separate session creation and joining, the interface must be extended (breaking change for consumers).

**Recommendation**: Either:
- Add `createSession`/`joinSession` to the interface (even as no-ops in mock), OR
- Update `spec.md` and `clarification.md` to match the current `initialize()`-only design
- Document the decision in `DECISIONS.md`

---

#### M2. Supabase Realtime Documentation Missing

**File**: None (Task 9 in tasks.md is unchecked)  
**Severity**: Major  
**Description**: Task 9 "Document Supabase Realtime adapter plan" is listed as TODO. The `integration-notes.md` and `clarification.md` contain design notes, but there is no dedicated migration guide, no stub file, and no channel protocol document. The `SPEC_TREE.md` marks this node as LEAF_READY_FOR_IMPLEMENTATION, but the Supabase preparation is incomplete.

**Required**: Create a `supabase-adapter-plan.md` or update `integration-notes.md` with:
- Channel structure (message types, presence)
- State snapshot strategy
- Reconnection protocol
- Migration steps from mock to real adapter

---

#### M3. `advanceToNextPhase()` Has No Guard Against Double Invocation

**File**: `mockMultiplayerAdapter.ts`, lines 585-608  
**Severity**: Major  
**Description**: If `advanceToNextPhase()` is called twice for the same planning phase (which can happen due to the timer race condition in C2), there is no guard:
```typescript
private advanceToNextPhase(): void {
  if (!this.game || !this.events) return;
  const currentPhase = this.game.roundPhase;
  if (currentPhase === 'planning') {
    // Runs reveal → resolve → cleanup
  }
}
```
If called while already in the `'reveal'` or `'resolution'` phase, it silently does nothing. But if called while in a subsequent `'planning'` phase (from a stale timer), it would incorrectly re-advance.

**Fix Required**: Add a phase guard or a `_advancing` lock flag:
```typescript
private _advancing = false;
private advanceToNextPhase(): void {
  if (this._advancing) return; // Prevent re-entry
  this._advancing = true;
  try {
    // ... existing logic ...
  } finally {
    this._advancing = false;
  }
}
```

---

### 🟡 Minor Issues

#### m1. `replayInitialEvents()` is Fragile

**File**: `mockMultiplayerAdapter.ts`, lines 686-717  
**Severity**: Minor  
**Description**: The adapter subscribes to engine events AFTER `createGame()` has already emitted `GameStarted`, `RoundStarted`, and `PlanningPhase`. These are recreated by `replayInitialEvents()`. If the engine adds new initial events or changes event payloads, `replayInitialEvents()` must be manually updated — there is no automated check.

**Recommendation**: Either:
- Restructure `createGame()` to accept a subscriber callback and pass events through it before returning, OR
- Add a unit test that catches all initial event types and verifies `replayInitialEvents()` produces equivalent payloads

---

#### m2. `destroy()` Handler Sets Cleared but References May Leak

**File**: `mockMultiplayerAdapter.ts`, lines 254-280  
**Severity**: Minor  
**Description**: After `destroy()`, all four handler `Set`s are cleared. However, if external code retains a reference to an `UnsubscribeFn` (returned by `onStateUpdate`, etc.) and calls it after `destroy()`, the `Set.delete()` call is harmless (no-op for missing element). This is acceptable but could be more defensive.

**Recommendation**: Consider adding a `_destroyed` flag and checking it in subscription methods to return a no-op unsubscribe.

---

#### m3. `triggerBotDecisions()` Logs Errors but Doesn't Notify

**File**: `mockMultiplayerAdapter.ts`, lines 545-563  
**Severity**: Minor  
**Description**: If `engineSubmitAssignments()` returns `{ valid: false }` for a bot submission, `notifyStateHandlers()` is not called for that bot. The game continues but the UI is not updated to reflect the failed submission. The error is silently swallowed.

**Recommendation**: Emit an `Error` event or at minimum call `notifyStateHandlers()` even when bot submission fails.

---

#### m4. `PLANNING_TIME` Default (45s) May Be Too Long

**File**: `constants.ts`, line 24  
**Severity**: Minor  
**Description**: `PLANNING_TIME = 45` seconds. The spec mentions "45-second timeout with forceSubmitRemaining fallback". For a mobile game designed for <30 minute matches with 12 rounds, 45s/round × 12 rounds = 9 minutes of planning time minimum (plus resolution). This is acceptable but should be validated by the balance simulator to ensure total match time stays under 30 minutes.

**Recommendation**: Validate via balance simulator that average match time stays under 30 minutes with 45s planning. Consider reducing to 30s if simulator shows comfortable completion times.

---

## Checklist Compliance

| # | Checklist Item | Status | Evidence |
|---|---|---|---|
| 1 | `MultiplayerAdapter` interface defined | ✅ | `types.ts` lines 86-216 |
| 2 | `SerializedGameState` type defined | ✅ | `types.ts` line 224 |
| 3 | `SubmitAction` type defined | ✅ | `types.ts` lines 270-274 (re-exported from game/types) |
| 4 | `SessionId` type defined (string) | ✅ | `types.ts` line 25 |
| 5 | `MultiplayerConfig` type defined | ✅ | `types.ts` lines 52-61 |
| 6 | Adapter factory function created | ✅ | `mockMultiplayerAdapter.ts` line 754: `createMockAdapter()` |
| 7 | Factory returns MockAdapter for local | ✅ | Returns `MockMultiplayerAdapter` |
| 8 | MockAdapter implements MultiplayerAdapter | ✅ | `mockMultiplayerAdapter.ts` line 157: `implements MultiplayerAdapter` |
| 9 | `initialize()` calls `createGame()` | ✅ | Line 217 |
| 10-11 | `createSession()` / `joinSession()` | ❌ | **NOT IMPLEMENTED** — not in interface (M1) |
| 12 | `submitAction()` validates & calls engine | ✅ | Lines 294-315 |
| 13 | Emits PlayerSubmitted event | ✅ | Delegates to engine's emit |
| 14 | Checks isPlanningComplete after submission | ✅ | Lines 569-576 |
| 15 | Phase advancement correct order | ✅ | Lines 585-608 |
| 16 | `onStateUpdate()` fires on transitions | ✅ | Lines 726-740 |
| 17 | `onEvent()` forwards engine events | ✅ | Lines 669-679 |
| 18 | All 4 must submit before phase advances | ✅ | Via engine's `isPlanningComplete()` |
| 19 | Late submissions ignored | ✅ | Engine validates phase |
| 20 | Double submissions handled | ✅ | Engine's submitAssignments replaces |
| 21 | Phase advancement is atomic | ✅ | Synchronous, single event loop |
| 22 | `roundPhase` correctly reflects phase | ✅ | Set by engine functions |
| 23 | Planning deadline computed | ✅ | Lines 618-624 |
| 24 | `setTimeout` triggers `forceSubmitRemaining` | ✅ | Lines 635-649 |
| 25 | Timeout cleared on full submission | ✅ | Line 573: `clearPlanningTimer()` |
| 26 | `forceSubmitRemaining()` handles non-submitters | ✅ | Lines 377-384 (engine function) |
| 27 | Penalty applied correctly | ✅ | Engine's `applySkipPenalties()` |
| 28 | Re-checks isPlanningComplete after timeout | ✅ | Lines 646-648 |
| 29 | Race condition handled | ❌ | **CRITICAL BUG** (C2) — stale timer can corrupt state |
| 30-31 | Player disconnect sets isConnected=false | ✅ | Lines 380-400 |
| 32 | Game continues after disconnect | ✅ | `isPlanningComplete` filters disconnected |
| 33 | Timeout still applies to disconnected | ✅ | `forceSubmitRemaining` checks isConnected |
| 34 | `getConnectedPlayers()` returns connected | ✅ | Lines 341-346 |
| 35 | Reconnection fires onPlayerJoined | ✅ | Lines 355-369 |
| 36-37 | FFA and 2v2 modes work | ✅ | Delegated to engine |
| 38-39 | 2v2 shared view / hidden from opponents | ⚠️ | UI responsibility, not adapter |
| 40 | 2v2 per-player submission | ✅ | Engine validates per-player |
| 41-42 | State JSON-serializable | ✅ | `cloneGameState` uses JSON round-trip |
| 43 | Unit test for serialization | ⚠️ | Engine tests exist, none at adapter level |
| 44-45 | Events and SubmitAction serializable | ✅ | Plain object types |
| 46-47 | `destroy()` clears timers, handlers | ✅ | Lines 254-280 |
| 48 | Re-initializable after destroy | ✅ | Line 208-210 |
| 49 | Adapter connects to UI via store | ✅ | `gameStore.ts` |
| 50 | Timer displayed | ⚠️ | Must be verified in UI implementation |
| 51 | BotController invoked for bot players | ✅ | Via `BotDecisionProvider` |
| 52 | Bot decisions through submitAction() | ✅ | Adapter internal: `engineSubmitAssignments` |
| 53 | Full game flow end-to-end | ❌ | **No adapter-level test** (C3) |
| 54 | GameOver emitted correctly | ✅ | Engine emits, adapter forwards |
| 55-58 | Supabase prep documentation | ❌ | Task 9 not done (M2) |
| 59-60 | Documentation | ⚠️ | Inline comments good; integration-notes.md exists |

**Total**: 60 items  
**✅ Pass**: 46  
**❌ Fail**: 6 (C2, M1, M2, items 10, 11, 29, 53, 55-58)  
**⚠️ Partial**: 4  
**Not applicable at adapter level**: 4 (38-39, 50)

---

## Requirements Compliance

| ID | Requirement | Status | Notes |
|---|---|---|---|
| REQ-003 | Multiplayer support (4 players) | ✅ | Via `MockMultiplayerAdapter` + interface |
| REQ-004 | No turn waiting (simultaneous) | ✅ | All players submit during same planning phase |
| REQ-012 | 4 players supported | ✅ | Engine + adapter handle 4 players |
| REQ-013 | 2v2 team mode | ✅ | Delegated to engine |
| REQ-014 | FFA 1v1v1v1 | ✅ | Delegated to engine |
| REQ-054 | Local mock multiplayer first | ✅ | `MockMultiplayerAdapter` implemented |
| REQ-055 | Supabase Realtime later | 🔄 | Architecture designed, documentation pending (M2) |
| REQ-056 | Playable prototype before final approval | 🔄 | Adapter exists, needs testing + UI integration |

**All design-level requirements met**. Two implementation-level requirements partially incomplete (Supabase docs, adapter tests).

---

## Edge Case Verification

| Edge Case | Status | Notes |
|---|---|---|
| All 4 players submit simultaneously | ⚠️ | Works due to single-threaded JS, but no test |
| All players disconnect mid-game | ✅ | Engine handles disconnected players gracefully |
| One player disconnects before submitting | ✅ | `disconnectPlayer()` + plan continues |
| Timeout fires at exact submission moment | ❌ | **CRITICAL** — stale timer can corrupt state (C2) |
| Double submission by same player | ✅ | Engine replaces first submission |
| Late submission after phase advance | ✅ | Engine rejects: `roundPhase !== 'planning'` |
| Empty submission (0 cards) | ✅ | Rejected by `validateAssignment`, penalty via timeout |
| 2v2 mode with one teammate disconnecting | ✅ | Other teammates continue solo |
| All players start as bots | ❌ | **CRITICAL** — stalls 45s before advancing (C1) |
| Adapter destroyed during planning phase | ✅ | Timer cleared, handlers unsubscribed |
| Adapter re-initialized mid-game | ✅ | Old session destroyed, new created |
| `getGameState()` after `destroy()` | ✅ | Throws with descriptive error |

---

## Recommendations

### Priority 1 (Must Fix Before PASS)

1. **Fix all-bot stall (C1)**: Add `checkAndAdvancePhase()` call after `triggerBotDecisions()` in `onEnterPlanningPhase()` or directly in `triggerBotDecisions()`.

2. **Fix stale timer race condition (C2)**: Add a phase guard at the start of `handlePlanningTimeout()`:
   ```typescript
   private handlePlanningTimeout(): void {
     if (!this.game || !this.events) return;
     if (this.game.roundPhase !== 'planning') {
       this.planningTimerId = null;
       return;
     }
     // ... existing logic ...
   }
   ```

3. **Write adapter unit tests (C3)**: Create `mobile-game/src/multiplayer/__tests__/mockAdapter.test.ts` covering at minimum:
   - Full game lifecycle (12 rounds with all bots)
   - Mixed player game (1 human + 3 bots)
   - Timeout fallback (set short PLANNING_TIME, verify force-submit fires)
   - Player disconnect/reconnect
   - Phase auto-advance
   - Event forwarding to external handlers
   - State cloning independence
   - `destroy()` lifecycle (timers cleared, handlers removed)
   - Race condition: verify timeout doesn't fire after phase advance

### Priority 2 (Should Fix)

4. **Add `createSession`/`joinSession` or update spec (M1)**: Either add these methods to the interface or update the spec documents to reflect the current design.

5. **Add Supabase documentation (M2)**: Create a migration guide document covering channel structure, state sync, and reconnection protocol.

6. **Add re-entry guard on `advanceToNextPhase()` (M3)**: Add a `_advancing` lock to prevent double invocation from race conditions.

### Priority 3 (Nice to Have)

7. **Track planning round number in timer**: Store `_planningRoundNumber` when starting the timer, verify it matches `game.currentRound` in `handlePlanningTimeout()` as an additional safety check.

8. **Improve `replayInitialEvents()` robustness (m1)**: Add a unit test or structural check to verify initial events are recreated correctly.

9. **Emit Error event on failed bot submission (m3)**: Notify external handlers when a bot submission fails.

---

## Conclusion

**Status: BLOCKED**

The Multiplayer System implementation demonstrates strong architecture and correct design patterns. The `MultiplayerAdapter` interface is clean, the `MockMultiplayerAdapter` correctly wraps the game engine, and the Zustand store integration shows end-to-end connectivity. The code is well-documented with clear JSDoc comments and thoughtful error handling.

However, **three critical issues** prevent a PASS:

| Issue | Impact | Fix Complexity |
|---|---|---|
| **All-bot game stall** (C1) | All-bot games freeze for 45s per round | 🔧 1 line: add `checkAndAdvancePhase()` call |
| **Stale timer race condition** (C2) | Corrupts game state on timer collision | 🔧 3 lines: add phase guard |
| **No adapter tests** (C3) | All adapter behaviors unverified | 📝 ~150 lines of tests |

These are all fixable within a single focused session. Once resolved, the adapter should receive a follow-up review.

**Next Action Required**: Fix C1, C2, C3 above. Then re-run QA.
