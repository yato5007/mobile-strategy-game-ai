# Bot and AI System — Integration Notes

## 1. Connection to Game Engine

### 1.1 During the Planning Phase

The game engine's round loop must call `bot.decide()` for each bot player during the planning phase. The integration point is in `engine.ts` or a new planning orchestrator.

**Proposed flow** (in `engine.ts` or `planning.ts`):

```
function runPlanningPhase(state: GameState, bots: Map<PlayerId, BotController>): void {
  for (const player of state.players) {
    if (player.isBot) {
      const bot = bots.get(player.id);
      if (!bot) throw new Error(`No bot registered for player ${player.id}`);
      const snapshot = cloneGameState(state);  // read-only snapshot
      const assignments = bot.decide(snapshot, player.id, bot.config);
      submitAssignments(state, player.id, assignments);
    }
    // Human players submit via UI — handled by multiplayer layer
  }
}
```

### 1.2 Import Dependencies

The bot implementation imports from the core game logic public API:

```typescript
// Bot system imports
import type { GameState, PlayerId, CardAssignment } from '../game';
import { submitAssignments, cloneGameState, getStandings } from '../game';
```

### 1.3 Bot Interface

```typescript
// Proposed interface (defined in bot-ai system)
interface BotConfig {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  style: 'aggressive' | 'defensive' | 'balanced' | 'disruptive'
       | 'objective-focused' | 'comeback-focused' | 'team-support';
}

interface BotController {
  decide(gameState: GameState, playerId: PlayerId, config: BotConfig): CardAssignment[];
}
```

---

## 2. Filling Empty Player Slots

### 2.1 At Match Creation

When a game is created via `createGame(config)`, the `GameConfig.playerSlots` array specifies which slots are bots:

```typescript
const config: GameConfig = {
  mode: 'ffa',
  playerSlots: [true, false, true, false],  // slots 0 and 2 are bots
  maxRounds: 12,
};

const state = createGame(config);
```

### 2.2 Default Bot Assignment

If the UI does not specify a bot's difficulty/style, a reasonable default should be used:

```typescript
const DEFAULT_BOT_CONFIG: BotConfig = {
  difficulty: 'normal',
  style: 'balanced',
};
```

### 2.3 Bot Registration

The bot system provides a `BotRegistry` that maps (difficulty, style) pairs to concrete behavior objects:

```typescript
// Proposed registry usage
const registry = new BotRegistry();
const bot = registry.get({ difficulty: 'hard', style: 'aggressive' });
const assignments = bot.decide(gameState, playerId, config);
```

---

## 3. Integration with Mock Multiplayer

### 3.1 Mock Game Loop

The mock multiplayer system creates a local game with all slots either human (keyboard/mock UI input) or bot. The loop:

```
For each round:
  1. startPlanningPhase()
  2. For each bot: call bot.decide() → submitAssignments()
  3. For each human: wait for UI input or timeout
  4. When all submitted OR timer expires: revealAssignments()
  5. resolveRound()
  6. processCleanup()
  7. If game over: return result
```

### 3.2 Bot as Human Stand-in

In mock multiplayer, bots function as drop-in replacements for absent human players. The mock system does not distinguish between a bot decision and a human decision — both produce `CardAssignment[]` arrays that are fed to `submitAssignments()`.

---

## 4. Integration with Balance Simulator

The balance simulator configures and runs many matches using bots:

```typescript
// Pseudo-code for balance simulator usage
function runBalanceTest(): void {
  const botConfigs: BotConfig[] = [
    { difficulty: 'expert', style: 'aggressive' },
    { difficulty: 'expert', style: 'defensive' },
    // ... any combination
  ];

  const registry = new BotRegistry();
  const bots = botConfigs.map(c => registry.get(c));

  for (let i = 0; i < 1000; i++) {
    const state = createGame({ mode: 'ffa', playerSlots: [true, true, true, true] });
    // Run game, use bots for decisions
    const result = simulateGame(state, bots);
    recordResult(result);
  }
}
```

---

## 5. Avoiding State Mutation Conflicts

Bots must never mutate the live `GameState` object. The integration layer must:

1. Clone the game state (or create a read-only view) before passing it to `bot.decide()`.
2. Use `submitAssignments()` to apply the bot's decisions to the real game state.
3. Never pass the live state object to bot code.

**Implementation**: Use `cloneGameState()` from core-game-logic state module.

---

## 6. Error Handling

| Scenario | Handling |
|---|---|
| Bot throws an exception | Catch, log error, submit a fallback assignment (first valid card to first active lane). Engine continues. |
| Bot returns invalid assignments | `submitAssignments()` validates via `validateAssignment()`. Invalid assignments are rejected. Engine triggers penalty/default assignment. |
| Bot doesn't return in time | Run in a timeout wrapper. If timeout exceeded, use fallback assignment. |
| Bot registry returns undefined | Check registry.get() result; use default (Normal + Balanced) as fallback. |

---

## 7. File Structure After Integration

```
mobile-game/src/
├── game/                          # Core Game Logic (existing)
│   ├── types.ts
│   ├── constants.ts
│   ├── cards.ts
│   ├── engine.ts                  # Modified: calls bot.decide() during planning
│   ├── state.ts
│   ├── events.ts
│   ├── achievements.ts
│   └── index.ts                   # Modified: exports bot-related utilities
├── bot/                           # Bot System (new)
│   ├── types.ts                   # BotConfig, BotController interfaces
│   ├── heuristics.ts              # Lane score, card score evaluation
│   ├── easy.ts                    # Easy difficulty
│   ├── normal.ts                  # Normal difficulty
│   ├── hard.ts                    # Hard difficulty
│   ├── expert.ts                  # Expert difficulty
│   ├── styles/
│   │   ├── aggressive.ts
│   │   ├── defensive.ts
│   │   ├── balanced.ts
│   │   ├── disruptive.ts
│   │   ├── objective-focused.ts
│   │   ├── comeback-focused.ts
│   │   └── team-support.ts
│   ├── registry.ts                # BotRegistry class
│   └── index.ts                   # Public API barrel export
└── ...                            # Other systems
```
