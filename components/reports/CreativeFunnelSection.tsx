"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Image, LayoutGrid, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { reportCreativeData, analyticsFunnelData } from "@/lib/mock-data";

const typeIcon = {
  Video:    Film,
  Carousel: LayoutGrid,
  Static:   Image,
} as const;

const typeColor = {
  Video:    "#a855f7",
  Carousel: "#3b82f6",
  Static:   "#f97316",
} as const;

const WIDTHS = [100, 78, 58, 42, 28];

type CreativeType = keyof typeof typeIcon;
const filterOptions = ["All", "Video", "Carousel", "Static"] as const;

export default function CreativeFunnelSection() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered =
    activeFilter === "All"
      ? reportCreativeData
      : reportCreativeData.filter((c) => c.type === activeFilter);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* Creative Performance — 2/3 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="xl:col-span-2 bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Creative Performance</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ranked by AI creative score</p>
          </div>
          <div className="flex items-center gap-1 bg-[#0d0d10] border border-white/[0.06] rounded-xl p-0.5">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                  activeFilter === f
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c, i) => {
            const Icon = typeIcon[c.type as CreativeType] ?? Film;
            const color = typeColor[c.type as CreativeType] ?? "#a855f7";
            const scoreColor =
              c.score >= 80 ? "#22c55e"
              : c.score >= 65 ? "#f97316"
              : "#ef4444";

            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                className="bg-[#0d0d10] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${color}20`,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate max-w-[140px]">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">{c.type} · {c.platform}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                    <span className="text-sm font-bold" style={{ color: scoreColor }}>
                      {c.score}
                    </span>
                    <span className="text-[9px] text-zinc-600">score</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.score}%` }}
                    transition={{ duration: 0.8, delay: 0.55 + i * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${color}, ${scoreColor})`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "CTR",  value: `${c.ctr}%` },
                    { label: "CPL",  value: `₹${c.cpl}` },
                    { label: "Leads", value: String(c.leads) },
                    { label: "IMP",  value: `${(c.impressions / 1000).toFixed(0)}k` },
                  ].map((m) => (
                    <div key={m.label} className="text-center bg-[#111114] rounded-lg py-1.5">
                      <p className="text-[9px] text-zinc-600 uppercase">{m.label}</p>
                      <p className="text-xs font-semibold text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Format summary */}
        <div className="mt-5 pt-4 border-t border-white/[0.05] grid grid-cols-3 gap-3">
          {[
            { type: "Video",    count: 3, avgCPL: "₹382", avgCTR: "4.2%", color: "#a855f7" },
            { type: "Carousel", count: 1, avgCPL: "₹344", avgCTR: "3.8%", color: "#3b82f6" },
            { type: "Static",   count: 2, avgCPL: "₹467", avgCTR: "2.9%", color: "#f97316" },
          ].map((f) => (
            <div key={f.type} className="bg-[#0d0d10] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                <p className="text-xs font-medium text-zinc-300">{f.type}</p>
                <span className="text-[10px] text-zinc-600">×{f.count}</span>
              </div>
              <p className="text-xs text-zinc-500">Avg CPL <span className="text-white font-semibold">{f.avgCPL}</span></p>
              <p className="text-xs text-zinc-500">Avg CTR <span className="font-semibold" style={{ color: f.color }}>{f.avgCTR}</span></p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Funnel Analysis — 1/3 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col"
      >
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Funnel Analysis</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Impressions → bookings</p>
        </div>

        <div className="flex flex-col items-center gap-0 flex-1">
          {analyticsFunnelData.map((stage, i) => {
            const isExpanded = expandedIdx === i;
            return (
              <div key={stage.stage} className="w-full flex flex-col items-center">
                {stage.dropOff !== null && (
                  <div className="flex items-center justify-center gap-2 py-1.5 w-full">
                    <div className="flex-1 h-px bg-white/[0.05]" />
                    <span className="text-[10px] text-red-400/70 font-medium whitespace-nowrap">
                      ↓ {stage.dropOff}% drop
                    </span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, scaleX: 0.6 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.12 + i * 0.1, ease: "easeOut" }}
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  className="relative cursor-pointer rounded-xl flex items-center justify-between px-3 py-2.5 transition-all hover:brightness-110"
                  style={{
                    width: `${WIDTHS[i]}%`,
                    minWidth: 140,
                    background: `linear-gradient(90deg, ${stage.color}28, ${stage.color}18)`,
                    border: `1px solid ${stage.color}40`,
                  }}
                >
                  <div>
                    <p className="text-[10px] font-semibold text-white">{stage.stage}</p>
                    <p className="text-sm font-bold text-white">{stage.displayValue}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ color: stage.color, background: `${stage.color}25` }}
                    >
                      {stage.pct}%
                    </span>
                    {stage.insight && (
                      <span style={{ color: stage.color }}>
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </span>
                    )}
                  </div>
                </motion.div>

                {stage.insight && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 mb-1 rounded-xl border border-white/[0.07] bg-[#0d0d10] px-2.5 py-2 flex items-start gap-2"
                    style={{ width: `${WIDTHS[i]}%`, minWidth: 140 }}
                  >
                    <Lightbulb size={10} className="text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-300 leading-relaxed">{stage.insight}</p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-2">
          {[
            { label: "Imp→Click", value: "3.8%", color: "#a855f7" },
            { label: "Click→Lead", value: "5.0%", color: "#38bdf8" },
            { label: "Lead→Book",  value: "7.0%", color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d0d10] rounded-xl px-2 py-2 text-center">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xs font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
