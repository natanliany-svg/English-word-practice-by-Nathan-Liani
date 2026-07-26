import codecs
import re
import json

# 1. Fix data.js
data_js = codecs.open('js/data.js', 'r', 'utf-8').read()

# Extract week16ArticleData
match = re.search(r'window\.week16ArticleData = (\[.*?\]);\n', data_js, flags=re.DOTALL)
if match:
    json_str = match.group(1)
    # The JSON string has keys without quotes, we need to fix it to parse, or just use regex to process it.
    # Actually, it's easier to process the data if we just eval it in a safe way or use regex.
    # Let's just use regex to add j property.
    
    lines = json_str.split('\n')
    new_lines = []
    j_counter = 1
    paragraphs = []
    current_paragraph = []
    index = 0
    
    for line in lines:
        if '{ e:' in line or '{e:' in line:
            is_header = 'isHeader: true' in line
            if is_header:
                # Add j:"??"
                line = line.replace('{ e:', '{ j:"??", e:', 1).replace('{e:', '{ j:"??", e:', 1)
                if current_paragraph:
                    paragraphs.append(current_paragraph)
                current_paragraph = [index]
            else:
                line = line.replace('{ e:', f'{{ j:"{j_counter}", e:', 1).replace('{e:', f'{{ j:"{j_counter}", e:', 1)
                j_counter += 1
                if not current_paragraph:
                    current_paragraph = []
                current_paragraph.append(index)
            index += 1
        new_lines.append(line)
        
    if current_paragraph:
        paragraphs.append(current_paragraph)
        
    new_json_str = '\n'.join(new_lines)
    data_js = data_js.replace(match.group(0), f'window.week16ArticleData = {new_json_str};\n')
    
    # Add paragraphs to window.articleParagraphs
    para_match = re.search(r"window\.articleParagraphs = \{", data_js)
    if para_match:
        para_str = f"    'week16': {json.dumps(paragraphs)},\n"
        data_js = data_js[:para_match.end()] + "\n" + para_str + data_js[para_match.end():]
        
    codecs.open('js/data.js', 'w', 'utf-8').write(data_js)
    print("Fixed data.js")

# 2. Fix app.js
app_js = codecs.open('js/app.js', 'r', 'utf-8').read()
app_js = app_js.replace('מיקוד שבועי: שבוע 16 (Musical Note: Hertz and Pitch)', 'מיקוד שבועי: שבוע 16 (CPR in Adults and Children)')
app_js = app_js.replace('מיקוד שבועי: שבוע 16 ??', 'מיקוד שבועי: שבוע 16 🎯')
codecs.open('js/app.js', 'w', 'utf-8').write(app_js)
print("Fixed app.js")

