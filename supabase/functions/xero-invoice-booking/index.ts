// Creates a DRAFT invoice in Xero for a client booking (sessions or a course purchase).
// Callable by an authenticated client (for their own records) or an admin.
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

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });

    const body = await req.json().catch(() => ({}));
    const sessionIds: string[] = Array.isArray(body?.session_ids) ? body.session_ids.slice(0, 24) : [];
    const coursePurchaseId: string | null = body?.course_purchase_id ?? null;

    // Build line items + identify contact
    let contactName = "";
    let contactEmail: string | null = null;
    let linkProfileId: string | null = null;
    const lineItems: any[] = [];
    let description = "";


    if (sessionIds.length) {
      const { data: sessions } = await admin
        .from("sessions")
        .select("id, client_id, title, session_date, price_cents, duration_minutes, service_option_id")
        .in("id", sessionIds);
      if (!sessions?.length) throw new Error("No sessions found");

      // Authorization: caller must be admin, or own every session
      if (!isAdmin && sessions.some((s: any) => s.client_id !== user.id)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const clientId = sessions[0].client_id;
      const { data: prof } = await admin.from("profiles").select("full_name").eq("id", clientId).single();
      const { data: u } = await admin.auth.admin.getUserById(clientId);
      contactName = prof?.full_name || u?.user?.email || "Client";
      contactEmail = u?.user?.email ?? null;

      for (const s of sessions) {
        if (!s.price_cents || s.price_cents <= 0) continue;
        const dt = new Date(s.session_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
        lineItems.push({
          Description: `${s.title} — ${dt}`.slice(0, 500),
          Quantity: 1,
          UnitAmount: Number((s.price_cents / 100).toFixed(2)),
          AccountCode: "200",
        });
      }
      description = sessions.map((s: any) => s.title).join(", ");
    } else if (coursePurchaseId) {
      const { data: purchase } = await admin
        .from("course_purchases")
        .select("id, user_id, course_id")
        .eq("id", coursePurchaseId)
        .single();
      if (!purchase) throw new Error("Course purchase not found");
      if (!isAdmin && purchase.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: course } = await admin.from("courses").select("title, price_cents").eq("id", purchase.course_id).single();
      if (!course?.price_cents) throw new Error("Course has no price");

      const { data: prof } = await admin.from("profiles").select("full_name").eq("id", purchase.user_id).single();
      const { data: u } = await admin.auth.admin.getUserById(purchase.user_id);
      contactName = prof?.full_name || u?.user?.email || "Client";
      contactEmail = u?.user?.email ?? null;

      lineItems.push({
        Description: `Course access: ${course.title}`.slice(0, 500),
        Quantity: 1,
        UnitAmount: Number((course.price_cents / 100).toFixed(2)),
        AccountCode: "200",
      });
      description = course.title;
    } else {
      return new Response(JSON.stringify({ error: "session_ids or course_purchase_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no chargeable items" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Xero not connected" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const conn = await refreshIfNeeded(admin, conns[0]);

    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(); due.setDate(due.getDate() + 14);
    const payload = {
      Type: "ACCREC",
      Contact: contactEmail
        ? { Name: contactName.slice(0, 200), EmailAddress: contactEmail }
        : { Name: contactName.slice(0, 200) },
      Date: today,
      DueDate: due.toISOString().slice(0, 10),
      LineAmountTypes: "Exclusive",
      Status: "DRAFT",
      Reference: description.slice(0, 200),
      LineItems: lineItems,
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
    if (!res.ok) {
      console.error("Xero invoice create failed", json);
      return new Response(JSON.stringify({ ok: false, error: json?.Message || "Xero invoice create failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, invoice: json.Invoices?.[0] ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-invoice-booking error", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
