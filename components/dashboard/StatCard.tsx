"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  unit?: string;
  sparkline: number[];
  color?: "purple" | "blue" | "green" | "orange";
  delay?: number;
}

const colorMap = {
  purple: { stroke: "#a855f7", fill: "#a855f720", text: "text-purple-400" },
  blue:   { stroke: "#3b82f6", fill: "#3b82f620", text: "text-blue-400" },
  green:  { stroke: "#22c55e", fill: "#22c55e20", text: "text-green-400" },
  orange: { stroke: "#f97316", fill: "#f9731620", text: "text-orange-400" },
};

export default function StatCard({
  label,
  value,
  change,
  sparkline,
  color = "purple",
  delay = 0,
}: StatCardProps) {
  const c = colorMap[color];
  const isPositive = change >= 0;
  const sparkData = sparkline.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative bg-[#111114] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:border-white/[0.13] transition-colors group"
    >
      {/* subtle top-edge glow */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${c.stroke}60, transparent)` }}
      />

      <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">
        {label}
      </p>

      <div className="flex items-end justify-between mb-3">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </span>

        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={11} />
          ) : (
            <TrendingDown size={11} />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>

      {/* sparkline */}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.stroke} stopOpacity={0.4} />
                <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={() => null}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={c.stroke}
              strokeWidth={1.5}
              fill={`url(#spark-${label})`}
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
