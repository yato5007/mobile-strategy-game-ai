# UI and User Experience — Node Summary

## Purpose
Build all player-facing screens, components, and interaction flows for the mobile strategy game. This includes the game board (lanes), card hand interaction, planning phase UI, reveal/resolution animations, score tracking, navigation between screens, and full RTL/LTR support for Arabic and English.

## Parent Link
- **Parent Node**: `root` (project root)
- **Sibling Nodes**:
  - `core-game-logic` — provides game engine types, events, and functions
  - `art-audio-motion` — provides assets, animation hooks, sound triggers
  - `localization-i18n` — provides translation strings and RTL configuration
  - `bot-ai` — provides bot config UI (selected in LobbyScreen)
  - `multiplayer` — provides mock/online connection (future)

## Dependencies

| Dependency | Purpose | Status |
|---|---|---|
| Core Game Logic Engine (`../game`) | Types (`GameState`, `CardAssignment`, `PlayerId`, etc.), event emitter, `submitAssignments()` function | ✅ Complete |
| React Native + Expo SDK | Platform framework | ✅ Available |
| TypeScript (strict) | Type safety | ✅ Configured |
| Zustand | State management (gameStore + uiStore) | ✅ Available |
| React Navigation (stack) | Screen navigation | ✅ Available |
| react-native-reanimated (v3+) | Performant animations | ✅ Available |
| react-native-svg | Scalable lane/card graphics | ✅ Available |
| react-native-safe-area-context | Safe area insets | ✅ Available |
| Localization branch | `useTranslation()` hook, RTL config | 🔄 In progress |
| Art/Audio/Motion branch | Asset imports, animation definitions, sound hooks | 🔄 In progress |

## Decisions Made
1. **Zustand over Redux**: Simpler, TypeScript-native, sufficient for this scope.
2. **react-native-reanimated over Animated API**: Better performance for card/lane animations.
3. **SVG for all graphics**: Scalable, no resolution concerns across screen sizes.
4. **Separate stores (gameStore + uiStore)**: Prevents confusion between game state and UI preferences.
5. **Portrait-only orientation**: Simpler layout, expected for mobile strategy games.
6. **Stack navigator (not tab)**: Linear screen flow fits the match lifecycle (Home → Lobby → Game → Results).

## Alternatives Rejected
- **Redux Toolkit**: More boilerplate, unnecessary for this scope.
- **React Native Animated API**: Lower performance for 60fps animations.
- **PNG assets**: Resolution issues across device sizes; SVG preferred.
- **Landscape orientation**: More complex layout, not typical for strategic card games.
- **Tab navigator**: Would allow accessing screens out of match flow order; confusing.

## Integration Risks

| Risk | Severity | Mitigation |
|---|---|---|
| RTL breaks on React Native components | High | Use `I18nManager` from start; test on both platforms early |
| Animation performance on low-end Android | Medium | Keep animations simple; use native driver; add "Reduce Motion" option |
| Lane/card layout overflow on small screens | Medium | Scrollable lanes, compact cards, responsive breakpoints |
| Zustand store shape changes when engine updates | Medium | Define clear TypeScript interfaces; update both sides in sync |
| Localization strings not ready before UI | Low | Hardcode keys as placeholders in early dev; swap to translation hook later |
| Art assets not ready before UI | Low | Use clearly labeled SVG placeholders; swap to final assets later |

## Implementation Status
- **Phase 1 (Foundation)**: 🔄 Not started
- **Phase 2 (Core Screens)**: 🔄 Not started
- **Phase 3 (Game Components)**: 🔄 Not started
- **Phase 4 (Game Flow Integration)**: 🔄 Not started
- **Phase 5 (Animations & Polish)**: 🔄 Not started
- **Phase 6 (Testing & QA)**: 🔄 Not started

## Tests
- Visual verification on 3 screen sizes (360×640, 390×844, 412×915).
- RTL/LTR mode switching.
- All game phases visual correctness.
- Touch target size verification (44×44dp minimum).
- No hardcoded text verification.
- Zustand store event subscription tests.

## Next Step
Execute **Phase 1: Foundation** — set up Expo project structure, install dependencies, configure RTL support, create theme system, and build RTL-aware wrapper components.
