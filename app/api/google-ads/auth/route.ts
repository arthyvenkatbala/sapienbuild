// Initiates Google OAuth for Google Ads (adwords scope).
// Requires: GOOGLE_CLIENT_ID (shared with GSC/GMB/Calendar) and
// GOOGLE_ADS_DEVELOPER_TOKEN env vars. Google Ads API must be enabled
// in the Google Cloud project, and the developer token must be approved
// (or used in test mode with a test manager account).
// Both https://www.onethousandtalescrm.com/api/google-ads/callback and
// https://sapienbuild.vercel.app/api/google-ads/callback must be
// registered as Authorized redirect URIs in Google Cloud Console.
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID not configured." }, { status: 500 });
  }

  const redirectUri = `${request.nextUrl.origin}/api/google-ads/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/adwords",
    access_type:   "offline",
    prompt:        "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
