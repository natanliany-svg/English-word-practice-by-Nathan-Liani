import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

# Replace Weekly Focus Title
app = app.replace('מיקוד שבועי: שבוע 9 (CIA Triad)', 'מיקוד שבועי: שבוע 10 (HTTPS)')
app = app.replace('החומרים הכי רלוונטיים ומעודכנים לתרגול מהיר', 'החומרים הכי רלוונטיים ומעודכנים לתרגול מהיר') # Do nothing just verify

# The buttons in the top box. We only want to replace the first occurrence (which is in the home page focus)
app = app.replace('onclick="window.setWeek(\'week9vocab\')"', 'onclick="window.setWeek(\'week10vocab\')"', 1)
app = app.replace('onclick="window.setWeek(\'week9\')"', 'onclick="window.setWeek(\'week10\')"', 1)
app = app.replace('window.setQuizTargetWeek(\'week9\'); window.setWeek(\'quiz\'); window.startQuiz();', 'window.setQuizTargetWeek(\'week10\'); window.setWeek(\'quiz\'); window.startQuiz();', 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print("Updated app.js")
