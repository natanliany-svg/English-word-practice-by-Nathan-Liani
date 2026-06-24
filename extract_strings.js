const fs = require('fs');

global.window = {};

const dataContent = fs.readFileSync('js/data.js', 'utf8');
const quizDataContent = fs.readFileSync('js/quizData.js', 'utf8');

eval(dataContent);
eval(quizDataContent);

let allStrings = new Set();

if (window.vocabularyData) {
    for (let day in window.vocabularyData) {
        for (let wordObj of window.vocabularyData[day]) {
            if (wordObj.word) allStrings.add(wordObj.word);
            if (wordObj.engEx) allStrings.add(wordObj.engEx);
        }
    }
}

const articleKeys = Object.keys(window).filter(k => k.endsWith('ArticleData'));
for (let key of articleKeys) {
    const arr = window[key];
    if (Array.isArray(arr)) {
        for (let item of arr) {
            if (item.e) allStrings.add(item.e);
        }
    }
}

const dbKeys = Object.keys(window).filter(k => k.endsWith('DB'));
for (let key of dbKeys) {
    const arr = window[key];
    if (Array.isArray(arr)) {
        for (let item of arr) {
            if (item.q) allStrings.add(item.q);
            if (item.options) {
                for (let opt of item.options) {
                    if (!/[\u0590-\u05FF]/.test(opt)) {
                        allStrings.add(opt); 
                    }
                }
            }
        }
    }
}

let audioMap = {};
if (fs.existsSync('js/audioMap.js')) {
    const mapContent = fs.readFileSync('js/audioMap.js', 'utf8');
    const mapStart = mapContent.indexOf('{');
    const mapEnd = mapContent.lastIndexOf('}') + 1;
    if (mapStart !== -1 && mapEnd !== -1) {
        audioMap = JSON.parse(mapContent.substring(mapStart, mapEnd));
    }
}

function normalize(text) {
    if (!text) return "";
    text = text.replace(/['"`\u200B]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    return text;
}

let missing = [];
for (let text of allStrings) {
    let norm = normalize(text);
    if (!norm) continue;
    if (!audioMap[norm]) {
        missing.push(text);
    }
}

fs.writeFileSync('missing_strings.json', JSON.stringify(missing, null, 2));
console.log(`Found ${missing.length} missing strings!`);
