import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<button class="home-card focus-glow" onclick="window\.setWeek\(\'week12\'\)".*?מאמר: The Binary Counting.*?</div>\s*</button>',
    r'''<button class="home-card focus-glow" onclick="window.setWeek('week13')" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">📑</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: Musical Note (Hertz and Pitch)</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאת מאמר מעניין עם תרגום לעברית על אופן הפקת צלילים ותווים מוזיקליים, תדרים וגלי קול.</div>
                    </div>
                </button>''',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'<button class="home-card focus-glow" onclick="window\.setQuizTargetWeek\(\'week12\'\); window\.setWeek\(\'quiz\'\); window\.startQuiz\(\);".*?מבחן מיקוד 12.*?</div>\s*</button>',
    r'''<button class="home-card focus-glow" onclick="window.setQuizTargetWeek('week13'); window.setWeek('quiz'); window.startQuiz();" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🧠</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 13</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן המשלב שאלות מתוך המאמר החדש על גלי הקול ותדרים.</div>
                    </div>
                </button>''',
    content,
    flags=re.DOTALL
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
