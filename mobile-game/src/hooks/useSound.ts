/**
 * useSound — Sound playback hook for game audio.
 *
 * Wraps expo-av Audio for loading and playing sound effects and music.
 * Gracefully degrades when expo-av is not installed or assets are missing.
 *
 * Features:
 * - Load sounds by key from a predefined registry
 * - Play, stop, pause, and resume
 * - Separate volume control for SFX and music
 * - Mute toggle
 * - Accessible visual fallback callback
 *
 * Placeholder implementation: plays no audio until real assets are provided.
 * See ASSET_PIPELINE.md and assets/audio/placeholders/ for asset requirements.
 */

import { useRef, useCallback, useState } from 'react';
import { Platform } from 'react-native';

// ─── Types ─────────────────────────────────────────────────────

/** Sound category */
export type SoundCategory = 'sfx' | 'music';

/** Sound identifier — matches filenames in assets/audio/ */
export type SoundKey =
  // Core Actions
  | 'card_tap'
  | 'card_place'
  | 'confirm'
  | 'cancel'
  // Round Flow
  | 'planning_start'
  | 'reveal'
  | 'resolution'
  | 'cleanup'
  // Tactics
  | 'spy'
  | 'sabotage'
  | 'shield'
  | 'reinforce'
  | 'bluff'
  | 'retreat'
  | 'ambush'
  // Achievements
  | 'achievement'
  | 'first_blood'
  | 'comeback'
  // Match
  | 'match_start'
  | 'round_transition'
  | 'victory'
  | 'defeat'
  | 'game_over'
  // Music
  | 'menu_theme'
  | 'game_theme'
  | 'results_theme';

/** Configuration for the sound system */
export interface SoundConfig {
  /** Base volume for SFX (0–1) */
  sfxVolume: number;
  /** Base volume for music (0–1) */
  musicVolume: number;
  /** Master mute */
  muted: boolean;
  /** Callback for visual fallback when a sound would play */
  onSoundTriggered?: (key: SoundKey, category: SoundCategory) => void;
}

