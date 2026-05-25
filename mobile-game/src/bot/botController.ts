/**
 * Bot and AI System — Bot Controller
 *
 * Weighted heuristic bot decision engine for the lane-control strategy game.
 * Supports 4 difficulty levels (Easy, Normal, Hard, Expert) and
 * 7 strategic styles (Aggressive, Defensive, Balanced, Disruptive,
 * Objective-focused, Comeback-focused, Team-support).
 *
 * Bots receive the same GameState snapshot as human players and produce
 * SubmitAction payloads identical to human submissions. No hidden info access.
 *
 * @module bot
 */

import type {
  GameState,
  PlayerId,
  LaneIndex,
  Card,
  CardAssignment,
  CardId,
  SubmitAction,
  PlayerState,
  Standing,
  GameEventEmitter,
} from '../game/types';

import { cloneGameState, getStandings } from '../game/index';

// ─── Public Types ──────────────────────────────────────────────

/** Bot difficulty level — controls decision quality and noise. */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

/** Bot strategic style — controls personality and preferences. */
export type Style =
  | 'aggressive'
  | 'defensive'
  | 'balanced'
  | 'disruptive'
  | 'objective-focused'
  | 'comeback-focused'
  | 'team-support';

/**
 * Configuration for a bot instance.
 * Difficulty and style are independent and can be combined freely.
 */
export interface BotConfig {
  difficulty: Difficulty;
  style: Style;
}

/**
 * BotController interface.
 * The decide() method is called by the game engine during the planning phase
 * to produce a valid SubmitAction for the given player.
 */
export interface BotController {
  /**
   * Decide which cards to assign to which lanes for the current round.
   * @param gameState - A snapshot of the current game state (read-only)
   * @param playerId - The bot player's ID
   * @param events - Game event emitter (available for future use, not used by bots directly)
   * @returns A SubmitAction with the chosen card assignments
   */
  decide(
    gameState: GameState,
    playerId: PlayerId,
    events: GameEventEmitter,
  ): SubmitAction;

  /** Get the bot's configuration. */
  getConfig(): BotConfig;
}

// ─── Internal Types ────────────────────────────────────────────

/** Parameter profile for a single difficulty level. */
interface DifficultyProfile {
  /** Noise range as fraction of max score (±). 0.0 = no noise, 0.3 = ±30%. */
  noiseRange: number;
  /** Probability of skipping evaluation and picking randomly. */
  randomAssignmentChance: number;
  /** Whether the bot considers opponent standings and patterns. */
  opponentAwareness: boolean;
  /** Level of hand management: 0=none, 1=basic, 2=active, 3=optimal. */
  handManagementLevel: number;
  /** Probability of playing a weak card on a high-value lane to mislead. */
  bluffProbability: number;
  /** Comeback optimization level: 0=immediate, 1=within2, 2=save, 3=optimal. */
  comebackOptimization: number;
  /** Level of tactic usage: 0=random, 1=basic, 2=strategic, 3=full-synergy. */
  tacticUsageLevel: number;
  /** Team awareness: 0=none, 1=basic, 2=coordinated, 3=full. */
  teamAwarenessLevel: number;
  /** Number of cards to default assign (minimum 1). */
  defaultCardCount: number;
}

/** Weight profile for a single strategic style. */
interface StyleWeights {
  /** Weight for lane base VP value in lane score. */
  laneVp: number;
  /** Weight for lane objective bonus in lane score. */
  laneObjective: number;
  /** Weight for lane streak factor in lane score. */
  laneStreak: number;
  /** Weight for opponent presence penalty in lane score. */
  laneOpponent: number;
  /** Weight for comeback urgency in lane score. */
  laneComeback: number;
  /** Weight for team synergy in lane score. */
  laneTeam: number;
  /** Weight for card strength value in card score. */
  cardStrength: number;
  /** Weight for tactic effect value in card score. */
  cardTactic: number;
  /** Weight for synergy with other assigned cards in card score. */
  cardSynergy: number;
  /** Weight for conservation penalty (using strong cards when weak suffice). */
  cardConservation: number;
  /** Weight for bluff potential in card score. */
  cardBluff: number;
}

/** Scored assignment candidate. */
interface ScoredAssignment {
  cardId: CardId;
  laneIndex: LaneIndex;
  totalScore: number;
}

// ─── Constants: Difficulty Profiles ────────────────────────────

