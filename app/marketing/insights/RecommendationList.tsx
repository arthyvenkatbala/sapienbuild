"use client";

import type { Recommendation } from "@/lib/marketing-insights";

const PRIORITY_STYLES = {
  HIGH:   { badge: "bg-red-500/20 text-red-300",    dot: "bg-red-400"   },
  MEDIUM: { badge: "bg-amber-500/20 text-amber-300", dot: "bg-amber-400" },
  LOW:    { badge: "bg-blue-500/20 text-blue-300",   dot: "bg-blue-400"  },
} as const;

export default function RecommendationList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
        Optimization Recommendations
      </h2>
      <div className="flex flex-col gap-3">
        {recommendations.map((rec) => {
          const styles = PRIORITY_STYLES[rec.priority];
          return (
            <div
              key={rec.rule}
              className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{rec.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] text-zinc-600 px-2 py-0.5 rounded-full bg-white/[0.04]">
                    {rec.platform}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
