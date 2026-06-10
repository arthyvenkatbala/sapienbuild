"use client";

import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Users, TrendingUp, Zap, BarChart2 } from "lucide-react";
import { aiCampaignAlerts } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle, DollarSign, Users, TrendingUp, Zap, BarChart2,
};

const urgencyConfig = {
  positive: {
    border: "border-green-500/20",  dot: "bg-green-400",
    iconBg: "bg-green-500/15",      btn: "text-green-400 border-green-500/30 hover:border-green-400/60 hover:text-green-300",
    glow: "hover:shadow-green-500/5",
  },
  warning: {
    border: "border-yellow-500/20", dot: "bg-yellow-400",
    iconBg: "bg-yellow-500/15",     btn: "text-yellow-400 border-yellow-500/30 hover:border-yellow-400/60 hover:text-yellow-300",
    glow: "hover:shadow-yellow-500/5",
  },
  info: {
    border: "border-blue-500/20",   dot: "bg-blue-400",
    iconBg: "bg-blue-500/15",       btn: "text-blue-400 border-blue-500/30 hover:border-blue-400/60 hover:text-blue-300",
    glow: "hover:shadow-blue-500/5",
  },
};

const typeLabel: Record<string, { label: string; cls: string }> = {
  fatigue:  { label: "Fatigue",   cls: "bg-red-500/15 text-red-400"    },
  budget:   { label: "Budget",    cls: "bg-yellow-500/15 text-yellow-400" },
  audience: { label: "Audience",  cls: "bg-blue-500/15 text-blue-400"  },
  scale:    { label: "Scale",     cls: "bg-green-500/15 text-green-400" },
};

export default function AICampaignAnalysis() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">AI Campaign Analysis</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Fatigue, budget inefficiencies &amp; scaling signals</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-purple-400">AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {aiCampaignAlerts.map((alert, i) => {
          const Icon = iconMap[alert.icon];
          const uc = urgencyConfig[alert.urgency as keyof typeof urgencyConfig];
          const tl = typeLabel[alert.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.07 }}
              className={`relative bg-[#111114] border ${uc.border} rounded-2xl p-4 shadow-lg ${uc.glow} hover:bg-white/[0.02] transition-all group overflow-hidden`}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.025), transparent 70%)" }}
              />
              <div className={`absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full ${uc.dot}`} />

              <div className="flex items-start gap-2.5 mb-2.5">
                <div className={`p-1.5 rounded-xl border ${uc.border} ${uc.iconBg} shrink-0 mt-0.5`}>
                  <Icon size={12} className="text-zinc-200" />
                </div>
                <div className="min-w-0 pr-5">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${tl.cls}`}>{tl.label}</span>
                    <span className={`text-[10px] font-semibold ${alert.metricColor}`}>{alert.metric}</span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight">{alert.title}</p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-600 mb-1 font-medium">{alert.campaign}</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{alert.body}</p>

              <button className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-all ${uc.btn}`}>
                {alert.action} →
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
