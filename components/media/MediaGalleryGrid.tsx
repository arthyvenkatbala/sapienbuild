"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Image, LayoutGrid, Camera,
  Eye, MousePointer, Users, Clock, Heart, Share2, TrendingUp
} from "lucide-react";
import { mediaAssets } from "@/lib/mock-data";

type FilterType = "All" | "Reel" | "Wedding Video" | "Carousel" | "Photography";

const FILTERS: FilterType[] = ["All", "Reel", "Wedding Video", "Carousel", "Photography"];

const typeIcon: Record<string, React.ElementType> = {
  "Reel":          Play,
  "Wedding Video": Play,
  "Carousel":      LayoutGrid,
  "Photography":   Camera,
};

const typeColor: Record<string, string> = {
  "Reel":          "#a855f7",
  "Wedding Video": "#38bdf8",
  "Carousel":      "#22c55e",
  "Photography":   "#f59e0b",
};

function LabelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
      style={{ color, background: `${color}20`, borderColor: `${color}40` }}
    >
      {label}
    </span>
  );
}

function MetricRow({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon size={10} />
        <span className="text-[10px]">{label}</span>
      </div>
      <span className="text-[11px] font-semibold text-white">{value}</span>
    </div>
  );
}

function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 18, stroke = 3;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={44} height={44} className="-rotate-90" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}>
      <circle cx={22} cy={22} r={r} fill="none" stroke="#ffffff08" strokeWidth={stroke} />
      <motion.circle
        cx={22} cy={22} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function MediaGalleryGrid() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = filter === "All"
    ? mediaAssets
    : mediaAssets.filter((a) => a.type === filter);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileTap={{ scale: 0.95 }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === f
                ? "bg-white/[0.12] text-white border border-white/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/[0.06]"
            }`}
          >
            {f}
          </motion.button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-600">
          <Eye size={11} />
          {filtered.length} assets
        </div>
      </div>

      {/* Gallery grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((asset) => {
            const isHovered = hoveredId === asset.id;
            const TypeIcon = typeIcon[asset.type] ?? Image;
            const accentColor = asset.accentColor;

            return (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3 }}
                className="relative bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden group cursor-pointer hover:border-white/[0.14] transition-colors"
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail area */}
                <div className={`relative h-44 bg-gradient-to-br ${asset.gradient} overflow-hidden`}>
                  {/* Animated noise texture overlay */}
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    }}
                  />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <TypeIcon size={9} style={{ color: typeColor[asset.type] }} />
                    <span className="text-[10px] font-medium text-white">{asset.type}</span>
                  </div>

                  {/* Platform badge */}
                  <div className="absolute top-3 right-3 text-[9px] font-semibold text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    {asset.platform}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Clock size={9} className="text-zinc-300" />
                    <span className="text-[10px] text-zinc-200">{asset.duration}</span>
                  </div>

                  {/* Hover overlay with engagement bar */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center"
                      >
                        <div className="text-center">
                          <p className="text-xs text-zinc-300 mb-1">Engagement Score</p>
                          <div className="flex items-center justify-center gap-2">
                            <ScoreArc score={asset.engagementScore} color={accentColor} />
                            <span className="text-3xl font-bold" style={{ color: accentColor }}>
                              {asset.engagementScore}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* Title + label */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{asset.name}</h4>
                      {asset.label && (
                        <div className="mt-1.5">
                          <LabelBadge label={asset.label} color={asset.labelColor!} />
                        </div>
                      )}
                    </div>
                    {/* Engagement score ring (always visible) */}
                    <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
                      <ScoreArc score={asset.engagementScore} color={accentColor} />
                      <div className="absolute inset-0 flex items-center justify-center rotate-90">
                        <span className="text-[11px] font-bold" style={{ color: accentColor }}>
                          {asset.engagementScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
                    <MetricRow icon={MousePointer} label="Clicks"    value={asset.clicks.toLocaleString()} />
                    <MetricRow icon={Users}        label="Leads"     value={asset.leads} />
                    <MetricRow icon={TrendingUp}   label="CTR"       value={`${asset.ctr}%`} />
                    <MetricRow icon={Heart}        label="Saves"     value={asset.saves.toLocaleString()} />
                    <MetricRow icon={Share2}       label="Shares"    value={asset.shares.toLocaleString()} />
                    {asset.watchTime !== "—" && (
                      <MetricRow icon={Clock}      label="Watch Time" value={asset.watchTime} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
