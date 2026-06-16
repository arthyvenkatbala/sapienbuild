import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000004";

export async function GET(request: NextRequest) {
  const APP_URL = request.nextUrl.origin;
  const code  = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/social/settings?calendar=error`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  `${APP_URL}/api/calendar/callback`,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[Calendar callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${APP_URL}/social/settings?calendar=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
  };

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error: dbErr } = await adminSupabase
    .from("google_calendar_tokens")
    .upsert({
      id:            TOKEN_ROW_ID,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry,
    });

  if (dbErr) {
    console.error("[Calendar callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${APP_URL}/social/settings?calendar=error`);
  }

  return NextResponse.redirect(`${APP_URL}/social/settings?calendar=connected`);
}
