import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

async function refreshGscToken(refreshToken: string): Promise<string | null> {
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const { data: tokenRow } = await adminSupabase
    .from("gsc_tokens")
    .select("access_token, refresh_token, expiry, site_url")
    .eq("id", "00000000-0000-0000-0000-000000000002")
    .single();

  if (!tokenRow?.refresh_token) {
    return NextResponse.json({ connected: false });
  }

  let accessToken = tokenRow.access_token;
  if (!tokenRow.expiry || new Date(tokenRow.expiry) < new Date(Date.now() + 60_000)) {
    const refreshed = await refreshGscToken(tokenRow.refresh_token);
    if (!refreshed) return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    accessToken = refreshed;
  }

  const siteUrl = tokenRow.site_url;
  if (!siteUrl) return NextResponse.json({ connected: true, clicks: 0, impressions: 0, rows: [] });

  const endDate   = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate, dimensions: ["date"], rowLimit: 28 }),
      },
    );
    if (!res.ok) return NextResponse.json({ connected: true, clicks: 0, impressions: 0, rows: [] });

    const json = await res.json() as { rows?: Array<{ keys: string[]; clicks: number; impressions: number }> };
    const rows = (json.rows ?? []).map((r) => ({
      date:        r.keys[0],
      clicks:      r.clicks,
      impressions: r.impressions,
    }));
    const clicks      = rows.reduce((s, r) => s + r.clicks, 0);
    const impressions = rows.reduce((s, r) => s + r.impressions, 0);

    return NextResponse.json({ connected: true, clicks, impressions, rows });
  } catch {
    return NextResponse.json({ connected: true, clicks: 0, impressions: 0, rows: [] });
  }
}
