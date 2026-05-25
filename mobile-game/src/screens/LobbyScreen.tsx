/**
 * LobbyScreen — Match configuration screen.
 *
 * Features:
 * - Game mode selection (FFA / 2v2)
 * - Player slot configuration (Human / Bot)
 * - Bot difficulty and style selection
 * - Start match button
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText, HeadingText } from '../components/RTLText';
import { RTLPressable } from '../components/RTLPressable';
import { RTLView } from '../components/RTLView';
import type { Difficulty, Style } from '../bot/botController';
import type { PlayerSlotConfig } from '../state/gameStore';

// ─── Types ──────────────────────────────────────────────────────

interface LobbyScreenProps {
  navigation: any;
}

type PlayerConfig = {
  isBot: boolean;
  difficulty: Difficulty;
  style: Style;
};

// ─── Component ──────────────────────────────────────────────────

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  // Game mode
  const [gameMode, setGameMode] = useState<'ffa' | '2v2'>('ffa');

  // Player slot configurations
  const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[]>([
    { isBot: false, difficulty: 'normal', style: 'balanced' },
    { isBot: true, difficulty: 'normal', style: 'balanced' },
    { isBot: true, difficulty: 'normal', style: 'balanced' },
    { isBot: true, difficulty: 'normal', style: 'balanced' },
  ]);

  const [error, setError] = useState<string | null>(null);

  // ─── Actions ──────────────────────────────────────────────────

  const togglePlayerType = useCallback((index: number) => {
    setPlayerConfigs((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isBot: !updated[index].isBot,
      };
      return updated;
    });
    setError(null);
  }, []);

  const setBotDifficulty = useCallback((index: number, difficulty: Difficulty) => {
    setPlayerConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], difficulty };
      return updated;
    });
  }, []);

  const setBotStyle = useCallback((index: number, style: Style) => {
    setPlayerConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], style };
      return updated;
    });
  }, []);

  const handleStart = useCallback(() => {
    // Validate: at least 2 players total
    const humanCount = playerConfigs.filter((p) => !p.isBot).length;
    if (humanCount < 1 && playerConfigs.filter((p) => p.isBot).length < 2) {
      setError(t('lobby.error.minPlayers'));
      return;
    }

    setError(null);

    // Navigate to GameScreen with config
    navigation.navigate('Game', {
      mode: gameMode,
      playerSlots: playerConfigs.map((p) => ({
        isBot: p.isBot,
        difficulty: p.difficulty,
        style: p.style,
      })),
    });
  }, [gameMode, playerConfigs, navigation, t]);

  const isRTL = false; // I18nManager.isRTL

  // ─── Render ───────────────────────────────────────────────────

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];
  const styles_list: Style[] = [
    'aggressive',
    'defensive',
    'balanced',
    'disruptive',
    'objective-focused',
    'comeback-focused',
    'team-support',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondaryBackground} />

      {/* Header */}
      <View style={styles.header}>
        <RTLPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <RTLText style={styles.backIcon}>{'←'}</RTLText>
        </RTLPressable>
        <HeadingText style={styles.headerTitle}>{t('lobby.title')}</HeadingText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Game Mode Selector */}
        <View style={styles.section}>
          <RTLText bold style={styles.sectionTitle}>
            {t('lobby.mode')}
          </RTLText>
          <RTLView style={styles.modeSelector}>
            <RTLPressable
              onPress={() => setGameMode('ffa')}
              style={[
                styles.modeButton,
                gameMode === 'ffa' && styles.modeButtonActive,
              ]}
            >
              <RTLText
                bold
                gold={gameMode === 'ffa'}
                style={gameMode === 'ffa' ? styles.modeTextActive : styles.modeText}
              >
                {t('lobby.mode.ffa')}
              </RTLText>
            </RTLPressable>
            <RTLPressable
              onPress={() => setGameMode('2v2')}
              style={[
                styles.modeButton,
                gameMode === '2v2' && styles.modeButtonActive,
              ]}
            >
              <RTLText
                bold
                gold={gameMode === '2v2'}
                style={gameMode === '2v2' ? styles.modeTextActive : styles.modeText}
              >
                {t('lobby.mode.2v2')}
              </RTLText>
            </RTLPressable>
          </RTLView>
        </View>

        {/* Player Slots */}
        {playerConfigs.map((config, index) => (
          <View key={index} style={styles.playerSection}>
            {/* Player Header */}
            <RTLView style={styles.playerHeader}>
              <RTLText bold style={styles.playerTitle}>
                {t('lobby.player', { n: index + 1 })}
              </RTLText>
              <RTLPressable
                onPress={() => togglePlayerType(index)}
                style={[
                  styles.typeToggle,
                  !config.isBot && styles.typeToggleHuman,
                ]}
              >
                <RTLText small bold style={styles.typeToggleText}>
                  {config.isBot ? t('lobby.player.bot') : t('lobby.player.human')}
                </RTLText>
              </RTLPressable>
            </RTLView>

            {/* Bot Configuration */}
            {config.isBot && (
              <>
                {/* Difficulty */}
                <View style={styles.configRow}>
                  <RTLText small style={styles.configLabel}>
                    {t('lobby.bot.difficulty')}
                  </RTLText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.optionsScroll}
                  >
                    {difficulties.map((d) => (
                      <RTLPressable
                        key={d}
                        onPress={() => setBotDifficulty(index, d)}
                        style={[
                          styles.optionChip,
                          config.difficulty === d && styles.optionChipActive,
                        ]}
                      >
                        <RTLText
                          small
                          gold={config.difficulty === d}
                          style={config.difficulty === d ? undefined : styles.optionChipText}
                        >
                          {t(`lobby.bot.difficulty.${d}`)}
                        </RTLText>
                      </RTLPressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Style */}
                <View style={styles.configRow}>
                  <RTLText small style={styles.configLabel}>
                    {t('lobby.bot.style')}
                  </RTLText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.optionsScroll}
                  >
                    {styles_list.map((s) => (
                      <RTLPressable
                        key={s}
                        onPress={() => setBotStyle(index, s)}
                        style={[
                          styles.optionChip,
                          config.style === s && styles.optionChipActive,
                        ]}
                      >
                        <RTLText
                          small
                          gold={config.style === s}
                          style={config.style === s ? undefined : styles.optionChipText}
                        >
                          {t(`lobby.bot.style.${s}`)}
                        </RTLText>
                      </RTLPressable>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        ))}

        {/* Error */}
        {error && (
          <RTLText small danger style={styles.errorText}>
            {error}
          </RTLText>
        )}

        {/* Mode Info */}
        <View style={styles.infoBox}>
          <RTLText small style={styles.infoText}>
            {gameMode === '2v2'
              ? 'Players 1+2 vs Players 3+4'
              : 'Every player for themselves'}
          </RTLText>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <RTLPressable onPress={handleStart} style={styles.startButton}>
          <RTLText gold bold style={styles.startButtonText}>
            {t('lobby.start')}
          </RTLText>
        </RTLPressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenEdge,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.neutralText,
    marginBottom: 8,
    fontSize: 16,
  },
  modeSelector: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  modeText: {
    color: Colors.neutralText,
    opacity: 0.6,
  },
  modeTextActive: {
    color: Colors.accentGold,
  },
  playerSection: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playerHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerTitle: {
    color: Colors.neutralText,
    fontSize: 16,
  },
  typeToggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.inactiveDim,
  },
  typeToggleHuman: {
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  typeToggleText: {
    color: Colors.neutralText,
  },
  configRow: {
    marginBottom: 8,
  },
  configLabel: {
    color: Colors.neutralText,
    opacity: 0.7,
    marginBottom: 4,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginRight: 6,
  },
  optionChipActive: {
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  optionChipText: {
    color: Colors.neutralText,
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    color: Colors.neutralText,
    opacity: 0.6,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.screenEdge,
    paddingBottom: 24,
    backgroundColor: Colors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  startButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default LobbyScreen;
