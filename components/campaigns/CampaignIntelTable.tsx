"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp, ChevronDown, Rocket, CheckCircle2,
  AlertTriangle, PauseCircle, Flame,
} from "lucide-react";
import { campaignTableData } from "@/lib/mock-data";

type SortKey = "spend" | "ctr" | "cpl" | "leads" | "roas";
type SortDir = "asc" | "desc";

const statusConfig = {
  scaling: { label: "Scaling", bg: "bg-green-500/15",  text: "text-green-400",  border: "border-green-500/25",  Icon: Rocket       },
  active:  { label: "Active",  bg: "bg-blue-500/15",   text: "text-blue-400",   border: "border-blue-500/25",   Icon: CheckCircle2 },
  warning: { label: "Warning", bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/25", Icon: AlertTriangle },
  paused:  { label: "Paused",  bg: "bg-zinc-500/15",   text: "text-zinc-400",   border: "border-zinc-500/25",   Icon: PauseCircle  },
  fatigue: { label: "Fatigue", bg: "bg-red-500/15",    text: "text-red-400",    border: "border-red-500/25",    Icon: Flame        },
};

const platformColor: Record<string, string> = {
  Instagram: "#a855f7",
  Facebook:  "#6366f1",
  Google:    "#22c55e",
  YouTube:   "#f97316",
};

const PLATFORMS = ["All", "Instagram", "Facebook", "Google", "YouTube"];

export default function CampaignIntelTable() {
  const [filter, setFilter]   = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("roas");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = campaignTableData
    .filter(c => filter === "All" || c.platform === filter)
    .sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      return (Number(a[sortKey]) - Number(b[sortKey])) * mult;
    });

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {label}
        {sortKey === k
          ? sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />
          : <ChevronDown size={10} className="opacity-25" />}
      </span>
    </th>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">Campaign Intelligence</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} campaigns · sorted by {sortKey.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-1 bg-[#0d0d10] border border-white/[0.06] rounded-xl p-1 overflow-x-auto">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === p ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {p !== "All" && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: platformColor[p] }} />
              )}
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Campaign</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Platform</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Objective</th>
              <SortTh k="spend"  label="Spend"  />
              <SortTh k="ctr"    label="CTR"    />
              <SortTh k="cpl"    label="CPL"    />
              <SortTh k="leads"  label="Leads"  />
              <SortTh k="roas"   label="ROAS"   />
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const sc = statusConfig[c.status as keyof typeof statusConfig];
              const StatusIcon = sc.Icon;
              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors whitespace-nowrap">{c.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: platformColor[c.platform] }} />
                      <span className="text-xs text-zinc-400 whitespace-nowrap">{c.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-zinc-500 whitespace-nowrap">{c.objective}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-medium text-white">₹{(c.spend / 1000).toFixed(1)}k</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-sm font-medium ${c.ctr >= 4 ? "text-green-400" : c.ctr >= 3 ? "text-white" : "text-red-400"}`}>
                      {c.ctr}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-sm font-medium ${c.cpl <= 350 ? "text-green-400" : c.cpl <= 420 ? "text-white" : "text-red-400"}`}>
                      ₹{c.cpl}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-medium text-white">{c.leads}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      c.roas >= 4.5 ? "text-amber-400" : c.roas >= 3.5 ? "text-green-400" : c.roas >= 3 ? "text-white" : "text-red-400"
                    }`}>
                      {c.roas}×
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${sc.bg} ${sc.text} ${sc.border} whitespace-nowrap`}>
                      <StatusIcon size={10} />
                      {sc.label}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
