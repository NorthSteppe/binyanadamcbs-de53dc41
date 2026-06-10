import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, CalendarCog } from "lucide-react";
import { toast } from "sonner";

type Rule = {
  id: string;
  label: string;
  color: string;
  info: string;
  day_of_week: number | null;
  specific_date: string | null;
  start_minutes: number;
  end_minutes: number;
  allow_booking: boolean;
};

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const m2t = (m: number) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const t2m = (t: string) => { const [h,mm] = t.split(":").map(Number); return (h||0)*60 + (mm||0); };

const empty = (): Rule => ({
  id: "",
  label: "",
  color: "#1e3a8a",
  info: "",
  day_of_week: 1,
  specific_date: null,
  start_minutes: 9*60,
  end_minutes: 17*60,
  allow_booking: true,
});

const CalendarHourRules = () => {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Rule>(empty());
  const [mode, setMode] = useState<"weekly"|"date">("weekly");

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["calendar_hour_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_hour_rules" as any)
        .select("*")
        .order("specific_date", { ascending: true, nullsFirst: false })
        .order("day_of_week", { ascending: true })
        .order("start_minutes", { ascending: true });
      if (error) throw error;
      return (data as unknown as Rule[]) || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = {
        label: draft.label,
        color: draft.color,
        info: draft.info,
        day_of_week: mode === "weekly" ? draft.day_of_week : null,
        specific_date: mode === "date" ? draft.specific_date : null,
        start_minutes: draft.start_minutes,
        end_minutes: draft.end_minutes,
        allow_booking: draft.allow_booking,
      };
      const { error } = await supabase.from("calendar_hour_rules" as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule added");
      setDraft(empty());
      qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (r: Rule) => {
      const { error } = await supabase
        .from("calendar_hour_rules" as any)
        .update({
          label: r.label, color: r.color, info: r.info,
          day_of_week: r.day_of_week, specific_date: r.specific_date,
          start_minutes: r.start_minutes, end_minutes: r.end_minutes,
          allow_booking: r.allow_booking,
        } as any)
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_hour_rules" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] }); },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pb-20" style={{ paddingTop: "var(--header-height)" }}>
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <CalendarCog className="text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif">Calendar Hour Rules</h1>
              <p className="text-sm text-muted-foreground font-light">
                Paint blocks of time across the calendar — set a colour, a label, an info note (e.g. "Adam unavailable"),
                and control whether clients can book sessions in that window.
              </p>
            </div>
          </div>

          {/* New rule */}
          <Card className="p-5 mb-6 space-y-4">
            <h2 className="font-semibold text-sm">Add a new rule</h2>
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "weekly" ? "default" : "outline"} onClick={() => setMode("weekly")}>Weekly recurring</Button>
              <Button size="sm" variant={mode === "date" ? "default" : "outline"} onClick={() => setMode("date")}>Specific date</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. Admin block" />
              </div>
              <div>
                <Label className="text-xs">Colour</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-9 w-12 rounded border" />
                  <Input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="font-mono text-xs" />
                </div>
              </div>

              {mode === "weekly" ? (
                <div>
                  <Label className="text-xs">Day of week</Label>
                  <Select value={String(draft.day_of_week ?? 1)} onValueChange={(v) => setDraft({ ...draft, day_of_week: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={draft.specific_date || ""} onChange={(e) => setDraft({ ...draft, specific_date: e.target.value || null })} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">From</Label>
                  <Input type="time" value={m2t(draft.start_minutes)} onChange={(e) => setDraft({ ...draft, start_minutes: t2m(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input type="time" value={m2t(draft.end_minutes)} onChange={(e) => setDraft({ ...draft, end_minutes: t2m(e.target.value) })} />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Info shown on hover (optional)</Label>
                <Textarea value={draft.info} rows={2} onChange={(e) => setDraft({ ...draft, info: e.target.value })} placeholder="e.g. Adam is unavailable at this slot" />
              </div>

              <label className="flex items-center gap-3 md:col-span-2">
                <Switch checked={draft.allow_booking} onCheckedChange={(v) => setDraft({ ...draft, allow_booking: v })} />
                <span className="text-sm">Clients can book inside this window</span>
              </label>
            </div>

            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || (mode === "weekly" && draft.day_of_week === null) || (mode === "date" && !draft.specific_date)}
              className="gap-2"
            >
              <Plus size={14} /> Add rule
            </Button>
          </Card>

          {/* List */}
          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && rules.length === 0 && <p className="text-sm text-muted-foreground">No rules yet.</p>}
            {rules.map((r) => (
              <Card key={r.id} className="p-3 flex flex-wrap items-center gap-3">
                <div className="w-3 h-10 rounded" style={{ background: r.color }} />
                <div className="flex-1 min-w-[180px]">
                  <Input value={r.label} onChange={(e) => qc.setQueryData(["calendar_hour_rules"], (rules || []).map((x: Rule) => x.id === r.id ? { ...x, label: e.target.value } : x))} className="h-8 text-sm font-medium border-0 bg-transparent px-0" />
                  <p className="text-[11px] text-muted-foreground">
                    {r.specific_date ? `On ${r.specific_date}` : `Every ${DAYS[r.day_of_week ?? 0]}`}
                    {" · "}{m2t(r.start_minutes)}–{m2t(r.end_minutes)}
                    {" · "}{r.allow_booking ? "Bookable" : "Blocked"}
                  </p>
                  {r.info && <p className="text-[11px] text-muted-foreground italic mt-0.5">"{r.info}"</p>}
                </div>
                <Switch checked={r.allow_booking} onCheckedChange={(v) => update.mutate({ ...r, allow_booking: v })} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => update.mutate(r)}><Save size={12} /> Save</Button>
                <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => { if (confirm("Remove rule?")) remove.mutate(r.id); }}><Trash2 size={14} /></Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CalendarHourRules;
