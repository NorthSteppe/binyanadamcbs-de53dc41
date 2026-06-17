import Seo from "@/components/Seo";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, Heart, Building2, Users, BookOpen, Linkedin, Twitter, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePageContent } from "@/hooks/useSiteContent";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const About = () => {
  const { t } = useLanguage();
  const about = (t as any).about;
  const { data: content } = usePageContent("about");
  const { data: teamMembers } = useTeamMembers();

  const specialisations = [
    { icon: GraduationCap, label: about.specialisations[0] },
    { icon: Heart, label: about.specialisations[1] },
    { icon: Users, label: about.specialisations[2] },
    { icon: Building2, label: about.specialisations[3] },
    { icon: BookOpen, label: about.specialisations[4] },
  ];

  const values = about.values as Array<{ title: string; description: string }>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="About Blueprint — Our Mission and Team"
        description="Meet the team behind Blueprint and learn how our constructional clinical behaviour approach builds capability with individuals, families, and organisations."
        path="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Blueprint",
          alternateName: "Blueprint Applied, Constructional, Behavioural Services",
          url: "https://bacbs.com/",
          logo: "https://bacbs.com/lovable-uploads/blueprint-logo.png",
          email: "adamdayan@bacbs.com",
          address: { "@type": "PostalAddress", addressLocality: "Manchester", addressCountry: "GB" },
          areaServed: "GB",
        }}
      />
      <Header />


      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <EditableImage
          contentKey="about.hero"
          defaultSrc={(content?.image_url && content.image_url.length > 0) ? content.image_url : "/lovable-uploads/93c59eae-410f-4380-a222-312d8d41af41.jpg"}
          alt={content?.alt_text || "Blueprint"}
          className="absolute inset-0"
          imgClassName="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
        <div className="container relative z-10 pb-16 md:pb-24 pt-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
            <EditableText contentKey="about.tagline" defaultValue={about.tagline} as="p" className="label-eyebrow mb-4" />
            <EditableText contentKey="about.title" defaultValue={about.title} as="h1" className="text-5xl md:text-6xl lg:text-7xl font-display tracking-tight leading-[1.05] mb-6 text-foreground" />
            <EditableText contentKey="about.subtitle" defaultValue={about.subtitle} as="p" className="text-lg md:text-xl text-foreground/60 leading-relaxed max-w-lg" />
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <EditableText contentKey="about.missionTitle" defaultValue={about.missionTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-8" />
              <EditableText contentKey="about.missionText" defaultValue={about.missionText} as="p" className="text-lg text-foreground/60 leading-relaxed" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialisations */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <EditableText contentKey="about.specialisationsTitle" defaultValue={about.specialisationsTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-4" />
            <EditableText contentKey="about.specialisationsSubtitle" defaultValue={about.specialisationsSubtitle} as="p" className="text-foreground/50 max-w-2xl mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {specialisations.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl">
                  <item.icon size={18} className="text-primary" />
                </div>
                <EditableText contentKey={`about.spec.${i}`} defaultValue={item.label} as="span" className="text-sm text-foreground/80" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <EditableText contentKey="about.valuesTitle" defaultValue={about.valuesTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {values.map((value, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1} className="text-center">
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-4 bg-primary/10 rounded-xl">
                  <CheckCircle2 size={18} className="text-primary" />
                </div>
                <EditableText contentKey={`about.value.${i}.title`} defaultValue={value.title} as="h3" className="text-xl font-display tracking-tight text-foreground mb-2" />
                <EditableText contentKey={`about.value.${i}.desc`} defaultValue={value.description} as="p" className="text-sm text-foreground/50 leading-relaxed" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-border bg-background">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-3xl mb-16">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent">The Team</span>
            </div>
            <EditableText contentKey="about.teamTitle" defaultValue={about.teamTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-4" />
            <EditableText contentKey="about.teamSubtitle" defaultValue={about.teamSubtitle} as="p" className="text-foreground/60 max-w-2xl text-lg" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {(teamMembers || []).map((member, i) => {
              const heroImage = member.profile_image_url || member.avatar_url;
              const to = member.slug ? `/team/${member.slug}` : "/contact";

              return (
                <motion.div
                  key={member.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <Link to={to} className="group block no-underline">
                    <div className="relative overflow-hidden rounded-sm bg-primary/5 aspect-[4/5] mb-5">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={`${member.name} — ${member.role}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl font-display text-primary/40">
                          {member.initials}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 h-1 w-12 bg-accent transition-all duration-500 group-hover:w-24" />
                      <div className="absolute bottom-5 left-5 right-5 text-primary-foreground translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
                          View profile <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                        {member.role}
                      </p>
                      <h3 className="text-2xl font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-foreground/60 leading-relaxed line-clamp-3 pt-1">
                        {member.bio}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="max-w-2xl mx-auto text-center">
            <EditableText contentKey="about.ctaTitle" defaultValue={about.ctaTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-4" />
            <EditableText contentKey="about.ctaText" defaultValue={about.ctaText} as="p" className="text-muted-foreground mb-10" />
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-12 text-[14px] font-medium shadow-apple">
              <Link to="/contact" className="inline-flex items-center gap-3">
                {about.ctaButton} <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
