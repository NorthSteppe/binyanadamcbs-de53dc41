-- 1. Restrict public read on team_members financial column
REVOKE SELECT (default_session_rate_cents) ON public.team_members FROM anon, authenticated;

-- 2. Revoke EXECUTE on trigger-only SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.notify_therapists_journal() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_therapists_session_topic() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_session_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_staff_todo_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admins_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_admins_team_request() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_on_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_session_financial_fields() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_story_sources() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_payout_batches() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at_generic() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_pathway_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_staff_integrations() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_support_agreements_updated_at() FROM anon, authenticated, PUBLIC;

-- 3. Restrict create_notification — should only be called from triggers/edge functions, not by signed-in users directly
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM anon, authenticated, PUBLIC;

-- 4. Restrict queue/admin helpers from anon/auth (already locked but enforce)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_posts() FROM anon, authenticated, PUBLIC;