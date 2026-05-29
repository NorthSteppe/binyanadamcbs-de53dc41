import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Paperclip, Upload, FileText, FolderOpen } from "lucide-react";

interface ClientOpt { id: string; name: string }
interface DraftRow { id: string; file_name: string; file_url: string; created_at: string }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportHtml: string;
  reportData: unknown;
  clientNameHint?: string;
  onClearDraft: () => void;
  onLoadDraft: (data: unknown) => void;
}

const FBAAttachDialog = ({ open, onOpenChange, reportHtml, reportData, clientNameHint, onClearDraft, onLoadDraft }: Props) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"attach" | "load">("attach");
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [clientId, setClientId] = useState("");
  const [clearAfter, setClearAfter] = useState(true);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase.from("profiles").select("id, full_name").order("full_name").then(({ data }) => {
      if (data) setClients(data.map((c: any) => ({ id: c.id, name: c.full_name || "Unnamed" })));
    });
  }, [open]);

  useEffect(() => {
    if (mode !== "load" || !clientId) { setDrafts([]); return; }
    setLoadingDrafts(true);
    supabase.from("client_documents")
      .select("id, file_name, file_url, created_at")
      .eq("client_id", clientId)
      .eq("file_type", "fba-draft-json")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDrafts((data as DraftRow[]) || []);
        setLoadingDrafts(false);
      });
  }, [mode, clientId]);

  const handleAttach = async () => {
    if (!clientId || !user) { toast.error("Pick a client first"); return; }
    setBusy(true);
    try {
      const ts = Date.now();
      const base = `FBA-${(clientNameHint || "report").replace(/[^a-zA-Z0-9_-]+/g, "_")}-${ts}`;
      const htmlPath = `${clientId}/fba-reports/${base}.html`;
      const jsonPath = `${clientId}/fba-reports/${base}.fba.json`;
      const htmlBlob = new Blob([reportHtml], { type: "text/html" });
      const jsonBlob = new Blob([JSON.stringify(reportData)], { type: "application/json" });
      const bucket = supabase.storage.from("client-documents");
      const [h, j] = await Promise.all([
        bucket.upload(htmlPath, htmlBlob, { contentType: "text/html", upsert: false }),
        bucket.upload(jsonPath, jsonBlob, { contentType: "application/json", upsert: false }),
      ]);
      if (h.error) throw h.error;
      if (j.error) throw j.error;
      const { error: insErr } = await supabase.from("client_documents").insert([
        { client_id: clientId, uploaded_by: user.id, file_name: `${base}.html`, file_url: htmlPath, file_type: "fba-report-html", notes: "FBA report (printable)" },
        { client_id: clientId, uploaded_by: user.id, file_name: `${base}.fba.json`, file_url: jsonPath, file_type: "fba-draft-json", notes: "FBA editable draft — re-uploadable into the tool" },
      ]);
      if (insErr) throw insErr;
      toast.success("Report attached to client documents");
      if (clearAfter) { onClearDraft(); }
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Attach failed: " + (e.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = async (row: DraftRow) => {
    setBusy(true);
    try {
      // file_url for drafts is the storage path
      const path = row.file_url.startsWith("http")
        ? row.file_url.split("/client-documents/")[1]
        : row.file_url;
      const { data, error } = await supabase.storage.from("client-documents").download(path);
      if (error) throw error;
      const text = await data.text();
      const parsed = JSON.parse(text);
      onLoadDraft(parsed);
      toast.success("Draft loaded into the tool — edit and re-attach when ready");
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Load failed: " + (e.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Paperclip size={16} /> Client documents</DialogTitle>
          <DialogDescription>Attach the finished report to a client, or re-open a saved draft to modify.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button size="sm" variant={mode === "attach" ? "default" : "outline"} onClick={() => setMode("attach")} className="gap-1.5">
            <Upload size={13} /> Attach to client
          </Button>
          <Button size="sm" variant={mode === "load" ? "default" : "outline"} onClick={() => setMode("load")} className="gap-1.5">
            <FolderOpen size={13} /> Re-open saved draft
          </Button>
        </div>

        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {mode === "attach" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={clearAfter} onCheckedChange={(v) => setClearAfter(!!v)} />
              Clear the working draft after attaching
            </label>
          )}

          {mode === "load" && clientId && (
            <div className="border rounded-lg max-h-64 overflow-auto">
              {loadingDrafts ? (
                <div className="p-4 text-center text-xs text-muted-foreground"><Loader2 className="inline animate-spin" size={14} /> Loading…</div>
              ) : drafts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No saved drafts for this client yet.</div>
              ) : (
                <ul className="divide-y">
                  {drafts.map((d) => (
                    <li key={d.id} className="flex items-center justify-between p-2.5 gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate flex items-center gap-1.5"><FileText size={12} /> {d.file_name}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString("en-GB")}</div>
                      </div>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => handleLoad(d)}>Load</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          {mode === "attach" && (
            <Button onClick={handleAttach} disabled={busy || !clientId} className="gap-1.5">
              {busy ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} Attach to client
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FBAAttachDialog;
