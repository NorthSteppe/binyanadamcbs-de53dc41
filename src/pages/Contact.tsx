import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/editable/EditableText";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const service = data.get("service") as string;
    const message = data.get("message") as string;

    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "notification",
          recipientEmail: "adamdayan@bacbs.com",
          templateData: {
            subject: `New contact form message from ${name}`,
            title: "New Contact Form Submission",
            message: `**From:** ${name} (${email})\n**Interested in:** ${service || "Not specified"}\n\n${message}`,
            ctaUrl: `mailto:${email}`,
            ctaLabel: `Reply to ${name}`,
          },
        },
      });
      toast({ title: t.contact.successTitle, description: t.contact.successDescription });
      form.reset();
    } catch {
      toast({ title: "Something went wrong", description: "Please try emailing us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="pt-40 pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20">
            <ScrollReveal direction="left">
              <EditableText contentKey="contact.tagline" defaultValue={t.contact.tagline} as="p" className="label-eyebrow mb-4" />
              <EditableText contentKey="contact.title" defaultValue={t.contact.title} as="h1" className="text-5xl md:text-6xl font-display tracking-tight mb-6" />
              <EditableText contentKey="contact.subtitle" defaultValue={t.contact.subtitle} as="p" className="text-foreground/60 leading-relaxed mb-12 max-w-md" />

              <div className="space-y-4">
                <ScrollReveal delay={0.1} distance={12}>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-primary" />
                    <EditableText contentKey="contact.location" defaultValue={t.contact.location} as="span" className="text-foreground/50" />
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.15} distance={12}>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-primary" />
                    <a href="mailto:adamdayan@bacbs.com" className="text-foreground/50 hover:text-primary transition-colors duration-300">
                      <EditableText contentKey="contact.email" defaultValue="adamdayan@bacbs.com" as="span" />
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <form
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block">
                      <EditableText contentKey="contact.nameLabel" defaultValue={t.contact.nameLabel} as="span" className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block" />
                    </label>
                    <Input id="contact-name" required name="name" placeholder={t.contact.namePlaceholder} className="rounded-lg bg-background border-border h-11" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block">
                      <EditableText contentKey="contact.emailLabel" defaultValue={t.contact.emailLabel} as="span" className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block" />
                    </label>
                    <Input id="contact-email" required name="email" type="email" placeholder={t.contact.emailPlaceholder} className="rounded-lg bg-background border-border h-11" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-service" className="block">
                    <EditableText contentKey="contact.interestedLabel" defaultValue={t.contact.interestedLabel} as="span" className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block" />
                  </label>
                  <select
                    id="contact-service"
                    className="w-full border border-border bg-background rounded-lg px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    name="service"
                    defaultValue=""
                  >
                    <option value="" disabled>{t.contact.selectService}</option>
                    {t.contact.serviceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block">
                    <EditableText contentKey="contact.messageLabel" defaultValue={t.contact.messageLabel} as="span" className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2 block" />
                  </label>
                  <Textarea id="contact-message" required name="message" rows={5} placeholder={t.contact.messagePlaceholder} className="rounded-lg bg-background border-border" />
                </div>

                <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" size="lg" disabled={submitting}>
                  {submitting ? t.contact.sending : t.contact.sendButton}
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
