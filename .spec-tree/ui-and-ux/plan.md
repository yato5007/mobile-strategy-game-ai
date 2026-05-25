# UI and User Experience — Plan

## Phases

### Phase 1: Foundation
1. Set up Expo project with TypeScript strict mode.
2. Install dependencies: React Navigation, Zustand, react-native-reanimated, react-native-svg.
3. Configure RTL support (I18nManager).
4. Create theme system (colors, typography, spacing from DESIGN_SYSTEM.md).
5. Create RTL-aware layout components (Text, View, Button wrappers).

### Phase 2: Core Screens
1. HomeScreen (title, play button, language toggle).
2. LobbyScreen (mode selection, player slots, bot config).
3. GameScreen (board + hand + action bar layout).
4. ResultsScreen (standings, winner, play again).

### Phase 3: Game Components
1. Lane component (active/inactive, objectives, slot display).
2. Card component (all states: default, selected, placed, revealing, resolved).
3. Hand component (scrollable card row, selection).
4. ScoreBar (4 player scores, round counter).
5. ActionBar (confirm, cancel, timer).

### Phase 4: Game Flow Integration
1. Connect Zustand store to game engine.
2. Subscribe to game events (planning, reveal, resolution, cleanup).
3. Implement planning phase card interaction flow.
4. Implement reveal phase visual feedback.
5. Implement resolution phase animations.
6. Implement cleanup phase transitions.

### Phase 5: Animations & Polish
1. Card movement animations (hand → lane, lane → resolution).
2. Lane highlight animations.
3. VP float animations.
4. Achievement popup.
5. Timer countdown visual.
6. RTL layout testing and fixes.

### Phase 6: Testing & QA
1. Test on multiple screen sizes.
2. Test RTL/LTR mode switching.
3. Test all game phases visually.
4. Test edge cases (disconnected player, empty hand, etc.).
5. QA review.
