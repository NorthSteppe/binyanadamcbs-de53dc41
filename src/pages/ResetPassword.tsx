import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // The recovery link sets a session via the hash; AuthProvider already calls setSession.
    // Confirm we have a session before allowing password update.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You're now signed in." });
      navigate("/portal");
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
            <h1 className="text-3xl font-display mb-2 text-center tracking-tight">Choose a new password</h1>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              {ready ? "Set a password you'll remember." : "Validating your reset link..."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="rounded-xl bg-background border-border h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} className="rounded-xl bg-background border-border h-11" />
              </div>
              <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" size="lg" disabled={loading || !ready}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default ResetPassword;
