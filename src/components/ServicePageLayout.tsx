import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePageContent } from "@/hooks/useSiteContent";
import Header from "./Header";
import Footer from "./Footer";
import ScrollReveal from "./ScrollReveal";
import EditableText from "./editable/EditableText";
import EditableImage from "./editable/EditableImage";
import Seo from "./Seo";


interface ServicePackage {
  name: string;
  description: string;
  includes: string[];
  ideal: string;
}

export interface ServiceOffer {
  name: string;
  slug: string;
}

interface ServicePageLayoutProps {
  title: string;
  subtitle: string;
  tagline: string;
  bgColorClass: string;
  accentColorClass: string;
  textOnBgClass: string;
  heroImage?: string;
  pageKey: string;
  basePath: string;
  services: (string | ServiceOffer)[];
  packages: ServicePackage[];
  ctaText?: string;
  children?: ReactNode;
}

const ServicePageLayout = ({
  title,
  subtitle,
  tagline,
  bgColorClass,
  accentColorClass,
  textOnBgClass,
  heroImage,
  pageKey,
  basePath,
  services,
  packages,
  ctaText = "Book a Consultation",
}: ServicePageLayoutProps) => {
  const { t } = useLanguage();
  const { data: content } = usePageContent(pageKey);
  // Prefer DB image, fall back to local asset. Guard against empty strings.
  const displayImage = (content?.image_url && content.image_url.length > 0) ? content.image_url : heroImage;

  const getServiceName = (service: string | ServiceOffer) =>
    typeof service === "string" ? service : service.name;
  const getServiceLink = (service: string | ServiceOffer) =>
    typeof service === "string"
      ? `${basePath}/${service.toLowerCase().replace(/\s+/g, "-")}`
      : `${basePath}/${service.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${title} — Binyan Adam`}
        description={subtitle || tagline}
        path={basePath}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: title,
          description: subtitle || tagline,
          provider: { "@type": "Organization", name: "Binyan Adam", url: "https://bacbs.com/" },
          areaServed: "GB",
          url: `https://bacbs.com${basePath}`,
        }}
      />
      <Header />


      {/* Full-bleed hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {displayImage && (
          <EditableImage
            contentKey={`${pageKey}.hero`}
            defaultSrc={displayImage}
            alt={content?.alt_text || ""}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover"
          />
        )}
        {displayImage && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
          </>
        )}
        {!displayImage && <div className={`absolute inset-0 ${bgColorClass} opacity-20`} />}
        <div className="container relative z-10 pb-16 md:pb-24 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <EditableText contentKey={`${pageKey}.subtitle`} defaultValue={subtitle} as="p" className="label-eyebrow mb-4" />
            <EditableText contentKey={`${pageKey}.title`} defaultValue={title} as="h1" className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-foreground font-display tracking-tight" />
            <EditableText contentKey={`${pageKey}.tagline`} defaultValue={tagline} as="p" className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl" />
            {content?.quote_text && (
              <blockquote className="mt-8 border-l border-primary/30 pl-4 text-foreground/50 italic">
                <EditableText contentKey={`${pageKey}.heroQuote`} defaultValue={content.quote_text} as="p" className="text-base" />
                {content.quote_author && (
                  <footer className="text-sm mt-2 not-italic text-foreground/30">
                    — <EditableText contentKey={`${pageKey}.heroQuoteAuthor`} defaultValue={content.quote_author} as="span" />
                  </footer>
                )}
              </blockquote>
            )}
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24">
        <div className="container">
          <ScrollReveal>
            <EditableText contentKey={`${pageKey}.whatWeOffer`} defaultValue={t.serviceLayout.whatWeOffer} as="h2" className="text-4xl md:text-5xl font-display mb-16 text-foreground tracking-tight" />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <ScrollReveal key={getServiceName(service)} delay={i * 0.06} distance={16}>
                <Link
                  to={getServiceLink(service)}
                  className="group block border border-border bg-card rounded-2xl p-6 hover:shadow-apple transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${accentColorClass}`} />
                      <EditableText contentKey={`${pageKey}.service.${i}`} defaultValue={getServiceName(service)} as="p" className="text-sm text-card-foreground" />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container">
          <ScrollReveal>
            <EditableText contentKey={`${pageKey}.packagesTitle`} defaultValue={t.serviceLayout.packages} as="h2" className="text-4xl md:text-5xl font-display mb-4 text-foreground tracking-tight" />
            <EditableText contentKey={`${pageKey}.packagesSubtitle`} defaultValue={t.serviceLayout.packagesSubtitle} as="p" className="text-muted-foreground mb-16 max-w-xl" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={i * 0.1}>
                <div className="border border-border bg-background rounded-2xl p-8">
                  <EditableText contentKey={`${pageKey}.pkg.${i}.name`} defaultValue={pkg.name} as="h3" className="text-2xl font-display mb-2 text-foreground tracking-tight" />
                  <EditableText contentKey={`${pageKey}.pkg.${i}.desc`} defaultValue={pkg.description} as="p" className="text-sm text-muted-foreground mb-6" />
                  <ul className="space-y-3 mb-6">
                    {pkg.includes.map((item, j) => (
                      <li key={item} className="text-sm text-foreground/80 flex items-start gap-3">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColorClass}`} />
                        <EditableText contentKey={`${pageKey}.pkg.${i}.inc.${j}`} defaultValue={item} />
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic mb-6">
                    {t.serviceLayout.idealFor} <EditableText contentKey={`${pageKey}.pkg.${i}.ideal`} defaultValue={pkg.ideal} as="span" />
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full rounded-full border-border hover:border-primary/40 text-[13px]">
                    <Link to="/contact">Get in Touch <ArrowRight size={13} className="ml-1.5" /></Link>
                  </Button>
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
            <EditableText contentKey={`${pageKey}.readyTitle`} defaultValue={t.serviceLayout.readyTitle} as="h2" className="text-4xl md:text-5xl font-display mb-4 text-foreground tracking-tight" />
            <EditableText contentKey={`${pageKey}.readyText`} defaultValue={t.serviceLayout.readyText} as="p" className="text-muted-foreground mb-10 max-w-md mx-auto" />
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-12 text-[14px] font-medium shadow-apple">
              <Link to="/contact">
                <EditableText contentKey={`${pageKey}.ctaButton`} defaultValue={ctaText} as="span" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicePageLayout;
