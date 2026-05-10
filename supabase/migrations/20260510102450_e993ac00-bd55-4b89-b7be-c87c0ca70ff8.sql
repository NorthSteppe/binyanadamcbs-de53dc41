
DO $$ BEGIN
  CREATE TYPE public.supervision_level AS ENUM (
    'not_started', 'beginning', 'developing_with_support', 'independent', 'leading'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.supervision_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisee_id UUID NOT NULL,
  supervisor_id UUID NOT NULL,
  parent_id UUID REFERENCES public.supervision_competencies(id) ON DELETE CASCADE,
  number TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT '',
  can_break_down BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sup_comp_supervisee ON public.supervision_competencies(supervisee_id);
CREATE INDEX idx_sup_comp_parent ON public.supervision_competencies(parent_id);
ALTER TABLE public.supervision_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage competencies" ON public.supervision_competencies FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Supervisees view own competencies" ON public.supervision_competencies FOR SELECT TO authenticated
  USING (supervisee_id = auth.uid());

CREATE TABLE public.supervision_supervisee_input (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID NOT NULL REFERENCES public.supervision_competencies(id) ON DELETE CASCADE,
  supervisee_id UUID NOT NULL,
  observations_count INTEGER NOT NULL DEFAULT 0,
  evidence TEXT NOT NULL DEFAULT '',
  self_assessment_level public.supervision_level NOT NULL DEFAULT 'not_started',
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competency_id)
);
ALTER TABLE public.supervision_supervisee_input ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage supervisee input" ON public.supervision_supervisee_input FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Supervisees view own input" ON public.supervision_supervisee_input FOR SELECT TO authenticated
  USING (supervisee_id = auth.uid());
CREATE POLICY "Supervisees insert own input" ON public.supervision_supervisee_input FOR INSERT TO authenticated
  WITH CHECK (supervisee_id = auth.uid());
CREATE POLICY "Supervisees update own input" ON public.supervision_supervisee_input FOR UPDATE TO authenticated
  USING (supervisee_id = auth.uid()) WITH CHECK (supervisee_id = auth.uid());

CREATE TABLE public.supervision_supervisor_input (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id UUID NOT NULL REFERENCES public.supervision_competencies(id) ON DELETE CASCADE,
  supervisee_id UUID NOT NULL,
  final_level public.supervision_level NOT NULL DEFAULT 'not_started',
  status TEXT NOT NULL DEFAULT 'in_progress',
  next_goal TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competency_id)
);
ALTER TABLE public.supervision_supervisor_input ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage supervisor input" ON public.supervision_supervisor_input FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Supervisees view supervisor input" ON public.supervision_supervisor_input FOR SELECT TO authenticated
  USING (supervisee_id = auth.uid());

CREATE TABLE public.supervision_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisee_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('supervisor', 'supervisee')),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL DEFAULT 'observation',
  related_competency_id UUID REFERENCES public.supervision_competencies(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  supervisee_task TEXT NOT NULL DEFAULT '',
  supervisor_task TEXT NOT NULL DEFAULT '',
  next_check_date DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sup_journal_supervisee ON public.supervision_journal(supervisee_id);
ALTER TABLE public.supervision_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage journal" ON public.supervision_journal FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Supervisees view own journal" ON public.supervision_journal FOR SELECT TO authenticated
  USING (supervisee_id = auth.uid());
CREATE POLICY "Supervisees insert own journal" ON public.supervision_journal FOR INSERT TO authenticated
  WITH CHECK (supervisee_id = auth.uid() AND author_id = auth.uid() AND author_role = 'supervisee');
CREATE POLICY "Supervisees update own journal" ON public.supervision_journal FOR UPDATE TO authenticated
  USING (supervisee_id = auth.uid() AND author_id = auth.uid() AND author_role = 'supervisee')
  WITH CHECK (supervisee_id = auth.uid() AND author_id = auth.uid() AND author_role = 'supervisee');
CREATE POLICY "Supervisees delete own journal" ON public.supervision_journal FOR DELETE TO authenticated
  USING (supervisee_id = auth.uid() AND author_id = auth.uid() AND author_role = 'supervisee');

CREATE TRIGGER trg_sup_comp_updated BEFORE UPDATE ON public.supervision_competencies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER trg_sup_se_updated BEFORE UPDATE ON public.supervision_supervisee_input
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER trg_sup_sv_updated BEFORE UPDATE ON public.supervision_supervisor_input
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER trg_sup_journal_updated BEFORE UPDATE ON public.supervision_journal
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
