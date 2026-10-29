import Seo from "@/components/Seo";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, Heart, Landmark, LayoutDashboard, MessageCircle, Shield, Users, UsersRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import PathwayQuiz from "@/components/PathwayQuiz";
import { motion, useReducedMotion } from "framer-motion";
import welcomeImage from "@/assets/blueprint-welcome.jpg";

const Index = () => {
  const { t } = useLanguage();
  const copy = t.landing.foundation;
  const { user, isAdmin, isTeamMember } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const portalPath = isAdmin ? "/admin" : isTeamMember ? "/staff" : "/portal";
  const whatsappUrl = `https://wa.me/447715460054?text=${encodeURIComponent("Hi, I am directed here from bacbs.com")}`;
  const pathways = [
    { key: "families", title: t.nav.families, summary: copy.familySummary, path: "/families", icon: UsersRound },
    { key: "education", title: t.nav.education, summary: copy.educationSummary, path: "/education", icon: BookOpen },
    { key: "therapy", title: t.nav.therapy, summary: copy.therapySummary, path: "/therapy", icon: Heart },
    { key: "supervision", title: t.nav.supervision, summary: copy.supervisionSummary, path: "/supervision", icon: Compass },
    { key: "organisations", title: t.nav.organisations, summary: copy.organisationsSummary, path: "/organisations", icon: Landmark },
  ];
  const resources = [
    { key: "insights", title: copy.insights, summary: copy.insightsSummary, path: "/insights", icon: BookOpen },
    { key: "courses", title: copy.courses, summary: copy.coursesSummary, path: "/courses", icon: Compass },
    { key: "portal", title: copy.portal, summary: copy.portalSummary, path: user ? portalPath : "/login", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Blueprint — Behaviour Support for Families, Schools & Individuals"
        description="Therapy, supervision and training rooted in constructional behaviour science — for individuals, families, schools and organisations across the UK."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Blueprint",
          url: "https://bacbs.com/",
        }}
      />
      <Header />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-secondary">
          <EditableImage
            contentKey="landing.welcomeImage"
            defaultSrc={welcomeImage}
            alt="A parent and child sharing a drawing activity — illustrative image"
            className="absolute inset-0 -z-20"
            imgClassName="h-full w-full object-cover object-[65%_center] lg:object-center"
          />
          <div className="absolute inset-0 -z-10 bg-background/90 sm:bg-background/80 lg:bg-transparent" />
          <div className="container py-12 md:py-16 lg:py-20">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg text-start lg:max-w-[46%]"
          >
            <EditableImage
              contentKey="landing.logo"
              defaultSrc="/lovable-uploads/blueprint-logo.png"
              alt="Blueprint"
              className="mb-5"
              imgClassName="h-20 w-auto object-contain md:h-24"
            />
            <EditableText contentKey="landing.foundation.intro" defaultValue={copy.intro} as="p" className="text-xs font-medium text-muted-foreground mb-4" />
            <h1 className="text-5xl md:text-6xl font-display text-primary leading-tight tracking-normal mb-4">Blueprint</h1>
            <EditableText
              contentKey="landing.title"
              defaultValue={copy.welcome}
              as="p"
              className="text-xl md:text-2xl text-foreground leading-snug mb-4 font-display font-medium tracking-normal text-balance"
            />

            <EditableText
              contentKey="landing.subtitle"
              defaultValue={copy.summary}
              as="p"
              className="text-base text-muted-foreground leading-relaxed mb-7 max-w-md"
            />

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => setQuizOpen(true)}
                className="rounded-md px-5 h-12 text-sm gap-3"
              >
                <EditableText contentKey="landing.exploreBtn" defaultValue={t.landing.exploreServices} as="span" />
                <ArrowRight size={16} className="rtl:rotate-180" />
              </Button>

              {user ? (
                <Button size="lg" variant="outline" asChild className="px-5 h-12 text-sm">
                  <Link to={portalPath} className="gap-3">
                    {isAdmin ? <><Shield size={16} /> {copy.adminPortal}</> : isTeamMember ? <><Users size={16} /> {copy.therapistPortal}</> : <><LayoutDashboard size={16} /> {copy.myPortal}</>}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" asChild className="px-5 h-12 text-sm">
                    <Link to="/contact">
                      <EditableText contentKey="landing.contactBtn" defaultValue={copy.contact} as="span" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="px-5 h-12 text-sm">
                    <Link to="/signup">
                      <EditableText contentKey="landing.signupBtn" defaultValue={t.landing.signUp} as="span" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <Button variant="link" asChild className="mt-3 px-0 h-10 text-sm">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Force a real top-level new tab — embedded previews get
                // blocked by WhatsApp's frame headers (ERR_BLOCKED_BY_RESPONSE).
                e.preventDefault();
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <MessageCircle size={16} className="text-primary" />
              <EditableText contentKey="landing.whatsappBtn" defaultValue={copy.whatsapp} as="span" />
            </a>
            </Button>
          </motion.div>
          </div>
        </section>

        <section className="py-14 md:py-20 border-b border-border">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <EditableText contentKey="landing.foundation.pathwaysLabel" defaultValue={copy.pathwaysLabel} as="p" className="text-sm text-muted-foreground mb-3" />
                <EditableText contentKey="landing.foundation.pathwaysTitle" defaultValue={copy.pathwaysTitle} as="h2" className="text-3xl md:text-4xl tracking-normal" />
              </div>
              <Button variant="link" asChild className="px-0"><Link to="/services">{copy.allServices}<ArrowRight className="rtl:rotate-180" /></Link></Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {pathways.map((item) => (
                <Button key={item.key} variant="outline" asChild className="group h-auto min-h-52 items-stretch justify-start whitespace-normal rounded-lg p-5 text-start hover:bg-secondary hover:text-foreground">
                  <Link to={item.path} className="flex flex-col gap-0">
                    <item.icon size={23} className="mb-6 text-accent" />
                    <EditableText contentKey={`landing.pathway.${item.key}.title`} defaultValue={item.title} as="h3" className="text-lg font-display tracking-normal mb-2" />
                    <EditableText contentKey={`landing.pathway.${item.key}.summary`} defaultValue={item.summary} as="p" className="text-sm font-normal text-muted-foreground leading-relaxed mb-5" />
                    <ArrowRight className="mt-auto text-primary rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary/50 py-14 md:py-20">
          <div className="container grid lg:grid-cols-2 gap-10 lg:gap-20">
            <div>
              <EditableText contentKey="landing.foundation.approachLabel" defaultValue={copy.approachLabel} as="p" className="text-sm text-muted-foreground mb-4" />
              <EditableText contentKey="landing.foundation.approachTitle" defaultValue={copy.approachTitle} as="h2" className="text-3xl md:text-4xl leading-snug tracking-normal text-balance mb-5" />
              <EditableText contentKey="landing.foundation.approachSummary" defaultValue={copy.approachSummary} as="p" className="text-muted-foreground leading-relaxed max-w-lg mb-5" />
              <Button variant="link" asChild className="h-auto px-0 whitespace-normal text-start"><Link to="/about">{copy.about}<ArrowRight className="rtl:rotate-180" /></Link></Button>
            </div>
            <div className="divide-y divide-border">
              {copy.values.map((value, i) => (
                <div key={i} className="py-5 first:pt-0 last:pb-0 flex gap-5">
                  <span className="text-sm font-display text-accent pt-1">0{i + 1}</span>
                  <div>
                    <EditableText contentKey={`landing.foundation.value.${i}.title`} defaultValue={value.title} as="h3" className="text-xl tracking-normal mb-2" />
                    <EditableText contentKey={`landing.foundation.value.${i}.description`} defaultValue={value.description} as="p" className="text-sm text-muted-foreground leading-relaxed" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 border-b border-border">
          <div className="container">
            <EditableText contentKey="landing.foundation.nextLabel" defaultValue={copy.nextLabel} as="p" className="text-sm text-muted-foreground mb-3" />
            <EditableText contentKey="landing.foundation.nextTitle" defaultValue={copy.nextTitle} as="h2" className="text-3xl md:text-4xl tracking-normal max-w-2xl leading-snug mb-10" />
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {copy.steps.map((step, i) => (
                <div key={i} className="border-t-2 border-sky pt-5">
                  <EditableText contentKey={`landing.foundation.step.${i}.title`} defaultValue={step.title} as="h3" className="text-xl tracking-normal mb-3" />
                  <EditableText contentKey={`landing.foundation.step.${i}.description`} defaultValue={step.description} as="p" className="text-sm text-muted-foreground leading-relaxed max-w-sm" />
                </div>
              ))}
            </div>
            <Button size="lg" asChild><Link to="/contact">{copy.contact}<ArrowRight className="rtl:rotate-180" /></Link></Button>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="container">
            <EditableText contentKey="landing.foundation.continueTitle" defaultValue={copy.continueTitle} as="h2" className="text-2xl tracking-normal mb-8" />
            <div className="grid md:grid-cols-3 gap-5">
              {resources.map((item) => (
                <Button key={item.key} variant="ghost" asChild className="h-auto justify-start items-start gap-4 whitespace-normal text-start p-4 hover:bg-secondary hover:text-foreground">
                  <Link to={item.path}>
                    <item.icon className="text-accent mt-1" />
                    <div>
                      <EditableText contentKey={`landing.resource.${item.key}.title`} defaultValue={item.title} as="h3" className="text-base tracking-normal mb-2" />
                      <EditableText contentKey={`landing.resource.${item.key}.summary`} defaultValue={item.summary} as="p" className="text-sm text-muted-foreground font-normal leading-relaxed" />
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <PathwayQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </div>
  );
};

export default Index;
