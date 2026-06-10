import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, CalendarX, CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  clientId: string | null;
  manualClientId: string | null;
  isManual: boolean;
}

interface SessionRow {
  id: string;
  session_date: string;
  status: string;
  is_paid: boolean;
  payment_method: string;
  duration_minutes: number;
  title: string;
  price_cents: number;
  paid_at: string | null;
  paid_confirmed_by: string | null;
  service_option_id: string | null;
  therapist_id: string | null;
  therapist_rate_cents: number;
  therapist_paid: boolean;
}

interface EntryRow {
  id: string;
  entry_type: string;
  category: string;
  amount_cents: number;
  entry_date: string;
  title: string;
  description: string;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

const ClientFinancialTab = ({ clientId, manualClientId, isManual }: Props) => {
  const { user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const cols = "id,session_date,status,is_paid,payment_method,duration_minutes,title,price_cents,paid_at,paid_confirmed_by,service_option_id,therapist_id,therapist_rate_cents,therapist_paid";
    const sessionsQ = isManual
      ? supabase.from("staff_sessions" as any).select(cols).eq("manual_client_id", manualClientId!)
      : supabase.from("staff_sessions" as any).select(cols).eq("client_id", clientId!);

    const entriesQ = !isManual && clientId
      ? supabase.from("business_entries").select("id,entry_type,category,amount_cents,entry_date,title,description").eq("client_id", clientId)
      : null;

    const [sRes, eRes] = await Promise.all([sessionsQ, entriesQ ?? Promise.resolve({ data: [] as EntryRow[] })]);
    setSessions((sRes.data as SessionRow[]) || []);
    setEntries(((eRes as any).data as EntryRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (clientId || manualClientId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, manualClientId, isManual]);

  const markPaid = async (s: SessionRow, method: string) => {
    setSavingId(s.id);
    const { error } = await supabase
      .from("sessions")
      .update({
        is_paid: true,
        payment_method: method,
        paid_at: new Date().toISOString(),
        paid_confirmed_by: user?.id ?? null,
      } as any)
      .eq("id", s.id);
    setSavingId(null);
    if (error) {
      toast.error("Could not record payment");
      return;
    }
    toast.success("Payment recorded");
    load();
  };

  const markUnpaid = async (s: SessionRow) => {
    setSavingId(s.id);
    const { error } = await supabase
      .from("sessions")
      .update({ is_paid: false, payment_method: "", paid_at: null, paid_confirmed_by: null } as any)
      .eq("id", s.id);
    setSavingId(null);
    if (error) {
      toast.error("Could not update payment");
      return;
    }
    toast.success("Marked unpaid");
    load();
  };

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "completed");
    const scheduled = sessions.filter((s) => s.status === "scheduled");
    const cancelled = sessions.filter((s) => s.status === "cancelled");
    const missed = sessions.filter((s) => s.status === "no-show" || s.status === "missed");
    const paidSessions = sessions.filter((s) => s.is_paid).length;
    const unpaidCompleted = completed.filter((s) => !s.is_paid);
    const sessionPaidTotal = sessions.filter((s) => s.is_paid).reduce((sum, s) => sum + (s.price_cents || 0), 0);
    const sessionOutstanding = unpaidCompleted.reduce((sum, s) => sum + (s.price_cents || 0), 0);

    const income = entries.filter((e) => e.entry_type === "income").reduce((sum, e) => sum + e.amount_cents, 0);
    const refunds = entries.filter((e) => e.entry_type === "refund").reduce((sum, e) => sum + e.amount_cents, 0);
    const credit = entries.filter((e) => e.entry_type === "credit").reduce((sum, e) => sum + e.amount_cents, 0);
    const outstandingEntries = entries.filter((e) => e.entry_type === "invoice" || e.entry_type === "outstanding").reduce((sum, e) => sum + e.amount_cents, 0);

    const netPaid = sessionPaidTotal + income - refunds;
    const totalOutstanding = sessionOutstanding + outstandingEntries;

    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = startOfMonth(subMonths(now, 5 - i));
      return { key: format(d, "yyyy-MM"), label: format(d, "MMM"), income: 0, sessions: 0 };
    });
    sessions.forEach((s) => {
      const k = format(new Date(s.session_date), "yyyy-MM");
      const m = months.find((mm) => mm.key === k);
      if (!m) return;
      if (s.status === "completed") m.sessions += 1;
      if (s.is_paid) m.income += (s.price_cents || 0) / 100;
    });
    entries.forEach((e) => {
      if (e.entry_type !== "income") return;
      const k = format(new Date(e.entry_date), "yyyy-MM");
      const m = months.find((mm) => mm.key === k);
      if (m) m.income += e.amount_cents / 100;
    });

    const statusBreakdown = [
      { name: "Completed", value: completed.length, color: "hsl(174,42%,42%)" },
      { name: "Scheduled", value: scheduled.length, color: "hsl(192,60%,55%)" },
      { name: "Cancelled", value: cancelled.length, color: "hsl(0,65%,55%)" },
      { name: "Missed", value: missed.length, color: "hsl(35,85%,55%)" },
    ].filter((s) => s.value > 0);

