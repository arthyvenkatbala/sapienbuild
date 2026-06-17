import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000005";

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
    .from("ga4_tokens")
    .update({ access_token: data.access_token, expiry })
    .eq("id", TOKEN_ROW_ID);
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);

  const { data: row } = await adminSupabase
    .from("ga4_tokens")
    .select("access_token, refresh_token, expiry, property_id")
    .maybeSingle();

  if (!row?.access_token) {
    return NextResponse.json({ connected: false });
  }

  const propertyId = row.property_id ?? process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json({
      connected: true,
      error:     "GA4 property ID not found. Set GA4_PROPERTY_ID env var or reconnect to auto-detect.",
    });
  }

  // Refresh token if expiring within 60 seconds
  let accessToken = row.access_token;
  if (row.refresh_token && row.expiry && new Date(row.expiry).getTime() < Date.now() + 60_000) {
    const refreshed = await refreshAccessToken(row.refresh_token);
    if (refreshed) accessToken = refreshed;
  }

  const startDate = `${days}daysAgo`;
  const apiUrl    = `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`;
  const headers   = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  try {
    // Run both requests concurrently: totals + traffic sources breakdown
    const [overviewRes, sourcesRes] = await Promise.all([
      fetch(apiUrl, {
        method:  "POST",
        headers,
        body:    JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          metrics:    [{ name: "sessions" }, { name: "totalUsers" }, { name: "bounceRate" }],
        }),
        cache: "no-store",
      }),
      fetch(apiUrl, {
        method:  "POST",
        headers,
        body:    JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics:    [{ name: "sessions" }],
          orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
          limit:      5,
        }),
        cache: "no-store",
      }),
    ]);

    type MetricValue  = { value: string };
    type DimValue     = { value: string };
    type OverviewBody = { totals?: Array<{ metricValues: MetricValue[] }>; rows?: Array<{ metricValues: MetricValue[] }> };
    type SourcesBody  = { rows?: Array<{ dimensionValues: DimValue[]; metricValues: MetricValue[] }> };

    const [overviewData, sourcesData] = await Promise.all([
      overviewRes.json() as Promise<OverviewBody>,
      sourcesRes.json()  as Promise<SourcesBody>,
    ]);

    // Totals field appears when no dimensions specified; fall back to first row
    const metricValues = overviewData.totals?.[0]?.metricValues ?? overviewData.rows?.[0]?.metricValues ?? [];
    const sessions     = Number(metricValues[0]?.value ?? 0);
    const users        = Number(metricValues[1]?.value ?? 0);
    const bounceRate   = Math.round(Number(metricValues[2]?.value ?? 0) * 100) / 100;

    const topSources = (sourcesData.rows ?? []).map((r) => ({
      source:   r.dimensionValues[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues[0]?.value ?? 0),
    }));

    return NextResponse.json({
      connected:  true,
      sessions,
      users,
      bounceRate,
      topSources,
      synced_at:  new Date().toISOString(),
    });
  } catch (e) {
    console.error("[GA4] Fetch failed:", e);
    return NextResponse.json({ connected: true, error: "Failed to fetch GA4 data" });
  }
}
