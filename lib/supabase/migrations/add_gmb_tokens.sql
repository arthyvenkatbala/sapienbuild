-- Google My Business OAuth tokens
CREATE TABLE IF NOT EXISTS gmb_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token  text NOT NULL,
  refresh_token text,
  expiry        timestamptz,
  account_name  text,
  location_name text,
  location_id   text,
  created_at    timestamptz DEFAULT now()
);
