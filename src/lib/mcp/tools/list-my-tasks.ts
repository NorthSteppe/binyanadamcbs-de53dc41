import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_my_tasks",
  title: "List my tasks",
  description: "List the signed-in user's open tasks from the productivity task board.",
  inputSchema: {
    include_completed: z.boolean().optional().describe("Include completed tasks (default false)."),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ include_completed, limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = supabase
      .from("user_tasks")
      .select("id, title, description, priority, status, due_date, is_completed, created_at")
      .eq("user_id", ctx.getUserId())
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(limit ?? 25);
    if (!include_completed) q = q.eq("is_completed", false);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tasks: data ?? [] },
    };
  },
});
