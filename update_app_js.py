import codecs
import re

app_js = codecs.open('js/app.js', 'r', 'utf-8').read()

# 1. Add week16vocab to window.allDaysData
app_js = app_js.replace("'week13': [", "'week16': [\n        'w16d1', 'w16d2', 'w16d3', 'w16d4', 'w16d5'\n    ],\n    'week13': [")

# 2. Add week16vocab to loadDay routing
app_js = app_js.replace("else if (week === 'week13vocab') window.currentDay = 'w13d1';", "else if (week === 'week16vocab') window.currentDay = 'w16d1';\n    else if (week === 'week13vocab') window.currentDay = 'w13d1';")

# 3. Add week16DB to fullDB
app_js = app_js.replace("else if (targetWeek && targetWeek.includes('week13')) fullDB = window.week13DB || [];", "else if (targetWeek && targetWeek.includes('week16')) fullDB = window.week16DB || [];\n    else if (targetWeek && targetWeek.includes('week13')) fullDB = window.week13DB || [];")
app_js = app_js.replace("...(window.week13DB||[])];", "...(window.week13DB||[]), ...(window.week16DB||[])];")

# 4. Add week16 to currentWeek check
app_js = app_js.replace("|| window.currentWeek === 'week13') {", "|| window.currentWeek === 'week13' || window.currentWeek === 'week16') {")

# 5. Add isWeek16
app_js = app_js.replace("const isWeek13 = window.currentWeek === 'week13';", "const isWeek16 = window.currentWeek === 'week16';\n        const isWeek13 = window.currentWeek === 'week13';")

# 6. Add articleData logic
app_js = app_js.replace("const articleData = isWeek13 ? window.musicalNoteArticleData : (isWeek12", "const articleData = isWeek16 ? window.week16ArticleData : (isWeek13 ? window.musicalNoteArticleData : (isWeek12")
app_js = app_js.replace("window.unseenArticleData))));", "window.unseenArticleData)))));")

# 7. Add title logic
app_js = app_js.replace("const title = isWeek13 ? \"The Musical Note: Hertz and Pitch\" : (isWeek12", "const title = isWeek16 ? \"CPR in Adults and Children\" : (isWeek13 ? \"The Musical Note: Hertz and Pitch\" : (isWeek12")
app_js = app_js.replace("Operating Systems: Unseen\"))));", "Operating Systems: Unseen\")))));")

# 8. Add paragraphs logic (2 places)
app_js = app_js.replace("const paragraphs = window.articleParagraphs[isWeek13 ? 'week13' : (isWeek12", "const paragraphs = window.articleParagraphs[isWeek16 ? 'week16' : (isWeek13 ? 'week13' : (isWeek12")
app_js = app_js.replace("week8'))))];", "week8')))))];")

# 9. Add summary logic
app_js = app_js.replace("const sumObj = isWeek13 ? window.musicalNoteArticleSummary : (isWeek12", "const sumObj = isWeek16 ? window.week16ArticleSummary : (isWeek13 ? window.musicalNoteArticleSummary : (isWeek12")
app_js = app_js.replace("window.unseenArticleSummary))));", "window.unseenArticleSummary)))));")

# 10. Update quiz menu
app_js = app_js.replace("onclick=\"window.setQuizTargetWeek('week13')\">מבחן 13 (Musical Note)</button>", "onclick=\"window.setQuizTargetWeek('week13')\">מבחן 13 (Musical Note)</button>\n                        <button class=\"nav-btn ${window.quizTargetWeek === 'week16' ? 'active-theme' : ''}\" onclick=\"window.setQuizTargetWeek('week16')\">מבחן 16 (CPR)</button>")

# 11. Add to weekNum and weekText dicts (2 places)
app_js = app_js.replace("'week13vocab': '10.'};", "'week13vocab': '10.', 'week16vocab': '11.'};")
app_js = app_js.replace("'week13vocab': 'שבוע 13'};", "'week13vocab': 'שבוע 13', 'week16vocab': 'שבוע 16'};")

# 12. Add to foreach array (2 places)
app_js = app_js.replace("'week12vocab', 'week13vocab'].forEach", "'week12vocab', 'week13vocab', 'week16vocab'].forEach")

# 13. Update focus logic at end
app_js = app_js.replace("const focusWeek = 'week13vocab';", "const focusWeek = 'week16vocab';")
app_js = app_js.replace("window.setWeek('week13')", "window.setWeek('week16')")
app_js = app_js.replace("window.setQuizTargetWeek('week13')", "window.setQuizTargetWeek('week16')")

# 14. Update Home focus texts
app_js = app_js.replace("מיקוד שבועי: שבוע 13", "מיקוד שבועי: שבוע 16")
app_js = app_js.replace("מאמר: Musical Note (Hertz and Pitch)", "מאמר: CPR in Adults and Children")
app_js = app_js.replace("מבחן מיקוד 13", "מבחן מיקוד 16")


codecs.open('js/app.js', 'w', 'utf-8').write(app_js)
