# UI and User Experience — Analysis

## Risks

### R1: RTL Layout Complexity
- **Risk**: Arabic RTL may break on some React Native components.
- **Mitigation**: Use I18nManager.allowRTL(true) from the start. Test on both platforms.
- **Contingency**: Fallback to manual margin/padding mirroring if auto-RTL fails.

### R2: Animation Performance on Low-End Android
- **Risk**: Complex animations may drop frames on budget Android devices.
- **Mitigation**: Use react-native-reanimated with native driver. Keep animations simple.
- **Contingency**: Provide "Reduce Motion" accessibility option.

### R3: Card/Lane Layout on Small Screens
- **Risk**: 5 lanes + multiple cards may not fit on 360×640 screens.
- **Mitigation**: Scrollable lanes, compact card design, responsive spacing.
- **Contingency**: Reduce to 3 visible lanes + scroll indicator.

### R4: Zustand Store Complexity
- **Risk**: Game state + UI state in same store leads to confusion.
- **Mitigation**: Separate stores (gameStore, uiStore). Game store is thin wrapper around engine.

## Dependencies
- Core Game Logic Engine (must be complete first) ✅
- React Native Expo SDK
- react-native-reanimated (v3+)
- react-native-svg
- Zustand
- React Navigation (v6+)

## Key Decisions
- Zustand over Redux (simpler, TypeScript-native).
- react-native-reanimated over Animated API (better performance).
- SVG for all graphics (scalable, no resolution issues).
- No WebView or complex rendering libraries.
