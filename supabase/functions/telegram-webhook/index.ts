import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Telegram API helpers (direct — no Lovable gateway) ────────────────────────

function tgApi(method: string, body: object) {
  const token = Deno.env.get("TELEGRAM_API_KEY")!;
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function reply(chatId: number | string, text: string, extra: object = {}) {
  await tgApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

async function answerCallback(callbackQueryId: string, text = "") {
  await tgApi("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

// ── Inline keyboard shown after every bot response ────────────────────────────

function mainKeyboard() {
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
      [
        { text: "🔗 Open Portal", url: "https://bacbs.com/portal" },
      ],
    ],
  };
}

// ── Main handler ───────────────────────────────────────────────────────────────

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function deriveTelegramWebhookSecret(): Promise<string | null> {
  // Prefer an explicit env secret; fall back to deriving from TELEGRAM_API_KEY
  const explicit = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (explicit) return explicit;
  const apiKey = Deno.env.get("TELEGRAM_API_KEY");
  if (!apiKey) return null;
  const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Verify Telegram secret token to reject forged updates ──────────────────
  const expectedSecret = await deriveTelegramWebhookSecret();
  if (!expectedSecret) {
    console.error("telegram-webhook: missing TELEGRAM_API_KEY/TELEGRAM_WEBHOOK_SECRET");
    return new Response("Unauthorized", { status: 401 });
  }
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  if (!safeEqual(provided, expectedSecret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response("OK", { status: 200 });
  }

  // ── Inline button tap ──────────────────────────────────────────────────────
  if (update.callback_query) {
    const q = update.callback_query;
    const chatId = q.message.chat.id;
    const data: string = q.data || "";

    await answerCallback(q.id);

    if (data.startsWith("cmd:")) {
      const cmd = data.replace("cmd:", "");
      const userId = await getUserId(chatId, supabase);
      if (!userId) {
        await reply(chatId, notLinkedMsg(chatId));
      } else {
        await dispatch(cmd, chatId, userId, supabase);
      }
    }

    return new Response("OK", { status: 200 });
  }

  // ── Regular text message ───────────────────────────────────────────────────
  if (update.message) {
    const msg = update.message;
    const chatId: number = msg.chat.id;
    const text: string = (msg.text || "").trim();

    // Extract command (strips @BotName suffix and leading slash)
    const cmd = text.split("@")[0].replace(/^\//, "").toLowerCase();

    const userId = await getUserId(chatId, supabase);

    if (cmd === "start") {
      await handleStart(chatId, userId, supabase);
      return new Response("OK", { status: 200 });
    }

    if (!userId) {
      await reply(chatId, notLinkedMsg(chatId));
      return new Response("OK", { status: 200 });
    }

    await dispatch(cmd, chatId, userId, supabase);
  }

  return new Response("OK", { status: 200 });
});

// ── Route commands ─────────────────────────────────────────────────────────────

async function dispatch(
  cmd: string,
  chatId: number | string,
  userId: string,
  supabase: any,
) {
  switch (cmd) {
    case "sessions": return handleSessions(chatId, userId, supabase);
    case "tasks":    return handleTasks(chatId, userId, supabase);
    case "messages": return handleMessages(chatId, userId, supabase);
    case "status":   return handleStatus(chatId, userId, supabase);
    default:
      await reply(
        chatId,
        `🤔 Unknown command. Try one of:\n\n` +
        `/sessions — Upcoming sessions\n` +
        `/tasks — Pending homework\n` +
        `/messages — Unread messages\n` +
        `/status — Quick summary`,
        { reply_markup: mainKeyboard() },
      );
  }
}

// ── Command handlers ───────────────────────────────────────────────────────────

async function handleStart(
  chatId: number | string,
  userId: string | null,
  supabase: any,
) {
  if (!userId) {
    await reply(
      chatId,
      `👋 <b>Welcome to Blueprint CBS</b>\n\n` +
      `To link your account:\n` +
      `1. Log in at <a href="https://bacbs.com/portal">bacbs.com/portal</a>\n` +
      `2. Go to <b>Settings → Notification Settings</b>\n` +
      `3. Paste your Chat ID: <code>${chatId}</code>\n\n` +
      `Once linked you can check sessions, tasks, and messages right here.`,
    );
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  const name = profile?.full_name?.split(" ")[0] || "there";

  await reply(
    chatId,
    `👋 <b>Hi ${esc(name)}!</b>\n\nYou're connected to Blueprint CBS.\n\n` +
    `Here's what I can do:\n\n` +
    `📅 /sessions — Your upcoming sessions\n` +
    `✅ /tasks — Pending homework & tasks\n` +
    `💬 /messages — Unread messages\n` +
    `📊 /status — Full summary`,
    { reply_markup: mainKeyboard() },
  );
}

async function handleSessions(
  chatId: number | string,
  userId: string,
  supabase: any,
) {
  const { data: sessions } = await supabase
    .from("sessions")
    .select("title, session_date, duration_minutes, status")
    .eq("client_id", userId)
    .gte("session_date", new Date().toISOString())
    .order("session_date", { ascending: true })
    .limit(5);

  if (!sessions || sessions.length === 0) {
    await reply(
      chatId,
      `📅 <b>Upcoming Sessions</b>\n\nNo sessions scheduled.\n\n` +
      `<a href="https://bacbs.com/portal/booking">Book a session →</a>`,
      { reply_markup: mainKeyboard() },
    );
    return;
  }

  const lines = sessions.map((s: any) => {
    const d = new Date(s.session_date);
    const date = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `📅 <b>${esc(s.title || "Session")}</b>\n${date} at ${time} · ${s.duration_minutes} min`;
  });

  await reply(
    chatId,
    `📅 <b>Upcoming Sessions (${sessions.length})</b>\n\n${lines.join("\n\n")}\n\n` +
    `<a href="https://bacbs.com/portal/booking">Book another →</a>`,
    { reply_markup: mainKeyboard() },
  );
}

async function handleTasks(
  chatId: number | string,
  userId: string,
  supabase: any,
) {
  const { data: todos } = await supabase
    .from("client_todos")
    .select("title, due_date")
    .eq("client_id", userId)
    .eq("is_completed", false)
    .order("created_at", { ascending: true })
    .limit(10);

  if (!todos || todos.length === 0) {
    await reply(
      chatId,
      `✅ <b>Tasks</b>\n\nYou're all caught up! No pending tasks.`,
      { reply_markup: mainKeyboard() },
    );
    return;
  }

  const lines = todos.map((t: any) => {
    let line = `• ${esc(t.title)}`;
    if (t.due_date) {
      const due = new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      line += ` <i>(due ${due})</i>`;
    }
    return line;
  });

  await reply(
    chatId,
    `✅ <b>Pending Tasks (${todos.length})</b>\n\n${lines.join("\n")}\n\n` +
    `<a href="https://bacbs.com/portal">View in portal →</a>`,
    { reply_markup: mainKeyboard() },
  );
}

async function handleMessages(
  chatId: number | string,
  userId: string,
  supabase: any,
) {
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("read", false);

  if (!count) {
    await reply(
      chatId,
      `💬 <b>Messages</b>\n\nNo unread messages. ✓`,
      { reply_markup: mainKeyboard() },
    );
    return;
  }

  await reply(
    chatId,
    `💬 <b>Messages</b>\n\nYou have <b>${count} unread message${count > 1 ? "s" : ""}</b>.\n\n` +
    `<a href="https://bacbs.com/portal/messages">Open messages →</a>`,
    { reply_markup: mainKeyboard() },
  );
}

async function handleStatus(
  chatId: number | string,
  userId: string,
  supabase: any,
) {
  const [sessRes, taskRes, msgRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("client_id", userId)
      .gte("session_date", new Date().toISOString()),
    supabase
      .from("client_todos")
      .select("id", { count: "exact", head: true })
      .eq("client_id", userId)
      .eq("is_completed", false),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("read", false),
  ]);

  const sessions = sessRes.count ?? 0;
  const tasks    = taskRes.count ?? 0;
  const messages = msgRes.count  ?? 0;

  const sessionLine  = sessions  === 0 ? "None scheduled"          : `${sessions} upcoming`;
  const tasksLine    = tasks     === 0 ? "All done ✓"              : `${tasks} pending`;
  const messagesLine = messages  === 0 ? "All read ✓"              : `${messages} unread`;

  await reply(
    chatId,
    `📊 <b>Your Summary</b>\n\n` +
    `📅 Sessions — ${sessionLine}\n` +
    `✅ Tasks — ${tasksLine}\n` +
    `💬 Messages — ${messagesLine}\n\n` +
    `<a href="https://bacbs.com/portal">Open portal →</a>`,
    { reply_markup: mainKeyboard() },
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getUserId(
  chatId: number | string,
  supabase: any,
): Promise<string | null> {
  const { data } = await supabase
    .from("profile_secrets")
    .select("user_id")
    .eq("telegram_chat_id", String(chatId))
    .single();
  return data?.user_id ?? null;
}

function notLinkedMsg(chatId: number | string): string {
  return (
    `⚠️ Your Telegram isn't linked yet.\n\n` +
    `Go to <a href="https://bacbs.com/portal/settings">portal settings</a>, ` +
    `enter your Chat ID <code>${chatId}</code>, and tap Save.`
  );
}

function esc(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
