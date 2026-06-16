// Site-wide auth gate.
//
// Roles: admin (full access) | executive (everything except settings/agent
// trigger) | member (signed in, not yet approved) | none (no session).
//
// Flow:
//   Public path                          → pass through, no auth check
//   No session, page route                → /login?next=<path>
//   No session, API route                 → 401 JSON
//   Session, admin-only path, role!=admin → /access-denied (or 403 JSON)
//   Session, role is member/none          → /access-denied (or 403 JSON)
//   Session, role admin/executive         → pass through

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Paths that bypass auth entirely — login itself, OAuth callbacks (Supabase
// Auth + the app's own Google/Meta/GSC/GMB/YouTube/Calendar integrations),
// and externally-called endpoints (webhooks, cron, public lead forms).
const PUBLIC_PREFIXES = [
  "/login",
  "/access-denied",
  "/auth/callback",
  "/api/auth/google",
  "/api/auth/meta",
  "/api/gsc/auth",
  "/api/gsc/callback",
  "/api/gmb/auth",
  "/api/gmb/callback",
  "/api/youtube/auth",
  "/api/youtube/callback",
  "/api/calendar/auth",
  "/api/calendar/callback",
  "/api/website-enquiry",
  "/api/meta-leads",
  "/api/cron",
];

// Admin-only paths — Executive can reach everything else.
const ADMIN_ONLY_PREFIXES = [
  "/social/settings",
  "/api/agent/trigger",
  "/api/agent/run-weekly",
  "/api/admin",
];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matches(pathname, PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
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
    if (isApi) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "member";

  if (matches(pathname, ADMIN_ONLY_PREFIXES)) {
    if (role !== "admin") {
      if (isApi) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      return NextResponse.redirect(new URL("/access-denied?reason=admin", request.url));
    }
    return response;
  }

  if (role !== "admin" && role !== "executive") {
    if (isApi) return NextResponse.json({ error: "Your account is pending approval" }, { status: 403 });
    return NextResponse.redirect(new URL("/access-denied?reason=pending", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
