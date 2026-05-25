# UI and User Experience — Constitution

## Purpose
Build the player-facing interface for the mobile strategy game: board rendering, card interaction, lane display, score tracking, RTL/LTR layout, and responsive design for Android and iOS.

## Scope
- Game board (lane display, objectives, active/inactive states).
- Card hand and card interaction (select, assign, confirm).
- Planning phase UI (assign cards to lanes).
- Reveal and resolution animations.
- Scoreboard and standings.
- Match results screen.
- Settings and game configuration screens.
- RTL/LTR layout support.
- Touch interactions (44×44dp min targets).
- Responsive layout for different screen sizes.
- State management connection (Zustand or similar).
- Navigation between screens (lobby, game, results).

## Out of Scope
- Game logic (owned by Core Game Logic Engine).
- Art assets (owned by Art/Audio/Motion branch).
- Audio playback (owned by Art/Audio/Motion branch).
- Localization files (owned by Localization branch).
- Bot UI (owned by Bot branch).
- Multiplayer connection UI (owned by Multiplayer branch).

## Dependencies
- Core Game Logic Engine (types, events, game state).
- Art/Audio/Motion branch (assets, animations, sound hooks).
- Localization branch (text strings, RTL support).
- React Native + Expo + TypeScript.
- Zustand or similar for state management.
- react-native-reanimated for animations.

## Key Constraints
1. Arabic RTL and English LTR must both work correctly from the start.
2. Touch targets: minimum 44×44dp.
3. Visual feedback for all player actions (<100ms).
4. No hardcoded player-facing text.
5. Must work on both Android and iOS.
6. Must handle 4 player displays (FFA and 2v2 team view).
