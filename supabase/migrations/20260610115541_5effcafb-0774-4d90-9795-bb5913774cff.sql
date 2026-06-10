ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS therapist_rate_cents INTEGER NOT NULL DEFAULT 0;