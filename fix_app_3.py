import codecs
import re

file_path = 'js/app.js'
with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

# Normalize line endings just for safety, but we'll use regex anyway
# Let's replace week 12 references at the end of the file in the home screen
content = re.sub(r'onclick="window.setWeek\(\'week12\'\)" style="border-radius: 12px; padding: 20px;">\s*<div class="home-card-icon" style="font-size: 32px;">📑</div>\s*<div class="home-card-content" style="text-align: right;">\s*<div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: The Binary Counting</div>\s*<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאת מאמר מעניין עם תרגום לעברית על המערכת הבינארית שמשמשת את עולם המחשבים.</div>', 
r'''onclick="window.setWeek('week13')" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">📑</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: Musical Note (Hertz & Pitch)</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאת מאמר מעניין עם תרגום לעברית על אופן הפקת צלילים ותווים מוזיקליים, תדרים וגלי קול.</div>''', content)

content = re.sub(r'onclick="window.setQuizTargetWeek\(\'week12\'\); window.setWeek\(\'quiz\'\); window.startQuiz\(\);" style="border-radius: 12px; padding: 20px;">\s*<div class="home-card-icon" style="font-size: 32px;">🧠</div>\s*<div class="home-card-content" style="text-align: right;">\s*<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 12</div>\s*<div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן המשלב שאלות מתוך המאמר החדש על המערכת הבינארית.</div>',
r'''onclick="window.setQuizTargetWeek('week13'); window.setWeek('quiz'); window.startQuiz();" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🧠</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 13</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן המשלב שאלות מתוך המאמר החדש על גלי הקול ותדרים.</div>''', content)


# Also need to fix the Article View missing 'isWeek13' title and data
# Let's search for "The Binary Counting" in app.js and make sure Week 13 article has a title
content = re.sub(r'const articleData = isWeek12 \? window\.binaryArticleData :', r'const articleData = isWeek13 ? window.musicalNoteArticleData : (isWeek12 ? window.binaryArticleData :', content)
content = re.sub(r'const title = isWeek12 \? "The Binary Counting" :', r'const title = isWeek13 ? "The Musical Note: Hertz and Pitch" : (isWeek12 ? "The Binary Counting" :', content)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

print("Updated app.js with regex")
