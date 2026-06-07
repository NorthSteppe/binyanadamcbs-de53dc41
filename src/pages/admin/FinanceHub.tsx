import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import {
  RefreshCw, Loader2, ExternalLink, Plug, Link2, CheckCircle2, AlertTriangle, Receipt, Users, TrendingUp, Banknote, FileText, Search, BarChart3,
} from "lucide-react";
import { format } from "date-fns";

interface XeroContact { contact_id: string; name: string; email: string | null; status: string | null }
interface XeroInvoice {
  invoice_id: string; invoice_number: string | null; contact_id: string | null;
  contact_name: string | null; status: string | null; date: string | null; due_date: string | null;
  currency: string; total: number; amount_due: number; amount_paid: number; fully_paid_on: string | null;
}
interface SummaryResp {
  ok: boolean; connected?: boolean; currency?: string; tenant_name?: string;
  summary?: { revenue_paid: number; outstanding: number; overdue: number; draft_total: number;
    count_paid: number; count_outstanding: number; count_overdue: number; count_draft: number; invoice_count: number; };
  monthly?: { month: string; total: number }[];
  error?: string;
}

interface LocalProfile { id: string; full_name: string; xero_contact_id: string | null }
interface ManualClient { id: string; full_name: string; email: string; xero_contact_id: string | null }

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  AUTHORISED: "bg-amber-100 text-amber-800 border-amber-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  VOIDED: "bg-red-100 text-red-700 border-red-200",
};
const money = (v: number, ccy = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy || "GBP" }).format(v || 0);

const FinanceHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResp | null>(null);
  const [contacts, setContacts] = useState<XeroContact[]>([]);
  const [invoices, setInvoices] = useState<XeroInvoice[]>([]);
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [manualClients, setManualClients] = useState<ManualClient[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientSearch, setClientSearch] = useState("");
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; kind: "profile" | "manual"; id: string; name: string } | null>(null);

  const fetchLive = async () => {
    setRefreshing(true);
    try {
      const [sum, ctx, inv] = await Promise.all([
        supabase.functions.invoke<SummaryResp>("xero-live", { body: { action: "summary" } }),
        supabase.functions.invoke<{ ok: boolean; contacts: XeroContact[] }>("xero-live", { body: { action: "contacts" } }),
        supabase.functions.invoke<{ ok: boolean; invoices: XeroInvoice[] }>("xero-live", { body: { action: "invoices" } }),
      ]);
      if (sum.data) setSummary(sum.data);
      if (ctx.data?.ok) setContacts(ctx.data.contacts || []);
      if (inv.data?.ok) setInvoices(inv.data.invoices || []);
    } catch (e: any) {
      toast({ title: "Failed to load live Xero data", description: e?.message, variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchLocal = async () => {
    const [rolesRes, profRes, manualRes] = await Promise.all([
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("profiles").select("id, full_name, xero_contact_id"),
      supabase.from("manual_clients").select("id, full_name, email, xero_contact_id"),
    ]);
    const clientIds = new Set<string>();
    rolesRes.data?.forEach((r: any) => { if (r.role === "client") clientIds.add(r.user_id); });
    const clientProfs = (profRes.data as LocalProfile[] | null)?.filter((p) => clientIds.has(p.id)) || [];
    setProfiles(clientProfs);
    setManualClients((manualRes.data as ManualClient[] | null) || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchLive(), fetchLocal()]);
      setLoading(false);
    })();
  }, []);

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
    await fetchLocal();
  };

  // Unified clients list (union)
  const unified = useMemo(() => {
    const rows: { key: string; name: string; email: string | null; source: ("xero"|"portal"|"manual")[]; xero_contact_id: string | null; linked_locally: boolean; portal_id?: string; manual_id?: string; }[] = [];
    const byXeroId = new Map<string, typeof rows[number]>();
    const byEmail = new Map<string, typeof rows[number]>();
    const norm = (e: string | null) => (e || "").trim().toLowerCase();

    // Seed with Xero contacts
    for (const c of contacts) {
      const r = { key: `x:${c.contact_id}`, name: c.name, email: c.email, source: ["xero" as const], xero_contact_id: c.contact_id, linked_locally: false };
      rows.push(r);
      byXeroId.set(c.contact_id, r);
      if (c.email) byEmail.set(norm(c.email), r);
    }

    // Merge portal clients
    for (const p of profiles) {
      let row = p.xero_contact_id ? byXeroId.get(p.xero_contact_id) : undefined;
      if (!row && byEmail.size) {
        // try name match
        row = rows.find((r) => r.name.trim().toLowerCase() === p.full_name.trim().toLowerCase());
      }
      if (row) {
        row.source.push("portal");
        row.portal_id = p.id;
        row.linked_locally = !!p.xero_contact_id;
      } else {
        const r = { key: `p:${p.id}`, name: p.full_name || "Unnamed", email: null, source: ["portal" as const], xero_contact_id: p.xero_contact_id, linked_locally: !!p.xero_contact_id, portal_id: p.id };
        rows.push(r);
      }
    }

    // Merge manual clients
    for (const m of manualClients) {
      let row = m.xero_contact_id ? byXeroId.get(m.xero_contact_id) : undefined;
      if (!row && m.email) row = byEmail.get(norm(m.email));
      if (!row) row = rows.find((r) => r.name.trim().toLowerCase() === m.full_name.trim().toLowerCase());
      if (row) {
        row.source.push("manual");
        row.manual_id = m.id;
        row.linked_locally = row.linked_locally || !!m.xero_contact_id;
      } else {
        rows.push({ key: `m:${m.id}`, name: m.full_name || "Unnamed", email: m.email || null, source: ["manual"], xero_contact_id: m.xero_contact_id, linked_locally: !!m.xero_contact_id, manual_id: m.id });
      }
    }

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, profiles, manualClients]);

  const filteredUnified = unified.filter((r) =>
    !clientSearch || r.name.toLowerCase().includes(clientSearch.toLowerCase()) || (r.email || "").toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredInvoices = invoices.filter((i) => statusFilter === "all" || i.status === statusFilter);

  const connected = !!summary?.ok && summary?.connected !== false && !summary?.error;
  const ccy = summary?.currency || "GBP";

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <section className="pt-28 pb-20"><div className="container text-center">
          <Loader2 className="animate-spin mx-auto text-primary" size={28} />
        </div></section>
        <Footer />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <section className="pt-28 pb-20"><div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plug size={20}/>Connect Xero</CardTitle>
              <CardDescription>Finance and the client directory are powered by your Xero organisation. Connect to start.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connectXero}><Plug size={16} className="mr-2"/>Connect Xero account</Button>
              {summary?.error && <p className="text-sm text-destructive mt-3">{summary.error}</p>}
            </CardContent>
          </Card>
        </div></section>
        <Footer />
      </div>
    );
  }

  const s = summary?.summary;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-7xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5"><BarChart3 size={22} /></div>
              <div>
                <h1 className="text-3xl font-serif text-foreground">Finance & Clients</h1>
                <p className="text-muted-foreground text-sm">
                  Live from Xero{summary?.tenant_name ? ` · ${summary.tenant_name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLive} disabled={refreshing}>
                {refreshing ? <Loader2 className="animate-spin mr-2" size={14}/> : <RefreshCw size={14} className="mr-2"/>}
                Refresh
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/business")}>
                Business dashboard
              </Button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI title="Revenue (paid)" value={money(s?.revenue_paid || 0, ccy)} sub={`${s?.count_paid || 0} invoices`} icon={TrendingUp} />
            <KPI title="Outstanding" value={money(s?.outstanding || 0, ccy)} sub={`${s?.count_outstanding || 0} awaiting payment`} icon={Banknote} accent="amber" />
            <KPI title="Overdue" value={money(s?.overdue || 0, ccy)} sub={`${s?.count_overdue || 0} past due`} icon={AlertTriangle} accent="rose" />
            <KPI title="Drafts" value={money(s?.draft_total || 0, ccy)} sub={`${s?.count_draft || 0} ready to send`} icon={FileText} accent="slate" />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview"><BarChart3 size={14} className="mr-1.5"/>Overview</TabsTrigger>
              <TabsTrigger value="invoices"><Receipt size={14} className="mr-1.5"/>Invoices</TabsTrigger>
              <TabsTrigger value="clients"><Users size={14} className="mr-1.5"/>Clients</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader><CardTitle>Revenue (last 12 months)</CardTitle><CardDescription>From Xero ACCREC invoices (PAID + AUTHORISED).</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summary?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => money(v, ccy)}/>
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => money(v, ccy)}/>
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                  <div><CardTitle>Recent invoices</CardTitle><CardDescription>Live from Xero</CardDescription></div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead><TableHead>Contact</TableHead><TableHead>Date</TableHead>
                        <TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Due</TableHead>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Unified client directory</CardTitle>
                  <CardDescription>
                    Combines Xero contacts, portal users and manual clients. Clients without a Xero contact will be linked automatically the next time you raise an invoice for them.
                  </CardDescription>
                  <div className="relative mt-3 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                    <Input placeholder="Search by name or email…" className="pl-9" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}/>
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
                            {r.xero_contact_id ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                <CheckCircle2 size={10}/> Linked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">Not linked</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {r.portal_id && (
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/clients/${r.portal_id}`)}>
                                  <ExternalLink size={12} className="mr-1"/>Open
                                </Button>
                              )}
                              {!r.xero_contact_id && (r.portal_id || r.manual_id) && (
                                <Button size="sm" variant="outline" onClick={() => setLinkDialog({
                                  open: true,
                                  kind: r.portal_id ? "profile" : "manual",
                                  id: (r.portal_id || r.manual_id)!,
                                  name: r.name,
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
          </Tabs>
        </div>
      </section>
      <Footer />

      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link {linkDialog?.name} to a Xero contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contacts.map((c) => (
              <button key={c.contact_id}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                onClick={() => linkLocalToXero(c.contact_id)}>
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email || "no email"}</div>
              </button>
            ))}
            {contacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No Xero contacts loaded.</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkDialog(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KPI = ({ title, value, sub, icon: Icon, accent }: { title: string; value: string; sub?: string; icon: any; accent?: "amber"|"rose"|"slate" }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{title}</p>
        <Icon size={16} className={
          accent === "amber" ? "text-amber-600" :
          accent === "rose" ? "text-rose-600" :
          accent === "slate" ? "text-slate-500" : "text-primary"
        }/>
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

export default FinanceHub;
