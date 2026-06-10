import CampaignOverviewCards from "@/components/campaigns/CampaignOverviewCards";
import CampaignIntelTable from "@/components/campaigns/CampaignIntelTable";
import CampaignHeatmap from "@/components/campaigns/CampaignHeatmap";
import AICampaignAnalysis from "@/components/campaigns/AICampaignAnalysis";
import CampaignTimeline from "@/components/campaigns/CampaignTimeline";
import CampaignAudienceIntel from "@/components/campaigns/CampaignAudienceIntel";
import BudgetAllocationVisualizer from "@/components/campaigns/BudgetAllocationVisualizer";
import PredictiveInsights from "@/components/campaigns/PredictiveInsights";
import AIChatAgent from "@/components/dashboard/AIChatAgent";

export default function CampaignIntelPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Campaign Intel</h1>
          <p className="text-xs text-zinc-500">Full-spectrum campaign intelligence · Jun 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 rounded-xl transition-all">
            Export Report
          </button>
          <button className="text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 rounded-xl transition-all">
            Jun 2026 ↓
          </button>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI Active
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-10 max-w-[1400px] w-full mx-auto">

        {/* 1 — Overview cards */}
        <CampaignOverviewCards />

        {/* 2 — Campaign intelligence table */}
        <CampaignIntelTable />

        {/* 3 — Heatmap + AI analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CampaignHeatmap />
          <AICampaignAnalysis />
        </div>

        {/* 4 — Timeline */}
        <CampaignTimeline />

        {/* 5 — Audience intel + Budget allocator */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CampaignAudienceIntel />
          <BudgetAllocationVisualizer />
        </div>

        {/* 6 — Predictive insights */}
        <PredictiveInsights />

      </main>

      <AIChatAgent />
    </div>
  );
}
