import codecs

with codecs.open('js/app.js', 'r', 'utf-8') as f:
    content = f.read()

# Fix Quiz Card
content = content.replace("window.setQuizTargetWeek('week12'); window.setWeek('quiz'); window.startQuiz();", "window.setQuizTargetWeek('week13'); window.setWeek('quiz'); window.startQuiz();")
content = content.replace('<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 12</div>', '<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן מיקוד 13</div>')
content = content.replace('מבחן המשלב שאלות מתוך המאמר החדש על המערכת הבינארית.', 'מבחן המשלב שאלות מתוך המאמר החדש על גלי הקול ותדרים.')

with codecs.open('js/app.js', 'w', 'utf-8') as f:
    f.write(content)
