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
try { 
    window.highScore = localStorage.getItem('fluencyUnseenHighScore') || 0; 
    const storedHistory = localStorage.getItem('fluencyUnseenHistory');
    if (storedHistory) window.quizHistory = JSON.parse(storedHistory);
} catch(e) { window.highScore = 0; }

window.setWeek = function(week) {
    window.stopAudio();
    window.currentWeek = week;
    if (week === 'week1') window.currentDay = 'w1d1';
    else if (week === 'week2') window.currentDay = 'w2d1';
    else if (week === 'week3') window.currentDay = 'w3d1';
    else if (week === 'week7') window.currentDay = 'w7d1';
    else if (week === 'week8') window.currentDay = 'w8d1';
    else if (week === 'week9vocab') window.currentDay = 'w9d1';
    else if (week === 'week10vocab') window.currentDay = 'w10d1';
    else window.currentDay = week; 
    window.wordIndex = 0;
    if (week !== 'quiz') window.quizState = 'start';
    
    // Stop game loops if leaving
    if (week !== 'games') {
        if (window.spellingState) window.spellingState.isPlaying = false;
        if (window.matchState) {
            window.matchState.isPlaying = false;
            if (window.matchState.interval) {
                clearInterval(window.matchState.interval);
                window.matchState.interval = null;
            }
        }
    }
    
    if (week !== 'home' && window.innerWidth > 1024) {
        window.collapseDesktopMenu();
    }
    
    window.render();
};

window.toggleDesktopMenu = function() {
    document.getElementById('sidebar').classList.toggle('desktop-collapsed');
    document.querySelector('.main-layout-wrapper').classList.toggle('expanded');
};

window.collapseDesktopMenu = function() {
    document.getElementById('sidebar').classList.add('desktop-collapsed');
    document.querySelector('.main-layout-wrapper').classList.add('expanded');
};

// --- Theme Controller ---
window.changeTheme = function(theme) {
    window.activeTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fluencyTheme', theme);
    
    // Update active theme dot in DOM
    document.querySelectorAll('.theme-dot').forEach(dot => {
        if (dot.classList.contains(theme)) {
            dot.classList.add('active-theme-dot');
        } else {
            dot.classList.remove('active-theme-dot');
        }
    });
    
    window.render();
};

// --- SRS Controller ---
window.toggleSRSWord = function(wordKey, isKnown) {
    if (!window.srsState) window.srsState = {};
    if (!window.srsState[wordKey]) {
        window.srsState[wordKey] = { interval: 1, nextReview: 0, known: false };
    }
    const item = window.srsState[wordKey];
    item.known = isKnown;
    if (isKnown) {
        if (item.interval < 8) item.interval = 8;
        else item.interval = item.interval * 2;
        if (item.interval > 64) item.interval = 64;
    } else {
        item.interval = 1;
    }
    item.nextReview = Date.now() + item.interval * 86400000;
    localStorage.setItem('fluencySRS', JSON.stringify(window.srsState));
    window.render();
};

// --- Pronunciation Checker ---
window.startPronunciationCheck = function(word, btnElement) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("דפדפן זה אינו תומך בזיהוי דיבור קולי. אנא השתמש ב-Chrome, Edge או Safari.");
        return;
    }
    window.stopAudio();
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechClass();
    recognizer.lang = 'en-US';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.continuous = false;
    
    btnElement.classList.add('listening');
    btnElement.title = "מקשיב...";
    
    recognizer.onresult = function(event) {
        const resultText = event.results[0][0].transcript.trim().toLowerCase();
        const targetText = word.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase();
        
        btnElement.classList.remove('listening');
        btnElement.title = "דבר 🎤";
        
        if (resultText === targetText) {
            alert(`מצוין! 100% התאמה 🎉\nנשמע בדיוק כמו: "${resultText}"`);
        } else if (targetText.includes(resultText) || resultText.includes(targetText) || resultText.substring(0,3) === resultText.substring(0,3)) {
            alert(`טוב מאוד! התאמה קרובה 👍\nאמרת: "${resultText}"\nהמילה הנכונה: "${word}"`);
        } else {
            alert(`נסה שוב! ❌\nאמרת: "${resultText}"\nהמילה הנכונה: "${word}"`);
        }
    };
    recognizer.onerror = function(event) {
        btnElement.classList.remove('listening');
        btnElement.title = "דבר 🎤";
        console.error("Speech recognition error:", event.error);
        alert("לא הצלחנו לשמוע בבירור. אנא ודא שיש הרשאות מיקרופון ונסה שוב.");
    };
    recognizer.onend = function() {
        btnElement.classList.remove('listening');
        btnElement.title = "דבר 🎤";
    };
    recognizer.start();
};

// --- Tooltip Translation Controller ---
window.getAllVocabWords = function() {
    const allWords = {};
    if(window.vocabularyData) {
        Object.entries(window.vocabularyData).forEach(([dayKey, words]) => {
            words.forEach(w => {
                allWords[w.word.toLowerCase()] = w;
            });
        });
    }
    return allWords;
};

window.showWordTooltip = function(element, word, meaning, phonetic) {
    document.querySelectorAll('.word-tooltip').forEach(el => el.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'word-tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-header">${word}</div>
        <div class="tooltip-phonetic">[ ${phonetic} ]</div>
        <div class="tooltip-meaning">${meaning}</div>
        <button class="nav-btn" style="padding: 2px 8px; font-size: 11px; margin: 0; background: var(--theme-main); color: #fff; border-radius: 4px;" onclick="event.stopPropagation(); window.playAudio('${word.replace(/'/g, "\\'")}')">השמע 🔊</button>
    `;
    
    element.appendChild(tooltip);
    
    setTimeout(() => {
        const close = () => {
            tooltip.remove();
            document.removeEventListener('click', close);
        };
        document.addEventListener('click', close);
    }, 10);
};

// --- Spelling Game logic ---
window.startSpellingGame = function() {
    const allWords = [];
    Object.values(window.vocabularyData).forEach(dayWords => {
        dayWords.forEach(w => allWords.push(w));
    });
    
    if (allWords.length < 5) {
        alert("אין מספיק מילים במאגר!");
        return;
    }
    
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    window.spellingState.words = shuffled.slice(0, 10);
    window.spellingState.currentIndex = 0;
    window.spellingState.score = 0;
    window.spellingState.cluesUsed = 0;
    window.spellingState.currentWordHints = 0;
    window.spellingState.isPlaying = true;
    window.spellingState.wrongAttempts = 0;
    
    window.render();
};

window.checkSpelling = function() {
    const inputEl = document.getElementById('spelling-input-field');
    if(!inputEl) return;
    
    const typed = inputEl.value.trim().toLowerCase();
    const correctWord = window.spellingState.words[window.spellingState.currentIndex].word.trim().toLowerCase();
    
    if (typed === correctWord) {
        let pointsEarned = 10 - (window.spellingState.currentWordHints * 2);
        if (pointsEarned < 0) pointsEarned = 0;
        window.spellingState.score += pointsEarned;
        window.spellingState.wrongAttempts = 0;
        window.playAudio(correctWord);
        alert(pointsEarned > 0 ? "נכון מאוד! 🎉 +" + pointsEarned + " נקודות" : "נכון! 🎉 (ללא ניקוד עקב שימוש ברמזים)");
        window.nextSpellingWord();
    } else {
        window.spellingState.wrongAttempts++;
        if (window.spellingState.wrongAttempts >= 3) {
            alert(`שגוי! 3 ניסיונות כשלו. המילה הנכונה היא: ${window.spellingState.words[window.spellingState.currentIndex].word}`);
            window.spellingState.wrongAttempts = 0;
            window.nextSpellingWord();
        } else {
            alert(`שגוי! נסה שוב. נותרו עוד ${3 - window.spellingState.wrongAttempts} ניסיונות.`);
        }
    }
};

window.spellingHint = function() {
    const inputEl = document.getElementById('spelling-input-field');
    if(!inputEl) return;
    
    const correctWord = window.spellingState.words[window.spellingState.currentIndex].word;
    const currentTyped = inputEl.value;
    
    let nextLetterIdx = currentTyped.length;
    if (nextLetterIdx < correctWord.length) {
        inputEl.value = correctWord.substring(0, nextLetterIdx + 1);
        window.spellingState.cluesUsed++;
        window.spellingState.currentWordHints = (window.spellingState.currentWordHints || 0) + 1;
    }
};

window.nextSpellingWord = function() {
    if (window.spellingState.currentIndex < window.spellingState.words.length - 1) {
        window.spellingState.currentIndex++;
        window.spellingState.wrongAttempts = 0;
        window.spellingState.currentWordHints = 0;
        window.render();
    } else {
        window.spellingState.isPlaying = false;
        alert(`סיימת את תרגול האיות! הציון שלך הוא: ${window.spellingState.score} / 100`);
        window.render();
    }
};

// --- Match Game logic ---
window.startMatchGame = function() {
    const allWords = [];
    Object.values(window.vocabularyData).forEach(dayWords => {
        dayWords.forEach(w => allWords.push(w));
    });
    
    if (allWords.length < 6) {
        alert("אין מספיק מילים במאגר!");
        return;
    }
    
    const selected = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    const cards = [];
    selected.forEach((w, i) => {
        cards.push({ id: `en-${i}`, text: w.word, type: 'en', matchId: i });
        cards.push({ id: `he-${i}`, text: w.meaning, type: 'he', matchId: i });
    });
    
    window.matchState.cards = cards.sort(() => 0.5 - Math.random());
    window.matchState.selectedCard = null;
    window.matchState.timer = 0;
    window.matchState.isPlaying = true;
    
    if (window.matchState.interval) clearInterval(window.matchState.interval);
    window.matchState.interval = setInterval(() => {
        if (window.matchState.isPlaying) {
            window.matchState.timer++;
            const timerEl = document.getElementById('match-timer-display');
            if (timerEl) timerEl.innerText = window.matchState.timer + ' שניות';
        }
    }, 1000);
    
    window.render();
};

window.handleMatchCardClick = function(cardId) {
    if (!window.matchState.isPlaying) return;
    
    const card = window.matchState.cards.find(c => c.id === cardId);
    if (!card || card.matched) return;
    
    const cardEl = document.getElementById(`match-card-${cardId}`);
    
    if (window.matchState.selectedCard === null) {
        window.matchState.selectedCard = card;
        cardEl.classList.add('selected');
    } else {
        const prevCard = window.matchState.selectedCard;
        const prevCardEl = document.getElementById(`match-card-${prevCard.id}`);
        
        if (prevCard.id === card.id) {
            cardEl.classList.remove('selected');
            window.matchState.selectedCard = null;
            return;
        }
        
        if (prevCard.type !== card.type && prevCard.matchId === card.matchId) {
            prevCard.matched = true;
            card.matched = true;
            
            prevCardEl.classList.remove('selected');
            prevCardEl.classList.add('matched');
            cardEl.classList.add('matched');
            
            window.matchState.selectedCard = null;
            
            if (window.matchState.cards.every(c => c.matched)) {
                window.matchState.isPlaying = false;
                clearInterval(window.matchState.interval);
                
                const elapsed = window.matchState.timer;
                const prevBest = window.matchState.bestTime;
                if (!prevBest || elapsed < prevBest) {
                    window.matchState.bestTime = elapsed;
                    localStorage.setItem('fluencyMatchBest', elapsed);
                    alert(`שיא חדש! סיימת ב-${elapsed} שניות! 🏆`);
                } else {
                    alert(`כל הכבוד! סיימת ב-${elapsed} שניות. שיא אישי: ${prevBest} שניות.`);
                }
            }
            window.render();
        } else {
            prevCardEl.classList.remove('selected');
            prevCardEl.classList.add('wrong-match');
            cardEl.classList.add('wrong-match');
            
            window.matchState.selectedCard = null;
            
            setTimeout(() => {
                prevCardEl.classList.remove('wrong-match');
                cardEl.classList.remove('wrong-match');
                window.render();
            }, 500);
        }
    }
};

window.filterSummary = function(val) {
    window.summarySearchQuery = val.trim();
    window.render();
};

window.setDay = function(dayId) { window.stopAudio(); window.currentDay = dayId; window.wordIndex = 0; window.render(); };
window.setSummaryMode = function(mode) { window.summaryMode = mode; window.render(); };
window.goToWord = function(dayId, index) { window.stopAudio(); window.currentDay = dayId; window.currentWeek = window.daysList.find(d => d.id === dayId).week; window.wordIndex = index; window.render(); };
window.changeRate = function(val) { window.speechRate = parseFloat(val); if(window.htmlAudioElement) window.htmlAudioElement.playbackRate = window.speechRate; window.render(); };

window.getSRSIndicator = function(word) {
    const wordKey = word.toLowerCase();
    const srsData = window.srsState[wordKey];
    if (srsData) {
        if (srsData.known === true) {
            const interval = srsData.interval;
            if (interval >= 8) {
                return '<span class="srs-dot mastered" title="שולט" style="color: #10b981; text-shadow: 0 0 10px #10b981; margin-left: 6px; font-size: 14px; cursor: pointer;">●</span>';
            } else {
                return '<span class="srs-dot learning" title="בלמידה" style="color: #a855f7; margin-left: 6px; font-size: 14px; cursor: pointer;">●</span>';
            }
        } else if (srsData.known === false) {
            return '<span class="srs-dot unknown" title="לתרגול" style="color: #ef4444; margin-left: 6px; font-size: 14px; cursor: pointer;">●</span>';
        }
    }
    return '<span class="srs-dot new" title="חדש" style="color: #22d3ee; margin-left: 6px; font-size: 14px; cursor: pointer;">●</span>';
};

window.formatTime = function(seconds) {
    if(isNaN(seconds) || seconds < 0) seconds = 0;
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};

window.htmlAudioElement = null;

window.normalizeAudioText = function(text) {
    if(!text) return "";
    return text.replace(/['"‘`’]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
};

