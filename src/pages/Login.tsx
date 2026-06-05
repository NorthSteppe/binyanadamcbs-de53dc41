import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAdmin, isTeamMember, roles, loading: authLoading } = useAuth();

  if (!authLoading && user) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isTeamMember) return <Navigate to="/staff" replace />;
    if (roles.includes("supervisee")) return <Navigate to="/supervisee" replace />;
    return <Navigate to="/portal" replace />;
  }

  const getRedirectPath = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = data?.map(r => r.role) || [];
    if (roles.includes("admin")) return "/admin";
    if (roles.includes("team_member")) return "/staff";
    if (roles.includes("supervisee")) return "/supervisee";
    return "/portal";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      const path = await getRedirectPath(data.user.id);
      navigate(path);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google login failed", description: String(error), variant: "destructive" });
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
            <div className="flex justify-center mb-8">
              <img src="/lovable-uploads/ed0abcc5-2b9d-4294-a3b6-3d6945c02959.png" alt="Binyan" className="h-12" />
            </div>
            <h1 className="text-3xl font-display mb-2 text-center tracking-tight">{t.login.title}</h1>
            <p className="text-muted-foreground text-center mb-8 text-sm">{t.login.subtitle}</p>

            <Button
              variant="outline"
              className="w-full rounded-full mb-6 gap-3 border-border hover:bg-accent h-11"
              size="lg"
              onClick={handleGoogleLogin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {(t as any).login?.google || "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t.login.emailLabel}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl bg-background border-border h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t.login.passwordLabel}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl bg-background border-border h-11" />
              </div>
              <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-[14px] font-medium shadow-apple" size="lg" disabled={loading}>
                {loading ? t.login.loading : t.login.button}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-8">
              {t.login.noAccount}{" "}
              <Link to="/signup" className="text-foreground font-medium hover:underline">{t.login.signUpLink}</Link>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Login;
