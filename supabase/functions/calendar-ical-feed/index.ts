import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Escape special iCal characters
function icalEscape(str: string): string {
  return (str || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Fold long lines per RFC 5545 (max 75 octets)
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  let folded = "";
  while (line.length > 75) {
    folded += line.substring(0, 75) + "\r\n ";
    line = line.substring(75);
  }
  return folded + line;
}

// Format a Date to iCal DTSTART/DTEND format
function toIcalDate(dateStr: string, durationMinutes = 60): { start: string; end: string } {
  const start = new Date(dateStr);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { start: fmt(start), end: fmt(end) };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Look up the user by their feed token in profile_secrets
  const { data: secretRow, error: secretError } = await supabase
    .from("profile_secrets")
    .select("user_id")
    .eq("calendar_feed_token", token)
    .single();

  if (secretError || !secretRow) {
    return new Response("Invalid or expired token", { status: 401 });
  }

  // Get the user's profile info
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", secretRow.user_id)
    .single();

  if (profileError || !profile) {
    return new Response("Invalid or expired token", { status: 401 });
  }

  const userId = profile.id;

  // Fetch sessions for this user (as client or attendee)
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, title, session_date, duration_minutes, description, meeting_url, meeting_platform")
    .or(`client_id.eq.${userId},attendee_ids.cs.{${userId}}`)
    .gte("session_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // last 90 days
    .lte("session_date", new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()); // next 180 days

  if (sessionsError) {
    return new Response("Error fetching sessions", { status: 500 });
  }

  // Build VEVENT blocks
  const events = (sessions || []).map((s: any) => {
    const { start, end } = toIcalDate(s.session_date, s.duration_minutes || 60);
    const descParts = [s.description, s.meeting_platform ? `Platform: ${s.meeting_platform}` : null, s.meeting_url ? `Join: ${s.meeting_url}` : null].filter(Boolean);
    const description = descParts.join("\n");
    const location = s.meeting_url || (s.meeting_platform ? s.meeting_platform : "");

    const lines = [
      "BEGIN:VEVENT",
      foldLine(`UID:session-${s.id}@blueprintadamcbs`),
      foldLine(`DTSTART:${start}`),
      foldLine(`DTEND:${end}`),
      foldLine(`SUMMARY:${icalEscape(s.title || "Session")}`),
      description ? foldLine(`DESCRIPTION:${icalEscape(description)}`) : null,
      location ? foldLine(`LOCATION:${icalEscape(location)}`) : null,
      "END:VEVENT",
    ].filter(Boolean).join("\r\n");

    return lines;
  });

  // Assemble the full iCal file
  const calName = `Blueprint CBS — ${profile.full_name || "My Calendar"}`;
  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blueprint CBS//Calendar Feed//EN",
    `X-WR-CALNAME:${icalEscape(calName)}`,
    "X-WR-TIMEZONE:UTC",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="blueprint-adam-calendar.ics"`,
      "Cache-Control": "no-cache, no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