window.playText = function(text, event) {
    if (event) event.stopPropagation();
    window.stopAudio();
    let norm = window.normalizeAudioText(text);
    let hash = window.audioMap ? window.audioMap[norm] : null;
    if(hash) {
        let audio = new Audio('audio/' + hash + '.mp3');
        audio.playbackRate = window.speechRate || 1.0;
        audio.addEventListener('loadedmetadata', function() { audio.playbackRate = window.speechRate || 1.0; });
        audio.addEventListener('canplay', function() { audio.playbackRate = window.speechRate || 1.0; });
        window.htmlAudioElement = audio;
        audio.play().catch(e => {
            console.error("Audio playback failed", e);
            fallbackSpeech(text);
        });
    } else {
        console.warn("Fallback invoked for:", text);
        fallbackSpeech(text);
    }
};

function fallbackSpeech(text) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = window.speechRate || 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US' && v.localService === true) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
}

function fallbackSpeechWithBar(text) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = window.speechRate || 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US' && v.localService === true) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    let wordCount = text.split(' ').length;
    let wps = (130 / 60) * (window.speechRate || 1.0);
    window.audioState.estimatedDuration = wordCount / wps;
    if(window.audioState.estimatedDuration < 1.0) window.audioState.estimatedDuration = 1.0; 
    
    utterance.onstart = function() {
        window.audioPlaying = true;
        if(document.getElementById('audio-player')) document.getElementById('audio-player').classList.add('visible');
        if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.pause;
        if(window.audioState.btnElement) window.audioState.btnElement.classList.add('active');
        
        window.audioState.interval = setInterval(() => {
            if(!window.audioState.isPaused && !window.audioState.isDragging) {
                window.audioState.elapsed += 0.1;
                if(window.audioState.elapsed >= window.audioState.estimatedDuration) {
                    window.audioState.elapsed = window.audioState.estimatedDuration;
                    window.stopAudio();
                    return;
                }
                let pct = (window.audioState.elapsed / window.audioState.estimatedDuration) * 100;
                if(document.getElementById('audio-slider')) document.getElementById('audio-slider').value = pct;
                if(document.getElementById('audio-time-current')) document.getElementById('audio-time-current').innerText = window.formatTime(window.audioState.elapsed);
            }
        }, 100);
    };
    utterance.onend = function() { window.stopAudio(); };
    window.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

window.playAudio = function(text, btnElement) {
    window.stopAudio();
    if (!window.audioState) window.audioState = {};
    window.audioState.fullText = text;
    window.audioState.btnElement = btnElement;
    window.audioState.isPaused = false;
    window.audioState.isDragging = false;
    
    let norm = window.normalizeAudioText(text);
    let hash = window.audioMap ? window.audioMap[norm] : null;
    
    if(hash) {
        let audio = new Audio('audio/' + hash + '.mp3');
        audio.playbackRate = window.speechRate || 1.0;
        audio.addEventListener('loadedmetadata', function() { audio.playbackRate = window.speechRate || 1.0; });
        audio.addEventListener('canplay', function() { audio.playbackRate = window.speechRate || 1.0; });
        window.htmlAudioElement = audio;
        
        audio.addEventListener('loadedmetadata', function() {
            if(document.getElementById('audio-time-total')) {
                document.getElementById('audio-time-total').innerText = window.formatTime(audio.duration);
                document.getElementById('audio-time-current').innerText = "00:00";
                document.getElementById('audio-slider').value = 0;
            }
            if(document.getElementById('audio-player')) document.getElementById('audio-player').classList.add('visible');
            if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.pause;
            if(window.audioState.btnElement) window.audioState.btnElement.classList.add('active');
            window.audioPlaying = true;
        });
        
        audio.addEventListener('timeupdate', function() {
            if(window.audioState && !window.audioState.isDragging && window.htmlAudioElement) {
                let pct = (audio.currentTime / audio.duration) * 100;
                if(document.getElementById('audio-slider')) {
                    document.getElementById('audio-slider').value = pct;
                }
                if(document.getElementById('audio-time-current')) {
                    document.getElementById('audio-time-current').innerText = window.formatTime(audio.currentTime);
                }
            }
        });
        
        audio.addEventListener('ended', function() {
            window.stopAudio();
        });
        
        audio.play().catch(e => {
            console.error("Audio playback failed", e);
            console.warn("Fallback invoked for:", text);
            fallbackSpeechWithBar(text);
        });
    } else {
        console.warn("Fallback invoked for:", text);
        fallbackSpeechWithBar(text);
    }
};

window.togglePlayPause = function() {
    if(!window.audioState) return;
    if(window.htmlAudioElement) {
        if(window.htmlAudioElement.paused) {
            window.htmlAudioElement.play();
            window.audioState.isPaused = false;
            if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.pause;
        } else {
            window.htmlAudioElement.pause();
            window.audioState.isPaused = true;
            if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.play;
        }
    } else if('speechSynthesis' in window && window.speechSynthesis.speaking) {
        if(window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            window.audioState.isPaused = false;
            if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.pause;
        } else {
            window.speechSynthesis.pause();
            window.audioState.isPaused = true;
            if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.play;
        }
    }
};

