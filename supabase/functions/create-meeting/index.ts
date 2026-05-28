// Creates a real meeting in the host staff member's connected provider account.
// Refreshes their OAuth token if needed, calls the provider API, and returns
// { join_url, meeting_id }. Caller is responsible for writing the URL to sessions.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TENANT = Deno.env.get("MICROSOFT_OAUTH_TENANT_ID") || "common";

interface MeetingRequest {
  host_user_id: string;
  provider: "google" | "microsoft" | "zoom";
  title: string;
  start_iso: string;
  duration_minutes: number;
  attendee_email?: string;
}

async function refreshGoogle(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return await res.json();
}

async function refreshMicrosoft(refreshToken: string) {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID")!,
      client_secret: Deno.env.get("MICROSOFT_OAUTH_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "offline_access User.Read Calendars.ReadWrite OnlineMeetings.ReadWrite",
    }),
  });
  return await res.json();
}

async function refreshZoom(refreshToken: string) {
  const auth = btoa(`${Deno.env.get("ZOOM_OAUTH_CLIENT_ID")}:${Deno.env.get("ZOOM_OAUTH_CLIENT_SECRET")}`);
  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({ refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  return await res.json();
}

async function getValidToken(supabase: any, integration: any) {
  const expiresAt = new Date(integration.token_expires_at).getTime();
  if (expiresAt > Date.now() + 60_000) return integration.access_token;

  let refreshed: any;
  if (integration.provider === "google") refreshed = await refreshGoogle(integration.refresh_token);
  else if (integration.provider === "microsoft") refreshed = await refreshMicrosoft(integration.refresh_token);
  else refreshed = await refreshZoom(integration.refresh_token);

  if (!refreshed.access_token) throw new Error(`Failed to refresh ${integration.provider} token`);

  await supabase.from("staff_integrations").update({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || integration.refresh_token,
    token_expires_at: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000).toISOString(),
  }).eq("id", integration.id);

  return refreshed.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Authentication: require a valid Supabase JWT ─────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // ── Authorization: caller must be admin or team_member ───────────────────
    // ── Authorization: caller must be admin or team_member ───────────────────
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const roleList = (roles || []).map((r: any) => r.role);
    const isAdmin = roleList.includes("admin");
    const isTeamMember = roleList.includes("team_member");
    if (!isAdmin && !isTeamMember) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as MeetingRequest;
    const { host_user_id, provider, title, start_iso, duration_minutes, attendee_email } = body;
    if (!host_user_id || !provider || !title || !start_iso || !duration_minutes) {
      throw new Error("Missing required fields");
    }

    // Non-admins may only use their own connected OAuth integration
    if (!isAdmin && host_user_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden: cannot use another user's integration" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: integration } = await supabase
      .from("staff_integrations")
      .select("*")
      .eq("user_id", host_user_id)
      .eq("provider", provider)
      .maybeSingle();

    if (!integration) throw new Error(`Host has not connected ${provider}`);

    const accessToken = await getValidToken(supabase, integration);
    const endIso = new Date(new Date(start_iso).getTime() + duration_minutes * 60_000).toISOString();

    let join_url = "";
    let meeting_id = "";

    if (provider === "google") {
      const r = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: title,
          start: { dateTime: start_iso },
          end: { dateTime: endIso },
          attendees: attendee_email ? [{ email: attendee_email }] : [],
          conferenceData: {
            createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
          },
        }),
      });
      const evt = await r.json();
      if (!r.ok) throw new Error(`Google: ${JSON.stringify(evt)}`);
      join_url = evt.hangoutLink || evt.conferenceData?.entryPoints?.[0]?.uri || "";
      meeting_id = evt.id;
    } else if (provider === "microsoft") {
      const r = await fetch("https://graph.microsoft.com/v1.0/me/onlineMeetings", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: title, startDateTime: start_iso, endDateTime: endIso }),
      });
      const meeting = await r.json();
      if (!r.ok) throw new Error(`Microsoft: ${JSON.stringify(meeting)}`);
      join_url = meeting.joinWebUrl || "";
      meeting_id = meeting.id;
    } else if (provider === "zoom") {
      const r = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: title,
          type: 2, // scheduled
          start_time: start_iso,
          duration: duration_minutes,
          settings: { join_before_host: true, waiting_room: false },
        }),
      });
      const meeting = await r.json();
      if (!r.ok) throw new Error(`Zoom: ${JSON.stringify(meeting)}`);
      join_url = meeting.join_url || "";
      meeting_id = String(meeting.id || "");
    }

    if (!join_url) throw new Error("No join URL returned");

    return new Response(JSON.stringify({ join_url, meeting_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-meeting error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
