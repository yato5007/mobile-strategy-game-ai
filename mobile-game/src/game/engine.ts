/**
 * Core Game Logic Engine — Game Engine
 *
 * All game logic: initialization, round lifecycle, lane resolution,
 * tactic effects, comeback mechanics, active play enforcement.
 */

import type {
  GameState,
  GameConfig,
  PlayerState,
  LaneState,
  Card,
  CardAssignment,
  PlayerId,
  TeamId,
  LaneIndex,
  Standing,
  GameResult,
  ValidationResult,
  GameEventEmitter,
  GameEvent,
  TacticEffectType,
  RoundPhase,
} from './types';

import type { GameEventHandler } from './types';

import {
  MAX_ROUNDS,
  LANE_UNLOCK_SCHEDULE,
  MAX_CARDS_PER_LANE,
  VP_STANDARD_LANE,
  VP_HIGH_VALUE_LANE,
  PENALTY_SKIP_VP,
  COMEBACK_START_ROUND,
  TACTIC_RESOLUTION_ORDER,
  PLANNING_TIME,
} from './constants';

import {
  createDeck,
  shuffleDeck,
  drawStartingHand,
  drawTurnCards,
  drawComebackCard,
  drawComebackDraw,
  discardCards,
  resetCardIdCounter,
  pickRandomRotatingCards,
} from './cards';

import { createEventEmitter } from './events';
import { checkAchievements } from './achievements';
import { getLaneObjectiveForRound, getActiveLaneCount } from './state';

// ─── Internal Helpers ──────────────────────────────────────────

let _gameCounter = 0;

/** Generate a unique game ID */
function generateGameId(): string {
  return `game-${++_gameCounter}-${Date.now()}`;
}

/** Get the team for a player based on game mode */
function getTeamId(playerId: PlayerId, mode: 'ffa' | '2v2'): TeamId {
  if (mode === '2v2') {
    return playerId < 2 ? 0 : 1;
  }
  // In FFA, each player is their own "team"
  return playerId as TeamId;
}

/** Get all player IDs on a team */
function getTeamPlayerIds(teamId: TeamId, mode: 'ffa' | '2v2'): PlayerId[] {
  if (mode === '2v2') {
    return teamId === 0 ? [0, 1] : [2, 3];
  }
  return [teamId as PlayerId];
}

/** Get a mutable reference to a player's state */
function getPlayer(game: GameState, playerId: PlayerId): PlayerState {
  return game.players[playerId];
}

/** Check if a player is in a trailing position for comeback bonuses */
function isTrailingPlayer(game: GameState, playerId: PlayerId): boolean {
  if (game.currentRound < COMEBACK_START_ROUND) return false;

  const mode = game.mode;
  if (mode === 'ffa') {
    const sorted = [...game.players]
      .filter(p => p.isConnected)
      .sort((a, b) => a.vpTotal - b.vpTotal);
    if (sorted.length === 0) return false;
    const lowestVp = sorted[0].vpTotal;
    return getPlayer(game, playerId).vpTotal === lowestVp && sorted.some(p => p.vpTotal > lowestVp);
  } else {
    // 2v2: check team scores
    const team0Vp = game.players[0].vpTotal + game.players[1].vpTotal;
    const team1Vp = game.players[2].vpTotal + game.players[3].vpTotal;
    const playerTeam = getTeamId(playerId, '2v2');
    const myTeamVp = playerTeam === 0 ? team0Vp : team1Vp;
    const otherTeamVp = playerTeam === 0 ? team1Vp : team0Vp;
    return myTeamVp < otherTeamVp;
  }
}

/** For 2v2: get combined team strength for a lane */
function getTeamStrengthInLane(
  game: GameState,
  laneIndex: LaneIndex,
  teamId: TeamId,
): number {
  const playerIds = getTeamPlayerIds(teamId, '2v2');
  let total = 0;
  for (const pid of playerIds) {
    total += game.lanes[laneIndex].totalStrengthPerPlayer[pid] ?? 0;
  }
  return total;
}

/** For 2v2: get combined team VP */
function getTeamVp(game: GameState, teamId: TeamId): number {
  const playerIds = getTeamPlayerIds(teamId, '2v2');
  return playerIds.reduce((sum, pid) => sum + (game.players[pid]?.vpTotal ?? 0), 0);
}

