import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000005";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/social/settings?ga4=error`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri  = `${origin}/api/ga4/callback`;

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
    console.error("[GA4 callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${origin}/social/settings?ga4=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:   string;
    refresh_token?: string;
    expires_in:     number;
  };
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // ── Step 2: Auto-detect first GA4 property via Admin API ─────────────────
  // Falls back to GA4_PROPERTY_ID env var if detection fails.
  let propertyId: string | null = process.env.GA4_PROPERTY_ID ?? null;
  try {
    const accountsRes = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accounts",
      { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" },
    );
    if (accountsRes.ok) {
      const accountsData = await accountsRes.json() as { accounts?: Array<{ name: string }> };
      const firstAccount = accountsData.accounts?.[0]?.name;
      if (firstAccount) {
        const propsRes = await fetch(
          `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:${firstAccount}`,
          { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" },
        );
        if (propsRes.ok) {
          const propsData = await propsRes.json() as { properties?: Array<{ name: string }> };
          propertyId = propsData.properties?.[0]?.name ?? propertyId;
        }
      }
    }
  } catch (e) {
    console.warn("[GA4 callback] Could not auto-detect property ID:", e);
  }

  // ── Step 3: Upsert token row ──────────────────────────────────────────────
  const { error: dbErr } = await adminSupabase
    .from("ga4_tokens")
    .upsert({
      id:            TOKEN_ROW_ID,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry,
      property_id:   propertyId,
    });

  if (dbErr) {
    console.error("[GA4 callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${origin}/social/settings?ga4=error`);
  }

  return NextResponse.redirect(`${origin}/social/settings?ga4=connected`);
}
