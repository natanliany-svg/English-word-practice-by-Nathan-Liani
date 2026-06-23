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

texts_to_generate = set()

# Process article data
start = content.find('window.csharpJsArticleData = [')
end = content.find('];', start) + 1
if start != -1:
    data = content[start+29:end]
    arr = json.loads(data)
    for item in arr:
        if 'e' in item and item['e']:
            texts_to_generate.add(item['e'])

# Process vocab data
v_start = content.find('window.vocabularyData = {')
v_end = content.find('};\n', v_start) + 1
if v_start != -1:
    v_data = content[v_start+24:v_end]
    # v_data is a JS object, let's parse it somewhat carefully, or use regex
    # Actually, it's easier to find all "word" and "engEx" using regex since JSON parser might fail on unquoted keys
    words = re.findall(r'\"?word\"?\s*:\s*\"([^\"]+)\"', v_data)
    engExs = re.findall(r'\"?engEx\"?\s*:\s*\"([^\"]+)\"', v_data)
    for w in words: texts_to_generate.add(w)
    for ex in engExs: texts_to_generate.add(ex)

os.makedirs('audio', exist_ok=True)

for text in texts_to_generate:
    norm = normalize(text)
    if not norm: continue
    new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
    
    audio_map[norm] = new_id
    output_path = f'audio/{new_id}.mp3'
    
    if os.path.exists(output_path):
        continue
        
    print(f'Generating: {new_id} -> {text[:30]}...')
    cmd = ['edge-tts', '--voice', 'en-US-JennyNeural', '--text', text, '--write-media', output_path]
    subprocess.run(cmd, check=True)

with open(audio_map_path, 'w', encoding='utf-8') as f:
    f.write('window.audioMap = ' + json.dumps(audio_map, indent=2, ensure_ascii=False) + ';\n')

print('All audio generated and audioMap.js updated.')
