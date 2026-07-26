import codecs

with codecs.open('js/app.js', 'r', 'utf-8') as f:
    lines = f.readlines()

with codecs.open('search_home.txt', 'w', 'utf-8') as f:
    for i, line in enumerate(lines):
        if "🎯 Weekly Focus Card" in line or "Weekly Focus Card" in line or "מיקוד שבועי:" in line:
            f.write(f"FOUND AT LINE {i}\n")
            for j in range(max(0, i-5), min(len(lines), i+30)):
                f.write(f"{j}: {lines[j].strip()}\n")
            f.write("-" * 40 + "\n")
