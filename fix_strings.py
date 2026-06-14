import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace("window.goToWord('w9d1', 0)", "window.goToWord('w10d1', 0)")
app = app.replace('השבוע נלמד לקרוא טקסט מקצועי אודות: משולש אבטחת המידע (CIA Triad).', 'השבוע נלמד לקרוא טקסט מקצועי אודות: מעבר האינטרנט ל-HTTPS.')
app = app.replace('מאמר: The CIA Triad', 'מאמר: HTTP to HTTPS')
app = app.replace('מבחן הבנה ממוקד המורכב מ-10 שאלות מורכבות על עקרונות ה-CIA Triad.', 'מבחן הבנה ממוקד המורכב מ-10 שאלות על פרוטוקול HTTPS ואבטחת רשת.')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app)

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

idx = idx.replace('מיקוד: שבוע 9 🔒', 'מיקוד: שבוע 10 🔐')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)

print("Strings replaced successfully.")
