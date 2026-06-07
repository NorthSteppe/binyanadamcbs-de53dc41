import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Printer, ArrowLeft,
  User, ClipboardList, Heart, AlertTriangle, MessageSquare, Eye,
  Lightbulb, FileText, CheckCircle2, Brain, Scale, Upload, Paperclip,
  Loader2, Palette,
} from "lucide-react";
import { METAL_BG } from "@/components/portal/PortalShell";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import FBAIntakeManager from "@/components/clinical/FBAIntakeManager";
import FBAAttachDialog from "@/components/clinical/FBAAttachDialog";
import {
  FBA_PREFILL_EVENT,
  FBA_PREFILL_STORAGE_KEY,
  FBAReportDraftPatch,
} from "@/lib/fbaIntakeMapping";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SupportingDoc {
  title: string;
  professional: string;
  docDate: string;
  docType: string;
  keyFindings: string;
  fileUrl?: string;
  fileName?: string;
}

interface Strength { title: string; description: string; }
interface TargetBehaviour {
  name: string; topography: string; frequency: string;
  intensity: string; duration: string; context: string;
}
interface ObservationSession {
  sessionNumber: number; date: string; setting: string; participants: string;
  purpose: string; observations: string; analysis: string;
}
interface BehaviourHypothesis {
  behaviour: string; function: string;
  benefitsOfBehaviour: string; costsOfAlternatives: string; hypothesis: string;
}

interface AssessorInfo {
  name: string; role: string; credentials: string;
  bio: string; avatar_url: string | null; signature_url: string | null;
  social_website: string; social_linkedin: string;
}

interface FBAData {
  clientName: string; clientDOB: string; diagnosis: string;
  settingType: string; settingName: string; referralReason: string;
  assessor: string; assessmentDates: string;
  methods: Record<string, boolean>; methodsOther: string;
  supportingDocs: SupportingDoc[];
  background: string; environment: string; supportStaff: string;
  strengths: Strength[];
  behaviours: TargetBehaviour[];
  cq_statedOutcome: string; cq_observedOutcome: string; cq_currentState: string;
  cq_historyOfPattern: string; cq_conditionsWhenBetter: string;
  cq_whatHasWorked: string; cq_naturalReinforcer: string; cq_subgoals: string;
  act_languageComplexity: string; act_presentMoment: string; act_defusion: string;
  act_acceptance: string; act_selfAsContext: string; act_values: string;
  act_committedAction: string; act_statedValues: string; act_reinforcers: string;
  observations: ObservationSession[];
  hypotheses: BehaviourHypothesis[];
  recommendations: string; additionalNotes: string;
  reportColor: string;
  themePreset: string;
  fontFamily: string;
}

const REPORT_THEMES = [
  { id: "clinical", label: "Clinical / Diagnostic", description: "Formal, sharp borders, elegant traditional spacing", primary: "#1a2744", secondary: "#f8faff", radius: "0px", accent: "#1a2744" },
  { id: "educational", label: "Educational / School Consult", description: "Clean, bright blocks, highlighted lists", primary: "#0e7490", secondary: "#ecfeff", radius: "8px", accent: "#0891b2" },
  { id: "community", label: "Community / Family", description: "Warm tones, softer radius, accessible", primary: "#9f1239", secondary: "#fff1f2", radius: "12px", accent: "#be123c" },
];

const REPORT_FONTS = [
  { id: "georgia", label: "Georgia (Standard Clinical)", value: "'Georgia', 'Times New Roman', serif" },
  { id: "helvetica", label: "Arial / Helvetica (Modern Clean)", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: "garamond", label: "Garamond (Formal)", value: "'Garamond', 'Baskerville', serif" },
  { id: "calibri", label: "Calibri / Roboto (Accessible)", value: "'Calibri', 'Roboto', sans-serif" },
];

// ── Constants ──────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  "Educational Psychology Report", "School EHCP / SEND Plan",
  "SALT Report (Speech & Language)", "Occupational Therapy Report",
  "Paediatric Assessment", "Previous Behaviour Assessment (FBA/BIP)",
  "Medical / Psychiatric Report", "School Report / Teacher Notes",
  "Parent Report", "Social Care Assessment", "ADOS / ADI-R Report", "Other",
];

const BEHAVIOUR_FUNCTIONS = [
  "Escape / Avoidance (Sr–)",
  "Access to Attention (Sr+)",
  "Access to Tangibles / Preferred Activities (Sr+)",
  "Automatic / Sensory Reinforcement",
  "Social Positive Reinforcement – Power/Control",
  "Social Negative Reinforcement – Demands/Expectations",
  "Multiple functions",
];

const ASSESSMENT_METHODS = [
  { key: "fai", label: "Functional Assessment Interview (FAI – O'Neill et al., 2014)" },
  { key: "mas", label: "Motivation Assessment Scale (MAS – Durand & Crimmins)" },
  { key: "qabf", label: "Questions About Behavior Function (QABF)" },
  { key: "constructional_questionnaire", label: "Goldiamond's Constructional Questionnaire (1974)" },
  { key: "cpfq", label: "Child Psychological Flexibility Questionnaire (CPFQ)" },
  { key: "camm", label: "Child & Adolescent Mindfulness Measure (CAMM)" },
  { key: "peak", label: "PEAK Comprehensive Assessment (PCA – Dixon, 2019)" },
  { key: "records_review", label: "Records Review (previous reports and assessments)" },
  { key: "parent_interview", label: "Parent / Caregiver Interview" },
  { key: "client_interview", label: "Client Interview" },
  { key: "staff_interview", label: "Staff / Teacher Interview" },
  { key: "direct_observation_abc", label: "Direct Observation – ABC Data Recording" },
  { key: "scatter_plot", label: "Scatter Plot" },
  { key: "daily_events_log", label: "Daily Events Log" },
];

const ASSESSMENT_METHODS_KEYS = [
  "fai", "mas", "qabf", "constructional_questionnaire", "cpfq", "camm",
  "peak", "records_review", "parent_interview", "client_interview",
  "staff_interview", "direct_observation_abc", "scatter_plot", "daily_events_log"
];

const isStepComplete = (stepId: number, data: FBAData): boolean => {
  switch (stepId) {
    case 1: return !!data.clientName && !!data.referralReason;
    case 2: return Object.values(data.methods).some(Boolean) || !!data.methodsOther;
    case 3: return true; // Optional docs
    case 4: return !!data.background;
    case 5: return data.strengths.some(s => !!s.title);
    case 6: return data.behaviours.some(b => !!b.name);
    case 7: return !!data.cq_statedOutcome;
    case 8: return !!data.act_languageComplexity;
    case 9: return true; // Ops are optional
    case 10: return data.hypotheses.some(h => !!h.behaviour && !!h.hypothesis);
    case 11: return !!data.recommendations;
    default: return true;
  }
};

// ── Blank factories ────────────────────────────────────────────────────────────
const emptyDoc = (): SupportingDoc => ({ title: "", professional: "", docDate: "", docType: "", keyFindings: "" });
const emptyStrength = (): Strength => ({ title: "", description: "" });
const emptyBehaviour = (): TargetBehaviour => ({ name: "", topography: "", frequency: "", intensity: "", duration: "", context: "" });
const emptyObs = (n: number): ObservationSession => ({ sessionNumber: n, date: "", setting: "", participants: "", purpose: "", observations: "", analysis: "" });
const emptyHyp = (): BehaviourHypothesis => ({ behaviour: "", function: "", benefitsOfBehaviour: "", costsOfAlternatives: "", hypothesis: "" });

