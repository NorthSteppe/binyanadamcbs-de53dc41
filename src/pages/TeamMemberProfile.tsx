import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Linkedin, Globe, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";

const TeamMemberProfile = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ["team-member", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!member) return <NotFound />;

  const credentials = member.credentials
    ? member.credentials.split("\n").map((c: string) => c.trim()).filter(Boolean)
    : [];
  const heroImage = member.profile_image_url || member.avatar_url;
  const longBio = member.long_bio || member.bio;
  const paragraphs = longBio.split("\n\n").map((p: string) => p.trim()).filter(Boolean);
  const firstName = member.name.split(" ")[0];

  const hasSocial = member.social_linkedin || member.social_twitter || member.social_website;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero — split editorial */}
      <section className="pt-[calc(var(--header-height,72px)+2rem)] pb-20 md:pb-28 bg-background">
        <div className="container">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/60 hover:text-accent transition-colors mb-10"
          >
            <ArrowLeft size={14} /> Back to the team
          </Link>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <div className="absolute -top-3 -left-3 h-1 w-24 bg-accent z-10" />
                <div className="absolute -bottom-3 -right-3 h-24 w-1 bg-accent z-10" />
                <div className="relative overflow-hidden bg-primary/5 aspect-[4/5] rounded-sm">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={`${member.name} — ${member.role}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-7xl font-display text-primary/40">
                      {member.initials}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-7 lg:pt-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-10 bg-accent" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  {member.role}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display tracking-tight text-foreground leading-[1.02] mb-8">
                {member.name}
              </h1>

              <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-2xl mb-10">
                {member.bio}
              </p>

              {hasSocial && (
                <div className="flex items-center gap-5 mb-10">
                  {member.social_linkedin && (
                    <a href={member.social_linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-foreground/50 hover:text-accent transition-colors">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {member.social_twitter && (
                    <a href={member.social_twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-foreground/50 hover:text-accent transition-colors">
                      <Twitter size={20} />
                    </a>
                  )}
                  {member.social_website && (
                    <a href={member.social_website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-foreground/50 hover:text-accent transition-colors">
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              )}

              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 h-11">
                <Link to="/contact" className="inline-flex items-center gap-2">
                  Work with {firstName} <ArrowRight size={16} />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Body — bio + credentials sidebar */}
      {(paragraphs.length > 0 || credentials.length > 0) && (
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
              {/* Bio */}
              {paragraphs.length > 0 && (
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="h-px w-10 bg-accent" />
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                      About {firstName}
                    </span>
                  </div>
                  <div className="space-y-6 text-lg leading-relaxed text-primary-foreground/85 font-light max-w-2xl">
                    {paragraphs.map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {member.signature_url && (
                    <div className="mt-10 pt-8 border-t border-primary-foreground/10">
                      <img
                        src={member.signature_url}
                        alt={`${member.name} signature`}
                        className="h-14 object-contain opacity-80 [filter:invert(1)_brightness(1.2)]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Credentials */}
              {credentials.length > 0 && (
                <aside className="lg:col-span-4">
                  <div className="lg:sticky lg:top-28 bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-8 rounded-sm">
                    <div className="flex items-center gap-2 mb-6 text-accent">
                      <Award size={16} />
                      <span className="text-xs font-medium uppercase tracking-[0.18em]">
                        Credentials
                      </span>
                    </div>
                    <ul className="space-y-4">
                      {credentials.map((cred: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-primary-foreground/90 leading-relaxed">
                          <span className="text-accent shrink-0 mt-1">—</span>
                          <span>{cred}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 border-t border-border bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Next step</span>
              <span className="h-px w-10 bg-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-5">
              Start a conversation with {firstName}
            </h2>
            <p className="text-lg text-foreground/60 mb-10">
              Reach out to see whether {firstName}'s approach is the right fit for what you're navigating.
            </p>
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-12">
              <Link to="/contact" className="inline-flex items-center gap-3">
                Book a consultation <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TeamMemberProfile;
