# Localization System — Clarification

## 1. i18next Setup Details

### Library Selection
- **Primary:** `i18next` (core) + `react-i18next` (React Native bindings).
- **Language detection:** `expo-localization` for device locale on first launch.
- **Persistence:** `@react-native-async-storage/async-storage` to store user preference.
- **No** `i18next-browser-languagedetector` — not compatible with React Native. We write a custom detection module using `expo-localization` and AsyncStorage.

### i18n Instance Configuration
```typescript
// src/localization/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import arCommon from './locales/ar/common.json';
import arGame from './locales/ar/game.json';
import arCards from './locales/ar/cards.json';
import arAchievements from './locales/ar/achievements.json';
import arSettings from './locales/ar/settings.json';
import arErrors from './locales/ar/errors.json';
import enCommon from './locales/en/common.json';
import enGame from './locales/en/game.json';
import enCards from './locales/en/cards.json';
import enAchievements from './locales/en/achievements.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';

const LANGUAGE_KEY = '@game_language';

const resources = {
  ar: {
    common: arCommon,
    game: arGame,
    cards: arCards,
    achievements: arAchievements,
    settings: arSettings,
    errors: arErrors,
  },
  en: {
    common: enCommon,
    game: enGame,
    cards: enCards,
    achievements: enAchievements,
    settings: enSettings,
    errors: enErrors,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  defaultNS: 'common',
});

export const changeLanguage = async (lang: 'ar' | 'en') => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export const initLanguage = async () => {
  const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (stored === 'ar' || stored === 'en') {
    i18n.changeLanguage(stored);
    return stored;
  }
  const deviceLang = Localization.getLocales()?.[0]?.languageCode;
  const detected = deviceLang === 'ar' ? 'ar' : 'en';
  i18n.changeLanguage(detected);
  await AsyncStorage.setItem(LANGUAGE_KEY, detected);
  return detected;
};

export default i18n;
```

### Namespace Organization
- `common` — Shared UI: buttons, labels, navigation, global terms.
- `game` — Game-specific: round labels, lane names, VP text, phase names.
- `cards` — Card names and descriptions (each card is a sub-key).
- `achievements` — Achievement names, descriptions, notification text.
- `settings` — Settings screen labels and options.
- `errors` — Error messages, validation feedback, fallback text.

## 2. Translation File Structure (JSON per Language)

```
src/localization/
├── index.ts                    # i18n setup, initLanguage(), changeLanguage()
├── useRTL.ts                   # Hook: returns { isRTL, direction }
├── RTLText.tsx                 # <RTLText> component (auto-direction)
├── RTLView.tsx                 # <RTLView> component (auto-mirror)
├── locales/
│   ├── ar/
│   │   ├── common.json
│   │   ├── game.json
│   │   ├── cards.json
│   │   ├── achievements.json
│   │   ├── settings.json
│   │   └── errors.json
│   └── en/
│       ├── common.json
│       ├── game.json
│       ├── cards.json
│       ├── achievements.json
│       ├── settings.json
│       └── errors.json
```

### JSON Structure Example
```json
// locales/ar/common.json
{
  "button": {
    "start": "ابدأ",
    "confirm": "تأكيد",
    "cancel": "إلغاء",
    "submit": "إرسال",
    "back": "رجوع",
    "next": "التالي",
    "settings": "الإعدادات",
    "quit": "خروج"
  },
  "nav": {
    "home": "الرئيسية",
    "game": "اللعبة",
    "results": "النتائج"
  }
}
```

```json
// locales/en/cards.json
{
  "scout": "Scout",
  "scout_desc": "View the highest card in one opponent's hand.",
  "sabotage": "Sabotage",
  "sabotage_desc": "Reduce opponent strength in this lane by 2.",
  "reinforce": "Reinforce",
  "reinforce_desc": "Add +3 strength to your side of this lane.",
  "ambush": "Ambush",
  "ambush_desc": "Gain +5 strength in this lane. If opponent played a card here, they lose 1 VP.",
  "shield": "Shield",
  "shield_desc": "Protect this lane from opponent tactic effects this round.",
  "bluff": "Bluff",
  "bluff_desc": "Play face-down. If opponent reveals a tactic here, cancel it and gain +2 strength.",
  "comeback": "Comeback",
  "comeback_desc": "Only available if trailing. Gain +4 strength and +1 VP if you win this lane.",
  "spy": "Spy",
  "spy_desc": "View all opponent assignments to one lane. Gain +1 strength there."
}
```