window.stopAudio = function() {
    if(window.htmlAudioElement) {
        window.htmlAudioElement.pause();
        window.htmlAudioElement = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (window.audioState && window.audioState.interval) {
        clearInterval(window.audioState.interval);
        window.audioState.interval = null;
    }
    window.audioPlaying = false;
    window.currentUtterance = null;
    if(document.getElementById('audio-player')) document.getElementById('audio-player').classList.remove('visible');
    const activeBtns = document.querySelectorAll('.story-audio-btn.active');
    activeBtns.forEach(btn => btn.classList.remove('active'));
};

window.startAudioDrag = function() {
    if (window.audioState) window.audioState.isDragging = true;
};

window.stopAudioDrag = function(val) {
    if (window.audioState) window.audioState.isDragging = false;
    if(window.htmlAudioElement) {
        let newTime = (val / 100) * window.htmlAudioElement.duration;
        window.htmlAudioElement.currentTime = newTime;
    }
};

window.handleSliderInput = function(val) {
    if (!window.audioState) return;
    if(window.htmlAudioElement) {
        let newTime = (val / 100) * window.htmlAudioElement.duration;
        if(document.getElementById('audio-time-current')) {
            document.getElementById('audio-time-current').innerText = window.formatTime(newTime);
        }
    }
};

window.seekRelative = function(secondsOffset) {
    if(!window.audioPlaying || !window.audioState) return;
    if(window.htmlAudioElement) {
        let newTime = window.htmlAudioElement.currentTime + secondsOffset;
        if(newTime < 0) newTime = 0;
        if(newTime > window.htmlAudioElement.duration) newTime = window.htmlAudioElement.duration;
        window.htmlAudioElement.currentTime = newTime;
    }
};

window.nextWord = function() {
    window.stopAudio();
    const currentWords = window.vocabularyData[window.currentDay];
    if (window.wordIndex < currentWords.length - 1) { window.wordIndex++; } 
    else {
        const currentIndex = window.daysList.findIndex(d => d.id === window.currentDay);
        if (currentIndex >= 0 && currentIndex < window.daysList.length - 1) {
            window.currentDay = window.daysList[currentIndex + 1].id;
            window.currentWeek = window.daysList[currentIndex + 1].week;
            window.wordIndex = 0;
        }
    }
    window.render();
};

window.prevWord = function() {
    window.stopAudio();
    if (window.wordIndex > 0) { window.wordIndex--; } 
    else {
        const currentIndex = window.daysList.findIndex(d => d.id === window.currentDay);
        if (currentIndex > 0) {
            window.currentDay = window.daysList[currentIndex - 1].id;
            window.currentWeek = window.daysList[currentIndex - 1].week;
            window.wordIndex = window.vocabularyData[window.currentDay].length - 1;
        }
    }
    window.render();
};

window.toggleArticleView = function(mode) {
    window.articleViewMode = mode;
    window.render();
};

window.toggleArticle = function(index) {
    let card = document.getElementById('article-card-' + index);
    if (card) {
        if(card.classList.contains('expanded')) {
            card.classList.remove('expanded');
        } else {
            document.querySelectorAll('.story-card').forEach(c => c.classList.remove('expanded'));
            card.classList.add('expanded');
        }
    }
};

window.toggleParagraph = function(index) {
    let card = document.getElementById('article-paragraph-card-' + index);
    if (card) {
        if (card.classList.contains('expanded')) {
            card.classList.remove('expanded');
        } else {
            card.classList.add('expanded');
        }
    }
};

window.highlightText = function(text) {
    const keyTerms = [
        "Operating System", "OS", "Unix", "Bell Labs", "Ken Thompson", "Dennis Ritchie", "Linux", "macOS",
        "process management", "process", "scheduling", "scheduler", "CPU", 
        "memory management", "RAM", "virtual memory", "storage device", 
        "file management", "directories", "folders", "file system",
        "device management", "hardware components", "device drivers", "drivers",
        "Security", "user authentication", "access control", "encryption", "cyberattacks", "malicious software",
        "smartphones", "Android", "iOS", "cloud servers", "Confidentiality", "Integrity", "Availability", "CIA Triad", "cybersecurity", "phishing", "ransomware", "encryption", "access controls", "digital signatures", "audit logs", "hash functions", "DataSafe"
    ];
    let highlighted = text;
    keyTerms.sort((a,b) => b.length - a.length).forEach(w => {
        let escapedWord = w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let regex = new RegExp('\\b(' + escapedWord + ')(s|es|ed|d|ing|ly)?\\b', 'gi');
        highlighted = highlighted.replace(regex, function(match, p1, p2, offset, string) {
            const before = string.substring(0, offset);
            if ((before.match(/<span/g) || []).length > (before.match(/<\/span>/g) || []).length) return match; 
            return '<span class="highlight-word">' + match + '</span>';
        });
    });
    return highlighted;
};

window.setDifficulty = function(diff) { window.quizDifficulty = diff; window.render(); }

window.setQuizTargetWeek = function(target) { window.quizTargetWeek = target; window.render(); };

window.startQuiz = function() {
    let fullDB = [];
    let targetWeek = window.quizTargetWeek;
    if (!targetWeek && window.currentWeek && window.currentWeek !== 'quiz') {
        targetWeek = window.currentWeek;
    }
    
    if (targetWeek && targetWeek.includes('week8')) fullDB = window.unseenDB;
    else if (targetWeek && targetWeek.includes('week9')) fullDB = window.ciaTriadDB;
    else if (targetWeek && targetWeek.includes('week10')) fullDB = window.week10DB;
    else fullDB = [...window.unseenDB, ...window.ciaTriadDB, ...window.week10DB];

    let availableQuestions = fullDB.filter(q => q.diff === window.quizDifficulty || window.quizDifficulty === 'medium');
    if (window.quizDifficulty === 'hard') availableQuestions = fullDB; 
    let shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    let selectedQs = shuffled.slice(0, 23);

    window.quizQuestions = selectedQs.map(target => {
        let correctText = target.options[target.ans];
        let mixedOptions = [...target.options].sort(() => 0.5 - Math.random());
        let correctIndex = mixedOptions.indexOf(correctText);
        return { question: target.q, options: mixedOptions, correctIndex: correctIndex, answered: false, selectedOption: null };
    });

    window.quizState = 'playing';
    window.currentQuizIndex = 0;
    window.quizScore = 0;
    window.render();
};

window.handleAnswer = function(index) {
    let q = window.quizQuestions[window.currentQuizIndex];
    if (q.answered) return;
    q.answered = true;
    q.selectedOption = index;
    if (index === q.correctIndex) { window.quizScore += 10; }
    window.render();
};

window.nextQuizQuestion = function() {
    if (window.currentQuizIndex < window.quizQuestions.length - 1) { 
        window.currentQuizIndex++; 
    } else {
        window.quizState = 'end';
        const now = new Date();
        const dateStr = now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'});
        window.quizHistory.unshift({ score: window.quizScore, date: dateStr, diff: window.quizDifficulty });
        if (window.quizHistory.length > 10) window.quizHistory.pop();
        if (window.quizScore > window.highScore) window.highScore = window.quizScore;
        try { 
            localStorage.setItem('fluencyUnseenHighScore', window.highScore); 
            localStorage.setItem('fluencyUnseenHistory', JSON.stringify(window.quizHistory));
        } catch(e) {}
    }
    window.render();
};

window.showQuizHistory = function() { window.quizState = 'history'; window.render(); }

window.clearQuizHistory = function() {
    if(confirm("האם אתה בטוח שברצונך למחוק את היסטוריית הבחנים?")) {
        window.quizHistory = [];
        window.highScore = 0;
        try { localStorage.removeItem('fluencyUnseenHighScore'); localStorage.removeItem('fluencyUnseenHistory'); } catch(e) {}
        window.quizState = 'start';
        window.render();
    }
}

window.getArtClass = function(word) {
    const categories = {
        'ocean': ['Deep', 'Mud'], 'auction': ['Auction', 'Bid'], 'market': ['Purchase', 'Customer', 'Items', 'Pair', 'Objects', 'Comb'],
        'finance-up': ['Advance', 'Wages', 'Amount', 'Provided', 'Raising', 'Capable', 'Contributors', 'Addition'], 'finance-down': ['Lowest', 'Reduce', 'Debt', 'Waive', 'Spent', 'Weak', 'Badly'],
        'chart-pie': ['Minority', 'Surveys', 'Plenty', 'Approximately', 'Thirds', 'Population', 'Studies', 'Proven'], 'tech': ['Appliances', 'Tone', 'Exists', 'Applications', 'Program', 'Processes'],
        'book': ['Instructed', 'Sum up', 'Treatment', 'Requirement', 'Solve', 'Faithful', 'Arise', 'Perhaps', 'Phrases', 'Task', 'College', 'Graduating', 'Fluently', 'Adulthood'],
        'mind': ['Obsession', 'Habits', 'Addiction', 'Wonder', 'Exaggeration', 'Convince', 'Ridiculously', 'Biased', 'Scratch Itches', 'Independent', 'Sense', 'Confusion', 'Pre-prejudiced', 'Convinced', 'Attitude', 'Influences'],
        'doorway': ['Opportunity', 'Permission', 'Proceed', 'Suggest', 'Apply'], 'danger': ['Illegal', 'Trapped', 'Barrier', 'Reject', 'Unscrupulous', 'Unfortunate', 'Forced', 'Accident', 'Opposed'],
        'weather': ['Literally', 'Consequently', 'Despair', 'Helplessness'], 'time': ['Nowadays', 'Due', 'Rushing'], 'party': ['Ceremonies', 'Attendees', 'Amusing', 'Participants'],
        'court': ['Commissioner', 'Accusations', 'Proper', 'Rightfully', 'Certainly'], 'sound': ['Insist', 'Denies', 'Mentioned', 'Resist', 'Exposed', 'Respond', 'Actually', 'Somewhat', 'Rather than', 'Instance'],
        'build': ['Bricks', 'Kiln', 'Kneading', 'Shape', 'Designed'], 'space': ['Trade-Unions', 'Immense', 'Purely', 'View'], 'medical': ['Nursing', 'Paralyzed', 'Arm(s)', 'Hair', 'Human'],
        'magic': ['Idea', 'Significance'], 'nature': ['Poisonous', 'Barefoot', 'Companion', 'Fetch'], 'laser': ['Laser beam'], 'theater': ['Perform'],
        'city': ['Dormitories', 'Institutions', 'Organization', 'Owners']
    };
    if (['Receive', 'Runs It', 'Split', 'Fade', 'Protect', 'Flexibility', 'Languages'].includes(word)) return 'art-bespoke';
    for (const [theme, words] of Object.entries(categories)) { if (words.includes(word)) return `art-${theme}`; }
    return 'art-museum';
};

window.getCustomArtHTML = function(word, visual) {
    const artClass = window.getArtClass(word);
    let inner = '';
    if (word === 'Receive') inner = `<div class="gift-box"></div><div class="gift-lid"></div><div class="art-emoji-hero float-anim" style="z-index: 5;">${visual}</div>`;
    else if (word === 'Runs It') inner = `<div class="gear" style="left: 0; right: 20vh; margin: auto;"></div><div class="gear-small" style="position:absolute; left: 20vh; right: 0; margin: auto;"></div><div class="art-emoji-hero" style="z-index: 10; filter: drop-shadow(0 0 2vh #fff);">${visual}</div>`;
    else if (word === 'Split') inner = `<div class="split-left"></div><div class="split-right"></div><div class="art-emoji-hero">${visual}</div>`;
    else if (word === 'Fade') inner = `<div class="fade-bg"></div><div class="art-emoji-hero" style="animation: fadeAnim 3s infinite alternate;">${visual}</div>`;
    else if (word === 'Protect') inner = `<div class="shield-pulse"></div><div class="art-emoji-hero">${visual}</div>`;
    else if (word === 'Flexibility') inner = `<div class="flex-band"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (word === 'Languages') inner = `<div class="lang-symbol" style="top:20%; left:20%; animation-delay:0s;">A</div><div class="lang-symbol" style="top:60%; right:20%; animation-delay:0.5s;">あ</div><div class="lang-symbol" style="top:80%; left:40%; animation-delay:1s;">א</div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-ocean') inner = `<div class="wave-line"></div><div class="ruler"><div class="tick" style="top: 10%;"></div><div class="tick" style="top: 30%;"></div><div class="tick" style="top: 50%;"></div><div class="tick" style="top: 70%;"></div><div class="tick" style="top: 90%;"></div></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-auction') inner = `<div class="desk"></div><div class="art-emoji-hero anim-slam">${visual}</div>`;
    else if (artClass === 'art-build') inner = `<div class="fire-glow"></div><div class="art-emoji-hero">${visual}</div>`;
    else if (artClass === 'art-market') inner = `<div class="laser-scanner"></div><div class="shelf"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-pie-chart') inner = `<div class="pie-bg"></div><div class="art-emoji-hero" style="z-index: 20;">${visual}</div>`;
    else if (artClass === 'art-chart-down') inner = `<div class="chart-axis-down"></div><div class="trend-line-down"></div><div class="art-emoji-hero anim-drop">${visual}</div>`;
    else if (artClass === 'art-chart-up' || artClass === 'art-finance-up') inner = `<div class="chart-axis-down" style="border-color:#10b981;"></div><div class="trend-line-down" style="border-color:#6ee7b7; box-shadow: inset -1.5vh 1.5vh 3vh rgba(16,185,129,0.3); transform: skewY(-30deg); bottom:20%; top:auto;"></div><div class="art-emoji-hero anim-rise">${visual}</div>`;
    else if (artClass === 'art-doorway') inner = `<div class="door-frame"></div><div class="art-emoji-hero float-anim" style="filter: drop-shadow(0 0 3vh #fef08a);">${visual}</div>`;
    else if (artClass === 'art-mind') inner = `<div class="pulse-ring"></div><div class="pulse-ring" style="animation-delay: 1.5s; width: 40vh; height: 40vh;"></div><div class="art-emoji-hero">${visual}</div>`;
    else if (artClass === 'art-museum') inner = `<div class="spotlight"></div><div class="pedestal"></div><div class="art-emoji-hero float-anim" style="bottom: 25%;">${visual}</div>`;
    else if (artClass === 'art-nature') inner = `<div class="sun-beam"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-law' || artClass === 'art-danger') inner = `<div class="laser-grid"></div><div class="vignette"></div><div class="art-emoji-hero" style="z-index: 10;">${visual}</div>`;
    else if (artClass === 'art-time') inner = `<div class="clock-face"><div class="hand"></div></div><div class="art-emoji-hero" style="z-index: 20;">${visual}</div>`;
    else if (artClass === 'art-sound') inner = `<div class="sound-bars"><div class="bar" style="animation-delay: 0.1s"></div><div class="bar" style="animation-delay: 0.3s; height: 60%;"></div><div class="bar" style="animation-delay: 0.5s; height: 100%;"></div><div class="bar" style="animation-delay: 0.2s; height: 50%;"></div></div><div class="art-emoji-hero">${visual}</div>`;
    else if (artClass === 'art-electricity' || artClass === 'art-tech' || artClass === 'art-weather') inner = `<div class="circuit-grid"></div><div class="art-emoji-hero pulse-anim">${visual}</div>`;
    else if (artClass === 'art-space') inner = `<div class="planet"></div><div class="star" style="top:20%; left:20%;"></div><div class="star" style="top:40%; right:30%;"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-medical') inner = `<div class="med-cross-v"></div><div class="med-cross-h"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (artClass === 'art-magic') inner = `<div class="magic-sparkle" style="top:20%;left:30%;">✨</div><div class="magic-sparkle" style="top:60%;right:30%;animation-delay:0.5s;">✨</div><div class="art-emoji-hero pulse-anim">${visual}</div>`;
    else if (artClass === 'art-theater') inner = `<div class="stage-floor"></div><div class="curtain-left"></div><div class="curtain-right"></div><div class="spotlight"></div><div class="art-emoji-hero float-anim" style="bottom: 20%;">${visual}</div>`;
    else if (artClass === 'art-city') inner = `<div class="building-1"></div><div class="building-2"><div class="window" style="top:10%; left:20%"></div><div class="window" style="top:30%; left:60%"></div></div><div class="building-3"></div><div class="art-emoji-hero float-anim" style="bottom: 30%;">${visual}</div>`;
    else if (word === 'Poisonous') inner = `<div class="poison-bubble" style="left:30%"></div><div class="poison-bubble" style="left:60%; animation-delay:1.5s; width:4vh; height:4vh;"></div><div class="poison-bubble" style="left:45%; animation-delay:0.7s; width:2vh; height:2vh;"></div><div class="art-emoji-hero" style="animation: floatSub 4s infinite alternate; filter: drop-shadow(0 0 3vh #22c55e);">${visual}</div>`;
    else if (word === 'Antique') inner = `<div class="spotlight-gold"></div><div class="gold-dust" style="top:30%;left:40%;animation-delay:0.2s;"></div><div class="gold-dust" style="top:50%;left:60%;animation-delay:0.7s;"></div><div class="gold-dust" style="top:60%;left:35%;animation-delay:1.1s;"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (word === 'Kiln') inner = `<div class="kiln-fire"></div><div class="kiln-brick"></div><div class="art-emoji-hero" style="bottom:45%; animation: floatSub 4s infinite alternate;">${visual}</div>`;
    else if (word === 'Literally') inner = `<div class="measure-grid"></div><div class="measure-line"></div><div class="measure-cross"></div><div class="art-emoji-hero pulse-anim">${visual}</div>`;
    else if (word === 'Fetch') inner = `<div class="fetch-stick"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (word === 'Scratch Itches') inner = `<div class="scratch-mark"></div><div class="scratch-mark"></div><div class="scratch-mark"></div><div class="art-emoji-hero pulse-anim">${visual}</div>`;
    else if (word === 'Plenty') inner = `<div class="coin" style="left: 20%; animation-delay: 0s;"></div><div class="coin" style="left: 40%; animation-delay: 0.5s;"></div><div class="coin" style="left: 60%; animation-delay: 0.2s;"></div><div class="coin" style="left: 80%; animation-delay: 0.7s;"></div><div class="art-emoji-hero float-anim">${visual}</div>`;
    else if (word === 'Independent') inner = `<div class="chain chain-break-left" style="top: 30%; left: 40%;"></div><div class="chain chain-break-right" style="top: 30%; left: 55%;"></div><div class="art-emoji-hero float-anim" style="z-index: 10;">${visual}</div>`;
    else if (word === 'Owners') inner = `<div class="house-silhouette"></div><div class="key-glow" style="top: 20%; left: 50%; transform: translateX(-50%);"></div><div class="art-emoji-hero float-anim" style="bottom: 30%;">${visual}</div>`;
    else if (word === 'Accident') inner = `<div class="siren"></div><div style="position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; z-index: 15;"><div class="glass-crack"></div><div class="glass-crack"></div><div class="glass-crack"></div></div><div class="art-emoji-hero" style="animation: slam 1s forwards;">${visual}</div>`;
    else inner = `<div class="pedestal"></div><div class="art-emoji-hero float-anim" style="bottom:25%;">${visual}</div>`;
    
    let bgStyle = '';
    if (word === 'Receive') bgStyle = 'background: radial-gradient(circle, #4c1d95, #020617);';
    else if (word === 'Poisonous') bgStyle = 'background: linear-gradient(to top, #14532d, #020617);';
    else if (word === 'Antique') bgStyle = 'background: linear-gradient(to bottom, #1e293b 40%, #0f172a 100%);';
    else if (word === 'Kiln') bgStyle = 'background: #450a0a;';
    else if (word === 'Literally') bgStyle = 'background: #0f172a;';
    else if (word === 'Scratch Itches') bgStyle = 'background: #fcd34d;';
    else if (word === 'Plenty') bgStyle = 'background: radial-gradient(circle, #0f766e, #020617);';
    else if (word === 'Independent') bgStyle = 'background: linear-gradient(to bottom, #0284c7, #0ea5e9, #38bdf8);';
    else if (word === 'Owners') bgStyle = 'background: linear-gradient(to bottom, #1e1b4b, #020617);';

    return `<div class="art-inner-container ${artClass}" style="${bgStyle}">${inner}</div>`;
};

