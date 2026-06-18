import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000006";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/social/settings?google-ads=error`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const devToken     = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";
  const redirectUri  = `${origin}/api/google-ads/callback`;

  // ── Step 1: Exchange code for tokens ─────────────────────────────────────
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
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    console.error("[Google Ads callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${origin}/social/settings?google-ads=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:   string;
    refresh_token?: string;
    expires_in:     number;
  };
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // ── Step 2: Auto-detect customer ID and account name ─────────────────────
  let customerId:  string | null = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "") ?? null;
  let accountName: string | null = null;

  if (devToken) {
    try {
      const custsRes = await fetch(
        "https://googleads.googleapis.com/v24/customers:listAccessibleCustomers",
        {
          headers: {
            Authorization:    `Bearer ${tokens.access_token}`,
            "developer-token": devToken,
          },
          cache: "no-store",
        },
      );
      if (custsRes.ok) {
        const custsData = await custsRes.json() as { resourceNames?: string[] };
        const firstResource = custsData.resourceNames?.[0];
        if (firstResource) {
          const id = firstResource.replace("customers/", "");
          if (!customerId) customerId = id;
          const custRes = await fetch(`https://googleads.googleapis.com/v24/customers/${id}`, {
            headers: {
              Authorization:    `Bearer ${tokens.access_token}`,
              "developer-token": devToken,
              "login-customer-id": id,
            },
            cache: "no-store",
          });
          if (custRes.ok) {
            const custData = await custRes.json() as { descriptiveName?: string };
            accountName = custData.descriptiveName ?? null;
          }
        }
      }
    } catch (e) {
      console.warn("[Google Ads callback] Could not fetch customer info:", e);
    }
  }

  // ── Step 3: Upsert token row ──────────────────────────────────────────────
  const { error: dbErr } = await adminSupabase
    .from("google_ads_tokens")
    .upsert({
      id:            TOKEN_ROW_ID,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry,
      customer_id:   customerId,
      account_name:  accountName,
    });

  if (dbErr) {
    console.error("[Google Ads callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${origin}/social/settings?google-ads=error`);
  }

  return NextResponse.redirect(`${origin}/social/settings?google-ads=connected`);
}
