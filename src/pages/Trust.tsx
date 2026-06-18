import { Shield, Lock, Database, UserCheck, FileText, Mail, Server, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Seo from "@/components/Seo";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <ScrollReveal direction="up">
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={18} />
        </div>
        <h2 className="text-xl font-display text-foreground">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  </ScrollReveal>
);

const Trust = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Trust, Security & Privacy · Blueprint"
        description="How Blueprint (Applied Constructional Behavioural Services) protects client data, manages access, and handles privacy."
        path="/trust"
      />
      <Header />

      <section className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-4">
              <Shield size={14} /> Trust Centre
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Security & privacy at Blueprint
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              This page is maintained by Blueprint (Applied Constructional Behavioural Services) to
              answer common security and privacy questions about our practice and client portal. It
              describes controls currently in place; it is not an independent certification or audit.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="container max-w-4xl grid gap-6">
          <Section icon={Lock} title="Access & authentication">
            <p>
              Sign-in supports email & password and Google. Each account is bound to a unique
              identity, and access to clinical features requires Blueprint to assign a clinical role
              before any client data becomes visible.
            </p>
            <p>
              Administrative and clinical actions are gated server-side by role. Client accounts can
              only ever see their own records — therapists, supervisors and admins see only what
              their assignments permit.
            </p>
          </Section>

          <Section icon={Database} title="Data storage & isolation">
            <p>
              Clinical notes, session records, journal entries, assessments and uploaded documents
              are stored in our managed backend with row-level security. Every read and write is
              checked against the requester's identity and role before the database returns a row.
            </p>
            <p>
              Financial fields (pricing, payouts, payment status) and therapist payout rates are
              never exposed to client-side code. They are read and written only through trusted
              server-side functions.
            </p>
          </Section>

          <Section icon={Server} title="Hosting & infrastructure">
            <p>
              The website and portal run on Lovable Cloud (backed by Supabase) with traffic served
              over HTTPS. Backups, patching and platform hardening are handled by the underlying
              providers; we layer application-level access control on top.
            </p>
          </Section>

          <Section icon={UserCheck} title="Roles & responsibilities">
            <p>
              We operate a shared-responsibility model:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The platform provides authentication, encrypted transport and storage primitives.</li>
              <li>Blueprint configures roles, RLS policies, retention and clinical workflows.</li>
              <li>You are responsible for protecting your password and the device you sign in from.</li>
            </ul>
          </Section>

          <Section icon={Eye} title="What we collect">
            <p>
              We collect the information needed to deliver clinical, supervision and educational
              services: your name and contact details, session notes, assessments and documents you
              share with your clinician, and basic usage data to keep the portal running.
            </p>
            <p>
              We do not sell personal data. Third-party integrations (such as calendar, video, email
              and invoicing tools) receive only the minimum information required to perform the
              requested action.
            </p>
          </Section>

          <Section icon={FileText} title="Retention, export & deletion">
            <p>
              Clinical records are retained in line with professional obligations in the UK. You can
              request a copy of your records or ask us to delete personal data that is not required
              for legal or clinical record-keeping. Contact us using the address below and we will
              respond within a reasonable time.
            </p>
          </Section>

          <Section icon={Mail} title="Reporting a security concern">
            <p>
              If you believe you have found a security or privacy issue, please email{" "}
              <a className="text-primary underline" href="mailto:adamdayan@bacbs.com">
                adamdayan@bacbs.com
              </a>
              . Please do not publicly disclose the issue before we have had a chance to investigate
              and respond.
            </p>
          </Section>

          <ScrollReveal direction="up">
            <p className="text-xs text-muted-foreground/70 text-center mt-4">
              This page describes app-owned practices and is editable by Blueprint. It is not
              certified or independently verified by any third party. Last reviewed June 2026.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Trust;
