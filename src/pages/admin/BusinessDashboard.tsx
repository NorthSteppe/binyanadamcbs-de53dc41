import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Calendar,
  BarChart3, ArrowUpRight, ArrowDownRight,
  BookOpen, Activity, Target, Plus, Trash2,
  FileText, Share2, CheckCircle2, Edit2, Save,
  Receipt, Briefcase, HandCoins, ClipboardList,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Area, AreaChart,
} from "recharts";
import XeroPanel from "@/components/admin/XeroPanel";

// ─── Types ──────────────────────────────────────────
interface Session { id: string; client_id: string; title: string; session_date: string; duration_minutes: number; status: string; description: string | null; created_at: string; }
interface ServiceOption { id: string; name: string; price_cents: number; duration_minutes: number; }
interface CoursePurchase { id: string; course_id: string; user_id: string; purchased_at: string; }
interface Profile { id: string; full_name: string; created_at: string; }
interface BusinessEntry { id: string; created_by: string; entry_type: string; category: string; title: string; description: string; amount_cents: number; client_id: string | null; entry_date: string; created_at: string; }
interface BusinessPlan { id: string; created_by: string; title: string; content: string; goals: Goal[]; shared_with_team: boolean; status: string; created_at: string; updated_at: string; }
interface Goal { text: string; done: boolean; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(174,42%,42%)", "hsl(192,35%,38%)", "hsl(210,40%,50%)"];

// ─── Main Component ─────────────────────────────────
const BusinessDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coursePurchases, setCoursePurchases] = useState<CoursePurchase[]>([]);
  const [clientProfiles, setClientProfiles] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; price_cents: number }[]>([]);
  const [businessEntries, setBusinessEntries] = useState<BusinessEntry[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [expenseInput, setExpenseInput] = useState({ rent: 0, salaries: 0, software: 0, marketing: 0, other: 0 });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sessRes, svcRes, cpRes, profRes, courseRes, rolesRes, beRes, bpRes] = await Promise.all([
      supabase.from("sessions").select("*").order("session_date", { ascending: false }),
      supabase.from("service_options").select("*"),
      supabase.from("course_purchases").select("*"),
      supabase.from("profiles").select("id, full_name, created_at"),
      supabase.from("courses").select("id, title, price_cents"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("business_entries" as any).select("*").order("entry_date", { ascending: false }),
      supabase.from("business_plans" as any).select("*").order("updated_at", { ascending: false }),
    ]);
    if (sessRes.data) setSessions(sessRes.data as unknown as Session[]);
    if (svcRes.data) setServices(svcRes.data as unknown as ServiceOption[]);
    if (cpRes.data) setCoursePurchases(cpRes.data as unknown as CoursePurchase[]);
    if (courseRes.data) setCourses(courseRes.data as unknown as typeof courses);

    // Filter profiles: only users whose ONLY role is 'client' are actual clients
    const staffIds = new Set<string>();
    if (rolesRes.data) {
      (rolesRes.data as any[]).forEach((r: any) => {
        if (r.role !== "client") staffIds.add(r.user_id);
      });
    }
    const allProfs = (profRes.data || []) as unknown as Profile[];
    setAllProfiles(allProfs);
    setClientProfiles(allProfs.filter((p) => !staffIds.has(p.id)));

    if (beRes.data) setBusinessEntries(beRes.data as unknown as BusinessEntry[]);
    if (bpRes.data) setBusinessPlans((bpRes.data as unknown as any[]).map((p: any) => ({
      ...p,
      goals: Array.isArray(p.goals) ? p.goals : [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const saved = localStorage.getItem("business_expenses");
    if (saved) setExpenseInput(JSON.parse(saved));
  }, []);

  const saveExpenses = (updated: typeof expenseInput) => {
    setExpenseInput(updated);
    localStorage.setItem("business_expenses", JSON.stringify(updated));
  };

  const rangeMonths = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const rangeStart = startOfMonth(subMonths(new Date(), rangeMonths - 1));
  const rangeEnd = endOfMonth(new Date());
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  const svcPriceMap = useMemo(() => { const m: Record<string, number> = {}; services.forEach((s) => { m[s.name] = s.price_cents; }); return m; }, [services]);
  const coursePriceMap = useMemo(() => { const m: Record<string, number> = {}; courses.forEach((c) => { m[c.id] = c.price_cents; }); return m; }, [courses]);

  // Manual income from business_entries
  const manualIncome = useMemo(() => businessEntries.filter((e) => e.entry_type === "income" || e.entry_type === "payment").reduce((s, e) => s + e.amount_cents, 0), [businessEntries]);
  const manualExpenses = useMemo(() => businessEntries.filter((e) => e.entry_type === "expense").reduce((s, e) => s + e.amount_cents, 0), [businessEntries]);

  const sessionRevenue = useMemo(() => sessions.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0), [sessions, svcPriceMap]);
  const courseRevenue = useMemo(() => coursePurchases.reduce((sum, cp) => sum + (coursePriceMap[cp.course_id] || 0), 0), [coursePurchases, coursePriceMap]);

  const totalRevenue = (sessionRevenue + courseRevenue + manualIncome) / 100;
  const fixedExpenses = Object.values(expenseInput).reduce((a, b) => a + b, 0);
  const totalExpenses = fixedExpenses + manualExpenses / 100;
  const netProfit = totalRevenue - totalExpenses;

  const monthlyData = useMemo(() => months.map((month) => {
    const mStart = startOfMonth(month); const mEnd = endOfMonth(month);
    const sessRev = sessions.filter((s) => s.status !== "cancelled" && isWithinInterval(new Date(s.session_date), { start: mStart, end: mEnd })).reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0) / 100;
    const courseRev = coursePurchases.filter((cp) => isWithinInterval(new Date(cp.purchased_at), { start: mStart, end: mEnd })).reduce((sum, cp) => sum + (coursePriceMap[cp.course_id] || 0), 0) / 100;
    const manualRev = businessEntries.filter((e) => (e.entry_type === "income" || e.entry_type === "payment") && isWithinInterval(new Date(e.entry_date), { start: mStart, end: mEnd })).reduce((s, e) => s + e.amount_cents, 0) / 100;
    const sessionCount = sessions.filter((s) => isWithinInterval(new Date(s.session_date), { start: mStart, end: mEnd })).length;
    return { month: format(month, "MMM yy"), sessions: sessRev, courses: courseRev, manual: manualRev, total: sessRev + courseRev + manualRev, sessionCount };
  }), [months, sessions, svcPriceMap, coursePurchases, coursePriceMap, businessEntries]);

  const serviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.filter((s) => s.status !== "cancelled").forEach((s) => { counts[s.title] = (counts[s.title] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, value: count }));
  }, [sessions]);

  const newClientsPerMonth = useMemo(() => months.map((month) => {
    const mStart = startOfMonth(month); const mEnd = endOfMonth(month);
    return { month: format(month, "MMM yy"), count: clientProfiles.filter((p) => isWithinInterval(new Date(p.created_at), { start: mStart, end: mEnd })).length };
  }), [months, clientProfiles]);

  const profitPrediction = useMemo(() => {
    if (monthlyData.length < 2) return [];
    const last3 = monthlyData.slice(-3);
    const avgGrowth = last3.length > 1 ? (last3[last3.length - 1].total - last3[0].total) / (last3.length - 1) : 0;
    const lastTotal = monthlyData[monthlyData.length - 1].total;
    const predictions = [];
    for (let i = 1; i <= 3; i++) {
      const futureMonth = new Date(); futureMonth.setMonth(futureMonth.getMonth() + i);
      predictions.push({ month: format(futureMonth, "MMM yy"), total: Math.max(0, Math.round((lastTotal + avgGrowth * i) * 100) / 100), predicted: true });
    }
    return [...monthlyData.map((d) => ({ ...d, predicted: false })), ...predictions];
  }, [monthlyData]);

  const thisWeekSessions = useMemo(() => {
    const now = new Date(); const wStart = startOfWeek(now, { weekStartsOn: 0 }); const wEnd = endOfWeek(now, { weekStartsOn: 0 });
    return sessions.filter((s) => isWithinInterval(new Date(s.session_date), { start: wStart, end: wEnd }));
  }, [sessions]);

  const prevMonthRevenue = useMemo(() => {
    const pm = subMonths(new Date(), 1); const pmStart = startOfMonth(pm); const pmEnd = endOfMonth(pm);
    return sessions.filter((s) => s.status !== "cancelled" && isWithinInterval(new Date(s.session_date), { start: pmStart, end: pmEnd })).reduce((sum, s) => sum + (svcPriceMap[s.title] || 0), 0) / 100;
  }, [sessions, svcPriceMap]);

  const currentMonthRevenue = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].total : 0;
  const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <section className="pt-28 pb-20"><div className="container text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div></section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5"><BarChart3 size={22} /></div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-foreground">Business Dashboard</h1>
                  <p className="text-muted-foreground font-light">Financial overview, manual logging & business planning</p>
                </div>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Total Revenue" value={`£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} change={revenueChange} icon={DollarSign} delay={0} />
            <KPICard title="Net Profit" value={`£${netProfit.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} subtitle={totalExpenses > 0 ? `After £${totalExpenses.toLocaleString()} expenses` : "Set expenses below"} icon={TrendingUp} delay={0.05} />
            <KPICard title="Clients" value={clientProfiles.length.toString()} subtitle={`${newClientsPerMonth[newClientsPerMonth.length - 1]?.count || 0} new this month`} icon={Users} delay={0.1} />
            <KPICard title="Sessions This Week" value={thisWeekSessions.length.toString()} subtitle={`${sessions.filter((s) => s.status === "scheduled").length} upcoming`} icon={Calendar} delay={0.15} />
          </div>

          <Tabs defaultValue={new URLSearchParams(window.location.search).get("tab") || "overview"} className="space-y-6">
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="entries">Manual Entries</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="plans">Business Plans</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="xero">Xero</TabsTrigger>
            </TabsList>

            <TabsContent value="xero" className="space-y-6">
              <XeroPanel />
            </TabsContent>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle className="text-lg">Revenue Trend</CardTitle><CardDescription>All revenue sources over time</CardDescription></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(value: number) => [`£${value.toFixed(2)}`, ""]} />
                        <Area type="monotone" dataKey="sessions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" name="Sessions" />
                        <Area type="monotone" dataKey="courses" stackId="1" stroke="hsl(174,42%,42%)" fill="hsl(174,42%,42%,0.3)" name="Courses" />
                        <Area type="monotone" dataKey="manual" stackId="1" stroke="hsl(210,40%,50%)" fill="hsl(210,40%,50%,0.3)" name="Manual Income" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Service Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    {serviceBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPie>
                          <Pie data={serviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                            {serviceBreakdown.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-sm text-center py-12">No session data yet</p>}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target size={18} className="text-primary" />Revenue Forecast</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={profitPrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                      <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(value: number) => [`£${value.toFixed(2)}`, ""]} />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return payload.predicted
                          ? <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} strokeDasharray="3 3" />
                          : <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
                      }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MANUAL ENTRIES */}
            <TabsContent value="entries" className="space-y-6">
              <ManualEntriesTab
                entries={businessEntries}
                profiles={allProfiles}
                clientProfiles={clientProfiles}
                userId={user?.id || ""}
                onRefresh={fetchAll}
              />
            </TabsContent>

            {/* REVENUE */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Monthly Revenue</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessions" />
                        <Bar dataKey="courses" fill="hsl(174,42%,42%)" radius={[4, 4, 0, 0]} name="Courses" />
                        <Bar dataKey="manual" fill="hsl(210,40%,50%)" radius={[4, 4, 0, 0]} name="Manual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Revenue by Service</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.map((svc) => {
                        const count = sessions.filter((s) => s.title === svc.name && s.status !== "cancelled").length;
                        const rev = (count * svc.price_cents) / 100;
                        return (
                          <div key={svc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div><p className="font-medium text-sm text-foreground">{svc.name}</p><p className="text-xs text-muted-foreground">{count} sessions · £{(svc.price_cents / 100).toFixed(2)} each</p></div>
                            <p className="font-semibold text-primary">£{rev.toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CLIENTS (only actual clients) */}
            <TabsContent value="clients" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">New Client Registrations</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={newClientsPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Clients" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Client List</CardTitle><CardDescription>{clientProfiles.length} clients (team members excluded)</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {clientProfiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 30).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{p.full_name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* EXPENSES */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Monthly Fixed Expenses</CardTitle><CardDescription>Enter recurring costs</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(["rent", "salaries", "software", "marketing", "other"] as const).map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="text-sm font-medium text-foreground capitalize w-24">{key}</label>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                            <input type="number" value={expenseInput[key] || ""} onChange={(e) => saveExpenses({ ...expenseInput, [key]: parseFloat(e.target.value) || 0 })} className="w-full pl-7 pr-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="0" />
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between text-sm"><span className="font-medium">Fixed Expenses</span><span className="font-bold text-destructive">£{fixedExpenses.toLocaleString()}</span></div>
                        {manualExpenses > 0 && <div className="flex justify-between text-sm mt-1"><span className="font-medium">Logged Expenses</span><span className="font-bold text-destructive">£{(manualExpenses / 100).toLocaleString()}</span></div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Profit Summary</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/5 rounded-xl"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-primary">£{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p></div>
                      <div className="p-4 bg-destructive/5 rounded-xl"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-destructive">-£{totalExpenses.toLocaleString()}</p></div>
                      <div className={`p-4 rounded-xl ${netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                        <p className={`text-3xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{netProfit >= 0 ? "" : "-"}£{Math.abs(netProfit).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl"><p className="text-sm text-muted-foreground">Profit Margin</p><p className="text-xl font-bold text-foreground">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* BUSINESS PLANS */}
            <TabsContent value="plans" className="space-y-6">
              <BusinessPlansTab plans={businessPlans} userId={user?.id || ""} onRefresh={fetchAll} />
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity size={18} className="text-primary" />Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <RecentActivityList sessions={sessions} coursePurchases={coursePurchases} courses={courses} svcPriceMap={svcPriceMap} coursePriceMap={coursePriceMap} businessEntries={businessEntries} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// ─── Manual Entries Tab ─────────────────────────────
function ManualEntriesTab({ entries, profiles, clientProfiles, userId, onRefresh }: {
  entries: BusinessEntry[]; profiles: Profile[]; clientProfiles: Profile[]; userId: string; onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ entry_type: "income", category: "general", title: "", description: "", amount: "", client_id: "", entry_date: format(new Date(), "yyyy-MM-dd") });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("business_entries" as any).insert({
      created_by: userId,
      entry_type: form.entry_type,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      amount_cents: Math.round(parseFloat(form.amount || "0") * 100),
      client_id: form.client_id || null,
      entry_date: new Date(form.entry_date).toISOString(),
    } as any);
    setSaving(false);
    if (error) { toast({ title: "Error saving entry", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Entry saved" });
    setOpen(false);
    setForm({ entry_type: "income", category: "general", title: "", description: "", amount: "", client_id: "", entry_date: format(new Date(), "yyyy-MM-dd") });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("business_entries" as any).delete().eq("id", id);
    toast({ title: "Entry deleted" });
    onRefresh();
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.entry_type === filter);
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));

  const typeIcon = (t: string) => {
    switch (t) { case "income": return <HandCoins size={14} />; case "expense": return <Receipt size={14} />; case "payment": return <DollarSign size={14} />; case "meeting": return <Calendar size={14} />; default: return <ClipboardList size={14} />; }
  };
  const typeColor = (t: string) => {
    switch (t) { case "income": case "payment": return "bg-primary/10 text-primary"; case "expense": return "bg-destructive/10 text-destructive"; default: return "bg-accent text-accent-foreground"; }
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {["all", "income", "expense", "payment", "meeting"].map((t) => (
            <Button key={t} variant={filter === t ? "default" : "outline"} size="sm" onClick={() => setFilter(t)} className="capitalize">{t}</Button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus size={16} className="mr-1" />Add Entry</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Business Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="payment">Client Payment</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Session payment from client" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount (£)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
                <div><Label>Date</Label><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} /></div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                    <SelectItem value="supervision">Supervision</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client (optional)</Label>
                <Select value={form.client_id || "none"} onValueChange={(v) => setForm({ ...form, client_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="No client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clientProfiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || "Unnamed"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Entry"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No entries yet. Click "Add Entry" to log payments, meetings, or expenses.</p>}
        {filtered.map((entry) => (
          <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${typeColor(entry.entry_type)}`}>{typeIcon(entry.entry_type)}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.entry_date), "dd MMM yyyy")}
                  {entry.client_id && ` · ${profileMap[entry.client_id] || "Client"}`}
                  {entry.category !== "general" && ` · ${entry.category}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {entry.amount_cents > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {entry.entry_type === "expense" ? "-" : ""}£{(entry.amount_cents / 100).toFixed(2)}
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></Button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ─── Business Plans Tab ─────────────────────────────
function BusinessPlansTab({ plans, userId, onRefresh }: { plans: BusinessPlan[]; userId: string; onRefresh: () => void }) {
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", shared_with_team: false, status: "draft" });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");

  const startCreate = () => {
    setForm({ title: "", content: "", shared_with_team: false, status: "draft" });
    setGoals([]);
    setEditId(null);
    setCreating(true);
  };

  const startEdit = (plan: BusinessPlan) => {
    setForm({ title: plan.title, content: plan.content, shared_with_team: plan.shared_with_team, status: plan.status });
    setGoals(plan.goals || []);
    setEditId(plan.id);
    setCreating(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const payload = { ...form, goals: JSON.stringify(goals), updated_at: new Date().toISOString() } as any;
    if (editId) {
      await supabase.from("business_plans" as any).update(payload).eq("id", editId);
    } else {
      await supabase.from("business_plans" as any).insert({ ...payload, created_by: userId } as any);
    }
    toast({ title: editId ? "Plan updated" : "Plan created" });
    setCreating(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("business_plans" as any).delete().eq("id", id);
    toast({ title: "Plan deleted" });
    onRefresh();
  };

  const toggleShare = async (plan: BusinessPlan) => {
    await supabase.from("business_plans" as any).update({ shared_with_team: !plan.shared_with_team } as any).eq("id", plan.id);
    toast({ title: plan.shared_with_team ? "Unshared from team" : "Shared with team" });
    onRefresh();
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals([...goals, { text: newGoal.trim(), done: false }]);
    setNewGoal("");
  };

  if (creating) {
    return (
      <Card>
        <CardHeader><CardTitle>{editId ? "Edit Plan" : "New Business Plan"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Plan Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q2 2026 Growth Strategy" /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Plan Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Outline your business plan, strategies, targets..." /></div>
          <div>
            <Label>Goals & Milestones</Label>
            <div className="space-y-2 mt-2">
              {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <button onClick={() => { const ng = [...goals]; ng[i] = { ...g, done: !g.done }; setGoals(ng); }} className="shrink-0">
                    <CheckCircle2 size={16} className={g.done ? "text-primary" : "text-muted-foreground"} />
                  </button>
                  <span className={`text-sm flex-1 ${g.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.text}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setGoals(goals.filter((_, j) => j !== i))}><Trash2 size={12} /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a goal..." onKeyDown={(e) => e.key === "Enter" && addGoal()} />
                <Button size="sm" variant="outline" onClick={addGoal}><Plus size={14} /></Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.shared_with_team} onCheckedChange={(v) => setForm({ ...form, shared_with_team: v })} />
            <Label>Share with team</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1"><Save size={16} className="mr-1" />Save Plan</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{plans.length} plan{plans.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={startCreate}><Plus size={16} className="mr-1" />New Plan</Button>
      </div>
      {plans.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No business plans yet. Create one to outline your strategy and share with the team.</CardContent></Card>}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <CardDescription>{format(new Date(plan.updated_at), "dd MMM yyyy")}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant={plan.status === "active" ? "default" : "secondary"}>{plan.status}</Badge>
                  {plan.shared_with_team && <Badge variant="outline" className="text-xs"><Share2 size={10} className="mr-1" />Team</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {plan.content && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{plan.content}</p>}
              {plan.goals.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-foreground">{plan.goals.filter((g) => g.done).length}/{plan.goals.length} goals completed</p>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(plan.goals.filter((g) => g.done).length / plan.goals.length) * 100}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(plan)}><Edit2 size={12} className="mr-1" />Edit</Button>
                <Button variant="outline" size="sm" onClick={() => toggleShare(plan)}><Share2 size={12} className="mr-1" />{plan.shared_with_team ? "Unshare" : "Share"}</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(plan.id)}><Trash2 size={12} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

// ─── Recent Activity ────────────────────────────────
function RecentActivityList({ sessions, coursePurchases, courses, svcPriceMap, coursePriceMap, businessEntries }: {
  sessions: Session[]; coursePurchases: CoursePurchase[]; courses: { id: string; title: string; price_cents: number }[]; svcPriceMap: Record<string, number>; coursePriceMap: Record<string, number>; businessEntries: BusinessEntry[];
}) {
  const items = useMemo(() => {
    const all: { date: string; type: string; description: string; amount: number }[] = [];
    sessions.slice(0, 20).forEach((s) => all.push({ date: s.session_date, type: "session", description: `${s.title} (${s.status})`, amount: (svcPriceMap[s.title] || 0) / 100 }));
    coursePurchases.slice(0, 10).forEach((cp) => {
      const course = courses.find((c) => c.id === cp.course_id);
      all.push({ date: cp.purchased_at, type: "course", description: `Course: ${course?.title || "Unknown"}`, amount: (coursePriceMap[cp.course_id] || 0) / 100 });
    });
    businessEntries.slice(0, 15).forEach((e) => all.push({ date: e.entry_date, type: e.entry_type, description: e.title, amount: e.amount_cents / 100 }));
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
  }, [sessions, coursePurchases, courses, svcPriceMap, coursePriceMap, businessEntries]);

  if (items.length === 0) return <p className="text-muted-foreground text-sm text-center py-8">No activity yet</p>;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${item.type === "expense" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              {item.type === "session" ? <Calendar size={14} /> : item.type === "course" ? <BookOpen size={14} /> : item.type === "expense" ? <Receipt size={14} /> : <DollarSign size={14} />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(item.date), "dd MMM yyyy, HH:mm")}</p>
            </div>
          </div>
          {item.amount > 0 && <Badge variant="secondary" className="font-mono">{item.type === "expense" ? "-" : ""}£{item.amount.toFixed(2)}</Badge>}
        </motion.div>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────
function KPICard({ title, value, change, subtitle, icon: Icon, delay }: { title: string; value: string; change?: number; subtitle?: string; icon: React.ElementType; delay: number; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2"><Icon size={16} /></div>
            {change !== undefined && change !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${change > 0 ? "text-primary" : "text-destructive"}`}>
                {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle || title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BusinessDashboard;
