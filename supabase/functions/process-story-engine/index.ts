// Daily Story Engine processor — fictionalises source files into blog posts and broadcasts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SITE_URL = "https://bacbs.com";

const VOICES = ["clinical-reflective", "warm-narrative", "research-led", "case-study-frame"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function readFileText(supabase: any, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("story-sources").download(path);
  if (error) throw new Error(`Download failed: ${error.message}`);
  // Plain text/markdown only; .docx would need parsing — keep MVP to text/md
  const text = await data.text();
  return text;
}

async function generateBlogPost(rawText: string, voice: string) {
  const systemPrompt = `You are a clinical writer for "Blueprint CBS", a constructional behavioural practice. Take a real source story and FULLY FICTIONALISE it: change names, ages, locations, identifying details, and any specific dates. Preserve only the clinical/behavioural pattern and the constructional insight. Avoid ABA jargon like "compliance" or "extinction" — use capability-building language.

Voice for this piece: ${voice}.

Output a complete blog post via the provided tool.`;

  const userPrompt = `Source material (FULLY FICTIONALISE — no real details may survive):\n\n${rawText.slice(0, 12000)}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "publish_post",
            description: "Publish a fictionalised blog post.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "SEO-friendly title under 60 chars" },
                slug: { type: "string", description: "url-safe slug, lowercase-hyphens" },
                abstract: { type: "string", description: "1–2 sentence summary, under 200 chars" },
                meta_description: { type: "string", description: "SEO meta description under 160 chars" },
                content: { type: "string", description: "Full markdown blog post, 600-1200 words" },
                audience: { type: "string", enum: ["families", "professionals", "general"] },
                reading_time_minutes: { type: "integer" },
              },
              required: ["title", "slug", "abstract", "meta_description", "content", "audience", "reading_time_minutes"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "publish_post" } },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway error [${resp.status}]: ${t}`);
  }
  const json = await resp.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("No tool call returned");
  return JSON.parse(call.function.arguments);
}

async function broadcastTelegram(supabase: any, title: string, abstract: string, slug: string) {
  try {
    await supabase.functions.invoke("send-telegram-notification", {
      body: {
        title: `📖 New story: ${title}`,
        message: `${abstract}\n\nRead: ${SITE_URL}/insights/${slug}`,
        broadcast: true,
      },
    });
  } catch (e) {
    console.warn("Telegram broadcast failed:", e);
  }
}

async function pingSitemap() {
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`);
  } catch (e) {
    console.warn("Sitemap ping failed:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // ── Authentication: require an admin JWT ─────────────────────────────────
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

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Authorization: caller must be admin ──────────────────────────────────
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", claimsData.claims.sub);
  if (!(roles || []).some((r: any) => r.role === "admin")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  try {
    // Pick up to 3 pending sources per run
    const { data: pending, error } = await supabase
      .from("story_sources")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(3);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No pending sources" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const src of pending) {
      try {
        await supabase.from("story_sources").update({ status: "processing" }).eq("id", src.id);

        const rawText = await readFileText(supabase, src.file_path);
        if (rawText.trim().length < 50) throw new Error("Source file too short");

        const voice = VOICES[Math.floor(Math.random() * VOICES.length)];
        const post = await generateBlogPost(rawText, voice);

        const baseSlug = slugify(post.slug || post.title);
        const finalSlug = `${baseSlug}-${Date.now().toString(36)}`;

        const { data: inserted, error: insErr } = await supabase
          .from("blog_posts")
          .insert({
            title: post.title.slice(0, 200),
            slug: finalSlug,
            abstract: post.abstract,
            meta_title: post.title.slice(0, 60),
            meta_description: post.meta_description.slice(0, 160),
            content: post.content,
            audience: post.audience || "general",
            reading_time_minutes: post.reading_time_minutes || 5,
            status: "published",
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insErr) throw insErr;

        await supabase
          .from("story_sources")
          .update({
            status: "published",
            generated_post_id: inserted.id,
            voice_used: voice,
            processed_at: new Date().toISOString(),
          })
          .eq("id", src.id);

        // Distribute
        await broadcastTelegram(supabase, post.title, post.abstract, finalSlug);
        await pingSitemap();

        results.push({ id: src.id, status: "published", post_id: inserted.id, slug: finalSlug });
      } catch (e: any) {
        console.error("Failed to process", src.id, e);
        await supabase
          .from("story_sources")
          .update({ status: "failed", error_message: String(e?.message || e).slice(0, 500) })
          .eq("id", src.id);
        results.push({ id: src.id, status: "failed", error: String(e?.message || e) });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Engine error:", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
