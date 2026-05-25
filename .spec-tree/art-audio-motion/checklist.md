# Art, Audio, Motion, and Game Feel System — Checklist

> Mark items as ✅ when complete.

---

## Phase 1: Color and Typography Constants

- [ ] 1. `colors.ts` created with all DESIGN_SYSTEM.md colors as named exports
- [ ] 2. `typography.ts` created with font family constants, weight enums, size scale
- [ ] 3. `spacing.ts` created with 4dp base grid and common spacing values
- [ ] 4. All constants verified to work with `StyleSheet.create()` and inline SVG styles
- [ ] 5. Color associations documented in comments (e.g., `// VP, achievements, gold accents`)

## Phase 2: Card Visual Components

- [ ] 6. `CardBase.tsx` created with border, background, name slot, strength slot
- [ ] 7. `CardIcon.tsx` created with icon lookup per card type
- [ ] 8. SVG components or assets created for all 14+ card types (Scout, Soldier, Knight, Champion, Bluff, Sabotage, Reinforce, Spy, Shield, Retreat, Ambush, Determination, Last Stand, Surprise Rally, Fortuna)
- [ ] 9. All 6 card states implemented: in-hand, selected, placed, revealing, resolved, discarded
- [ ] 10. RTL-aware layout working on cards (text alignment, icon order)
- [ ] 11. `CardDeck.tsx` created with animated horizontal hand display

## Phase 3: Board and Lane Visual Components

- [ ] 12. `Lane.tsx` created with background, border, objective icon, strength display
- [ ] 13. `Board.tsx` created with full board layout hosting all lanes
- [ ] 14. `ObjectiveIcon.tsx` created with 5 objective icons (circle, star, flag, crown, target)
- [ ] 15. All lane states implemented: active, inactive, locked, winner-highlighted, tie-indicator
- [ ] 16. RTL-aware lane ordering working (right-to-left for Arabic)
- [ ] 17. `ScoreBoard.tsx` created with VP display and animated transitions

## Phase 4: Sound Hook System

- [ ] 18. Placeholder audio files created for all sound types in `assets/audio/placeholders/`
- [ ] 19. `useSound.ts` created wrapping `expo-av` for load/playback/volume
- [ ] 20. `useGameSounds.ts` created subscribing to all 15 GameEvent types
- [ ] 21. Sound-to-event mapping complete (every GameEvent → correct sound file)
- [ ] 22. Volume control implemented (SFX and music separate) with mute toggle
- [ ] 23. Visual fallback for sounds implemented (accessibility)

## Phase 5: Animation Components

- [ ] 24. `useAnimation.ts` created with timing presets for `react-native-reanimated`
- [ ] 25. `CardFlipAnimation` created (500ms)
- [ ] 26. `LanePulseAnimation` created (600ms)
- [ ] 27. `VPFloatAnimation` created (800ms)
- [ ] 28. `AchievementBurstAnimation` created (1200ms)
- [ ] 29. `PlayerPenaltyAnimation` created (300ms)
- [ ] 30. `SabotageAnimation` created (400ms)
- [ ] 31. `ShieldAnimation` created (400ms)
- [ ] 32. `AmbushAnimation` created (500ms)
- [ ] 33. `ComebackSparkleAnimation` created (600ms)
- [ ] 34. `RoundTransitionAnimation` created (1000ms)
- [ ] 35. `GameOverAnimation` created (1500ms)
- [ ] 36. `CardSlideAnimation` created (300ms)
- [ ] 37. RTL-aware direction implemented for all directional animations
- [ ] 38. `ReduceMotionContext` created and wired into accessibility settings

## Phase 6: Game Feel Polish

- [ ] 39. `useGameSounds` wired into main game screen
- [ ] 40. All 12 animation components wired into main game screen (event-driven)
- [ ] 41. Waiting-is-engaging: subtle board animations during opponent planning phase
- [ ] 42. Strategic weight: heavier animations for high-value lanes and final rounds
- [ ] 43. Comeback feeling: brighter effects for trailing players
- [ ] 44. Penalty feedback: clear red/crimson indicators
- [ ] 45. End-to-end feedback loop verified (every event produces visual + audio feedback)
- [ ] 46. Performance profiling: 60fps maintained on mid-range device
- [ ] 47. RTL testing: all animations reverse correctly in Arabic mode
- [ ] 48. Accessibility testing: reduce-motion disables non-essential animations
- [ ] 49. Accessibility testing: visual sound alternatives visible when sounds play
- [ ] 50. All placeholder assets labeled and replaceable
- [ ] 51. All assets have documented license or are self-created

---

## Summary

| Phase | Items | Complete |
|---|---|---|
| 1: Color/Typography | 5 | —/5 |
| 2: Card Components | 6 | —/6 |
| 3: Board/Lane Components | 6 | —/6 |
| 4: Sound Hook System | 6 | —/6 |
| 5: Animation Components | 15 | —/15 |
| 6: Game Feel Polish | 13 | —/13 |
| **Total** | **51** | **—/51** |
