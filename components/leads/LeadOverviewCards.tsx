"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Flame, BadgeCheck, TrendingUp, Clock, TrendingDown } from "lucide-react";
import { Lead } from "@/lib/leads-data";

interface Props { leads: Lead[] }

export default function LeadOverviewCards({ leads }: Props) {
  const stats = useMemo(() => {
    const total      = leads.length;
    const hot        = leads.filter((l) => l.aiLabel === "Hot").length;
    const qualified  = leads.filter((l) =>
      ["Interested", "Negotiation", "Booked"].includes(l.stage)
    ).length;
    const booked     = leads.filter((l) => l.stage === "Booked").length;
    const convRate   = total > 0 ? +((booked / total) * 100).toFixed(1) : 0;
    return { total, hot, qualified, booked, convRate };
  }, [leads]);

  const cards = [
    {
      label: "Total Leads",
      value: stats.total,
      suffix: "",
      change: +18.3,
      icon: Users,
      color: "#3b82f6",
      glow: "rgba(59,130,246,0.35)",
      delay: 0,
    },
    {
      label: "Hot Leads",
      value: stats.hot,
      suffix: "",
      change: +22.1,
      icon: Flame,
      color: "#ef4444",
      glow: "rgba(239,68,68,0.35)",
      delay: 0.06,
    },
    {
      label: "Qualified",
      value: stats.qualified,
      suffix: "",
      change: +14.8,
      icon: BadgeCheck,
      color: "#a855f7",
      glow: "rgba(168,85,247,0.35)",
      delay: 0.12,
    },
    {
      label: "Conversion Rate",
      value: stats.convRate,
      suffix: "%",
      change: +2.4,
      icon: TrendingUp,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.35)",
      delay: 0.18,
    },
    {
      label: "Avg Response",
      value: 1.8,
      suffix: "h",
      change: -12.0,
      icon: Clock,
      color: "#f97316",
      glow: "rgba(249,115,22,0.35)",
      delay: 0.24,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon    = card.icon;
        const isPos   = card.change >= 0;
        const isTime  = card.label === "Avg Response";
        const better  = isTime ? !isPos : isPos;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: card.delay }}
            className="relative bg-[#111114] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:border-white/[0.13] transition-colors group"
          >
            {/* Top glow line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${card.color}70, transparent)` }}
            />

            {/* Icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
              style={{
                background:  `${card.color}18`,
                border:      `1px solid ${card.color}30`,
                boxShadow:   `0 0 12px ${card.glow}`,
              }}
            >
              <Icon size={15} style={{ color: card.color }} />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              {card.label}
            </p>

            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tight text-white">
                {card.value}{card.suffix}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  better
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPos ? "+" : ""}{card.change}%
              </span>
            </div>

            <p className="text-[10px] text-zinc-600 mt-1.5">vs last month</p>

            {/* Subtle corner accent */}
            <div
              className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl opacity-[0.04] pointer-events-none"
              style={{ background: card.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