const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  easy: {
    noiseRange: 0.3,
    randomAssignmentChance: 0.15,
    opponentAwareness: false,
    handManagementLevel: 0,
    bluffProbability: 0.0,
    comebackOptimization: 0,
    tacticUsageLevel: 0,
    teamAwarenessLevel: 0,
    defaultCardCount: 2,
  },
  normal: {
    noiseRange: 0.1,
    randomAssignmentChance: 0.0,
    opponentAwareness: true,
    handManagementLevel: 1,
    bluffProbability: 0.1,
    comebackOptimization: 1,
    tacticUsageLevel: 1,
    teamAwarenessLevel: 1,
    defaultCardCount: 2,
  },
  hard: {
    noiseRange: 0.03,
    randomAssignmentChance: 0.0,
    opponentAwareness: true,
    handManagementLevel: 2,
    bluffProbability: 0.25,
    comebackOptimization: 2,
    tacticUsageLevel: 2,
    teamAwarenessLevel: 2,
    defaultCardCount: 3,
  },
  expert: {
    noiseRange: 0.0,
    randomAssignmentChance: 0.0,
    opponentAwareness: true,
    handManagementLevel: 3,
    bluffProbability: 0.35,
    comebackOptimization: 3,
    tacticUsageLevel: 3,
    teamAwarenessLevel: 3,
    defaultCardCount: 3,
  },
};

// ─── Constants: Style Weight Profiles ──────────────────────────

/**
 * Base (Balanced) style weights serve as the neutral reference.
 * All other styles modify these weights to express their preferences.
 */
const BASE_WEIGHTS: StyleWeights = {
  laneVp: 1.0,
  laneObjective: 1.0,
  laneStreak: 1.0,
  laneOpponent: 1.0,
  laneComeback: 1.0,
  laneTeam: 1.0,
  cardStrength: 1.0,
  cardTactic: 1.0,
  cardSynergy: 1.0,
  cardConservation: 1.0,
  cardBluff: 1.0,
};

/** Multiplier map: each style defines a multiplier against the base weights. */
const STYLE_MULTIPLIERS: Record<Style, Partial<StyleWeights>> = {
  /** Aggressive: prefers high-value lanes, high-strength cards, overpower. */
  aggressive: {
    laneVp: 1.8,
    laneOpponent: 0.5, // Less deterred by opponent presence
    cardStrength: 1.8,
    cardTactic: 1.3, // Likes reinforce/sabotage
    cardConservation: 0.3, // Will use strong cards freely
    cardSynergy: 0.7,
    cardBluff: 0.5, // Less bluffing, more direct power
  },
  /** Defensive: conserves strength, spreads evenly, prefers shield/retreat. */
  defensive: {
    laneVp: 0.8,
    laneObjective: 0.7,
    laneStreak: 1.3, // Cares about defending streaks
    cardStrength: 0.6,
    cardTactic: 1.5, // Prefers shield/retreat
    cardConservation: 2.0, // Very conservative with card use
    cardSynergy: 0.8,
    cardBluff: 1.5, // Bluffs to mask weakness
  },
  /** Balanced: neutral weights — adapts naturally to game state. */
  balanced: {
    // All weights are 1.0 (neutral)
  },
  /** Disruptive: targets leader, uses sabotage/ambush/spy. */
  disruptive: {
    laneVp: 0.7,
    laneObjective: 0.6,
    laneOpponent: 2.0, // Heavily influenced by opponent presence
    cardStrength: 0.5,
    cardTactic: 2.0, // Heavy tactic preference (sabotage, ambush, spy)
    cardConservation: 0.5,
    cardSynergy: 1.3,
    cardBluff: 1.8, // Bluffs to hide disruptive intent
  },
  /** Objective-focused: prioritizes lanes with bonus objectives. */
  'objective-focused': {
    laneVp: 0.8,
    laneObjective: 3.0, // Heavy objective bonus weight
    laneStreak: 0.5,
    cardStrength: 1.0,
    cardSynergy: 1.2,
    cardConservation: 1.3,
    cardBluff: 0.8,
  },
  /** Comeback-focused: aggressive when trailing, conservative when leading. */
  'comeback-focused': {
    laneVp: 1.0,
    laneComeback: 3.0, // Very high comeback urgency
    cardStrength: 1.0,
    cardConservation: 0.5,
    cardSynergy: 1.2,
    cardBluff: 1.3,
  },
  /** Team-support: coordinates with teammate, supports team VP. */
  'team-support': {
    laneVp: 0.7,
    laneObjective: 0.8,
    laneTeam: 3.0, // Very high team synergy weight
    cardStrength: 0.8,
    cardTactic: 1.5, // Prefers shield to protect teammate
    cardConservation: 0.8,
    cardSynergy: 1.5,
    cardBluff: 0.7,
  },
};

// ─── Merge Weights ─────────────────────────────────────────────

/**
 * Merge style multipliers with base weights to produce effective weights.
 * Missing keys in the multiplier default to 1.0 (no change from base).
 */
function resolveStyleWeights(style: Style): StyleWeights {
  const mults = STYLE_MULTIPLIERS[style];
  const resolved: Partial<StyleWeights> = {};
  for (const key of Object.keys(BASE_WEIGHTS) as (keyof StyleWeights)[]) {
    const multiplier = (mults as Partial<StyleWeights>)[key] ?? 1.0;
    resolved[key] = BASE_WEIGHTS[key] * multiplier;
  }
  return resolved as StyleWeights;
}

// ─── Constants: Tactic Preference Mapping ──────────────────────

