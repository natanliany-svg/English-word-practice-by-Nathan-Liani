import json
import re

# Read vocab JSON
with open('js/week10_vocab.json', 'r', encoding='utf-8') as f:
    vocab_list = json.load(f)

# Group into 4 days of 10 words each
w10_data = {
    'w10d1': vocab_list[0:10],
    'w10d2': vocab_list[10:20],
    'w10d3': vocab_list[20:30],
    'w10d4': vocab_list[30:40]
}

# Convert to string (without surrounding braces so we can inject it inside vocabularyData)
vocab_str = ""
for key, words in w10_data.items():
    vocab_str += f",\n    {key}:" + json.dumps(words, ensure_ascii=False, indent=0).replace('\n', '')

# Read data.js
with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find the end of window.vocabularyData object
# It ends right before window.unseenArticleData = [
unseen_idx = code.find('window.unseenArticleData = [')

# Find the closing brace of vocabularyData before unseen_idx
closing_brace_idx = code.rfind('}', 0, unseen_idx)

if closing_brace_idx == -1:
    print("Could not find end of vocabularyData")
    exit(1)

# Inject the w10 vocab right before the closing brace
new_code = code[:closing_brace_idx] + vocab_str + "\n" + code[closing_brace_idx:]

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Injected week 10 vocab into data.js")
