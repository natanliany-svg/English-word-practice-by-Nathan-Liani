window.currentDay = 'home';
window.currentWeek = 'home';
window.wordIndex = 0;
window.speechRate = 0.85;
window.summaryMode = 'weeks';
window.articleViewMode = 'sentence';
window.quizTargetWeek = 'mix';

// --- Theme State ---
window.activeTheme = localStorage.getItem('fluencyTheme') || 'cyan';
document.documentElement.setAttribute('data-theme', window.activeTheme);

// --- SRS State ---
window.srsState = {};
try {
    const storedSRS = localStorage.getItem('fluencySRS');
    if (storedSRS) window.srsState = JSON.parse(storedSRS);
} catch(e) {}

// --- Streak State ---
window.userStreak = 0;
try {
    const streakInfo = localStorage.getItem('fluencyStreakInfo');
    if (streakInfo) {
        const parsed = JSON.parse(streakInfo);
        const today = new Date().toDateString();
        const lastVisit = parsed.lastVisit;
        if (lastVisit === today) {
            window.userStreak = parsed.streak;
        } else {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastVisit === yesterday) {
                window.userStreak = parsed.streak + 1;
            } else {
                window.userStreak = 1;
            }
            localStorage.setItem('fluencyStreakInfo', JSON.stringify({ streak: window.userStreak, lastVisit: today }));
        }
    } else {
        window.userStreak = 1;
        localStorage.setItem('fluencyStreakInfo', JSON.stringify({ streak: 1, lastVisit: new Date().toDateString() }));
    }
} catch(e) { window.userStreak = 1; }

// --- Spelling Game State ---
window.spellingState = {
    words: [],
    currentIndex: 0,
    score: 0,
    isPlaying: false,
    cluesUsed: 0
};

// --- Match Game State ---
window.matchState = {
    cards: [],
    selectedCard: null,
    timer: 0,
    interval: null,
    isPlaying: false,
    bestTime: localStorage.getItem('fluencyMatchBest') || null
};

// --- Search Filter State ---
window.summarySearchQuery = '';



window.articleParagraphs = {
    'week8': [
        [0, 1, 2],
        [3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13],
        [14, 15, 16, 17],
        [18, 19, 20, 21],
        [22, 23, 24, 25],
        [26, 27, 28],
        [29, 30, 31],
        [32, 33, 34]
    ],
    'week9': [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17],
        [18, 19, 20, 21, 22],
        [23, 24, 25, 26],
        [27, 28, 29, 30],
        [31, 32, 33],
        [34, 35, 36, 37, 38]
    ],
    'week10': [
        [0],
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14],
        [15],
        [16, 17, 18, 19],
        [20, 21, 22, 23],
        [24],
        [25, 26],
        [27],
        [28, 29, 30],
        [31],
        [32, 33, 34],
        [35],
        [36, 37, 38],
        [39],
        [40, 41],
        [42, 43, 44]
    ]
};

window.audioState = window.audioState || {
    fullText: "",
    btnElement: null,
    estimatedDuration: 0,
    elapsed: 0,
    interval: null,
    isPaused: false,
    isDragging: false
};
window.audioPlaying = false;

window.quizState = 'start';
window.quizDifficulty = 'medium';
window.quizScore = 0;
window.quizQuestions = [];
window.currentQuizIndex = 0;
window.quizHistory = [];
