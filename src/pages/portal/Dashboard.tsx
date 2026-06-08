import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  ListTodo,
  BookOpen,
  Sparkles,
  Compass,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  PortalShell,
  BentoGrid,
  BentoTile,
} from "@/components/portal/BentoShell";

interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [nextSession, setNextSession] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("id, title, session_date")
      .eq("client_id", user.id)
      .gte("session_date", new Date().toISOString())
      .order("session_date", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setNextSession(data));
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("read", false)
      .then(({ count }) => setUnread(count ?? 0));
    supabase
      .from("client_todos")
      .select("id, title, is_completed")
      .eq("client_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setTodos((data as Todo[]) || []));
  }, [user]);

  const openTodos = todos.filter((t) => !t.is_completed).length;
  const nextLabel = nextSession
    ? new Date(nextSession.session_date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <PortalShell
      title="Welcome"
      subtitle="Your personal space to track sessions, talk to your care team and complete what was set for you."
      actions={
        <Link to="/portal/booking">
          <Button size="sm" className="rounded-full gap-2">
            <Calendar size={14} /> Book a session
          </Button>
        </Link>
      }
    >
      <BentoGrid>
        <BentoTile
          feature="client.next-session"
          to="/portal/booking"
          size="lg"
          icon={Calendar}
          label="Next session"
          value={nextLabel}
          hint={nextSession?.title || "Nothing scheduled yet"}
          accent="navy"
        />

        <BentoTile
          feature="client.messages"
          to="/portal/messages"
          size="md"
          icon={MessageSquare}
          label="Messages"
          value={unread}
          hint={unread === 0 ? "All caught up" : "Unread messages"}
          accent="orange"
        />

        <BentoTile
          feature="client.tasks"
          to="/portal/between-sessions"
          size="md"
          icon={ListTodo}
          label="Between sessions"
          value={openTodos}
          hint={openTodos === 0 ? "Nothing pending" : "Open tasks"}
          accent="navy"
        />

        <BentoTile
          feature="client.pathway"
          to="/portal/support-pathway"
          size="md"
          icon={Compass}
          label="Support pathway"
          hint="Open your stepped plan"
        >
          <p className="text-sm text-foreground/80 mt-3">
            See where you are in your journey and what comes next.
          </p>
        </BentoTile>

        <BentoTile
          feature="client.resources"
          to="/portal/resources"
          size="sm"
          icon={FileText}
          label="Resources"
          hint="Shared documents"
        />

        <BentoTile
          feature="client.toolkit"
          to="/portal/toolkit"
          size="sm"
          icon={Sparkles}
          label="Toolkit"
          hint="ACT, mindfulness, focus"
        />
      </BentoGrid>
      <MoreFeaturesGrid
        category="client"
        exclude={["client.next-session","client.messages","client.tasks","client.pathway","client.resources","client.toolkit"]}
      />
    </PortalShell>
  );
};

export default Dashboard;
