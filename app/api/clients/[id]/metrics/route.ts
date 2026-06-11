import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

// GET /api/clients/[id]/metrics?days=30
export async function GET(req: NextRequest, { params }: Params) {
  const { id }  = await params;
  const days     = Math.min(Number(req.nextUrl.searchParams.get("days") ?? "30"), 90);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  // Fetch ad_metrics rows AND the client's last_synced_at in parallel
  const [metricsRes, clientRes] = await Promise.all([
    adminSupabase
      .from("ad_metrics")
      .select("platform, date, spend, clicks, impressions, leads, cpl, roas, synced_at")
      .eq("client_id", id)
      .gte("date", sinceStr)
      .order("date", { ascending: true }),
    adminSupabase
      .from("clients")
      .select("last_synced_at")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (metricsRes.error) {
    return NextResponse.json({ error: metricsRes.error.message }, { status: 500 });
  }

  const data             = metricsRes.data ?? [];
  const clientSyncedAt   = (clientRes.data as { last_synced_at?: string | null } | null)?.last_synced_at ?? null;

  // Never synced at all
  if (!clientSyncedAt && data.length === 0) {
    return NextResponse.json({
      hasData:          false,
      syncedButEmpty:   false,
      totals:           { spend: 0, clicks: 0, impressions: 0, leads: 0, ctr: 0, cpl: 0, roas: 0 },
      byPlatform:       { meta: zeroBlock(), google: zeroBlock() },
      sparklines:       { spend: [], clicks: [], impressions: [], leads: [], cpl: [] },
      lastSyncedAt:     null,
    });
  }

  // Synced but no spend rows in this period
  if (data.length === 0) {
    return NextResponse.json({
      hasData:          false,
      syncedButEmpty:   true,
      totals:           { spend: 0, clicks: 0, impressions: 0, leads: 0, ctr: 0, cpl: 0, roas: 0 },
      byPlatform:       { meta: zeroBlock(), google: zeroBlock() },
      sparklines:       { spend: [], clicks: [], impressions: [], leads: [], cpl: [] },
      lastSyncedAt:     clientSyncedAt,
    });
  }

  // Aggregate totals
  let totalSpend = 0, totalClicks = 0, totalImpressions = 0, totalLeads = 0;
  const byPlatform: Record<string, ReturnType<typeof zeroBlock>> = {
    meta:   zeroBlock(),
    google: zeroBlock(),
  };

  for (const row of data) {
    const s = Number(row.spend)       || 0;
    const c = Number(row.clicks)      || 0;
    const i = Number(row.impressions) || 0;
    const l = Number(row.leads)       || 0;
    totalSpend       += s;
    totalClicks      += c;
    totalImpressions += i;
    totalLeads       += l;

    const p = row.platform === "meta" ? "meta" : "google";
    byPlatform[p].spend       += s;
    byPlatform[p].clicks      += c;
    byPlatform[p].impressions += i;
    byPlatform[p].leads       += l;
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpl = totalLeads > 0       ? totalSpend / totalLeads             : 0;

  // Daily rollup for sparklines (last 14 data points across platforms)
  const dailyMap = new Map<string, { spend: number; clicks: number; impressions: number; leads: number }>();
  for (const row of data) {
    const existing = dailyMap.get(row.date) ?? { spend: 0, clicks: 0, impressions: 0, leads: 0 };
    existing.spend       += Number(row.spend)       || 0;
    existing.clicks      += Number(row.clicks)      || 0;
    existing.impressions += Number(row.impressions) || 0;
    existing.leads       += Number(row.leads)       || 0;
    dailyMap.set(row.date, existing);
  }

  const sortedDays = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14);

  const sparklines = {
    spend:       sortedDays.map(([, v]) => v.spend),
    clicks:      sortedDays.map(([, v]) => v.clicks),
    impressions: sortedDays.map(([, v]) => v.impressions),
    leads:       sortedDays.map(([, v]) => v.leads),
    cpl:         sortedDays.map(([, v]) => v.leads > 0 ? v.spend / v.leads : 0),
  };

  const rowSyncedAt = data.reduce((max: string | null, row) => {
    if (!row.synced_at) return max;
    return !max || row.synced_at > max ? row.synced_at : max;
  }, null);
  const lastSyncedAt = rowSyncedAt ?? clientSyncedAt;

  return NextResponse.json({
    hasData:        true,
    syncedButEmpty: false,
    totals: {
      spend:       Math.round(totalSpend * 100) / 100,
      clicks:      totalClicks,
      impressions: totalImpressions,
      leads:       totalLeads,
      ctr:         Math.round(ctr * 100) / 100,
      cpl:         Math.round(cpl * 100) / 100,
      roas:        0,
    },
    byPlatform,
    sparklines,
    lastSyncedAt,
  });
}

function zeroBlock() {
  return { spend: 0, clicks: 0, impressions: 0, leads: 0 };
}
