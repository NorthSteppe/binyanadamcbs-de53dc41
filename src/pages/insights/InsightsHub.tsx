import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/blog/ArticleCard";
import NewsletterSignup from "@/components/blog/NewsletterSignup";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const InsightsHub = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: posts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name, slug), blog_categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_categories").select("*").order("display_order");
      return data || [];
    },
  });

  const filtered = (posts || []).filter((p: any) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false;
    if (selectedAudience !== "all" && p.audience !== selectedAudience) return false;
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === "most_read") return (b.view_count || 0) - (a.view_count || 0);
    if (sortBy === "practical") return (b.is_practical_priority ? 1 : 0) - (a.is_practical_priority ? 1 : 0);
    return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
  });

  const featured = (posts || []).find((p: any) => p.is_featured);
  const latestPosts = filtered.slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Insights — Clinical Articles by Binyan Adam"
        description="Practitioner notes, case reflections, and clinical articles on constructional behaviour analysis, therapy, supervision, and family practice."
        path="/insights"
      />
      <Header />


      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm text-muted-foreground mb-6">
            <BookOpen className="h-4 w-4" />
            <span>Insights</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            Behaviour is shaped.<br />
            <span className="text-muted-foreground">It can be rebuilt.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practical behavioural science for real-world systems — in schools, families, clinics, and organisations.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <ArticleCard
              variant="featured"
              title={featured.title}
              slug={featured.slug}
              abstract={featured.abstract}
              coverImageUrl={featured.cover_image_url}
              authorName={(featured as any).blog_authors?.name}
              categoryName={(featured as any).blog_categories?.name}
              categorySlug={(featured as any).blog_categories?.slug}
              publishedAt={featured.published_at}
              readingTimeMinutes={featured.reading_time_minutes}
              isFeatured
              isPracticalPriority={featured.is_practical_priority}
            />
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories || []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="school">Schools</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="professional">Professionals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="most_read">Most Read</SelectItem>
                <SelectItem value="practical">Most Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant={selectedCategory === "all" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {(categories || []).map((c: any) => (
              <Badge
                key={c.id}
                variant={selectedCategory === c.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {latestPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post: any) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  abstract={post.abstract}
                  coverImageUrl={post.cover_image_url}
                  authorName={post.blog_authors?.name}
                  categoryName={post.blog_categories?.name}
                  categorySlug={post.blog_categories?.slug}
                  publishedAt={post.published_at}
                  readingTimeMinutes={post.reading_time_minutes}
                  audience={post.audience}
                  isPracticalPriority={post.is_practical_priority}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InsightsHub;
