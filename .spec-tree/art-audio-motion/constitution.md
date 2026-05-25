# Art, Audio, Motion, and Game Feel System — Constitution

## Purpose
Define and implement the visual identity, sound design, motion language, and game feel for the mobile strategy game. This is a core system alongside UI, Bots, Multiplayer, Localization, and Balance.

## Scope
- Arabic-first visual identity and cultural style.
- Color system, typography, iconography.
- Card and board visual design.
- Sound effects for all major game events.
- Animation and transition system.
- Game feel principles (weight of decisions, feedback loops).
- Asset pipeline and placeholder management.
- Licensing compliance for all assets.
- RTL/LTR-aware visual and motion design.

## Out of Scope
- Game logic implementation (owned by Core Game Logic Engine).
- UI layout and component architecture (owned by UI branch).
- Localization translation files (owned by Localization branch).
- Network multiplayer (owned by Multiplayer branch).
- Bot AI decision-making (owned by Bot branch).
- Balance calculations (owned by Balance branch).

## Key Constraints
1. Arabic-first identity — not just translation, but genuine visual culture.
2. Strategic clarity — every visual/audio element must support decision-making.
3. No distracting or disorienting effects.
4. All assets must have clear legal licensing.
5. Placeholders must be clearly labeled and replaceable.
6. Mobile performance — optimized SVGs, compressed audio, efficient animations.
7. RTL-aware — directional animations and layouts must reverse.
8. Accessibility — all sounds must have visual alternatives.

## Dependencies
- Core Game Logic Engine (events trigger visual/audio feedback).
- UI branch (components consume assets and animations).
- Localization branch (text overlays on assets).
- Android/iOS platform (Expo-compatible asset formats).

## Lead Agent
@art-audio-motion-director
