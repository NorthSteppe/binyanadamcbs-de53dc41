import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import Seo from "@/components/Seo";

const CustomPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["custom-page", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("custom_pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string;
        slug: string;
        title: string;
        subtitle: string;
        category_type: string;
        hero_image: string;
        is_published: boolean;
      } | null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page || !page.is_published) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="container flex-1 flex flex-col items-center justify-center text-center py-24">
          <h1 className="text-3xl font-semibold text-foreground mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-6">This page doesn't exist or hasn't been published yet.</p>
          <Link to="/" className="text-primary underline">Back to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const k = (s: string) => `custom.${page.slug}.${s}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title={page.title} description={page.subtitle} path={`/p/${page.slug}`} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="container pt-24 pb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest text-muted-foreground mb-3">
                {page.category_type}
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
                <EditableText contentKey={k("title")} defaultValue={page.title} as="span" />
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                <EditableText contentKey={k("subtitle")} defaultValue={page.subtitle || "Add a short description here."} as="span" />
              </p>
            </div>
            <div>
              <EditableImage
                contentKey={k("hero")}
                defaultSrc={page.hero_image || "/placeholder.svg"}
                alt={page.title}
                className="rounded-2xl overflow-hidden"
                imgClassName="w-full h-72 md:h-96 object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Body sections */}
        <section className="container pb-24 space-y-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                <EditableText
                  contentKey={k(`section${i}.heading`)}
                  defaultValue={`Section ${i} heading`}
                  as="span"
                />
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                <EditableText
                  contentKey={k(`section${i}.body`)}
                  defaultValue="Click to edit this content. Use the pencil to change the text and the sliders to change the font, size, colour, and alignment."
                  as="span"
                />
              </p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CustomPage;
