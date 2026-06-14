const fs = require('fs');
let c = fs.readFileSync('js/app.js', 'utf8');

c = c.replace(
    /<button class="control-btn" onclick="window\.prevWord\(\)" \$\{isFirstWord \? 'disabled' : ''\}>/,
    "${window.currentWeek === 'week8' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('article')\">📄 מאמר</button>` : ''}\n${window.currentWeek === 'week9vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week9')\">📄 מאמר</button>` : ''}\n${window.currentWeek === 'week10vocab' ? `<button class=\"control-btn\" style=\"background:var(--emerald-dark); border-color:var(--emerald-main); color:#fff;\" onclick=\"window.setWeek('week10')\">📄 מאמר</button>` : ''}\n<button class=\"control-btn\" onclick=\"window.prevWord()\" ${isFirstWord ? 'disabled' : ''}>"
);

c = c.replace(
    /<button class="nav-btn \$\{window\.articleViewMode === 'sentence' \? 'active-theme' : ''\}" onclick="window\.toggleArticleView\('sentence'\)"/,
    "${isWeek10 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w10d1', 0)\">📚 אוצר מילים</button>` : ''}\n${isWeek9 ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.goToWord('w9d1', 0)\">📚 אוצר מילים</button>` : ''}\n${window.currentWeek === 'article' ? `<button class=\"nav-btn\" style=\"background:var(--theme-main); color:#fff; border:none; margin-right:10px;\" onclick=\"window.setWeek('week8')\">📚 אוצר מילים</button>` : ''}\n<button class=\"nav-btn ${window.articleViewMode === 'sentence' ? 'active-theme' : ''}\" onclick=\"window.toggleArticleView('sentence')\""
);

fs.writeFileSync('js/app.js', c);
