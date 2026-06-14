
-- Tighten act_matrix_entries: team members must use their own filled_by
DROP POLICY IF EXISTS "Team members can manage assigned client ACT entries" ON public.act_matrix_entries;
CREATE POLICY "Team members can manage assigned client ACT entries"
  ON public.act_matrix_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.client_assignments ca
                 WHERE ca.client_id = act_matrix_entries.user_id
                   AND ca.assignee_id = auth.uid()))
  WITH CHECK (filled_by = auth.uid()
              AND EXISTS (SELECT 1 FROM public.client_assignments ca
                          WHERE ca.client_id = act_matrix_entries.user_id
                            AND ca.assignee_id = auth.uid()));

-- Guard trigger for client_todos: clients may only flip is_completed (already exists as
-- client_todos_restrict_client_columns function — ensure trigger is attached)
DROP TRIGGER IF EXISTS client_todos_restrict_client_columns_trg ON public.client_todos;
CREATE TRIGGER client_todos_restrict_client_columns_trg
  BEFORE UPDATE ON public.client_todos
  FOR EACH ROW EXECUTE FUNCTION public.client_todos_restrict_client_columns();

-- Guard trigger for fba_intake_assignments: clients may only update status / submitted_at / response fields
CREATE OR REPLACE FUNCTION public.guard_fba_intake_client_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.client_id THEN
    NEW.assigned_by    := OLD.assigned_by;
    NEW.child_name     := OLD.child_name;
    NEW.notes          := OLD.notes;
    NEW.client_id      := OLD.client_id;
    NEW.created_at     := OLD.created_at;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_fba_intake_client_update_trg ON public.fba_intake_assignments;
CREATE TRIGGER guard_fba_intake_client_update_trg
  BEFORE UPDATE ON public.fba_intake_assignments
  FOR EACH ROW EXECUTE FUNCTION public.guard_fba_intake_client_update();

-- Guard trigger for client_pathway_steps: clients may only update status / completed_at
CREATE OR REPLACE FUNCTION public.guard_pathway_step_client_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.client_id THEN
    NEW.link          := OLD.link;
    NEW.description   := OLD.description;
    NEW.label         := OLD.label;
    NEW.icon          := OLD.icon;
    NEW.display_order := OLD.display_order;
    NEW.template_id   := OLD.template_id;
    NEW.client_id     := OLD.client_id;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_pathway_step_client_update_trg ON public.client_pathway_steps;
CREATE TRIGGER guard_pathway_step_client_update_trg
  BEFORE UPDATE ON public.client_pathway_steps
  FOR EACH ROW EXECUTE FUNCTION public.guard_pathway_step_client_update();

-- Guard trigger for support_agreements: clients may only add their signature
CREATE OR REPLACE FUNCTION public.guard_support_agreement_client_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'team_member'::public.app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.client_id THEN
    IF NEW.body IS DISTINCT FROM OLD.body
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.client_id IS DISTINCT FROM OLD.client_id THEN
      RAISE EXCEPTION 'Clients may only update signature fields on support agreements';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_support_agreement_client_update_trg ON public.support_agreements;
CREATE TRIGGER guard_support_agreement_client_update_trg
  BEFORE UPDATE ON public.support_agreements
  FOR EACH ROW EXECUTE FUNCTION public.guard_support_agreement_client_update();
