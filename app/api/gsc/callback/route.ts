import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const GSC_REDIRECT_URI = "https://sapienbuild.vercel.app/api/gsc/callback";
const APP_URL          = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const code  = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/social/settings?gsc=error`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  GSC_REDIRECT_URI,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[GSC callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${APP_URL}/social/settings?gsc=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
  };

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Fetch the first verified site from Search Console
  let siteUrl: string | null = null;
  try {
    const sitesRes = await fetch(
      "https://www.googleapis.com/webmasters/v3/sites",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (sitesRes.ok) {
      const sitesData = await sitesRes.json() as {
        siteEntry?: Array<{ siteUrl: string; permissionLevel: string }>;
      };
      siteUrl = sitesData.siteEntry?.[0]?.siteUrl ?? null;
    }
  } catch {
    // Non-fatal — token still stored without site_url
  }

  // Upsert token (only one row ever, keyed by id=1)
  const { error: dbErr } = await adminSupabase
    .from("gsc_tokens")
    .upsert({
      id:            "00000000-0000-0000-0000-000000000002",
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry,
      site_url:      siteUrl,
    });

  if (dbErr) {
    console.error("[GSC callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${APP_URL}/social/settings?gsc=error`);
  }

  return NextResponse.redirect(`${APP_URL}/social/settings?gsc=connected`);
}
