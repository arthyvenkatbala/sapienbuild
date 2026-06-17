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
    // Try both fields — instagram_business_account (full Business/Creator accounts)
    // and connected_instagram_account (any IG account connected to the Page)
    const pageRes = await fetch(
      `${GRAPH}/${pageId}?fields=instagram_business_account{id,username,followers_count,media_count},connected_instagram_account{id,username,followers_count,media_count}&access_token=${token}`,
      { cache: "no-store" },
    );

    if (!pageRes.ok) {
      const errText = await pageRes.text();
      console.warn("[Instagram] Page fetch failed:", errText);
      return NextResponse.json({ connected: false, error: "Could not fetch page data" });
    }

    const pageData = await pageRes.json() as {
      instagram_business_account?: {
        id: string; username?: string; followers_count?: number; media_count?: number;
      };
      connected_instagram_account?: {
        id: string; username?: string; followers_count?: number; media_count?: number;
      };
    };

    // Prefer the full business account; fall back to any connected account
    const igAccount = pageData.instagram_business_account ?? pageData.connected_instagram_account;

    if (!igAccount?.id) {
      return NextResponse.json({
        connected: false,
        reason:    "no_ig_account",
        message:   "No Instagram account found linked to this Facebook Page via the Graph API.",
      });
    }

    const igId       = igAccount.id;
    const followers  = igAccount.followers_count ?? 0;
    const mediaCount = igAccount.media_count ?? 0;
    const username   = igAccount.username ?? null;

    // Try to get reach/impressions (requires instagram_manage_insights permission)
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
