# Art, Audio, Motion, and Game Feel System — Integration Notes

## How Art/Audio/Motion Connects to Other Systems

### To UI and User Experience

| Contract | Mechanism |
|---|---|
| UI imports style constants | `import { colors } from '../styles/colors'` — shared color, typography, spacing constants |
| UI imports card components | `import { CardBase } from '../components/cards/CardBase'` — card rendering with state props |
| UI imports board components | `import { Board } from '../components/board/Board'` — board/lane rendering |
| UI imports animation components | `import { CardFlipAnimation } from '../components/animations/CardFlipAnimation'` — rendered as overlays |
| UI imports sound hook | `import { useGameSounds } from '../hooks/useGameSounds'` — wired into game screen |
| UI provides event emitter | Animation and sound hooks subscribe to the same `GameEventEmitter` instance |
| UI provides RTL context | `I18nManager.isRTL` from `react-native` determines animation direction |

**Flow:**
```
Game Engine → emits GameEvent
  → Sound Hook (useGameSounds) plays correct audio
  → Animation Dispatcher (in game screen) triggers correct animation overlay
  → UI re-renders with new state (which may have different card/board props)
```

### To Core Game Logic

| Contract | Mechanism |
|---|---|
| Read-only: art system subscribes to events | `events.subscribe('LaneResolved', handler)` — never emits events |
| No reverse dependency | Game engine never imports art code |
| Type safety | All event types come from `types.ts` in the game engine |

**Important:** The art system must never modify game state. It is purely presentational.

### To Localization

| Contract | Mechanism |
|---|---|
| RTL flag | `I18nManager.isRTL` set by localization system |
| Font files | `expo-font` loads `.ttf` files bundled by art system (Amiri, Playfair Display, Noto Sans) |
| Text rendering | Card names use localization; components pass `textStyle` based on locale |

### To Android/iOS (Platform)

| Contract | Mechanism |
|---|---|
| SVG rendering | `react-native-svg` — cross-platform native rendering |
| Audio playback | `expo-av` — cross-platform, supports MP3/WAV |
| Animations | `react-native-reanimated` — 60fps via UI thread |
| Safe area | Art components respect safe area insets (handled by UI branch) |

### To Asset Pipeline

| Mechanism | Description |
|---|---|
| `assets/images/` | SVG files for cards, board, icons, effects, backgrounds |
| `assets/audio/` | Sound effect files (MP3/WAV) |
| `assets/fonts/` | Font `.ttf` files |
| `assets/images/placeholders/` | Temporary placeholder SVGs |
| `assets/audio/placeholders/` | Temporary silent audio files |

### To Balance and Testing

No direct contract. The art system does not affect game balance.

---

## Shared Event Protocol

The art system responds to all 15 `GameEvent` types. See clarification.md §5 for the complete event-to-feedback mapping.

---

## Shared Data Types

All shared types come from `mobile-game/src/game/types.ts`:
- `GameEvent` — Discriminated union of all 15 event types
- `GameEventEmitter` — `{ subscribe, emit, clear }` interface
- `PlayerId`, `LaneIndex` — Used for targeting animations

---

## Testing Dependencies

| Test | Needs From |
|---|---|
| Sound dispatch test | Mock `GameEventEmitter`, `expo-av` mock |
| Animation render test | `react-native-reanimated` mock (or real rendering) |
| RTL test | Localization system's `I18nManager.forceRTL()` |
| Performance test | Real device or emulator |

---

## Contract Change Procedure

If this system changes its public API:
1. Update this file.
2. Notify @integration-architect.
3. Notify the UI branch (primary consumer).

---

## Integration Status

| System | Status | Notes |
|---|---|---|
| Core Game Logic | 🔄 Ready | Events defined; art system can subscribe |
| UI and UX | 🔜 Not started | Will consume art components |
| Localization | 🔜 Not started | Will provide RTL flag and fonts |
| Multiplayer | ✅ No dependency | Art is purely local |
| Bot/AI | ✅ No dependency | Art is purely presentational |
| Balance/Testing | ✅ No dependency | Art does not affect balance |
