import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

async function refreshGmbToken(refreshToken: string): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { access_token?: string };
  return data.access_token ?? null;
}

export async function GET() {
  const { data: tokenRow } = await adminSupabase
    .from("gmb_tokens")
    .select("access_token, refresh_token, expiry, account_name, location_id")
    .eq("id", "00000000-0000-0000-0000-000000000003")
    .single();

  if (!tokenRow?.refresh_token) {
    return NextResponse.json({ connected: false });
  }

  let accessToken = tokenRow.access_token;
  if (!tokenRow.expiry || new Date(tokenRow.expiry) < new Date(Date.now() + 60_000)) {
    const refreshed = await refreshGmbToken(tokenRow.refresh_token);
    if (!refreshed) return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    accessToken = refreshed;
  }

  const locationName = tokenRow.location_id;
  if (!locationName) {
    return NextResponse.json({ connected: true, profileViews: 0, directionRequests: 0, calls: 0, websiteClicks: 0 });
  }

  const endDate   = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://businessprofileperformance.googleapis.com/v1/${locationName}:fetchMultiDailyMetricsTimeSeries?dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_MAPS&dailyMetric=BUSINESS_IMPRESSIONS_MOBILE_MAPS&dailyMetric=CALL_CLICKS&dailyMetric=WEBSITE_CLICKS&dailyMetric=DIRECTION_REQUESTS&dailyRange.start_date.year=${startDate.slice(0,4)}&dailyRange.start_date.month=${parseInt(startDate.slice(5,7),10)}&dailyRange.start_date.day=${parseInt(startDate.slice(8,10),10)}&dailyRange.end_date.year=${endDate.slice(0,4)}&dailyRange.end_date.month=${parseInt(endDate.slice(5,7),10)}&dailyRange.end_date.day=${parseInt(endDate.slice(8,10),10)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      return NextResponse.json({ connected: true, profileViews: 0, directionRequests: 0, calls: 0, websiteClicks: 0 });
    }

    const json = await res.json() as {
      multiDailyMetricTimeSeries?: Array<{
        dailyMetric: string;
        dailySubEntityType?: string;
        timeSeries?: { datedValues?: Array<{ value?: string }> };
      }>;
    };

    const sum = (metric: string) =>
      (json.multiDailyMetricTimeSeries ?? [])
        .filter((m) => m.dailyMetric === metric)
        .flatMap((m) => m.timeSeries?.datedValues ?? [])
        .reduce((s, v) => s + parseInt(v.value ?? "0", 10), 0);

    const profileViews      = sum("BUSINESS_IMPRESSIONS_DESKTOP_MAPS") + sum("BUSINESS_IMPRESSIONS_MOBILE_MAPS");
    const calls             = sum("CALL_CLICKS");
    const websiteClicks     = sum("WEBSITE_CLICKS");
    const directionRequests = sum("DIRECTION_REQUESTS");

    return NextResponse.json({ connected: true, profileViews, directionRequests, calls, websiteClicks });
  } catch {
    return NextResponse.json({ connected: true, profileViews: 0, directionRequests: 0, calls: 0, websiteClicks: 0 });
  }
}
