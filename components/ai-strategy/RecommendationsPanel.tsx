"use client";

import { motion } from "framer-motion";
import { TrendingUp, PauseCircle, RefreshCw, Users, ArrowRight } from "lucide-react";
import { strategyRecommendations } from "@/lib/mock-data";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  scale:   { icon: TrendingUp,  color: "#22c55e", bg: "bg-green-500/12",  border: "border-green-500/25"  },
  pause:   { icon: PauseCircle, color: "#f97316", bg: "bg-orange-500/12", border: "border-orange-500/25" },
  refresh: { icon: RefreshCw,   color: "#f59e0b", bg: "bg-yellow-500/12", border: "border-yellow-500/25" },
  build:   { icon: Users,       color: "#38bdf8", bg: "bg-cyan-500/12",   border: "border-cyan-500/25"   },
};

export default function RecommendationsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Prioritised by impact</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/15 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>

      <div className="space-y-2.5">
        {strategyRecommendations.map((r, i) => {
          const cfg = typeConfig[r.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={r.priority}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={`relative rounded-xl border ${cfg.border} ${cfg.bg} p-3 group hover:brightness-110 transition-all cursor-pointer`}
            >
              {/* priority badge */}
              <span
                className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: cfg.color, background: `${cfg.color}20` }}
              >
                #{r.priority}
              </span>

              <div className="flex items-start gap-2.5">
                <div
                  className="mt-0.5 p-1.5 rounded-lg shrink-0"
                  style={{ background: `${cfg.color}20` }}
                >
                  <Icon size={12} style={{ color: cfg.color }} />
                </div>
                <div className="min-w-0 pr-6">
                  <p className="text-xs font-semibold text-white">{r.title}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{r.detail}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: cfg.color, background: `${cfg.color}20` }}
                      >
                        {r.impact}
                      </span>
                      <span className="text-[10px] text-zinc-600">{r.confidence}% confidence</span>
                    </div>
                    <ArrowRight
                      size={11}
                      className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
