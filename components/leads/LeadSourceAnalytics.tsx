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
  PieChart,
  Pie,
} from "recharts";
import { Sparkles, Zap, Bell, Clock, TrendingUp } from "lucide-react";
import { sourceAnalytics, aiFollowUps } from "@/lib/leads-data";

// ── Tooltip ───────────────────────────────────────────────────────────────────
function SourceTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/[0.1] rounded-xl p-3 text-xs shadow-2xl">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-zinc-400">
          {p.name}: <span className="text-white font-bold">{p.name === "Conv. Rate" ? `${p.value}%` : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── AI follow-up urgency styles ───────────────────────────────────────────────
const urgencyStyle = {
  urgent:   { border: "border-red-500/25",    bg: "bg-red-500/08",    icon: "text-red-400",    dot: "bg-red-500"    },
  hot:      { border: "border-orange-500/25", bg: "bg-orange-500/08", icon: "text-orange-400", dot: "bg-orange-500" },
  upsell:   { border: "border-purple-500/25", bg: "bg-purple-500/08", icon: "text-purple-400", dot: "bg-purple-500" },
  reminder: { border: "border-blue-500/25",   bg: "bg-blue-500/08",   icon: "text-blue-400",   dot: "bg-blue-500"   },
} as const;

const urgencyIcons = {
  urgent:   Zap,
  hot:      TrendingUp,
  upsell:   Sparkles,
  reminder: Clock,
};

export default function LeadSourceAnalytics() {
  const [metric, setMetric] = useState<"leads" | "convRate" | "revenue">("leads");

  const metricLabel = { leads: "Leads", convRate: "Conv. Rate", revenue: "Revenue (₹)" };

  const barData = sourceAnalytics.map((s) => ({
    source:   s.source,
    value:    metric === "revenue" ? Math.round(s.revenue / 1000) : metric === "convRate" ? s.convRate : s.leads,
    color:    s.color,
  }));

  const pieData = sourceAnalytics.map((s) => ({ name: s.source, value: s.leads, color: s.color }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* ── Source Performance Chart — 2/3 ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="xl:col-span-2 bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Lead Source Analytics</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Performance by acquisition channel</p>
          </div>
          <div className="flex items-center gap-1 bg-[#0d0d10] border border-white/[0.06] rounded-xl p-0.5">
            {(["leads", "convRate", "revenue"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`text-[10px] px-2.5 py-1 rounded-lg capitalize transition-all ${
                  metric === m ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m === "convRate" ? "Conv %" : m === "revenue" ? "Revenue" : "Leads"}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="source" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  metric === "revenue" ? `₹${v}k`
                  : metric === "convRate" ? `${v}%`
                  : String(v)
                }
              />
              <Tooltip content={<SourceTooltip />} />
              <Bar dataKey="value" name={metricLabel[metric]} radius={[6, 6, 0, 0]} maxBarSize={48}>
                {barData.map((entry) => (
                  <Cell key={entry.source} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source table */}
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <div className="grid grid-cols-5 gap-2 mb-2 px-1">
            {["Source", "Leads", "Conv %", "CPL", "Revenue"].map((h) => (
              <p key={h} className="text-[9px] uppercase tracking-wider text-zinc-600 font-semibold">{h}</p>
            ))}
          </div>
          {sourceAnalytics.map((s, i) => (
            <motion.div
              key={s.source}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="grid grid-cols-5 gap-2 items-center px-1 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-zinc-300">{s.source}</span>
              </div>
              <span className="text-xs font-semibold text-white">{s.leads}</span>
              <span className="text-xs font-semibold text-green-400">{s.convRate}%</span>
              <span className="text-xs text-zinc-400">{s.cpl === 0 ? "—" : `₹${s.cpl}`}</span>
              <span className="text-xs text-zinc-300">₹{(s.revenue / 100000).toFixed(1)}L</span>
            </motion.div>
          ))}
        </div>

        {/* AI insight */}
        <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-start gap-2.5 bg-purple-500/[0.05] border border-purple-500/15 rounded-xl p-3">
          <Sparkles size={13} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            <span className="text-purple-400 font-semibold">AI Insight: </span>
            Referral leads convert at <span className="text-white font-semibold">61.1%</span> — 76% higher than the next best channel (Google at 38.9%). Increasing referral incentives could significantly reduce blended CPL.
          </p>
        </div>
      </motion.div>

      {/* ── AI Smart Follow-Ups — 1/3 ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
              <Sparkles size={11} className="text-yellow-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">AI Follow-Ups</h2>
          </div>
          <p className="text-xs text-zinc-500">Smart actions recommended by AI</p>
        </div>

        {/* Source donut — compact */}
        <div className="flex items-center justify-center mb-5">
          <PieChart width={120} height={120}>
            <Pie
              data={pieData}
              cx={60}
              cy={60}
              innerRadius={36}
              outerRadius={52}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-5">
          {sourceAnalytics.map((s) => (
            <div key={s.source} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[10px] text-zinc-500 truncate">{s.source}</span>
              <span className="text-[10px] text-zinc-400 ml-auto font-medium">{s.leads}</span>
            </div>
          ))}
        </div>

        {/* Follow-up cards */}
        <div className="flex flex-col gap-2 flex-1">
          {aiFollowUps.map((item, i) => {
            const style = urgencyStyle[item.urgency as keyof typeof urgencyStyle];
            const Icon  = urgencyIcons[item.urgency as keyof typeof urgencyIcons];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className={`border rounded-xl p-3 ${style.border}`}
                style={{ background: `rgba(0,0,0,0.15)` }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Icon size={12} className={`shrink-0 mt-0.5 ${style.icon}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.leadName}</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                </div>
                <button
                  className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all w-full justify-center ${style.icon} hover:brightness-125`}
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <Bell size={9} /> {item.action}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
