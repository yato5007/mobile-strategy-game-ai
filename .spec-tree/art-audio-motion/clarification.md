# Art, Audio, Motion, and Game Feel System — Clarification

This document clarifies ambiguous aspects of the specification.

---

## 1. Asset Sources and Licensing

**Q: Where do we get art and sound assets?**

A: All assets must be legally sourced. Four tiers:

| Tier | Type | Source | License |
|---|---|---|---|
| 1 | Inline SVG components | Self-created React Native SVG components | Full ownership |
| 2 | Placeholder SVGs | Programmatically generated colored shapes with text labels | Full ownership |
| 3 | CC0 sounds | Freesound.org, OpenGameArt.org | CC0 / Public Domain |
| 4 | Final card art | Self-created or commissioned (future) | Full ownership or purchased license |

**Clarification:**
- No asset may be used without a documented license.
- Placeholder SVGs are generated in code (not downloaded), so they are always legal.
- For sounds during development, we use self-created silent WAV placeholders verified to be silent and minimal size.
- Final sound effects can be sourced from CC0 repositories when ready.

---

## 2. Placeholder Policy

**Q: What exactly counts as a placeholder? When are they replaced?**

A: Placeholders serve two purposes:

1. **Layout validation** — Colored rectangles with text labels ("Card Placeholder", "Lane Placeholder") ensure the UI layout works before final art exists.
2. **Sound placeholder** — Silent 100ms WAV files ensure the sound hook system works end-to-end before real sounds are sourced.

**Rules:**
- Every placeholder file contains a metadata comment: `<!-- PLACEHOLDER: replace with final asset -->` for SVGs, or a `PLACEHOLDER` marker in the filename for audio.
- Placeholder SVGs live in `assets/images/placeholders/`.
- Placeholder audio lives in `assets/audio/placeholders/`.
- Final assets replace placeholders in the same directory, or the directory reference is updated.
- No placeholder may be shipped in the final build (they are development-only).

---

## 3. Performance Constraints

**Q: How complex can SVGs be? What audio compression is needed?**

A: Mobile performance is a hard constraint.

**SVG Limits:**
- Max 20 primitive shapes per card SVG (rect, circle, path, text).
- Max 10 primitive shapes per icon SVG.
- Board SVGs: max 30 shapes per lane, max 100 shapes total for the board.
- No embedded raster images inside SVGs.
- No gradients with more than 2 stops (use solid or 2-stop linear gradients only).
- No complex filters (drop shadow is acceptable if implemented via React Native shadow, not SVG filter).
- All SVGs must render at 60fps on a 3-year-old mid-range Android device.

**Audio Limits:**
- SFX files: max 500ms duration, max 48kHz sample rate, mono, MP3 at 128kbps or WAV at 16-bit.
- Music files: max 60s loop, max 48kHz, stereo, MP3 at 192kbps.
- Total audio loaded at any time: max 10 simultaneous sounds (use pooling).
- Placeholder audio: 100ms silent WAV, 16-bit, 22kHz, mono (approximately 4KB each).

**Animation Limits:**
- Max 4 simultaneous animated elements on screen.
- Animations must use native driver (`useNativeDriver: true`) in `react-native-reanimated` where possible.
- Animations that cannot use native driver (layout-based) must be profiled and optimized.
- Reduce-motion mode must disable all non-essential animations (opacity/transform-only animations may remain).

---

## 4. How RTL Affects Animations

**Q: Exactly which animations reverse in RTL mode?**

A: Any animation with a directional component must reverse.

| Animation | LTR Behavior | RTL Behavior |
|---|---|---|
| Card slide to lane | Slides left-to-right | Slides right-to-left |
| Card slide back to hand | Slides right-to-left | Slides left-to-right |
| Lane resolution order | Left-to-right (lane 0 → lane N) | Right-to-left (lane N → lane 0) |
| Achievement banner slide | Slides in from left | Slides in from right |
| Victory/defeat overlay | Slides in from right | Slides in from left |
| Scoreboard update animation | Numbers count up left-to-right | Numbers count up right-to-left |
| Round transition wipe | Wipes left-to-right | Wipes right-to-left |

**Implementation:**
- Use `I18nManager.isRTL` from `react-native` to determine direction.
- Export a `useRTL` hook that returns `{ isRTL, direction, flipX }`.
- Directional animations use `Animated.Direction` enum or a `direction` prop.
- Non-directional animations (pulse, glow, flip, flash, shake) are unchanged.

---

## 5. What Constitutes a "Major Game Event" for Feedback?

**Q: Which events must have visual AND audio feedback?**

A: These 15 `GameEvent` types from the engine must trigger both visual and audio feedback:

| # | Event | Visual Feedback | Audio Feedback |
|---|---|---|---|
| 1 | GameStarted | Board fade-in, card deal animation | Match start sound |
| 2 | RoundStarted | Round number banner, lane activation | Round transition sound |
| 3 | PlanningPhase | Timer bar appears, cards become interactive | Planning phase ambient |
| 4 | PlayerSubmitted | Lock animation, checkmark on player panel | Confirm chime |
| 5 | RevealPhase | Card flip animation on all lanes | Reveal whoosh |
| 6 | ResolutionPhase | Lane highlight pulse, strength comparison | Resolution thud |
| 7 | LaneResolved | Winner gold glow, VP counter float | Lane win fanfare |
| 8 | VPAwarded | Number float up to scoreboard | Coin/VP sound |
| 9 | RoundComplete | Scoreboard update, lane reset | Round end sound |
| 10 | AchievementUnlocked | Full burst + banner | Triumphant burst |
| 11 | ComebackBonus | Gold sparkle, bonus card appear | Gold sparkle sound |
| 12 | GameOver | Slow zoom, result cards slide in | Game over fanfare |
| 13 | PlayerPenalized | Red flash + shake on player area | Penalty sting |
| 14 | SpyInfo | Eye icon reveal, card peek animation | Spy whisper |
| 15 | Error | Red toast, shake icon | Error buzz |

Additionally, these UI-level interactions have audio feedback (but minimal or no visual):
- Card tap → short click sound
- Card place in lane → soft thud
- Button press → UI tap sound
- Timer warning → tick sound

---

## 6. Accessibility Requirements

**Q: How do we handle players who cannot hear or prefer reduced motion?**

A: Two accessibility systems:

1. **Visual alternatives for sounds:** When a sound plays, a small icon appears on screen showing the type of sound (e.g., a speaker icon for a card place, a music note for an achievement). These icons are optional and enabled via settings.

2. **Reduce motion mode:**
   - Disables all non-essential animations (card slide, board pulse, sparkle effects).
   - Keeps essential animations that communicate game state (card reveal flip, lane resolution highlight, VP counter update).
   - Uses instant state transitions instead of animated ones.
   - Controlled via `ReduceMotionContext` and a settings toggle.

---

## 7. Animation Library Choice

**Q: Why `react-native-reanimated` over alternatives?**

A: Preferred because:
- 60fps animations via the UI thread (native driver).
- Smooth transitions without JS thread blocking.
- Well-supported in Expo SDK.
- Allows complex gesture-based interactions for future polish (e.g., drag-to-place cards).

Alternatives rejected:
- `Animated` (React Native built-in): Slower, JS thread blocking for complex sequences.
- Lottie: Great for complex animations but heavier bundle size, harder to make RTL-aware.
- Custom native modules: Unnecessary complexity for 2D card/board animations.
