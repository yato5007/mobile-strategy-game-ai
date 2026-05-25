/**
 * ResultsScreen — Final standings after a match ends.
 *
 * Displays:
 * - Winner announcement
 * - Final standings with VP and lane wins
 * - Play Again / Main Menu buttons
 * - Team standings in 2v2 mode
 */
import React, { useMemo } from 'react';
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
import { getStandings, getGameResult } from '../game';
import type { GameState, GameResult, Standing } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

interface ResultsScreenProps {
  navigation: any;
  route: any;
}

// ─── Helpers ────────────────────────────────────────────────────

const getPlayerColor = (playerId: number): string => {
  const colors = [Colors.player0, Colors.player1, Colors.player2, Colors.player3];
  return colors[playerId] ?? Colors.player0;
};

// ─── Component ──────────────────────────────────────────────────

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const { gameState, gameResult, mode } = route.params ?? {};
  const is2v2 = mode === '2v2';

  // Compute standings
  const standings: Standing[] = useMemo(() => {
    if (!gameState) return [];
    return getStandings(gameState);
  }, [gameState]);

  // Compute winner
  const winner = useMemo(() => {
    if (!gameResult) return null;
    if (gameResult.winnerId !== null) {
      return {
        type: 'player' as const,
        id: gameResult.winnerId,
        label: is2v2
          ? t('results.winner.team', { n: (gameResult.winnerId < 2 ? 'A' : 'B') })
          : t('results.winner', { n: gameResult.winnerId + 1 }),
      };
    }
    return { type: 'draw' as const, label: t('results.draw') };
  }, [gameResult, is2v2, t]);

  const handlePlayAgain = () => {
    navigation.replace('Game', route.params);
  };

  const handleMainMenu = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondaryBackground} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Winner Announcement */}
        <View style={styles.winnerSection}>
          <View style={styles.trophyContainer}>
            <RTLText style={styles.trophy}>
              {winner?.type === 'draw' ? '🤝' : '🏆'}
            </RTLText>
          </View>
          <HeadingText style={styles.winnerTitle}>
            {winner?.label ?? t('results.draw')}
          </HeadingText>
        </View>

        {/* Ornamental Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        {/* Standings Title */}
        <RTLText gold bold style={styles.standingsTitle}>
          {is2v2 ? t('results.team') : t('results.ffa')}
        </RTLText>

        {/* Standings List */}
        {standings.map((standing, index) => {
          const isWinner = index === 0 && winner?.type !== 'draw';
          const playerColor = getPlayerColor(standing.playerId);

          return (
            <View
              key={standing.playerId}
              style={[
                styles.standingRow,
                isWinner && styles.standingRowWinner,
                { borderLeftColor: playerColor, borderLeftWidth: 3 },
              ]}
            >
              {/* Rank */}
              <View style={styles.rankBadge}>
                <RTLText bold gold style={styles.rankText}>
                  {t('results.rank', { n: standing.rank })}
                </RTLText>
              </View>

              {/* Player Info */}
              <View style={styles.playerInfo}>
                <RTLText bold style={styles.playerName}>
                  {t('lobby.player', { n: standing.playerId + 1 })}
                </RTLText>
                {is2v2 && (
                  <RTLText small style={styles.teamLabel}>
                    {t('game.team')} {standing.teamId === 0 ? 'A' : 'B'}
                  </RTLText>
                )}
                <RTLText small style={styles.laneWins}>
                  {t('results.laneWins', { n: standing.laneWins })}
                </RTLText>
              </View>

              {/* VP Score */}
              <View style={styles.vpSection}>
                <RTLText gold bold style={styles.vpValue}>
                  {standing.vpTotal}
                </RTLText>
                <RTLText small style={styles.vpLabel}>
                  {t('results.vp', { n: '' }).trim()}
                </RTLText>
              </View>
            </View>
          );
        })}

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <RTLPressable onPress={handlePlayAgain} style={styles.playAgainButton}>
          <RTLText gold bold style={styles.playAgainText}>
            {t('results.playAgain')}
          </RTLText>
        </RTLPressable>

        <RTLPressable onPress={handleMainMenu} style={styles.mainMenuButton}>
          <RTLText style={styles.mainMenuText}>
            {t('results.mainMenu')}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenEdge,
    alignItems: 'center',
  },
  winnerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  trophyContainer: {
    marginBottom: 12,
  },
  trophy: {
    fontSize: 64,
  },
  winnerTitle: {
    fontSize: 28,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accentGold,
    opacity: 0.3,
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: Colors.accentGold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
    opacity: 0.5,
  },
  standingsTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    width: '100%',
  },
  standingRowWinner: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderWidth: 1,
    borderColor: Colors.accentGold,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: Colors.neutralText,
    fontSize: 16,
  },
  teamLabel: {
    color: Colors.neutralText,
    opacity: 0.6,
    fontSize: 11,
  },
  laneWins: {
    color: Colors.neutralText,
    opacity: 0.5,
    fontSize: 11,
  },
  vpSection: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  vpValue: {
    fontSize: 22,
  },
  vpLabel: {
    color: Colors.neutralText,
    opacity: 0.5,
    fontSize: 10,
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
  playAgainButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playAgainText: {
    fontSize: 16,
    letterSpacing: 1,
  },
  mainMenuButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainMenuText: {
    color: Colors.neutralText,
    fontSize: 14,
    opacity: 0.7,
  },
});

export default ResultsScreen;
