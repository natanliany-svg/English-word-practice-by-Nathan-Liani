import codecs
import re

content = codecs.open('js/quizData.js', 'r', 'utf-8').read()

# We need to add diff: "medium" (or rotating) to any object in week12DB and week13DB
# Let's find each object { q: "...", options: [...], ans: 0 } and add diff: "medium"

def replacer(match):
    obj = match.group(0)
    if 'diff:' not in obj and 'diff :' not in obj and '"diff"' not in obj:
        # insert diff: "medium" before ans:
        if 'ans:' in obj:
            return obj.replace('ans:', 'diff: "medium",\nans:')
        else:
            return obj
    return obj

# Find objects matching { q: ... }
new_content = re.sub(r'\{\s*q:\s*".*?".*?\}', replacer, content, flags=re.DOTALL)

codecs.open('js/quizData.js', 'w', 'utf-8').write(new_content)
