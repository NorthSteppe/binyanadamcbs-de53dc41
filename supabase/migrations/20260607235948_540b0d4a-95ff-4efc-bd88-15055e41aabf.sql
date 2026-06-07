
-- 1) Drop duplicate triggers (keep one per pair)
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
DROP TRIGGER IF EXISTS on_new_profile_notify_admins ON public.profiles;
DROP TRIGGER IF EXISTS session_notification_trigger ON public.sessions;
DROP TRIGGER IF EXISTS staff_todo_notification_trigger ON public.staff_todos;
DROP TRIGGER IF EXISTS on_team_request_notify_admins ON public.team_requests;

-- 2) Extend journal notifier to also alert admins
CREATE OR REPLACE FUNCTION public.notify_therapists_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  assignment RECORD;
  admin_record RECORD;
  notified UUID[] := ARRAY[]::UUID[];
BEGIN
  IF NEW.is_shared_with_therapist = false THEN RETURN NEW; END IF;
  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;

  FOR assignment IN SELECT assignee_id FROM public.client_assignments WHERE client_id = NEW.client_id LOOP
    PERFORM public.create_notification(assignment.assignee_id,'client_update','New journal entry',
      COALESCE(client_name,'A client')||' shared a new journal entry.','/admin/clients/'||NEW.client_id::text);
    notified := array_append(notified, assignment.assignee_id);
  END LOOP;

  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role='admin' LOOP
    IF NOT (admin_record.user_id = ANY(notified)) THEN
      PERFORM public.create_notification(admin_record.user_id,'admin','New journal entry',
        COALESCE(client_name,'A client')||' shared a new journal entry.','/admin/clients/'||NEW.client_id::text);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$function$;

-- 3) Extend session-topic notifier to also alert admins
CREATE OR REPLACE FUNCTION public.notify_therapists_session_topic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  assignment RECORD;
  admin_record RECORD;
  notified UUID[] := ARRAY[]::UUID[];
BEGIN
  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
  FOR assignment IN SELECT assignee_id FROM public.client_assignments WHERE client_id = NEW.client_id LOOP
    PERFORM public.create_notification(assignment.assignee_id,'client_update','New session topic',
      COALESCE(client_name,'A client')||' added a topic to discuss.','/admin/clients/'||NEW.client_id::text);
    notified := array_append(notified, assignment.assignee_id);
  END LOOP;
  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role='admin' LOOP
    IF NOT (admin_record.user_id = ANY(notified)) THEN
      PERFORM public.create_notification(admin_record.user_id,'admin','New session topic',
        COALESCE(client_name,'A client')||' added a topic to discuss.','/admin/clients/'||NEW.client_id::text);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$function$;

-- 4) Extend staff-todo notifier to also alert admins on create/complete
CREATE OR REPLACE FUNCTION public.notify_staff_todo_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  creator_name TEXT;
  assignee_name TEXT;
  admin_record RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO creator_name FROM public.profiles WHERE id = NEW.created_by;
    IF NEW.assigned_to != NEW.created_by THEN
      PERFORM public.create_notification(NEW.assigned_to,'task','New Task Assigned',
        COALESCE(creator_name,'Someone')||' assigned you a task: "'||NEW.title||'"','/staff/staff-todos');
    END IF;
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role='admin' LOOP
      IF admin_record.user_id NOT IN (NEW.created_by, NEW.assigned_to) THEN
        PERFORM public.create_notification(admin_record.user_id,'admin','New staff task',
          COALESCE(creator_name,'Someone')||' created a task: "'||NEW.title||'"','/staff/staff-todos');
      END IF;
    END LOOP;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true THEN
    SELECT full_name INTO assignee_name FROM public.profiles WHERE id = NEW.assigned_to;
    IF NEW.created_by != NEW.assigned_to THEN
      PERFORM public.create_notification(NEW.created_by,'task','Task Completed',
        COALESCE(assignee_name,'Someone')||' completed the task: "'||NEW.title||'"','/staff/staff-todos');
    END IF;
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role='admin' LOOP
      IF admin_record.user_id NOT IN (NEW.created_by, NEW.assigned_to) THEN
        PERFORM public.create_notification(admin_record.user_id,'admin','Task completed',
          COALESCE(assignee_name,'Someone')||' completed: "'||NEW.title||'"','/staff/staff-todos');
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;