window.render = function() {
    const app = document.getElementById('content-area');
    const subNavContainer = document.getElementById('sub-nav-container');

    // Highlight active sidebar button
    document.querySelectorAll('.side-nav-btn').forEach(btn => {
        btn.classList.remove('active-theme');
    });
    
    let activeWeek = window.currentWeek;
    if (activeWeek === 'week10vocab' || activeWeek === 'week10') activeWeek = 'week10';
    if (activeWeek === 'week9vocab' || activeWeek === 'week9') activeWeek = 'week9';
    if (activeWeek === 'article' || activeWeek === 'week8') activeWeek = 'week8';
    let activeBtnId = 'side-btn-' + activeWeek;
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) {
        activeBtn.classList.add('active-theme');
    }

    if (window.currentWeek !== 'home' && window.currentWeek !== 'focus' && window.currentWeek !== 'summary' && window.currentWeek !== 'quiz' && window.currentWeek !== 'article' && window.currentWeek !== 'week9' && window.currentWeek !== 'week10') {
        subNavContainer.style.display = 'flex';
        const weekDays = window.daysList.filter(d => d.week === window.currentWeek);
        let subNavHtml = '';
        weekDays.forEach(d => {
            const isActive = window.currentDay === d.id ? 'active' : '';
            subNavHtml += `<button class="sub-btn ${isActive}" onclick="window.setDay('${d.id}')"><span class="sub-btn-title">${d.title}</span><span class="sub-btn-date">${d.date}</span></button>`;
        });
        subNavContainer.innerHTML = subNavHtml;
    } else {
        subNavContainer.style.display = 'none';
        subNavContainer.innerHTML = '';
    }

    if (window.currentWeek === 'home') {
        let homeHtml = `
            <div class="home-wrapper">
                <div class="home-section-title" style="border:none; justify-content:center; text-align:center; margin-bottom: 15px;">
                    <span style="font-size: clamp(28px, 4vh, 50px); font-weight: 900; background: linear-gradient(to right, var(--theme-light), var(--emerald-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">דף הבית</span>
                </div>
                
                <!-- 🎯 Weekly Focus Card -->
                <div class="home-card focus-glow" style="background: rgba(15, 23, 42, 0.45); border: 1px solid var(--theme-main); box-shadow: 0 0 15px var(--theme-glow); margin-bottom: 25px; flex-direction: column; align-items: stretch; gap: 15px; border-radius: 15px; padding: 20px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">🎯</span>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: 900; color: #fff;">מיקוד שבועי: שבוע 10 (HTTPS)</div>
                                <div style="font-size: 13px; color: var(--text-muted); margin-top: 3px;">החומרים הכי רלוונטיים ומעודכנים לתרגול מהיר</div>
                            </div>
                        </div>
                        <span class="srs-badge srs-mastered" style="margin: 0; background: var(--theme-main); color: #fff; animation: pulseGlow 1.5s infinite alternate; font-size: 12px; padding: 4px 8px; border-radius: 4px; box-shadow: 0 0 8px var(--theme-glow);">מיקוד 🎯</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%;">
                        <button class="control-btn" style="justify-content: center; padding: 10px; font-size: 13px; cursor: pointer;" onclick="window.goToWord('w10d1', 0)">
                            📚 אוצר מילים
                        </button>
                        <button class="control-btn" style="justify-content: center; padding: 10px; font-size: 13px; cursor: pointer;" onclick="window.setWeek('week10')">
                            🔐 קריאת מאמר
                        </button>
                        <button class="control-btn" style="justify-content: center; padding: 10px; font-size: 13px; cursor: pointer;" onclick="window.setQuizTargetWeek('week10'); window.setWeek('quiz'); window.startQuiz();">
                            🧠 מבחן ממוקד
                        </button>
                    </div>
                </div>

                <h3 class="home-section-title">שלבי הלימוד</h3>
                <div class="home-list">
                    <div class="home-card-row">
                        <span class="home-card-number">1</span>
                        <button class="home-card" onclick="window.setWeek('week1')">
                            <div class="home-card-icon">📖</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 4</div>
                                <div class="home-card-desc">אוצר מילים ויסודות. בסיס חזק להמשך הדרך.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">2</span>
                        <button class="home-card" onclick="window.setWeek('week2')">
                            <div class="home-card-icon">📚</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 5</div>
                                <div class="home-card-desc">המשך בניית אוצר מילים ושילוב משפטים.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">3</span>
                        <button class="home-card" onclick="window.setWeek('week3')">
                            <div class="home-card-icon">🎓</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 6</div>
                                <div class="home-card-desc">ביטויים מתקדמים ואוצר מילים מורכב.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">4</span>
                        <button class="home-card" onclick="window.setWeek('week7')">
                            <div class="home-card-icon">🚀</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 7</div>
                                <div class="home-card-desc">השלב הסופי - מילים מתקדמות לבחינה.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">5</span>
                        <button class="home-card" onclick="window.setWeek('week8')">
                            <div class="home-card-icon">📄</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 8</div>
                                <div class="home-card-desc">אוצר מילים ומאמר - מערכות הפעלה.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">6</span>
                        <button class="home-card" onclick="window.goToWord('w9d1', 0)">
                            <div class="home-card-icon">🔐</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 9</div>
                                <div class="home-card-desc">אוצר מילים ומאמר - משולש ה-CIA.</div>
                            </div>
                        </button>
                    </div>
                    <div class="home-card-row">
                        <span class="home-card-number">7</span>
                        <button class="home-card" onclick="window.setWeek('week10')">
                            <div class="home-card-icon">🌐</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 10</div>
                                <div class="home-card-desc">מאמר קריאה - מעבר ל-HTTPS.</div>
                            </div>
                        </button>
                    </div>
                </div>

                <h3 class="home-section-title">תרגול ומבחנים</h3>
                <div class="home-list">
                    <button class="home-card" onclick="window.setWeek('quiz')">
                        <div class="home-card-icon">🧠</div>
                        <div class="home-card-content">
                            <div class="home-card-title">מבחן חכם</div>
                            <div class="home-card-desc">תרגול 23 שאלות הבנה מתוך המאמר שקראת.</div>
                        </div>
                    </button>
                    <button class="home-card" onclick="window.setWeek('summary')">
                        <div class="home-card-icon">🗂️</div>
                        <div class="home-card-content">
                            <div class="home-card-title">סיכום לפי מילים</div>
                            <div class="home-card-desc">כל 240 המילים במקום אחד, מוכנות לחזרה.</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        app.innerHTML = homeHtml;
    } else if (window.currentWeek === 'article' || window.currentWeek === 'week9' || window.currentWeek === 'week10') {
        const isWeek9 = window.currentWeek === 'week9';
        const isWeek10 = window.currentWeek === 'week10';
        const articleData = isWeek10 ? window.httpsArticleData : (isWeek9 ? window.ciaTriadArticleData : window.unseenArticleData);
        const title = isWeek10 ? "HTTP to HTTPS Transition" : (isWeek9 ? "The CIA Triad in Information Security" : "Operating Systems: Unseen");
        const subtitle = isWeek9 ? "עקרונות אבטחת מידע - בחר מצב תצוגה ולחץ על כרטיסייה לתרגום." : "מאמר המבחן הרשמי. בחר מצב תצוגה ולחץ על כרטיסייה לתרגום.";
        
        let htmlBlock = `
            <div class="top-bar" style="max-width: 1400px; margin: 0 auto 15px auto; justify-content: center; flex-wrap: wrap; gap: 1vw;">
                <div class="settings-box">
                    ${window.icons.settings}
                    <select onchange="window.changeRate(this.value)">
                        <option value="0.3" ${window.speechRate === 0.3 ? 'selected' : ''}>סופר איטי (0.3x)</option>
                        <option value="0.4" ${window.speechRate === 0.4 ? 'selected' : ''}>איטי מאוד (0.4x)</option>
                        <option value="0.6" ${window.speechRate === 0.6 ? 'selected' : ''}>איטי (0.6x)</option>
                        <option value="0.85" ${window.speechRate === 0.85 ? 'selected' : ''}>רגיל-איטי (0.85x)</option>
                        <option value="1" ${window.speechRate === 1 ? 'selected' : ''}>רגיל (1.0x)</option>
                    </select>
                </div>
                <div class="settings-box" style="background: rgba(255, 255, 255, 0.05); border-color: var(--theme-main); padding: 5px 10px; border-radius: 8px;">
                    ${isWeek10 ? `<button class="nav-btn" style="background:var(--theme-main); color:#fff; border:none; margin-right:10px;" onclick="window.goToWord('w10d1', 0)">📚 אוצר מילים</button>` : ''}
${isWeek9 ? `<button class="nav-btn" style="background:var(--theme-main); color:#fff; border:none; margin-right:10px;" onclick="window.goToWord('w9d1', 0)">📚 אוצר מילים</button>` : ''}
${window.currentWeek === 'article' ? `<button class="nav-btn" style="background:var(--theme-main); color:#fff; border:none; margin-right:10px;" onclick="window.setWeek('week8')">📚 אוצר מילים</button>` : ''}
<button class="nav-btn ${window.articleViewMode === 'sentence' ? 'active-theme' : ''}" onclick="window.toggleArticleView('sentence')" style="border:none; margin:0; padding: 4px 10px;">משפטים</button>
                    <button class="nav-btn ${window.articleViewMode === 'paragraph' ? 'active-theme' : ''}" onclick="window.toggleArticleView('paragraph')" style="border:none; margin:0; padding: 4px 10px;">פסקאות</button>
                    <button class="nav-btn ${window.articleViewMode === 'article' ? 'active-theme' : ''}" onclick="window.toggleArticleView('article')" style="border:none; margin:0; padding: 4px 10px;">מאמר שלם</button>
                </div>
            </div>
            <div class="story-container">
                <div class="story-header">
                    <h2 class="story-title" style="color: ${isWeek10 ? 'var(--cyan-light)' : (isWeek9 ? 'var(--cyan-light)' : 'var(--purple-light)')}; text-shadow: 0 0 1.5vh ${isWeek10 ? 'rgba(34,211,238,0.5)' : (isWeek9 ? 'rgba(34,211,238,0.5)' : 'rgba(168,85,247,0.5)')};">${title}</h2>
                    <p class="story-subtitle">${subtitle}</p>
                </div>
        `;
        
        if (window.articleViewMode === 'sentence') {
            htmlBlock += articleData.map((item, index) => {
                const safeText = item.e.replace(/'/g, "\\\'").replace(/"/g, "&quot;");
                return `
                    <div id="article-card-${index}" class="story-card" onclick="window.toggleArticle(${index})">
                        <div class="story-eng-row">
                            <button class="story-audio-btn" onclick="event.stopPropagation(); window.playAudio('${safeText}', this)" title="השמע משפט">
                                ${window.icons.volume}
                            </button>
                            <div class="story-eng-text" style="text-align: left; direction: ltr;">
                                <span style="font-size: 1.2em; margin-right: 0.5vw;">${item.j}</span>
                                <span>${window.highlightText(item.e)}</span>
                            </div>
                        </div>
                        <div class="story-heb-text" dir="rtl" style="text-align: right;">${item.h}</div>
                    </div>
                `;
            }).join('');
        } else if (window.articleViewMode === 'paragraph') {
            const paragraphs = window.articleParagraphs[isWeek10 ? 'week10' : (isWeek9 ? 'week9' : 'week8')];
            htmlBlock += paragraphs.map((paraIndices, index) => {
                const paraEnglish = paraIndices.map(idx => articleData[idx].e).join(" ");
                const paraHebrew = paraIndices.map(idx => articleData[idx].h).join(" ");
                const plainEnglish = paraIndices.map(idx => articleData[idx].e).join(" ");
                const safeText = plainEnglish.replace(/'/g, "\\\'").replace(/"/g, "&quot;");
                
                return `
                    <div id="article-paragraph-card-${index}" class="story-card" onclick="window.toggleParagraph(${index})">
                        <div style="display:flex; justify-content:center; margin-bottom: 15px;">
                            <button class="story-audio-btn" style="width: 50px; height: 50px;" onclick="event.stopPropagation(); window.playAudio('${safeText}', this)" title="השמע פסקא">
                                ${window.icons.volume}
                            </button>
                        </div>
                        <div class="story-eng-text" style="display: block !important; text-align: left; direction: ltr; font-size: clamp(24px, 2.2rem, 36px); line-height: 1.6;">
                            ${window.highlightText(paraEnglish)}
                        </div>
                        <div class="story-heb-text" dir="rtl" style="text-align: right; font-size: clamp(22px, 2.0rem, 32px); line-height: 1.6; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px; padding-right: 0 !important; color: var(--theme-light);">
                            ${paraHebrew}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // Whole Article mode
            const fullEnglish = articleData.map(item => item.e).join(" ");
            const fullHebrew = articleData.map(item => item.h).join(" ");
            const safeText = fullEnglish.replace(/'/g, "\\\'").replace(/"/g, "&quot;");
            
            const paragraphs = window.articleParagraphs[isWeek10 ? 'week10' : (isWeek9 ? 'week9' : 'week8')];
            const engParasHtml = paragraphs.map(paraIndices => {
                const paraText = paraIndices.map(idx => articleData[idx].e).join(" ");
                return `<p style="margin-bottom: 25px; text-align: left; direction: ltr; font-size: clamp(24px, 2.2rem, 36px); line-height: 1.6; font-family: Georgia, serif;">${window.highlightText(paraText)}</p>`;
            }).join('');

            const hebParasHtml = paragraphs.map(paraIndices => {
                const paraText = paraIndices.map(idx => articleData[idx].h).join(" ");
                return `<p style="margin-bottom: 25px; text-align: right; direction: rtl; font-size: clamp(22px, 2.0rem, 32px); line-height: 1.6; color: var(--theme-light);">${paraText}</p>`;
            }).join('');

            htmlBlock += `
                <div class="story-card" style="cursor: pointer; padding: 30px;" onclick="this.classList.toggle('expanded')">
                    <div style="display:flex; justify-content:center; margin-bottom: 20px;">
                        <button class="story-audio-btn" style="width: 70px; height: 70px;" onclick="event.stopPropagation(); window.playAudio('${safeText}', this)" title="השמע הכל">
                            ${window.icons.volume}
                        </button>
                    </div>
                    <div class="story-eng-text" style="display: block !important;">
                        ${engParasHtml}
                    </div>
                    <div class="story-heb-text" dir="rtl" style="border-top: 2px dashed rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px; padding-right: 0 !important;">
                        ${hebParasHtml}
                    </div>
                </div>
            `;
        }
        
        htmlBlock += `
                <div style="display:flex; justify-content:center; margin-top: 30px;">
                    <button class="control-btn" style="background: var(--theme-main); border:none; box-shadow: 0 1vh 2vh var(--theme-glow);" onclick="window.setWeek('quiz')">
                        התחל מבחן ${isWeek10 ? 'שבוע 10' : (isWeek9 ? 'שבוע 9' : 'Unseen')} 🧠
                    </button>
                </div>
            </div>
        `;
        app.innerHTML = htmlBlock;
    } else if (window.currentWeek === 'games') {
        let gamesHtml = '';
        if (window.spellingState.isPlaying) {
            // Spelling game screen
            const currentWordObj = window.spellingState.words[window.spellingState.currentIndex];
            gamesHtml = `
                <div class="center-stage" style="padding: 4vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh; width:100%;">
                    <h2 style="font-size: 2.5rem; color: var(--theme-light); margin-bottom: 3vh;">תרגול איות ✍️</h2>
                    <div class="top-bar" style="margin-bottom: 2vh;">
                        <span>מילה ${window.spellingState.currentIndex + 1} מתוך 10</span>
                        <span>ניקוד: ${window.spellingState.score}</span>
                    </div>
                    <div class="flashcard" style="padding: 30px; gap: 20px;">
                        <button class="audio-btn" style="margin: 0 auto; width: 60px; height: 60px;" onclick="window.playAudio('${currentWordObj.word.replace(/'/g, "\\'")}')" title="שמע שוב">
                            ${window.icons.volume}
                        </button>
                        <div style="font-size: 24px; color: var(--emerald-light); font-weight: bold; margin: 10px 0;">${currentWordObj.meaning}</div>
                        <div class="spelling-box">
                            <input type="text" id="spelling-input-field" class="spelling-input" placeholder="הקלד באנגלית כאן..." autofocus autocomplete="off" onkeydown="if(event.key==='Enter') window.checkSpelling()">
                            <div style="display:flex; gap:10px; width:100%; max-width:400px; margin-top:10px;">
                                <button onclick="window.checkSpelling()" class="control-btn" style="flex:2; justify-content:center;">בדוק 🔍</button>
                                <button onclick="window.spellingHint()" class="control-btn" style="flex:1; justify-content:center; background:rgba(253,224,71,0.15); border-color:#fde047; color:#fde047;">רמז 💡</button>
                            </div>
                        </div>
                    </div>
                    <button onclick="window.setWeek('games')" class="control-btn" style="width:100%; justify-content:center; margin-top:15px; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.2);">עצור תרגול 🔙</button>
                </div>
            `;
        } else if (window.matchState.isPlaying) {
            // Match game screen
            gamesHtml = `
                <div class="center-stage" style="padding: 20px; max-width: 900px; margin: auto; text-align: center; margin-top: 3vh; width:100%;">
                    <h2 style="font-size: 2.3rem; color: var(--theme-light); margin-bottom: 2vh;">משחק התאמה 🧩</h2>
                    <div class="top-bar" style="margin-bottom: 2vh; max-width:800px; margin: 0 auto 15px auto;">
                        <span id="match-timer-display" style="font-size:18px; font-weight:bold; color:var(--theme-light);">0 שניות</span>
                        <span style="font-size:16px;">שיא אישי: ${window.matchState.bestTime ? window.matchState.bestTime + ' שניות' : 'אין עדיין'} 🏆</span>
                    </div>
                    
                    <div class="match-grid">
                        ${window.matchState.cards.map(card => {
                            let cardClass = 'match-card';
                            if (card.matched) cardClass += ' matched';
                            else if (window.matchState.selectedCard && window.matchState.selectedCard.id === card.id) cardClass += ' selected';
                            
                            return `
                                <div id="match-card-${card.id}" class="${cardClass}" onclick="window.handleMatchCardClick('${card.id}')">
                                    <span style="font-size:18px; line-height:1.2;">${card.text}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <button onclick="window.setWeek('games')" class="control-btn" style="width:100%; max-width:300px; justify-content:center; margin:20px auto 0 auto; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.2);">סיים משחק 🔙</button>
                </div>
            `;
        } else {
            // Games dashboard selection
            gamesHtml = `
                <div class="center-stage" style="padding: 4vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh; width:100%;">
                    <div style="font-size: 4rem; margin-bottom: 2vh;">🎮</div>
                    <h2 style="font-size: 2.5rem; color: var(--theme-light); margin-bottom: 2vh;">משחקי למידה</h2>
                    <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 4vh;">שפר את איות המילים ואת זיכרון הזיהוי שלך באמצעות משחקים אינטראקטיביים!</p>
                    
                    <div class="home-list">
                        <button class="home-card purple" onclick="window.startSpellingGame()">
                            <div class="home-card-icon">✍️</div>
                            <div class="home-card-content">
                                <div class="home-card-title">איות מילים (Spelling)</div>
                                <div class="home-card-desc">שמע את המילה, הקלד אותה באנגלית וקבל משוב מיידי וציון!</div>
                            </div>
                        </button>
                        
                        <button class="home-card cyan" onclick="window.startMatchGame()">
                            <div class="home-card-icon">🧩</div>
                            <div class="home-card-content">
                                <div class="home-card-title">משחק התאמה (Match Game)</div>
                                <div class="home-card-desc">התאם במהירות מילים באנגלית לפירושן בעברית נגד השעון!</div>
                            </div>
                        </button>
                    </div>
                </div>
            `;
        }
        app.innerHTML = gamesHtml;
        
    } else if (window.currentWeek === 'stats') {
        // Stats dashboard screen
        const allWords = [];
        Object.values(window.vocabularyData).forEach(dayWords => {
            dayWords.forEach(w => allWords.push(w));
        });
        const totalWordsCount = allWords.length;
        
        let masteredCount = 0;
        let learningCount = 0;
        Object.values(window.srsState).forEach(item => {
            if (item.known) {
                if (item.interval >= 8) masteredCount++;
                else learningCount++;
            }
        });
        const unlearnedCount = totalWordsCount - (masteredCount + learningCount);
        const masteryPct = Math.round((masteredCount / totalWordsCount) * 100) || 0;
        
        // CSS score columns for last 5 quizzes
        const last5Quizzes = window.quizHistory.slice(0, 5);
        
        let dashboardHtml = `
            <div class="center-stage" style="padding: 20px; max-width: 900px; margin: auto; text-align: center; margin-top: 3vh; width:100%;">
                <h2 style="font-size: 2.5rem; color: var(--theme-light); margin-bottom: 3vh;">לוח ביצועים וסטטיסטיקה 📊</h2>
                
                <div class="dashboard-grid">
                    <div class="stat-box">
                        <div class="stat-num">🔥 ${window.userStreak}</div>
                        <div class="stat-label">ימי למידה ברצף (Streak)</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-num">${masteryPct}%</div>
                        <div class="stat-label">שליטה כללית במילים (Mastery)</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-num">🏆 ${window.highScore}</div>
                        <div class="stat-label">ציון שיא בבחנים</div>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; width:100%; text-align:right;">
                    <div class="stat-box" style="text-align:right;">
                        <h3 style="color:var(--theme-light); font-size:18px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">חלוקת מילים (חזרה מרווחת) 🔁</h3>
                        <div style="display:flex; flex-direction:column; gap:10px; font-size:15px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--emerald-light);">● שולט ומאסטר (Mastered)</span>
                                <strong>${masteredCount} מילים</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--purple-light);">● בלמידה וחזרה (Learning)</span>
                                <strong>${learningCount} מילים</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--text-muted);">● מילים חדשות / טרם למדת</span>
                                <strong>${unlearnedCount} מילים</strong>
                            </div>
                            <div style="margin-top:10px; height:10px; border-radius:5px; background:rgba(255,255,255,0.1); display:flex; overflow:hidden;">
                                <div style="background:var(--emerald-main); width:${(masteredCount/totalWordsCount)*100}%;"></div>
                                <div style="background:var(--purple-main); width:${(learningCount/totalWordsCount)*100}%;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-box">
                        <h3 style="color:var(--theme-light); font-size:18px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">ציוני בחנים אחרונים 🧠</h3>
                        ${last5Quizzes.length === 0 ? `
                            <div style="color:var(--text-muted); text-align:center; padding-top:30px;">עדיין לא השלמת בחנים.</div>
                        ` : `
                            <div class="chart-container">
                                <div class="chart-bars">
                                    ${last5Quizzes.map(item => {
                                        const pct = (item.score / 230) * 100;
                                        return `
                                            <div class="chart-bar-col">
                                                <span class="chart-bar-score">${item.score}</span>
                                                <div class="chart-bar-fill" style="height: ${pct}%"></div>
                                                <span class="chart-bar-label">${item.date.split(' ')[0]}</span>
                                            </div>
                                        `;
                                    }).reverse().join('')}
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        app.innerHTML = dashboardHtml;
        
    } else if (window.currentWeek === 'quiz') {
        let quizHTML = '';
        if (window.quizState === 'start') {
            quizHTML = `
                <div class="center-stage" style="padding: 4vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh;">
                    <div style="font-size: 4rem; margin-bottom: 2vh;">🧠</div>
                    <h2 style="font-size: 2.5rem; color: var(--theme-light); margin-bottom: 1.5vh;">מבחנים חכמים</h2>
                    <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2vh;">תרגול שאלות הבנה. המבחן יבדוק הבנה אמיתית!</p>
                    
                    <div style="display: flex; justify-content: center; gap: 1vw; margin-bottom: 2vh; flex-wrap: wrap;">
                        <button class="nav-btn ${window.quizTargetWeek === 'week8' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week8')">שבוע 8 (OS)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'week9' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week9')">שבוע 9 (CIA)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'week10' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week10')">שבוע 10 (HTTPS)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'mix' ? 'active' : ''}" onclick="window.setQuizTargetWeek('mix')">מיקס (הכל)</button>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1vw; margin-bottom: 3vh; flex-wrap: wrap;">
                        <button class="nav-btn ${window.quizDifficulty === 'easy' ? 'active' : ''}" onclick="window.setDifficulty('easy')">קל</button>
                        <button class="nav-btn ${window.quizDifficulty === 'medium' ? 'active' : ''}" onclick="window.setDifficulty('medium')">בינוני</button>
                        <button class="nav-btn ${window.quizDifficulty === 'hard' ? 'active' : ''}" onclick="window.setDifficulty('hard')">קשה</button>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--theme-main); padding: 1.5vh; border-radius: 1vh; margin-bottom: 4vh; display: flex; justify-content: space-around;">
                        <span style="color: var(--theme-light); font-size: 1.2rem; font-weight: bold;">שיא נוכחי: ${window.highScore} 🏆</span>
                    </div>
                    <div style="display: flex; gap: 1vw; justify-content: center;">
                        <button onclick="window.startQuiz()" class="control-btn" style="flex: 2; justify-content: center;">
                            התחל מבחן עכשיו 🚀
                        </button>
                        <button onclick="window.showQuizHistory()" class="control-btn" style="flex: 1; justify-content: center; background: rgba(30, 41, 59, 0.9); border-color: rgba(255,255,255,0.2);" title="היסטוריית מבחנים">
                            ${window.icons.history}
                        </button>
                    </div>
                </div>
            `;
        } else if (window.quizState === 'history') {
             quizHTML = `
                <div class="center-stage" style="padding: 4vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh; width: 100%;">
                    <h2 style="font-size: 2.5rem; color: var(--theme-light); margin-bottom: 3vh;">היסטוריית מבחנים 📊</h2>
                    ${window.quizHistory.length === 0 ? '<p style="color: var(--text-muted); font-size: 1.2rem;">אין עדיין מבחנים מוקלטים.</p>' : `
                        <div style="width: 100%; max-height: 40vh; overflow-y: auto; background: rgba(15,23,42,0.5); border-radius: 1vh; border: 1px solid var(--border); margin-bottom: 3vh;">
                            ${window.quizHistory.map((h, i) => `
                                <div class="history-item">
                                    <span style="color: ${h.score >= 180 ? 'var(--theme-main)' : h.score >= 100 ? 'var(--theme-light)' : '#fca5a5'}; font-weight:bold;">ציון: ${h.score}</span>
                                    <span style="color: var(--text-muted); font-size: 1rem;">${h.date}</span>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="window.clearQuizHistory()" class="control-btn" style="width: 100%; justify-content: center; background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #fca5a5; margin-bottom: 1.5vh;">
                            נקה היסטוריה 🗑️
                        </button>
                    `}
                    <button onclick="window.quizState = 'start'; window.render();" class="control-btn" style="width: 100%; justify-content: center;">
                        חזור למבחן 🔙
                    </button>
                </div>
            `;
        } else if (window.quizState === 'playing') {
            let q = window.quizQuestions[window.currentQuizIndex];
            let buttonsHTML = q.options.map((opt, i) => {
                let btnClass = "quiz-opt-btn";
                if (q.answered) {
                    if (i === q.correctIndex) btnClass += " correct";
                    else if (i === q.selectedOption) btnClass += " wrong";
                    else btnClass += " disabled";
                }
                return '<button class="' + btnClass + '" onclick="window.handleAnswer(' + i + ')" ' + (q.answered ? 'disabled' : '') + '>' + opt + '</button>';
            }).join('');

            quizHTML = `
                <div style="max-width: 800px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; height: 100%;">
                    <div class="top-bar" style="margin-bottom: 2vh;">
                        <span style="color: var(--text-muted); font-size: 1.2rem; font-weight: bold;">שאלה ${window.currentQuizIndex + 1} / 23</span>
                        <span style="color: var(--theme-light); font-size: 1.2rem; font-weight: bold;">ניקוד: ${window.quizScore}</span>
                    </div>
                    <div class="flashcard" style="align-items: center; padding: 4vh 3vw; gap: 3vh; text-align: center;">
                        <h3 style="font-size: clamp(20px, 3vh, 40px); font-weight: 900; color: #fff; letter-spacing: 1px;" dir="ltr">${q.question}</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5vh; width: 100%; margin-top: 2vh;">
                            ${buttonsHTML}
                        </div>
                        <div style="min-height: 6vh; width: 100%; margin-top: 2vh; display: flex; justify-content: center; align-items: center;">
                            ${q.answered ? `
                                <button onclick="window.nextQuizQuestion()" class="control-btn" style="width: 100%; max-width: 300px; justify-content: center; background: var(--theme-main); border-color: var(--theme-main);">
                                    ${window.currentQuizIndex === 22 ? 'לתוצאות המבחן' : 'שאלה הבאה'} ${window.icons.left_arrow}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else if (window.quizState === 'end') {
            let isNewHigh = window.quizScore > window.highScore;
            quizHTML = `
                <div class="center-stage" style="padding: 5vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh;">
                    <div style="font-size: 5rem; margin-bottom: 2vh;">${window.quizScore >= 180 ? '🏆' : window.quizScore >= 100 ? '👍' : '💪'}</div>
                    <h2 style="font-size: 2.5rem; color: #fff; margin-bottom: 1vh;">סיום המבחן!</h2>
                    <p style="font-size: 1.8rem; color: var(--theme-light); font-weight: bold; margin-bottom: 2vh;">הציון שלך: ${window.quizScore} / 230</p>
                    ${isNewHigh ? `
                        <div style="background: rgba(253, 224, 71, 0.15); border: 1px solid #fde047; padding: 1.5vh; border-radius: 1vh; margin-bottom: 3vh;">
                            <span style="color: #fde047; font-size: 1.4rem; font-weight: bold;">🎉 שיא חדש!</span>
                        </div>
                    ` : `<p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 3vh;">שיא אישי נוכחי: ${window.highScore}</p>`}
                    <button onclick="window.startQuiz()" class="control-btn" style="justify-content: center; width: 100%;">
                        נסה שוב 🔄
                    </button>
                </div>
            `;
        }
        app.innerHTML = quizHTML;

    } else if (window.currentWeek === 'summary') {
        const query = (window.summarySearchQuery || '').toLowerCase();
        
        let summaryHtml = `
            <div class="search-wrapper">
                <input type="text" class="search-input" value="${window.summarySearchQuery}" placeholder="חפש מילים באנגלית או פירוש בעברית..." oninput="window.filterSummary(this.value)">
            </div>
            <div class="summary-toggles" style="flex-wrap: wrap;">
                <button onclick="window.setSummaryMode('weeks')" class="sum-toggle ${window.summaryMode === 'weeks' ? 'active' : ''}">תצוגת שבועות</button>
                <button onclick="window.setSummaryMode('compact')" class="sum-toggle ${window.summaryMode === 'compact' ? 'active' : ''}">ריכוז כלל המילים</button>
                <button onclick="window.setSummaryMode('unknowns')" class="sum-toggle ${window.summaryMode === 'unknowns' ? 'active' : ''}" style="border-color: #ef4444; color: ${window.summaryMode === 'unknowns' ? '#fff' : '#ef4444'}; background: ${window.summaryMode === 'unknowns' ? '#ef4444' : 'rgba(30,41,59,0.8)'}; box-shadow: ${window.summaryMode === 'unknowns' ? '0 0 15px rgba(239,68,68,0.5)' : 'none'};">מילים לתרגול (לא ידעתי)</button>
            </div>
        `;
        if (window.summaryMode === 'weeks') {
            summaryHtml += `<div class="weeks-scroll">`;
            const weekNum = {'week1': '1.', 'week2': '2.', 'week3': '3.', 'week7': '4.', 'week8': '5.', 'week9vocab': '6.', 'week10vocab': '7.'};
            const weekText = {'week1': 'שבוע 4', 'week2': 'שבוע 5', 'week3': 'שבוע 6', 'week7': 'שבוע 7', 'week8': 'שבוע 8', 'week9vocab': 'שבוע 9', 'week10vocab': 'שבוע 10'};
            
            ['week1', 'week2', 'week3', 'week7', 'week8', 'week9vocab', 'week10vocab'].forEach((week) => {
                // Filter words for this week
                let matchedInWeek = 0;
                let daySectionHtml = '';
                
                Object.entries(window.vocabularyData).filter(([dayKey]) => window.daysList.find(d => d.id === dayKey).week === week).forEach(([dayKey, words]) => {
                    const dayInfo = window.daysList.find(d => d.id === dayKey);
                    
                    const filteredWords = words.filter(w => 
                        w.word.toLowerCase().includes(query) || 
                        w.meaning.toLowerCase().includes(query)
                    );
                    
                    if (filteredWords.length > 0) {
                        matchedInWeek += filteredWords.length;
                        daySectionHtml += `<div class="matrix-card"><div class="matrix-header"><span>${dayInfo.title}</span><span>${dayInfo.date}</span></div><ul class="matrix-list">`;
                        filteredWords.forEach((w) => {
                            const originalIdx = words.indexOf(w);
                            daySectionHtml += `<li class="matrix-item" onclick="window.goToWord('${dayInfo.id}', ${originalIdx})"><span class="matrix-item-en" style="display: flex; align-items: center; gap: 4px;">${window.getSRSIndicator(w.word)} ${w.word}</span><span class="matrix-item-he">${w.meaning}</span></li>`;
                        });
                        daySectionHtml += `</ul></div>`;
                    }
                });
                
                if (matchedInWeek > 0 || query === '') {
                    summaryHtml += `
                        <div class="week-section">
                            <div class="week-title-container">
                                <span class="week-title-number">${weekNum[week]}</span>
                                <span class="week-title-text">${weekText[week]}</span>
                            </div>
                            <div class="days-grid">
                                ${daySectionHtml}
                            </div>
                        </div>
                    `;
                }
            });
            summaryHtml += `</div>`;
        } else if (window.summaryMode === 'compact') {
            summaryHtml += `<div class="compact-grid">`;
            Object.entries(window.vocabularyData).forEach(([dayKey, words]) => {
                words.forEach((w, idx) => {
                    if (query === '' || w.word.toLowerCase().includes(query) || w.meaning.toLowerCase().includes(query)) {
                        summaryHtml += `<div class="compact-item" onclick="window.goToWord('${dayKey}', ${idx})"><span class="compact-en" style="display: flex; align-items: center; justify-content: center; gap: 4px;">${window.getSRSIndicator(w.word)} ${w.word}</span><span class="compact-he">${w.meaning}</span></div>`;
                    }
                });
            });
            summaryHtml += `</div>`;
        } else if (window.summaryMode === 'unknowns') {
            summaryHtml += `<div class="compact-grid">`;
            let hasUnknowns = false;
            Object.entries(window.vocabularyData).forEach(([dayKey, words]) => {
                words.forEach((w, idx) => {
                    const wordKey = w.word.toLowerCase();
                    const srsItem = window.srsState[wordKey];
                    if (srsItem && srsItem.known === false) {
                        if (query === '' || w.word.toLowerCase().includes(query) || w.meaning.toLowerCase().includes(query)) {
                            hasUnknowns = true;
                            summaryHtml += `<div class="compact-item" style="border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);" onclick="window.goToWord('${dayKey}', ${idx})"><span class="compact-en" style="display: flex; align-items: center; justify-content: center; gap: 4px;">${window.getSRSIndicator(w.word)} ${w.word}</span><span class="compact-he">${w.meaning}</span></div>`;
                        }
                    }
                });
            });
            if (!hasUnknowns && query === '') {
                summaryHtml += `<div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--emerald-light); font-size: 1.2rem; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 1px dashed var(--emerald-main);">כל הכבוד! אין מילים שסימנת כ-"לא יודע" כרגע. 🎉</div>`;
            }
            summaryHtml += `</div>`;
        }
        app.innerHTML = `<div class="matrix-wrapper">${summaryHtml}</div>`;
        
    } else if (window.currentWeek === 'summary_old') {
        let summaryHtml = `
            <div class="summary-toggles">
                <button onclick="window.setSummaryMode('weeks')" class="sum-toggle ${window.summaryMode === 'weeks' ? 'active' : ''}">תצוגת שבועות</button>
                <button onclick="window.setSummaryMode('compact')" class="sum-toggle ${window.summaryMode === 'compact' ? 'active' : ''}">ריכוז כלל המילים</button>
            </div>
        `;
        if (window.summaryMode === 'weeks') {
            summaryHtml += `<div class="weeks-scroll">`;
            const weekNum = {'week1': '1.', 'week2': '2.', 'week3': '3.', 'week7': '4.', 'week8': '5.', 'week9vocab': '6.', 'week10vocab': '7.'};
            const weekText = {'week1': 'שבוע 4', 'week2': 'שבוע 5', 'week3': 'שבוע 6', 'week7': 'שבוע 7', 'week8': 'שבוע 8', 'week9vocab': 'שבוע 9', 'week10vocab': 'שבוע 10'};
            ['week1', 'week2', 'week3', 'week7', 'week8', 'week9vocab', 'week10vocab'].forEach((week) => {
                summaryHtml += `
                    <div class="week-section">
                        <div class="week-title-container">
                            <span class="week-title-number">${weekNum[week]}</span>
                            <span class="week-title-text">${weekText[week]}</span>
                        </div>
                        <div class="days-grid">
                `;
                Object.entries(window.vocabularyData).filter(([dayKey]) => window.daysList.find(d => d.id === dayKey).week === week).forEach(([dayKey, words]) => {
                    const dayInfo = window.daysList.find(d => d.id === dayKey);
                    summaryHtml += `<div class="matrix-card"><div class="matrix-header"><span>${dayInfo.title}</span><span>${dayInfo.date}</span></div><ul class="matrix-list">`;
                    words.forEach((w, idx) => { summaryHtml += `<li class="matrix-item" onclick="window.goToWord('${dayInfo.id}', ${idx})"><span class="matrix-item-en">${w.word}</span><span class="matrix-item-he">${w.meaning}</span></li>`; });
                    summaryHtml += `</ul></div>`;
                });
                summaryHtml += `</div></div>`;
            });
            summaryHtml += `</div>`;
        } else {
            summaryHtml += `<div class="compact-grid">`;
            Object.entries(window.vocabularyData).forEach(([dayKey, words]) => {
                words.forEach((w, idx) => { summaryHtml += `<div class="compact-item" onclick="window.goToWord('${dayKey}', ${idx})"><span class="compact-en">${w.word}</span><span class="compact-he">${w.meaning}</span></div>`; });
            });
            summaryHtml += `</div>`;
        }
        app.innerHTML = `<div class="matrix-wrapper">${summaryHtml}</div>`;

    } else if (window.currentWeek === 'focus') {
        app.innerHTML = window.renderWeeklyFocusDashboard();
    } else {
        const currentWords = window.vocabularyData[window.currentDay];
        const wordData = currentWords[window.wordIndex];
        const isFirstWord = window.currentDay === window.daysList[0].id && window.wordIndex === 0;
        const isLastWord = window.currentDay === window.daysList[window.daysList.length - 1].id && window.wordIndex === currentWords.length - 1;

        let dotsHtml = '';
        for(let i=0; i<currentWords.length; i++) {
            let stateClass = i === window.wordIndex ? 'active' : (i < window.wordIndex ? 'done' : 'pending');
            dotsHtml += `<div class="dot ${stateClass}"></div>`;
        }

        // SRS Word Key & Level Badge
        const wordKey = wordData.word.toLowerCase();
        const safeWordKey = wordKey.replace(/'/g, "\\'");
        let srsBadgeHtml = '<span class="srs-badge srs-new">🆕 חדש</span>';
        if (window.srsState[wordKey] && window.srsState[wordKey].known) {
            const interval = window.srsState[wordKey].interval;
            if (interval >= 8) {
                srsBadgeHtml = '<span class="srs-badge srs-mastered" style="box-shadow: 0 0 10px rgba(16,185,129,0.3)">🎓 שולט</span>';
            } else {
                srsBadgeHtml = '<span class="srs-badge srs-learning" style="box-shadow: 0 0 10px rgba(168,85,247,0.3)">📖 בלמידה</span>';
            }
        }

        app.innerHTML = `
            <div class="vocab-view-wrapper">
                <div class="top-bar">
                    <div class="settings-box">
                        ${window.icons.settings}
                        <select onchange="window.changeRate(this.value)">
                            <option value="0.3" ${window.speechRate === 0.3 ? 'selected' : ''}>סופר איטי (0.3x)</option>
                            <option value="0.4" ${window.speechRate === 0.4 ? 'selected' : ''}>איטי מאוד (0.4x)</option>
                            <option value="0.6" ${window.speechRate === 0.6 ? 'selected' : ''}>איטי (0.6x)</option>
                            <option value="0.85" ${window.speechRate === 0.85 ? 'selected' : ''}>רגיל-איטי (0.85x)</option>
                            <option value="1" ${window.speechRate === 1 ? 'selected' : ''}>רגיל (1.0x)</option>
                        </select>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${srsBadgeHtml}
                        <div class="progress-box">
                            <span style="margin-bottom: 0.2vh;">מילה ${window.wordIndex + 1} מתוך ${currentWords.length}</span>
                            <div class="progress-dots">${dotsHtml}</div>
                        </div>
                    </div>
                </div>

                <div class="flashcard">
                    <div class="center-stage">
                        <div class="word-main-row" style="display: flex; align-items: center; justify-content: space-between; width: 100%; direction: ltr; position: relative;">
                            <div style="display: flex; gap: 10px; min-width: 90px; justify-content: flex-start; z-index: 10;">
                                <button class="audio-btn" onclick="window.playAudio('${wordData.word.replace(/'/g, "\\'")}')" title="השמע מילה">
                                    ${window.icons.volume}
                                </button>
                                <button class="mic-btn" onclick="window.startPronunciationCheck('${wordData.word.replace(/'/g, "\\'")}', this)" title="דבר 🎤">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px; height:20px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                                </button>
                            </div>
                            <div class="word-title" style="margin: 0; justify-content: center; flex-grow: 1; text-align: center; display: flex; align-items: center; gap: 10px; z-index: 1;">
                                ${wordData.word}
                                <span class="small-emoji">${wordData.visual}</span>
                            </div>
                            <div style="min-width: 90px; z-index: 1;"></div> <!-- placeholder to center word -->
                        </div>
                        <div class="tags-row">
                            <span class="tag-box tag-meaning">${wordData.meaning}</span>
                            <span class="tag-box tag-phonetic" style="white-space: nowrap !important;">[ ${wordData.phonetic} ]</span>
                        </div>
                    </div>

                    <div class="content-grid">
                        <div class="text-col">
                            <div class="explanation-box">
                                <div class="section-title">
                                    ${window.icons.check} הסבר והקשר
                                </div>
                                <div style="margin-top: 0.5vh;">${wordData.exp}</div>
                            </div>

                            <div class="example-box">
                                <div class="section-title emerald" style="margin-bottom: 1.5vh;">
                                    ${window.icons.book} דוגמה פרקטית
                                </div>
                                <div class="example-eng-row">
                                    <button class="audio-small" onclick="window.playAudio('${wordData.engEx.replace(/'/g, "\\'")}')" title="השמע משפט">
                                        ${window.icons.volume}
                                    </button>
                                    <div class="example-eng">"${wordData.engEx}"</div>
                                </div>
                                <div class="example-heb">
                                    ${wordData.hebEx}
                                </div>
                            </div>
                        </div>

                        <div class="visual-col">
                            ${window.getCustomArtHTML(wordData.word, wordData.visual)}
                        </div>
                    </div>
                    
                    <!-- SRS Action Buttons -->
                    <div class="srs-btn-row">
                        <button onclick="window.toggleSRSWord('${safeWordKey}', true)" class="srs-action-btn known">
                            <span>יודע 👍</span>
                        </button>
                        <button onclick="window.toggleSRSWord('${safeWordKey}', false)" class="srs-action-btn unknown">
                            <span>לא יודע 👎</span>
                        </button>
                    </div>
                </div>

                <div class="controls-container">
                    <button class="control-btn" onclick="window.nextWord()" ${isLastWord ? 'disabled' : ''}>
                        ${window.icons.left_arrow} הבא
                    </button>
                    ${window.currentWeek === 'week8' ? `<button class="control-btn" style="background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;" onclick="window.setWeek('article')">📄 מאמר</button>` : ''}
${window.currentWeek === 'week9vocab' ? `<button class="control-btn" style="background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;" onclick="window.setWeek('week9')">📄 מאמר</button>` : ''}
${window.currentWeek === 'week10vocab' ? `<button class="control-btn" style="background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;" onclick="window.setWeek('week10')">📄 מאמר</button>` : ''}
<button class="control-btn" onclick="window.prevWord()" ${isFirstWord ? 'disabled' : ''}>
                        הקודם ${window.icons.right_arrow}
                    </button>
                </div>
            </div>
        `;
    }
};

