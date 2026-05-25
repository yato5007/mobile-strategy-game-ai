# System Contracts

This file defines how major systems connect.

Every major system documents:
1. Inputs.
2. Outputs.
3. Data types.
4. Events.
5. State ownership.
6. Dependencies.
7. What it must not control.
8. How it connects to other systems.

No branch may create a conflicting contract.

If a branch changes a contract, it must update this file and call @integration-architect.

---

## 1. Core Game Logic Engine

### Description
Pure TypeScript engine managing game state, rounds, lanes, cards, VP, achievements, and tactic resolution. Has zero UI, network, or bot dependencies.

### Inputs
| Input | Type | Source |
|---|---|---|
| `GameConfig` | `{ mode, playerSlots, maxRounds?, randomSeed? }` | Multiplayer adapter / UI store |
| `SubmitAction` | `{ type: 'submit_assignments', playerId, assignments }` | Bot AI / UI (via Multiplayer adapter) |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| `GameState` | `GameState` (plain object, JSON-serializable) | All systems |
| `GameEvent` | Discriminated union (15 event types) via `GameEventEmitter` | UI (via store), Sound system (useGameSounds) |

### Key Types
- `GameState` — Complete game state (players, lanes, rounds, phase, scores)
- `PlayerState` — Per-player state (hand, deck, VP, assignments, achievements)
- `LaneState` — Per-lane state (objective, strengths, winner, assignments)
- `Card` — Card data (type, strength, tactic effect, localization keys)
- `CardAssignment` — Player's card-to-lane mapping for a round
- `GameEvent` — Discriminated union of all 15 event types
- `GameEventEmitter` — `{ subscribe, emit, clear }` interface

### Events Emitted (15 types)
`GameStarted`, `RoundStarted`, `PlanningPhase`, `PlayerSubmitted`, `RevealPhase`, `ResolutionPhase`, `LaneResolved`, `VPAwarded`, `RoundComplete`, `AchievementUnlocked`, `ComebackBonus`, `GameOver`, `PlayerPenalized`, `SpyInfo`, `Error`

### State Ownership
**Full ownership.** Creates and mutates `GameState`. Other systems read state; they must never mutate it directly. State mutation happens only through engine functions.

### Dependencies
- **Runtime:** None (pure TypeScript)
- **Type-level:** None

### Must Not Control
- UI rendering, navigation, or layout
- Bot AI decisions (only exposes `isBot` flag for bookkeeping)
- Network communication or state sync
- Audio playback or animations
- Localization (only stores key references like `nameKey`)

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Bot AI | Reads `GameState`, calls `submitAssignments()` | Engine → Bot (read) |
| Multiplayer | Wraps engine lifecycle, serializes state | Engine → Multiplayer (wrap) |
| UI | Reads state via Zustand store, calls actions | Engine → Store → UI |
| Balance Simulator | Uses engine directly for simulation | Engine → Simulator |
| Sound System | Subscribes to `GameEventEmitter` | Engine → Sound (events) |

### Public API
```
createGame(config) → { game: GameState, events: GameEventEmitter }
submitAssignments(game, playerId, assignments, events)
revealAssignments(game, events)
resolveRound(game, events)
processCleanup(game, events)
isPlanningComplete(game) → boolean
forceSubmitRemaining(game, events)
getStandings(game) → Standing[]
getGameResult(game) → GameResult
isGameOver(game) → boolean
cloneGameState(game) → GameState
canPlayerAct(game, playerId) → boolean
```

---

## 2. Bot AI System

### Description
Weighted heuristic system providing strategic bot opponents with 4 difficulty levels × 7 strategic styles.

### Inputs
| Input | Type | Source |
|---|---|---|
| `GameState` | `GameState` | Core Game Logic |
| `PlayerId` | `number` | Caller (Multiplayer/Simulator) |
| `GameEventEmitter` | `GameEventEmitter` | Core Game Logic (for optional event logging) |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| `SubmitAction` | `{ type, playerId, assignments }` | Core Game Logic (via `submitAssignments()`) |
| `BotConfig` | `{ difficulty, style, playerId, noiseRange, ... }` | Caller configuration |

### Key Types
- `BotConfig` — Difficulty, style, noise threshold, hand management params
- `BotController` — `create()`, `decideTurn()` interface
- `Difficulty` — `'easy' | 'normal' | 'hard' | 'expert'`
- `Style` — `'aggressive' | 'defensive' | 'balanced' | 'disruptive' | 'objective-focused' | 'comeback-focused' | 'team-support'`

