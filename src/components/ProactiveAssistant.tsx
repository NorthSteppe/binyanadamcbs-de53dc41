import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Msg = { role: "user" | "assistant"; content: string };

const ASSISTANT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`;
const STORAGE_KEY = "blueprint_assistant_dismissed";

// ─── Pixar-style friendly character ──────────────────────────────────────────
const BlueprintCharacter = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 120 130" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    {/* Collar / shirt hint */}
    <ellipse cx="60" cy="124" rx="42" ry="20" fill="#5B8DEF" />
    <rect x="42" y="104" width="36" height="26" rx="4" fill="#5B8DEF" />

    {/* Neck */}
    <rect x="50" y="92" width="20" height="18" rx="4" fill="#F5C49A" />

    {/* Head */}
    <ellipse cx="60" cy="57" rx="40" ry="44" fill="#F5C49A" />

    {/* Hair */}
    <path d="M20,46 Q18,8 60,6 Q102,8 100,46 Q88,20 60,20 Q32,20 20,46Z" fill="#2C1A0D" />

    {/* Left ear */}
    <ellipse cx="20" cy="60" rx="9" ry="12" fill="#F5C49A" />
    <ellipse cx="20" cy="60" rx="5" ry="8" fill="#EAA87C" />

    {/* Right ear */}
    <ellipse cx="100" cy="60" rx="9" ry="12" fill="#F5C49A" />
    <ellipse cx="100" cy="60" rx="5" ry="8" fill="#EAA87C" />

    {/* Eye whites */}
    <ellipse cx="43" cy="60" rx="13" ry="15" fill="white" />
    <ellipse cx="77" cy="60" rx="13" ry="15" fill="white" />

    {/* Irises */}
    <circle cx="43" cy="62" r="9.5" fill="#4A2A0C" />
    <circle cx="77" cy="62" r="9.5" fill="#4A2A0C" />

    {/* Pupils */}
    <circle cx="43" cy="62" r="6" fill="#0E0600" />
    <circle cx="77" cy="62" r="6" fill="#0E0600" />

    {/* Eye highlights — key to the Pixar warmth */}
    <circle cx="39" cy="57" r="3.2" fill="white" />
    <circle cx="73" cy="57" r="3.2" fill="white" />
    <circle cx="46" cy="65" r="1.6" fill="white" opacity="0.55" />
    <circle cx="80" cy="65" r="1.6" fill="white" opacity="0.55" />

    {/* Eyebrows — slightly raised = friendly, not stern */}
    <path d="M30,41 Q43,34 56,40" stroke="#2C1A0D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M64,40 Q77,34 90,41" stroke="#2C1A0D" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Nose */}
    <path d="M56,74 Q60,80 64,74" stroke="#C07840" strokeWidth="2.2" strokeLinecap="round" fill="none" />

    {/* Warm smile */}
    <path d="M42,84 Q60,98 78,84" stroke="#C07840" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Cheek blush */}
    <ellipse cx="25" cy="75" rx="11" ry="7" fill="#FF9B88" opacity="0.32" />
    <ellipse cx="95" cy="75" rx="11" ry="7" fill="#FF9B88" opacity="0.32" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatSessionDate = (isoDate: string) => {
  const d = new Date(isoDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "today";
  if (d.toDateString() === tomorrow.toDateString()) return "tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" });
};

// ─── Component ───────────────────────────────────────────────────────────────
const ProactiveAssistant = () => {
  const { session, user, profile, isAdmin, isTeamMember } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Derive first name
  const firstName = profile?.full_name?.split(" ")[0] || null;

  // Fetch assistant config (public-safe fields only via RPC)
  const { data: config } = useQuery({
    queryKey: ["assistant-config"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_public_assistant_config");
      return data?.[0] ?? null;
    },
    staleTime: 60000,
  });

  // Fetch upcoming sessions and pending tasks for logged-in users
  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("session_date, session_type")
      .eq("client_id", user.id)
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(3)
      .then(({ data }) => { if (data) setUpcomingSessions(data); });

    supabase
      .from("client_todos")
      .select("id, title")
      .eq("client_id", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setPendingTasks(data); });
  }, [user]);

  // Pages the AI can link to, based on the user's role
  const getAvailablePages = () => {
    if (!user) return [
      { path: "/services", label: "Our Services" },
      { path: "/contact", label: "Book a Consultation" },
      { path: "/about", label: "About Us" },
    ];
    if (isAdmin) return [
      { path: "/admin", label: "Admin Dashboard" },
      { path: "/admin/calendar", label: "Calendar" },
      { path: "/admin/users", label: "User Management" },
      { path: "/admin/business", label: "Business Dashboard" },
      { path: "/admin/blog", label: "Blog Manager" },
      { path: "/admin/assistant", label: "Assistant Manager" },
      { path: "/staff", label: "Therapist Portal" },
    ];
    if (isTeamMember) return [
      { path: "/staff", label: "Therapist Dashboard" },
      { path: "/staff/calendar", label: "Calendar" },
      { path: "/staff/messages", label: "Messages" },
      { path: "/staff/clinical-tools", label: "Clinical Tools" },
      { path: "/staff/toolkit", label: "Toolkit" },
      { path: "/staff/booking", label: "Bookings" },
    ];
    return [
      { path: "/portal", label: "My Dashboard" },
      { path: "/portal/resources", label: "Session Notes & Resources" },
      { path: "/portal/messages", label: "Messages" },
      { path: "/portal/booking", label: "Book a Session" },
      { path: "/portal/toolkit", label: "Toolkit & Exercises" },
      { path: "/portal/productivity", label: "Goals & To-Dos" },
    ];
  };

  const isEnabled = config?.is_enabled !== false;
  const delay = (config?.auto_popup_delay_seconds ?? 5) * 1000;

  // Build personalized, supportive greeting
  const buildGreeting = () => {
    if (!user) {
      return config?.visitor_greeting || "Hi there! 😊 I'm here to help you find the right support. What brings you here today?";
    }
    const name = firstName ? `, ${firstName}` : "";
    if (upcomingSessions.length > 0) {
      const next = upcomingSessions[0];
      const dateStr = formatSessionDate(next.session_date);
      const taskNote = pendingTasks.length > 0
        ? ` You also have ${pendingTasks.length} task${pendingTasks.length > 1 ? "s" : ""} on your list.`
        : "";
      return `Hi${name}! 😊 You have a session coming up ${dateStr}.${taskNote} How can I support you today?`;
    }
    if (pendingTasks.length > 0) {
      const taskWord = pendingTasks.length === 1 ? "a task" : `${pendingTasks.length} tasks`;
      return `Hi${name}! 😊 You've got ${taskWord} waiting — "${pendingTasks[0].title}"${pendingTasks.length > 1 ? " and more" : ""}. Would you like to go through them, or is there something else on your mind?`;
    }
    return config?.user_greeting || `Hi${name}! 😊 Great to see you. How are things going? I'm here if you need anything.`;
  };

  // Only build the greeting once sessions/tasks have had a chance to load
  const [greetingReady, setGreetingReady] = useState(!user);
  useEffect(() => {
    if (!user) return;
    // Give a short window for session/task fetches to resolve before greeting
    const t = setTimeout(() => setGreetingReady(true), 1200);
    return () => clearTimeout(t);
  }, [user]);

  const greeting = buildGreeting();

  // Auto-popup after delay — on mobile only show the bubble, never auto-open
  useEffect(() => {
    if (!isEnabled || !greetingReady) return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => {
      setShowBubble(true);
      // On mobile, never auto-open the full panel — it blocks navigation
      if (isMobile) return;
      const openTimer = setTimeout(() => {
        setOpen(true);
        setShowBubble(false);
      }, 3000);
      return () => clearTimeout(openTimer);
    }, delay);
    return () => clearTimeout(timer);
  }, [isEnabled, delay, greetingReady, isMobile]);

  // Send greeting when first opened
  useEffect(() => {
    if (open && !hasGreeted && messages.length === 0 && greetingReady) {
      setHasGreeted(true);
      setMessages([{ role: "assistant", content: greeting }]);
      createConversation(greeting);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasGreeted, messages.length, greeting, greetingReady]);

  const createConversation = async (greetingText: string) => {
    try {
      const payload: any = {
        messages: [{ role: "assistant", content: greetingText }],
        source_page: location.pathname,
        status: "active",
      };
      if (user) payload.user_id = user.id;
      const { data } = await supabase
        .from("assistant_conversations")
        .insert(payload)
        .select("id")
        .single();
      if (data) setConversationId(data.id);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setInput("");
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      const displayContent = assistantSoFar.replace(/<collected_data>[\s\S]*?<\/collected_data>/g, "").trim();
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: displayContent } : m));
        }
        return [...prev, { role: "assistant", content: displayContent }];
      });
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      }

      const resp = await fetch(ASSISTANT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMessages,
          conversation_id: conversationId,
          source_page: location.pathname,
          context_type: user ? "user" : "visitor",
          // Provide name + schedule context so the AI can be personal and relevant
          user_context: user ? {
            name: firstName,
            upcoming_sessions: upcomingSessions.map(s => ({
              date: s.session_date,
              type: s.session_type || "session",
            })),
            pending_tasks: pendingTasks.map(t => t.title),
          } : undefined,
          // Pages the AI can reference as markdown links in its responses
          available_pages: getAvailablePages(),
        }),
      });

      if (!resp.ok || !resp.body) {
        upsertAssistant(resp.status === 429
          ? "I'm a little overwhelmed right now — try me again in a moment! 😊"
          : "Something went wrong on my end. Please try again.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.startsWith(":") || !line.trim()) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsertAssistant(c);
          } catch { }
        }
      }

      // Extract and save collected data
      const collectedMatch = assistantSoFar.match(/<collected_data>([\s\S]*?)<\/collected_data>/);
      if (collectedMatch) {
        try {
          const data = JSON.parse(collectedMatch[1]);
          if (conversationId) {
            for (const [key, value] of Object.entries(data)) {
              if (value && typeof value === "string" && value !== "...") {
                await supabase.from("assistant_collected_data").insert({
                  conversation_id: conversationId,
                  user_id: user?.id || null,
                  field_name: key,
                  field_value: value,
                  source: "conversation",
                });
              }
            }
          }
        } catch { /* parse error */ }
      }

      if (conversationId) {
        const finalMessages = [...newMessages];
        if (assistantSoFar) {
          finalMessages.push({
            role: "assistant",
            content: assistantSoFar.replace(/<collected_data>[\s\S]*?<\/collected_data>/g, "").trim(),
          });
        }
        await supabase
          .from("assistant_conversations")
          .update({ messages: finalMessages, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    } catch {
      upsertAssistant("Connection dropped — please try again.");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowBubble(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Bubble preview */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-6 z-50 max-w-[280px]"
          >
            <div
              className="bg-card border border-border rounded-2xl p-4 shadow-apple-lg cursor-pointer"
              onClick={() => { setOpen(true); setShowBubble(false); }}
            >
              <p className="text-sm text-foreground">{greeting}</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button — character face */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); setShowBubble(false); }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white shadow-apple-lg hover:shadow-apple-xl transition-shadow flex items-center justify-center border border-border/30"
          >
            <BlueprintCharacter size={52} />
            {showBubble && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            )}
            <Sparkles size={11} className="absolute top-1 right-1 text-amber-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-apple-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-apple border border-border/20 overflow-hidden">
                  <BlueprintCharacter size={44} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Blueprint Assistant</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Here to support you
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8 text-muted-foreground">
                <X size={16} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-apple border border-border/20 overflow-hidden">
                      <BlueprintCharacter size={32} />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              const isInternal = href?.startsWith("/");
                              if (isInternal) {
                                return (
                                  <button
                                    onClick={() => navigate(href)}
                                    className="text-primary underline underline-offset-2 font-medium hover:text-primary/75 transition-colors"
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline underline-offset-2 font-medium hover:text-primary/75 transition-colors"
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-apple border border-border/20 overflow-hidden">
                    <BlueprintCharacter size={32} />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 items-end bg-card/80">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="rounded-xl text-sm min-h-[36px] max-h-[100px] resize-none py-2 bg-background"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="rounded-full shrink-0 h-9 w-9 shadow-apple"
                onClick={send}
                disabled={isLoading || !input.trim()}
              >
                <Send size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProactiveAssistant;
