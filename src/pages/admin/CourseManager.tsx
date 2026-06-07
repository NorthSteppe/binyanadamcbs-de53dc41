import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GraduationCap, ArrowLeft, Eye, EyeOff, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  thumbnail_url: string | null;
  price_cents: number;
  is_subscription_included: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const emptyCourse = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  thumbnail_url: "",
  price_cents: 0,
  is_subscription_included: false,
  is_active: false,
  is_featured: false,
  display_order: 0,
};

const CourseManager = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Course[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      let thumbnailUrl = values.thumbnail_url;

      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const path = `thumbnails/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("course-content")
          .upload(path, thumbnailFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("course-content").getPublicUrl(path);
        thumbnailUrl = urlData.publicUrl;
      }

      const payload = {
        title: values.title,
        slug: values.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: values.description,
        long_description: values.long_description,
        thumbnail_url: thumbnailUrl || null,
        price_cents: values.price_cents,
        is_subscription_included: values.is_subscription_included,
        is_active: values.is_active,
        is_featured: values.is_featured,
        display_order: values.display_order,
      };

      if (editing) {
        const { error } = await supabase.from("courses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success(editing ? "Course updated" : "Course created");
      setOpen(false);
      setEditing(null);
      setForm(emptyCourse);
      setThumbnailFile(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      long_description: course.long_description,
      thumbnail_url: course.thumbnail_url || "",
      price_cents: course.price_cents,
      
      is_subscription_included: course.is_subscription_included,
      is_active: course.is_active,
      is_featured: course.is_featured,
      display_order: course.display_order,
    });
    setThumbnailFile(null);
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyCourse);
    setThumbnailFile(null);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <Link to="/admin" className="text-muted-foreground text-sm flex items-center gap-1 mb-6 hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back to Admin
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-foreground">Course Manager</h1>
                <p className="text-muted-foreground text-sm font-light">Create and manage your online courses</p>
              </div>
            </div>
            <Button onClick={openNew} className="gap-2">
              <Plus size={16} /> New Course
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading courses…</div>
          ) : courses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap size={40} className="mx-auto mb-4 opacity-40" />
                <p>No courses yet. Create your first course to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {courses.map((course, i) => (
                <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-primary/30 transition-all">
                    <CardContent className="p-5 flex items-center gap-4">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-20 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                          <GraduationCap size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground truncate">{course.title}</p>
                          {course.is_featured && <Star size={14} className="text-primary fill-primary" />}
                          {course.is_active ? (
                            <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Draft</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{course.description}</p>
                        <p className="text-xs text-primary mt-1">
                          {course.price_cents === 0 ? "Free" : `£${(course.price_cents / 100).toFixed(2)}`}
                          {course.is_subscription_included && " · Included in subscription"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/courses/${course.id}/lessons`}>Lessons</Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                          if (confirm("Delete this course and all its lessons?")) deleteMutation.mutate(course.id);
                        }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Create / Edit Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(form);
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Slug (URL-friendly)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
                </div>
                <div>
                  <Label>Short Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Full Description</Label>
                  <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={4} />
                </div>
                <div>
                  <Label>Thumbnail Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                  {form.thumbnail_url && !thumbnailFile && (
                    <img src={form.thumbnail_url} alt="Current thumbnail" className="mt-2 h-20 rounded object-cover" />
                  )}
                </div>
                <div>
                  <Label>Price (pence)</Label>
                  <Input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: parseInt(e.target.value) || 0 })} />
                  <p className="text-xs text-muted-foreground mt-1">Set above zero to bill via Xero invoice on enrolment.</p>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Active (visible)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_subscription_included} onCheckedChange={(v) => setForm({ ...form, is_subscription_included: v })} />
                    <Label>Subscription</Label>
                  </div>
                </div>
                <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? "Saving…" : editing ? "Update Course" : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CourseManager;
