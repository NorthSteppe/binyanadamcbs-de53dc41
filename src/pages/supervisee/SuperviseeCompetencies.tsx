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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, ChevronRight, ChevronDown, Minus } from "lucide-react";
import { SUPERVISION_LEVELS, levelMeta, levelLabel, statusLabel, gapIcon, SupervisionLevel } from "@/lib/supervisionLevels";

type Competency = { id: string; parent_id: string | null; number: string; name: string; definition: string; domain: string; can_break_down: boolean; };
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
    title: "My Supervision Competencies",
    subtitle: "Track your observations, evidence, and self-assessment alongside your supervisor's evaluations.",
    selfProgress: "My self-assessed progress", competencies: "Competencies", obsLogged: "Total observations logged",
    none: "Your supervisor hasn't added competencies yet.",
    journal: "Shared Journal",
    myObs: "My observations", mySelf: "My self-assessment", supervisor: "Supervisor", gap: "Gap", status: "Status",
    myEvidence: "My evidence", supGoal: "Supervisor's next goal for me", noGoal: "— no goal set yet —",
    newEntry: "New entry", date: "Date", type: "Type", related: "Related competency",
    typeObs: "Field observation", typeEvent: "Event", typeRefl: "Reflection", typeEv: "Evidence log",
    desc: "What happened", evidence: "Evidence attached / link", conclusion: "What I learned",
    add: "Add entry", noJournal: "No entries yet.", noneOpt: "— none —",
    sup: "🟦 Supervisor", me: "🟢 Me",
    taskMe: "Task for me", taskSv: "Task for supervisor",
  },
  he: {
    title: "הכשירויות שלי",
    subtitle: "עקוב/י אחר התצפיות, הראיות והערכה העצמית שלך לצד הערכות המדריך/ה.",
    selfProgress: "התקדמות לפי הערכה עצמית", competencies: "כשירויות", obsLogged: "סך תצפיות שתועדו",
    none: "המדריך/ה עדיין לא הוסיפ/ה כשירויות.",
    journal: "יומן משותף",
    myObs: "התצפיות שלי", mySelf: "הערכה עצמית", supervisor: "מדריך/ה", gap: "פער", status: "סטטוס",
    myEvidence: "הראיות שלי", supGoal: "היעד הבא שלי מהמדריך/ה", noGoal: "— טרם נקבע יעד —",
    newEntry: "ערך חדש", date: "תאריך", type: "סוג", related: "כשירות מקושרת",
    typeObs: "תצפית בשטח", typeEvent: "אירוע", typeRefl: "רפלקציה", typeEv: "תיעוד ראיות",
    desc: "מה קרה", evidence: "ראיה מצורפת / קישור", conclusion: "מה למדתי",
    add: "הוסף ערך", noJournal: "אין עדיין ערכים.", noneOpt: "— ללא —",
    sup: "🟦 מדריך/ה", me: "🟢 אני",
    taskMe: "משימה עבורי", taskSv: "משימה למדריך/ה",
  },
};

