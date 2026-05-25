# UI and User Experience — Specification

## 1. Screen Architecture

### 1.1 Screens
- **HomeScreen**: Game title, play button, settings, language toggle.
- **LobbyScreen**: Configure match (mode: FFA/2v2, player slots, bot difficulty/styles).
- **GameScreen**: Main gameplay — board, hand, controls.
- **ResultsScreen**: Final standings, winner announcement, play again.
- **SettingsScreen**: Audio/music volume, language, about.

### 1.2 Navigation
- Stack navigator (React Navigation).
- Home → Lobby → Game → Results → Home.
- Settings accessible from Home and Game.

## 2. GameScreen Layout

### 2.1 Board Area (top 60% of screen)
- 3–5 lanes displayed horizontally (scrollable if needed).
- Each lane shows: objective icon, VP value, current player strengths (after reveal).
- Active vs inactive lane visual distinction.
- RTL: lanes ordered right-to-left for Arabic.

### 2.2 Hand Area (bottom 25% of screen)
- Player's cards displayed as a horizontal scrollable row.
- Cards show: icon, name, strength value, tactic type indicator.
- Selected card has highlight/border.
- Max visible cards: 5–7 (scroll for more).
- RTL: cards ordered right-to-left for Arabic.

### 2.3 Action Bar (bottom 10%)
- Confirm assignments button.
- Cancel selection.
- Round timer indicator.
- Settings gear icon.

### 2.4 Score Bar (top 5%)
- All 4 player scores.
- Current round indicator.
- Mode indicator (FFA/2v2).

## 3. Card Interaction Flow

### 3.1 Planning Phase
1. Player taps a card in hand → card is "selected" (lifted + highlighted).
2. Player taps a lane → card animates from hand to lane position.
3. Card appears in lane slot (face-down to others, face-up to owner).
4. Player can tap placed card to remove it back to hand.
5. Player taps Confirm button → assignments locked.
6. In 2v2: teammate's cards visible in same lane with different color border.

### 3.2 Reveal Phase
1. Cards flip simultaneously with a slight stagger (50ms per lane).
2. Tactic cards have distinct visual treatment.
3. Spy info shown as private brief overlay.

### 3.3 Resolution Phase
1. Each lane highlights winning player with gold border.
2. VP numbers float up and add to score.
3. Tactic effects animated (sabotage crack, shield dome, etc.).
4. Ambush effect as red flash on winner.

### 3.4 Cleanup Phase
1. Cards fade from lanes.
2. New cards slide into hand.
3. Comeback bonus shown as gold sparkle overlay.
4. Achievement popup if earned.

## 4. State Management (Zustand)

### 4.1 Game Store
- `gameState: GameState` — from core engine.
- `events: GameEventEmitter` — from engine.
- `localPlayerId: PlayerId` — current human player.
- `phase: 'planning' | 'reveal' | 'resolution' | 'cleanup'` — synced from engine.
- `selectedCardId: CardId | null` — currently selected card.
- `pendingAssignments: CardAssignment[]` — assignments before confirm.
- `revealedAssignments: Record<PlayerId, CardAssignment[]>` — after reveal.
- `error: string | null` — validation errors.

### 4.2 UI Store
- `language: 'ar' | 'en'`
- `isRTL: boolean`
- `theme: 'light' | 'dark'` (future)
- `audioEnabled: boolean`
- `musicEnabled: boolean`

## 5. Component Tree

```
App
├── NavigationContainer
│   ├── HomeScreen
│   ├── LobbyScreen
│   ├── GameScreen
│   │   ├── ScoreBar
│   │   ├── BoardArea
│   │   │   ├── Lane (×3-5)
│   │   │   │   ├── LaneObjectiveIcon
│   │   │   │   ├── LaneSlot (×1-3 per player)
│   │   │   │   └── StrengthIndicator
│   │   ├── HandArea
│   │   │   ├── Card (×n)
│   │   │   │   ├── CardIcon
│   │   │   │   ├── CardName
│   │   │   │   └── CardStrength
│   │   ├── ActionBar
│   │   │   ├── ConfirmButton
│   │   │   └── TimerIndicator
│   │   └── PhaseOverlay (reveal/resolution animations)
│   ├── ResultsScreen
│   └── SettingsScreen
```

## 6. Key UI States Per Component

### Card Component
- **default**: Normal state, face showing.
- **selected**: Lifted + gold border + slight scale (1.05x).
- **placed**: In lane slot, face-down to others.
- **revealing**: Flip animation (500ms).
- **resolved**: Grayed out if lost, glowing if won.

### Lane Component
- **inactive**: Dimmed with lock icon.
- **active-planning**: Normal, waiting for assignments.
- **active-reveal**: Cards being shown.
- **active-resolution**: Highlighted with winner.
- **won**: Gold border, VP displayed.
- **lost**: Dimmed slightly.
- **tied**: Split VP indicator.

### Confirm Button
- **disabled**: Grayed, no assignments yet.
- **active**: Gold, pulsing gently.
- **pressed**: Brief scale animation.
- **locked**: Checkmark, no longer interactive.

## 7. Responsive Layout Rules

- Portrait orientation only.
- Board = 60% height, Hand = 25%, Action = 10%, Score = 5%.
- Minimum lane width: 60dp.
- Maximum cards per row in hand: 5 (then scroll).
- Lane gap: 8dp.
- Card margin: 4dp.
- Safe area insets respected (notch, status bar).
- Test on: 360×640 (small), 390×844 (iPhone 14), 412×915 (Android large).

## 8. Integration Points

- **Core Game Logic**: Import types, functions, event emitter from `../game`.
- **Localization**: All strings via `useTranslation()` hook.
- **Art/Audio/Motion**: Asset imports, animation triggers, sound effect calls.
- **Multiplayer**: Zustand store shared (local mock) or synced (future real).
- **Bot**: Bot config selected in LobbyScreen.
