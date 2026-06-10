import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus, Calendar, FileText, Clock, Upload, CheckCircle2, Circle, Trash2, Pencil, Check, X, UserPlus, PoundSterling, Save, ClipboardList, Eye } from "lucide-react";
import { FBA_INTAKE_SECTIONS, calcCompletion } from "@/lib/fbaIntakeQuestions";
import ClientFinancialTab from "@/components/admin/ClientFinancialTab";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientOverviewPanel from "@/components/admin/ClientOverviewPanel";
import ClientAutoOverview from "@/components/admin/ClientAutoOverview";
import ClientBetweenSessionsPanel from "@/components/admin/ClientBetweenSessionsPanel";
import ClientProfileHeader from "@/components/clinical/ClientProfileHeader";
import SupportPathwayBoard from "@/components/clinical/SupportPathwayBoard";
import { toast } from "sonner";

// Per-session notes editor with voice transcription
const SessionRow = ({ session, onSaved }: { session: any; onSaved: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(session.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sessions")
      .update({ notes: draft })
      .eq("id", session.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save notes: " + error.message);
      return;
    }
    toast.success("Session notes saved");
    setEditing(false);
    onSaved();
  };

  const handleVoiceTranscript = (text: string) => {
    setDraft((prev) => (prev ? prev + (prev.endsWith(" ") ? "" : " ") + text : text));
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Clock size={16} className="text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(session.session_date), "EEE, MMM d, yyyy · HH:mm")} · {session.duration_minutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={session.status === "completed" ? "default" : session.status === "cancelled" ? "destructive" : "secondary"}
            className="capitalize text-xs"
          >
            {session.status}
          </Badge>
          {!editing && (
            <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => { setDraft(session.notes ?? ""); setEditing(true); }}>
              <Pencil size={12} /> {session.notes ? "Edit notes" : "Add notes"}
            </Button>
          )}
        </div>
      </div>

      {!editing && session.notes && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap border-t border-border/40 pt-3">
          {session.notes}
        </div>
      )}

      {editing && (
        <div className="space-y-2 border-t border-border/40 pt-3">
          <Textarea
            placeholder="Type session notes here, or use voice transcription below…"
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <VoiceRecorder onTranscript={handleVoiceTranscript} />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? "Saving…" : "Save Notes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientDetail = () => {
  const { clientId: rawId } = useParams<{ clientId: string }>();
  const { user, isAdmin } = useAuth();

  // Manual client routing: /admin/clients/manual:<uuid>
  const isManual = rawId?.startsWith("manual:") ?? false;
  const manualClientId = isManual ? rawId!.slice("manual:".length) : null;
  const realClientId = isManual ? null : rawId ?? null;

  const [profile, setProfile] = useState<{ full_name: string; created_at: string; email?: string; phone?: string; linked_user_id?: string | null } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [intakeResponses, setIntakeResponses] = useState<Record<string, Record<string, string>>>({});
  const [viewingIntakeId, setViewingIntakeId] = useState<string | null>(null);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rename
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [canRename, setCanRename] = useState(false);

  const fetchData = async () => {
    if (!rawId) return;

    if (isManual && manualClientId) {
      const [mcRes, sessionsRes, notesRes, todosRes, docsRes] = await Promise.all([
        supabase.from("manual_clients").select("full_name, email, phone, created_at, linked_user_id, created_by").eq("id", manualClientId).single(),
        (supabase as any).from("staff_sessions").select("*").eq("manual_client_id", manualClientId).order("session_date", { ascending: false }),
        supabase.from("client_notes").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
        supabase.from("client_todos").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
        supabase.from("client_documents").select("*").eq("manual_client_id", manualClientId).order("created_at", { ascending: false }),
      ]);
      if (mcRes.data) {
        setProfile({
          full_name: mcRes.data.full_name,
          created_at: mcRes.data.created_at,
          email: mcRes.data.email,
          phone: mcRes.data.phone,
          linked_user_id: mcRes.data.linked_user_id,
        });
        // Manual: creator or admin can rename
        setCanRename(isAdmin || mcRes.data.created_by === user?.id);
      }
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } else if (realClientId) {
      const [profileRes, sessionsRes, notesRes, todosRes, docsRes, assignRes, intakesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, created_at").eq("id", realClientId).single(),
        (supabase as any).from("staff_sessions").select("*").eq("client_id", realClientId).order("session_date", { ascending: false }),
        supabase.from("client_notes").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_todos").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_documents").select("*").eq("client_id", realClientId).order("created_at", { ascending: false }),
        supabase.from("client_assignments").select("assignee_id").eq("client_id", realClientId),
        supabase
          .from("fba_intake_assignments")
          .select("id, child_name, status, notes, submitted_at, created_at")
          .eq("client_id", realClientId)
          .order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
      if (intakesRes.data) {
        setIntakes(intakesRes.data);
        const submittedIds = intakesRes.data.filter((i) => i.status === "submitted").map((i) => i.id);
        if (submittedIds.length) {
          const { data: respRows } = await supabase
            .from("fba_intake_responses")
            .select("assignment_id, responses")
            .in("assignment_id", submittedIds);
          const map: Record<string, Record<string, string>> = {};
          (respRows ?? []).forEach((r: any) => {
            map[r.assignment_id] = (r.responses as Record<string, string>) ?? {};
          });
          setIntakeResponses(map);
        } else {
          setIntakeResponses({});
        }
      }
      const isAssigned = (assignRes.data ?? []).some((a) => a.assignee_id === user?.id);
      setCanRename(isAdmin || isAssigned);
    }
  };

  useEffect(() => { fetchData(); }, [rawId]);

  const targetCols = isManual
    ? { manual_client_id: manualClientId }
    : { client_id: realClientId };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (isManual && manualClientId) {
      const { error } = await supabase.from("manual_clients").update({ full_name: nameDraft.trim() }).eq("id", manualClientId);
      if (error) return toast.error("Failed: " + error.message);
    } else if (realClientId) {
      const { error } = await supabase.from("profiles").update({ full_name: nameDraft.trim() }).eq("id", realClientId);
      if (error) return toast.error("Failed: " + error.message);
    }
    toast.success("Name updated");
    setEditingName(false);
    fetchData();
  };

  const handleAddTodo = async () => {
    if (!newTodo.title || !user) return;
    const { error } = await supabase.from("client_todos").insert({
      ...targetCols,
      created_by: user.id,
      title: newTodo.title,
      description: newTodo.description,
    } as any);
    if (error) toast.error("Failed to add task: " + error.message);
    else {
      toast.success("Task added");
      setTodoDialogOpen(false);
      setNewTodo({ title: "", description: "" });
      fetchData();
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    const storagePath = doc.file_url.includes("/storage/v1/object/public/client-documents/")
      ? doc.file_url.split("/storage/v1/object/public/client-documents/")[1]
      : doc.file_url;
    await supabase.storage.from("client-documents").remove([storagePath]);
    await supabase.from("client_documents").delete().eq("id", doc.id);
    fetchData();
    toast.success("Document deleted");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    const folderId = isManual ? `manual_${manualClientId}` : realClientId;
    setUploading(true);
    for (const file of Array.from(files)) {
      const filePath = `${folderId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) {
        toast.error("Upload failed: " + uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
      await supabase.from("client_documents").insert({
        ...targetCols,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: user.id,
      } as any);
    }
    fetchData();
    setUploading(false);
    toast.success("Documents uploaded");
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center text-muted-foreground">Loading...</div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <Link to={isAdmin ? "/admin/clients" : "/staff/clients"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={14} /> Back to Clients
          </Link>

          <div className="flex items-center justify-between mb-8 gap-4">
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="text-2xl font-bold h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                  />
                  <Button size="icon" variant="default" onClick={handleSaveName}><Check size={16} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingName(false)}><X size={16} /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  {isManual && (
                    <Badge variant="outline" className="text-[10px]">manual</Badge>
                  )}
                  {canRename && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => { setNameDraft(profile.full_name); setEditingName(true); }}
                      title="Rename client"
                    >
                      <Pencil size={13} />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isManual ? "Added " : "Client since "}
                {format(new Date(profile.created_at), "MMMM yyyy")}
                {isManual && profile.email && <> · {profile.email}</>}
                {isManual && profile.phone && <> · {profile.phone}</>}
              </p>
              {isManual && !profile.linked_user_id && (
                <Link
                  to="/admin/manual-clients"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <UserPlus size={12} /> Pair with a registered account to grant portal access
                </Link>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge variant="secondary" className="gap-1"><Calendar size={12} /> {sessions.length} sessions</Badge>
              <Badge variant="secondary" className="gap-1"><FileText size={12} /> {notes.length} notes</Badge>
            </div>
          </div>

          <Tabs defaultValue={isManual ? "sessions" : "overview"} className="space-y-6">
            <TabsList className="rounded-full flex-wrap h-auto">
              {!isManual && <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>}
              <TabsTrigger value="sessions" className="rounded-full">Sessions</TabsTrigger>
              {!isManual && <TabsTrigger value="between" className="rounded-full">Between Sessions</TabsTrigger>}
              {!isManual && <TabsTrigger value="pathway" className="rounded-full">Pathway</TabsTrigger>}
              {!isManual && (
                <TabsTrigger value="intake" className="rounded-full gap-1">
                  <ClipboardList size={12} /> FBA Intake{intakes.length > 0 ? ` (${intakes.length})` : ""}
                </TabsTrigger>
              )}
              {isAdmin && <TabsTrigger value="financial" className="rounded-full gap-1"><PoundSterling size={12} /> Financial</TabsTrigger>}
              <TabsTrigger value="todos" className="rounded-full">To-Dos</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
            </TabsList>

            {!isManual && realClientId && (
              <TabsContent value="pathway" className="space-y-6">
                <ClientProfileHeader clientId={realClientId} audience={isAdmin ? "admin" : "staff"} fallbackName={profile.full_name} />
                <SupportPathwayBoard clientId={realClientId} pathwayKind="support" audience={isAdmin ? "admin" : "staff"} />
              </TabsContent>
            )}

            {!isManual && (
              <TabsContent value="overview" className="space-y-6">
                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-1">At a glance</h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Auto-populated from sessions, notes, intakes, to-dos and documents already on this page.
                  </p>
                  <ClientAutoOverview
                    profile={profile}
                    sessions={sessions}
                    notes={notes}
                    todos={todos}
                    documents={documents}
                    intakes={intakes}
                    intakeResponses={intakeResponses}
                  />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-1">Manual notes</h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Stage, tags, risk and a private summary — only edit what isn't already captured elsewhere.
                  </p>
                  {realClientId && <ClientOverviewPanel clientId={realClientId} />}
                </div>
              </TabsContent>
            )}

            <TabsContent value="sessions">
              <h2 className="text-lg font-semibold mb-4">Session History</h2>
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No sessions found.</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <SessionRow key={s.id} session={s} onSaved={fetchData} />
                  ))}
                </div>
              )}
            </TabsContent>

            {!isManual && realClientId && (
              <TabsContent value="between">
                <h2 className="text-lg font-semibold mb-4">Between Sessions</h2>
                <ClientBetweenSessionsPanel clientId={realClientId} />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="financial">
                <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
                <ClientFinancialTab clientId={realClientId} manualClientId={manualClientId} isManual={isManual} />
              </TabsContent>
            )}

            <TabsContent value="todos">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Client Tasks & Homework</h2>
                <Dialog open={todoDialogOpen} onOpenChange={setTodoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full gap-2"><Plus size={14} /> Assign Task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Assign Task to Client</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Task title" value={newTodo.title} onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })} />
                      <Textarea placeholder="Task description..." rows={3} value={newTodo.description} onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })} />
                      <Button onClick={handleAddTodo} className="w-full rounded-full">Assign Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {todos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No tasks assigned yet.</div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.id} className={`flex items-start gap-3 p-4 rounded-xl border ${todo.is_completed ? "bg-muted/50 border-border/20" : "bg-card border-border/50"}`}>
                      {todo.is_completed ? <CheckCircle2 size={18} className="text-primary mt-0.5" /> : <Circle size={18} className="text-muted-foreground mt-0.5" />}
                      <div>
                        <p className={`text-sm font-medium ${todo.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.title}</p>
                        {todo.description && <p className="text-xs text-muted-foreground mt-1">{todo.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Client Documents</h2>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                  <Button size="sm" className="rounded-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={14} /> {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">No documents uploaded.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={16} className="text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                        </div>
                      </a>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDocument(doc)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {!isManual && (
              <TabsContent value="intake">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Parent FBA Intake Forms</h2>
                  <Link to="/staff/fba-intakes" className="text-xs text-primary hover:underline">
                    Manage all intakes →
                  </Link>
                </div>
                {intakes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
                    No intake forms have been sent to this client yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intakes.map((intake) => {
                      const responses = intakeResponses[intake.id] ?? {};
                      const isOpen = viewingIntakeId === intake.id;
                      const completion = calcCompletion(responses);
                      return (
                        <div key={intake.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                          <div className="flex items-center justify-between p-4 gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm">{intake.child_name || "Unnamed child"}</p>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {intake.status.replace("_", " ")}
                                </Badge>
                                {intake.status === "submitted" && (
                                  <span className="text-[11px] text-muted-foreground">{completion}% complete</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Sent {format(new Date(intake.created_at), "MMM d, yyyy")}
                                {intake.submitted_at && ` · Submitted ${format(new Date(intake.submitted_at), "MMM d, yyyy")}`}
                              </p>
                            </div>
                            {intake.status === "submitted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full gap-1.5 shrink-0"
                                onClick={() => setViewingIntakeId(isOpen ? null : intake.id)}
                              >
                                <Eye size={12} /> {isOpen ? "Hide" : "View"} responses
                              </Button>
                            )}
                          </div>
                          {isOpen && intake.status === "submitted" && (
                            <div className="border-t border-border/50 p-4 space-y-4 bg-muted/20">
                              {FBA_INTAKE_SECTIONS.map((sec) => {
                                const answered = sec.questions.filter((q) => (responses[q.key] ?? "").toString().trim());
                                if (!answered.length) return null;
                                return (
                                  <div key={sec.id} className="rounded-lg border border-border bg-card p-4">
                                    <h4 className="text-sm font-semibold mb-3">{sec.title}</h4>
                                    <dl className="space-y-3">
                                      {answered.map((q) => (
                                        <div key={q.key}>
                                          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{q.label}</dt>
                                          <dd className="text-sm whitespace-pre-wrap leading-relaxed">{(responses[q.key] ?? "").toString()}</dd>
                                        </div>
                                      ))}
                                    </dl>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClientDetail;
