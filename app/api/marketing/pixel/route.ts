import { NextRequest, NextResponse } from "next/server";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);

  const pixelId   = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token     = process.env.META_PAGE_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;

  if (!pixelId) {
    return NextResponse.json({ configured: false });
  }

  if (!token) {
    return NextResponse.json({ configured: true, pixelId, connected: false, error: "META_PAGE_ACCESS_TOKEN not configured" });
  }

  const datePreset = days <= 7 ? "last_7d" : days <= 30 ? "last_30d" : "last_90d";

  // Get basic pixel info (name, last fired time)
  let pixelName:     string | null = null;
  let lastFiredTime: string | null = null;

  try {
    const pixelRes = await fetch(
      `${GRAPH}/${pixelId}?fields=name,last_fired_time&access_token=${token}`,
      { cache: "no-store" },
    );
    if (pixelRes.ok) {
      const d = await pixelRes.json() as { name?: string; last_fired_time?: string };
      pixelName     = d.name ?? null;
      lastFiredTime = d.last_fired_time ?? null;
    }
  } catch {
    // Non-fatal — proceed with available data
  }

  // Pixel-attributed event counts from Ads Insights (ad-attributed only)
  let pageViews = 0, leads = 0, purchases = 0;

  if (accountId) {
    try {
      const insightsRes = await fetch(
        `${GRAPH}/act_${accountId}/insights?fields=actions&date_preset=${datePreset}&access_token=${token}`,
        { cache: "no-store" },
      );
      if (insightsRes.ok) {
        const d = await insightsRes.json() as {
          data?: Array<{ actions?: Array<{ action_type: string; value: string }> }>;
        };
        for (const a of d.data?.[0]?.actions ?? []) {
          if (a.action_type === "offsite_conversion.fb_pixel_view_content") pageViews += Number(a.value);
          if (a.action_type === "offsite_conversion.fb_pixel_lead")         leads     += Number(a.value);
          if (a.action_type === "offsite_conversion.fb_pixel_purchase")     purchases += Number(a.value);
        }
      }
    } catch {
      // Non-fatal — pixel confirmed active via last_fired_time even if insights unavailable
    }
  }

  return NextResponse.json({
    configured:    true,
    pixelId,
    pixelName,
    lastFiredTime,
    pageViews,
    leads,
    purchases,
    synced_at:     new Date().toISOString(),
  });
}
