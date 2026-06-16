-- Adds the 'executive' role (project manager): full access to every page
-- except /social/settings and triggering the content agent, both admin-only.
-- Apply manually in the Supabase SQL editor.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'executive', 'member'));
