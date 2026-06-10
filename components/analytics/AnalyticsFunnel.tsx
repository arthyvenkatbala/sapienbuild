"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { analyticsFunnelData } from "@/lib/mock-data";

const VISUAL_WIDTHS = [100, 78, 58, 42, 28];

export default function AnalyticsFunnel() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col"
    >
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white">Conversion Funnel</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Full journey from impressions to bookings</p>
      </div>

      <div className="flex flex-col items-center gap-0 flex-1">
        {analyticsFunnelData.map((stage, i) => {
          const isExpanded = expandedIdx === i;
          const hasInsight = !!stage.insight;
          return (
            <div key={stage.stage} className="w-full flex flex-col items-center">
              {/* Drop-off connector */}
              {stage.dropOff !== null && (
                <div className="flex items-center justify-center gap-2 py-1.5 w-full">
                  <div className="flex-1 h-px bg-white/[0.05]" />
                  <span className="text-[10px] text-red-400/70 font-medium whitespace-nowrap">
                    ↓ {stage.dropOff}% drop-off
                  </span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>
              )}

              {/* Funnel bar */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: "easeOut" }}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className={`relative cursor-pointer rounded-xl flex items-center justify-between px-4 py-3 transition-all ${
                  hasInsight ? "hover:brightness-110" : ""
                }`}
                style={{
                  width: `${VISUAL_WIDTHS[i]}%`,
                  minWidth: 160,
                  background: `linear-gradient(90deg, ${stage.color}28, ${stage.color}18)`,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${stage.color}40`,
                }}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{stage.stage}</p>
                  <p className="text-lg font-bold text-white mt-0.5">{stage.displayValue}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: stage.color, background: `${stage.color}25` }}
                  >
                    {stage.pct}%
                  </span>
                  {hasInsight && (
                    <span style={{ color: stage.color }}>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* AI insight expand */}
              {hasInsight && isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 mb-1 rounded-xl border border-white/[0.07] bg-[#0d0d10] px-3 py-2.5 flex items-start gap-2.5"
                  style={{ width: `${VISUAL_WIDTHS[i]}%`, minWidth: 160 }}
                >
                  <Lightbulb size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-300 leading-relaxed">{stage.insight}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
        {[
          { label: "Imp → Click", value: "3.82%", color: "#a855f7" },
          { label: "Click → Lead", value: "5.0%",  color: "#38bdf8" },
          { label: "Lead → Book",  value: "7.0%",  color: "#4ade80" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0d0d10] border border-white/[0.05] rounded-xl px-3 py-2.5 text-center"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