/** Return type of useSound hook */
export interface UseSoundReturn {
  /** Play a sound by key */
  play: (key: SoundKey, category?: SoundCategory) => void;
  /** Stop a specific sound */
  stop: (key: SoundKey) => void;
  /** Stop all sounds */
  stopAll: () => void;
  /** Set SFX volume (0–1) */
  setSfxVolume: (vol: number) => void;
  /** Set music volume (0–1) */
  setMusicVolume: (vol: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Current mute state */
  isMuted: boolean;
  /** Current SFX volume */
  sfxVolume: number;
  /** Current music volume */
  musicVolume: number;
  /** Whether real audio is available (vs placeholder mode) */
  audioAvailable: boolean;
  /** Callback for visual fallback when a sound would play */
  onSoundTriggered?: (key: SoundKey, category: SoundCategory) => void;
}

// ─── Default Config ─────────────────────────────────────────────

const DEFAULT_CONFIG: SoundConfig = {
  sfxVolume: 0.8,
  musicVolume: 0.5,
  muted: false,
};

// ─── Sound File Map ─────────────────────────────────────────────

/**
 * Maps SoundKey to expected asset path for loading.
 * Structure: assets/audio/{category}/{key}.wav
 */
const SOUND_PATHS: Record<SoundKey, { category: SoundCategory; path: string }> = {
  // Core Actions
  card_tap: { category: 'sfx', path: 'card_tap' },
  card_place: { category: 'sfx', path: 'card_place' },
  confirm: { category: 'sfx', path: 'confirm' },
  cancel: { category: 'sfx', path: 'cancel' },
  // Round Flow
  planning_start: { category: 'sfx', path: 'planning_start' },
  reveal: { category: 'sfx', path: 'reveal' },
  resolution: { category: 'sfx', path: 'resolution' },
  cleanup: { category: 'sfx', path: 'cleanup' },
  // Tactics
  spy: { category: 'sfx', path: 'spy' },
  sabotage: { category: 'sfx', path: 'sabotage' },
  shield: { category: 'sfx', path: 'shield' },
  reinforce: { category: 'sfx', path: 'reinforce' },
  bluff: { category: 'sfx', path: 'bluff' },
  retreat: { category: 'sfx', path: 'retreat' },
  ambush: { category: 'sfx', path: 'ambush' },
  // Achievements
  achievement: { category: 'sfx', path: 'achievement' },
  first_blood: { category: 'sfx', path: 'first_blood' },
  comeback: { category: 'sfx', path: 'comeback' },
  // Match
  match_start: { category: 'sfx', path: 'match_start' },
  round_transition: { category: 'sfx', path: 'round_transition' },
  victory: { category: 'sfx', path: 'victory' },
  defeat: { category: 'sfx', path: 'defeat' },
  game_over: { category: 'sfx', path: 'game_over' },
  // Music
  menu_theme: { category: 'music', path: 'menu_theme' },
  game_theme: { category: 'music', path: 'game_theme' },
  results_theme: { category: 'music', path: 'results_theme' },
};

// ─── Hook ───────────────────────────────────────────────────────

/**
 * useSound — Sound playback hook.
 *
 * Placeholder implementation:
 * - Logs sound plays to console when real audio is unavailable
 * - Accepts `onSoundTriggered` callback for visual fallback
 * - Volume/mute controls work on the config (future-proof)
 * - Ready for expo-av integration when assets are added
 */
export function useSound(config?: Partial<SoundConfig>): UseSoundReturn {
  const [settings, setSettings] = useState<SoundConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  // Track currently playing sounds (placeholder — will hold Audio.Sound refs)
  const activeSounds = useRef<Map<SoundKey, any>>(new Map());

  /** Check whether expo-av's Audio module is available */
  const hasAudioModule = useCallback((): boolean => {
    try {
      // Dynamic require to avoid crash if expo-av is missing
      const Audio = require('expo-av');
      return !!(Audio && Audio.Audio);
    } catch {
      return false;
    }
  }, []);

  const audioAvailable = hasAudioModule();

  /** Play a sound effect or music track */
  const play = useCallback(
    (key: SoundKey, category: SoundCategory = SOUND_PATHS[key]?.category ?? 'sfx') => {
      if (settings.muted) return;

      // Callback for visual fallback
      if (settings.onSoundTriggered) {
        settings.onSoundTriggered(key, category);
      }

      if (!audioAvailable) {
        // Placeholder: log and return
        if (__DEV__) {
          console.log(`[useSound] PLACEHOLDER: playing "${key}" (${category})`);
        }
        return;
      }

      // Real implementation placeholder:
      // When expo-av assets are ready, this will:
      // 1. Load the sound file from assets/audio/{category}/{key}.wav
      // 2. Set volume based on category (sfxVolume or musicVolume)
      // 3. Play the sound
      // 4. Track the sound ref in activeSounds
    },
    [settings.muted, settings.sfxVolume, settings.musicVolume, settings.onSoundTriggered, audioAvailable, settings],
  );

  /** Stop a specific sound */
  const stop = useCallback(
    (key: SoundKey) => {
      const sound = activeSounds.current.get(key);
      if (sound) {
        try {
          sound.stopAsync();
          sound.unloadAsync();
        } catch {
          // Sound may already be stopped
        }
        activeSounds.current.delete(key);
      }
    },
    [],
  );

  /** Stop all active sounds */
  const stopAll = useCallback(() => {
    for (const [key] of activeSounds.current) {
      stop(key);
    }
  }, [stop]);

  /** Set SFX volume */
  const setSfxVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSettings(prev => ({ ...prev, sfxVolume: clamped }));
  }, []);

  /** Set music volume */
  const setMusicVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSettings(prev => ({ ...prev, musicVolume: clamped }));
  }, []);

  /** Toggle mute */
  const toggleMute = useCallback(() => {
    setSettings(prev => {
      const newMuted = !prev.muted;
      if (newMuted) {
        // Stop all sounds when muting
        stopAll();
      }
      return { ...prev, muted: newMuted };
    });
  }, [stopAll]);

  return {
    play,
    stop,
    stopAll,
    setSfxVolume,
    setMusicVolume,
    toggleMute,
    isMuted: settings.muted,
    sfxVolume: settings.sfxVolume,
    musicVolume: settings.musicVolume,
    audioAvailable,
  };
}

export default useSound;
