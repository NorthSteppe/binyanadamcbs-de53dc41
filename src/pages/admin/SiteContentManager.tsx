import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSiteContent, useUpdateSiteContent, SiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/hooks/useEditMode";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Save, Wand2, ExternalLink, LayoutGrid, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PUBLIC_PAGES: { label: string; path: string }[] = [
  { label: "Landing", path: "/" },
  { label: "About", path: "/about" },
  { label: "Therapy", path: "/therapy" },
  { label: "Education", path: "/education" },
  { label: "Families", path: "/families" },
  { label: "Organisations", path: "/organisations" },
  { label: "Supervision", path: "/supervision" },
];

const PAGE_LABELS: Record<string, string> = {
  about: "About Page",
  therapy: "Therapy",
  education: "Education",
  families: "Families",
  organisations: "Organisations",
  supervision: "Supervision",
};

const SiteContentRow = ({ item }: { item: SiteContent }) => {
  const update = useUpdateSiteContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localQuote, setLocalQuote] = useState(item.quote_text);
  const [localAuthor, setLocalAuthor] = useState(item.quote_author);
  const [localAlt, setLocalAlt] = useState(item.alt_text);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `site-content/${item.page_key}-${item.section_key}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
      update.mutate({ id: item.id, image_url: urlData.publicUrl });
      toast.success("Image updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveText = () => {
    update.mutate({
      id: item.id,
      quote_text: localQuote,
      quote_author: localAuthor,
      alt_text: localAlt,
    });
    toast.success("Saved");
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-5 rounded-xl border border-border bg-card">
      <div className="shrink-0 w-full md:w-40">
        {item.image_url ? (
          <img src={item.image_url} alt={item.alt_text} className="w-full h-28 object-cover rounded-lg" />
        ) : (
          <div className="w-full h-28 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full gap-1"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} /> {uploading ? "Uploading…" : "Change Image"}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="flex-1 min-w-0 space-y-2 w-full">
        <p className="text-sm font-semibold text-foreground">
          {PAGE_LABELS[item.page_key] || item.page_key} — {item.section_key}
        </p>
        <Input
          value={localAlt}
          placeholder="Alt text / description"
          onChange={(e) => setLocalAlt(e.target.value)}
        />
        <Input
          value={localQuote}
          placeholder="Quote text (optional)"
          onChange={(e) => setLocalQuote(e.target.value)}
        />
        <Input
          value={localAuthor}
          placeholder="Quote author (optional)"
          onChange={(e) => setLocalAuthor(e.target.value)}
        />
        <Button size="sm" className="gap-1" onClick={saveText}>
          <Save size={14} /> Save
        </Button>
      </div>
    </div>
  );
};

const SiteContentManager = () => {
  const { data: items, isLoading } = useSiteContent();
  const { setEditMode } = useEditMode();
  const navigate = useNavigate();
  const [customUrl, setCustomUrl] = useState("");

  const launchEditor = (path: string) => {
    setEditMode(true);
    navigate(path);
    toast.success("Live editor enabled — click any text or image to style it");
  };

  const launchCustom = () => {
    let path = customUrl.trim();
    if (!path) return;
    if (!path.startsWith("/")) path = "/" + path;
    launchEditor(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container py-24 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-foreground mb-1">Site Content Manager</h1>
          <p className="text-muted-foreground">Edit images, quotes, and visual styling across the website.</p>
        </div>

        {/* Pages & categories */}
        <div className="mb-10 p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LayoutGrid className="text-primary" size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Pages & Categories</h2>
              <p className="text-sm text-muted-foreground">
                Add new pages (services, insights, nav items, or custom), reorder them, and toggle nav visibility. Each new page comes with a blank editable template.
              </p>
            </div>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/admin/pages"><ExternalLink size={13} /> Manage pages</Link>
            </Button>
          </div>
        </div>



        {/* Live editor launcher */}
        <div className="mb-10 p-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Wand2 className="text-primary" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">PowerPoint-style Live Editor</h2>
              <p className="text-sm text-muted-foreground">
                Open any public page in edit mode. Hover any heading, paragraph, or image to change font, size, weight, color, alignment, width, position, rotation, opacity — or replace/remove images entirely. Changes save automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_PAGES.map((p) => (
              <Button
                key={p.path}
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => launchEditor(p.path)}
              >
                <ExternalLink size={13} /> Edit {p.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        <div className="grid gap-4">
          {items?.map((item) => (
            <SiteContentRow key={item.id} item={item} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SiteContentManager;
