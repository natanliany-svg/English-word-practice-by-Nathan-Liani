import re
with open("index.html", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("const CACHE_VERSION = 'v76';", "const CACHE_VERSION = 'v77';")
c = c.replace('onclick="window.setWeek(\'article\');"', 'onclick="window.setWeek(\'week8\');"')
c = c.replace('onclick="window.setWeek(\'week9\');"', 'onclick="window.goToWord(\'w9d1\', 0);"')
c = c.replace('onclick="window.setWeek(\'week10\');"', 'onclick="window.goToWord(\'w10d1\', 0);"')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(c)
