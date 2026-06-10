"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { campaignHeatmapData, heatmapTimeSlots } from "@/lib/mock-data";

function getHeatColor(value: number): string {
  const norm = value / 100;
  if (norm < 0.3) {
    return `rgba(88, 28, 135, ${0.1 + norm * 0.8})`;
  } else if (norm < 0.6) {
    const t = (norm - 0.3) / 0.3;
    return `rgba(139, 92, 246, ${0.25 + t * 0.45})`;
  } else if (norm < 0.8) {
    const t = (norm - 0.6) / 0.2;
    return `rgba(168, 85, 247, ${0.65 + t * 0.2})`;
  } else {
    const t = (norm - 0.8) / 0.2;
    const r = Math.round(168 + (245 - 168) * t);
    const g = Math.round(85 + (158 - 85) * t);
    const b = Math.round(247 + (11 - 247) * t);
    return `rgba(${r}, ${g}, ${b}, ${0.85 + t * 0.15})`;
  }
}

function getLabel(value: number): string {
  if (value >= 80) return "Peak";
  if (value >= 60) return "High";
  if (value >= 40) return "Mid";
  if (value >= 20) return "Low";
  return "Quiet";
}

export default function CampaignHeatmap() {
  const [tooltip, setTooltip] = useState<{ day: string; slot: string; value: number } | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Campaign Heatmap</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Peak engagement by day &amp; time slot</p>
        </div>
        <div className="h-10 min-w-[160px]">
          {tooltip ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1f] border border-white/[0.1] rounded-xl px-3 py-2 text-right"
            >
              <p className="text-xs font-semibold text-white">{tooltip.day} · {tooltip.slot}</p>
              <p className="text-[10px] mt-0.5">
                <span className="text-zinc-500">Engagement: </span>
                <span className="text-purple-300 font-semibold">{tooltip.value}</span>
                <span className="text-zinc-600 ml-1">({getLabel(tooltip.value)})</span>
              </p>
            </motion.div>
          ) : (
            <p className="text-[10px] text-zinc-600 text-right pt-3">Hover a cell to inspect</p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 500 }}>
          {/* Time slot headers */}
          <div className="flex mb-2 ml-10">
            {heatmapTimeSlots.map(slot => (
              <div key={slot} className="flex-1 text-center text-[9px] text-zinc-600 font-medium leading-tight px-0.5">
                {slot}
              </div>
            ))}
          </div>

          {/* Rows */}
          {campaignHeatmapData.map((row, ri) => (
            <div key={row.day} className="flex items-center mb-1.5">
              <span className="w-10 shrink-0 text-xs text-zinc-500 font-medium">{row.day}</span>
              {row.slots.map((val, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: ri * 0.04 + ci * 0.015 }}
                  className="flex-1 mx-0.5 h-8 rounded-lg cursor-pointer transition-all hover:scale-110 hover:z-10 hover:shadow-lg relative"
                  style={{ background: getHeatColor(val) }}
                  onMouseEnter={() => setTooltip({ day: row.day, slot: heatmapTimeSlots[ci], value: val })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2.5 mt-4">
        <span className="text-[10px] text-zinc-600 font-medium shrink-0">Quiet</span>
        <div className="flex gap-px flex-1">
          {[5, 15, 28, 40, 53, 66, 78, 90, 100].map(v => (
            <div key={v} className="flex-1 h-1.5 rounded-sm" style={{ background: getHeatColor(v) }} />
          ))}
        </div>
        <span className="text-[10px] text-zinc-600 font-medium shrink-0">Peak</span>
      </div>

      {/* Peak insight */}
      <div className="mt-3 flex items-center gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <p className="text-[11px] text-zinc-400">
          Peak engagement: <span className="text-amber-400 font-medium">Sat–Sun · 7–9 PM</span> — schedule new launches for Thursday night
        </p>
      </div>
    </motion.div>
  );
}
