import json
import random
import os

words = [
    # Day 1
    {
        "word": "Compilation",
        "translation": "קימפול (הידור)",
        "wrong_easy": ["ביצוע", "פירוש", "קוד מקור"],
        "med_q": "Which word best completes: The process of ___ translates the entire program before execution.",
        "med_wrong": ["זמן ריצה", "אינטראקטיביות", "פירוש"],
        "hard_q": "In the context of programming, what does Compilation mean?",
        "hard_ans": "תהליך בו כל קוד המקור מתורגם לקוד מכונה לפני ההרצה",
        "hard_wrong": ["המרת הקוד שורה אחר שורה במהלך ההרצה", "תהליך כתיבת הקוד על ידי המתכנת", "בדיקת שגיאות כתיב בקוד בלבד"]
    },
    {
        "word": "Interpretation",
        "translation": "פירוש (אינטרפרטציה)",
        "wrong_easy": ["קימפול (הידור)", "קל משקל", "קובץ הפעלה"],
        "med_q": "Which word best completes: JavaScript usually relies on ___ to run directly in the browser.",
        "med_wrong": ["קימפול (הידור)", "קובץ הפעלה", "קוד מקור"],
        "hard_q": "What is the primary characteristic of Interpretation compared to Compilation?",
        "hard_ans": "קוד מתורגם ומבוצע שורה אחר שורה בזמן אמת",
        "hard_wrong": ["הוא יוצר קובץ הפעלה עצמאי", "הוא דורש שלב ביניים של יצירת קוד מכונה", "הוא תמיד רץ מהר יותר מקימפול"]
    },
    {
        "word": "Source Code",
        "translation": "קוד מקור",
        "wrong_easy": ["זמן ריצה", "קוד בתים", "מנוע"],
        "med_q": "Which word best completes: Programmers write ___ in languages like C# or JavaScript.",
        "med_wrong": ["קובץ הפעלה", "קוד בתים", "מנוע"],
        "hard_q": "Why must Source Code be translated before execution?",
        "hard_ans": "מכיוון שהמחשב מבין רק שפת מכונה (0 ו-1)",
        "hard_wrong": ["כדי למנוע מאחרים להעתיק את התוכנה", "מכיוון שהקוד אינו תופס מקום בזיכרון", "כדי שהדפדפן יוכל לצייר את ממשק המשתמש"]
    },
    {
        "word": "Execution",
        "translation": "ביצוע (הרצה)",
        "wrong_easy": ["בדיקת טיפוסים", "מפרש", "חוסר התאמה"],
        "med_q": "Which word best completes: The final step after compiling the program is its ___.",
        "med_wrong": ["בדיקת טיפוסים", "חוסר התאמה", "קימפול (הידור)"],
        "hard_q": "In the context of a software lifecycle, what happens during Execution?",
        "hard_ans": "המעבד מבצע את ההוראות שבקוד המכונה או קובץ ההפעלה",
        "hard_wrong": ["המתכנת כותב את הקוד בטקסט חופשי", "התוכנה נשלחת למשתמשים בפעם הראשונה", "המערכת מנתחת את התחביר של התוכנה ללא הפעלתה"]
    },
    {
        "word": "Compiler",
        "translation": "מהדר (קומפיילר)",
        "wrong_easy": ["מפרש", "דפדפן", "תסריט"],
        "med_q": "Which word best completes: C# uses a ___ to convert source code into an intermediate language.",
        "med_wrong": ["מפרש", "דפדפן", "תסריט"],
        "hard_q": "What is the main role of a Compiler?",
        "hard_ans": "לתרגם את כל קוד המקור לקוד מכונה או לשפת ביניים לפני הריצה",
        "hard_wrong": ["להריץ את התוכנית שורה אחר שורה", "לבדוק האם העיצוב החזותי של התוכנה תקין", "לשמור את הקוד על ענן לגיבוי"]
    },
    {
        "word": "Interpreter",
        "translation": "מפרש (אינטרפרטר)",
        "wrong_easy": ["מהדר (קומפיילר)", "קובץ הפעלה", "מודול"],
        "med_q": "Which word best completes: A Python ___ executes the code line-by-line.",
        "med_wrong": ["מהדר (קומפיילר)", "קובץ הפעלה", "מודול"],
        "hard_q": "How does an Interpreter handle source code?",
        "hard_ans": "הוא קורא, מנתח ומבצע כל הוראה באופן מיידי וללא יצירת קובץ נפרד",
        "hard_wrong": ["הוא ממיר את כל הקוד לקובץ שניתן להעביר למחשב אחר", "הוא מתעלם משגיאות עד שהתוכנית מסיימת לרוץ", "הוא מבצע אופטימיזציה לכל הקוד לפני תחילת ההרצה"]
    },
    {
        "word": "Translate",
        "translation": "לתרגם",
        "wrong_easy": ["לפענח", "להטמיע", "לאמת"],
        "med_q": "Which word best completes: Compilers and interpreters both ___ code so the computer can understand it.",
        "med_wrong": ["להטמיע", "לפענח", "לתפוס"],
        "hard_q": "In computer science, what does it mean to Translate code?",
        "hard_ans": "להמיר קוד משפה עילית (קריאה לאדם) לשפה שהמכונה יכולה לבצע",
        "hard_wrong": ["לשנות את השפה של ממשק המשתמש (למשל מאנגלית לעברית)", "להעתיק את הקוד משרת אחד לשרת אחר", "לשנות את צורת האותיות (רישיות לקטנות) בקוד"]
    },
    {
        "word": "Lightweight",
        "translation": "קל משקל",
        "wrong_easy": ["קפדני", "היברידי", "לא חוקי"],
        "med_q": "Which word best completes: JavaScript was originally designed as a ___ scripting language for web pages.",
        "med_wrong": ["קפדני", "לא חוקי", "מתוחכם"],
        "hard_q": "What does it mean when a programming language or software is described as Lightweight?",
        "hard_ans": "היא דורשת מעט משאבי מערכת (זיכרון וכוח עיבוד) כדי לפעול",
        "hard_wrong": ["היא קלה ללמידה אך לא יכולה לבצע פעולות מורכבות", "היא דורשת חיבור אינטרנט מהיר במיוחד", "היא אינה מכילה פונקציות מתמטיות מתקדמות"]
    },
    {
        "word": "Interactivity",
        "translation": "אינטראקטיביות",
        "wrong_easy": ["אמינות", "גמישות", "יוזמה"],
        "med_q": "Which word best completes: JavaScript brought ___ to static web pages.",
        "med_wrong": ["אמינות", "יוזמה", "הפניה"],
        "hard_q": "How does Interactivity manifest in modern web applications?",
        "hard_ans": "היכולת של המשתמש להפעיל פעולות באתר ולקבל תגובה מיידית ללא רענון הדף",
        "hard_wrong": ["המהירות בה השרת מעבד בקשות מרובות", "הדרך שבה דפי אינטרנט מתורגמים לשפות שונות באופן אוטומטי", "אבטחת הנתונים העוברים בין הדפדפן לשרת"]
    },
    {
        "word": "Executable",
        "translation": "קובץ הפעלה (ניתן להרצה)",
        "wrong_easy": ["קוד מקור", "תשתית", "שלב"],
        "med_q": "Which word best completes: A C++ compiler outputs an ___ file.",
        "med_wrong": ["תסריט", "תשתית", "קוד מקור"],
        "hard_q": "What is the defining feature of an Executable file?",
        "hard_ans": "הוא מכיל קוד מכונה המוכן לריצה ישירה על ידי מערכת ההפעלה",
        "hard_wrong": ["הוא טקסט הניתן לקריאה ועריכה על ידי מתכנתים בקלות", "הוא משמש רק כדי לשמור תמונות וקבצי קול לתוכנה", "הוא פועל רק בדפדפן וזקוק לחיבור אינטרנט קבוע"]
    },
    # Day 2
    {
        "word": "Runtime",
        "translation": "זמן ריצה",
        "wrong_easy": ["ביצועים", "גילוי שגיאות", "אופטימיזציה"],
        "med_q": "Which word best completes: In JavaScript, many errors are only caught at ___.",
        "med_wrong": ["קימפול (הידור)", "בדיקת טיפוסים", "שלב"],
        "hard_q": "What exactly happens during the Runtime of an application?",
        "hard_ans": "התוכנית מופעלת וההוראות שלה מבוצעות בפועל על ידי המערכת",
        "hard_wrong": ["קוד המקור נכתב ונבדק על ידי המתכנת", "הקוד עובר תהליך של אופטימיזציה לפני הפעלתו", "הקוד נשמר בשרת מרוחק כגיבוי"]
    },
    {
        "word": "Performance",
        "translation": "ביצועים",
        "wrong_easy": ["אמינות", "גמישות", "אינטראקטיביות"],
        "med_q": "Which word best completes: Compiled languages are usually known for their high ___.",
        "med_wrong": ["גמישות", "אינטראקטיביות", "אמינות"],
        "hard_q": "How is Performance typically measured in the context of compiled applications?",
        "hard_ans": "לפי המהירות בה התוכנית רצה ויעילות ניצול משאבי המערכת",
        "hard_wrong": ["לפי כמות השורות בקוד המקור של התוכנית", "לפי מספר המפתחים שעבדו על יצירת הקוד", "לפי מספר שפות התכנות שבהן נעשה שימוש"]
    },
    {
        "word": "Optimization",
        "translation": "אופטימיזציה (מיטוב)",
        "wrong_easy": ["בדיקת טיפוסים", "גילוי שגיאות", "חוסר התאמה"],
        "med_q": "Which word best completes: The compiler performs ___ to make the code run faster.",
        "med_wrong": ["חוסר התאמה", "בדיקת טיפוסים", "מנוע"],
        "hard_q": "What is the goal of code Optimization?",
        "hard_ans": "לשפר את יעילות התוכנית, למשל להפוך אותה למהירה יותר או לחסוך בזיכרון",
        "hard_wrong": ["להפוך את הקוד לקריא יותר עבור מתכנתים אחרים", "להוסיף פיצ'רים חדשים לתוכנה קיימת", "לתקן שגיאות כתיב בשמות משתנים"]
    },
    {
        "word": "Error Detection",
        "translation": "גילוי שגיאות",
        "wrong_easy": ["ביצועים", "קימפול (הידור)", "דפדפן"],
        "med_q": "Which word best completes: C# provides early ___ during the compilation phase.",
        "med_wrong": ["ביצועים", "תסריט", "דפדפן"],
        "hard_q": "Why is early Error Detection advantageous in software development?",
        "hard_ans": "זה מאפשר למתכנת לתקן בעיות לפני שהתוכנה מגיעה למשתמש הקצה",
        "hard_wrong": ["זה גורם לתוכנה לעבוד לאט יותר", "זה מאפשר למנוע חיפוש למצוא את האתר מהר יותר", "זה חוסך מקום בכונן הקשיח"]
    },
    {
        "word": "Type Checking",
        "translation": "בדיקת טיפוסים",
        "wrong_easy": ["אופטימיזציה (מיטוב)", "גילוי שגיאות", "פירוש (אינטרפרטציה)"],
        "med_q": "Which word best completes: Strict ___ in C# helps prevent variables from storing the wrong kind of data.",
        "med_wrong": ["גילוי שגיאות", "אופטימיזציה (מיטוב)", "ביצועים"],
        "hard_q": "What is the difference between static and dynamic Type Checking?",
        "hard_ans": "בדיקה סטטית מתבצעת בזמן קימפול, בעוד בדיקה דינמית מתבצעת בזמן ריצה",
        "hard_wrong": ["סטטית עובדת רק במספרים, דינמית עובדת רק בטקסט", "סטטית מחייבת שימוש בענן, דינמית עובדת ללא אינטרנט", "אין ביניהן הבדל, שתיהן אותו תהליך בדיוק"]
    },
    {
        "word": "Intermediate",
        "translation": "ביניים",
        "wrong_easy": ["מתוחכם", "לא חוקי (פסול)", "טבעי (מקומי/קוד מכונה)"],
        "med_q": "Which word best completes: C# is compiled into an ___ language before being executed by the .NET runtime.",
        "med_wrong": ["מתוחכם", "לא חוקי (פסול)", "טבעי (מקומי/קוד מכונה)"],
        "hard_q": "What is the purpose of an Intermediate language in C#?",
        "hard_ans": "היא מאפשרת לקוד לרוץ על כל פלטפורמה שיש לה סביבת ריצה מתאימה",
        "hard_wrong": ["היא גורמת לקוד להיות מאובטח לחלוטין מפריצות", "היא מאפשרת לקוד לרוץ ללא שימוש במעבד", "היא נועדה אך ורק להקטין את גודל הקובץ"]
    },
    {
        "word": "Sophisticated",
        "translation": "מתוחכם",
        "wrong_easy": ["קל משקל", "ביניים", "קפדני (מחמיר)"],
        "med_q": "Which word best completes: Modern JavaScript engines use ___ techniques like Just-In-Time compilation.",
        "med_wrong": ["קל משקל", "ביניים", "קפדני (מחמיר)"],
        "hard_q": "What makes modern JavaScript engines highly Sophisticated?",
        "hard_ans": "הם משלבים פירוש וקימפול תוך כדי ריצה כדי להשיג ביצועים טובים יותר",
        "hard_wrong": ["הם פועלים ללא צורך בזיכרון המחשב", "הם מאפשרים כתיבת קוד בשפות מדוברות כמו אנגלית", "הם יכולים לזהות רגשות דרך המצלמה"]
    },
    {
        "word": "Reliability",
        "translation": "אמינות",
        "wrong_easy": ["גמישות", "אינטראקטיביות", "יוזמה"],
        "med_q": "Which word best completes: The strict rules of C# increase the software's ___.",
        "med_wrong": ["גמישות", "אינטראקטיביות", "יוזמה"],
        "hard_q": "How does static typing in languages like C# contribute to software Reliability?",
        "hard_ans": "היא מקטינה את הסיכוי לשגיאות לא צפויות בזמן הריצה של התוכנית",
        "hard_wrong": ["היא מאפשרת לתוכנה לרוץ על שרתים חלשים יותר", "היא מבטיחה שהמשתמשים יבינו את ממשק המשתמש", "היא גורמת לתוכנה להיראות טוב יותר חזותית"]
    },
    {
        "word": "Validate",
        "translation": "לאמת (לתקף)",
        "wrong_easy": ["לנתח (לפענח תחביר)", "לתפוס (שגיאה)", "לתרגם"],
        "med_q": "Which word best completes: The compiler will ___ the syntax before allowing the program to build.",
        "med_wrong": ["לתפוס (שגיאה)", "לנתח (לפענח תחביר)", "לתרגם"],
        "hard_q": "Why is it crucial to Validate user input in a web application?",
        "hard_ans": "כדי למנוע שגיאות מערכת, קריסות או פרצות אבטחה כתוצאה ממידע שגוי",
        "hard_wrong": ["כדי לשפר את הדירוג של האתר במנועי חיפוש", "כדי לאפשר לאתר לרוץ גם כשהאינטרנט מנותק", "כדי לחסוך בזמן כתיבת הקוד של המפתח"]
    },
    {
        "word": "Mismatch",
        "translation": "חוסר התאמה",
        "wrong_easy": ["גמישות", "הפניה (ייחוס)", "שלב (במה)"],
        "med_q": "Which word best completes: Trying to add a number to a word might cause a type ___ error.",
        "med_wrong": ["גמישות", "הפניה (ייחוס)", "שלב (במה)"],
        "hard_q": "What happens when there is a Mismatch between expected and provided data types in a strictly typed language?",
        "hard_ans": "הקומפיילר יציג שגיאה וימנע מהתוכנית לרוץ עד שהבעיה תתוקן",
        "hard_wrong": ["המערכת תתעלם מהבעיה ותמשיך כרגיל", "התוכנית תמחק באופן אוטומטי את הנתונים הבעייתיים", "מערכת ההפעלה תאתחל את עצמה"]
    },
    # Day 3
    {
        "word": "Validate",
        "translation": "לאמת (לתקף)",
        "wrong_easy": ["לדחות", "להטמיע", "לפרוס"],
        "med_q": "Which word best completes: We need a script to ___ the form fields before submission.",
        "med_wrong": ["לפרוס (להטמיע)", "להטמיע", "לנתח (לפענח תחביר)"],
        "hard_q": "In JavaScript, what does it mean to Validate data on the client side?",
        "hard_ans": "לבדוק את נכונות הנתונים שהוזנו בדפדפן לפני שליחתם לשרת",
        "hard_wrong": ["לשלוח בקשה לשרת כדי לקבל אישור סיסמה", "לאשר את זהות המשתמש מול רשויות החוק", "לוודא שהקוד כתוב נכון מבחינה תחבירית"]
    },
    {
        "word": "Mismatch",
        "translation": "חוסר התאמה",
        "wrong_easy": ["היברידי (משולב)", "הפניה (ייחוס)", "תשתית (מסגרת עבודה)"],
        "med_q": "Which word best completes: A ___ in version numbers caused the application to crash.",
        "med_wrong": ["היברידי (משולב)", "תשתית (מסגרת עבודה)", "הפניה (ייחוס)"],
        "hard_q": "How can a version Mismatch affect software execution?",
        "hard_ans": "זה יכול לגרום לשגיאות אם רכיב אחד מצפה לפונקציונליות שאינה קיימת ברכיב אחר",
        "hard_wrong": ["זה משפר את הביצועים של התוכנה", "זה תמיד יגרום למחיקת קבצים אוטומטית", "זה מאלץ את התוכנה להשתמש בשפות תכנות אחרות"]
    },
    {
        "word": "Reference",
        "translation": "הפניה (ייחוס)",
        "wrong_easy": ["לא חוקי (פסול)", "טבעי (מקומי/קוד מכונה)", "קובץ הפעלה (ניתן להרצה)"],
        "med_q": "Which word best completes: The variable holds a ___ to an object in memory, not the object itself.",
        "med_wrong": ["קפדני (מחמיר)", "קובץ הפעלה (ניתן להרצה)", "לא חוקי (פסול)"],
        "hard_q": "What is the difference between passing by value and passing by Reference?",
        "hard_ans": "בהפניה מועברת הכתובת בזיכרון של המשתנה, ובערך מועבר העתק שלו",
        "hard_wrong": ["בהפניה ערך המשתנה תמיד הופך לאפס", "העברה לפי ערך דורשת יותר אינטרנט", "העברה בהפניה אפשרית רק בדפדפן ולא בשרת"]
    },
    {
        "word": "Invalid",
        "translation": "לא חוקי (פסול)",
        "wrong_easy": ["אמינות", "קל משקל", "מתוחכם"],
        "med_q": "Which word best completes: Entering letters in a phone number field will return an ___ input error.",
        "med_wrong": ["טבעי (מקומי/קוד מכונה)", "אמינות", "קפדני (מחמיר)"],
        "hard_q": "In coding, what causes an Invalid syntax error?",
        "hard_ans": "כתיבת קוד שאינו תואם את חוקי השפה, כמו חוסר בסוגריים או פסיק",
        "hard_wrong": ["הזנת סיסמה שגויה באתר", "פתיחת דפדפן לא מתאים", "שימוש ביותר מדי זיכרון"]
    },
    {
        "word": "Intermediate",
        "translation": "ביניים",
        "wrong_easy": ["קוד מכונה", "קוד בתים", "היברידי (משולב)"],
        "med_q": "Which word best completes: C# code is compiled into an ___ format called IL.",
        "med_wrong": ["טבעי (מקומי/קוד מכונה)", "קוד מכונה", "היברידי (משולב)"],
        "hard_q": "Why use an Intermediate representation instead of direct machine code?",
        "hard_ans": "כדי לאפשר פלטפורמה אגנוסטית: קוד אחד שרץ על מערכות הפעלה שונות",
        "hard_wrong": ["כי זה תמיד מאיץ את זמן הקימפול פי עשרה", "כדי שהקוד יהיה גלוי למשתמשי הקצה", "מכיוון שהדבר מונע שגיאות כתיב"]
    },
    {
        "word": "Native",
        "translation": "טבעי (מקומי/קוד מכונה)",
        "wrong_easy": ["ביניים", "היברידי (משולב)", "לא חוקי (פסול)"],
        "med_q": "Which word best completes: A C++ program compiles directly to ___ code for the specific hardware.",
        "med_wrong": ["ביניים", "היברידי (משולב)", "לא חוקי (פסול)"],
        "hard_q": "What is an advantage of Native code over interpreted code?",
        "hard_ans": "הוא בדרך כלל פועל מהר יותר ויעיל יותר כי הוא מותאם למעבד הספציפי",
        "hard_wrong": ["הוא יכול לרוץ על כל מכשיר ללא שום התאמה", "הוא נכתב באופן אוטומטי על ידי המחשב", "הוא מגן על המחשב מפני וירוסים"]
    },
    {
        "word": "Bytecode",
        "translation": "קוד בתים",
        "wrong_easy": ["קוד מקור", "תשתית (מסגרת עבודה)", "מודול (רכיב)"],
        "med_q": "Which word best completes: Java and C# convert code to ___ before it runs on a virtual machine.",
        "med_wrong": ["תסריט (סקריפט)", "תשתית (מסגרת עבודה)", "מנוע"],
        "hard_q": "What is Bytecode in modern programming environments?",
        "hard_ans": "סט הוראות שנועד להיות מבוצע על ידי מכונה וירטואלית ולא ישירות על ידי המעבד",
        "hard_wrong": ["קוד מקור שמורכב רק מאפסים ואחדות", "הטקסט שהמתכנת כותב בתוך עורך הקוד", "פורמט של קבצי אודיו במחשב"]
    },
    {
        "word": "Parse",
        "translation": "לנתח (לפענח תחביר)",
        "wrong_easy": ["לתפוס (שגיאה)", "לפרוס (להטמיע)", "יוזמה"],
        "med_q": "Which word best completes: The interpreter must first ___ the JSON data into an object.",
        "med_wrong": ["לתפוס (שגיאה)", "לפרוס (להטמיע)", "יוזמה"],
        "hard_q": "What does a parser do during the interpretation process?",
        "hard_ans": "הוא מפרק את רצף התווים בקוד המקור למבנה לוגי שהמחשב יכול לעבוד איתו",
        "hard_wrong": ["הוא מוחק את כל הקבצים הזמניים במחשב", "הוא שולח את הקוד לשרת בענן לאישור", "הוא הופך את הקוד לקובץ תמונה"]
    },
    {
        "word": "Catch",
        "translation": "לתפוס (שגיאה)",
        "wrong_easy": ["לנתח (לפענח תחביר)", "פירוש (אינטרפרטציה)", "לתרגם"],
        "med_q": "Which word best completes: We use a try-___ block to handle runtime errors gracefully.",
        "med_wrong": ["לנתח (לפענח תחביר)", "פירוש (אינטרפרטציה)", "לתרגם"],
        "hard_q": "In exception handling, what happens when you Catch an error?",
        "hard_ans": "אתה מונע מהתוכנית לקרוס ומגדיר קוד חלופי שיטפל בבעיה שנוצרה",
        "hard_wrong": ["השגיאה נשלחת אוטומטית למתכנת במייל", "התוכנית נסגרת באופן מיידי כדי למנוע נזק", "המערכת מוחקת את השורה הבעייתית מהקוד"]
    },
    {
        "word": "Strict",
        "translation": "קפדני (מחמיר)",
        "wrong_easy": ["קל משקל", "גמישות", "לא חוקי (פסול)"],
        "med_q": "Which word best completes: C# is a ___ language, meaning you must define data types clearly.",
        "med_wrong": ["קל משקל", "גמישות", "היברידי (משולב)"],
        "hard_q": "What is the benefit of a Strict typing system?",
        "hard_ans": "הוא עוזר לגלות באגים וטעויות בשלב מוקדם של הפיתוח במקום בזמן הריצה",
        "hard_wrong": ["הוא מאפשר כתיבת קוד מהירה יותר ללא חוקים", "הוא מבטיח שהקוד ירוץ גם ללא חיבור לחשמל", "הוא הופך את ממשק המשתמש ליפה יותר"]
    },
    # Day 4
    {
        "word": "Browser",
        "translation": "דפדפן",
        "wrong_easy": ["מנוע", "תשתית (מסגרת עבודה)", "מודול (רכיב)"],
        "med_q": "Which word best completes: JavaScript was originally built to run exclusively inside a web ___.",
        "med_wrong": ["תשתית (מסגרת עבודה)", "מודול (רכיב)", "מנוע"],
        "hard_q": "What role does the Browser play in executing JavaScript?",
        "hard_ans": "הוא מספק את סביבת הריצה, מנוע ה-JavaScript והממשקים לשינוי המסך",
        "hard_wrong": ["הוא כותב את הקוד במקום המתכנת", "הוא אחראי על אחסון מסדי נתונים עצומים של אפליקציה", "הוא משדר את הנתונים ישירות ללווין"]
    },
    {
        "word": "Script",
        "translation": "תסריט (סקריפט)",
        "wrong_easy": ["קובץ הפעלה (ניתן להרצה)", "טבעי (מקומי/קוד מכונה)", "דפדפן"],
        "med_q": "Which word best completes: The developer wrote a Python ___ to automate the daily backups.",
        "med_wrong": ["קובץ הפעלה (ניתן להרצה)", "מנוע", "תשתית (מסגרת עבודה)"],
        "hard_q": "How does a Script differ from a standalone compiled application?",
        "hard_ans": "סקריפט לרוב מפורש בזמן אמת וזקוק לתוכנה מארחת (כמו דפדפן) כדי לרוץ",
        "hard_wrong": ["סקריפט רץ הרבה יותר מהר מקובץ מקומפל", "סקריפט חייב להיכתב בתוך חודש אחד", "סקריפט יכול לרוץ גם כשהמחשב כבוי"]
    },
    {
        "word": "Engine",
        "translation": "מנוע",
        "wrong_easy": ["דפדפן", "מודול (רכיב)", "שלב (במה)"],
        "med_q": "Which word best completes: Google Chrome uses the V8 JavaScript ___ to execute code quickly.",
        "med_wrong": ["מודול (רכיב)", "שלב (במה)", "תשתית (מסגרת עבודה)"],
        "hard_q": "In software, what is an Engine (like a JavaScript Engine)?",
        "hard_ans": "רכיב תוכנה מרכזי המנתח, מבצע ומבצע אופטימיזציה לקוד בזמן ריצה",
        "hard_wrong": ["החומרה הפיזית שמקררת את המחשב", "הספרייה שאחראית על הצבעים באתר", "שירות בענן שמאחסן את הקבצים"]
    },
    {
        "word": "Hybrid",
        "translation": "היברידי (משולב)",
        "wrong_easy": ["טבעי (מקומי/קוד מכונה)", "קפדני (מחמיר)", "קל משקל"],
        "med_q": "Which word best completes: Modern environments like .NET or Java take a ___ approach to execution.",
        "med_wrong": ["טבעי (מקומי/קוד מכונה)", "קל משקל", "קפדני (מחמיר)"],
        "hard_q": "What characterizes a Hybrid compilation/interpretation approach?",
        "hard_ans": "הקוד מקומפל תחילה לקוד ביניים ואז מפורש או מקומפל בזמן ריצה במכונת היעד",
        "hard_wrong": ["הקוד נכתב בשתי שפות תכנות בו-זמנית", "התוכנית דורשת אישור משני משתמשים שונים", "האפליקציה פועלת רק על טלפונים ניידים"]
    },
    {
        "word": "Deploy",
        "translation": "לפרוס (להטמיע)",
        "wrong_easy": ["לנתח (לפענח תחביר)", "לתפוס (שגיאה)", "קימפול (הידור)"],
        "med_q": "Which word best completes: After testing, it's time to ___ the application to the live server.",
        "med_wrong": ["לתפוס (שגיאה)", "קימפול (הידור)", "לנתח (לפענח תחביר)"],
        "hard_q": "What does it mean to Deploy an application?",
        "hard_ans": "להעביר את התוכנה המוכנה לסביבת הייצור כדי שתהיה זמינה למשתמשים",
        "hard_wrong": ["למחוק את כל גרסאות הגיבוי", "לחלק את הקוד לקבצים קטנים יותר", "לבדוק אם יש באגים במערכת"]
    },
    {
        "word": "Initiative",
        "translation": "יוזמה",
        "wrong_easy": ["גמישות", "שלב (במה)", "חוסר התאמה"],
        "med_q": "Which word best completes: The team took the ___ to rewrite the legacy code in C#.",
        "med_wrong": ["גמישות", "שלב (במה)", "חוסר התאמה"],
        "hard_q": "How can taking Initiative impact a software development project?",
        "hard_ans": "זה יכול להוביל לפתרונות חדשניים ולייעול תהליכים לפני שהבעיות הופכות לקריטיות",
        "hard_wrong": ["זה מאט את הפיתוח כי כולם מחכים להוראות", "זה גורם למחשב לצרוך פחות חשמל", "זה אוטומטית מקמפל את כל הקוד בשניות"]
    },
    {
        "word": "Flexibility",
        "translation": "גמישות",
        "wrong_easy": ["אמינות", "קפדני (מחמיר)", "ביצועים"],
        "med_q": "Which word best completes: JavaScript offers high ___ because you don't have to define data types in advance.",
        "med_wrong": ["אמינות", "ביצועים", "יוזמה"],
        "hard_q": "What is the trade-off of high Flexibility in dynamically typed languages?",
        "hard_ans": "זה מקל על כתיבה מהירה אך מגדיל את הסיכון לשגיאות המתגלות רק בזמן ריצה",
        "hard_wrong": ["התוכנה לעולם אינה יכולה לרוץ על שרתי לינוקס", "הקוד חייב להיכתב שוב ושוב עבור כל דפדפן", "זה מחייב ידע נרחב במתמטיקה מורכבת"]
    },
    {
        "word": "Stage",
        "translation": "שלב (במה)",
        "wrong_easy": ["מודול (רכיב)", "תסריט (סקריפט)", "דפדפן"],
        "med_q": "Which word best completes: Compiling C++ code is the first ___ before executing it.",
        "med_wrong": ["מודול (רכיב)", "תסריט (סקריפט)", "דפדפן"],
        "hard_q": "In a deployment pipeline, what is a testing Stage?",
        "hard_ans": "סביבה מבודדת שבה הקוד נבדק לפני שהוא מועבר לשרת החי (ייצור)",
        "hard_wrong": ["המקום שבו המתכנת מצייר את הלוגו של החברה", "קובץ שמכיל את כל השגיאות של המערכת", "שפה בינלאומית לכתיבת קוד למתחילים"]
    },
    {
        "word": "Framework",
        "translation": "תשתית (מסגרת עבודה)",
        "wrong_easy": ["מודול (רכיב)", "תסריט (סקריפט)", "מנוע"],
        "med_q": "Which word best completes: React is a popular JavaScript ___ for building user interfaces.",
        "med_wrong": ["מנוע", "תסריט (סקריפט)", "טבעי (מקומי/קוד מכונה)"],
        "hard_q": "How does a Framework differ from a simple library?",
        "hard_ans": "תשתית מכתיבה את המבנה של האפליקציה וקוראת לקוד שלך, בניגוד לספרייה שאתה קורא לה",
        "hard_wrong": ["תשתית מתאימה רק לשפות מקומפלות", "תשתית תמיד עולה כסף, בניגוד לספריות חינמיות", "אין ביניהן שום הבדל, אלו רק שמות נרדפים"]
    },
    {
        "word": "Module",
        "translation": "מודול (רכיב)",
        "wrong_easy": ["דפדפן", "תשתית (מסגרת עבודה)", "שלב (במה)"],
        "med_q": "Which word best completes: You can import an external ___ into your project to add new functionality.",
        "med_wrong": ["דפדפן", "שלב (במה)", "יוזמה"],
        "hard_q": "Why is code divided into Modules in large applications?",
        "hard_ans": "כדי להפוך את הקוד לקריא, ניתן לתחזוקה וניתן לשימוש חוזר בחלקים שונים של הפרויקט",
        "hard_wrong": ["כדי לגרום לקומפיילר לעבוד לאט יותר ובטוח יותר", "כי מערכת ההפעלה אינה יכולה לקרוא קבצים ארוכים", "כדי למנוע מאנשים אחרים להבין את התוכנה"]
    }
]

