/**
 * Lane Component — displays a single lane on the game board.
 *
 * States:
 * - inactive: Dimmed with lock icon
 * - active-planning: Normal, tap to place card
 * - active-reveal: Cards being shown
 * - active-resolution: Highlighted with winner
 * - won: Gold border, VP displayed
 * - lost: Dimmed slightly
 * - tied: Split VP indicator
 *
 * Responsive: width adapts to screen size, min 60dp.
 */
import React from 'react';
import { View, StyleSheet, Dimensions, I18nManager } from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing, Typography } from '../theme';
import { RTLText } from './RTLText';
import { RTLPressable } from './RTLPressable';
import type { LaneState, LaneObjective } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

export type LaneVisualState =
  | 'inactive'
  | 'active-planning'
  | 'active-reveal'
  | 'active-resolution'
  | 'won'
  | 'lost'
  | 'tied';

interface LaneProps {
  /** Lane data from game engine */
  lane: LaneState;
  /** Visual state */
  visualState: LaneVisualState;
  /** Whether this lane is interactable (planning phase, active) */
  isInteractable: boolean;
  /** Whether the human player has a card selected */
  hasSelectedCard: boolean;
  /** Called when lane is tapped (to place card) */
  onPress?: () => void;
  /** Human player ID (for display) */
  humanPlayerId: number;
  /** Game mode for display */
  gameMode: 'ffa' | '2v2';
  /** Lane width (responsive) */
  width?: number;
}

// ─── Helpers ────────────────────────────────────────────────────

const getObjectiveIcon = (type: LaneObjective['type']): string => {
  switch (type) {
    case 'high-value': return '★';
    case 'capture-flag': return '⚑';
    case 'king-of-hill': return '♛';
    case 'bounty': return '₹';
    case 'standard': return '◆';
  }
};

const getObjectiveLabel = (type: LaneObjective['type'], t: (key: string) => string): string => {
  switch (type) {
    case 'high-value': return t('lane.high-value');
    case 'capture-flag': return t('lane.capture-flag');
    case 'king-of-hill': return t('lane.king-of-hill');
    case 'bounty': return t('lane.bounty');
    default: return t('lane.standard');
  }
};

// ─── Component ──────────────────────────────────────────────────

export const LaneComponent: React.FC<LaneProps> = ({
  lane,
  visualState,
  isInteractable,
  hasSelectedCard,
  onPress,
  humanPlayerId,
  gameMode,
  width = 80,
}) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const isInactive = visualState === 'inactive';
  const isWon = visualState === 'won';
  const isLost = visualState === 'lost';
  const isTied = visualState === 'tied';
  const isResolved = isWon || isLost || isTied;

  // Determine border color
  const borderColor = isWon
    ? Colors.accentGold
    : isTied
      ? Colors.vpText
      : isLost
        ? Colors.inactiveDim
        : Colors.borderDefault;

  return (
    <RTLPressable
      onPress={onPress}
      disabled={!isInteractable || isResolved}
      style={[
        styles.lane,
        {
          width,
          borderColor,
          opacity: isInactive ? 0.4 : 1,
        },
        isWon && styles.laneWon,
      ]}
    >
      {/* Lane Header: Name + Objective + VP */}
      <View style={styles.laneHeader}>
        <RTLText small gold style={styles.laneNumber}>
          {t('game.lane', { n: lane.index + 1 })}
        </RTLText>
        <View style={styles.objectiveRow}>
          <RTLText style={styles.objectiveIcon}>
            {getObjectiveIcon(lane.objective.type)}
          </RTLText>
          <RTLText small style={styles.objectiveLabel} numberOfLines={1}>
            {getObjectiveLabel(lane.objective.type, t)}
          </RTLText>
        </View>
        <RTLText gold bold style={styles.vpValue}>
          {lane.objective.vpValue + lane.objective.bonusVp} VP
        </RTLText>
        {lane.objective.bonusVp > 0 && (
          <RTLText small gold style={styles.bonusLabel}>
            +{lane.objective.bonusVp}
          </RTLText>
        )}
      </View>

      {/* Player Slots */}
      <View style={styles.slotsContainer}>
        {[0, 1, 2, 3].map((pid) => {
          const playerCards = lane.assignments[pid as keyof typeof lane.assignments] ?? [];
          const hasCards = playerCards.length > 0;
          const isHuman = pid === humanPlayerId;
          const playerColor = isHuman ? Colors.accentGold : Colors.inactiveDim;

          return (
            <View
              key={pid}
              style={[
                styles.playerSlot,
                { borderColor: hasCards ? playerColor : 'transparent' },
              ]}
            >
              {hasCards && (
                <View style={styles.slotCards}>
                  {playerCards.map((card, idx) => (
                    <View
                      key={card.id ?? idx}
                      style={[
                        styles.miniCard,
                        {
                          backgroundColor: Colors.cardUnit,
                          borderColor: isHuman ? Colors.accentGold : Colors.inactiveDim,
                        },
                      ]}
                    >
                      <RTLText small style={styles.miniCardText}>
                        {card.strength > 0 ? card.strength : '?'}
                      </RTLText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Footer: Winner / Strength */}
      <View style={styles.laneFooter}>
        {isResolved && lane.winner !== null && !isTied && (
          <RTLText small gold bold>
            {t('results.winner', { n: lane.winner + 1 })}
          </RTLText>
        )}
        {isTied && (
          <RTLText small gold>
            {t('game.tie')}
          </RTLText>
        )}
        {isWon && lane.objective.bonusVp > 0 && (
          <RTLText small gold>
            {t('game.vp.bonus', { n: lane.objective.bonusVp })}
          </RTLText>
        )}
      </View>

      {/* Interactive overlay pulse (for planning) */}
      {isInteractable && hasSelectedCard && (
        <View style={styles.interactiveOverlay} />
      )}
    </RTLPressable>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  lane: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.surfaceDark,
    marginHorizontal: 2,
    overflow: 'hidden',
    minWidth: 60,
  },
  laneWon: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    elevation: 4,
  },
  laneHeader: {
    padding: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  laneNumber: {
    fontWeight: '700',
    marginBottom: 2,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  objectiveIcon: {
    fontSize: 14,
    marginRight: 4,
    color: Colors.vpText,
  },
  objectiveLabel: {
    color: Colors.neutralText,
    fontSize: 9,
    maxWidth: 60,
  },
  vpValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  bonusLabel: {
    fontSize: 9,
    color: Colors.accentGold,
  },
  slotsContainer: {
    padding: 4,
  },
  playerSlot: {
    height: 24,
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  slotCards: {
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  miniCard: {
    width: 20,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  miniCardText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '700',
  },
  laneFooter: {
    padding: 4,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  interactiveOverlay: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
});

export default LaneComponent;
