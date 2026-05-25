# Art, Audio, Motion, and Game Feel System — Analysis

## Risk Assessment

### Risk 1: Asset Licensing Violations
**Severity:** High
**Likelihood:** Low (with clear process)
**Mitigation:**
- All assets must have documented license in source code comments.
- Placeholder assets are self-generated (no external risk).
- Final assets will come from CC0 repositories or self-creation only.
- ASSET_PIPELINE.md §7 lists approved sources.
- A future ASSET_REGISTRY.md will track every asset's provenance.
- **Contingency:** If a licensed asset must be removed, replace with self-created SVG immediately.

### Risk 2: Mobile Performance (SVG Rendering)
**Severity:** High
**Likelihood:** Medium
**Mitigation:**
- SVG complexity limits defined in clarification.md §3.
- Use `react-native-svg` which renders native elements (not a WebView).
- Profile on mid-range Android device (e.g., Pixel 4a) and iPhone SE.
- Reduce-motion mode as fallback for low-end devices.
- **Contingency:** If SVGs drop below 30fps, simplify shapes further or pre-render to bitmap.

### Risk 3: RTL Animation Bugs
**Severity:** Medium
**Likelihood:** Medium
**Mitigation:**
- Directional animations use `I18nManager.isRTL` from react-native.
- All animation components accept a `direction` prop.
- RTL test suite: run every animation in both LTR and RTL mode.
- **Contingency:** If an animation breaks in RTL, add an explicit RTL variant rather than trying to flip mathematically.

### Risk 4: Sound Synchronization with Game Events
**Severity:** Medium
**Likelihood:** Medium
**Mitigation:**
- Sound hook subscribes to same event emitter as UI.
- Events carry enough data to select the correct sound variant.
- Sound playback is fire-and-forget (no blocking).
- **Contingency:** If sound lags behind visual, preload all sounds at game start and pool playback instances.

### Risk 5: Animation Timing Conflicts with Round Timing
**Severity:** Medium
**Likelihood:** Low
**Mitigation:**
- Animations are fire-and-forget overlays on the game state; they do not block game logic.
- Game engine emits events; animations are decorative, not authoritative.
- Ensure total animation time does not exceed the time between game phases.
- **Contingency:** If animations take too long, reduce duration or skip non-critical ones during fast phases.

### Risk 6: Arabic Font Rendering Differences Across Platforms
**Severity:** Medium
**Likelihood:** Medium
**Mitigation:**
- Test Amiri and Noto Naskh Arabic on both Android and iOS.
- iOS renders Arabic with different glyph shaping; use system fonts as fallback.
- Font files bundled with the app (not system-dependent).
- **Contingency:** If a specific font is problematic on a platform, switch to Noto Sans Arabic (well-supported on both).

---

## Key Decisions

### Decision AA-01: SVG over PNG for Game Assets
- **Decision:** All game visual assets will be SVG (inline `react-native-svg` components) rather than PNG/JPEG.
- **Reason:** SVG is resolution-independent (critical for multiple mobile screen sizes), supports RTL flipping via `scaleX: -1`, smaller bundle size than PNG spritesheets, and allows dynamic color changes via props.
- **Risk:** Complex SVGs may be slow on low-end Android devices.
- **See also:** Clarification §3 (performance constraints).

### Decision AA-02: `react-native-reanimated` over `Animated` API
- **Decision:** Use `react-native-reanimated` for all animations.
- **Reason:** 60fps via UI thread, supports native driver for transforms/opacity, required for smooth card sliding and lane resolution animations.
- **Risk:** Learning curve; some layout animations still need JS thread.
- **See also:** Clarification §7.

### Decision AA-03: `expo-av` for Sound Playback
- **Decision:** Use `expo-av` for all sound loading and playback.
- **Reason:** Expo-compatible, supports MP3/WAV, supports audio pooling, volume control, and multiple simultaneous sounds.
- **Risk:** None significant; well-tested in Expo ecosystem.

### Decision AA-04: Self-Created Placeholder Assets
- **Decision:** Generate placeholder SVGs and silent audio programmatically during development.
- **Reason:** Zero licensing risk, allows UI development to proceed without final art, easy to identify and replace.
- **See also:** Clarification §2.

### Decision AA-05: Event-Driven Animation Triggering
- **Decision:** Animations are triggered by subscribing to `GameEvent` types emitted by the game engine.
- **Reason:** Decouples animation logic from game logic. UI components simply render the current state; animations are overlaid on state transitions.
- **Risk:** If events fire too rapidly, animations may stack. Mitigate with animation queue or skip-if-playing flag.

### Decision AA-06: RTL via `I18nManager.isRTL`
- **Decision:** Use React Native's built-in `I18nManager.isRTL` to determine layout and animation direction.
- **Reason:** Consistent with the localization branch which controls `I18nManager.forceRTL()`.
- **Risk:** `I18nManager.isRTL` is static at runtime (requires app restart to change). This is acceptable since language switching in mobile apps typically requires restart.

---

## Dependencies

| Dependency | Why | Type |
|---|---|---|
| `react-native-svg` | SVG rendering for cards, board, icons, effects | External package |
| `react-native-reanimated` | 60fps animations for all game moments | External package |
| `expo-av` | Audio playback for sound effects and music | External package |
| `expo-font` | Loading custom Arabic/English font files | External package |
| Core Game Logic (`types.ts`) | `GameEvent` type definition, event emitter contract | Internal file |
| UI branch | Components that host card/board/animation components | Internal branch |
| Localization branch | `I18nManager.forceRTL()` controls direction | Internal branch |
| DESIGN_SYSTEM.md | Color palette, typography, spacing, motion guidelines | Design doc |
| ASSET_PIPELINE.md | Asset folder structure, naming conventions, licensing rules | Design doc |

---

## Integration Points

| System | Integration Point |
|---|---|
| Game Engine | Events: `GameEvent` → animation/sound dispatch |
| UI | `src/styles/*` constants imported by UI components |
| UI | Card and board components consumed by game screens |
| UI | Animation components rendered as overlays on game screens |
| Localization | `I18nManager.isRTL` determines animation direction |
| Android/iOS | Expo handles cross-platform rendering; test both |

---

## Sibling Compatibility

| Sibling Node | Compatibility | Notes |
|---|---|---|
| Core Game Logic | ✅ No conflict | Art system only reads events, never modifies state |
| UI and UX | ✅ Shared contract | Art components are imported by UI; color/typography constants are shared |
| Bot and AI | ✅ No conflict | Art system does not interact with bot decisions |
| Multiplayer | ✅ No conflict | Art system is purely presentational; no network dependency |
| Localization | ✅ Shared contract | RTL flag from localization; font files bundled by art system |
| Balance and Testing | ✅ No conflict | Art system does not affect game balance |