questions = []

for entry in words:
    # Easy question
    opts_easy = entry["wrong_easy"].copy() + [entry["translation"]]
    random.shuffle(opts_easy)
    ans_easy = opts_easy.index(entry["translation"])
    q_easy = {
        "q": f"What is the meaning of the word '{entry['word']}'?",
        "options": opts_easy,
        "ans": ans_easy,
        "diff": "easy",
        "week": "week11"
    }
    questions.append(q_easy)
    
    # Medium question
    opts_med = entry["med_wrong"].copy() + [entry["translation"]]
    random.shuffle(opts_med)
    ans_med = opts_med.index(entry["translation"])
    q_med = {
        "q": entry["med_q"],
        "options": opts_med,
        "ans": ans_med,
        "diff": "medium",
        "week": "week11"
    }
    questions.append(q_med)
    
    # Hard question
    opts_hard = entry["hard_wrong"].copy() + [entry["hard_ans"]]
    random.shuffle(opts_hard)
    ans_hard = opts_hard.index(entry["hard_ans"])
    q_hard = {
        "q": entry["hard_q"],
        "options": opts_hard,
        "ans": ans_hard,
        "diff": "hard",
        "week": "week11"
    }
    questions.append(q_hard)

# Assert we have exactly 120 questions
assert len(questions) == 120

js_content = "window.week11QuizData = " + json.dumps(questions, ensure_ascii=False, indent=4) + ";\n"

output_path = r"c:\Users\natan\Desktop\אישי - נתן\AI\ANTYGRAVITY\repo\week11_quiz.js"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(js_content)
    
print(f"Successfully generated {len(questions)} questions and saved to {output_path}")
