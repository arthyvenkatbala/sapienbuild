-- Google Ads OAuth tokens (marketing dashboard — separate from per-client ads sync)
CREATE TABLE IF NOT EXISTS public.google_ads_tokens (
  id            uuid        PRIMARY KEY,
  access_token  text        NOT NULL,
  refresh_token text,
  expiry        timestamptz,
  customer_id   text,       -- numeric, e.g. "3797214027"
  account_name  text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.google_ads_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all browser access — API routes use the service-role key (adminSupabase).
DROP POLICY IF EXISTS "google_ads_tokens_deny_browser" ON public.google_ads_tokens;
CREATE POLICY "google_ads_tokens_deny_browser"
  ON public.google_ads_tokens FOR ALL
  USING (false);
