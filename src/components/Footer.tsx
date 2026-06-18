import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/editable/EditableText";

const WHATSAPP_URL = `https://wa.me/447715460054?text=${encodeURIComponent("Hi, I am directed here from bacbs.com")}`;

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-20">
        <div className="grid md:grid-cols-4 gap-12">
          <ScrollReveal direction="up" className="md:col-span-2">
            <EditableText contentKey="footer.brand" defaultValue="Blueprint" as="h3" className="text-2xl font-display mb-4 text-foreground tracking-tight" />
            <EditableText contentKey="footer.description" defaultValue={t.footer.description} as="p" className="text-muted-foreground max-w-md text-sm leading-relaxed" />
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground/50 tracking-wide">
              <EditableText contentKey="footer.cred1" defaultValue="UKBA (Cert)" as="span" />
              <span className="text-border">·</span>
              <EditableText contentKey="footer.cred2" defaultValue="UK-SBA Member" as="span" />
              <span className="text-border">·</span>
              <EditableText contentKey="footer.cred3" defaultValue="ACBS Member" as="span" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <EditableText contentKey="footer.servicesTitle" defaultValue={t.footer.servicesTitle} as="h4" className="text-[12px] font-medium uppercase tracking-widest mb-6 text-muted-foreground" />
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/education" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.education" defaultValue={t.footer.links.education} />
              </Link>
              <Link to="/therapy" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.therapy" defaultValue={t.footer.links.therapy} />
              </Link>
              <Link to="/families" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.families" defaultValue={t.footer.links.families} />
              </Link>
              <Link to="/organisations" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.organisations" defaultValue={t.footer.links.organisations} />
              </Link>
              <Link to="/supervision" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.link.supervision" defaultValue={t.footer.links.supervision} />
              </Link>
            </nav>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <EditableText contentKey="footer.contactTitle" defaultValue={t.footer.contactTitle} as="h4" className="text-[12px] font-medium uppercase tracking-widest mb-6 text-muted-foreground" />
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <EditableText contentKey="footer.location" defaultValue={t.contact.location} as="span" />
              <a className="hover:text-foreground transition-colors duration-300" href="mailto:adamdayan@bacbs.com">
                <EditableText contentKey="footer.email" defaultValue="adamdayan@bacbs.com" as="span" />
              </a>
              <Link to="/contact" className="hover:text-foreground transition-colors duration-300">
                <EditableText contentKey="footer.bookConsultation" defaultValue={t.footer.links.bookConsultation} />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-3.5 h-3.5 fill-current opacity-60">
                  <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.744 3.054 9.378L1.054 31.27l6.156-1.97A15.924 15.924 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.31 22.606c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.948.324-5.662-1.216-4.756-1.97-7.818-6.81-8.054-7.124-.226-.316-1.9-2.53-1.9-4.828 0-2.298 1.2-3.43 1.628-3.9.39-.428 1.022-.624 1.628-.624.196 0 .372.01.53.018.468.02.702.048 1.012.784.39.928 1.34 3.27 1.458 3.508.118.238.236.55.078.866-.148.326-.276.47-.514.744-.238.274-.462.484-.7.778-.218.256-.464.53-.196.998.268.468 1.192 1.97 2.562 3.19 1.762 1.568 3.248 2.054 3.712 2.282.352.17.654.172.866-.1.118-.154.468-.546.748-.898.274-.352.544-.46.78-.46.216 0 .472.092.73.212.268.12 2.602 1.228 3.048 1.45.446.226.744.336.854.524.108.186.108 1.088-.282 2.188z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground/50 tracking-wide">
            <span>© {new Date().getFullYear()} <EditableText contentKey="footer.copyright" defaultValue={t.footer.copyright} as="span" /></span>
            <Link to="/trust" className="hover:text-foreground transition-colors">Trust, Security & Privacy</Link>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

export default Footer;
