/**
 * ActionBar Component — bottom action bar with Confirm, Cancel, and Timer.
 *
 * Layout:
 * - Confirm button (right in LTR, left in RTL)
 * - Cancel selection button
 * - Timer countdown ring
 * - Settings gear
 */
import React from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText } from './RTLText';
import { RTLPressable } from './RTLPressable';
import { RTLView } from './RTLView';

// ─── Types ──────────────────────────────────────────────────────

interface ActionBarProps {
  /** Current game phase */
  phase: 'planning' | 'reveal' | 'resolution' | 'cleanup';
  /** Whether the player has pending assignments */
  hasAssignments: boolean;
  /** Whether assignments have been confirmed (submitted) */
  isConfirmed: boolean;
  /** Whether there's an error to display */
  error: string | null;
  /** Called when Confirm is pressed */
  onConfirm: () => void;
  /** Called when Cancel is pressed */
  onCancel: () => void;
  /** Called when Settings is pressed */
  onSettings?: () => void;
}

// ─── Component ──────────────────────────────────────────────────

export const ActionBar: React.FC<ActionBarProps> = ({
  phase,
  hasAssignments,
  isConfirmed,
  error,
  onConfirm,
  onCancel,
  onSettings,
}) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const isPlanning = phase === 'planning';
  const canConfirm = isPlanning && hasAssignments && !isConfirmed;
  const showCancel = isPlanning && hasAssignments;

  return (
    <View style={styles.container}>
      <RTLView style={styles.inner} rtlFlip={false}>
        {/* Left side: Cancel button */}
        <View style={styles.leftSection}>
          {showCancel && (
            <RTLPressable onPress={onCancel} style={styles.cancelButton}>
              <RTLText small style={styles.cancelText}>
                {t('game.cancel')}
              </RTLText>
            </RTLPressable>
          )}
        </View>

        {/* Center: Error or Hint */}
        <View style={styles.centerSection}>
          {error && (
            <RTLText small danger style={styles.errorText}>
              {error}
            </RTLText>
          )}
          {!error && isPlanning && !hasAssignments && (
            <RTLText small style={styles.hintText}>
              {t('game.confirm.hint')}
            </RTLText>
          )}
          {isPlanning && hasAssignments && !isConfirmed && (
            <RTLText small gold style={styles.readyText}>
              {t('lobby.player', { n: 1 })} {t('game.confirm')}
            </RTLText>
          )}
          {isConfirmed && (
            <RTLText small gold bold>
              ✓ {t('game.confirm')}
            </RTLText>
          )}
        </View>

        {/* Right side: Confirm + Settings */}
        <RTLView style={styles.rightSection} rtlFlip={false}>
          {canConfirm && (
            <RTLPressable
              onPress={onConfirm}
              style={[styles.confirmButton, hasAssignments && styles.confirmActive]}
            >
              <RTLText small gold bold>
                {t('game.confirm')}
              </RTLText>
            </RTLPressable>
          )}
          {onSettings && (
            <RTLPressable onPress={onSettings} style={styles.settingsButton}>
              <RTLText small style={styles.settingsIcon}>
                ⚙
              </RTLText>
            </RTLPressable>
          )}
        </RTLView>
      </RTLView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.screenEdge,
    paddingVertical: 6,
  },
  inner: {
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inactiveDim,
  },
  cancelText: {
    color: Colors.neutralText,
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inactiveDim,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  confirmActive: {
    borderColor: Colors.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsIcon: {
    fontSize: 18,
    color: Colors.neutralText,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 11,
  },
  hintText: {
    color: Colors.neutralText,
    opacity: 0.5,
    fontSize: 11,
  },
  readyText: {
    fontSize: 11,
    opacity: 0.8,
  },
});

export default ActionBar;
