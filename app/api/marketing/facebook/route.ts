import { NextRequest, NextResponse } from "next/server";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function GET(request: NextRequest) {
  const days  = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const pageId = process.env.META_PAGE_ID;
  const token  = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    return NextResponse.json({ connected: false, reason: "META_PAGE_ID or META_PAGE_ACCESS_TOKEN not configured" });
  }

  const period = days <= 7 ? "week" : "days_28";

  try {
    const [pageRes, insightsRes] = await Promise.all([
      fetch(`${GRAPH}/${pageId}?fields=name,fan_count,followers_count&access_token=${token}`, { cache: "no-store" }),
      fetch(
        `${GRAPH}/${pageId}/insights?metric=page_impressions_unique,page_engaged_users,page_post_engagements&period=${period}&access_token=${token}`,
        { cache: "no-store" },
      ),
    ]);

    if (!pageRes.ok) {
      const errText = await pageRes.text();
      console.warn("[Facebook] Page fetch failed:", errText);
      return NextResponse.json({
        connected: false,
        error: "Could not fetch page data. Verify META_PAGE_ACCESS_TOKEN has pages_read_engagement permission.",
      });
    }

    const pageData = await pageRes.json() as {
      name?: string;
      fan_count?: number;
      followers_count?: number;
    };

    let reach = 0, engagedUsers = 0, postEngagements = 0;

    if (insightsRes.ok) {
      const d = await insightsRes.json() as {
        data?: Array<{ name: string; values: Array<{ value: number }> }>;
      };
      for (const metric of d.data ?? []) {
        const val = metric.values.at(-1)?.value ?? 0;
        if (metric.name === "page_impressions_unique") reach           = typeof val === "number" ? val : 0;
        if (metric.name === "page_engaged_users")      engagedUsers    = typeof val === "number" ? val : 0;
        if (metric.name === "page_post_engagements")   postEngagements = typeof val === "number" ? val : 0;
      }
    }

    return NextResponse.json({
      connected:       true,
      name:            pageData.name ?? "Facebook Page",
      followers:       pageData.followers_count ?? pageData.fan_count ?? 0,
      reach,
      engagedUsers,
      postEngagements,
      synced_at:       new Date().toISOString(),
    });
  } catch (e) {
    console.error("[Facebook] Error:", e);
    return NextResponse.json({ connected: false, error: "Failed to fetch Facebook data" });
  }
}
