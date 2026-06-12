import { NextResponse } from "next/server";

export async function GET() {
  const clientId    = process.env.YOUTUBE_CLIENT_ID;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "YouTube OAuth not configured. Set YOUTUBE_CLIENT_ID and YOUTUBE_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/youtube.upload",
    access_type:   "offline",
    prompt:        "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
}
