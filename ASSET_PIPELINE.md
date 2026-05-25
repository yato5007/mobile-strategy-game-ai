# Asset Pipeline — Art, Audio, Motion, and Game Feel

This file documents the complete asset pipeline for the mobile strategy game.

---

## 1. Asset Folder Structure

```
mobile-game/assets/
├── images/
│   ├── icons/           # UI icons (action icons, player avatars, etc.)
│   ├── board/           # Lane/board backgrounds and elements
│   ├── cards/           # Card art (unit, tactic, objective, comeback)
│   ├── effects/         # Visual effects (spy reveal, sabotage, etc.)
│   ├── backgrounds/     # Screen backgrounds (menu, game, results)
│   └── placeholders/    # Temporary placeholder SVGs
├── audio/
│   ├── sfx/             # Sound effects
│   ├── music/           # Background music / ambient
│   └── voice/           # Voiceover (Arabic/English, if applicable)
├── fonts/               # Arabic-first and English font files
├── animations/          # Lottie or JSON animation files
└── localization/        # Asset references per locale
```

---

## 2. Image and Icon Types Required

| Category | Assets | Format | Priority |
|---|---|---|---|
| UI Icons | Action icons (confirm, cancel, submit, settings), player indicators, VP icon, round indicator, lane icons | SVG | High |
| Board | Lane background (active/inactive), objective markers, streak indicator | SVG | High |
| Cards | 14+ card illustrations (Scout, Soldier, Knight, Champion, Bluff, Sabotage, Reinforce, Spy, Shield, Retreat, Ambush, Determination, Last Stand, Surprise Rally, Fortuna) | SVG | High |
| Effects | Reveal animation, sabotage flash, shield glow, spy eye, ambush strike, reinforce glow, comeback sparkle, achievement unlock, victory/defeat | SVG/Lottie | Medium |
| Backgrounds | Menu background, game board background, results screen | SVG | Medium |
| Avatars | 4 player avatar placeholders with Arabic-inspired geometric patterns | SVG | Low |

---

## 3. Audio Types Required

| Category | Assets | Format | Priority |
|---|---|---|---|
| SFX — Actions | Card select, card place, confirm submit, cancel, timer warning | WAV/MP3 | High |
| SFX — Round | Planning start, reveal whoosh, resolution thud, cleanup shuffle | WAV/MP3 | High |
| SFX — Tactics | Spy whisper, sabotage crack, shield ping, reinforce surge, bluff reveal, retreat swoosh, ambush strike | WAV/MP3 | Medium |
| SFX — Achievements | Achievement unlock, first blood, comeback king | WAV/MP3 | Medium |
| SFX — Match | Match start, round transition, victory fanfare, defeat, game over | WAV/MP3 | High |
| Music | Menu ambient (calm strategic), game ambient (tension building), endgame (urgent), victory, defeat | MP3 | Medium |
| UI Sounds | Button tap, slider adjust, page transition, notification | WAV/MP3 | Low |

---

## 4. Motion and Transitions Required

| Moment | Motion Type | Duration | Description |
|---|---|---|---|
| Card selection | Scale + lift | 200ms | Card scales 1.05x, lifts 4px |
| Card place to lane | Slide + drop | 300ms | Card slides from hand to lane position |
| Confirm submission | Fade + checkmark | 400ms | Assignments lock, checkmark appears |
| Reveal phase | Card flip | 500ms | Cards flip simultaneously with slight stagger |
| Lane resolution | Highlight + pulse | 600ms | Winning lane highlights, VP counter animates |
| VP award | Number float | 800ms | VP number floats up from lane |
| Achievement unlock | Burst + banner | 1200ms | Burst effect, banner slides in |
| Round transition | Screen dim + brighten | 1000ms | Brief dim, new round brightens |
| Game over | Slow zoom + result cards | 1500ms | Camera zooms out, results slide in |
| Player penalty | Red flash + shake | 300ms | Brief red overlay, lane shakes |
| Sabotage | Red crack effect | 400ms | Crack lines on target lane |
| Shield | Blue dome flash | 400ms | Dome appears then fades |
| Ambush | Strike lines | 500ms | Diagonal strike lines |
| Comeback bonus | Gold sparkle | 600ms | Gold particles on trailing player's side |