/** Sub-weights for each tactic effect type per style. */
type TacticPreferenceMap = Partial<Record<string, (style: Style) => number>>;

const TACTIC_BASE_VALUE: Record<string, number> = {
  bluff: 2,
  sabotage: 5,
  reinforce: 4,
  spy: 3,
  shield: 4,
  retreat: 2,
  ambush: 4,
};

/**
 * Style-based multiplier for each tactic type.
 * Returns a multiplier that scales TACTIC_BASE_VALUE.
 */
function getTacticMultiplier(
  effectType: string,
  style: Style,
  difficultyProfile: DifficultyProfile,
): number {
  // Base multiplier by style preference
  let mult = 1.0;

  switch (effectType) {
    case 'sabotage':
    case 'ambush':
      if (style === 'disruptive') mult = 2.5;
      else if (style === 'aggressive') mult = 1.5;
      else if (style === 'defensive') mult = 0.5;
      break;
    case 'shield':
    case 'retreat':
      if (style === 'defensive') mult = 2.0;
      else if (style === 'team-support') mult = 2.0;
      else if (style === 'aggressive') mult = 0.4;
      break;
    case 'reinforce':
      if (style === 'aggressive') mult = 1.8;
      else if (style === 'comeback-focused') mult = 1.5;
      break;
    case 'spy':
      if (style === 'disruptive') mult = 2.0;
      else if (difficultyProfile.tacticUsageLevel >= 2) mult = 1.5;
      break;
    case 'bluff':
      if (style === 'disruptive') mult = 1.8;
      else if (style === 'defensive') mult = 1.5;
      break;
  }

  // Difficulty modifies tactic quality
  if (difficultyProfile.tacticUsageLevel === 0) {
    // Random usage — add noise
    mult *= 0.5 + Math.random();
  }

  return mult;
}

// ─── Heuristic Functions ───────────────────────────────────────

/**
 * Calculate the lane score for a given lane and player context.
 *
 * Formula:
 *   laneScore = baseVP * w_vp
 *             + objectiveBonus * w_obj
 *             + streakFactor * w_streak
 *             - opponentPresence * w_opponent
 *             + comebackUrgency * w_comeback
 *             + teamSynergy * w_team
 *
 * @param lane - The lane index to evaluate
 * @param state - Cloned game state
 * @param playerId - The evaluating player
 * @param weights - Style-adjusted weights
 * @param standings - Current standings
 * @returns A numeric score (higher = more valuable lane)
 */
function calculateLaneScore(
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
  weights: StyleWeights,
  standings: Standing[],
  isTrailing: boolean,
): number {
  const lane = state.lanes[laneIndex];
  if (!lane || !lane.isActive) return -1000; // Inactive lanes are non-options

  const player = state.players[playerId];

  // Base VP value
  const baseVpScore = lane.objective.vpValue * weights.laneVp;

  // Objective bonus
  const objectiveBonusScore = lane.objective.bonusVp * weights.laneObjective;

  // Streak factor: +10% per consecutive win in this lane
  const streakFactor = lane.streak * 0.1 * weights.laneStreak;

  // Opponent presence penalty: based on opponent VP (proxy for threat)
  const opponentPresence = calculateOpponentPresence(laneIndex, state, playerId);
  const opponentPenalty = opponentPresence * weights.laneOpponent;

  // Comeback urgency (if trailing)
  const comebackUrgency = isTrailing ? (10 - state.currentRound) * 0.5 * weights.laneComeback : 0;

  // Team synergy (2v2 mode)
  let teamSynergy = 0;
  if (state.mode === '2v2') {
    teamSynergy = calculateTeamSynergy(laneIndex, state, playerId) * weights.laneTeam;
  }

  return baseVpScore + objectiveBonusScore + streakFactor - opponentPenalty + comebackUrgency + teamSynergy;
}

/**
 * Calculate opponent presence in a lane.
 * Uses opponent VP standing as a proxy for threat level.
 *
 * @returns A penalty value (higher = more opponents/threats in this lane)
 */
function calculateOpponentPresence(
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
): number {
  const lane = state.lanes[laneIndex];
  const player = state.players[playerId];
  let presence = 0;

  for (const opp of state.players) {
    if (opp.id === playerId || !opp.isConnected) continue;

    // Skip teammate in 2v2 mode
    if (state.mode === '2v2' && opp.teamId === player.teamId) continue;

    // Base presence: every active opponent is a potential threat
    presence += 1;

    // Higher VP opponents are more threatening
    presence += opp.vpTotal * 0.2;

    // Opponents with more cards can contest more lanes
    presence += opp.hand.length * 0.05;
  }

  return presence;
}

/**
 * Calculate team synergy bonus for a lane in 2v2 mode.
 * Rewards lanes where the teammate has already committed strength
 * (from previous round data or visible assignments).
 *
 * @returns A bonus value (higher = teammate benefits more from support)
 */
