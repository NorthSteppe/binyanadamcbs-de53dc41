CREATE TABLE public.pathway_quiz_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index INTEGER NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  subtitle TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_start BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pathway_quiz_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pathway_quiz_slides TO authenticated;
GRANT ALL ON public.pathway_quiz_slides TO service_role;

ALTER TABLE public.pathway_quiz_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slides"
ON public.pathway_quiz_slides FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert slides"
ON public.pathway_quiz_slides FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update slides"
ON public.pathway_quiz_slides FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete slides"
ON public.pathway_quiz_slides FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER touch_pathway_quiz_slides
BEFORE UPDATE ON public.pathway_quiz_slides
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

-- Seed initial slides
INSERT INTO public.pathway_quiz_slides (order_index, question, subtitle, is_start, options) VALUES
(0, 'Who are you looking for support for?', 'Let''s point you in the right direction.', true,
  '[
    {"label":"For myself","description":"I''m exploring support for me.","action":{"type":"next","value":"self"}},
    {"label":"For someone I care for","description":"A child, family member, or person I support.","action":{"type":"next","value":"carer"}},
    {"label":"For my organisation","description":"Schools, clinics, or workplaces.","action":{"type":"route","value":"/organisations"}}
  ]'::jsonb),
(1, 'What best describes what you''re navigating?', 'Pick whatever feels closest — you can always change paths later.', false,
  '[
    {"label":"ADHD or focus challenges","description":"Attention, organisation, executive function.","action":{"type":"route","value":"/services"}},
    {"label":"Anxiety or low mood","description":"Stress, worry, motivation, mood.","action":{"type":"route","value":"/therapy"}},
    {"label":"Behavioural support","description":"Patterns I''d like to understand and shift.","action":{"type":"route","value":"/families"}},
    {"label":"I''m not sure yet","description":"Help me figure it out.","action":{"type":"route","value":"/contact"}}
  ]'::jsonb);