const initialData: FBAData = {
  clientName: "", clientDOB: "", diagnosis: "", settingType: "School",
  settingName: "", referralReason: "", assessor: "Adam Dayan – Behaviour Analyst",
  assessmentDates: "",
  methods: Object.fromEntries(ASSESSMENT_METHODS_KEYS.map((key) => [key, false])),
  methodsOther: "",
  supportingDocs: [],
  background: "", environment: "", supportStaff: "",
  strengths: [emptyStrength()],
  behaviours: [emptyBehaviour()],
  cq_statedOutcome: "", cq_observedOutcome: "", cq_currentState: "",
  cq_historyOfPattern: "", cq_conditionsWhenBetter: "",
  cq_whatHasWorked: "", cq_naturalReinforcer: "", cq_subgoals: "",
  act_languageComplexity: "", act_presentMoment: "", act_defusion: "",
  act_acceptance: "", act_selfAsContext: "", act_values: "",
  act_committedAction: "", act_statedValues: "", act_reinforcers: "",
  observations: [emptyObs(1)],
  hypotheses: [emptyHyp()],
  recommendations: "", additionalNotes: "",
  reportColor: "#1a2744",
  themePreset: "clinical",
  fontFamily: "georgia",
};

// ── Styled HTML report generator ───────────────────────────────────────────────

// Escape user-supplied text before injecting into HTML to prevent XSS.
// Newlines are preserved as <br> tags after entity escaping.
function escHtml(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>");
}

