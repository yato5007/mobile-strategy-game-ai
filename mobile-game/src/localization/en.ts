/**
 * English translations for the strategy game.
 */
const en = {
  translation: {
    // Home Screen
    'app.title': 'Shatranj Strategy',
    'app.subtitle': 'A Game of Tactics and Territory',
    'home.play': 'Play',
    'home.settings': 'Settings',
    'home.language': 'العربية',

    // Lobby Screen
    'lobby.title': 'Game Setup',
    'lobby.mode': 'Game Mode',
    'lobby.mode.ffa': 'Free for All',
    'lobby.mode.2v2': '2 vs 2',
    'lobby.player': 'Player {{n}}',
    'lobby.player.human': 'Human',
    'lobby.player.bot': 'Bot',
    'lobby.bot.difficulty': 'Difficulty',
    'lobby.bot.difficulty.easy': 'Easy',
    'lobby.bot.difficulty.normal': 'Normal',
    'lobby.bot.difficulty.hard': 'Hard',
    'lobby.bot.difficulty.expert': 'Expert',
    'lobby.bot.style': 'Style',
    'lobby.bot.style.aggressive': 'Aggressive',
    'lobby.bot.style.defensive': 'Defensive',
    'lobby.bot.style.balanced': 'Balanced',
    'lobby.bot.style.disruptive': 'Disruptive',
    'lobby.bot.style.objective-focused': 'Objective Focused',
    'lobby.bot.style.comeback-focused': 'Comeback Focused',
    'lobby.bot.style.team-support': 'Team Support',
    'lobby.start': 'Start Match',
    'lobby.back': 'Back',
    'lobby.error.minPlayers': 'At least 2 players required',

    // Game Screen
    'game.round': 'Round {{n}} / {{max}}',
    'game.phase.planning': 'Planning',
    'game.phase.reveal': 'Reveal',
    'game.phase.resolution': 'Resolution',
    'game.phase.cleanup': 'Clean Up',
    'game.confirm': 'Confirm',
    'game.cancel': 'Cancel',
    'game.confirm.hint': 'Assign at least 1 card',
    'game.score': 'Score',
    'game.team': 'Team',
    'game.lane': 'Lane {{n}}',
    'game.vp': '+{{n}} VP',
    'game.vp.bonus': '+{{n}} Bonus',
    'game.yourHand': 'Your Hand',
    'game.waiting': 'Waiting for players...',
    'game.results': 'Results',
    'game.tie': 'Tie',

    // Card Types
    'card.unit': 'Unit',
    'card.tactic': 'Tactic',
    'card.objective': 'Objective',
    'card.comeback': 'Comeback',
    'card.strength': 'Str: {{n}}',

    // Tactic effects
    'tactic.bluff': 'Bluff',
    'tactic.sabotage': 'Sabotage',
    'tactic.reinforce': 'Reinforce',
    'tactic.spy': 'Spy',
    'tactic.shield': 'Shield',
    'tactic.retreat': 'Retreat',
    'tactic.ambush': 'Ambush',

    // Card Names (from constants)
    'card.scout': 'Scout',
    'card.soldier': 'Soldier',
    'card.knight': 'Knight',
    'card.champion': 'Champion',
    'card.bluff': 'Bluff',
    'card.sabotage': 'Sabotage',
    'card.reinforce': 'Reinforce',
    'card.spy': 'Spy',
    'card.shield': 'Shield',
    'card.retreat': 'Retreat',
    'card.ambush': 'Ambush',
    'card.sabotage-extra': 'Greater Sabotage',
    'card.reinforce-extra': 'Greater Reinforce',
    'card.determination': 'Determination',
    'card.last-stand': 'Last Stand',
    'card.surprise-rally': 'Surprise Rally',
    'card.fortuna': 'Fortuna',

    // Descriptions
    'card.determination.desc': 'A powerful reinforce for the trailing player',
    'card.last-stand.desc': 'If you lose this lane by 2 or less, gain 1 VP',
    'card.surprise-rally.desc': 'An unexpected reinforce to turn the tide',
    'card.fortuna.desc': 'Luck favors the bold — a random bonus',
    'lane.standard': 'Standard Lane',
    'lane.high-value': 'High Value Lane',
    'lane.capture-flag': 'Capture the Flag',
    'lane.king-of-hill': 'King of the Hill',
    'lane.bounty': 'Bounty',

    // Results Screen
    'results.title': 'Game Over',
    'results.winner': 'Player {{n}} Wins!',
    'results.winner.team': 'Team {{n}} Wins!',
    'results.draw': "It's a Draw!",
    'results.rank': '#{{n}}',
    'results.vp': '{{n}} VP',
    'results.laneWins': '{{n}} lane wins',
    'results.playAgain': 'Play Again',
    'results.mainMenu': 'Main Menu',
    'results.ffa': 'Final Standings',
    'results.team': 'Team Standings',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.audio': 'Audio',
    'settings.music': 'Music',
    'settings.about': 'About',

    // Errors
    'error.generic': 'Something went wrong',
    'error.engine': 'Game engine error: {{message}}',
    'error.forfeit': 'Forfeit match?',
    'error.forfeit.confirm': 'Are you sure you want to forfeit?',
    'error.forfeit.yes': 'Yes, forfeit',
    'error.forfeit.no': 'No, keep playing',

    // Achievements
    'achievement.control-all-lanes': 'Control All Lanes',
    'achievement.dominate-three-lanes': 'Dominate Three Lanes',
    'achievement.first-blood': 'First Blood',
    'achievement.comeback-king': 'Comeback King',
    'achievement.no-mercy': 'No Mercy',
    'achievement.perfectionist': 'Perfectionist',
  },
};

export default en;
