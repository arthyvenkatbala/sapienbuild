"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { Quote, computeQuoteKPIs } from "@/lib/quotes-data";

interface Props { quotes: Quote[] }

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
}

export default function QuoteOverviewCards({ quotes }: Props) {
  const kpi = useMemo(() => computeQuoteKPIs(quotes), [quotes]);

  const cards = [
    {
      label: "Total Pipeline",
      value: fmt(kpi.pipeline),
      sub:   `${kpi.total} quotes tracked`,
      icon:  FileText,
      color: "#a855f7",
      glow:  "rgba(168,85,247,0.35)",
      bg:    "rgba(168,85,247,0.08)",
      border:"rgba(168,85,247,0.20)",
      delay: 0,
    },
    {
      label: "Approved Value",
      value: fmt(kpi.approvedVal),
      sub:   `${kpi.approved} quotes approved`,
      icon:  CheckCircle,
      color: "#22c55e",
      glow:  "rgba(34,197,94,0.35)",
      bg:    "rgba(34,197,94,0.08)",
      border:"rgba(34,197,94,0.20)",
      delay: 0.06,
    },
    {
      label: "Pending Review",
      value: fmt(kpi.pendingVal),
      sub:   `${kpi.pending} awaiting response`,
      icon:  TrendingUp,
      color: "#3b82f6",
      glow:  "rgba(59,130,246,0.35)",
      bg:    "rgba(59,130,246,0.08)",
      border:"rgba(59,130,246,0.20)",
      delay: 0.12,
    },
    {
      label: "Rejected",
      value: String(kpi.rejected),
      sub:   "quotes declined",
      icon:  XCircle,
      color: "#ef4444",
      glow:  "rgba(239,68,68,0.30)",
      bg:    "rgba(239,68,68,0.07)",
      border:"rgba(239,68,68,0.18)",
      delay: 0.18,
    },
    {
      label: "Conversion Rate",
      value: `${kpi.convRate}%`,
      sub:   "Approved ÷ Total",
      icon:  DollarSign,
      color: "#f59e0b",
      glow:  "rgba(245,158,11,0.35)",
      bg:    "rgba(245,158,11,0.08)",
      border:"rgba(245,158,11,0.20)",
      delay: 0.24,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: c.delay }}
            className="relative bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.13] transition-all group overflow-hidden"
          >
            {/* Glow blob */}
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: c.glow }}
            />

            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 16px ${c.glow}` }}
            >
              <Icon size={16} style={{ color: c.color }} />
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-white mb-0.5 tracking-tight">{c.value}</p>
            <p className="text-xs font-medium" style={{ color: c.color }}>{c.label}</p>
            <p className="text-[10px] text-zinc-600 mt-1">{c.sub}</p>

            {/* Conversion bar for last card */}
            {c.label === "Conversion Rate" && (
              <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kpi.convRate}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}99)` }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
