"use client";

import { motion } from "framer-motion";
import { funnelData } from "@/lib/mock-data";

const COLORS = ["#a855f7", "#818cf8", "#38bdf8", "#34d399", "#4ade80"];

export default function CampaignFunnel() {
  const max = funnelData[0].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white">Campaign Funnel</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Impressions → Bookings conversion flow</p>
      </div>

      <div className="flex flex-col gap-2">
        {funnelData.map((stage, i) => {
          const widthPct = Math.max((stage.value / max) * 100, 8);
          const dropOff =
            i > 0
              ? (((funnelData[i - 1].value - stage.value) / funnelData[i - 1].value) * 100).toFixed(1)
              : null;

          return (
            <div key={stage.stage} className="relative">
              {/* drop-off label */}
              {dropOff && (
                <div className="text-[10px] text-zinc-600 mb-1 pl-1">
                  ↓ {dropOff}% drop-off
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-28 text-right text-xs text-zinc-400 shrink-0">
                  {stage.stage}
                </div>

                <div className="flex-1 h-9 bg-[#0d0d10] rounded-xl overflow-hidden border border-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-xl flex items-center justify-end pr-3"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS[i]}30, ${COLORS[i]}90)`,
                      borderRight: `2px solid ${COLORS[i]}`,
                    }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {stage.value >= 1000
                        ? `${(stage.value / 1000).toFixed(0)}k`
                        : stage.value}
                    </span>
                  </motion.div>
                </div>

                <div className="w-14 shrink-0">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: COLORS[i], background: `${COLORS[i]}20` }}
                  >
                    {stage.pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
