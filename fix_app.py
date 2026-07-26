import codecs

file_path = 'js/app.js'
with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update Hero section
content = content.replace('מיקוד שבועי: שבוע 12 🎯', 'מיקוד שבועי: שבוע 13 🎵')
content = content.replace('הנושאים הכי רלוונטיים ומעודכנים לתרגול מהיר: המערכת הבינארית, שפת מחשב בסיסית, בסיס 2 והמרת נתונים.', 'הנושאים הכי רלוונטיים ומעודכנים לתרגול מהיר: התו המוזיקלי, תדרים (Hertz), גובה צליל, ואוקטבות.')

# 2. Update Hero Cards
content = content.replace('onclick="window.setWeek(\'week12\')"', 'onclick="window.setWeek(\'week13\')"')
content = content.replace('<div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: The Binary Counting</div>', '<div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: Musical Note (Hertz and Pitch)</div>')
content = content.replace('<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאת מאמר מעניין עם תרגום לעברית על המערכת הבינארית שמשמשת את עולם המחשבים.</div>', '<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאת מאמר מעניין עם תרגום לעברית על אופן הפקת צלילים ותווים מוזיקליים, תדרים וגלי קול.</div>')

content = content.replace('onclick="window.setQuizTargetWeek(\'week12\'); window.setWeek(\'quiz\'); window.startQuiz();"', 'onclick="window.setQuizTargetWeek(\'week13\'); window.setWeek(\'quiz\'); window.startQuiz();"')
content = content.replace('<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 12</div>', '<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 13</div>')
content = content.replace('<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן המשלב שאלות מתוך המאמר החדש על המערכת הבינארית.</div>', '<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן המשלב שאלות מתוך המאמר החדש על גלי הקול ותדרים.</div>')

# 3. Add Week 13 to the "Previous Weeks" list
week12_block = '''                    <div class="home-card-row">
                        <span class="home-card-number">9</span>
                        <button class="home-card" onclick="window.setWeek('week12')">
                            <div class="home-card-icon">🔢</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 12</div>
                                <div class="home-card-desc">אוצר מילים ומאמר - המערכת הבינארית.</div>
                            </div>
                        </button>
                    </div>'''

week13_block = '''                    <div class="home-card-row">
                        <span class="home-card-number">10</span>
                        <button class="home-card" onclick="window.setWeek('week13')">
                            <div class="home-card-icon">🎵</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 13</div>
                                <div class="home-card-desc">אוצר מילים ומאמר - התו המוזיקלי ותדרים.</div>
                            </div>
                        </button>
                    </div>'''

if week12_block in content and week13_block not in content:
    content = content.replace(week12_block, week12_block + '\n' + week13_block)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

print("Updated app.js")
