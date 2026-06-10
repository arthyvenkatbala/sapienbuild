"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { budgetAllocationData } from "@/lib/mock-data";

type Tab = "byPlatform" | "byCampaign" | "byAudience";

const TABS: { key: Tab; label: string }[] = [
  { key: "byPlatform", label: "Platform"  },
  { key: "byCampaign", label: "Campaign"  },
  { key: "byAudience", label: "Audience"  },
];

const BudgetTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-2xl">
      <p className="text-zinc-300 font-semibold mb-0.5">{item.name}</p>
      <p className="text-white font-bold">₹{item.value.toLocaleString()}</p>
      <p className="text-zinc-500">{item.pct}% of total</p>
      {item.roas !== undefined && (
        <p className="text-green-400 font-medium mt-0.5">{item.roas}× ROAS</p>
      )}
    </div>
  );
};

export default function BudgetAllocationVisualizer() {
  const [tab, setTab] = useState<Tab>("byPlatform");
  const data = budgetAllocationData[tab];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Budget Allocation</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            How <span className="text-white font-medium">₹{(total / 1000).toFixed(1)}k</span> is distributed
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#0d0d10] border border-white/[0.06] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tab === t.key ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                paddingAngle={3} stroke="none"
                isAnimationActive animationDuration={600}
              >
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<BudgetTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-white">₹{(total / 1000).toFixed(0)}k</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Total Spend</span>
          </div>
        </div>

        {/* Legend + bars */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="flex-1 space-y-3 min-w-0"
          >
            {data.map((item, i) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-zinc-300 truncate">{item.name}</span>
                    {item.roas !== undefined && (
                      <span className="text-[10px] text-zinc-600 shrink-0">{item.roas}×</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-zinc-500">₹{(item.value / 1000).toFixed(1)}k</span>
                    <span className="text-xs font-semibold text-white w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Recommendation strip */}
      {tab === "byPlatform" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex items-center gap-2 bg-green-500/8 border border-green-500/15 rounded-xl px-3 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          <p className="text-[11px] text-zinc-400">
            Shift <span className="text-green-400 font-medium">7% YouTube budget → Instagram</span> to add ~0.3× portfolio ROAS
          </p>
        </motion.div>
      )}
      {tab === "byCampaign" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex items-center gap-2 bg-purple-500/8 border border-purple-500/15 rounded-xl px-3 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
          <p className="text-[11px] text-zinc-400">
            <span className="text-purple-400 font-medium">Wedding Gold (26%)</span> delivers the best return — consider increasing its share
          </p>
        </motion.div>
      )}
      {tab === "byAudience" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex items-center gap-2 bg-blue-500/8 border border-blue-500/15 rounded-xl px-3 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <p className="text-[11px] text-zinc-400">
            Retargeting at only <span className="text-blue-400 font-medium">12%</span> — expand warm audiences for higher ROAS at lower CPL
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
