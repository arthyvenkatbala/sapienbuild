import { NextRequest, NextResponse } from "next/server";

interface MetaInsights {
  spend:       string;
  impressions: string;
  clicks:      string;
  actions?:    Array<{ action_type: string; value: string }>;
}

interface MetaCampaign {
  id:      string;
  name:    string;
  status:  string;
  insights?: { data: MetaInsights[] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = searchParams.get("days") ?? "30";
  const datePreset = days === "7" ? "last_7d" : days === "90" ? "last_90d" : "last_30d";

  const token     = process.env.META_PAGE_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !accountId) {
    return NextResponse.json({ error: "Meta credentials not configured" }, { status: 500 });
  }

  const base = `https://graph.facebook.com/v19.0/act_${accountId}`;

  try {
    const [insightsRes, campaignsRes] = await Promise.allSettled([
      fetch(`${base}/insights?fields=spend,impressions,clicks,actions&date_preset=${datePreset}&level=account&access_token=${token}`),
      fetch(`${base}/campaigns?fields=name,status,insights.date_preset(${datePreset}){spend,impressions,clicks,actions}&access_token=${token}&limit=20`),
    ]);

    let totalSpend = 0, impressions = 0, clicks = 0, leads = 0;
    if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
      const d = await insightsRes.value.json() as { data?: MetaInsights[] };
      const row = d.data?.[0];
      if (row) {
        totalSpend  = parseFloat(row.spend ?? "0");
        impressions = parseInt(row.impressions ?? "0", 10);
        clicks      = parseInt(row.clicks ?? "0", 10);
        leads       = (row.actions ?? [])
          .filter((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped")
          .reduce((s, a) => s + parseInt(a.value, 10), 0);
      }
    }

    const campaigns: Array<{
      id: string; name: string; status: string;
      spend: number; impressions: number; clicks: number; leads: number; ctr: number; cpl: number;
    }> = [];

    if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
      const d = await campaignsRes.value.json() as { data?: MetaCampaign[] };
      for (const c of d.data ?? []) {
        const row  = c.insights?.data?.[0];
        const sp   = parseFloat(row?.spend ?? "0");
        const imp  = parseInt(row?.impressions ?? "0", 10);
        const cl   = parseInt(row?.clicks ?? "0", 10);
        const ld   = (row?.actions ?? [])
          .filter((a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped")
          .reduce((s, a) => s + parseInt(a.value, 10), 0);
        campaigns.push({
          id:          c.id,
          name:        c.name,
          status:      c.status,
          spend:       sp,
          impressions: imp,
          clicks:      cl,
          leads:       ld,
          ctr:         imp > 0 ? Math.round((cl / imp) * 10000) / 100 : 0,
          cpl:         ld > 0 ? Math.round(sp / ld) : 0,
        });
      }
    }

    return NextResponse.json({ totalSpend, impressions, clicks, leads, campaigns });
  } catch (err) {
    console.error("[meta-ads]", err);
    return NextResponse.json({ totalSpend: 0, impressions: 0, clicks: 0, leads: 0, campaigns: [] });
  }
}
