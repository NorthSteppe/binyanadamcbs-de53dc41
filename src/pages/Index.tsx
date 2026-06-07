import Seo from "@/components/Seo";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditableText from "@/components/editable/EditableText";
import EditableImage from "@/components/editable/EditableImage";
import PathwayQuiz from "@/components/PathwayQuiz";
import { motion } from "framer-motion";

const Index = () => {
  const { t } = useLanguage();
  const { user, isAdmin, isTeamMember } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Blueprint — Constructional Clinical Behaviour Services"
        description="Therapy, supervision and training rooted in constructional behaviour science — for individuals, families, schools and organisations across the UK."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Blueprint",
          url: "https://bacbs.com/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://bacbs.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Header />

      <main className="flex-1 flex items-center">
        <div className="container max-w-3xl py-32 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <EditableImage
              contentKey="landing.logo"
              defaultSrc="/lovable-uploads/blueprint-logo.png"
              alt="Blueprint"
              className="mb-10"
              imgClassName="h-28 w-auto object-contain md:h-36"
            />

            <EditableText
              contentKey="landing.title"
              defaultValue={t.landing.title}
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6 font-display font-light tracking-tight text-balance"
            />

            <EditableText
              contentKey="landing.subtitle"
              defaultValue={t.landing.subtitle}
              as="p"
              className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl font-light"
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => setQuizOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-[14px] font-medium inline-flex items-center gap-3"
              >
                <EditableText contentKey="landing.exploreBtn" defaultValue={t.landing.exploreServices} as="span" />
                <ArrowRight size={16} />
              </Button>

              {user ? (
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-[14px] font-medium">
                  <Link to={isAdmin ? "/admin" : isTeamMember ? "/staff" : "/portal"} className="inline-flex items-center gap-3">
                    {isAdmin ? <><Shield size={16} /> Admin Portal</> : isTeamMember ? <><Users size={16} /> Therapist Portal</> : <><LayoutDashboard size={16} /> My Portal</>}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-[14px] font-medium">
                  <Link to="/contact">
                    <EditableText contentKey="landing.contactBtn" defaultValue="Get in Touch" as="span" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <PathwayQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </div>
  );
};

export default Index;
