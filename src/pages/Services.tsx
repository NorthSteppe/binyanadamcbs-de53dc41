import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Leaf, UsersRound, Landmark, Compass, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/editable/EditableText";

const Services = () => {
  const { t } = useLanguage();

  const cards = [
    { title: t.services.cards.education.title, desc: t.services.cards.education.description, icon: BookOpen, path: "/education", key: "education" },
    { title: t.services.cards.therapy.title, desc: t.services.cards.therapy.description, icon: Leaf, path: "/therapy", key: "therapy" },
    { title: t.services.cards.family.title, desc: t.services.cards.family.description, icon: UsersRound, path: "/families", key: "family" },
    { title: t.services.cards.organisations.title, desc: t.services.cards.organisations.description, icon: Landmark, path: "/organisations", key: "organisations" },
    { title: t.services.cards.supervision.title, desc: t.services.cards.supervision.description, icon: Compass, path: "/supervision", key: "supervision" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Services — Binyan Adam Clinical Behaviour"
        description="Explore Binyan Adam's clinical behaviour services: therapy, family coaching, school consultation, organisational training, and clinical supervision."
        path="/services"
      />
      <Header />


      {/* Hero */}
      <section className="pt-40 pb-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <EditableText contentKey="services.tagline" defaultValue={t.services.tagline} as="p" className="label-eyebrow mb-4" />
            <EditableText contentKey="services.title" defaultValue={t.services.title} as="h1" className="text-5xl md:text-6xl lg:text-7xl font-display leading-[1.05] mb-6 tracking-tight" />
            <EditableText contentKey="services.subtitle" defaultValue={t.services.subtitle} as="p" className="text-foreground/60 max-w-xl text-lg" />
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <ScrollReveal key={card.path} delay={i * 0.08} direction="up">
                <ServiceCard
                  title={card.title}
                  description={card.desc}
                  icon={card.icon}
                  path={card.path}
                  colorClass=""
                  contentKeyPrefix={`services.card.${card.key}`}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <ScrollReveal direction="left">
              <EditableText contentKey="services.approachTagline" defaultValue={t.services.approachTagline} as="p" className="label-eyebrow mb-4" />
              <EditableText contentKey="services.approachTitle" defaultValue={t.services.approachTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight mb-8" />
              <EditableText contentKey="services.approachText" defaultValue={t.services.approachText} as="p" className="text-foreground/60 leading-relaxed mb-8" />
              <div className="space-y-4">
                {t.services.approachPoints.map((point, i) => (
                  <ScrollReveal key={point} delay={i * 0.06} direction="left" distance={16}>
                    <div className="flex items-start gap-3">
                      <Check className="text-primary mt-0.5 flex-shrink-0" size={16} strokeWidth={1.5} />
                      <EditableText contentKey={`services.approachPoint.${i}`} defaultValue={point} as="p" className="text-foreground/80" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.15}>
              <div className="bg-card border border-border rounded-2xl p-10">
                <EditableText contentKey="services.quoteText" defaultValue={t.services.quoteText} as="blockquote" className="text-2xl font-display leading-relaxed text-foreground mb-6 italic" />
                <div>
                  <EditableText contentKey="services.quoteAuthor" defaultValue={t.services.quoteAuthor} as="p" className="text-sm font-medium text-foreground" />
                  <EditableText contentKey="services.quoteRole" defaultValue={t.services.quoteRole} as="p" className="text-xs text-muted-foreground" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <ScrollReveal className="text-center mb-16">
            <EditableText contentKey="services.credentialsTagline" defaultValue={t.services.credentialsTagline} as="p" className="label-eyebrow mb-4" />
            <EditableText contentKey="services.credentialsTitle" defaultValue={t.services.credentialsTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight" />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {t.services.credentials.map((cred, i) => (
              <ScrollReveal key={cred} delay={i * 0.05} distance={12}>
                <div className="bg-card border border-border rounded-xl px-6 py-5 text-sm text-foreground/80">
                  <EditableText contentKey={`services.credential.${i}`} defaultValue={cred} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container text-center">
          <ScrollReveal>
            <EditableText contentKey="services.ctaTitle" defaultValue={t.services.ctaTitle} as="h2" className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-4" />
            <EditableText contentKey="services.ctaText" defaultValue={t.services.ctaText} as="p" className="text-muted-foreground mb-10 max-w-md mx-auto" />
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-12 text-[14px] font-medium shadow-apple">
              <Link to="/contact" className="inline-flex items-center gap-3">
                <EditableText contentKey="services.ctaButton" defaultValue={t.services.ctaButton} as="span" /> <ArrowRight size={16} />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
