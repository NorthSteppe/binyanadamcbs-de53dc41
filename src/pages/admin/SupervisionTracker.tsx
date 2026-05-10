import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ChevronRight, ChevronDown, Edit2, Save, X, Sparkles, ListPlus } from "lucide-react";
import { SUPERVISION_LEVELS, levelMeta, levelLabel, statusLabel, gapIcon, STATUSES, SupervisionLevel } from "@/lib/supervisionLevels";
import { DEFAULT_FRAMEWORK } from "@/lib/supervisionFramework";

type Competency = {
  id: string; supervisee_id: string; supervisor_id: string;
  parent_id: string | null; number: string; name: string;
  definition: string; domain: string; can_break_down: boolean; display_order: number;
};
type SeInput = { competency_id: string; observations_count: number; evidence: string; self_assessment_level: SupervisionLevel; notes: string };
type SvInput = { competency_id: string; final_level: SupervisionLevel; status: string; next_goal: string; notes: string };
type Journal = {
  id: string; supervisee_id: string; author_id: string; author_role: "supervisor" | "supervisee";
  entry_date: string; entry_type: string; related_competency_id: string | null;
  description: string; evidence: string; conclusion: string;
  supervisee_task: string; supervisor_task: string; next_check_date: string | null; notes: string;
};

