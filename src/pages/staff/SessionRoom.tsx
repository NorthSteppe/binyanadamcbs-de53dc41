import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  Play, Pause, Square, CheckCircle2, Brain, Target, ClipboardList,
  Activity, FileText, Timer, Loader2, ArrowLeft, ExternalLink,
} from "lucide-react";

type Session = {
  id: string;
  title: string;
  client_id: string;
  manual_client_id: string | null;
  session_date: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  live_notes: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  completed_at: string | null;
  meeting_url: string | null;
};

type Template = { id: string; title: string; template_content: string };

const TOOLS = [
  { label: "ACT Matrix", path: "/staff/toolkit/act-matrix", icon: Brain, group: "ACT" },
  { label: "Hexaflex", path: "/staff/clinical/hexaflex", icon: Brain, group: "ACT" },
  { label: "Values Bull's Eye", path: "/staff/clinical/values-bullseye", icon: Target, group: "ACT" },
  { label: "ABC Data Sheet", path: "/staff/clinical/abc", icon: ClipboardList, group: "Behaviour" },
  { label: "Behaviour Log", path: "/staff/clinical/behaviour-log", icon: Activity, group: "Behaviour" },
  { label: "Functional Assessment", path: "/staff/clinical/functional-assessment", icon: FileText, group: "Behaviour" },
  { label: "Pomodoro", path: "/staff/toolkit/pomodoro", icon: Timer, group: "Focus" },
  { label: "Mindfulness", path: "/staff/toolkit/mindfulness", icon: Brain, group: "Focus" },
];

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, "0");
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const SessionRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const pausedOffsetRef = useRef<number>(0);

  // Load session + templates
  useEffect(() => {
    if (!id || !user) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id,title,client_id,manual_client_id,session_date,duration_minutes,status,notes,live_notes,actual_start_at,actual_end_at,completed_at,meeting_url,price_cents")
        .eq("id", id)
        .maybeSingle();
      if (!mounted) return;
      if (error || !data) {
        toast({ title: "Session not found", variant: "destructive" });
        navigate("/staff/calendar");
        return;
      }
      setSession(data as Session);
      setNotes((data as Session).live_notes || (data as Session).notes || "");

      // Auto-start timer on entry if not started
      if (!data.actual_start_at && data.status !== "completed") {
        const nowIso = new Date().toISOString();
        await supabase.from("sessions").update({ actual_start_at: nowIso, status: "in_progress" }).eq("id", id);
        setSession((s) => s ? { ...s, actual_start_at: nowIso, status: "in_progress" } : s);
      }

      // Client name
      if (data.manual_client_id) {
        const { data: m } = await supabase.from("manual_clients").select("full_name").eq("id", data.manual_client_id).maybeSingle();
        setClientName(m?.full_name || "Manual client");
      } else {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.client_id).maybeSingle();
        setClientName(p?.full_name || "Client");
      }

      const { data: tpls } = await supabase
        .from("note_templates")
        .select("id,title,template_content")
        .or(`is_shared.eq.true,created_by.eq.${user.id}`)
        .order("title");
      setTemplates(tpls || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id, user, navigate, toast]);

  // Timer tick
  useEffect(() => {
    if (paused || !session?.actual_start_at || session?.completed_at) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [paused, session?.actual_start_at, session?.completed_at]);

  // Autosave notes (debounced)
  useEffect(() => {
    if (!session || loading) return;
    const t = setTimeout(() => {
      supabase.from("sessions").update({ live_notes: notes }).eq("id", session.id);
    }, 1500);
    return () => clearTimeout(t);
  }, [notes, session, loading]);

  const elapsedMs = useMemo(() => {
    if (!session?.actual_start_at) return 0;
    const start = new Date(session.actual_start_at).getTime();
    const end = session.actual_end_at ? new Date(session.actual_end_at).getTime() : now;
    return end - start - pausedOffsetRef.current;
  }, [session, now]);

  const overrun = session ? elapsedMs > session.duration_minutes * 60_000 : false;

  const applyTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    if (tplId === "none") return;
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setNotes((prev) => (prev ? prev + "\n\n" : "") + tpl.template_content);
  };

  const togglePause = () => {
    if (paused) {
      if (pausedAtRef.current) pausedOffsetRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
      setPaused(false);
    } else {
      pausedAtRef.current = Date.now();
      setPaused(true);
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    setCompleting(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          actual_end_at: nowIso,
          completed_at: nowIso,
          live_notes: notes,
          notes: notes,
        })
        .eq("id", session.id);
      if (error) throw error;

      // Chargeable sessions are flagged for the admin "Drafts (Xero)" review queue
      // rather than pushing a draft directly; an admin reviews and pushes it.
      if (((session as any).price_cents ?? 0) > 0) {
        await supabase.from("sessions").update({ xero_invoice_pending: true }).eq("id", session.id);
        toast({ title: "Session completed", description: "A draft invoice has been queued for admin review." });
      } else {
        toast({ title: "Session completed" });
      }
      navigate("/staff/calendar");
    } catch (e: any) {
      toast({ title: "Could not complete session", description: e.message, variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[var(--header-height)] grid place-items-center h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const completed = !!session.completed_at;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-[var(--header-height)] pb-20">
        <div className="container max-w-6xl">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 me-1" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-serif text-foreground">{session.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {clientName} · {new Date(session.session_date).toLocaleString()} · {session.duration_minutes} min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={completed ? "secondary" : overrun ? "destructive" : "default"} className="text-base px-3 py-1.5 font-mono">
                {formatHMS(elapsedMs)}
              </Badge>
              {!completed && (
                <Button variant="outline" size="sm" onClick={togglePause}>
                  {paused ? <><Play className="h-4 w-4 me-1" /> Resume</> : <><Pause className="h-4 w-4 me-1" /> Pause</>}
                </Button>
              )}
              {!completed && (
                <Button onClick={handleComplete} disabled={completing} className="bg-primary">
                  {completing ? <Loader2 className="h-4 w-4 me-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 me-1" />}
                  Complete & invoice
                </Button>
              )}
              {completed && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 me-1" /> Completed
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Notes column */}
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-medium text-foreground">Session notes</h2>
                  <div className="flex items-center gap-2">
                    <Select value={selectedTemplate} onValueChange={applyTemplate}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Insert template…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Choose template…</SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <VoiceRecorder onTranscript={(text) => setNotes((p) => (p ? p + " " : "") + text)} />
                  </div>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type your live session notes here. They autosave."
                  rows={18}
                  disabled={completed}
                  className="font-mono text-sm leading-relaxed"
                />
                <p className="text-xs text-muted-foreground mt-2">Autosaves every couple of seconds.</p>
              </Card>

              {session.meeting_url && (
                <Card className="p-4 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Meeting link</p>
                    <p className="text-muted-foreground truncate max-w-md">{session.meeting_url}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={session.meeting_url} target="_blank" rel="noreferrer">
                      Open <ExternalLink className="h-3 w-3 ms-1" />
                    </a>
                  </Button>
                </Card>
              )}
            </div>

            {/* Tools column */}
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">In-session tools</h2>
                <div className="grid grid-cols-2 gap-2">
                  {TOOLS.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      target="_blank"
                      className="group border border-border/60 rounded-lg p-3 hover:border-primary/40 hover:bg-accent/30 transition-all"
                    >
                      <tool.icon className="h-4 w-4 text-primary mb-1.5" />
                      <p className="text-xs font-medium text-foreground leading-tight">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.group}</p>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-medium text-foreground mb-2 uppercase tracking-wider">Quick links</h2>
                <div className="space-y-2 text-sm">
                  <Link to={`/admin/clients/${session.client_id}`} className="text-primary hover:underline block">
                    Open client record →
                  </Link>
                  <Link to="/staff/note-templates" className="text-primary hover:underline block">
                    Manage templates →
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
