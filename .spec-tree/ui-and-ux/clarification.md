# UI and User Experience — Clarification

## 1. Screen Flow

### 1.1 HomeScreen
- **Purpose**: Entry point — game title, Play button, Settings gear, Language toggle (AR/EN).
- **Flow**: On launch, check for saved RTL/language preference and apply immediately.
- **States**: Normal (default), transitioning to LobbyScreen on "Play" press.
- **Edge case** — First launch: Show brief tooltip hinting at language toggle.

### 1.2 LobbyScreen → GameScreen Transition
- **Purpose**: Configure match parameters.
- **Inputs**: Game mode (FFA / 2v2), player slots (human + bots), bot difficulty and style for each bot slot.
- **Transition**: On "Start Match" → navigate to GameScreen with match config payload.
- **Edge case** — Invalid config: Must prevent start if fewer than 2 players total (including bots).
- **Edge case** — Back: Return to HomeScreen (lose lobby config).

### 1.3 GameScreen (Main Loop)
- **Purpose**: All gameplay — planning, reveal, resolution, cleanup phases.
- **Flow**: GameScreen mounts → creates game engine instance → subscribes to events → runs round loop.
- **Navigation**: No exit during active match without confirmation dialog ("Forfeit match?").
- **Edge case** — App backgrounding: Pause timer, show reconnect overlay if online MP (future).

### 1.4 ResultsScreen
- **Purpose**: Show final standings, winner announcement, statistics.
- **Flow**: Game ends → navigate to ResultsScreen with final state payload.
- **Actions**: "Play Again" → back to LobbyScreen with same config. "Main Menu" → back to HomeScreen.
- **Edge case** — 2v2 result: Show team combined VP prominently, then individual contributions.

## 2. Lane Layout

### 2.1 Physical Layout
- Lanes are **horizontal** slots arranged in a row across the top 60% of the screen.
- Minimum 3 lanes visible at all times. Maximum 5 lanes.
- When 3 lanes: each takes ~30% width. When 4–5 lanes: horizontal scroll with snap.
- Each lane is a vertical column containing:
  - **Header**: Lane number, objective icon, VP value.
  - **Slots**: 1 per player (up to 4), stacked vertically.
  - **Footer**: Total strength after reveal, winner badge.

### 2.2 Lane States
- **inactive**: Dimmed, lock icon overlay, no interaction allowed.
- **active-planning**: Full opacity, tap to place selected card.
- **active-reveal**: Cards flip with stagger animation.
- **active-resolution**: Winner highlighted with gold border, VP floats up.
- **won**: Gold border persists, checkmark.
- **lost**: Slight dim, no border.
- **tied**: Split VP indicator (e.g., "VP 2+2").

### 2.3 Scaling Behavior
- Small screens (360×640): 3 lanes visible, scroll to see extras.
- Medium screens (390×844): 4 lanes visible.
- Large screens (412×915+): 5 lanes visible.
- Lane minimum width: 60dp (ensures readability).

## 3. Card Interaction Flow

### 3.1 Planning Phase (Detailed Steps)

1. **Tap card in HandArea**:
   - Card lifts up (translateY -20dp + shadow elevation).
   - Gold border appears.
   - Scale: 1.05x.
   - Previous selection is cleared (if tapping a different card).

2. **Tap lane slot**:
   - Card animates from hand position to lane slot position (300ms, ease-out).
   - Lane slot shows card face-down to other players, face-up to owner.
   - Card is removed from hand visually.
   - In 2v2: teammate sees the card as placed (different border color).

3. **Tap placed card in lane**:
   - Card animates back to hand.
   - Slot becomes empty.

4. **Tap Confirm button**:
   - Button changes from pulsing gold to locked green checkmark.
   - All pending assignments locked.
   - Game engine `submitAssignments()` called.
   - Transitions to reveal phase.

### 3.2 Edge Cases

- **Empty hand**: Player cannot submit if no cards assigned. Button disabled. Show "Assign at least 1 card" hint.
- **Timer expires**: Auto-submit current pending assignments. If none, force-apply penalty (skip all lanes + -1 VP).
- **Disconnect during planning**: On reconnect, show current assignments if any; otherwise fresh planning state.
- **All lanes filled?**: Player must remove a card before placing another (max 1 card per player per lane in FFA; 2 per lane in 2v2 — one per teammate).

## 4. 2v2 Team View

