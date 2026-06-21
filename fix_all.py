import re
with open("js/app.js", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Vocab controls (Add Article buttons)
c = c.replace(
    "<button class=\"control-btn\" onclick=\"window.prevWord()\" ${isFirstWord ? 'disabled' : ''}>",
    "${window.currentWeek === 'week8' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('article')\">📄 מאמר</button>` : ''}\n${window.currentWeek === 'week9vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week9')\">📄 מאמר</button>` : ''}\n${window.currentWeek === 'week10vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week10')\">📄 מאמר</button>` : ''}\n<button class=\"control-btn\" onclick=\"window.prevWord()\" ${isFirstWord ? 'disabled' : ''}>"
)

# 2. Article settings & Home (Add Vocab buttons & Home button)
c = c.replace(
    "<button class=\"nav-btn ${window.articleViewMode === 'sentence' ? 'active-theme' : ''}\" onclick=\"window.toggleArticleView('sentence')\"",
    "<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-left:10px; margin-right:10px;\" onclick=\"window.setWeek('home')\">🏠 ראשי</button>\n${isWeek10 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w10d1', 0)\">📚 אוצר מילים</button>` : ''}\n${isWeek9 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w9d1', 0)\">📚 אוצר מילים</button>` : ''}\n${window.currentWeek === 'article' ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.setWeek('week8')\">📚 אוצר מילים</button>` : ''}\n<button class=\"nav-btn ${window.articleViewMode === 'sentence' ? 'active-theme' : ''}\" onclick=\"window.toggleArticleView('sentence')\""
)

# 3. Focus Dashboard Home button
c = c.replace(
    "<div class=\"home-section-title\" style=\"border:none; justify-content:center; text-align:center; margin-bottom: 15px;\">",
    "<div style=\"text-align: center; margin-bottom: 20px;\"><button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;\" onclick=\"window.setWeek('home')\">🏠 ראשי</button></div>\n<div class=\"home-section-title\" style=\"border:none; justify-content:center; text-align:center; margin-bottom: 15px;\">"
)

# 4. Vocab Top Bar Home button
c = c.replace(
    "<div class=\"top-bar\">\n                    <div class=\"settings-box\">",
    "<div class=\"top-bar\">\n                    <button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;\" onclick=\"window.setWeek('home')\">🏠 ראשי</button>\n                    <div class=\"settings-box\">"
)

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(c)
