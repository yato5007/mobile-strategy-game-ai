# Art, Audio, Motion, and Game Feel System — Specification

## 1. Visual Identity

### 1.1 Design Philosophy
Arabic-first strategy aesthetic. Geometric patterns, warm sand-and-jewel colors, calligraphic influences. The visual language communicates strategic depth without clutter.

### 1.2 Color System
See DESIGN_SYSTEM.md §2 for full palette. Key associations:
- **Gold (#FFD700)**: VP, achievements, winning, valuable lanes.
- **Night Blue (#1A2744)**: Backgrounds, secondary panels.
- **Deep Sand (#C4A35A)**: Primary background, neutral areas.
- **Desert Brown (#8B6914)**: Unit cards.
- **Mystic Purple (#6C3483)**: Tactic cards.
- **Phoenix Orange (#E67E22)**: Comeback cards, trailing player indicators.
- **Crimson (#DC143C)**: Penalties, danger, sabotage.
- **Success Green (#27AE60)**: Positive effects, reinforce.

### 1.3 Typography
- Arabic headers: Amiri (classical, calligraphic).
- English headers: Playfair Display (serif, elegant).
- UI text: Noto Naskh Arabic / Noto Sans (clean, readable).
- See DESIGN_SYSTEM.md §3 for full specification.

## 2. Card Design

### 2.1 Card Layout (top to bottom)
1. **Border**: Ornamental geometric border (gold for rare, brown for common).
2. **Icon**: 40×40dp icon representing the card type.
3. **Name**: Card name in Arabic/English (max 2 lines).
4. **Strength**: Number badge (for unit/objective cards).
5. **Tactic indicator**: Purple shimmer for tactic cards.
6. **Background color**: Based on card type (see color system).

### 2.2 Card States
- **In hand**: Full color, slight shadow.
- **Selected**: Lifted (+4dp translateY), gold border glow.
- **Placed in lane**: Reduced opacity for owner (face-down), hidden for others.
- **Revealing**: Flip animation (front→back rotation).
- **Resolved**: Winner gets gold glow, loser gets gray fade.
- **Discarded**: Shrink + fade out.

## 3. Board/Lane Design

### 3.1 Lane Visual
- Horizontal lane bar with rounded corners (8dp radius).
- Background: semi-transparent dark with geometric pattern overlay.
- Active: full opacity with colored border.
- Inactive: 40% opacity with lock icon.
- Winner highlight: gold border pulse.
- Tie indicator: split gold/silver indicators.

### 3.2 Lane Objective Icons
- Standard: circle with VP number.
- High-value: star icon.
- Capture the flag: flag icon.
- King of the hill: crown icon.
- Bounty: target icon.

## 4. Sound Design

### 4.1 Sound Categories
See ASSET_PIPELINE.md §3 for full list. Key sounds:
- **Card tap**: Short click (100ms).
- **Card place**: Soft thud (200ms).
- **Confirm**: Rising chime (300ms).
- **Reveal**: Whoosh + paper flip (400ms).
- **Lane win**: Short fanfare (500ms).
- **VP award**: Coin sound (300ms).
- **Sabotage**: Glass crack (300ms).
- **Shield**: Bell-like ping (400ms).
- **Ambush**: Strike + sting (400ms).
- **Comeback bonus**: Gold sparkle (500ms).
- **Achievement**: Triumphant burst (800ms).
- **Game over**: Long fanfare (1500ms).
- **Victory**: Arabic maqam-inspired melody (3s).
- **Defeat**: Lower tone variant (2s).

## 5. Motion System

### 5.1 Animation Library
- `react-native-reanimated` for 60fps animations.
- All animations use native driver where possible.

### 5.2 Key Animations
See ASSET_PIPELINE.md §4 for full list with timings.

### 5.3 RTL-Aware Animations
- Slide-in from left (RTL: slide-in from right).
- Slide-out to right (RTL: slide-out to left).
- Lane resolution order: right-to-left in Arabic mode.

## 6. Game Feel Principles

### 6.1 Strategic Weight
- Higher-value lanes have heavier/slower animations.
- Final round actions have amplified effects.
- Comeback moments have brighter, rising animations.
- Penalties have sharp, descending animations.

### 6.2 Feedback Loops
- Every action produces visual + audio feedback.
- Waiting is never static (board animates subtly).
- Opponent actions are visible (cards flipping).
- Round transitions are clear and satisfying.

### 6.3 Accessibility
- All sound effects have visual alternates.
- Color blindness: use icons + text + color together.
- Reduce motion option (accessibility setting).
- High contrast mode for important elements.