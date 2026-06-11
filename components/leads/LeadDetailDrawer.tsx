"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Phone, Mail, Tag, Calendar, Clock, PhoneCall, AtSign,
  FileText, GitBranch, Sparkles, ChevronRight, CheckCircle2,
  MessageSquare, AlertCircle, TrendingUp, Flame,
} from "lucide-react";
import {
  Lead, KanbanStage, ExecutiveStatus,
  KANBAN_STAGES, STAGE_META, AI_META, EXEC_META, SOURCE_META,
} from "@/lib/leads-data";

interface Props {
  lead:                   Lead | null;
  isOpen:                 boolean;
  onClose:                () => void;
  onUpdateStage:          (leadId: string, stage: KanbanStage) => void;
  onUpdateExecStatus:     (leadId: string, status: ExecutiveStatus) => void;
}

const timelineIcons: Record<string, React.ElementType> = {
  call:    PhoneCall,
  email:   AtSign,
  note:    FileText,
  stage:   GitBranch,
  meeting: Calendar,
};

const timelineColors: Record<string, string> = {
  call:    "#3b82f6",
  email:   "#a855f7",
  note:    "#eab308",
  stage:   "#22c55e",
  meeting: "#f97316",
};

const EXEC_STATUSES: ExecutiveStatus[] = ["Not Started", "In Progress", "Rejected", "Converted"];

