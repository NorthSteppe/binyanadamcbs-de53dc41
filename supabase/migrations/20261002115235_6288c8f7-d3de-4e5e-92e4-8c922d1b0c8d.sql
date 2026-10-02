CREATE TABLE public.quiz_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_key text NOT NULL UNIQUE,
  greeting_text text,
  heading text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_start boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.quiz_steps(id) ON DELETE CASCADE,
  label text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  next_step_id uuid REFERENCES public.quiz_steps(id) ON DELETE SET NULL,
  destination_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quiz_option_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES public.quiz_options(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_steps, public.quiz_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quiz_steps, public.quiz_options TO authenticated;
GRANT INSERT ON public.quiz_option_clicks TO anon, authenticated;
GRANT SELECT, DELETE ON public.quiz_option_clicks TO authenticated;
GRANT ALL ON public.quiz_steps, public.quiz_options, public.quiz_option_clicks TO service_role;
ALTER TABLE public.quiz_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_option_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active steps" ON public.quiz_steps FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage steps" ON public.quiz_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Public read options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Admins manage options" ON public.quiz_options FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone records click" ON public.quiz_option_clicks FOR INSERT WITH CHECK (option_id IS NOT NULL);
CREATE POLICY "Admins read clicks" ON public.quiz_option_clicks FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete clicks" ON public.quiz_option_clicks FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER touch_quiz_steps BEFORE UPDATE ON public.quiz_steps FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER touch_quiz_options BEFORE UPDATE ON public.quiz_options FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();

INSERT INTO public.quiz_steps (step_key, greeting_text, heading, display_order, is_start) VALUES
('front-door','Welcome to Blueprint. We are genuinely glad you are here. Whether you are navigating complex behaviour at home, feeling stuck in the classroom, or looking to engineer better systems within your organisation, you are in the right place. We are here to help you build a practical, workable way forward.','Let’s design your pathway. Whose environment or daily experience are we looking to enrich today?',1,true),
('families',NULL,'We start with what a genuinely good day looks like. What are we building towards for your family?',2,false),
('education',NULL,'Schools are complex ecosystems. What structural supports do you want to engineer for your staff and students?',3,false),
('therapy',NULL,'Rather than focusing on what we need to get rid of, let’s look at what needs to be added. What does a successful outcome look like for you?',4,false),
('supervision',NULL,'Clinical work requires continuous growth. How can we best elevate and support your practice?',5,false),
('organisations',NULL,'Systemic success requires structural solutions. What does a highly functional, sustainable environment look like for your team?',6,false);

INSERT INTO public.quiz_options (step_id, label, display_order, next_step_id, destination_url)
SELECT s.id, v.label, v.ord, n.id, v.url
FROM (VALUES
('front-door','I am a parent. We want to build practical, structural tools to create a calmer, more predictable family life.',1,'families',NULL),
('front-door','I am in school leadership or a SENCO. We want to engineer sustainable, proactive whole-school behaviour systems.',2,'education',NULL),
('front-door','I am looking for myself. I want to build a life, daily habits, or emotional regulation tools that actually fit how my brain works.',3,'therapy',NULL),
('front-door','I am a clinical practitioner. I am looking for technical supervision, mentoring, or a rigorous sounding board to elevate my practice.',4,'supervision',NULL),
('front-door','I lead an organisation. We want to design robust clinical governance, staff performance systems, or institutional workplace culture.',5,'organisations',NULL),
('families','We want to build smooth, predictable daily routines around transitions, bedtimes, and getting out of the house.',1,NULL,'/families'),
('families','We want to equip our family with safe, confident, and workable strategies for moments when emotions run high.',2,NULL,'/families'),
('families','We want to foster stronger, more cooperative dynamics and balance between siblings.',3,NULL,'/families'),
('families','We want to help my child discover new, effective ways to communicate exactly what they need.',4,NULL,'/therapy'),
('families','We want to support my child in building psychological flexibility, confidence, and new ways to engage with the world.',5,NULL,'/therapy'),
('families','We already have a good foundation; I just want to partner with a coach to refine and strengthen the practical strategies we use.',6,NULL,'/families'),
('education','We want to design a highly individualized, workable, and dignified support plan for a pupil with complex needs.',1,NULL,'/education'),
('education','We want to equip our staff with highly practical, compassion-led behavioural science tools for their classrooms.',2,NULL,'/education'),
('education','We want to co-design a whole-school behaviour framework that is proactive, humane, and genuinely workable on the ground.',3,NULL,'/education'),
('education','We want to build seamless, structured communication between our school, parents, CAMHS, and SEND teams.',4,NULL,'/education'),
('education','We want to create clear, actionable data tracking systems that genuinely support our pastoral leads without burying them in admin.',5,NULL,'/education'),
('therapy','I want to build a life that actively aligns with my core values and passions, rather than being directed by anxiety.',1,NULL,'/therapy'),
('therapy','I want to expand my practical toolkit for emotional regulation and learn how to ground myself safely in high-stress moments.',2,NULL,'/therapy'),
('therapy','I want to design daily habits and routines that are authentically built for my specific neurotype.',3,NULL,'/therapy'),
('supervision','I want to secure formal, structured supervision hours towards my UK-SBA, IBA, or BCBA credentials.',1,NULL,'/supervision'),
('supervision','I want to master the Constructional approach and learn to build effective Goldiamond-style matrices.',2,NULL,'/supervision'),
('supervision','I want to engage in rigorous, deep-dive formulation to ensure my intervention designs for complex cases are highly effective and ethical.',3,NULL,'/supervision'),
('supervision','I want to learn how to practically weave Acceptance and Commitment Therapy (ACT) into my functional behaviour plans.',4,NULL,'/supervision'),
('organisations','We want to design feedback loops and operational structures that actively reinforce and support staff performance and well-being.',1,NULL,'/organisations'),
('organisations','We want to engineer a long-term cultural shift to align our everyday practices with our core institutional values.',2,NULL,'/organisations'),
('organisations','We want to build robust clinical governance and operational oversight to support our expanding services.',3,NULL,'/organisations'),
('organisations','We want to establish clear, systematic, and highly reliable standards for our safeguarding and behavioral compliance protocols.',4,NULL,'/organisations')
) AS v(step_key,label,ord,next_key,url)
JOIN public.quiz_steps s ON s.step_key = v.step_key
LEFT JOIN public.quiz_steps n ON n.step_key = v.next_key;