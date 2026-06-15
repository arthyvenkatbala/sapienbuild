// Returns aggregated Clarity page insights from stored clarity_page_insights table.
// Data is populated by the daily cron — no live Clarity API calls here.

import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export interface ClarityPageRow {
  url:              string;
  traffic:          number | null;
  engagement_time:  number | null;
  scroll_depth:     number | null;
  dead_clicks:      number | null;
  rage_clicks:      number | null;
  quickback_clicks: number | null;
  excessive_scroll: number | null;
  friction_score:   number;
  fetched_at:       string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = Math.min(30, Math.max(1, Number(searchParams.get("days") ?? "7")));

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await adminSupabase
    .from("clarity_page_insights")
    .select("url, traffic, engagement_time, scroll_depth, dead_clicks, rage_clicks, quickback_clicks, excessive_scroll, fetched_at")
    .gte("date", sinceStr)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ pages: [], fetched_at: null, has_data: false });
  }

  // Aggregate across multiple days: sum traffic/clicks, average scroll_depth/engagement_time
  const agg: Record<string, {
    traffic:          number;
    engagement_times: number[];
    scroll_depths:    number[];
    dead_clicks:      number;
    rage_clicks:      number;
    quickback_clicks: number;
    excessive_scroll: number;
    fetched_at:       string;
  }> = {};

  for (const row of data) {
    const url = row.url as string;
    if (!agg[url]) {
      agg[url] = {
        traffic:          0,
        engagement_times: [],
        scroll_depths:    [],
        dead_clicks:      0,
        rage_clicks:      0,
        quickback_clicks: 0,
        excessive_scroll: 0,
        fetched_at:       String(row.fetched_at ?? ""),
      };
    }
    const a = agg[url];
    if (row.traffic          != null) a.traffic          += Number(row.traffic);
    if (row.engagement_time  != null) a.engagement_times.push(Number(row.engagement_time));
    if (row.scroll_depth     != null) a.scroll_depths.push(Number(row.scroll_depth));
    if (row.dead_clicks      != null) a.dead_clicks      += Number(row.dead_clicks);
    if (row.rage_clicks      != null) a.rage_clicks      += Number(row.rage_clicks);
    if (row.quickback_clicks != null) a.quickback_clicks += Number(row.quickback_clicks);
    if (row.excessive_scroll != null) a.excessive_scroll += Number(row.excessive_scroll);
    // Keep the most recent fetched_at
    if (row.fetched_at && String(row.fetched_at) > a.fetched_at) {
      a.fetched_at = String(row.fetched_at);
    }
  }

  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const pages: ClarityPageRow[] = Object.entries(agg).map(([url, a]) => {
    const friction = (a.rage_clicks ?? 0) + (a.dead_clicks ?? 0) + (a.quickback_clicks ?? 0);
    return {
      url,
      traffic:          a.traffic          || null,
      engagement_time:  avg(a.engagement_times),
      scroll_depth:     avg(a.scroll_depths),
      dead_clicks:      a.dead_clicks       || null,
      rage_clicks:      a.rage_clicks       || null,
      quickback_clicks: a.quickback_clicks  || null,
      excessive_scroll: a.excessive_scroll  || null,
      friction_score:   friction,
      fetched_at:       a.fetched_at || null,
    };
  });

  // Sort by friction score descending
  pages.sort((a, b) => b.friction_score - a.friction_score);

  // Most recent fetched_at across all rows
  const latestFetchedAt = pages
    .map((p) => p.fetched_at)
    .filter(Boolean)
    .sort()
    .pop() ?? null;

  return NextResponse.json({ pages, fetched_at: latestFetchedAt, has_data: true });
}
