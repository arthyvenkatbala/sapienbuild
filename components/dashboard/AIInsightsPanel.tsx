"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Sparkles, Clock } from "lucide-react";
import { aiInsights } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Clock,
};

const urgencyMap: Record<string, { border: string; bg: string; dot: string }> = {
  positive:     { border: "border-green-500/20",  bg: "bg-green-500/5",  dot: "bg-green-400" },
  warning:      { border: "border-yellow-500/20", bg: "bg-yellow-500/5", dot: "bg-yellow-400" },
  info:         { border: "border-purple-500/20", bg: "bg-purple-500/5", dot: "bg-purple-400" },
};

export default function AIInsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">AI Marketing Insights</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Strategy recommendations updated hourly</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {aiInsights.map((insight, i) => {
          const Icon = iconMap[insight.icon];
          const u = urgencyMap[insight.urgency];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`relative rounded-xl border p-4 ${u.border} ${u.bg} hover:bg-white/[0.03] transition-colors cursor-default`}
            >
              {/* top-left glow dot */}
              <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${u.dot}`} />

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-lg border ${u.border} ${u.bg}`}>
                  <Icon size={13} className="text-zinc-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">{insight.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{insight.body}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* glassmorphism footer banner */}
      <div className="mt-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Budget Optimisation Ready</p>
            <p className="text-xs text-zinc-400">AI has found 3 opportunities to reduce CPL by ~18%</p>
          </div>
        </div>
        <button className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap">
          View →
        </button>
      </div>
    </motion.div>
  );
}
