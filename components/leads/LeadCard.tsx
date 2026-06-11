"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Clock, ChevronRight, Flame } from "lucide-react";
import {
  Lead,
  AI_META,
  EXEC_META,
  SOURCE_META,
  PRIORITY_META,
} from "@/lib/leads-data";

interface Props {
  lead:     Lead;
  onSelect: () => void;
}

function Initials({ name, aiLabel }: { name: string; aiLabel: Lead["aiLabel"] }) {
  const parts  = name.split(" ");
  const init   = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  const colors = {
    Hot:  { bg: "rgba(239,68,68,0.18)",  border: "rgba(239,68,68,0.35)",  text: "#ef4444" },
    Warm: { bg: "rgba(249,115,22,0.18)", border: "rgba(249,115,22,0.35)", text: "#f97316" },
    Cold: { bg: "rgba(113,113,122,0.15)", border: "rgba(113,113,122,0.25)", text: "#a1a1aa" },
  };
  const c = colors[aiLabel];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {init.toUpperCase()}
    </div>
  );
}

export default function LeadCard({ lead, onSelect }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const ai   = AI_META[lead.aiLabel];
  const exec = EXEC_META[lead.executiveStatus];
  const pri  = PRIORITY_META[lead.priority];
  const src  = SOURCE_META[lead.source];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className="bg-[#0d0d10] border border-white/[0.07] rounded-xl p-3.5 cursor-pointer hover:border-white/[0.16] hover:bg-[#111116] transition-all group select-none"
    >
      {/* Row 1: priority dot + name + AI badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Priority dot */}
          <span className={`w-2 h-2 rounded-full shrink-0 ${pri.dot}`} title={`${lead.priority} priority`} />
          <Initials name={lead.name} aiLabel={lead.aiLabel} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{lead.name}</p>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{lead.eventType}</p>
          </div>
        </div>

        {/* AI score badge with tooltip */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
        >
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-default ${ai.badge}`}
            style={{ boxShadow: ai.glow }}
          >
            {lead.aiLabel === "Hot" && <Flame size={9} />}
            {lead.aiLabel} {lead.aiScore}
          </span>

          {tooltipOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-[#1a1a1f] border border-white/[0.12] rounded-xl p-3 shadow-2xl pointer-events-none">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                AI Scoring Reason
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">{lead.aiReason}</p>
              <div className="mt-2 pt-2 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">Confidence</span>
                <span className="text-[10px] font-bold" style={{ color: ai.hex }}>{lead.aiScore}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Source + Budget */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${src}`}>
          {lead.source}
        </span>
        <span className="text-xs font-semibold text-white">
          ₹{(lead.budget / 1000).toFixed(0)}k
        </span>
      </div>

      {/* Row 3: Contact icons (visible on hover) */}
      <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={`tel:${lead.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-blue-400 transition-colors"
        >
          <Phone size={10} /> {lead.phone}
        </a>
      </div>

      {/* Row 4: Last activity */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock size={10} className="text-zinc-600 shrink-0" />
        <p className="text-[10px] text-zinc-500 truncate">{lead.lastActivity}</p>
      </div>

      {/* Row 5: Exec status + exec name + open arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${exec.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${exec.dot}`} />
            {lead.executiveStatus}
          </span>
          {lead.executiveName !== "Unassigned" && (
            <span className="text-[10px] text-zinc-600">{lead.executiveName}</span>
          )}
        </div>
        <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
      </div>
    </motion.div>
  );
}
