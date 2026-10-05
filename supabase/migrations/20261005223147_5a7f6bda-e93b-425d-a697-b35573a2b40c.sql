DROP POLICY IF EXISTS "Authenticated users can view calendar hour rules" ON public.calendar_hour_rules;
CREATE POLICY "Staff can view calendar hour rules" ON public.calendar_hour_rules
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'team_member'::app_role));

DROP POLICY IF EXISTS "Public read options" ON public.quiz_options;
CREATE POLICY "Public read options of active steps" ON public.quiz_options
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.quiz_steps s WHERE s.id = quiz_options.step_id AND s.is_active = true));