const fs = require('fs');

global.window = {};

// Load data.js
const dataJs = fs.readFileSync('js/data.js', 'utf8');
eval(dataJs);

const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const allAudioRequests = [];

// 1. Vocabulary (window.vocabularyData is { w1d1: [...], w1d2: [...] })
for (const day in window.vocabularyData) {
    const words = window.vocabularyData[day];
    if (Array.isArray(words)) {
        for (const item of words) {
            if (item.word) {
                allAudioRequests.push({ text: item.word, id: cyrb53(item.word) });
            }
            if (item.engEx) {
                allAudioRequests.push({ text: item.engEx, id: cyrb53(item.engEx) });
            }
        }
    }
}

// 2. Articles
const articles = [
    window.unseenArticleData, 
    window.ciaTriadArticleData, 
    window.httpsArticleData, 
    window.csharpJsArticleData
];

for (const article of articles) {
    if (!article) continue;
    for (const sentence of article) {
        if (sentence.e && isNaN(parseInt(sentence.j)) === false) { // Don't generate audio for emoji headers
             allAudioRequests.push({ text: sentence.e, id: cyrb53(sentence.e) });
        }
    }
}

// Remove duplicates
const uniqueRequests = [];
const seenIds = new Set();
for (const req of allAudioRequests) {
    if (!seenIds.has(req.id)) {
        seenIds.add(req.id);
        uniqueRequests.push(req);
    }
}

fs.writeFileSync('audio_requests.json', JSON.stringify(uniqueRequests, null, 2));
console.log(`Generated audio_requests.json with ${uniqueRequests.length} unique items.`);
