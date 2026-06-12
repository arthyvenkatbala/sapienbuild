-- Run these in Supabase Dashboard → SQL Editor
-- Or via: supabase db push (if using local dev)

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_data       text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name    text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS event_dates    text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS events_list    text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS location       text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_type  text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_note  text;