export default function LeadDetailDrawer({ lead, isOpen, onClose, onUpdateStage, onUpdateExecStatus }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "ai">("overview");

  if (!lead) return null;

  const ai   = AI_META[lead.aiLabel];
  const src  = SOURCE_META[lead.source];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-[#0e0e11] border-l border-white/[0.08] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background:  `${ai.hex}20`,
                    border:      `1.5px solid ${ai.hex}40`,
                    color:       ai.hex,
                    boxShadow:   ai.glow,
                  }}
                >
                  {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{lead.name}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{lead.eventType}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${ai.badge}`}
                  style={{ boxShadow: ai.glow }}
                >
                  {lead.aiLabel === "Hot" && <Flame size={9} />}
                  {lead.aiLabel} {lead.aiScore}%
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-0 border-b border-white/[0.07] shrink-0">
              {[
                { label: "Budget",     value: `₹${(lead.budget / 1000).toFixed(0)}k`          },
                { label: "Deal Value", value: lead.dealValue > 0 ? `₹${(lead.dealValue / 1000).toFixed(0)}k` : "—" },
                { label: "Created",    value: lead.createdAt                                    },
              ].map((s, i) => (
                <div key={s.label} className={`px-4 py-3 ${i < 2 ? "border-r border-white/[0.06]" : ""}`}>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-600">{s.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-white/[0.07] shrink-0">
              {(["overview", "timeline", "ai"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${
                    activeTab === tab
                      ? "text-white border-purple-500"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  }`}
                >
                  {tab === "ai" ? "AI Insights" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Overview Tab ─────────────────────────────────────── */}
              {activeTab === "overview" && (
                <div className="p-5 space-y-5">

                  {/* Contact */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Contact</p>
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#111114] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                        <Phone size={12} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{lead.phone}</span>
                    </a>
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#111114] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                        <Mail size={12} className="text-purple-400" />
                      </div>
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{lead.email}</span>
                    </a>
                  </div>

                  {/* Source + Tags */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Source & Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${src}`}>
                        {lead.source}
                      </span>
                      {lead.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-1 rounded-full">
                          <Tag size={8} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stage progression */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Sales Stage</p>
                    <div className="flex flex-wrap gap-1.5">
                      {KANBAN_STAGES.map((stage) => {
                        const meta    = STAGE_META[stage];
                        const isActive = lead.stage === stage;
                        return (
                          <button
                            key={stage}
                            onClick={() => onUpdateStage(lead.id, stage)}
                            className="text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all"
                            style={{
                              background:  isActive ? `${meta.hex}20` : "transparent",
                              borderColor: isActive ? `${meta.hex}50` : "rgba(255,255,255,0.07)",
                              color:       isActive ? meta.hex : "#71717a",
                            }}
                          >
                            {stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Executive status */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Executive Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {EXEC_STATUSES.map((status) => {
                        const meta    = EXEC_META[status];
                        const isActive = lead.executiveStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => onUpdateExecStatus(lead.id, status)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                              isActive
                                ? `${meta.badge} font-semibold`
                                : "border-white/[0.07] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                            <span className="text-xs">{status}</span>
                            {isActive && <CheckCircle2 size={11} className="ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Notes</p>
                      <div className="bg-[#111114] border border-white/[0.06] rounded-xl p-3">
                        <p className="text-sm text-zinc-300 leading-relaxed">{lead.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Last activity */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock size={11} />
                    <span>Last activity: {lead.lastActivity}</span>
                  </div>
                </div>
              )}

              {/* ── Timeline Tab ─────────────────────────────────────── */}
              {activeTab === "timeline" && (
                <div className="p-5">
                  <div className="relative flex flex-col gap-0">
                    {lead.timeline.map((event, i) => {
                      const Icon  = timelineIcons[event.type] ?? FileText;
                      const color = timelineColors[event.type] ?? "#71717a";
                      const isLast = i === lead.timeline.length - 1;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-3"
                        >
                          {/* Icon + line */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                              style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                            >
                              <Icon size={12} style={{ color }} />
                            </div>
                            {!isLast && (
                              <div className="w-px flex-1 bg-white/[0.06] my-1" style={{ minHeight: 20 }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-white">{event.title}</p>
                              <span className="text-[9px] text-zinc-600 shrink-0">{event.timestamp}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{event.description}</p>
                            <p className="text-[9px] text-zinc-700 mt-1">by {event.actor}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── AI Insights Tab ───────────────────────────────────── */}
              {activeTab === "ai" && (
                <div className="p-5 space-y-4">

                  {/* AI Score card */}
                  <div
                    className="relative rounded-2xl p-4 overflow-hidden border"
                    style={{
                      background:   `linear-gradient(135deg, ${ai.hex}12, ${ai.hex}06)`,
                      borderColor:  `${ai.hex}35`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ai.hex}60, transparent)` }} />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ai.hex}20`, border: `1px solid ${ai.hex}35` }}>
                        {lead.aiLabel === "Hot" ? <Flame size={14} style={{ color: ai.hex }} /> : <TrendingUp size={14} style={{ color: ai.hex }} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{lead.aiLabel} Lead</p>
                        <p className="text-[10px]" style={{ color: ai.hex }}>{lead.aiScore}% conversion probability</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lead.aiScore}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${ai.hex}80, ${ai.hex})` }}
                      />
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      <span className="text-zinc-600 font-medium">Reason: </span>{lead.aiReason}
                    </p>
                  </div>

                  {/* Follow-up suggestion */}
                  <div className="bg-[#111114] border border-yellow-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center shrink-0">
                        <Sparkles size={12} className="text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Smart Follow-Up</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">AI-generated recommendation</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{lead.followUpSuggestion}</p>
                  </div>

                  {/* Scoring factors */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Scoring Factors</p>
                    {[
                      { label: "Budget Signal",    score: Math.min(100, Math.round(lead.budget / 3500)),   color: "#22c55e" },
                      { label: "Engagement",       score: lead.aiScore - 5,                               color: "#3b82f6" },
                      { label: "Response Speed",   score: lead.aiLabel === "Hot" ? 88 : lead.aiLabel === "Warm" ? 62 : 30, color: "#a855f7" },
                      { label: "Deal Probability", score: lead.aiScore,                                    color: "#f97316" },
                    ].map((f) => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-500">{f.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: f.color }}>{f.score}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${f.score}%` }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: f.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Quick Actions</p>
                    {[
                      { icon: MessageSquare, label: "Generate Reply",      color: "#a855f7" },
                      { icon: Clock,         label: "Schedule Reminder",   color: "#3b82f6" },
                      { icon: TrendingUp,    label: "Suggest Upsell",      color: "#22c55e" },
                      { icon: AlertCircle,   label: "Mark Important",      color: "#f97316" },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={13} style={{ color: action.color }} />
                            <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                              {action.label}
                            </span>
                          </div>
                          <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky action bar */}
            <div className="shrink-0 border-t border-white/[0.07] p-4 flex items-center gap-2 bg-[#0e0e11]">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all flex-1 justify-center"
              >
                <Phone size={12} /> Call
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 hover:text-white text-xs font-medium transition-all flex-1 justify-center border border-white/[0.07]"
              >
                <Mail size={12} /> Email
              </a>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-medium transition-all flex-1 justify-center">
                <Sparkles size={12} /> AI Follow-Up
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
