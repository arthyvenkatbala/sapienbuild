"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Film, Percent, Play, Clock, Heart, Target } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { mediaOverviewStats, mediaSparklines } from "@/lib/mock-data";

interface CardConfig {
  key: keyof typeof mediaOverviewStats;
  sparklineKey?: keyof typeof mediaSparklines;
  icon: React.ElementType;
  color: string;
  gradient: string;
  delay: number;
}

const CARDS: CardConfig[] = [
  { key: "totalAssets",      sparklineKey: "totalAssets",      icon: Film,    color: "#a855f7", gradient: "from-purple-500/10", delay: 0 },
  { key: "bestEngagementRate", sparklineKey: "engagementRate", icon: Percent, color: "#38bdf8", gradient: "from-cyan-500/10",   delay: 0.05 },
  { key: "topReel",          sparklineKey: undefined,           icon: Play,    color: "#f59e0b", gradient: "from-amber-500/10",  delay: 0.1 },
  { key: "avgWatchTime",     sparklineKey: "avgWatchTime",      icon: Clock,   color: "#22c55e", gradient: "from-green-500/10",  delay: 0.15 },
  { key: "savesAndShares",   sparklineKey: "savesAndShares",    icon: Heart,   color: "#f43f5e", gradient: "from-rose-500/10",   delay: 0.2 },
  { key: "creativeConvRate", sparklineKey: "creativeConvRate",  icon: Target,  color: "#6366f1", gradient: "from-indigo-500/10", delay: 0.25 },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={d} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`mo-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="v"
          stroke={color} strokeWidth={1.5}
          fill={`url(#mo-${color.replace("#","")})`}
          dot={false} isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function MediaOverviewCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map(({ key, sparklineKey, icon: Icon, color, gradient, delay }) => {
        const stat = mediaOverviewStats[key];
        const sparkData = sparklineKey ? mediaSparklines[sparklineKey] : null;
        const isPositive = stat.change !== null && (stat.change as number) > 0;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay }}
            className={`bg-gradient-to-br ${gradient} to-transparent bg-[#111114] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.12] transition-colors`}
            style={{ background: "#111114" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${color}20` }}
              >
                <Icon size={15} style={{ color }} />
              </div>

              {stat.change !== null && (
                <div
                  className="flex items-center gap-0.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                  style={{
                    color: isPositive ? "#22c55e" : "#f97316",
                    background: isPositive ? "#22c55e20" : "#f9731620",
                  }}
                >
                  {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {isPositive ? "+" : ""}{stat.change}{stat.unit === "%" ? "pp" : ""}
                </div>
              )}
            </div>

            <p className="text-xl font-bold text-white leading-none mb-0.5">
              {stat.unit === "%" ? `${stat.value}%` : stat.value}
            </p>
            <p className="text-[11px] text-zinc-500 leading-snug">{stat.label}</p>

            {sparkData && (
              <div className="mt-3 -mx-1">
                <Sparkline data={sparkData} color={color} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
