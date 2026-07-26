import codecs
import re

# CPR Article Content
article_eng = [
    "CPR in Adults and Children and Treatment of Choking",
    "Every year, thousands of lives are saved because ordinary people know how to perform cardiopulmonary resuscitation (CPR) and how to help someone who is choking.",
    "Cardiac arrest can happen suddenly to adults or children, and without immediate action, the brain begins to suffer permanent damage within only a few minutes.",
    "Learning the basic principles of CPR and choking treatment allows bystanders to provide lifesaving assistance until professional medical personnel arrive.",
    "What Is CPR?",
    "Cardiopulmonary resuscitation, commonly known as CPR, is an emergency procedure used when a person's heart has stopped beating effectively or when they are no longer breathing normally.",
    "The goal of CPR is to maintain blood circulation and deliver oxygen to vital organs, especially the brain and heart, until advanced medical treatment becomes available.",
    "Modern CPR combines two essential actions: Chest compressions to keep blood circulating, and Rescue breaths, when appropriate, to provide oxygen.",
    "Studies have shown that immediate CPR can significantly increase a person's chance of survival after cardiac arrest.",
    "CPR for Adults",
    "Before beginning CPR, the rescuer should first ensure that the scene is safe.",
    "The next step is to check whether the person responds by speaking loudly and gently tapping the shoulders.",
    "If there is no response and the person is not breathing normally, emergency medical services should be called immediately.",
    "Chest compressions are performed by placing both hands in the center of the chest.",
    "The rescuer should push hard and fast at a rate of about 100-120 compressions per minute, allowing the chest to return to its normal position after each compression.",
    "The recommended compression depth for adults is approximately 5-6 centimeters.",
    "If the rescuer is trained and willing, rescue breaths may be given after every 30 chest compressions, using a ratio of 30 compressions followed by 2 breaths.",
    "CPR should continue until professional help arrives or the person begins to breathe normally.",
    "CPR for Children",
    "The basic principles of CPR are similar for children, but there are important differences because a child's body is smaller and the most common causes of cardiac arrest are often related to breathing problems rather than heart disease.",
    "Chest compressions should be performed at the same rate of 100-120 compressions per minute, but the compression depth should be about one-third of the chest's depth.",
    "For most children, one or two hands may be used depending on the child's size and the rescuer's strength.",
    "Because breathing problems are more common in children, rescue breaths are especially important when the rescuer has received CPR training.",
    "Choking Caused by a Foreign Object",
    "Choking occurs when food or another object blocks the airway, preventing air from reaching the lungs.",
    "A person who is choking may suddenly be unable to speak, cough, or breathe.",
    "They may hold their throat with both hands, a well-known sign called the universal choking sign.",
    "If the person can cough forcefully, they should be encouraged to continue coughing, as this is often the best way to remove the obstruction.",
    "If the airway becomes completely blocked and the person cannot breathe or speak, immediate action is required.",
    "For adults and children over one year of age, the recommended treatment is a series of firm back blows followed, if necessary, by abdominal thrusts.",
    "These actions help create pressure inside the airway that may force the object out.",
    "For infants under one year of age, abdominal thrusts must not be used because they may cause serious injury.",
    "Instead, rescuers alternate between back blows and chest thrusts until the object is removed or the infant becomes unresponsive.",
    "When Choking Leads to Unconsciousness",
    "If a choking victim becomes unconscious, emergency medical services should be contacted immediately.",
    "CPR should then be started without delay.",
    "During CPR, the rescuer should look for any visible object in the mouth before giving rescue breaths, but should never perform a blind finger sweep because this may push the object deeper into the airway.",
    "The Importance of Training",
    "Although reading about CPR and choking treatment provides useful knowledge, practical training is essential.",
    "CPR courses allow participants to practice chest compressions, rescue breaths, and choking techniques using realistic training mannequins.",
    "Medical organizations around the world recommend regular refresher training because guidelines may change as new scientific evidence becomes available.",
    "Knowing how to recognize cardiac arrest, perform CPR, and respond to choking can make the difference between life and death.",
    "Even simple actions taken by a bystander during the first few minutes of an emergency can greatly improve the chances of survival until professional medical help arrives."
]

