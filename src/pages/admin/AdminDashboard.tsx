import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, Calendar, Users, UserPlus, ImageIcon, FileEdit,
  UserCog, KeyRound, Pencil, GraduationCap, ShieldAlert, BarChart3, BookOpen, FileText,
  ListTodo, Settings, Bot, ChevronRight, Brain, Sparkles, ClipboardList, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "@/hooks/useEditMode";
import NotificationSettings from "@/components/portal/NotificationSettings";
import {
  METAL_BG, FloatCard, WidgetHeader, StatTile, PortalTopBar,
} from "@/components/portal/PortalShell";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const categories = [
  {
    title: "Clinical Tools",
    accentColor: "#0ea5e9",
    iconBg: "rgba(14,165,233,0.10)",
    tools: [
      { label: "Clients Overview", path: "/admin/clients", icon: ClipboardList, description: "Auto-populated dashboard of every client — sessions, notes, risk, engagement" },
      { label: "Parent FBA Intakes", path: "/staff/fba-intakes", icon: ClipboardList, description: "Send Hanley intake forms to parents and pull answers straight into the report" },
      { label: "FBA Report Tool", path: "/admin/fba-report", icon: Brain, description: "ACT-informed, constructional Functional Behaviour Assessment report builder" },
      { label: "Pathway Templates", path: "/admin/pathway-templates", icon: ListTodo, description: "Edit the default Support and FBA pathway steps every client sees" },
      { label: "Supervision Tracker", path: "/admin/supervision", icon: GraduationCap, description: "Build competencies, evaluate supervisees, and journal together" },
    ],
  },
  {
    title: "AI Assistant",
    accentColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.10)",
    tools: [
      { label: "Assistant Manager", path: "/admin/assistant", icon: Bot, description: "Configure greetings, toggle on/off, review conversations" },
      { label: "Story Engine", path: "/admin/story-engine", icon: Sparkles, description: "Upload raw notes; AI fictionalises and publishes daily blog posts" },
    ],
  },
  {
    title: "Business & Finance",
    accentColor: "#10b981",
    iconBg: "rgba(16,185,129,0.10)",
    tools: [
      { label: "Business Dashboard", path: "/admin/business", icon: BarChart3, description: "Revenue analytics, profit tracking, forecasts, and client growth" },
    ],
  },
  {
    title: "Website Design & Content",
    accentColor: "#3b82f6",
    iconBg: "rgba(59,130,246,0.10)",
    tools: [
      { label: "Hero Images", path: "/admin/hero-images", icon: ImageIcon, description: "Manage the landing page slideshow images, quotes, and timing" },
      { label: "Site Content", path: "/admin/site-content", icon: FileEdit, description: "Edit page images, quotes, and text across all service pages" },
      { label: "Pathway Quiz", path: "/admin/pathway-quiz", icon: Sparkles, description: "Edit the 'Find your way in' welcome slides that route visitors to the right pages" },
      { label: "Therapist Profiles", path: "/admin/team-members", icon: Users, description: "Add, edit, or remove therapist bios shown on the About page" },
      { label: "Blog Manager", path: "/admin/blog", icon: BookOpen, description: "Create, schedule, and manage Insights articles and authors" },
      { label: "Partner Badges", path: "/admin/badges", icon: Shield, description: "Manage accreditation logos, add links to external sites" },
    ],
  },
  {
    title: "Task Management",
    accentColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.10)",
    tools: [
      { label: "Task Board", path: "/admin/task-board", icon: Settings, description: "Kanban board to delegate and track team tasks" },
      { label: "Staff To-Dos", path: "/admin/staff-todos", icon: ListTodo, description: "List view of staff tasks" },
    ],
  },
  {
    title: "Services & Booking",
    accentColor: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.10)",
    tools: [
      { label: "Service Options", path: "/admin/service-options", icon: Settings, description: "Define session types, durations, and pricing" },
      { label: "Calendar", path: "/admin/calendar", icon: Calendar, description: "View and manage all scheduled sessions" },
      { label: "Note Templates", path: "/admin/note-templates", icon: FileText, description: "Design session note templates for voice transcription" },
      { label: "Therapist Payouts", path: "/admin/payouts", icon: DollarSign, description: "Track per-session and batch payouts owed to therapists" },
      { label: "Course Manager", path: "/admin/courses", icon: GraduationCap, description: "Create and manage online courses, lessons, and videos" },
    ],
  },
  {
    title: "Users & Access",
    accentColor: "#ef4444",
    iconBg: "rgba(239,68,68,0.10)",
    tools: [
      { label: "User Management", path: "/admin/users", icon: UserCog, description: "Manage all users, roles, therapist assignments, and client portals" },
      { label: "Manual Clients", path: "/admin/manual-clients", icon: UserPlus, description: "Add clients and supervisees who don't have an account" },
      { label: "Auth Settings", path: "/admin/auth-settings", icon: KeyRound, description: "Configure sign-up, sign-in methods, and security" },
      { label: "Security Dashboard", path: "/admin/security", icon: ShieldAlert, description: "Run security scans and review vulnerabilities" },
      { label: "Team Requests", path: "/admin/team-requests", icon: UserPlus, description: "Review pending therapist access requests" },
    ],
  },
];

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { setEditMode } = useEditMode();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ activeClients: 0, upcomingSessions: 0, pendingTodos: 0, loading: true });
  const firstName = profile?.full_name?.split(" ")[0] || "";

  useEffect(() => {
    (async () => {
      try {
        const [clientsRes, sessionsRes, todosRes] = await Promise.all([
          supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "client"),
          supabase.from("sessions").select("id", { count: "exact" }).gte("session_date", new Date().toISOString()),
          supabase.from("client_todos").select("id", { count: "exact" }).eq("is_completed", false),
        ]);
        setStats({ activeClients: clientsRes.count || 0, upcomingSessions: sessionsRes.count || 0, pendingTodos: todosRes.count || 0, loading: false });
      } catch { setStats(p => ({ ...p, loading: false })); }
    })();
  }, []);

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />

      <PortalTopBar
        greeting={`${getGreeting()}${firstName ? `, ${firstName}` : ""} 👋`}
        date={new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      >
        <Button
          size="sm"
          variant="outline"
          className="gap-2 rounded-full h-9 text-xs border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          onClick={() => { setEditMode(true); navigate("/"); }}
        >
          <Pencil size={13} /> Edit Website
        </Button>
      </PortalTopBar>

      <div className="container max-w-5xl py-8 space-y-6">

        {/* Stats */}
        {!stats.loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatTile label="Active Clients" value={stats.activeClients} note="Registered in portal" icon={Users} accentColor="#3b82f6" iconBg="rgba(59,130,246,0.10)" delay={0} to="/admin/users" />
            <StatTile label="Upcoming Sessions" value={stats.upcomingSessions} note="Scheduled in future" icon={Calendar} accentColor="#10b981" iconBg="rgba(16,185,129,0.10)" delay={0.07} to="/admin/calendar" />
            <StatTile label="Pending Client Tasks" value={stats.pendingTodos} note="Incomplete client to-dos" icon={ListTodo} accentColor="#f59e0b" iconBg="rgba(245,158,11,0.10)" delay={0.14} to="/admin/todos" />
          </div>
        )}

        {/* Tool categories */}
        {categories.map((cat, catIdx) => (
          <FloatCard key={cat.title} delay={0.1 + catIdx * 0.06}>
            <WidgetHeader
              icon={Shield}
              title={cat.title}
              accentColor={cat.accentColor}
            />
            <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.tools.map((tool, i) => (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + catIdx * 0.06 + i * 0.04 }}
                  whileHover={{ y: -2, transition: { duration: 0.3 } }}
                >
                  <Link
                    to={tool.path}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-black/[0.06] bg-white/50
                      hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]
                      transition-all duration-300 group h-full"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cat.iconBg }}>
                      <tool.icon size={15} style={{ color: cat.accentColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{tool.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tool.description}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted-foreground/30 shrink-0 mt-1 group-hover:text-primary/50 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </FloatCard>
        ))}

        {/* Notification settings */}
        <FloatCard delay={0.5}>
          <WidgetHeader icon={Settings} title="Notification Settings" accentColor="#94a3b8" />
          <div className="p-5">
            <NotificationSettings />
          </div>
        </FloatCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="pb-4"
          style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}
        >
          Admin Portal · Binyan Adam CBS
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
