import codecs

with codecs.open('js/app.js', 'r', 'utf-8') as f:
    lines = f.readlines()

with codecs.open('search_focus.txt', 'w', 'utf-8') as f:
    for i, line in enumerate(lines):
        if "Focus Card" in line:
            f.write(f"FOUND AT LINE {i}\n")
            for j in range(i, i+25):
                f.write(f"{j}: {lines[j].strip()}\n")
            f.write("-" * 40 + "\n")
