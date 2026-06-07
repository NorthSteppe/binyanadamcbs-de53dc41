import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { getHebrewDay, getAllHolidays } from "@/utils/hebrewCalendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft, ChevronRight, Plus, Shield, CalendarDays,
  LayoutGrid, List, Clock, Trash2, Maximize2, Minimize2,
  Sparkles, Loader2, CheckCircle2, Flag, X, CalendarPlus, Copy, RefreshCw
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  addDays, subDays, startOfDay, endOfDay,
  parseISO, differenceInMinutes
} from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "session" | "task" | "focus";
  color: string;
  priority?: string;
  status?: string;
  description?: string;
  notes?: string;
  plaudRecordingId?: string;
};

type AISuggestion = {
  title: string;
  description: string;
  priority: string;
  estimated_minutes: number;
  suggested_time: string;
  reason: string;
};

type ViewMode = "month" | "week" | "day";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SUGGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-suggest-tasks`;

interface PersonalCalendarProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const PersonalCalendar = ({ isFullscreen = false, onToggleFullscreen }: PersonalCalendarProps) => {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showFocus, setShowFocus] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [createType, setCreateType] = useState<"focus" | "task">("focus");
  const [newEvent, setNewEvent] = useState({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  // Date range based on view
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === "month") {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return { rangeStart: startOfWeek(ms, { weekStartsOn: 0 }), rangeEnd: endOfWeek(me, { weekStartsOn: 0 }) };
    }
    if (viewMode === "week") {
      return { rangeStart: startOfWeek(currentDate, { weekStartsOn: 0 }), rangeEnd: endOfWeek(currentDate, { weekStartsOn: 0 }) };
    }
    return { rangeStart: startOfDay(currentDate), rangeEnd: endOfDay(currentDate) };
  }, [currentDate, viewMode]);

  const days = useMemo(() => eachDayOfInterval({ start: rangeStart, end: rangeEnd }), [rangeStart, rangeEnd]);

  // Queries
  const { data: focusBlocks = [] } = useQuery({
    queryKey: ["focus_blocks", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("focus_blocks").select("*")
        .gte("start_time", rangeStart.toISOString())
        .lte("start_time", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: scheduledTasks = [] } = useQuery({
    queryKey: ["scheduled_tasks", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, scheduled_start, scheduled_end, priority, status, due_date, estimated_minutes, is_completed")
        .gte("due_date", rangeStart.toISOString())
        .lte("due_date", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && showTasks,
  });

  const { data: scheduledTasksWithTime = [] } = useQuery({
    queryKey: ["scheduled_tasks_time", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, scheduled_start, scheduled_end, priority, status, is_completed")
        .not("scheduled_start", "is", null)
        .gte("scheduled_start", rangeStart.toISOString())
        .lte("scheduled_start", rangeEnd.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && showTasks,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["my_sessions", rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const userId = session!.user.id;
      // Fetch sessions where user is the client OR an attendee
      const { data: clientSessions, error: e1 } = await supabase
        .from("sessions")
        .select("id, title, session_date, status, duration_minutes, description, meeting_url, meeting_platform, attendee_ids, notes, plaud_recording_id")
        .gte("session_date", rangeStart.toISOString())
        .lte("session_date", rangeEnd.toISOString());
      if (e1) throw e1;
      
      // Also fetch sessions where user is in attendee_ids (team sessions)
      const { data: attendeeSessions, error: e2 } = await supabase
        .from("sessions")
        .select("id, title, session_date, status, duration_minutes, description, meeting_url, meeting_platform, attendee_ids, notes, plaud_recording_id")
        .contains("attendee_ids", [userId])
        .gte("session_date", rangeStart.toISOString())
        .lte("session_date", rangeEnd.toISOString());
      if (e2) throw e2;
      
      // Merge and deduplicate
      const allSessions = [...(clientSessions || [])];
      const existingIds = new Set(allSessions.map((s: any) => s.id));
      (attendeeSessions || []).forEach((s: any) => {
        if (!existingIds.has(s.id)) allSessions.push(s);
      });
      return allSessions;
    },
    enabled: !!session && showSessions,
  });

  const { data: shares = [] } = useQuery({
    queryKey: ["calendar_shares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_shares").select("*").eq("owner_id", session!.user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: feedToken, refetch: refetchToken } = useQuery({
    queryKey: ["calendar_feed_token"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_secrets" as any)
        .select("calendar_feed_token")
        .eq("user_id", session!.user.id)
        .single();
      if (error) throw error;
      return (data as any)?.calendar_feed_token as string | null;
    },
    enabled: !!session,
  });

  const regenerateToken = useMutation({
    mutationFn: async () => {
      const newToken = crypto.randomUUID();
      const { error: updateError } = await supabase
        .from("profile_secrets" as any)
        .update({ calendar_feed_token: newToken })
        .eq("user_id", session!.user.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => { refetchToken(); toast.success("Calendar link regenerated"); },
    onError: () => toast.error("Failed to regenerate link"),
  });

  const feedUrl = feedToken
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-ical-feed?token=${feedToken}`
    : null;

  const webcalUrl = feedUrl
    ? feedUrl.replace(/^https?:\/\//, "webcal://")
    : null;

  const copyFeedUrl = () => {
    if (!feedUrl) return;
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
    toast.success("Link copied!");
  };

  // All tasks for AI context
  const { data: allTasks = [] } = useQuery({
    queryKey: ["all_user_tasks_for_ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id, title, description, priority, status, due_date, estimated_minutes, is_completed, labels")
        .eq("is_completed", false)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ["user_projects_for_ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_projects").select("id, name, color").eq("is_archived", false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  // Build unified events
  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    if (showSessions) {
      sessions.forEach((s: any) => {
        const start = parseISO(s.session_date);
        const meetingInfo = s.meeting_platform ? `${s.meeting_platform.replace("-", " ")}` : "";
        const desc = [s.description, meetingInfo].filter(Boolean).join(" · ");
        result.push({
          id: s.id, title: s.title, start,
          end: new Date(start.getTime() + (s.duration_minutes || 60) * 60000),
          type: "session", color: "hsl(var(--primary))", status: s.status,
          description: desc || undefined,
          notes: s.notes,
          plaudRecordingId: s.plaud_recording_id,
        });
      });
    }
    if (showTasks) {
      scheduledTasksWithTime.forEach((t: any) => {
        const start = parseISO(t.scheduled_start);
        const end = t.scheduled_end ? parseISO(t.scheduled_end) : new Date(start.getTime() + 30 * 60000);
        result.push({
          id: t.id, title: t.title, start, end,
          type: "task", color: "#3b82f6", priority: t.priority, status: t.status, description: t.description,
        });
      });
      scheduledTasks.forEach((t: any) => {
        if (t.scheduled_start) return;
        if (!t.due_date) return;
        const d = parseISO(t.due_date);
        result.push({
          id: t.id, title: t.title, start: d, end: d,
          type: "task", color: "#3b82f6", priority: t.priority, status: t.status, description: t.description,
        });
      });
    }
    if (showFocus) {
      focusBlocks.forEach((fb: any) => {
        result.push({
          id: fb.id, title: fb.title, start: parseISO(fb.start_time), end: parseISO(fb.end_time),
          type: "focus", color: "#a855f7",
        });
      });
    }
    return result;
  }, [sessions, scheduledTasks, scheduledTasksWithTime, focusBlocks, showSessions, showTasks, showFocus]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.start, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Mutations
  const createFocusBlock = useMutation({
    mutationFn: async () => {
      if (!selectedDate) return;
      const [sh, sm] = newEvent.start.split(":").map(Number);
      const [eh, em] = newEvent.end.split(":").map(Number);
      const s = new Date(selectedDate); s.setHours(sh, sm, 0, 0);
      const e = new Date(selectedDate); e.setHours(eh, em, 0, 0);
      const { error } = await supabase.from("focus_blocks").insert({
        user_id: session!.user.id, title: newEvent.title || "Focus Time",
        start_time: s.toISOString(), end_time: e.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focus_blocks"] }); closeCreateDialog(); toast.success("Focus block added"); },
    onError: () => toast.error("Failed to add focus block"),
  });

  const createTask = useMutation({
    mutationFn: async (overrides?: { title: string; description: string; priority: string; start: string; end: string }) => {
      const date = selectedDate || new Date();
      const t = overrides || newEvent;
      const [sh, sm] = t.start.split(":").map(Number);
      const [eh, em] = t.end.split(":").map(Number);
      const s = new Date(date); s.setHours(sh, sm, 0, 0);
      const e = new Date(date); e.setHours(eh, em, 0, 0);
      const { error } = await supabase.from("user_tasks").insert({
        user_id: session!.user.id, title: t.title || "New Task",
        description: t.description, priority: t.priority,
        scheduled_start: s.toISOString(), scheduled_end: e.toISOString(),
        due_date: date.toISOString(),
        estimated_minutes: differenceInMinutes(e, s),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled_tasks"] });
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      qc.invalidateQueries({ queryKey: ["all_user_tasks_for_ai"] });
      closeCreateDialog();
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });

  const deleteFocusBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("focus_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focus_blocks"] }); setDetailDialogOpen(false); toast.success("Deleted"); },
  });

  const rescheduleEvent = useMutation({
    mutationFn: async ({ event, newStart }: { event: CalendarEvent; newStart: Date }) => {
      const duration = differenceInMinutes(event.end, event.start);
      const newEnd = new Date(newStart.getTime() + duration * 60000);
      if (event.type === "focus") {
        const { error } = await supabase.from("focus_blocks").update({
          start_time: newStart.toISOString(), end_time: newEnd.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      } else if (event.type === "task") {
        const { error } = await supabase.from("user_tasks").update({
          scheduled_start: newStart.toISOString(), scheduled_end: newEnd.toISOString(),
          due_date: newStart.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      } else if (event.type === "session") {
        const { error } = await supabase.from("sessions").update({
          session_date: newStart.toISOString(),
        }).eq("id", event.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus_blocks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks"] });
      qc.invalidateQueries({ queryKey: ["scheduled_tasks_time"] });
      qc.invalidateQueries({ queryKey: ["my_sessions"] });
      qc.invalidateQueries({ queryKey: ["user_tasks"] });
      toast.success("Event rescheduled");
    },
    onError: () => toast.error("Failed to reschedule"),
  });

  // AI Suggestions
  const fetchSuggestions = useCallback(async () => {
    if (!session) return;
    setIsLoadingSuggestions(true);
    setShowSuggestionsPanel(true);
    try {
      // Fetch upcoming sessions for context (next 7 days)
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const { data: upcomingSessions } = await supabase
        .from("sessions")
        .select("title, session_date, duration_minutes, status, description")
        .gte("session_date", now.toISOString())
        .lte("session_date", weekLater.toISOString())
        .order("session_date", { ascending: true })
        .limit(20);

      // Fetch client todos assigned to this user
      const { data: clientTodos } = await supabase
        .from("client_todos")
        .select("title, description, due_date, is_completed")
        .eq("is_completed", false)
        .limit(20);

      const resp = await fetch(SUGGEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tasks: allTasks.map((t: any) => ({
            title: t.title, priority: t.priority, status: t.status,
            due_date: t.due_date, estimated_minutes: t.estimated_minutes, labels: t.labels,
          })),
          projects: allProjects.map((p: any) => ({ name: p.name })),
          sessions: (upcomingSessions || []).map((s: any) => ({
            title: s.title, date: s.session_date, duration: s.duration_minutes, status: s.status,
          })),
          client_todos: (clientTodos || []).map((t: any) => ({
            title: t.title, description: t.description, due_date: t.due_date,
          })),
          date: format(new Date(), "yyyy-MM-dd"),
        }),
      });
      if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); return; }
      if (resp.status === 402) { toast.error("AI credits required. Top up in workspace settings."); return; }
      if (!resp.ok) throw new Error("Failed");
      const data = await resp.json();
      setAiSuggestions(data.suggestions || []);
    } catch {
      toast.error("Failed to get AI suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [session, allTasks, allProjects]);

  const addSuggestionAsTask = (s: AISuggestion) => {
    const [h, m] = s.suggested_time.split(":").map(Number);
    const endH = h + Math.floor((m + s.estimated_minutes) / 60);
    const endM = (m + s.estimated_minutes) % 60;
    setSelectedDate(new Date());
    createTask.mutate({
      title: s.title,
      description: s.description,
      priority: s.priority,
      start: s.suggested_time,
      end: `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`,
    });
    setAiSuggestions((prev) => prev.filter((x) => x.title !== s.title));
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id);
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = "1";
    setDraggedEvent(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(cellKey);
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (!draggedEvent) return;
    const newStart = new Date(day); newStart.setHours(hour, 0, 0, 0);
    if (draggedEvent.start.getTime() === newStart.getTime()) return;
    rescheduleEvent.mutate({ event: draggedEvent, newStart });
    setDraggedEvent(null);
  };

  const handleMonthDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (!draggedEvent) return;
    const newStart = new Date(day);
    newStart.setHours(draggedEvent.start.getHours(), draggedEvent.start.getMinutes(), 0, 0);
    if (draggedEvent.start.getTime() === newStart.getTime()) return;
    rescheduleEvent.mutate({ event: draggedEvent, newStart });
    setDraggedEvent(null);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewEvent({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  };

  const navigate = (dir: 1 | -1) => {
    if (viewMode === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(dir === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1));
  };

  const headerLabel = () => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") return `${format(rangeStart, "MMM d")} – ${format(rangeEnd, "MMM d, yyyy")}`;
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setCreateDialogOpen(true);
    setCreateType("focus");
    setNewEvent({ title: "", start: "09:00", end: "10:00", description: "", priority: "medium" });
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  useEffect(() => {
    if ((viewMode === "week" || viewMode === "day") && scrollRef.current) {
      const now = new Date();
      const offset = Math.max(0, (now.getHours() - 1) * 64);
      scrollRef.current.scrollTop = offset;
    }
  }, [viewMode]);

  const today = new Date();

  const priorityColor = (p?: string) => {
    if (p === "urgent") return "bg-destructive";
    if (p === "high") return "bg-orange-500";
    if (p === "medium") return "bg-amber-400";
    return "bg-muted-foreground/50";
  };

  const priorityBadgeColor = (p: string) => {
    if (p === "urgent") return "destructive";
    if (p === "high") return "default";
    return "secondary";
  };

  const calendarHeight = isFullscreen ? "h-[calc(100vh-180px)]" : "max-h-[500px]";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Personal Calendar</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs gap-1 px-2"><LayoutGrid size={12} /> Month</TabsTrigger>
              <TabsTrigger value="week" className="text-xs gap-1 px-2"><CalendarDays size={12} /> Week</TabsTrigger>
              <TabsTrigger value="day" className="text-xs gap-1 px-2"><List size={12} /> Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs h-8">Today</Button>
          <Button
            variant={showSuggestionsPanel ? "default" : "outline"} size="sm"
            onClick={fetchSuggestions} disabled={isLoadingSuggestions}
            className="text-xs h-8 gap-1"
          >
            {isLoadingSuggestions ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Suggest
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConnectDialogOpen(true)} className="h-8 gap-1 text-xs">
            <CalendarPlus size={13} /> Connect
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="h-8"><Shield size={14} /></Button>
          {onToggleFullscreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullscreen} className="h-8">
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showSessions} onCheckedChange={setShowSessions} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Sessions</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showTasks} onCheckedChange={setShowTasks} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Tasks</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={showFocus} onCheckedChange={setShowFocus} className="scale-75" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Focus Blocks</span>
        </label>
      </div>

      <div className={`flex gap-4 ${isFullscreen ? "flex-col lg:flex-row" : "flex-col"}`}>
        {/* Main Calendar */}
        <div className={`flex-1 min-w-0 ${showSuggestionsPanel && isFullscreen ? "lg:w-3/4" : "w-full"}`}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft size={18} /></Button>
            <h3 className="text-sm font-semibold">{headerLabel()}</h3>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight size={18} /></Button>
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(key) || [];
                const isToday = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isOver = dropTarget === `month-${key}`;
                const maxEvents = isFullscreen ? 5 : 3;
                return (
                  <motion.div
                    key={key} whileHover={{ scale: 1.01 }}
                    onClick={() => handleDayClick(day)}
                    onDragOver={(e) => handleDragOver(e, `month-${key}`)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleMonthDrop(e, day)}
                    className={`relative rounded-lg p-1 text-left border transition-colors cursor-pointer
                      ${isFullscreen ? "min-h-[100px]" : "min-h-[80px]"}
                      ${isToday ? "border-primary bg-primary/5" : "border-transparent hover:border-border"}
                      ${!isCurrentMonth ? "opacity-40" : ""}
                      ${isOver ? "bg-primary/10 border-primary" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                        {format(day, "d")}
                      </span>
                      <span className="text-[8px] text-muted-foreground/60 font-light" dir="rtl">{getHebrewDay(day)}</span>
                    </div>
                    {(() => {
                      const dayHolidays = getAllHolidays(day);
                      return dayHolidays.length > 0 ? (
                        <div className="mb-0.5">
                          {dayHolidays.slice(0, 1).map((h, i) => (
                            <div key={i} className={`text-[7px] px-0.5 py-0 rounded truncate ${h.type === "bank" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                              {h.emoji} {h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name}
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, maxEvents).map((ev) => (
                        <div
                          key={ev.id} draggable
                          onDragStart={(e) => handleDragStart(e, ev)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => handleEventClick(e, ev)}
                          className="text-[9px] px-1 py-0.5 rounded truncate cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity flex items-center justify-between"
                          style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                        >
                          <div className="flex items-center min-w-0">
                            {ev.type === "task" && ev.priority && (
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 shrink-0 ${priorityColor(ev.priority)}`} />
                            )}
                            <span className="truncate">{ev.title}</span>
                          </div>
                          {ev.plaudRecordingId && <Sparkles size={8} className="shrink-0 ml-0.5 text-primary opacity-80" />}
                        </div>
                      ))}
                      {dayEvents.length > maxEvents && (
                        <span className="text-[8px] text-muted-foreground">+{dayEvents.length - maxEvents} more</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border bg-muted/30">
                <div className="p-1" />
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`text-center py-2 text-xs font-medium cursor-pointer hover:bg-muted/50 transition-colors
                      ${isSameDay(day, today) ? "text-primary bg-primary/5" : "text-foreground"}`}
                    onClick={() => { setCurrentDate(day); setViewMode("day"); }}
                  >
                    <div>{format(day, "EEE")}</div>
                    <div className={`text-lg font-bold ${isSameDay(day, today) ? "text-primary" : ""}`}>{format(day, "d")}</div>
                  </div>
                ))}
              </div>
              <div ref={scrollRef} className={`overflow-y-auto ${calendarHeight}`}>
                <div className="grid grid-cols-[50px_repeat(7,1fr)] relative">
                  {HOURS.map((hour) => (
                    <div key={hour} className="contents">
                      <div className="text-[10px] text-muted-foreground text-right pr-2 py-1 h-16 border-b border-border/30">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      {days.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const hourEvents = (eventsByDay.get(key) || []).filter((ev) => ev.start.getHours() === hour);
                        const cellKey = `week-${key}-${hour}`;
                        const isOver = dropTarget === cellKey;
                        return (
                          <div
                            key={`${key}-${hour}`}
                            className={`h-16 border-b border-l border-border/30 relative cursor-pointer transition-colors
                              ${isOver ? "bg-primary/10" : "hover:bg-muted/20"}`}
                            onClick={() => {
                              const d = new Date(day); d.setHours(hour, 0, 0, 0);
                              setSelectedDate(d);
                              setNewEvent({ ...newEvent, start: `${hour.toString().padStart(2, "0")}:00`, end: `${(hour + 1).toString().padStart(2, "0")}:00` });
                              setCreateDialogOpen(true);
                            }}
                            onDragOver={(e) => handleDragOver(e, cellKey)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, hour)}
                          >
                            {hourEvents.map((ev) => {
                              const duration = differenceInMinutes(ev.end, ev.start);
                              const heightPx = Math.max(16, (duration / 60) * 64);
                              const topPx = (ev.start.getMinutes() / 60) * 64;
                              return (
                                <div
                                  key={ev.id} draggable
                                  onDragStart={(e) => handleDragStart(e, ev)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleEventClick(e, ev)}
                                  className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[9px] font-medium cursor-grab active:cursor-grabbing hover:opacity-80 z-10 flex flex-col overflow-hidden"
                                  style={{
                                    top: `${topPx}px`, height: `${heightPx}px`,
                                    backgroundColor: `${ev.color}25`, color: ev.color,
                                    borderLeft: `2px solid ${ev.color}`,
                                  }}
                                >
                                  <div className="flex justify-between items-start gap-1 w-full">
                                    <span className="truncate">{ev.title}</span>
                                    {ev.plaudRecordingId && <Sparkles size={8} className="shrink-0 mt-0.5 text-primary opacity-80" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div ref={scrollRef} className={`overflow-y-auto ${calendarHeight}`}>
                {HOURS.map((hour) => {
                  const key = format(currentDate, "yyyy-MM-dd");
                  const hourEvents = (eventsByDay.get(key) || []).filter((ev) => ev.start.getHours() === hour);
                  const cellKey = `day-${key}-${hour}`;
                  const isOver = dropTarget === cellKey;
                  return (
                    <div
                      key={hour}
                      className={`flex border-b border-border/30 min-h-[64px] cursor-pointer transition-colors
                        ${isOver ? "bg-primary/10" : "hover:bg-muted/20"}`}
                      onClick={() => {
                        const d = new Date(currentDate); d.setHours(hour, 0, 0, 0);
                        setSelectedDate(d);
                        setNewEvent({ ...newEvent, start: `${hour.toString().padStart(2, "0")}:00`, end: `${(hour + 1).toString().padStart(2, "0")}:00` });
                        setCreateDialogOpen(true);
                      }}
                      onDragOver={(e) => handleDragOver(e, cellKey)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, currentDate, hour)}
                    >
                      <div className="w-16 text-[11px] text-muted-foreground text-right pr-3 pt-1 flex-shrink-0">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div className="flex-1 relative py-0.5 space-y-0.5">
                        {hourEvents.map((ev) => {
                          const duration = differenceInMinutes(ev.end, ev.start);
                          return (
                            <div
                              key={ev.id} draggable
                              onDragStart={(e) => handleDragStart(e, ev)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => handleEventClick(e, ev)}
                              className="rounded px-2 py-1 text-xs font-medium cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: `${ev.color}20`, color: ev.color,
                                borderLeft: `3px solid ${ev.color}`,
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="truncate">{ev.title}</span>
                                  <span className="text-[10px] opacity-70 shrink-0">{duration}min</span>
                                </div>
                                {ev.plaudRecordingId && <Sparkles size={10} className="shrink-0 text-primary opacity-80" />}
                              </div>
                              {ev.description && <p className="text-[10px] opacity-60 mt-0.5 truncate">{ev.description}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        <AnimatePresence>
          {showSuggestionsPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`${isFullscreen ? "lg:w-80" : "w-full"} flex-shrink-0`}
            >
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <Sparkles size={14} className="text-primary" /> AI Suggestions
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchSuggestions} disabled={isLoadingSuggestions}>
                      {isLoadingSuggestions ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSuggestionsPanel(false)}>
                      <X size={12} />
                    </Button>
                  </div>
                </div>

                {isLoadingSuggestions && aiSuggestions.length === 0 && (
                  <div className="py-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary mb-2" size={20} />
                    <p className="text-xs text-muted-foreground">Analysing your tasks and projects…</p>
                  </div>
                )}

                {!isLoadingSuggestions && aiSuggestions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No suggestions yet. Click the refresh button to generate AI task recommendations.
                  </p>
                )}

                <ScrollArea className={isFullscreen ? "max-h-[calc(100vh-320px)]" : "max-h-[300px]"}>
                  <div className="space-y-2 pr-2">
                    {aiSuggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border border-border rounded-lg p-3 space-y-2 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-foreground leading-tight">{s.title}</h4>
                          <Badge variant={priorityBadgeColor(s.priority) as any} className="text-[9px] shrink-0 capitalize">
                            {s.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{s.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Clock size={10} />{s.suggested_time}</span>
                          <span>·</span>
                          <span>{s.estimated_minutes}min</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground/70 italic">{s.reason}</p>
                        <Button
                          size="sm" variant="outline"
                          className="w-full text-xs h-7 gap-1"
                          onClick={() => addSuggestionAsTask(s)}
                        >
                          <Plus size={12} /> Add to Calendar
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={16} /> New Event — {selectedDate && format(selectedDate, "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Type</Label>
              <div className="flex gap-2 mt-1">
                <Button variant={createType === "focus" ? "default" : "outline"} size="sm" onClick={() => setCreateType("focus")} className="text-xs">Focus Block</Button>
                <Button variant={createType === "task" ? "default" : "outline"} size="sm" onClick={() => setCreateType("task")} className="text-xs">Task</Button>
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder={createType === "focus" ? "Focus Time" : "Task title"} />
            </div>
            {createType === "task" && (
              <>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Optional description" rows={2} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newEvent.priority} onValueChange={(v) => setNewEvent({ ...newEvent, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start</Label><Input type="time" value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} /></div>
              <div><Label>End</Label><Input type="time" value={newEvent.end} onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })} /></div>
            </div>
            <Button className="w-full" disabled={!newEvent.start || !newEvent.end} onClick={() => createType === "focus" ? createFocusBlock.mutate() : createTask.mutate(undefined)}>
              {createType === "focus" ? "Add Focus Block" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: selectedEvent?.color }}>
              {selectedEvent?.type === "session" && "📅"}
              {selectedEvent?.type === "task" && "✅"}
              {selectedEvent?.type === "focus" && "🎯"}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                {format(selectedEvent.start, "HH:mm")} – {format(selectedEvent.end, "HH:mm")}
                <span className="text-xs">({differenceInMinutes(selectedEvent.end, selectedEvent.start)} min)</span>
              </div>
              <Badge variant="outline" className="capitalize">{selectedEvent.type}</Badge>
              {selectedEvent.priority && <Badge variant="outline" className="capitalize ml-1">{selectedEvent.priority} priority</Badge>}
              {selectedEvent.status && <Badge variant="secondary" className="capitalize ml-1">{selectedEvent.status}</Badge>}
              {selectedEvent.description && <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>}
              {selectedEvent.notes && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-md p-3">
                  <div className="flex items-center gap-1.5 mb-2 font-medium text-xs text-primary">
                    <Sparkles size={14} /> Session Notes / Summary
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedEvent.notes}</p>
                </div>
              )}
              {selectedEvent.type === "focus" && (
                <Button variant="destructive" size="sm" onClick={() => deleteFocusBlock.mutate(selectedEvent.id)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Connect Calendar Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarPlus size={18} /> Connect to Your Calendar App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subscribe to your Blueprint CBS sessions directly in Google Calendar, Apple Calendar, or Outlook. Your calendar app will automatically stay in sync.
            </p>
            {feedUrl ? (
              <>
                <div>
                  <Label className="text-xs mb-1.5 block">Your Personal Subscription URL</Label>
                  <div className="flex gap-2">
                    <Input value={feedUrl} readOnly className="text-xs font-mono" />
                    <Button size="sm" variant="outline" onClick={copyFeedUrl} className="shrink-0 gap-1">
                      {copiedFeed ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copiedFeed ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Add to your calendar app:</p>
                  <a
                    href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl!)}`}
                    target="_blank" rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                      <span>📅</span> Add to Google Calendar
                    </Button>
                  </a>
                  <a href={webcalUrl!}>
                    <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                      <span>🍎</span> Add to Apple Calendar
                    </Button>
                  </a>
                  <a href={webcalUrl!}>
                    <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                      <span>📧</span> Add to Outlook (Desktop)
                    </Button>
                  </a>
                  <a href={feedUrl!} download="blueprint-adam-calendar.ics">
                    <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                      <span>⬇️</span> Download .ics File
                    </Button>
                  </a>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[11px] text-muted-foreground mb-2">If you think your link has been compromised, regenerate it. Old links will stop working.</p>
                  <Button
                    variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground"
                    onClick={() => regenerateToken.mutate()}
                    disabled={regenerateToken.isPending}
                  >
                    {regenerateToken.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Regenerate Link
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-2">Setting up your calendar link…</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Calendar Sharing</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Control who can see your calendar. Only shared items will be visible to others.</p>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No one has access to your calendar yet.</p>
          ) : (
            <div className="space-y-2">
              {shares.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                  <span className="text-foreground">{s.shared_with_id.slice(0, 8)}…</span>
                  <div className="flex gap-1">
                    {s.can_view_sessions && <Badge variant="outline" className="text-[9px]">Sessions</Badge>}
                    {s.can_view_tasks && <Badge variant="outline" className="text-[9px]">Tasks</Badge>}
                    {s.can_view_focus && <Badge variant="outline" className="text-[9px]">Focus</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalCalendar;
