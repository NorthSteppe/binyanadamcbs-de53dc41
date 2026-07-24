import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditableText from "@/components/editable/EditableText";

const OfferDetail = () => {
  const { serviceArea, offerSlug } = useParams();
  const { t } = useLanguage();

  // Find the offer detail from translations
  const offerDetails = (t as any).offerDetails?.[serviceArea as string];
  const offer = offerDetails?.find((o: any) => o.slug === offerSlug);

  // Get service area config for colors
  const areaConfig: Record<string, { bg: string; accent: string; textOn: string; parentPath: string; parentLabel: string }> = {
    education: { bg: "bg-education", accent: "bg-education", textOn: "text-education-foreground", parentPath: "/education", parentLabel: t.nav.education },
    therapy: { bg: "bg-therapy", accent: "bg-therapy", textOn: "text-therapy-foreground", parentPath: "/therapy", parentLabel: t.nav.therapy },
    families: { bg: "bg-family", accent: "bg-family", textOn: "text-family-foreground", parentPath: "/families", parentLabel: t.nav.families },
    organisations: { bg: "bg-business", accent: "bg-business", textOn: "text-business-foreground", parentPath: "/organisations", parentLabel: t.nav.organisations },
    supervision: { bg: "bg-supervision", accent: "bg-supervision", textOn: "text-supervision-foreground", parentPath: "/supervision", parentLabel: t.nav.supervision },
  };

  const config = areaConfig[serviceArea as string];

  if (!offer || !config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container pt-32 pb-20 text-center">
          <h1 className="text-3xl mb-4">Offer not found</h1>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/services">Back to Services</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className={`relative pt-32 pb-16 ${config.bg}`}>
        <div className="container relative z-10">
          <Link
            to={config.parentPath}
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 ${config.textOn} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <ArrowLeft size={16} />
            {config.parentLabel}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className={`text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 ${config.textOn}`}>
              {offer.title}
            </h1>
            <p className={`text-lg leading-relaxed ${config.textOn} opacity-80 max-w-2xl`}>
              {offer.summary}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-2xl mb-6">{offer.overviewTitle || (t as any).offerPage?.overview || "Overview"}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {offer.description.map((para: string, i: number) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* Key Points sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-8 border border-border/50 sticky top-24">
                <h3 className="text-lg font-semibold mb-5">{(t as any).offerPage?.keyPoints || "Key Points"}</h3>
                <ul className="space-y-3">
                  {offer.keyPoints.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle2 className="text-primary mt-0.5 flex-shrink-0" size={16} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who is this for */}
      {offer.whoIsThisFor && (
        <section className="py-16 bg-card">
          <div className="container">
            <h2 className="text-2xl mb-8">{(t as any).offerPage?.whoIsThisFor || "Who Is This For?"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offer.whoIsThisFor.map((item: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-background rounded-2xl p-6 border border-border/50 flex items-start gap-3"
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${config.accent}`} />
                  <p className="text-sm text-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outcomes */}
      {offer.outcomes && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl mb-8">{(t as any).offerPage?.outcomes || "Expected Outcomes"}</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              {offer.outcomes.map((outcome: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-foreground">{outcome}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl mb-4">{(t as any).offerPage?.ctaTitle || "Interested?"}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {(t as any).offerPage?.ctaText || "Get in touch to discuss how this service can support you."}
          </p>
          <Button size="lg" asChild className="rounded-full px-8">
            <Link to="/contact" className="inline-flex items-center gap-2">
              {t.nav.bookConsultation} <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfferDetail;
