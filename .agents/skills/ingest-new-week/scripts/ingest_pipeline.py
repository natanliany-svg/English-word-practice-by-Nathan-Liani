import argparse
import codecs
import re
import os
import json
import asyncio
import hashlib

def run_fix_quiz():
    print("Running fix-quiz...")
    try:
        content = codecs.open('js/quizData.js', 'r', 'utf-8').read()
        def replacer(match):
            obj = match.group(0)
            if 'diff:' not in obj and 'diff :' not in obj and '"diff"' not in obj:
                if 'ans:' in obj:
                    return obj.replace('ans:', 'diff: "medium",\nans:')
                else:
                    return obj
            return obj
        
        new_content = re.sub(r'\{\s*q:\s*".*?".*?\}', replacer, content, flags=re.DOTALL)
        codecs.open('js/quizData.js', 'w', 'utf-8').write(new_content)
        print("Success! Quiz difficulty levels fixed.")
    except Exception as e:
        print(f"Error in fix-quiz: {e}")
        exit(1)

def run_bump_cache():
    print("Running bump-cache...")
    try:
        # Bump in index.html
        content = codecs.open('index.html', 'r', 'utf-8').read()
        def replacer(m):
            v = int(m.group(1))
            return f"?v={v+1}"
        
        new_content = re.sub(r'\?v=(\d+)', replacer, content)
        codecs.open('index.html', 'w', 'utf-8').write(new_content)
        
        # Bump in app.js
        app_content = codecs.open('js/app.js', 'r', 'utf-8').read()
        new_app_content = re.sub(r"const CACHE_VERSION = 'v(\d+)';", lambda m: f"const CACHE_VERSION = 'v{int(m.group(1))+1}';", app_content)
        codecs.open('js/app.js', 'w', 'utf-8').write(new_app_content)
        
        print("Success! Cache bumped.")
    except Exception as e:
        print(f"Error in bump-cache: {e}")
        exit(1)

def run_update_ui(old_week, new_week):
    print(f"Running update-ui from {old_week} to {new_week}...")
    try:
        app_content = codecs.open('js/app.js', 'r', 'utf-8').read()
        # Very specific replacement strategy for focus glowing buttons at the bottom of the home screen.
        # This will be left as a manual prompt to the agent in the skill since string replacement is fragile.
        print(f"Success! Please use standard replacement tools (replace_file_content) for UI texts to update {old_week} to {new_week}.")
    except Exception as e:
        print(f"Error in update-ui: {e}")
        exit(1)

def main():
    parser = argparse.ArgumentParser(description="Ingest New Week Pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    subparsers.add_parser("fix-quiz", help="Inject diff property to quiz questions")
    subparsers.add_parser("bump-cache", help="Bump ?v=XX cache versions")
    
    ui_parser = subparsers.add_parser("update-ui", help="Update UI texts")
    ui_parser.add_argument("--old", required=True, help="Old week number")
    ui_parser.add_argument("--new", required=True, help="New week number")
    
    args = parser.parse_args()
    
    if args.command == "fix-quiz":
        run_fix_quiz()
    elif args.command == "bump-cache":
        run_bump_cache()
    elif args.command == "update-ui":
        run_update_ui(args.old, args.new)

if __name__ == "__main__":
    main()
