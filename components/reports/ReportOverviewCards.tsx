"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Camera, Film } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

const metrics = [
  {
    label: "Monthly Spend",
    value: "₹48,200",
    change: +12.4,
    sparkline: [32, 36.4, 41.2, 38.8, 44.6, 48.2],
    color: "purple" as const,
    delay: 0,
  },
  {
    label: "Total Leads",
    value: "124",
    change: +18.3,
    sparkline: [68, 82, 97, 89, 110, 124],
    color: "green" as const,
    delay: 0.05,
  },
  {
    label: "ROAS",
    value: "3.8×",
    change: +0.6,
    sparkline: [3.2, 3.4, 3.6, 3.5, 3.7, 3.8],
    color: "blue" as const,
    delay: 0.1,
  },
  {
    label: "Conv. Rate",
    value: "4.6%",
    change: +1.1,
    sparkline: [3.2, 3.5, 3.8, 3.6, 4.2, 4.6],
    color: "orange" as const,
    delay: 0.15,
  },
];

const colorMap = {
  purple: { stroke: "#a855f7", fill: "#a855f720" },
  blue:   { stroke: "#3b82f6", fill: "#3b82f620" },
  green:  { stroke: "#22c55e", fill: "#22c55e20" },
  orange: { stroke: "#f97316", fill: "#f9731620" },
};

export default function ReportOverviewCards() {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
        Report Overview
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">

        {/* Standard metric cards */}
        {metrics.map((card) => {
          const c = colorMap[card.color];
          const isPos = card.change >= 0;
          const sparkData = card.sparkline.map((v, i) => ({ v, i }));

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: card.delay }}
              className="relative bg-[#111114] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:border-white/[0.13] transition-colors"
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${c.stroke}60, transparent)` }}
              />
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
                {card.label}
              </p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-2xl font-semibold tracking-tight text-white">
                  {card.value}
                </span>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPos ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {isPos ? "+" : ""}{card.change}%
                </span>
              </div>
              <div className="h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`rpt-${card.label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.stroke} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={c.stroke}
                      strokeWidth={1.5}
                      fill={`url(#rpt-${card.label})`}
                      dot={false}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}

        {/* Top Platform card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative bg-[#111114] border border-pink-500/20 rounded-2xl p-5 overflow-hidden hover:border-pink-500/35 transition-colors"
        >
          <div className="absolute inset-x-0 top-0 h-px opacity-70 bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
            Top Platform
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
              <Camera size={13} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Instagram</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">52% spend</span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">
              <TrendingUp size={11} /> +8.2%
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "52%" }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-1.5">4.8× ROAS · 58 leads</p>
        </motion.div>

        {/* Best Creative card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="relative bg-[#111114] border border-yellow-500/20 rounded-2xl p-5 overflow-hidden hover:border-yellow-500/35 transition-colors"
        >
          <div className="absolute inset-x-0 top-0 h-px opacity-70 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
            Best Creative
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shrink-0">
              <Film size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white leading-tight">Wedding Gold Reel</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">₹326 CPL</span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">
              <TrendingDown size={11} /> -6.4%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <span className="text-[10px] text-yellow-400 font-bold shrink-0">94</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1.5">5.4% CTR · 38 leads</p>
        </motion.div>

      </div>
    </section>
  );
}