article_heb = [
    "החייאה במבוגרים ובילדים וטיפול בחנק",
    "מדי שנה, אלפי חיים ניצלים כי אנשים רגילים יודעים כיצד לבצע החייאה לבבית-ריאתית (CPR) וכיצד לעזור למישהו שנחנק.",
    "דום לב יכול לקרות לפתע למבוגרים או לילדים, וללא פעולה מיידית, המוח מתחיל לסבול מנזק תמידי תוך דקות ספורות.",
    "למידת העקרונות הבסיסיים של החייאה וטיפול בחנק מאפשרת לעוברי אורח לספק סיוע מציל חיים עד להגעת צוות רפואי מקצועי.",
    "מהי החייאה?",
    "החייאה לבבית-ריאתית, הידועה בכינוי CPR, היא הליך חירום המשמש כאשר ליבו של אדם הפסיק לפעום ביעילות או כאשר אינו נושם כרגיל.",
    "מטרת ההחייאה היא לשמור על מחזור הדם ולספק חמצן לאיברים חיוניים, במיוחד למוח וללב, עד שטיפול רפואי מתקדם יהיה זמין.",
    "החייאה מודרנית משלבת שתי פעולות חיוניות: לחיצות חזה כדי לשמור על זרימת הדם, והנשמות, כאשר מתאים, כדי לספק חמצן.",
    "מחקרים הראו שהחייאה מיידית יכולה להגדיל משמעותית את סיכויי ההישרדות של אדם לאחר דום לב.",
    "החייאה למבוגרים",
    "לפני תחילת ההחייאה, על המציל לוודא תחילה שהזירה בטוחה.",
    "השלב הבא הוא לבדוק האם האדם מגיב על ידי דיבור בקול רם וטפיחה קלה על הכתפיים.",
    "אם אין תגובה והאדם אינו נושם כרגיל, יש להזעיק מיד את שירותי רפואת החירום.",
    "לחיצות חזה מתבצעות על ידי הנחת שתי הידיים במרכז החזה.",
    "על המציל לדחוף חזק ומהר בקצב של כ-100 עד 120 לחיצות בדקה, ולתת לחזה לחזור למצבו הרגיל לאחר כל לחיצה.",
    "עומק הלחיצה המומלץ למבוגרים הוא כ-5 עד 6 סנטימטרים.",
    "אם המציל מיומן ומוכן לכך, ניתן לתת הנשמות לאחר כל 30 לחיצות חזה, תוך שימוש ביחס של 30 לחיצות ואחריהן 2 הנשמות.",
    "יש להמשיך בהחייאה עד שהעזרה המקצועית מגיעה או עד שהאדם מתחיל לנשום כרגיל.",
    "החייאה לילדים",
    "העקרונות הבסיסיים של החייאה דומים אצל ילדים, אך ישנם הבדלים חשובים מכיוון שגופו של ילד קטן יותר והגורמים הנפוצים ביותר לדום לב קשורים לעיתים קרובות לבעיות נשימה ולא למחלות לב.",
    "יש לבצע לחיצות חזה באותו קצב של 100-120 לחיצות בדקה, אך עומק הלחיצה צריך להיות כשליש מעומק החזה.",
    "עבור רוב הילדים, ניתן להשתמש ביד אחת או שתיים בהתאם לגודל הילד ולחוזקו של המציל.",
    "מכיוון שבעיות נשימה שכיחות יותר אצל ילדים, הנשמות חשובות במיוחד כאשר המציל עבר הכשרת החייאה.",
    "חנק כתוצאה מעצם זר",
    "חנק מתרחש כאשר אוכל או חפץ אחר חוסם את נתיב האוויר, ומונע מאוויר להגיע לריאות.",
    "אדם שנחנק עשוי לפתע לא להיות מסוגל לדבר, להשתעל או לנשום.",
    "הם עשויים להחזיק את גרונם בשתי ידיהם, סימן מוכר הנקרא סימן החנק האוניברסלי.",
    "אם האדם מסוגל להשתעל בחוזקה, יש לעודד אותו להמשיך להשתעל, שכן זו לרוב הדרך הטובה ביותר להסיר את החסימה.",
    "אם נתיב האוויר נחסם לחלוטין והאדם אינו יכול לנשום או לדבר, נדרשת פעולה מיידית.",
    "למבוגרים ולילדים מעל גיל שנה, הטיפול המומלץ הוא סדרה של טפיחות חזקות על הגב ואחריהן, במידת הצורך, לחיצות בטן.",
    "פעולות אלו עוזרות ליצור לחץ בתוך נתיב האוויר שעשוי לדחוף את החפץ החוצה.",
    "עבור תינוקות מתחת לגיל שנה, אסור להשתמש בלחיצות בטן מכיוון שהן עלולות לגרום לפציעה חמורה.",
    "במקום זאת, מצילים מחליפים בין טפיחות גב ולחיצות חזה עד שהחפץ מוסר או עד שהתינוק מאבד את הכרתו.",
    "כאשר חנק מוביל לחוסר הכרה",
    "אם קורבן חנק מאבד את הכרתו, יש ליצור קשר עם שירותי רפואת החירום באופן מיידי.",
    "לאחר מכן יש להתחיל בהחייאה ללא דיחוי.",
    "במהלך ההחייאה, על המציל לחפש כל חפץ גלוי בפה לפני מתן הנשמות, אך לעולם אין לבצע גריפת אצבע עיוורת מכיוון שזה עלול לדחוף את החפץ עמוק יותר אל תוך נתיב האוויר.",
    "החשיבות של הכשרה",
    "למרות שקריאה על החייאה וטיפול בחנק מספקת ידע שימושי, הכשרה מעשית היא חיונית.",
    "קורסי החייאה מאפשרים למשתתפים לתרגל לחיצות חזה, הנשמות וטכניקות חנק באמצעות בובות אימון מציאותיות.",
    "ארגוני רפואה ברחבי העולם ממליצים על רענון הכשרה קבוע מכיוון שההנחיות עשויות להשתנות ככל שראיות מדעיות חדשות זמינות.",
    "לדעת כיצד לזהות דום לב, לבצע החייאה ולהגיב לחנק יכולה לעשות את ההבדל בין חיים למוות.",
    "אפילו פעולות פשוטות שננקטות על ידי עובר אורח במהלך הדקות הראשונות של מקרה חירום יכולות לשפר מאוד את סיכויי ההישרדות עד שהעזרה הרפואית המקצועית תגיע."
]