## 3. RTL Configuration via I18nManager

### App Root Setup
```typescript
// App.tsx (or root layout component)
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRTL = i18n.language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL);
      // Note: RN requires app restart for I18nManager changes to take full effect.
      // We handle this by wrapping all layout components with RTL-aware styles
      // rather than relying solely on I18nManager.
    }
  }, [i18n.language]);

  // ... rest of app
}
```

### Important Caveat
`I18nManager.forceRTL()` in React Native requires an app restart to fully relayout native views. To work around this without forcing a restart:
- Use `I18nManager.allowRTL(true)` once at app initialization.
- For runtime switching, rely on **RTL-aware wrapper components** (custom `RTLText`, `RTLView`) that read the current language and apply mirrored styles.
- This approach avoids the restart requirement and provides a seamless language switch.

## 4. Translation Key Usage Convention

All UI components use `useTranslation()` from `react-i18next`:

```tsx
import { useTranslation } from 'react-i18next';

function StartButton() {
  const { t } = useTranslation('common');
  return <Button title={t('button.start')} />;
}
```

```tsx
function RoundDisplay({ number }: { number: number }) {
  const { t } = useTranslation('game');
  return <Text>{t('round', { number })}</Text>;
}
```

### Key Patterns
| Pattern | Example | Result (ar) | Result (en) |
|---|---|---|---|
| Simple key | `t('button.start')` | ابدأ | Start |
| With interpolation | `t('round', { number: 5 })` | الجولة ٥ | Round 5 |
| Nested key | `t('card.scout_desc')` | اعرض أعلى بطاقة في يد خصم واحد | View the highest card in one opponent's hand |
| Plural (if needed) | `t('vp', { count: 3 })` | ٣ نقاط فوز | 3 VP |
| Context (if needed) | `t('lane', { context: laneId })` | المسار الأوسط | Middle Lane |

### No Hardcoded Strings Rule
- **Zero tolerance** for hardcoded player-facing text in any UI component.
- Every string must go through `t('key')`.
- Exception: Developer-facing debug output (console.log, error stack traces) — these are not player-facing.
- Enforcement: Code review must reject any PR that contains a hardcoded player-facing string.

## 5. Language Detection Flow

1. **App launch:** `initLanguage()` is called.
2. **Check AsyncStorage** for previously saved preference (`@game_language`).
3. **If found:** Use stored preference.
4. **If not found:** Query device locale via `expo-localization`.
   - If device language starts with `"ar"` → Arabic.
   - Otherwise → English (default).
5. **Save** detected language to AsyncStorage.
6. **Initialize i18next** with the resolved language.
7. **Set RTL** via `I18nManager.allowRTL()` + `I18nManager.forceRTL()`.

### Language Switch (Runtime)
- User selects language in Settings screen.
- `changeLanguage('ar' | 'en')` is called.
- AsyncStorage is updated.
- i18next changes language → all `useTranslation()` hooks re-render.
- RTL-aware components re-evaluate their styles based on the new direction.

## 6. Edge Cases and Clarifications

### Arabic Text Length
- Arabic text is typically ~25% longer than English for the same meaning.
- UI components must allocate sufficient horizontal space.
- Dynamic text sizing: Use `adjustsFontSizeToFit` or `numberOfLines` with `ellipsizeMode` for constrained spaces.
- Card names: max 2 lines. Descriptions: max 4 lines.

### Arabic-Indic Digits
- Game uses Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) in Arabic mode for VP, round numbers, timers.
- English mode uses standard Arabic numerals (0123456789).
- Implementation: Use a formatter utility that converts based on current language, or rely on i18next number formatting with custom locale configurations.

### Missing Translation Handling
- i18next default behavior: Returns the key itself (e.g., `"button.start"`) if no translation found.
- This is acceptable during development as it makes missing keys visible.
- For production: Use i18next's `saveMissing` feature during development to log untranslated keys, then fill them before release.

### Directional Icons
- Icons with inherent direction (back arrow, forward arrow, chevrons) must flip in RTL mode.
- Implementation: Apply `transform: [{ scaleX: isRTL ? -1 : 1 }]` to icon components.
- SVG paths should be mirrored when direction changes.