### Events
None emitted (receives events only for optional logging/scoring).

### State Ownership
**None.** Reads `GameState` only. Never mutates engine state.

### Dependencies
- Core Game Logic (`game/types`, `game/index`)

### Must Not Control
- Game state (read-only)
- UI, audio, or animations
- Network communication
- Other players' bots

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Multiplayer | `BotDecisionProvider` calls `bot.decideTurn()` | Multiplayer → Bot |
| Balance Simulator | Creates bots, calls `createBot()` + `decideTurn()` | Simulator → Bot |

---

## 3. Multiplayer System

### Description
Local mock multiplayer adapter managing game lifecycle, phase synchronization, timeout handling, and bot decision integration. Designed for future Supabase Realtime adapter.

### Inputs
| Input | Type | Source |
|---|---|---|
| `MultiplayerConfig` | `{ mode, playerSlots, botConfigs?, seed? }` | UI (LobbyScreen) |
| `CardAssignment[]` | Player submissions | UI (via store) |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| `GameState` | Via `onStateUpdate` callback | Zustand store → UI |
| `GameEvent` | Via `onEvent` callback | Zustand store → UI/Sound |
| Phase state | `'waiting' | 'planning' | 'reveal' | 'resolution' | 'cleanup' | 'complete'` | UI store |

### Key Types
- `MultiplayerAdapter` — Interface: `createGame()`, `submitAssignments()`, `start()`, `stop()`, etc.
- `MockMultiplayerAdapter` — Implementation of `MultiplayerAdapter` for local play
- `BotDecisionProvider` — Wraps bot AI, calls `decideTurn()` for each bot slot

### Events
- `onStateUpdate(gameState)` — Fired when game state changes
- `onEvent(event)` — Fired when a game event is emitted
- Internal phase management events

### State Ownership
**Delegate.** Owns the game lifecycle (when to start, when to advance phases). Delegates state mutation to the Core Game Logic engine.

### Dependencies
- Core Game Logic (`game/types`, `game/index`, all engine functions)
- Bot AI (`BotDecisionProvider` for bot slots)

### Must Not Control
- UI rendering or component state
- Audio or animation triggers
- Navigation

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Core Game Logic | Calls engine functions for state mutation | Multiplayer → Engine |
| Bot AI | Calls `bot.decideTurn()` for bot players | Multiplayer → Bot |
| UI (via Store) | Provides `onStateUpdate` / `onEvent` callbacks | Multiplayer → Store → UI |

---

## 4. UI and User Experience

### Description
React Native screens, components, navigation, and Zustand stores for the complete game interface. Handles RTL/LTR layout, card interaction, board rendering, and score display.

### Inputs
| Input | Type | Source |
|---|---|---|
| `GameState` | Read from Zustand `gameStore` | Multiplayer adapter (via store) |
| Touch events | User interaction | React Native gesture system |
| Language/RTL | From `uiStore` and `I18nManager` | Localization system |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| `SubmitAction` | Via Multiplayer adapter (through store) | Multiplayer → Engine |
| Navigation params | Through React Navigation | Other screens |

### Key Types & Files
- **Screens:** HomeScreen, LobbyScreen, GameScreen, ResultsScreen, SettingsScreen
- **Components:** Card, Lane, HandArea, ScoreBar, ActionBar, PhaseOverlay, RTLText, RTLView, RTLPressable
- **Stores:** `gameStore` (Zustand), `uiStore` (Zustand)
- **Navigation:** `AppNavigator` with `RootStackParamList` types

### State Ownership
**Zustand stores only.** UI components own their own state via `useState` and Zustand stores (`gameStore`, `uiStore`). They read `GameState` but never mutate it directly.

### Dependencies
- Core Game Logic (types, engine functions via store)
- Multiplayer adapter (via store)
- Bot AI (type references only)
- Localization (all text via `useTranslation`)
- Theme (colors, typography, spacing)

### Must Not Control
- Game logic or rules
- Bot AI decisions
- Audio playback (triggers via events only)

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Game State | Read from `gameStore.getState()` | Store → UI |
| Actions | Call `gameStore.startGame()`, `gameStore.submitAssignments()` | UI → Store → Engine |
| Localization | `useTranslation()` hook throughout | UI ←→ Localization |
| Sound | `useGameSounds()` hook subscribes to events | UI ←→ Sound |

---

## 5. Localization System

