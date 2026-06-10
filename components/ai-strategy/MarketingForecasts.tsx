"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { forecastCards } from "@/lib/mock-data";

type Trend = "positive" | "warning" | "info";

const trendConfig: Record<Trend, { color: string; borderColor: string; bgFrom: string; badge: string }> = {
  positive: {
    color:       "#22c55e",
    borderColor: "border-green-500/25",
    bgFrom:      "from-green-500/8",
    badge:       "text-green-400 bg-green-500/15",
  },
  warning: {
    color:       "#f97316",
    borderColor: "border-orange-500/25",
    bgFrom:      "from-orange-500/8",
    badge:       "text-orange-400 bg-orange-500/15",
  },
  info: {
    color:       "#38bdf8",
    borderColor: "border-cyan-500/25",
    bgFrom:      "from-cyan-500/8",
    badge:       "text-cyan-400 bg-cyan-500/15",
  },
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "positive") return <TrendingUp size={12} className="text-green-400" />;
  if (trend === "warning") return <AlertTriangle size={12} className="text-orange-400" />;
  return <Info size={12} className="text-cyan-400" />;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ display: "none" }}
          cursor={false}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#fg-${color.replace("#", "")})`}
          dot={false}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function MarketingForecasts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Marketing Forecasts</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Predictive intelligence for the next 30 days</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI Predictions Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecastCards.map((card, i) => {
          const cfg = trendConfig[card.trend as Trend];
          const showChange = card.change !== null;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.07 }}
              className={`relative bg-gradient-to-br ${cfg.bgFrom} to-transparent border ${cfg.borderColor} rounded-2xl p-4 overflow-hidden hover:brightness-110 transition-all`}
            >
              {/* confidence badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-[9px] text-zinc-400">{card.confidence}% conf</span>
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                <TrendIcon trend={card.trend as Trend} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                  {card.period}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 mb-1">{card.title}</p>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-white leading-none">{card.value}</span>
                {showChange && (
                  <span
                    className={`text-xs font-semibold pb-0.5 ${card.change! > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {card.change! > 0 ? "+" : ""}
                    {card.change}%
                  </span>
                )}
              </div>

              {card.sparkline ? (
                <div className="my-2">
                  <MiniSparkline data={card.sparkline} color={cfg.color} />
                </div>
              ) : (
                <div className="h-10" />
              )}

              <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">{card.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer signal bar */}
      <div className="rounded-2xl bg-[#111114] border border-white/[0.07] p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-green-400" />
            <span className="text-xs text-zinc-400">3 positive signals</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-orange-400" />
            <span className="text-xs text-zinc-400">2 alerts requiring action</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <TrendingDown size={13} className="text-red-400" />
            <span className="text-xs text-zinc-400">Budget reallocation recommended — ₹3,500</span>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] text-zinc-600">Updated 4 min ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
