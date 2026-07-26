import codecs

file_path = 'index.html'
with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('מיקוד: שבוע 12 🔢', 'מיקוד: שבוע 13 🎵')

old_button = '<button class="side-nav-btn" id="side-btn-week12" onclick="window.goToWord(\'w12d1\', 0); window.toggleMenu(false);"><small>9.</small> שבוע 12 🔢</button>'
new_button = old_button + '\n            <button class="side-nav-btn" id="side-btn-week13" onclick="window.goToWord(\'w13d1\', 0); window.toggleMenu(false);"><small>10.</small> שבוע 13 🎵</button>'

if old_button in content and new_button not in content:
    content = content.replace(old_button, new_button)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

print("Updated index.html")
