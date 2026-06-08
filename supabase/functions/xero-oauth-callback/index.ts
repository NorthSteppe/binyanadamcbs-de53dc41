import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyState } from "../_shared/oauth-state.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_RETURN = "https://bacbs.com/admin/business?tab=xero";

function html(msg: string, ok = true) {
  return `<!doctype html><meta charset="utf-8"><title>Xero</title>
<style>body{font-family:system-ui;padding:40px;text-align:center;color:#0f172a}</style>
<h1>${ok ? "Xero connected" : "Xero connection failed"}</h1>
<p>${msg}</p>
<p>Redirecting to your dashboard…</p>
<script>setTimeout(()=>location.href=${JSON.stringify(APP_RETURN + (ok ? "&xero=ok" : "&xero=err"))},1500)</script>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return new Response(html(`Xero returned: ${error}`, false), { headers: { "Content-Type": "text/html" } });
  if (!code || !state) return new Response(html("Missing code/state", false), { headers: { "Content-Type": "text/html" } });

  try {
    const payload = await verifyState(state);
    const userId = payload.user_id;
    if (!userId) throw new Error("Invalid state");

    const clientId = Deno.env.get("XERO_CLIENT_ID")!;
    const clientSecret = Deno.env.get("XERO_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/xero-oauth-callback`;

    const basic = btoa(`${clientId}:${clientSecret}`);

    const tokenRes = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: { "Authorization": `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${JSON.stringify(tokenJson)}`);

    const accessToken = tokenJson.access_token as string;
    const refreshToken = tokenJson.refresh_token as string;
    const expiresAt = new Date(Date.now() + (tokenJson.expires_in ?? 1800) * 1000).toISOString();
    const scope = tokenJson.scope as string;

    // get connections (tenants)
    const connRes = await fetch("https://api.xero.com/connections", {
      headers: { "Authorization": `Bearer ${accessToken}`, "Accept": "application/json" },
    });
    const connections = await connRes.json();
    if (!connRes.ok || !Array.isArray(connections) || connections.length === 0) throw new Error("No Xero tenants found");
    const tenant = connections[0];

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // upsert single connection row
    await admin.from("xero_connection").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: insErr } = await admin.from("xero_connection").insert({
      tenant_id: tenant.tenantId,
      tenant_name: tenant.tenantName,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      scope,
      connected_by: userId,
    });
    if (insErr) throw insErr;

    return new Response(html(`Connected to ${tenant.tenantName}.`), { headers: { "Content-Type": "text/html" } });
  } catch (e) {
    console.error("xero-oauth-callback", e);
    return new Response(html((e as Error).message, false), { headers: { "Content-Type": "text/html" } });
  }
});
