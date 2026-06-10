"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { campaignIntelKpis } from "@/lib/mock-data";

const colorMap = {
  purple: { stroke: "#a855f7", fill: "#a855f720" },
  blue:   { stroke: "#3b82f6", fill: "#3b82f620" },
  green:  { stroke: "#22c55e", fill: "#22c55e20" },
  orange: { stroke: "#f97316", fill: "#f9731620" },
  cyan:   { stroke: "#38bdf8", fill: "#38bdf820" },
};

function KpiCard({ label, value, change, sparkline, color, delay }: {
  label: string; value: string; change: number; sparkline: number[];
  color: keyof typeof colorMap; delay: number;
}) {
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
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${c.stroke}60, transparent)` }}
      />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.stroke}08, transparent 70%)` }}
      />

      <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-3">{label}</p>
      <div className="flex items-end justify-between mb-3">
        <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        }`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-ci-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.stroke} stopOpacity={0.4} />
                <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={() => null} />
            <Area type="monotone" dataKey="v" stroke={c.stroke} strokeWidth={1.5}
              fill={`url(#spark-ci-${label.replace(/\s/g, "")})`} dot={false} isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function CampaignOverviewCards() {
  const k = campaignIntelKpis;

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">Campaign Overview</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Active Campaigns" value={String(k.activeCampaigns.value)}
          change={k.activeCampaigns.change} sparkline={k.activeCampaigns.sparkline} color="purple" delay={0} />
        <KpiCard label="Total Spend" value={`₹${(k.totalSpend.value / 1000).toFixed(1)}k`}
          change={k.totalSpend.change} sparkline={k.totalSpend.sparkline.map(v => v / 1000)} color="blue" delay={0.06} />
        <KpiCard label="ROAS" value={`${k.roas.value}×`}
          change={k.roas.change} sparkline={k.roas.sparkline} color="green" delay={0.12} />
        <KpiCard label="Total Leads" value={String(k.totalLeads.value)}
          change={k.totalLeads.change} sparkline={k.totalLeads.sparkline} color="cyan" delay={0.18} />
        <KpiCard label="Avg. CPL" value={`₹${k.avgCpl.value}`}
          change={k.avgCpl.change} sparkline={k.avgCpl.sparkline} color="orange" delay={0.24} />

        {/* Best Campaign special card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative bg-gradient-to-br from-[#1c0e30] via-[#150b24] to-[#111114] border border-purple-500/25 rounded-2xl p-5 overflow-hidden hover:border-amber-500/35 transition-colors group"
        >
          <div className="absolute inset-x-0 top-0 h-px opacity-70"
            style={{ background: "linear-gradient(90deg, transparent, #f59e0b60, transparent)" }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06), transparent 70%)" }}
          />

          <div className="flex items-center gap-1.5 mb-3">
            <Trophy size={11} className="text-amber-400" />
            <p className="text-xs font-medium tracking-widest uppercase text-zinc-500">Best Campaign</p>
          </div>
          <p className="text-sm font-semibold text-white leading-tight mb-1 pr-1">{k.bestCampaign.name}</p>
          <p className="text-[10px] text-zinc-500 mb-4">{k.bestCampaign.platform}</p>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-amber-400">{k.bestCampaign.roas}×</span>
              <p className="text-[10px] text-zinc-500 mt-0.5">ROAS</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-purple-400">{k.bestCampaign.leads}</span>
              <p className="text-[10px] text-zinc-500 mt-0.5">leads</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
