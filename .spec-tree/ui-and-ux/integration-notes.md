# UI and User Experience — Integration Notes

## 1. Integration with Core Game Logic Engine

### 1.1 Import Path
```typescript
// All core game types, functions, and event emitter are imported from:
import {
  GameState,
  GameMode,
  PlayerId,
  CardAssignment,
  CardId,
  LaneId,
  GameEvent,
  GameEventEmitter,
  createGame,
  submitAssignments,
  getGameResult,
} from '../game';
```

### 1.2 Event Subscriptions
The GameScreen must subscribe to game engine events to update UI state:

```typescript
// Pseudocode for event subscription
const emitter = new GameEventEmitter();

emitter.on('phase:planning', () => {
  // Enable card selection and lane assignment
  // Start round timer (60s)
});

emitter.on('phase:reveal', () => {
  // Show reveal overlay
  // Animate card flips
});

emitter.on('phase:resolution', () => {
  // Animate lane resolutions
  // Show VP float effects
  // Trigger tactic effects
});

emitter.on('phase:cleanup', () => {
  // Remove cards from lanes
  // Deal new cards
  // Show comeback bonuses and achievements
});

emitter.on('game:error', (error) => {
  // Show error overlay
});

emitter.on('game:end', (result) => {
  // Navigate to ResultsScreen with result payload
});
```

### 1.3 Calling Engine Functions
```typescript
// When player confirms assignments:
const result = submitAssignments(gameId, playerId, pendingAssignments);
if (result.success) {
  // Navigate to next phase
} else {
  // Display validation error
}
```

### 1.4 State Ownership
- **Game Engine owns**: Game state (scores, lanes, cards, phases, round counter).
- **UI owns**: Selected card, pending assignments before confirm, reveal animations state, error display state.
- **Shared**: Phase transitions are driven by engine events; UI reads phase from event payload.
- **Contract**: UI must never mutate game state directly — always call engine functions.

## 2. Zustand Store Integration

### 2.1 Game Store (Thin Wrapper)
```typescript
interface GameStore {
  // Read from engine
  gameState: GameState | null;
  phase: 'planning' | 'reveal' | 'resolution' | 'cleanup';
  
  // UI-managed selection
  selectedCardId: CardId | null;
  pendingAssignments: CardAssignment[];
  revealedAssignments: Record<PlayerId, CardAssignment[]>;
  
  // Actions
  selectCard: (cardId: CardId | null) => void;
  assignToLane: (laneId: LaneId) => void;
  removeFromLane: (laneId: LaneId) => void;
  confirmAssignments: () => void;
  syncFromEngine: (state: GameState) => void;
}
```

### 2.2 UI Store
```typescript
interface UIStore {
  language: 'ar' | 'en';
  isRTL: boolean;
  audioEnabled: boolean;
  musicEnabled: boolean;
  
  // Actions
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleAudio: () => void;
  toggleMusic: () => void;
}
```

### 2.3 Data Flow
```
Game Engine ──(events)──> GameScreen ──(sync)──> Zustand GameStore ──(react)──> UI Components
                                    ──(call)──> Engine Functions
```

## 3. Integration with Art/Audio/Motion Branch

### 3.1 Asset Consumption
```typescript
// Import assets from the art-audio-motion branch
// The art-audio-motion branch will export:
import {
  // SVG components for lanes, cards, icons
  LaneBackground,
  CardBack,
  CardIconUnit,
  CardIconTactic,
  ObjectiveIcon,
  
  // Animation definitions (reanimated)
  cardHandToLaneAnimation,
  cardFlipAnimation,
  vpFloatAnimation,
  goldBorderPulse,
  
  // Sound hooks
  useSoundEffect,
  useGameMusic,
  
  // Placeholder management
  isPlaceholder,
  placeholderLabel,
} from '../../art-audio-motion/src';
```

