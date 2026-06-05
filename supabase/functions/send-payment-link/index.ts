import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: authData } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    // Verify caller is admin or team_member
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const allowed = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "team_member");
    if (!allowed) throw new Error("Forbidden");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    // Load session
    const { data: session, error: sErr } = await admin
      .from("sessions").select("*").eq("id", session_id).single();
    if (sErr || !session) throw new Error("Session not found");

    // Resolve service option for stripe price
    let stripePriceId: string | null = null;
    let serviceName = session.title || "Session";
    if (session.service_option_id) {
      const { data: svc } = await admin.from("service_options").select("stripe_price_id,name").eq("id", session.service_option_id).single();
      if (svc) { stripePriceId = svc.stripe_price_id; serviceName = svc.name || serviceName; }
    }

    // Resolve client email
    let clientEmail: string | null = null;
    let clientName = "";
    if (session.manual_client_id) {
      const { data: mc } = await admin.from("manual_clients").select("email,full_name").eq("id", session.manual_client_id).single();
      clientEmail = mc?.email || null;
      clientName = mc?.full_name || "";
    } else if (session.client_id) {
      const { data: u } = await admin.auth.admin.getUserById(session.client_id);
      clientEmail = u?.user?.email ?? null;
      const { data: prof } = await admin.from("profiles").select("full_name").eq("id", session.client_id).single();
      clientName = prof?.full_name || "";
    }
    if (!clientEmail) throw new Error("Client has no email on file");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    let paymentUrl: string;
    if (stripePriceId) {
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: stripePriceId, quantity: 1 }],
        metadata: { session_id, client_email: clientEmail },
      });
      paymentUrl = link.url;
    } else {
      // Build ad-hoc product/price for the session amount
      if (!session.price_cents || session.price_cents <= 0) throw new Error("Session has no price");
      const product = await stripe.products.create({ name: serviceName });
      const price = await stripe.prices.create({
        product: product.id, currency: "gbp", unit_amount: session.price_cents,
      });
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { session_id, client_email: clientEmail },
      });
      paymentUrl = link.url;
    }

    // Email the link via the same notification queue used elsewhere
    const subject = `Payment link for ${serviceName}`;
    const html = `<!DOCTYPE html><html><body style="font-family:DM Sans,Arial,sans-serif;background:#fff;padding:0;margin:0;">
      <div style="max-width:600px;margin:0 auto;padding:32px 28px;">
        <img src="https://wcqjmjceelcainyyqjmi.supabase.co/storage/v1/object/public/email-assets/binyan-logo.png?v=1" alt="Binyan" width="120" style="margin-bottom:24px;" />
        <h1 style="font-size:22px;color:hsl(192,35%,18%);margin:0 0 16px;">Hi ${clientName || "there"},</h1>
        <p style="font-size:15px;color:hsl(192,15%,46%);line-height:1.6;margin:0 0 24px;">
          Please use the secure link below to complete payment for your upcoming session: <strong>${serviceName}</strong>${session.session_date ? ` on ${new Date(session.session_date).toLocaleString("en-GB")}` : ""}.
        </p>
        <p style="margin:24px 0;"><a href="${paymentUrl}" style="display:inline-block;background-color:hsl(174,42%,32%);color:#fff;font-size:15px;border-radius:12px;padding:14px 24px;text-decoration:none;">Pay securely</a></p>
        <p style="font-size:12px;color:#999;margin-top:32px;">— Binyan CBS</p>
      </div></body></html>`;

    await admin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: crypto.randomUUID(),
        to: clientEmail,
        from: "Binyan CBS <noreply@bacbs.com>",
        sender_domain: "notify.bacbs.com",
        subject,
        html,
        text: `Hi ${clientName || "there"},\n\nPlease pay for ${serviceName} via this secure link:\n${paymentUrl}\n\n— Binyan CBS`,
        purpose: "transactional",
        label: "payment_link",
        idempotency_key: `payment-link-${session_id}-${Date.now()}`,
        queued_at: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ url: paymentUrl, sent_to: clientEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("send-payment-link error:", error);
    const safe = ["Not authenticated", "Forbidden", "Missing session_id", "Session not found", "Client has no email on file", "Session has no price"];
    const msg = error instanceof Error && safe.includes(error.message) ? error.message : "Failed to send payment link";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
