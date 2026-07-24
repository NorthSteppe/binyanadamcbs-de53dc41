import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_upcoming_sessions",
  title: "List upcoming sessions",
  description:
    "List the signed-in user's upcoming Blueprint sessions (as client, therapist, or supervisee). Ordered by session_date ascending. RLS applies.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of sessions to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("sessions")
      .select("id, title, session_date, status, meeting_link, meeting_platform")
      .gte("session_date", now)
      .order("session_date", { ascending: true })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { sessions: data ?? [] },
    };
  },
});
