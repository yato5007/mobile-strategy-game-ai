# Localization System — Constitution

## Purpose
Implement full Arabic and English support from the start, including RTL/LTR layout switching, translation infrastructure, and no hardcoded player-facing text.

## Scope
- Localization framework (i18n library setup).
- Arabic translation files (all game text).
- English translation files (all game text).
- Language switching (Arabic ↔ English).
- RTL layout engine (flip layouts for Arabic).
- LTR layout engine (standard for English).
- Text direction detection and component wrapping.
- Number formatting (Arabic-Indic digits option).
- Date/time formatting (Arabic calendar awareness).
- Asset variant loading per locale (if needed).
- Integration with DESIGN_SYSTEM.md RTL/LTR rules.
- Integration with UI components.

## Out of Scope
- Game logic text (all game text uses localization keys, handled here).
- Actual translation quality (can be improved iteratively).
- More than 2 languages (Arabic + English only for MVP).

## Dependencies
- UI branch (components consume localizations).
- DESIGN_SYSTEM.md (RTL/LTR rules).
- react-native or expo-localization for device language detection.
- i18next or similar library.

## Key Constraints
1. No hardcoded player-facing text in any UI component.
2. Arabic support from day one, not added at the end.
3. RTL layout must work correctly (mirrored navigation, flipped directional icons).
4. English LTR must work correctly (standard layout).
5. Arabic text is typically 25% longer — UI must handle this.
6. Switchable at runtime (or at minimum before match start).
