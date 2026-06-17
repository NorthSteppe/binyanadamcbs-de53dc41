import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Calendar,
  BarChart3, ArrowUpRight, ArrowDownRight,
  BookOpen, Activity, Plus, Trash2,
  FileText, Share2, CheckCircle2, Edit2, Save,
  Receipt, HandCoins, ClipboardList,
  Plug, RefreshCw, Loader2, AlertTriangle, Banknote, Link2, ExternalLink, Search,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

// ─── Types ──────────────────────────────────────────
interface Session { id: string; client_id: string; title: string; session_date: string; duration_minutes: number; status: string; description: string | null; created_at: string; therapist_id: string | null; therapist_rate_cents: number; therapist_paid: boolean; }
interface ServiceOption { id: string; name: string; price_cents: number; duration_minutes: number; }
interface CoursePurchase { id: string; course_id: string; user_id: string; purchased_at: string; }
interface Profile { id: string; full_name: string; created_at: string; }
interface BusinessEntry { id: string; created_by: string; entry_type: string; category: string; title: string; description: string; amount_cents: number; client_id: string | null; entry_date: string; created_at: string; }
interface BusinessPlan { id: string; created_by: string; title: string; content: string; goals: Goal[]; shared_with_team: boolean; status: string; created_at: string; updated_at: string; }
interface Goal { text: string; done: boolean; }

interface XeroContact { contact_id: string; name: string; email: string | null; status: string | null; }
interface XeroInvoice { invoice_id: string; invoice_number: string | null; contact_id: string | null; contact_name: string | null; status: string | null; date: string | null; due_date: string | null; currency: string; total: number; amount_due: number; amount_paid: number; fully_paid_on: string | null; }
interface XeroSummary { ok: boolean; connected?: boolean; currency?: string; tenant_name?: string; last_synced_at?: string; summary?: { revenue_paid: number; outstanding: number; overdue: number; draft_total: number; count_paid: number; count_outstanding: number; count_overdue: number; count_draft: number; invoice_count: number; }; monthly?: { month: string; total: number }[]; error?: string; }
interface ManualClient { id: string; full_name: string; email: string; xero_contact_id: string | null; }
interface LocalProfile { id: string; full_name: string; xero_contact_id: string | null; }

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  AUTHORISED: "bg-amber-100 text-amber-800 border-amber-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  VOIDED: "bg-red-100 text-red-700 border-red-200",
};
const money = (v: number, ccy = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy || "GBP" }).format(v || 0);

