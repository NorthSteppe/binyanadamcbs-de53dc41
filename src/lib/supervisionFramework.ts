// Default supervision competency framework (UKBA / behaviour-analytic aligned).
// Two-level hierarchy: domain → competency. Admin can add/edit/delete freely after loading.

export type FrameworkItem = {
  number: string;
  name: string;
  name_he: string;
  definition: string;
  definition_he: string;
  domain: string;
  domain_he: string;
  parent_number?: string; // references another item's `number`
  can_break_down?: boolean;
};

export const DEFAULT_FRAMEWORK: FrameworkItem[] = [
  // 1. Assessment
  { number: "1", name: "Assessment", name_he: "הערכה", definition: "Gathering information to understand behaviour in context.", definition_he: "איסוף מידע להבנת ההתנהגות בהקשר.", domain: "Assessment", domain_he: "הערכה", can_break_down: true },
  { number: "1.1", parent_number: "1", name: "Conduct preference assessment", name_he: "הערכת העדפות", definition: "Identify reinforcers via systematic preference methods.", definition_he: "זיהוי מחזקים בשיטות העדפה שיטתיות.", domain: "Assessment", domain_he: "הערכה", can_break_down: true },
  { number: "1.2", parent_number: "1", name: "Conduct functional behaviour assessment (FBA)", name_he: "הערכת תפקוד התנהגות (FBA)", definition: "Indirect, descriptive and experimental analyses of behaviour function.", definition_he: "ניתוחים עקיפים, תיאוריים וניסויים של תפקוד ההתנהגות.", domain: "Assessment", domain_he: "הערכה", can_break_down: true },
  { number: "1.3", parent_number: "1", name: "Conduct skills assessment", name_he: "הערכת מיומנויות", definition: "Use validated skills assessments to map current repertoire.", definition_he: "שימוש בכלי הערכת מיומנויות מתוקפים למיפוי הרפרטואר הנוכחי.", domain: "Assessment", domain_he: "הערכה" },
  { number: "1.4", parent_number: "1", name: "Interpret and synthesise assessment data", name_he: "פירוש וסינתזה של נתוני הערכה", definition: "Translate raw data into a coherent clinical picture.", definition_he: "תרגום הנתונים הגולמיים לתמונה קלינית קוהרנטית.", domain: "Assessment", domain_he: "הערכה" },

  // 2. Measurement
  { number: "2", name: "Measurement", name_he: "מדידה", definition: "Selecting, collecting and graphing behavioural data.", definition_he: "בחירה, איסוף וגרף של נתוני התנהגות.", domain: "Measurement", domain_he: "מדידה", can_break_down: true },
  { number: "2.1", parent_number: "2", name: "Define behaviour operationally", name_he: "הגדרה אופרטיבית של התנהגות", definition: "Write objective, clear, complete behaviour definitions.", definition_he: "ניסוח הגדרות התנהגות אובייקטיביות, ברורות ושלמות.", domain: "Measurement", domain_he: "מדידה" },
  { number: "2.2", parent_number: "2", name: "Select appropriate measurement procedures", name_he: "בחירת שיטת מדידה מתאימה", definition: "Choose continuous/discontinuous methods that fit the behaviour and setting.", definition_he: "בחירת שיטות רציפות/לא-רציפות המתאימות להתנהגות ולסביבה.", domain: "Measurement", domain_he: "מדידה" },
  { number: "2.3", parent_number: "2", name: "Graph and visually inspect data", name_he: "גרף וניתוח חזותי של נתונים", definition: "Build clean line graphs and identify level, trend and variability.", definition_he: "בניית גרפי קו נקיים וזיהוי רמה, מגמה ושונות.", domain: "Measurement", domain_he: "מדידה" },
  { number: "2.4", parent_number: "2", name: "Ensure measurement integrity (IOA)", name_he: "תקפות מדידה (IOA)", definition: "Calculate inter-observer agreement and treatment integrity.", definition_he: "חישוב הסכמה בין מתצפתים ושלמות יישום.", domain: "Measurement", domain_he: "מדידה" },

  // 3. Intervention
  { number: "3", name: "Intervention", name_he: "התערבות", definition: "Designing and implementing function-based behaviour-analytic interventions.", definition_he: "תכנון והפעלת התערבויות אנליטיות-התנהגותיות מבוססות תפקוד.", domain: "Intervention", domain_he: "התערבות", can_break_down: true },
  { number: "3.1", parent_number: "3", name: "Design function-based interventions", name_he: "תכנון התערבויות מבוססות תפקוד", definition: "Match procedures to assessed function and contextual variables.", definition_he: "התאמת ההליכים לתפקוד שזוהה ולמשתני ההקשר.", domain: "Intervention", domain_he: "התערבות" },
  { number: "3.2", parent_number: "3", name: "Implement reinforcement-based procedures", name_he: "יישום הליכי חיזוק", definition: "Use DRA, DRO, DRI, NCR with fidelity.", definition_he: "שימוש ב-DRA, DRO, DRI, NCR בנאמנות יישום גבוהה.", domain: "Intervention", domain_he: "התערבות" },
  { number: "3.3", parent_number: "3", name: "Teach skills using behaviour-analytic teaching", name_he: "הוראת מיומנויות בשיטות אנליטיות-התנהגותיות", definition: "Use prompting, prompt fading, shaping, chaining.", definition_he: "שימוש בעידוד, דעיכת עידוד, עיצוב ושרשור.", domain: "Intervention", domain_he: "התערבות" },
  { number: "3.4", parent_number: "3", name: "Plan for generalisation and maintenance", name_he: "תכנון להכללה ושימור", definition: "Programme common stimuli, train loosely, multiple exemplars.", definition_he: "תכנון גרויים משותפים, אימון רופף ודגמים מרובים.", domain: "Intervention", domain_he: "התערבות" },

  // 4. Ethics & Professional Practice
  { number: "4", name: "Ethics & Professional Practice", name_he: "אתיקה ופרקטיקה מקצועית", definition: "Operating within scope, with consent and dignity.", definition_he: "פעולה בתוך תחום ההתמחות, בהסכמה ובכבוד.", domain: "Ethics", domain_he: "אתיקה", can_break_down: true },
  { number: "4.1", parent_number: "4", name: "Obtain informed consent", name_he: "קבלת הסכמה מדעת", definition: "Document consent for assessment, intervention and data sharing.", definition_he: "תיעוד הסכמה להערכה, התערבות ושיתוף נתונים.", domain: "Ethics", domain_he: "אתיקה" },
  { number: "4.2", parent_number: "4", name: "Maintain client dignity and assent", name_he: "שמירה על כבוד והסכמה פעילה של הלקוח", definition: "Respond to assent withdrawal; least-restrictive choices.", definition_he: "מענה לסירוב פעיל; בחירת ההליכים הפחות מגבילים.", domain: "Ethics", domain_he: "אתיקה" },
  { number: "4.3", parent_number: "4", name: "Practice within scope of competence", name_he: "פעולה בגבולות הכשירות", definition: "Refer or seek supervision when at boundaries.", definition_he: "הפניה או בקשת הדרכה כשמגיעים לגבול הכשירות.", domain: "Ethics", domain_he: "אתיקה" },
  { number: "4.4", parent_number: "4", name: "Maintain documentation and confidentiality", name_he: "תיעוד וסודיות", definition: "GDPR-compliant records, secure storage, retention rules.", definition_he: "תיעוד התואם ל-GDPR, אחסון מאובטח וכללי שמירה.", domain: "Ethics", domain_he: "אתיקה" },

  // 5. Personnel Supervision
  { number: "5", name: "Personnel Supervision", name_he: "הדרכת צוות", definition: "Supporting RBTs, support staff and trainees.", definition_he: "תמיכה ב-RBTs, צוות תמיכה ומתמחים.", domain: "Supervision", domain_he: "הדרכה", can_break_down: true },
  { number: "5.1", parent_number: "5", name: "Train staff using BST", name_he: "הכשרת צוות בשיטת BST", definition: "Instruction, modelling, rehearsal, feedback to mastery.", definition_he: "הסבר, הדגמה, תרגול ומשוב עד רמת שליטה.", domain: "Supervision", domain_he: "הדרכה" },
  { number: "5.2", parent_number: "5", name: "Provide performance feedback", name_he: "מתן משוב ביצועים", definition: "Specific, timely, behaviour-analytic feedback.", definition_he: "משוב ספציפי, בזמן ובשפה אנליטית-התנהגותית.", domain: "Supervision", domain_he: "הדרכה" },

  // 6. Communication
  { number: "6", name: "Communication", name_he: "תקשורת", definition: "Writing and speaking with families, schools and teams.", definition_he: "כתיבה ודיבור עם משפחות, בתי ספר וצוותים.", domain: "Communication", domain_he: "תקשורת", can_break_down: true },
  { number: "6.1", parent_number: "6", name: "Write a clear behaviour support plan", name_he: "כתיבת תוכנית תמיכה התנהגותית ברורה", definition: "Family-friendly language, function-based, measurable.", definition_he: "שפה ידידותית למשפחה, מבוסס תפקוד וניתן למדידה.", domain: "Communication", domain_he: "תקשורת" },
  { number: "6.2", parent_number: "6", name: "Communicate with multidisciplinary partners", name_he: "תקשורת עם שותפים רב-תחומיים", definition: "Translate behavioural concepts into shared language.", definition_he: "תרגום מושגים התנהגותיים לשפה משותפת.", domain: "Communication", domain_he: "תקשורת" },
];
