import { createBrowserClient } from "@supabase/ssr";

// Cookie-aware Supabase client for use in Client Components and hooks.
// Session cookies are written/read automatically by @supabase/ssr so the
// middleware and server components see the same session.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
