-- Run in Supabase Dashboard → SQL Editor

-- 1. Payment installment ledger
CREATE TABLE IF NOT EXISTS public.payments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid        NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  project_id   uuid        REFERENCES public.projects(id)  ON DELETE SET NULL,
  amount       numeric     NOT NULL,
  payment_type text        NOT NULL DEFAULT 'advance',  -- advance | partial | balance | full
  payment_date date        NOT NULL DEFAULT CURRENT_DATE,
  method       text,        -- UPI | Bank Transfer | Cash | Cheque | Other
  notes        text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice  ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_project  ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_date     ON public.payments(payment_date DESC);

-- 2. RLS — open for all roles on this internal tool (tighten if multi-tenant)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_all_access" ON public.payments
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Enable realtime for live balance updates
--    (Also go to Supabase Dashboard → Database → Replication → payments → enable)
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
