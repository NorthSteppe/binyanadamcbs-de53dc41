
-- 1) create_notification: add authorization
CREATE OR REPLACE FUNCTION public.create_notification(_user_id uuid, _type text, _title text, _message text, _link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow when invoked from a trigger context (system-generated notifications)
  IF pg_trigger_depth() > 0 THEN
    NULL;
  ELSIF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  ELSIF _user_id = auth.uid() THEN
    NULL; -- users may notify themselves
  ELSIF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role) THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Not authorized to notify other users';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (_user_id, _type, _title, _message, _link);
END;
$function$;

-- 2) get_safe_profiles: scope rows
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
 RETURNS TABLE(id uuid, full_name text, avatar_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.avatar_url, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
    OR p.id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id
        AND ur.role IN ('admin'::public.app_role, 'team_member'::public.app_role)
    )
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE (ca.client_id = auth.uid() AND ca.assignee_id = p.id)
         OR (ca.assignee_id = auth.uid() AND ca.client_id = p.id)
    );
$function$;

-- 3) resources: drop blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can view resources" ON public.resources;

-- 4) team_members: revoke sensitive columns from anon/authenticated
REVOKE SELECT ON public.team_members FROM anon, authenticated;
GRANT SELECT (
  id, name, role, bio, initials, slug, avatar_url, display_order, is_active,
  created_at, updated_at, credentials, signature_url, social_linkedin,
  social_twitter, social_website, user_id, long_bio, profile_image_url
) ON public.team_members TO anon, authenticated;
