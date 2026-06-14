import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface PendingSession {
  id: string;
  title: string;
  session_date: string;
  price_cents: number;
  client_id: string;
}
interface ClientGroup {
  clientId: string;
  clientName: string;
  sessions: PendingSession[];
  total: number;
}

const XeroDrafts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ClientGroup[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("id, title, session_date, price_cents, client_id")
      .eq("xero_invoice_pending", true)
      .is("xero_invoice_raised_at", null)
      .order("session_date", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const rows = (data as any[]) ?? [];
    const clientIds = Array.from(new Set(rows.map((r) => r.client_id).filter(Boolean)));
    const nameMap: Record<string, string> = {};
    if (clientIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
      (profs as any[] | null)?.forEach((p) => { nameMap[p.id] = p.full_name; });
    }

    const byClient = new Map<string, ClientGroup>();
    for (const s of rows) {
      const g = byClient.get(s.client_id) || {
        clientId: s.client_id,
        clientName: nameMap[s.client_id] || "Unknown client",
        sessions: [],
        total: 0,
      };
      g.sessions.push(s);
      g.total += (s.price_cents ?? 0) / 100;
      byClient.set(s.client_id, g);
    }
    setGroups(Array.from(byClient.values()));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reviewClient = (g: ClientGroup) => {
    navigate("/admin/invoice-review", {
      state: {
        sessionIds: g.sessions.map((s) => s.id),
        clientId: g.clientId,
        returnTo: "/admin/xero-drafts",
      },
    });
  };

  const totalSessions = groups.reduce((s, g) => s + g.sessions.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl pt-28 pb-12 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FileText size={22} /> Drafts ready to send</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sessions awaiting a Xero draft invoice. Review and edit each client's invoice before pushing.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="animate-spin me-1" size={14} /> : <RefreshCw size={14} className="me-1" />} Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="animate-spin me-2" /> Loading…</div>
        ) : groups.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No drafts pending. New paid bookings will appear here for review.</CardContent></Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{groups.length} client{groups.length > 1 ? "s" : ""} · {totalSessions} session{totalSessions > 1 ? "s" : ""} pending</p>
            {groups.map((g) => (
              <Card key={g.clientId}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="text-lg">{g.clientName}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="tabular-nums">£{g.total.toFixed(2)}</Badge>
                    <Button size="sm" onClick={() => reviewClient(g)}>Review &amp; push <ArrowRight size={14} className="ms-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y text-sm">
                    {g.sessions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-2">
                        <span>{s.title} <span className="text-muted-foreground">· {format(new Date(s.session_date), "dd MMM yyyy HH:mm")}</span></span>
                        <span className="tabular-nums">£{((s.price_cents ?? 0) / 100).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default XeroDrafts;
