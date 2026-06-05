import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleConfirm = async () => {
    setStatus("confirming");
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-md">
          <Card className="border-border/50">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              {status === "loading" && (
                <>
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Validating your request…</p>
                </>
              )}

              {status === "valid" && (
                <>
                  <MailX className="mx-auto h-10 w-10 text-destructive" />
                  <h1 className="text-xl font-display font-bold text-foreground">Unsubscribe from emails</h1>
                  <p className="text-sm text-muted-foreground">
                    You'll stop receiving notification emails from Binyan CBS. In-app notifications won't be affected.
                  </p>
                  <Button onClick={handleConfirm} variant="destructive" className="mt-4">
                    Confirm Unsubscribe
                  </Button>
                </>
              )}

              {status === "confirming" && (
                <>
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Processing…</p>
                </>
              )}

              {status === "done" && (
                <>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                  <h1 className="text-xl font-display font-bold text-foreground">You've been unsubscribed</h1>
                  <p className="text-sm text-muted-foreground">
                    You won't receive any more notification emails. You can re-enable them anytime from your Settings page.
                  </p>
                </>
              )}

              {status === "already" && (
                <>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h1 className="text-xl font-display font-bold text-foreground">Already unsubscribed</h1>
                  <p className="text-sm text-muted-foreground">
                    You've already unsubscribed from notification emails.
                  </p>
                </>
              )}

              {(status === "invalid" || status === "error") && (
                <>
                  <XCircle className="mx-auto h-10 w-10 text-destructive" />
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {status === "invalid" ? "Invalid link" : "Something went wrong"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {status === "invalid"
                      ? "This unsubscribe link is invalid or has expired."
                      : "Please try again later or contact support."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
