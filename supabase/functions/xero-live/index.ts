// Live, on-demand Xero data fetcher.
// Actions: "summary" | "contacts" | "invoices" (by contactId or all recent)
// Admin only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";

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
    access_token: j.access_token, refresh_token: j.refresh_token, expires_at: expiresAt,
  }).eq("id", conn.id);
  return { ...conn, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: expiresAt };
}

async function xeroGet(path: string, conn: any) {
  const res = await fetch(`https://api.xero.com${path}`, {
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Xero-Tenant-Id": conn.tenant_id,
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Xero ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = authHeader.replace("Bearer ", "").trim();
    // Verify the caller's JWT against the project's JWKS (works with new signing keys),
    // falling back to the Auth REST endpoint for legacy HS256 tokens.
    let userId: string | undefined;
    try {
      const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, jwks);
      if (payload.sub && payload.role !== "anon") userId = payload.sub as string;
    } catch (_e) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
      });
      if (userRes.ok) {
        const u = await userRes.json();
        userId = u?.id as string | undefined;
      } else {
        console.error("xero-live auth/v1/user failed", userRes.status);
      }
    }
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const action: string = body?.action ?? "summary";

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) {
      return new Response(JSON.stringify({ ok: false, connected: false, error: "Xero not connected" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const conn = await refreshIfNeeded(admin, conns[0]);

    if (action === "contacts") {
      // Xero rejects IsCustomer filter on high-volume tenants. Fetch summary pages
      // (optionally narrowed by searchTerm) and filter client-side.
      const searchTerm: string | null = (body?.search ?? "").toString().trim() || null;
      const maxPages: number = Math.min(Math.max(Number(body?.max_pages ?? 5), 1), 20);
      const all: any[] = [];
      for (let page = 1; page <= maxPages; page++) {
        const params = new URLSearchParams({
          page: String(page),
          summaryOnly: "true",
          includeArchived: "false",
        });
        if (searchTerm) params.set("searchTerm", searchTerm);
        const j = await xeroGet(`/api.xro/2.0/Contacts?${params.toString()}`, conn);
        const items = j.Contacts ?? [];
        all.push(...items);
        if (items.length < 100) break;
      }
      const contacts = all
        .filter((c: any) => c.ContactStatus !== "ARCHIVED")
        .filter((c: any) => c.IsCustomer !== false) // keep undefined + true
        .map((c: any) => ({
          contact_id: c.ContactID,
          name: c.Name,
          email: c.EmailAddress ?? null,
          first_name: c.FirstName ?? null,
          last_name: c.LastName ?? null,
          status: c.ContactStatus ?? null,
        }));
      return new Response(JSON.stringify({ ok: true, contacts }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "invoices") {
      const contactId: string | null = body?.contact_id ?? null;
      let where = `Type=="ACCREC"`;
      if (contactId) where += `&&Contact.ContactID==Guid("${contactId}")`;
      const j = await xeroGet(`/api.xro/2.0/Invoices?where=${encodeURIComponent(where)}&order=Date DESC&page=1`, conn);
      const invoices = (j.Invoices ?? []).map((i: any) => ({
        invoice_id: i.InvoiceID,
        invoice_number: i.InvoiceNumber ?? null,
        contact_id: i.Contact?.ContactID ?? null,
        contact_name: i.Contact?.Name ?? null,
        status: i.Status ?? null,
        date: i.DateString ? i.DateString.slice(0, 10) : null,
        due_date: i.DueDateString ? i.DueDateString.slice(0, 10) : null,
        currency: i.CurrencyCode ?? "GBP",
        total: i.Total ?? 0,
        amount_due: i.AmountDue ?? 0,
        amount_paid: i.AmountPaid ?? 0,
        fully_paid_on: i.FullyPaidOnDate ? i.FullyPaidOnDate.slice(0, 10) : null,
      }));
      return new Response(JSON.stringify({ ok: true, invoices }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default: summary — aggregate KPIs from all ACCREC invoices (first 2 pages)
    const allInv: any[] = [];
    for (let page = 1; page <= 2; page++) {
      const j = await xeroGet(`/api.xro/2.0/Invoices?where=${encodeURIComponent(`Type=="ACCREC"`)}&order=Date DESC&page=${page}`, conn);
      const items = j.Invoices ?? [];
      allInv.push(...items);
      if (items.length < 100) break;
    }
    const today = new Date().toISOString().slice(0, 10);
    let revenuePaid = 0, outstanding = 0, overdue = 0, draftTotal = 0;
    let countPaid = 0, countOutstanding = 0, countOverdue = 0, countDraft = 0;
    const currency = allInv[0]?.CurrencyCode ?? "GBP";
    for (const i of allInv) {
      const status = i.Status;
      const due = i.DueDateString ? i.DueDateString.slice(0, 10) : null;
      if (status === "PAID") { revenuePaid += i.Total ?? 0; countPaid++; }
      else if (status === "AUTHORISED" || status === "SUBMITTED") {
        outstanding += i.AmountDue ?? 0; countOutstanding++;
        if (due && due < today && (i.AmountDue ?? 0) > 0) { overdue += i.AmountDue ?? 0; countOverdue++; }
      } else if (status === "DRAFT") { draftTotal += i.Total ?? 0; countDraft++; }
    }
    // last-12-months revenue from PAID invoices using DateString
    const months: Record<string, number> = {};
    const monthLabels: string[] = [];
    const now = new Date();
    for (let k = 11; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      const key = d.toISOString().slice(0, 7);
      months[key] = 0;
      monthLabels.push(key);
    }
    for (const i of allInv) {
      if (i.Status !== "PAID" && i.Status !== "AUTHORISED") continue;
      const dStr = i.DateString ? i.DateString.slice(0, 7) : null;
      if (dStr && dStr in months) months[dStr] += i.Total ?? 0;
    }
    const monthly = monthLabels.map((m) => ({ month: m, total: months[m] }));

    return new Response(JSON.stringify({
      ok: true, currency,
      tenant_name: conn.tenant_name,
      last_synced_at: conn.last_synced_at,
      summary: {
        revenue_paid: revenuePaid, outstanding, overdue, draft_total: draftTotal,
        count_paid: countPaid, count_outstanding: countOutstanding, count_overdue: countOverdue, count_draft: countDraft,
        invoice_count: allInv.length,
      },
      monthly,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("xero-live error", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
