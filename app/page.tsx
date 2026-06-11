import { supabase } from "@/lib/supabase";
import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import PlatformChart from "@/components/dashboard/PlatformChart";
import TopAdsTable from "@/components/dashboard/TopAdsTable";
import MediaGallery from "@/components/dashboard/MediaGallery";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import CampaignFunnel from "@/components/dashboard/CampaignFunnel";
import AIChatAgent from "@/components/dashboard/AIChatAgent";
import RecentLeads from "@/components/dashboard/RecentLeads";

export default async function Home() {
  const { data: rawLeads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const leads =
    rawLeads?.map((l) => ({
      name: l.clientname,
      source: l.source ?? "—",
      eventtype: l.eventtype ?? "—",
      status: l.status ?? "New Lead",
    })) ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Marketing Intelligence</h1>
          <p className="text-xs text-zinc-500">One Thousand Tales · Photography Studio</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">Jun 2026</span>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live data
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-8 max-w-[1400px] w-full mx-auto">

        {/* ── KPI Cards — real data per selected client ── */}
        <DashboardKPIs />

        {/* ── Platform Chart ── */}
        <PlatformChart />

        {/* ── Top Ads + Funnel (side by side on xl) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TopAdsTable />
          </div>
          <CampaignFunnel />
        </div>

        {/* ── Media Gallery ── */}
        <MediaGallery />

        {/* ── AI Insights + Recent Leads (side by side on xl) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AIInsightsPanel />
          </div>
          <RecentLeads leads={leads} />
        </div>

      </main>

      {/* Floating AI chat — client component */}
      <AIChatAgent />
    </div>
  );
}
