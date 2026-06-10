"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  TrendingUp,
  Users,
  Clock,
  PieChart,
} from "lucide-react";
import { analyticsInsights } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Trophy, Zap, TrendingUp, Users, Clock, PieChart,
};

const urgencyConfig: Record<string, { border: string; glow: string; dot: string; iconBg: string }> = {
  positive: {
    border: "border-green-500/20",
    glow:   "shadow-green-500/5",
    dot:    "bg-green-400",
    iconBg: "bg-green-500/15",
  },
  warning: {
    border: "border-yellow-500/20",
    glow:   "shadow-yellow-500/5",
    dot:    "bg-yellow-400",
    iconBg: "bg-yellow-500/15",
  },
  info: {
    border: "border-blue-500/20",
    glow:   "shadow-blue-500/5",
    dot:    "bg-blue-400",
    iconBg: "bg-blue-500/15",
  },
};

const actionColors: Record<string, string> = {
  positive: "text-green-400 hover:text-green-300 border-green-500/30 hover:border-green-400/60",
  warning:  "text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-400/60",
  info:     "text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-400/60",
};

export default function AIAnalyticsInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">AI Analytics Insights</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Opportunities, warnings, and optimisations</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Live Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {analyticsInsights.map((insight, i) => {
          const Icon = iconMap[insight.icon];
          const uc = urgencyConfig[insight.urgency];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.07 }}
              className={`relative bg-[#111114] border ${uc.border} rounded-2xl p-5 shadow-lg ${uc.glow} hover:bg-white/[0.02] transition-colors group overflow-hidden`}
            >
              {/* Glassmorphism shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 70%)" }}
              />

              {/* Live dot */}
              <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${uc.dot}`} />

              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-xl border ${uc.border} ${uc.iconBg} shrink-0`}>
                  <Icon size={14} className="text-zinc-200" />
                </div>
                <p className="text-sm font-semibold text-white leading-tight pt-0.5 pr-4">
                  {insight.title}
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-4">{insight.body}</p>

              <button
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${actionColors[insight.urgency]}`}
              >
                {insight.action} →
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
