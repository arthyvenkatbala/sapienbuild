-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS last_service_date     date,
  ADD COLUMN IF NOT EXISTS service_interval_days integer,
  ADD COLUMN IF NOT EXISTS next_service_due      date,
  ADD COLUMN IF NOT EXISTS service_notes         text;

-- Optional index for the cron query (assets due for service)
CREATE INDEX IF NOT EXISTS idx_assets_next_service ON public.assets (next_service_due)
  WHERE next_service_due IS NOT NULL;
