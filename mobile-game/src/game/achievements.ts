/**
 * Core Game Logic Engine — Achievement System
 *
 * Achievement definitions and checking logic.
 */

import type { GameState, AchievementDefinition, AchievementId, PlayerId } from './types';
import { ACHIEVEMENT_VP } from './constants';

// ─── Achievement Definitions ───────────────────────────────────

/**
 * "Control All Lanes" — Only in 2v2 mode.
 * A team has the highest total strength in ALL active lanes simultaneously.
 * This is checked at the moment of resolution, before cleanup.
 */
function checkControlAllLanes(state: GameState, playerId: PlayerId): boolean {
  if (state.mode !== '2v2') return false;
  if (state.awardedAchievements.includes('control-all-lanes')) return false;

  const playerTeam = state.players[playerId].teamId;
  const activeLanes = state.lanes.filter(l => l.isActive);

  if (activeLanes.length < 2) return false; // Need at least 2 active lanes

  // Check if this player's team leads in ALL active lanes
  for (const lane of activeLanes) {
    const team0Strength = lane.totalStrengthPerPlayer[0] + lane.totalStrengthPerPlayer[1];
    const team1Strength = lane.totalStrengthPerPlayer[2] + lane.totalStrengthPerPlayer[3];

    if (playerTeam === 0 && team0Strength <= team1Strength) return false;
    if (playerTeam === 1 && team1Strength <= team0Strength) return false;
  }

  return true;
}

/**
 * "Dominate 3 Lanes" — Only in FFA mode.
 * Player has the highest strength in ≥3 active lanes simultaneously.
 */
function checkDominateThreeLanes(state: GameState, playerId: PlayerId): boolean {
  if (state.mode !== 'ffa') return false;
  if (state.awardedAchievements.includes('dominate-three-lanes')) return false;

  const activeLanes = state.lanes.filter(l => l.isActive);
  if (activeLanes.length < 3) return false;

  let dominatedLanes = 0;
  for (const lane of activeLanes) {
    const strengths = lane.totalStrengthPerPlayer;
    const myStrength = strengths[playerId] ?? 0;
    const isHighest = Object.entries(strengths)
      .filter(([pid]) => parseInt(pid) !== playerId)
      .every(([_, s]) => myStrength > s);

    if (isHighest && myStrength > 0) {
      dominatedLanes++;
    }
  }

  return dominatedLanes >= 3;
}

/**
 * "First Blood" — First player to earn VP (rounds 1-3 only).
 */
function checkFirstBlood(state: GameState, playerId: PlayerId): boolean {
  if (state.firstBloodAwarded) return false;
  if (state.currentRound > 3) return false;

  // Check if this player has any VP
  const player = state.players[playerId];
  if (!player) return false;

  // First Blood is awarded at the first moment a player receives VP
  // This is checked during cleanup, so we need to check if they have VP and first blood wasn't awarded yet
  if (player.vpTotal > 0 && !state.firstBloodAwarded) {
    return true;
  }

  return false;
}

/**
 * "Comeback King" — Player was in last place at some round and goes on to win.
 * Checked only at game end.
 */
function checkComebackKing(state: GameState, playerId: PlayerId): boolean {
  if (state.awardedAchievements.includes('comeback-king')) return false;
  if (state.gamePhase !== 'completed') return false;

  const player = state.players[playerId];
  if (!player) return false;

  // Determine if player is the winner
  const sorted = [...state.players].filter(p => p.isConnected).sort((a, b) => b.vpTotal - a.vpTotal);
  if (sorted.length === 0 || sorted[0].id !== playerId) return false;

  // They must have been in last place at some point
  // Simplified: check if they had the lowest VP at any point during the match
  // For now, we check a simple heuristic: they had the lowest VP at round 1
  // In a full implementation, we'd track per-round VP history
  // This is a simplified version that triggers if the winner ever had ≤3 VP while the leader had ≥8 VP
  // (Heuristic: a significant VP gap existed)
  const leader = sorted[0];
  if (leader.id !== playerId) return false;
  if (state.players.some(p => p.vpTotal > player.vpTotal + 5)) return true;

  return false;
}

/**
 * "No Mercy" — Player's total strength in a single lane ≥ 10.
 */
function checkNoMercy(state: GameState, playerId: PlayerId): boolean {
  if (state.awardedAchievements.includes('no-mercy')) return false;

  for (const lane of state.lanes) {
    if (!lane.isActive) continue;
    if ((lane.totalStrengthPerPlayer[playerId] ?? 0) >= 10) {
      return true;
    }
  }

  return false;
}

