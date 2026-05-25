/**
 * HomeScreen — Entry point of the game.
 *
 * Displays:
 * - Game title with Arabic-first styling
 * - Play button
 * - Language toggle (AR/EN)
 * - Settings gear
 */
import React from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText, HeadingText } from '../components/RTLText';
import { RTLPressable } from '../components/RTLPressable';
import { useUIStore } from '../state/uiStore';

// ─── Types ──────────────────────────────────────────────────────

interface HomeScreenProps {
  navigation: any;
}

// ─── Component ──────────────────────────────────────────────────

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowDimensions();
  const { language, setLanguage } = useUIStore();

  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondaryBackground} />

      {/* Background decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          {/* Ornamental top border */}
          <View style={styles.ornamentTop}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>

          <HeadingText style={styles.title}>
            {t('app.title')}
          </HeadingText>

          <RTLText large style={styles.subtitle}>
            {t('app.subtitle')}
          </RTLText>

          {/* Ornamental bottom border */}
          <View style={styles.ornamentBottom}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>
        </View>

        {/* Play Button */}
        <View style={styles.buttonSection}>
          <RTLPressable
            onPress={() => navigation.navigate('Lobby')}
            style={styles.playButton}
          >
            <RTLText style={styles.playButtonText} gold bold>
              {t('home.play')}
            </RTLText>
          </RTLPressable>
        </View>

        {/* Language Toggle + Settings */}
        <View style={styles.bottomSection}>
          <RTLPressable onPress={toggleLanguage} style={styles.languageButton}>
            <RTLText small style={styles.languageText}>
              {t('home.language')}
            </RTLText>
          </RTLPressable>

          <RTLPressable
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
          >
            <RTLText style={styles.settingsIcon}>⚙</RTLText>
          </RTLPressable>
        </View>
      </View>

      {/* Version Footer */}
      <RTLText small style={styles.versionText}>
        v1.0.0
      </RTLText>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundDecoration: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.05)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 1,
    borderColor: 'rgba(196, 163, 90, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  ornamentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ornamentLine: {
    width: 60,
    height: 1,
    backgroundColor: Colors.accentGold,
    opacity: 0.5,
  },
  ornamentDiamond: {
    width: 8,
    height: 8,
    backgroundColor: Colors.accentGold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
    opacity: 0.7,
  },
  ornamentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    color: Colors.neutralText,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonSection: {
    marginBottom: 40,
  },
  playButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 22,
    letterSpacing: 2,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageText: {
    color: Colors.neutralText,
    opacity: 0.8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
    color: Colors.neutralText,
  },
  versionText: {
    position: 'absolute',
    bottom: 16,
    color: Colors.neutralText,
    opacity: 0.3,
  },
});

export default HomeScreen;
