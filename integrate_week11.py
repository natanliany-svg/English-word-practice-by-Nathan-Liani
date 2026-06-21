"""
Integration script for Week 11 content.
Merges vocab, article, and quiz data into the existing site files.
Also updates app.js and index.html with Week 11 navigation and routing.
"""
import re, json, sys

REPO = r'c:\Users\natan\Desktop\אישי - נתן\AI\ANTYGRAVITY\repo'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def integrate():
    print("=== Starting Week 11 Integration ===")
    
    # 1. Read all generated files
    print("1. Reading generated files...")
    vocab_d1d2 = read_file(f'{REPO}/week11_vocab_d1d2.js')
    vocab_d3d4 = read_file(f'{REPO}/week11_vocab_d3d4.js')
    article = read_file(f'{REPO}/week11_article.js')
    quiz = read_file(f'{REPO}/week11_quiz.js')
    
    # 2. Extract vocab arrays from generated files
    print("2. Extracting vocab data...")
    # Extract w11d1, w11d2 arrays
    w11d1_match = re.search(r'w11d1:\s*\[(.*?)\](?=\s*[,}])', vocab_d1d2, re.DOTALL)
    w11d2_match = re.search(r'w11d2:\s*\[(.*?)\](?=\s*[,}])', vocab_d1d2, re.DOTALL)
    w11d3_match = re.search(r'w11d3:\s*\[(.*?)\](?=\s*[,}])', vocab_d3d4, re.DOTALL)
    w11d4_match = re.search(r'w11d4:\s*\[(.*?)\](?=\s*[,}])', vocab_d3d4, re.DOTALL)
    
    if not all([w11d1_match, w11d2_match, w11d3_match, w11d4_match]):
        print("ERROR: Could not extract all vocab arrays!")
        print(f"  w11d1: {'Found' if w11d1_match else 'MISSING'}")
        print(f"  w11d2: {'Found' if w11d2_match else 'MISSING'}")
        print(f"  w11d3: {'Found' if w11d3_match else 'MISSING'}")
        print(f"  w11d4: {'Found' if w11d4_match else 'MISSING'}")
        return False
    
    w11d1_data = w11d1_match.group(1).strip()
    w11d2_data = w11d2_match.group(1).strip()
    w11d3_data = w11d3_match.group(1).strip()
    w11d4_data = w11d4_match.group(1).strip()
    
    # 3. Extract article data
    print("3. Extracting article data...")
    article_match = re.search(r'window\.csharpJsArticleData\s*=\s*\[(.*)\];', article, re.DOTALL)
    if not article_match:
        print("ERROR: Could not extract article data!")
        return False
    article_data = article_match.group(1).strip()
    
    # 4. Extract quiz data
    print("4. Extracting quiz data...")
    quiz_match = re.search(r'window\.week11QuizData\s*=\s*\[(.*)\];', quiz, re.DOTALL)
    if not quiz_match:
        print("ERROR: Could not extract quiz data!")
        return False
    quiz_data = quiz_match.group(1).strip()
    
    # 5. Update data.js
    print("5. Updating data.js...")
    data_js = read_file(f'{REPO}/js/data.js')
    
    # Add vocab entries before the closing of vocabularyData
    # Find the last entry (w10d4) and add after it
    vocab_insert = f""",
  w11d1:[{w11d1_data}],
  w11d2:[{w11d2_data}],
  w11d3:[{w11d3_data}],
  w11d4:[{w11d4_data}]"""
    
    # Find w10d4 closing and insert after
    data_js = data_js.replace(
        "w10d4:[",
        "w10d4:["
    )
    
    # Find the end of vocabularyData object
    # Pattern: last ] in the vocab data before daysList
    idx = data_js.find('window.daysList')
    if idx == -1:
        print("ERROR: Could not find window.daysList!")
        return False
    
    # Find the }; before daysList
    close_idx = data_js.rfind('};', 0, idx)
    if close_idx == -1:
        print("ERROR: Could not find vocabularyData closing!")
        return False
    
    # Insert vocab data before the };
    data_js = data_js[:close_idx] + vocab_insert + '\n' + data_js[close_idx:]
    
    # Add daysList entries for week 11
    days_insert = """  { id: 'w11d1', week: 'week11vocab', title: 'יום 1', date: 'Week 11' },
  { id: 'w11d2', week: 'week11vocab', title: 'יום 2', date: 'Week 11' },
  { id: 'w11d3', week: 'week11vocab', title: 'יום 3', date: 'Week 11' },
  { id: 'w11d4', week: 'week11vocab', title: 'יום 4', date: 'Week 11' }"""
    
    data_js = data_js.replace(
        "  { id: 'w10d4', week: 'week10vocab', title: 'יום 4', date: 'Week 10' }\n];",
        "  { id: 'w10d4', week: 'week10vocab', title: 'יום 4', date: 'Week 10' },\n" + days_insert + "\n];"
    )
    
    # Add article data at the end
    data_js += f"\n\nwindow.csharpJsArticleData = [\n{article_data}\n];\n"
    
    write_file(f'{REPO}/js/data.js', data_js)
    print("  data.js updated!")
    
    # 6. Update quizData.js
    print("6. Updating quizData.js...")
    quiz_js = read_file(f'{REPO}/js/quizData.js')
    
    # Add week 11 quiz questions to the unseenDB array
    # Find the last ] of the array
    last_bracket = quiz_js.rfind('];')
    if last_bracket == -1:
        print("ERROR: Could not find end of unseenDB!")
        return False
    
    quiz_js = quiz_js[:last_bracket] + ',\n' + quiz_data + '\n];'
    write_file(f'{REPO}/js/quizData.js', quiz_js)
    print("  quizData.js updated!")
    
    # 7. Update app.js
    print("7. Updating app.js...")
    app_js = read_file(f'{REPO}/js/app.js')
    
    # a. Add week11vocab to setWeek
    app_js = app_js.replace(
        "else if (week === 'week10vocab') window.currentDay = 'w10d1';",
        "else if (week === 'week10vocab') window.currentDay = 'w10d1';\n    else if (week === 'week11vocab') window.currentDay = 'w11d1';"
    )
    
    # b. Add week11 to article routing
    app_js = app_js.replace(
        "} else if (window.currentWeek === 'article' || window.currentWeek === 'week9' || window.currentWeek === 'week10') {",
        "} else if (window.currentWeek === 'article' || window.currentWeek === 'week9' || window.currentWeek === 'week10' || window.currentWeek === 'week11') {"
    )
    app_js = app_js.replace(
        "const isWeek10 = window.currentWeek === 'week10';",
        "const isWeek10 = window.currentWeek === 'week10';\n        const isWeek11 = window.currentWeek === 'week11';"
    )
    app_js = app_js.replace(
        "const articleData = isWeek10 ? window.httpsArticleData : (isWeek9 ? window.ciaTriadArticleData : window.unseenArticleData);",
        "const articleData = isWeek11 ? window.csharpJsArticleData : (isWeek10 ? window.httpsArticleData : (isWeek9 ? window.ciaTriadArticleData : window.unseenArticleData));"
    )
    app_js = app_js.replace(
        'const title = isWeek10 ? "HTTP to HTTPS Transition" : (isWeek9 ? "The CIA Triad in Information Security" : "Operating Systems: Unseen");',
        'const title = isWeek11 ? "C# and JavaScript: Compiled vs Interpreted" : (isWeek10 ? "HTTP to HTTPS Transition" : (isWeek9 ? "The CIA Triad in Information Security" : "Operating Systems: Unseen"));'
    )
    
    # c. Add home card for week 11
    week11_card = """                    <div class="home-card-row">
                        <span class="home-card-number">8</span>
                        <button class="home-card" onclick="window.setWeek('week11')">
                            <div class="home-card-icon">💻</div>
                            <div class="home-card-content">
                                <div class="home-card-title">שבוע 11</div>
                                <div class="home-card-desc">אוצר מילים ומאמר - C# ו-JavaScript.</div>
                            </div>
                        </button>
                    </div>"""
    app_js = app_js.replace(
        '                </div>\n\n                <h3 class="home-section-title">תרגול ומבחנים</h3>',
        week11_card + '\n                </div>\n\n                <h3 class="home-section-title">תרגול ומבחנים</h3>'
    )
    
    # d. Add week 11 quiz selector button
    app_js = app_js.replace(
        """<button class="nav-btn ${window.quizTargetWeek === 'week10' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week10')">שבוע 10 (HTTPS)</button>""",
        """<button class="nav-btn ${window.quizTargetWeek === 'week10' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week10')">שבוע 10 (HTTPS)</button>
                        <button class="nav-btn ${window.quizTargetWeek === 'week11' ? 'active' : ''}" onclick="window.setQuizTargetWeek('week11')">שבוע 11 (C#/JS)</button>"""
    )
    
    # e. Add week11 to summary weekNum
    app_js = app_js.replace(
        "const weekNum = {'week1': '1.', 'week2': '2.', 'week3': '3.', 'week7': '4.', 'week8': '5.', 'week9vocab': '6.', 'week10vocab': '7.'};",
        "const weekNum = {'week1': '1.', 'week2': '2.', 'week3': '3.', 'week7': '4.', 'week8': '5.', 'week9vocab': '6.', 'week10vocab': '7.', 'week11vocab': '8.'};"
    )
    
    # f. Add article button for week11 vocab view
    app_js = app_js.replace(
        "${window.currentWeek === 'week10vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week10')\">📄 מאמר</button>` : ''}",
        "${window.currentWeek === 'week10vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week10')\">📄 מאמר</button>` : ''}\n${window.currentWeek === 'week11vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week11')\">📄 מאמר</button>` : ''}",
        1  # Only replace first occurrence
    )
    
    # g. Add vocab button for week11 article view
    app_js = app_js.replace(
        "${isWeek10 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w10d1', 0)\">📚 אוצר מילים</button>` : ''}",
        "${isWeek11 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w11d1', 0)\">📚 אוצר מילים</button>` : ''}\n                    ${isWeek10 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w10d1', 0)\">📚 אוצר מילים</button>` : ''}",
        1  # Only replace first occurrence
    )
    
    # h. Update focus dashboard to week 11
    app_js = app_js.replace(
        "const focusWeek = 'week10vocab'; // Focus on Week 10 Vocabulary",
        "const focusWeek = 'week11vocab'; // Focus on Week 11 Vocabulary"
    )
    app_js = app_js.replace(
        "מיקוד שבועי: שבוע 10 🎯",
        "מיקוד שבועי: שבוע 11 🎯"
    )
    app_js = app_js.replace(
        "חומר הלימוד הרלוונטי והמעודכן ביותר לשבוע האחרון: עקרונות אבטחת מידע (CIA Triad).",
        "חומר הלימוד הרלוונטי והמעודכן ביותר לשבוע האחרון: שפות קומפילציה ואינטרפרטציה (C# ו-JavaScript)."
    )
    app_js = app_js.replace(
        """<button class="home-card focus-glow" onclick="window.setWeek('week10')" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🔐</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: HTTP to HTTPS</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאה ותרגום אינטראקטיביים של מאמר אבטחת המידע הרשמי עם הקראה קולית.</div>""",
        """<button class="home-card focus-glow" onclick="window.setWeek('week11')" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">💻</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מאמר: C# and JavaScript</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">קריאה ותרגום אינטראקטיביים של מאמר על שפות קומפילציה ואינטרפרטציה עם הקראה קולית.</div>"""
    )
    app_js = app_js.replace(
        """<button class="home-card focus-glow" onclick="window.setQuizTargetWeek('week10'); window.setWeek('quiz'); window.startQuiz();" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🧠</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן שבוע 10</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן הבנה ממוקד המורכב מ-10 שאלות על פרוטוקול HTTPS ואבטחת רשת.</div>""",
        """<button class="home-card focus-glow" onclick="window.setQuizTargetWeek('week11'); window.setWeek('quiz'); window.startQuiz();" style="border-radius: 12px; padding: 20px;">
                    <div class="home-card-icon" style="font-size: 32px;">🧠</div>
                    <div class="home-card-content" style="text-align: right;">
                        <div class="home-card-title" style="font-size: 18px; color: #fff;">מבחן שבוע 11</div>
                        <div class="home-card-desc" style="font-size: 12px; margin-top: 5px;">מבחן הבנה ממוקד על שפות תכנות C# ו-JavaScript.</div>"""
    )
    
    # i. Update total words count in summary description
    app_js = app_js.replace('כל 240 המילים', 'כל 280 המילים')
    
    write_file(f'{REPO}/js/app.js', app_js)
    print("  app.js updated!")
    
    # 8. Update index.html
    print("8. Updating index.html...")
    index_html = read_file(f'{REPO}/index.html')
    
    # Add week 11 sidebar button
    index_html = index_html.replace(
        """            <button class="side-nav-btn" id="side-btn-week10" onclick="window.goToWord('w10d1', 0); window.toggleMenu(false);"><small>7.</small> שבוע 10 🔐</button>""",
        """            <button class="side-nav-btn" id="side-btn-week10" onclick="window.goToWord('w10d1', 0); window.toggleMenu(false);"><small>7.</small> שבוע 10 🔐</button>
            <button class="side-nav-btn" id="side-btn-week11" onclick="window.goToWord('w11d1', 0); window.toggleMenu(false);"><small>8.</small> שבוע 11 💻</button>"""
    )
    
    # Update focus button to week 11
    index_html = index_html.replace(
        'מיקוד: שבוע 10 🔐',
        'מיקוד: שבוע 11 💻'
    )
    
    # Bump cache version
    index_html = re.sub(r"CACHE_VERSION = 'v\d+'", "CACHE_VERSION = 'v81'", index_html)
    index_html = re.sub(r"data\.js\?v=\d+", "data.js?v=81", index_html)
    index_html = re.sub(r"app\.js\?v=\d+", "app.js?v=81", index_html)
    index_html = re.sub(r"quizData\.js\?v=\d+", "quizData.js?v=81", index_html)
    
    write_file(f'{REPO}/index.html', index_html)
    print("  index.html updated!")
    
    print("\n=== Integration Complete! ===")
    return True

if __name__ == '__main__':
    success = integrate()
    sys.exit(0 if success else 1)