// ─── Random ────────────────────────────────────────────────────

/** Simple seeded random (mulberry32) for deterministic testing */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRandomFn(seed?: string): () => number {
  if (seed) {
    let numSeed = 0;
    for (let i = 0; i < seed.length; i++) {
      numSeed = (numSeed * 31 + seed.charCodeAt(i)) | 0;
    }
    return mulberry32(numSeed);
  }
  return Math.random;
}

// ─── Game Creation ─────────────────────────────────────────────

/**
 * Create a new game from config.
 * Pure function — returns initial GameState.
 */
export function createGame(config: GameConfig): { game: GameState; events: GameEventEmitter } {
  resetCardIdCounter();
  const events = createEventEmitter();
  const rand = createRandomFn(config.randomSeed);
  const maxRounds = config.maxRounds ?? MAX_ROUNDS;

  // Create decks and hands for each player
  const rotatingChoices = pickRandomRotatingCards(rand);
  const players: [PlayerState, PlayerState, PlayerState, PlayerState] = [null!, null!, null!, null!];

  for (let i = 0; i < 4; i++) {
    let deck = createDeck(rotatingChoices);
    deck = shuffleDeck(deck, rand);
    const { hand, deck: remainingDeck } = drawStartingHand(deck, rand);

    players[i] = {
      id: i as PlayerId,
      teamId: getTeamId(i as PlayerId, config.mode),
      hand,
      discardPile: [],
      deck: remainingDeck,
      vpTotal: 0,
      laneWins: 0,
      firstScoreRound: null,
      currentAssignments: [],
      hasSubmitted: false,
      isConnected: true,
      isBot: config.playerSlots[i],
      earnedAchievements: [],
    };
  }

  // Create lanes
  const activeLaneCount = getActiveLaneCount(1);
  const lanes: LaneState[] = [];
  for (let i = 0; i < 5; i++) {
    const isActive = i < activeLaneCount;
    lanes.push({
      index: i as LaneIndex,
      isActive,
      objective: getLaneObjectiveForRound(i as LaneIndex, 1, rand),
      totalStrengthPerPlayer: { 0: 0, 1: 0, 2: 0, 3: 0 },
      winner: null,
      isTie: false,
      vpAwarded: { 0: 0, 1: 0, 2: 0, 3: 0 },
      assignments: { 0: [], 1: [], 2: [], 3: [] },
      streak: 0,
      shieldedPlayers: [],
    });
  }

  const gameId = generateGameId();
  const game: GameState = {
    gameId,
    mode: config.mode,
    maxRounds,
    currentRound: 1,
    gamePhase: 'in-progress',
    roundPhase: 'planning',
    players,
    lanes,
    awardedAchievements: [],
    firstBloodAwarded: false,
    roundsCompleted: 0,
    phaseTimestamps: {
      planningStartedAt: Date.now(),
    },
  };

  events.emit({
    type: 'GameStarted',
    payload: { gameId, mode: config.mode, players: [0, 1, 2, 3] },
  });
  events.emit({
    type: 'RoundStarted',
    payload: { roundNumber: 1, phase: 'planning' },
  });
  events.emit({
    type: 'PlanningPhase',
    payload: { roundNumber: 1, deadline: PLANNING_TIME },
  });

  return { game, events };
}

// ─── Validation ────────────────────────────────────────────────

/**
 * Validate a player's assignment submission.
 * Returns valid + error messages.
 */
