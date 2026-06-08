import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signState } from "../_shared/oauth-state.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "accounting.invoices",
  "accounting.contacts",
  "accounting.reports.profitandloss.read",
  "accounting.settings",
].join(" ");

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const clientId = Deno.env.get("XERO_CLIENT_ID");
    if (!supabaseUrl || !serviceRoleKey || !clientId) {
      console.error("xero-oauth-start missing configuration", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
        hasClientId: Boolean(clientId),
      });
      return json({ error: "Xero is not fully configured yet." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: ue } = await admin.auth.getUser(token);
    if (ue || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const userId = userData.user.id;

    // Admin gate
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const redirectUri = `${supabaseUrl}/functions/v1/xero-oauth-callback`;

    // HMAC-signed state so the callback can verify it was issued here and
    // not forged to link an attacker's Xero tenant to another user's record.
    const state = await signState({ user_id: userId, ts: Date.now() });

    const url = new URL("https://login.xero.com/identity/connect/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("state", state);

    return json({ url: url.toString(), scope: SCOPES });
  } catch (e) {
    console.error("xero-oauth-start", e);
    return json({ error: "XERO_OAUTH_START_FAILED", details: (e as Error).message, fallback: true });
  }
});
