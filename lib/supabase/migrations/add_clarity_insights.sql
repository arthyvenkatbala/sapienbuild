-- Clarity Data Export API — per-URL page-level behavioural metrics.
-- Populated by the daily cron at /api/cron/clarity-insights.
-- Upsert key: (url, date) — one row per page per day, never overwritten.

CREATE TABLE IF NOT EXISTS public.clarity_page_insights (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  url              text        NOT NULL,
  date             date        NOT NULL,
  traffic          integer,                  -- totalSessionCount
  engagement_time  numeric,                  -- average seconds
  scroll_depth     numeric,                  -- 0–1  (e.g. 0.72 = 72 %)
  dead_clicks      integer,
  rage_clicks      integer,
  quickback_clicks integer,
  excessive_scroll integer,
  raw_metrics      jsonb,                    -- full raw information[] per URL for debugging
  fetched_at       timestamptz DEFAULT now(),
  UNIQUE (url, date)
);

ALTER TABLE public.clarity_page_insights ENABLE ROW LEVEL SECURITY;
-- Deny all browser access — server role (service key) only
CREATE POLICY "clarity_insights_deny_browser"
  ON public.clarity_page_insights FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_clarity_insights_date ON public.clarity_page_insights (date DESC);
CREATE INDEX IF NOT EXISTS idx_clarity_insights_url  ON public.clarity_page_insights (url);