export function validateAssignment(
  game: GameState,
  playerId: PlayerId,
  assignments: CardAssignment[],
): ValidationResult {
  const errors: string[] = [];
  const player = getPlayer(game, playerId);

  if (!player.isConnected) {
    errors.push('Player is not connected');
    return { valid: false, errors };
  }

  if (game.roundPhase !== 'planning') {
    errors.push('Not in planning phase');
    return { valid: false, errors };
  }

  // Must assign at least 1 card
  if (assignments.length === 0) {
    errors.push('Must assign at least 1 card');
    return { valid: false, errors };
  }

  // Check lane limits
  const laneCounts = new Map<LaneIndex, number>();
  for (const a of assignments) {
    laneCounts.set(a.laneIndex, (laneCounts.get(a.laneIndex) ?? 0) + 1);
  }
  for (const [laneIdx, count] of laneCounts) {
    if (count > MAX_CARDS_PER_LANE) {
      errors.push(`Cannot assign more than ${MAX_CARDS_PER_LANE} cards to lane ${laneIdx}`);
    }
    // Check lane is active
    const lane = game.lanes[laneIdx];
    if (!lane || !lane.isActive) {
      errors.push(`Lane ${laneIdx} is not active`);
    }
  }

  // Check all cards exist in player's hand
  const handCardIds = new Set(player.hand.map(c => c.id));
  for (const a of assignments) {
    if (!handCardIds.has(a.cardId)) {
      errors.push(`Card ${a.cardId} is not in player's hand`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Assignment Submission ─────────────────────────────────────

/**
 * Submit a player's card assignments for the current round.
 * Mutates the game state and emits events.
 */
export function submitAssignments(
  game: GameState,
  playerId: PlayerId,
  assignments: CardAssignment[],
  events: GameEventEmitter,
): ValidationResult {
  const validation = validateAssignment(game, playerId, assignments);
  if (!validation.valid) {
    return validation;
  }

  const player = getPlayer(game, playerId);

  // Record assignments
  player.currentAssignments = assignments;
  player.hasSubmitted = true;

  // Remove assigned cards from hand (they go to lane assignments, NOT discard pile)
  const assignedCardIds = new Set(assignments.map(a => a.cardId));
  const remainingHand: Card[] = [];
  const assignedCards: Card[] = [];

  for (const card of player.hand) {
    if (assignedCardIds.has(card.id)) {
      assignedCards.push(card);
    } else {
      remainingHand.push(card);
    }
  }

  player.hand = remainingHand;

  // Place cards in lanes
  for (const card of assignedCards) {
    // Find the lane this card was assigned to
    const assignment = assignments.find(a => a.cardId === card.id);
    if (assignment) {
      game.lanes[assignment.laneIndex].assignments[playerId].push(card);
    }
  }

  events.emit({
    type: 'PlayerSubmitted',
    payload: { playerId, assignmentCount: assignments.length },
  });

  return { valid: true, errors: [] };
}

/** Find a card by ID in an array */
function findCardById(cardId: string, cards: Card[]): Card | undefined {
  return cards.find(c => c.id === cardId);
}

// ─── Planning Completion ───────────────────────────────────────

/**
 * Check if all connected players have submitted their assignments.
 */
export function isPlanningComplete(game: GameState): boolean {
  return game.players
    .filter(p => p.isConnected)
    .every(p => p.hasSubmitted);
}

/**
 * Force-submit empty assignments for any player who hasn't submitted.
 * Used when planning phase times out.
 */
export function forceSubmitRemaining(game: GameState): void {
  for (const player of game.players) {
    if (player.isConnected && !player.hasSubmitted) {
      player.currentAssignments = [];
      player.hasSubmitted = true;
    }
  }
}

// ─── Reveal Phase ──────────────────────────────────────────────

/**
 * Transition to reveal phase.
 * All assignments become visible.
 */
export function revealAssignments(game: GameState, events: GameEventEmitter): void {
  game.roundPhase = 'reveal';
  game.phaseTimestamps.revealStartedAt = Date.now();

  // Process spy effects (pre-resolution, private info)
  processSpyEffects(game, events);

  events.emit({
    type: 'RevealPhase',
    payload: {
      roundNumber: game.currentRound,
      assignments: Object.fromEntries(
        game.players.map(p => [p.id, p.currentAssignments]),
      ) as Record<PlayerId, CardAssignment[]>,
    },
  });
}

/** Process Spy tactic effects — emit private info to the spy player */
function processSpyEffects(game: GameState, events: GameEventEmitter): void {
  for (const player of game.players) {
    for (const assignment of player.currentAssignments) {
      const lane = game.lanes[assignment.laneIndex];
      const card = lane.assignments[player.id]?.find(c => c.id === assignment.cardId);
      if (card?.tacticEffect?.effectType === 'spy') {
        const targetId = card.tacticEffect.targetPlayerId ?? findBestSpyTarget(game, player.id);
        if (targetId !== null && targetId !== undefined) {
          const target = getPlayer(game, targetId);
          const revealedCards = target.hand.slice(0, 2);
          events.emit({
            type: 'SpyInfo',
            payload: {
              playerId: player.id,
              targetPlayerId: targetId,
              revealedCards,
            },
          });
        }
      }
    }
  }
}

/** Find the most threatening opponent to spy on (highest VP or hand size) */
function findBestSpyTarget(game: GameState, spyerId: PlayerId): PlayerId {
  let bestId: PlayerId = spyerId === 0 ? 1 : 0;
  let bestScore = -1;
  for (const p of game.players) {
    if (p.id === spyerId || !p.isConnected) continue;
    const score = p.vpTotal + p.hand.length * 0.1;
    if (score > bestScore) {
      bestScore = score;
      bestId = p.id;
    }
  }
  return bestId;
}

// ─── Resolution Phase ──────────────────────────────────────────

/**
 * Execute the resolution phase — resolve all lanes.
 */
export function resolveRound(game: GameState, events: GameEventEmitter): void {
  game.roundPhase = 'resolution';
  game.phaseTimestamps.resolveStartedAt = Date.now();

  events.emit({
    type: 'ResolutionPhase',
    payload: { roundNumber: game.currentRound },
  });

  // Apply active play penalties first
  applySkipPenalties(game, events);

  // Calculate base strengths per lane
  calculateLaneStrengths(game);

  // Process tactic effects in order
  processTacticEffects(game);

  // Resolve each lane
  for (const lane of game.lanes) {
    if (!lane.isActive) continue;
    resolveLane(game, lane.index, events);
  }

  // Process Ambush effects (after all lanes resolved)
  processAmbushEffects(game, events);
}

/** Apply penalties for players who submitted 0 cards */
function applySkipPenalties(game: GameState, events: GameEventEmitter): void {
  for (const player of game.players) {
    if (player.currentAssignments.length === 0 && player.isConnected) {
      player.vpTotal = Math.max(0, player.vpTotal - PENALTY_SKIP_VP);
      events.emit({
        type: 'PlayerPenalized',
        payload: {
          playerId: player.id,
          reason: 'No cards assigned',
          vpLoss: PENALTY_SKIP_VP,
        },
      });
    }
  }
}

/** Calculate base strength per player per lane from unit cards */
function calculateLaneStrengths(game: GameState): void {
  for (const lane of game.lanes) {
    if (!lane.isActive) continue;
    // Reset strengths
    for (let pid = 0; pid < 4; pid++) {
      lane.totalStrengthPerPlayer[pid as PlayerId] = 0;
    }

    // Sum unit card strengths (and objective cards, which act as units)
    for (const pidStr of Object.keys(lane.assignments)) {
      const pid = parseInt(pidStr) as PlayerId;
      const cards = lane.assignments[pid];
      for (const card of cards) {
        if (card.type === 'unit' || card.type === 'objective') {
          lane.totalStrengthPerPlayer[pid] += card.strength;
        }
      }
    }
  }
}

/** Process tactic effects in the defined resolution order */
function processTacticEffects(game: GameState): void {
  for (const effectType of TACTIC_RESOLUTION_ORDER) {
    if (effectType === 'spy') continue; // Already handled in reveal
    if (effectType === 'ambush') continue; // Handled after resolution

    for (const lane of game.lanes) {
      if (!lane.isActive) continue;
      processTacticEffectOnLane(game, lane, effectType);
    }
  }
}

/** Process a specific tactic effect type on a specific lane */
function processTacticEffectOnLane(
  game: GameState,
  lane: LaneState,
  effectType: TacticEffectType,
): void {
  for (const pidStr of Object.keys(lane.assignments)) {
    const pid = parseInt(pidStr) as PlayerId;
    const cards = lane.assignments[pid];

    for (const card of cards) {
      if (card.tacticEffect?.effectType !== effectType) continue;
      const effect = card.tacticEffect;
      const targetPid = effect.targetPlayerId ?? null;

      switch (effectType) {
        case 'retreat': {
          // Withdraw all units: set strength to 0, void targeting
          lane.totalStrengthPerPlayer[pid] = 0;
          // Mark that this player has retreated (remove from targeting)
          break;
        }
        case 'shield': {
          // Shield this lane for this player — block one sabotage
          if (!lane.shieldedPlayers.includes(pid)) {
            lane.shieldedPlayers.push(pid);
          }
          break;
        }
        case 'sabotage': {
          // Reduce opponent's strength
          const targetId = determineSabotageTarget(game, lane, pid, targetPid);
          if (targetId !== null && !isShielded(lane, targetId)) {
            const magnitude = effect.magnitude ?? 2;
            lane.totalStrengthPerPlayer[targetId] = Math.max(
              0,
              lane.totalStrengthPerPlayer[targetId] - magnitude,
            );
          }
          break;
        }
        case 'reinforce': {
          // Add strength to self
          const magnitude = effect.magnitude ?? 3;
          lane.totalStrengthPerPlayer[pid] += magnitude;
          break;
        }
        case 'bluff': {
          // Bluff has no mechanical effect — it only reveals as deception
          // (strength contribution is 0, which is already accounted for)
          break;
        }
      }
    }
  }
}

/** Check if a player is shielded in a lane */
function isShielded(lane: LaneState, playerId: PlayerId): boolean {
  return lane.shieldedPlayers.includes(playerId);
}

/** Determine the target of a sabotage effect */
function determineSabotageTarget(
  game: GameState,
  lane: LaneState,
  attackerId: PlayerId,
  explicitTarget: PlayerId | null,
): PlayerId | null {
  if (explicitTarget !== null) return explicitTarget;

  // Auto-target: highest opponent in this lane
  let highestId: PlayerId | null = null;
  let highestStrength = -1;

  for (const pidStr of Object.keys(lane.totalStrengthPerPlayer)) {
    const pid = parseInt(pidStr) as PlayerId;
    if (pid === attackerId) continue;
    if (game.mode === '2v2') {
      // Don't sabotage teammate
      if (getTeamId(pid, '2v2') === getTeamId(attackerId, '2v2')) continue;
    }
    const strength = lane.totalStrengthPerPlayer[pid];
    if (strength > highestStrength) {
      highestStrength = strength;
      highestId = pid;
    }
  }

  return highestId;
}

/** Process ambush effects after all lanes resolved */
function processAmbushEffects(game: GameState, events: GameEventEmitter): void {
  for (const lane of game.lanes) {
    if (!lane.isActive) continue;
    if (lane.winner === null) continue; // Tie — no ambush trigger

    for (const pidStr of Object.keys(lane.assignments)) {
      const pid = parseInt(pidStr) as PlayerId;
      if (pid === lane.winner) continue;

      const cards = lane.assignments[pid];
      for (const card of cards) {
        if (card.tacticEffect?.effectType === 'ambush') {
          // Check if it's a "Last Stand" comeback card — special handling
          if (card.nameKey === 'card.last-stand') {
            const diff = Math.abs(
              lane.totalStrengthPerPlayer[pid] - lane.totalStrengthPerPlayer[lane.winner],
            );
            if (diff <= 2) {
              getPlayer(game, pid).vpTotal += 1;
              events.emit({
                type: 'VPAwarded',
                payload: { playerId: pid, vpAmount: 1, source: 'last-stand', laneIndex: lane.index },
              });
            }
          } else {
            // Standard Ambush: winner loses 1 VP
            const winner = getPlayer(game, lane.winner);
            winner.vpTotal = Math.max(0, winner.vpTotal - 1);
            events.emit({
              type: 'VPAwarded',
              payload: { playerId: lane.winner, vpAmount: -1, source: 'ambush', laneIndex: lane.index },
            });
          }
        }
      }
    }
  }
}

// ─── Lane Resolution ───────────────────────────────────────────

/**
 * Resolve a single lane — determine winner, award VP.
 */
function resolveLane(game: GameState, laneIndex: LaneIndex, events: GameEventEmitter): void {
  const lane = game.lanes[laneIndex];
  const mode = game.mode;

  // Calculate strengths (may be team-based in 2v2)
  let bestStrength: number;
  let bestPlayers: PlayerId[];

  if (mode === '2v2') {
    // Team-based resolution
    const teamStrengths = [
      getTeamStrengthInLane(game, laneIndex, 0),
      getTeamStrengthInLane(game, laneIndex, 1),
    ];
    bestStrength = Math.max(...teamStrengths);
    bestPlayers = [];

    // Determine which players are on the winning team
    const winningTeamId = teamStrengths[0] > teamStrengths[1] ? 0 : teamStrengths[1] > teamStrengths[0] ? 1 : null;
    if (winningTeamId !== null) {
      bestPlayers = getTeamPlayerIds(winningTeamId as TeamId, '2v2');
    }
    // If tie, bestPlayers remains empty (handled below)
  } else {
    // FFA resolution
    const strengths = lane.totalStrengthPerPlayer;
    bestStrength = Math.max(...Object.values(strengths));
    bestPlayers = [];

    for (const pidStr of Object.keys(strengths)) {
      const pid = parseInt(pidStr) as PlayerId;
      if (strengths[pid] === bestStrength) {
        bestPlayers.push(pid);
      }
    }
  }

  // Handle tie
  if (bestPlayers.length > 1) {
    lane.isTie = true;
    lane.winner = null;

    // Split VP equally (rounded down)
    const totalVp = lane.objective.vpValue;
    const splitVp = Math.floor(totalVp / bestPlayers.length);

    if (mode === '2v2') {
      // Award to both team members
      for (const pid of bestPlayers) {
        lane.vpAwarded[pid] = splitVp;
        getPlayer(game, pid).vpTotal += splitVp;
        if (splitVp > 0) {
          trackFirstScore(game, pid);
          events.emit({
            type: 'VPAwarded',
            payload: { playerId: pid, vpAmount: splitVp, source: 'lane-tie', laneIndex },
          });
        }
      }
    } else {
      for (const pid of bestPlayers) {
        lane.vpAwarded[pid] = splitVp;
        getPlayer(game, pid).vpTotal += splitVp;
        if (splitVp > 0) {
          trackFirstScore(game, pid);
          events.emit({
            type: 'VPAwarded',
            payload: { playerId: pid, vpAmount: splitVp, source: 'lane-tie', laneIndex },
          });
        }
      }
    }

    events.emit({
      type: 'LaneResolved',
      payload: {
        laneIndex,
        winner: null,
        isTie: true,
        vpAwarded: lane.vpAwarded,
        strengths: lane.totalStrengthPerPlayer,
      },
    });
    return;
  }

  // Clear winner
  if (bestPlayers.length === 1) {
    lane.winner = bestPlayers[0];
    lane.isTie = false;
    const winnerId = lane.winner;
    const vpAmount = lane.objective.vpValue;

    if (mode === '2v2') {
      const teamId = getTeamId(winnerId, '2v2');
      const teamPids = getTeamPlayerIds(teamId, '2v2');
      for (const pid of teamPids) {
        getPlayer(game, pid).vpTotal += vpAmount;
      }
      // Record lane win for tie-breaker (individual tracking)
      // Both team members get a lane win credited
      for (const pid of teamPids) {
        getPlayer(game, pid).laneWins += 1;
        trackFirstScore(game, pid);
      }
    } else {
      getPlayer(game, winnerId).vpTotal += vpAmount;
      getPlayer(game, winnerId).laneWins += 1;
      trackFirstScore(game, winnerId);
    }

    // Update lane streak
    lane.streak = (lane.streak || 0) + 1;

    // Award VP
    for (let pid = 0; pid < 4; pid++) {
      const p = pid as PlayerId;
      lane.vpAwarded[p] = p === winnerId || (mode === '2v2' && getTeamId(p, '2v2') === getTeamId(winnerId, '2v2'))
        ? vpAmount
        : 0;
    }

    events.emit({
      type: 'VPAwarded',
      payload: { playerId: winnerId, vpAmount, source: 'lane-win', laneIndex },
    });

    // Check objective bonus
    if (lane.objective.bonusVp > 0) {
      // Objective cards may qualify for bonus (simplified: just add bonus VP)
      if (mode === '2v2') {
        const teamId = getTeamId(winnerId, '2v2');
        const teamPids = getTeamPlayerIds(teamId, '2v2');
        for (const pid of teamPids) {
          getPlayer(game, pid).vpTotal += lane.objective.bonusVp;
        }
      } else {
        getPlayer(game, winnerId).vpTotal += lane.objective.bonusVp;
      }
      events.emit({
        type: 'VPAwarded',
        payload: { playerId: winnerId, vpAmount: lane.objective.bonusVp, source: 'objective-bonus', laneIndex },
      });
    }
  }

  events.emit({
    type: 'LaneResolved',
    payload: {
      laneIndex,
      winner: lane.winner,
      isTie: false,
      vpAwarded: lane.vpAwarded,
      strengths: lane.totalStrengthPerPlayer,
    },
  });
}

/** Track the first round a player scores VP (for tie-breaker) */
function trackFirstScore(game: GameState, playerId: PlayerId): void {
  const player = getPlayer(game, playerId);
  if (player.firstScoreRound === null) {
    player.firstScoreRound = game.currentRound;
  }
}

// ─── Cleanup Phase ─────────────────────────────────────────────

/**
 * Execute the cleanup phase.
 */
export function processCleanup(game: GameState, events: GameEventEmitter): void {
  game.roundPhase = 'cleanup';
  game.phaseTimestamps.cleanupStartedAt = Date.now();

  const rand = createRandomFn(); // Fresh randomness for draws

  // Process comeback bonuses
  processComebackBonuses(game, rand, events);

  // Draw replenishment cards
  for (const player of game.players) {
    if (!player.isConnected) continue;
    const result = drawTurnCards(player.deck, player.discardPile, rand);
    player.hand.push(...result.drawn);
    player.deck = result.deck;
    player.discardPile = result.discardPile;
  }

  // Check achievements
  const newAchievements = checkAchievements(game);
  for (const achievement of newAchievements) {
    game.awardedAchievements.push(achievement.id);
    events.emit({
      type: 'AchievementUnlocked',
      payload: {
        playerId: achievement.playerId,
        achievementId: achievement.id,
        vpReward: achievement.vpReward,
      },
    });
  }

  // Increment round counter
  game.currentRound += 1;
  game.roundsCompleted += 1;

  // Update lane states for next round
  resetLanesForNextRound(game, rand);

  // Check if game is over
  if (game.currentRound > game.maxRounds) {
    game.gamePhase = 'completed';
    const result = getGameResult(game);
    events.emit({
      type: 'GameOver',
      payload: {
        winner: result.winnerId,
        winningTeamId: result.winningTeamId,
        finalScores: Object.fromEntries(game.players.map(p => [p.id, p.vpTotal])) as Record<PlayerId, number>,
      },
    });
    events.emit({
      type: 'RoundComplete',
      payload: {
        roundNumber: game.roundsCompleted,
        scores: Object.fromEntries(game.players.map(p => [p.id, p.vpTotal])) as Record<PlayerId, number>,
      },
    });
  } else {
    // Start next round
    game.roundPhase = 'planning';
    game.phaseTimestamps.planningStartedAt = Date.now();

    events.emit({
      type: 'RoundComplete',
      payload: {
        roundNumber: game.roundsCompleted,
        scores: Object.fromEntries(game.players.map(p => [p.id, p.vpTotal])) as Record<PlayerId, number>,
      },
    });
    events.emit({
      type: 'RoundStarted',
      payload: { roundNumber: game.currentRound, phase: 'planning' },
    });
    events.emit({
      type: 'PlanningPhase',
      payload: { roundNumber: game.currentRound, deadline: PLANNING_TIME },
    });
  }
}

/** Process comeback bonuses for trailing players */
function processComebackBonuses(game: GameState, rand: () => number, events: GameEventEmitter): void {
  if (game.currentRound < COMEBACK_START_ROUND) return;

  for (const player of game.players) {
    if (!player.isConnected) continue;
    if (isTrailingPlayer(game, player.id)) {
      // Extra draw
      const drawResult = drawComebackDraw(player.deck, player.discardPile, rand);
      player.hand.push(...drawResult.drawn);
      player.deck = drawResult.deck;
      player.discardPile = drawResult.discardPile;

      // Comeback card
      const comebackCard = drawComebackCard(rand);
      player.hand.push(comebackCard);

      events.emit({
        type: 'ComebackBonus',
        payload: { playerId: player.id, extraCards: [...drawResult.drawn, comebackCard] },
      });
    }
  }
}

/** Reset lanes for the next round */
function resetLanesForNextRound(game: GameState, rand: () => number): void {
  const nextRound = game.currentRound;
  const activeCount = getActiveLaneCount(nextRound);

  for (let i = 0; i < game.lanes.length; i++) {
    const lane = game.lanes[i];
    lane.isActive = i < activeCount;
    lane.totalStrengthPerPlayer = { 0: 0, 1: 0, 2: 0, 3: 0 };
    lane.winner = null;
    lane.isTie = false;
    lane.vpAwarded = { 0: 0, 1: 0, 2: 0, 3: 0 };
    lane.assignments = { 0: [], 1: [], 2: [], 3: [] };
    // Clear temp properties
    lane.shieldedPlayers = [];

    // Update objective for active lanes
    if (lane.isActive) {
      lane.objective = getLaneObjectiveForRound(i as LaneIndex, nextRound, rand);
    }
  }

  // Reset player submissions
  for (const player of game.players) {
    player.currentAssignments = [];
    player.hasSubmitted = false;
  }
}

// ─── Query Functions ───────────────────────────────────────────

/**
 * Get current standings sorted by VP (descending).
 */
export function getStandings(game: GameState): Standing[] {
  const standings: Standing[] = [];

  if (game.mode === '2v2') {
    // Team standings
    const teamScores = [0, 1].map(teamId => {
      const playerIds = getTeamPlayerIds(teamId as TeamId, '2v2');
      const totalVp = getTeamVp(game, teamId as TeamId);
      const totalLaneWins = playerIds.reduce((sum, pid) => sum + (game.players[pid]?.laneWins ?? 0), 0);
      const firstScore = Math.min(
        ...playerIds.map(pid => game.players[pid]?.firstScoreRound ?? 999),
      );
      return { teamId: teamId as TeamId, totalVp, totalLaneWins, firstScore };
    });

    teamScores.sort((a, b) => {
      if (b.totalVp !== a.totalVp) return b.totalVp - a.totalVp;
      if (b.totalLaneWins !== a.totalLaneWins) return b.totalLaneWins - a.totalLaneWins;
      return a.firstScore - b.firstScore;
    });

    for (let rank = 0; rank < teamScores.length; rank++) {
      const ts = teamScores[rank];
      const playerIds = getTeamPlayerIds(ts.teamId, '2v2');
      for (const pid of playerIds) {
        standings.push({
          playerId: pid,
          teamId: ts.teamId,
          vpTotal: ts.totalVp,
          laneWins: ts.totalLaneWins,
          firstScoreRound: ts.firstScore === 999 ? null : ts.firstScore,
          rank: rank + 1,
        });
      }
    }
  } else {
    // FFA standings
    for (const player of game.players) {
      if (!player.isConnected) continue;
      standings.push({
        playerId: player.id,
        teamId: player.teamId,
        vpTotal: player.vpTotal,
        laneWins: player.laneWins,
        firstScoreRound: player.firstScoreRound,
        rank: 0, // Will be set after sort
      });
    }

    standings.sort((a, b) => {
      if (b.vpTotal !== a.vpTotal) return b.vpTotal - a.vpTotal;
      if (b.laneWins !== a.laneWins) return b.laneWins - a.laneWins;
      return (a.firstScoreRound ?? 999) - (b.firstScoreRound ?? 999);
    });

    // Assign ranks
    for (let i = 0; i < standings.length; i++) {
      standings[i].rank = i + 1;
    }
  }

  return standings;
}

/**
 * Check if the game is over.
 */
export function isGameOver(game: GameState): boolean {
  return game.gamePhase === 'completed' || game.roundsCompleted >= game.maxRounds;
}

/**
 * Get the final game result.
 */
export function getGameResult(game: GameState): GameResult {
  const standings = getStandings(game);

  if (standings.length === 0) {
    return {
      winnerId: null,
      winningTeamId: null,
      isDraw: true,
      finalStandings: [],
      totalRoundsPlayed: game.roundsCompleted,
    };
  }

  const top = standings[0];
  const second = standings[1];
  const isDraw = top.vpTotal === second?.vpTotal;

  if (isDraw) {
    // Check first tie-breaker (lane wins)
    if (top.laneWins !== second.laneWins) {
      // Not actually a draw — lane wins breaks it
      const winner = top.laneWins > second.laneWins ? top : second;
      return {
        winnerId: winner.playerId,
        winningTeamId: winner.teamId,
        isDraw: false,
        finalStandings: standings,
        totalRoundsPlayed: game.roundsCompleted,
      };
    }
    // Still tied — draw
    return {
      winnerId: null,
      winningTeamId: null,
      isDraw: true,
      finalStandings: standings,
      totalRoundsPlayed: game.roundsCompleted,
    };
  }

  return {
    winnerId: top.playerId,
    winningTeamId: top.teamId,
    isDraw: false,
    finalStandings: standings,
    totalRoundsPlayed: game.roundsCompleted,
  };
}
