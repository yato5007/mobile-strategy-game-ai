PLACEHOLDER AUDIO ASSETS
========================

This directory contains placeholder audio files for the game's sound system.
These are SILENT or minimal audio files used during development before final
sound assets are created.

Placeholder Convention:
- All placeholder .wav files are 44.1kHz, 16-bit, mono, 100ms silent audio
- Each file is named to match the sound effect key in useGameSounds.ts
- Replace these with real audio files before release

Required Placeholder Files (created as references only; the system uses
silent playback when real files are not found):

Core Actions:
  card_tap.wav         - Card selection tap
  card_place.wav       - Card placed on lane
  confirm.wav          - Submit confirmation
  cancel.wav           - Cancel action

Round Flow:
  planning_start.wav   - Planning phase begins
  reveal.wav           - Reveal phase
  resolution.wav       - Resolution phase
  cleanup.wav          - Cleanup phase

Tactics:
  spy.wav              - Spy reveal
  sabotage.wav         - Sabotage effect
  shield.wav           - Shield block
  reinforce.wav        - Reinforce boost
  bluff.wav            - Bluff reveal
  retreat.wav          - Retreat card
  ambush.wav           - Ambush strike

Achievements:
  achievement.wav      - Achievement unlocked
  first_blood.wav      - First blood award
  comeback.wav         - Comeback bonus

Match:
  match_start.wav      - Match begins
  round_transition.wav - Between rounds
  victory.wav          - Victory fanfare
  defeat.wav           - Defeat tone
  game_over.wav        - Game over sound

Music:
  menu_theme.wav       - Menu screen background
  game_theme.wav       - During match music
  results_theme.wav    - Results screen music

Status: PLACEHOLDER - Replace with final assets before release.
