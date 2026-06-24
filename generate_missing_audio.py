import json
import os
import subprocess
import hashlib
import re

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'"\u200B`]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def main():
    with open('missing_strings.json', 'r', encoding='utf-8') as f:
        missing_texts = json.load(f)

    audio_map_path = 'js/audioMap.js'
    audio_map = {}
    if os.path.exists(audio_map_path):
        map_content = open(audio_map_path, encoding='utf-8').read()
        map_start = map_content.find('{')
        map_end = map_content.rfind('}') + 1
        if map_start != -1 and map_end != -1:
            audio_map = json.loads(map_content[map_start:map_end])

    os.makedirs('audio', exist_ok=True)
    
    count = 0
    total = len(missing_texts)
    
    for text in missing_texts:
        count += 1
        norm = normalize(text)
        if not norm: continue
        
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        audio_map[norm] = new_id
        
        output_path = f"audio/{new_id}.mp3"
        
        if os.path.exists(output_path):
            continue
            
        print(f"Generating {count}/{total}: {new_id} ({text[:30]}...)")
        
        try:
            cmd = ['edge-tts', '--voice', 'en-US-JennyNeural', '--text', text, '--write-media', output_path]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except subprocess.CalledProcessError as e:
            print(f"Failed to generate audio for {new_id}: {e.stderr.decode()}")
            continue

    with open(audio_map_path, 'w', encoding='utf-8') as f:
        f.write('window.audioMap = ' + json.dumps(audio_map, indent=2, ensure_ascii=False) + ';\n')

    print(f"Done generating audio. Updated {audio_map_path}.")

if __name__ == '__main__':
    main()
