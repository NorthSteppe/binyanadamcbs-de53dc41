import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ArticleSidebar from "@/components/blog/ArticleSidebar";
import NewsletterSignup from "@/components/blog/NewsletterSignup";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_authors(name, slug, role, bio, avatar_url), blog_categories(name, slug)")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      return data;
    },
    enabled: !!slug,
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-post-tags", post?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_post_tags")
        .select("*, blog_tags(name, slug)")
        .eq("post_id", post!.id);
      return data || [];
    },
    enabled: !!post?.id,
  });

  // Increment view count
  useEffect(() => {
    if (!post?.id) return;
    // View count increment is best-effort
    supabase.from("blog_posts").update({ view_count: (post.view_count || 0) + 1 }).eq("id", post.id).then(() => {});
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
          <Link to="/insights" className="text-primary hover:underline">← Back to Insights</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const author = post.blog_authors as any;
  const category = post.blog_categories as any;

  const rawDesc = (post.abstract || "").replace(/\s+/g, " ").trim();
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}…` : (rawDesc || `${post.title} — Binyan Insights`);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: rawDesc || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    image: post.cover_image_url || undefined,
    author: author ? { "@type": "Person", name: author.name } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Binyan",
      logo: { "@type": "ImageObject", url: "https://bacbs.com/lovable-uploads/binyan-adam-logo.png" },
    },
    mainEntityOfPage: `https://bacbs.com/insights/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${post.title} — Binyan Insights`.slice(0, 60)}
        description={description}
        path={`/insights/${post.slug}`}
        type="article"
        jsonLd={articleJsonLd}
      />
      <Header />

      {/* Breadcrumb */}
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/insights" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Insights
          </Link>
        </div>
      </div>

      {/* Hero */}
      <article className="px-4 pb-20">
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-6">
            {category && (
              <Link to={`/insights/category/${category.slug}`}>
                <Badge variant="secondary">{category.name}</Badge>
              </Link>
            )}
            {post.audience !== "general" && (
              <Badge variant="outline" className="capitalize">{post.audience}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{post.abstract}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
            {author && (
              <Link to={`/insights/authors/${author.slug}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={author.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <span className="font-medium text-foreground">{author.name}</span>
                  {author.role && <span className="block text-xs">{author.role}</span>}
                </div>
              </Link>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), "d MMMM yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.reading_time_minutes} min read
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="max-w-5xl mx-auto mb-12">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded-2xl object-cover max-h-[500px]"
              loading="lazy"
            />
          </div>
        )}

        {/* Content + Sidebar */}
        <div className="max-w-6xl mx-auto flex gap-12">
          <div className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {tags.map((t: any) => (
                    <Link key={t.id} to={`/insights/tag/${t.blog_tags?.slug}`}>
                      <Badge variant="outline" className="text-xs">{t.blog_tags?.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author bio */}
            {author && (
              <div className="mt-12 p-6 rounded-xl bg-card border border-border">
                <div className="flex items-start gap-4">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <Link to={`/insights/authors/${author.slug}`} className="font-semibold text-foreground hover:underline">
                      {author.name}
                    </Link>
                    {author.role && <p className="text-sm text-muted-foreground">{author.role}</p>}
                    {author.bio && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{author.bio}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="mt-12">
              <NewsletterSignup />
            </div>
          </div>

          {/* Sidebar - hidden on mobile */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <ArticleSidebar currentPostId={post.id} categoryId={post.category_id || undefined} />
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ArticlePage;