### 3.2 Animation Integration
```typescript
// Example: Card hand-to-lane animation
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: cardPosition.x.value },
    { translateY: cardPosition.y.value },
    { scale: cardPosition.scale.value },
  ],
  opacity: cardPosition.opacity.value,
}));
```

### 3.3 Sound Integration
```typescript
// Example: Sound effect on confirm
const { playSound } = useSoundEffect();
const handleConfirm = () => {
  playSound('confirm');
  confirmAssignments();
};

// Background music managed by art-audio-motion branch
// UI toggles audio/music via UIStore
```

### 3.4 Asset Status
- During initial UI development, use **clearly labeled SVG placeholders** (simple colored shapes with text labels).
- Placeholder files stored in: `assets/images/placeholders/` with comment: `<!-- PLACEHOLDER: replace with final asset -->`.
- When art-audio-motion branch delivers final assets, replace imports and remove placeholder comments.
- See `ASSET_PIPELINE.md` in art-audio-motion branch for full replacement procedure.

## 4. Integration with Localization Branch

### 4.1 Translation Hook
```typescript
// All player-facing text must use the translation hook
import { useTranslation } from '../../localization-i18n/src';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <Text>{t('game.confirm_button')}</Text>
    // NOT: <Text>Confirm</Text>
  );
}
```

### 4.2 RTL Configuration
```typescript
// Set RTL at app startup based on language preference
import { I18nManager } from 'react-native';
import { setLanguage } from '../../localization-i18n/src';

const handleSetLanguage = (lang: 'ar' | 'en') => {
  setLanguage(lang);
  I18nManager.allowRTL(lang === 'ar');
  I18nManager.forceRTL(lang === 'ar');
  // Note: May require app restart or re-render on some RN versions
};
```

### 4.3 Layout Mirroring
- All directional layouts must use `I18nManager.isRTL` to determine order.
- Lane order, hand order, score order, and icon directions must flip.
- No hardcoded `marginLeft`/`marginRight` — use `marginStart`/`marginEnd` when possible, or conditional styles:
```typescript
const containerStyle = {
  flexDirection: isRTL ? 'row-reverse' : 'row',
};
```

### 4.4 Text Fitting
- Arabic text is approximately 25% longer than equivalent English text.
- All text containers must have adequate width/padding for Arabic.
- Test every screen in both languages before marking complete.

## 5. Integration with Bot Branch

### 5.1 LobbyScreen Config
```typescript
// LobbyScreen selects bot difficulty and style
// Passes to game engine on match start
import { BotConfig, BotDifficulty, BotStyle } from '../../bot-ai/src';

interface PlayerSlotConfig {
  isHuman: boolean;
  botDifficulty?: BotDifficulty;
  botStyle?: BotStyle;
}
```

## 6. Integration with Multiplayer Branch

### 6.1 Local Mock Mode
- During initial development, GameScreen works with local mock multiplayer.
- All 4 players are simulated on-device; UI displays only the human player's control.
- Bot/AI players control themselves automatically.

### 6.2 Future Online Mode
```typescript
// When multiplayer branch delivers online adapter:
import { MultiplayerAdapter } from '../../multiplayer/src';

const adapter = new MultiplayerAdapter(/* connection config */);
adapter.on('stateUpdate', (gameState) => {
  gameStore.syncFromEngine(gameState);
});

// UI calls adapter instead of local engine for submit
adapter.submitAssignments(gameId, playerId, assignments);
```

## 7. Key Integration Rules

1. **UI never mutates game state directly** — always calls engine functions.
2. **UI never stores game logic** — game state is authoritative from engine.
3. **No hardcoded text** — always use translation hook.
4. **RTL handled from day one** — not added as an afterthought.
5. **Assets are placeholders first** — replaced when art branch delivers.
6. **Touch targets ≥ 44×44dp** — verified by checklist.
7. **All text containers fit Arabic** — ~25% longer than English.
8. **Safe areas respected** — notch, status bar, home indicator.
