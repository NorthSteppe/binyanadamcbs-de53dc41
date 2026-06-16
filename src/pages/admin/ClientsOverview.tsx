import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Search, User, Calendar, FileText, ChevronRight, AlertTriangle,
  CheckCircle2, MessageSquare, ListTodo, BookOpen, Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { METAL_BG, FloatCard, WidgetHeader } from "@/components/portal/PortalShell";

type Stage = "new" | "active" | "paused" | "discharged";
type Risk = "low" | "medium" | "high";

interface ClientRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  is_manual?: boolean;
  manual_email?: string;
  manual_phone?: string;
  manual_notes?: string;
  // sessions
  session_count: number;
  upcoming_count: number;
  last_session: string | null;
  next_session: string | null;
  unpaid_count: number;
  // clinical
  note_count: number;
  document_count: number;
  clinical_entry_count: number;
  todo_pending: number;
  // engagement
  message_count: number;
  course_count: number;
  // overview (manual)
  stage: Stage;
  tags: string[];
  risk_level: Risk;
  risk_note: string;
  internal_summary: string;
  // assignments
  assignees: string[]; // user ids
}

const STAGE_COLORS: Record<Stage, string> = {
  new: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  paused: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  discharged: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

const RISK_COLORS: Record<Risk, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-red-600",
};

