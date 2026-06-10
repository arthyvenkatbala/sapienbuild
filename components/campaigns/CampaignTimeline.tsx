"use client";

import { motion } from "framer-motion";
import { Rocket, TrendingUp, Zap, Settings, AlertTriangle } from "lucide-react";
import { campaignTimelineEvents } from "@/lib/mock-data";

const typeIcons: Record<string, React.ElementType> = {
  launch:       Rocket,
  budget:       TrendingUp,
  spike:        Zap,
  optimization: Settings,
  warning:      AlertTriangle,
};

const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
  launch:       { label: "Launch",     bg: "bg-purple-500/15", text: "text-purple-400"  },
  budget:       { label: "Budget",     bg: "bg-green-500/15",  text: "text-green-400"   },
  spike:        { label: "Spike",      bg: "bg-cyan-500/15",   text: "text-cyan-400"    },
  optimization: { label: "Optimized", bg: "bg-orange-500/15", text: "text-orange-400"  },
  warning:      { label: "Warning",    bg: "bg-yellow-500/15", text: "text-yellow-400"  },
};

export default function CampaignTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Campaign Timeline</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Launches, budget changes, spikes &amp; optimizations</p>
        </div>
        <span className="text-[10px] text-zinc-600 font-medium bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">May – Jun 2026</span>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto pb-2">
        <div className="relative flex items-start" style={{ minWidth: 980 }}>

          {/* Connecting line */}
          <div className="absolute top-5 left-12 right-12 h-px"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 8%, rgba(255,255,255,0.06) 92%, transparent 100%)" }}
          />

          {campaignTimelineEvents.map((event, i) => {
            const Icon = typeIcons[event.type] || Rocket;
            const tl = typeLabels[event.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.07 }}
                className="flex-1 flex flex-col items-center px-2 group cursor-default"
              >
                {/* Dot */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: `${event.color}18`,
                    borderColor: `${event.color}50`,
                    boxShadow: `0 0 0 0px ${event.color}20`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 6px ${event.color}15, 0 0 20px ${event.color}25`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <Icon size={14} style={{ color: event.color }} />
                </div>

                {/* Content */}
                <div className="mt-3 text-center max-w-[108px]">
                  <p className="text-[10px] font-semibold text-zinc-600 mb-1">{event.date}</p>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${tl.bg} ${tl.text}`}>
                    {tl.label}
                  </span>
                  <p className="text-[11px] font-semibold text-white mt-1.5 leading-tight group-hover:text-purple-200 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-snug">{event.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
