# Core Game Logic Engine — Analysis

## Feasibility Assessment

### Technical Feasibility: HIGH
- Pure TypeScript game logic with no runtime dependencies beyond standard ES features.
- Lane comparison, card assignment, and VP tracking are textbook programming problems.
- Deck shuffling and card draw are well-understood algorithms.
- Event system follows the Observer pattern, well established in TypeScript.
- State serialization is straightforward with plain objects.

### Architectural Feasibility: HIGH
- Clear separation of concerns: types → data → engine → state → events.
- No circular dependencies in the module graph.
- Functions are pure or nearly pure (state mutation is explicit).
- Testing requires no mocking frameworks — pure functions take state in, return state out.

### Complexity Assessment: MEDIUM
- Tactic effect interactions (order of operations) require careful implementation.
- The 2v2 team mode adds combinatorial complexity (combined strength, shared bonuses).
- Achievement conditions must be checked at the right moment.
- Serialization must capture all state without loss.
- Estimated implementation: 1,200–1,800 lines of TypeScript across all modules.

## Risk Analysis

### Risk R1: Tactic effect order is incorrect
- **Likelihood:** Medium
- **Impact:** Medium — wrong resolution order could make some tactics useless or overpowered.
- **Mitigation:** Document order in spec.md, implement step-by-step rather than all-at-once, write explicit unit tests for effect interaction combinations.
- **Contingency:** Add an `effectResolutionOrder` constant; adjust as balance testing reveals issues.

### Risk R2: State serialization misses something
- **Likelihood:** Low
- **Impact:** High — would prevent multiplayer sync from working correctly.
- **Mitigation:** Define a `SerializableGameState` type that explicitly lists all fields; write a round-trip test (serialize → deserialize → compare).
- **Contingency:** Add `toJSON()` methods on complex objects if needed; use `JSON.parse(JSON.stringify(state))` for deep comparison.

### Risk R3: Player with 0 cards cannot play
- **Likelihood:** Low (starting hand 6, draw 2/round, deck 16 — only ~10 rounds of cards)
- **Impact:** Medium — violates active play constraint if a player literally cannot assign.
- **Mitigation:** The cleanup phase should always draw enough cards. If deck + discard combined are insufficient, the engine should create a minimal emergency hand (2× Scout) to prevent the deadlock. Document as a safety net.
- **Contingency:** If this triggers frequently in testing, increase draw rate or deck size.

### Risk R4: Achievement conditions interact unexpectedly
- **Likelihood:** Low
- **Impact:** Low — achievements are one-time bonuses; incorrect triggering can be hotfixed.
- **Mitigation:** Each achievement has an independent condition function. Track awarded achievements in a Set<string>. Check conditions in a specific order each cleanup.
- **Contingency:** Unit test each achievement condition in isolation.

### Risk R5: 2v2 team scoring edge cases
- **Likelihood:** Medium
- **Impact:** Medium — if team scoring logic is wrong, 2v2 mode is broken.
- **Mitigation:** Explicitly separate individual VP tracking vs. team VP tracking. The engine maintains both. Use team VP for all ranking/win-condition queries in 2v2 mode.
- **Contingency:** Add a `currentMode` check before any team-level operation.

### Risk R6: Comeback detection creates degenerate behavior
- **Likelihood:** Low
- **Impact:** Medium — if trailing detection is too generous, players might intentionally fall behind.
- **Mitigation:** Comeback bonus is capped (1 extra draw + 1 card). It's helpful but not overpowering. The bonus is small enough that sandbagging is not worth it (you lose VP ground).
- **Contingency:** If balance testing shows intentional trailing, add a "consecutive rounds trailing" limit (max 2 consecutive rounds of bonuses).

## Edge Cases

### Edge Case 1: All players tie in a lane
- All 4 players have the same total strength.
- VP split 4 ways: 2 VP / 4 = 0 VP (rounded down). No one gets VP.
- This is intentional — encourages committing more strength to break ties.

### Edge Case 2: Player disconnects mid-round
- The planning phase timer expires.
- `forceSubmitForInactive` applies empty submission.
- Active play penalty: -1 VP, forfeit all contests.
- Next round: if player reconnects, they resume normally with penalty applied.

### Edge Case 3: Deck reshuffle mid-round
- Player draws cards during cleanup.
- Deck runs out.
- Engine automatically shuffles discard pile into deck.
- Draw continues from reshuffled deck.
- This is transparent — no notification to other players.

### Edge Case 4: All players skip (2 human + 2 bots disconnect)
- All 4 players submit empty or timeout.
- All 4 lose 1 VP and forfeit contests.
- No VP awarded for any lane that round.
- Game continues to next round. This is a broken scenario but the engine handles it gracefully.

### Edge Case 5: Team mode with only 3 connected players
- Minimum viable game: 4 players (can be bots).
- If a player disconnects and their slot is not filled by a bot by next round, the engine treats them as absent (active play penalty each round).
- Feature assumption: the multiplayer system ensures slot replacement.

### Edge Case 6: Player plays Ambush but also wins the lane
- Ambush effect: "If you lose this lane, deal -1 VP to the winner."
- If the ambush player wins, the condition is not met. No effect.
- The Ambush card is still consumed (discarded after use).

### Edge Case 7: Shield vs. Sabotage interaction
- Player A plays Shield on lane 2.
- Player B plays Sabotage targeting Player A on lane 2.
- Shield negates the Sabotage. Player A's strength is not reduced.
- Shield is consumed (one use). If a second Sabotage targets the same lane, it will not be blocked.

### Edge Case 8: "Last Stand" + "Ambush" synergy
- Player plays Last Stand (comeback card) + Ambush in the same lane.
- If they lose by ≤2: they gain 1 VP from Last Stand AND the winner loses 1 VP from Ambush.
- Net VP swing: 2 VP (they gain 1, winner loses 1). This is a powerful combo for comebacks.

### Edge Case 9: Comeback bonus in round 1
- No comeback bonus in round 1 (no trailing data). Engine checks `roundNumber > 1` before processing comeback.

### Edge Case 10: Maximum cards in a lane
- 4 players × 3 cards max per lane = 12 cards max in a single lane.
- Not a concern for performance, but the UI must display up to 12 card slots per lane.

## Key Dependencies

| Dependency | Direction | Type | Notes |
|---|---|---|---|
| Parent spec (root) | → Core Logic | Hard | Core logic must comply with all root decisions |
| types.ts | → All modules | Hard | All modules depend on types |
| constants.ts | → engine, cards, achievements | Hard | Constants used for limits |
| cards.ts | → engine, state | Hard | Cards module provides card data |
| engine.ts | → events | Hard | Engine emits events |
| state.ts | → engine | Hard | State queries used by engine |
| events.ts | → index.ts | Soft | Exported through public API |
| ← UI System | Hard | UI subscribes to events, calls engine API |
| ← Bot System | Hard | Bots call engine API to query state and submit actions |
| ← Multiplayer | Hard | Multiplayer serializes state for network sync |

## Quality Metrics

| Metric | Target | Method |
|--------|--------|--------|
| TypeScript strict mode | No errors | `tsc --strict` |
| Test coverage | ≥90% of engine logic | Unit tests |
| All edge cases covered | 100% of listed edge cases | Explicit tests |
| State serialization round-trip | No data loss | JSON round-trip test |
| No UI imports | Zero imports from UI modules | `grep -r "react\|react-native\|expo" src/game/` |
| Functions with no side effects | ≥95% | Manual review |
| Documentation coverage | All public functions have JSDoc | Manual review |