const ClientsOverview = () => {
  const { isAdmin, user } = useAuth();
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        // 1. Determine the universe of client ids visible to this user.
        let clientIds: string[] = [];

        if (isAdmin) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "client");
          clientIds = (roles ?? []).map((r) => r.user_id);
        } else if (user) {
          // Therapists see only assigned clients.
          const { data: assigns } = await supabase
            .from("client_assignments")
            .select("client_id")
            .eq("assignee_id", user.id);
          clientIds = Array.from(new Set((assigns ?? []).map((a) => a.client_id)));
        }

        if (clientIds.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }

        // 2. Parallel fetch everything.
        const [
          profilesRes, sessionsRes, notesRes, docsRes, todosRes,
          clinicalRes, msgsRes, coursesRes, overviewRes, assignsRes,
        ] = await Promise.all([
          supabase.from("profiles").select("id, full_name, avatar_url, created_at").in("id", clientIds),
          supabase.from("sessions").select("client_id, session_date, status, is_paid").in("client_id", clientIds),
          supabase.from("client_notes").select("client_id").in("client_id", clientIds),
          supabase.from("client_documents").select("client_id").in("client_id", clientIds),
          supabase.from("client_todos").select("client_id, is_completed").in("client_id", clientIds),
          supabase.from("clinical_entries").select("client_id").in("client_id", clientIds),
          supabase.from("messages").select("sender_id, recipient_id").or(
            `sender_id.in.(${clientIds.join(",")}),recipient_id.in.(${clientIds.join(",")})`,
          ),
          supabase.from("course_purchases").select("user_id").in("user_id", clientIds),
          supabase.from("client_overview").select("*").in("client_id", clientIds),
          supabase.from("client_assignments").select("client_id, assignee_id").in("client_id", clientIds),
        ]);

        const profiles = profilesRes.data ?? [];
        const sessions = sessionsRes.data ?? [];
        const notes = notesRes.data ?? [];
        const docs = docsRes.data ?? [];
        const todos = todosRes.data ?? [];
        const clinical = clinicalRes.data ?? [];
        const msgs = msgsRes.data ?? [];
        const courses = coursesRes.data ?? [];
        const overview = overviewRes.data ?? [];
        const assigns = assignsRes.data ?? [];

        const now = new Date().toISOString();

        const enriched: ClientRow[] = profiles.map((p) => {
          const cs = sessions.filter((s) => s.client_id === p.id);
          const upcoming = cs.filter((s) => s.session_date >= now && s.status === "scheduled");
          const past = cs.filter((s) => s.session_date < now);
          const next = upcoming.sort((a, b) => a.session_date.localeCompare(b.session_date))[0];
          const last = past.sort((a, b) => b.session_date.localeCompare(a.session_date))[0];
          const ov = overview.find((o) => o.client_id === p.id);
          const cMsgs = msgs.filter((m: any) => m.sender_id === p.id || m.recipient_id === p.id);
          return {
            id: p.id,
            full_name: p.full_name || "Unnamed",
            avatar_url: p.avatar_url,
            created_at: p.created_at,
            session_count: cs.length,
            upcoming_count: upcoming.length,
            last_session: last?.session_date ?? null,
            next_session: next?.session_date ?? null,
            unpaid_count: cs.filter((s) => !s.is_paid && s.status === "completed").length,
            note_count: notes.filter((n) => n.client_id === p.id).length,
            document_count: docs.filter((d) => d.client_id === p.id).length,
            clinical_entry_count: clinical.filter((c) => c.client_id === p.id).length,
            todo_pending: todos.filter((t) => t.client_id === p.id && !t.is_completed).length,
            message_count: cMsgs.length,
            course_count: courses.filter((c) => c.user_id === p.id).length,
            stage: (ov?.stage as Stage) ?? "new",
            tags: ov?.tags ?? [],
            risk_level: (ov?.risk_level as Risk) ?? "low",
            risk_note: ov?.risk_note ?? "",
            internal_summary: ov?.internal_summary ?? "",
            assignees: assigns.filter((a) => a.client_id === p.id).map((a) => a.assignee_id),
          };
        });

        // 3. Fetch manual clients (records without a real linked user account)
        let manualQuery = supabase
          .from("manual_clients")
          .select("id, full_name, email, phone, notes, created_at, created_by, linked_user_id")
          .is("linked_user_id", null);
        if (!isAdmin && user) {
          manualQuery = manualQuery.eq("created_by", user.id);
        }
        const { data: manualData } = await manualQuery;
        const manualRows: ClientRow[] = (manualData ?? []).map((m) => ({
          id: `manual:${m.id}`,
          full_name: m.full_name || "Unnamed",
          avatar_url: null,
          created_at: m.created_at,
          is_manual: true,
          manual_email: m.email,
          manual_phone: m.phone,
          manual_notes: m.notes,
          session_count: 0,
          upcoming_count: 0,
          last_session: null,
          next_session: null,
          unpaid_count: 0,
          note_count: 0,
          document_count: 0,
          clinical_entry_count: 0,
          todo_pending: 0,
          message_count: 0,
          course_count: 0,
          stage: "new",
          tags: [],
          risk_level: "low",
          risk_note: "",
          internal_summary: m.notes ?? "",
          assignees: [],
        }));

        const combined = [...enriched, ...manualRows];

        // Sort: high risk first, then upcoming sessions soonest, then name.
        combined.sort((a, b) => {
          const riskRank = { high: 0, medium: 1, low: 2 } as const;
          if (riskRank[a.risk_level] !== riskRank[b.risk_level]) {
            return riskRank[a.risk_level] - riskRank[b.risk_level];
          }
          if (a.next_session && b.next_session) return a.next_session.localeCompare(b.next_session);
          if (a.next_session) return -1;
          if (b.next_session) return 1;
          return a.full_name.localeCompare(b.full_name);
        });

        setRows(combined);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, user]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (stageFilter !== "all" && r.stage !== stageFilter) return false;
      if (riskFilter !== "all" && r.risk_level !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.full_name.toLowerCase().includes(q) &&
          !r.tags.some((t) => t.toLowerCase().includes(q)) &&
          !r.internal_summary.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rows, search, stageFilter, riskFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.stage === "active").length,
    highRisk: rows.filter((r) => r.risk_level === "high").length,
    upcoming: rows.filter((r) => r.upcoming_count > 0).length,
  }), [rows]);

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Clients Overview</h1>
            <p className="text-white/60 text-sm mt-1">
              {isAdmin
                ? "All clients across the practice — auto-populated from sessions, notes, and engagement."
                : "Clients assigned to you — auto-populated from your sessions, notes, and engagement."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "#3b82f6" },
              { label: "Active", value: stats.active, color: "#10b981" },
              { label: "High risk", value: stats.highRisk, color: "#ef4444" },
              { label: "With upcoming", value: stats.upcoming, color: "#8b5cf6" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/95 backdrop-blur rounded-2xl p-4 border border-black/5 shadow-sm"
              >
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <FloatCard>
            <WidgetHeader icon={Filter} title="Filter & search" accentColor="#0ea5e9" />
            <div className="p-5 grid sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name, tag, summary..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-full text-sm"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 rounded-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="h-9 rounded-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All risk levels</SelectItem>
                  <SelectItem value="high">High risk</SelectItem>
                  <SelectItem value="medium">Medium risk</SelectItem>
                  <SelectItem value="low">Low risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FloatCard>

          {loading ? (
            <div className="text-center py-16 text-white/60">Loading clients...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/60 bg-white/5 rounded-2xl border border-white/10">
              {rows.length === 0 ? "No clients yet." : "No clients match your filters."}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => {
                const inner = (
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.full_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User size={20} className="text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-base text-slate-900">{c.full_name}</p>
                        {c.is_manual ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-500/10 text-slate-700 border-slate-500/30">
                            manual
                          </span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STAGE_COLORS[c.stage]}`}>
                            {c.stage}
                          </span>
                        )}
                        {c.risk_level !== "low" && (
                          <span className={`text-[10px] flex items-center gap-1 ${RISK_COLORS[c.risk_level]}`}>
                            <AlertTriangle size={10} /> {c.risk_level} risk
                          </span>
                        )}
                        {c.unpaid_count > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 border border-red-500/30">
                            {c.unpaid_count} unpaid
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.is_manual ? "Added" : "Client since"} {format(new Date(c.created_at), "MMM yyyy")}
                        {c.next_session && (
                          <> · Next: {format(new Date(c.next_session), "EEE d MMM, HH:mm")}</>
                        )}
                        {!c.next_session && c.last_session && (
                          <> · Last: {format(new Date(c.last_session), "d MMM yyyy")}</>
                        )}
                        {c.is_manual && c.manual_email && <> · {c.manual_email}</>}
                        {c.is_manual && c.manual_phone && <> · {c.manual_phone}</>}
                      </p>

                      {c.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {c.tags.slice(0, 6).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px] py-0">{t}</Badge>
                          ))}
                        </div>
                      )}

                      {c.internal_summary && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                          {c.internal_summary}
                        </p>
                      )}

                      {!c.is_manual && (
                        <div className="flex gap-3 flex-wrap mt-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {c.session_count} sessions</span>
                          <span className="flex items-center gap-1"><FileText size={11} /> {c.note_count} notes</span>
                          <span className="flex items-center gap-1"><BookOpen size={11} /> {c.clinical_entry_count} clinical</span>
                          <span className="flex items-center gap-1"><ListTodo size={11} /> {c.todo_pending} pending</span>
                          <span className="flex items-center gap-1"><MessageSquare size={11} /> {c.message_count} msgs</span>
                          {c.course_count > 0 && (
                            <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {c.course_count} course{c.course_count > 1 ? "s" : ""}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {!c.is_manual && <ChevronRight size={16} className="text-muted-foreground/40 shrink-0 mt-2" />}
                  </div>
                );

                const basePath = isAdmin ? "/admin/clients" : "/staff/clients";
                const targetUrl = `${basePath}/${c.id}`;

                return (
                  <Link
                    key={c.id}
                    to={targetUrl}
                    className="block bg-white/95 backdrop-blur rounded-2xl border border-black/5 hover:border-primary/30 hover:shadow-lg transition-all p-5"
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientsOverview;
