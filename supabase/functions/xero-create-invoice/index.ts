// Admin-triggered DRAFT invoice (free-form contact + line item) from the Xero panel.
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
    access_token: j.access_token, refresh_token: j.refresh_token, expires_at: expiresAt,
  }).eq("id", conn.id);
  return { ...conn, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: expiresAt };
}

async function xeroFetch(path: string, conn: any, init: RequestInit = {}) {
  return fetch(`https://api.xero.com${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Xero-Tenant-Id": conn.tenant_id,
      "Accept": "application/json",
      ...(init.headers || {}),
    },
  });
}

// Look up an existing Xero contact by exact name so we reuse the ContactID
// instead of letting Xero reject the create with "contact name already in use".
async function findContactIdByName(name: string, conn: any): Promise<string | null> {
  try {
    const where = encodeURIComponent(`Name="${name.replace(/"/g, '\\"')}"`);
    const res = await xeroFetch(`/api.xro/2.0/Contacts?where=${where}`, conn);
    if (!res.ok) return null;
    const j = await res.json();
    return j?.Contacts?.[0]?.ContactID ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { contact_name, contact_email, contact_id, description, amount, due_date, currency_code } = body ?? {};
    const amt = Number(amount);
    if (!contact_name || !description || !Number.isFinite(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "contact_name, description, and a positive amount are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) return new Response(JSON.stringify({ error: "Xero not connected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const conn = await refreshIfNeeded(admin, conns[0]);

    // Resolve the contact: explicit id > lookup by name > new contact payload.
    let contact: any;
    if (contact_id) {
      contact = { ContactID: contact_id };
    } else {
      const existingId = await findContactIdByName(String(contact_name), conn);
      if (existingId) {
        contact = { ContactID: existingId };
      } else if (contact_email) {
        contact = { Name: String(contact_name).slice(0, 200), EmailAddress: String(contact_email) };
      } else {
        contact = { Name: String(contact_name).slice(0, 200) };
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const payload: any = {
      Type: "ACCREC",
      Contact: contact,
      Date: today,
      DueDate: due_date ?? today,
      LineAmountTypes: "Exclusive",
      Status: "DRAFT",
      LineItems: [{
        Description: String(description).slice(0, 500),
        Quantity: 1,
        UnitAmount: Number(amt.toFixed(2)),
        AccountCode: "200",
      }],
    };
    if (currency_code) payload.CurrencyCode = currency_code;

    const res = await xeroFetch("/api.xro/2.0/Invoices", conn, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const veMsg = json?.Elements?.[0]?.ValidationErrors?.map((v: any) => v.Message).join("; ");
      const msg = veMsg || json?.Message || json?.Detail || `Xero invoice create failed (HTTP ${res.status})`;
      console.error("xero-create-invoice failed", res.status, JSON.stringify(json));
      return new Response(JSON.stringify({ ok: false, error: msg, status: res.status, xero: json }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, invoice: json.Invoices?.[0] ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-create-invoice", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
