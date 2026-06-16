"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SpendSummary, SpendBreakdown } from "@/lib/marketing-insights";

function inr(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111116] border border-white/[0.08] rounded-lg px-3 py-2 text-xs">
      <span className="text-white font-semibold">{inr(payload[0].value)}</span>
    </div>
  );
}

function EfficiencyTable({ breakdown }: { breakdown: SpendBreakdown[] }) {
  const sorted = [...breakdown].sort((a, b) => {
    if (a.efficiency === null && b.efficiency === null) return 0;
    if (a.efficiency === null) return 1;
    if (b.efficiency === null) return -1;
    return a.efficiency - b.efficiency;
  });

  return (
    <div className="mt-4">
      <p className="text-xs text-zinc-500 mb-2">Efficiency (CPL — lower is better)</p>
      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] text-left">
              <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Platform</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Spend</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Leads</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">CPL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.platform} className={i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}>
                <td className="px-4 py-2.5 text-white/80">{row.platform}</td>
                <td className="px-4 py-2.5 text-zinc-300">{inr(row.spend)}</td>
                <td className="px-4 py-2.5 text-zinc-300">{row.leads.toLocaleString("en-IN")}</td>
                <td className="px-4 py-2.5">
                  {row.efficiency !== null ? (
                    <span className="font-semibold text-green-400">{inr(row.efficiency)}</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const BAR_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899",
];

export default function SpendSummarySection({ summary }: { summary: SpendSummary }) {
  const chartData = summary.breakdown.map((b) => ({
    name: b.platform,
    spend: Math.round(b.spend),
  }));

  return (
    <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Spend Summary
        </h2>
        <div className="flex flex-col items-end">
          <span className="text-xs text-zinc-500">Total (30 days)</span>
          <span className="text-xl font-bold text-white">{inr(summary.total)}</span>
        </div>
      </div>

      {chartData.length > 0 && summary.total > 0 && (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 100000
                    ? `₹${(v / 100000).toFixed(1)}L`
                    : v >= 1000
                    ? `₹${(v / 1000).toFixed(0)}K`
                    : `₹${v}`
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="spend" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <EfficiencyTable breakdown={summary.breakdown} />
    </section>
  );
}
