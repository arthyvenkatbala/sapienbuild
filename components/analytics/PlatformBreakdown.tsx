"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { platformBreakdown } from "@/lib/mock-data";

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "IG",
  Facebook:  "FB",
  Google:    "G",
  YouTube:   "YT",
};

export default function PlatformBreakdown() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Platform Breakdown</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Performance summary by channel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {platformBreakdown.map((p, i) => (
          <motion.div
            key={p.platform}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.08 }}
            className={`relative bg-gradient-to-b ${p.bgGradient} border ${p.borderColor} rounded-2xl p-5 overflow-hidden hover:scale-[1.02] transition-transform cursor-default`}
          >
            {/* subtle top glow */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${p.color}80, transparent)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold"
                  style={{ background: `${p.color}25`, color: p.color, border: `1px solid ${p.color}40` }}
                >
                  {PLATFORM_ICONS[p.platform]}
                </div>
                <span className="text-sm font-semibold text-white">{p.platform}</span>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: p.color, background: `${p.color}20` }}
              >
                {p.roas}× ROAS
              </span>
            </div>

            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Spend</p>
                <p className="text-sm font-bold text-white">₹{(p.spend / 1000).toFixed(1)}k</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {p.spendChange >= 0 ? (
                    <TrendingUp size={10} className="text-green-400" />
                  ) : (
                    <TrendingDown size={10} className="text-red-400" />
                  )}
                  <span
                    className={`text-[10px] font-medium ${
                      p.spendChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {p.spendChange > 0 ? "+" : ""}
                    {p.spendChange}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Leads</p>
                <p className="text-sm font-bold text-white">{p.leads}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {p.leadsChange >= 0 ? (
                    <TrendingUp size={10} className="text-green-400" />
                  ) : (
                    <TrendingDown size={10} className="text-red-400" />
                  )}
                  <span
                    className={`text-[10px] font-medium ${
                      p.leadsChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {p.leadsChange > 0 ? "+" : ""}
                    {p.leadsChange}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">CTR</p>
                <p className="text-sm font-bold text-white">{p.ctr}%</p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">CPL</p>
                <p className="text-sm font-bold text-white">
                  ₹{Math.round(p.spend / p.leads)}
                </p>
              </div>
            </div>

            {/* Best campaign */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: `${p.color}10`, border: `1px solid ${p.color}20` }}
            >
              <Star size={10} style={{ color: p.color }} />
              <p className="text-[11px] text-zinc-300 truncate">{p.bestCampaign}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
