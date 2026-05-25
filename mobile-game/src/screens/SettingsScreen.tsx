/**
 * SettingsScreen — Game settings.
 *
 * Features:
 * - Language toggle
 * - Audio toggle
 * - Music toggle
 * - About section
 */
import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText, HeadingText } from '../components/RTLText';
import { RTLPressable } from '../components/RTLPressable';
import { RTLView } from '../components/RTLView';
import { useUIStore } from '../state/uiStore';

// ─── Types ──────────────────────────────────────────────────────

interface SettingsScreenProps {
  navigation: any;
}

// ─── Component ──────────────────────────────────────────────────

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    language,
    audioEnabled,
    musicEnabled,
    setLanguage,
    toggleAudio,
    toggleMusic,
  } = useUIStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <RTLPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <RTLText style={styles.backIcon}>{'←'}</RTLText>
        </RTLPressable>
        <HeadingText style={styles.headerTitle}>{t('settings.title')}</HeadingText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Language */}
        <View style={styles.settingRow}>
          <RTLText style={styles.settingLabel}>{t('settings.language')}</RTLText>
          <RTLPressable
            onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            style={styles.toggleButton}
          >
            <RTLText bold gold style={styles.toggleText}>
              {language === 'en' ? 'English' : 'العربية'}
            </RTLText>
          </RTLPressable>
        </View>

        {/* Audio */}
        <View style={styles.settingRow}>
          <RTLText style={styles.settingLabel}>{t('settings.audio')}</RTLText>
          <RTLPressable
            onPress={toggleAudio}
            style={[
              styles.toggleButton,
              !audioEnabled && styles.toggleDisabled,
            ]}
          >
            <RTLText
              bold
              gold={audioEnabled}
              style={!audioEnabled ? styles.toggleDisabledText : undefined}
            >
              {audioEnabled ? 'ON' : 'OFF'}
            </RTLText>
          </RTLPressable>
        </View>

        {/* Music */}
        <View style={styles.settingRow}>
          <RTLText style={styles.settingLabel}>{t('settings.music')}</RTLText>
          <RTLPressable
            onPress={toggleMusic}
            style={[
              styles.toggleButton,
              !musicEnabled && styles.toggleDisabled,
            ]}
          >
            <RTLText
              bold
              gold={musicEnabled}
              style={!musicEnabled ? styles.toggleDisabledText : undefined}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </RTLText>
          </RTLPressable>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <RTLText bold style={styles.aboutTitle}>
            {t('settings.about')}
          </RTLText>
          <RTLText small style={styles.aboutText}>
            Shatranj Strategy v1.0.0
          </RTLText>
          <RTLText small style={styles.aboutText}>
            A mobile multiplayer strategy game
          </RTLText>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenEdge,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.neutralText,
  },
  headerTitle: {
    fontSize: 20,
    marginVertical: 0,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: Spacing.screenEdge,
    paddingTop: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingLabel: {
    color: Colors.neutralText,
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  toggleDisabled: {
    borderColor: Colors.inactiveDim,
    backgroundColor: 'transparent',
  },
  toggleText: {
    color: Colors.accentGold,
  },
  toggleDisabledText: {
    color: Colors.neutralText,
    opacity: 0.5,
  },
  aboutSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  aboutTitle: {
    color: Colors.neutralText,
    fontSize: 14,
    marginBottom: 8,
  },
  aboutText: {
    color: Colors.neutralText,
    opacity: 0.5,
    marginBottom: 4,
  },
});

export default SettingsScreen;
