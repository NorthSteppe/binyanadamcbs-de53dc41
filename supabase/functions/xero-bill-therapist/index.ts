// Creates a DRAFT bill (ACCPAY) in Xero for therapist sessions, optionally tying it to a payout batch.
// Admin only.
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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const batchId: string | null = body?.batch_id ?? null;
    const explicitSessionIds: string[] = Array.isArray(body?.session_ids) ? body.session_ids.slice(0, 200) : [];
    const explicitTherapistId: string | null = body?.therapist_id ?? null;

    // Resolve target therapist + sessions
    let therapistId: string | null = explicitTherapistId;
    let sessionIds: string[] = explicitSessionIds;
    let batchRow: any = null;

    if (batchId) {
      const { data: b, error: bErr } = await admin
        .from("therapist_payout_batches")
        .select("id, therapist_id, total_cents, payment_method, payment_date, xero_bill_id")
        .eq("id", batchId)
        .maybeSingle();
      if (bErr || !b) throw new Error("Payout batch not found");
      batchRow = b;
      therapistId = b.therapist_id;
      if (b.xero_bill_id) {
        return new Response(JSON.stringify({ ok: true, already: true, bill_id: b.xero_bill_id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: sess } = await admin
        .from("sessions")
        .select("id")
        .eq("therapist_payout_batch_id", batchId);
      sessionIds = (sess || []).map((s: any) => s.id);
    }

    if (!therapistId) throw new Error("therapist_id, batch_id, or session_ids required");
    if (!sessionIds.length) throw new Error("No sessions to bill");

    const { data: sessions } = await admin
      .from("sessions")
      .select("id, title, session_date, therapist_rate_cents")
      .in("id", sessionIds);
    if (!sessions?.length) throw new Error("Sessions not found");

    const lineItems = sessions
      .filter((s: any) => (s.therapist_rate_cents || 0) > 0)
      .map((s: any) => {
        const dt = new Date(s.session_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
        return {
          Description: `${s.title} — ${dt}`.slice(0, 500),
          Quantity: 1,
          UnitAmount: Number(((s.therapist_rate_cents || 0) / 100).toFixed(2)),
          AccountCode: "477", // Wages & Salaries / Therapist Fees — most UK Xero charts default
        };
      });
    if (!lineItems.length) {
      return new Response(JSON.stringify({ ok: false, error: "No chargeable session amounts" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find therapist contact details
    const { data: tm } = await admin
      .from("team_members")
      .select("id, name, user_id, xero_contact_id")
      .eq("user_id", therapistId)
      .maybeSingle();
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", therapistId)
      .maybeSingle();
    const { data: au } = await admin.auth.admin.getUserById(therapistId);

    const contactName = tm?.name || prof?.full_name || au?.user?.email || "Therapist";
    const contactEmail = au?.user?.email ?? null;
    const existingContactId = tm?.xero_contact_id ?? null;

    const { data: conns } = await admin.from("xero_connection").select("*").limit(1);
    if (!conns || conns.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Xero not connected" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const conn = await refreshIfNeeded(admin, conns[0]);

    const today = new Date().toISOString().slice(0, 10);
    const due = batchRow?.payment_date ?? today;

    let contact: any;
    if (existingContactId) contact = { ContactID: existingContactId };
    else if (contactEmail) contact = { Name: String(contactName).slice(0, 200), EmailAddress: contactEmail };
    else contact = { Name: String(contactName).slice(0, 200) };

    const payload = {
      Type: "ACCPAY", // Bill
      Contact: contact,
      Date: today,
      DueDate: due,
      LineAmountTypes: "NoTax",
      Status: "DRAFT",
      Reference: batchId ? `Payout ${batchId.slice(0, 8)}` : "Therapist sessions",
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
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const veMsg = json?.Elements?.[0]?.ValidationErrors?.map((v: any) => v.Message).join("; ");
      const msg = veMsg || json?.Message || json?.Detail || `Xero bill create failed (HTTP ${res.status})`;
      console.error("Xero bill create failed", res.status, JSON.stringify(json));
      return new Response(JSON.stringify({ ok: false, error: msg, status: res.status, xero: json }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createdBill = json.Invoices?.[0] ?? null;
    const billId = createdBill?.InvoiceID ?? null;
    const xeroContactId = createdBill?.Contact?.ContactID ?? null;

    if (tm?.id && xeroContactId && !existingContactId) {
      await admin.from("team_members").update({ xero_contact_id: xeroContactId }).eq("id", tm.id);
    }
    if (batchId && billId) {
      await admin.from("therapist_payout_batches").update({
        xero_bill_id: billId,
        xero_pushed_at: new Date().toISOString(),
      }).eq("id", batchId);
    }

    return new Response(JSON.stringify({ ok: true, bill: createdBill, bill_id: billId, xero_contact_id: xeroContactId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("xero-bill-therapist error", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