// ─── Main Component ─────────────────────────────────
const BusinessDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coursePurchases, setCoursePurchases] = useState<CoursePurchase[]>([]);
  const [clientProfiles, setClientProfiles] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [profilesXero, setProfilesXero] = useState<LocalProfile[]>([]);
  const [manualClients, setManualClients] = useState<ManualClient[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; price_cents: number }[]>([]);
  const [businessEntries, setBusinessEntries] = useState<BusinessEntry[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [xeroSummary, setXeroSummary] = useState<XeroSummary | null>(null);
  const [xeroContacts, setXeroContacts] = useState<XeroContact[]>([]);
  const [xeroInvoices, setXeroInvoices] = useState<XeroInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingXero, setRefreshingXero] = useState(false);
  const [timeRange, setTimeRange] = useState("6months");
  const [expenseInput, setExpenseInput] = useState({ rent: 0, salaries: 0, software: 0, marketing: 0, other: 0 });
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [clientSearch, setClientSearch] = useState("");
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; kind: "profile" | "manual"; id: string; name: string } | null>(null);

  const fetchXero = useCallback(async () => {
    setRefreshingXero(true);
    try {
      const [sumRes, ctxRes, invRes] = await Promise.all([
        supabase.functions.invoke<XeroSummary>("xero-live", { body: { action: "summary" } }),
        supabase.functions.invoke<{ ok: boolean; contacts: XeroContact[] }>("xero-live", { body: { action: "contacts" } }),
        supabase.functions.invoke<{ ok: boolean; invoices: XeroInvoice[] }>("xero-live", { body: { action: "invoices" } }),
      ]);
      if (sumRes.data) setXeroSummary(sumRes.data);
      if (ctxRes.data?.ok) setXeroContacts(ctxRes.data.contacts || []);
      if (invRes.data?.ok) setXeroInvoices(invRes.data.invoices || []);
    } catch (e) {
      console.error("Xero fetch failed", e);
    } finally {
      setRefreshingXero(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sessRes, svcRes, cpRes, profRes, profXeroRes, manualRes, courseRes, rolesRes, beRes, bpRes] = await Promise.all([
      (supabase as any).from("staff_sessions").select("id, client_id, title, session_date, duration_minutes, status, description, created_at, therapist_id, therapist_rate_cents, therapist_paid").order("session_date", { ascending: false }),
      (supabase as any).rpc("admin_list_service_options"),
      supabase.from("course_purchases").select("*"),
      supabase.from("profiles").select("id, full_name, created_at"),
      supabase.from("profiles").select("id, full_name, xero_contact_id"),
      supabase.from("manual_clients").select("id, full_name, email, xero_contact_id"),
      supabase.from("courses").select("id, title, price_cents"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("business_entries" as any).select("*").order("entry_date", { ascending: false }),
      supabase.from("business_plans" as any).select("*").order("updated_at", { ascending: false }),
    ]);
    if (sessRes.data) setSessions(sessRes.data as unknown as Session[]);
    if (svcRes.data) setServices(svcRes.data as unknown as ServiceOption[]);
    if (cpRes.data) setCoursePurchases(cpRes.data as unknown as CoursePurchase[]);
    if (courseRes.data) setCourses(courseRes.data as unknown as typeof courses);

    const staffIds = new Set<string>();
    const clientIds = new Set<string>();
    if (rolesRes.data) (rolesRes.data as any[]).forEach((r: any) => {
      if (r.role !== "client") staffIds.add(r.user_id);
      if (r.role === "client") clientIds.add(r.user_id);
    });
    const allProfs = (profRes.data || []) as unknown as Profile[];
    setAllProfiles(allProfs);
    setClientProfiles(allProfs.filter((p) => !staffIds.has(p.id)));
    setProfilesXero(((profXeroRes.data as LocalProfile[] | null) || []).filter((p) => clientIds.has(p.id)));
    setManualClients((manualRes.data as ManualClient[] | null) || []);

    if (beRes.data) setBusinessEntries(beRes.data as unknown as BusinessEntry[]);
    if (bpRes.data) setBusinessPlans((bpRes.data as unknown as any[]).map((p: any) => ({ ...p, goals: Array.isArray(p.goals) ? p.goals : [] })));
    setLoading(false);
    fetchXero();
  }, [fetchXero]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const saved = localStorage.getItem("business_expenses"); if (saved) setExpenseInput(JSON.parse(saved)); }, []);

  const saveExpenses = (updated: typeof expenseInput) => {
    setExpenseInput(updated);
    localStorage.setItem("business_expenses", JSON.stringify(updated));
  };

  const rangeMonths = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const months = eachMonthOfInterval({ start: startOfMonth(subMonths(new Date(), rangeMonths - 1)), end: endOfMonth(new Date()) });

  const svcPriceMap = useMemo(() => { const m: Record<string, number> = {}; services.forEach((s) => { m[s.name] = s.price_cents; }); return m; }, [services]);
  const coursePriceMap = useMemo(() => { const m: Record<string, number> = {}; courses.forEach((c) => { m[c.id] = c.price_cents; }); return m; }, [courses]);

  const ccy = xeroSummary?.currency || "GBP";
  const connected = !!xeroSummary?.ok && xeroSummary?.connected !== false && !xeroSummary?.error;
  const xs = xeroSummary?.summary;

  const xeroRevenuePaid = xs?.revenue_paid ?? 0;
  const xeroOutstanding = xs?.outstanding ?? 0;
  const xeroOverdue = xs?.overdue ?? 0;
  const xeroDrafts = xs?.draft_total ?? 0;

  // ── Therapist payouts owed (operational expense) ──
  const therapistPayoutsOwed = useMemo(
    () => sessions.filter((s) => s.status !== "cancelled" && !s.therapist_paid && (s.therapist_rate_cents || 0) > 0)
                  .reduce((sum, s) => sum + (s.therapist_rate_cents || 0), 0) / 100,
    [sessions]
  );
  const therapistPayoutsPaid = useMemo(
    () => sessions.filter((s) => s.therapist_paid && (s.therapist_rate_cents || 0) > 0)
                  .reduce((sum, s) => sum + (s.therapist_rate_cents || 0), 0) / 100,
    [sessions]
  );
  const payoutSessionsOwed = useMemo(
    () => sessions.filter((s) => !s.therapist_paid && s.therapist_rate_cents > 0 && s.status !== "cancelled").length,
    [sessions]
  );

  const payoutsByTherapist = useMemo(() => {
    const map = new Map<string, { name: string; owed: number; paid: number; sessions: number }>();
    const nameMap: Record<string, string> = {};
    allProfiles.forEach((p) => { nameMap[p.id] = p.full_name; });
    sessions.forEach((s) => {
      if (!s.therapist_id || !s.therapist_rate_cents) return;
      if (s.status === "cancelled") return;
      const cur = map.get(s.therapist_id) || { name: nameMap[s.therapist_id] || "Unknown", owed: 0, paid: 0, sessions: 0 };
      if (s.therapist_paid) cur.paid += s.therapist_rate_cents / 100;
      else cur.owed += s.therapist_rate_cents / 100;
      cur.sessions += 1;
      map.set(s.therapist_id, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.owed - a.owed);
  }, [sessions, allProfiles]);

  const manualIncome = useMemo(() => businessEntries.filter((e) => e.entry_type === "income" || e.entry_type === "payment").reduce((s, e) => s + e.amount_cents, 0) / 100, [businessEntries]);
  const manualExpenses = useMemo(() => businessEntries.filter((e) => e.entry_type === "expense").reduce((s, e) => s + e.amount_cents, 0) / 100, [businessEntries]);

  const fixedExpenses = Object.values(expenseInput).reduce((a, b) => a + b, 0);
  const totalRevenue = xeroRevenuePaid + manualIncome;
  const totalExpenses = fixedExpenses + manualExpenses + therapistPayoutsOwed + therapistPayoutsPaid;
  const netProfit = totalRevenue - totalExpenses;

  const xeroMonthly = useMemo(
    () => (xeroSummary?.monthly || []).map((m) => ({ month: format(new Date(m.month + "-01"), "MMM yy"), revenue: m.total })),
    [xeroSummary]
  );

  const newClientsPerMonth = useMemo(() => months.map((month) => {
    const mStart = startOfMonth(month); const mEnd = endOfMonth(month);
    return { month: format(month, "MMM yy"), count: clientProfiles.filter((p) => isWithinInterval(new Date(p.created_at), { start: mStart, end: mEnd })).length };
  }), [months, clientProfiles]);

  const thisWeekSessions = useMemo(() => {
    const now = new Date(); const wStart = startOfWeek(now, { weekStartsOn: 0 }); const wEnd = endOfWeek(now, { weekStartsOn: 0 });
    return sessions.filter((s) => isWithinInterval(new Date(s.session_date), { start: wStart, end: wEnd }));
  }, [sessions]);

  // Unified client directory (Xero ∪ portal ∪ manual)
  const unifiedClients = useMemo(() => {
    const rows: { key: string; name: string; email: string | null; source: ("xero"|"portal"|"manual")[]; xero_contact_id: string | null; linked_locally: boolean; portal_id?: string; manual_id?: string; }[] = [];
    const byXeroId = new Map<string, typeof rows[number]>();
    const byEmail = new Map<string, typeof rows[number]>();
    const norm = (e: string | null) => (e || "").trim().toLowerCase();
    for (const c of xeroContacts) {
      const r = { key: `x:${c.contact_id}`, name: c.name, email: c.email, source: ["xero" as const], xero_contact_id: c.contact_id, linked_locally: false };
      rows.push(r); byXeroId.set(c.contact_id, r); if (c.email) byEmail.set(norm(c.email), r);
    }
    for (const p of profilesXero) {
      let row = p.xero_contact_id ? byXeroId.get(p.xero_contact_id) : undefined;
      if (!row) row = rows.find((r) => r.name.trim().toLowerCase() === (p.full_name || "").trim().toLowerCase());
      if (row) { row.source.push("portal"); row.portal_id = p.id; row.linked_locally = !!p.xero_contact_id; }
      else rows.push({ key: `p:${p.id}`, name: p.full_name || "Unnamed", email: null, source: ["portal"], xero_contact_id: p.xero_contact_id, linked_locally: !!p.xero_contact_id, portal_id: p.id });
    }
    for (const m of manualClients) {
      let row = m.xero_contact_id ? byXeroId.get(m.xero_contact_id) : undefined;
      if (!row && m.email) row = byEmail.get(norm(m.email));
      if (!row) row = rows.find((r) => r.name.trim().toLowerCase() === (m.full_name || "").trim().toLowerCase());
      if (row) { row.source.push("manual"); row.manual_id = m.id; row.linked_locally = row.linked_locally || !!m.xero_contact_id; }
      else rows.push({ key: `m:${m.id}`, name: m.full_name || "Unnamed", email: m.email || null, source: ["manual"], xero_contact_id: m.xero_contact_id, linked_locally: !!m.xero_contact_id, manual_id: m.id });
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [xeroContacts, profilesXero, manualClients]);

  // Only show actual clients: portal users with the client role, or manual clients.
  // Raw Xero-only contacts (suppliers/other contacts like "NEXT") are excluded here.
  const clientIdSet = useMemo(() => new Set(clientProfiles.map((p) => p.id)), [clientProfiles]);
  const realClients = useMemo(
    () => unifiedClients.filter((r) => (r.portal_id && clientIdSet.has(r.portal_id)) || !!r.manual_id),
    [unifiedClients, clientIdSet],
  );
  const filteredUnified = realClients.filter((r) => !clientSearch || r.name.toLowerCase().includes(clientSearch.toLowerCase()) || (r.email || "").toLowerCase().includes(clientSearch.toLowerCase()));
  const filteredInvoices = xeroInvoices.filter((i) => invoiceStatusFilter === "all" || i.status === invoiceStatusFilter);

  const connectXero = async () => {
    const { data, error } = await supabase.functions.invoke("xero-oauth-start");
    if (error || !data?.url) { toast({ title: "Could not start Xero auth", variant: "destructive" }); return; }
    window.location.href = data.url;
  };

  const linkLocalToXero = async (xeroContactId: string) => {
    if (!linkDialog) return;
    const table = linkDialog.kind === "profile" ? "profiles" : "manual_clients";
    const { error } = await supabase.from(table).update({ xero_contact_id: xeroContactId }).eq("id", linkDialog.id);
    if (error) { toast({ title: "Link failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Linked to Xero contact" });
    setLinkDialog(null);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <section className="pt-28 pb-20"><div className="container text-center"><Loader2 className="animate-spin mx-auto text-primary" size={28} /></div></section>
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
                  <p className="text-muted-foreground font-light">
                    {connected
                      ? <>Live finance from Xero{xeroSummary?.tenant_name ? ` · ${xeroSummary.tenant_name}` : ""}</>
                      : <>Xero not connected — connect to populate finance figures.</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {connected ? (
                  <Button variant="outline" size="sm" onClick={fetchXero} disabled={refreshingXero}>
                    {refreshingXero ? <Loader2 className="animate-spin mr-2" size={14} /> : <RefreshCw size={14} className="mr-2" />}
                    Sync Xero
                  </Button>
                ) : (
                  <Button size="sm" onClick={connectXero}><Plug size={14} className="mr-2" />Connect Xero</Button>
                )}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="12months">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/business-maths")}>
                  <ExternalLink size={14} className="mr-2" /> Revenue planner
                </Button>
              </div>
            </div>
          </motion.div>

          {!connected && (
            <Card className="mb-8 border-amber-200 bg-amber-50/40">
              <CardContent className="py-5 flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Finance figures are unavailable until Xero is connected.</p>
                  <p className="text-muted-foreground mt-1">{xeroSummary?.error || "All revenue, invoicing, overdue and client billing data flow from Xero."}</p>
                  <Button size="sm" className="mt-3" onClick={connectXero}><Plug size={14} className="mr-2" />Connect Xero</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards — Xero-anchored + payout obligations */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <KPICard title="Revenue (Xero, paid)" value={money(xeroRevenuePaid, ccy)} subtitle={`${xs?.count_paid ?? 0} paid invoices`} icon={TrendingUp} delay={0} />
            <KPICard title="Outstanding (Xero)" value={money(xeroOutstanding, ccy)} subtitle={`${xs?.count_outstanding ?? 0} awaiting payment`} icon={Banknote} delay={0.05} tone={xeroOutstanding > 0 ? "amber" : undefined} />
            <KPICard title="Overdue (Xero)" value={money(xeroOverdue, ccy)} subtitle={`${xs?.count_overdue ?? 0} past due`} icon={AlertTriangle} delay={0.1} tone={xeroOverdue > 0 ? "rose" : undefined} />
            <KPICard title="Therapist Payouts Owed" value={money(therapistPayoutsOwed, ccy)} subtitle={`${payoutSessionsOwed} sessions awaiting payout`} icon={HandCoins} delay={0.15} tone={therapistPayoutsOwed > 0 ? "amber" : undefined} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Drafts (Xero)" value={money(xeroDrafts, ccy)} subtitle={`${xs?.count_draft ?? 0} ready to send`} icon={FileText} delay={0.2} onClick={() => navigate("/admin/xero-drafts")} />
            <KPICard title="Net Profit" value={money(netProfit, ccy)} subtitle={`After ${money(totalExpenses, ccy)} total costs`} icon={DollarSign} delay={0.25} tone={netProfit < 0 ? "rose" : undefined} />
            <KPICard title="Clients" value={clientProfiles.length.toString()} subtitle={`${newClientsPerMonth[newClientsPerMonth.length - 1]?.count || 0} new this month`} icon={Users} delay={0.3} />
            <KPICard title="Sessions This Week" value={thisWeekSessions.length.toString()} subtitle={`${sessions.filter((s) => s.status === "scheduled").length} upcoming`} icon={Calendar} delay={0.35} />
          </div>

          <Tabs defaultValue={new URLSearchParams(window.location.search).get("tab") || "overview"} className="space-y-6">
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices (Xero)</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="payouts">Therapist Payouts</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="entries">Manual Entries</TabsTrigger>
              <TabsTrigger value="plans">Business Plans</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue (Xero, last 12 months)</CardTitle>
                    <CardDescription>From PAID + AUTHORISED ACCREC invoices.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {connected && xeroMonthly.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={xeroMonthly}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => money(v, ccy)} />
                          <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => money(v, ccy)} />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" name="Revenue" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-12">{connected ? "No invoice data yet." : "Connect Xero to see revenue."}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Outstanding finance issues</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <IssueRow label="Overdue invoices" value={money(xeroOverdue, ccy)} count={xs?.count_overdue ?? 0} tone="rose" />
                    <IssueRow label="Awaiting payment" value={money(Math.max(0, xeroOutstanding - xeroOverdue), ccy)} count={Math.max(0, (xs?.count_outstanding ?? 0) - (xs?.count_overdue ?? 0))} tone="amber" />
                    <IssueRow label="Draft invoices" value={money(xeroDrafts, ccy)} count={xs?.count_draft ?? 0} tone="slate" />
                    <IssueRow label="Therapist payouts owed" value={money(therapistPayoutsOwed, ccy)} count={payoutSessionsOwed} tone="amber" />
                    <div className="pt-3 border-t border-border">
                      <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/admin/payouts")}>
                        Manage payouts <ExternalLink size={12} className="ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* INVOICES (Xero) */}
            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                  <div><CardTitle>Recent invoices</CardTitle><CardDescription>Live from Xero</CardDescription></div>
                  <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="AUTHORISED">Authorised</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="VOIDED">Voided</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {!connected ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Connect Xero to view invoices.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead><TableHead>Contact</TableHead><TableHead>Date</TableHead>
                          <TableHead>Due</TableHead><TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead><TableHead className="text-right">Due</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((i) => (
                          <TableRow key={i.invoice_id}>
                            <TableCell className="font-mono text-xs">{i.invoice_number || "—"}</TableCell>
                            <TableCell>{i.contact_name || "—"}</TableCell>
                            <TableCell className="text-xs">{i.date ? format(new Date(i.date), "d MMM yyyy") : "—"}</TableCell>
                            <TableCell className="text-xs">{i.due_date ? format(new Date(i.due_date), "d MMM yyyy") : "—"}</TableCell>
                            <TableCell><Badge variant="outline" className={`text-xs ${STATUS_COLOR[i.status || ""] || ""}`}>{i.status}</Badge></TableCell>
                            <TableCell className="text-right">{money(i.total, i.currency)}</TableCell>
                            <TableCell className="text-right">{money(i.amount_due, i.currency)}</TableCell>
                          </TableRow>
                        ))}
                        {filteredInvoices.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No invoices.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLIENTS (unified Xero+portal+manual) */}
            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle>Client directory</CardTitle>
                      <CardDescription>Portal and manual clients. Open a client's record, book a session, or link them to a Xero contact for billing.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/clients")}>
                      <ExternalLink size={12} className="mr-1.5" /> Full clients page
                    </Button>
                  </div>
                  <div className="relative mt-3 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by name or email…" className="pl-9" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Source</TableHead><TableHead>Xero link</TableHead><TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnified.map((r) => (
                        <TableRow key={r.key}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.email || "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {r.source.includes("xero") && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Xero</Badge>}
                              {r.source.includes("portal") && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Portal</Badge>}
                              {r.source.includes("manual") && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Manual</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {r.xero_contact_id
                              ? <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 size={10}/> Linked</Badge>
                              : <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">Not linked</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {r.portal_id && (
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/clients/${r.portal_id}`)}>
                                  <ExternalLink size={12} className="mr-1"/>Open
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => {
                                const bookId = r.portal_id ?? (r.manual_id ? `manual:${r.manual_id}` : null);
                                if (bookId) navigate(`/admin/calendar?book=${encodeURIComponent(bookId)}`);
                              }}>
                                <Calendar size={12} className="mr-1"/>Book
                              </Button>
                              {!r.xero_contact_id && (r.portal_id || r.manual_id) && (
                                <Button size="sm" variant="outline" onClick={() => setLinkDialog({
                                  open: true, kind: r.portal_id ? "profile" : "manual",
                                  id: (r.portal_id || r.manual_id)!, name: r.name,
                                })}>
                                  <Link2 size={12} className="mr-1"/>Link to Xero
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUnified.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No clients.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* THERAPIST PAYOUTS */}
            <TabsContent value="payouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Therapist payouts</CardTitle>
                  <CardDescription>Operational cost of sessions delivered. Owed amounts are unpaid liabilities; raise as Xero bills or pay directly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-amber-50 rounded-xl"><p className="text-xs text-muted-foreground">Owed</p><p className="text-2xl font-bold text-amber-700">{money(therapistPayoutsOwed, ccy)}</p></div>
                    <div className="p-4 bg-emerald-50 rounded-xl"><p className="text-xs text-muted-foreground">Paid (lifetime)</p><p className="text-2xl font-bold text-emerald-700">{money(therapistPayoutsPaid, ccy)}</p></div>
                    <div className="p-4 bg-muted/40 rounded-xl"><p className="text-xs text-muted-foreground">Therapists with payouts</p><p className="text-2xl font-bold text-foreground">{payoutsByTherapist.length}</p></div>
                  </div>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Therapist</TableHead><TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Owed</TableHead><TableHead className="text-right">Paid</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {payoutsByTherapist.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">{p.sessions}</TableCell>
                          <TableCell className="text-right text-amber-700 font-semibold">{money(p.owed, ccy)}</TableCell>
                          <TableCell className="text-right text-emerald-700">{money(p.paid, ccy)}</TableCell>
                        </TableRow>
                      ))}
                      {payoutsByTherapist.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payout obligations yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => navigate("/admin/payouts")}>
                      Open payouts manager <ExternalLink size={12} className="ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXPENSES */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Monthly fixed expenses</CardTitle><CardDescription>Recurring overheads not yet tracked in Xero</CardDescription></CardHeader>
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
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Cost breakdown</CardTitle><CardDescription>What drives total expenses</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <ExpenseRow label="Therapist payouts (owed)" value={therapistPayoutsOwed} ccy={ccy} tone="amber" />
                      <ExpenseRow label="Therapist payouts (paid lifetime)" value={therapistPayoutsPaid} ccy={ccy} tone="muted" />
                      <ExpenseRow label="Fixed overheads" value={fixedExpenses} ccy={ccy} />
                      <ExpenseRow label="Manual expenses logged" value={manualExpenses} ccy={ccy} />
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="font-semibold text-foreground">Total expenses</span>
                        <span className="font-bold text-destructive text-lg">{money(totalExpenses, ccy)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue (Xero paid + manual)</span>
                        <span className="font-semibold text-primary">{money(totalRevenue, ccy)}</span>
                      </div>
                      <div className={`p-3 rounded-xl ${netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">Net profit</span>
                          <span className={`text-xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{money(netProfit, ccy)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Margin: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* MANUAL ENTRIES */}
            <TabsContent value="entries" className="space-y-6">
              <ManualEntriesTab entries={businessEntries} profiles={allProfiles} clientProfiles={clientProfiles} userId={user?.id || ""} onRefresh={fetchAll} />
            </TabsContent>

            {/* BUSINESS PLANS */}
            <TabsContent value="plans" className="space-y-6">
              <BusinessPlansTab plans={businessPlans} userId={user?.id || ""} onRefresh={fetchAll} />
            </TabsContent>

            {/* ACTIVITY */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity size={18} className="text-primary" />Recent activity</CardTitle></CardHeader>
                <CardContent>
                  <RecentActivityList sessions={sessions} coursePurchases={coursePurchases} courses={courses} svcPriceMap={svcPriceMap} coursePriceMap={coursePriceMap} businessEntries={businessEntries} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />

      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Link {linkDialog?.name} to a Xero contact</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {xeroContacts.map((c) => (
              <button key={c.contact_id}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                onClick={() => linkLocalToXero(c.contact_id)}>
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email || "no email"}</div>
              </button>
            ))}
            {xeroContacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No Xero contacts loaded.</p>}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setLinkDialog(null)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Small helpers ──────────────────────────────────
function IssueRow({ label, value, count, tone }: { label: string; value: string; count: number; tone: "rose" | "amber" | "slate" }) {
  const colour = tone === "rose" ? "text-rose-700 bg-rose-50" : tone === "amber" ? "text-amber-700 bg-amber-50" : "text-slate-700 bg-slate-50";
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${colour}`}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-80">{count} item{count !== 1 ? "s" : ""}</p>
      </div>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function ExpenseRow({ label, value, ccy, tone }: { label: string; value: number; ccy: string; tone?: "amber" | "muted" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={tone === "muted" ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={`font-semibold ${tone === "amber" ? "text-amber-700" : tone === "muted" ? "text-muted-foreground" : "text-foreground"}`}>{money(value, ccy)}</span>
    </div>
  );
}

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

  const startCreate = () => { setForm({ title: "", content: "", shared_with_team: false, status: "draft" }); setGoals([]); setEditId(null); setCreating(true); };
  const startEdit = (plan: BusinessPlan) => { setForm({ title: plan.title, content: plan.content, shared_with_team: plan.shared_with_team, status: plan.status }); setGoals(plan.goals || []); setEditId(plan.id); setCreating(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const payload = { ...form, goals: JSON.stringify(goals), updated_at: new Date().toISOString() } as any;
    if (editId) await supabase.from("business_plans" as any).update(payload).eq("id", editId);
    else await supabase.from("business_plans" as any).insert({ ...payload, created_by: userId } as any);
    toast({ title: editId ? "Plan updated" : "Plan created" });
    setCreating(false); onRefresh();
  };
  const handleDelete = async (id: string) => { await supabase.from("business_plans" as any).delete().eq("id", id); toast({ title: "Plan deleted" }); onRefresh(); };
  const toggleShare = async (plan: BusinessPlan) => { await supabase.from("business_plans" as any).update({ shared_with_team: !plan.shared_with_team } as any).eq("id", plan.id); toast({ title: plan.shared_with_team ? "Unshared from team" : "Shared with team" }); onRefresh(); };
  const addGoal = () => { if (!newGoal.trim()) return; setGoals([...goals, { text: newGoal.trim(), done: false }]); setNewGoal(""); };

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
          <div className="flex items-center gap-2"><Switch checked={form.shared_with_team} onCheckedChange={(v) => setForm({ ...form, shared_with_team: v })} /><Label>Share with team</Label></div>
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
      {plans.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No business plans yet.</CardContent></Card>}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div><CardTitle className="text-base">{plan.title}</CardTitle><CardDescription>{format(new Date(plan.updated_at), "dd MMM yyyy")}</CardDescription></div>
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
function KPICard({ title, value, change, subtitle, icon: Icon, delay, tone, onClick }: { title: string; value: string; change?: number; subtitle?: string; icon: React.ElementType; delay: number; tone?: "rose" | "amber"; onClick?: () => void }) {
  const iconBg = tone === "rose" ? "bg-rose-100 text-rose-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined} className={onClick ? "cursor-pointer transition-shadow hover:shadow-md hover:border-primary/40" : undefined}>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between mb-2">
            <div className={`rounded-lg p-2 ${iconBg}`}><Icon size={16} /></div>
            {change !== undefined && change !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${change > 0 ? "text-primary" : "text-destructive"}`}>
                {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle || title}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BusinessDashboard;
