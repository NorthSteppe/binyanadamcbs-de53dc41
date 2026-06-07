// DEPRECATED: Stripe payment links were removed. This now creates a Xero DRAFT invoice
// for the given session and returns Xero invoice info. The admin sends/collects payment from Xero.
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
    if (!authHeader) throw new Error("Not authenticated");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) throw new Error("Not authenticated");

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const allowed = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "team_member");
    if (!allowed) throw new Error("Forbidden");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    const { data: session } = await admin.from("sessions").select("*").eq("id", session_id).single();
    if (!session) throw new Error("Session not found");

    let serviceName = session.title || "Session";
    if (session.service_option_id) {
      const { data: svc } = await admin.from("service_options").select("name").eq("id", session.service_option_id).single();
      if (svc?.name) serviceName = svc.name;
    }

    let clientName = "Client";
    let clientEmail: string | null = null;
    if (session.manual_client_id) {
      const { data: mc } = await admin.from("manual_clients").select("email,full_name").eq("id", session.manual_client_id).single();
      clientEmail = mc?.email || null;
      clientName = mc?.full_name || clientName;
    } else if (session.client_id) {
      const { data: u } = await admin.auth.admin.getUserById(session.client_id);
      clientEmail = u?.user?.email ?? null;
      const { data: prof } = await admin.from("profiles").select("full_name").eq("id", session.client_id).single();
      clientName = prof?.full_name || clientName;
    }
    if (!session.price_cents || session.price_cents <= 0) throw new Error("Session has no price");

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) throw new Error("Xero not connected");
    const conn = await refreshIfNeeded(admin, conns[0]);

    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(); due.setDate(due.getDate() + 14);
    const dt = new Date(session.session_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    const payload = {
      Type: "ACCREC",
      Contact: clientEmail
        ? { Name: clientName.slice(0, 200), EmailAddress: clientEmail }
        : { Name: clientName.slice(0, 200) },
      Date: today,
      DueDate: due.toISOString().slice(0, 10),
      LineAmountTypes: "Exclusive",
      Status: "DRAFT",
      Reference: `${serviceName} — ${dt}`.slice(0, 200),
      LineItems: [{
        Description: `${serviceName} — ${dt}`.slice(0, 500),
        Quantity: 1,
        UnitAmount: Number((session.price_cents / 100).toFixed(2)),
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
    if (!res.ok) throw new Error(json?.Message || "Xero invoice create failed");

    return new Response(JSON.stringify({ ok: true, invoice: json.Invoices?.[0] ?? null, sent_to: clientEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("send-payment-link (Xero) error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Failed to create invoice" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