const T = {
  en: {
    title: "Supervision Tracker", subtitle: "Define competencies, track progress, and journal alongside your supervisee.",
    supervisee: "Supervisee", noSupervisees: "No supervisees yet. Assign the supervisee role to a user first.",
    competencies: "Competencies", dashboard: "Dashboard", journal: "Shared Journal",
    add: "Add competency", loadFramework: "Load default UKBA framework", bulkAdd: "Bulk add",
    countFor: (n: number, name: string) => `${n} competencies for ${name}`,
    competency: "Competency", domain: "Domain", obs: "Obs", selfAssess: "Self assessment", supRating: "Supervisor rating", gap: "Gap", actions: "",
    nextGoal: "Next goal…", supNotes: "Supervisor notes…",
    none: "No competencies yet — load the default framework or add the first one.",
    addSubStep: "Add sub-step", edit: "Edit competency", addNew: "Add competency",
    number: "Number", name: "Name *", definition: "Definition", domainLabel: "Domain (e.g. Assessment, Ethics)",
    allowBreakdown: "Allow breaking into sub-steps", save: "Save", saved: "Saved", deleted: "Deleted",
    deleteConfirm: "Delete this competency and all sub-steps?",
    overallProgress: "Overall progress", total: "Total competencies", indep: "Independent or above",
    byLevel: "By level (supervisor rating)",
    bulkTitle: "Bulk add competencies",
    bulkHint: "One per line. Format: Number | Name | Domain | Definition (last two optional).",
    bulkExample: "1.5 | Crisis prevention | Assessment | Identify early signals before escalation.",
    parse: "Add all", cancel: "Cancel",
    frameworkLoaded: "Framework loaded — feel free to edit, remove or add to it.",
    loadConfirm: "Load the default framework? Existing competencies will be kept; new ones will be added.",
    newJournal: "New supervisor entry", date: "Date", type: "Type", related: "Related competency",
    typeMeeting: "Supervision meeting", typeObs: "Observation", typeDecision: "Professional decision", typeFb: "Feedback",
    descLabel: "Description / what happened", evidence: "Evidence reviewed", conclusion: "Decisions / conclusions",
    seTask: "Task for supervisee", svTask: "Task for supervisor", nextCheck: "Next check date",
    addEntry: "Add entry", noEntries: "No journal entries yet.",
    sup: "🟦 Supervisor", se: "🟢 Supervisee", noneOpt: "— none —",
  },
  he: {
    title: "מערכת הדרכה", subtitle: "הגדירו כשירויות, עקבו אחר התקדמות ותעדו יחד עם המודרך/ת.",
    supervisee: "מודרך/ת", noSupervisees: "אין עדיין מודרכים. הקצו תחילה את התפקיד 'מודרך' למשתמש.",
    competencies: "כשירויות", dashboard: "לוח מחוונים", journal: "יומן משותף",
    add: "הוסף כשירות", loadFramework: "טען מסגרת UKBA ברירת מחדל", bulkAdd: "הוספה מרובה",
    countFor: (n: number, name: string) => `${n} כשירויות עבור ${name}`,
    competency: "כשירות", domain: "תחום", obs: "תצפ׳", selfAssess: "הערכה עצמית", supRating: "דירוג המדריך", gap: "פער", actions: "",
    nextGoal: "יעד הבא…", supNotes: "הערות המדריך…",
    none: "אין עדיין כשירויות — טענו את המסגרת או הוסיפו את הראשונה.",
    addSubStep: "הוסף תת-שלב", edit: "עריכת כשירות", addNew: "הוספת כשירות",
    number: "מספר", name: "שם *", definition: "הגדרה", domainLabel: "תחום (לדוגמה: הערכה, אתיקה)",
    allowBreakdown: "אפשר חלוקה לתת-שלבים", save: "שמירה", saved: "נשמר", deleted: "נמחק",
    deleteConfirm: "למחוק את הכשירות הזו ואת כל תת-השלבים?",
    overallProgress: "התקדמות כוללת", total: "סך כשירויות", indep: "עצמאי ומעלה",
    byLevel: "לפי רמה (דירוג המדריך)",
    bulkTitle: "הוספה מרובה של כשירויות",
    bulkHint: "שורה לכל פריט. פורמט: מספר | שם | תחום | הגדרה (שני האחרונים אופציונליים).",
    bulkExample: "1.5 | מניעת משבר | הערכה | זיהוי סימנים מוקדמים לפני הסלמה.",
    parse: "הוסף את כולם", cancel: "ביטול",
    frameworkLoaded: "המסגרת נטענה — אפשר לערוך, למחוק או להוסיף בחופשיות.",
    loadConfirm: "לטעון את מסגרת ברירת המחדל? כשירויות קיימות יישארו; חדשות יתווספו.",
    newJournal: "ערך חדש מאת המדריך", date: "תאריך", type: "סוג", related: "כשירות מקושרת",
    typeMeeting: "פגישת הדרכה", typeObs: "תצפית", typeDecision: "החלטה מקצועית", typeFb: "משוב",
    descLabel: "תיאור / מה קרה", evidence: "ראיות שנבחנו", conclusion: "החלטות / מסקנות",
    seTask: "משימה למודרך/ת", svTask: "משימה למדריך", nextCheck: "תאריך מעקב",
    addEntry: "הוסף ערך", noEntries: "אין עדיין ערכי יומן.",
    sup: "🟦 מדריך", se: "🟢 מודרך/ת", noneOpt: "— ללא —",
  },
};

const blankCompetency = (): Partial<Competency> => ({
  number: "", name: "", definition: "", domain: "", can_break_down: false, display_order: 0,
});

