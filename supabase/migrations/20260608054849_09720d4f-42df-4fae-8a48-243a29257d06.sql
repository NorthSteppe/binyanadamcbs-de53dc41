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
      NEW.therapist_rate_cents := OLD.therapist_rate_cents;
      NEW.therapist_paid := OLD.therapist_paid;
      NEW.therapist_paid_at := OLD.therapist_paid_at;
      NEW.therapist_paid_by := OLD.therapist_paid_by;
      NEW.therapist_payout_method := OLD.therapist_payout_method;
      NEW.therapist_payout_batch_id := OLD.therapist_payout_batch_id;
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
    THEN
      RAISE EXCEPTION 'Clients cannot modify financial or operational session fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS guard_session_financial_fields_trg ON public.sessions;
CREATE TRIGGER guard_session_financial_fields_trg
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.guard_session_financial_fields();