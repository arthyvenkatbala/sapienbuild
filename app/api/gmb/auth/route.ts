import { NextResponse } from "next/server";

const GMB_REDIRECT_URI = "https://sapienbuild.vercel.app/api/gmb/callback";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not configured." },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  GMB_REDIRECT_URI,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/business.manage",
    access_type:   "offline",
    prompt:        "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
}
