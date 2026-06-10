"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { predictiveInsightsData } from "@/lib/mock-data";

export default function PredictiveInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Predictive Insights</h2>
          <p className="text-xs text-zinc-500 mt-0.5">AI forecasts for the next 21–30 days</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
          <Brain size={12} className="text-indigo-400" />
          <span className="text-xs font-medium text-indigo-400">Forecasting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {predictiveInsightsData.map((item, i) => {
          const isUp = item.trend === "up";
          const sparkData = item.sparkline.map((v, idx) => ({ v, idx }));
          const isBeneficial = (item.trend === "up") !== (item.title === "Avg. CPL");

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 + i * 0.09 }}
              className="relative bg-[#111114] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:border-white/[0.14] transition-colors group"
            >
              {/* Top glow */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}60, transparent)` }}
              />
              {/* Hover shimmer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${item.color}08, transparent 70%)` }}
              />

              {/* Label */}
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-4">{item.title}</p>

              {/* Current → Projected */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-semibold text-zinc-500">
                  {item.prefix}{item.current}{item.unit}
                </span>
                <div className="flex items-center px-1">
                  {isUp
                    ? <TrendingUp size={14} style={{ color: item.color }} />
                    : <TrendingDown size={14} style={{ color: item.color }} />}
                </div>
                <span className="text-2xl font-bold text-white">
                  {item.prefix}{item.projected}{item.unit}
                </span>
              </div>

              {/* Horizon + confidence */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isBeneficial ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                }`}>
                  {item.horizon}
                </span>
                <span className="text-[10px] text-zinc-500">{item.confidence}% confidence</span>
              </div>

              {/* Confidence bar */}
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.confidence}%` }}
                  transition={{ duration: 0.9, delay: 0.25 + i * 0.09, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                />
              </div>

              {/* Projection sparkline (dashed = forecast) */}
              <div className="h-12 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`predict-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={item.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={item.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={() => null} />
                    <Area
                      type="monotone" dataKey="v"
                      stroke={item.color} strokeWidth={1.5} strokeDasharray="4 3"
                      fill={`url(#predict-${i})`}
                      dot={false} isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Insight */}
              <p className="text-[10px] text-zinc-500 leading-relaxed">{item.insight}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
