# Localization System — Plan

## Phases

### Phase 1: Framework Setup
1. Install i18next + react-i18next.
2. Configure i18n instance with Arabic and English locales.
3. Create language detection (device locale + stored preference).
4. Create language switching mechanism.

### Phase 2: Translation Files
1. Create Arabic translation files (common, game, cards, achievements, settings, errors).
2. Create English translation files (same structure).
3. Verify all game text has translation keys.
4. Verify no hardcoded strings remain in UI spec.

### Phase 3: RTL/LTR Engine
1. Configure I18nManager for RTL.
2. Create RTL-aware layout components.
3. Test layout mirroring for all screens.
4. Test directional icon flipping.

### Phase 4: Integration
1. Connect localization to all UI components.
2. Add language switch to HomeScreen settings.
3. Test full game in both languages.
4. Test RTL gameplay (lane order, card order, navigation).
