import Seo from "@/components/Seo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  price_cents: number;
  is_featured: boolean;
  is_subscription_included: boolean;
}

const Courses = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug, description, thumbnail_url, price_cents, is_featured, is_subscription_included")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Course[];
    },
  });

  const featured = courses.filter((c) => c.is_featured);
  const regular = courses.filter((c) => !c.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Courses — Blueprint Continuing Education"
        description="Online courses and continuing-education programmes from Blueprint, covering constructional behaviour analysis, supervision, and applied clinical practice."
        path="/courses"
      />
      <Header />

      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-primary text-sm font-light tracking-[0.2em] uppercase mb-3">Learn</p>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Online Courses</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Practical, evidence-based courses designed to build understanding and capability.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
              <p>Courses are coming soon. Check back later!</p>
            </div>
          ) : (
            <>
              {/* Featured courses */}
              {featured.length > 0 && (
                <div className="mb-12">
                  {featured.map((course, i) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Link to={`/courses/${course.slug}`}>
                        <Card className="overflow-hidden hover:border-primary/30 transition-all group mb-4">
                          <CardContent className="p-0 flex flex-col md:flex-row">
                            {course.thumbnail_url ? (
                              <div className="md:w-2/5 h-48 md:h-auto overflow-hidden">
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            ) : (
                              <div className="md:w-2/5 h-48 md:h-auto bg-muted flex items-center justify-center">
                                <GraduationCap size={48} className="text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="flex-1 p-8 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-3">
                                <Star size={14} className="text-primary fill-primary" />
                                <span className="text-[11px] uppercase tracking-[0.15em] text-primary font-light">Featured</span>
                              </div>
                              <h2 className="text-2xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors">{course.title}</h2>
                              <p className="text-muted-foreground font-light mb-4">{course.description}</p>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-medium text-primary">
                                  {course.price_cents === 0 ? "Free" : `£${(course.price_cents / 100).toFixed(2)}`}
                                </span>
                                <Button variant="outline" size="sm">View Course</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Regular courses grid */}
              {regular.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map((course, i) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Link to={`/courses/${course.slug}`}>
                        <Card className="overflow-hidden hover:border-primary/30 transition-all group h-full flex flex-col">
                          {course.thumbnail_url ? (
                            <div className="h-44 overflow-hidden">
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          ) : (
                            <div className="h-44 bg-muted flex items-center justify-center">
                              <GraduationCap size={32} className="text-muted-foreground/30" />
                            </div>
                          )}
                          <CardContent className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                            <p className="text-sm text-muted-foreground font-light mb-4 flex-1">{course.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-primary font-medium">
                                {course.price_cents === 0 ? "Free" : `£${(course.price_cents / 100).toFixed(2)}`}
                              </span>
                              {course.is_subscription_included && (
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Incl. in subscription</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Courses;
