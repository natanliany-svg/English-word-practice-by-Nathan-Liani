const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

c = c.replace(
    /onclick="window\.setWeek\('article'\); window\.toggleMenu\(false\);"/g,
    onclick="window.setWeek('week8'); window.toggleMenu(false);"
);

c = c.replace(
    /onclick="window\.setWeek\('week9'\); window\.toggleMenu\(false\);"/g,
    onclick="window.goToWord('w9d1', 0); window.toggleMenu(false);"
);

c = c.replace(
    /onclick="window\.setWeek\('week10'\); window\.toggleMenu\(false\);"/g,
    onclick="window.goToWord('w10d1', 0); window.toggleMenu(false);"
);

c = c.replace(
    /const CACHE_VERSION = 'v76';/g,
    const CACHE_VERSION = 'v77';
);

fs.writeFileSync('index.html', c);
