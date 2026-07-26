import codecs
import json
import re

quiz = [
    {"q": "What does CPR stand for?|מה הפירוש של CPR?", "options": ["Cardiopulmonary resuscitation|החייאה לבבית-ריאתית", "Central pulse restoration|שחזור דופק מרכזי", "Cardio pressure relief|הקלה בלחץ לבבי", "Critical patient rescue|חילוץ חולה קריטי"], "ans": 0},
    {"q": "What is the main goal of CPR?|מהי המטרה העיקרית של החייאה?", "options": ["To maintain blood circulation and deliver oxygen|לשמור על זרימת דם ולספק חמצן", "To wake the person up|להעיר את האדם", "To clear the airway|לפנות את נתיב האוויר", "To treat a fever|לטפל בחום"], "ans": 0},
    {"q": "Which organs are especially vital to receive oxygen during cardiac arrest?|אילו איברים חיוניים במיוחד לקבלת חמצן במהלך דום לב?", "options": ["Brain and heart|מוח ולב", "Lungs and stomach|ריאות וקיבה", "Liver and kidneys|כבד וכליות", "Skin and bones|עור ועצמות"], "ans": 0},
    {"q": "What are the two essential actions of modern CPR?|מהן שתי הפעולות החיוניות של החייאה מודרנית?", "options": ["Chest compressions and rescue breaths|לחיצות חזה והנשמות", "Abdominal thrusts and back blows|לחיצות בטן וטפיחות גב", "Checking pulse and calling 911|בדיקת דופק וקריאה ל-911", "Giving water and elevating legs|מתן מים והרמת רגליים"], "ans": 0},
    {"q": "Before starting CPR, what is the first thing a rescuer should do?|לפני תחילת ההחייאה, מהו הדבר הראשון שעל המציל לעשות?", "options": ["Ensure the scene is safe|לוודא שהזירה בטוחה", "Give rescue breaths|לתת הנשמות", "Check the pulse|לבדוק דופק", "Call the person's family|להתקשר למשפחת האדם"], "ans": 0},
    {"q": "How can you check if an adult responds?|כיצד ניתן לבדוק אם מבוגר מגיב?", "options": ["Speaking loudly and tapping shoulders|דיבור בקול רם וטפיחה על הכתפיים", "Slapping their face|סטירה על פניהם", "Pouring water on them|שפיכת מים עליהם", "Checking their pockets|בדיקת כיסיהם"], "ans": 0},
    {"q": "Where should hands be placed for adult chest compressions?|היכן יש להניח את הידיים עבור לחיצות חזה במבוגרים?", "options": ["In the center of the chest|במרכז החזה", "On the stomach|על הבטן", "On the neck|על הצוואר", "On the left side of the chest|בצד השמאלי של החזה"], "ans": 0},
    {"q": "What is the recommended rate for chest compressions?|מהו הקצב המומלץ ללחיצות חזה?", "options": ["100-120 per minute|100-120 בדקה", "60-80 per minute|60-80 בדקה", "150-180 per minute|150-180 בדקה", "30-50 per minute|30-50 בדקה"], "ans": 0},
    {"q": "What is the recommended compression depth for adults?|מהו עומק הלחיצה המומלץ למבוגרים?", "options": ["5-6 centimeters|5-6 סנטימטרים", "1-2 centimeters|1-2 סנטימטרים", "8-10 centimeters|8-10 סנטימטרים", "10-12 centimeters|10-12 סנטימטרים"], "ans": 0},
    {"q": "What is the ratio of compressions to rescue breaths for adults?|מהו היחס בין לחיצות להנשמות אצל מבוגרים?", "options": ["30 compressions to 2 breaths|30 לחיצות ל-2 הנשמות", "15 compressions to 2 breaths|15 לחיצות ל-2 הנשמות", "50 compressions to 1 breath|50 לחיצות להנשמה 1", "10 compressions to 5 breaths|10 לחיצות ל-5 הנשמות"], "ans": 0},
    {"q": "Why is CPR slightly different for children?|מדוע החייאה שונה מעט עבור ילדים?", "options": ["Their cardiac arrests are usually related to breathing problems|דום הלב שלהם קשור לרוב לבעיות נשימה", "They have stronger hearts|יש להם לבבות חזקים יותר", "They require deeper compressions|הם דורשים לחיצות עמוקות יותר", "They do not need rescue breaths|הם אינם זקוקים להנשמות"], "ans": 0},
    {"q": "What is the recommended compression depth for children?|מהו עומק הלחיצה המומלץ לילדים?", "options": ["About one-third of the chest's depth|כשליש מעומק החזה", "5-6 centimeters|5-6 סנטימטרים", "1 centimeter|סנטימטר 1", "Half of the chest's depth|חצי מעומק החזה"], "ans": 0},
    {"q": "What is the universal choking sign?|מהו סימן החנק האוניברסלי?", "options": ["Holding the throat with both hands|החזקת הגרון בשתי ידיים", "Waving arms in the air|נפנוף זרועות באוויר", "Pointing to the stomach|הצבעה על הבטן", "Screaming loudly|צרחות חזקות"], "ans": 0},
    {"q": "If a choking person can cough forcefully, what should you do?|אם אדם נחנק יכול להשתעל בחוזקה, מה עליך לעשות?", "options": ["Encourage them to continue coughing|לעודד אותם להמשיך להשתעל", "Perform abdominal thrusts immediately|לבצע לחיצות בטן מיד", "Give them water to drink|לתת להם לשתות מים", "Slap them on the back|לטפוח להם על הגב"], "ans": 0},
    {"q": "What is the recommended choking treatment for adults and children over one year?|מהו הטיפול המומלץ בחנק למבוגרים ולילדים מעל גיל שנה?", "options": ["Back blows followed by abdominal thrusts|טפיחות גב ולאחריהן לחיצות בטן", "Chest compressions only|לחיצות חזה בלבד", "Rescue breaths only|הנשמות בלבד", "Elevating the legs|הרמת הרגליים"], "ans": 0},
    {"q": "Why must abdominal thrusts not be used on infants under one year?|מדוע אין להשתמש בלחיצות בטן על תינוקות מתחת לגיל שנה?", "options": ["They may cause serious injury|הן עלולות לגרום לפציעה חמורה", "They are ineffective|הן אינן יעילות", "Infants don't choke|תינוקות לא נחנקים", "They cause crying|הן גורמות לבכי"], "ans": 0},
    {"q": "What is the alternative choking treatment for infants?|מהו הטיפול החלופי בחנק עבור תינוקות?", "options": ["Alternating back blows and chest thrusts|החלפה בין טפיחות גב ולחיצות חזה", "Hanging them upside down|תלייתם הפוך", "Pinching their nose|צביטת האף שלהם", "Giving them milk|מתן חלב"], "ans": 0},
    {"q": "What should you do if a choking victim becomes unconscious?|מה עליך לעשות אם קורבן חנק מאבד את הכרתו?", "options": ["Contact emergency services and start CPR without delay|ליצור קשר עם שירותי חירום ולהתחיל החייאה ללא דיחוי", "Wait for them to wake up|לחכות שיתעוררו", "Perform abdominal thrusts|לבצע לחיצות בטן", "Give them water|לתת להם מים"], "ans": 0},
    {"q": "Why should you never perform a blind finger sweep?|מדוע לעולם אין לבצע גריפת אצבע עיוורת?", "options": ["It may push the object deeper into the airway|זה עלול לדחוף את החפץ עמוק יותר לנתיב האוויר", "It can bite your finger|זה יכול לנשוך את האצבע שלך", "It causes vomiting|זה גורם להקאות", "It is illegal|זה לא חוקי"], "ans": 0},
    {"q": "What allows participants to practice CPR techniques realistically?|מה מאפשר למשתתפים לתרגל טכניקות החייאה בצורה מציאותית?", "options": ["Training mannequins|בובות אימון", "Watching videos|צפייה בסרטונים", "Reading books|קריאת ספרים", "Listening to lectures|הקשבה להרצאות"], "ans": 0}
]

quiz_js = codecs.open('js/quizData.js', 'r', 'utf-8').read()
# Remove old week16DB
quiz_js = re.sub(r'window\.week16DB = \[.*?\];', '', quiz_js, flags=re.DOTALL)

quiz_str = "window.week16DB = [\n" + ",\n".join([f"    {{ q: \"{q['q']}\", options: {json.dumps(q['options'], ensure_ascii=False)}, ans: {q['ans']} }}" for q in quiz]) + "\n];\n"
codecs.open('js/quizData.js', 'w', 'utf-8').write(quiz_js.strip() + "\n\n" + quiz_str)

# Also fix data.js vocab format (en -> eng, he -> heb)
data_js = codecs.open('js/data.js', 'r', 'utf-8').read()
# Replace { en: "...", he: "..." } inside week16vocab array only
import re
def fix_vocab(match):
    s = match.group(0)
    s = s.replace('en:', 'eng:').replace('he:', 'heb:')
    return s
data_js = re.sub(r"window\.vocabularyData\['week16vocab'\] = \[\n.*?\];", fix_vocab, data_js, flags=re.DOTALL)
codecs.open('js/data.js', 'w', 'utf-8').write(data_js)

print("Data fixed!")
