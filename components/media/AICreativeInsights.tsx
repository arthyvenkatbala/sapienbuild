"use client";

import { motion } from "framer-motion";
import { Film, Heart, Image, Clock, Zap, ArrowRight } from "lucide-react";
import { aiCreativeInsights } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Film, Heart, Image, Clock, Zap,
};

const urgencyConfig: Record<string, { border: string; bg: string; metricColor: string }> = {
  positive: {
    border:      "border-green-500/25",
    bg:          "bg-green-500/8",
    metricColor: "#22c55e",
  },
  info: {
    border:      "border-cyan-500/20",
    bg:          "bg-cyan-500/6",
    metricColor: "#38bdf8",
  },
  warning: {
    border:      "border-orange-500/25",
    bg:          "bg-orange-500/8",
    metricColor: "#f97316",
  },
};

export default function AICreativeInsights() {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">AI Creative Insights</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Actionable recommendations from your best-performing content</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI Active
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {aiCreativeInsights.map((insight, i) => {
          const Icon = iconMap[insight.icon] ?? Film;
          const cfg = urgencyConfig[insight.urgency] ?? urgencyConfig.info;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.07 }}
              className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 flex flex-col gap-3 hover:brightness-110 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ background: `${cfg.metricColor}20` }}
                >
                  <Icon size={13} style={{ color: cfg.metricColor }} />
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: cfg.metricColor, background: `${cfg.metricColor}20` }}
                >
                  {insight.metric}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-white leading-snug">{insight.title}</p>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{insight.body}</p>
              </div>

              <button
                className="flex items-center gap-1.5 text-[10px] font-medium transition-colors group-hover:text-white"
                style={{ color: cfg.metricColor }}
              >
                {insight.action}
                <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
