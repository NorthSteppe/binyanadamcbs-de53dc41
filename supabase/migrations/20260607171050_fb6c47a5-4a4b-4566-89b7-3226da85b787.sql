
-- Feature flag catalogue
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  is_system boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feature_flags TO authenticated, anon;
GRANT ALL ON public.feature_flags TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feature flag catalogue"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Per-role enablement
CREATE TABLE public.role_feature_access (
  role public.app_role NOT NULL,
  feature_key text NOT NULL REFERENCES public.feature_flags(key) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  PRIMARY KEY (role, feature_key)
);

GRANT SELECT ON public.role_feature_access TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.role_feature_access TO authenticated;
GRANT ALL ON public.role_feature_access TO service_role;

ALTER TABLE public.role_feature_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read role access"
  ON public.role_feature_access FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage role access"
  ON public.role_feature_access FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed catalogue
INSERT INTO public.feature_flags (key, label, description, category, display_order) VALUES
  ('client.next-session',  'Upcoming sessions',     'Next booked session and quick booking', 'client', 10),
  ('client.messages',      'Messages',              'Direct chat with the care team',        'client', 20),
  ('client.tasks',         'Between-sessions tasks','To-dos, reflections, exercises',        'client', 30),
  ('client.resources',     'Resources',             'Shared documents and library',          'client', 40),
  ('client.toolkit',       'Toolkit',               'ACT matrix, mindfulness, pomodoro',     'client', 50),
  ('client.pathway',       'Support pathway',       'Stepped care pathway view',             'client', 60),

  ('staff.today',          'Today',                 'Today''s sessions and focus',           'staff', 10),
  ('staff.clients',        'My clients',            'Assigned clients overview',             'staff', 20),
  ('staff.notes',          'Clinical notes',        'Recent and pinned notes',               'staff', 30),
  ('staff.tasks',          'Internal tasks',        'Cross-team task board',                 'staff', 40),
  ('staff.tools',          'Clinical tools',        'ACT matrix, FBA, formulation, ABC',     'staff', 50),
  ('staff.calendar',       'Calendar',              'Personal and team calendar',            'staff', 60),

  ('sup.next-supervision', 'Next supervision',      'Upcoming supervision meeting',          'supervisee', 10),
  ('sup.caselog',          'Case log',              'BCBA-style case logs',                  'supervisee', 20),
  ('sup.competencies',     'Competencies',          'Competency progress tracker',           'supervisee', 30),
  ('sup.documents',        'Documents',             'Supervision documents',                 'supervisee', 40),

  ('admin.calendar',       'Practice calendar',     'All sessions across the practice',      'admin', 10),
  ('admin.clients',        'Clients',               'All client records',                    'admin', 20),
  ('admin.team',           'Team',                  'Team members and access requests',      'admin', 30),
  ('admin.finance',        'Finance',               'Business dashboard and payouts',        'admin', 40),
  ('admin.content',        'Site content',          'Pages, blog, hero, badges',             'admin', 50),
  ('admin.features',       'Feature toggles',       'Manage what each role sees',            'admin', 60);

-- Seed default per-role enablement
INSERT INTO public.role_feature_access (role, feature_key, enabled) VALUES
  ('client'::public.app_role,      'client.next-session', true),
  ('client'::public.app_role,      'client.messages',     true),
  ('client'::public.app_role,      'client.tasks',        true),
  ('client'::public.app_role,      'client.resources',    false),
  ('client'::public.app_role,      'client.toolkit',      false),
  ('client'::public.app_role,      'client.pathway',      true),

  ('team_member'::public.app_role, 'staff.today',         true),
  ('team_member'::public.app_role, 'staff.clients',       true),
  ('team_member'::public.app_role, 'staff.notes',         true),
  ('team_member'::public.app_role, 'staff.tasks',         true),
  ('team_member'::public.app_role, 'staff.tools',         false),
  ('team_member'::public.app_role, 'staff.calendar',      true),

  ('supervisee'::public.app_role,  'sup.next-supervision', true),
  ('supervisee'::public.app_role,  'sup.caselog',          true),
  ('supervisee'::public.app_role,  'sup.competencies',     true),
  ('supervisee'::public.app_role,  'sup.documents',        true),

  ('admin'::public.app_role,       'admin.calendar',      true),
  ('admin'::public.app_role,       'admin.clients',       true),
  ('admin'::public.app_role,       'admin.team',          true),
  ('admin'::public.app_role,       'admin.finance',       true),
  ('admin'::public.app_role,       'admin.content',       true),
  ('admin'::public.app_role,       'admin.features',      true);
