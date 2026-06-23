import json
import os
import subprocess
import hashlib
import re

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'\"`\u200b]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

content = open('js/data.js', encoding='utf-8').read()
audio_map_path = 'js/audioMap.js'
audio_map = {}
if os.path.exists(audio_map_path):
    map_content = open(audio_map_path, encoding='utf-8').read()
    map_start = map_content.find('{')
    map_end = map_content.rfind('}') + 1
    if map_start != -1 and map_end != -1:
        audio_map = json.loads(map_content[map_start:map_end])

articles = ['window.unseenArticleData', 'window.ciaTriadArticleData', 'window.httpsArticleData', 'window.csharpJsArticleData']

for article_name in articles:
    start = content.find(article_name + ' = [')
    if start == -1: continue
    end = content.find('];', start) + 1
    data = content[start+len(article_name)+3:end]
    arr = json.loads(data)
    
    full_english = " ".join([item['e'] for item in arr if 'e' in item and item['e']])
    
    norm = normalize(full_english)
    if not norm: continue
    new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
    
    audio_map[norm] = new_id
    output_path = f'audio/{new_id}.mp3'
    
    if not os.path.exists(output_path):
        print(f'Generating full article audio for {article_name}: {new_id} -> {full_english[:30]}...')
        cmd = ['edge-tts', '--voice', 'en-US-JennyNeural', '--text', full_english, '--write-media', output_path]
        subprocess.run(cmd, check=True)

with open(audio_map_path, 'w', encoding='utf-8') as f:
    f.write('window.audioMap = ' + json.dumps(audio_map, indent=2, ensure_ascii=False) + ';\n')

print('Full articles audio generated and audioMap.js updated.')
