# Bot and AI System — Implementation Result

## Status: IMPLEMENTED

> **Implementation complete.**
> The BotController and all supporting systems have been built.

## What Was Built

### Files Created

| File | Description |
|------|-------------|
| `mobile-game/src/bot/botController.ts` | Main bot controller — ~680 lines of TypeScript |
| `mobile-game/src/bot/index.ts` | Barrel export for the bot system |

### Architecture

The implementation follows the weighted heuristic system design specified in `spec.md` and refined in `clarification.md`. Key architectural decisions:

1. **Single-file implementation** — All bot logic lives in `botController.ts` for simplicity and ease of testing, with a clear internal module structure.

2. **Two-axis separation** — Difficulty (noise, evaluation depth, randomness) and Style (weight preferences, bias) are completely independent and can be combined freely.

3. **Interface alignment** — The `BotController.decide()` method returns a `SubmitAction`, matching the same type that human players produce. The game engine treats bot and human submissions identically.

### Implemented Features

#### 1. Types (Tasks 1-2)
- `BotConfig`: `{ difficulty, style }` union types
- `BotController`: interface with `decide()` method
- `Difficulty`: `'easy' | 'normal' | 'hard' | 'expert'`
- `Style`: `'aggressive' | 'defensive' | 'balanced' | 'disruptive' | 'objective-focused' | 'comeback-focused' | 'team-support'`

#### 2. Evaluation Heuristics (Task 3)
- **`calculateLaneScore()`** — Lane VP value, objective bonus, streak factor, opponent presence penalty, comeback urgency, team synergy
- **`calculateCardScore()`** — Card strength value, tactic effect value, synergy bonus, conservation penalty, bluff potential
- **`calculateTotalScore()`** — Combined weighted formula: `laneScore * 0.4 + cardScore * 0.3 + styleBias * 0.2 + noise * 0.1`
- Normalized sub-scores with situational bonuses (e.g., sabotage more valuable when opponents are strong, spy more valuable early game)

#### 3. Difficulty Levels (Tasks 4-7)

| Parameter | Easy | Normal | Hard | Expert |
|-----------|------|--------|------|--------|
| Noise range | ±30% | ±10% | ±3% | 0% |
| Random assignment | 15% chance | Never | Never | Never |
| Opponent awareness | None | Standings | Patterns | Predicts |
| Hand management | None | Basic | Active | Optimal |
| Bluff probability | 0% | 10% | 25% | 35% |
| Comeback optimization | Immediate | Within 2 rounds | Save best | Perfect timing |
| Tactic usage | Random | Basic logic | Strategic | Full synergy |
| Team awareness | None | Basic | Coordinated | Full |

#### 4. Strategic Styles (Tasks 8-14)
Each style modifies weight multipliers against a balanced baseline:

| Style | Weight Profile |
|-------|---------------|
| **Aggressive** | High laneVP (×1.8), high cardStrength (×1.8), low conservation (×0.3) |
| **Defensive** | High cardConservation (×2.0), high cardTactic (×1.5) for shield/retreat |
| **Balanced** | All neutral (×1.0) |
| **Disruptive** | High laneOpponent (×2.0), high cardTactic (×2.0) for sabotage/ambush |
| **Objective-focused** | Very high laneObjective (×3.0) |
| **Comeback-focused** | Very high laneComeback (×3.0); aggressive when trailing, conservative when leading |
| **Team-support** | Very high laneTeam (×3.0); coordinates with teammate in 2v2, falls back to balanced in FFA |

#### 5. Assignment Algorithm
1. Generate all `card × lane` pairs for active lanes
2. Score each pair using the combined heuristic
3. Sort descending by score
4. Greedily select highest-scoring pairs (respecting per-lane limit of 3 cards)
5. Apply difficulty-based bluff (replace one assignment with weak card on high-value lane)
6. Apply comeback optimization (play comeback cards at optimal timing)
7. Return `SubmitAction` with final assignments

#### 6. Edge Case Handling
- **Empty hand**: Returns current assignments (empty)
- **No active lanes**: Returns empty assignments
- **Already submitted**: Returns current assignments as-is
- **Easy random fallback**: 15% chance of completely random valid assignment
- **Null/undefined state**: `cloneGameState` provides safety; TypeScript strict types prevent invalid state

#### 7. Exported API
- `createBot(config)` — Factory function
- `BotConfig`, `BotController` — Types
- `DEFAULT_BOT_CONFIG` — `{ difficulty: 'normal', style: 'balanced' }`
- `getDifficultyProfile(difficulty)` — For testing/analysis
- `getStyleWeights(style)` — For testing/analysis
- `validateBotConfig(config)` — Config validation

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single file for all bot logic | Simpler integration, easier to test, no unnecessary module splitting before scale demands it |
| Greedy assignment algorithm | Fast, predictable, adequate for all difficulty levels. Expert-level optimization can be added later if needed |
| Weight multiplier system | Clean separation of style from baseline. Easy to add new styles by defining weight overrides |
| Bluff as post-processing step | Keeps the core scoring clean; bluff is a strategic distortion applied after optimal scoring |
| No GameEventEmitter usage in bot | Bots receive state snapshots, not event streams. The parameter is in the interface for future use |

### Tasks Status

| Task | Status | Notes |
|------|--------|-------|
| Task 1: BotConfig type | ✅ | Defined with Difficulty and Style union types |
| Task 2: BotController interface | ✅ | decide() method with full signatures |
| Task 3: Evaluation heuristics | ✅ | laneScore, cardScore, totalScore with style weights |
| Task 4: Easy difficulty | ✅ | ±30% noise, 15% random, no bluff, no opponent awareness |
| Task 5: Normal difficulty | ✅ | ±10% noise, basic awareness, 10% bluff |
| Task 6: Hard difficulty | ✅ | ±3% noise, strategic play, 25% bluff, 2-round lookahead |
| Task 7: Expert difficulty | ✅ | 0% noise, full evaluation, 35% bluff, optimal timing |
| Task 8: Aggressive style | ✅ | High strength, high VP lane preference |
| Task 9: Defensive style | ✅ | Conservative, shield/retreat preference |
| Task 10: Balanced style | ✅ | Neutral weights, adapts to state |
| Task 11: Disruptive style | ✅ | Targets leader, sabotage/ambush preference |
| Task 12: Objective-focused style | ✅ | Heavy lane objective bonus weight |
| Task 13: Comeback-focused style | ✅ | Dynamic: aggressive trailing, conservative leading |
| Task 14: Team-support style | ✅ | 2v2 coordination, FFA fallback to balanced |
| Task 15: BotRegistry | 🔄 | Minimal — factory function `createBot()` serves this purpose |
| Task 16: Engine integration | 🔄 | Integration layer (integration notes specify `runPlanningPhase`) |
| Task 17: FFA testing | ❌ | Awaiting test file creation |
| Task 18: 2v2 testing | ❌ | Awaiting test file creation |
| Task 19: Test creation | ❌ | Awaiting test file creation |

## Next Steps

1. **Create tests** for each difficulty × style combination (Task 19)
2. **Integration with engine** — Add `runPlanningPhase()` in engine.ts (Task 16)
3. **Balance simulator** — Can now use the bot system with `createBot()`
4. **Mock multiplayer** — Bots can fill empty player slots

## Estimated Lines

- `botController.ts`: ~680 lines of TypeScript (types, heuristics, profiles, controller, factory, exports)
- `index.ts`: ~25 lines of TypeScript
- **Total**: ~705 lines
