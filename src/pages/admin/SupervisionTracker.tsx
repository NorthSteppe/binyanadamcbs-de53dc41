import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { Plus, Trash2, ChevronRight, ChevronDown, Edit2, Save, X } from "lucide-react";
import { SUPERVISION_LEVELS, levelMeta, gapIcon, STATUSES, SupervisionLevel } from "@/lib/supervisionLevels";

type Competency = {
  id: string;
  supervisee_id: string;
  supervisor_id: string;
  parent_id: string | null;
  number: string;
  name: string;
  definition: string;
  domain: string;
  can_break_down: boolean;
  display_order: number;
};
type SeInput = { competency_id: string; observations_count: number; evidence: string; self_assessment_level: SupervisionLevel; notes: string };
type SvInput = { competency_id: string; final_level: SupervisionLevel; status: string; next_goal: string; notes: string };
type Journal = {
  id: string; supervisee_id: string; author_id: string; author_role: "supervisor" | "supervisee";
  entry_date: string; entry_type: string; related_competency_id: string | null;
  description: string; evidence: string; conclusion: string;
  supervisee_task: string; supervisor_task: string; next_check_date: string | null; notes: string;
};

const blankCompetency = (): Partial<Competency> => ({
  number: "", name: "", definition: "", domain: "", can_break_down: false, display_order: 0,
});