### Description
i18n system providing Arabic and English translations for all player-facing text. RTL/LTR support via `I18nManager`. All UI text passes through `t()` function.

### Inputs
- Language selection from `uiStore` or `I18nManager`
- Translation keys from UI components

### Outputs
- Translated strings via `t(key)` function
- RTL/LTR direction via `I18nManager`

### Key Types
- Translation keys: 138 keys in both `ar.ts` and `en.ts`
- `i18n.ts` — i18next configuration with Arabic/English resources
- `useTranslation` — React hook interface

### State Ownership
**Owns translation resources.** Does not own UI state or game state.

### Dependencies
- `i18next`, `react-i18next` runtime libraries
- No dependency on game engine or other systems

### Must Not Control
- Game logic, UI layout (only provides text + direction)
- Audio, animation, or navigation

### Connections
| System | Mechanism | Direction |
|---|---|---|
| UI | All screens call `useTranslation()` → `t(key)` | UI → Localization |
| Theme | Font selection based on language | Localization → Theme |
| Navigation | RTL direction via `I18nManager` | Localization → App |

---

## 6. Art, Audio, Motion, and Game Feel

### Description
Placeholder system providing sound playback hooks, animation timing presets, RTL-aware animation direction helpers, and accessibility context for reduced motion.

### Inputs
| Input | Type | Source |
|---|---|---|
| Game events | `GameEvent` via `GameEventEmitter` | Core Game Logic |
| Reduce-motion toggle | User setting | `ReduceMotionContext` |
| RTL flag | `I18nManager.isRTL` | Localization system |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| Sound playback | `play(key)` function | `useGameSounds` dispatches to `useSound` |
| Animation timing | `getTiming(weight)` — timing configs | Animation components |
| Direction helper | `toRTL(direction)` — flips for RTL | Animation components |
| Accessibility | `reduceMotion` boolean from context | All animation components |

### Key Types
- `SoundKey` — 25 identifier strings for all game sounds
- `AnimationWeight` — `'fast' | 'normal' | 'smooth' | 'strategic' | 'cinematic' | ...`
- `AnimationDirection` — `'left' | 'right' | 'up' | 'down'`
- `ReduceMotionState` — `{ reduceMotion, setReduceMotion, toggleReduceMotion }`
- `FadeAnimation` / `SlideAnimation` — Animation return types

### State Ownership
**Owns sound/mute state and reduce-motion state only.** Does not own or mutate game state.

### Dependencies
- Core Game Logic (event types for subscription)
- `react-native-reanimated` (animation presets)
- `expo-av` (future — sound playback)

### Must Not Control
- Game state or rules
- UI layout or navigation
- Bot decisions or multiplayer state

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Core Game Logic | Subscribes to `GameEventEmitter` for sound triggers | Events → Sound |
| UI | `ReduceMotionProvider` wraps app in `App.tsx` | Context → UI |
| Localization | Reads `I18nManager.isRTL` for animation direction | L10n → Animation |

---

## 7. Balance Simulator

### Description
Automated match simulation system that tests game balance by running many matches with diverse bot configurations. Detects dominant strategies and verifies comeback mechanics.

### Inputs
| Input | Type | Source |
|---|---|---|
| `GameConfig` | Bot-difficulty combinations | Internal configuration |
| `BotConfig[]` | Array of bot configs for each slot | Internal configuration |

### Outputs
| Output | Type | Consumers |
|---|---|---|
| `BalanceReport` | Win rates, average VP, dominant strategy flags | Developer / QA |
| Console output | Match results, strategy win rates | Log analysis |

### Key Types
- `SimulationConfig` — Number of matches, bot configurations, mode
- `BalanceReport` — Per-strategy win rates, flags, average match duration

### State Ownership
**None.** Creates temporary game instances, runs them, discards state after each match.

### Dependencies
- Core Game Logic (all engine functions)
- Bot AI (creates bot instances for each slot)

### Must Not Control
- Game engine or bot behavior (reads outputs only)
- UI, audio, or multiplayer systems

### Connections
| System | Mechanism | Direction |
|---|---|---|
| Core Game Logic | Calls engine functions directly for simulation | Simulator → Engine |
| Bot AI | Creates bots via `createBot()`, calls `decideTurn()` | Simulator → Bot |

---

## Contract Change Procedure

If any branch changes a system contract:
1. Update this file.
2. Call `@integration-architect`.
3. Update the affected system's implementation.

All contracts must remain backward-compatible. Add new event types or function overloads rather than modifying existing shapes.
