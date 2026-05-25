/**
 * UI Store — Zustand store for UI preferences and state.
 *
 * This store manages UI-specific state that is NOT part of the game engine:
 * - Language preference
 * - RTL mode
 * - Audio/music settings
 * - Screen dimensions
 */
import { create } from 'zustand';
import { I18nManager, Dimensions } from 'react-native';
import { getCurrentLanguage, setAppLanguage } from '../localization/i18n';

export interface UIState {
  /** Current language */
  language: 'ar' | 'en';
  /** Whether RTL layout is active */
  isRTL: boolean;
  /** Whether sound effects are enabled */
  audioEnabled: boolean;
  /** Whether background music is enabled */
  musicEnabled: boolean;
  /** Screen width in dp */
  screenWidth: number;
  /** Screen height in dp */
  screenHeight: number;

  // Actions
  /** Set language and update RTL */
  setLanguage: (lang: 'ar' | 'en') => void;
  /** Toggle audio on/off */
  toggleAudio: () => void;
  /** Toggle music on/off */
  toggleMusic: () => void;
  /** Update screen dimensions */
  updateDimensions: (width: number, height: number) => void;
}

export const useUIStore = create<UIState>((set, get) => {
  const initialLanguage = getCurrentLanguage();
  const { width, height } = Dimensions.get('window');

  return {
    language: initialLanguage,
    isRTL: initialLanguage === 'ar',
    audioEnabled: true,
    musicEnabled: true,
    screenWidth: width,
    screenHeight: height,

    setLanguage: (lang: 'ar' | 'en') => {
      setAppLanguage(lang);
      set({
        language: lang,
        isRTL: lang === 'ar',
      });
    },

    toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
    toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

    updateDimensions: (width: number, height: number) => {
      set({ screenWidth: width, screenHeight: height });
    },
  };
});
