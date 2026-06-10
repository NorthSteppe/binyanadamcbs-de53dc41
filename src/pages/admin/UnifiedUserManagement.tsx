import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, UserCog, ShieldCheck, Plus, Trash2, Users, UserPlus,
  ChevronDown, ChevronRight, Calendar, FileText, Clock, ListTodo,
  CheckCircle2, Circle, Upload, Eye, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

type UserRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
};

type Assignment = {
  id: string;
  client_id: string;
  assignee_id: string;
  client_name: string;
  assignee_name: string;
};

const ROLE_OPTIONS = ["admin", "team_member", "supervisor", "supervisee", "client"] as const;
const ROLE_LABELS: Record<string, string> = { admin: "Admin", team_member: "Therapist", supervisor: "Supervisor", supervisee: "Supervisee", client: "Client" };
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  team_member: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-secondary/40 text-secondary-foreground border-secondary/40",
  supervisee: "bg-accent/20 text-accent-foreground border-accent/20",
  client: "bg-muted text-muted-foreground border-border",
};

const UnifiedUserManagement = () => {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // ──── Fetch all users ────
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["unified-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url, created_at").order("created_at", { ascending: false });
      if (!profiles) return [];
      const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap: Record<string, string[]> = {};
      allRoles?.forEach((r) => { if (!roleMap[r.user_id]) roleMap[r.user_id] = []; roleMap[r.user_id].push(r.role); });
      return profiles.map((p) => ({ ...p, roles: roleMap[p.id] || [] })) as UserRow[];
    },
  });

  // ──── Fetch assignments ────
  const { data: assignments = [] } = useQuery({
    queryKey: ["unified-assignments"],
    queryFn: async () => {
      const { data: assigns } = await supabase.from("client_assignments").select("*");
      const { data: profiles } = await supabase.from("profiles").select("id, full_name");
      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => { nameMap[p.id] = p.full_name; });
      return (assigns || []).map((a) => ({
        ...a,
        client_name: nameMap[a.client_id] || "Unknown",
        assignee_name: nameMap[a.assignee_id] || "Unknown",
      })) as Assignment[];
    },
  });

  // ──── Mutations ────
  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["unified-users"] }); toast.success("Role added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["unified-users"] }); toast.success("Role removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const assignTherapist = useMutation({
    mutationFn: async ({ clientId, assigneeId }: { clientId: string; assigneeId: string }) => {
      const { error } = await supabase.from("client_assignments").insert({ client_id: clientId, assignee_id: assigneeId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["unified-assignments"] }); toast.success("Therapist assigned"); },
    onError: (e: any) => toast.error(e.message.includes("duplicate") ? "Already assigned" : e.message),
  });

  const removeAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["unified-assignments"] }); toast.success("Unassigned"); },
  });

  const filtered = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const clients = users.filter((u) => u.roles.includes("client"));
  const teamMembers = users.filter((u) => u.roles.includes("admin") || u.roles.includes("team_member"));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 text-primary rounded-xl p-2.5"><UserCog size={22} /></div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-14">Manage users, roles, assignments, and view client portals — all in one place.</p>
        </motion.div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-full">
            <TabsTrigger value="users" className="rounded-full gap-2"><Users size={14} /> All Users</TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-full gap-2"><UserPlus size={14} /> Assignments</TabsTrigger>
          </TabsList>

          {/* ──── ALL USERS TAB ──── */}
          <TabsContent value="users">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading users…</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isExpanded={expandedUser === user.id}
                    onToggleExpand={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    onAddRole={(role) => addRole.mutate({ userId: user.id, role })}
                    onRemoveRole={(role) => removeRole.mutate({ userId: user.id, role })}
                    onAssignTherapist={(assigneeId) => assignTherapist.mutate({ clientId: user.id, assigneeId })}
                    onRemoveAssignment={(id) => removeAssignment.mutate(id)}
                    assignments={assignments.filter((a) => a.client_id === user.id)}
                    teamMembers={teamMembers}
                    currentUserId={currentUser?.id || ""}
                  />
                ))}
                {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No users found.</p>}
              </div>
            )}
          </TabsContent>

          {/* ──── ASSIGNMENTS TAB ──── */}
          <TabsContent value="assignments">
            <AssignmentsPanel
              clients={clients}
              teamMembers={teamMembers}
              assignments={assignments}
              onAssign={(clientId, assigneeId) => assignTherapist.mutate({ clientId, assigneeId })}
              onRemove={(id) => removeAssignment.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

// ──── USER CARD COMPONENT ────
interface UserCardProps {
  user: UserRow;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddRole: (role: string) => void;
  onRemoveRole: (role: string) => void;
  onAssignTherapist: (assigneeId: string) => void;
  onRemoveAssignment: (id: string) => void;
  assignments: Assignment[];
  teamMembers: UserRow[];
  currentUserId: string;
}

const UserCard = ({ user, isExpanded, onToggleExpand, onAddRole, onRemoveRole, onAssignTherapist, onRemoveAssignment, assignments, teamMembers, currentUserId }: UserCardProps) => {
  const isClient = user.roles.includes("client");

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden transition-all">
      {/* Main row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {user.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{user.full_name || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">Joined {format(new Date(user.created_at), "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <Badge key={role} variant="outline" className={`text-xs ${ROLE_COLORS[role] || ""}`}>
                {ROLE_LABELS[role] || role}
              </Badge>
            ))}
            {user.roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
          </div>
          {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-5 space-y-5">
              {/* Role management */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldCheck size={14} /> Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline" className={`text-xs gap-1.5 ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role]}
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Remove "${ROLE_LABELS[role]}" from ${user.full_name}?`)) onRemoveRole(role); }}
                        className="ml-0.5 hover:text-destructive"
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                  {ROLE_OPTIONS.filter((r) => !user.roles.includes(r)).map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 gap-1 rounded-full border border-dashed border-border hover:border-primary/40"
                      onClick={(e) => { e.stopPropagation(); onAddRole(role); }}
                    >
                      <Plus size={10} /> {ROLE_LABELS[role]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Therapist assignments (only for clients) */}
              {isClient && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><UserPlus size={14} /> Assigned Therapists</h4>
                  <div className="space-y-2 mb-3">
                    {assignments.length === 0 && <p className="text-xs text-muted-foreground">No therapist assigned.</p>}
                    {assignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-2">
                        <span className="text-sm text-foreground">{a.assignee_name}</span>
                        <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={(e) => { e.stopPropagation(); onRemoveAssignment(a.id); }}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <AssignTherapistInline
                    teamMembers={teamMembers}
                    existingAssigneeIds={assignments.map((a) => a.assignee_id)}
                    onAssign={onAssignTherapist}
                  />
                </div>
              )}

              {/* Client portal preview (only for clients) */}
              {isClient && (
                <ClientPortalPreview clientId={user.id} clientName={user.full_name} currentUserId={currentUserId} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ──── INLINE ASSIGN THERAPIST ────
const AssignTherapistInline = ({ teamMembers, existingAssigneeIds, onAssign }: {
  teamMembers: UserRow[];
  existingAssigneeIds: string[];
  onAssign: (assigneeId: string) => void;
}) => {
  const [sel, setSel] = useState("");
  const available = teamMembers.filter((t) => !existingAssigneeIds.includes(t.id));

  if (available.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Select value={sel} onValueChange={setSel}>
        <SelectTrigger className="w-[200px] h-8 text-xs rounded-lg">
          <SelectValue placeholder="Assign therapist…" />
        </SelectTrigger>
        <SelectContent>
          {available.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name || "Unnamed"}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button size="sm" className="h-8 rounded-lg gap-1 text-xs" disabled={!sel} onClick={() => { onAssign(sel); setSel(""); }}>
        <Plus size={12} /> Assign
      </Button>
    </div>
  );
};

// ──── CLIENT PORTAL PREVIEW ────
const ClientPortalPreview = ({ clientId, clientName, currentUserId }: { clientId: string; clientName: string; currentUserId: string }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add todo state
  const [newTodo, setNewTodo] = useState({ title: "", description: "", due_date: "" });
  // Add note state
  const [noteDialog, setNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });

  const fetchPortalData = async () => {
    const [sessRes, todoRes, docRes, noteRes] = await Promise.all([
      (supabase as any).from("staff_sessions").select("*").eq("client_id", clientId).order("session_date", { ascending: false }).limit(10),
      supabase.from("client_todos").select("*").eq("client_id", clientId).order("created_at", { ascending: true }),
      supabase.from("client_documents").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("client_notes").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);
    if (sessRes.data) setSessions(sessRes.data);
    if (todoRes.data) setTodos(todoRes.data);
    if (docRes.data) setDocuments(docRes.data);
    if (noteRes.data) setNotes(noteRes.data);
    setLoaded(true);
  };

  const handleShowPortal = () => {
    if (!loaded) fetchPortalData();
    setShowPortal(!showPortal);
  };

  const addTodo = async () => {
    if (!newTodo.title) return;
    const { error } = await supabase.from("client_todos").insert({
      client_id: clientId,
      created_by: currentUserId,
      title: newTodo.title,
      description: newTodo.description,
      due_date: newTodo.due_date || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Todo added");
    setNewTodo({ title: "", description: "", due_date: "" });
    fetchPortalData();
  };

  const toggleTodo = async (todo: any) => {
    await supabase.from("client_todos").update({ is_completed: !todo.is_completed }).eq("id", todo.id);
    fetchPortalData();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("client_todos").delete().eq("id", id);
    fetchPortalData();
  };

  const addNote = async () => {
    if (!newNote.title) return;
    const { error } = await supabase.from("client_notes").insert({
      client_id: clientId,
      author_id: currentUserId,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Note added");
    setNewNote({ title: "", content: "", category: "general" });
    setNoteDialog(false);
    fetchPortalData();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("client_notes").delete().eq("id", id);
    fetchPortalData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const MAX_SIZE_MB = 10;

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not an allowed file type.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
        continue;
      }
      const filePath = `${clientId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast.error("Upload failed: " + uploadError.message);
        continue;
      }
      await supabase.from("client_documents").insert({
        client_id: clientId,
        file_name: file.name,
        file_url: filePath,
        file_type: file.type,
        uploaded_by: currentUserId,
      });
    }
    toast.success("Documents uploaded");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchPortalData();
  };

  const deleteDocument = async (id: string) => {
    await supabase.from("client_documents").delete().eq("id", id);
    fetchPortalData();
  };

  const noteCategories = ["general", "session-note", "assessment", "plan", "correspondence", "report"];

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full gap-2 text-xs"
        onClick={handleShowPortal}
      >
        <Eye size={14} /> {showPortal ? "Hide" : "View"} Client Portal
      </Button>

      <AnimatePresence>
        {showPortal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="bg-muted/20 rounded-xl border border-border/30 p-5 space-y-6">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary" />
                <h4 className="text-sm font-semibold">{clientName}'s Portal View</h4>
              </div>

              {!loaded ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Sessions */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Clock size={12} /> Sessions ({sessions.length})
                    </h5>
                    {sessions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No sessions.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border/30">
                            <div>
                              <p className="text-xs font-medium text-foreground">{s.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {format(new Date(s.session_date), "EEE, MMM d · HH:mm")} · {s.duration_minutes}min
                              </p>
                            </div>
                            <Badge variant={s.status === "completed" ? "default" : s.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px] capitalize">
                              {s.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* To-Dos */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <ListTodo size={12} /> To-Dos ({todos.length})
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                      {todos.map((todo) => (
                        <div key={todo.id} className="flex items-center gap-2 bg-card rounded-lg p-2.5 border border-border/30">
                          <button onClick={() => toggleTodo(todo)} className="shrink-0">
                            {todo.is_completed ? <CheckCircle2 size={14} className="text-primary" /> : <Circle size={14} className="text-muted-foreground" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                            {todo.due_date && <p className="text-[10px] text-muted-foreground">Due: {new Date(todo.due_date).toLocaleDateString()}</p>}
                          </div>
                          <button onClick={() => deleteTodo(todo.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {todos.length === 0 && <p className="text-xs text-muted-foreground">No todos.</p>}
                    </div>
                    {/* Add todo inline */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a todo…"
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                        className="h-8 text-xs rounded-lg"
                        onKeyDown={(e) => e.key === "Enter" && addTodo()}
                      />
                      <Button size="sm" className="h-8 rounded-lg text-xs gap-1" onClick={addTodo} disabled={!newTodo.title}>
                        <Plus size={10} /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText size={12} /> Documents ({documents.length})
                      </h5>
                      <div>
                        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          <Upload size={10} /> {uploading ? "Uploading…" : "Upload"}
                        </Button>
                      </div>
                    </div>
                    {documents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No documents.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 bg-card rounded-lg p-2.5 border border-border/30">
                            <button onClick={async () => {
                              const { data, error } = await supabase.storage.from("client-documents").download(doc.file_url);
                              if (error || !data) return;
                              const url = URL.createObjectURL(data);
                              const a = document.createElement("a"); a.href = url; a.download = doc.file_name; a.click();
                              URL.revokeObjectURL(url);
                            }} className="flex items-center gap-2 flex-1 min-w-0 hover:text-primary transition-colors text-left">
                              <FileText size={12} className="text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{doc.file_name}</p>
                                <p className="text-[10px] text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                              </div>
                            </button>
                            <button onClick={() => deleteDocument(doc.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText size={12} /> Notes ({notes.length})
                      </h5>
                      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1"><Plus size={10} /> Add Note</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Add Note for {clientName}</DialogTitle></DialogHeader>
                          <div className="space-y-3 mt-2">
                            <Input placeholder="Title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
                            <Select value={newNote.category} onValueChange={(v) => setNewNote({ ...newNote, category: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {noteCategories.map((c) => <SelectItem key={c} value={c}>{c.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Textarea placeholder="Content…" rows={4} value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} />
                            <Button onClick={addNote} className="w-full rounded-full">Save Note</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {notes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No notes.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notes.map((note) => (
                          <div key={note.id} className="bg-card rounded-lg p-3 border border-border/30">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-medium text-foreground">{note.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-[9px] h-4">{note.category}</Badge>
                                  <span className="text-[9px] text-muted-foreground">{format(new Date(note.created_at), "MMM d, yyyy")}</span>
                                </div>
                              </div>
                              <button onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 size={10} />
                              </button>
                            </div>
                            {note.content && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{note.content}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ──── ASSIGNMENTS PANEL ────
const AssignmentsPanel = ({ clients, teamMembers, assignments, onAssign, onRemove }: {
  clients: UserRow[];
  teamMembers: UserRow[];
  assignments: Assignment[];
  onAssign: (clientId: string, assigneeId: string) => void;
  onRemove: (id: string) => void;
}) => {
  const [selClient, setSelClient] = useState("");
  const [selAssignee, setSelAssignee] = useState("");

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border/50 p-5">
        <h3 className="text-sm font-semibold mb-4">Quick Assign</h3>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <p className="text-xs font-semibold mb-1">Client</p>
            <Select value={selClient} onValueChange={setSelClient}>
              <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name || "Unnamed"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">Assign to</p>
            <Select value={selAssignee} onValueChange={setSelAssignee}>
              <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select therapist" /></SelectTrigger>
              <SelectContent>
                {teamMembers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name || "Unnamed"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => { onAssign(selClient, selAssignee); setSelClient(""); setSelAssignee(""); }}
            className="rounded-full gap-2"
            disabled={!selClient || !selAssignee}
          >
            <UserPlus size={16} /> Assign
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {assignments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No assignments yet.</p>}
        {assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-card rounded-xl border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{a.client_name}</p>
              <p className="text-xs text-muted-foreground">→ {a.assignee_name}</p>
            </div>
            <Button size="sm" variant="destructive" className="rounded-full" onClick={() => onRemove(a.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedUserManagement;