### 4.1 Shared Planning
- Both teammates see each other's cards in hand during planning.
- Each teammate's placed cards in lanes have distinct border colors (e.g., blue for P1, cyan for P2).
- Combined team strength shown in lane footer.

### 4.2 Team Score Display
- ScoreBar shows team scores prominently (combined VP).
- Individual player scores shown smaller below team score.
- Color coding: Team A (gold/amber), Team B (teal/cyan).

### 4.3 Communication
- Quick ping/emote buttons (optional, future).
- No in-game chat (keeps scope minimal).

## 5. RTL Layout Effects

### 5.1 Global Changes
- `I18nManager.allowRTL(true)` set at app startup.
- All text alignment flips: right-aligned for Arabic.

### 5.2 Specific Layout Changes

| Element | LTR | RTL |
|---|---|---|
| Lane order | Lane 1 (left) → Lane 5 (right) | Lane 1 (right) → Lane 5 (left) |
| Hand order | Card 1 (left) → Card N (right) | Card 1 (right) → Card N (left) |
| ScoreBar order | P1 (left) → P4 (right) | P1 (right) → P4 (left) |
| Back button | Left → Right arrow | Right → Left arrow |
| Confirm button | Right side | Left side |
| Settings gear | Top-right | Top-left |

### 5.3 Animation Direction
- Slide-in animations:
  - LTR: lanes slide in from left.
  - RTL: lanes slide in from right.
- Card hand-to-lane animation path reverses in RTL.

## 6. Mobile Responsiveness

### 6.1 Breakpoints

| Size Class | Width Range | Reference Device |
|---|---|---|
| Small | 320–374dp | iPhone SE / older Android |
| Medium | 375–414dp | iPhone 14 / Pixel 6 |
| Large | 415–450dp | iPhone Pro Max / Samsung S24 Ultra |

### 6.2 Adaptive Rules

- **Font scaling**: Use `react-native-responsive-fontsize` or manual `Dimensions.get('window').width` ratio.
  - Small: 12dp body, 14dp card name, 18dp headers.
  - Medium: 14dp body, 16dp card name, 20dp headers.
  - Large: 16dp body, 18dp card name, 24dp headers.

- **Lane count by width**:
  - < 375dp: 3 visible lanes (scroll for more).
  - 375–414dp: 4 visible lanes.
  - > 414dp: 5 visible lanes.

- **Card size**:
  - Small: 48×64dp.
  - Medium: 56×76dp.
  - Large: 64×88dp.

- **Spacing**:
  - Lane gap: 6dp (small), 8dp (medium), 10dp (large).
  - Card margin: 3dp (small), 4dp (medium), 6dp (large).

### 6.3 Safe Areas
- Top safe area: ScoreBar height + notch/padding.
- Bottom safe area: ActionBar + home indicator padding.
- Use `react-native-safe-area-context` for consistent insets.

## 7. Phase Overlays

### 7.1 Reveal Overlay
- Semi-transparent dark overlay during reveal.
- Cards flip with 50ms stagger per lane.
- Duration: ~800ms total.

### 7.2 Resolution Overlay
- Lane highlights animate in sequence (gold border pulse, 300ms each).
- VP float text: "+2 VP" rises and fades (600ms).
- Tactic effects overlay on affected lanes.

### 7.3 Cleanup Overlay
- Cards fade from lanes (200ms).
- New cards slide into hand (300ms).
- Comeback bonus: gold sparkle on relevant player's hand (400ms).
- Achievement popup: full-width banner from top (if earned).

## 8. Timer Mechanics

- Round timer: 60 seconds for planning phase.
- Displayed as circular progress ring in ActionBar.
- Last 10 seconds: ring turns red, subtle pulse.
- Timer sync: managed by game engine, UI only displays.
- In mock MP: timer is real-time. In future online: synchronized via server.

## 9. Error & Edge Case Handling

| Situation | Behavior |
|---|---|
| App backgrounded during planning | Timer continues (mock) / pauses (future online). Reconnect shows current state. |
| Invalid assignment (0 cards) | Confirm button disabled. Tooltip: "Assign at least one card" |
| Timer expires | Auto-submit. If no assignments, apply penalty. |
| Engine error | Show generic overlay: "Something went wrong. Match state preserved." |
| Player disconnects (future) | Bot takes over. UI shows "Player X disconnected. Bot continuing." |
