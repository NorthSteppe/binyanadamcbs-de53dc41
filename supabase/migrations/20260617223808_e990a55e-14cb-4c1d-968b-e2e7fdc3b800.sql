
ALTER TABLE public.staff_todos ADD COLUMN IF NOT EXISTS due_time time;

CREATE TABLE IF NOT EXISTS public.business_planner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE DEFAULT 'default',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_planner TO authenticated;
GRANT ALL ON public.business_planner TO service_role;

ALTER TABLE public.business_planner ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='business_planner'
      AND policyname='Admins manage business planner'
  ) THEN
    CREATE POLICY "Admins manage business planner"
      ON public.business_planner
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;
