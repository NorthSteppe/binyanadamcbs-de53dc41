import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Save, Eye, Star, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PathwayQuiz, { QuizOption, QuizStep } from "@/components/PathwayQuiz";

const db = supabase as any;

const PathwayQuizManager = () => {
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, o, c] = await Promise.all([
      db.from("quiz_steps").select("*").order("display_order"),
      db.from("quiz_options").select("*").order("display_order"),
      db.from("quiz_option_clicks").select("option_id").limit(50000),
    ]);
    if (s.error) toast({ title: "Failed to load", description: s.error.message, variant: "destructive" });
    setSteps(s.data ?? []);
    setOptions(o.data ?? []);
    const tally: Record<string, number> = {};
    (c.data ?? []).forEach((r: any) => (tally[r.option_id] = (tally[r.option_id] ?? 0) + 1));
    setCounts(tally);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const err = (e: any, t = "Save failed") => e && toast({ title: t, description: e.message, variant: "destructive" });

  // ---------- Steps ----------
  const patchStep = (id: string, p: Partial<QuizStep>) => setSteps((x) => x.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const saveStep = async (s: QuizStep) => {
    const { error } = await db.from("quiz_steps").update({
      step_key: s.step_key, greeting_text: s.greeting_text || null, heading: s.heading, is_active: s.is_active,
    }).eq("id", s.id);
    error ? err(error) : toast({ title: "Step saved" });
  };
  const addStep = async () => {
    const order = steps.reduce((m, s) => Math.max(m, s.display_order), 0) + 1;
    const { data, error } = await db.from("quiz_steps").insert({
      step_key: `step-${Date.now()}`, heading: "New question?", display_order: order, is_start: steps.length === 0,
    }).select().single();
    if (error) return err(error);
    setSteps((x) => [...x, data]);
  };
  const deleteStep = async (id: string) => {
    if (!confirm("Delete this step and all its options?")) return;
    const { error } = await db.from("quiz_steps").delete().eq("id", id);
    if (error) return err(error);
    setSteps((x) => x.filter((s) => s.id !== id));
    setOptions((x) => x.filter((o) => o.step_id !== id));
  };
  const setStart = async (id: string) => {
    await db.from("quiz_steps").update({ is_start: false }).neq("id", id);
    await db.from("quiz_steps").update({ is_start: true }).eq("id", id);
    setSteps((x) => x.map((s) => ({ ...s, is_start: s.id === id })));
  };
  const moveStep = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const a = steps[idx], b = steps[j];
    const next = [...steps];
    next[idx] = { ...b, display_order: a.display_order };
    next[j] = { ...a, display_order: b.display_order };
    setSteps(next);
    await Promise.all([
      db.from("quiz_steps").update({ display_order: b.display_order }).eq("id", a.id),
      db.from("quiz_steps").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
  };

  // ---------- Options ----------
  const stepOptions = (stepId: string) => options.filter((o) => o.step_id === stepId).sort((a, b) => a.display_order - b.display_order);
  const patchOption = (id: string, p: Partial<QuizOption>) => setOptions((x) => x.map((o) => (o.id === id ? { ...o, ...p } : o)));
  const saveOption = async (o: QuizOption) => {
    const { error } = await db.from("quiz_options").update({
      label: o.label, next_step_id: o.next_step_id, destination_url: o.next_step_id ? null : o.destination_url,
    }).eq("id", o.id);
    error ? err(error) : toast({ title: "Option saved" });
  };
  const addOption = async (stepId: string) => {
    const order = stepOptions(stepId).reduce((m, o) => Math.max(m, o.display_order), 0) + 1;
    const { data, error } = await db.from("quiz_options").insert({
      step_id: stepId, label: "New option", display_order: order, destination_url: "/services",
    }).select().single();
    if (error) return err(error);
    setOptions((x) => [...x, data]);
  };
  const deleteOption = async (id: string) => {
    if (!confirm("Delete this option?")) return;
    const { error } = await db.from("quiz_options").delete().eq("id", id);
    if (error) return err(error);
    setOptions((x) => x.filter((o) => o.id !== id));
  };
  const moveOption = async (stepId: string, idx: number, dir: -1 | 1) => {
    const list = stepOptions(stepId);
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[idx], b = list[j];
    setOptions((x) => x.map((o) => o.id === a.id ? { ...o, display_order: b.display_order } : o.id === b.id ? { ...o, display_order: a.display_order } : o));
    await Promise.all([
      db.from("quiz_options").update({ display_order: b.display_order }).eq("id", a.id),
      db.from("quiz_options").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
  };

  const resetTallies = async () => {
    if (!confirm("Clear all recorded selections?")) return;
    const { error } = await db.from("quiz_option_clicks").delete().not("id", "is", null);
    if (error) return err(error);
    setCounts({});
  };

  const totalClicks = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const destTotals = useMemo(() => {
    const m: Record<string, number> = {};
    options.forEach((o) => { if (o.destination_url) m[o.destination_url] = (m[o.destination_url] ?? 0) + (counts[o.id] ?? 0); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [options, counts]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
              <Link to="/admin"><ArrowLeft size={14} className="mr-1" /> Back to admin</Link>
            </Button>
            <h1 className="font-display text-3xl font-semibold">Pathway Questionnaire</h1>
            <p className="mt-1 text-sm text-muted-foreground">Each option either leads to another step or sends the visitor to a page.</p>
          </div>
          <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye size={14} className="mr-2" /> Preview</Button>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 size={14} className="mr-1" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            {loading ? <div className="text-muted-foreground">Loading…</div> : (
              <div className="space-y-5">
                {steps.map((s, idx) => (
                  <Card key={s.id} className="p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-3">
                      <Button size="icon" variant="ghost" onClick={() => moveStep(idx, -1)} disabled={idx === 0}><ArrowUp size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1}><ArrowDown size={14} /></Button>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {idx + 1}</span>
                      <div className="ml-auto flex items-center gap-3">
                        <button onClick={() => setStart(s.id)} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${s.is_start ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                          <Star size={12} /> {s.is_start ? "First step" : "Make first"}
                        </button>
                        <label className="flex items-center gap-2 text-xs"><Switch checked={s.is_active} onCheckedChange={(v) => patchStep(s.id, { is_active: v })} /> Active</label>
                        <Button size="icon" variant="ghost" onClick={() => deleteStep(s.id)}><Trash2 size={14} /></Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div>
                        <Label className="text-xs">Internal name</Label>
                        <Input value={s.step_key} onChange={(e) => patchStep(s.id, { step_key: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Greeting text (optional)</Label>
                        <Textarea rows={3} value={s.greeting_text ?? ""} onChange={(e) => patchStep(s.id, { greeting_text: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Heading / question</Label>
                        <Textarea rows={2} value={s.heading} onChange={(e) => patchStep(s.id, { heading: e.target.value })} />
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => saveStep(s)}><Save size={14} className="mr-2" /> Save step</Button>
                      </div>

                      <Label className="text-xs">Options</Label>
                      {stepOptions(s.id).map((o, i, arr) => (
                        <div key={o.id} className="space-y-2 rounded-lg border bg-muted/30 p-3">
                          <div className="flex gap-2">
                            <div className="flex flex-col">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveOption(s.id, i, -1)} disabled={i === 0}><ArrowUp size={12} /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveOption(s.id, i, 1)} disabled={i === arr.length - 1}><ArrowDown size={12} /></Button>
                            </div>
                            <Textarea rows={2} value={o.label} onChange={(e) => patchOption(o.id, { label: e.target.value })} />
                            <Button size="icon" variant="ghost" onClick={() => deleteOption(o.id)}><Trash2 size={14} /></Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Select
                              value={o.next_step_id ?? "url"}
                              onValueChange={(v) => patchOption(o.id, v === "url" ? { next_step_id: null, destination_url: o.destination_url || "/services" } : { next_step_id: v })}
                            >
                              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="url">Go to page (URL)</SelectItem>
                                {steps.filter((x) => x.id !== s.id).map((x) => (
                                  <SelectItem key={x.id} value={x.id}>Next step: {x.step_key}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!o.next_step_id && (
                              <Input className="w-56" placeholder="/families" value={o.destination_url ?? ""} onChange={(e) => patchOption(o.id, { destination_url: e.target.value })} />
                            )}
                            <span className="text-xs text-muted-foreground">{counts[o.id] ?? 0} selections</span>
                            <Button size="sm" variant="secondary" className="ml-auto" onClick={() => saveOption(o)}><Save size={12} className="mr-1" /> Save</Button>
                          </div>
                        </div>
                      ))}
                      <div><Button size="sm" variant="outline" onClick={() => addOption(s.id)}><Plus size={14} className="mr-1" /> Add option</Button></div>
                    </div>
                  </Card>
                ))}
                <Button onClick={addStep}><Plus size={14} className="mr-2" /> Add step</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{totalClicks} total selections recorded.</p>
              <Button size="sm" variant="outline" onClick={resetTallies}>Reset tallies</Button>
            </div>
            <Card className="p-5">
              <h3 className="mb-3 font-semibold">Visitors sent to each page</h3>
              {destTotals.map(([url, n]) => {
                const max = destTotals[0]?.[1] || 1;
                return (
                  <div key={url} className="mb-2">
                    <div className="flex justify-between text-sm"><span>{url}</span><span>{n}</span></div>
                    <div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </Card>
            {steps.map((s) => {
              const list = stepOptions(s.id);
              const max = Math.max(1, ...list.map((o) => counts[o.id] ?? 0));
              return (
                <Card key={s.id} className="p-5">
                  <h3 className="mb-3 text-sm font-semibold">{s.heading}</h3>
                  {list.map((o) => (
                    <div key={o.id} className="mb-2">
                      <div className="flex justify-between gap-4 text-xs"><span className="line-clamp-1">{o.label}</span><span className="font-semibold">{counts[o.id] ?? 0}</span></div>
                      <div className="h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-accent" style={{ width: `${((counts[o.id] ?? 0) / max) * 100}%` }} /></div>
                    </div>
                  ))}
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
      <PathwayQuiz open={previewOpen} onOpenChange={setPreviewOpen} preview />
    </div>
  );
};

export default PathwayQuizManager;
