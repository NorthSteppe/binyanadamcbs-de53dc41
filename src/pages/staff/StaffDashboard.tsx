import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  ListTodo,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  PortalShell,
  BentoGrid,
  BentoTile,
} from "@/components/portal/BentoShell";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);

  useEffect(() => {
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .or(`therapist_id.eq.${user.id},attendee_ids.cs.{${user.id}}`)
      .gte("session_date", start.toISOString())
      .lte("session_date", end.toISOString())
      .then(({ count }) => setTodayCount(count ?? 0));

    supabase
      .from("client_assignments")
      .select("client_id", { count: "exact", head: true })
      .eq("assignee_id", user.id)
      .then(({ count }) => setClientCount(count ?? 0));

    supabase
      .from("staff_todos")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", user.id)
      .eq("is_completed", false)
      .then(({ count }) => setOpenTasks(count ?? 0));
  }, [user]);

  return (
    <PortalShell
      title="Therapist desk"
      subtitle="Today at a glance — sessions, clients and notes for your shift."
    >
      <BentoGrid>
        <BentoTile
          feature="staff.today"
          to="/staff/calendar"
          size="lg"
          icon={Calendar}
          label="Today"
          value={todayCount}
          hint={todayCount === 1 ? "session today" : "sessions today"}
          accent="navy"
        />
        <BentoTile
          feature="staff.clients"
          to="/staff/clients"
          size="md"
          icon={Users}
          label="My clients"
          value={clientCount}
          hint="Assigned to you"
          accent="orange"
        />
        <BentoTile
          feature="staff.tasks"
          to="/staff/staff-todos"
          size="md"
          icon={ListTodo}
          label="Tasks"
          value={openTasks}
          hint={openTasks === 0 ? "Inbox zero" : "Open tasks"}
        />
        <BentoTile
          feature="staff.notes"
          to="/staff/note-templates"
          size="sm"
          icon={FileText}
          label="Notes"
          hint="Templates & history"
        />
        <BentoTile
          feature="staff.calendar"
          to="/staff/calendar"
          size="sm"
          icon={CalendarDays}
          label="Calendar"
          hint="Personal & team"
        />
        <BentoTile
          feature="staff.tools"
          to="/staff/clinical-tools"
          size="md"
          icon={Wrench}
          label="Clinical tools"
          hint="ACT, FBA, formulation"
        />
      </BentoGrid>
    </PortalShell>
  );
};

export default StaffDashboard;
