export type SupervisionLevel =
  | "not_started"
  | "beginning"
  | "developing_with_support"
  | "independent"
  | "leading";

export const SUPERVISION_LEVELS: { value: SupervisionLevel; label: string; score: number; color: string }[] = [
  { value: "not_started",             label: "Not yet started",      score: 0, color: "#94a3b8" },
  { value: "beginning",               label: "Beginning",            score: 1, color: "#f59e0b" },
  { value: "developing_with_support", label: "Developing w/ support",score: 2, color: "#eab308" },
  { value: "independent",             label: "Independent",          score: 3, color: "#10b981" },
  { value: "leading",                 label: "Leading",              score: 4, color: "#6366f1" },
];

export const levelMeta = (v: SupervisionLevel) =>
  SUPERVISION_LEVELS.find((l) => l.value === v) || SUPERVISION_LEVELS[0];

export const STATUSES = [
  { value: "in_progress", label: "In progress", color: "#0ea5e9" },
  { value: "on_hold",     label: "On hold",     color: "#94a3b8" },
  { value: "complete",    label: "Complete",    color: "#10b981" },
];

export const gapIcon = (self?: SupervisionLevel, supervisor?: SupervisionLevel) => {
  if (!self || !supervisor) return "—";
  const a = levelMeta(self).score;
  const b = levelMeta(supervisor).score;
  if (a === b) return "✔";
  if (a > b) return "⬆";
  return "⬇";
};