function calculateTeamSynergy(
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
): number {
  if (state.mode !== '2v2') return 0;

  const player = state.players[playerId];
  const teamId = player.teamId;
  const teammate = state.players.find(p => p.teamId === teamId && p.id !== playerId);

  if (!teammate || !teammate.isConnected) return 0;

  // Check if teammate has assigned cards to this lane (visible during planning in 2v2)
  const teammateAssignments = teammate.currentAssignments;
  const teammateLaneCount = teammateAssignments.filter(a => a.laneIndex === laneIndex).length;

  // Bonus for supporting teammate's lane
  const lane = state.lanes[laneIndex];
  const laneValue = lane.objective.vpValue + lane.objective.bonusVp;

  return teammateLaneCount * laneValue * 1.5;
}

/**
 * Calculate the card score for a specific card when placed in a specific lane.
 *
 * Formula:
 *   cardScore = strengthValue * w_str
 *             + tacticValue * w_tactic
 *             + synergyBonus * w_synergy
 *             - conservationPenalty * w_conserve
 *             + bluffPotential * w_bluff
 *
 * @param card - The card being evaluated
 * @param laneIndex - Target lane
 * @param state - Cloned game state
 * @param playerId - The evaluating player
 * @param weights - Style-adjusted weights
 * @param profile - Difficulty profile
 * @returns A numeric score (higher = better card for this lane)
 */
function calculateCardScore(
  card: Card,
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
  weights: StyleWeights,
  style: Style,
  profile: DifficultyProfile,
): number {
  const lane = state.lanes[laneIndex];
  const player = state.players[playerId];

  // Strength value: unit/objective cards have strength > 0, tactic cards are 0
  const strengthValue = card.strength * weights.cardStrength;

  // Tactic value
  const tacticValue = calculateTacticValue(card, laneIndex, state, playerId, style, profile) * weights.cardTactic;

  // Synergy bonus: does this card work well with other cards we plan to assign?
  const synergyBonus = calculateSynergyBonus(card, laneIndex, state, playerId) * weights.cardSynergy;

  // Conservation penalty: penalize using high-strength cards when weaker suffice
  const conservationPenalty = calculateConservationPenalty(
    card,
    laneIndex,
    state,
    playerId,
    profile.handManagementLevel,
  ) * weights.cardConservation;

  // Bluff potential: value of assigning a weak card to a high-value lane as a bluff
  const bluffPotential = calculateBluffPotential(card, lane, laneIndex, state, profile) * weights.cardBluff;

  return strengthValue + tacticValue + synergyBonus - conservationPenalty + bluffPotential;
}

/**
 * Calculate the tactical value of a card in a lane context.
 */
function calculateTacticValue(
  card: Card,
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
  style: Style,
  profile: DifficultyProfile,
): number {
  if (!card.tacticEffect) return 0;

  const effectType = card.tacticEffect.effectType;
  const baseValue = TACTIC_BASE_VALUE[effectType] ?? 2;
  const mult = getTacticMultiplier(effectType, style, profile);

  let situationalBonus = 0;

  switch (effectType) {
    case 'sabotage': {
      // More valuable when opponents have strong presence in this lane
      const lane = state.lanes[laneIndex];
      const opponentStrength = Object.entries(lane.totalStrengthPerPlayer)
        .filter(([pid]) => parseInt(pid) !== playerId)
        .reduce((sum, [, str]) => sum + str, 0);
      situationalBonus = opponentStrength * 0.5;
      break;
    }
    case 'shield': {
      // More valuable on high-value lanes or lanes we're winning
      const lane = state.lanes[laneIndex];
      situationalBonus = lane.objective.vpValue * 0.5;
      break;
    }
    case 'reinforce': {
      // More valuable when we need to win a contested lane
      situationalBonus = (state.currentRound / 12) * 2; // More valuable late-game
      break;
    }
    case 'spy': {
      // More valuable in early rounds when info matters more
      situationalBonus = Math.max(0, 3 - state.currentRound * 0.3);
      break;
    }
    case 'ambush': {
      // More valuable in late rounds when every VP matters
      situationalBonus = Math.max(0, state.currentRound * 0.3 - 2);
      break;
    }
    case 'retreat': {
      // More valuable when being attacked (opponent presence high)
      const opponentCount = state.players.filter(
        p => p.id !== playerId && p.isConnected,
      ).length;
      situationalBonus = opponentCount * 0.3;
      break;
    }
    case 'bluff': {
      // Value determined by bluff potential (handled separately)
      break;
    }
  }

  return (baseValue * mult) + situationalBonus;
}

/**
 * Calculate synergy bonus — how well this card works with other planned assignments.
 */
