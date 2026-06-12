
ALTER TABLE public.team_requests
  ADD COLUMN IF NOT EXISTS requested_role text NOT NULL DEFAULT 'team_member'
  CHECK (requested_role IN ('team_member','supervisee'));

DROP TRIGGER IF EXISTS on_profile_created_notify_admins ON public.profiles;
DROP TRIGGER IF EXISTS notify_admins_new_user_trigger ON public.profiles;

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'd389bddd-baa0-42d5-a4a7-96dfd7963795';
