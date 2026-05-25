/**
 * i18next configuration for the strategy game.
 * Supports Arabic (ar) and English (en).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform, NativeModules } from 'react-native';
import en from './en';
import ar from './ar';

const getDeviceLanguage = (): string => {
  let locale = 'en';
  try {
    if (Platform.OS === 'ios') {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
        'en';
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier ?? 'en';
    }
  } catch {
    locale = 'en';
  }
  return locale.startsWith('ar') ? 'ar' : 'en';
};

const initialLanguage: string = getDeviceLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en,
    ar,
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

// Set RTL based on initial language
const isRTL = initialLanguage === 'ar';
I18nManager.allowRTL(true);
I18nManager.forceRTL(isRTL);

export default i18n;

/**
 * Get the current language.
 */
export const getCurrentLanguage = (): 'ar' | 'en' => {
  return i18n.language?.startsWith('ar') ? 'ar' : 'en';
};

/**
 * Switch language and update RTL settings.
 */
export const setAppLanguage = (lang: 'ar' | 'en'): void => {
  i18n.changeLanguage(lang);
  const shouldBeRTL = lang === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(shouldBeRTL);
    // Note: On some RN versions, this requires app restart.
    // For now, we handle it gracefully.
  }
};