function calculateSynergyBonus(
  card: Card,
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
): number {
  const player = state.players[playerId];
  let synergy = 0;

  // Check existing planned assignments for this player
  const existingInLane = player.currentAssignments.filter(a => a.laneIndex === laneIndex);

  for (const existing of existingInLane) {
    const existingCard = player.hand.find(c => c.id === existing.cardId);
    if (!existingCard) continue;

    // Unit + Reinforce = natural synergy
    if (card.type === 'unit' && existingCard.tacticEffect?.effectType === 'reinforce') {
      synergy += 2;
    }
    // Unit + Shield = protect strength
    if (card.type === 'unit' && existingCard.tacticEffect?.effectType === 'shield') {
      synergy += 1;
    }
    // Sabotage + Ambush = weaken then VP deny
    if (
      card.tacticEffect?.effectType === 'ambush' &&
      existingCard.tacticEffect?.effectType === 'sabotage'
    ) {
      synergy += 3;
    }
  }

  return synergy;
}

/**
 * Calculate conservation penalty — penalizes using overly strong cards
 * when weaker ones would achieve the same goal.
 */
function calculateConservationPenalty(
  card: Card,
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
  handManagementLevel: number,
): number {
  if (handManagementLevel === 0) return 0; // No conservation awareness

  const player = state.players[playerId];
  const lane = state.lanes[laneIndex];

  // Only unit/objective cards have strength worth conserving
  if (card.type !== 'unit' && card.type !== 'objective') return 0;

  // Calculate how much strength we already have in this lane from current assignments
  const existingStrength = player.currentAssignments
    .filter(a => a.laneIndex === laneIndex)
    .reduce((sum, a) => {
      const c = player.hand.find(h => h.id === a.cardId);
      return sum + (c?.strength ?? 0);
    }, 0);

  // How much is needed to win? (estimate)
  const maxOpponentStrength = Math.max(
    ...Object.entries(lane.totalStrengthPerPlayer)
      .filter(([pid]) => parseInt(pid) !== playerId)
      .map(([, str]) => str),
    0,
  );
  const neededStrength = Math.max(0, maxOpponentStrength - existingStrength + 1);

  // If this card overshoots by a lot, apply penalty
  const overshoot = card.strength + existingStrength - neededStrength;

  if (overshoot > 2) {
    return (overshoot - 2) * (handManagementLevel * 0.5);
  }

  return 0;
}

/**
 * Calculate bluff potential — value of placing a weak card on a high-value lane
 * to mislead opponents about our strength distribution.
 */
function calculateBluffPotential(
  card: Card,
  _lane: unknown,
  _laneIndex: LaneIndex,
  _state: GameState,
  profile: DifficultyProfile,
): number {
  if (profile.bluffProbability <= 0) return 0;

  // Bluff potential is higher for low-strength cards on high-value lanes
  if (card.type === 'tactic' && card.tacticEffect?.effectType === 'bluff') {
    // Bluff tactic card on a high-value lane — high bluff potential
    return 5;
  }

  // Low-strength unit cards have moderate bluff potential
  if ((card.type === 'unit' || card.type === 'objective') && card.strength <= 2) {
    return 2;
  }

  return 0;
}

/**
 * Calculate style bias — a direct bonus for card-lane pairs that match
 * the bot's strategic personality.
 *
 * This implements the `styleBias * 0.2` term in totalScore.
 *
 * @returns A bias value (positive = style prefers this, negative = style avoids)
 */
function calculateStyleBias(
  card: Card,
  laneIndex: LaneIndex,
  state: GameState,
  playerId: PlayerId,
  style: Style,
  isTrailing: boolean,
): number {
  const lane = state.lanes[laneIndex];
  const player = state.players[playerId];
  const laneVp = lane.objective.vpValue;
  const laneBonus = lane.objective.bonusVp;

  switch (style) {
    case 'aggressive': {
      // Prefer high-strength cards on high-VP lanes
      return card.strength * laneVp * 0.5;
    }

    case 'defensive': {
      // Prefer even spread — penalize concentrating strength
      const existingInLane = player.currentAssignments.filter(a => a.laneIndex === laneIndex).length;
      return -existingInLane * 1.5;
    }

    case 'balanced': {
      // Neutral — no bias
      return 0;
    }

    case 'disruptive': {
      // Target lanes where the leader has presence
      const leader = findLeader(state, playerId);
      if (leader !== null) {
        const leaderLaneStrength = lane.totalStrengthPerPlayer[leader] ?? 0;
        // Higher bias when the leader is strong in this lane
        return leaderLaneStrength * 0.8;
      }
      return 0;
    }

    case 'objective-focused': {
      // Prefer lanes with bonus objectives
      return laneBonus * 3;
    }

    case 'comeback-focused': {
      if (isTrailing) {
        // Aggressive when trailing
        return card.strength * laneVp * 0.8;
      } else {
        // Conservative when leading
        return -card.strength * 0.3;
      }
    }

    case 'team-support': {
      if (state.mode === '2v2') {
        // Support teammate's lanes
        const teammate = state.players.find(
          p => p.teamId === player.teamId && p.id !== playerId,
        );
        if (teammate) {
          const teammateInLane = teammate.currentAssignments.filter(
            a => a.laneIndex === laneIndex,
          ).length;
          return teammateInLane * laneVp * 2;
        }
      }
      // FFA fallback to balanced
      return 0;
    }

    default:
      return 0;
  }
}

