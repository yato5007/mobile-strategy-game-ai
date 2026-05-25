# Balance and Testing — Node Summary

## Purpose

Build the comprehensive test and balance infrastructure for the strategic lane-control game. This includes:
- Unit tests for all core game logic modules (types, constants, cards, engine, state, events, achievements).
- Integration tests for end-to-end game scenarios.
- Balance simulator that runs automated matches with bots to detect dominant strategies, verify comeback mechanics, and ensure match fairness.

## Parent Link

- **Parent node**: Root (`.spec-tree/root/`)
- **Sibling nodes**: `core-game-logic/` (provides engine under test), `bot-ai/` (provides bot AI for simulator), `multiplayer-system/` (provides mock multiplayer adapter)

## Decisions Made

1. **BT-001**: Simulator runs as headless TypeScript module, not inside Expo/React Native.
2. **BT-002**: Coverage thresholds are advisory in Phase 1, enforced in Phase 4.
3. **BT-003**: Balance flags require manual review; no auto-tuning.
4. **BT-004**: All tests use seeded random (mulberry32) for determinism.
5. **BT-005**: Integration tests run separately from unit tests.

## Alternatives Rejected

1. **Auto-tuning balance**: Rejected because balance decisions require game design understanding beyond statistics.
2. **UI-based simulator**: Rejected because headless simulation is faster and CI-compatible.
3. **ML-based bot AI for simulator**: Rejected as over-engineered; weighted heuristic bots suffice for balance testing.

## Dependencies

| Dependency | Type | Status |
|---|---|---|
| Core Game Engine (`mobile-game/src/game/`) | Hard | ✅ Implemented |
| Bot Controller | Hard | ❌ Not implemented (bot-ai branch) |
| Bot Styles (7) + Difficulty levels (4) | Hard | ❌ Not implemented |
| Jest + ts-jest | Hard | ✅ Available in package.json |
| Mock Multiplayer | Soft | ❌ Not implemented (simulator can work without it) |

## Integration Risks

1. **Bot AI delay**: Balance simulator is blocked until bot-ai branch provides a working bot controller. Mitigation: Implement a minimal "dumb bot" fallback.
2. **Engine changes**: If core game logic changes after tests are written, tests must be updated. Mitigation: Pin the engine API and run full test suite after every engine change.
3. **Statistical variance**: Dominance detection at 55% threshold may produce false positives/negatives with small sample sizes. Mitigation: Minimum 200 games per scenario, confidence intervals reported.

## Implementation Status

| Area | Status |
|---|---|
| Jest configuration | 🔜 Planned (Phase 1.1) |
| Types tests | 🔜 Planned (Phase 1.2) |
| Constants tests | 🔜 Planned (Phase 1.3) |
| Cards tests | 🔜 Planned (Phase 1.4) |
| Engine tests | 🔜 Planned (Phase 1.5) |
| State tests | 🔜 Planned (Phase 1.6) |
| Events tests | 🔜 Planned (Phase 1.7) |
| Achievements tests | 🔜 Planned (Phase 1.8) |
| Balance Simulator class | 🔜 Planned (Phase 2.1) |
| FFA simulations | 🔜 Planned (Phase 3.1) |
| 2v2 simulations | 🔜 Planned (Phase 3.2) |
| Comeback analysis | 🔜 Planned (Phase 3.3) |
| Results documentation | 🔜 Planned (Phase 4) |

## Tests

- Unit tests: types, constants, cards, engine, state, events, achievements (Jest).
- Integration tests: full game simulation, edge cases (Jest).
- Balance simulations: FFA, 2v2, comeback, dominance detection (custom simulator + Jest).

## Next Steps

1. Verify bot-ai branch is ready or create a minimal "dumb bot" fallback.
2. Create `jest.config.js` in `mobile-game/` root.
3. Write all unit test files (types → constants → cards → engine → state → events → achievements).
4. Write integration test file.
5. Create `BalanceSimulator` class.
6. Run all FFA and 2v2 simulation scenarios.
7. Document results and flag any balance issues.
