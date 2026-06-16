import { headers } from "next/headers";
import { generateInsights, type PlatformData } from "@/lib/marketing-insights";
import InsightsTabStrip from "./InsightsTabStrip";
import PlatformHealthCards from "./PlatformHealthCards";
import CampaignSection from "./CampaignSection";
import RecommendationList from "./RecommendationList";
import TrendAlertsPanel from "./TrendAlertsPanel";
import SpendSummarySection from "./SpendSummary";

async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const hdrs = await headers();
    const host = hdrs.get("host") ?? "localhost:3000";
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    const res = await fetch(`${proto}://${host}${path}`, {
      cache: "no-store",
      // Forward the session cookie — middleware now requires auth on these
      // API routes, and this is a server-to-server request with no browser.
      headers: { cookie: hdrs.get("cookie") ?? "" },
    });
    if (!res.ok) return fallback;
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

const META_FALLBACK: PlatformData["meta"] = {
  connected: true,
  totalSpend: 0,
  impressions: 0,
  clicks: 0,
  leads: 0,
  campaigns: [],
};

const GSC_FALLBACK: { connected: boolean } & PlatformData["gsc"] = {
  connected: false,
  clicks: 0,
  impressions: 0,
  rows: [],
  queries: [],
};

const GMB_FALLBACK: PlatformData["gmb"] = {
  connected: false,
  profileViews: 0,
  directionRequests: 0,
  calls: 0,
  websiteClicks: 0,
};

export default async function InsightsPage() {
  const [metaRaw, gscRaw, gscQueriesRaw, gmbRaw] = await Promise.all([
    fetchApi("/api/marketing/meta-ads?days=30", META_FALLBACK),
    fetchApi("/api/marketing/gsc?days=30", GSC_FALLBACK),
    fetchApi("/api/marketing/gsc-queries?days=30", { connected: false, queries: [] }),
    fetchApi("/api/marketing/gmb", GMB_FALLBACK),
  ]);

  const platformData: PlatformData = {
    meta: {
      connected: !("error" in metaRaw),
      totalSpend: (metaRaw as typeof META_FALLBACK).totalSpend ?? 0,
      impressions: (metaRaw as typeof META_FALLBACK).impressions ?? 0,
      clicks: (metaRaw as typeof META_FALLBACK).clicks ?? 0,
      leads: (metaRaw as typeof META_FALLBACK).leads ?? 0,
      campaigns: (metaRaw as typeof META_FALLBACK).campaigns ?? [],
    },
    gsc: {
      connected: (gscRaw as { connected?: boolean }).connected === true,
      clicks: (gscRaw as typeof GSC_FALLBACK).clicks ?? 0,
      impressions: (gscRaw as typeof GSC_FALLBACK).impressions ?? 0,
      rows: (gscRaw as typeof GSC_FALLBACK).rows ?? [],
      queries: (gscQueriesRaw as { queries?: PlatformData["gsc"]["queries"] }).queries ?? [],
    },
    gmb: {
      connected: (gmbRaw as { connected?: boolean }).connected === true,
      profileViews: (gmbRaw as typeof GMB_FALLBACK).profileViews ?? 0,
      directionRequests: (gmbRaw as typeof GMB_FALLBACK).directionRequests ?? 0,
      calls: (gmbRaw as typeof GMB_FALLBACK).calls ?? 0,
      websiteClicks: (gmbRaw as typeof GMB_FALLBACK).websiteClicks ?? 0,
    },
  };

  const report = generateInsights(platformData);

  const generatedDate = new Date(report.generatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const connectedCount = [
    platformData.meta.connected,
    platformData.gsc.connected,
    platformData.gmb.connected,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-semibold text-white">Marketing Insights</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Rule-based analysis · Last 30 days · Updated {generatedDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {connectedCount} / 3 platforms connected
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Tab strip */}
        <InsightsTabStrip />

        {/* Platform Health */}
        <PlatformHealthCards healthScores={report.healthScores} />

        {/* Campaigns */}
        <CampaignSection
          topLeadCampaigns={report.topLeadCampaigns}
          topAwarenessCampaigns={report.topAwarenessCampaigns}
          underperformingCampaigns={report.underperformingCampaigns}
        />

        {/* Recommendations */}
        <RecommendationList recommendations={report.recommendations} />

        {/* Trend Alerts (collapsible) */}
        <TrendAlertsPanel alerts={report.trendAlerts} />

        {/* Spend Summary */}
        <SpendSummarySection summary={report.spendSummary} />
      </main>
    </div>
  );
}