/**
 * Find the player ID of the current leader (highest VP).
 * Returns null in case of tie or no connected opponents.
 */
function findLeader(state: GameState, playerId: PlayerId): PlayerId | null {
  const opponents = state.players.filter(p => p.id !== playerId && p.isConnected);
  if (opponents.length === 0) return null;

  let leader: PlayerState = opponents[0];
  for (const opp of opponents) {
    if (opp.vpTotal > leader.vpTotal) {
      leader = opp;
    }
  }

  // If tied at 0, no clear leader
  if (leader.vpTotal === 0) return null;

  return leader.id;
}

/**
 * Determine if the given player is currently trailing.
 */
function isPlayerTrailing(state: GameState, playerId: PlayerId): boolean {
  const player = state.players[playerId];

  if (state.mode === '2v2') {
    const teamId = player.teamId;
    const teamVp = state.players
      .filter(p => p.teamId === teamId)
      .reduce((sum, p) => sum + p.vpTotal, 0);
    const otherTeamVp = state.players
      .filter(p => p.teamId !== teamId && p.isConnected)
      .reduce((sum, p) => sum + p.vpTotal, 0);
    return teamVp < otherTeamVp;
  }

  // FFA: check if player is in the bottom half
  const sorted = [...state.players]
    .filter(p => p.isConnected)
    .sort((a, b) => a.vpTotal - b.vpTotal);

  if (sorted.length <= 1) return false;
  const medianIdx = Math.floor(sorted.length / 2);
  return sorted.indexOf(player) <= medianIdx && player.vpTotal < sorted[sorted.length - 1].vpTotal;
}

// ─── Noise Generation ──────────────────────────────────────────

/**
 * Add noise to a score value based on difficulty range.
 *
 * @param score - The base score
 * @param noiseRange - Fraction of max perturbation (±)
 * @returns Score with noise added
 */
function addNoise(score: number, noiseRange: number): number {
  if (noiseRange <= 0) return score;

  const maxPerturbation = Math.max(Math.abs(score) * noiseRange, noiseRange * 5);
  const perturbation = (Math.random() * 2 - 1) * maxPerturbation;
  return score + perturbation;
}

/**
 * Opportunistically apply a bluff: replace one of the bot's assignments
 * with a weak card on a high-value lane to mislead opponents.
 *
 * @param assignments - Current planned assignments
 * @param hand - Available cards in hand
 * @param state - Game state
 * @param playerId - The bot player
 * @param profile - Difficulty profile
 * @returns Potentially modified assignments
 */
function maybeApplyBluff(
  assignments: CardAssignment[],
  hand: Card[],
  state: GameState,
  playerId: PlayerId,
  profile: DifficultyProfile,
): CardAssignment[] {
  if (profile.bluffProbability <= 0) return assignments;
  if (Math.random() > profile.bluffProbability) return assignments;
  if (assignments.length < 1) return assignments;

  // Find the highest-value active lane
  const activeLanes = state.lanes.filter(l => l.isActive);
  if (activeLanes.length === 0) return assignments;

  const highestValueLane = activeLanes.reduce((best, curr) =>
    curr.objective.vpValue + curr.objective.bonusVp >
    best.objective.vpValue + best.objective.bonusVp
      ? curr
      : best,
  );

  // Find a weak card to bluff with (lowest strength, preferably a bluff tactic)
  const weakCards = hand
    .filter(c => c.strength === 0 || c.strength <= 1)
    .sort((a, b) => a.strength - b.strength);

  if (weakCards.length === 0) return assignments;

  // Find an existing assignment on a different lane to replace
  const nonTargetAssignments = assignments.filter(a => a.laneIndex !== highestValueLane.index);
  if (nonTargetAssignments.length === 0) return assignments;

  // Replace one non-target assignment with the bluff
  const replaceIdx = assignments.indexOf(nonTargetAssignments[0]);
  const updated = [...assignments];
  updated[replaceIdx] = { cardId: weakCards[0].id, laneIndex: highestValueLane.index };

  return updated;
}

/**
 * Apply comeback optimization: ensures comeback cards are used at the right time.
 */
