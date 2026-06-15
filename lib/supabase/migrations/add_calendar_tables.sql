-- Run in Supabase Dashboard → SQL Editor

-- 1. Studio Google Calendar OAuth tokens (single-row table, same pattern as gsc_tokens / gmb_tokens)
CREATE TABLE IF NOT EXISTS public.google_calendar_tokens (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token  text        NOT NULL,
  refresh_token text,
  expiry        timestamptz,
  calendar_id   text        DEFAULT 'primary',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;
-- Never exposed to the browser — deny all browser access, server role only
CREATE POLICY "calendar_tokens_deny_browser" ON public.google_calendar_tokens FOR ALL USING (false);

-- 2. Team allocations per project
CREATE TABLE IF NOT EXISTS public.project_team_assignments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid        NOT NULL REFERENCES public.projects(id)  ON DELETE CASCADE,
  team_member_id    uuid        NOT NULL REFERENCES public.contacts(id)   ON DELETE CASCADE,
  role              text,
  calendar_event_id text,        -- Google Calendar event ID stored after booking (idempotent updates)
  synced_at         timestamptz, -- last time the calendar event was created/updated
  created_at        timestamptz DEFAULT now(),
  UNIQUE (project_id, team_member_id)
);
ALTER TABLE public.project_team_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_all_access" ON public.project_team_assignments
  FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_pta_project ON public.project_team_assignments (project_id);
CREATE INDEX IF NOT EXISTS idx_pta_member  ON public.project_team_assignments (team_member_id);
