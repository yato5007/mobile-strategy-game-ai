/**
 * Arabic translations for the strategy game.
 */
const ar = {
  translation: {
    // Home Screen
    'app.title': 'شطرنج الاستراتيجية',
    'app.subtitle': 'لعبة تكتيك وسيطرة',
    'home.play': 'العب',
    'home.settings': 'الإعدادات',
    'home.language': 'English',

    // Lobby Screen
    'lobby.title': 'إعداد المباراة',
    'lobby.mode': 'وضع اللعب',
    'lobby.mode.ffa': 'الكل ضد الكل',
    'lobby.mode.2v2': '2 ضد 2',
    'lobby.player': 'لاعب {{n}}',
    'lobby.player.human': 'بشري',
    'lobby.player.bot': 'روبوت',
    'lobby.bot.difficulty': 'الصعوبة',
    'lobby.bot.difficulty.easy': 'سهل',
    'lobby.bot.difficulty.normal': 'عادي',
    'lobby.bot.difficulty.hard': 'صعب',
    'lobby.bot.difficulty.expert': 'خبير',
    'lobby.bot.style': 'الأسلوب',
    'lobby.bot.style.aggressive': 'هجومي',
    'lobby.bot.style.defensive': 'دفاعي',
    'lobby.bot.style.balanced': 'متوازن',
    'lobby.bot.style.disruptive': 'تخريبي',
    'lobby.bot.style.objective-focused': 'تركيز الأهداف',
    'lobby.bot.style.comeback-focused': 'تركيز العودة',
    'lobby.bot.style.team-support': 'دعم الفريق',
    'lobby.start': 'ابدأ المباراة',
    'lobby.back': 'رجوع',
    'lobby.error.minPlayers': 'يجب وجود لاعبين على الأقل',

    // Game Screen
    'game.round': 'جولة {{n}} / {{max}}',
    'game.phase.planning': 'تخطيط',
    'game.phase.reveal': 'كشف',
    'game.phase.resolution': 'نتائج',
    'game.phase.cleanup': 'تنظيف',
    'game.confirm': 'تأكيد',
    'game.cancel': 'إلغاء',
    'game.confirm.hint': 'اختر بطاقة واحدة على الأقل',
    'game.score': 'النقاط',
    'game.team': 'فريق',
    'game.lane': 'ممر {{n}}',
    'game.vp': '+{{n}} نقطة',
    'game.vp.bonus': '+{{n}} مكافأة',
    'game.yourHand': 'بطاقاتك',
    'game.waiting': 'انتظار اللاعبين...',
    'game.results': 'النتائج',
    'game.tie': 'تعادل',

    // Card Types
    'card.unit': 'وحدة',
    'card.tactic': 'تكتيك',
    'card.objective': 'هدف',
    'card.comeback': 'عودة',
    'card.strength': 'قوة: {{n}}',

    // Tactic effects
    'tactic.bluff': 'خداع',
    'tactic.sabotage': 'تخريب',
    'tactic.reinforce': 'تعزيز',
    'tactic.spy': 'تجسس',
    'tactic.shield': 'درع',
    'tactic.retreat': 'انسحاب',
    'tactic.ambush': 'كمين',

    // Card Names
    'card.scout': 'كشاف',
    'card.soldier': 'جندي',
    'card.knight': 'فارس',
    'card.champion': 'بطل',
    'card.bluff': 'خداع',
    'card.sabotage': 'تخريب',
    'card.reinforce': 'تعزيز',
    'card.spy': 'تجسس',
    'card.shield': 'درع',
    'card.retreat': 'انسحاب',
    'card.ambush': 'كمين',
    'card.sabotage-extra': 'تخريب كبير',
    'card.reinforce-extra': 'تعزيز كبير',
    'card.determination': 'إصرار',
    'card.last-stand': 'صمود أخير',
    'card.surprise-rally': 'هجوم مفاجئ',
    'card.fortuna': 'فورتونا',

    // Descriptions
    'card.determination.desc': 'تعزيز قوي للاعب المتأخر',
    'card.last-stand.desc': 'إذا خسرت هذا الممر بفارق 2 أو أقل، اربح نقطة',
    'card.surprise-rally.desc': 'تعزيز غير متوقع لتغيير المسار',
    'card.fortuna.desc': 'الحظ يخدم الشجعان — مكافأة عشوائية',
    'lane.standard': 'ممر عادي',
    'lane.high-value': 'ممر عالي القيمة',
    'lane.capture-flag': 'التقاط العلم',
    'lane.king-of-hill': 'ملك التل',
    'lane.bounty': 'جائزة',

    // Results Screen
    'results.title': 'انتهت المباراة',
    'results.winner': 'اللاعب {{n}} فاز!',
    'results.winner.team': 'الفريق {{n}} فاز!',
    'results.draw': 'تعادل!',
    'results.rank': '#{{n}}',
    'results.vp': '{{n}} نقطة',
    'results.laneWins': '{{n}} فوز بالممرات',
    'results.playAgain': 'العب مرة أخرى',
    'results.mainMenu': 'القائمة الرئيسية',
    'results.ffa': 'الترتيب النهائي',
    'results.team': 'ترتيب الفرق',

    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.audio': 'الصوت',
    'settings.music': 'الموسيقى',
    'settings.about': 'حول',

    // Errors
    'error.generic': 'حدث خطأ ما',
    'error.engine': 'خطأ في المحرك: {{message}}',
    'error.forfeit': 'انسحاب من المباراة؟',
    'error.forfeit.confirm': 'هل أنت متأكد من رغبتك في الانسحاب؟',
    'error.forfeit.yes': 'نعم، انسحاب',
    'error.forfeit.no': 'لا، استمر',

    // Achievements
    'achievement.control-all-lanes': 'السيطرة على كل الممرات',
    'achievement.dominate-three-lanes': 'الهيمنة على ثلاث ممرات',
    'achievement.first-blood': 'الضربة الأولى',
    'achievement.comeback-king': 'ملك العودة',
    'achievement.no-mercy': 'بلا رحمة',
    'achievement.perfectionist': 'مثالي',
  },
};

export default ar;