---

## 5. File Naming Convention

```
{category}_{subcategory}_{name}_{variant}.{ext}

Examples:
icon_action_confirm.svg
card_unit_scout.svg
sfx_tactic_sabotage.mp3
bg_game_board.svg
anim_victory_banner.lottie
font_arabic_primary.ttf
```

Categories: `icon`, `card`, `sfx`, `music`, `bg`, `anim`, `font`, `effect`
Subcategories: `action`, `unit`, `tactic`, `board`, `result`, `round`, etc.

---

## 6. Placeholder vs. Final Asset Policy

### Placeholder Assets
- Generated as simple colored SVG shapes with text labels.
- Clearly identifiable as placeholders (labeled "PLACEHOLDER" in metadata).
- Must be legal to use (MIT/CC0 or self-created).
- Used during development to validate layout, timing, and spacing.
- Stored in `assets/images/placeholders/` and `assets/audio/placeholders/`.

### Final Assets
- Fully designed assets with proper art direction.
- Must have clear licensing (purchased, commissioned, or self-created).
- Replace placeholders in the same directory structure.
- Document replacement in ASSET_PIPELINE.md.

### How to Replace Placeholders
1. Create the final asset following the naming convention.
2. Place in the appropriate `assets/` subdirectory.
3. Update the asset registry (if one exists in code or CI).
4. Remove or archive the placeholder file.
5. Test display on both Android and iOS.
6. Verify RTL/LTR compatibility.

---

## 7. Licensing Rules

1. **No asset with unclear licensing may be used.**
2. Acceptable sources:
   - Self-created assets (full ownership).
   - CC0 (Public Domain) assets.
   - MIT-licensed assets.
   - Purchased licenses (store receipt in `docs/licenses/`).
3. Allowed free asset sources:
   - SVG Repo (CC0)
   - OpenGameArt.org (CC0 / CC-BY)
   - Pixabay (simplified license)
   - Freesound.org (CC0)
   - Font Awesome (CC BY 4.0 / MIT for icons)
4. For placeholders: generate simple shapes/text programmatically (no external downloads needed).
5. Document the source and license of every asset in an ASSET_REGISTRY.md (future).

---

## 8. Connection to Other Systems

| System | Connection |
|---|---|
| UI | Assets are imported/required by React Native components. Placeholder SVGs ensure layout works before final art. |
| Localization | Image assets may have text overlays (Arabic/English). Some assets may need locale variants. |
| Android/iOS | SVG via `react-native-svg`. Audio via `expo-av`. Animations via `react-native-reanimated` or Lottie. |
| Game Logic | Events from the game engine trigger visual effects and sounds (e.g., `LaneResolved` → resolution animation). |
| Performance | Assets must be optimized for mobile. SVG complexity limited. Audio files compressed. No HD textures. |
| RTL/LTR | UI mirroring may require flipped assets for directional content. |

---

## 9. Priority Implementation Order

1. **Placeholder system** — Generate all placeholders as simple SVGs and silent audio files. This allows UI development to proceed.
2. **Core game feel** — Motion for card placement, reveal, and lane resolution (most critical for strategic clarity).
3. **Sound effects** — Round transitions, card actions, tactic activation (critical for feedback).
4. **Visual effects** — Tactic animations, achievement effects.
5. **Final art** — Card illustrations, board design, icon set.
6. **Music / ambient** — Background audio.

---

## 10. Arabic-First Visual Identity

- Geometric patterns inspired by Islamic art (stars, octagons, interlocking shapes).
- Warm, sand-and-jewel color palette (see DESIGN_SYSTEM.md).
- Calligraphy-inspired typography for Arabic headers.
- Ornamental borders for cards and panels.
- Arabic text flows RTL; English LTR with same visual weight.
- No culturally inappropriate imagery.
- The strategy theme aligns with the Arabic tradition of chess and tactical games (shatranj).
