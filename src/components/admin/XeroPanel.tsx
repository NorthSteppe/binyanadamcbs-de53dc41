import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plug, RefreshCw, Loader2, CheckCircle2, ExternalLink, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, Legend } from "recharts";

interface XeroConn { id: string; tenant_name: string | null; last_synced_at: string | null; expires_at: string; }
interface XeroInvoice {
  id: string; xero_invoice_id: string; invoice_number: string | null; contact_name: string | null;
  status: string | null; issue_date: string | null; due_date: string | null;
  currency_code: string | null; total: number; amount_due: number; amount_paid: number;
}
interface PnL { month_start: string; revenue: number; expenses: number; net_profit: number; }

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  AUTHORISED: "bg-amber-100 text-amber-800 border-amber-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  VOIDED: "bg-red-100 text-red-700 border-red-200",
};

const fmtMoney = (v: number, ccy = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy || "GBP" }).format(v || 0);

const XeroPanel = () => {
  const [conn, setConn] = useState<XeroConn | null>(null);
  const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
  const [pnl, setPnl] = useState<PnL[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ contact_name: "", description: "", amount: "", due_date: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, i, p] = await Promise.all([
      supabase.from("xero_connection").select("*").maybeSingle(),
      supabase.from("xero_invoices").select("*").order("issue_date", { ascending: false }).limit(50),
      supabase.from("xero_pnl_monthly").select("*").order("month_start", { ascending: true }),
    ]);
    setConn(c.data as any);
    setInvoices((i.data as any) ?? []);
    setPnl((p.data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Detect oauth return
  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("xero");
    if (status === "ok") {
      toast({ title: "Xero connected" });
      url.searchParams.delete("xero");
      window.history.replaceState({}, "", url.toString());
      load();
    } else if (status === "err") {
      toast({ title: "Xero connection failed", variant: "destructive" });
      url.searchParams.delete("xero");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("xero-oauth-start");
      if (error || !data?.url) throw new Error(error?.message || data?.error || "Failed");
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Could not start Xero auth", description: e.message, variant: "destructive" });
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!conn) return;
    if (!confirm("Disconnect Xero? Synced data will be kept.")) return;
    const { error } = await supabase.from("xero_connection").delete().eq("id", conn.id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Xero disconnected" }); load(); }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("xero-sync");
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast({ title: "Synced from Xero", description: `${data.invoices} invoices · ${data.pnl_months} months of P&L` });
      load();
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    } finally { setSyncing(false); }
  };

  const createInvoice = async () => {
    if (!draft.contact_name || !draft.description || !draft.amount) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("xero-create-invoice", {
        body: {
          contact_name: draft.contact_name,
          description: draft.description,
          amount: Number(draft.amount),
          due_date: draft.due_date || undefined,
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast({ title: "Draft invoice created in Xero" });
      setCreateOpen(false);
      setDraft({ contact_name: "", description: "", amount: "", due_date: "" });
      sync();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="animate-spin me-2" /> Loading Xero…</div>;
  }

  if (!conn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plug size={18} /> Connect Xero</CardTitle>
          <CardDescription>Link your Xero organisation to pull invoices and P&L into this dashboard, and push new invoices from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} disabled={connecting} className="rounded-full">
            {connecting ? <Loader2 className="animate-spin me-2" size={16} /> : <Plug size={16} className="me-2" />}
            Connect Xero account
          </Button>
        </CardContent>
      </Card>
    );
  }

  const outstanding = invoices.filter((i) => i.status === "AUTHORISED" || i.status === "SUBMITTED");
  const overdue = outstanding.filter((i) => i.due_date && new Date(i.due_date) < new Date());
  const totalOutstanding = outstanding.reduce((s, i) => s + Number(i.amount_due || 0), 0);
  const totalOverdue = overdue.reduce((s, i) => s + Number(i.amount_due || 0), 0);
  const paid30 = invoices.filter((i) => i.status === "PAID" && i.issue_date && (Date.now() - new Date(i.issue_date).getTime()) < 30 * 86400000)
    .reduce((s, i) => s + Number(i.amount_paid || 0), 0);
  const ccy = invoices[0]?.currency_code || "GBP";

  return (
    <div className="space-y-6">
      {/* Connection bar */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <div>
              <p className="font-medium">{conn.tenant_name || "Xero organisation"}</p>
              <p className="text-xs text-muted-foreground">
                Last synced: {conn.last_synced_at ? format(new Date(conn.last_synced_at), "dd MMM yyyy HH:mm") : "never"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full"><Plus size={14} className="me-1" /> New invoice</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Xero invoice (draft)</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Contact name</Label><Input value={draft.contact_name} onChange={(e) => setDraft({ ...draft, contact_name: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Amount ({ccy})</Label><Input type="number" step="0.01" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></div>
                    <div><Label>Due date</Label><Input type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} /></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Creates a DRAFT invoice in Xero against account code 200 (Sales). You can finalise/approve it in Xero.</p>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={createInvoice} disabled={creating}>{creating && <Loader2 className="animate-spin me-2" size={14} />}Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={sync} disabled={syncing} className="rounded-full">
              {syncing ? <Loader2 className="animate-spin me-1" size={14} /> : <RefreshCw size={14} className="me-1" />} Sync now
            </Button>
            <Button variant="ghost" size="sm" onClick={disconnect} className="rounded-full">Disconnect</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold mt-1">{fmtMoney(totalOutstanding, ccy)}</p>
          <p className="text-xs text-muted-foreground mt-1">{outstanding.length} invoices</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12} /> Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{fmtMoney(totalOverdue, ccy)}</p>
          <p className="text-xs text-muted-foreground mt-1">{overdue.length} invoices</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Paid (last 30d)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fmtMoney(paid30, ccy)}</p>
        </CardContent></Card>
      </div>

      {/* P&L chart */}
      {pnl.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Revenue vs Expenses (12 months)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={pnl.map((p) => ({ ...p, label: format(new Date(p.month_start), "MMM yy") }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <RTooltip formatter={(v: any) => fmtMoney(Number(v), ccy)} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--accent))" name="Expenses" />
                <Bar dataKey="net_profit" fill="hsl(174,42%,42%)" name="Net profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Invoices list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent invoices</CardTitle>
          <a href="https://go.xero.com" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">Open in Xero <ExternalLink size={12} /></a>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet. Click Sync now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider">
                  <tr className="border-b">
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">Contact</th>
                    <th className="text-left py-2">Issued</th>
                    <th className="text-left py-2">Due</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-right py-2">Due</th>
                    <th className="text-left py-2 ps-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 font-mono text-xs">{i.invoice_number || "—"}</td>
                      <td className="py-2">{i.contact_name || "—"}</td>
                      <td className="py-2">{i.issue_date ? format(new Date(i.issue_date), "dd MMM yy") : "—"}</td>
                      <td className="py-2">{i.due_date ? format(new Date(i.due_date), "dd MMM yy") : "—"}</td>
                      <td className="py-2 text-right">{fmtMoney(Number(i.total), i.currency_code || ccy)}</td>
                      <td className="py-2 text-right font-medium">{fmtMoney(Number(i.amount_due), i.currency_code || ccy)}</td>
                      <td className="py-2 ps-3"><Badge variant="outline" className={STATUS_COLOR[i.status || ""] || ""}>{i.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default XeroPanel;
