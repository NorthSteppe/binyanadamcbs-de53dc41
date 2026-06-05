import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSignup = ({ variant = "default" }: { variant?: "default" | "inline" }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "notification",
          recipientEmail: "adamdayan@bacbs.com",
          templateData: {
            subject: "New Newsletter Subscriber",
            title: "New Newsletter Signup",
            message: `${email} has subscribed to the Binyan CBS newsletter.`,
          },
        },
      });
      toast.success("Thank you! You'll receive practical insights, not theory.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email" placeholder="Your email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={loading}>{loading ? "Sending..." : "Subscribe"}</Button>
      </form>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
        <Mail className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Practical insights, not theory</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Evidence-based strategies you can apply in your classroom, clinic, or home — delivered monthly.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email" placeholder="your@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} className="flex-1"
        />
        <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Subscribe"}</Button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
