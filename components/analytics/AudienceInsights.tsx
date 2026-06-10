"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";
import { ageData, genderData, deviceData, locationData, audienceSegments } from "@/lib/mock-data";

const AgeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <span className="text-white font-semibold">{payload[0].value}%</span>
      <span className="text-zinc-500 ml-1">of audience</span>
    </div>
  );
};

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <span className="text-zinc-400">{payload[0].name}: </span>
      <span className="text-white font-semibold">{payload[0].value}%</span>
    </div>
  );
};

export default function AudienceInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-6"
    >
      <div>
        <h2 className="text-base font-semibold text-white">Audience Insights</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Demographics, devices, and top segments</p>
      </div>

      {/* Age + Gender row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Age bar chart */}
        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Age Groups</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 0, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
                <XAxis
                  dataKey="group"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<AgeTooltip />} cursor={{ fill: "#ffffff05" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ageData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 1 ? "#a855f7" : i === 2 ? "#818cf8" : "#3f3f46"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender donut */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Gender</p>
          <div className="relative h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white">64%</span>
              <span className="text-[10px] text-zinc-500">Female</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {genderData.map((g) => (
              <div key={g.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                  <span className="text-xs text-zinc-400">{g.name}</span>
                </div>
                <span className="text-xs font-medium text-white">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices + Locations row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Device</p>
          <div className="space-y-2.5">
            {deviceData.map((d, i) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-300">{d.name}</span>
                  <span className="text-xs font-semibold text-white">{d.value}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top locations */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Top Locations</p>
          <div className="space-y-2">
            {locationData.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-300">{loc.city}</span>
                    <span className="text-xs font-medium text-white">{loc.value}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loc.value}%` }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top audience segments */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Best-Performing Segments</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {audienceSegments.map((seg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center justify-between bg-[#0d0d10] border border-white/[0.05] rounded-xl px-3 py-2.5 hover:border-white/[0.1] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{seg.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{seg.leads} leads</p>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-3">
                <span className="text-xs font-semibold text-green-400">{seg.roas}× ROAS</span>
                <span className="text-[10px] text-zinc-500">₹{seg.cpl} CPL</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
