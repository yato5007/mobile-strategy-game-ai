# Balance and Testing — Clarification

## 1. Balance Simulator Purpose

The balance simulator is an automated system that runs many matches end-to-end using bots and collects statistical results. It does **not** play a role during a real game — it is a development/QA tool.

### What It Does

1. Creates a game with `createGame(config)` from the core game engine.
2. Fills all 4 player slots with bots (from the bot-ai branch).
3. Runs the full round lifecycle (plan → submit → reveal → resolve → cleanup) for all 12 rounds.
4. Collects end-of-game results: winner, VP scores, match duration, comeback events.
5. Aggregates results across 100+ games per scenario.
6. Analyzes win rates per bot style, per difficulty, per opening pattern.
7. Flags any anomaly as a `BalanceFlag`.

### What It Does NOT Do

- It does not test UI or rendering.
- It does not test real-time network multiplayer.
- It does not tune game constants automatically (it reports findings; tuning is manual).

### Key Interfaces

```
BalanceSimulator.runSimulation(config):
  - mode: 'ffa' | '2v2'
  - games: number (min 100)
  - bots: array of bot configurations (style + difficulty per slot)
  - Returns SimulationResult with win rates, flags, and aggregated stats

SimulationResult:
  - winRates: per-style and per-slot winning percentages
  - avgMatchDuration: simulated time in seconds
  - comebackWinRate: % of games where last-place player/team won
  - earlyLeaderWinRate: % of games where round-1 leader won overall
  - dominantStrategies: list of flagged strategies (>55% win rate)
  - balanceFlags: array of { type, severity, description, data }
```

---

## 2. Unit Test Structure

### Jest Configuration

The project already has `jest@^30.4.2`, `ts-jest@^29.4.11`, and `@types/jest@^30.0.0` in `devDependencies`. A `jest.config.js` file needs to be created at the `mobile-game/` root.

Configuration must:
- Use `ts-jest` preset.
- Set `testEnvironment: 'node'` (no DOM needed).
- Set test match pattern to `**/__tests__/**/*.test.ts`.
- Enable source maps for stack traces.
- Set coverage thresholds if needed (optional for Phase 1).

### Test File Layout

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

### What Each Test File Covers

- **types.test.ts**: All interfaces instantiate correctly, type guards work, discriminated unions are exhaustive.
- **constants.test.ts**: All constant values match expected values. No undefined or NaN constants.
- **cards.test.ts**: Deck creation has correct size and composition. Shuffle produces random order. Draw cards respect deck boundaries. Starting hand has 6 cards. Turn draw gives 2 cards. Comeback card pool works with weights. Rotating card pool selects valid cards.
- **engine.test.ts**: `createGame` produces valid initial state. `validateAssignment` rejects invalid and accepts valid. `submitAssignments` updates state correctly. `isPlanningComplete` detects all submitted. `forceSubmitRemaining` applies penalties. `revealAssignments` transitions phase. `resolveRound` processes all lanes. `processCleanup` advances round and triggers achievements. Full 12-round simulation runs without errors. Edge cases: ties, skip penalties, 2v2 team resolution.
- **state.test.ts**: `getActiveLaneCount` matches LANE_UNLOCK_SCHEDULE. `getLaneObjectiveForRound` returns valid objectives. `serialize`/`deserialize` round-trips correctly. `cloneGameState` produces independent copy.
- **events.test.ts**: Event emitter subscribes and emits. Unsubscribe removes handler. Multiple subscribers all receive events. Handler errors don't crash emitter. `clear` removes all handlers.
- **achievements.test.ts**: Each achievement triggers under correct conditions. Each achievement only triggers once. Mode-gated achievements don't trigger in wrong mode. VP rewards are applied correctly.
- **integration.test.ts**: Full game from start to end with bots. State is consistent after every phase. Events fire in correct order. Final result is coherent.

---

## 3. Test Scenarios

### FFA

- 4 bots, all same style (e.g., Aggressive only) → 100 games → verify variety in outcomes.
- 4 bots, one of each style (Aggressive, Defensive, Balanced, Disruptive) → 100 games → check no style dominates.
- 4 bots, different difficulty levels (Easy, Normal, Hard, Expert) → 100 games → verify difficulty correlates with win rate.

### 2v2

- Team 0: Aggressive+Disruptive vs Team 1: Defensive+Objective → 100 games → verify team dynamics.
- Same styles on both teams → 100 games → verify balance.
- Mixed difficulty teams → 100 games → verify difficulty matters but teamwork also matters.

### Comeback Scenarios

- Start one player with a 5 VP head start → simulate → verify trailing players catch up in >10% of games.
- Start one team with a 10 VP head start (2v2) → simulate → verify comebacks.
- Passive bot vs 3 aggressive bots → verify passive bot rarely wins.

### Dominant Strategy Detection

- Same style across 200 games → if that style wins >55% → flag.
- Same opening (always assign Scout+Soldier to lanes 0-1) → if >55% → flag.
- Check each of the 7 bot styles across both FFA and 2v2 → any exceeding 55% → flag.

---

## 4. Pass Criteria

| Criterion | Threshold | Severity if Failed |
|---|---|---|
| Single strategy win rate | ≤55% | Critical |
| Comeback win rate | ≥10% | Warning (<10%), Critical (<5%) |
| Early leader win rate | ≤70% | Warning |
| Match duration | ≤30 min simulated | Critical |
| All unit tests pass | 100% | Critical |
| Line coverage | ≥85% | Warning |
| Branch coverage | ≥75% | Warning |

---

## 5. Dependencies and Timing

- **Core Game Engine** (`engine.ts`, `types.ts`, `cards.ts`, `state.ts`, `events.ts`, `achievements.ts`, `constants.ts`): These must be in a stable state before writing tests.
- **Bot AI** (`bot-ai/` branch): The balance simulator needs a working bot controller that can make decisions per round. The bot must implement the `BotController` interface: `(gameState, playerId) => CardAssignment[]`.
- **Bot styles**: The 7 styles (Aggressive, Defensive, Balanced, Disruptive, Objective-focused, Comeback-focused, Team-support) must be implemented with difficulty levels (Easy, Normal, Hard, Expert).
- **Mock Multiplayer**: Not strictly required — the simulator can call game engine functions directly in sequence.
