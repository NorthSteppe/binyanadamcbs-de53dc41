
-- 1. Restrict service_options.therapist_rate_cents to admins only
REVOKE ALL ON public.service_options FROM anon, authenticated;

GRANT SELECT (
  id, name, description, duration_minutes, is_active, display_order,
  created_at, updated_at, price_cents, stripe_price_id,
  show_duration, show_price
) ON public.service_options TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.service_options TO authenticated;
GRANT ALL ON public.service_options TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_service_options()
RETURNS SETOF public.service_options
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.service_options
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'team_member'::app_role)
  ORDER BY display_order;
$$;

REVOKE ALL ON FUNCTION public.admin_list_service_options() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_service_options() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_service_option_rate(
  _id uuid,
  _rate_cents integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _rate_cents IS NULL OR _rate_cents < 0 THEN
    RAISE EXCEPTION 'Invalid rate';
  END IF;
  UPDATE public.service_options
     SET therapist_rate_cents = _rate_cents,
         updated_at = now()
   WHERE id = _id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_service_option_rate(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_service_option_rate(uuid, integer) TO authenticated;

-- 2. Anon insert policy for assistant_collected_data
DROP POLICY IF EXISTS "Anon can insert collected data for anon conversations"
  ON public.assistant_collected_data;

CREATE POLICY "Anon can insert collected data for anon conversations"
  ON public.assistant_collected_data
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.assistant_conversations c
       WHERE c.id = assistant_collected_data.conversation_id
         AND c.user_id IS NULL
    )
  );
