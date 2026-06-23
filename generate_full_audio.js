const fs = require('fs');
const crypto = require('crypto');
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

const cmds = [];
for (const key in data) {
    if (!data[key]) continue;
    let fullEnglish = '';
    data[key].forEach(item => {
        if (item.e && item.j && !item.j.toString().includes('ה')) {
            fullEnglish += item.e + ' ';
        }
    });
    
    const norm = normalize(fullEnglish);
    if (!norm) continue;
    const hash = crypto.createHash('md5').update(norm).digest('hex');
    audioMap[norm] = hash;
    if (!fs.existsSync('audio/' + hash + '.mp3')) {
        cmds.push(`edge-tts --voice en-US-JennyNeural --text "${fullEnglish.replace(/"/g, '\\"')}" --write-media audio/${hash}.mp3`);
    }
}
fs.writeFileSync('js/audioMap.js', 'window.audioMap = ' + JSON.stringify(audioMap, null, 2) + ';\n');
fs.writeFileSync('run_tts.bat', cmds.join('\n'));
console.log('run_tts.bat generated with ' + cmds.length + ' commands.');
