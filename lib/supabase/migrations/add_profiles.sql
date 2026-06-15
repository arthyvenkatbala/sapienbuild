-- ─── Profiles table ───────────────────────────────────────────────────────────
-- One row per auth.users entry.  role = 'admin' | 'member'.
-- A trigger auto-creates the row when a user signs up via Google OAuth.
-- dilipkumarphotography@gmail.com is seeded as admin; every other email
-- defaults to 'member'.

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      text        UNIQUE NOT NULL,
  role       text        NOT NULL DEFAULT 'member'
               CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users may read only their own profile (needed for the useUserRole() hook).
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- No direct INSERT/UPDATE from the browser — the trigger handles inserts,
-- and role changes must go through the service-role admin client.

-- ─── Trigger: auto-create profile on first sign-in ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as postgres, can write to profiles
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email = 'dilipkumarphotography@gmail.com' THEN 'admin'
      ELSE 'member'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop first in case it already exists (idempotent re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── agent_settings RLS ───────────────────────────────────────────────────────
-- All reads/writes go through API routes that use the service-role key
-- (adminSupabase), so the anon key must not be able to read this table.

ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

-- Deny everything from browser clients — service role bypasses RLS anyway.
DROP POLICY IF EXISTS "agent_settings_deny_browser" ON public.agent_settings;
CREATE POLICY "agent_settings_deny_browser"
  ON public.agent_settings FOR ALL
  USING (false);
