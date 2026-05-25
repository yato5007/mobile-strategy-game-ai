/**
 * ScoreBar Component — displays player scores, round counter, and phase indicator.
 *
 * Layout:
 * - Top bar with all 4 player scores
 * - Round counter in center
 * - Phase indicator
 * - Mode indicator (FFA/2v2)
 * - RTL-aware ordering
 */
import React from 'react';
import { View, StyleSheet, I18nManager, useWindowDimensions } from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText } from './RTLText';
import { RTLView } from './RTLView';
import type { GameState, PlayerState } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

interface ScoreBarProps {
  /** Current game state (for scores and phase) */
  gameState: GameState | null;
  /** Current phase */
  phase: 'planning' | 'reveal' | 'resolution' | 'cleanup';
  /** Current round number */
  currentRound: number;
  /** Maximum rounds */
  maxRounds: number;
  /** Human player ID */
  humanPlayerId: number;
}

// ─── Helpers ────────────────────────────────────────────────────

const getPlayerColor = (playerId: number): string => {
  const colors = [Colors.player0, Colors.player1, Colors.player2, Colors.player3];
  return colors[playerId] ?? Colors.player0;
};

const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'planning': return Colors.accentGold;
    case 'reveal': return Colors.cardTactic;
    case 'resolution': return Colors.accentGreen;
    case 'cleanup': return Colors.cardObjective;
    default: return Colors.neutralText;
  }
};

const getPhaseKey = (phase: string): string => {
  switch (phase) {
    case 'planning': return 'game.phase.planning';
    case 'reveal': return 'game.phase.reveal';
    case 'resolution': return 'game.phase.resolution';
    case 'cleanup': return 'game.phase.cleanup';
    default: return 'game.phase.planning';
  }
};

// ─── Component ──────────────────────────────────────────────────

export const ScoreBar: React.FC<ScoreBarProps> = ({
  gameState,
  phase,
  currentRound,
  maxRounds,
  humanPlayerId,
}) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const { width: screenWidth } = useWindowDimensions();

  const players = gameState?.players;
  const mode = gameState?.mode ?? 'ffa';

  // In 2v2 mode, calculate team scores
  const teamScores = mode === '2v2' && players
    ? {
        teamA: players[0].vpTotal + players[1].vpTotal,
        teamB: players[2].vpTotal + players[3].vpTotal,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* Mode and Round Info */}
      <View style={styles.topRow}>
        <RTLText small gold bold style={styles.modeText}>
          {mode === '2v2' ? t('lobby.mode.2v2') : t('lobby.mode.ffa')}
        </RTLText>
        <RTLText small gold bold style={styles.roundText}>
          {t('game.round', { n: currentRound, max: maxRounds })}
        </RTLText>
        <RTLText
          small
          style={[styles.phaseText, { color: getPhaseColor(phase) }]}
        >
          {t(getPhaseKey(phase))}
        </RTLText>
      </View>

      {/* Player Scores */}
      <RTLView style={styles.scoresRow} rtlFlip={false}>
        {players && (
          <>
            {/* FFA: Show individual scores */}
            {mode === 'ffa' && Array.from({ length: 4 }, (_, i) => {
              const p = players[i];
              if (!p) return null;
              const isHuman = i === humanPlayerId;
              return (
                <View
                  key={i}
                  style={[
                    styles.scoreItem,
                    isHuman && styles.humanScore,
                  ]}
                >
                  <View style={[
                    styles.playerDot,
                    { backgroundColor: getPlayerColor(i) },
                  ]} />
                  <RTLText
                    small
                    gold
                    bold={isHuman}
                    style={styles.scoreValue}
                  >
                    {p.vpTotal}
                  </RTLText>
                  <RTLText
                    small
                    style={[styles.scoreLabel, isHuman && { color: Colors.accentGold }]}
                  >
                    {t('lobby.player', { n: i + 1 })}
                  </RTLText>
                </View>
              );
            })}

            {/* 2v2: Show team scores */}
            {mode === '2v2' && (
              <>
                <View style={styles.teamBlock}>
                  <RTLText small gold bold style={styles.teamScore}>
                    {teamScores?.teamA ?? 0}
                  </RTLText>
                  <View style={styles.teamPlayers}>
                    <RTLText small style={styles.teamLabel}>
                      {t('game.team')} A
                    </RTLText>
                    <RTLText small style={styles.playerNames}>
                      P1 ({players[0].vpTotal}) + P2 ({players[1].vpTotal})
                    </RTLText>
                  </View>
                </View>
                <View style={styles.teamBlock}>
                  <RTLText small gold bold style={styles.teamScore}>
                    {teamScores?.teamB ?? 0}
                  </RTLText>
                  <View style={styles.teamPlayers}>
                    <RTLText small style={styles.teamLabel}>
                      {t('game.team')} B
                    </RTLText>
                    <RTLText small style={styles.playerNames}>
                      P3 ({players[2].vpTotal}) + P4 ({players[3].vpTotal})
                    </RTLText>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </RTLView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondaryBackground,
    paddingHorizontal: Spacing.screenEdge,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeText: {
    fontSize: 11,
    opacity: 0.8,
  },
  roundText: {
    fontSize: 12,
  },
  phaseText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoresRow: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  humanScore: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  playerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
  },
  scoreLabel: {
    fontSize: 9,
    opacity: 0.7,
  },
  teamBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  teamScore: {
    fontSize: 18,
    marginRight: 8,
  },
  teamPlayers: {
    alignItems: 'flex-start',
  },
  teamLabel: {
    color: Colors.neutralText,
    fontWeight: '600',
    fontSize: 11,
  },
  playerNames: {
    fontSize: 9,
    opacity: 0.6,
    color: Colors.neutralText,
  },
});

export default ScoreBar;
