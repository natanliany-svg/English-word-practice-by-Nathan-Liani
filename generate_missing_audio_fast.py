import json
import os
import asyncio
import hashlib
import re

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'"\u200B`]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

async def generate_audio(sem, text, new_id, output_path):
    async with sem:
        if os.path.exists(output_path):
            return True
        cmd = ['edge-tts', '--voice', 'en-US-JennyNeural', '--text', text, '--write-media', output_path]
        proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            print(f"Failed {new_id}: {stderr.decode()}")
            return False
        return True

async def main():
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
    
    sem = asyncio.Semaphore(20) # 20 concurrent tasks
    tasks = []
    
    for text in missing_texts:
        norm = normalize(text)
        if not norm: continue
        
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        audio_map[norm] = new_id
        output_path = f"audio/{new_id}.mp3"
        
        tasks.append(generate_audio(sem, text, new_id, output_path))
        
    print(f"Starting {len(tasks)} concurrent generation tasks...")
    results = await asyncio.gather(*tasks)
    print(f"Finished {len(tasks)} tasks.")

    with open(audio_map_path, 'w', encoding='utf-8') as f:
        f.write('window.audioMap = ' + json.dumps(audio_map, indent=2, ensure_ascii=False) + ';\n')

    print(f"Updated {audio_map_path}.")

if __name__ == '__main__':
    asyncio.run(main())
