import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const GMB_REDIRECT_URI = "https://sapienbuild.vercel.app/api/gmb/callback";
const APP_URL          = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const code  = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/social/settings?gmb=error`);
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  GMB_REDIRECT_URI,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[GMB callback] Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${APP_URL}/social/settings?gmb=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
  };

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const bearer = `Bearer ${tokens.access_token}`;

  let accountName:  string | null = null;
  let locationName: string | null = null;
  let locationId:   string | null = null;

  try {
    // Fetch GMB accounts
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: bearer } },
    );

    if (accountsRes.ok) {
      const accountsData = await accountsRes.json() as {
        accounts?: Array<{ name: string; accountName: string }>;
      };
      const account = accountsData.accounts?.[0];

      if (account) {
        accountName = account.accountName ?? account.name ?? null;

        // Fetch first location for this account
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
          { headers: { Authorization: bearer } },
        );

        if (locRes.ok) {
          const locData = await locRes.json() as {
            locations?: Array<{ name: string; title: string }>;
          };
          const loc = locData.locations?.[0];
          if (loc) {
            locationId   = loc.name ?? null;
            locationName = loc.title ?? null;
          }
        }
      }
    }
  } catch {
    // Non-fatal — token still stored without business info
  }

  // Upsert token (only one row ever)
  const { error: dbErr } = await adminSupabase
    .from("gmb_tokens")
    .upsert({
      id:            "00000000-0000-0000-0000-000000000003",
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry,
      account_name:  accountName,
      location_name: locationName,
      location_id:   locationId,
    });

  if (dbErr) {
    console.error("[GMB callback] DB upsert failed:", dbErr);
    return NextResponse.redirect(`${APP_URL}/social/settings?gmb=error`);
  }

  return NextResponse.redirect(`${APP_URL}/social/settings?gmb=connected`);
}
