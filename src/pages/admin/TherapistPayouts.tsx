import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Wallet, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SessionRow {
  id: string;
  title: string;
  session_date: string;
  therapist_id: string;
  therapist_rate_cents: number;
  therapist_paid: boolean;
  therapist_paid_at: string | null;
  therapist_payout_method: string;
  status: string;
}

interface TM { user_id: string; name: string; default_session_rate_cents: number; }

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

const TherapistPayouts = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [therapists, setTherapists] = useState<TM[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTherapist, setFilterTherapist] = useState<string>("all");
  const [showPaid, setShowPaid] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchMethod, setBatchMethod] = useState("bank_transfer");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [sRes, tRes] = await Promise.all([
      (supabase as any)
        .from("staff_sessions")
        .select("id,title,session_date,therapist_id,therapist_rate_cents,therapist_paid,therapist_paid_at,therapist_payout_method,status")
        .not("therapist_id", "is", null)
        .gt("therapist_rate_cents", 0)
        .order("session_date", { ascending: false }),
      supabase.from("staff_team_member_rates" as any).select("user_id,name,default_session_rate_cents").eq("is_active", true).not("user_id", "is", null),
    ]);
    setSessions((sRes.data as SessionRow[]) || []);
    setTherapists((tRes.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const therapistName = (id: string) => therapists.find((t) => t.user_id === id)?.name || "Unknown";

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterTherapist !== "all" && s.therapist_id !== filterTherapist) return false;
      if (!showPaid && s.therapist_paid) return false;
      return true;
    });
  }, [sessions, filterTherapist, showPaid]);

  const summary = useMemo(() => {
    const byTherapist = new Map<string, { owed: number; paid: number; count: number }>();
    sessions.forEach((s) => {
      const cur = byTherapist.get(s.therapist_id) || { owed: 0, paid: 0, count: 0 };
      if (s.therapist_paid) cur.paid += s.therapist_rate_cents;
      else cur.owed += s.therapist_rate_cents;
      cur.count += 1;
      byTherapist.set(s.therapist_id, cur);
    });
    return Array.from(byTherapist.entries()).map(([id, v]) => ({ id, name: therapistName(id), ...v }));
  }, [sessions, therapists]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectedTotal = useMemo(() => {
    return filtered.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.therapist_rate_cents, 0);
  }, [filtered, selected]);

  const selectedTherapistIds = useMemo(() => {
    return new Set(filtered.filter((s) => selected.has(s.id)).map((s) => s.therapist_id));
  }, [filtered, selected]);

  const createBatch = async () => {
    if (selected.size === 0) return;
    if (selectedTherapistIds.size > 1) {
      toast.error("Select sessions for one therapist at a time");
      return;
    }
    setSaving(true);
    const therapistId = Array.from(selectedTherapistIds)[0];
    const { data: batch, error: bErr } = await supabase
      .from("therapist_payout_batches" as any)
      .insert({
        therapist_id: therapistId,
        total_cents: selectedTotal,
        payment_method: batchMethod,
        created_by: user!.id,
      } as any)
      .select("id")
      .single();
    if (bErr || !batch) {
      setSaving(false);
      toast.error("Could not create payout batch");
      return;
    }
    const ids = Array.from(selected);
    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        therapist_paid: true,
        therapist_paid_at: new Date().toISOString(),
        therapist_paid_by: user!.id,
        therapist_payout_method: batchMethod,
        therapist_payout_batch_id: (batch as any).id,
      } as any)
      .in("id", ids);
    setSaving(false);
    if (uErr) {
      toast.error("Sessions not marked paid");
      return;
    }
    toast.success(`Paid ${formatCurrency(selectedTotal)} to ${therapistName(therapistId)}`);
    setSelected(new Set());
    load();
  };

  const markSinglePaid = async (s: SessionRow, method: string) => {
    const { error } = await supabase
      .from("sessions")
      .update({
        therapist_paid: true,
        therapist_paid_at: new Date().toISOString(),
        therapist_paid_by: user!.id,
        therapist_payout_method: method,
      } as any)
      .eq("id", s.id);
    if (error) toast.error("Could not mark paid");
    else { toast.success("Marked paid"); load(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Therapist payouts</h1>
            <p className="text-sm text-muted-foreground">Track and batch-pay therapists for delivered sessions</p>
          </div>
        </div>

        {/* Summary per therapist */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {summary.map((s) => (
            <div key={s.id} className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="text-[11px] text-muted-foreground mb-2">{s.count} sessions</p>
              <div className="flex items-center justify-between text-xs">
                <span>Owed</span>
                <span className="font-bold text-amber-500">{formatCurrency(s.owed)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Paid out</span>
                <span className="font-bold text-emerald-500">{formatCurrency(s.paid)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={filterTherapist} onValueChange={setFilterTherapist}>
            <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All therapists</SelectItem>
              {therapists.map((t) => <SelectItem key={t.user_id} value={t.user_id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={showPaid} onCheckedChange={(c) => setShowPaid(!!c)} />
            Show already paid
          </label>
          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-semibold">{selected.size} selected · {formatCurrency(selectedTotal)}</span>
              <Select value={batchMethod} onValueChange={setBatchMethod}>
                <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createBatch} disabled={saving} size="sm">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Pay batch
              </Button>
            </div>
          )}
        </div>

        {/* Sessions table */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No sessions match the current filter.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 p-3">
                  {!s.therapist_paid && (
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {therapistName(s.therapist_id)} · {format(new Date(s.session_date), "MMM d, yyyy")} · <span className="capitalize">{s.status}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(s.therapist_rate_cents)}</span>
                  {s.therapist_paid ? (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Paid · {s.therapist_payout_method}
                    </Badge>
                  ) : (
                    <Select onValueChange={(v) => markSinglePaid(s, v)}>
                      <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue placeholder="Mark paid" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TherapistPayouts;
