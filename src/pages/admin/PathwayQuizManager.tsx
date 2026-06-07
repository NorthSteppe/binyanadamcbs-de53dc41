import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Eye, EyeOff, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PathwayQuiz from "@/components/PathwayQuiz";

interface Option {
  label: string;
  description?: string;
  action: { type: "route" | "next"; value: string };
}

interface Slide {
  id: string;
  order_index: number;
  question: string;
  subtitle: string | null;
  options: Option[];
  is_active: boolean;
  is_start: boolean;
}

const blankOption = (): Option => ({
  label: "",
  description: "",
  action: { type: "route", value: "/services" },
});

const PathwayQuizManager = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pathway_quiz_slides")
      .select("*")
      .order("order_index");
    if (error) toast({ title: "Failed to load slides", description: error.message, variant: "destructive" });
    setSlides((data ?? []) as unknown as Slide[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateLocal = (id: string, patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveSlide = async (s: Slide) => {
    setSaving(s.id);
    const { error } = await supabase
      .from("pathway_quiz_slides")
      .update({
        question: s.question,
        subtitle: s.subtitle,
        options: s.options as any,
        is_active: s.is_active,
        is_start: s.is_start,
        order_index: s.order_index,
      })
      .eq("id", s.id);
    setSaving(null);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Slide saved" });
  };

  const addSlide = async () => {
    const maxIdx = slides.reduce((m, s) => Math.max(m, s.order_index), -1);
    const { data, error } = await supabase
      .from("pathway_quiz_slides")
      .insert({
        question: "New question?",
        subtitle: "",
        options: [blankOption()] as any,
        order_index: maxIdx + 1,
        is_active: true,
        is_start: slides.length === 0,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Could not create slide", description: error.message, variant: "destructive" });
      return;
    }
    setSlides((prev) => [...prev, data as unknown as Slide]);
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const { error } = await supabase.from("pathway_quiz_slides").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const setStart = async (id: string) => {
    // unset others
    await supabase.from("pathway_quiz_slides").update({ is_start: false }).neq("id", id);
    await supabase.from("pathway_quiz_slides").update({ is_start: true }).eq("id", id);
    setSlides((prev) => prev.map((s) => ({ ...s, is_start: s.id === id })));
    toast({ title: "Start slide updated" });
  };

  const moveSlide = async (id: string, dir: -1 | 1) => {
    const idx = slides.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= slides.length) return;
    const a = slides[idx];
    const b = slides[swap];
    const next = [...slides];
    next[idx] = { ...b, order_index: a.order_index };
    next[swap] = { ...a, order_index: b.order_index };
    setSlides(next);
    await Promise.all([
      supabase.from("pathway_quiz_slides").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("pathway_quiz_slides").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
  };

  const updateOption = (slideId: string, i: number, patch: Partial<Option>) => {
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? { ...s, options: s.options.map((o, idx) => (idx === i ? { ...o, ...patch, action: { ...o.action, ...(patch.action ?? {}) } } : o)) }
          : s,
      ),
    );
  };

  const addOption = (slideId: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, options: [...s.options, blankOption()] } : s)),
    );
  };

  const removeOption = (slideId: string, i: number) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, options: s.options.filter((_, idx) => idx !== i) } : s)),
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
              <Link to="/admin"><ArrowLeft size={14} className="mr-1" /> Back to admin</Link>
            </Button>
            <h1 className="font-display text-3xl font-light">Pathway Quiz</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Slides shown when visitors click <em>Let's Explore Together</em>. They flow in order — each option either routes the visitor to a page or moves them to the next slide.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye size={14} className="mr-2" /> Preview</Button>
            <Button onClick={addSlide}><Plus size={14} className="mr-2" /> Add slide</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : slides.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No slides yet. Click "Add slide" to begin.</Card>
        ) : (
          <div className="space-y-4">
            {slides.map((s, idx) => (
              <Card key={s.id} className="p-6">
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                  <div className="flex flex-col">
                    <button onClick={() => moveSlide(s.id, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                    <GripVertical size={14} className="text-muted-foreground" />
                    <button onClick={() => moveSlide(s.id, 1)} disabled={idx === slides.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Slide {idx + 1}</div>
                    <div className="text-sm font-medium truncate">{s.question || "(no question)"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStart(s.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${s.is_start ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      title="Mark as starting slide"
                    >
                      <Star size={12} /> Start
                    </button>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.is_active} onCheckedChange={(v) => updateLocal(s.id, { is_active: v })} />
                      {s.is_active ? <Eye size={14} /> : <EyeOff size={14} className="text-muted-foreground" />}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteSlide(s.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Question</Label>
                    <Input value={s.question} onChange={(e) => updateLocal(s.id, { question: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Subtitle (optional)</Label>
                    <Textarea rows={2} value={s.subtitle ?? ""} onChange={(e) => updateLocal(s.id, { subtitle: e.target.value })} />
                  </div>

                  <div>
                    <Label className="text-xs">Options</Label>
                    <div className="mt-2 space-y-3">
                      {s.options.map((o, i) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Label (e.g. For myself)"
                              value={o.label}
                              onChange={(e) => updateOption(s.id, i, { label: e.target.value })}
                            />
                            <Button size="sm" variant="ghost" onClick={() => removeOption(s.id, i)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          <Input
                            placeholder="Description (optional)"
                            value={o.description ?? ""}
                            onChange={(e) => updateOption(s.id, i, { description: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Select
                              value={o.action.type}
                              onValueChange={(v: "route" | "next") =>
                                updateOption(s.id, i, { action: { type: v, value: v === "next" ? "" : "/services" } })
                              }
                            >
                              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="route">Go to page</SelectItem>
                                <SelectItem value="next">Next slide</SelectItem>
                              </SelectContent>
                            </Select>
                            {o.action.type === "route" && (
                              <Input
                                placeholder="/services"
                                value={o.action.value}
                                onChange={(e) => updateOption(s.id, i, { action: { type: "route", value: e.target.value } })}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addOption(s.id)}>
                        <Plus size={14} className="mr-1" /> Add option
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={() => saveSlide(s)} disabled={saving === s.id}>
                      <Save size={14} className="mr-2" /> {saving === s.id ? "Saving…" : "Save slide"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <PathwayQuiz open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
};

export default PathwayQuizManager;
