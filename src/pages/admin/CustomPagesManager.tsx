import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useEditMode } from "@/hooks/useEditMode";

interface CustomPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category_type: string;
  display_order: number;
  hero_image: string;
  in_nav: boolean;
  is_published: boolean;
  nav_parent: string | null;
}

const CATEGORY_TYPES = [
  { value: "service", label: "Service" },
  { value: "insight", label: "Insight" },
  { value: "nav", label: "Nav item" },
  { value: "custom", label: "Custom" },
];

const NAV_PARENTS = [
  { value: "top", label: "Top level (alongside About Us)" },
  { value: "services", label: "Under Services" },
  { value: "courses", label: "Under Courses" },
  { value: "insights", label: "Under Insights" },
  { value: "about", label: "Under About Us" },
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CustomPagesManager = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { setEditMode } = useEditMode();
  const launchLiveEdit = (path: string) => {
    setEditMode(true);
    navigate(path);
    toast.success("Live editor enabled — click any text or image to edit");
  };
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [type, setType] = useState("custom");
  const [navParent, setNavParent] = useState("top");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["custom-pages-admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("custom_pages")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as CustomPage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const finalSlug = slug || slugify(title);
      if (!title || !finalSlug) throw new Error("Title is required");
      const nextOrder = (pages[pages.length - 1]?.display_order ?? 0) + 10;
      const { error } = await (supabase as any).from("custom_pages").insert({
        title, slug: finalSlug, subtitle, category_type: type,
        display_order: nextOrder, in_nav: type === "nav", is_published: true,
        nav_parent: navParent === "top" ? null : navParent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle(""); setSlug(""); setSubtitle(""); setType("custom"); setNavParent("top");
      qc.invalidateQueries({ queryKey: ["custom-pages-admin"] });
      qc.invalidateQueries({ queryKey: ["custom-pages-nav"] });
      toast.success("Page created — click 'View' to edit its content");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CustomPage> & { id: string }) => {
      const { error } = await (supabase as any).from("custom_pages").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-pages-admin"] });
      qc.invalidateQueries({ queryKey: ["custom-pages-nav"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("custom_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-pages-admin"] });
      qc.invalidateQueries({ queryKey: ["custom-pages-nav"] });
      toast.success("Page deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = async (index: number, direction: -1 | 1) => {
    const other = index + direction;
    if (other < 0 || other >= pages.length) return;
    const a = pages[index]; const b = pages[other];
    await updateMutation.mutateAsync({ id: a.id, display_order: b.display_order });
    await updateMutation.mutateAsync({ id: b.id, display_order: a.display_order });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-foreground mb-1">Pages & Categories</h1>
          <p className="text-muted-foreground">
            Add new pages/categories, reorder them, toggle nav visibility, and publish. Each page gets its own URL at <code className="text-xs">/p/&lt;slug&gt;</code> with a blank editable template.
          </p>
        </div>

        {/* Create form */}
        <div className="mb-10 p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Add a new page</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Youth Mentoring" />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder={title ? slugify(title) : "auto-from-title"}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Short description</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="One-line summary shown under the title" />
            </div>
            <div>
              <Label>Category type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nav location</Label>
              <Select value={navParent} onValueChange={setNavParent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NAV_PARENTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">Where the link appears in the top nav bar (only if "In nav" is on).</p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create page"}
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        <div className="space-y-3">
          {pages.map((p, i) => (
            <div key={p.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp size={14} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === pages.length - 1}>
                  <ArrowDown size={14} />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{p.title}</p>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {p.category_type}
                  </span>
                  {!p.is_published && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">draft</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">/p/{p.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={p.in_nav}
                    onCheckedChange={(v) => updateMutation.mutate({ id: p.id, in_nav: v })}
                  />
                  In nav
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={p.is_published}
                    onCheckedChange={(v) => updateMutation.mutate({ id: p.id, is_published: v })}
                  />
                  Published
                </label>
                <div className="min-w-[180px]">
                  <Select
                    value={p.nav_parent ?? "top"}
                    onValueChange={(v) =>
                      updateMutation.mutate({ id: p.id, nav_parent: v === "top" ? null : v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NAV_PARENTS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="gap-1" onClick={() => launchLiveEdit(`/p/${p.slug}`)}>
                  <Wand2 size={13} /> Live edit
                </Button>
                <Button size="sm" variant="outline" asChild className="gap-1">
                  <Link to={`/p/${p.slug}`}><ExternalLink size={13} /> View</Link>
                </Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id); }}
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && pages.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No custom pages yet. Add one above.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomPagesManager;
