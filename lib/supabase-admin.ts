import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created when first called from an API route.
// This avoids module-evaluation errors during Next.js static build.
let _client: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl)    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  _client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return _client;
}

// Convenience proxy — all routes can use `adminSupabase.from(...)` directly.
// This object delegates every property access to the lazily created client.
export const adminSupabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getAdminSupabase(), prop);
  },
});
