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

-- ── leads table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  clientname  text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  email       text NOT NULL DEFAULT '',
  source      text NOT NULL DEFAULT 'Website Enquiry',
  eventtype   text,
  campaign    text,
  status      text NOT NULL DEFAULT 'New Lead',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_client_id_idx  ON public.leads (client_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx      ON public.leads (email);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- The service role key (used in API routes) bypasses RLS automatically.
-- These policies prevent the anon/public key from accessing sensitive data.

ALTER TABLE public.clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

-- Service role has full access (implicit bypass — no policy needed).
-- Anon key: no access to clients (tokens must never reach the browser).
-- If you later add Supabase Auth, replace 'false' with:
--   auth.uid() = owner_user_id   (add an owner_user_id column)

DROP POLICY IF EXISTS "block_anon_clients" ON public.clients;
CREATE POLICY "block_anon_clients" ON public.clients
  FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "block_anon_ad_metrics" ON public.ad_metrics;
CREATE POLICY "block_anon_ad_metrics" ON public.ad_metrics
  FOR ALL TO anon USING (false);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "block_anon_leads" ON public.leads;
CREATE POLICY "block_anon_leads" ON public.leads
  FOR ALL TO anon USING (false);

-- ── Migration: add website_url to existing clients table ──────────────────────
-- Safe to run on an existing DB; does nothing if the column already exists.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS website_url text;

-- ── Migration: quotes table ───────────────────────────────────────────────────
-- Run this block in the Supabase SQL editor to enable quote persistence.

CREATE TABLE IF NOT EXISTS public.quotes (
  id                text        PRIMARY KEY,
  client_name       text        NOT NULL DEFAULT '',
  client_phone      text        NOT NULL DEFAULT '',
  client_email      text        NOT NULL DEFAULT '',
  client_location   text        NOT NULL DEFAULT '',
  event_types       jsonb       NOT NULL DEFAULT '[]',
  event_dates       text        NOT NULL DEFAULT '',
  venue_name        text        NOT NULL DEFAULT '',
  executive_name    text        NOT NULL DEFAULT '',
  executive_phone   text        NOT NULL DEFAULT '',
  executive_email   text        NOT NULL DEFAULT '',
  services          jsonb       NOT NULL DEFAULT '[]',
  add_ons           jsonb       NOT NULL DEFAULT '[]',
  discount_type     text        NOT NULL DEFAULT 'flat',
  discount_value    numeric     NOT NULL DEFAULT 0,
  subtotal          numeric     NOT NULL DEFAULT 0,
  discount_amount   numeric     NOT NULL DEFAULT 0,
  grand_total       numeric     NOT NULL DEFAULT 0,
  notes             text        NOT NULL DEFAULT '',
  status            text        NOT NULL DEFAULT 'Draft',
  valid_until       text        NOT NULL DEFAULT '',
  sent_at           text,
  viewed_at         text,
  approved_at       text,
  signature_data    text,
  follow_up_count   integer     NOT NULL DEFAULT 0,
  ai_score          integer     NOT NULL DEFAULT 0,
  ai_recommendation text        NOT NULL DEFAULT '',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotes_status_idx     ON public.quotes (status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON public.quotes (created_at DESC);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_anon_quotes" ON public.quotes;
CREATE POLICY "block_anon_quotes" ON public.quotes
  FOR ALL TO anon USING (false);

-- ============================================================
-- OTT PLATFORM SCHEMA — One Thousand Tales Operations
-- Append these tables in the Supabase SQL editor
-- ============================================================

-- ── contacts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL CHECK (type IN ('lead','client','contractor')),
  first_name  text        NOT NULL,
  last_name   text        NOT NULL DEFAULT '',
  email       text,
  phone       text,
  source      text,
  status      text        NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_service_role"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_authenticated" ON public.contacts;
CREATE POLICY "contacts_service_role"  ON public.contacts FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "contacts_authenticated" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id       uuid        REFERENCES public.contacts(id) ON DELETE SET NULL,
  title            text        NOT NULL,
  event_date       date,
  event_type       text,
  workflow_stage   text        NOT NULL DEFAULT 'enquiry'
                               CHECK (workflow_stage IN (
                                 'enquiry','discussion','quote','negotiation',
                                 'booked','execution','feedback','post_production','delivery'
                               )),
  assigned_to      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  budget           numeric,
  location         text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS projects_contact_id_idx     ON public.projects (contact_id);
CREATE INDEX IF NOT EXISTS projects_workflow_stage_idx ON public.projects (workflow_stage);
CREATE INDEX IF NOT EXISTS projects_event_date_idx     ON public.projects (event_date);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_service_role"  ON public.projects;
DROP POLICY IF EXISTS "projects_authenticated" ON public.projects;
CREATE POLICY "projects_service_role"  ON public.projects FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "projects_authenticated" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── project_tasks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  status      text        NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done')),
  assigned_to uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date    date,
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS project_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON public.project_tasks (project_id);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_tasks_service_role"  ON public.project_tasks;
DROP POLICY IF EXISTS "project_tasks_authenticated" ON public.project_tasks;
CREATE POLICY "project_tasks_service_role"  ON public.project_tasks FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "project_tasks_authenticated" ON public.project_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── workflow_events ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workflow_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  from_stage  text,
  to_stage    text        NOT NULL,
  changed_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_events_project_id_idx ON public.workflow_events (project_id);
CREATE INDEX IF NOT EXISTS workflow_events_created_at_idx ON public.workflow_events (created_at DESC);

ALTER TABLE public.workflow_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_events_service_role"  ON public.workflow_events;
DROP POLICY IF EXISTS "workflow_events_authenticated" ON public.workflow_events;
CREATE POLICY "workflow_events_service_role"  ON public.workflow_events FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "workflow_events_authenticated" ON public.workflow_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── invoices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        REFERENCES public.projects(id) ON DELETE SET NULL,
  contact_id  uuid        REFERENCES public.contacts(id) ON DELETE SET NULL,
  type        text        NOT NULL CHECK (type IN ('quote','invoice','receipt')),
  status      text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  amount      numeric     NOT NULL,
  due_date    date,
  line_items  jsonb       NOT NULL DEFAULT '[]',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON public.invoices (project_id);
CREATE INDEX IF NOT EXISTS invoices_type_idx       ON public.invoices (type);
CREATE INDEX IF NOT EXISTS invoices_status_idx     ON public.invoices (status);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON public.invoices (created_at DESC);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_service_role"  ON public.invoices;
DROP POLICY IF EXISTS "invoices_authenticated" ON public.invoices;
CREATE POLICY "invoices_service_role"  ON public.invoices FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "invoices_authenticated" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── assets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  category        text,
  serial_number   text,
  purchase_date   date,
  purchase_value  numeric,
  condition       text        NOT NULL DEFAULT 'good',
  assigned_to     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS assets_updated_at ON public.assets;
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS assets_category_idx ON public.assets (category);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assets_service_role"  ON public.assets;
DROP POLICY IF EXISTS "assets_authenticated" ON public.assets;
CREATE POLICY "assets_service_role"  ON public.assets FOR ALL TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "assets_authenticated" ON public.assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