is_header = [True, False, False, False, True, False, False, False, False, True, False, False, False, False, False, False, False, False, True, False, False, False, False, True, False, False, False, False, False, False, False, False, False, True, False, False, False, True, False, False, False, False, False]
# Group into paragraphs properly
new_paragraphs = []
current_para = []
for idx, is_h in enumerate(is_header):
    if is_h:
        if current_para:
            new_paragraphs.append(current_para)
            current_para = []
        new_paragraphs.append([idx])
    else:
        current_para.append(idx)
        if len(current_para) >= 4 and idx + 1 < len(is_header) and not is_header[idx + 1]:
            new_paragraphs.append(current_para)
            current_para = []
if current_para:
    new_paragraphs.append(current_para)

# Write to data.js
data_js = codecs.open('js/data.js', 'r', 'utf-8').read()

# Build article data with j index
article_js_lines = []
sentence_count = 1
for e, h, c in zip(article_eng, article_heb, is_header):
    if c:
        j_val = "??"
    else:
        j_val = str(sentence_count)
        sentence_count += 1
    article_js_lines.append(f"    {{ e: \"{e}\", h: \"{h}\", isHeader: {'true' if c else 'false'}, j: \"{j_val}\" }}")

article_obj = "window.week16ArticleData = [\n" + ",\n".join(article_js_lines) + "\n];\n"
summary_obj = f"window.week16ArticleSummary = {{ e: \"{summary_eng}\", h: \"{summary_heb}\" }};\n"
vocab_obj = "window.vocabularyData['week16vocab'] = [\n" + ",\n".join([f"    {{ en: \"{v['en']}\", he: \"{v['he']}\", ph: \"{v['ph']}\" }}" for v in vocab]) + "\n];\n"

# Add paragraphs
para_str = f"    'week16': {new_paragraphs},"
para_match = re.search(r"window\.articleParagraphs = \{", data_js)
if para_match:
    data_js = data_js[:para_match.end()] + "\n" + para_str + data_js[para_match.end():]

# Inject right before window.daysList = [
inject_data = article_obj + "\n" + summary_obj + "\n" + vocab_obj + "\n\nwindow.daysList = ["
data_js = data_js.replace("window.daysList = [", inject_data)

# Also add days for week 16
week16_days = ",\n    { id: 'w16d1', week: 'week16vocab', desc: 'CPR Basics' },\n    { id: 'w16d2', week: 'week16vocab', desc: 'Heart and Oxygen' },\n    { id: 'w16d3', week: 'week16vocab', desc: 'Adults CPR' },\n    { id: 'w16d4', week: 'week16vocab', desc: 'Children CPR' },\n    { id: 'w16d5', week: 'week16vocab', desc: 'Choking Treatment' }"
data_js = data_js.replace("desc: 'Musical Frequencies' }", "desc: 'Musical Frequencies' }" + week16_days)
codecs.open('js/data.js', 'w', 'utf-8').write(data_js)

