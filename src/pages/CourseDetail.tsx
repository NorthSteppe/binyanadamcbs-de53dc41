import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  GraduationCap, Play, Lock, Check, FileText, Clock, ArrowLeft, Download, ChevronDown, ChevronUp,
} from "lucide-react";

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["course-lessons", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", course!.id)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const { data: purchased } = useQuery({
    queryKey: ["course-purchased", course?.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("course_purchases")
        .select("id")
        .eq("course_id", course!.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!course?.id,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["course-resources", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_resources")
        .select("*")
        .eq("course_id", course!.id)
        .order("created_at");
      if (error) return [];
      return data;
    },
    enabled: !!course?.id && !!purchased,
  });

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in to purchase this course");
      return;
    }
    if (course?.price_cents === 0) {
      // Free course — insert purchase directly
      const { error } = await supabase.from("course_purchases").insert({
        user_id: user.id,
        course_id: course.id,
      });
      if (error) {
        if (error.code === "23505") toast.info("You already have access to this course");
        else toast.error(error.message);
      } else {
        toast.success("Course unlocked!");
        window.location.reload();
      }
      return;
    }

    // Paid course — grant access immediately and raise a Xero invoice
    setPurchasing(true);
    try {
      const { data: inserted, error } = await supabase
        .from("course_purchases")
        .insert({ user_id: user.id, course_id: course!.id })
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") {
          toast.info("You already have access to this course");
          return;
        }
        throw error;
      }
      // Fire-and-forget Xero invoice
      supabase.functions
        .invoke("xero-invoice-booking", { body: { course_purchase_id: inserted!.id } })
        .catch((e) => console.warn("Xero invoice failed", e));
      toast.success("Course unlocked! An invoice will be emailed to you shortly.");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to unlock course");
    } finally {
      setPurchasing(false);
    }
  };

  const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const isFree = course?.price_cents === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center text-muted-foreground">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-serif text-foreground mb-4">Course not found</h1>
          <Link to="/courses" className="text-primary underline">Browse all courses</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <Link to="/courses" className="text-muted-foreground text-sm flex items-center gap-1 mb-6 hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> All Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {course.thumbnail_url && (
                  <div className="rounded-lg overflow-hidden mb-6">
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-64 object-cover" />
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{course.title}</h1>
                <p className="text-muted-foreground font-light mb-6">{course.description}</p>
                {course.long_description && (
                  <div className="prose prose-invert max-w-none mb-8">
                    <p className="text-foreground/80 font-light leading-relaxed whitespace-pre-line">{course.long_description}</p>
                  </div>
                )}
              </motion.div>

              {/* Lessons list */}
              <h2 className="text-xl font-serif text-foreground mb-4">
                Course Content
                <span className="text-sm font-light text-muted-foreground ml-3">
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  {totalMinutes > 0 && ` · ${totalMinutes} min`}
                </span>
              </h2>

              <div className="space-y-2 mb-8">
                {lessons.map((lesson, i) => {
                  const canAccess = purchased || lesson.is_preview;
                  const isExpanded = expandedLesson === lesson.id;

                  return (
                    <Card key={lesson.id} className={`transition-all ${canAccess ? "hover:border-primary/30" : "opacity-80"}`}>
                      <CardContent className="p-0">
                        <button
                          className="w-full p-4 flex items-center gap-4 text-left"
                          onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            canAccess ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {canAccess ? <Play size={14} /> : <Lock size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground">{i + 1}. {lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration_minutes > 0 ? `${lesson.duration_minutes} min` : ""}
                              {lesson.is_preview && !purchased && " · Free Preview"}
                            </p>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-border/50 pt-3">
                            {lesson.description && <p className="text-sm text-muted-foreground font-light mb-3">{lesson.description}</p>}
                            {canAccess && lesson.video_url ? (
                              <video
                                src={lesson.video_url}
                                controls
                                controlsList="nodownload"
                                className="w-full rounded-lg bg-background"
                                style={{ maxHeight: "400px" }}
                              />
                            ) : !canAccess ? (
                              <p className="text-sm text-muted-foreground italic">Purchase this course to unlock this lesson.</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No video uploaded for this lesson yet.</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Resources (only for purchasers) */}
              {purchased && resources.length > 0 && (
                <div>
                  <h2 className="text-xl font-serif text-foreground mb-4">Resources</h2>
                  <div className="space-y-2">
                    {resources.map((r) => (
                      <Card key={r.id}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <FileText size={16} className="text-primary" />
                          <span className="flex-1 text-sm text-card-foreground">{r.title}</span>
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Download size={14} /> Download
                            </Button>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-serif text-foreground mb-4">
                      {isFree ? "Free" : `£${(course.price_cents / 100).toFixed(2)}`}
                    </div>

                    {purchased ? (
                      <div className="flex items-center gap-2 text-primary mb-4">
                        <Check size={18} />
                        <span className="font-medium">You own this course</span>
                      </div>
                    ) : (
                      <Button onClick={handlePurchase} disabled={purchasing} className="w-full mb-4" size="lg">
                        {purchasing ? "Processing…" : isFree ? "Enrol for Free" : "Purchase Course"}
                      </Button>
                    )}

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} />
                        <span>{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
                      </div>
                      {totalMinutes > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{totalMinutes} minutes of content</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Check size={14} />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CourseDetail;
