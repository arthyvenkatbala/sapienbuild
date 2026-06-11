"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { reportPlatformData, reportCampaignData } from "@/lib/mock-data";

const platformColors: Record<string, string> = {
  Instagram: "#e1306c",
  Facebook:  "#1877f2",
  Google:    "#4285f4",
  YouTube:   "#ff4444",
};

const statusStyle: Record<string, string> = {
  active: "text-green-400 bg-green-500/10 border border-green-500/20",
  paused: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20",
  ended:  "text-zinc-500 bg-zinc-500/10 border border-zinc-500/20",
};

const metricKeys = ["spend", "leads", "roas", "cpl"] as const;
type MetricKey = typeof metricKeys[number];

const metricLabels: Record<MetricKey, string> = {
  spend: "Spend",
  leads: "Leads",
  roas: "ROAS",
  cpl: "CPL",
};

function PlatformTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  metric: MetricKey;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const formatted =
    metric === "spend" ? `₹${(val / 1000).toFixed(1)}k`
    : metric === "cpl"  ? `₹${val}`
    : metric === "roas" ? `${val}×`
    : String(val);
  return (
    <div className="bg-[#1a1a1f] border border-white/[0.1] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white font-semibold">{label}</p>
      <p className="text-zinc-400 mt-1">{metricLabels[metric]}: <span className="text-white font-bold">{formatted}</span></p>
    </div>
  );
}

export default function PlatformCampaignSection() {
  const [metric, setMetric] = useState<MetricKey>("spend");

  const tickFormatter = (v: number) =>
    metric === "spend" ? `₹${v / 1000}k`
    : metric === "cpl"  ? `₹${v}`
    : metric === "roas" ? `${v}×`
    : String(v);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* Platform Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Platform Comparison</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Performance breakdown by platform</p>
          </div>
          <div className="flex items-center gap-1 bg-[#0d0d10] border border-white/[0.06] rounded-xl p-0.5">
            {metricKeys.map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`text-[10px] px-2 py-1 rounded-lg capitalize transition-all ${
                  metric === m
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportPlatformData}
              margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="platform"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={tickFormatter}
              />
              <Tooltip content={<PlatformTooltip metric={metric} />} />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]} maxBarSize={52}>
                {reportPlatformData.map((entry) => (
                  <Cell
                    key={entry.platform}
                    fill={platformColors[entry.platform] ?? "#6366f1"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-2">
          {reportPlatformData.map((p) => (
            <div key={p.platform} className="flex items-center gap-2.5 bg-[#0d0d10] rounded-xl px-3 py-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: platformColors[p.platform] ?? "#6366f1" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 font-medium">{p.platform}</p>
                <p className="text-[10px] text-zinc-600">{p.leads} leads · {p.roas}× ROAS</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Campaign Performance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Campaign Performance</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ranked by ROAS</p>
          </div>
          <button className="text-xs text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.14] px-2.5 py-1 rounded-xl transition-all shrink-0">
            Export
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {reportCampaignData.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
              className="flex items-center gap-3 bg-[#0d0d10] rounded-xl px-3 py-2.5 hover:bg-[#141418] transition-colors"
            >
              <span className="text-xs text-zinc-600 font-semibold w-4 shrink-0 text-center">
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">{c.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-zinc-500">{c.platform}</span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-500">₹{(c.spend / 1000).toFixed(1)}k</span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-500">{c.leads} leads</span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-500">₹{c.cpl} CPL</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-bold text-white">{c.roas}×</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full capitalize ${statusStyle[c.status]}`}>
                  {c.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.05] grid grid-cols-3 gap-2">
          {[
            { label: "Active", value: "4", color: "#22c55e" },
            { label: "Paused", value: "1", color: "#eab308" },
            { label: "Ended",  value: "1", color: "#71717a" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-[#0d0d10] rounded-xl py-2">
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