const SupervisionTrackerAdmin = () => {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const t = T[language === "he" ? "he" : "en"];

  const [supervisees, setSupervisees] = useState<{ id: string; full_name: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [seInputs, setSeInputs] = useState<Record<string, SeInput>>({});
  const [svInputs, setSvInputs] = useState<Record<string, SvInput>>({});
  const [journal, setJournal] = useState<Journal[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [editing, setEditing] = useState<Partial<Competency> | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [newJournal, setNewJournal] = useState<Partial<Journal>>({ entry_type: "supervision_meeting", entry_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "supervisee");
      const ids = (roles || []).map((r) => r.user_id);
      if (!ids.length) { setSupervisees([]); return; }
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setSupervisees((profs || []) as any);
      if (profs && profs.length && !activeId) setActiveId(profs[0].id);
    })();
  }, []);

  const loadAll = async (sid: string) => {
    const [c, se, sv, j] = await Promise.all([
      supabase.from("supervision_competencies").select("*").eq("supervisee_id", sid).order("number"),
      supabase.from("supervision_supervisee_input").select("*").eq("supervisee_id", sid),
      supabase.from("supervision_supervisor_input").select("*").eq("supervisee_id", sid),
      supabase.from("supervision_journal").select("*").eq("supervisee_id", sid).order("entry_date", { ascending: false }),
    ]);
    setCompetencies((c.data || []) as any);
    const seMap: Record<string, SeInput> = {};
    (se.data || []).forEach((r: any) => { seMap[r.competency_id] = r; });
    setSeInputs(seMap);
    const svMap: Record<string, SvInput> = {};
    (sv.data || []).forEach((r: any) => { svMap[r.competency_id] = r; });
    setSvInputs(svMap);
    setJournal((j.data || []) as any);
  };

  useEffect(() => { if (activeId) loadAll(activeId); }, [activeId]);

  const tree = useMemo(() => {
    const roots = competencies.filter((c) => !c.parent_id);
    const childrenOf = (id: string) => competencies.filter((c) => c.parent_id === id);
    return { roots, childrenOf };
  }, [competencies]);

  const overallProgress = useMemo(() => {
    if (!competencies.length) return 0;
    const total = competencies.reduce((s, c) => s + levelMeta(svInputs[c.id]?.final_level || "not_started").score, 0);
    return Math.round((total / (competencies.length * 4)) * 100);
  }, [competencies, svInputs]);

  const saveCompetency = async () => {
    if (!editing || !editing.name || !activeId || !user) return;
    const payload: any = {
      supervisee_id: activeId, supervisor_id: user.id,
      parent_id: editing.parent_id || null,
      number: editing.number || "", name: editing.name,
      definition: editing.definition || "", domain: editing.domain || "",
      can_break_down: !!editing.can_break_down,
      display_order: editing.display_order || competencies.length,
    };
    let err;
    if (editing.id) ({ error: err } = await supabase.from("supervision_competencies").update(payload).eq("id", editing.id));
    else ({ error: err } = await supabase.from("supervision_competencies").insert(payload));
    if (err) toast.error(err.message); else { toast.success(t.saved); setEditing(null); loadAll(activeId); }
  };

  const deleteCompetency = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    const { error } = await supabase.from("supervision_competencies").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success(t.deleted); loadAll(activeId); }
  };

  const loadFramework = async () => {
    if (!activeId || !user) return;
    if (!confirm(t.loadConfirm)) return;
    const existingNumbers = new Set(competencies.map((c) => c.number));
    // Insert parents first to obtain ids, then children with parent_id mapping
    const parents = DEFAULT_FRAMEWORK.filter((f) => !f.parent_number && !existingNumbers.has(f.number));
    const numberToId: Record<string, string> = {};
    competencies.forEach((c) => { numberToId[c.number] = c.id; });

    if (parents.length) {
      const { data, error } = await supabase.from("supervision_competencies").insert(
        parents.map((p, i) => ({
          supervisee_id: activeId, supervisor_id: user.id, parent_id: null,
          number: p.number, name: language === "he" ? p.name_he : p.name,
          definition: language === "he" ? p.definition_he : p.definition,
          domain: language === "he" ? p.domain_he : p.domain,
          can_break_down: p.can_break_down ?? true, display_order: i,
        }))
      ).select("id, number");
      if (error) { toast.error(error.message); return; }
      (data || []).forEach((r: any) => { numberToId[r.number] = r.id; });
    }

    const children = DEFAULT_FRAMEWORK.filter((f) => f.parent_number && !existingNumbers.has(f.number));
    if (children.length) {
      const { error } = await supabase.from("supervision_competencies").insert(
        children.map((c, i) => ({
          supervisee_id: activeId, supervisor_id: user.id,
          parent_id: numberToId[c.parent_number!] || null,
          number: c.number, name: language === "he" ? c.name_he : c.name,
          definition: language === "he" ? c.definition_he : c.definition,
          domain: language === "he" ? c.domain_he : c.domain,
          can_break_down: c.can_break_down ?? false, display_order: 100 + i,
        }))
      );
      if (error) { toast.error(error.message); return; }
    }
    toast.success(t.frameworkLoaded);
    loadAll(activeId);
  };

  const bulkAdd = async () => {
    if (!activeId || !user) return;
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const rows = lines.map((line, i) => {
      const [num, name, domain, def] = line.split("|").map((x) => (x || "").trim());
      return {
        supervisee_id: activeId, supervisor_id: user.id, parent_id: null,
        number: num || "", name: name || num || `#${i + 1}`,
        definition: def || "", domain: domain || "",
        can_break_down: true, display_order: competencies.length + i,
      };
    });
    const { error } = await supabase.from("supervision_competencies").insert(rows);
    if (error) toast.error(error.message);
    else { toast.success(`+${rows.length}`); setBulkText(""); setBulkOpen(false); loadAll(activeId); }
  };

  const upsertSv = async (compId: string, patch: Partial<SvInput>) => {
    const existing = svInputs[compId];
    const merged: any = {
      competency_id: compId, supervisee_id: activeId,
      final_level: existing?.final_level || "not_started",
      status: existing?.status || "in_progress",
      next_goal: existing?.next_goal || "", notes: existing?.notes || "",
      updated_by: user?.id, ...patch,
    };
    setSvInputs((p) => ({ ...p, [compId]: { ...(existing || merged), ...patch } as SvInput }));
    const { error } = await supabase.from("supervision_supervisor_input").upsert(merged, { onConflict: "competency_id" });
    if (error) toast.error(error.message);
  };

  const addJournal = async () => {
    if (!activeId || !user || !newJournal.description) { toast.error(t.descLabel); return; }
    const { error } = await supabase.from("supervision_journal").insert({
      supervisee_id: activeId, author_id: user.id, author_role: "supervisor",
      entry_date: newJournal.entry_date || new Date().toISOString().slice(0, 10),
      entry_type: newJournal.entry_type || "supervision_meeting",
      related_competency_id: newJournal.related_competency_id || null,
      description: newJournal.description || "", evidence: newJournal.evidence || "",
      conclusion: newJournal.conclusion || "",
      supervisee_task: newJournal.supervisee_task || "", supervisor_task: newJournal.supervisor_task || "",
      next_check_date: newJournal.next_check_date || null, notes: newJournal.notes || "",
    } as any);
    if (error) toast.error(error.message);
    else { toast.success(t.saved); setNewJournal({ entry_type: "supervision_meeting", entry_date: new Date().toISOString().slice(0, 10) }); loadAll(activeId); }
  };

  // Compact level chips for fast filling
  const LevelChips = ({ value, onChange }: { value: SupervisionLevel; onChange: (v: SupervisionLevel) => void }) => (
    <div className="flex flex-wrap gap-1">
      {SUPERVISION_LEVELS.map((l) => {
        const active = value === l.value;
        return (
          <button key={l.value} type="button" onClick={() => onChange(l.value)}
            className={`px-2 py-0.5 rounded-full text-[11px] border transition ${active ? "text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
            style={active ? { background: l.color, borderColor: l.color } : { borderColor: "hsl(var(--border))" }}>
            {levelLabel(l.value, language as any)}
          </button>
        );
      })}
    </div>
  );

  const renderRow = (c: Competency, depth = 0) => {
    const se = seInputs[c.id];
    const sv = svInputs[c.id];
    const kids = tree.childrenOf(c.id);
    const isOpen = expanded[c.id] ?? true;
    const padStyle = isRTL ? { paddingRight: 12 + depth * 20 } : { paddingLeft: 12 + depth * 20 };
    return (
      <div key={c.id} dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid grid-cols-12 gap-2 items-start py-3 px-3 border-b text-sm" dir={isRTL ? "rtl" : "ltr"} style={padStyle}>
          <div className="col-span-4 flex items-start gap-2">
            {kids.length > 0 ? (
              <button onClick={() => setExpanded((p) => ({ ...p, [c.id]: !isOpen }))} className="mt-0.5">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />}
              </button>
            ) : <span className="w-3.5" />}
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                <span className="font-medium">{c.name}</span>
                {c.domain && <Badge variant="outline" className="text-[10px]">{c.domain}</Badge>}
              </div>
              {c.definition && <p className="text-xs text-muted-foreground mt-0.5">{c.definition}</p>}
            </div>
          </div>

          <div className="col-span-1 text-center pt-1 text-xs tabular-nums">{se?.observations_count ?? 0}</div>

          <div className="col-span-2 pt-0.5">
            <div className="text-[10px] text-muted-foreground mb-1">{t.selfAssess}</div>
            <Badge variant="outline" style={{ color: levelMeta(se?.self_assessment_level || "not_started").color }}>
              {levelLabel(se?.self_assessment_level || "not_started", language as any)}
            </Badge>
          </div>

          <div className="col-span-3 pt-0.5">
            <div className="text-[10px] text-muted-foreground mb-1">{t.supRating}</div>
            <LevelChips value={(sv?.final_level || "not_started") as SupervisionLevel} onChange={(v) => upsertSv(c.id, { final_level: v })} />
          </div>

          <div className="col-span-1 text-center pt-3 text-lg" title={t.gap}>
            {gapIcon(se?.self_assessment_level, sv?.final_level)}
          </div>

          <div className="col-span-1 pt-0.5">
            <Select value={sv?.status || "in_progress"} onValueChange={(v) => upsertSv(c.id, { status: v })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{statusLabel(s.value, language as any)}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="col-span-12 grid grid-cols-12 gap-2 mt-1">
            <Input className="col-span-5 h-8 text-xs" placeholder={t.nextGoal} defaultValue={sv?.next_goal || ""}
              onBlur={(e) => upsertSv(c.id, { next_goal: e.target.value })} />
            <Input className="col-span-5 h-8 text-xs" placeholder={t.supNotes} defaultValue={sv?.notes || ""}
              onBlur={(e) => upsertSv(c.id, { notes: e.target.value })} />
            <div className="col-span-2 flex justify-end gap-1">
              {c.can_break_down && (
                <Button size="icon" variant="ghost" className="h-7 w-7" title={t.addSubStep}
                  onClick={() => setEditing({ ...blankCompetency(), parent_id: c.id, number: `${c.number}.${kids.length + 1}`, domain: c.domain })}>
                  <Plus size={13} />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(c)}><Edit2 size={13} /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteCompetency(c.id)}><Trash2 size={13} /></Button>
            </div>
          </div>
        </div>
        {isOpen && kids.map((k) => renderRow(k, depth + 1))}
      </div>
    );
  };

  const activeName = supervisees.find((s) => s.id === activeId)?.full_name || "";

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="ms-auto min-w-[260px]">
            <Label className="text-xs">{t.supervisee}</Label>
            <Select value={activeId} onValueChange={setActiveId}>
              <SelectTrigger><SelectValue placeholder={t.supervisee} /></SelectTrigger>
              <SelectContent>
                {supervisees.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!activeId ? (
          <div className="border rounded-lg p-12 text-center text-muted-foreground">{t.noSupervisees}</div>
        ) : (
          <Tabs defaultValue="competencies" dir={isRTL ? "rtl" : "ltr"}>
            <TabsList>
              <TabsTrigger value="competencies">{t.competencies}</TabsTrigger>
              <TabsTrigger value="dashboard">{t.dashboard}</TabsTrigger>
              <TabsTrigger value="journal">{t.journal}</TabsTrigger>
            </TabsList>

            <TabsContent value="competencies" className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="text-sm text-muted-foreground">{t.countFor(competencies.length, activeName)}</div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={loadFramework}><Sparkles size={14} className="me-1" /> {t.loadFramework}</Button>
                  <Button variant="outline" onClick={() => setBulkOpen((v) => !v)}><ListPlus size={14} className="me-1" /> {t.bulkAdd}</Button>
                  <Button onClick={() => setEditing(blankCompetency())}><Plus size={14} className="me-1" /> {t.add}</Button>
                </div>
              </div>

              {bulkOpen && (
                <div className="border rounded-lg p-4 space-y-2 bg-muted/40">
                  <h3 className="font-semibold text-sm">{t.bulkTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.bulkHint}</p>
                  <Textarea rows={6} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={t.bulkExample} className="font-mono text-xs" />
                  <div className="flex gap-2">
                    <Button onClick={bulkAdd}>{t.parse}</Button>
                    <Button variant="ghost" onClick={() => { setBulkOpen(false); setBulkText(""); }}>{t.cancel}</Button>
                  </div>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted text-xs font-medium uppercase" dir={isRTL ? "rtl" : "ltr"}>
                  <div className="col-span-4">{t.competency}</div>
                  <div className="col-span-1 text-center">{t.obs}</div>
                  <div className="col-span-2">{t.selfAssess}</div>
                  <div className="col-span-3">{t.supRating}</div>
                  <div className="col-span-1 text-center">{t.gap}</div>
                  <div className="col-span-1"></div>
                </div>
                {tree.roots.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">{t.none}</div>}
                {tree.roots.map((c) => renderRow(c))}
              </div>

              {editing && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{editing.id ? t.edit : (editing.parent_id ? t.addSubStep : t.addNew)}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X size={14} /></Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><Label>{t.number}</Label><Input value={editing.number || ""} onChange={(e) => setEditing({ ...editing, number: e.target.value })} placeholder="1.1" /></div>
                    <div className="sm:col-span-2"><Label>{t.name}</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                    <div className="sm:col-span-3"><Label>{t.definition}</Label><Textarea rows={2} value={editing.definition || ""} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} /></div>
                    <div><Label>{t.domainLabel}</Label><Input value={editing.domain || ""} onChange={(e) => setEditing({ ...editing, domain: e.target.value })} /></div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox id="bd" checked={!!editing.can_break_down} onCheckedChange={(v) => setEditing({ ...editing, can_break_down: !!v })} />
                      <Label htmlFor="bd" className="cursor-pointer">{t.allowBreakdown}</Label>
                    </div>
                  </div>
                  <div className="flex gap-2"><Button onClick={saveCompetency}><Save size={14} className="me-1" /> {t.save}</Button></div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">{t.overallProgress}</div>
                  <div className="text-3xl font-bold mt-2">{overallProgress}%</div>
                  <Progress value={overallProgress} className="mt-3" />
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">{t.total}</div>
                  <div className="text-3xl font-bold mt-2">{competencies.length}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">{t.indep}</div>
                  <div className="text-3xl font-bold mt-2">
                    {competencies.filter((c) => levelMeta(svInputs[c.id]?.final_level || "not_started").score >= 3).length}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">{t.byLevel}</h3>
                {SUPERVISION_LEVELS.map((l) => {
                  const count = competencies.filter((c) => (svInputs[c.id]?.final_level || "not_started") === l.value).length;
                  const pct = competencies.length ? (count / competencies.length) * 100 : 0;
                  return (
                    <div key={l.value} className="flex items-center gap-3 text-sm">
                      <div className="w-44">{levelLabel(l.value, language as any)}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, background: l.color }} />
                      </div>
                      <div className="w-10 text-end tabular-nums">{count}</div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="journal" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
                <h3 className="font-semibold">{t.newJournal}</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><Label>{t.date}</Label><Input type="date" value={newJournal.entry_date || ""} onChange={(e) => setNewJournal({ ...newJournal, entry_date: e.target.value })} /></div>
                  <div>
                    <Label>{t.type}</Label>
                    <Select value={newJournal.entry_type || "supervision_meeting"} onValueChange={(v) => setNewJournal({ ...newJournal, entry_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supervision_meeting">{t.typeMeeting}</SelectItem>
                        <SelectItem value="observation">{t.typeObs}</SelectItem>
                        <SelectItem value="decision">{t.typeDecision}</SelectItem>
                        <SelectItem value="feedback">{t.typeFb}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.related}</Label>
                    <Select value={newJournal.related_competency_id || "none"} onValueChange={(v) => setNewJournal({ ...newJournal, related_competency_id: v === "none" ? null : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t.noneOpt}</SelectItem>
                        {competencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.number} {c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>{t.descLabel}</Label><Textarea rows={2} value={newJournal.description || ""} onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>{t.evidence}</Label><Textarea rows={2} value={newJournal.evidence || ""} onChange={(e) => setNewJournal({ ...newJournal, evidence: e.target.value })} /></div>
                  <div><Label>{t.conclusion}</Label><Textarea rows={2} value={newJournal.conclusion || ""} onChange={(e) => setNewJournal({ ...newJournal, conclusion: e.target.value })} /></div>
                  <div><Label>{t.seTask}</Label><Textarea rows={2} value={newJournal.supervisee_task || ""} onChange={(e) => setNewJournal({ ...newJournal, supervisee_task: e.target.value })} /></div>
                  <div><Label>{t.svTask}</Label><Textarea rows={2} value={newJournal.supervisor_task || ""} onChange={(e) => setNewJournal({ ...newJournal, supervisor_task: e.target.value })} /></div>
                  <div><Label>{t.nextCheck}</Label><Input type="date" value={newJournal.next_check_date || ""} onChange={(e) => setNewJournal({ ...newJournal, next_check_date: e.target.value })} /></div>
                </div>
                <Button onClick={addJournal}><Plus size={14} className="me-1" /> {t.addEntry}</Button>
              </div>

              <div className="space-y-2">
                {journal.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">{t.noEntries}</div>}
                {journal.map((j) => {
                  const c = competencies.find((x) => x.id === j.related_competency_id);
                  return (
                    <div key={j.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={j.author_role === "supervisor" ? "default" : "secondary"}>
                          {j.author_role === "supervisor" ? t.sup : t.se}
                        </Badge>
                        <Badge variant="outline">{j.entry_type}</Badge>
                        <span className="text-xs text-muted-foreground">{j.entry_date}</span>
                        {c && <span className="text-xs text-muted-foreground">· {c.number} {c.name}</span>}
                        {j.next_check_date && <span className="text-xs text-muted-foreground ms-auto">{t.nextCheck}: {j.next_check_date}</span>}
                      </div>
                      {j.description && <p className="text-sm">{j.description}</p>}
                      {(j.evidence || j.conclusion) && (
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {j.evidence && <div><div className="font-medium">{t.evidence}</div><div className="text-muted-foreground">{j.evidence}</div></div>}
                          {j.conclusion && <div><div className="font-medium">{t.conclusion}</div><div className="text-muted-foreground">{j.conclusion}</div></div>}
                        </div>
                      )}
                      {(j.supervisee_task || j.supervisor_task) && (
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {j.supervisee_task && <div><div className="font-medium">{t.seTask}</div><div className="text-muted-foreground">{j.supervisee_task}</div></div>}
                          {j.supervisor_task && <div><div className="font-medium">{t.svTask}</div><div className="text-muted-foreground">{j.supervisor_task}</div></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SupervisionTrackerAdmin;
