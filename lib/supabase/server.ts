import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// Cookie-aware Supabase client for use in Server Components, Server Actions,
// and Route Handlers.  Reads and refreshes the session from request cookies.
export async function createSupabaseServerClient() {
  const cookieStore: ReadonlyRequestCookies = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (cookieStore as any).set(name, value, options),
            );
          } catch {
            // setAll is called from Server Components where cookies are read-only;
            // the middleware handles the actual refresh write.
          }
        },
      },
    },
  );
}
