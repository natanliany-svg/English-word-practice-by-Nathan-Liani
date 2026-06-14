import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    data = f.read()

new_days = """  { id: 'w9d4', week: 'week9vocab', title: 'יום 4', date: 'Week 9' },
  { id: 'w10d1', week: 'week10vocab', title: 'יום 1', date: 'Week 10' },
  { id: 'w10d2', week: 'week10vocab', title: 'יום 2', date: 'Week 10' },
  { id: 'w10d3', week: 'week10vocab', title: 'יום 3', date: 'Week 10' },
  { id: 'w10d4', week: 'week10vocab', title: 'יום 4', date: 'Week 10' }
];"""

data = data.replace("  { id: 'w9d4', week: 'week9vocab', title: 'יום 4', date: 'Week 9' }\n];", new_days)

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("Fixed data.js")
