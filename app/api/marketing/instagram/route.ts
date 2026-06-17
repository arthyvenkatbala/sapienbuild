import { NextRequest, NextResponse } from "next/server";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function GET(request: NextRequest) {
  const days   = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const pageId = process.env.META_PAGE_ID;
  const token  = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    return NextResponse.json({ connected: false, reason: "META_PAGE_ID or META_PAGE_ACCESS_TOKEN not configured" });
  }

  try {
    // Step 1: get IG Business Account linked to the Facebook page
    const pageRes = await fetch(
      `${GRAPH}/${pageId}?fields=instagram_business_account{id,username,followers_count,media_count}&access_token=${token}`,
      { cache: "no-store" },
    );

    if (!pageRes.ok) {
      return NextResponse.json({ connected: false, error: "Could not fetch page data" });
    }

    const pageData = await pageRes.json() as {
      instagram_business_account?: {
        id:              string;
        username?:       string;
        followers_count?: number;
        media_count?:    number;
      };
    };

    const igAccount = pageData.instagram_business_account;
    if (!igAccount?.id) {
      return NextResponse.json({
        connected: false,
        reason:    "no_ig_account",
        message:   "No Instagram Business account is connected to this Facebook page. Go to Facebook Page Settings → Instagram to link it.",
      });
    }

    const igId      = igAccount.id;
    const followers = igAccount.followers_count ?? 0;
    const mediaCount = igAccount.media_count ?? 0;
    const username  = igAccount.username ?? null;

    // Step 2: try to get reach/impressions from IG insights (requires instagram_manage_insights)
    let reach = 0, impressions = 0;
    const since = Math.floor(Date.now() / 1000 - days * 86400);
    const until = Math.floor(Date.now() / 1000);

    const insightsRes = await fetch(
      `${GRAPH}/${igId}/insights?metric=impressions,reach&period=day&since=${since}&until=${until}&access_token=${token}`,
      { cache: "no-store" },
    );

    if (insightsRes.ok) {
      const d = await insightsRes.json() as {
        data?: Array<{ name: string; values: Array<{ value: number }> }>;
      };
      for (const metric of d.data ?? []) {
        const total = metric.values.reduce((s, v) => s + (typeof v.value === "number" ? v.value : 0), 0);
        if (metric.name === "impressions") impressions = total;
        if (metric.name === "reach")       reach       = total;
      }
    }
    // Insights may fail silently if token lacks instagram_manage_insights — followers still returned

    return NextResponse.json({
      connected:    true,
      username,
      followers,
      mediaCount,
      reach,
      impressions,
      synced_at:    new Date().toISOString(),
    });
  } catch (e) {
    console.error("[Instagram] Error:", e);
    return NextResponse.json({ connected: false, error: "Failed to fetch Instagram data" });
  }
}
