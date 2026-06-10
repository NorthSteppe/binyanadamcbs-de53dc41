
-- 1. Remove sensitive column SELECT from anon + authenticated on sessions
REVOKE SELECT (therapist_rate_cents, therapist_paid, therapist_paid_at, therapist_paid_by, therapist_payout_method, therapist_payout_batch_id)
  ON public.sessions FROM anon, authenticated;

-- 2. service_options.therapist_rate_cents — admins use the existing admin_list_service_options RPC
REVOKE SELECT (therapist_rate_cents) ON public.service_options FROM anon, authenticated;

-- 3. team_members.default_session_rate_cents — hide from public
REVOKE SELECT (default_session_rate_cents) ON public.team_members FROM anon, authenticated;

-- 4. Staff-only view exposing full session rows (including financial cols)
CREATE OR REPLACE VIEW public.staff_sessions
WITH (security_invoker = off) AS
  SELECT *
  FROM public.sessions
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role);

GRANT SELECT ON public.staff_sessions TO authenticated;
GRANT ALL    ON public.staff_sessions TO service_role;

-- 5. Staff-only view exposing team member default rates
CREATE OR REPLACE VIEW public.staff_team_member_rates
WITH (security_invoker = off) AS
  SELECT id, user_id, name, default_session_rate_cents, is_active
  FROM public.team_members
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role);

GRANT SELECT ON public.staff_team_member_rates TO authenticated;
GRANT ALL    ON public.staff_team_member_rates TO service_role;
