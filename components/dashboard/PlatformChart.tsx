"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { platformClickData } from "@/lib/mock-data";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#a855f7" },
  { key: "facebook",  label: "Facebook",  color: "#3b82f6" },
  { key: "google",    label: "Google",    color: "#22c55e" },
  { key: "youtube",   label: "YouTube",   color: "#f97316" },
];

type Range = "7d" | "14d" | "30d";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300">{p.name}</span>
          <span className="font-semibold text-white ml-auto">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function PlatformChart() {
  const [range, setRange] = useState<Range>("14d");
  const [active, setActive] = useState<string[]>(PLATFORMS.map((p) => p.key));

  const togglePlatform = (key: string) => {
    setActive((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    );
  };

  const sliceMap: Record<Range, number> = { "7d": 4, "14d": 7, "30d": 10 };
  const data = platformClickData.slice(-sliceMap[range]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Platform Click Analytics</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Clicks by channel over time</p>
        </div>

        <div className="flex items-center gap-2">
          {/* range toggle */}
          <div className="flex bg-[#1a1a1f] border border-white/[0.07] rounded-xl p-1 gap-1">
            {(["7d", "14d", "30d"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  range === r
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* platform toggles */}
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                  active.includes(p.key)
                    ? "border-transparent text-white"
                    : "border-white/[0.07] text-zinc-600"
                }`}
                style={
                  active.includes(p.key)
                    ? { background: `${p.color}22`, borderColor: `${p.color}55` }
                    : {}
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: active.includes(p.key) ? p.color : "#444" }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              {PLATFORMS.map((p) => (
                <linearGradient key={p.key} id={`grad-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {PLATFORMS.filter((p) => active.includes(p.key)).map((p) => (
              <Area
                key={p.key}
                type="monotone"
                dataKey={p.key}
                name={p.label}
                stroke={p.color}
                strokeWidth={2}
                fill={`url(#grad-${p.key})`}
                dot={false}
                activeDot={{ r: 4, fill: p.color, stroke: "#111114", strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
