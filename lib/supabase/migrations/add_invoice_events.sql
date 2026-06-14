-- Run in Supabase Dashboard → SQL Editor

-- 1. Events per quote/invoice (one row per ceremony/function, e.g. Haldi, Wedding, Reception)
CREATE TABLE IF NOT EXISTS public.invoice_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid        NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  event_name  text        NOT NULL DEFAULT 'Event 1',
  event_date  text,                          -- free text, e.g. "15 Nov 2025"
  sort_order  integer     NOT NULL DEFAULT 1,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice
  ON public.invoice_events(invoice_id, sort_order);

-- 2. Backward compatibility: every existing invoice that already has line items
--    gets a single default "Event 1" row so old PDFs still render correctly.
INSERT INTO public.invoice_events (invoice_id, event_name, sort_order)
SELECT  id, 'Event 1', 1
FROM    public.invoices
WHERE   line_items   IS NOT NULL
  AND   jsonb_typeof(line_items) = 'array'
  AND   jsonb_array_length(line_items) > 0
ON CONFLICT DO NOTHING;
