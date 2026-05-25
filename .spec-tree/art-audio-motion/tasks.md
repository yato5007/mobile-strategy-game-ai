# Art, Audio, Motion, and Game Feel System — Tasks

Implementation tasks. Each task maps to one deliverable.

---

## Phase 1: Color and Typography Constants

| ID | Task | File | Depends On |
|---|---|---|---|
| T1.1 | Create `colors.ts` — export all color constants as named `#hex` strings | `src/styles/colors.ts` | — |
| T1.2 | Create `typography.ts` — font family constants, weight enums, size scale | `src/styles/typography.ts` | — |
| T1.3 | Create `spacing.ts` — 4dp base grid, padding/margin constants | `src/styles/spacing.ts` | — |
| T1.4 | Verify constants work in `StyleSheet.create()` and inline SVG styles | — | T1.1–T1.3 |

## Phase 2: Card Visual Components

| ID | Task | File | Depends On |
|---|---|---|---|
| T2.1 | Create `CardBase.tsx` — shared card frame (border, background, name slot, strength slot) | `src/components/cards/CardBase.tsx` | T1.1, T1.2 |
| T2.2 | Create `CardIcon.tsx` — icon lookup per card type | `src/components/cards/CardIcon.tsx` | T2.1 |
| T2.3 | Create inline SVG components or asset SVGs for all 14 card types | `assets/images/cards/` | T2.1 |
| T2.4 | Implement card states: in-hand, selected, placed, revealing, resolved, discarded | `CardBase.tsx` + state props | T2.1 |
| T2.5 | Add RTL-aware layout to cards (text alignment, icon order) | `CardBase.tsx` | T2.1 |
| T2.6 | Create `CardDeck.tsx` — animated hand with horizontal scroll | `src/components/cards/CardDeck.tsx` | T2.4 |

## Phase 3: Board and Lane Visual Components

| ID | Task | File | Depends On |
|---|---|---|---|
| T3.1 | Create `Lane.tsx` — lane bar with background, border, objective icon, strength display | `src/components/board/Lane.tsx` | T1.1, T1.2 |
| T3.2 | Create `Board.tsx` — full board layout hosting all lanes | `src/components/board/Board.tsx` | T3.1 |
| T3.3 | Create `ObjectiveIcon.tsx` — icons for circle, star, flag, crown, target objectives | `src/components/board/ObjectiveIcon.tsx` | T1.1 |
| T3.4 | Implement lane states: active, inactive, locked, winner-highlighted, tie-indicator | `Lane.tsx` | T3.1 |
| T3.5 | Add RTL-aware lane ordering (right-to-left for Arabic) | `Board.tsx` | T3.2 |
| T3.6 | Create `ScoreBoard.tsx` — VP display per player with animated transitions | `src/components/board/ScoreBoard.tsx` | T1.1 |

## Phase 4: Sound Hook System

| ID | Task | File | Depends On |
|---|---|---|---|
| T4.1 | Create placeholder audio files (silent 100ms WAV) for all sound types | `assets/audio/placeholders/` | — |
| T4.2 | Create `useSound.ts` — React hook wrapping `expo-av` for load/playback | `src/hooks/useSound.ts` | — |
| T4.3 | Create `useGameSounds.ts` — subscribes to GameEvent emitter, dispatches sounds | `src/hooks/useGameSounds.ts` | T4.2, core events |
| T4.4 | Map all 15 GameEvent types to sound files | `useGameSounds.ts` | T4.3 |
| T4.5 | Implement volume control (SFX/music separate) and mute toggle | `useSound.ts` | T4.2 |
| T4.6 | Implement accessible visual fallback for sounds | `useGameSounds.ts` | T4.3 |

## Phase 5: Animation Components

| ID | Task | File | Depends On |
|---|---|---|---|
| T5.1 | Create `useAnimation.ts` — timing presets wrapper for `react-native-reanimated` | `src/hooks/useAnimation.ts` | — |
| T5.2 | Create `CardFlipAnimation` — 500ms flip for card reveal | `src/components/animations/CardFlipAnimation.tsx` | T5.1, T2.1 |
| T5.3 | Create `LanePulseAnimation` — 600ms pulse for lane resolution | `src/components/animations/LanePulseAnimation.tsx` | T5.1, T3.1 |
| T5.4 | Create `VPFloatAnimation` — 800ms floating number for VP awards | `src/components/animations/VPFloatAnimation.tsx` | T5.1 |
| T5.5 | Create `AchievementBurstAnimation` — 1200ms burst + banner | `src/components/animations/AchievementBurstAnimation.tsx` | T5.1 |
| T5.6 | Create `PlayerPenaltyAnimation` — 300ms red flash + shake | `src/components/animations/PlayerPenaltyAnimation.tsx` | T5.1 |
| T5.7 | Create `SabotageAnimation` — 400ms crack effect overlay | `src/components/animations/SabotageAnimation.tsx` | T5.1 |
| T5.8 | Create `ShieldAnimation` — 400ms dome flash overlay | `src/components/animations/ShieldAnimation.tsx` | T5.1 |
| T5.9 | Create `AmbushAnimation` — 500ms strike lines overlay | `src/components/animations/AmbushAnimation.tsx` | T5.1 |
| T5.10 | Create `ComebackSparkleAnimation` — 600ms gold sparkle particles | `src/components/animations/ComebackSparkleAnimation.tsx` | T5.1 |
| T5.11 | Create `RoundTransitionAnimation` — 1000ms dim + brighten | `src/components/animations/RoundTransitionAnimation.tsx` | T5.1 |
| T5.12 | Create `GameOverAnimation` — 1500ms slow zoom + result cards | `src/components/animations/GameOverAnimation.tsx` | T5.1 |
| T5.13 | Create `CardSlideAnimation` — 300ms hand-to-lane slide | `src/components/animations/CardSlideAnimation.tsx` | T5.1, T2.1 |
| T5.14 | Implement RTL-aware direction for all directional animations | All animation components | T5.2–T5.13 |
| T5.15 | Create `ReduceMotionContext` and provider for accessibility | `src/context/ReduceMotionContext.tsx` | — |

## Phase 6: Game Feel Polish

| ID | Task | File | Depends On |
|---|---|---|---|
| T6.1 | Wire `useGameSounds` into main game screen | Game screen component | T4.3, UI branch |
| T6.2 | Wire animation components into main game screen (event-driven) | Game screen component | T5.2–T5.13, UI branch |
| T6.3 | Implement waiting-is-engaging: subtle board animations during opponent phase | `Board.tsx` | T3.2 |
| T6.4 | Implement strategic weight: heavier animations for high-value lanes / final rounds | Animation dispatcher | T5.3, T6.2 |
| T6.5 | Implement comeback feeling: brighter effects for trailing players | Animation dispatcher | T5.10, T6.2 |
| T6.6 | Implement penalty feedback: clear red/crimson indicators | Animation dispatcher | T5.6, T6.2 |
| T6.7 | End-to-end feedback loop testing | Manual + automated | T6.1–T6.6 |
| T6.8 | Performance profiling (ensure 60fps on mid-range device) | — | T6.7 |
| T6.9 | RTL testing: verify all animations reverse correctly | — | T6.7 |
| T6.10 | Accessibility testing: reduce-motion, visual sound alternatives | — | T5.15, T4.6, T6.7 |
