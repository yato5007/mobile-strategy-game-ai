# Balance and Testing — Specification

## 1. Balance Simulator

### 1.1 Purpose
Run automated matches with various bot configurations to:
- Detect dominant strategies (>55% win rate).
- Verify comeback mechanics work.
- Ensure match duration ≤ 30 minutes (simulated).
- Test both FFA and 2v2 modes.
- Verify all bot difficulty levels and styles are viable.

### 1.2 Simulator Interface
```
interface BalanceSimulator {
  runSimulation(config: SimulationConfig): SimulationResult;
}

interface SimulationConfig {
  mode: 'ffa' | '2v2';
  games: number;          // Number of matches to simulate (min 100)
  bots: BotConfig[][];    // Array of bot lineups to test
  randomSeed?: string;    // For reproducibility
}

interface SimulationResult {
  totalGames: number;
  winRates: Record<string, number>;  // strategy → win %
  avgMatchDuration: number;           // in simulated seconds
  comebackWinRate: number;            // % of games where last-place player wins
  earlyLeaderWinRate: number;         // % of games where early leader wins
  dominantStrategies: string[];       // Strategies with >55% win rate
  modeResults: {
    ffa: ModeResult;
    '2v2': ModeResult;
  };
  balanceFlags: BalanceFlag[];
}

interface BalanceFlag {
  type: 'dominant_strategy' | 'no_comeback' | 'match_too_long' | 'strategy_always_wins';
  severity: 'warning' | 'critical';
  description: string;
  data: Record<string, unknown>;
}
```

### 1.3 Test Scenarios
1. **All bot styles in FFA** (100+ games per style).
2. **All bot styles in 2v2** (100+ games per style).
3. **Comeback scenario**: Give one bot a 5 VP head start, verify others can catch up.
4. **Passive play**: One bot plays minimally, verify it loses consistently.
5. **Mixed difficulty**: Mix Easy/Normal/Hard/Expert bots.
6. **Same style tournament**: 4 bots all Aggressive → verify variety.

### 1.4 Pass Criteria
- No single strategy wins >55% of matches.
- Comeback win rate >10% (trailing players can win sometimes).
- Early leader win rate <70% (leads can be overcome).
- Match duration ≤ 30 minutes simulated.
- Both FFA and 2v2 modes are balanced independently.

## 2. Unit Tests (Jest)

### 2.1 Test Areas
- **Types**: All interfaces and types match expected structure.
- **Constants**: All constant values match design spec.
- **Cards**: Deck generation, shuffle, draw, discard all work.
- **Engine**: Game creation, planning, reveal, resolution, cleanup.
- **Lane Resolution**: Ties, clear winners, 2v2 team resolution.
- **Tactic Effects**: Each tactic tested individually and in combination.
- **Comeback**: Trailing detection, bonus cards, VP effects.
- **Achievements**: Each achievement triggers correctly and once only.
- **Events**: All events emit at correct times with correct payloads.
- **State**: Serialization round-trip preserves all data.
- **Edge Cases**: All 11+ edge cases from engine analysis.

### 2.2 Test Structure
```
mobile-game/src/game/__tests__/
├── types.test.ts
├── constants.test.ts
├── cards.test.ts
├── engine.test.ts
├── state.test.ts
├── events.test.ts
├── achievements.test.ts
└── integration.test.ts
```

### 2.3 Coverage Targets
- Line coverage: ≥85%.
- Branch coverage: ≥75%.
- All core game logic paths tested.
- All edge cases tested.

## 3. Integration Tests

- Core Engine + Bot AI: Verify bots play correctly.
- Core Engine + Mock Multiplayer: Verify 4-player simulation works.
- Core Engine + Serialization: Verify full round-trip.
- Full game simulation: Create game, play all rounds, verify winner.

## 4. Dominant Strategy Detection

The balance simulator analyzes results for:
- **Win rate per bot style**: If Aggressive wins 60% of FFA games → balance flag.
- **Win rate per opening**: If playing Scout + Soldier in lanes 1-2 always wins → flag.
- **Comeback viability**: If last-place players win <5% → flag.
- **Early leader persistence**: If round 1 leader wins >70% → flag.
- **Match length outliers**: If any game exceeds 30 minutes → flag.

## 5. Integration

- Balance simulator depends on: Core Game Logic Engine + Bot Controller.
- Test runner: Jest (already available in Expo projects).
- CI integration: Run on every push (future GitHub Actions).