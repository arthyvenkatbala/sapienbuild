"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Filter } from "lucide-react";
import { topAdsData } from "@/lib/mock-data";

const PLATFORMS = ["All", "Instagram", "Facebook", "Google", "YouTube"];

const PlatformBadge = ({ platform }: { platform: string }) => {
  const colors: Record<string, string> = {
    Instagram: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    Facebook:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Google:    "bg-green-500/15 text-green-400 border-green-500/30",
    YouTube:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[platform] ?? "bg-zinc-800 text-zinc-400"}`}>
      {platform}
    </span>
  );
};

export default function TopAdsTable() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? topAdsData : topAdsData.filter((a) => a.platform === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Best Performing Ads</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Ranked by ROAS</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-500" />
          <div className="flex gap-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filter === p
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Ad", "Platform", "Spend", "Clicks", "CTR", "Leads", "CPL", "ROAS"].map(
                (h) => (
                  <th
                    key={h}
                    className="pb-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider pr-4 last:pr-0"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((ad, i) => (
              <motion.tr
                key={ad.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`group hover:bg-white/[0.02] transition-colors ${
                  ad.badge === "top"
                    ? "relative"
                    : ""
                }`}
              >
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    {/* Color swatch instead of image */}
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${
                          ["#a855f7","#3b82f6","#22c55e","#f97316","#ec4899"][i % 5]
                        }40, ${
                          ["#ec4899","#a855f7","#3b82f6","#22c55e","#f97316"][i % 5]
                        }40)`,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: `${["#a855f7","#3b82f6","#22c55e","#f97316","#ec4899"][i % 5]}30`,
                      }}
                    />
                    <div>
                      <p className="font-medium text-white text-sm">{ad.name}</p>
                      {ad.badge === "top" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-medium">
                          <Star size={9} fill="currentColor" /> Top Performer
                        </span>
                      )}
                      {ad.badge === "ai" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-medium">
                          <Sparkles size={9} /> AI Pick
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <PlatformBadge platform={ad.platform} />
                </td>
                <td className="py-3.5 pr-4 text-zinc-300">₹{ad.spend.toLocaleString()}</td>
                <td className="py-3.5 pr-4 text-zinc-300">{ad.clicks.toLocaleString()}</td>
                <td className="py-3.5 pr-4 text-zinc-300">{ad.ctr}%</td>
                <td className="py-3.5 pr-4 text-zinc-300">{ad.leads}</td>
                <td className="py-3.5 pr-4 text-zinc-300">₹{ad.cpl}</td>
                <td className="py-3.5">
                  <span
                    className={`font-semibold ${
                      ad.roas >= 4 ? "text-green-400" : ad.roas >= 3 ? "text-yellow-400" : "text-red-400"
                    }`}
                  >
                    {ad.roas}×
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
