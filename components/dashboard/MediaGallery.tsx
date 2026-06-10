"use client";

import { motion } from "framer-motion";
import { Eye, Users, Bookmark, Clock } from "lucide-react";
import { mediaData } from "@/lib/mock-data";

const labelColors: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  blue:   "bg-blue-500/20 text-blue-300 border-blue-500/40",
  green:  "bg-green-500/20 text-green-300 border-green-500/40",
};

export default function MediaGallery() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-base font-semibold text-white">Best Performing Media</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Creative assets ranked by conversion impact</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mediaData.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="group relative bg-[#0d0d10] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.15] transition-all hover:shadow-xl hover:shadow-black/40 cursor-pointer"
          >
            {/* Thumbnail gradient */}
            <div className={`h-36 bg-gradient-to-br ${item.gradient} opacity-70 relative`}>
              {/* type badge */}
              <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                {item.type}
              </span>

              {/* engagement score ring */}
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-white/10">
                <span className="text-xs font-bold text-white">{item.engagementScore}</span>
              </div>

              {/* label */}
              {item.label && (
                <span
                  className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    labelColors[item.labelColor ?? "purple"]
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>

            <div className="p-3">
              <p className="font-medium text-sm text-white truncate mb-3">{item.name}</p>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Eye size={11} />
                  <span className="text-xs">{item.clicks.toLocaleString()} clicks</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Users size={11} />
                  <span className="text-xs">{item.leads} leads</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Bookmark size={11} />
                  <span className="text-xs">{item.saves.toLocaleString()} saves</span>
                </div>
                {item.watchTime !== "—" && (
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock size={11} />
                    <span className="text-xs">{item.watchTime}</span>
                  </div>
                )}
              </div>

              {/* engagement bar */}
              <div className="mt-3">
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.engagementScore}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
