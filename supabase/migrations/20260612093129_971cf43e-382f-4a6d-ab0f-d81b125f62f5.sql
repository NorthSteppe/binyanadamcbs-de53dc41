
ALTER TABLE public.therapist_payout_batches
  ADD COLUMN IF NOT EXISTS xero_bill_id text,
  ADD COLUMN IF NOT EXISTS xero_pushed_at timestamptz;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS xero_contact_id text;
