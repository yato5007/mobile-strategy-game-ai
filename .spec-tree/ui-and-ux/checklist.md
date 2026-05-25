# UI and User Experience — Checklist

> 20+ verification items covering all screens, components, states, and integration points.

## Screens

- [ ] **CHK-01** HomeScreen renders with game title, Play button, Settings gear, Language toggle
- [ ] **CHK-02** LobbyScreen renders mode selection (FFA/2v2), player slots, bot difficulty/style config
- [ ] **CHK-03** LobbyScreen prevents start with fewer than 2 total players
- [ ] **CHK-04** GameScreen layout matches spec: ScoreBar (5%) + BoardArea (60%) + HandArea (25%) + ActionBar (10%)
- [ ] **CHK-05** ResultsScreen shows final standings, winner announcement, Play Again / Main Menu buttons

## GameScreen Components

- [ ] **CHK-06** Lane component renders correctly in all states: inactive, active-planning, active-reveal, active-resolution, won, lost, tied
- [ ] **CHK-07** Lane displays objective icon and VP value in header
- [ ] **CHK-08** Card component renders correctly in all states: default, selected, placed, revealing, resolved
- [ ] **CHK-09** Card shows icon, name, strength value, tactic type indicator
- [ ] **CHK-10** HandArea renders player's cards as horizontal scrollable row
- [ ] **CHK-11** HandArea handles max 5–7 visible cards with scroll for overflow
- [ ] **CHK-12** ScoreBar displays all 4 player scores and current round indicator
- [ ] **CHK-13** ScoreBar displays team scores in 2v2 mode (combined + individual)
- [ ] **CHK-14** ActionBar shows Confirm button, Cancel button, Timer indicator, Settings gear
- [ ] **CHK-15** PhaseOverlay renders during reveal, resolution, and cleanup phases

## Card Interaction Flow

- [ ] **CHK-16** Tap card in HandArea → card lifts with gold border (selected state)
- [ ] **CHK-17** Tap lane slot → card animates from hand to lane position
- [ ] **CHK-18** Tap placed card → card returns to hand
- [ ] **CHK-19** Confirm button disabled when 0 cards assigned
- [ ] **CHK-20** Confirm button locks (green checkmark) after successful submission
- [ ] **CHK-21** Timer expiry auto-submits pending assignments or applies skip penalty

## Reveal & Resolution

- [ ] **CHK-22** Reveal phase shows cards flipping with stagger animation
- [ ] **CHK-23** Resolution phase highlights winning lane with gold border
- [ ] **CHK-24** VP float text animates on resolution (+2 VP rises and fades)
- [ ] **CHK-25** Tactic effects animate during resolution (sabotage, shield, ambush, etc.)
- [ ] **CHK-26** Cleanup phase fades cards from lanes, slides new cards into hand

## Zustand Store & Event Integration

- [ ] **CHK-27** Zustand gameStore holds game state, phase, selectedCardId, pendingAssignments, revealedAssignments
- [ ] **CHK-28** Zustand uiStore holds language, isRTL, audioEnabled, musicEnabled
- [ ] **CHK-29** GameScreen subscribes to game engine events and updates Zustand store
- [ ] **CHK-30** GameScreen calls `submitAssignments()` from game engine on Confirm press

## RTL & Localization

- [ ] **CHK-31** RTL layout is active when language is Arabic (I18nManager.allowRTL)
- [ ] **CHK-32** Lane order reverses in RTL mode (lane 1 rightmost)
- [ ] **CHK-33** HandArea order reverses in RTL mode (card 1 rightmost)
- [ ] **CHK-34** ScoreBar player order reverses in RTL mode
- [ ] **CHK-35** Back/forward navigation icons flip in RTL mode
- [ ] **CHK-36** No hardcoded player-facing text — all strings use `useTranslation()` hook
- [ ] **CHK-37** Arabic text fits within layout bounds (Arabic is ~25% longer than English)

## Responsive & Touch

- [ ] **CHK-38** All touch targets are ≥ 44×44dp
- [ ] **CHK-39** Layout renders correctly on 360×640 (small)
- [ ] **CHK-40** Layout renders correctly on 390×844 (medium / iPhone 14)
- [ ] **CHK-41** Layout renders correctly on 412×915 (large / Android)
- [ ] **CHK-42** BoardArea shows min 3 lanes; scrolls when more lanes exist
- [ ] **CHK-43** Safe area insets respected (notch, status bar, home indicator)
- [ ] **CHK-44** Font sizes scale appropriately across small/medium/large screens

## Timer

- [ ] **CHK-45** Timer countdown ring displays remaining planning seconds
- [ ] **CHK-46** Timer shows warning state (red + pulse) in last 10 seconds
- [ ] **CHK-47** Timer auto-submits on expiry

## 2v2 Team View

- [ ] **CHK-48** Teammate cards visible in same lane with different border color
- [ ] **CHK-49** Combined team strength shown in lane footer during 2v2
- [ ] **CHK-50** Team scores displayed prominently in ScoreBar during 2v2 mode

## Edge Cases

- [ ] **CHK-51** Empty hand state handled (no crash, message displayed)
- [ ] **CHK-52** All lanes filled → prevent placing more cards
- [ ] **CHK-53** Player disconnect (future): bot takeover overlay displayed
- [ ] **CHK-54** App background → timer behavior documented/implemented
- [ ] **CHK-55** Forfeit confirmation dialog shown when leaving active match
