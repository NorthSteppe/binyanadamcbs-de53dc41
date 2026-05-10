
-- 1) Restrict team_members public exposure: drop broad public SELECT,
--    expose safe columns only via a view.
DROP POLICY IF EXISTS "Anyone can view active team members" ON public.team_members;

-- Allow team members themselves to read their own full row (incl. rate)
CREATE POLICY "Team members can view their own row"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public view excluding the financial column
CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = true) AS
SELECT
  id, name, role, bio, initials, slug, avatar_url, display_order,
  is_active, credentials, signature_url, social_linkedin,
  social_twitter, social_website, user_id, long_bio,
  profile_image_url, created_at, updated_at
FROM public.team_members
WHERE is_active = true;

-- The view inherits RLS from the underlying table via security_invoker.
-- Add a public SELECT policy gated to the safe columns by way of the view:
CREATE POLICY "Public can view active team members (safe columns)"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Re-revoke the financial column from anon/authenticated as defense in depth
REVOKE SELECT (default_session_rate_cents) ON public.team_members FROM anon, authenticated;

GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- 2) Notifications: team members can only notify clients assigned to them
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

CREATE POLICY "Admins can insert any notification"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can notify their assigned clients"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'team_member'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.assignee_id = auth.uid()
        AND ca.client_id = notifications.user_id
    )
  );

-- 3) assistant_collected_data: prevent cross-user pollution via conversation_id
DROP POLICY IF EXISTS "Authenticated can insert own collected data" ON public.assistant_collected_data;

CREATE POLICY "Users can insert own collected data tied to own conversation"
  ON public.assistant_collected_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.assistant_conversations c
      WHERE c.id = assistant_collected_data.conversation_id
        AND c.user_id = auth.uid()
    )
  );
