-- Run in Supabase Dashboard → SQL Editor
-- Adds rejected status, rejection tracking, and run metadata for social redesign

-- 1. Add 'rejected' to content_suggestions status CHECK
ALTER TABLE public.content_suggestions
  DROP CONSTRAINT IF EXISTS content_suggestions_status_check;
ALTER TABLE public.content_suggestions
  ADD CONSTRAINT content_suggestions_status_check
    CHECK (status IN ('pending','approved','edited','skipped','posted','rejected'));

-- 2. Add rejected_at timestamp to content_suggestions
ALTER TABLE public.content_suggestions
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

-- 3. Add run provenance to content_agent_runs
ALTER TABLE public.content_agent_runs
  ADD COLUMN IF NOT EXISTS generated_by text NOT NULL DEFAULT 'cron'
    CHECK (generated_by IN ('cron','manual'));
ALTER TABLE public.content_agent_runs
  ADD COLUMN IF NOT EXISTS triggered_by_user_id text;

-- 4. Index for rejected items (exclusion query in agent)
CREATE INDEX IF NOT EXISTS idx_content_suggestions_rejected
  ON public.content_suggestions (drive_file_id, rejected_at)
  WHERE status = 'rejected';
