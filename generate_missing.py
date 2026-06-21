import json
import os
import subprocess
import hashlib
import re
import sys

def normalize(text):
    if not text: return ""
    text = re.sub(r'[\'"``]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def main():
    start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    end_idx = int(sys.argv[2]) if len(sys.argv) > 2 else 999999

    with open('missing_audio_requests.json', 'r', encoding='utf-8') as f:
        requests = json.load(f)[start_idx:end_idx]

    for i, req in enumerate(requests):
        text = req['text']
        norm = normalize(text)
        new_id = hashlib.md5(norm.encode('utf-8')).hexdigest()
        
        output_path = f"audio/{new_id}.mp3"
        
        if os.path.exists(output_path):
            print(f"Skipping {i+1}/{len(requests)}: {new_id} (Already exists)")
            continue
            
        print(f"Generating {i+1}/{len(requests)}: {new_id}...")
        
        try:
            cmd = ['edge-tts', '--voice', 'en-US-JennyNeural', '--text', text, '--write-media', output_path]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except subprocess.CalledProcessError as e:
            print(f"Failed to generate audio for {new_id}: {e.stderr.decode()}")
            continue

    print(f"Done generating batch {start_idx} to {end_idx}.")

if __name__ == '__main__':
    main()
