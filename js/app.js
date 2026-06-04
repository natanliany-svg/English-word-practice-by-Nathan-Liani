window.currentDay = 'home';
window.currentWeek = 'home';
window.wordIndex = 0;
window.speechRate = 0.85;
window.summaryMode = 'weeks';
window.articleViewMode = 'sentence';
window.quizTargetWeek = 'mix';

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
    else window.currentDay = week; 
    window.wordIndex = 0;
    if (week !== 'quiz') window.quizState = 'start';
    window.render();
};

window.setDay = function(dayId) { window.stopAudio(); window.currentDay = dayId; window.wordIndex = 0; window.render(); };
window.setSummaryMode = function(mode) { window.summaryMode = mode; window.render(); };
window.goToWord = function(dayId, index) { window.stopAudio(); window.currentDay = dayId; window.currentWeek = window.daysList.find(d => d.id === dayId).week; window.wordIndex = index; window.render(); };
window.changeRate = function(val) { window.speechRate = parseFloat(val); window.render(); };

window.formatTime = function(seconds) {
    if(isNaN(seconds) || seconds < 0) seconds = 0;
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};

window.playAudio = function(text, btnElement) {
    window.stopAudio();
    
    if (!window.audioState) window.audioState = {};
    
    window.audioState.fullText = text;
    window.audioState.btnElement = btnElement;
    window.audioState.elapsed = 0;
    window.audioState.isPaused = false;
    window.audioState.isDragging = false;
    
    let wordCount = text.split(' ').length;
    let wps = (130 / 60) * window.speechRate;
    window.audioState.estimatedDuration = wordCount / wps;
    if(window.audioState.estimatedDuration < 2) window.audioState.estimatedDuration = 2; 
    
    if(document.getElementById('audio-time-total')) {
        document.getElementById('audio-time-total').innerText = window.formatTime(window.audioState.estimatedDuration);
        document.getElementById('audio-time-current').innerText = "00:00";
        document.getElementById('audio-slider').value = 0;
    }

    window.playAudioChunk(text);
};

window.playAudioChunk = function(textChunk) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(textChunk);
    utterance.lang = 'en-US';
    utterance.rate = window.speechRate;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US' && v.localService === true) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = function() {
        window.audioPlaying = true;
        if(document.getElementById('audio-player')) document.getElementById('audio-player').classList.add('visible');
        if(document.getElementById('play-pause-btn')) document.getElementById('play-pause-btn').innerHTML = window.icons.pause;
        
        if (!window.audioState) window.audioState = {};
        
        if(window.audioState.btnElement) window.audioState.btnElement.classList.add('active');
        
        if (window.audioState.interval) clearInterval(window.audioState.interval);
        
        window.audioState.interval = setInterval(() => {
            if(!window.audioState.isPaused && !window.audioState.isDragging) {
                window.audioState.elapsed += 0.1;
                if(window.audioState.elapsed >= window.audioState.estimatedDuration) {
                    window.audioState.elapsed = window.audioState.estimatedDuration;
                }
                let pct = (window.audioState.elapsed / window.audioState.estimatedDuration) * 100;
                if(document.getElementById('audio-slider')) {
                    document.getElementById('audio-slider').value = pct;
                    if(document.getElementById('audio-time-current')) {
                        document.getElementById('audio-time-current').innerText = window.formatTime(window.audioState.elapsed);
                    }
                }
            }
        }, 100);
    };
    
    utterance.onend = function() {
        if(window.audioState && window.audioState.elapsed + 1 >= window.audioState.estimatedDuration) {
            window.stopAudio();
        }
    };
    
    window.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
};

