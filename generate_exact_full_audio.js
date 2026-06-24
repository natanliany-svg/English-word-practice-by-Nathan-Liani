const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

function normalize(text) {
    if (!text) return '';
    return text.replace(/['\`\u200b]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

const content = fs.readFileSync('js/data.js', 'utf8');
const data = eval(`(function() { const window = {}; ${content}; return {unseen: window.unseenArticleData, cia: window.ciaTriadArticleData, https: window.httpsArticleData, csharp: window.csharpJsArticleData}; })()`);

let audioMapContent = fs.readFileSync('js/audioMap.js', 'utf8');
const start = audioMapContent.indexOf('{');
const end = audioMapContent.lastIndexOf('}') + 1;
const audioMap = JSON.parse(audioMapContent.substring(start, end));

for (const key in data) {
    if (!data[key]) continue;
    // Exactly replicating JS: articleData.map(item => item.e).join(" ");
    let fullEnglish = data[key].map(item => item.e || "").join(" ");
    
    const norm = normalize(fullEnglish);
    if (!norm) continue;
    const hash = crypto.createHash('md5').update(norm).digest('hex');
    audioMap[norm] = hash;
    
    const outputPath = `audio/${hash}.mp3`;
    if (!fs.existsSync(outputPath)) {
        console.log(`Generating exact full article audio for ${key}: ${hash}...`);
        const textToSpeech = fullEnglish.replace(/"/g, '\\"');
        execSync(`edge-tts --voice en-US-JennyNeural --text "${textToSpeech}" --write-media ${outputPath}`);
    } else {
        console.log(`Audio for ${key} already exists: ${hash}`);
    }
}

fs.writeFileSync('js/audioMap.js', 'window.audioMap = ' + JSON.stringify(audioMap, null, 2) + ';\n');
console.log('Done.');
