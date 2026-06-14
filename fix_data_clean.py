import json
import re

with open('js/week10_article.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

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

with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Since we know window.httpsArticleData is the LAST thing in data.js, we can just replace from it to the end
idx = code.find('window.httpsArticleData =')
new_code = code[:idx] + 'window.httpsArticleData = ' + new_json_str + ';\n'

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("data.js updated with flat format!")

# Update app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

if "'week10': [" not in app:
    week9_idx = app.find("'week9': [")
    week9_end = app.find(']', week9_idx)
    week9_end = app.find(']', week9_end + 1)
    
    para_str = ",\n    'week10': " + json.dumps(paragraphs).replace('], [', '],\n        [').replace('[[', '[\n        [').replace(']]', ']\n    ]')
    new_app = app[:week9_end + 1] + para_str + app[week9_end + 1:]
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_app)
    print("app.js updated with paragraphs!")
else:
    print("app.js already has week10 paragraphs!")
