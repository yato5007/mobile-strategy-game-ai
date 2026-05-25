# Integration Notes — Balance and Testing

## 1. Test Dependencies on Engine and Bots

### Core Engine Dependency

All unit tests and the balance simulator depend on the core game engine modules:

```
mobile-game/src/game/
  ├── types.ts          # Tested by types.test.ts
  ├── constants.ts      # Tested by constants.test.ts
  ├── cards.ts          # Tested by cards.test.ts
  ├── engine.ts         # Tested by engine.test.ts, used by simulator
  ├── state.ts          # Tested by state.test.ts, used by simulator
  ├── events.ts         # Tested by events.test.ts, used by simulator
  └── achievements.ts   # Tested by achievements.test.ts, used by simulator
```

**Contract**: The test files import types and functions directly. Any change to exported function signatures, type structures, or constant values will break tests. The engine team must run `npm test` after any engine change to catch regressions.

**Recommendation**: The engine API should reach a stable state before test files are finalized. Use `@beta` annotations or version exports if iterative changes are expected.

### Bot AI Dependency

The balance simulator requires a bot implementation to call during simulations:

```typescript
// Expected interface (from bot-ai branch)
interface BotController {
  decide(
    gameState: GameState,
    playerId: PlayerId,
    botConfig: { style: BotStyle; difficulty: BotDifficulty }
  ): CardAssignment[];
}

type BotStyle = 'aggressive' | 'defensive' | 'balanced' | 'disruptive' 
              | 'objective-focused' | 'comeback-focused' | 'team-support';
type BotDifficulty = 'easy' | 'normal' | 'hard' | 'expert';
```

**Contract**: The simulator calls `BotController.decide()` once per bot per round during the planning phase. The bot receives the full game state (including lane objectives, player hands, VP scores) and returns a valid `CardAssignment[]` array.

**Integration point**: `mobile-game/src/testing/balanceSimulator.ts` imports bot controller from `mobile-game/src/bot/`.

**Risk**: If bot API changes, the simulator must be updated. Both branches must agree on the interface before implementation.

### Fallback Plan

If the bot-ai branch is not ready when the simulator is needed, implement a minimal "dumb bot" inline in the simulator:

- Always assigns strongest cards to highest-VP lanes.
- Never uses tactic cards (assigns only unit cards).
- Ignores opponent state.
- This is sufficient for basic engine testing but insufficient for balance testing.

## 2. CI Integration Plan

### GitHub Actions Workflow (`.github/workflows/test.yml`)

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd mobile-game && npm ci
      - run: cd mobile-game && npm test
```

### Test Script Organization

The `package.json` should include these scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern='__tests__/(?!integration)'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:coverage": "jest --coverage",
    "test:simulator": "jest --testPathPattern='simulator'",
    "test:balance": "ts-node src/testing/runBalanceSimulation.ts"
  }
}
```

### CI Stages

1. **Lint** (if configured): TypeScript type-check.
2. **Unit tests**: Fast (target <30s). Uses `test:unit`.
3. **Integration tests**: Medium (target <60s). Uses `test:integration`.
4. **Balance simulation**: Slow (target <5min). Runs only on main branch or manual trigger. Uses `test:balance`.

### Optimization

- Balance simulation can be cached: only re-run if game engine or bot code changed.
- Use `--changedSince=main` for PR CI to reduce runtime.
- Simulated matches should use fast-forward (no real-time delays) for speed.

## 3. Cross-Branch Coordination

| Branch | Integration Point | Contact |
|---|---|---|
| `core-game-logic` | Exports engine functions and types consumed by tests and simulator | @game-engine-dev |
| `bot-ai` | Exports BotController consumed by simulator | @bot-ai-designer |
| `multiplayer-system` | Mock multiplayer adapter may be used for 4-player orchestration | @multiplayer-dev |

**Note**: The balance-testing branch does not directly depend on UI, localization, art, or Android/iOS platform code.

## 4. Data Flow

```
SimulationConfig
    │
    ▼
BalanceSimulator.runSimulation()
    │
    ├── for each game:
    │   ├── createGame(config)          → engine.ts
    │   ├── for each round (1-12):
    │   │   ├── for each bot:
    │   │   │   └── decide(state, id)    → bot-ai controller
    │   │   ├── submitAssignments(state) → engine.ts
    │   │   ├── revealAssignments(state) → engine.ts
    │   │   ├── resolveRound(state)      → engine.ts
    │   │   └── processCleanup(state)    → engine.ts
    │   └── collect result
    │
    └── aggregate results → SimulationResult
```
