
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS actual_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS actual_end_at   timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at    timestamptz,
  ADD COLUMN IF NOT EXISTS live_notes      text DEFAULT '';

INSERT INTO public.feature_flags (key, label, description, category, is_system, display_order)
VALUES ('staff.session-room','Session room','Live in-session workspace with timer, templates, and clinical tools','staff', true, 75)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_feature_access (role, feature_key, enabled)
VALUES ('admin','staff.session-room',true), ('team_member','staff.session-room',true)
ON CONFLICT (role, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;
