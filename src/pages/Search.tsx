import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, FileText, Calendar, BookOpen, Users, ListTodo, MessageSquare, GraduationCap, Award, Briefcase, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type ResultGroup = {
  key: string;
  label: string;
  icon: typeof FileText;
  items: { id: string; title: string; subtitle?: string; to: string }[];
};

// Static public pages — always searchable
const STATIC_PAGES = [
  { title: "Home", to: "/", desc: "Welcome to Binyan" },
  { title: "Services", to: "/services", desc: "Our service offerings" },
  { title: "Education", to: "/education", desc: "Education services" },
  { title: "Therapy", to: "/therapy", desc: "Therapy services" },
  { title: "Families", to: "/families", desc: "Family support" },
  { title: "Organisations", to: "/organisations", desc: "For organisations" },
  { title: "Supervision", to: "/supervision", desc: "Supervision services" },
  { title: "About Us", to: "/about", desc: "About Binyan" },
  { title: "Contact", to: "/contact", desc: "Get in touch" },
  { title: "Insights", to: "/insights", desc: "Articles & resources" },
  { title: "Courses", to: "/courses", desc: "Online courses" },
];

const Search = () => {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const { user, isAdmin, isTeamMember, isSupervisee } = useAuth();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Sync URL
  useEffect(() => {
    if (debounced) setParams({ q: debounced }, { replace: true });
    else setParams({}, { replace: true });
  }, [debounced, setParams]);

  // Static page matches (instant)
  const staticMatches = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    return STATIC_PAGES
      .filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
      .map(p => ({ id: p.to, title: p.title, subtitle: p.desc, to: p.to }));
  }, [debounced]);

  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setGroups([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const q = debounced;
      const like = `%${q}%`;
      const newGroups: ResultGroup[] = [];

      // Public: blog posts (everyone)
      const blogQ = supabase
        .from("blog_posts")
        .select("id, title, slug, abstract")
        .eq("status", "published")
        .or(`title.ilike.${like},abstract.ilike.${like}`)
        .limit(10);

      // Public: courses (everyone)
      const coursesQ = supabase
        .from("courses")
        .select("id, title, slug, description")
        .eq("is_active", true)
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(10);

      // Public: team members
      const teamQ = supabase
        .from("team_members")
        .select("id, name, slug, role, bio")
        .eq("is_active", true)
        .or(`name.ilike.${like},role.ilike.${like},bio.ilike.${like}`)
        .limit(10);

      const queries: any[] = [blogQ, coursesQ, teamQ];

      // Authenticated: RLS filters per user
      if (user) {
        // Sessions (RLS: client sees own, staff sees assigned, admin sees all)
        queries.push(
          supabase
            .from("sessions")
            .select("id, title, session_date, description")
            .or(`title.ilike.${like},description.ilike.${like}`)
            .order("session_date", { ascending: false })
            .limit(10)
        );

        // Client todos (RLS: client own, assigned staff, admin)
        queries.push(
          supabase
            .from("client_todos")
            .select("id, title, description, client_id")
            .or(`title.ilike.${like},description.ilike.${like}`)
            .limit(10)
        );

        // Messages (RLS: sender or recipient)
        queries.push(
          supabase
            .from("messages")
            .select("id, content, sender_id, recipient_id, created_at")
            .ilike("content", like)
            .order("created_at", { ascending: false })
            .limit(10)
        );

        // Resources (public bucket — everyone)
        queries.push(
          supabase
            .from("resources")
            .select("id, title, description, category")
            .or(`title.ilike.${like},description.ilike.${like}`)
            .limit(10)
        );
      }

      // Staff/admin only
      if (isAdmin || isTeamMember) {
        queries.push(
          supabase
            .from("client_notes")
            .select("id, title, content, client_id")
            .or(`title.ilike.${like},content.ilike.${like}`)
            .limit(10)
        );
        queries.push(
          supabase
            .from("note_templates")
            .select("id, title, description")
            .or(`title.ilike.${like},description.ilike.${like}`)
            .limit(10)
        );
        queries.push(
          supabase
            .from("manual_clients")
            .select("id, full_name, email, notes")
            .or(`full_name.ilike.${like},email.ilike.${like},notes.ilike.${like}`)
            .limit(10)
        );
        queries.push(
          supabase
            .from("staff_todos")
            .select("id, title, description")
            .or(`title.ilike.${like},description.ilike.${like}`)
            .limit(10)
        );
      }

      // Supervisee
      if (isSupervisee) {
        queries.push(
          supabase
            .from("supervisee_case_logs")
            .select("id, client_name, session_type, supervision_notes, session_date")
            .or(`client_name.ilike.${like},session_type.ilike.${like},supervision_notes.ilike.${like}`)
            .order("session_date", { ascending: false })
            .limit(10)
        );
      }

      const results = await Promise.allSettled(queries);
      if (cancelled) return;

      // Index results by query order
      let i = 0;
      const get = () => {
        const r = results[i++];
        return r && r.status === "fulfilled" ? (r.value.data || []) : [];
      };

      const blog = get(), courses = get(), team = get();
      let sessions: any[] = [], todos: any[] = [], msgs: any[] = [], resources: any[] = [];
      let notes: any[] = [], templates: any[] = [], manualClients: any[] = [], staffTodos: any[] = [];
      let caseLogs: any[] = [];

      if (user) {
        sessions = get(); todos = get(); msgs = get(); resources = get();
      }
      if (isAdmin || isTeamMember) {
        notes = get(); templates = get(); manualClients = get(); staffTodos = get();
      }
      if (isSupervisee) {
        caseLogs = get();
      }

      if (blog.length) newGroups.push({
        key: "blog", label: "Insights Articles", icon: BookOpen,
        items: blog.map((b: any) => ({ id: b.id, title: b.title, subtitle: b.abstract?.slice(0, 120), to: `/insights/article/${b.slug}` }))
      });
      if (courses.length) newGroups.push({
        key: "courses", label: "Courses", icon: GraduationCap,
        items: courses.map((c: any) => ({ id: c.id, title: c.title, subtitle: c.description?.slice(0, 120), to: `/courses/${c.slug}` }))
      });
      if (team.length) newGroups.push({
        key: "team", label: "Team Members", icon: Users,
        items: team.map((m: any) => ({ id: m.id, title: m.name, subtitle: m.role, to: `/team/${m.slug || m.id}` }))
      });
      if (sessions.length) newGroups.push({
        key: "sessions", label: "Sessions", icon: Calendar,
        items: sessions.map((s: any) => ({
          id: s.id, title: s.title,
          subtitle: new Date(s.session_date).toLocaleString(),
          to: isAdmin || isTeamMember ? "/admin/calendar" : "/portal/booking"
        }))
      });
      if (todos.length) newGroups.push({
        key: "todos", label: "Tasks", icon: ListTodo,
        items: todos.map((t: any) => ({ id: t.id, title: t.title, subtitle: t.description?.slice(0, 120), to: "/portal" }))
      });
      if (msgs.length) newGroups.push({
        key: "messages", label: "Messages", icon: MessageSquare,
        items: msgs.map((m: any) => ({
          id: m.id,
          title: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
          subtitle: new Date(m.created_at).toLocaleString(),
          to: `/portal/messages?user=${m.sender_id === user?.id ? m.recipient_id : m.sender_id}`
        }))
      });
      if (resources.length) newGroups.push({
        key: "resources", label: "Resources", icon: FileText,
        items: resources.map((r: any) => ({ id: r.id, title: r.title, subtitle: r.description?.slice(0, 120) || r.category, to: "/portal/resources" }))
      });
      if (notes.length) newGroups.push({
        key: "notes", label: "Client Notes", icon: FileText,
        items: notes.map((n: any) => ({ id: n.id, title: n.title, subtitle: n.content?.slice(0, 120), to: `/admin/clients/${n.client_id}` }))
      });
      if (templates.length) newGroups.push({
        key: "templates", label: "Note Templates", icon: FileText,
        items: templates.map((t: any) => ({ id: t.id, title: t.title, subtitle: t.description, to: "/staff/note-templates" }))
      });
      if (manualClients.length) newGroups.push({
        key: "manual", label: "Manual Clients", icon: Users,
        items: manualClients.map((c: any) => ({ id: c.id, title: c.full_name, subtitle: c.email || c.notes?.slice(0, 80), to: "/admin/manual-clients" }))
      });
      if (staffTodos.length) newGroups.push({
        key: "stafftodos", label: "Staff Tasks", icon: Briefcase,
        items: staffTodos.map((t: any) => ({ id: t.id, title: t.title, subtitle: t.description?.slice(0, 120), to: "/admin/staff-todos" }))
      });
      if (caseLogs.length) newGroups.push({
        key: "caselogs", label: "Case Logs", icon: Award,
        items: caseLogs.map((c: any) => ({
          id: c.id,
          title: c.client_name + " — " + c.session_type,
          subtitle: new Date(c.session_date).toLocaleDateString(),
          to: "/supervisee/case-logs"
        }))
      });

      setGroups(newGroups);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [debounced, user?.id, isAdmin, isTeamMember, isSupervisee]);

  const totalDb = groups.reduce((s, g) => s + g.items.length, 0);
  const total = totalDb + staticMatches.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl pt-32 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Search</h1>
          <p className="text-sm text-muted-foreground">
            {user
              ? "Search across pages, articles, your sessions, tasks, messages and more."
              : "Search across pages, articles, courses and team members. Sign in for personalised results."}
          </p>
        </div>

        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            className="pl-12 h-14 text-base rounded-2xl border-border/50 bg-card/50 backdrop-blur"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" size={18} />
          )}
        </div>

        {!debounced && (
          <div className="text-center py-16 text-muted-foreground">
            <SearchIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Start typing to search</p>
          </div>
        )}

        {debounced && debounced.length < 2 && (
          <p className="text-sm text-muted-foreground text-center py-8">Type at least 2 characters</p>
        )}

        {debounced && debounced.length >= 2 && !loading && total === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No results for <span className="font-medium text-foreground">"{debounced}"</span></p>
          </div>
        )}

        {debounced && debounced.length >= 2 && (
          <div className="space-y-8">
            {staticMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={15} className="text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pages</h2>
                  <Badge variant="secondary" className="ml-auto">{staticMatches.length}</Badge>
                </div>
                <div className="space-y-1">
                  {staticMatches.map(item => (
                    <Link
                      key={item.id}
                      to={item.to}
                      className="block p-4 rounded-xl border border-border/40 hover:bg-accent/50 transition-colors"
                    >
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {groups.map(group => (
              <section key={group.key}>
                <div className="flex items-center gap-2 mb-3">
                  <group.icon size={15} className="text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h2>
                  <Badge variant="secondary" className="ml-auto">{group.items.length}</Badge>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <Link
                      key={item.id}
                      to={item.to}
                      className="block p-4 rounded-xl border border-border/40 hover:bg-accent/50 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.subtitle}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Search;
