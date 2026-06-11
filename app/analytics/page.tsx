import AnalyticsMetrics from "@/components/analytics/AnalyticsMetrics";
import CrossPlatformGraph from "@/components/analytics/CrossPlatformGraph";
import AudienceInsights from "@/components/analytics/AudienceInsights";
import AnalyticsFunnel from "@/components/analytics/AnalyticsFunnel";
import PlatformBreakdown from "@/components/analytics/PlatformBreakdown";
import AIAnalyticsInsights from "@/components/analytics/AIAnalyticsInsights";
import AIChatAgent from "@/components/dashboard/AIChatAgent";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Analytics</h1>
          <p className="text-xs text-zinc-500">Cross-platform marketing intelligence · Jun 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-10 max-w-[1400px] w-full mx-auto">

        {/* ── Analytics KPIs — real data per selected client ── */}
        <AnalyticsMetrics />

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
