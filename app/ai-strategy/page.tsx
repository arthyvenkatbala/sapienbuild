import ChatWorkspace from "@/components/ai-strategy/ChatWorkspace";
import CampaignAnalysisPanel from "@/components/ai-strategy/CampaignAnalysisPanel";
import RecommendationsPanel from "@/components/ai-strategy/RecommendationsPanel";
import CreativeIntelligence from "@/components/ai-strategy/CreativeIntelligence";
import MarketingForecasts from "@/components/ai-strategy/MarketingForecasts";

export default function AIStrategyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Ambient glow orbs — fixed so they stay in place while content scrolls */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-32 w-[360px] h-[360px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-[280px] h-[280px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 p-6 space-y-8">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-400">
                AI Marketing OS
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">AI Strategy</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Your AI marketing strategist — insights, creative, and forecasts in one workspace
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 mt-1">
            <div className="text-right">
              <p className="text-[10px] text-zinc-600">Last analysed</p>
              <p className="text-xs font-medium text-zinc-400">4 minutes ago</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
          </div>
        </div>

        {/* Section 1: Chat + Campaign Health + Recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Left: Chat workspace */}
          <ChatWorkspace />

          {/* Right column: score rings + recommendations */}
          <div className="flex flex-col gap-4">
            <CampaignAnalysisPanel />
            <RecommendationsPanel />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.05]" />

        {/* Section 2: Creative Intelligence */}
        <CreativeIntelligence />

        {/* Divider */}
        <div className="border-t border-white/[0.05]" />

        {/* Section 3: Marketing Forecasts */}
        <MarketingForecasts />

        {/* Bottom padding so floating chat widget doesn't overlap */}
        <div className="h-6" />
      </div>
    </div>
  );
}
