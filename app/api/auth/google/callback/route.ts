import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSupabase } from "@/lib/supabase-admin";

const GOOGLE_CLIENT_ID     = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_DEV_TOKEN     = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const GOOGLE_REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

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

    const cookieStore = await cookies();
    const storedNonce = cookieStore.get("oauth_google_nonce")?.value;
    cookieStore.delete("oauth_google_nonce");

    if (!storedNonce || storedNonce !== nonce) {
      return redirectError(clientId, "csrf_failed");
    }
  } catch {
    return NextResponse.redirect(`${APP_URL}/clients?error=invalid_state`);
  }

  if (denied) return redirectError(clientId, "access_denied");
  if (!code)  return redirectError(clientId, "no_code");

  try {
    // ── Step 1: Exchange code for tokens ───────────────────────────────────
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  GOOGLE_REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
      cache: "no-store",
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[google/callback] token exchange failed:", tokenData);
      return redirectError(clientId, "token_exchange_failed");
    }

    const accessToken:  string = tokenData.access_token;
    const refreshToken: string = tokenData.refresh_token ?? "";

    // ── Step 2: Get user info ─────────────────────────────────────────────
    const userRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache:   "no-store",
    });
    const userData = await userRes.json();
    // userData.email is useful for display but not stored in clients table

    // ── Step 3: List accessible Google Ads customers ──────────────────────
    let googleCustomerId    = "";
    let googleAdsAccountName = "";

    if (GOOGLE_DEV_TOKEN) {
      const adsRes = await fetch(
        "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
        {
          headers: {
            Authorization:    `Bearer ${accessToken}`,
            "developer-token": GOOGLE_DEV_TOKEN,
          },
          cache: "no-store",
        }
      );
      const adsData = await adsRes.json();

      // resourceNames format: "customers/1234567890"
      if (adsData.resourceNames?.length > 0) {
        const firstResourceName: string = adsData.resourceNames[0];
        googleCustomerId = firstResourceName.replace("customers/", "");

        // Get the customer details for the account name
        const customerRes = await fetch(
          `https://googleads.googleapis.com/v17/customers/${googleCustomerId}`,
          {
            headers: {
              Authorization:           `Bearer ${accessToken}`,
              "developer-token":        GOOGLE_DEV_TOKEN,
              "login-customer-id":      googleCustomerId,
            },
            cache: "no-store",
          }
        );
        const customerData = await customerRes.json();
        googleAdsAccountName =
          customerData.descriptiveName ?? customerData.id ?? googleCustomerId;
      }
    } else {
      // Developer token not configured — store partial connection
      // The refresh token is still saved so metrics can be synced later
      console.warn(
        "[google/callback] GOOGLE_ADS_DEVELOPER_TOKEN not set; " +
        "customer ID will be empty until configured."
      );
      googleCustomerId     = userData.email ?? ""; // use email as fallback display
      googleAdsAccountName = userData.name  ?? "Google Account";
    }

    // ── Step 4: Upsert into Supabase ──────────────────────────────────────
    const { data: existing } = await adminSupabase
      .from("clients")
      .select("connected_platforms")
      .eq("id", clientId)
      .maybeSingle();

    const platforms = existing?.connected_platforms ?? [];
    if (!platforms.includes("google")) platforms.push("google");

    const { error: upsertError } = await adminSupabase
      .from("clients")
      .update({
        google_refresh_token:     refreshToken,
        google_customer_id:       googleCustomerId,
        google_ads_account_name:  googleAdsAccountName,
        connected_platforms:      platforms,
      })
      .eq("id", clientId);

    if (upsertError) {
      console.error("[google/callback] supabase update error:", upsertError);
      return redirectError(clientId, "db_error");
    }

    return NextResponse.redirect(`${APP_URL}/clients/${clientId}?connected=google`);
  } catch (err) {
    console.error("[google/callback] unexpected error:", err);
    return redirectError(clientId, "unexpected_error");
  }
}

function redirectError(clientId: string, code: string) {
  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return NextResponse.redirect(`${APP_URL}/clients/${clientId}?error=${code}`);
}