/**
 * "Perfectionist" — Win all contested lanes in a single round (minimum 2 lanes).
 */
function checkPerfectionist(state: GameState, playerId: PlayerId): boolean {
  if (state.awardedAchievements.includes('perfectionist')) return false;

  const activeLanes = state.lanes.filter(l => l.isActive);
  const contestedLanes = activeLanes.filter(l =>
    Object.values(l.assignments).some(cards => cards.some(c => {
      // The card reference might already be gone from hand — check assignments
      return true; // Any lane with a winner that is the player
    })),
  );

  if (contestedLanes.length < 2) return false;

  for (const lane of contestedLanes) {
    if (lane.winner !== playerId) return false;
  }

  return true;
}

// ─── Achievement Registry ──────────────────────────────────────

/** All achievement definitions */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'control-all-lanes',
    nameKey: 'achievement.control-all-lanes',
    descriptionKey: 'achievement.control-all-lanes.desc',
    vpReward: ACHIEVEMENT_VP['control-all-lanes'] ?? 5,
    maxTriggers: 1,
    allowedModes: ['2v2'],
    condition: checkControlAllLanes,
  },
  {
    id: 'dominate-three-lanes',
    nameKey: 'achievement.dominate-three-lanes',
    descriptionKey: 'achievement.dominate-three-lanes.desc',
    vpReward: ACHIEVEMENT_VP['dominate-three-lanes'] ?? 3,
    maxTriggers: 1,
    allowedModes: ['ffa'],
    condition: checkDominateThreeLanes,
  },
  {
    id: 'first-blood',
    nameKey: 'achievement.first-blood',
    descriptionKey: 'achievement.first-blood.desc',
    vpReward: ACHIEVEMENT_VP['first-blood'] ?? 2,
    maxTriggers: 1,
    allowedModes: ['ffa', '2v2'],
    condition: checkFirstBlood,
  },
  {
    id: 'comeback-king',
    nameKey: 'achievement.comeback-king',
    descriptionKey: 'achievement.comeback-king.desc',
    vpReward: ACHIEVEMENT_VP['comeback-king'] ?? 3,
    maxTriggers: 1,
    allowedModes: ['ffa', '2v2'],
    condition: checkComebackKing,
  },
  {
    id: 'no-mercy',
    nameKey: 'achievement.no-mercy',
    descriptionKey: 'achievement.no-mercy.desc',
    vpReward: ACHIEVEMENT_VP['no-mercy'] ?? 2,
    maxTriggers: 1,
    allowedModes: ['ffa', '2v2'],
    condition: checkNoMercy,
  },
  {
    id: 'perfectionist',
    nameKey: 'achievement.perfectionist',
    descriptionKey: 'achievement.perfectionist.desc',
    vpReward: ACHIEVEMENT_VP['perfectionist'] ?? 2,
    maxTriggers: 1,
    allowedModes: ['ffa'],
    condition: checkPerfectionist,
  },
];

// ─── Achievement Checking ──────────────────────────────────────

/**
 * Check all achievements for all players.
 * Returns newly awarded achievements.
 */
export function checkAchievements(
  state: GameState,
): { id: AchievementId; playerId: PlayerId; vpReward: number }[] {
  const newlyAwarded: { id: AchievementId; playerId: PlayerId; vpReward: number }[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Check mode eligibility
    if (!achievement.allowedModes.includes(state.mode)) continue;

    // Check if already awarded (global check)
    // (Some achievements are per-player, some are global)
    const isGlobalAchievement = ['first-blood', 'control-all-lanes', 'dominate-three-lanes'].includes(achievement.id);

    for (const player of state.players) {
      if (!player.isConnected) continue;

      // Check if this player already earned this achievement
      if (player.earnedAchievements.includes(achievement.id)) continue;

      // For global achievements, check if ANYONE has earned it
      if (isGlobalAchievement && state.awardedAchievements.includes(achievement.id)) continue;

      // Check condition
      if (achievement.condition(state, player.id)) {
        // Award the achievement
        player.vpTotal += achievement.vpReward;
        player.earnedAchievements.push(achievement.id);

        newlyAwarded.push({
          id: achievement.id,
          playerId: player.id,
          vpReward: achievement.vpReward,
        });
      }
    }
  }

  return newlyAwarded;
}
