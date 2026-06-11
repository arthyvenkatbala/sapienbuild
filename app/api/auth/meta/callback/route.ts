import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase-admin";

const META_APP_ID     = process.env.NEXT_PUBLIC_META_APP_ID ?? process.env.META_APP_ID ?? "";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const META_REDIRECT_URI = `${APP_URL}/api/auth/meta/callback`;
const META_GRAPH        = "https://graph.facebook.com/v21.0";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code     = searchParams.get("code");
  const stateB64 = searchParams.get("state");
  const denied   = searchParams.get("error");

  // ── Decode state ──────────────────────────────────────────────────────────
  let clientId: string;
  try {
    const decoded = JSON.parse(Buffer.from(stateB64 ?? "", "base64url").toString());
    clientId = decoded.clientId;
    const nonce = decoded.nonce;

    // Verify nonce cookie
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get("oauth_meta_nonce")?.value;
    cookieStore.delete("oauth_meta_nonce");

    if (!storedNonce || storedNonce !== nonce) {
      return redirectError(clientId, "csrf_failed");
    }
  } catch {
    return NextResponse.redirect(`${APP_URL}/clients?error=invalid_state`);
  }

  // ── User denied authorization ─────────────────────────────────────────────
  if (denied) {
    return redirectError(clientId, "access_denied");
  }

  if (!code) {
    return redirectError(clientId, "no_code");
  }

  try {
    // ── Step 1: Exchange code for short-lived token ──────────────────────────
    const tokenRes = await fetch(
      `${META_GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          client_id:     META_APP_ID,
          client_secret: META_APP_SECRET,
          redirect_uri:  META_REDIRECT_URI,
          code,
        }),
      { cache: "no-store" }
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[meta/callback] token exchange failed:", tokenData);
      return redirectError(clientId, "token_exchange_failed");
    }

    const shortLivedToken: string = tokenData.access_token;

    // ── Step 2: Exchange for long-lived token (60-day) ─────────────────────
    const longRes = await fetch(
      `${META_GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          grant_type:       "fb_exchange_token",
          client_id:        META_APP_ID,
          client_secret:    META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        }),
      { cache: "no-store" }
    );
    const longData = await longRes.json();
    const accessToken: string = longData.access_token ?? shortLivedToken;

    // ── Step 3: Get user profile ─────────────────────────────────────────────
    const userRes = await fetch(
      `${META_GRAPH}/me?fields=id,name,email&access_token=${accessToken}`,
      { cache: "no-store" }
    );
    const userData = await userRes.json();
    const metaUserId: string = userData.id ?? "";

    // ── Step 4: Get ad accounts ──────────────────────────────────────────────
    const adAccountsRes = await fetch(
      `${META_GRAPH}/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`,
      { cache: "no-store" }
    );
    const adAccountsData = await adAccountsRes.json();
    const firstAccount   = adAccountsData.data?.[0];
    const adAccountId: string = firstAccount?.id ?? "";

    // ── Step 5: Upsert into Supabase ─────────────────────────────────────────
    // Fetch current connected_platforms
    const { data: existing } = await adminSupabase
      .from("clients")
      .select("connected_platforms")
      .eq("id", clientId)
      .maybeSingle();

    const platforms = existing?.connected_platforms ?? [];
    if (!platforms.includes("meta")) platforms.push("meta");

    const { error: upsertError } = await adminSupabase
      .from("clients")
      .update({
        meta_access_token:   accessToken,
        meta_ad_account_id:  adAccountId,
        meta_user_id:        metaUserId,
        connected_platforms: platforms,
      })
      .eq("id", clientId);

    if (upsertError) {
      console.error("[meta/callback] supabase update error:", upsertError);
      return redirectError(clientId, "db_error");
    }

    return NextResponse.redirect(`${APP_URL}/clients/${clientId}?connected=meta`);
  } catch (err) {
    console.error("[meta/callback] unexpected error:", err);
    return redirectError(clientId, "unexpected_error");
  }
}

function redirectError(clientId: string, code: string) {
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return NextResponse.redirect(`${APP_URL}/clients/${clientId}?error=${code}`);
}
