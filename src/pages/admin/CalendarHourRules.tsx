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
import { Trash2, Plus, Save, CalendarCog, X } from "lucide-react";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const m2t = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const t2m = (t: string) => {
  const [h, mm] = t.split(":").map(Number);
  return (h || 0) * 60 + (mm || 0);
};

type Range = { start: number; end: number };

const CalendarHourRules = () => {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"weekly" | "date">("weekly");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#1e3a8a");
  const [info, setInfo] = useState("");
  const [allowBooking, setAllowBooking] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [ranges, setRanges] = useState<Range[]>([{ start: 9 * 60, end: 17 * 60 }]);

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

  const toggleDay = (d: number) =>
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const addRange = () => setRanges((r) => [...r, { start: 9 * 60, end: 10 * 60 }]);
  const updateRange = (i: number, patch: Partial<Range>) =>
    setRanges((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeRange = (i: number) => setRanges((r) => r.filter((_, idx) => idx !== i));

  const addDate = () => {
    if (!newDate) return;
    if (!specificDates.includes(newDate)) setSpecificDates((d) => [...d, newDate].sort());
    setNewDate("");
  };
  const removeDate = (d: string) => setSpecificDates((arr) => arr.filter((x) => x !== d));

  const reset = () => {
    setLabel("");
    setInfo("");
    setSelectedDays([1]);
    setSpecificDates([]);
    setRanges([{ start: 9 * 60, end: 17 * 60 }]);
  };

  const create = useMutation({
    mutationFn: async () => {
      const keys = mode === "weekly" ? selectedDays.map((d) => ({ day_of_week: d, specific_date: null })) : specificDates.map((d) => ({ day_of_week: null, specific_date: d }));
      if (keys.length === 0) throw new Error(mode === "weekly" ? "Pick at least one day" : "Add at least one date");
      if (ranges.length === 0) throw new Error("Add at least one time range");
      const rows = keys.flatMap((k) =>
        ranges.map((r) => ({
          label,
          color,
          info,
          ...k,
          start_minutes: r.start,
          end_minutes: r.end,
          allow_booking: allowBooking,
        })),
      );
      const { error } = await supabase.from("calendar_hour_rules" as any).insert(rows as any);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (n) => {
      toast.success(`${n} rule${n === 1 ? "" : "s"} added`);
      reset();
      qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (r: Rule) => {
      const { error } = await supabase
        .from("calendar_hour_rules" as any)
        .update({
          label: r.label,
          color: r.color,
          info: r.info,
          day_of_week: r.day_of_week,
          specific_date: r.specific_date,
          start_minutes: r.start_minutes,
          end_minutes: r.end_minutes,
          allow_booking: r.allow_booking,
        } as any)
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_hour_rules" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["calendar_hour_rules"] });
    },
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
                Paint blocks of time across the calendar — pick multiple days and multiple time windows in one go.
              </p>
            </div>
          </div>

          <Card className="p-5 mb-6 space-y-5">
            <h2 className="font-semibold text-sm">Add new rule(s)</h2>

            <div className="flex gap-2">
              <Button size="sm" variant={mode === "weekly" ? "default" : "outline"} onClick={() => setMode("weekly")}>
                Weekly recurring
              </Button>
              <Button size="sm" variant={mode === "date" ? "default" : "outline"} onClick={() => setMode("date")}>
                Specific dates
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Admin block" />
              </div>
              <div>
                <Label className="text-xs">Colour</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border" />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
            </div>

            {mode === "weekly" ? (
              <div>
                <Label className="text-xs">Days (tap to toggle)</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAYS.map((d, i) => {
                    const active = selectedDays.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition ${
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent border-input"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs">Dates</Label>
                <div className="flex gap-2">
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                  <Button type="button" variant="outline" onClick={addDate} className="gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specificDates.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                      {d}
                      <button type="button" onClick={() => removeDate(d)} className="text-muted-foreground hover:text-destructive">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Time windows</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRange} className="h-7 gap-1">
                  <Plus size={12} /> Add window
                </Button>
              </div>
              <div className="space-y-2">
                {ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input type="time" value={m2t(r.start)} onChange={(e) => updateRange(i, { start: t2m(e.target.value) })} className="w-32" />
                    <span className="text-muted-foreground text-sm">–</span>
                    <Input type="time" value={m2t(r.end)} onChange={(e) => updateRange(i, { end: t2m(e.target.value) })} className="w-32" />
                    {ranges.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => removeRange(i)}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Info shown on hover (optional)</Label>
              <Textarea value={info} rows={2} onChange={(e) => setInfo(e.target.value)} placeholder="e.g. Adam is unavailable at this slot" />
            </div>

            <label className="flex items-center gap-3">
              <Switch checked={allowBooking} onCheckedChange={setAllowBooking} />
              <span className="text-sm">Clients can book inside this window</span>
            </label>

            <Button onClick={() => create.mutate()} disabled={create.isPending} className="gap-2">
              <Plus size={14} /> Add rule{(mode === "weekly" ? selectedDays.length : specificDates.length) * ranges.length > 1 ? "s" : ""}
              <span className="text-xs opacity-70">
                ({(mode === "weekly" ? selectedDays.length : specificDates.length) * ranges.length})
              </span>
            </Button>
          </Card>

          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && rules.length === 0 && <p className="text-sm text-muted-foreground">No rules yet.</p>}
            {rules.map((r) => (
              <Card key={r.id} className="p-3 flex flex-wrap items-center gap-3">
                <div className="w-3 h-10 rounded" style={{ background: r.color }} />
                <div className="flex-1 min-w-[180px]">
                  <Input
                    value={r.label}
                    onChange={(e) =>
                      qc.setQueryData(["calendar_hour_rules"], (rules || []).map((x: Rule) => (x.id === r.id ? { ...x, label: e.target.value } : x)))
                    }
                    className="h-8 text-sm font-medium border-0 bg-transparent px-0"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {r.specific_date ? `On ${r.specific_date}` : `Every ${DAYS_FULL[r.day_of_week ?? 0]}`}
                    {" · "}
                    {m2t(r.start_minutes)}–{m2t(r.end_minutes)}
                    {" · "}
                    {r.allow_booking ? "Bookable" : "Blocked"}
                  </p>
                  {r.info && <p className="text-[11px] text-muted-foreground italic mt-0.5">"{r.info}"</p>}
                </div>
                <Switch checked={r.allow_booking} onCheckedChange={(v) => update.mutate({ ...r, allow_booking: v })} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => update.mutate(r)}>
                  <Save size={12} /> Save
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => { if (confirm("Remove rule?")) remove.mutate(r.id); }}>
                  <Trash2 size={14} />
                </Button>
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
