import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Telegram Bot API (direct, no gateway) ─────────────────────────────────────
function tg(token: string, method: string, body: object) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) {
    return new Response(
      JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("OK", { status: 200 });
  }

  // ── Telegram webhook event (Telegram POSTs updates here) ───────────────────
  // ── Telegram webhook event (Telegram POSTs updates here) ───────────────────
  if ("update_id" in body) {
    // Verify the Telegram secret token to prevent unauthenticated forgery
    const providedSecret = req.headers.get("x-telegram-bot-api-secret-token") || "";
    async function deriveSecret(apiKey: string): Promise<string> {
      const explicit = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
      if (explicit) return explicit;
      const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    const expectedSecret = await deriveSecret(BOT_TOKEN);
    if (!providedSecret || providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await handleUpdate(body, BOT_TOKEN, supabase);
    return new Response("OK", { status: 200 });
  }

  // ── Outbound notification (called by our app / DB trigger) ─────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const isServiceCall = token === SUPABASE_SERVICE_ROLE_KEY;
  let callerId: string | null = null;

  if (!isServiceCall) {
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    callerId = userData.user.id;
  }

  try {
    const { user_id, title, message, link } = body;

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: "Missing user_id or title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isServiceCall && callerId && user_id !== callerId) {
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", callerId);
      const callerRoles = (roles || []).map((r: any) => r.role);
      if (!callerRoles.includes("admin") && !callerRoles.includes("team_member")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: secrets, error: secretsError } = await supabase
      .from("profile_secrets").select("telegram_chat_id").eq("user_id", user_id).single();

    if (secretsError || !secrets?.telegram_chat_id) {
      return new Response(
        JSON.stringify({ sent: false, reason: "No Telegram chat ID configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const icon = title.includes("Session") ? "📅"
      : title.includes("Message") ? "💬"
      : title.includes("Task") ? "✅"
      : "🔔";

    let text = `${icon} <b>${esc(title)}</b>\n\n${esc(message || "")}`;
    if (link) text += `\n\n<a href="https://bacbs.com${link}">View in app →</a>`;

    const appUrl = link ? `https://bacbs.com${link}` : "https://bacbs.com/portal";
    const replyMarkup = {
      inline_keyboard: [
        [{ text: `${icon} Open in App`, url: appUrl }],
        [
          { text: "📅 Sessions", callback_data: "cmd:sessions" },
          { text: "✅ Tasks",    callback_data: "cmd:tasks"    },
          { text: "📊 Status",   callback_data: "cmd:status"   },
        ],
      ],
    };

    const res = await tg(BOT_TOKEN, "sendMessage", {
      chat_id: secrets.telegram_chat_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: replyMarkup,
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Telegram error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ sent: false, error: `Telegram error [${res.status}]` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ sent: true, message_id: data.result?.message_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ── Webhook update handler ─────────────────────────────────────────────────────

async function handleUpdate(update: any, token: string, supabase: any) {
  if (update.callback_query) {
    const q = update.callback_query;
    const chatId = q.message.chat.id;
    await tg(token, "answerCallbackQuery", { callback_query_id: q.id });
    const cmd = (q.data || "").replace("cmd:", "");
    const userId = await getUserId(chatId, supabase);
    if (!userId) await send(token, chatId, notLinked(chatId));
    else await dispatch(cmd, chatId, userId, token, supabase);
    return;
  }

  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const cmd = (msg.text || "").trim().split("@")[0].replace(/^\//, "").toLowerCase();
    const userId = await getUserId(chatId, supabase);

    if (cmd === "start") { await cmdStart(chatId, userId, token, supabase); return; }
    if (!userId) { await send(token, chatId, notLinked(chatId)); return; }
    await dispatch(cmd, chatId, userId, token, supabase);
  }
}

async function dispatch(cmd: string, chatId: number | string, userId: string, token: string, supabase: any) {
  switch (cmd) {
    case "sessions": return cmdSessions(chatId, userId, token, supabase);
    case "tasks":    return cmdTasks(chatId, userId, token, supabase);
    case "messages": return cmdMessages(chatId, userId, token, supabase);
    case "status":   return cmdStatus(chatId, userId, token, supabase);
    default:
      await send(token, chatId,
        `🤔 Unknown command. Try:\n\n/sessions /tasks /messages /status`,
        keyboard(),
      );
  }
}

async function cmdStart(chatId: number | string, userId: string | null, token: string, supabase: any) {
  if (!userId) {
    await send(token, chatId,
      `👋 <b>Welcome to Binyan CBS</b>\n\n` +
      `To link your account:\n` +
      `1. Log in at <a href="https://bacbs.com/portal">bacbs.com/portal</a>\n` +
      `2. Go to <b>Settings → Notification Settings</b>\n` +
      `3. Enter your Chat ID: <code>${chatId}</code>`,
    );
    return;
  }
  const { data: p } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  const name = p?.full_name?.split(" ")[0] || "there";
  await send(token, chatId,
    `👋 <b>Hi ${esc(name)}!</b>\n\nYou're connected to Binyan CBS.\n\n` +
    `📅 /sessions — Upcoming sessions\n` +
    `✅ /tasks — Pending homework\n` +
    `💬 /messages — Unread messages\n` +
    `📊 /status — Full summary`,
    keyboard(),
  );
}

async function cmdSessions(chatId: number | string, userId: string, token: string, supabase: any) {
  const { data } = await supabase
    .from("sessions").select("title, session_date, duration_minutes")
    .eq("client_id", userId).gte("session_date", new Date().toISOString())
    .order("session_date", { ascending: true }).limit(5);

  if (!data?.length) {
    await send(token, chatId,
      `📅 <b>Upcoming Sessions</b>\n\nNo sessions scheduled.\n\n<a href="https://bacbs.com/portal/booking">Book a session →</a>`,
      keyboard(),
    );
    return;
  }
  const lines = data.map((s: any) => {
    const d = new Date(s.session_date);
    const date = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `📅 <b>${esc(s.title || "Session")}</b>\n${date} at ${time} · ${s.duration_minutes} min`;
  });
  await send(token, chatId,
    `📅 <b>Upcoming Sessions (${data.length})</b>\n\n${lines.join("\n\n")}\n\n<a href="https://bacbs.com/portal/booking">Book another →</a>`,
    keyboard(),
  );
}

async function cmdTasks(chatId: number | string, userId: string, token: string, supabase: any) {
  const { data } = await supabase
    .from("client_todos").select("title, due_date")
    .eq("client_id", userId).eq("is_completed", false)
    .order("created_at", { ascending: true }).limit(10);

  if (!data?.length) {
    await send(token, chatId, `✅ <b>Tasks</b>\n\nAll caught up! No pending tasks.`, keyboard());
    return;
  }
  const lines = data.map((t: any) => {
    let line = `• ${esc(t.title)}`;
    if (t.due_date) {
      const due = new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      line += ` <i>(due ${due})</i>`;
    }
    return line;
  });
  await send(token, chatId,
    `✅ <b>Pending Tasks (${data.length})</b>\n\n${lines.join("\n")}\n\n<a href="https://bacbs.com/portal">View in portal →</a>`,
    keyboard(),
  );
}

async function cmdMessages(chatId: number | string, userId: string, token: string, supabase: any) {
  const { count } = await supabase
    .from("messages").select("id", { count: "exact", head: true })
    .eq("recipient_id", userId).eq("read", false);
  if (!count) {
    await send(token, chatId, `💬 <b>Messages</b>\n\nNo unread messages. ✓`, keyboard());
    return;
  }
  await send(token, chatId,
    `💬 <b>Messages</b>\n\n<b>${count} unread</b> message${count > 1 ? "s" : ""}.\n\n<a href="https://bacbs.com/portal/messages">Open messages →</a>`,
    keyboard(),
  );
}

async function cmdStatus(chatId: number | string, userId: string, token: string, supabase: any) {
  const [sR, tR, mR] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("client_id", userId).gte("session_date", new Date().toISOString()),
    supabase.from("client_todos").select("id", { count: "exact", head: true }).eq("client_id", userId).eq("is_completed", false),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", userId).eq("read", false),
  ]);
  await send(token, chatId,
    `📊 <b>Your Summary</b>\n\n` +
    `📅 Sessions — ${sR.count ?? 0} upcoming\n` +
    `✅ Tasks — ${tR.count ?? 0} pending\n` +
    `💬 Messages — ${mR.count ?? 0} unread\n\n` +
    `<a href="https://bacbs.com/portal">Open portal →</a>`,
    keyboard(),
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📅 Sessions", callback_data: "cmd:sessions" },
        { text: "✅ Tasks",    callback_data: "cmd:tasks"    },
      ],
      [
        { text: "💬 Messages", callback_data: "cmd:messages" },
        { text: "📊 Status",   callback_data: "cmd:status"   },
      ],
      [{ text: "🔗 Open Portal", url: "https://bacbs.com/portal" }],
    ],
  };
}

async function send(token: string, chatId: number | string, text: string, replyMarkup?: object) {
  await tg(token, "sendMessage", {
    chat_id: chatId, text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function getUserId(chatId: number | string, supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from("profile_secrets").select("user_id")
    .eq("telegram_chat_id", String(chatId)).single();
  return data?.user_id ?? null;
}

function notLinked(chatId: number | string): string {
  return `⚠️ Not linked. Go to <a href="https://bacbs.com/portal/settings">portal settings</a> and enter Chat ID: <code>${chatId}</code>`;
}

function esc(s: string): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
