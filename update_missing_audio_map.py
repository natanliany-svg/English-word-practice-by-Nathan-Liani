import json
import hashlib
import re

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'"``]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def main():
    with open('missing_audio_requests.json', 'r', encoding='utf-8') as f:
        requests = json.load(f)

    with open('js/audioMap.js', 'r', encoding='utf-8') as f:
        content = f.read()

    json_str = content.replace('window.audioMap = ', '').strip()
    if json_str.endswith(';'): json_str = json_str[:-1]

    audio_map = json.loads(json_str)
    added_count = 0

    for req in requests:
        text = req['text']
        norm = normalize(text)
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        
        if norm not in audio_map:
            audio_map[norm] = new_id
            added_count += 1

    with open('js/audioMap.js', 'w', encoding='utf-8') as f:
        f.write(f"window.audioMap = {json.dumps(audio_map, indent=2)};")

    print(f"Updated audioMap. Added {added_count} new entries.")

if __name__ == '__main__':
    main()