// --- Mobile Menu Drawer Controller ---
window.toggleMenu = function(isOpen) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        if (isOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
        }
    }
};

// Touch swipe gestures for mobile menu
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    // Swipe from right to left (RTL: open menu)
    if (swipeDistance < -80) {
        window.toggleMenu(true);
    }
    // Swipe from left to right (RTL: close menu)
    if (swipeDistance > 80) {
        window.toggleMenu(false);
    }
}, { passive: true });

window.renderWeeklyFocusDashboard = function() {
    let focusWordsHtml = '';
    const focusWeek = 'week10vocab'; // Focus on Week 10 Vocabulary
    const focusDays = window.daysList.filter(d => d.week === focusWeek);
    
    let daysGridHtml = '';
    focusDays.forEach(dayInfo => {
        const words = window.vocabularyData[dayInfo.id] || [];
        let wordListHtml = '';
        words.slice(0, 5).forEach((w, idx) => {
            wordListHtml += `
                <li class="matrix-item" onclick="window.goToWord('${dayInfo.id}', ${idx})">
                    <span class="matrix-item-en" style="display: flex; align-items: center; gap: 4px;">
                        ${window.getSRSIndicator(w.word)} ${w.word}
                    </span>
                    <span class="matrix-item-he">${w.meaning}</span>
                </li>
            `;
        });
        
        daysGridHtml += `
            <div class="matrix-card">
                <div class="matrix-header">
                    <span>${dayInfo.title}</span>
                    <span>${dayInfo.date}</span>
                </div>
                <ul class="matrix-list">
                    ${wordListHtml}
                    <li class="matrix-item" style="justify-content: center; background: rgba(255,255,255,0.02);" onclick="window.goToWord('${dayInfo.id}', 0)">
                        <span style="color: var(--theme-light); font-size: 11px; font-weight: bold;">לכל המילים של היום ←</span>
                    </li>
                </ul>
            </div>
        `;
    });
    
    return `
        <div class="home-wrapper">
            <div class="home-section-title" style="border:none; justify-content:center; text-align:center; margin-bottom: 15px;">
                <span style="font-size: clamp(28px, 4vh, 50px); font-weight: 900; background: linear-gradient(to right, var(--theme-light), var(--emerald-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">מיקוד שבועי: שבוע 10 🎯</span>
            </div>
            
            <p style="text-align: center; color: var(--text-muted); font-size: 14px; max-width: 600px; margin: 0 auto 25px auto; line-height: 1.5;">
                חומר הלימוד הרלוונטי והמעודכן ביותר לשבוע האחרון: עקרונות אבטחת מידע (CIA Triad).
            </p>
            
            <!-- 📚 Week 9 Vocab Section -->
            <h3 class="home-section-title" style="margin-top: 15px;">📚 אוצר מילים שבועי (40 מילים)</h3>
            <div class="days-grid" style="margin-bottom: 30px;">
                ${daysGridHtml}
            </div>
            
            <!-- 📄 Article & 🧠 Quiz Row -->
            <h3 class="home-section-title">📄 קריאה ומבחנים</h3>
            <div class="home-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                <button class="home-card focus-glow" onclick="window.setWeek('week10')" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🔐</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: HTTP to HTTPS</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאה ותרגום אינטראקטיביים של מאמר אבטחת המידע הרשמי עם הקראה קולית.</div>
                    </div>
                </button>
                
                <button class="home-card focus-glow" onclick="window.setQuizTargetWeek('week10'); window.setWeek('quiz'); window.startQuiz();" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🧠</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן שבוע 10</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן הבנה ממוקד המורכב מ-10 שאלות על פרוטוקול HTTPS ואבטחת רשת.</div>
                    </div>
                </button>
            </div>
        </div>
    `;
};

window.initThemeDots = function() {
    document.querySelectorAll('.theme-dot').forEach(dot => {
        if (dot.classList.contains(window.activeTheme)) {
            dot.classList.add('active-theme-dot');
        } else {
            dot.classList.remove('active-theme-dot');
        }
    });
};

// Initialize theme dots and views
setTimeout(window.initThemeDots, 50);
window.render();