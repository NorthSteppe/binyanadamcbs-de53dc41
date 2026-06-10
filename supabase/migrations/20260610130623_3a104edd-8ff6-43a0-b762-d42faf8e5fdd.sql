
-- 1. New columns for deferred invoicing
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS xero_invoice_pending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS xero_invoice_raised_at timestamptz,
  ADD COLUMN IF NOT EXISTS xero_invoice_id text;

CREATE INDEX IF NOT EXISTS idx_sessions_xero_invoice_pending
  ON public.sessions (xero_invoice_pending, session_date)
  WHERE xero_invoice_pending = true AND xero_invoice_raised_at IS NULL;

-- 2. RLS — let assigned therapist view/update their own sessions
DROP POLICY IF EXISTS "Assigned therapists can view their sessions" ON public.sessions;
CREATE POLICY "Assigned therapists can view their sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = therapist_id);

DROP POLICY IF EXISTS "Assigned therapists can update their sessions" ON public.sessions;
CREATE POLICY "Assigned therapists can update their sessions"
  ON public.sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = therapist_id)
  WITH CHECK (auth.uid() = therapist_id);

-- 3. Relax financial guard so the assigned therapist can tick their payout
CREATE OR REPLACE FUNCTION public.guard_session_financial_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF has_role(auth.uid(), 'team_member'::app_role) THEN
    IF TG_OP = 'UPDATE' THEN
      -- Assigned therapist may tick their own payout off, nothing else financial
      IF OLD.therapist_id IS NOT NULL AND auth.uid() = OLD.therapist_id THEN
        -- Preserve rate / batch / who-changed-what fields they shouldn't touch
        NEW.therapist_rate_cents := OLD.therapist_rate_cents;
        NEW.therapist_payout_batch_id := OLD.therapist_payout_batch_id;
        -- Force paid_by to the therapist themselves when they mark paid
        IF NEW.therapist_paid IS DISTINCT FROM OLD.therapist_paid AND NEW.therapist_paid = true THEN
          NEW.therapist_paid_by := auth.uid();
          IF NEW.therapist_paid_at IS NULL THEN
            NEW.therapist_paid_at := now();
          END IF;
        END IF;
      ELSE
        -- Non-assigned team members: cannot touch any payout field
        NEW.therapist_rate_cents := OLD.therapist_rate_cents;
        NEW.therapist_paid := OLD.therapist_paid;
        NEW.therapist_paid_at := OLD.therapist_paid_at;
        NEW.therapist_paid_by := OLD.therapist_paid_by;
        NEW.therapist_payout_method := OLD.therapist_payout_method;
        NEW.therapist_payout_batch_id := OLD.therapist_payout_batch_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Clients: cannot modify any financial / operational protected field
  IF TG_OP = 'INSERT' THEN
    NEW.is_paid := false;
    NEW.payment_method := '';
    NEW.paid_at := NULL;
    NEW.paid_confirmed_by := NULL;
    NEW.price_cents := 0;
    NEW.therapist_rate_cents := 0;
    NEW.therapist_paid := false;
    NEW.therapist_paid_at := NULL;
    NEW.therapist_paid_by := NULL;
    NEW.therapist_payout_method := '';
    NEW.therapist_payout_batch_id := NULL;
    NEW.plaud_recording_id := NULL;
    NEW.xero_invoice_pending := false;
    NEW.xero_invoice_raised_at := NULL;
    NEW.xero_invoice_id := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_paid IS DISTINCT FROM OLD.is_paid
       OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
       OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
       OR NEW.paid_confirmed_by IS DISTINCT FROM OLD.paid_confirmed_by
       OR NEW.price_cents IS DISTINCT FROM OLD.price_cents
       OR NEW.therapist_rate_cents IS DISTINCT FROM OLD.therapist_rate_cents
       OR NEW.therapist_paid IS DISTINCT FROM OLD.therapist_paid
       OR NEW.therapist_paid_at IS DISTINCT FROM OLD.therapist_paid_at
       OR NEW.therapist_paid_by IS DISTINCT FROM OLD.therapist_paid_by
       OR NEW.therapist_payout_method IS DISTINCT FROM OLD.therapist_payout_method
       OR NEW.therapist_payout_batch_id IS DISTINCT FROM OLD.therapist_payout_batch_id
       OR NEW.plaud_recording_id IS DISTINCT FROM OLD.plaud_recording_id
       OR NEW.xero_invoice_pending IS DISTINCT FROM OLD.xero_invoice_pending
       OR NEW.xero_invoice_raised_at IS DISTINCT FROM OLD.xero_invoice_raised_at
       OR NEW.xero_invoice_id IS DISTINCT FROM OLD.xero_invoice_id
    THEN
      RAISE EXCEPTION 'Clients cannot modify financial or operational session fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. Notify therapist when they're assigned (new or reassigned)
CREATE OR REPLACE FUNCTION public.notify_therapist_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  client_name TEXT;
  msg TEXT;
BEGIN
  IF NEW.therapist_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.therapist_id = OLD.therapist_id THEN RETURN NEW; END IF;

  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;
  msg := 'You are assigned to "' || NEW.title || '" on '
         || to_char(NEW.session_date, 'DD Mon YYYY HH24:MI');
  IF NEW.therapist_rate_cents > 0 THEN
    msg := msg || ' · payout £' || to_char(NEW.therapist_rate_cents::numeric / 100, 'FM999990.00');
  END IF;

  PERFORM public.create_notification(
    NEW.therapist_id,
    'session',
    'Session assigned to you',
    msg,
    '/staff/my-payouts'
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS sessions_notify_therapist_assignment ON public.sessions;
CREATE TRIGGER sessions_notify_therapist_assignment
  AFTER INSERT OR UPDATE OF therapist_id ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_therapist_assignment();
