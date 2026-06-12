-- Google Search Console OAuth tokens
CREATE TABLE IF NOT EXISTS gsc_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token  text NOT NULL,
  refresh_token text,
  expiry        timestamptz,
  site_url      text,
  created_at    timestamptz DEFAULT now()
);