function applyComebackOptimization(
  assignments: CardAssignment[],
  hand: Card[],
  state: GameState,
  profile: DifficultyProfile,
): CardAssignment[] {
  // Find comeback cards in hand
  const comebackCards = hand.filter(c => c.isComeback);
  if (comebackCards.length === 0) return assignments;

  const isComebackCardAssigned = assignments.some(a => {
    const card = hand.find(c => c.id === a.cardId);
    return card?.isComeback;
  });

  if (isComebackCardAssigned) return assignments;
  if (profile.comebackOptimization === 0) {
    // Easy: play immediately if possible
    const laneIndex = assignments.length > 0 ? assignments[0].laneIndex : 0;
    return [...assignments, { cardId: comebackCards[0].id, laneIndex }];
  }

  // Higher difficulties: evaluate if this is a good round to play comeback cards
  const round = state.currentRound;
  const maxRounds = state.maxRounds;
  const remainingRounds = maxRounds - round;

  // Check if any assignment is on a high-value lane
  const highValueAssignments = assignments.filter(a => {
    const lane = state.lanes[a.laneIndex];
    return lane && lane.objective.vpValue + lane.objective.bonusVp >= 3;
  });

  if (profile.comebackOptimization >= 2) {
    // Save for best opportunity: high-value lane in mid-to-late game
    if (highValueAssignments.length > 0 && round >= 3 && remainingRounds <= 6) {
      // Good opportunity
      return [
        ...assignments,
        { cardId: comebackCards[0].id, laneIndex: highValueAssignments[0].laneIndex },
      ];
    }
  } else {
    // Basic: play within 2 rounds if possible
    if (highValueAssignments.length > 0) {
      return [
        ...assignments,
        { cardId: comebackCards[0].id, laneIndex: highValueAssignments[0].laneIndex },
      ];
    }
  }

  return assignments;
}

/**
 * Determine how many cards the bot should assign this round.
 */
function determineCardCount(
  handSize: number,
  state: GameState,
  _playerId: PlayerId,
  profile: DifficultyProfile,
  style: Style,
  isTrailing: boolean,
): number {
  if (handSize < 1) return 0;

  const maxLanes = state.lanes.filter(l => l.isActive).length;
  const maxCards = Math.min(handSize, maxLanes * 3); // 3 cards max per lane, but practically limited by hand

  let desiredCount: number;

  if (style === 'aggressive' || (style === 'comeback-focused' && isTrailing)) {
    desiredCount = Math.min(handSize, 4);
  } else if (style === 'defensive') {
    desiredCount = Math.min(handSize, Math.max(1, Math.ceil(maxLanes / 2)));
  } else {
    desiredCount = Math.min(handSize, profile.defaultCardCount);
  }

  // Late game: assign more cards to maximize scoring
  if (state.currentRound >= state.maxRounds - 3) {
    desiredCount = Math.min(handSize, 4);
  }

  return Math.min(desiredCount, maxCards);
}

// ─── BotController Implementation ──────────────────────────────

/**
 * BotController implementation using weighted heuristic evaluation.
 *
 * The decision process:
 * 1. Clone the game state for safe read-only access
 * 2. Get player's hand, active lanes, and standings
 * 3. For each card × lane pair, calculate totalScore using heuristic formulas
 * 4. Greedily select the highest-scoring pairs, respecting lane limits
 * 5. Apply difficulty-based noise and bluffing
 * 6. Apply comeback optimization if applicable
 * 7. Return the SubmitAction
 */
class BotControllerImpl implements BotController {
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = { ...config };
  }

  getConfig(): BotConfig {
    return { ...this.config };
  }

  decide(
    gameState: GameState,
    playerId: PlayerId,
    _events: GameEventEmitter,
  ): SubmitAction {
    // 1. Clone state for safe read-only analysis
    const state = cloneGameState(gameState);
    const player = state.players[playerId];

    // 2. Edge case: hand is empty — submit minimum valid assignment
    if (!player || player.hand.length === 0) {
      return {
        type: 'submit_assignments',
        playerId,
        assignments: player?.currentAssignments ?? [],
      };
    }

    // 3. Get profiles
    const profile = DIFFICULTY_PROFILES[this.config.difficulty];
    const weights = resolveStyleWeights(this.config.style);
    const hasSubmitted = player.hasSubmitted;

    if (hasSubmitted) {
      return {
        type: 'submit_assignments',
        playerId,
        assignments: player.currentAssignments,
      };
    }

    // 4. Determine context
    const standings = getStandings(state);
    const trailing = isPlayerTrailing(state, playerId);
    const activeLanes = state.lanes.filter(l => l.isActive);
    const hand = [...player.hand];

    // 5. Random assignment chance (Easy difficulty)
    if (Math.random() < profile.randomAssignmentChance) {
      return {
        type: 'submit_assignments',
        playerId,
        assignments: makeRandomAssignments(hand, activeLanes, profile.defaultCardCount),
      };
    }

    // 6. Determine how many cards to assign
    const cardCount = determineCardCount(
      hand.length,
      state,
      playerId,
      profile,
      this.config.style,
      trailing,
    );

    if (cardCount === 0) {
      return {
        type: 'submit_assignments',
        playerId,
        assignments: [],
      };
    }

    // 7. Generate scored assignments
    const scored: ScoredAssignment[] = [];

    for (const card of hand) {
      for (const lane of activeLanes) {
        const laneScore = calculateLaneScore(
          lane.index,
          state,
          playerId,
          weights,
          standings,
          trailing,
        );

        const cardScore = calculateCardScore(
          card,
          lane.index,
          state,
          playerId,
          weights,
          this.config.style,
          profile,
        );

        const styleBias = calculateStyleBias(
          card,
          lane.index,
          state,
          playerId,
          this.config.style,
          trailing,
        );

        const noise = addNoise(0, profile.noiseRange);

        // totalScore = laneScore * 0.4 + cardScore * 0.3 + styleBias * 0.2 + noise * 0.1
        const totalScore =
          laneScore * 0.4 + cardScore * 0.3 + styleBias * 0.2 + noise * 0.1;

        scored.push({
          cardId: card.id,
          laneIndex: lane.index,
          totalScore,
        });
      }
    }

    // 8. Sort descending by score
    scored.sort((a, b) => b.totalScore - a.totalScore);

    // 9. Greedily select assignments
    const selectedAssignments: CardAssignment[] = [];
    const usedCards = new Set<CardId>();
    const laneCardCount = new Map<LaneIndex, number>();

    for (const candidate of scored) {
      if (selectedAssignments.length >= cardCount) break;
      if (usedCards.has(candidate.cardId)) continue;

      const currentLaneCount = laneCardCount.get(candidate.laneIndex) ?? 0;
      if (currentLaneCount >= 3) continue; // Max 3 cards per lane

      selectedAssignments.push({
        cardId: candidate.cardId,
        laneIndex: candidate.laneIndex,
      });
      usedCards.add(candidate.cardId);
      laneCardCount.set(candidate.laneIndex, currentLaneCount + 1);
    }

    // 10. Apply bluff
    const remainingHand = hand.filter(c => !usedCards.has(c.id));
    const withBluff = maybeApplyBluff(
      selectedAssignments,
      remainingHand,
      state,
      playerId,
      profile,
    );

    // 11. Apply comeback optimization
    const finalAssignments = applyComebackOptimization(
      withBluff,
      hand,
      state,
      profile,
    );

    return {
      type: 'submit_assignments',
      playerId,
      assignments: finalAssignments,
    };
  }
}

