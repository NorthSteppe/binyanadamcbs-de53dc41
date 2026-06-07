
-- 1) Remove legacy Stripe price ID column from courses (Stripe checkout was removed; Xero invoices used instead)
ALTER TABLE public.courses DROP COLUMN IF EXISTS stripe_price_id;

-- 2) Restrict default_session_rate_cents on team_members to admins/team_members only via column-level privileges.
--    The has_role()-gated SECURITY DEFINER function get_team_member_rate() remains available for authorized callers.
REVOKE SELECT ON public.team_members FROM anon;
REVOKE SELECT ON public.team_members FROM authenticated;

-- Grant SELECT on all safe (non-financial) columns to anon and authenticated.
GRANT SELECT (
  id, name, role, bio, initials, slug, avatar_url, display_order,
  is_active, credentials, signature_url, social_linkedin, social_twitter,
  social_website, user_id, long_bio, profile_image_url, created_at, updated_at
) ON public.team_members TO anon, authenticated;

-- default_session_rate_cents intentionally omitted from the GRANT above; only service_role can read it directly.
GRANT ALL ON public.team_members TO service_role;
