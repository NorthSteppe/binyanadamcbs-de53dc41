import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type AuthorizationDetails = {
  client?: { name?: string; client_name?: string; client_uri?: string };
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// Local wrapper around the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: any }>;
};
const oauthApi = (): OAuthApi => (supabase.auth as any).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        setReady(true);
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }
      const api = oauthApi();
      if (!api?.getAuthorizationDetails) {
        setError("This app's OAuth server is not available. Please try again shortly.");
        setReady(true);
        return;
      }
      const { data, error } = await api.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message || "Could not load this authorization request.");
        setReady(true);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message || "Could not complete this request.");
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName =
    details?.client?.name ?? details?.client?.client_name ?? "an application";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <section className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-apple">
          {!ready ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center space-y-3">
              <XCircle className="w-10 h-10 text-destructive mx-auto" />
              <h1 className="text-xl font-display">Authorization unavailable</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-display text-center mb-2 tracking-tight">
                Connect {clientName} to Blueprint
              </h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                {clientName} will be able to call Blueprint's enabled tools while you are signed in.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm">
                  <p className="font-medium text-foreground mb-1">Access summary</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This lets {clientName} use this app as you. It does not bypass Blueprint's
                    role-based permissions or backend policies — the tools only see what your
                    account is already allowed to see.
                  </p>
                </div>
                {scopes.length > 0 && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm">
                    <p className="font-medium text-foreground mb-2">Requested permissions</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {scopes.map((s) => (
                        <li key={s}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {details?.redirect_uri && (
                  <p className="text-[11px] text-muted-foreground text-center break-all">
                    Redirects to <span className="font-mono">{details.redirect_uri}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full rounded-full h-11"
                  disabled={busy}
                  onClick={() => decide(true)}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & connect"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-full h-11"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Cancel connection
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default OAuthConsent;
