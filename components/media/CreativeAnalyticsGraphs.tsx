"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { engagementTrends, watchTimeRetention, platformCreativePerf } from "@/lib/mock-data";

type ChartTab = "engagement" | "retention" | "platform";

const TABS: { key: ChartTab; label: string }[] = [
  { key: "engagement", label: "Engagement Trends" },
  { key: "retention",  label: "Watch-Time Retention" },
  { key: "platform",   label: "Platform × Creative" },
];

const SERIES = [
  { key: "reels",         color: "#a855f7", label: "Reels" },
  { key: "weddingVideos", color: "#38bdf8", label: "Wedding Videos" },
  { key: "carousels",     color: "#22c55e", label: "Carousels" },
  { key: "photography",   color: "#f59e0b", label: "Photography" },
];

const BARS = [
  { key: "reels",         color: "#a855f7", label: "Reels" },
  { key: "weddingVideos", color: "#38bdf8", label: "Wedding Videos" },
  { key: "carousels",     color: "#22c55e", label: "Carousels" },
  { key: "photography",   color: "#f59e0b", label: "Photography" },
];

const RETENTION_SERIES = [
  { key: "golden",      color: "#a855f7", label: "Golden Hour Reel" },
  { key: "mandap",      color: "#38bdf8", label: "Mandap Ceremony" },
  { key: "destination", color: "#f59e0b", label: "Destination Wedding" },
  { key: "bts",         color: "#f97316", label: "Behind the Scenes" },
];

const tooltipStyle = {
  backgroundColor: "#111114",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  fontSize: 11,
  color: "#e4e4e7",
};

export default function CreativeAnalyticsGraphs() {
  const [activeTab, setActiveTab] = useState<ChartTab>("engagement");

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 space-y-5">
      {/* Header + tabs */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Creative Analytics</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Performance trends by content type</p>
        </div>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === t.key
                  ? "bg-white/[0.1] text-white border border-white/[0.14]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "engagement" && (
            <div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {SERIES.map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-[10px] text-zinc-400">{s.label}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={engagementTrends} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                  {SERIES.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "retention" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {RETENTION_SERIES.map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-[10px] text-zinc-400">{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mb-3">% of viewers remaining through each point of the video</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={watchTimeRetention} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                  <defs>
                    {RETENTION_SERIES.map((s) => (
                      <linearGradient key={s.key} id={`ret-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={s.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="pct" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} labelFormatter={(l) => `${l}% through video`} />
                  {RETENTION_SERIES.map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#ret-${s.key})`}
                      dot={false}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "platform" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {BARS.map((b) => (
                  <div key={b.key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                    <span className="text-[10px] text-zinc-400">{b.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mb-3">Engagement score (0–100) by creative type on each platform</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={platformCreativePerf} margin={{ top: 4, right: 8, bottom: 0, left: -10 }} barGap={2}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="platform" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {BARS.map((b) => (
                    <Bar
                      key={b.key}
                      dataKey={b.key}
                      name={b.label}
                      fill={b.color}
                      radius={[3, 3, 0, 0]}
                      fillOpacity={0.85}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
