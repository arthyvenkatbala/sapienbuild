import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { getYouTubeChannelInfo } from "@/lib/youtube/postShort";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const code  = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/social/settings?youtube=error`);
  }

  const clientId     = process.env.YOUTUBE_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;
  const redirectUri  = process.env.YOUTUBE_REDIRECT_URI!;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[YouTube callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${APP_URL}/social/settings?youtube=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
  };

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Fetch channel info
  const channelInfo = await getYouTubeChannelInfo(tokens.access_token).catch(() => null);

  // Upsert token (only one row ever)
  const { error: dbErr } = await adminSupabase
    .from("youtube_tokens")
    .upsert({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry,
      channel_id:   channelInfo?.channelId ?? null,
      channel_name: channelInfo?.channelName ?? null,
    });

  if (dbErr) {
    console.error("[YouTube callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${APP_URL}/social/settings?youtube=error`);
  }

  return NextResponse.redirect(`${APP_URL}/social/settings?youtube=connected`);
}
