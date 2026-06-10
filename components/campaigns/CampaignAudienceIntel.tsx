"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { audienceIntelData } from "@/lib/mock-data";

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <span className="text-zinc-400">{payload[0].name}: </span>
      <span className="text-white font-semibold">{payload[0].value}%</span>
    </div>
  );
};

export default function CampaignAudienceIntel() {
  const d = audienceIntelData;
  const maxLeads = Math.max(...d.locations.map(l => l.leads));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 space-y-6"
    >
      <div>
        <h2 className="text-base font-semibold text-white">Audience Intelligence</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Demographics, locations, devices &amp; conversion quality</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Demographics donut */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Demographics</p>
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={d.demographics} dataKey="value" nameKey="label"
                    cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} stroke="none">
                    {d.demographics.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              {d.demographics.map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="text-[11px] text-zinc-400 truncate">{e.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white shrink-0">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device performance */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Device Performance</p>
          <div className="space-y-3">
            {d.devices.map((dev, i) => (
              <div key={dev.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-300">{dev.name}</span>
                    <span className="text-[10px] text-zinc-600">₹{dev.cpl} CPL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">{dev.roas}× ROAS</span>
                    <span className="text-xs font-semibold text-white">{dev.value}%</span>
                  </div>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dev.value}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: dev.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top locations */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Top Locations</p>
          <div className="space-y-2.5">
            {d.locations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 w-4 shrink-0 font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-300">{loc.city}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">₹{loc.cpl}</span>
                      <span className={`text-[10px] font-medium ${loc.quality >= 80 ? "text-green-400" : loc.quality >= 70 ? "text-zinc-400" : "text-red-400"}`}>
                        Q{loc.quality}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(loc.leads / maxLeads) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.12 + i * 0.07, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-white shrink-0 w-6 text-right">{loc.leads}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion quality */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Conversion Quality</p>
          <div className="space-y-2">
            {d.conversionQuality.map((seg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.07 }}
                className="bg-[#0d0d10] border border-white/[0.05] rounded-xl px-3 py-2.5 hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-[11px] font-medium text-white leading-tight truncate">{seg.segment}</p>
                  <span className={`text-[11px] font-bold shrink-0 ${seg.roas >= 5 ? "text-amber-400" : "text-green-400"}`}>{seg.roas}×</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 flex-wrap">
                  <span>{seg.leads} leads</span>
                  <span className="text-zinc-700">·</span>
                  <span>{seg.qualified} qual.</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-green-400 font-medium">{seg.booked} booked</span>
                  <span className="text-zinc-700">·</span>
                  <span>₹{seg.cpl} CPL</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