const SupervisionTrackerAdmin = () => {
  const { user } = useAuth();
  const [supervisees, setSupervisees] = useState<{ id: string; full_name: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [seInputs, setSeInputs] = useState<Record<string, SeInput>>({});
  const [svInputs, setSvInputs] = useState<Record<string, SvInput>>({});
  const [journal, setJournal] = useState<Journal[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [editing, setEditing] = useState<Partial<Competency> | null>(null);
  const [newJournal, setNewJournal] = useState<Partial<Journal>>({ entry_type: "supervision_meeting", entry_date: new Date().toISOString().slice(0, 10) });

  // Load supervisees
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
    if (err) toast.error(err.message); else { toast.success("Saved"); setEditing(null); loadAll(activeId); }
  };

  const deleteCompetency = async (id: string) => {
    if (!confirm("Delete this competency and all sub-steps?")) return;
    const { error } = await supabase.from("supervision_competencies").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); loadAll(activeId); }
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
    if (!activeId || !user || !newJournal.description) { toast.error("Add a description"); return; }
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
    else { toast.success("Journal entry added"); setNewJournal({ entry_type: "supervision_meeting", entry_date: new Date().toISOString().slice(0, 10) }); loadAll(activeId); }
  };

  const renderRow = (c: Competency, depth = 0) => {
    const se = seInputs[c.id];
    const sv = svInputs[c.id];
    const kids = tree.childrenOf(c.id);
    const isOpen = expanded[c.id] ?? true;
    return (
      <div key={c.id}>
        <div className="grid grid-cols-12 gap-2 items-center py-2 px-3 border-b text-sm" style={{ paddingLeft: 12 + depth * 20 }}>
          <div className="col-span-3 flex items-center gap-2">
            {kids.length > 0 ? (
              <button onClick={() => setExpanded((p) => ({ ...p, [c.id]: !isOpen }))}>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : <span className="w-3.5" />}
            <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
            <span className="font-medium truncate" title={c.name}>{c.name}</span>
          </div>
          <div className="col-span-2 text-xs text-muted-foreground truncate">{c.domain}</div>
          <div className="col-span-1 text-center">{se?.observations_count ?? 0}</div>
          <div className="col-span-2">
            <Badge variant="outline" style={{ color: levelMeta(se?.self_assessment_level || "not_started").color }}>
              {levelMeta(se?.self_assessment_level || "not_started").label}
            </Badge>
          </div>
          <div className="col-span-2">
            <Select value={sv?.final_level || "not_started"} onValueChange={(v) => upsertSv(c.id, { final_level: v as SupervisionLevel })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPERVISION_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 text-center text-lg" title="Gap">
            {gapIcon(se?.self_assessment_level, sv?.final_level)}
          </div>
          <div className="col-span-1 flex justify-end gap-1">
            {c.can_break_down && (
              <Button size="icon" variant="ghost" className="h-7 w-7" title="Add sub-step"
                onClick={() => setEditing({ ...blankCompetency(), parent_id: c.id, number: `${c.number}.${kids.length + 1}`, domain: c.domain })}>
                <Plus size={13} />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(c)}><Edit2 size={13} /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteCompetency(c.id)}><Trash2 size={13} /></Button>
          </div>
        </div>
        {/* Supervisor goal/notes inline */}
        <div className="px-3 pb-2 grid grid-cols-12 gap-2" style={{ paddingLeft: 12 + depth * 20 }}>
          <Input className="col-span-5 h-8 text-xs" placeholder="Next goal…" value={sv?.next_goal || ""}
            onChange={(e) => setSvInputs((p) => ({ ...p, [c.id]: { ...(p[c.id] || {} as any), next_goal: e.target.value, competency_id: c.id } as any }))}
            onBlur={(e) => upsertSv(c.id, { next_goal: e.target.value })} />
          <Select value={sv?.status || "in_progress"} onValueChange={(v) => upsertSv(c.id, { status: v })}>
            <SelectTrigger className="col-span-2 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input className="col-span-5 h-8 text-xs" placeholder="Supervisor notes…" value={sv?.notes || ""}
            onChange={(e) => setSvInputs((p) => ({ ...p, [c.id]: { ...(p[c.id] || {} as any), notes: e.target.value, competency_id: c.id } as any }))}
            onBlur={(e) => upsertSv(c.id, { notes: e.target.value })} />
        </div>
        {isOpen && kids.map((k) => renderRow(k, depth + 1))}
      </div>
    );
  };

  const activeName = supervisees.find((s) => s.id === activeId)?.full_name || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supervision Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Define competencies, track progress, and journal alongside your supervisee.</p>
          </div>
          <div className="ml-auto min-w-[260px]">
            <Label className="text-xs">Supervisee</Label>
            <Select value={activeId} onValueChange={setActiveId}>
              <SelectTrigger><SelectValue placeholder="Select a supervisee" /></SelectTrigger>
              <SelectContent>
                {supervisees.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!activeId ? (
          <div className="border rounded-lg p-12 text-center text-muted-foreground">No supervisees yet. Assign the supervisee role to a user first.</div>
        ) : (
          <Tabs defaultValue="competencies">
            <TabsList>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="journal">Shared Journal</TabsTrigger>
            </TabsList>

            <TabsContent value="competencies" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">{competencies.length} competencies for <strong>{activeName}</strong></div>
                <Button onClick={() => setEditing(blankCompetency())}><Plus size={14} className="mr-1" /> Add competency</Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted text-xs font-medium uppercase">
                  <div className="col-span-3">Competency</div>
                  <div className="col-span-2">Domain</div>
                  <div className="col-span-1 text-center">Obs</div>
                  <div className="col-span-2">Self assessment</div>
                  <div className="col-span-2">Supervisor rating</div>
                  <div className="col-span-1 text-center">Gap</div>
                  <div className="col-span-1"></div>
                </div>
                {tree.roots.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No competencies yet — add the first one.</div>}
                {tree.roots.map((c) => renderRow(c))}
              </div>

              {editing && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{editing.id ? "Edit competency" : (editing.parent_id ? "Add sub-step" : "Add competency")}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X size={14} /></Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><Label>Number</Label><Input value={editing.number || ""} onChange={(e) => setEditing({ ...editing, number: e.target.value })} placeholder="1.1" /></div>
                    <div className="sm:col-span-2"><Label>Name *</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                    <div className="sm:col-span-3"><Label>Definition</Label><Textarea rows={2} value={editing.definition || ""} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} /></div>
                    <div><Label>Domain</Label><Input value={editing.domain || ""} onChange={(e) => setEditing({ ...editing, domain: e.target.value })} placeholder="Assessment, Ethics…" /></div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox id="bd" checked={!!editing.can_break_down} onCheckedChange={(v) => setEditing({ ...editing, can_break_down: !!v })} />
                      <Label htmlFor="bd" className="cursor-pointer">Allow breaking into sub-steps</Label>
                    </div>
                  </div>
                  <div className="flex gap-2"><Button onClick={saveCompetency}><Save size={14} className="mr-1" /> Save</Button></div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">Overall Progress</div>
                  <div className="text-3xl font-bold mt-2">{overallProgress}%</div>
                  <Progress value={overallProgress} className="mt-3" />
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">Total Competencies</div>
                  <div className="text-3xl font-bold mt-2">{competencies.length}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground uppercase">Independent or above</div>
                  <div className="text-3xl font-bold mt-2">
                    {competencies.filter((c) => levelMeta(svInputs[c.id]?.final_level || "not_started").score >= 3).length}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">By level (supervisor rating)</h3>
                {SUPERVISION_LEVELS.map((l) => {
                  const count = competencies.filter((c) => (svInputs[c.id]?.final_level || "not_started") === l.value).length;
                  const pct = competencies.length ? (count / competencies.length) * 100 : 0;
                  return (
                    <div key={l.value} className="flex items-center gap-3 text-sm">
                      <div className="w-44">{l.label}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, background: l.color }} />
                      </div>
                      <div className="w-10 text-right tabular-nums">{count}</div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="journal" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
                <h3 className="font-semibold">New supervisor entry</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><Label>Date</Label><Input type="date" value={newJournal.entry_date || ""} onChange={(e) => setNewJournal({ ...newJournal, entry_date: e.target.value })} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newJournal.entry_type || "supervision_meeting"} onValueChange={(v) => setNewJournal({ ...newJournal, entry_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supervision_meeting">Supervision meeting</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="decision">Professional decision</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Related competency</Label>
                    <Select value={newJournal.related_competency_id || "none"} onValueChange={(v) => setNewJournal({ ...newJournal, related_competency_id: v === "none" ? null : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— none —</SelectItem>
                        {competencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.number} {c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description / what happened</Label><Textarea rows={2} value={newJournal.description || ""} onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Evidence reviewed</Label><Textarea rows={2} value={newJournal.evidence || ""} onChange={(e) => setNewJournal({ ...newJournal, evidence: e.target.value })} /></div>
                  <div><Label>Decisions / conclusions</Label><Textarea rows={2} value={newJournal.conclusion || ""} onChange={(e) => setNewJournal({ ...newJournal, conclusion: e.target.value })} /></div>
                  <div><Label>Task for supervisee</Label><Textarea rows={2} value={newJournal.supervisee_task || ""} onChange={(e) => setNewJournal({ ...newJournal, supervisee_task: e.target.value })} /></div>
                  <div><Label>Task for supervisor</Label><Textarea rows={2} value={newJournal.supervisor_task || ""} onChange={(e) => setNewJournal({ ...newJournal, supervisor_task: e.target.value })} /></div>
                  <div><Label>Next check date</Label><Input type="date" value={newJournal.next_check_date || ""} onChange={(e) => setNewJournal({ ...newJournal, next_check_date: e.target.value })} /></div>
                </div>
                <Button onClick={addJournal}><Plus size={14} className="mr-1" /> Add entry</Button>
              </div>

              <div className="space-y-2">
                {journal.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No journal entries yet.</div>}
                {journal.map((j) => {
                  const c = competencies.find((x) => x.id === j.related_competency_id);
                  return (
                    <div key={j.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={j.author_role === "supervisor" ? "default" : "secondary"}>
                          {j.author_role === "supervisor" ? "🟦 Supervisor" : "🟢 Supervisee"}
                        </Badge>
                        <Badge variant="outline">{j.entry_type}</Badge>
                        <span className="text-xs text-muted-foreground">{j.entry_date}</span>
                        {c && <span className="text-xs text-muted-foreground">· {c.number} {c.name}</span>}
                        {j.next_check_date && <span className="text-xs text-muted-foreground ml-auto">Next check: {j.next_check_date}</span>}
                      </div>
                      {j.description && <p className="text-sm">{j.description}</p>}
                      {(j.evidence || j.conclusion) && (
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {j.evidence && <div><div className="font-medium">Evidence</div><div className="text-muted-foreground">{j.evidence}</div></div>}
                          {j.conclusion && <div><div className="font-medium">Conclusion</div><div className="text-muted-foreground">{j.conclusion}</div></div>}
                        </div>
                      )}
                      {(j.supervisee_task || j.supervisor_task) && (
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {j.supervisee_task && <div><div className="font-medium">Supervisee task</div><div className="text-muted-foreground">{j.supervisee_task}</div></div>}
                          {j.supervisor_task && <div><div className="font-medium">Supervisor task</div><div className="text-muted-foreground">{j.supervisor_task}</div></div>}
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
