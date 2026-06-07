import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshIfNeeded(admin: any, conn: any) {
  if (new Date(conn.expires_at).getTime() > Date.now() + 60_000) return conn;
  const clientId = Deno.env.get("XERO_CLIENT_ID")!;
  const clientSecret = Deno.env.get("XERO_CLIENT_SECRET")!;
  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://identity.xero.com/connect/token", {
    method: "POST",
    headers: { "Authorization": `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: conn.refresh_token }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error("Refresh failed: " + JSON.stringify(j));
  const expiresAt = new Date(Date.now() + (j.expires_in ?? 1800) * 1000).toISOString();
  await admin.from("xero_connection").update({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: expiresAt,
  }).eq("id", conn.id);
  return { ...conn, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: expiresAt };
}

async function xeroFetch(path: string, conn: any, init: RequestInit = {}) {
  const res = await fetch(`https://api.xero.com${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Xero-Tenant-Id": conn.tenant_id,
      "Accept": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Xero ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: claims.claims.sub, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) return new Response(JSON.stringify({ error: "Xero not connected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    let conn = await refreshIfNeeded(admin, conns[0]);

    // ── Invoices (AR) ──
    const invJson = await xeroFetch(`/api.xro/2.0/Invoices?where=Type=="ACCREC"&order=Date DESC&page=1`, conn);
    const invoices = invJson.Invoices ?? [];
    const invRows = invoices.map((i: any) => ({
      xero_invoice_id: i.InvoiceID,
      invoice_number: i.InvoiceNumber ?? null,
      contact_name: i.Contact?.Name ?? null,
      status: i.Status ?? null,
      type: i.Type ?? null,
      issue_date: i.DateString ? i.DateString.slice(0,10) : null,
      due_date: i.DueDateString ? i.DueDateString.slice(0,10) : null,
      fully_paid_on_date: i.FullyPaidOnDate ? i.FullyPaidOnDate.slice(0,10) : null,
      currency_code: i.CurrencyCode ?? null,
      sub_total: i.SubTotal ?? 0,
      total_tax: i.TotalTax ?? 0,
      total: i.Total ?? 0,
      amount_due: i.AmountDue ?? 0,
      amount_paid: i.AmountPaid ?? 0,
      raw: i,
      synced_at: new Date().toISOString(),
    }));
    if (invRows.length > 0) {
      const { error } = await admin.from("xero_invoices").upsert(invRows, { onConflict: "xero_invoice_id" });
      if (error) throw error;
    }

    // ── P&L last 12 months ──
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => d.toISOString().slice(0,10);
    const pnl = await xeroFetch(
      `/api.xro/2.0/Reports/ProfitAndLoss?fromDate=${fmt(fromDate)}&toDate=${fmt(toDate)}&periods=11&timeframe=MONTH`,
      conn
    );
    const rep = pnl.Reports?.[0];
    const pnlRows: any[] = [];
    if (rep) {
      const headerCells = rep.Rows?.find((r: any) => r.RowType === "Header")?.Cells ?? [];
      // header[0] = blank label; headers[1..] = month labels (e.g. "Jun 2026")
      const monthLabels: string[] = headerCells.slice(1).map((c: any) => c.Value);
      const monthDates = monthLabels.map((label) => {
        const d = new Date(label + " 1");
        return new Date(d.getFullYear(), d.getMonth(), 1);
      });
      const totals: Record<string, number[]> = { Income: [], "Less Operating Expenses": [], "Net Profit": [] };
      const walk = (rows: any[]) => {
        for (const r of rows ?? []) {
          if (r.RowType === "Section" && r.Rows) walk(r.Rows);
          if (r.RowType === "SummaryRow" || r.RowType === "Row") {
            const label = r.Cells?.[0]?.Value ?? "";
            const key = ["Total Income", "Total Operating Expenses", "Net Profit", "Gross Profit"].find((k) => label.toLowerCase() === k.toLowerCase());
            if (key) {
              const vals = r.Cells.slice(1).map((c: any) => Number(c.Value || 0));
              if (key === "Total Income") totals["Income"] = vals;
              if (key === "Total Operating Expenses") totals["Less Operating Expenses"] = vals;
              if (key === "Net Profit") totals["Net Profit"] = vals;
            }
          }
        }
      };
      walk(rep.Rows ?? []);
      for (let i = 0; i < monthDates.length; i++) {
        pnlRows.push({
          month_start: fmt(monthDates[i]),
          revenue: totals["Income"]?.[i] ?? 0,
          expenses: totals["Less Operating Expenses"]?.[i] ?? 0,
          net_profit: totals["Net Profit"]?.[i] ?? ((totals["Income"]?.[i] ?? 0) - (totals["Less Operating Expenses"]?.[i] ?? 0)),
          currency_code: null,
          synced_at: new Date().toISOString(),
        });
      }
      if (pnlRows.length > 0) {
        const { error } = await admin.from("xero_pnl_monthly").upsert(pnlRows, { onConflict: "month_start" });
        if (error) throw error;
      }
    }

    await admin.from("xero_connection").update({ last_synced_at: new Date().toISOString() }).eq("id", conn.id);

    return new Response(JSON.stringify({ ok: true, invoices: invRows.length, pnl_months: pnlRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-sync", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
