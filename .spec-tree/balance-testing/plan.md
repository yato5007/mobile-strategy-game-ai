# Balance and Testing — Plan

## Phases

### Phase 1: Unit Test Infrastructure
1. Install Jest (already available with Expo).
2. Create test file structure.
3. Write tests for types and constants.
4. Write tests for card system.
5. Write tests for engine functions.
6. Write tests for state management.
7. Write tests for achievement system.

### Phase 2: Balance Simulator
1. Create BalanceSimulator class.
2. Implement simulation runner (create game, run rounds, collect results).
3. Implement dominance detection (win rate analysis).
4. Implement comeback verification.
5. Implement match duration analysis.

### Phase 3: Simulation Scenarios
1. Run FFA simulations with all bot styles.
2. Run 2v2 simulations with all bot styles.
3. Run comeback scenarios.
4. Run mixed difficulty scenarios.
5. Analyze and document results.

### Phase 4: Result Analysis & Tuning
1. Identify any dominant strategies.
2. Tune game constants if needed.
3. Re-run simulations after tuning.
4. Document balance findings.
