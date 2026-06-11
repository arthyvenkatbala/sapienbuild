"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { reportSpendTrendData, reportLeadGrowthData } from "@/lib/mock-data";

function SpendTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/[0.1] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="text-white font-semibold">₹{(p.value / 1000).toFixed(1)}k</span>
        </div>
      ))}
    </div>
  );
}

function LeadTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/[0.1] rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="text-white font-semibold">{p.value} leads</span>
        </div>
      ))}
    </div>
  );
}

export default function SpendLeadCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* Spend Trends — 2/3 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="xl:col-span-2 bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Spend Trends</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Actual spend vs budget · Jan–Jun 2026</p>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-purple-500 inline-block" />
              <span className="text-zinc-400">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0 border-t border-dashed border-zinc-600 inline-block" />
              <span className="text-zinc-400">Budget</span>
            </div>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={reportSpendTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rpt-spend-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<SpendTooltip />} />
              <Area
                type="monotone"
                dataKey="spend"
                name="Actual"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#rpt-spend-grad)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="budget"
                name="Budget"
                stroke="#3f3f46"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-3 gap-3">
          {[
            { label: "Total Spent", value: "₹2.42L", sub: "+12.4% vs last period" },
            { label: "Budget Used", value: "87%",    sub: "₹6.2k remaining" },
            { label: "Peak Month",  value: "Jun",    sub: "₹48.2k spend" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d0d10] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{s.label}</p>
              <p className="text-sm font-bold text-white mt-1">{s.value}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lead Growth — 1/3 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.33 }}
        className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="mb-6">
          <h2 className="text-base font-semibold text-white">Lead Growth</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Actual vs monthly target</p>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={reportLeadGrowthData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="rpt-lead-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<LeadTooltip />} />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#rpt-lead-grad)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#3f3f46"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-col gap-2">
          {[
            { label: "Best Month",  value: "Jun",   sub: "124 leads",      color: "#22c55e" },
            { label: "Growth Rate", value: "+83%",  sub: "vs Jan baseline", color: "#a855f7" },
            { label: "Avg/Month",   value: "95",    sub: "leads per month", color: "#38bdf8" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between bg-[#0d0d10] rounded-xl px-3 py-2">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{s.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