// Escape for use inside HTML attribute values (no <br> conversion).
function escAttr(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateStyledHTML(d: FBAData, assessor: AssessorInfo | null, t: any, isRTL: boolean, assessmentMethodsLabels: string[]): string {
  const colorReport = d.reportColor;
  const firstName = d.clientName.split(" ")[0] || d.clientName;
  const enabledMethods = assessmentMethodsLabels;
  if (d.methodsOther) enabledMethods.push(d.methodsOther);
  const aName  = assessor?.name        || d.assessor;
  const aRole  = assessor?.role        || "Behaviour Analyst";
  const aCreds = assessor?.credentials || "";
  const aSig   = assessor?.signature_url || null;
  const aWeb   = assessor?.social_website || "bacbs.com";
  const logoUrl = window.location.origin + "/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png";
  
  const themeObj = REPORT_THEMES.find(t => t.id === d.themePreset) || REPORT_THEMES[0];
  const fontObj = REPORT_FONTS.find(f => f.id === d.fontFamily) || REPORT_FONTS[0];
  const color = themeObj.primary;
  const bgSecondary = themeObj.secondary;
  const radius = themeObj.radius;

  const sec = (title: string, content: string) =>
    content.trim()
      ? `<div class="section">
          <div class="section-header">${title}</div>
          <div class="section-content">${escHtml(content)}</div>
        </div>`
      : "";

  const subsec = (title: string, hint: string, content: string) =>
    content.trim()
      ? `<div class="subsection">
          <div class="subsection-title">${title}</div>
          ${hint ? `<div class="subsection-hint">${hint}</div>` : ""}
          <div class="subsection-body">${escHtml(content)}</div>
        </div>`
      : "";

  const docsSection = d.supportingDocs.filter((doc) => doc.title.trim()).length > 0
    ? `<div class="section">
        <div class="section-header">${t.fbaTool.report.docReviewed}</div>
        <div class="section-content">
          ${d.supportingDocs.filter((doc) => doc.title.trim()).map((doc, i) => `
            <div class="doc-card">
              <div class="doc-meta">
                <strong>${i + 1}. ${escHtml(doc.title)}</strong>
                ${doc.docType ? ` &mdash; <em>${escHtml(doc.docType)}</em>` : ""}
                ${doc.professional ? ` &mdash; ${escHtml(doc.professional)}` : ""}
                ${doc.docDate ? ` &mdash; ${new Date(doc.docDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}
                ${doc.fileUrl ? ` <span class="doc-attached">${t.fbaTool.report.fileAttached}</span>` : ""}
              </div>
              ${doc.keyFindings ? `<div class="doc-findings">${escHtml(doc.keyFindings)}</div>` : ""}
            </div>`).join("")}
        </div>
      </div>`
    : "";

  const strengthsHtml = d.strengths.filter((s) => s.title.trim()).map((s, i) =>
    `<div class="strength-item"><strong>${i + 1}. ${escHtml(s.title)}</strong>${s.description ? `<br><span style="color:#444;">${escHtml(s.description)}</span>` : ""}</div>`
  ).join("");

  const behavioursHtml = d.behaviours.filter((b) => b.name.trim()).map((b, i) =>
    `<div class="behaviour-card">
      <strong>${i + 1}. ${escHtml(b.name)}</strong>
      ${b.topography ? `<div><span class="field-label">${t.fbaTool.report.topography}</span> ${escHtml(b.topography)}</div>` : ""}
      <div class="behaviour-grid">
        ${b.frequency ? `<div><span class="field-label">${t.fbaTool.report.frequency}</span> ${escHtml(b.frequency)}</div>` : ""}
        ${b.intensity ? `<div><span class="field-label">${t.fbaTool.report.intensity}</span> ${escHtml(b.intensity)}</div>` : ""}
        ${b.duration  ? `<div><span class="field-label">${t.fbaTool.report.duration}</span> ${escHtml(b.duration)}</div>`  : ""}
      </div>
      ${b.context ? `<div><span class="field-label">${t.fbaTool.report.antecedents}</span> ${escHtml(b.context)}</div>` : ""}
    </div>`
  ).join("");

  const obsHtml = d.observations.filter((o) => o.date || o.observations).map((o) =>
    `<div class="obs-card">
      <div class="obs-header">${t.fbaTool.form.session} ${escHtml(o.sessionNumber)}${o.date ? ` — ${new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}</div>
      ${o.setting      ? `<div><span class="field-label">${t.fbaTool.report.setting}</span> ${escHtml(o.setting)}</div>` : ""}
      ${o.participants ? `<div><span class="field-label">${t.fbaTool.report.participants}</span> ${escHtml(o.participants)}</div>` : ""}
      ${o.purpose      ? `<div><span class="field-label">${t.fbaTool.report.purpose}</span> ${escHtml(o.purpose)}</div>` : ""}
      ${o.observations ? `<div class="obs-body"><span class="field-label">${t.fbaTool.report.obsDesc}</span><br>${escHtml(o.observations)}</div>` : ""}
      ${o.analysis     ? `<div class="obs-body"><span class="field-label">${t.fbaTool.report.analysis}</span><br>${escHtml(o.analysis)}</div>` : ""}
    </div>`
  ).join("");

  const hypHtml = d.hypotheses.filter((h) => h.behaviour.trim()).map((h, i) =>
    `<div class="hyp-card">
      <strong>${i + 1}. ${escHtml(h.behaviour)}</strong>
      ${h.function ? `<div><span class="field-label">${t.fbaTool.form.identifiedFunction}:</span> ${escHtml(h.function)}</div>` : ""}
      ${h.benefitsOfBehaviour ? `<div><span class="field-label">${t.fbaTool.form.benefitsOfBehaviour}:</span> ${escHtml(h.benefitsOfBehaviour)}</div>` : ""}
      ${h.costsOfAlternatives ? `<div><span class="field-label">${t.fbaTool.form.costsOfAlternatives}:</span> ${escHtml(h.costsOfAlternatives)}</div>` : ""}
      ${h.hypothesis ? `<div class="obs-body"><span class="field-label">${t.fbaTool.report.hypothesis}</span><br>${escHtml(h.hypothesis)}</div>` : ""}
    </div>`
  ).join("");

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="${isRTL ? 'he' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8">
<title>FBA Report — ${escHtml(d.clientName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${fontObj.value}; font-size: 11pt; color: #1a1a2e; background: white; }

  /* ── HEADER ── */
  .report-header {
    background: ${color};
    color: white;
    padding: 22px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .report-header img.logo { height: 52px; object-fit: contain; filter: brightness(0) invert(1); }
  .report-header-right { text-align: right; font-size: 9pt; line-height: 1.7; }
  .report-header-right strong { font-size: 11pt; letter-spacing: 0.5px; }

  /* ── TITLE BLOCK ── */
  .title-block {
    background: ${bgSecondary};
    border-top: 4px solid ${color};
    padding: 20px 40px 18px;
    border-radius: ${radius === '0px' ? '0' : `0 0 ${radius} ${radius}`};
    margin-bottom: 24px;
  }
  .title-block h1 { font-size: 16pt; font-weight: bold; color: ${color}; margin-bottom: 2px; }
  .title-block .subtitle { font-size: 9pt; color: #666; letter-spacing: 0.3px; margin-bottom: 14px; }
  .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 24px; font-size: 10pt; }
  .client-grid .field-label { font-weight: bold; color: ${color}; }
  .confidential {
    display: inline-block;
    border: 1px solid ${color};
    color: ${color};
    font-size: 8pt;
    letter-spacing: 1px;
    padding: 2px 8px;
    border-radius: 3px;
    margin-top: 12px;
    text-transform: uppercase;
  }

  /* ── SECTIONS ── */
  .section { margin: 0 40px 20px; }
  .section-header {
    background: ${color};
    color: white;
    padding: 6px 12px;
    font-size: 9pt;
    font-weight: bold;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 12px;
    border-radius: ${radius === '0px' ? '0' : `${radius} ${radius} 0 0`};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .section-content { font-size: 10.5pt; line-height: 1.75; }

  /* ── SUBSECTIONS ── */
  .subsection { margin-bottom: 16px; }
  .subsection-title {
    font-size: 10pt;
    font-weight: bold;
    color: ${color};
    border-bottom: 1.5px solid ${color}33;
    padding-bottom: 3px;
    margin-bottom: 6px;
  }
  .subsection-hint { font-size: 9pt; color: #888; font-style: italic; margin-bottom: 5px; }
  .subsection-body { font-size: 10.5pt; line-height: 1.75; }

  /* ── DOCUMENT CARDS ── */
  .doc-card { border-left: 3px solid ${color}; padding: 8px 12px; margin-bottom: 10px; background: ${bgSecondary}; border-radius: 0 ${radius} ${radius} 0; }
  .doc-meta { font-size: 10pt; margin-bottom: 4px; }
  .doc-attached { color: ${color}; font-size: 9pt; }
  .doc-findings { font-size: 10pt; color: #444; line-height: 1.6; }

  /* ── STRENGTHS ── */
  .strength-item { padding: 7px 0; border-bottom: 1px solid #eee; font-size: 10.5pt; line-height: 1.65; }
  .strength-item:last-child { border-bottom: none; }

  /* ── BEHAVIOURS ── */
  .behaviour-card { border: 1px solid #ddd; border-radius: ${radius === '0px' ? '4px' : radius}; padding: 10px 14px; margin-bottom: 10px; font-size: 10pt; line-height: 1.6; }
  .behaviour-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin: 5px 0; }

  /* ── OBSERVATIONS ── */
  .obs-card { border: 1px solid #ddd; border-radius: ${radius === '0px' ? '4px' : radius}; padding: 10px 14px; margin-bottom: 12px; font-size: 10pt; line-height: 1.65; }
  .obs-header { font-weight: bold; color: ${color}; margin-bottom: 6px; font-size: 10.5pt; }
  .obs-body { margin-top: 6px; }

  /* ── HYPOTHESES ── */
  .hyp-card { border-left: 4px solid ${color}; padding: 10px 14px; margin-bottom: 12px; font-size: 10pt; line-height: 1.65; background: ${bgSecondary}; border-radius: 0 ${radius} ${radius} 0; }

  /* ── SHARED ── */
  .field-label { font-weight: bold; color: ${color}; }
  .methods-list { columns: 2; column-gap: 20px; }
  .methods-list li { font-size: 10pt; margin-bottom: 4px; break-inside: avoid; }

  /* ── DIVIDER ── */
  hr.section-rule { border: none; border-top: 1px solid #ddd; margin: 18px 40px; }

  /* ── FOOTER ── */
  .report-footer {
    border-top: 2.5px solid ${color};
    margin: 30px 40px 0;
    padding: 18px 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 9.5pt;
    gap: 20px;
  }
  .footer-assessor strong { font-size: 11pt; color: ${color}; }
  .footer-assessor .creds { color: #555; font-style: italic; }
  .footer-sig img { height: 50px; display: block; }
  .footer-date { color: #888; font-size: 9pt; margin-top: 4px; }

  /* ── REFERENCES ── */
  .references { font-size: 9pt; line-height: 1.7; color: #555; }

  /* ── PAGE BREAKS ── */
  .page-break { page-break-before: always; }
  .no-break { page-break-inside: avoid; }

  @media print {
    body { margin: 0; }
    .section-header, .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .title-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- ═══ HEADER ═══════════════════════════════════════════════════════ -->
<div class="report-header">
  <img class="logo" id="report-logo" src="${logoUrl}" alt="Blueprint CBS" onerror="this.style.display='none'">
  <div class="report-header-right">
    <strong>BLUEPRINT ADAM CBS</strong><br>
    Constructional Behaviour Support<br>
    ${aWeb ? aWeb : "bacbs.com"} &nbsp;·&nbsp; adamdayan@bacbs.com
  </div>
</div>

<!-- ═══ TITLE BLOCK ══════════════════════════════════════════════════ -->
<div class="title-block">
  <h1>${t.fbaTool.report.title}</h1>
  <div class="subtitle">${t.fbaTool.report.subtitle}</div>
  <div class="client-grid">
    <div><span class="field-label">${t.fbaTool.report.client}</span> ${escHtml(d.clientName) || "—"}</div>
    <div><span class="field-label">${t.fbaTool.report.dob}</span> ${d.clientDOB ? new Date(d.clientDOB).toLocaleDateString("en-GB") : "—"}</div>
    <div><span class="field-label">${t.fbaTool.report.diagnosis}</span> ${escHtml(d.diagnosis) || "—"}</div>
    <div><span class="field-label">${t.fbaTool.report.setting}</span> ${escHtml(d.settingType)}${d.settingName ? " — " + escHtml(d.settingName) : ""}</div>
    <div><span class="field-label">${t.fbaTool.report.assessedBy}</span> ${escHtml(aName)}${aCreds ? ", " + escHtml(aCreds) : ""}</div>
    <div><span class="field-label">${t.fbaTool.report.assessmentDates}</span> ${escHtml(d.assessmentDates) || "—"}</div>
    <div><span class="field-label">${t.fbaTool.report.reportDate}</span> ${today}</div>
  </div>
  <div class="confidential">${t.fbaTool.report.confidential.replace(" | ", " &nbsp;|&nbsp; ")}</div>
</div>

<!-- ═══ REFERRAL ════════════════════════════════════════════════════ -->
${d.referralReason ? sec("REASON FOR REFERRAL", d.referralReason) : ""}

<!-- ═══ METHODS ═════════════════════════════════════════════════════ -->
${enabledMethods.length ? `<div class="section">
  <div class="section-header">${t.fbaTool.report.assessmentMethods}</div>
  <ul class="methods-list">
    ${enabledMethods.map((m) => `<li>${escHtml(m)}</li>`).join("")}
  </ul>
</div>` : ""}

<!-- ═══ SUPPORTING DOCUMENTS ════════════════════════════════════════ -->
${docsSection}

<!-- ═══ BACKGROUND ══════════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header">${t.fbaTool.report.background}</div>
  <div class="section-content">
    <p style="font-style:italic;color:#555;margin-bottom:10px;">
      ${t.fbaTool.report.backgroundIntro.replace("the client", escHtml(firstName) || "the client")}
    </p>
    ${d.background ? escHtml(d.background) : "—"}
    ${d.environment ? `<br><br><strong>${t.fbaTool.report.envTitle}</strong><br>${escHtml(d.environment)}` : ""}
    ${d.supportStaff ? `<br><br><strong>${t.fbaTool.report.supportStaffTitle}</strong><br>${escHtml(d.supportStaff)}` : ""}
  </div>
</div>

<!-- ═══ STRENGTHS ═══════════════════════════════════════════════════ -->
<div class="section no-break">
  <div class="section-header">${t.fbaTool.report.currentRepertoire.replace("&", "&amp;")}</div>
  <div class="section-content">
    ${strengthsHtml || "<em>—</em>"}
  </div>
</div>

<!-- ═══ TARGET BEHAVIOURS ═══════════════════════════════════════════ -->
<div class="section">
  <div class="section-header">${t.fbaTool.report.targetBehavioursTitle}</div>
  <div class="section-content">
    ${behavioursHtml || "<em>—</em>"}
  </div>
</div>

<!-- ═══ CONSTRUCTIONAL INTERVIEW ════════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header">${t.fbaTool.report.cQuestionnaire}</div>
  <div class="section-content">
    <p style="font-style:italic;color:#555;margin-bottom:14px;">
      ${t.fbaTool.report.cQuestionnaireIntro}
    </p>
    ${subsec("1. Stated Outcome", "What would the outcome be for you? (verbatim)", d.cq_statedOutcome)}
    ${subsec("2. Observed Outcome", "What would others see when a successful outcome is achieved?", d.cq_observedOutcome)}
    ${subsec("3. Current State", "How does the present situation differ from the desired outcome?", d.cq_currentState)}
    ${subsec("4. History of the Pattern", "How was this pattern shaped? What maintains it?", d.cq_historyOfPattern)}
    ${subsec("5. Conditions When Better", "When is the problem less severe or absent?", d.cq_conditionsWhenBetter)}
    ${subsec("6. Related Successes", "What related challenges has the client succeeded in before?", d.cq_whatHasWorked)}
    ${subsec("7. Natural Reinforcers for Progress", "What would naturally maintain movement toward goals?", d.cq_naturalReinforcer)}
    ${subsec("8. Systematic Approximations (Subgoals)", "Stepping stones from current repertoire toward terminal outcomes", d.cq_subgoals)}
  </div>
</div>

<!-- ═══ ACT ASSESSMENT ═══════════════════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header">${t.fbaTool.report.actAssessment}</div>
  <div class="section-content">
    <p style="font-style:italic;color:#555;margin-bottom:14px;">
      ${t.fbaTool.report.actAssessmentIntro}
    </p>
    ${subsec("Language & Relational Repertoire", "Candidate for ACT?", d.act_languageComplexity)}
    ${subsec("Present-Moment Awareness", "Contact with current experience vs. past/future preoccupation", d.act_presentMoment)}
    ${subsec("Defusion (vs. Cognitive Fusion)", "Rigid entanglement with thoughts; rule-following without flexibility", d.act_defusion)}
    ${subsec("Acceptance (vs. Experiential Avoidance)", "Escape from uncomfortable internal experiences", d.act_acceptance)}
    ${subsec("Self-as-Context (vs. Self-as-Content)", "Rigid self-story; perspective-taking ability", d.act_selfAsContext)}
    ${subsec("Values", "What matters to the client? What would they want their life to be about?", d.act_values)}
    ${subsec("Committed Action (vs. Inaction / Impulsivity)", "Values-consistent action patterns", d.act_committedAction)}
    ${subsec("Client's Stated Values and Interests", "", d.act_statedValues)}
    ${subsec("Preferred Reinforcers", "", d.act_reinforcers)}
  </div>
</div>

<!-- ═══ DIRECT OBSERVATIONS ══════════════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header">${t.fbaTool.report.observations}</div>
  <div class="section-content">
    ${obsHtml || "<em>—</em>"}
  </div>
</div>

<!-- ═══ NONLINEAR ANALYSIS ═══════════════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header">${t.fbaTool.report.nonlinearAnalysis}</div>
  <div class="section-content">
    <p style="font-style:italic;color:#555;margin-bottom:14px;">
      ${t.fbaTool.report.nonlinearAnalysisIntro}
    </p>
    ${hypHtml || "<em>—</em>"}
  </div>
</div>

<!-- ═══ RECOMMENDATIONS ══════════════════════════════════════════════ -->
${d.recommendations ? `<div class="section page-break">
  <div class="section-header">${t.fbaTool.report.recommendations}</div>
  <div class="section-content">
    <p style="font-style:italic;color:#555;margin-bottom:10px;">
      ${t.fbaTool.report.recommendationsIntro.replace("the client", escHtml(firstName) || "the client")}
    </p>
    ${escHtml(d.recommendations)}
  </div>
</div>` : ""}

<!-- ═══ ADDITIONAL NOTES ══════════════════════════════════════════════ -->
${d.additionalNotes ? sec("ADDITIONAL NOTES / CAVEATS", d.additionalNotes) : ""}

<!-- ═══ REFERENCES ═══════════════════════════════════════════════════ -->
<div class="section no-break">
  <div class="section-header">${t.fbaTool.report.references}</div>
  <div class="references">
    Dixon, M. R., Belisle, J., Stanley, C. R., &amp; Rowsey, K. E. (2023). <em>Promoting psychological flexibility with clients and in our field.</em> In M. R. Dixon (Ed.), Acceptance and commitment therapy for behavior analysts.<br>
    Goldiamond, I. (1974). Toward a constructional approach to social problems: Ethical and constitutional issues raised by applied behaviour analysis. <em>Behaviourism, 2</em>(1), 1–84.<br>
    Hayes, S. C., Strosahl, K. D., &amp; Wilson, K. G. (2012). <em>Acceptance and commitment therapy: The process and practice of mindful change</em> (2nd ed.). Guilford Press.<br>
    Layng, T. V. J., Andronis, P. T., Codd, R. T., III, &amp; Abdel-Jalil, A. (2022). <em>Nonlinear contingency analysis: Going beyond cognition and behavior in clinical practice.</em> Routledge.<br>
    O'Neill, R. E., Albin, R. W., Storey, K., Horner, R. H., &amp; Sprague, J. R. (2014). <em>Functional assessment and program development.</em> Cengage Learning.
  </div>
</div>

<hr class="section-rule">

<!-- ═══ FOOTER ═══════════════════════════════════════════════════════ -->
<div class="report-footer">
  <div class="footer-assessor">
    <strong>${escHtml(aName)}</strong><br>
    ${escHtml(aRole)}${aCreds ? " · " + escHtml(aCreds) : ""}<br>
    <span class="creds">adamdayan@bacbs.com &nbsp;·&nbsp; ${escHtml(aWeb)}</span><br>
    <span class="footer-date">${t.fbaTool.report.reportCompleted} ${today}</span>
  </div>
  ${aSig ? `<div class="footer-sig"><img src="${escAttr(aSig)}" alt="Signature" onerror="this.parentNode.innerHTML='&nbsp;'"></div>` : ""}
</div>

</body></html>`;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const FBAReportTool = () => {
  const { t } = useLanguage();
  const isRTL = (t as any)._dir === "rtl";
  const STEPS: { id: number; label: string; icon: typeof User }[] = [
    { id: 1, label: (t as any).fbaTool?.steps?.clientInfo || "Client Info", icon: User },
    { id: 2, label: (t as any).fbaTool?.steps?.methods || "Methods", icon: ClipboardList },
    { id: 3, label: (t as any).fbaTool?.steps?.supportingDocs || "Supporting Docs", icon: Paperclip },
    { id: 4, label: (t as any).fbaTool?.steps?.background || "Background", icon: FileText },
    { id: 5, label: (t as any).fbaTool?.steps?.strengths || "Strengths", icon: Heart },
    { id: 6, label: (t as any).fbaTool?.steps?.targetBehaviours || "Target Behaviours", icon: AlertTriangle },
    { id: 7, label: (t as any).fbaTool?.steps?.constructionalInterview || "Constructional Interview", icon: MessageSquare },
    { id: 8, label: (t as any).fbaTool?.steps?.actAssessment || "ACT Assessment", icon: Brain },
    { id: 9, label: (t as any).fbaTool?.steps?.directObservations || "Direct Observations", icon: Eye },
    { id: 10, label: (t as any).fbaTool?.steps?.nonlinearAnalysis || "Nonlinear Analysis", icon: Scale },
    { id: 11, label: (t as any).fbaTool?.steps?.recommendations || "Recommendations", icon: Lightbulb },
  ];
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FBAData>(() => {
    const saved = localStorage.getItem("fba-report-draft");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    return initialData;
  });
  const [assessor, setAssessor] = useState<AssessorInfo | null>(null);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [attachOpen, setAttachOpen] = useState(false);

  // Fetch Adam Dayan's profile
  useEffect(() => {
    supabase
      .from("team_members")
      .select("name, role, credentials, bio, avatar_url, signature_url, social_website, social_linkedin")
      .ilike("name", "%adam%dayan%")
      .maybeSingle()
      .then(({ data: tm }) => {
        if (tm) setAssessor(tm as AssessorInfo);
      });
  }, []);

  // Save to draft on change
  useEffect(() => {
    localStorage.setItem("fba-report-draft", JSON.stringify(data));
  }, [data]);

  // Save to draft on change
  useEffect(() => {
    localStorage.setItem("fba-report-draft", JSON.stringify(data));
  }, [data]);

  // Apply a partial patch coming from a submitted parent intake.
  const applyPrefill = (patch: FBAReportDraftPatch) => {
    if (!patch || typeof patch !== "object") return;
    setData((d) => {
      const next: FBAData = { ...d };
      (Object.keys(patch) as (keyof FBAReportDraftPatch)[]).forEach((k) => {
        const value = patch[k];
        if (value === undefined || value === null) return;
        if (typeof value === "string" && value.trim().length === 0) return;
        if (k === "behaviours" && Array.isArray(value) && value.length) {
          const incoming = value as TargetBehaviour[];
          const first = next.behaviours[0];
          const slotEmpty = first && !first.name?.trim() && !first.topography?.trim();
          next.behaviours = slotEmpty
            ? [...incoming, ...next.behaviours.slice(1)]
            : [...next.behaviours, ...incoming];
          return;
        }
        if (k === "hypotheses" && Array.isArray(value) && value.length) {
          const incoming = value as BehaviourHypothesis[];
          const first = next.hypotheses[0];
          const slotEmpty = first && !first.behaviour?.trim() && !first.hypothesis?.trim();
          next.hypotheses = slotEmpty
            ? [...incoming, ...next.hypotheses.slice(1)]
            : [...next.hypotheses, ...incoming];
          return;
        }
        // Plain string fields — only fill if empty so we don't clobber the assessor's edits.
        const current = (next as any)[k];
        if (typeof current === "string" && current.trim().length > 0) return;
        (next as any)[k] = value;
      });
      return next;
    });
    setStep(1);
    toast.success("Parent intake answers loaded into the report");
  };

  // Pick up prefill triggered from FBAIntakeManager (same-window navigation).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FBA_PREFILL_STORAGE_KEY);
      if (stored) {
        const patch = JSON.parse(stored) as FBAReportDraftPatch;
        applyPrefill(patch);
        localStorage.removeItem(FBA_PREFILL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as FBAReportDraftPatch | undefined;
      if (detail) applyPrefill(detail);
    };
    window.addEventListener(FBA_PREFILL_EVENT, handler);
    return () => window.removeEventListener(FBA_PREFILL_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof FBAData>(key: K, value: FBAData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handlePrint = () => {
    const html = generateStyledHTML(
      data, 
      assessor, 
      t, 
      isRTL, 
      ASSESSMENT_METHODS.filter(m => data.methods[m.key]).map(m => t.fbaTool.form[m.key] || m.label)
    );
    const w = window.open("", "_blank");
    if (!w) { toast.error("Pop-up blocked — please allow pop-ups for this site."); return; }
    w.document.write(html);
    w.document.close();
    
    // Wait for the logo to load before printing
    const img = w.document.getElementById('report-logo') as HTMLImageElement | null;
    if (img && !img.complete) {
      img.onload = () => setTimeout(() => w.print(), 200);
      img.onerror = () => setTimeout(() => w.print(), 200);
    } else {
      setTimeout(() => w.print(), 800);
    }
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploading((u) => ({ ...u, [index]: true }));
    const path = `fba-reports/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("client-documents").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading((u) => ({ ...u, [index]: false }));
      return;
    }
    const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(path);
    const arr = [...data.supportingDocs];
    arr[index] = { ...arr[index], fileUrl: urlData.publicUrl, fileName: file.name };
    set("supportingDocs", arr);
    setUploading((u) => ({ ...u, [index]: false }));
    toast.success("Document uploaded");
  };

  // ── Step Renderers ─────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <FBAIntakeManager />
      </div>
      <SectionTitle>{t.fbaTool.steps.clientInfo}</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t.fbaTool.form.clientName}>
          <Input value={data.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder={t.fbaTool.form.clientNameHint} />
        </Field>
        <Field label={t.fbaTool.form.dob}>
          <Input type="date" value={data.clientDOB} onChange={(e) => set("clientDOB", e.target.value)} />
        </Field>
        <Field label={t.fbaTool.form.diagnosis}>
          <Input value={data.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} placeholder="e.g. ADHD, ASD, anxiety..." />
        </Field>
        <Field label={t.fbaTool.form.settingType}>
          <Select value={data.settingType} onValueChange={(v) => set("settingType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["School", "Home", "Clinic", "Residential", "Community", "Other"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.fbaTool.form.settingName}>
          <Input value={data.settingName} onChange={(e) => set("settingName", e.target.value)} placeholder={t.fbaTool.form.settingNamePlaceholder} />
        </Field>
        <Field label={t.fbaTool.form.assessor}>
          <Input value={data.assessor} onChange={(e) => set("assessor", e.target.value)} />
        </Field>
        <Field label={t.fbaTool.form.assessmentDates} className="sm:col-span-2">
          <Input value={data.assessmentDates} onChange={(e) => set("assessmentDates", e.target.value)} placeholder="e.g. May–June 2025" />
        </Field>
      </div>
      <Field label={t.fbaTool.form.referralReason}>
        <Textarea rows={4} value={data.referralReason} onChange={(e) => set("referralReason", e.target.value)}
          placeholder={t.fbaTool.form.referralReasonPlaceholder} />
      </Field>
      {/* Theme and Formatting */}
      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5"><Palette size={13} /> Report Theme</Label>
          <div className="flex flex-col gap-2">
            {REPORT_THEMES.map((t) => (
              <button key={t.id} onClick={() => set("themePreset", t.id)}
                className={`flex flex-col items-start px-3 py-2 rounded-lg text-xs font-medium border transition-all text-start ${data.themePreset === t.id ? "ring-2 ring-offset-1 ring-primary border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"}`}>
                <div className="flex items-center gap-2 mb-1 w-full">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.primary }}></div>
                  <span className="font-semibold text-[13px]">{t.label}</span>
                  {data.themePreset === t.id && <CheckCircle2 size={13} className="ml-auto text-primary" />}
                </div>
                <span className="text-muted-foreground font-normal leading-snug">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5"><FileText size={13} /> Typography</Label>
          <div className="flex flex-col gap-2">
            {REPORT_FONTS.map((f) => (
              <button key={f.id} onClick={() => set("fontFamily", f.id)}
                className={`flex flex-col items-start px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-start ${data.fontFamily === f.id ? "ring-2 ring-offset-1 ring-primary border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"}`}>
                <span className="font-semibold text-[13px] w-full flex items-center justify-between" style={{ fontFamily: f.value }}>
                  {f.label}
                  {data.fontFamily === f.id && <CheckCircle2 size={13} className="text-primary" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.form.assessmentMethods}</SectionTitle>
      <div className="space-y-2">
        {ASSESSMENT_METHODS.map((m) => (
          <label key={m.key} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox checked={!!data.methods[m.key]} onCheckedChange={(v) => set("methods", { ...data.methods, [m.key]: !!v })} />
            <span className="text-sm">{t.fbaTool.form[m.key] || m.label}</span>
          </label>
        ))}
      </div>
      <Field label={t.fbaTool.form.otherMethods}>
        <Input value={data.methodsOther} onChange={(e) => set("methodsOther", e.target.value)} placeholder={t.fbaTool.form.otherMethodsPlaceholder} />
      </Field>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.steps.supportingDocs}</SectionTitle>
      <InfoBox color="blue">
        Add documents from other professionals (educational psychologists, SALT, OT, paediatricians, school, etc.)
        that were reviewed as part of this assessment. Upload the file and/or summarise key findings to include in the report.
      </InfoBox>

      {data.supportingDocs.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No documents added yet.</p>
      )}

      {data.supportingDocs.map((doc, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-sky-50 border-sky-200 text-sky-700">Document {i + 1}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => set("supportingDocs", data.supportingDocs.filter((_, j) => j !== i))}>
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t.fbaTool.form.docTitle}>
                <Input value={doc.title} onChange={(e) => {
                  const arr = [...data.supportingDocs]; arr[i] = { ...arr[i], title: e.target.value }; set("supportingDocs", arr);
                }} placeholder="e.g. Educational Psychology Report — John Smith" />
              </Field>
              <Field label={t.fbaTool.form.docType}>
                <Select value={doc.docType} onValueChange={(v) => {
                  const arr = [...data.supportingDocs]; arr[i] = { ...arr[i], docType: v }; set("supportingDocs", arr);
                }}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.fbaTool.form.professional}>
                <Input value={doc.professional} onChange={(e) => {
                  const arr = [...data.supportingDocs]; arr[i] = { ...arr[i], professional: e.target.value }; set("supportingDocs", arr);
                }} placeholder="e.g. Dr. Sarah Jones, Educational Psychologist" />
              </Field>
              <Field label={t.fbaTool.form.docDate}>
                <Input type="date" value={doc.docDate} onChange={(e) => {
                  const arr = [...data.supportingDocs]; arr[i] = { ...arr[i], docDate: e.target.value }; set("supportingDocs", arr);
                }} />
              </Field>
            </div>
            <Field label={t.fbaTool.form.keyFindings}
              hint="Summarise or paste the key findings from this document that are relevant to this FBA">
              <Textarea rows={4} value={doc.keyFindings} onChange={(e) => {
                const arr = [...data.supportingDocs]; arr[i] = { ...arr[i], keyFindings: e.target.value }; set("supportingDocs", arr);
              }} placeholder={t.fbaTool.form.keyFindingsPlaceholder} />
            </Field>
            {/* File upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t.fbaTool.form.attachFile}</Label>
              {doc.fileUrl ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 size={14} />
                  <span>{doc.fileName}</span>
                  <button className="text-muted-foreground hover:text-destructive ml-1" onClick={() => {
                    const arr = [...data.supportingDocs];
                    arr[i] = { ...arr[i], fileUrl: undefined, fileName: undefined };
                    set("supportingDocs", arr);
                  }}><Trash2 size={12} /></button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground border border-dashed border-border rounded-lg p-2.5 hover:bg-muted/30 transition-colors">
                  {uploading[i] ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploading[i] ? "Uploading..." : "Click to upload PDF, DOC, or image"}</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(i, f); }} />
                </label>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" size="sm" className="gap-1.5"
        onClick={() => set("supportingDocs", [...data.supportingDocs, emptyDoc()])}>
        <Plus size={14} /> Add Document
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.steps.background}</SectionTitle>
      <InfoBox color="blue">
        Present the client as a person functioning competently given their circumstances (Goldiamond, 1974).
        Background informs the nonlinear analysis — how the current pattern was shaped reveals why it is a sensible response.
      </InfoBox>
      <Field label={t.fbaTool.form.background}>
        <Textarea rows={5} value={data.background} onChange={(e) => set("background", e.target.value)}
          placeholder="Living situation, family, medical/developmental history, prior assessments, cultural context..." />
      </Field>
      <Field label={t.fbaTool.form.environment}>
        <Textarea rows={4} value={data.environment} onChange={(e) => set("environment", e.target.value)}
          placeholder="Setting structure, routines, sensory environment, available resources, support in place..." />
      </Field>
      <Field label={t.fbaTool.form.supportStaff}>
        <Textarea rows={3} value={data.supportStaff} onChange={(e) => set("supportStaff", e.target.value)}
          placeholder="LSAs, teachers, therapists, family — roles and duration of involvement..." />
      </Field>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.steps.strengths}</SectionTitle>
      <InfoBox color="green">
        The constructional approach begins here. Strengths are the existing repertoires a programme builds upon.
        These are what make progress possible — not just positives, but foundations.
      </InfoBox>
      {data.strengths.map((s, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">Strength {i + 1}</Badge>
              {data.strengths.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("strengths", data.strengths.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label={t.fbaTool.form.strengthTitle}>
              <Input value={s.title} onChange={(e) => {
                const arr = [...data.strengths]; arr[i] = { ...arr[i], title: e.target.value }; set("strengths", arr);
              }} placeholder="e.g. Cognitive Foundations, Social Motivation, Family Support..." />
            </Field>
            <Field label={t.fbaTool.form.description}>
              <Textarea rows={3} value={s.description} onChange={(e) => {
                const arr = [...data.strengths]; arr[i] = { ...arr[i], description: e.target.value }; set("strengths", arr);
              }} placeholder="How this strength manifests and its relevance to the programme..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("strengths", [...data.strengths, emptyStrength()])}>
        <Plus size={14} /> {t.fbaTool.form.addStrength}
      </Button>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.steps.targetBehaviours}</SectionTitle>
      <InfoBox color="amber">
        Define each behaviour operationally — topography (what it looks like), not assumed cause.
        The behaviour is a competent adaptation to existing contingencies, not a pathology.
      </InfoBox>
      {data.behaviours.map((b, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">Behaviour {i + 1}</Badge>
              {data.behaviours.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("behaviours", data.behaviours.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label={t.fbaTool.form.behaviourName}>
              <Input value={b.name} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], name: e.target.value }; set("behaviours", arr);
              }} placeholder="e.g. Physical Aggression, Task Refusal, Verbal Outburst..." />
            </Field>
            <Field label="Topography (what it looks like, not why)">
              <Textarea rows={2} value={b.topography} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], topography: e.target.value }; set("behaviours", arr);
              }} placeholder="Specific physical form: hitting with open hand toward others' face, throwing objects, screaming words at volume louder than conversation..." />
            </Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label={t.fbaTool.form.frequency}><Input value={b.frequency} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], frequency: e.target.value }; set("behaviours", arr);
              }} placeholder="e.g. 3–5 × per day" /></Field>
              <Field label={t.fbaTool.form.intensity}><Input value={b.intensity} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], intensity: e.target.value }; set("behaviours", arr);
              }} placeholder="Mild / Moderate / Severe" /></Field>
              <Field label={t.fbaTool.form.duration}><Input value={b.duration} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], duration: e.target.value }; set("behaviours", arr);
              }} placeholder="e.g. 5–20 min" /></Field>
            </div>
            <Field label="Antecedents & Context">
              <Textarea rows={2} value={b.context} onChange={(e) => {
                const arr = [...data.behaviours]; arr[i] = { ...arr[i], context: e.target.value }; set("behaviours", arr);
              }} placeholder="Setting events, immediate triggers, who is present, what was happening beforehand..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("behaviours", [...data.behaviours, emptyBehaviour()])}>
        <Plus size={14} /> {t.fbaTool.form.addBehaviour}
      </Button>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-4">
      <SectionTitle>Constructional Interview — Goldiamond's Questionnaire</SectionTitle>
      <InfoBox color="blue">
        <strong>Goldiamond (1974):</strong> "The goal is not to ask about the problem but about where the client wants to go.
        The intervention is then designed to take the client there — using the very same contingencies that maintain the current pattern."
      </InfoBox>
      <Field label={t.fbaTool.form.cq1} hint={`"Assuming we were successful, what would the outcome be for you?" — verbatim.`}>
        <Textarea rows={4} value={data.cq_statedOutcome} onChange={(e) => set("cq_statedOutcome", e.target.value)}
          placeholder={`e.g. "I wouldn't be sent out of class. I'd have friends. My teacher would like me."`} />
      </Field>
      <Field label={t.fbaTool.form.cq2} hint={`"What would others observe when the outcome is achieved?"`}>
        <Textarea rows={4} value={data.cq_observedOutcome} onChange={(e) => set("cq_observedOutcome", e.target.value)}
          placeholder="Observable specifics: 'You would see him sitting at his desk, completing work, talking to peers at lunch...'" />
      </Field>
      <Field label={t.fbaTool.form.cq3} hint={`"How does the present situation differ from what you'd like?"`}>
        <Textarea rows={3} value={data.cq_currentState} onChange={(e) => set("cq_currentState", e.target.value)}
          placeholder="What is happening now that should be different?" />
      </Field>
      <Field label={t.fbaTool.form.cq4} hint="How was this pattern shaped? What events and contingencies led to it?">
        <Textarea rows={4} value={data.cq_historyOfPattern} onChange={(e) => set("cq_historyOfPattern", e.target.value)}
          placeholder="What experiences shaped the current pattern? When did it begin? What maintained it over time?" />
      </Field>
      <Field label={t.fbaTool.form.cq5} hint={`When is the problem less severe or absent? What is different about those times?`}>
        <Textarea rows={3} value={data.cq_conditionsWhenBetter} onChange={(e) => set("cq_conditionsWhenBetter", e.target.value)}
          placeholder="Settings, people, activities, or times when the challenging behaviour is reduced or absent..." />
      </Field>
      <Field label={t.fbaTool.form.cq6} hint={`"What related problems have you tackled successfully before?"`}>
        <Textarea rows={3} value={data.cq_whatHasWorked} onChange={(e) => set("cq_whatHasWorked", e.target.value)}
          placeholder="Past achievements and capacity for change. Interventions that had some success." />
      </Field>
      <Field label={t.fbaTool.form.cq7} hint="What would naturally maintain movement toward goals? (No extraneous reinforcers needed.)">
        <Textarea rows={3} value={data.cq_naturalReinforcer} onChange={(e) => set("cq_naturalReinforcer", e.target.value)}
          placeholder="What does the client gain as they progress? What is already available in the environment?" />
      </Field>
      <Field label="8. Systematic Approximations — Subgoals" hint="Stepping stones from current repertoire toward terminal outcomes. Small enough to ensure early success.">
        <Textarea rows={4} value={data.cq_subgoals} onChange={(e) => set("cq_subgoals", e.target.value)}
          placeholder="List incremental steps in order of proximity to current repertoire..." />
      </Field>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-4">
      <SectionTitle>ACT-Informed Assessment — Psychological Flexibility</SectionTitle>
      <InfoBox color="purple">
        <strong>Dixon et al. (2023):</strong> Once a client communicates about past/future and takes others' perspectives,
        a full functional analysis must account for how language interacts with contingencies.
        The Hexaflex provides a framework for assessing and targeting psychological flexibility processes.
      </InfoBox>
      <Field label={t.fbaTool.form.languageComplexity} hint="Candidate for ACT? Speaks about past/future? Perspective-taking? Metaphor? Empathy?">
        <Textarea rows={3} value={data.act_languageComplexity} onChange={(e) => set("act_languageComplexity", e.target.value)}
          placeholder="Language complexity: past/future references, empathy, metaphor, understanding jokes/irony..." />
      </Field>
      <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Hexaflex Processes</p>
        <Field label={t.fbaTool.form.presentMoment} hint="Contact with current experience vs. past/future preoccupation">
          <Textarea rows={2} value={data.act_presentMoment} onChange={(e) => set("act_presentMoment", e.target.value)}
            placeholder="Distractibility, attention quality, contact with present activity..." />
        </Field>
        <Field label={t.fbaTool.form.defusion} hint="Rigid entanglement with thoughts; repetitive formulations; arguing who is right">
          <Textarea rows={2} value={data.act_defusion} onChange={(e) => set("act_defusion", e.target.value)}
            placeholder="Observations of thought-action fusion, rigid rule-following, formulaic statements..." />
        </Field>
        <Field label={t.fbaTool.form.acceptance} hint="Willingness to experience discomfort; escape/avoidance patterns">
          <Textarea rows={2} value={data.act_acceptance} onChange={(e) => set("act_acceptance", e.target.value)}
            placeholder="Low frustration tolerance, escape-maintained patterns, suppression attempts..." />
        </Field>
        <Field label={t.fbaTool.form.selfAsContext} hint="Conceptualised self; perspective-taking ability; flexibility of identity">
          <Textarea rows={2} value={data.act_selfAsContext} onChange={(e) => set("act_selfAsContext", e.target.value)}
            placeholder="Rigid self-story, difficulty considering others' views, OR flexible empathy..." />
        </Field>
        <Field label={t.fbaTool.form.values} hint="What matters? Can they say why things are important? Heroes/guides? Actions beyond immediate reward?">
          <Textarea rows={2} value={data.act_values} onChange={(e) => set("act_values", e.target.value)}
            placeholder="Values clarity, ability to articulate what matters, presence of long-term motivation..." />
        </Field>
        <Field label={t.fbaTool.form.committedAction} hint="Values-consistent behaviour patterns; goal-directed vs. avoidance-driven">
          <Textarea rows={2} value={data.act_committedAction} onChange={(e) => set("act_committedAction", e.target.value)}
            placeholder="Persistence, delayed gratification capacity, patterns of habits and goal-directed work..." />
        </Field>
      </div>
      <Field label={t.fbaTool.form.statedValues}>
        <Textarea rows={3} value={data.act_statedValues} onChange={(e) => set("act_statedValues", e.target.value)}
          placeholder="What the client says matters to them: fairness, respect, friendships, sports, family, autonomy..." />
      </Field>
      <Field label={t.fbaTool.form.reinforcers}>
        <Textarea rows={2} value={data.act_reinforcers} onChange={(e) => set("act_reinforcers", e.target.value)}
          placeholder="High-preference activities, items, and interactions..." />
      </Field>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-4">
      <SectionTitle>{t.fbaTool.steps.directObservations}</SectionTitle>
      {data.observations.map((o, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">Session {o.sessionNumber}</Badge>
              {data.observations.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("observations", data.observations.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={o.date} onChange={(e) => {
                const arr = [...data.observations]; arr[i] = { ...arr[i], date: e.target.value }; set("observations", arr);
              }} /></Field>
              <Field label="Setting"><Input value={o.setting} onChange={(e) => {
                const arr = [...data.observations]; arr[i] = { ...arr[i], setting: e.target.value }; set("observations", arr);
              }} placeholder="e.g. Year 2 classroom / Choice Room" /></Field>
            </div>
            <Field label="Participants"><Input value={o.participants} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], participants: e.target.value }; set("observations", arr);
            }} placeholder="Client, LSA, teacher, assessor..." /></Field>
            <Field label="Purpose"><Textarea rows={2} value={o.purpose} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], purpose: e.target.value }; set("observations", arr);
            }} placeholder="What were you specifically assessing?" /></Field>
            <Field label="Observations (ABC format)"><Textarea rows={6} value={o.observations} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], observations: e.target.value }; set("observations", arr);
            }} placeholder="Chronological account. Include antecedents (A), behaviours (B), consequences (C), staff responses, strengths observed..." /></Field>
            <Field label="Analysis"><Textarea rows={3} value={o.analysis} onChange={(e) => {
              const arr = [...data.observations]; arr[i] = { ...arr[i], analysis: e.target.value }; set("observations", arr);
            }} placeholder="What patterns emerged? What does this add to the functional hypothesis?" /></Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5"
        onClick={() => set("observations", [...data.observations, emptyObs(data.observations.length + 1)])}>
        <Plus size={14} /> Add Session
      </Button>
    </div>
  );

  const renderStep10 = () => (
    <div className="space-y-4">
      <SectionTitle>Nonlinear Contingency Analysis — Hypotheses</SectionTitle>
      <InfoBox color="amber">
        <strong>Layng et al. (2022):</strong> Consider not just the consequences of the presenting behaviour,
        but the consequences of NOT doing it. This reveals that the behaviour is the rational outcome of available contingencies —
        "while the costs are often the focus, there are real benefits, especially measured against the alternatives."
      </InfoBox>
      {data.hypotheses.map((h, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">Hypothesis {i + 1}</Badge>
              {data.hypotheses.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => set("hypotheses", data.hypotheses.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            <Field label="Behaviour">
              <Input value={h.behaviour} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], behaviour: e.target.value }; set("hypotheses", arr);
              }} placeholder="Which target behaviour does this hypothesis address?" />
            </Field>
            <Field label={t.fbaTool.form.identifiedFunction}>
              <Select value={h.function} onValueChange={(v) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], function: v }; set("hypotheses", arr);
              }}>
                <SelectTrigger><SelectValue placeholder="Select function..." /></SelectTrigger>
                <SelectContent>
                  {BEHAVIOUR_FUNCTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Benefits of the Current Pattern" hint="What does this behaviour provide? What would be lost if it disappeared?">
              <Textarea rows={2} value={h.benefitsOfBehaviour} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], benefitsOfBehaviour: e.target.value }; set("hypotheses", arr);
              }} placeholder="e.g. Escape from demands; agency/control; access to preferred space; teacher attention..." />
            </Field>
            <Field label={t.fbaTool.form.costsOfAlternatives} hint="What happens if the client does NOT engage in this behaviour? Why isn't a 'better' alternative already occurring?">
              <Textarea rows={2} value={h.costsOfAlternatives} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], costsOfAlternatives: e.target.value }; set("hypotheses", arr);
              }} placeholder="e.g. Complying results in overwhelming demands / social approach leads to rejection / asking for help results in shame..." />
            </Field>
            <Field label="Hypothesis Statement">
              <Textarea rows={4} value={h.hypothesis} onChange={(e) => {
                const arr = [...data.hypotheses]; arr[i] = { ...arr[i], hypothesis: e.target.value }; set("hypotheses", arr);
              }} placeholder="When [antecedent], [name] engages in [behaviour] maintained by [function]. The nonlinear analysis indicates this is the rational outcome because..." />
            </Field>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("hypotheses", [...data.hypotheses, emptyHyp()])}>
        <Plus size={14} /> Add Hypothesis
      </Button>
    </div>
  );

  const renderStep11 = () => (
    <div className="space-y-4">
      <SectionTitle>Recommendations</SectionTitle>
      <InfoBox color="green">
        Constructional recommendations establish new repertoires — they do not eliminate old ones.
        Use the same reinforcers maintaining the current pattern to build the alternative.
        Progress toward the terminal goal IS the reinforcer (Goldiamond, 1974).
      </InfoBox>
      <Field label="Recommendations" hint="Environmental modifications; skill-building targets; reinforcement strategies; ACT components; staff guidance; monitoring plan.">
        <Textarea rows={14} value={data.recommendations} onChange={(e) => set("recommendations", e.target.value)}
          placeholder={`Structure around:\n• Environmental modifications (antecedent strategies)\n• Skill-building targets (systematic approximations)\n• Reinforcement strategies — natural reinforcers already maintaining current patterns\n• ACT components (values clarification, defusion, acceptance, committed action)\n• Staff/caregiver guidance\n• Monitoring and data collection plan\n• Review schedule`} />
      </Field>
      <Field label={t.fbaTool.form.additionalNotes}>
        <Textarea rows={4} value={data.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)}
          placeholder="Limitations of assessment, areas needing further investigation, urgent concerns, follow-up actions..." />
      </Field>
    </div>
  );

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4,
    5: renderStep5, 6: renderStep6, 7: renderStep7, 8: renderStep8,
    9: renderStep9, 10: renderStep10, 11: renderStep11,
  };

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />

      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-white/10 px-4 py-3">
        <div className="container max-w-6xl flex items-center gap-3">
          <Link to="/admin" className="text-white/60 hover:text-white transition-colors"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">{t.fbaTool.ui.title}</h1>
            <p className="text-white/50 text-[11px]">
              {t.fbaTool.ui.subtitle}
            </p>
          </div>
          {data.clientName && (
            <Badge className="ml-auto bg-white/10 text-white border-white/20 text-[11px]">{data.clientName}</Badge>
          )}
        </div>
      </div>

      <div className="container max-w-[1400px] py-6 px-4 md:px-6">
        <div className="flex gap-6 h-full">

          {/* Sidebar */}
          <div className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const active = step === s.id;
                const complete = isStepComplete(s.id, data);
                return (
                  <button key={s.id} onClick={() => setStep(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-start transition-all duration-200 text-[12px] font-medium
                      ${active ? "bg-primary text-white shadow-sm" : "text-muted-foreground/80 hover:bg-white/60 hover:text-foreground"}`}>
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {complete ? (
                      <CheckCircle2 size={13} className="ml-auto shrink-0 text-green-500" />
                    ) : (
                      <AlertTriangle size={13} className="ml-auto shrink-0 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content form */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <div className="xl:hidden mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
              {STEPS.map((s) => {
                const complete = isStepComplete(s.id, data);
                return (
                  <button key={s.id} onClick={() => setStep(s.id)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors shadow-sm border
                      ${step === s.id ? "bg-primary text-white border-primary" : complete ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {s.id}
                  </button>
                );
              })}
            </div>

            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div className="bg-white/90 backdrop-blur-sm border border-black/[0.06] rounded-2xl p-6 shadow-sm">
                {stepRenderers[step]?.()}
              </div>
            </motion.div>

            <div className="flex items-center justify-between mt-6 bg-white/50 backdrop-blur-md border border-neutral-200/60 p-3 rounded-xl shadow-sm">
              <Button variant="outline" onClick={prev} disabled={step === 1} className="gap-1.5 bg-white">
                <ChevronLeft size={14} /> {t.fbaTool.ui.back}
              </Button>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold">{t.fbaTool.ui.step} {step} {t.fbaTool.ui.of} {STEPS.length}</span>
                <span className="text-[10px] text-muted-foreground">{isStepComplete(step, data) ? t.fbaTool.ui.sectionComplete : t.fbaTool.ui.sectionIncomplete}</span>
              </div>
              <Button onClick={next} disabled={step === STEPS.length} className="gap-1.5">
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          {/* Persistent Live Preview */}
          <div className="hidden lg:flex flex-col w-[480px] shrink-0 sticky top-24" style={{ height: "calc(100vh - 120px)" }}>
            <div className="bg-white border text-sidebar-foreground rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col h-full overflow-hidden flex-1">
              {/* Preview Header */}
              <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="text-muted-foreground w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide">{t.fbaTool.ui.livePreview}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => {
                    if (window.confirm(t.fbaTool.ui.clearDraftConfirm)) {
                      setData(initialData); setStep(1);
                    }
                  }} className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive">
                    {t.fbaTool.ui.clearDraft}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAttachOpen(true)} className="h-7 text-[11px] gap-1.5">
                    <Paperclip size={13} /> Attach / Reopen
                  </Button>
                  <Button size="sm" onClick={handlePrint} className="h-7 text-[11px] gap-1.5 shadow-sm">
                    <Printer size={13} /> {t.fbaTool.ui.exportPdf}
                  </Button>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 bg-white relative overflow-hidden">
                <iframe
                  srcDoc={generateStyledHTML(
                    data, 
                    assessor, 
                    t, 
                    isRTL, 
                    ASSESSMENT_METHODS.filter(m => data.methods[m.key]).map(m => t.fbaTool.form[m.key] || m.label)
                  )}
                  className="w-full h-full border-0 absolute inset-0"
                  title="Live Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
      <FBAAttachDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        reportHtml={generateStyledHTML(data, assessor, t, isRTL, ASSESSMENT_METHODS.filter(m => data.methods[m.key]).map(m => t.fbaTool.form[m.key] || m.label))}
        reportData={data}
        clientNameHint={data.clientName}
        onClearDraft={() => { setData(initialData); setStep(1); localStorage.removeItem("fba-report-draft"); }}
        onLoadDraft={(d) => { setData(d as FBAData); setStep(1); }}
      />
      <Footer />
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-semibold text-foreground mb-1">{children}</h2>
);
const Field = ({ label, hint, children, className }: {
  label: string; hint?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label className="text-xs font-medium">{label}</Label>
    {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    {children}
  </div>
);
const InfoBox = ({ children, color }: { children: React.ReactNode; color: "blue"|"green"|"amber"|"purple" }) => {
  const cls = { blue: "bg-blue-50 border-blue-200 text-blue-700", green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700", purple: "bg-purple-50 border-purple-200 text-purple-700" }[color];
  return <div className={`rounded-lg border p-3 text-xs leading-relaxed ${cls}`}>{children}</div>;
};

export default FBAReportTool;
