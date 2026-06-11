import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase-admin";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const GOOGLE_REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "Missing client_id parameter" }, { status: 400 });
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID is not configured" }, { status: 500 });
  }

  // Verify the client exists
  const { data: client, error } = await adminSupabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Generate nonce for CSRF protection
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ clientId, nonce })).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set("oauth_google_nonce", nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600,
    path:     "/",
  });

  // Build Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id",     GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri",  GOOGLE_REDIRECT_URI);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope",         GOOGLE_SCOPES);
  googleAuthUrl.searchParams.set("access_type",   "offline");
  googleAuthUrl.searchParams.set("prompt",        "consent"); // always request refresh token
  googleAuthUrl.searchParams.set("state",         state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
