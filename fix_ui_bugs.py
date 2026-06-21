import re

def fix_app_js():
    with open('js/app.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix Week 10 hardcodes
    content = content.replace('שבוע 10 (HTTPS)', 'שבוע 11 (C# vs JS)')
    
    # Fix the focus dashboard "week10" to "week11" in case any were missed
    content = content.replace("מיקוד שבועי: שבוע 10", "מיקוד שבועי: שבוע 11")
    
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_style_css():
    with open('css/style.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace hardcoded var(--emerald-main/light) with theme vars
    content = content.replace('var(--emerald-main)', 'var(--theme-main)')
    content = content.replace('var(--emerald-light)', 'var(--theme-light)')
    
    # Replace some specific rgba greens with generic vars if they exist
    content = content.replace('rgba(52, 211, 153, 0.1)', 'var(--glow-1)')
    content = content.replace('rgba(16, 185, 129, 0.2)', 'var(--theme-glow)')
    content = content.replace('rgba(16, 185, 129, 0.4)', 'var(--theme-glow)')
    
    # Remove nth-child overrides for home cards
    removals = [
        ".home-card:nth-child(1) { border-left-color: var(--cyan-main); }",
        ".home-card:nth-child(2) { border-left-color: var(--theme-main); }",  # replaced above
        ".home-card:nth-child(2) { border-left-color: var(--emerald-main); }", # in case
        ".home-card:nth-child(3) { border-left-color: var(--purple-main); }",
        ".home-card:nth-child(4) { border-left-color: var(--cyan-light); }",
        ".home-card:nth-child(5) { border-left-color: #f59e0b; }"
    ]
    for r in removals:
        content = content.replace(r, "")
        
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_index_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('שבוע 10 (HTTPS)', 'שבוע 11 (C# vs JS)')
    content = content.replace('שבוע 10 🔐', 'שבוע 11 💻') # just in case
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixing files...")
fix_app_js()
fix_style_css()
fix_index_html()
print("Done!")
