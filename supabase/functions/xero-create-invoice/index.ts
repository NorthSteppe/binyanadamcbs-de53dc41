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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const { contact_name, description, amount, due_date, currency_code } = body ?? {};
    if (!contact_name || !description || !amount) {
      return new Response(JSON.stringify({ error: "contact_name, description, amount required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) return new Response(JSON.stringify({ error: "Xero not connected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const conn = await refreshIfNeeded(admin, conns[0]);

    const today = new Date().toISOString().slice(0,10);
    const payload = {
      Type: "ACCREC",
      Contact: { Name: String(contact_name).slice(0,200) },
      Date: today,
      DueDate: due_date ?? today,
      LineAmountTypes: "Exclusive",
      Status: "DRAFT",
      CurrencyCode: currency_code ?? undefined,
      LineItems: [{
        Description: String(description).slice(0,500),
        Quantity: 1,
        UnitAmount: Number(amount),
        AccountCode: "200",
      }],
    };

    const res = await fetch("https://api.xero.com/api.xro/2.0/Invoices", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${conn.access_token}`,
        "Xero-Tenant-Id": conn.tenant_id,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error("Xero invoice create failed: " + JSON.stringify(json));

    return new Response(JSON.stringify({ ok: true, invoice: json.Invoices?.[0] ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-create-invoice", e);
    return new Response(JSON.stringify({ error: (e as Error).message, fallback: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
