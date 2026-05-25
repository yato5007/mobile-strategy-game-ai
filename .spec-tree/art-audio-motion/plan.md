# Art, Audio, Motion, and Game Feel System — Plan

## Overview

6 implementation phases. Each phase produces testable, reviewable output.

---

## Phase 1: Color and Typography Constants

**Goal:** Define and export all color and typography constants as importable modules.

**Tasks:**
- Create `mobile-game/src/styles/colors.ts` with all DESIGN_SYSTEM.md colors as named exports.
- Create `mobile-game/src/styles/typography.ts` with font family constants, weight enums, size scale.
- Create `mobile-game/src/styles/spacing.ts` with spacing grid constants (4dp base).
- Verify constants are usable in both React Native `StyleSheet.create()` and inline SVG styles.

**Output:** `src/styles/colors.ts`, `typography.ts`, `spacing.ts`
**Depends on:** Nothing (parallel to UI).
**Estimate:** 1 session.

---

## Phase 2: Card Visual Components (SVG)

**Goal:** Build SVG card components for all 14+ card types with proper states.

**Tasks:**
- Create `src/components/cards/CardBase.tsx` — shared card frame with border, background, name slot, strength slot.
- Create `src/components/cards/CardIcon.tsx` — icon lookup per card type (Scout, Soldier, Knight, Champion, etc.).
- Create 14 card SVGs in `assets/images/cards/` or inline SVG components.
- Implement card states: in-hand, selected, placed, revealing, resolved, discarded.
- Implement RTL-aware layout (text alignment flips, icon order reverses).
- Create `CardDeck.tsx` — animated hand display with horizontal scroll.

**Output:** Card SVG components, card state rendering.
**Depends on:** Phase 1 (colors, typography).
**Estimate:** 2 sessions.

---

## Phase 3: Board and Lane Visual Components

**Goal:** Build SVG board and lane components.

**Tasks:**
- Create `src/components/board/Lane.tsx` — lane bar with background, border, objective icon, strength display.
- Create `src/components/board/Board.tsx` — full board layout hosting all lanes.
- Create `src/components/board/ObjectiveIcon.tsx` — icon set for objectives (circle, star, flag, crown, target).
- Implement lane states: active, inactive, locked, winner-highlighted, tie-indicator.
- Implement RTL-aware lane ordering (right-to-left for Arabic).
- Create `src/components/board/ScoreBoard.tsx` — VP display per player with animated transitions.

**Output:** Board/lane SVG components, scoreboard.
**Depends on:** Phase 1 (colors, typography).
**Estimate:** 2 sessions.

---

## Phase 4: Sound Hook System

**Goal:** Build a sound playback hook that plays the correct SFX for each game event.

**Tasks:**
- Create placeholder audio files (silent WAV) for all sound types in `assets/audio/placeholders/`.
- Create `src/hooks/useSound.ts` — React hook wrapping `expo-av` for sound loading and playback.
- Create `src/hooks/useGameSounds.ts` — subscribes to GameEvent emitter, dispatches correct sound per event type.
- Map all 15 GameEvent types → sound files.
- Implement volume control (SFX, music separate), mute toggle.
- Implement accessible fallback (visual indicator when sound plays).

**Output:** Sound hook system, sound-event mapping, placeholder audio files.
**Depends on:** Core Game Logic events (`types.ts`), `expo-av`.
**Estimate:** 2 sessions.

---

## Phase 5: Animation Components

**Goal:** Build reusable animation components for all game moments.

**Tasks:**
- Create `src/hooks/useAnimation.ts` — `react-native-reanimated` wrapper with timing presets.
- Create animation components:
  - `CardFlipAnimation` — 500ms flip for card reveals.
  - `LanePulseAnimation` — 600ms pulse for lane resolution.
  - `VPFloatAnimation` — 800ms floating number for VP awards.
  - `AchievementBurstAnimation` — 1200ms burst + banner.
  - `PlayerPenaltyAnimation` — 300ms red flash + shake.
  - `SabotageAnimation` — 400ms crack effect overlay.
  - `ShieldAnimation` — 400ms dome flash overlay.
  - `AmbushAnimation` — 500ms strike lines overlay.
  - `ComebackSparkleAnimation` — 600ms gold sparkle particles.
  - `RoundTransitionAnimation` — 1000ms dim + brighten.
  - `GameOverAnimation` — 1500ms slow zoom + result cards.
  - `CardSlideAnimation` — 300ms hand-to-lane slide.
- Implement RTL-aware direction for all directional animations.
- Implement `ReduceMotionContext` for accessibility (disables non-essential animations).
- Ensure all animations use native driver where possible.

**Output:** 12 animation components, reduce-motion accessibility.
**Depends on:** Phase 2, 3 (card/board components), `react-native-reanimated`.
**Estimate:** 3 sessions.

---

## Phase 6: Game Feel Polish

**Goal:** Integrate all systems into a cohesive game feel experience.

**Tasks:**
- Wire `useGameSounds` into the main game screen.
- Wire animation components into the main game screen (triggered by game events).
- Implement waiting-is-engaging: subtle board animations during opponent planning phase.
- Implement strategic weight: heavier animations for high-value lanes and final rounds.
- Implement comeback feeling: brighter effects for trailing players.
- Implement penalty feedback: clear red/crimson indicators.
- Test all feedback loops end-to-end.
- Performance profiling: ensure 60fps on mid-range device.
- RTL testing: verify all animations reverse correctly.
- Accessibility testing: reduce-motion mode, visual alternatives for sounds.

**Output:** Fully integrated game feel.
**Depends on:** Phases 1–5, UI branch integration.
**Estimate:** 3 sessions.

---

## Total Estimate: ~13 sessions

| Phase | Sessions | Dependencies |
|---|---|---|
| 1: Color/Typography Constants | 1 | None |
| 2: Card Visual Components | 2 | Phase 1 |
| 3: Board/Lane Components | 2 | Phase 1 |
| 4: Sound Hook System | 2 | Core game events |
| 5: Animation Components | 3 | Phases 2, 3 |
| 6: Game Feel Polish | 3 | All phases |
