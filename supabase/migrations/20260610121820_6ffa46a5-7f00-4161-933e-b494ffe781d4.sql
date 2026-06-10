ALTER TABLE public.service_options
  ADD COLUMN IF NOT EXISTS show_duration boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT true;