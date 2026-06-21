import asyncio
import edge_tts
import json
import os
import sys

async def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_audio_batch.py <start_idx> <end_idx>")
        sys.exit(1)
        
    start_idx = int(sys.argv[1])
    end_idx = int(sys.argv[2])
    
    with open('audio_requests.json', 'r', encoding='utf-8') as f:
        requests = json.load(f)
        
    os.makedirs('audio', exist_ok=True)
    
    batch = requests[start_idx:end_idx]
    
    for i, req in enumerate(batch):
        text = req['text']
        id_val = req['id']
        filepath = f"audio/{id_val}.mp3"
        
        if os.path.exists(filepath):
            print(f"Skipping {i+1}/{len(batch)}: {id_val} (Already exists)")
            continue
            
        print(f"Generating {i+1}/{len(batch)}: {id_val}...")
        try:
            communicate = edge_tts.Communicate(text, "en-US-AriaNeural")
            await communicate.save(filepath)
        except Exception as e:
            print(f"Failed to generate for {id_val}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
