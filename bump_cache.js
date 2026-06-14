const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace("const CACHE_VERSION = 'v75';", "const CACHE_VERSION = 'v76';");
fs.writeFileSync('index.html', content);
