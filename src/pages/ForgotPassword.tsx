import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't send reset email", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Check your inbox", description: "We sent you a password reset link." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="flex-1 flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto px-6"
        >
          <div className="bg-card border border-border rounded-2xl p-10 shadow-apple">
            <h1 className="text-3xl font-display mb-2 text-center tracking-tight">Reset your password</h1>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              Enter your email and we'll send you a secure link to set a new password.
            </p>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-foreground">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't get it? Check spam, or try again in a minute.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl bg-background border-border h-11" />
                </div>
                <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}

            <p className="text-sm text-muted-foreground text-center mt-8">
              <Link to="/login" className="text-foreground font-medium hover:underline">Back to login</Link>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
