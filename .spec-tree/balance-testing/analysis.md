# Balance and Testing — Analysis

## 1. Risks

### 1.1 Flaky Tests (Non-deterministic Results)

**Risk**: Card shuffle, lane objective generation, and bot decisions use randomness. Tests may pass or fail depending on random seed.

**Mitigations**:
- Game engine supports a `randomSeed` parameter in `GameConfig`. All tests and simulation runs should use a fixed seed for reproducibility.
- The balance simulator should run with multiple seeds and average results across them (not rely on a single seed pass/fail).
- Unit tests for shuffle should verify statistical properties (each permutation possible) rather than exact order.
- Use a seeded RNG (mulberry32, already implemented in engine.ts) for all test scenarios.

**Residual risk**: If tests are flaky despite seeds, developers may start ignoring failures. Mitigation: CI should fail hard on flaky tests; fix or quarantine flaky tests immediately.

### 1.2 Simulation Time

**Risk**: Running 100+ full game simulations for each scenario may take a long time (minutes to hours). Developers may skip running simulations.

**Mitigations**:
- Balance simulator should skip real-time delays (no `setTimeout` or `sleep` calls).
- Use fast-forward simulation: call `revealAssignments`, `resolveRound`, `processCleanup` in sequence without UI rendering.
- Provide a quick mode (minimal games, e.g., 20) for development iteration, and a full mode (200+ games) for final validation.
- Consider batch running simulations in parallel (if bot decisions are pure functions).

**Residual risk**: Even with optimization, 200 games × 12 rounds × multiple scenarios = thousands of engine calls. Should still complete in <30s on modern hardware.

### 1.3 Statistical Variance

**Risk**: With 100 games, a 55% win rate detection threshold means a strategy could be truly balanced at 50% but measure at 55% due to variance (±5-7% at 95% confidence for 100 trials).

**Mitigations**:
- Require minimum 200 games for final dominance detection (reduces margin of error to ~3.5%).
- Report confidence intervals alongside win rates.
- If a strategy hits 53-57%, flag as "borderline" requiring more games (500+) to confirm.
- Do not treat a single simulation run as definitive. Run 3 simulations with different seeds and average.

**Residual risk**: True dominance at 52% may not be detected until more games are run. Acceptable — the system should catch clear dominance (>55%) reliably.

### 1.4 Bot AI Dependency

**Risk**: The balance simulator depends on the bot AI branch. If bots are not implemented, the simulator cannot run. If bots have bugs, simulation results will be misleading.

**Mitigations**:
- The balance-testing branch should coordinate with bot-ai branch closely (they are siblings).
- A minimal "dumb bot" (always assign strongest card to highest-value lane) should be available as a fallback even before full AI is ready.
- Bot interface must be clearly defined so the simulator can plug in any implementation.
- Run sanity checks: verify easy bots lose to hard bots in simulation (validates both simulator and bot AI).

**Residual risk**: This is a critical path dependency. The balance testing phase is blocked until a working bot AI exists.

### 1.5 False Positives in Dominance Detection

**Risk**: A strategy may appear dominant in simulation because bots do not counter it well, but human players would counter it easily.

**Mitigations**:
- Flag findings as "simulation-based" not "definitive".
- Require manual review of any flagged strategy before making balance changes.
- Test across all 7 bot styles to simulate different counter-strategies.

**Residual risk**: Simulation can never fully replace human testing. Final balance requires playtesting.

---

## 2. Dependencies

### 2.1 Hard Dependencies (Blocking)

| Dependency | What It Provides | Status |
|---|---|---|
| Core Game Engine | `createGame`, all round lifecycle functions, types | ✅ Implemented (in `mobile-game/src/game/`) |
| Bot Controller | Decision-making function `(state, playerId) => CardAssignment[]` | ❌ Not implemented (in `bot-ai/` branch) |
| Bot Styles | 7 strategic styles with difficulty levels | ❌ Not implemented |
| Jest + ts-jest | Test runner and TypeScript support | ✅ Available in package.json |

### 2.2 Soft Dependencies (Helpful but Not Blocking)

| Dependency | What It Provides | Status |
|---|---|---|
| Mock Multiplayer | 4-player state orchestration | ❌ Not implemented (simulator can call engine directly) |
| CI (GitHub Actions) | Automated test running | ❌ Not implemented (planned for later) |

---

## 3. Key Decisions

### Decision BT-001: Simulator Runs Without UI

**Context**: The balance simulator could be implemented as a component of the Expo app or as a standalone Node.js script.

**Decision**: Implement as a standalone TypeScript module (`src/testing/balanceSimulator.ts`) that can be run via `npx jest --testPathPattern=simulator` or a dedicated npm script. It must not depend on React Native or Expo modules.

**Rationale**: Keeps the simulator fast, headless, and CI-compatible. No UI rendering overhead.

### Decision BT-002: Test Coverage Thresholds Are Not Gates in Phase 1

**Context**: Should the tests fail if coverage is below 85%?

**Decision**: Not enforced in Phase 1. In Phase 1, tests must pass (green) but coverage thresholds are advisory. They will be enforced in Phase 4 (final integration).

**Rationale**: Premature coverage enforcement slows down test writing during initial development. Get the tests written and passing first, then tighten coverage.

### Decision BT-003: Balance Flags Require Manual Review

**Context**: Should the balance simulator auto-tune constants when it finds a dominant strategy?

**Decision**: No. The simulator reports findings; a human or the balance-analyst reviews them and decides on tuning. Auto-tuning is out of scope.

**Rationale**: Automatic tuning risks making the game worse. Balance decisions require understanding of the game design, not just statistics.

### Decision BT-004: Seeded Random for All Tests

**Context**: Randomness in shuffle and objectives makes tests hard to write deterministically.

**Decision**: Every test that touches random logic must use a fixed seed. The `createGame` config accepts `randomSeed` for this purpose. The `engine.ts` mulberry32 implementation will be the single source of deterministic random.

**Rationale**: Deterministic tests are reliable tests. Seeds are documented in test descriptions so failures can be reproduced.

### Decision BT-005: Integration Tests Are Separate From Unit Tests

**Context**: Some test scenarios span multiple files (engine + cards + state).

**Decision**: `integration.test.ts` will contain cross-module tests. It will be run separately from unit tests in CI (unit tests first, integration tests second).

**Rationale**: Integration tests take longer and may have different flakiness characteristics. Separating them allows quick unit test feedback.
