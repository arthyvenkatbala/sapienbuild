-- ============================================================
-- ONE THOUSAND TALES CRM — Supabase Schema
-- Run this in the Supabase SQL editor (once, in order)
-- ============================================================

-- ── clients table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clients (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name           text NOT NULL DEFAULT '',
  owner_name              text NOT NULL DEFAULT '',
  email                   text NOT NULL DEFAULT '',
  phone                   text NOT NULL DEFAULT '',
  -- Meta / Facebook Ads
  meta_ad_account_id      text,
  meta_access_token       text,
  meta_user_id            text,
  -- Google Ads
  google_customer_id      text,
  google_refresh_token    text,
  google_ads_account_name text,
  -- Platform tracking
  connected_platforms     text[] NOT NULL DEFAULT '{}',
  last_synced_at          timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clients_updated_at ON public.clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ad_metrics table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ad_metrics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform    text NOT NULL CHECK (platform IN ('meta', 'google')),
  date        date NOT NULL,
  spend       numeric(12,2) NOT NULL DEFAULT 0,
  clicks      integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  ctr         numeric(8,4) NOT NULL DEFAULT 0,
  leads       integer NOT NULL DEFAULT 0,
  cpl         numeric(12,2) NOT NULL DEFAULT 0,
  roas        numeric(8,4) NOT NULL DEFAULT 0,
  raw_data    jsonb,
  synced_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, platform, date)
);

CREATE INDEX IF NOT EXISTS ad_metrics_client_id_idx  ON public.ad_metrics (client_id);
CREATE INDEX IF NOT EXISTS ad_metrics_date_idx       ON public.ad_metrics (date DESC);
CREATE INDEX IF NOT EXISTS ad_metrics_platform_idx   ON public.ad_metrics (platform);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- The service role key (used in API routes) bypasses RLS automatically.
-- These policies prevent the anon/public key from accessing sensitive data.

ALTER TABLE public.clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

-- Service role has full access (implicit bypass — no policy needed).
-- Anon key: no access to clients (tokens must never reach the browser).
-- If you later add Supabase Auth, replace 'false' with:
--   auth.uid() = owner_user_id   (add an owner_user_id column)

CREATE POLICY "block_anon_clients" ON public.clients
  FOR ALL TO anon USING (false);

CREATE POLICY "block_anon_ad_metrics" ON public.ad_metrics
  FOR ALL TO anon USING (false);
