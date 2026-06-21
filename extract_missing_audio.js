const fs = require('fs');

global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { documentElement: { setAttribute: () => {} }, getElementById: () => null };

// Load data.js
const dataJs = fs.readFileSync('js/data.js', 'utf8');
eval(dataJs);

const appJs = fs.readFileSync('temp_app.js', 'utf8');
eval(appJs);

const missingAudioRequests = [];

const articles = [
    { name: 'week8', data: window.unseenArticleData, paras: window.articleParagraphs['week8'] },
    { name: 'week9', data: window.ciaTriadArticleData, paras: window.articleParagraphs['week9'] },
    { name: 'week10', data: window.httpsArticleData, paras: window.articleParagraphs['week10'] },
    { name: 'week11', data: window.csharpJsArticleData, paras: window.articleParagraphs['week10'] } 
];

// In app.js: const paragraphs = window.articleParagraphs[isWeek10 ? 'week10' : (isWeek9 ? 'week9' : 'week8')];
// Wait, isWeek10 actually means week 11 now in my code? 
// Let's just generate all paragraphs and full text for ALL articles in data.js.

for (const articleInfo of articles) {
    const article = articleInfo.data;
    if (!article) continue;
    
    // Full article text
    const fullEnglish = article.map(item => item.e).join(" ");
    if (fullEnglish) {
        missingAudioRequests.push({ text: fullEnglish });
    }
    
    // Paragraphs
    let paras = articleInfo.paras;
    // For week 11 (csharpJs), I might not have an entry in articleParagraphs if it wasn't added.
    // Let's check window.articleParagraphs inside node.
    if (!paras && window.articleParagraphs) {
       // fallback to week10
       paras = window.articleParagraphs['week10'];
    }
    
    if (paras) {
        for (const p of paras) {
            const pText = p.map(idx => {
                if (article[idx]) return article[idx].e;
                return "";
            }).filter(x => x).join(" ");
            if (pText) {
                missingAudioRequests.push({ text: pText });
            }
        }
    }
}

// Write to JSON
fs.writeFileSync('missing_audio_requests.json', JSON.stringify(missingAudioRequests, null, 2));
console.log(`Generated missing_audio_requests.json with ${missingAudioRequests.length} items.`);
