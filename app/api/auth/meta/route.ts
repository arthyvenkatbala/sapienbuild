import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase-admin";

const META_APP_ID =
  process.env.NEXT_PUBLIC_META_APP_ID ?? process.env.META_APP_ID ?? "";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const META_REDIRECT_URI = `${APP_URL}/api/auth/meta/callback`;

const META_SCOPES = [
  "ads_read",
  "ads_management",
  "business_management",
  "email",
  "public_profile",
].join(",");

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "Missing client_id parameter" }, { status: 400 });
  }

  if (!META_APP_ID) {
    return NextResponse.json({ error: "META_APP_ID is not configured" }, { status: 500 });
  }

  // Verify the client exists in Supabase
  const { data: client, error } = await adminSupabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Generate a nonce for CSRF protection
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ clientId, nonce })).toString("base64url");

  // Store nonce in a short-lived HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("oauth_meta_nonce", nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600, // 10 minutes
    path:     "/",
  });

  // Build Meta OAuth URL
  const metaAuthUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  metaAuthUrl.searchParams.set("client_id",     META_APP_ID);
  metaAuthUrl.searchParams.set("redirect_uri",  META_REDIRECT_URI);
  metaAuthUrl.searchParams.set("scope",         META_SCOPES);
  metaAuthUrl.searchParams.set("response_type", "code");
  metaAuthUrl.searchParams.set("state",         state);

  return NextResponse.redirect(metaAuthUrl.toString());
}
