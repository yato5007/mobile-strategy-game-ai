/**
 * useGameSounds — Maps game engine events to sound effects.
 *
 * Subscribes to a GameEventEmitter and plays the appropriate sound
 * effect for each event type. Designed to be wired into the main
 * GameScreen component.
 *
 * Placeholder implementation: logs events to console and calls visual
 * fallback callback. Real implementation will play actual audio files
 * when assets are provided.
 *
 * Depends on:
 * - useSound hook for audio playback
 * - GameEventEmitter from core game engine
 * - GameEvent types from core game engine (types.ts)
 */

import { useEffect, useRef } from 'react';
import type { GameEventEmitter, GameEvent } from '../game/types';
import { useSound, type SoundKey } from './useSound';

// ─── Event-to-Sound Mapping ─────────────────────────────────────

/**
 * Maps each GameEvent type to one or more SoundKeys.
 * Multiple sounds can be chained for complex events.
 */
function getSoundForEvent(event: GameEvent): SoundKey[] {
  switch (event.type) {
    // Game Start
    case 'GameStarted':
      return ['match_start'];

    // Round Flow
    case 'RoundStarted':
      return ['planning_start'];
    case 'PlanningPhase':
      return []; // Ambient — handled by board animation
    case 'PlayerSubmitted':
      return ['confirm'];
    case 'RevealPhase':
      return ['reveal'];
    case 'ResolutionPhase':
      return ['resolution'];

    // Lane Resolution
    case 'LaneResolved':
      if (event.payload.winner !== null) {
        return ['card_place']; // Winner lane highlight sound
      }
      return ['card_place']; // Tie or neutral

    // VP & Scoring
    case 'VPAwarded':
      return event.payload.vpAmount > 0 ? ['card_place'] : [];

    // Round Complete
    case 'RoundComplete':
      return ['round_transition'];

    // Tactics
    case 'SpyInfo':
      return ['spy'];

    // Comeback
    case 'ComebackBonus':
      return ['comeback'];

    // Achievements
    case 'AchievementUnlocked':
      return ['achievement'];

    // Penalty
    case 'PlayerPenalized':
      return [];

    // Game Over
    case 'GameOver':
      // Determine victory or defeat based on winner
      return ['game_over'];

    // Error
    case 'Error':
      return [];

    default:
      return [];
  }
}

// ─── Hook ───────────────────────────────────────────────────────

export interface UseGameSoundsOptions {
  /** Game event emitter to subscribe to (from createGame()) */
  events: GameEventEmitter | null;
  /** Whether sounds are enabled (default: true) */
  enabled?: boolean;
}

/**
 * useGameSounds — Listens to game events and plays corresponding sounds.
 *
 * Wire this into your GameScreen component:
 * ```tsx
 * useGameSounds({ events, enabled: !reduceMotion });
 * ```
 *
 * When real audio assets are not available, this hook silently
 * degrades. In development mode, it logs event-to-sound mappings
 * to the console for debugging.
 */
export function useGameSounds({ events, enabled = true }: UseGameSoundsOptions): void {
  const { play } = useSound();
  const enabledRef = useRef(enabled);

  // Keep ref in sync without re-subscribing
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!events) return;

    // Subscribe to every game event type
    const eventTypes: GameEvent['type'][] = [
      'GameStarted',
      'RoundStarted',
      'PlanningPhase',
      'PlayerSubmitted',
      'RevealPhase',
      'ResolutionPhase',
      'LaneResolved',
      'VPAwarded',
      'RoundComplete',
      'SpyInfo',
      'ComebackBonus',
      'AchievementUnlocked',
      'PlayerPenalized',
      'GameOver',
      'Error',
    ];

    const unsubscribers = eventTypes.map(eventType =>
      events.subscribe(eventType, (event: GameEvent) => {
        if (!enabledRef.current) return;

        const soundKeys = getSoundForEvent(event);

        if (__DEV__ && soundKeys.length > 0) {
          console.log(
            `[useGameSounds] Event: ${event.type} → Sound: ${soundKeys.join(', ')}`,
          );
        }

        // Play all mapped sounds
        for (const key of soundKeys) {
          play(key);
        }
      }),
    );

    // Cleanup on unmount
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [events, play]);
}

export default useGameSounds;
