# Design System

The game must define:

1. Arabic-first visual style.
2. Color direction.
3. Typography direction.
4. Icon style.
5. UI spacing.
6. Arabic RTL rules.
7. English LTR rules.
8. Android/iOS layout considerations.
9. Player-facing text rules.
10. No hardcoded UI text.
11. Motion and animation guidelines.
12. Sound design guidelines.
13. Game feel principles.
14. Asset pipeline rules.
15. Placeholder management policy.

Arabic and English support must be designed from the beginning.

---

## 1. Arabic-First Visual Style

- Geometric patterns inspired by Islamic art (stars, octagons, interlocking shapes).
- Warm, sand-and-jewel color palette.
- Calligraphy-inspired typography for Arabic headers.
- Ornamental borders for cards and panels.
- Arabic text flows RTL; English LTR with same visual weight.
- No culturally inappropriate imagery.
- The strategy theme aligns with the Arabic tradition of chess and tactical games (shatranj).

## 2. Color Direction

| Role | Color | Hex |
|---|---|---|
| Primary Background | Deep Sand | #C4A35A |
| Secondary Background | Night Blue | #1A2744 |
| Accent Gold | Triumph Gold | #FFD700 |
| Accent Red | Warning Red | #C0392B |
| Accent Green | Success Green | #27AE60 |
| Card Unit | Desert Brown | #8B6914 |
| Card Tactic | Mystic Purple | #6C3483 |
| Card Objective | Royal Blue | #2874A6 |
| Card Comeback | Phoenix Orange | #E67E22 |
| VP Text | Gold | #FFD700 |
| Neutral Text | Off White | #F5F0E1 |
| Danger | Crimson | #DC143C |

## 3. Typography Direction

- **Arabic Primary:** Amiri or similar classical Arabic typeface (weights: Regular, Bold).
- **English Primary:** Playfair Display or similar serif (weights: Regular, Bold, Italic).
- **UI Text (both):** Noto Naskh Arabic / Noto Sans (clean, readable at small sizes).
- **Card Names:** Decorative serif for English, calligraphic for Arabic.
- **Body / Instructions:** Clean sans-serif at 14–16dp.
- Headers use gold accents, body uses off-white.

## 4. Icon Style

- Line-art style with 2px stroke width.
- Filled with accent colors for active states.
- Consistent 24×24dp baseline, scaling to 32×32dp for primary actions.
- RTL-aware: directional icons (arrows, back, forward) must flip in RTL mode.
- Icons represent: confirm, cancel, submit, settings, info, VP, lane, card types, achievements, timer.

## 5. UI Spacing

- Base grid: 4dp.
- Card padding: 12dp.
- Lane gap: 8dp.
- Screen edge margins: 16dp.
- Button heights: 48dp minimum.
- Touch targets: 44×44dp minimum.

## 6. Arabic RTL Rules

- All layouts must reverse in RTL mode: from left-aligned to right-aligned.
- Cards in hand: right-to-left reading order.
- Lane order: right-to-left (lane 1 is rightmost).
- Back/forward navigation icons must flip.
- Text alignment: right for Arabic, left for English.
- Animations and motion paths must also reverse.

## 7. English LTR Rules

- Layouts follow standard left-to-right reading.
- Cards in hand: left-to-right reading order.
- Lane order: left-to-right (lane 1 is leftmost).
- Standard text alignment.

## 8. Android/iOS Layout Considerations

- Safe area insets respected on both platforms.
- Status bar: dark icons on light backgrounds, light icons on dark.
- Navigation: Android back button vs iOS swipe gesture.
- No platform-specific navigation bars — use in-game UI only.
- Font rendering: test Arabic on both platforms (iOS renders Arabic differently).
- Performance: avoid excessive shadows/overdraw on Android.

## 9. Player-Facing Text Rules

- All text must use the localization system.
- No hardcoded strings in UI components.
- Text must fit within safe layout bounds in both languages (Arabic text is typically 25% longer).
- Card names: maximum 2 lines.
- Descriptions: maximum 4 lines.
- Button labels: maximum 1 line.

## 10. Motion and Animation Guidelines

- **Responsiveness:** All UI feedback under 100ms. Card actions under 300ms. Scene transitions under 1000ms.
- **Strategic weight:** Important actions (submit, reveal, resolve) have slower, weightier animations (400–800ms).
- **Spatial awareness:** Cards animate from hand to lane positions. The player always knows where cards came from and went to.
- **Simultaneous reveal:** All lanes resolve simultaneously with consistent timing. Stagger effects should be under 200ms to maintain synchronicity.
- **No disorienting motion:** No spinning, shaking (except for penalties), or full-screen flashes.
- **RTL-awareness:** Directional animations (slide-in, slide-out) must reverse in RTL mode.
- **Animation library:** Use `react-native-reanimated` for performant 60fps animations.

## 11. Sound Design Guidelines

- **Feedback layering:** Action sounds (short, 100–300ms) + Event sounds (medium, 500–800ms) + Cinematic sounds (long, 1–3s).
- **Arabic tonal influence:** Use maqam-inspired tones for musical elements.
- **No repetitive annoyance:** Sounds should not loop rapidly or play over each other.
- **Accessibility:** All sound effects must have visual alternatives (a player who cannot hear must still understand game state).
- **Audio format:** Compressed MP3/AAC for music, WAV for short SFX.
- **Volume levels:** SFX: -6dB peak, Music: -12dB peak. User-adjustable.

## 12. Game Feel Principles

- **Clarity over flash:** Every visual/audio effect must communicate game state, not just look impressive.
- **Weight of decisions:** High-stakes actions (final round, high-value lane) have heavier animations.
- **Comeback feeling:** Trailing players get visually brighter effects (gold sparkles, rising animations).
- **Penalty feedback:** Negative actions have clear red/crimson indicators. The player must immediately know they made a mistake.
- **Achievement celebration:** Achievements get full-screen treatment (1200ms burst + sound).
- **Waiting is engaging:** During opponent reveal/resolution, the UI should animate the process (cards flipping, lanes highlighting) rather than showing a static "waiting" screen.

## 13. Placeholder Management

- All placeholder assets are in `assets/images/placeholders/` and `assets/audio/placeholders/`.
- Placeholders are simple colored SVG shapes with text labels.
- Every placeholder has a metadata comment: `<!-- PLACEHOLDER: replace with final asset -->`.
- The asset pipeline in `ASSET_PIPELINE.md` documents how to replace placeholders.
- Final assets must be tested in both Arabic and English modes.

## 14. Asset Pipeline Reference

See `ASSET_PIPELINE.md` for:
- Complete asset folder structure
- File naming conventions
- Required image, audio, and animation assets
- Priority implementation order
- Licensing rules and approved sources
- How to replace placeholders with final assets
