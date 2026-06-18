// Initiates Google OAuth for GA4 (analytics.readonly scope).
// Requires: GOOGLE_CLIENT_ID — shared with GSC, GMB, Calendar.
// Both https://www.onethousandtalescrm.com/api/ga4/callback and
// https://sapienbuild.vercel.app/api/ga4/callback must be registered as
// Authorized redirect URIs in Google Cloud Console.
// Also requires: Google Analytics Data API enabled in the Cloud project.
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID not configured." }, { status: 500 });
  }

  const redirectUri = `${request.nextUrl.origin}/api/ga4/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/analytics.readonly",
    access_type:   "offline",
    prompt:        "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
