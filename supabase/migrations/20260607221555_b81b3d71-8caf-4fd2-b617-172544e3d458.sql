
-- Xero connection (single org per practice)
CREATE TABLE public.xero_connection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  tenant_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  connected_by UUID REFERENCES auth.users(id),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xero_connection TO authenticated;
GRANT ALL ON public.xero_connection TO service_role;
ALTER TABLE public.xero_connection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage xero connection" ON public.xero_connection
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Cached AR invoices
CREATE TABLE public.xero_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xero_invoice_id TEXT NOT NULL UNIQUE,
  invoice_number TEXT,
  contact_name TEXT,
  status TEXT,
  type TEXT,
  issue_date DATE,
  due_date DATE,
  fully_paid_on_date DATE,
  currency_code TEXT,
  sub_total NUMERIC(14,2) DEFAULT 0,
  total_tax NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  amount_due NUMERIC(14,2) DEFAULT 0,
  amount_paid NUMERIC(14,2) DEFAULT 0,
  raw JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xero_invoices TO authenticated;
GRANT ALL ON public.xero_invoices TO service_role;
ALTER TABLE public.xero_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view xero invoices" ON public.xero_invoices
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Service role writes xero invoices" ON public.xero_invoices
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX xero_invoices_status_idx ON public.xero_invoices(status);
CREATE INDEX xero_invoices_issue_date_idx ON public.xero_invoices(issue_date);

-- Monthly P&L cache
CREATE TABLE public.xero_pnl_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_start DATE NOT NULL UNIQUE,
  revenue NUMERIC(14,2) DEFAULT 0,
  expenses NUMERIC(14,2) DEFAULT 0,
  net_profit NUMERIC(14,2) DEFAULT 0,
  currency_code TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xero_pnl_monthly TO authenticated;
GRANT ALL ON public.xero_pnl_monthly TO service_role;
ALTER TABLE public.xero_pnl_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view xero pnl" ON public.xero_pnl_monthly
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Service role writes xero pnl" ON public.xero_pnl_monthly
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Update triggers
CREATE TRIGGER touch_xero_connection BEFORE UPDATE ON public.xero_connection
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER touch_xero_invoices BEFORE UPDATE ON public.xero_invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
CREATE TRIGGER touch_xero_pnl_monthly BEFORE UPDATE ON public.xero_pnl_monthly
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at_generic();
