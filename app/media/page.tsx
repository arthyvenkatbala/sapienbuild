import MediaOverviewCards from "@/components/media/MediaOverviewCards";
import MediaGalleryGrid from "@/components/media/MediaGalleryGrid";
import CreativeAnalyticsGraphs from "@/components/media/CreativeAnalyticsGraphs";
import AICreativeInsights from "@/components/media/AICreativeInsights";
import CreativeComparison from "@/components/media/CreativeComparison";

export default function MediaInsightsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glow orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.09]"
          style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", filter: "blur(70px)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute top-1/2 -left-24 w-[280px] h-[280px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-400">
                Creative Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Media Insights</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Visual creative-performance intelligence — discover what drives results
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 mt-1">
            <div className="text-right">
              <p className="text-[10px] text-zinc-600">Analysing</p>
              <p className="text-xs font-medium text-zinc-400">24 assets across 4 platforms</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">24</span>
            </div>
          </div>
        </div>

        {/* 1 — KPI Overview Cards */}
        <MediaOverviewCards />

        {/* 2 — Media Gallery Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Media Gallery</h2>
              <p className="text-xs text-zinc-500 mt-0.5">All creatives with performance metrics</p>
            </div>
          </div>
          <MediaGalleryGrid />
        </section>

        {/* 3 — Creative Analytics Graphs */}
        <CreativeAnalyticsGraphs />

        {/* 4 — AI Insights + Comparison side-by-side on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <AICreativeInsights />
          <CreativeComparison />
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
