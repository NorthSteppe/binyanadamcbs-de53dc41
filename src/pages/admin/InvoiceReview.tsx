import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import { format } from "date-fns";

interface Line {
  description: string;
  quantity: number;
  unit_amount: number;
}

interface ReviewState {
  sessionIds?: string[];
  clientId?: string;
  /** Where to return after pushing (default: Xero drafts queue). */
  returnTo?: string;
}

const todayPlus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const InvoiceReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as ReviewState;

  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(todayPlus(14));
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [sessionIds, setSessionIds] = useState<string[]>(state.sessionIds ?? []);

  useEffect(() => {
    (async () => {
      const ids = state.sessionIds ?? [];
      if (!ids.length) {
        // Manual / empty invoice — start with one blank line.
        setLines([{ description: "", quantity: 1, unit_amount: 0 }]);
        setLoading(false);
        return;
      }
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, title, session_date, price_cents, client_id")
        .in("id", ids)
        .order("session_date", { ascending: true });

      const rows = (sessions as any[]) ?? [];
      const clientId = state.clientId ?? rows[0]?.client_id ?? null;

      if (clientId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, xero_contact_id")
          .eq("id", clientId)
          .maybeSingle();
        setContactName((prof as any)?.full_name ?? "");
        setContactId((prof as any)?.xero_contact_id ?? null);
      }

      setLines(
        rows.map((s) => ({
          description: `${s.title} — ${format(new Date(s.session_date), "dd MMM yyyy HH:mm")}`,
          quantity: 1,
          unit_amount: Number(((s.price_cents ?? 0) / 100).toFixed(2)),
        })),
      );
      setReference(rows.map((s) => s.title).join(", ").slice(0, 200));
      setSessionIds(rows.map((s) => s.id));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_amount) || 0), 0),
    [lines],
  );

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((prev) => [...prev, { description: "", quantity: 1, unit_amount: 0 }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const push = async () => {
    const cleanLines = lines
      .map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity) || 1, unit_amount: Number(l.unit_amount) || 0 }))
      .filter((l) => l.description && l.unit_amount > 0);
    if (!contactName.trim() && !contactId) {
      toast.error("Enter a contact name");
      return;
    }
    if (cleanLines.length === 0) {
      toast.error("Add at least one line item with a positive amount");
      return;
    }
    setPushing(true);
    try {
      const { data, error } = await supabase.functions.invoke("xero-create-invoice", {
        body: {
          contact_name: contactName.trim(),
          contact_id: contactId || undefined,
          line_items: cleanLines,
          due_date: dueDate || undefined,
          reference: reference || undefined,
          session_ids: sessionIds.length ? sessionIds : undefined,
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast.success("Draft invoice pushed to Xero");
      navigate(state.returnTo || "/admin/xero-drafts");
    } catch (e: any) {
      toast.error(e?.message ? `Xero: ${e.message}` : "Failed to push draft");
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-3xl pt-28 pb-12 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review draft invoice</h1>
            <p className="text-muted-foreground text-sm">Check and edit the details before pushing the DRAFT to Xero.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin me-2" /> Loading draft…
          </div>
        ) : (
          <Card>
            <CardHeader><CardTitle>Invoice details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Contact (client)</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Client name" />
                  {contactId && <p className="text-[11px] text-muted-foreground mt-1">Linked to existing Xero contact.</p>}
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Reference</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional reference shown on the invoice" />
              </div>

              <div className="space-y-2">
                <Label>Line items</Label>
                <div className="rounded-lg border divide-y">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit £</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                      <Input className="col-span-6 h-8 text-sm" value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} placeholder="Description" />
                      <Input className="col-span-2 h-8 text-sm text-center" type="number" min="1" step="1" value={l.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} />
                      <Input className="col-span-2 h-8 text-sm text-right" type="number" min="0" step="0.01" value={l.unit_amount} onChange={(e) => updateLine(i, { unit_amount: Number(e.target.value) })} />
                      <div className="col-span-1 text-right text-sm tabular-nums">£{((Number(l.quantity) || 0) * (Number(l.unit_amount) || 0)).toFixed(2)}</div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLine(i)} disabled={lines.length <= 1}><Trash2 size={13} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addLine}><Plus size={14} className="me-1" /> Add line</Button>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">Total (excl. tax)</span>
                <span className="text-xl font-bold tabular-nums">£{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                <Button onClick={push} disabled={pushing}>
                  {pushing ? <Loader2 className="animate-spin me-2" size={16} /> : <Send size={16} className="me-2" />}
                  Push draft to Xero
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default InvoiceReview;
