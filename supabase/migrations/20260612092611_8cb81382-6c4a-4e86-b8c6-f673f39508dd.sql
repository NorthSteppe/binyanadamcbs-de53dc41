
-- 1) Lock down sensitive therapist financial columns on sessions
REVOKE SELECT (therapist_rate_cents, therapist_paid, therapist_paid_at, therapist_paid_by, therapist_payout_method, therapist_payout_batch_id)
  ON public.sessions FROM anon, authenticated;

-- 2) Allow supervisors to read journal entries for their linked supervisees
CREATE POLICY "Supervisors view linked supervisee journal"
  ON public.supervision_journal
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.supervision_competencies sc
      WHERE sc.supervisee_id = supervision_journal.supervisee_id
        AND sc.supervisor_id = auth.uid()
    )
  );
