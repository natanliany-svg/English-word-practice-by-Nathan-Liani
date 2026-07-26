import codecs
import re
import json

quiz = [
    {"q": "What does CPR stand for?", "options": ["Cardiopulmonary resuscitation", "Central pulse restoration", "Cardio pressure relief", "Critical patient rescue"], "ans": 0},
    {"q": "What is the main goal of CPR?", "options": ["To maintain blood circulation and deliver oxygen", "To wake the person up", "To clear the airway", "To treat a fever"], "ans": 0},
    {"q": "Which organs are especially vital to receive oxygen during cardiac arrest?", "options": ["Brain and heart", "Lungs and stomach", "Liver and kidneys", "Skin and bones"], "ans": 0},
    {"q": "What are the two essential actions of modern CPR?", "options": ["Chest compressions and rescue breaths", "Abdominal thrusts and back blows", "Checking pulse and calling 911", "Giving water and elevating legs"], "ans": 0},
    {"q": "Before starting CPR, what is the first thing a rescuer should do?", "options": ["Ensure the scene is safe", "Give rescue breaths", "Check the pulse", "Call the person's family"], "ans": 0},
    {"q": "How can you check if an adult responds?", "options": ["Speaking loudly and tapping shoulders", "Slapping their face", "Pouring water on them", "Checking their pockets"], "ans": 0},
    {"q": "Where should hands be placed for adult chest compressions?", "options": ["In the center of the chest", "On the stomach", "On the neck", "On the left side of the chest"], "ans": 0},
    {"q": "What is the recommended rate for chest compressions?", "options": ["100-120 per minute", "60-80 per minute", "150-180 per minute", "30-50 per minute"], "ans": 0},
    {"q": "What is the recommended compression depth for adults?", "options": ["5-6 centimeters", "1-2 centimeters", "8-10 centimeters", "10-12 centimeters"], "ans": 0},
    {"q": "What is the ratio of compressions to rescue breaths for adults?", "options": ["30 compressions to 2 breaths", "15 compressions to 2 breaths", "50 compressions to 1 breath", "10 compressions to 5 breaths"], "ans": 0},
    {"q": "Why is CPR slightly different for children?", "options": ["Their cardiac arrests are usually related to breathing problems", "They have stronger hearts", "They require deeper compressions", "They do not need rescue breaths"], "ans": 0},
    {"q": "What is the recommended compression depth for children?", "options": ["About one-third of the chest's depth", "5-6 centimeters", "1 centimeter", "Half of the chest's depth"], "ans": 0},
    {"q": "What is the universal choking sign?", "options": ["Holding the throat with both hands", "Waving arms in the air", "Pointing to the stomach", "Screaming loudly"], "ans": 0},
    {"q": "If a choking person can cough forcefully, what should you do?", "options": ["Encourage them to continue coughing", "Perform abdominal thrusts immediately", "Give them water to drink", "Slap them on the back"], "ans": 0},
    {"q": "What is the recommended choking treatment for adults and children over one year?", "options": ["Back blows followed by abdominal thrusts", "Chest compressions only", "Rescue breaths only", "Elevating the legs"], "ans": 0},
    {"q": "Why must abdominal thrusts not be used on infants under one year?", "options": ["They may cause serious injury", "They are ineffective", "Infants don't choke", "They cause crying"], "ans": 0},
    {"q": "What is the alternative choking treatment for infants?", "options": ["Alternating back blows and chest thrusts", "Hanging them upside down", "Pinching their nose", "Giving them milk"], "ans": 0},
    {"q": "What should you do if a choking victim becomes unconscious?", "options": ["Contact emergency services and start CPR without delay", "Wait for them to wake up", "Perform abdominal thrusts", "Give them water"], "ans": 0},
    {"q": "Why should you never perform a blind finger sweep?", "options": ["It may push the object deeper into the airway", "It can bite your finger", "It causes vomiting", "It is illegal"], "ans": 0},
    {"q": "What allows participants to practice CPR techniques realistically?", "options": ["Training mannequins", "Watching videos", "Reading books", "Listening to lectures"], "ans": 0}
]

quiz_js = codecs.open('js/quizData.js', 'r', 'utf-8').read()
quiz_str = "window.week16DB = [\n" + ",\n".join([f"    {{ q: \"{q['q']}\", options: {json.dumps(q['options'])}, ans: {q['ans']} }}" for q in quiz]) + "\n];\n"
codecs.open('js/quizData.js', 'w', 'utf-8').write(quiz_js + "\n\n" + quiz_str)

import json
