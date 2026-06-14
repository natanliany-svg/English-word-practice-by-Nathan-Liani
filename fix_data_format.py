import json
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find window.httpsArticleData = [...]
match = re.search(r'window\.httpsArticleData\s*=\s*(\[.*\]);', code, re.DOTALL)
if not match:
    print("Could not find httpsArticleData array!")
    exit(1)

json_str = match.group(1)
try:
    data = json.loads(json_str)
except Exception as e:
    print("JSON parse error:", e)
    exit(1)

flat_data = []
paragraphs = []
current_index = 0

for block in data:
    para_indices = []
    for s in block.get('sentences', []):
        flat_data.append({
            "j": str(current_index + 1),
            "e": s['e'],
            "h": s['h']
        })
        para_indices.append(current_index)
        current_index += 1
    if para_indices:
        paragraphs.append(para_indices)

new_json_str = json.dumps(flat_data, ensure_ascii=False, indent=2)
new_code = code[:match.start(1)] + new_json_str + code[match.end(1):]

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("data.js updated!")
print("Paragraphs:", paragraphs)

# Update app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

# Check if week10 is already in articleParagraphs
if "'week10': [" not in app:
    week9_idx = app.find("'week9': [")
    week9_end = app.find(']', week9_idx)
    # find the next ] which closes week9 array
    week9_end = app.find(']', week9_end + 1)
    
    para_str = ",\n    'week10': " + json.dumps(paragraphs).replace('], [', '],\n        [').replace('[[', '[\n        [').replace(']]', ']\n    ]')
    new_app = app[:week9_end + 1] + para_str + app[week9_end + 1:]
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_app)
    print("app.js updated!")
else:
    print("app.js already has week10 paragraphs!")