    return {
      totalSessions: sessions.length,
      completed: completed.length,
      scheduled: scheduled.length,
      cancelled: cancelled.length,
      missed: missed.length,
      paidSessions,
      unpaidCompleted: unpaidCompleted.length,
      netPaid,
      credit,
      refunds,
      totalOutstanding,
      months,
      statusBreakdown,
    };
  }, [sessions, entries]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading financial data...</div>;
  }

  const StatCard = ({ icon: Icon, label, value, sub, tone = "default" }: any) => {
    const toneClass =
      tone === "positive" ? "text-emerald-500" : tone === "negative" ? "text-destructive" : tone === "warning" ? "text-amber-500" : "text-primary";
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <Icon size={16} className={toneClass} />
        </div>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {isManual && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-300">
          Manual clients are not linked to a registered account. Income and credit ledger entries are unavailable until paired, but session payments still apply.
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={TrendingUp} label="Total paid" value={formatCurrency(stats.netPaid)} sub={`${stats.paidSessions} paid sessions`} tone="positive" />
        <StatCard icon={Wallet} label="Credit balance" value={formatCurrency(stats.credit)} sub="Available prepaid credit" />
        <StatCard icon={AlertCircle} label="Outstanding" value={formatCurrency(stats.totalOutstanding)} sub={`${stats.unpaidCompleted} unpaid sessions`} tone={stats.totalOutstanding > 0 ? "negative" : "default"} />
        <StatCard icon={CalendarCheck} label="Sessions ordered" value={stats.totalSessions} sub={`${stats.completed} completed · ${stats.scheduled} upcoming`} />
        <StatCard icon={CalendarX} label="Missed / no-show" value={stats.missed} sub={`${stats.cancelled} cancelled`} tone={stats.missed > 0 ? "warning" : "default"} />
        <StatCard icon={TrendingDown} label="Refunds" value={formatCurrency(stats.refunds)} sub="Total refunded" tone={stats.refunds > 0 ? "warning" : "default"} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Income — last 6 months</h3>
          <p className="text-xs text-muted-foreground mb-4">Recorded payments by month (GBP)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`£${v.toFixed(2)}`, "Income"]}
                />
                <Bar dataKey="income" fill="hsl(174,42%,42%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Sessions per month</h3>
          <p className="text-xs text-muted-foreground mb-4">Completed sessions trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="sessions" stroke="hsl(192,60%,55%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-1">Session status breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution across all bookings</p>
          {stats.statusBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No sessions yet.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {stats.statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Per-session payment ledger */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Session payments</h3>
          <p className="text-[11px] text-muted-foreground">Mark off-platform payments here</p>
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No sessions yet.</div>
        ) : (
          <div className="space-y-2">
            {sessions
              .slice()
              .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
              .map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">{s.status}</Badge>
                      {s.is_paid ? (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Paid · {s.payment_method || "—"}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">Unpaid</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(s.session_date), "MMM d, yyyy · HH:mm")} · {s.duration_minutes}min
                      {s.price_cents > 0 && ` · ${formatCurrency(s.price_cents)}`}
                      {s.paid_at && ` · paid ${format(new Date(s.paid_at), "MMM d")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.is_paid ? (
                      <Button variant="ghost" size="sm" onClick={() => markUnpaid(s)} disabled={savingId === s.id} className="h-8 text-xs">
                        {savingId === s.id ? <Loader2 size={12} className="animate-spin" /> : "Mark unpaid"}
                      </Button>
                    ) : (
                      <Select onValueChange={(v) => markPaid(s, v)} disabled={savingId === s.id}>
                        <SelectTrigger className="h-8 text-xs w-[140px]">
                          <SelectValue placeholder={savingId === s.id ? "Saving..." : "Mark paid via"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xero">Xero invoice</SelectItem>
                          <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Ledger entries */}
      {entries.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Ledger entries</h3>
          <div className="space-y-2">
            {entries
              .slice()
              .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
              .map((e) => {
                const positive = e.entry_type === "income" || e.entry_type === "credit";
                return (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{e.entry_type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{format(new Date(e.entry_date), "MMM d, yyyy")}</p>
                    </div>
                    <p className={`text-sm font-semibold ${positive ? "text-emerald-500" : "text-destructive"}`}>
                      {positive ? "+" : "−"}{formatCurrency(Math.abs(e.amount_cents))}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Therapist payouts (admin only) */}
      {isAdmin && sessions.some((s) => s.therapist_id) && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Therapist payouts on this client</h3>
          <p className="text-xs text-muted-foreground mb-4">Payouts owed to therapists for sessions delivered</p>
          <div className="space-y-2">
            {sessions
              .filter((s) => s.therapist_id && s.therapist_rate_cents > 0)
              .slice()
              .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(s.session_date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatCurrency(s.therapist_rate_cents)}</span>
                    <Badge variant={s.therapist_paid ? "secondary" : "outline"} className={`text-[10px] ${s.therapist_paid ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : ""}`}>
                      {s.therapist_paid ? "Paid out" : "Owed"}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFinancialTab;
