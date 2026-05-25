# Localization System — Integration Notes

## 1. How Localization Connects to the UI System

### 1.1 Translation Hook
All UI components access translations via the `useTranslation()` hook from `react-i18next`:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <Text>{t('button.start')}</Text>;
}
```

Components can use a specific namespace:
```tsx
const { t } = useTranslation('cards');
// t('scout') -> uses cards.json key
```

Or access keys across namespaces with `t('namespace:key')`:
```tsx
t('cards:scout_desc')
t('achievements:first_blood')
t('game:round', { number: 5 })
```

### 1.2 RTL-Aware Component Wrapping
UI screens must use `RTLView` and `RTLText` instead of raw `View` and `Text` for any layout that needs RTL mirroring:

```tsx
// Before (non-RTL-aware):
<View style={styles.row}>
  <Text>{t('common:nav.back')}</Text>
</View>

// After (RTL-aware):
<RTLView style={styles.row}>
  <RTLText>{t('common:nav.back')}</RTLText>
</RTLView>
```

The `RTLView` component:
- Reads current language direction via `useRTL()` hook.
- Auto-applies mirrored `marginLeft`/`marginRight` and `paddingLeft`/`paddingRight`.
- Does NOT reverse `flexDirection` (lanes should reverse order via CSS `flexDirection: isRTL ? 'row-reverse' : 'row'`, not through the wrapper).

The `RTLText` component:
- Reads current language direction.
- Sets `textAlign: isRTL ? 'right' : 'left'`.
- Uses appropriate font family for the language.

### 1.3 Directional Icon Flipping
Icons with inherent direction (back arrows, forward chevrons, navigation arrows) must be flipped in RTL mode:

```tsx
import { useRTL } from '../localization/useRTL';

function BackIcon() {
  const { isRTL } = useRTL();
  return (
    <SvgIcon
      name="arrow-back"
      style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
    />
  );
}
```

This applies to: back button, next/previous buttons, navigation chevrons, lane order indicators, card flip animations.

## 2. RTL Configuration at App Root

### 2.1 App Startup (App.tsx or _layout.tsx)
```tsx
import { I18nManager, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { initLanguage } from './src/localization';

function App() {
  useEffect(() => {
    // Enable RTL support permanently
    I18nManager.allowRTL(true);

    // Initialize language from storage or device
    initLanguage();
  }, []);

  return <RootNavigator />;
}
```

### 2.2 Root View Direction
The root-level `View` or `GestureHandlerRootView` should NOT set `direction: 'rtl'` directly. Instead:
- `I18nManager.allowRTL(true)` enables native RTL support.
- Per-component RTL is handled by `RTLView`/`RTLText` wrappers.
- This hybrid approach avoids the app-restart requirement while still getting native RTL hints.

### 2.3 React Navigation Integration
If using React Navigation:
- Navigation gestures (swipe back) must respect RTL direction.
- React Navigation automatically handles RTL for header back buttons if `I18nManager.isRTL` is true.
- Custom animation transitions (slide from right/left) must be direction-aware.

```tsx
import { useRTL } from '../localization/useRTL';

function useRTLTransition() {
  const { isRTL } = useRTL();
  return isRTL
    ? CardStyleInterpolators.forHorizontalIOS // already RTL-aware
    : CardStyleInterpolators.forHorizontalIOS;
}
```

## 3. Language Switch Mechanism

### 3.1 User Interface
The language switch is presented in the **Settings Screen** (not at game start to avoid accidental switching mid-game).

```tsx
function LanguageSelector() {
  const { t, i18n } = useTranslation('settings');
  const currentLang = i18n.language;

  const handleSwitch = (lang: 'ar' | 'en') => {
    changeLanguage(lang);
    // No app restart needed — RTL wrappers reactively update
  };

  return (
    <View>
      <Text>{t('language')}</Text>
      <Button
        title={t('language_arabic')}
        onPress={() => handleSwitch('ar')}
        disabled={currentLang === 'ar'}
      />
      <Button
        title={t('language_english')}
        onPress={() => handleSwitch('en')}
        disabled={currentLang === 'en'}
      />
    </View>
  );
}
```

### 3.2 Language Switch Flow
1. User taps language option.
2. `changeLanguage(lang)` is called.
3. `AsyncStorage` is updated with the new preference.
4. `i18next.changeLanguage(lang)` triggers language change.
5. All `useTranslation()` hooks re-render with new translations.
6. `useRTL()` hook re-evaluates `isRTL` based on new language.
7. `RTLText` and `RTLView` components re-apply correct direction styles.
8. Directional icons re-evaluate their `scaleX` transforms.

### 3.3 Mid-Game Switching
Language switch should be **disabled during an active match** to prevent confusion:
- When in planning or resolution phase, hide or disable language options.
- Language takes effect on the next match (or immediately if in menus).

## 4. Interface Contract (for UI Branch)

The UI branch expects the following exports from `src/localization/`:

| Export | Type | Description |
|---|---|---|
| `default (i18n)` | `i18n` instance | For direct use if needed (prefer hook) |
| `initLanguage()` | `() => Promise<string>` | Initialize language preference |
| `changeLanguage(lang)` | `(lang: 'ar' \| 'en') => Promise<void>` | Switch language at runtime |
| `useRTL()` | `() => { isRTL: boolean, direction: 'rtl' \| 'ltr' }` | Hook for direction detection |
| `RTLText` | Component | RTL-aware Text component |
| `RTLView` | Component | RTL-aware View component |

The UI branch must:
1. Call `initLanguage()` at app startup.
2. Wrap all player-facing text in `useTranslation()` calls.
3. Use `RTLText` and `RTLView` for layout components that need RTL mirroring.
4. Apply `transform: scaleX(-1)` to directional icons in RTL mode.
5. Disable language switching during active matches.
