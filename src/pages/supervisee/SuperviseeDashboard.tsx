import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, FileText, Calendar, Wrench, BookOpen, ListTodo, Settings, ChevronRight, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import NotificationSettings from "@/components/portal/NotificationSettings";
import {
  METAL_BG, FloatCard, WidgetHeader, StatTile, PortalTopBar,
} from "@/components/portal/PortalShell";

const SuperviseeDashboard = () => {
  const { t } = useLanguage();
  const portalT = (t as any).superviseeHub || {};

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return portalT.goodMorning || "Good morning";
    if (h < 17) return portalT.goodAfternoon || "Good afternoon";
    return portalT.goodEvening || "Good evening";
  };

  const tools = [
    { label: portalT.caseLogsLabel || "Case Logs", path: "/supervisee/case-logs", icon: ClipboardList, description: portalT.caseLogsDesc || "Log session details, targets, and interventions", accentColor: "#3b82f6", iconBg: "rgba(59,130,246,0.10)" },
    { label: "Competencies", path: "/supervisee/competencies", icon: Target, description: "Track your competencies, evidence and self-assessment", accentColor: "#0ea5e9", iconBg: "rgba(14,165,233,0.10)" },
    { label: portalT.myDocsLabel || "My Documents", path: "/supervisee/documents", icon: FileText, description: portalT.myDocsDesc || "Upload and view supervision documents", accentColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.10)" },
    { label: portalT.calendarLabel || "Calendar", path: "/supervisee/calendar", icon: Calendar, description: portalT.calendarDesc || "View your session schedule", accentColor: "#10b981", iconBg: "rgba(16,185,129,0.10)" },
    { label: portalT.clinicalToolsLabel || "Clinical Tools", path: "/supervisee/clinical-tools", icon: Wrench, description: portalT.clinicalToolsDesc || "ABC data sheets, functional assessments & more", accentColor: "#f59e0b", iconBg: "rgba(245,158,11,0.10)" },
    { label: portalT.resourcesLabel || "Resources", path: "/supervisee/resources", icon: BookOpen, description: portalT.resourcesDesc || "Access shared learning resources", accentColor: "#ef4444", iconBg: "rgba(239,68,68,0.10)" },
    { label: portalT.myTodosLabel || "My To-Dos", path: "/supervisee/todos", icon: ListTodo, description: portalT.myTodosDesc || "Track your supervision tasks", accentColor: "#6366f1", iconBg: "rgba(99,102,241,0.10)" },
  ];

  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ caseLogs: 0, documents: 0, pendingTodos: 0, loading: true });
  const firstName = profile?.full_name?.split(" ")[0] || "";

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [logsRes, todosRes] = await Promise.all([
          supabase.from("supervisee_case_logs").select("id", { count: "exact" }).eq("supervisee_id", user.id),
          supabase.from("client_todos").select("id", { count: "exact" }).eq("client_id", user.id).eq("is_completed", false),
        ]);
        setStats({ caseLogs: logsRes.count || 0, documents: 0, pendingTodos: todosRes.count || 0, loading: false });
      } catch { setStats(p => ({ ...p, loading: false })); }
    })();
  }, [user]);

  return (
    <div className="min-h-screen" style={METAL_BG}>
      <Header />

      <PortalTopBar
        greeting={`${getGreeting()}${firstName ? `, ${firstName}` : ""} 👋`}
        date={new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      />

      <div className="container max-w-5xl py-8 space-y-6">

        {/* Stats */}
        {!stats.loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatTile label={portalT.caseLogsLabel || "Case Logs"} value={stats.caseLogs} note={portalT.caseLogsNote || "Total sessions logged"} icon={ClipboardList} accentColor="#3b82f6" iconBg="rgba(59,130,246,0.10)" delay={0} to="/supervisee/case-logs" />
            <StatTile label={portalT.myDocsLabel || "My Documents"} value={stats.documents} note={portalT.myDocsNote || "Uploaded supervision files"} icon={FileText} accentColor="#8b5cf6" iconBg="rgba(139,92,246,0.10)" delay={0.07} to="/supervisee/documents" />
            <StatTile label={portalT.myTodosLabel || "Pending To-Dos"} value={stats.pendingTodos} note={portalT.myTodosNote || "Tasks to complete"} icon={ListTodo} accentColor="#f59e0b" iconBg="rgba(245,158,11,0.10)" delay={0.14} to="/supervisee/todos" />
          </div>
        )}

        {/* Tools grid */}
        <FloatCard delay={0.18}>
          <WidgetHeader icon={Wrench} title={portalT.yourTools || "Your Tools"} subtitle={portalT.everythingInOnePlace || "Everything in one place"} accentColor="#3b82f6" />
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.35 } }}
              >
                <Link
                  to={tool.path}
                  className="flex items-start gap-3 p-4 rounded-xl border border-black/[0.06] bg-white/50
                    hover:bg-white/80 hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]
                    transition-all duration-300 group h-full"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tool.iconBg }}>
                    <tool.icon size={16} style={{ color: tool.accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{tool.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tool.description}</p>
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors mt-0.5 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </FloatCard>

        {/* Notification settings */}
        <FloatCard delay={0.36}>
          <WidgetHeader icon={Settings} title={portalT.notificationSettings || "Notification Settings"} accentColor="#94a3b8" />
          <div className="p-5">
            <NotificationSettings />
          </div>
        </FloatCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="pb-4"
          style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}
        >{portalT.portalFooter || "Supervisee Portal · Binyan CBS"}</motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default SuperviseeDashboard;
