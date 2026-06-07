ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xero_contact_id TEXT;
ALTER TABLE public.manual_clients ADD COLUMN IF NOT EXISTS xero_contact_id TEXT;
CREATE INDEX IF NOT EXISTS profiles_xero_contact_id_idx ON public.profiles(xero_contact_id);
CREATE INDEX IF NOT EXISTS manual_clients_xero_contact_id_idx ON public.manual_clients(xero_contact_id);