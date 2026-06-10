CREATE TABLE public.calendar_hour_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#1e3a8a',
  info text NOT NULL DEFAULT '',
  day_of_week smallint,
  specific_date date,
  start_minutes integer NOT NULL DEFAULT 0,
  end_minutes integer NOT NULL DEFAULT 60,
  allow_booking boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_hour_rules_target_chk CHECK (
    (day_of_week IS NOT NULL AND day_of_week BETWEEN 0 AND 6)
    OR specific_date IS NOT NULL
  ),
  CONSTRAINT calendar_hour_rules_time_chk CHECK (
    start_minutes >= 0 AND end_minutes > start_minutes AND end_minutes <= 1440
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_hour_rules TO authenticated;
GRANT ALL ON public.calendar_hour_rules TO service_role;

ALTER TABLE public.calendar_hour_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage calendar hour rules"
  ON public.calendar_hour_rules
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated users can view calendar hour rules"
  ON public.calendar_hour_rules
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX calendar_hour_rules_day_idx ON public.calendar_hour_rules (day_of_week);
CREATE INDEX calendar_hour_rules_date_idx ON public.calendar_hour_rules (specific_date);

CREATE TRIGGER touch_calendar_hour_rules
  BEFORE UPDATE ON public.calendar_hour_rules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

CREATE OR REPLACE FUNCTION public.get_calendar_rules_for_range(_start date, _end date)
RETURNS SETOF public.calendar_hour_rules
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT * FROM public.calendar_hour_rules
  WHERE specific_date IS NOT NULL AND specific_date BETWEEN _start AND _end
     OR (specific_date IS NULL AND day_of_week IS NOT NULL);
$$;

GRANT EXECUTE ON FUNCTION public.get_calendar_rules_for_range(date, date) TO anon, authenticated;