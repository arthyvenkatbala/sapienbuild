"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { platformTimeseries } from "@/lib/mock-data";

type Metric = "clicks" | "impressions" | "spend" | "leads" | "conversions";
type Range  = "7D" | "30D" | "90D";

const METRICS: { key: Metric; label: string }[] = [
  { key: "clicks",      label: "Clicks"      },
  { key: "impressions", label: "Impressions" },
  { key: "spend",       label: "Spend (₹)"   },
  { key: "leads",       label: "Leads"       },
  { key: "conversions", label: "Conversions" },
];

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#a855f7" },
  { key: "facebook",  label: "Facebook",  color: "#6366f1" },
  { key: "google",    label: "Google",    color: "#22c55e" },
  { key: "youtube",   label: "YouTube",   color: "#f97316" },
];

const sliceMap: Record<Range, number> = { "7D": 4, "30D": 7, "90D": 10 };

function formatValue(v: number, metric: Metric) {
  if (metric === "spend")       return `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`;
  if (metric === "impressions") return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
  return String(v);
}

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl p-3 shadow-2xl min-w-[160px]">
      <p className="text-zinc-400 text-[11px] mb-2.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-zinc-400 text-xs">{p.name}</span>
          </div>
          <span className="text-white text-xs font-semibold">{formatValue(p.value, metric)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CrossPlatformGraph() {
  const [metric, setMetric] = useState<Metric>("clicks");
  const [range, setRange]   = useState<Range>("30D");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const data = platformTimeseries[metric].slice(-sliceMap[range]);

  const togglePlatform = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < PLATFORMS.length - 1) {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Cross-Platform Performance</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Compare channels across key metrics</p>
        </div>

        {/* Range toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-[#1a1a1f] border border-white/[0.07] rounded-xl p-1 gap-1">
            {(["7D", "30D", "90D"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  range === r ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              metric === m.key
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                : "bg-transparent border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Platform filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PLATFORMS.map((p) => {
          const active = !hidden.has(p.key);
          return (
            <button
              key={p.key}
              onClick={() => togglePlatform(p.key)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all"
              style={
                active
                  ? { background: `${p.color}18`, borderColor: `${p.color}50`, color: "#fff" }
                  : { borderColor: "#ffffff10", color: "#52525b" }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ background: active ? p.color : "#444" }}
              />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${metric}-${range}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {PLATFORMS.map((p) => (
                  <filter key={p.key} id={`glow-${p.key}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <CartesianGrid stroke="#ffffff07" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatValue(v, metric)}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              {PLATFORMS.filter((p) => !hidden.has(p.key)).map((p) => (
                <Line
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={p.label}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: p.color, stroke: "#111114", strokeWidth: 2.5 }}
                  isAnimationActive
                  animationDuration={600}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
