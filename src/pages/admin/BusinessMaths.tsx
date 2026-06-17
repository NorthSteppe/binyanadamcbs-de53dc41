import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, RotateCcw, Download, Calendar as CalIcon, Settings2,
  TrendingUp, Clock, Wallet, PiggyBank, ExternalLink, Loader2, CloudOff,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, Cell,
} from "recharts";

type Period = "weekly" | "yearly";
interface Activity { id: string; name: string; rate: number; hours: number; category: string; }
interface Cost { id: string; name: string; amount: number; period: Period; }
interface PlannerData {
  weeksPerYear: number;
  currency: string;
  activities: Activity[];
  costs: Cost[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

// Seeded from the "Business maths" spreadsheet so the page opens on the current model.
const DEFAULT_DATA: PlannerData = {
  weeksPerYear: 45,
  currency: "GBP",
  activities: [
    { id: uid(), name: "Direct client work", rate: 80, hours: 20, category: "Billable" },
    { id: uid(), name: "Teaching", rate: 73, hours: 2, category: "Billable" },
    { id: uid(), name: "Supervision in-house", rate: 0, hours: 1, category: "Project" },
    { id: uid(), name: "Studying", rate: 0, hours: 5, category: "Project" },
    { id: uid(), name: "Professional Development", rate: -75, hours: 1, category: "Project" },
    { id: uid(), name: "Business development", rate: 0, hours: 3, category: "Project" },
    { id: uid(), name: "Game development", rate: 0, hours: 2, category: "Project" },
    { id: uid(), name: "Therapist hours (B)", rate: 40, hours: 6, category: "Therapist" },
    { id: uid(), name: "Therapist PT sessions", rate: 15, hours: 2, category: "Therapist" },
    { id: uid(), name: "Therapist NET C", rate: 25, hours: 2, category: "Therapist" },
  ],
  costs: [],
};

const CATEGORY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#ec4899"];
const STORAGE_KEY = "business_planner_v1";

const BusinessMaths = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<PlannerData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [storageMode, setStorageMode] = useState<"db" | "local">("db");
  const [xeroYearlyRevenue, setXeroYearlyRevenue] = useState<number | null>(null);

  // ---- Load (DB → localStorage fallback → defaults) ----
  useEffect(() => {
    (async () => {
      let loaded: PlannerData | null = null;
      try {
        const { data: row, error } = await (supabase as any)
          .from("business_planner").select("data").eq("name", "default").maybeSingle();
        if (error) throw error;
        if (row?.data && row.data.activities) loaded = row.data as PlannerData;
      } catch {
        setStorageMode("local");
        const ls = localStorage.getItem(STORAGE_KEY);
        if (ls) { try { loaded = JSON.parse(ls); } catch { /* ignore */ } }
      }
      if (loaded) setData({ ...DEFAULT_DATA, ...loaded });
      setLoading(false);
    })();
    // Best-effort: pull actual Xero revenue for comparison ("communicates" with Finance).
    supabase.functions.invoke<any>("xero-live", { body: { action: "summary" } })
      .then(({ data: s }) => {
        const rev = s?.revenue_paid ?? s?.revenuePaid ?? s?.revenue ?? null;
        if (typeof rev === "number") setXeroYearlyRevenue(rev);
      })
      .catch(() => {});
  }, []);

  const update = (patch: Partial<PlannerData>) => { setData((d) => ({ ...d, ...patch })); setDirty(true); };
  const updateActivity = (id: string, patch: Partial<Activity>) =>
    update({ activities: data.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const addActivity = () =>
    update({ activities: [...data.activities, { id: uid(), name: "New activity", rate: 0, hours: 0, category: "Billable" }] });
  const removeActivity = (id: string) => update({ activities: data.activities.filter((a) => a.id !== id) });
  const updateCost = (id: string, patch: Partial<Cost>) =>
    update({ costs: data.costs.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCost = () => update({ costs: [...data.costs, { id: uid(), name: "New cost", amount: 0, period: "yearly" }] });
  const removeCost = (id: string) => update({ costs: data.costs.filter((c) => c.id !== id) });

  const fmt = useMemo(
    () => new Intl.NumberFormat("en-GB", { style: "currency", currency: data.currency || "GBP", maximumFractionDigits: 0 }),
    [data.currency],
  );
  const money = (n: number) => fmt.format(Number.isFinite(n) ? n : 0);

  // ---- Calculations ----
  const calc = useMemo(() => {
    const weeks = data.weeksPerYear || 1;
    const wkRev = (a: Activity) => a.rate * a.hours;
    const yrRev = (a: Activity) => wkRev(a) * weeks;
    const totalWeeklyRevenue = data.activities.reduce((s, a) => s + wkRev(a), 0);
    const totalYearlyRevenue = totalWeeklyRevenue * weeks;
    const totalWeeklyHours = data.activities.reduce((s, a) => s + (a.hours || 0), 0);
    const byCategory: Record<string, { hours: number; weekly: number; yearly: number }> = {};
    for (const a of data.activities) {
      const k = a.category || "Uncategorised";
      byCategory[k] = byCategory[k] || { hours: 0, weekly: 0, yearly: 0 };
      byCategory[k].hours += a.hours || 0;
      byCategory[k].weekly += wkRev(a);
      byCategory[k].yearly += yrRev(a);
    }
    const costYearly = (c: Cost) => (c.period === "weekly" ? c.amount * weeks : c.amount);
    const totalYearlyCosts = data.costs.reduce((s, c) => s + costYearly(c), 0);
    const netYearly = totalYearlyRevenue - totalYearlyCosts;
    return { weeks, wkRev, yrRev, totalWeeklyRevenue, totalYearlyRevenue, totalWeeklyHours, byCategory, costYearly, totalYearlyCosts, netYearly };
  }, [data]);

  const categories = Object.keys(calc.byCategory);
  const chartData = categories.map((c) => ({ name: c, yearly: Math.round(calc.byCategory[c].yearly) }));

  // ---- Persistence ----
  const save = async () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // always cache
    let mode: "db" | "local" = "local";
    try {
      const { error } = await (supabase as any).from("business_planner").upsert(
        { name: "default", data, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
        { onConflict: "name" },
      );
      if (error) throw error;
      mode = "db";
    } catch {
      mode = "local";
    }
    setStorageMode(mode);
    setSaving(false);
    setDirty(false);
    toast.success(mode === "db" ? "Saved — shared with all admins" : "Saved locally (DB table not applied yet)");
  };

  const resetDefaults = () => {
    if (!confirm("Reset the planner to the original spreadsheet model? Unsaved changes will be lost.")) return;
    setData(DEFAULT_DATA);
    setDirty(true);
  };

  const importServiceOptions = async () => {
    try {
      const { data: svc, error } = await (supabase as any).rpc("admin_list_service_options");
      if (error) throw error;
      const rows = (svc as any[]) || [];
      if (!rows.length) { toast.info("No service options found."); return; }
      const existing = new Set(data.activities.map((a) => a.name.trim().toLowerCase()));
      const added: Activity[] = rows
        .filter((s) => !existing.has(String(s.name || "").trim().toLowerCase()))
        .map((s) => ({ id: uid(), name: s.name || "Service", rate: Math.round((s.price_cents || 0) / 100), hours: 1, category: "Billable" }));
      if (!added.length) { toast.info("All service options are already in the model."); return; }
      update({ activities: [...data.activities, ...added] });
      toast.success(`Imported ${added.length} service${added.length > 1 ? "s" : ""} — set the weekly hours for each.`);
    } catch (e: any) {
      toast.error(e?.message ? `Import failed: ${e.message}` : "Could not import service options.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32 text-muted-foreground"><Loader2 className="animate-spin me-2" /> Loading planner…</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl pt-28 pb-16 space-y-6">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Maths — Revenue &amp; Cost Planner</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Model income by activity (rate × hours/week), project across the year, add costs, and see net profit.
              {storageMode === "local" && (
                <span className="inline-flex items-center gap-1 ms-2 text-amber-600"><CloudOff size={12} /> saving locally — apply the DB migration to share</span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={importServiceOptions}><Download size={14} className="me-1" /> Import services</Button>
            <Button variant="outline" size="sm" onClick={resetDefaults}><RotateCcw size={14} className="me-1" /> Reset</Button>
            <Button size="sm" onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 size={14} className="animate-spin me-1" /> : <Save size={14} className="me-1" />} Save
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={TrendingUp} label="Weekly revenue" value={money(calc.totalWeeklyRevenue)} tone="primary" />
          <KPI icon={Wallet} label="Yearly revenue" value={money(calc.totalYearlyRevenue)} sub={`${calc.weeks} weeks/yr`} tone="primary" />
          <KPI icon={Clock} label="Weekly hours" value={`${calc.totalWeeklyHours}h`} tone="muted" />
          <KPI icon={PiggyBank} label="Yearly net profit" value={money(calc.netYearly)} sub={`after ${money(calc.totalYearlyCosts)} costs`} tone={calc.netYearly < 0 ? "rose" : "emerald"} />
        </div>

        {xeroYearlyRevenue !== null && (
          <Card>
            <CardContent className="py-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Actual revenue from Xero (paid), for comparison</span>
              <span className="font-semibold">{money(xeroYearlyRevenue)} <span className="text-xs text-muted-foreground">vs {money(calc.totalYearlyRevenue)} projected</span></span>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Settings2 size={16} /> Settings</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Working weeks / year</Label>
              <Input type="number" min={1} max={52} value={data.weeksPerYear}
                onChange={(e) => update({ weeksPerYear: Math.max(1, Math.min(52, Number(e.target.value) || 1)) })} />
            </div>
            <div>
              <Label className="text-xs">Currency</Label>
              <Select value={data.currency} onValueChange={(v) => update({ currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="ILS">₪ ILS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Revenue activities */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div><CardTitle className="text-base">Revenue activities</CardTitle><CardDescription>Rate × hours/week. Yearly = weekly × {calc.weeks}.</CardDescription></div>
              <Button size="sm" variant="outline" onClick={addActivity}><Plus size={14} className="me-1" /> Add activity</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead><TableHead>Category</TableHead>
                  <TableHead className="text-right">Rate/hr</TableHead><TableHead className="text-right">Hrs/wk</TableHead>
                  <TableHead className="text-right">Weekly</TableHead><TableHead className="text-right">Yearly</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Input className="h-8" value={a.name} onChange={(e) => updateActivity(a.id, { name: e.target.value })} /></TableCell>
                    <TableCell>
                      <Input className="h-8 w-28" list="bm-categories" value={a.category} onChange={(e) => updateActivity(a.id, { category: e.target.value })} />
                    </TableCell>
                    <TableCell className="text-right"><Input className="h-8 w-24 text-right" type="number" value={a.rate} onChange={(e) => updateActivity(a.id, { rate: Number(e.target.value) })} /></TableCell>
                    <TableCell className="text-right"><Input className="h-8 w-20 text-right" type="number" min={0} value={a.hours} onChange={(e) => updateActivity(a.id, { hours: Number(e.target.value) })} /></TableCell>
                    <TableCell className="text-right tabular-nums">{money(calc.wkRev(a))}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{money(calc.yrRev(a))}</TableCell>
                    <TableCell><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeActivity(a.id)}><Trash2 size={13} /></Button></TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell>Total</TableCell><TableCell></TableCell><TableCell></TableCell>
                  <TableCell className="text-right tabular-nums">{calc.totalWeeklyHours}h</TableCell>
                  <TableCell className="text-right tabular-nums">{money(calc.totalWeeklyRevenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(calc.totalYearlyRevenue)}</TableCell><TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <datalist id="bm-categories">
              {Array.from(new Set(["Billable", "Project", "Therapist", ...categories])).map((c) => <option key={c} value={c} />)}
            </datalist>
          </CardContent>
        </Card>

        {/* Category breakdown + chart */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">By category</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Hrs/wk</TableHead><TableHead className="text-right">Weekly</TableHead><TableHead className="text-right">Yearly</TableHead></TableRow></TableHeader>
                <TableBody>
                  {categories.map((c, i) => (
                    <TableRow key={c}>
                      <TableCell><Badge variant="outline" style={{ borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length], color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>{c}</Badge></TableCell>
                      <TableCell className="text-right">{calc.byCategory[c].hours}h</TableCell>
                      <TableCell className="text-right tabular-nums">{money(calc.byCategory[c].weekly)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(calc.byCategory[c].yearly)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Yearly revenue by category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip formatter={(v: any) => money(Number(v))} />
                  <Bar dataKey="yearly" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Costs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div><CardTitle className="text-base">Business costs</CardTitle><CardDescription>Subtracted from yearly revenue to give net profit.</CardDescription></div>
              <Button size="sm" variant="outline" onClick={addCost}><Plus size={14} className="me-1" /> Add cost</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Cost</TableHead><TableHead>Amount</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Yearly</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {data.costs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No costs yet — add rent, salaries, software, etc.</TableCell></TableRow>}
                {data.costs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Input className="h-8" value={c.name} onChange={(e) => updateCost(c.id, { name: e.target.value })} /></TableCell>
                    <TableCell><Input className="h-8 w-28 text-right" type="number" value={c.amount} onChange={(e) => updateCost(c.id, { amount: Number(e.target.value) })} /></TableCell>
                    <TableCell>
                      <Select value={c.period} onValueChange={(v) => updateCost(c.id, { period: v as Period })}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="weekly">per week</SelectItem><SelectItem value="yearly">per year</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{money(calc.costYearly(c))}</TableCell>
                    <TableCell><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeCost(c.id)}><Trash2 size={13} /></Button></TableCell>
                  </TableRow>
                ))}
                {data.costs.length > 0 && (
                  <TableRow className="bg-muted/40 font-semibold">
                    <TableCell>Total costs</TableCell><TableCell></TableCell><TableCell></TableCell>
                    <TableCell className="text-right tabular-nums">{money(calc.totalYearlyCosts)}</TableCell><TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Net profit */}
        <Card>
          <CardContent className="py-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Projected yearly net profit</p>
              <p className={`text-3xl font-bold ${calc.netYearly < 0 ? "text-rose-600" : "text-emerald-600"}`}>{money(calc.netYearly)}</p>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              {money(calc.totalYearlyRevenue)} revenue − {money(calc.totalYearlyCosts)} costs
            </div>
          </CardContent>
        </Card>

        {/* Cross-links to the rest of the portal */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/business")}><ExternalLink size={13} className="me-1" /> Business dashboard</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/finance")}><ExternalLink size={13} className="me-1" /> Finance hub</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/service-options")}><ExternalLink size={13} className="me-1" /> Service options</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/calendar")}><CalIcon size={13} className="me-1" /> Calendar</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

function KPI({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: string; sub?: string; tone?: "primary" | "muted" | "rose" | "emerald" }) {
  const c = tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-600" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Icon size={14} /> {label}</div>
        <p className={`text-2xl font-bold ${c}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default BusinessMaths;
