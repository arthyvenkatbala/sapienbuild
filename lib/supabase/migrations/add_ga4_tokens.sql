-- Google Analytics 4 OAuth tokens
CREATE TABLE IF NOT EXISTS public.ga4_tokens (
  id            uuid        PRIMARY KEY,
  access_token  text        NOT NULL,
  refresh_token text,
  expiry        timestamptz,
  property_id   text,       -- e.g. "properties/123456789" (auto-detected on auth)
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.ga4_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all browser access — API routes use the service-role key (adminSupabase).
DROP POLICY IF EXISTS "ga4_tokens_deny_browser" ON public.ga4_tokens;
CREATE POLICY "ga4_tokens_deny_browser"
  ON public.ga4_tokens FOR ALL
  USING (false);
