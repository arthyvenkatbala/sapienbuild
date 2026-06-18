import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000006";

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json() as { access_token: string; expires_in: number };
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await adminSupabase
    .from("google_ads_tokens")
    .update({ access_token: data.access_token, expiry })
    .eq("id", TOKEN_ROW_ID);
  return data.access_token;
}

function gaqlDateRange(days: number): { start: string; end: string } {
  const today = new Date();
  const end   = today.toISOString().split("T")[0];
  const past  = new Date(today);
  past.setDate(past.getDate() - days);
  const start = past.toISOString().split("T")[0];
  return { start, end };
}

const EMPTY_RESPONSE = (customerId: string | null, accountName: string | null) => ({
  connected:    true,
  customer_id:  customerId,
  account_name: accountName,
  totalSpend:   0,
  clicks:       0,
  conversions:  0,
  campaigns:    [] as unknown[],
  synced_at:    new Date().toISOString(),
});

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);

  const { data: row } = await adminSupabase
    .from("google_ads_tokens")
    .select("access_token, refresh_token, expiry, customer_id, account_name")
    .maybeSingle();

  if (!row?.access_token) {
    return NextResponse.json({ connected: false });
  }

  const customerId = row.customer_id ?? process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "");
  const devToken   = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!customerId || !devToken) {
    return NextResponse.json({
      ...EMPTY_RESPONSE(row.customer_id, row.account_name),
      error: "GOOGLE_ADS_CUSTOMER_ID or GOOGLE_ADS_DEVELOPER_TOKEN not configured",
    });
  }

  // Refresh if expiring within 60 seconds
  let accessToken = row.access_token;
  if (row.refresh_token && row.expiry && new Date(row.expiry).getTime() < Date.now() + 60_000) {
    const refreshed = await refreshAccessToken(row.refresh_token);
    if (refreshed) accessToken = refreshed;
  }

  const { start, end } = gaqlDateRange(days);
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.clicks,
      metrics.conversions
    FROM campaign
    WHERE segments.date >= '${start}'
      AND segments.date <= '${end}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 20
  `;

  try {
    const res = await fetch(
      `https://googleads.googleapis.com/v24/customers/${customerId}/googleAds:search`,
      {
        method:  "POST",
        headers: {
          Authorization:     `Bearer ${accessToken}`,
          "developer-token": devToken,
          "Content-Type":    "application/json",
        },
        body:  JSON.stringify({ query }),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[Google Ads] API returned", res.status, errText);
      return NextResponse.json({
        ...EMPTY_RESPONSE(customerId, row.account_name),
        error: `Google Ads API error ${res.status}: ${errText.slice(0, 200)}`,
      });
    }

    type AdsResult = {
      campaign:  { id: string; name: string; status: string };
      metrics:   { costMicros?: string; clicks?: string; conversions?: string };
    };
    const adsData = await res.json() as { results?: AdsResult[] };
    const results = adsData.results ?? [];

    const campaigns = results.map((r) => ({
      id:          r.campaign.id,
      name:        r.campaign.name,
      status:      r.campaign.status,
      spend:       Math.round((Number(r.metrics.costMicros ?? 0) / 1_000_000) * 100) / 100,
      clicks:      Number(r.metrics.clicks ?? 0),
      conversions: Math.round(Number(r.metrics.conversions ?? 0) * 10) / 10,
    }));

    return NextResponse.json({
      connected:    true,
      customer_id:  customerId,
      account_name: row.account_name,
      totalSpend:   Math.round(campaigns.reduce((s, c) => s + c.spend,       0) * 100) / 100,
      clicks:       campaigns.reduce((s, c) => s + c.clicks,      0),
      conversions:  Math.round(campaigns.reduce((s, c) => s + c.conversions, 0) * 10) / 10,
      campaigns,
      synced_at:    new Date().toISOString(),
    });
  } catch (e) {
    console.error("[Google Ads] Fetch failed:", e);
    return NextResponse.json({
      ...EMPTY_RESPONSE(customerId, row.account_name),
      error: "Failed to fetch Google Ads data",
    });
  }
}