// ─── Random Assignment Fallback ────────────────────────────────

/**
 * Generate a random valid assignment for fallback (Easy difficulty or edge cases).
 */
function makeRandomAssignments(
  hand: Card[],
  activeLanes: GameState['lanes'],
  count: number,
): CardAssignment[] {
  const assignments: CardAssignment[] = [];
  const usedCards = new Set<CardId>();

  const laneIndices = activeLanes.map(l => l.index);

  if (laneIndices.length === 0) return [];
  if (hand.length === 0) return [];

  const assignCount = Math.min(count, hand.length);

  for (let i = 0; i < assignCount; i++) {
    // Pick a random unused card
    const availableCards = hand.filter(c => !usedCards.has(c.id));
    if (availableCards.length === 0) break;

    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    const laneIndex = laneIndices[Math.floor(Math.random() * laneIndices.length)];

    assignments.push({ cardId: card.id, laneIndex });
    usedCards.add(card.id);
  }

  return assignments;
}

// ─── Factory ───────────────────────────────────────────────────

/**
 * Create a BotController instance with the given configuration.
 *
 * @param config - Bot configuration (difficulty + style)
 * @returns A BotController instance
 *
 * @example
 * ```typescript
 * const bot = createBot({ difficulty: 'hard', style: 'aggressive' });
 * const action = bot.decide(gameState, 0, events);
 * ```
 */
export function createBot(config: BotConfig): BotController {
  return new BotControllerImpl(config);
}

// ─── Utility Export ────────────────────────────────────────────

/**
 * Default bot configuration used when no explicit config is provided.
 */
export const DEFAULT_BOT_CONFIG: BotConfig = {
  difficulty: 'normal',
  style: 'balanced',
};

/**
 * Get the difficulty profile for a given difficulty level.
 * Exposed for testing and analysis.
 */
export function getDifficultyProfile(difficulty: Difficulty): Readonly<DifficultyProfile> {
  return { ...DIFFICULTY_PROFILES[difficulty] };
}

/**
 * Get the resolved style weights for a given style.
 * Exposed for testing and analysis.
 */
export function getStyleWeights(style: Style): StyleWeights {
  return resolveStyleWeights(style);
}

/**
 * Validate a BotConfig object.
 * Returns an error string if invalid, or null if valid.
 */
export function validateBotConfig(config: unknown): string | null {
  if (!config || typeof config !== 'object') {
    return 'BotConfig must be an object';
  }

  const c = config as Record<string, unknown>;

  if (!c.difficulty || typeof c.difficulty !== 'string') {
    return 'BotConfig.difficulty is required and must be a string';
  }

  const validDifficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert'];
  if (!validDifficulties.includes(c.difficulty as Difficulty)) {
    return `BotConfig.difficulty must be one of: ${validDifficulties.join(', ')}`;
  }

  if (!c.style || typeof c.style !== 'string') {
    return 'BotConfig.style is required and must be a string';
  }

  const validStyles: Style[] = [
    'aggressive', 'defensive', 'balanced', 'disruptive',
    'objective-focused', 'comeback-focused', 'team-support',
  ];
  if (!validStyles.includes(c.style as Style)) {
    return `BotConfig.style must be one of: ${validStyles.join(', ')}`;
  }

  return null;
}
