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
        title="About Binyan — Our Mission and Team"
        description="Meet the team behind Binyan and learn how our constructional clinical behaviour approach builds capability with individuals, families, and organisations."
        path="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Binyan",
          alternateName: "Binyan Clinical Behaviour Services",
          url: "https://bacbs.com/",
          logo: "https://bacbs.com/lovable-uploads/binyan-adam-logo.png",
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
          alt={content?.alt_text || "Binyan"}
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
      <section className="py-24 border-t border-border">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <EditableText contentKey="about.teamTitle" defaultValue={about.teamTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-4" />
            <EditableText contentKey="about.teamSubtitle" defaultValue={about.teamSubtitle} as="p" className="text-foreground/50 max-w-2xl mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(teamMembers || []).map((member, i) => {
              const credentials = member.credentials ? member.credentials.split("\n").filter(Boolean) : [];
              const hasSocial = member.social_linkedin || member.social_twitter || member.social_website;

              const cardContent = (
                <motion.div key={member.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
                  className="group text-center p-8 bg-card border border-border hover:border-primary/20 transition-colors duration-500 cursor-pointer">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-5" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-2xl font-serif text-primary group-hover:bg-primary/20 transition-colors">
                      {member.initials}
                    </div>
                  )}
                  <h3 className="text-xl font-display tracking-tight text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>

                  {credentials.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {credentials.slice(0, 3).map((c, ci) => (
                        <span key={ci} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5">
                          <Award size={10} className="text-primary shrink-0" />
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-foreground/50 leading-relaxed">{member.bio}</p>

                  {member.signature_url && (
                    <img src={member.signature_url} alt={`${member.name}'s signature`} className="h-8 object-contain mx-auto mt-4 opacity-40" />
                  )}

                  {hasSocial && (
                    <div className="flex justify-center gap-3 mt-4">
                      {member.social_linkedin && (
                        <a href={member.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Linkedin size={16} />
                        </a>
                      )}
                      {member.social_twitter && (
                        <a href={member.social_twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Twitter size={16} />
                        </a>
                      )}
                      {member.social_website && (
                        <a href={member.social_website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              );

              return (
                <Link key={member.id} to={member.slug ? `/team/${member.slug}` : "/contact"} className="no-underline">
                  {cardContent}
                </Link>
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
