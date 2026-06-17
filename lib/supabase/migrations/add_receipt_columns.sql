-- Run in Supabase Dashboard → SQL Editor
-- Adds receipt PDF storage to payments rows

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS receipt_pdf_data text,
  ADD COLUMN IF NOT EXISTS receipt_number   text;
