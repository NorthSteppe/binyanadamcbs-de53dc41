// Raises Xero draft invoices for sessions that are flagged xero_invoice_pending and fall within the current week.
// Intended to be invoked weekly by pg_cron (Monday morning) but also callable on-demand by an admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Require auth: either service role (cron) or an admin user JWT.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const isServiceRole = token === serviceRoleKey;
    if (!isServiceRole) {
      // Validate user JWT and ensure admin role
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
      });
      if (!userRes.ok) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const user = await userRes.json();
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const now = new Date();
    const weekStart = startOfWeekMonday(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const { data: sessions, error } = await admin
      .from("sessions")
      .select("id, client_id")
      .eq("xero_invoice_pending", true)
      .is("xero_invoice_raised_at", null)
      .gte("session_date", weekStart.toISOString())
      .lt("session_date", weekEnd.toISOString());

    if (error) throw error;
    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ ok: true, raised: 0, message: "no pending sessions this week" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by client
    const byClient = new Map<string, string[]>();
    for (const s of sessions as any[]) {
      const arr = byClient.get(s.client_id) || [];
      arr.push(s.id);
      byClient.set(s.client_id, arr);
    }

    let raised = 0;
    const failures: Array<{ client_id: string; error: string }> = [];

    for (const [clientId, sessionIds] of byClient.entries()) {
      try {
        const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/xero-invoice-booking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Forward an Authorization header so the downstream function authenticates; service role acts as caller.
            "Authorization": authHeader || `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          },
          body: JSON.stringify({ session_ids: sessionIds }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.error) {
          failures.push({ client_id: clientId, error: json?.error || `HTTP ${res.status}` });
          continue;
        }
        await admin
          .from("sessions")
          .update({
            xero_invoice_raised_at: new Date().toISOString(),
            xero_invoice_id: json?.invoice_id || null,
          })
          .in("id", sessionIds);
        raised += sessionIds.length;
      } catch (e: any) {
        failures.push({ client_id: clientId, error: e?.message || String(e) });
      }
    }

    return new Response(JSON.stringify({ ok: true, raised, failures }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
