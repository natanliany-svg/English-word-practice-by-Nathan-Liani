import codecs
import re
import json

# 1. Read data.js
with codecs.open('js/data.js', 'r', 'utf-8') as f:
    data_js = f.read()

# 2. Fix articleParagraphs for week16
# The correct grouping is: header in its own array, sentences in the next.
is_header = [True, False, False, False, True, False, False, False, False, True, False, False, False, False, False, False, False, False, True, False, False, False, False, True, False, False, False, False, False, False, False, False, False, True, False, False, False, True, False, False, False, False, False]
new_paragraphs = []
current_para = []
for idx, is_h in enumerate(is_header):
    if is_h:
        if current_para:
            new_paragraphs.append(current_para)
            current_para = []
        new_paragraphs.append([idx])
    else:
        current_para.append(idx)
        if len(current_para) >= 4 and idx + 1 < len(is_header) and not is_header[idx + 1]:
            new_paragraphs.append(current_para)
            current_para = []
if current_para:
    new_paragraphs.append(current_para)

para_str = json.dumps(new_paragraphs)
# Replace the bad array. We know it starts exactly at 'week16': [[0, 1, 2, 3]...
data_js = re.sub(r"'week16': \[\[0, 1, 2, 3\].*?\]\],", f"'week16': {para_str},", data_js, flags=re.DOTALL)

# 3. Fix week16ArticleData (add the j parameter)
def replacer(match):
    content = match.group(1)
    lines = content.split('\n')
    new_lines = []
    sentence_count = 1
    for line in lines:
        if not line.strip():
            new_lines.append(line)
            continue
        if 'isHeader: true' in line:
            new_line = line.replace('isHeader: true', 'isHeader: true, j: "??"')
            new_lines.append(new_line)
        elif 'isHeader: false' in line:
            new_line = line.replace('isHeader: false', f'isHeader: false, j: "{sentence_count}"')
            new_lines.append(new_line)
            sentence_count += 1
        else:
            new_lines.append(line)
    return 'window.week16ArticleData = [\n' + '\n'.join(new_lines) + '\n];'

data_js = re.sub(r'window\.week16ArticleData = \[\n(.*?)\n\];', replacer, data_js, flags=re.DOTALL)

# 4. Save data.js
with codecs.open('js/data.js', 'w', 'utf-8') as f:
    f.write(data_js)

# 5. Bump cache to v=100 in index.html
with codecs.open('index.html', 'r', 'utf-8') as f:
    index_html = f.read()

index_html = index_html.replace('v=99', 'v=100')

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(index_html)

print("Done patching data.js and index.html")
