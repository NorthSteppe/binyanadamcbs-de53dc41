-- Shared store for the Business Maths / Revenue & Cost Planner.
-- A single JSON document (name = 'default') holds the whole model so admins
-- can iterate on it together. Admin-only via RLS.
CREATE TABLE IF NOT EXISTS public.business_planner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'default',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);

ALTER TABLE public.business_planner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage business planner" ON public.business_planner;
CREATE POLICY "Admins manage business planner"
  ON public.business_planner FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
