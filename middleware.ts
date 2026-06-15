// Protects /social/settings — admin-only route.
// All other routes in the app remain publicly accessible.
//
// Flow:
//   No session              → /login?next=/social/settings
//   Session but non-admin   → /social?access=denied
//   Session and admin       → pass through (also refreshes session cookie)

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies to both the request and the response so
          // the next server render and the browser both see the new tokens.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT server-side (not just a cookie read).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/social/settings");
    return NextResponse.redirect(loginUrl);
  }

  // Check role in profiles table.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/social?access=denied", request.url));
  }

  return response;
}

export const config = {
  // Only run middleware on this one route.
  matcher: ["/social/settings"],
};
