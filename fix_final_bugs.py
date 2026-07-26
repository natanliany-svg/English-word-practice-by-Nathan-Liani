import codecs
import re

with codecs.open('js/app.js', 'r', 'utf-8') as f:
    content = f.read()

# Fix the "קריאת מאמר" button in the top Focus card
content = re.sub(
    r'<button class="control-btn" style="justify-content: center; padding: 10px; font-size: 13px; cursor: pointer;" onclick="window\.setWeek\(\'week12\'\)">\s*💻 קריאת מאמר\s*</button>',
    r'''<button class="control-btn" style="justify-content: center; padding: 10px; font-size: 13px; cursor: pointer;" onclick="window.setWeek('week13')">
                              💻 קריאת מאמר
                          </button>''',
    content,
    flags=re.DOTALL
)

# Fix the title of the Quiz card at the bottom
content = content.replace('מבחן מיקוד 12', 'מבחן מיקוד 13')

with codecs.open('js/app.js', 'w', 'utf-8') as f:
    f.write(content)
