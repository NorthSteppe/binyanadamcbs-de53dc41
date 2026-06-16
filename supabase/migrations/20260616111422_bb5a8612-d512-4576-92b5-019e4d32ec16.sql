-- service_options: revoke therapist_rate_cents from authenticated/anon
REVOKE SELECT (therapist_rate_cents) ON public.service_options FROM authenticated;
REVOKE SELECT (therapist_rate_cents) ON public.service_options FROM anon;

-- team_members: revoke sensitive columns from public reads
REVOKE SELECT (default_session_rate_cents, xero_contact_id, signature_url)
  ON public.team_members FROM anon;
REVOKE SELECT (default_session_rate_cents, xero_contact_id, signature_url)
  ON public.team_members FROM authenticated;

-- Ensure service_role retains full access for edge functions
GRANT ALL ON public.service_options TO service_role;
GRANT ALL ON public.team_members TO service_role;
