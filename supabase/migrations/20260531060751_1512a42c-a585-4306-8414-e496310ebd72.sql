
-- 1) assistant_config: explicit admin-only SELECT (RLS already denies others by default; this satisfies scanner)
CREATE POLICY "Admins can view assistant config"
ON public.assistant_config
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) client_todos: enforce WITH CHECK + trigger so clients can only flip is_completed
DROP POLICY IF EXISTS "Clients can mark own todos complete" ON public.client_todos;
CREATE POLICY "Clients can mark own todos complete"
ON public.client_todos
FOR UPDATE
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE OR REPLACE FUNCTION public.client_todos_restrict_client_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins and assigned staff to update freely
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_id = NEW.client_id AND ca.assignee_id = auth.uid()
  ) THEN
    RETURN NEW;
  END IF;

  -- For clients editing their own todo, restrict to is_completed only
  IF auth.uid() = OLD.client_id THEN
    IF NEW.title       IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.due_date    IS DISTINCT FROM OLD.due_date
       OR NEW.created_by  IS DISTINCT FROM OLD.created_by
       OR NEW.client_id   IS DISTINCT FROM OLD.client_id
       OR NEW.manual_client_id IS DISTINCT FROM OLD.manual_client_id
    THEN
      RAISE EXCEPTION 'Clients may only update the completion status of their todos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS client_todos_restrict_client_columns_trg ON public.client_todos;
CREATE TRIGGER client_todos_restrict_client_columns_trg
BEFORE UPDATE ON public.client_todos
FOR EACH ROW EXECUTE FUNCTION public.client_todos_restrict_client_columns();

-- 3) supervision_competencies: supervisors can read their own
CREATE POLICY "Supervisors view their competencies"
ON public.supervision_competencies
FOR SELECT
TO authenticated
USING (supervisor_id = auth.uid());

-- 4) supervision_supervisor_input: supervisors can read records for competencies they own
CREATE POLICY "Supervisors view their supervisor input"
ON public.supervision_supervisor_input
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.supervision_competencies sc
  WHERE sc.id = supervision_supervisor_input.competency_id
    AND sc.supervisor_id = auth.uid()
));
