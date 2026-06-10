import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PayoutSession {
  id: string;
  title: string;
  session_date: string;
  therapist_rate_cents: number;
  therapist_paid: boolean;
  therapist_paid_at: string | null;
  therapist_payout_method: string;
  status: string;
}

const MyPayouts = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [methodById, setMethodById] = useState<Record<string, string>>({});
  const [showPaid, setShowPaid] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["my-payouts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("sessions")
        .select("id,title,session_date,therapist_rate_cents,therapist_paid,therapist_paid_at,therapist_payout_method,status")
        .eq("therapist_id", user.id)
        .gt("therapist_rate_cents", 0)
        .order("session_date", { ascending: false });
      if (error) throw error;
      return (data || []) as PayoutSession[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(
    () => sessions.filter((s) => (showPaid ? true : !s.therapist_paid)),
    [sessions, showPaid],
  );

  const totals = useMemo(() => {
    let outstanding = 0, paid = 0;
    for (const s of sessions) {
      if (s.therapist_paid) paid += s.therapist_rate_cents;
      else outstanding += s.therapist_rate_cents;
    }
    return { outstanding, paid };
  }, [sessions]);

  const markPaid = async (s: PayoutSession) => {
    const method = methodById[s.id] || "bank_transfer";
    const { error } = await supabase
      .from("sessions")
      .update({
        therapist_paid: true,
        therapist_paid_at: new Date().toISOString(),
        therapist_payout_method: method,
      } as any)
      .eq("id", s.id);
    if (error) {
      toast.error(`Could not mark paid: ${error.message}`);
      return;
    }
    toast.success("Marked as paid");
    qc.invalidateQueries({ queryKey: ["my-payouts", user?.id] });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet size={22} /> My payouts</h1>
          <p className="text-sm text-muted-foreground">Tick a session off once you've received payment.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowPaid((v) => !v)}>
          {showPaid ? "Hide paid" : "Show paid"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">£{(totals.outstanding / 100).toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Paid to date</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">£{(totals.paid / 100).toFixed(2)}</CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(s.session_date), "EEE d MMM yyyy · HH:mm")}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">£{(s.therapist_rate_cents / 100).toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{s.status}</div>
                </div>
                {s.therapist_paid ? (
                  <Badge variant="secondary" className="gap-1"><CheckCircle2 size={12} /> Paid · {s.therapist_payout_method || "—"}</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Select
                      value={methodById[s.id] || "bank_transfer"}
                      onValueChange={(v) => setMethodById((m) => ({ ...m, [s.id]: v }))}
                    >
                      <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="xero">Xero</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => markPaid(s)} className="h-8">Mark received</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPayouts;
