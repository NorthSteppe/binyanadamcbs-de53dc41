
-- Tighten service_options RLS: only admins/team_members can read directly.
-- Clients must use the new SECURITY DEFINER RPC which omits therapist_rate_cents and stripe_price_id.

DROP POLICY IF EXISTS "Authenticated users can view active service options" ON public.service_options;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='service_options'
      AND policyname='Staff and admins can view service options'
  ) THEN
    CREATE POLICY "Staff and admins can view service options"
      ON public.service_options FOR SELECT
      TO authenticated
      USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'team_member'::public.app_role)
      );
  END IF;
END $$;

-- Public-safe RPC: returns only client-facing columns, no rates/stripe IDs.
CREATE OR REPLACE FUNCTION public.list_active_service_options()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  duration_minutes integer,
  price_cents integer,
  is_active boolean,
  display_order integer,
  show_duration boolean,
  show_price boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, description, duration_minutes, price_cents,
         is_active, display_order, show_duration, show_price
  FROM public.service_options
  WHERE is_active = true
  ORDER BY display_order;
$$;

GRANT EXECUTE ON FUNCTION public.list_active_service_options() TO authenticated, anon;
