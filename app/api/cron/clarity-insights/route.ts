// Daily cron: fetch behavioural page metrics from Clarity Data Export API and
// store them in clarity_page_insights (upsert per url + date).
//
// Auth: CLARITY_API_TOKEN env var (JWT from Clarity Settings → Data Export).
// Rate limit: max 10 requests/project/day — we make exactly 1 per cron run.
// Schedule: daily at 06:00 UTC (see vercel.json)

import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const CLARITY_API = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

// ─── Parsing helpers ──────────────────────────────────────────────────────────

type InfoRow = Record<string, unknown>;

// Try multiple candidate field names; return the first that parses as a valid number.
function extractNum(row: InfoRow, ...keys: string[]): number | null {
  for (const k of keys) {
    if (k in row && row[k] !== undefined && row[k] !== null) {
      const v = Number(row[k]);
      if (!isNaN(v)) return v;
    }
  }
  return null;
}

interface UrlData {
  traffic?:          number | null;
  engagement_time?:  number | null;
  scroll_depth?:     number | null;
  dead_clicks?:      number | null;
  rage_clicks?:      number | null;
  quickback_clicks?: number | null;
  excessive_scroll?: number | null;
  raw: InfoRow[];
}

function buildUrlMap(
  apiResponse: Array<{ metricName: string; information: InfoRow[] }>
): Record<string, UrlData> {
  // Index by metricName for quick lookup
  const byMetric: Record<string, InfoRow[]> = {};
  for (const entry of apiResponse) {
    if (entry.metricName && Array.isArray(entry.information)) {
      byMetric[entry.metricName] = entry.information;
    }
  }

  const urlMap: Record<string, UrlData> = {};

  const init = (url: string): UrlData => {
    if (!urlMap[url]) urlMap[url] = { raw: [] };
    return urlMap[url];
  };

  // Traffic — documented fields from sample response
  for (const row of byMetric["Traffic"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.traffic = extractNum(row, "totalSessionCount", "sessionCount", "sessions");
    d.raw.push({ metricName: "Traffic", ...row });
  }

  // Engagement Time (seconds)
  for (const row of byMetric["Engagement Time"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.engagement_time = extractNum(
      row,
      "engagementTime", "avgEngagementTime", "averageEngagementTime",
      "engagementTimeSec", "engagementTimeSeconds",
    );
    d.raw.push({ metricName: "Engagement Time", ...row });
  }

  // Scroll Depth (0–1 fraction; >1 values treated as percentage and divided by 100)
  for (const row of byMetric["Scroll Depth"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    let sd = extractNum(
      row,
      "scrollDepth", "avgScrollDepth", "averageScrollDepth",
      "scrollDepthPercentage", "avgScrollDepthPercentage",
    );
    if (sd !== null && sd > 1) sd = sd / 100;
    d.scroll_depth = sd;
    d.raw.push({ metricName: "Scroll Depth", ...row });
  }

  // Dead Click Count
  for (const row of byMetric["Dead Click Count"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.dead_clicks = extractNum(row, "deadClickCount", "deadClicks", "DeadClickCount");
    d.raw.push({ metricName: "Dead Click Count", ...row });
  }

  // Rage Click Count
  for (const row of byMetric["Rage Click Count"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.rage_clicks = extractNum(row, "rageClickCount", "rageClicks", "RageClickCount");
    d.raw.push({ metricName: "Rage Click Count", ...row });
  }

  // Quickback Click
  for (const row of byMetric["Quickback Click"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.quickback_clicks = extractNum(
      row,
      "quickBackClickCount", "quickbackClickCount",
      "quickBackClicks", "QuickbackClick", "quickBackClick",
    );
    d.raw.push({ metricName: "Quickback Click", ...row });
  }

  // Excessive Scroll
  for (const row of byMetric["Excessive Scroll"] ?? []) {
    const url = String(row["URL"] ?? row["url"] ?? "").trim();
    if (!url) continue;
    const d = init(url);
    d.excessive_scroll = extractNum(
      row,
      "excessiveScrollCount", "excessiveScroll",
      "ExcessiveScrollCount", "ExcessiveScroll",
    );
    d.raw.push({ metricName: "Excessive Scroll", ...row });
  }

  return urlMap;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const secret     = process.env.CRON_SECRET;
  const headerSec  = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const cronBearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const force      = request.nextUrl.searchParams.get("force") === "1";

  if (secret && headerSec !== secret && cronBearer !== secret && !force) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiToken = process.env.CLARITY_API_TOKEN;
  if (!apiToken) {
    console.warn("[clarity-insights] CLARITY_API_TOKEN not set — skipping");
    return NextResponse.json({
      success: true, skipped: true, reason: "CLARITY_API_TOKEN not configured",
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Guard: don't re-fetch if we already have today's data (unless force=1)
  if (!force) {
    const { data: existing } = await adminSupabase
      .from("clarity_page_insights")
      .select("id")
      .eq("date", today)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("[clarity-insights] Already fetched today — skipping");
      return NextResponse.json({ success: true, skipped: true, reason: "already_fetched_today" });
    }
  }

  // Fetch from Clarity Data Export API (1 request — well within 10/day quota)
  let apiResponse: Array<{ metricName: string; information: InfoRow[] }>;
  try {
    const res = await fetch(
      `${CLARITY_API}?dimension1=URL&numOfDays=1`,
      {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type":  "application/json",
        },
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`[clarity-insights] API error ${res.status}:`, body);
      return NextResponse.json(
        { success: false, error: `Clarity API ${res.status}`, detail: body },
        { status: 502 },
      );
    }

    apiResponse = await res.json() as typeof apiResponse;
    console.log(`[clarity-insights] API returned ${apiResponse.length} metric entries`);
  } catch (err) {
    console.error("[clarity-insights] Fetch error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 502 });
  }

  // Parse into per-URL map
  const urlMap = buildUrlMap(apiResponse);
  const urls   = Object.keys(urlMap);
  console.log(`[clarity-insights] Parsed ${urls.length} URLs`);

  if (urls.length === 0) {
    return NextResponse.json({ success: true, upserted: 0, message: "No URL data in response" });
  }

  // Upsert into DB
  const rows = urls.map((url) => {
    const d = urlMap[url];
    return {
      url,
      date:             today,
      traffic:          d.traffic          ?? null,
      engagement_time:  d.engagement_time  ?? null,
      scroll_depth:     d.scroll_depth     ?? null,
      dead_clicks:      d.dead_clicks      ?? null,
      rage_clicks:      d.rage_clicks      ?? null,
      quickback_clicks: d.quickback_clicks ?? null,
      excessive_scroll: d.excessive_scroll ?? null,
      raw_metrics:      d.raw,
      fetched_at:       new Date().toISOString(),
    };
  });

  const { error: upsertErr } = await adminSupabase
    .from("clarity_page_insights")
    .upsert(rows, { onConflict: "url,date", ignoreDuplicates: false });

  if (upsertErr) {
    console.error("[clarity-insights] Upsert error:", upsertErr);
    return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
  }

  console.log(`[clarity-insights] Upserted ${rows.length} rows for ${today}`);
  return NextResponse.json({ success: true, upserted: rows.length, date: today });
}
