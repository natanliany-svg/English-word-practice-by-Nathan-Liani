const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

function normalize(text) {
    if (!text) return '';
    return text.replace(/['\`\u200b]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

const contentData = fs.readFileSync('js/data.js', 'utf8');
const data = eval(`(function() { const window = {}; ${contentData}; return {
    unseen: window.unseenArticleData, 
    cia: window.ciaTriadArticleData, 
    https: window.httpsArticleData, 
    csharp: window.csharpJsArticleData
}; })()`);

const appContent = fs.readFileSync('js/app.js', 'utf8');
const match = appContent.match(/window\.articleParagraphs = (\{[\s\S]*?\});/);
let paras = {};
if (match) {
    paras = eval('(' + match[1] + ')');
}

let audioMapContent = fs.readFileSync('js/audioMap.js', 'utf8');
const start = audioMapContent.indexOf('{');
const end = audioMapContent.lastIndexOf('}') + 1;
const audioMap = JSON.parse(audioMapContent.substring(start, end));

const weekMap = {
    'week8': data.unseen,
    'week9': data.cia,
    'week10': data.https,
    'week11': data.csharp
};

const cmds = [];
for (const week in weekMap) {
    const articleData = weekMap[week];
    const weekParas = paras[week];
    if (!weekParas || !articleData) continue;
    
    weekParas.forEach((paraIndices, pIdx) => {
        const paraEnglish = paraIndices.map(idx => articleData[idx].e).join(' ');
        const norm = normalize(paraEnglish);
        if (!norm) return;
        
        const hash = crypto.createHash('md5').update(norm).digest('hex');
        audioMap[norm] = hash;
        
        const outputPath = `audio/${hash}.mp3`;
        if (!fs.existsSync(outputPath)) {
            console.log(`Generating paragraph audio for ${week} para ${pIdx}: ${hash}...`);
            const textToSpeech = paraEnglish.replace(/"/g, '\\"');
            cmds.push(`edge-tts --voice en-US-JennyNeural --text "${textToSpeech}" --write-media ${outputPath}`);
        }
    });
}

fs.writeFileSync('js/audioMap.js', 'window.audioMap = ' + JSON.stringify(audioMap, null, 2) + ';\n');
fs.writeFileSync('run_para_tts.bat', cmds.join('\n'));
console.log('run_para_tts.bat generated with ' + cmds.length + ' commands.');