window.togglePlayPause = function() {
    if(!window.audioState) return;
    if('speechSynthesis' in window && window.speechSynthesis.speaking) {
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
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (typeof window.audioState !== 'undefined' && window.audioState !== null) {
        if (window.audioState.interval) {
            clearInterval(window.audioState.interval);
        }
        window.audioState.interval = null;
    } else {
        window.audioState = {}; 
    }
    window.audioPlaying = false;
    window.currentUtterance = null;
    const player = document.getElementById('audio-player');
    if(player) player.classList.remove('visible');
    const activeBtns = document.querySelectorAll('.story-audio-btn.active');
    activeBtns.forEach(btn => btn.classList.remove('active'));
};

window.startAudioDrag = function() {
    if (window.audioState) window.audioState.isDragging = true;
};

window.stopAudioDrag = function(val) {
    if (window.audioState) window.audioState.isDragging = false;
    window.seekToPercent(val / 100);
};

window.handleSliderInput = function(val) {
    if (!window.audioState) return;
    let seconds = (val / 100) * window.audioState.estimatedDuration;
    if(document.getElementById('audio-time-current')) {
        document.getElementById('audio-time-current').innerText = window.formatTime(seconds);
    }
};

window.seekRelative = function(secondsOffset) {
    if(!window.audioPlaying || !window.audioState) return;
    let newElapsed = window.audioState.elapsed + secondsOffset;
    if(newElapsed < 0) newElapsed = 0;
    if(newElapsed > window.audioState.estimatedDuration) newElapsed = window.audioState.estimatedDuration;
    window.seekToPercent(newElapsed / window.audioState.estimatedDuration);
};

window.seekToPercent = function(pct) {
    if(!window.audioState || !window.audioState.fullText) return;
    
    if (window.audioState.interval) {
        clearInterval(window.audioState.interval);
        window.audioState.interval = null;
    }
    
    if ('speechSynthesis' in window) window.speechSynthesis.cancel(); 
    
    window.audioState.elapsed = window.audioState.estimatedDuration * pct;
    let words = window.audioState.fullText.split(' ');
    let wordIndex = Math.floor(words.length * pct);
    
    let remainingText = words.slice(wordIndex).join(' ').trim();
    if(remainingText.length > 0) {
        setTimeout(() => {
            window.playAudioChunk(remainingText);
        }, 50);
    } else {
        window.stopAudio();
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
    if(card.classList.contains('expanded')) {
        card.classList.remove('expanded');
    } else {
        document.querySelectorAll('.story-card').forEach(c => c.classList.remove('expanded'));
        card.classList.add('expanded');
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
        "smartphones", "Android", "iOS", "cloud servers"
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
    const unseenDB = [
        { q: "What is the primary function of an Operating System according to the text?", options: ["To serve as a bridge between the user, applications, and hardware.", "To browse the internet and play games faster.", "To manufacture new hardware components.", "To write documents and edit videos automatically."], ans: 0, diff: "easy", week: "week8" },
        { q: "Who were the researchers involved in the creation of Unix?", options: ["Ken Thompson and Dennis Ritchie", "Steve Jobs and Bill Gates", "Linux Torvalds and Tim Berners-Lee", "Alan Turing and Ada Lovelace"], ans: 0, diff: "medium", week: "week8" },
        { q: "Which operating systems are mentioned as being based on ideas that originated in Unix?", options: ["Linux and macOS", "Windows and MS-DOS", "Android and Symbian", "ChromeOS and Ubuntu"], ans: 0, diff: "easy", week: "week8" },
        { q: "What does the OS 'scheduler' do in process management?", options: ["It decides how much processor time each process receives.", "It permanently deletes inactive files to clear the CPU.", "It schedules meetings and calendar events for the user.", "It shuts down the computer when it gets too hot."], ans: 0, diff: "hard", week: "week8" },
        { q: "What is 'virtual memory' as described in the text?", options: ["A technique allowing programs to use more memory by temporarily storing data on a storage device.", "A cloud-based memory that users have to buy separately.", "Memory that exists only in the user's imagination.", "A physical chip that replaces RAM."], ans: 0, diff: "medium", week: "week8" },
        { q: "Why are 'device drivers' important?", options: ["They allow the OS to send instructions to and receive information from hardware.", "They physically drive the computer to different locations.", "They protect the computer from malicious software.", "They organize files into folders."], ans: 0, diff: "easy", week: "week8" },
        { q: "Which of the following is NOT mentioned as a security feature of modern operating systems?", options: ["Physical lock-and-key mechanisms", "User authentication", "Access control", "Encryption"], ans: 0, diff: "hard", week: "week8" },
        { q: "What specific challenge did mobile operating systems like Android and iOS have to solve?", options: ["Operating on devices with limited power consumption while supporting touch-screens.", "Operating without any internet connection at all.", "Running Unix directly on a wristwatch.", "Providing physical keyboards for all users."], ans: 0, diff: "medium", week: "week8" },
        { q: "Without a file system, what would be nearly impossible?", options: ["Managing information on a computer.", "Turning the computer on.", "Typing on a keyboard.", "Connecting to a wall outlet."], ans: 0, diff: "easy", week: "week8" },
        { q: "According to the conclusion, what role has the evolution of operating systems played?", options: ["A crucial role in shaping the digital world we know today.", "A minor role compared to hardware development.", "A role strictly limited to desktop computers.", "It only affected the development of video games."], ans: 0, diff: "medium", week: "week8" }
    ];
    
    const ciaTriadDB = [
        { q: "What does the CIA Triad stand for?", options: ["Confidentiality, Integrity, and Availability", "Computer, Internet, and Applications", "Control, Information, and Access", "Cybersecurity, Intelligence, and Authorization"], ans: 0, diff: "easy", week: "week9" },
        { q: "Which principle ensures information is only accessible to authorized people?", options: ["Confidentiality", "Integrity", "Availability", "Authorization"], ans: 0, diff: "easy", week: "week9" },
        { q: "What do companies use to prevent unauthorized users from viewing sensitive data?", options: ["Passwords, encryption, and access controls", "Public networks and open servers", "Hard drives and physical keys", "Social media accounts"], ans: 0, diff: "medium", week: "week9" },
        { q: "What happened when Daniel clicked the link in the phishing email?", options: ["A cybercriminal gained access to his account", "His computer exploded", "The IT department congratulated him", "His files were immediately deleted"], ans: 0, diff: "medium", week: "week9" },
        { q: "Integrity refers to what aspect of information?", options: ["Accuracy and reliability", "Speed and performance", "Size and storage space", "Privacy and secrecy"], ans: 0, diff: "easy", week: "week9" },
        { q: "Which technologies are used to ensure data integrity?", options: ["Digital signatures, audit logs, and hash functions", "Antivirus software and firewalls", "Virtual Private Networks (VPNs)", "Bluetooth and Wi-Fi"], ans: 0, diff: "hard", week: "week9" },
        { q: "Why did the altered customer records in DataSafe illustrate a violation of integrity?", options: ["Because the data was made inaccurate and unreliable", "Because the files were completely deleted", "Because the servers crashed", "Because employees could not log in"], ans: 0, diff: "medium", week: "week9" },
        { q: "What does Availability ensure?", options: ["Authorized users can access information when they need it", "Data is always public", "No one can ever change the data", "Passwords are never required"], ans: 0, diff: "easy", week: "week9" },
        { q: "What type of attack did the cybercriminal launch to compromise Availability?", options: ["Ransomware", "DDoS attack", "SQL Injection", "Man-in-the-Middle attack"], ans: 0, diff: "medium", week: "week9" },
        { q: "How did DataSafe recover its systems after the ransomware attack?", options: ["They used secure backups", "They paid the ransom", "They bought new computers", "They hacked the attacker back"], ans: 0, diff: "medium", week: "week9" },
        { q: "What did the incident at DataSafe show about protecting information?", options: ["It's about human awareness as well as technology", "Only expensive software can protect data", "IT departments are unnecessary", "Phishing attacks are harmless"], ans: 0, diff: "hard", week: "week9" }
    ];

    let fullDB = [];
    if (window.quizTargetWeek === 'week8') fullDB = unseenDB;
    else if (window.quizTargetWeek === 'week9') fullDB = ciaTriadDB;
    else fullDB = [...unseenDB, ...ciaTriadDB];

    let availableQuestions = fullDB.filter(q => q.diff === window.quizDifficulty || window.quizDifficulty === 'medium');
    if (window.quizDifficulty === 'hard') availableQuestions = fullDB; 
    let shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    let selectedQs = shuffled.slice(0, 15);

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

    const navHTML = `
        <button class="nav-btn ${window.currentWeek === 'home' ? 'active-cyan' : ''}" onclick="window.setWeek('home')">🏠 ראשי</button>
        <button class="nav-btn ${window.currentWeek === 'week1' ? 'active-cyan' : ''}" onclick="window.setWeek('week1')">שבוע 4 (1)</button>
        <button class="nav-btn ${window.currentWeek === 'week2' ? 'active-cyan' : ''}" onclick="window.setWeek('week2')">שבוע 5 (2)</button>
        <button class="nav-btn ${window.currentWeek === 'week3' ? 'active-cyan' : ''}" onclick="window.setWeek('week3')">שבוע 6 (3)</button>
        <button class="nav-btn ${window.currentWeek === 'week7' ? 'active-cyan' : ''}" onclick="window.setWeek('week7')">שבוע 7 (4)</button>
        <button class="nav-btn ${window.currentWeek === 'article' ? 'active-cyan' : ''}" onclick="window.setWeek('article')">שבוע 8 (5) 📄</button>
        <button class="nav-btn ${window.currentWeek === 'quiz' ? 'active-cyan' : ''}" onclick="window.setWeek('quiz')">מבחן חכם 🧠</button>
        <button class="nav-btn ${window.currentWeek === 'summary' ? 'active-cyan' : ''}" onclick="window.setWeek('summary')">סיכום (160 מילים)</button>
    `;
    
    const navTier = document.querySelector('.nav-tier');
    if(navTier) navTier.innerHTML = navHTML;

    if (window.currentWeek !== 'home' && window.currentWeek !== 'summary' && window.currentWeek !== 'quiz' && window.currentWeek !== 'article' && window.currentWeek !== 'week9') {
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
                <div class="home-section-title" style="border:none; justify-content:center; text-align:center;">
                    <span style="font-size: clamp(28px, 4vh, 50px); font-weight: 900; background: linear-gradient(to right, var(--cyan-light), var(--emerald-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ברוכים הבאים למערכת הלמידה!</span>
                </div>
                
                <h3 class="home-section-title">שלבי הלימוד</h3>
                <div class="home-list">
                    <button class="home-card" onclick="window.setWeek('week1')">
                        <div class="home-card-icon">📖</div>
                        <div class="home-card-content">
                            <div class="home-card-title">שבוע 4 (1)</div>
                            <div class="home-card-desc">אוצר מילים ויסודות. בסיס חזק להמשך הדרך.</div>
                        </div>
                    </button>
                    <button class="home-card" onclick="window.setWeek('week2')">
                        <div class="home-card-icon">📚</div>
                        <div class="home-card-content">
                            <div class="home-card-title">שבוע 5 (2)</div>
                            <div class="home-card-desc">המשך בניית אוצר מילים ושילוב משפטים.</div>
                        </div>
                    </button>
                    <button class="home-card" onclick="window.setWeek('week3')">
                        <div class="home-card-icon">🎓</div>
                        <div class="home-card-content">
                            <div class="home-card-title">שבוע 6 (3)</div>
                            <div class="home-card-desc">ביטויים מתקדמים ואוצר מילים מורכב.</div>
                        </div>
                    </button>
                    <button class="home-card" onclick="window.setWeek('week7')">
                        <div class="home-card-icon">🚀</div>
                        <div class="home-card-content">
                            <div class="home-card-title">שבוע 7 (4)</div>
                            <div class="home-card-desc">השלב הסופי - מילים מתקדמות לבחינה.</div>
                        </div>
                    </button>
                    <button class="home-card" onclick="window.setWeek('article')">
                        <div class="home-card-icon">📄</div>
                        <div class="home-card-content">
                            <div class="home-card-title">שבוע 8 (5)</div>
                            <div class="home-card-desc">מאמר קריאה - Unseen בהקראה קולית.</div>
                        </div>
                    </button>
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
                            <div class="home-card-title">סיכום מלא</div>
                            <div class="home-card-desc">כל 160 המילים במקום אחד, מוכנות לחזרה.</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        app.innerHTML = homeHtml;
    } else if (window.currentWeek === 'article' || window.currentWeek === 'week9') {
        const isWeek9 = window.currentWeek === 'week9';
        const articleData = isWeek9 ? window.ciaTriadArticleData : window.unseenArticleData;
        const title = isWeek9 ? "The CIA Triad in Information Security" : "Operating Systems: Unseen";
        const subtitle = isWeek9 ? "עקרונות אבטחת מידע - לחץ על משפט לתרגום או החלף תצוגה לפסקה מלאה." : "מאמר המבחן הרשמי. לחץ על משפט כדי לראות תרגום.";
        
        let htmlBlock = `
            <div class="top-bar" style="max-width: 1000px; margin: 0 auto 1vh auto; justify-content: center; flex-wrap: wrap; gap: 1vw;">
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
                <div class="settings-box" style="background: rgba(16, 185, 129, 0.2); border-color: var(--emerald-main);">
                    <button class="nav-btn ${window.articleViewMode === 'sentence' ? 'active-emerald' : ''}" onclick="window.toggleArticleView('sentence')" style="border:none; margin:0;">משפטים</button>
                    <button class="nav-btn ${window.articleViewMode === 'paragraph' ? 'active-emerald' : ''}" onclick="window.toggleArticleView('paragraph')" style="border:none; margin:0;">פסקה שלמה</button>
                </div>
            </div>
            <div class="story-container">
                <div class="story-header">
                    <h2 class="story-title" style="color: ${isWeek9 ? 'var(--cyan-light)' : 'var(--purple-light)'}; text-shadow: 0 0 1.5vh ${isWeek9 ? 'rgba(34,211,238,0.5)' : 'rgba(168,85,247,0.5)'};">${title}</h2>
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
                            <div class="story-eng-text">
                                <span style="font-size: 1.2em; margin-right: 0.5vw;">${item.j}</span>
                                <span>${window.highlightText(item.e)}</span>
                            </div>
                        </div>
                        <div class="story-heb-text" dir="rtl">${item.h}</div>
                    </div>
                `;
            }).join('');
        } else {
            // Paragraph mode
            const fullEnglish = articleData.map(item => item.e).join(" ");
            const fullHebrew = articleData.map(item => item.h).join(" ");
            const safeText = fullEnglish.replace(/'/g, "\\\'").replace(/"/g, "&quot;");
            
            htmlBlock += `
                <div class="story-card expanded" style="cursor: default; padding: 4vh 3vw;">
                    <div style="display:flex; justify-content:center; margin-bottom: 3vh;">
                        <button class="story-audio-btn" style="width: 8vh; height: 8vh; transform: scale(1.2);" onclick="window.playAudio('${safeText}', this)" title="השמע הכל">
                            ${window.icons.volume}
                        </button>
                    </div>
                    <div class="story-eng-text" style="text-align: justify; margin-bottom: 4vh; font-size: clamp(18px, 2.8vh, 36px);">
                        ${window.highlightText(fullEnglish)}
                    </div>
                    <div class="story-heb-text" dir="rtl" style="display: block; text-align: justify; font-size: clamp(16px, 2.4vh, 30px); border-top: 2px dashed rgba(255,255,255,0.2); padding-top: 3vh;">
                        ${fullHebrew}
                    </div>
                </div>
            `;
        }
        
        htmlBlock += `
                <div style="display:flex; justify-content:center; margin-top: 3vh;">
                    <button class="control-btn" style="background: var(--cyan-main); border:none; box-shadow: 0 1vh 2vh rgba(34,211,238,0.4);" onclick="window.setWeek('quiz')">
                        התחל מבחן ${isWeek9 ? 'שבוע 9' : 'Unseen'} 🧠
                    </button>
                </div>
            </div>
        `;
        app.innerHTML = htmlBlock;
    } else if (window.currentWeek === 'quiz') {
        let quizHTML = '';
        if (window.quizState === 'start') {
            quizHTML = `
                <div class="center-stage" style="padding: 4vh 2vw; max-width: 600px; margin: auto; text-align: center; margin-top: 5vh;">
                    <div style="font-size: 4rem; margin-bottom: 2vh;">🧠</div>
                    <h2 style="font-size: 2.5rem; color: var(--cyan-light); margin-bottom: 1.5vh;">מבחנים חכמים</h2>
                    <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2vh;">תרגול שאלות הבנה. המבחן יבדוק הבנה אמיתית!</p>
                    
                    <div style="display: flex; justify-content: center; gap: 1vw; margin-bottom: 2vh; flex-wrap: wrap;">
                        <button class="nav-btn ${window.quizTargetWeek === 'week8' ? 'active-emerald' : ''}" onclick="window.setQuizTargetWeek('week8')">שבוע 8 (OS)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'week9' ? 'active-purple' : ''}" onclick="window.setQuizTargetWeek('week9')">שבוע 9 (CIA)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'mix' ? 'active-cyan' : ''}" onclick="window.setQuizTargetWeek('mix')">מיקס (הכל)</button>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1vw; margin-bottom: 3vh; flex-wrap: wrap;">
                        <button class="nav-btn ${window.quizDifficulty === 'easy' ? 'active-cyan' : ''}" onclick="window.setDifficulty('easy')">קל</button>
                        <button class="nav-btn ${window.quizDifficulty === 'medium' ? 'active-cyan' : ''}" onclick="window.setDifficulty('medium')">בינוני</button>
                        <button class="nav-btn ${window.quizDifficulty === 'hard' ? 'active-cyan' : ''}" onclick="window.setDifficulty('hard')">קשה</button>
                    </div>

                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--emerald-main); padding: 1.5vh; border-radius: 1vh; margin-bottom: 4vh; display: flex; justify-content: space-around;">
                        <span style="color: var(--emerald-light); font-size: 1.2rem; font-weight: bold;">שיא אישי: ${window.highScore} 🏆</span>
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
                    <h2 style="font-size: 2.5rem; color: var(--cyan-light); margin-bottom: 3vh;">היסטוריית מבחנים 📊</h2>
                    ${window.quizHistory.length === 0 ? '<p style="color: var(--text-muted); font-size: 1.2rem;">אין עדיין מבחנים מוקלטים.</p>' : `
                        <div style="width: 100%; max-height: 40vh; overflow-y: auto; background: rgba(15,23,42,0.5); border-radius: 1vh; border: 1px solid var(--border); margin-bottom: 3vh;">
                            ${window.quizHistory.map((h, i) => `
                                <div class="history-item">
                                    <span style="color: ${h.score >= 180 ? 'var(--emerald-light)' : h.score >= 100 ? 'var(--cyan-light)' : '#fca5a5'}; font-weight:bold;">ציון: ${h.score}</span>
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
                        <span style="color: var(--cyan-light); font-size: 1.2rem; font-weight: bold;">ניקוד: ${window.quizScore}</span>
                    </div>
                    <div class="flashcard" style="align-items: center; padding: 4vh 3vw; gap: 3vh; text-align: center;">
                        <h3 style="font-size: clamp(20px, 3vh, 40px); font-weight: 900; color: #fff; letter-spacing: 1px;" dir="ltr">${q.question}</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5vh; width: 100%; margin-top: 2vh;">
                            ${buttonsHTML}
                        </div>
                        <div style="min-height: 6vh; width: 100%; margin-top: 2vh; display: flex; justify-content: center; align-items: center;">
                            ${q.answered ? `
                                <button onclick="window.nextQuizQuestion()" class="control-btn" style="width: 100%; max-width: 300px; justify-content: center; background: var(--cyan-main); border-color: var(--cyan-light);">
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
                    <p style="font-size: 1.8rem; color: var(--cyan-light); font-weight: bold; margin-bottom: 2vh;">הציון שלך: ${window.quizScore} / 230</p>
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
        let summaryHtml = `
            <div class="summary-toggles">
                <button onclick="window.setSummaryMode('weeks')" class="sum-toggle ${window.summaryMode === 'weeks' ? 'active' : ''}">תצוגת שבועות</button>
                <button onclick="window.setSummaryMode('compact')" class="sum-toggle ${window.summaryMode === 'compact' ? 'active' : ''}">ריכוז כלל המילים</button>
            </div>
        `;
        if (window.summaryMode === 'weeks') {
            summaryHtml += `<div class="weeks-scroll">`;
            const weekTitles = {'week1': '4 (1)', 'week2': '5 (2)', 'week3': '6 (3)', 'week7': '7 (4)'};
            ['week1', 'week2', 'week3', 'week7'].forEach((week) => {
                summaryHtml += `<div class="week-section"><div class="week-title">שבוע ${weekTitles[week]}</div><div class="days-grid">`;
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

        app.innerHTML = `
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
                <div class="progress-box">
                    <span style="margin-bottom: 0.2vh;">מילה ${window.wordIndex + 1} מתוך ${currentWords.length}</span>
                    <div class="progress-dots">${dotsHtml}</div>
                </div>
            </div>

            <div class="flashcard">
                <div class="center-stage">
                    <div class="word-main-row">
                        <button class="audio-btn" onclick="window.playAudio('${wordData.word.replace(/'/g, "\\'")}')" title="השמע מילה">
                            ${window.icons.volume}
                        </button>
                        <div class="word-title">
                            ${wordData.word}
                            <span class="small-emoji">${wordData.visual}</span>
                        </div>
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
            </div>

            <div class="controls-container">
                <button class="control-btn" onclick="window.nextWord()" ${isLastWord ? 'disabled' : ''}>
                    ${window.icons.left_arrow} הבא
                </button>
                <button class="control-btn" onclick="window.prevWord()" ${isFirstWord ? 'disabled' : ''}>
                    הקודם ${window.icons.right_arrow}
                </button>
            </div>
        `;
    }
};

window.render();