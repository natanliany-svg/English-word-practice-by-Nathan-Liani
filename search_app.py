import codecs

with codecs.open('js/app.js', 'r', 'utf-8') as f:
    lines = f.readlines()

with codecs.open('search_log.txt', 'w', 'utf-8') as f:
    for i, line in enumerate(lines):
        if "setWeek('week12')" in line or "setWeek('article')" in line or "The Binary Counting" in line or "קריאת מאמר" in line or "מבחן חכם" in line or "Musical Note" in line or "setWeek('week13')" in line:
            f.write(f"{i}: {line.strip()}\n")
