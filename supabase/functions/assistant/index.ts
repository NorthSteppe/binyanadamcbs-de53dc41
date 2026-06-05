import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 50;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages, conversation_id } = body;

    if (!messages || !Array.isArray(messages) || messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["user", "assistant", "system"];
    const sanitized = messages
      .filter((m: any) => m.role && validRoles.includes(m.role) && typeof m.content === "string" && m.content.length <= MAX_MESSAGE_LENGTH)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

    if (sanitized.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create service-role client for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user is authenticated (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && authHeader.length > 20) {
      const token = authHeader.replace("Bearer ", "");
      // Skip if it's the anon key
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      if (token !== anonKey) {
        try {
          const userClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
          );
          const { data: userData } = await userClient.auth.getUser();
          if (userData?.user) userId = userData.user.id;
        } catch { /* anonymous visitor */ }
      }
    }

    // Fetch assistant config
    const { data: configData } = await supabaseAdmin
      .from("assistant_config")
      .select("*")
      .limit(1)
      .single();

    const config = configData || { system_prompt: "", is_enabled: true };

    if (!config.is_enabled) {
      return new Response(JSON.stringify({ error: "Assistant is currently disabled" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch knowledge documents
    const { data: knowledgeDocs } = await supabaseAdmin
      .from("assistant_knowledge")
      .select("title, content, category")
      .eq("is_active", true);

    // Fetch active flows
    const { data: flows } = await supabaseAdmin
      .from("assistant_flows")
      .select("name, description, flow_steps, trigger_type")
      .eq("is_active", true)
      .order("display_order");

    // Build user context if authenticated
    let userContext = "";
    if (userId) {
      // Get user's upcoming sessions
      const now = new Date().toISOString();
      const { data: sessions } = await supabaseAdmin
        .from("sessions")
        .select("title, session_date, status")
        .eq("client_id", userId)
        .gte("session_date", now)
        .order("session_date")
        .limit(5);

      // Get user's incomplete tasks
      const { data: tasks } = await supabaseAdmin
        .from("user_tasks")
        .select("title, due_date, priority, status")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("due_date")
        .limit(5);

      // Get user's incomplete client todos
      const { data: todos } = await supabaseAdmin
        .from("client_todos")
        .select("title, due_date, is_completed")
        .eq("client_id", userId)
        .eq("is_completed", false)
        .limit(5);

      if (sessions?.length || tasks?.length || todos?.length) {
        userContext = "\n\n## User's Current Context\n";
        if (sessions?.length) {
          userContext += "\n### Upcoming Sessions:\n" + sessions.map(s =>
            `- "${s.title}" on ${new Date(s.session_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (${s.status})`
          ).join("\n");
        }
        if (tasks?.length) {
          userContext += "\n### Current Tasks:\n" + tasks.map(t =>
            `- "${t.title}" (${t.priority} priority${t.due_date ? `, due ${new Date(t.due_date).toLocaleDateString('en-GB')}` : ''})`
          ).join("\n");
        }
        if (todos?.length) {
          userContext += "\n### To-Do Items:\n" + todos.map(t =>
            `- "${t.title}"${t.due_date ? ` (due ${new Date(t.due_date).toLocaleDateString('en-GB')})` : ''}`
          ).join("\n");
        }
      }
    }

    // Build knowledge context
    let knowledgeContext = "";
    if (knowledgeDocs?.length) {
      knowledgeContext = "\n\n## Knowledge Base\n" + knowledgeDocs.map(d =>
        `### ${d.title} (${d.category})\n${d.content}`
      ).join("\n\n");
    }

    // Build flows context
    let flowContext = "";
    if (flows?.length) {
      const relevantFlows = flows.filter(f =>
        f.trigger_type === "both" ||
        (userId ? f.trigger_type === "user" : f.trigger_type === "visitor")
      );
      if (relevantFlows.length) {
        flowContext = "\n\n## Available Guided Flows\nYou can use these question flows when appropriate:\n" +
          relevantFlows.map(f => {
            const steps = Array.isArray(f.flow_steps) ? f.flow_steps : [];
            return `### ${f.name}\n${f.description}\nSteps: ${JSON.stringify(steps)}`;
          }).join("\n\n");
      }
    }

    const isVisitor = !userId;
    const basePrompt = config.system_prompt || `You are Binyan's proactive AI assistant. You help visitors discover the right service by asking thoughtful questions about their needs. For logged-in users, you proactively help with their tasks, upcoming sessions, and goals.`;

    const systemPrompt = `${basePrompt}

## Your Role
You are a PROACTIVE assistant — you don't just wait for questions, you initiate helpful conversations.
${isVisitor ? `
## Visitor Mode
The user is a website visitor (not logged in). Your goal is to:
1. Understand their needs by asking thoughtful questions
2. Recommend the right Binyan service (Education, Therapy, Family Support, Organisations, Supervision)
3. Collect relevant information naturally during the conversation (name, concern area, who needs support)
4. Guide them toward booking a consultation
5. Be warm and approachable — not salesy

When you've gathered enough information, always include a JSON block at the end of your message (hidden from the user) with collected data:
<collected_data>{"name":"...","concern":"...","service_interest":"...","age_group":"...","contact_preference":"..."}</collected_data>
` : `
## Logged-in User Mode
The user is a registered client. You can see their tasks, sessions, and to-dos.
Proactively suggest helpful actions based on their data. Be a supportive accountability partner.
`}
${knowledgeContext}
${flowContext}
${userContext}

Always be supportive, clear, and use markdown formatting. Keep responses concise and conversational.`;

    // Save/update conversation — verify ownership to prevent IDOR
    if (conversation_id) {
      const { data: convo } = await supabaseAdmin
        .from("assistant_conversations")
        .select("user_id")
        .eq("id", conversation_id)
        .maybeSingle();
      const ownerOk =
        convo &&
        ((userId === null && convo.user_id === null) ||
         (userId !== null && convo.user_id === userId));
      if (ownerOk) {
        await supabaseAdmin
          .from("assistant_conversations")
          .update({
            messages: sanitized,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversation_id);
      }
    }


    const recentMessages = sanitized.slice(-20);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("assistant error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
