import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

# Update renderWeeklyFocusDashboard
app = app.replace("const focusWeek = 'week10vocab'; // Focus on Week 9 Vocabulary", "const focusWeek = 'week10vocab'; // Focus on Week 10 Vocabulary")

# Wait, `app.js:1787` already says `week10vocab` because of a previous blind replace maybe?
# Let's fix the titles inside renderWeeklyFocusDashboard:
app = app.replace('מיקוד שבועי: שבוע 9 🎯', 'מיקוד שבועי: שבוע 10 🎯')
app = app.replace('השבוע נלמד לקרוא טקסט מקצועי אודות: משולש אבטחת המידע (CIA Triad).', 'השבוע נלמד לקרוא טקסט מקצועי אודות: מעבר האינטרנט ל-HTTPS.')
app = app.replace('קריאת מאמר: The CIA Triad', 'קריאת מאמר: HTTP to HTTPS')
app = app.replace('מאמר טכני קליל שיעזור לכם לתרגל קריאה והגייה נכונה.', 'מאמר טכני קליל שיעזור לכם לתרגל קריאה והגייה נכונה.')

# Wait, there is a second button in renderWeeklyFocusDashboard:
app = app.replace('<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן שבוע 9</div>', '<div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן שבוע 10</div>')
app = app.replace('בחנו את עצמכם על כל המילים שלמדתם בשבוע 9 והמאמר של ה-CIA Triad.', 'בחנו את עצמכם על כל המילים שלמדתם בשבוע 10 והמאמר של HTTPS.')

# The buttons onclick:
# In renderWeeklyFocusDashboard, there's `onclick="window.setWeek('week9')"` and `window.setQuizTargetWeek('week9')`
# We need to replace them inside the function body of renderWeeklyFocusDashboard
# Let's use regex for safety to only replace within the function
dashboard_start = app.find('window.renderWeeklyFocusDashboard = function() {')
if dashboard_start != -1:
    dashboard_end = app.find('window.renderSummaryView = function() {', dashboard_start)
    dashboard_body = app[dashboard_start:dashboard_end]
    
    dashboard_body = dashboard_body.replace("window.setWeek('week9')", "window.setWeek('week10')")
    dashboard_body = dashboard_body.replace("window.setQuizTargetWeek('week9')", "window.setQuizTargetWeek('week10')")
    
    app = app[:dashboard_start] + dashboard_body + app[dashboard_end:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print("Updated renderWeeklyFocusDashboard in app.js")
