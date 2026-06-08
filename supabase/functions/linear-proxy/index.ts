import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/linear";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const LINEAR_API_KEY = Deno.env.get("LINEAR_API_KEY");
    if (!LINEAR_API_KEY) throw new Error("LINEAR_API_KEY is not configured");

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Check user is staff
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const userRoles = roles?.map((r: any) => r.role) || [];
    const isStaff = userRoles.includes("admin") || userRoles.includes("team_member");
    if (!isStaff) throw new Error("Insufficient permissions");

    const body = await req.json();
    const { action, query, variables } = body;

    // For admin-only actions
    const isAdmin = userRoles.includes("admin");

    if (action === "graphql") {
      const response = await fetch(`${GATEWAY_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": LINEAR_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Linear API failed [${response.status}]: ${errorBody}`);
      }

      const data = await response.json();

      // For non-admin, filter to only issues assigned to the authenticated
      // user. We resolve the identity server-side (via the verified Supabase
      // email) instead of trusting any client-supplied Linear user id, which
      // would otherwise let any staff member view another teammate's queue.
      if (!isAdmin && data?.data?.issues?.nodes) {
        const userEmail = (user.email || "").toLowerCase();
        data.data.issues.nodes = userEmail
          ? data.data.issues.nodes.filter(
              (issue: any) => (issue.assignee?.email || "").toLowerCase() === userEmail
            )
          : [];
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Linear proxy error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
