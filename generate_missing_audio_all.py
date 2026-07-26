import json
import os
import asyncio
import hashlib
import re

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'\"`\u200b]', '', text)
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
    texts_to_generate = set()

    # Read both files
    files = ['js/data.js', 'js/quizData.js']
    content = ""
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            content += f.read() + "\n"

    # Extract all e: "..."
    matches = re.findall(r'e:\s*"([^"]+)"', content)
    for m in matches: texts_to_generate.add(m)

    # Extract all eng: "..."
    matches = re.findall(r'eng:\s*"([^"]+)"', content)
    for m in matches: texts_to_generate.add(m)

    # Extract all word: "..."
    matches = re.findall(r'word:\s*"([^"]+)"', content)
    for m in matches: texts_to_generate.add(m)

    # Extract all engEx: "..."
    matches = re.findall(r'engEx:\s*"([^"]+)"', content)
    for m in matches: texts_to_generate.add(m)

    # Extract all q: "..." (format q: "Eng text|Heb text")
    q_matches = re.findall(r'q:\s*"([^"]+)"', content)
    for q in q_matches:
        eng_part = q.split('|')[0].strip()
        texts_to_generate.add(eng_part)
    
    # Extract options: "Eng text|Heb text"
    opt_matches = re.findall(r'"([^"]+)\|([^"]+)"', content)
    for opt_eng, opt_heb in opt_matches:
        texts_to_generate.add(opt_eng.strip())

    audio_map_path = 'js/audioMap.js'
    audio_map = {}
    if os.path.exists(audio_map_path):
        map_content = open(audio_map_path, encoding='utf-8').read()
        map_start = map_content.find('{')
        map_end = map_content.rfind('}') + 1
        if map_start != -1 and map_end != -1:
            audio_map = json.loads(map_content[map_start:map_end])

    os.makedirs('audio', exist_ok=True)
    sem = asyncio.Semaphore(20)
    tasks = []

    for text in texts_to_generate:
        norm = normalize(text)
        if not norm: continue
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        
        # Add to tasks if it doesn't exist in the directory
        output_path = f"audio/{new_id}.mp3"
        if not os.path.exists(output_path):
            audio_map[norm] = new_id
            tasks.append(generate_audio(sem, text, new_id, output_path))
        else:
            audio_map[norm] = new_id # ensure it's in the map
        
    print(f"Starting {len(tasks)} concurrent generation tasks out of {len(texts_to_generate)} total strings...")
    if tasks:
        results = await asyncio.gather(*tasks)
        print(f"Finished {len(tasks)} tasks.")

    with open(audio_map_path, 'w', encoding='utf-8') as f:
        f.write('window.audioMap = ' + json.dumps(audio_map, indent=2, ensure_ascii=False) + ';\n')

    print(f"Updated {audio_map_path}.")

if __name__ == '__main__':
    asyncio.run(main())
