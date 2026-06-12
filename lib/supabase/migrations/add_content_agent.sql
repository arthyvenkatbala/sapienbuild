-- ─── Content Agent Migration ────────────────────────────────────────────────
-- Run this in Supabase SQL Editor before using the Social / AI Agent features.

-- ── 1. content_suggestions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_suggestions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start            date NOT NULL,
  day_of_week           int  NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  content_type          text NOT NULL CHECK (content_type IN ('post','reel')),
  drive_file_id         text,
  drive_file_name       text,
  drive_file_url        text,
  drive_thumbnail_url   text,
  caption               text,
  hashtags              text[]  DEFAULT ARRAY[]::text[],
  suggested_time        time,
  suggested_day_label   text,
  platforms             text[]  DEFAULT ARRAY[]::text[],
  posting_reason        text,
  content_theme         text,
  status                text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','edited','skipped','posted')),
  approved_at           timestamptz,
  caption_edited        text,
  posted_at             timestamptz,
  facebook_post_id      text,
  youtube_video_id      text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_week_start
  ON content_suggestions (week_start);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_status
  ON content_suggestions (status);

-- ── 2. content_agent_runs ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_agent_runs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date              date NOT NULL DEFAULT CURRENT_DATE,
  week_start            date NOT NULL,
  photos_scanned        int  NOT NULL DEFAULT 0,
  videos_scanned        int  NOT NULL DEFAULT 0,
  suggestions_generated int  NOT NULL DEFAULT 0,
  status                text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','completed','failed')),
  error_message         text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_week_start
  ON content_agent_runs (week_start);

-- ── 3. agent_settings ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_settings (
  id                             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photos_folder_id               text,
  videos_folder_id               text,
  caption_tone                   text NOT NULL DEFAULT 'storytelling',
  always_include_hashtags        text[] NOT NULL DEFAULT ARRAY[
    '#OneTh ousandTales','#WeddingPhotography','#Chennai','#DilipKumar'
  ],
  blackout_days                  int[]  NOT NULL DEFAULT ARRAY[]::int[],
  min_days_between_same_wedding  int    NOT NULL DEFAULT 3,
  use_ai_times                   boolean NOT NULL DEFAULT true,
  updated_at                     timestamptz NOT NULL DEFAULT now()
);

-- Insert a single default row so settings always exist.
INSERT INTO agent_settings (
  id,
  caption_tone,
  always_include_hashtags,
  blackout_days,
  min_days_between_same_wedding,
  use_ai_times
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'storytelling',
  ARRAY['#OneTh ousandTales','#WeddingPhotography','#Chennai','#CandidWedding','#WeddingFilm'],
  ARRAY[]::int[],
  3,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ── 4. youtube_tokens ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS youtube_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token  text NOT NULL,
  refresh_token text NOT NULL,
  expiry        timestamptz NOT NULL,
  channel_id    text,
  channel_name  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 5. updated_at triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_content_suggestions_updated_at'
  ) THEN
    CREATE TRIGGER set_content_suggestions_updated_at
      BEFORE UPDATE ON content_suggestions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_agent_settings_updated_at'
  ) THEN
    CREATE TRIGGER set_agent_settings_updated_at
      BEFORE UPDATE ON agent_settings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_youtube_tokens_updated_at'
  ) THEN
    CREATE TRIGGER set_youtube_tokens_updated_at
      BEFORE UPDATE ON youtube_tokens
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
