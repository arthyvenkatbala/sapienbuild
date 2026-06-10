import { analyticsKpiData, analyticsSparklines } from "@/lib/mock-data";
import StatCard from "@/components/dashboard/StatCard";
import CrossPlatformGraph from "@/components/analytics/CrossPlatformGraph";
import AudienceInsights from "@/components/analytics/AudienceInsights";
import AnalyticsFunnel from "@/components/analytics/AnalyticsFunnel";
import PlatformBreakdown from "@/components/analytics/PlatformBreakdown";
import AIAnalyticsInsights from "@/components/analytics/AIAnalyticsInsights";
import AIChatAgent from "@/components/dashboard/AIChatAgent";

export default function AnalyticsPage() {
  const kpi = analyticsKpiData;
  const sp  = analyticsSparklines;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Analytics</h1>
          <p className="text-xs text-zinc-500">Cross-platform marketing intelligence · Jun 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 rounded-xl transition-all">
            Export Report
          </button>
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-10 max-w-[1400px] w-full mx-auto">

        {/* ── Analytics Overview Cards ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
            Analytics Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            <StatCard
              label="Impressions"
              value="648k"
              change={kpi.impressions.change}
              sparkline={sp.impressions.map((v) => v / 1000)}
              color="purple"
              delay={0}
            />
            <StatCard
              label="Clicks"
              value="24.8k"
              change={kpi.clicks.change}
              sparkline={sp.clicks.map((v) => v / 1000)}
              color="blue"
              delay={0.04}
            />
            <StatCard
              label="CTR"
              value={`${kpi.ctr.value}%`}
              change={kpi.ctr.change}
              sparkline={sp.ctr}
              color="green"
              delay={0.08}
            />
            <StatCard
              label="CPC"
              value={`₹${kpi.cpc.value}`}
              change={kpi.cpc.change}
              sparkline={sp.cpc}
              color="orange"
              delay={0.12}
            />
            <StatCard
              label="CPL"
              value={`₹${kpi.cpl.value}`}
              change={kpi.cpl.change}
              sparkline={sp.cpl}
              color="purple"
              delay={0.16}
            />
            <StatCard
              label="ROAS"
              value={`${kpi.roas.value}×`}
              change={kpi.roas.change}
              sparkline={sp.roas}
              color="blue"
              delay={0.20}
            />
            <StatCard
              label="Conv. Rate"
              value={`${kpi.conversionRate.value}%`}
              change={kpi.conversionRate.change}
              sparkline={sp.conversionRate}
              color="green"
              delay={0.24}
            />
            <StatCard
              label="Engagement"
              value={`${kpi.engagementRate.value}%`}
              change={kpi.engagementRate.change}
              sparkline={sp.engagementRate}
              color="orange"
              delay={0.28}
            />
          </div>
        </section>

        {/* ── Cross-Platform Graph ── */}
        <CrossPlatformGraph />

        {/* ── Audience Insights + Funnel ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AudienceInsights />
          <AnalyticsFunnel />
        </div>

        {/* ── Platform Breakdown ── */}
        <PlatformBreakdown />

        {/* ── AI Analytics Insights ── */}
        <AIAnalyticsInsights />

      </main>

      <AIChatAgent />
    </div>
  );
}
