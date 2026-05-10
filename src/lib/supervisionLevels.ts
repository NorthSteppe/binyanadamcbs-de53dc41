export type SupervisionLevel =
  | "not_started"
  | "beginning"
  | "developing_with_support"
  | "independent"
  | "leading";

export const SUPERVISION_LEVELS: { value: SupervisionLevel; label: string; label_he: string; score: number; color: string }[] = [
  { value: "not_started",             label: "Not yet started",      label_he: "טרם התחיל",       score: 0, color: "#94a3b8" },
  { value: "beginning",               label: "Beginning",            label_he: "מתחיל",           score: 1, color: "#f59e0b" },
  { value: "developing_with_support", label: "Developing w/ support",label_he: "מתפתח עם תמיכה",  score: 2, color: "#eab308" },
  { value: "independent",             label: "Independent",          label_he: "עצמאי",           score: 3, color: "#10b981" },
  { value: "leading",                 label: "Leading",              label_he: "מוביל",           score: 4, color: "#6366f1" },
];

export const levelMeta = (v: SupervisionLevel) =>
  SUPERVISION_LEVELS.find((l) => l.value === v) || SUPERVISION_LEVELS[0];

export const levelLabel = (v: SupervisionLevel, lang: "en" | "he") =>
  lang === "he" ? levelMeta(v).label_he : levelMeta(v).label;

export const STATUSES = [
  { value: "in_progress", label: "In progress", label_he: "בתהליך",   color: "#0ea5e9" },
  { value: "on_hold",     label: "On hold",     label_he: "בהמתנה",   color: "#94a3b8" },
  { value: "complete",    label: "Complete",    label_he: "הושלם",    color: "#10b981" },
];

export const statusLabel = (v: string, lang: "en" | "he") => {
  const s = STATUSES.find((x) => x.value === v);
  if (!s) return v;
  return lang === "he" ? s.label_he : s.label;
};

export const gapIcon = (self?: SupervisionLevel, supervisor?: SupervisionLevel) => {
  if (!self || !supervisor) return "—";
  const a = levelMeta(self).score;
  const b = levelMeta(supervisor).score;
  if (a === b) return "✔";
  if (a > b) return "⬆";
  return "⬇";
};