const SuperviseeCompetencies = () => {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const t = T[language === "he" ? "he" : "en"];

  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [seInputs, setSeInputs] = useState<Record<string, SeInput>>({});
  const [svInputs, setSvInputs] = useState<Record<string, SvInput>>({});
  const [journal, setJournal] = useState<Journal[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newJournal, setNewJournal] = useState<Partial<Journal>>({ entry_type: "observation", entry_date: new Date().toISOString().slice(0, 10) });

  const loadAll = async () => {
    if (!user) return;
    const [c, se, sv, j] = await Promise.all([
      supabase.from("supervision_competencies").select("*").eq("supervisee_id", user.id).order("number"),
      supabase.from("supervision_supervisee_input").select("*").eq("supervisee_id", user.id),
      supabase.from("supervision_supervisor_input").select("*").eq("supervisee_id", user.id),
      supabase.from("supervision_journal").select("*").eq("supervisee_id", user.id).order("entry_date", { ascending: false }),
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
  useEffect(() => { loadAll(); }, [user]);

  const tree = useMemo(() => {
    const roots = competencies.filter((c) => !c.parent_id);
    const childrenOf = (id: string) => competencies.filter((c) => c.parent_id === id);
    return { roots, childrenOf };
  }, [competencies]);

  const overall = useMemo(() => {
    if (!competencies.length) return 0;
    const total = competencies.reduce((s, c) => s + levelMeta(seInputs[c.id]?.self_assessment_level || "not_started").score, 0);
    return Math.round((total / (competencies.length * 4)) * 100);
  }, [competencies, seInputs]);

  const upsertSe = async (compId: string, patch: Partial<SeInput>) => {
    const existing = seInputs[compId];
    const merged: any = {
      competency_id: compId, supervisee_id: user!.id,
      observations_count: existing?.observations_count || 0,
      evidence: existing?.evidence || "",
      self_assessment_level: existing?.self_assessment_level || "not_started",
      notes: existing?.notes || "", ...patch,
    };
    setSeInputs((p) => ({ ...p, [compId]: { ...(existing || merged), ...patch } as SeInput }));
    const { error } = await supabase.from("supervision_supervisee_input").upsert(merged, { onConflict: "competency_id" });
    if (error) toast.error(error.message);
  };

  const addJournal = async () => {
    if (!user || !newJournal.description) { toast.error(t.desc); return; }
    const { error } = await supabase.from("supervision_journal").insert({
      supervisee_id: user.id, author_id: user.id, author_role: "supervisee",
      entry_date: newJournal.entry_date || new Date().toISOString().slice(0, 10),
      entry_type: newJournal.entry_type || "observation",
      related_competency_id: newJournal.related_competency_id || null,
      description: newJournal.description || "", evidence: newJournal.evidence || "",
      conclusion: newJournal.conclusion || "", notes: newJournal.notes || "",
      supervisee_task: "", supervisor_task: "", next_check_date: null,
    } as any);
    if (error) toast.error(error.message);
    else { setNewJournal({ entry_type: "observation", entry_date: new Date().toISOString().slice(0, 10) }); loadAll(); }
  };

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
    const obsCount = se?.observations_count ?? 0;
    return (
      <div key={c.id} dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid grid-cols-12 gap-2 items-start py-3 px-3 border-b text-sm" dir={isRTL ? "rtl" : "ltr"} style={padStyle}>
          <div className="col-span-12 sm:col-span-4 flex items-start gap-2">
            {kids.length > 0 ? (
              <button onClick={() => setExpanded((p) => ({ ...p, [c.id]: !isOpen }))} className="mt-1">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />}
              </button>
            ) : <span className="w-3.5" />}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                <span className="font-medium">{c.name}</span>
                {c.domain && <Badge variant="outline" className="text-[10px]">{c.domain}</Badge>}
              </div>
              {c.definition && <p className="text-xs text-muted-foreground mt-1">{c.definition}</p>}
            </div>
          </div>

          <div className="col-span-6 sm:col-span-2">
            <Label className="text-[10px] uppercase">{t.myObs}</Label>
            <div className="flex items-center gap-1 mt-0.5">
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => upsertSe(c.id, { observations_count: Math.max(0, obsCount - 1) })}><Minus size={12} /></Button>
              <div className="w-9 text-center text-sm tabular-nums">{obsCount}</div>
              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => upsertSe(c.id, { observations_count: obsCount + 1 })}><Plus size={12} /></Button>
            </div>
          </div>

          <div className="col-span-6 sm:col-span-3">
            <Label className="text-[10px] uppercase">{t.mySelf}</Label>
            <LevelChips value={(se?.self_assessment_level || "not_started") as SupervisionLevel} onChange={(v) => upsertSe(c.id, { self_assessment_level: v })} />
          </div>

          <div className="col-span-6 sm:col-span-2">
            <Label className="text-[10px] uppercase">{t.supervisor}</Label>
            <div className="h-7 flex items-center text-xs">
              <Badge variant="outline" style={{ color: levelMeta(sv?.final_level || "not_started").color }}>
                {levelLabel(sv?.final_level || "not_started", language as any)}
              </Badge>
            </div>
          </div>

          <div className="col-span-3 sm:col-span-1 text-center">
            <Label className="text-[10px] uppercase">{t.gap}</Label>
            <div className="text-lg">{gapIcon(se?.self_assessment_level, sv?.final_level)}</div>
          </div>

          <div className="col-span-12 grid sm:grid-cols-2 gap-3 mt-1">
            <div>
              <Label className="text-[10px] uppercase">{t.myEvidence}</Label>
              <Textarea rows={2} className="text-xs" defaultValue={se?.evidence || ""}
                onBlur={(e) => upsertSe(c.id, { evidence: e.target.value })} />
            </div>
            <div>
              <Label className="text-[10px] uppercase">{t.supGoal}</Label>
              <div className="text-xs p-2 rounded bg-muted/50 min-h-[60px]">{sv?.next_goal || <span className="text-muted-foreground">{t.noGoal}</span>}</div>
            </div>
          </div>
        </div>
        {isOpen && kids.map((k) => renderRow(k, depth + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="container max-w-7xl pt-28 pb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase">{t.selfProgress}</div>
            <div className="text-3xl font-bold mt-2">{overall}%</div>
            <Progress value={overall} className="mt-3" />
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase">{t.competencies}</div>
            <div className="text-3xl font-bold mt-2">{competencies.length}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase">{t.obsLogged}</div>
            <div className="text-3xl font-bold mt-2">{Object.values(seInputs).reduce((s, r) => s + (r.observations_count || 0), 0)}</div>
          </div>
        </div>

        <Tabs defaultValue="competencies" dir={isRTL ? "rtl" : "ltr"}>
          <TabsList>
            <TabsTrigger value="competencies">{t.competencies}</TabsTrigger>
            <TabsTrigger value="journal">{t.journal}</TabsTrigger>
          </TabsList>

          <TabsContent value="competencies">
            <div className="border rounded-lg overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
              {tree.roots.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t.none}</div>}
              {tree.roots.map((c) => renderRow(c))}
            </div>
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
              <h3 className="font-semibold">{t.newEntry}</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><Label>{t.date}</Label><Input type="date" value={newJournal.entry_date || ""} onChange={(e) => setNewJournal({ ...newJournal, entry_date: e.target.value })} /></div>
                <div>
                  <Label>{t.type}</Label>
                  <Select value={newJournal.entry_type || "observation"} onValueChange={(v) => setNewJournal({ ...newJournal, entry_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observation">{t.typeObs}</SelectItem>
                      <SelectItem value="event">{t.typeEvent}</SelectItem>
                      <SelectItem value="reflection">{t.typeRefl}</SelectItem>
                      <SelectItem value="evidence">{t.typeEv}</SelectItem>
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
              <div><Label>{t.desc}</Label><Textarea rows={2} value={newJournal.description || ""} onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>{t.evidence}</Label><Textarea rows={2} value={newJournal.evidence || ""} onChange={(e) => setNewJournal({ ...newJournal, evidence: e.target.value })} /></div>
                <div><Label>{t.conclusion}</Label><Textarea rows={2} value={newJournal.conclusion || ""} onChange={(e) => setNewJournal({ ...newJournal, conclusion: e.target.value })} /></div>
              </div>
              <Button onClick={addJournal}><Plus size={14} className="me-1" /> {t.add}</Button>
            </div>

            <div className="space-y-2">
              {journal.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">{t.noJournal}</div>}
              {journal.map((j) => {
                const c = competencies.find((x) => x.id === j.related_competency_id);
                return (
                  <div key={j.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={j.author_role === "supervisor" ? "default" : "secondary"}>
                        {j.author_role === "supervisor" ? t.sup : t.me}
                      </Badge>
                      <Badge variant="outline">{j.entry_type}</Badge>
                      <span className="text-xs text-muted-foreground">{j.entry_date}</span>
                      {c && <span className="text-xs text-muted-foreground">· {c.number} {c.name}</span>}
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
                        {j.supervisee_task && <div><div className="font-medium">{t.taskMe}</div><div className="text-muted-foreground">{j.supervisee_task}</div></div>}
                        {j.supervisor_task && <div><div className="font-medium">{t.taskSv}</div><div className="text-muted-foreground">{j.supervisor_task}</div></div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default SuperviseeCompetencies;
