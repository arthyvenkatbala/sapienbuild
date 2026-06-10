import { supabase } from "@/lib/supabase";
import { kpiData, sparklineData } from "@/lib/mock-data";
import StatCard from "@/components/dashboard/StatCard";
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

  const kpi = kpiData;

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

        {/* ── KPI Cards ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
            Performance Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
            <StatCard
              label="Total Spend"
              value={`₹${(kpi.totalSpend.value / 1000).toFixed(1)}k`}
              change={kpi.totalSpend.change}
              sparkline={sparklineData.spend}
              color="purple"
              delay={0}
            />
            <StatCard
              label="Total Clicks"
              value={kpi.totalClicks.value.toLocaleString()}
              change={kpi.totalClicks.change}
              sparkline={sparklineData.clicks}
              color="blue"
              delay={0.05}
            />
            <StatCard
              label="CTR"
              value={`${kpi.ctr.value}%`}
              change={kpi.ctr.change}
              sparkline={[3.1, 3.3, 3.5, 3.4, 3.6, 3.7, 3.82]}
              color="green"
              delay={0.1}
            />
            <StatCard
              label="Cost Per Lead"
              value={`₹${kpi.cpl.value}`}
              change={kpi.cpl.change}
              sparkline={sparklineData.cpl}
              color="orange"
              delay={0.15}
            />
            <StatCard
              label="Leads"
              value={String(kpi.leadsGenerated.value)}
              change={kpi.leadsGenerated.change}
              sparkline={sparklineData.leads}
              color="purple"
              delay={0.2}
            />
            <StatCard
              label="Conv. Rate"
              value={`${kpi.conversionRate.value}%`}
              change={kpi.conversionRate.change}
              sparkline={[3.2, 3.5, 3.8, 4.0, 4.2, 4.4, 4.6]}
              color="green"
              delay={0.25}
            />
            <StatCard
              label="ROAS"
              value={`${kpi.roas.value}×`}
              change={kpi.roas.change}
              sparkline={[2.8, 3.0, 3.2, 3.4, 3.5, 3.7, 3.8]}
              color="blue"
              delay={0.3}
            />
          </div>
        </section>

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
