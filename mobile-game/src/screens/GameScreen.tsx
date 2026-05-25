/**
 * GameScreen — Main gameplay screen.
 *
 * Layout (vertical):
 * - ScoreBar (top 5%)
 * - BoardArea with lanes (top 60% of remaining)
 * - HandArea (bottom 25%)
 * - ActionBar (bottom 10%)
 * - PhaseOverlay (fullscreen for transitions)
 *
 * Game loop integration:
 * 1. Initialize game on mount
 * 2. Subscribe to game events
 * 3. Handle planning phase card interactions
 * 4. Display reveal/resolution/cleanup phases
 * 5. Navigate to ResultsScreen on game end
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Alert,
  I18nManager,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText } from '../components/RTLText';
import { RTLView } from '../components/RTLView';
import { RTLPressable } from '../components/RTLPressable';
import { ScoreBar } from '../components/ScoreBar';
import { LaneComponent } from '../components/Lane';
import type { LaneVisualState } from '../components/Lane';
import { HandArea } from '../components/HandArea';
import { ActionBar } from '../components/ActionBar';
import { PhaseOverlay } from '../components/PhaseOverlay';
import type { OverlayType } from '../components/PhaseOverlay';
import { useGameStore } from '../state/gameStore';
import { useUIStore } from '../state/uiStore';
import type { GameState, LaneIndex } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

interface GameScreenProps {
  navigation: any;
  route: any;
}

// ─── Component ──────────────────────────────────────────────────

export const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isRTL = I18nManager.isRTL;

  // Game Store
  const {
    gameState,
    phase,
    currentRound,
    maxRounds,
    gameOver,
    gameResult,
    humanPlayerId,
    selectedCardId,
    pendingAssignments,
    error: gameError,
    initializeGame,
    selectCard,
    assignToLane,
    removeFromLane,
    confirmAssignments,
    resetGame,
    getHumanHand,
  } = useGameStore();

  const { screenWidth: uiWidth } = useUIStore();

  // Local UI state
  const [phaseOverlay, setPhaseOverlay] = useState<OverlayType>('none');
  const [showOverlay, setShowOverlay] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get match config from route params
  const matchConfig = route.params;

  // ─── Initialize Game on Mount ─────────────────────────────────

  useEffect(() => {
    if (matchConfig) {
      initializeGame(
        {
          mode: matchConfig.mode ?? 'ffa',
          playerSlots: matchConfig.playerSlots ?? [
            { isBot: false },
            { isBot: true, difficulty: 'normal', style: 'balanced' },
            { isBot: true, difficulty: 'normal', style: 'balanced' },
            { isBot: true, difficulty: 'normal', style: 'balanced' },
          ],
        },
        0, // Human is always player 0
      );
    }

    // Cleanup on unmount
    return () => {
      resetGame();
    };
  }, []);

  // ─── Watch Phase Changes ──────────────────────────────────────

  useEffect(() => {
    if (phase === 'reveal') {
      setPhaseOverlay('reveal');
      setShowOverlay(true);
      setIsConfirmed(true);
    } else if (phase === 'resolution') {
      setPhaseOverlay('resolution');
      setShowOverlay(true);
    } else if (phase === 'cleanup') {
      setPhaseOverlay('cleanup');
      setShowOverlay(true);
    } else if (phase === 'planning') {
      setPhaseOverlay('none');
      setShowOverlay(false);
      setIsConfirmed(false);
    }
  }, [phase]);

  // ─── Watch Game Over ──────────────────────────────────────────

  useEffect(() => {
    if (gameOver && gameState) {
      // Delay navigation slightly to allow final state to render
      const timer = setTimeout(() => {
        navigation.replace('Results', {
          gameState: gameState,
          gameResult: gameResult,
          mode: matchConfig?.mode ?? 'ffa',
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameOver]);

  // ─── Error Handling ───────────────────────────────────────────

  useEffect(() => {
    if (gameError) {
      setLocalError(gameError);
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameError]);

  // ─── Handlers ─────────────────────────────────────────────────

  const handleCardPress = useCallback((cardId: string) => {
    if (phase !== 'planning') return;
    if (selectedCardId === cardId) {
      selectCard(null); // Deselect
    } else {
      selectCard(cardId); // Select
    }
  }, [phase, selectedCardId, selectCard]);

  const handleLanePress = useCallback((laneIndex: LaneIndex) => {
    if (phase !== 'planning') return;

    if (selectedCardId) {
      // Place card in lane
      assignToLane(laneIndex);
    } else {
      // Remove card from lane (if any)
      removeFromLane(laneIndex);
    }
  }, [phase, selectedCardId, assignToLane, removeFromLane]);

  const handleConfirm = useCallback(() => {
    if (phase !== 'planning') return;
    const success = confirmAssignments();
    if (success) {
      setIsConfirmed(true);
    } else {
      setLocalError(t('game.confirm.hint'));
    }
  }, [phase, confirmAssignments, t]);

  const handleCancel = useCallback(() => {
    if (phase !== 'planning') return;
    selectCard(null);
    // Remove all pending assignments
    useGameStore.setState({ pendingAssignments: [] });
    setIsConfirmed(false);
  }, [phase, selectCard]);

  const handleOverlayComplete = useCallback(() => {
    setShowOverlay(false);
    setPhaseOverlay('none');
  }, []);

  // ─── Derived State ────────────────────────────────────────────

  const humanHand = gameState?.players[humanPlayerId]?.hand ?? [];
  const assignedCardIds = useMemo(
    () => new Set(pendingAssignments.map((a) => a.cardId)),
    [pendingAssignments],
  );

  // Responsive lane sizing
  const activeLanes = gameState?.lanes?.filter((l) => l.isActive) ?? [];
  const laneCount = activeLanes.length;
  const laneWidth = Math.max(
    60,
    Math.min(
      (screenWidth - Spacing.screenEdge * 2 - laneCount * 4) / laneCount,
      120,
    ),
  );

  // Get lane visual state
  const getLaneVisualState = (lane: any): LaneVisualState => {
    if (!lane.isActive) return 'inactive';
    if (phase === 'resolution' || phase === 'cleanup') {
      const humanWon = lane.winner === humanPlayerId;
      const isTied = lane.isTie;
      if (isTied) return 'tied';
      if (humanWon) return 'won';
      if (lane.winner !== null) return 'lost';
    }
    return 'active-planning';
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondaryBackground} />

      {/* Score Bar */}
      <ScoreBar
        gameState={gameState}
        phase={phase}
        currentRound={currentRound}
        maxRounds={maxRounds}
        humanPlayerId={humanPlayerId}
      />

      {/* Board Area (Lanes) */}
      <View style={styles.boardArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.lanesContainer,
            isRTL && { flexDirection: 'row-reverse' },
          ]}
        >
          {activeLanes.length > 0 ? (
            activeLanes.map((lane) => (
              <LaneComponent
                key={lane.index}
                lane={lane}
                visualState={getLaneVisualState(lane)}
                isInteractable={phase === 'planning' && !isConfirmed}
                hasSelectedCard={selectedCardId !== null}
                onPress={() => handleLanePress(lane.index)}
                humanPlayerId={humanPlayerId}
                gameMode={gameState?.mode ?? 'ffa'}
                width={laneWidth}
              />
            ))
          ) : (
            <View style={styles.emptyBoard}>
              <RTLText>{t('game.waiting')}</RTLText>
            </View>
          )}
        </ScrollView>

        {/* Pending assignments indicator */}
        {pendingAssignments.length > 0 && phase === 'planning' && !isConfirmed && (
          <View style={styles.assignmentCount}>
            <RTLText small gold>
              {pendingAssignments.length} {t('game.confirm')}
            </RTLText>
          </View>
        )}
      </View>

      {/* Hand Area */}
      <HandArea
        cards={humanHand}
        selectedCardId={selectedCardId}
        assignedCardIds={assignedCardIds}
        onCardPress={handleCardPress}
        screenWidth={screenWidth}
      />

      {/* Action Bar */}
      <ActionBar
        phase={phase}
        hasAssignments={pendingAssignments.length > 0}
        isConfirmed={isConfirmed}
        error={localError}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onSettings={() => navigation.navigate('Settings')}
      />

      {/* Phase Overlay */}
      <PhaseOverlay
        type={phaseOverlay}
        visible={showOverlay}
        roundNumber={currentRound}
        onComplete={handleOverlayComplete}
      />
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  boardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  lanesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenEdge,
    gap: 4,
    minHeight: 200,
  },
  emptyBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentCount: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default GameScreen;
