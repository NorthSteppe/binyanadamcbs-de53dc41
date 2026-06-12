import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"client" | "team" | "supervisee">("client");
  const [loading, setLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [googleRoleChoice, setGoogleRoleChoice] = useState<"client" | "team" | "supervisee">("client");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAdmin, isTeamMember, roles, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const pendingRole = sessionStorage.getItem("pending_google_role");
      if (pendingRole === "team" || pendingRole === "supervisee") {
        sessionStorage.removeItem("pending_google_role");
        supabase.from("team_requests").insert({
          user_id: user.id,
          requested_role: pendingRole === "supervisee" ? "supervisee" : "team_member",
        }).then(() => {
          toast({ title: "Access requested", description: "Your request is pending admin approval." });
        });
      } else {
        sessionStorage.removeItem("pending_google_role");
      }
    }
  }, [user, authLoading]);

  if (!authLoading && user) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isTeamMember) return <Navigate to="/staff" replace />;
    if (roles.includes("supervisee")) return <Navigate to="/supervisee" replace />;
    return <Navigate to="/portal" replace />;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      toast({ title: t.signup.title, description: error.message, variant: "destructive" });
    } else {
      if (accountType === "team" || accountType === "supervisee") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("team_requests").insert({
            user_id: session.user.id,
            requested_role: accountType === "supervisee" ? "supervisee" : "team_member",
          });
        }
      }
      toast({ title: t.signup.successTitle, description: (accountType === "team" || accountType === "supervisee") ? "Account created. Your access request is pending admin approval." : t.signup.successDescription });
      navigate("/login");
    }
  };

  const handleGoogleSignup = async () => {
    setShowRoleDialog(true);
  };

  const confirmGoogleSignup = async () => {
    setShowRoleDialog(false);
    if (googleRoleChoice === "team") {
      sessionStorage.setItem("pending_google_role", "team");
    }
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google signup failed", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight">What type of account do you need?</DialogTitle>
          </DialogHeader>
          <RadioGroup value={googleRoleChoice} onValueChange={(v) => setGoogleRoleChoice(v as any)} className="space-y-3 pt-2">
             <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-foreground/20 cursor-pointer transition-colors">
              <RadioGroupItem value="client" id="g-client" />
              <Label htmlFor="g-client" className="cursor-pointer flex-1">
                <span className="font-medium text-foreground">Client</span>
                <p className="text-xs text-muted-foreground font-light">Access the client portal, book sessions, and use tools.</p>
              </Label>
            </div>
             <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-foreground/20 cursor-pointer transition-colors">
              <RadioGroupItem value="team" id="g-team" />
              <Label htmlFor="g-team" className="cursor-pointer flex-1">
                <span className="font-medium text-foreground">Therapist / Staff</span>
                <p className="text-xs text-muted-foreground font-light">Request team access (requires admin approval).</p>
              </Label>
            </div>
            <div className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-foreground/20 cursor-pointer transition-colors">
              <RadioGroupItem value="supervisee" id="g-supervisee" />
              <Label htmlFor="g-supervisee" className="cursor-pointer flex-1">
                <span className="font-medium text-foreground">Supervisee</span>
                <p className="text-xs text-muted-foreground">Supervision portal with case logging (requires admin approval).</p>
              </Label>
            </div>
          </RadioGroup>
          <Button className="w-full rounded-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" onClick={confirmGoogleSignup}>
            Continue with Google
          </Button>
        </DialogContent>
      </Dialog>

      <section className="flex-1 flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto px-6"
        >
          <div className="bg-card border border-border rounded-2xl p-10 shadow-apple">
            <div className="flex justify-center mb-8">
              <img src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png" alt="Blueprint" className="h-12" />
            </div>
            <h1 className="text-3xl font-display mb-2 text-center tracking-tight">{t.signup.title}</h1>
            <p className="text-muted-foreground text-center mb-8 text-sm">{t.signup.subtitle}</p>

            <Button
              variant="outline"
              className="w-full rounded-full mb-6 gap-3 border-border hover:bg-accent h-11"
              size="lg"
              onClick={handleGoogleSignup}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {(t as any).signup?.google || "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{(t as any).signup?.nameLabel || "Full Name"}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-xl bg-background border-border h-11" />
              </div>
              <div className="space-y-3">
                <Label className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">I am signing up as</Label>
                <RadioGroup value={accountType} onValueChange={(v) => setAccountType(v as "client" | "team" | "supervisee")} className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="client" id="role-client" />
                    <Label htmlFor="role-client" className="cursor-pointer font-light text-foreground/80">Client</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="team" id="role-team" />
                    <Label htmlFor="role-team" className="cursor-pointer font-light text-foreground/80">Therapist</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="supervisee" id="role-supervisee" />
                    <Label htmlFor="role-supervisee" className="cursor-pointer font-light text-foreground/80">Supervisee</Label>
                  </div>
                </RadioGroup>
                {(accountType === "team" || accountType === "supervisee") && (
                  <p className="text-xs text-muted-foreground font-light">Access requires admin approval after signup.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t.signup.emailLabel}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl bg-background border-border h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t.signup.passwordLabel}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl bg-background border-border h-11" />
              </div>
              <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" size="lg" disabled={loading}>
                {loading ? t.signup.loading : t.signup.button}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-8">
              {t.signup.hasAccount}{" "}
              <Link to="/login" className="text-primary hover:underline">{t.signup.logInLink}</Link>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Signup;
