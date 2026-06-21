import re
import hashlib
import json
import os

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'"``]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def main():
    with open('audio_requests.json', 'r', encoding='utf-8') as f:
        requests = json.load(f)

    with open('js/audioMap.js', 'r', encoding='utf-8') as f:
        content = f.read()

    json_str = content.replace('window.audioMap = ', '').strip()
    if json_str.endswith(';'): json_str = json_str[:-1]

    try:
        audio_map = json.loads(json_str)
    except:
        print("Failed to parse audioMap.js. Using empty map.")
        audio_map = {}

    renamed_count = 0
    added_count = 0

    for req in requests:
        text = req['text']
        old_id = req['id']
        
        norm = normalize(text)
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        
        if norm not in audio_map:
            audio_map[norm] = new_id
            added_count += 1
            
        old_path = f"audio/{old_id}.mp3"
        new_path = f"audio/{new_id}.mp3"
        
        if os.path.exists(old_path):
            if not os.path.exists(new_path):
                os.rename(old_path, new_path)
                renamed_count += 1
            else:
                # If new path already exists, just remove the cyrb53 one to clean up
                os.remove(old_path)

    with open('js/audioMap.js', 'w', encoding='utf-8') as f:
        f.write(f"window.audioMap = {json.dumps(audio_map, indent=2)};")

    print(f"Updated audioMap. Added {added_count} new entries.")
    print(f"Renamed {renamed_count} generated mp3 files to MD5 hashes.")

if __name__ == '__main__':
    main()
