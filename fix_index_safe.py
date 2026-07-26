import codecs

with codecs.open('index.html', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('מיקוד: שבוע 13 🎵', 'מיקוד: שבוע 16 🚑')
content = content.replace('<button class="side-nav-btn" id="side-btn-week13" onclick="window.goToWord(\'w13d1\', 0); window.toggleMenu(false);"><small>10.</small> שבוע 13 🎵</button>', '<button class="side-nav-btn" id="side-btn-week13" onclick="window.goToWord(\'w13d1\', 0); window.toggleMenu(false);"><small>10.</small> שבוע 13 🎵</button>\n            <button class="side-nav-btn" id="side-btn-week16" onclick="window.goToWord(\'w16d1\', 0); window.toggleMenu(false);"><small>11.</small> שבוע 16 🚑</button>')
content = content.replace('v=98', 'v=99')

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(content)

print("Done fixing index.html")
