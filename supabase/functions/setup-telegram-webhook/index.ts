// One-time setup: registers the telegram-webhook edge function URL with Telegram.
// Called from the admin UI — no Supabase dashboard needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Auth: require admin JWT ────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const SUPABASE_URL_ENV = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(SUPABASE_URL_ENV, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const adminClient = createClient(SUPABASE_URL_ENV, SERVICE_ROLE);
  const { data: roles } = await adminClient
    .from("user_roles").select("role").eq("user_id", claimsData.claims.sub);
  if (!(roles || []).some((r: any) => r.role === "admin")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  if (!TELEGRAM_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "TELEGRAM_API_KEY not set in Supabase secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!SUPABASE_URL) {
    return new Response(
      JSON.stringify({ ok: false, error: "SUPABASE_URL not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Derive the project ref from the Supabase URL
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/telegram-webhook`;

  // Derive a stable secret token to verify incoming Telegram webhooks
  async function deriveSecret(apiKey: string): Promise<string> {
    const explicit = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
    if (explicit) return explicit;
    const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  const secretToken = await deriveSecret(TELEGRAM_API_KEY);

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, secret_token: secretToken }),
    },
  );

  const data = await res.json();

  return new Response(
    JSON.stringify({ ok: data.ok, description: data.description, webhookUrl }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
