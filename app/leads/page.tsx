"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, Download, UserPlus,
  Kanban, List, X, Flame, TrendingUp,
} from "lucide-react";
import {
  Lead, KanbanStage, ExecutiveStatus, AiLabel, LeadSource,
  initialLeads,
} from "@/lib/leads-data";
import LeadOverviewCards   from "@/components/leads/LeadOverviewCards";
import LeadKanban          from "@/components/leads/LeadKanban";
import LeadDetailDrawer    from "@/components/leads/LeadDetailDrawer";
import LeadSourceAnalytics from "@/components/leads/LeadSourceAnalytics";
import AIChatAgent         from "@/components/dashboard/AIChatAgent";

// ── Filter chips helper ────────────────────────────────────────────────────────
function Chip({
  label, active, color, onClick,
}: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
        active
          ? "bg-white/[0.08] border-white/[0.20] text-white"
          : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
      }`}
      style={active && color ? { borderColor: `${color}55`, color, background: `${color}15` } : {}}
    >
      {label}
    </button>
  );
}

// ── List-view table ────────────────────────────────────────────────────────────
function LeadListView({
  leads,
  onSelectLead,
}: { leads: Lead[]; onSelectLead: (l: Lead) => void }) {
  const { AI_META, EXEC_META, SOURCE_META } = require("@/lib/leads-data");

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Lead", "Source", "Budget", "Stage", "AI Score", "Exec Status", "Last Activity"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {leads.map((lead) => {
              const ai   = AI_META[lead.aiLabel];
              const exec = EXEC_META[lead.executiveStatus];
              const src  = SOURCE_META[lead.source];
              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-white/[0.025] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{lead.eventType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${src}`}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 font-semibold">
                    ₹{(lead.budget / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{lead.stage}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex items-center gap-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full border ${ai.badge}`}
                      style={{ boxShadow: ai.glow }}
                    >
                      {lead.aiLabel === "Hot" && <Flame size={9} />}
                      {lead.aiLabel} {lead.aiScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 w-fit text-[9px] font-medium px-2 py-0.5 rounded-full border ${exec.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${exec.dot}`} />
                      {lead.executiveStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{lead.lastActivity}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Search size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No leads match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
const SOURCE_OPTIONS: (LeadSource | "All")[] = ["All", "Instagram", "Facebook", "Google", "Referral", "Website"];
const AI_OPTIONS:     (AiLabel | "All")[]    = ["All", "Hot", "Warm", "Cold"];
const STATUS_OPTIONS: (ExecutiveStatus | "All")[] = ["All", "Not Started", "In Progress", "Rejected", "Converted"];

export default function LeadsPage() {
  const [leads,           setLeads]           = useState<Lead[]>(initialLeads);
  const [selectedLead,    setSelectedLead]    = useState<Lead | null>(null);
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [view,            setView]            = useState<"kanban" | "list">("kanban");
  const [search,          setSearch]          = useState("");
  const [filterSource,    setFilterSource]    = useState<string>("All");
  const [filterAI,        setFilterAI]        = useState<string>("All");
  const [filterStatus,    setFilterStatus]    = useState<string>("All");
  const [showFilters,     setShowFilters]     = useState(false);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch  = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.eventType.toLowerCase().includes(q);
      const matchSource  = filterSource === "All" || l.source === filterSource;
      const matchAI      = filterAI     === "All" || l.aiLabel === filterAI;
      const matchStatus  = filterStatus === "All" || l.executiveStatus === filterStatus;
      return matchSearch && matchSource && matchAI && matchStatus;
    });
  }, [leads, search, filterSource, filterAI, filterStatus]);

  const hasActiveFilters = filterSource !== "All" || filterAI !== "All" || filterStatus !== "All" || search !== "";

  // Callbacks
  const moveLead = useCallback((leadId: string, stage: KanbanStage) => {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, stage } : l));
    // Sync the drawer if the moved lead is open
    setSelectedLead((prev) => prev?.id === leadId ? { ...prev, stage } : prev);
  }, []);

  const updateExecStatus = useCallback((leadId: string, status: ExecutiveStatus) => {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, executiveStatus: status } : l));
    setSelectedLead((prev) => prev?.id === leadId ? { ...prev, executiveStatus: status } : prev);
  }, []);

  const openLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setFilterSource("All");
    setFilterAI("All");
    setFilterStatus("All");
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Lead Management</h1>
          <p className="text-xs text-zinc-500">AI-powered CRM · {filteredLeads.length} leads</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-[#111114] border border-white/[0.07] rounded-xl p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg transition-all ${view === "kanban" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Kanban size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <List size={14} />
            </button>
          </div>

          <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all">
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-xl transition-all font-medium">
            <UserPlus size={12} /> Add Lead
          </button>

          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-6 max-w-[1600px] w-full mx-auto">

        {/* ── Search + Filter bar ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          {/* Row 1: search + filter toggle + clear */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads by name, email, event…"
                className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}

            {/* AI label quick filters */}
            <div className="flex items-center gap-1.5 ml-2">
              {AI_OPTIONS.filter((o) => o !== "All").map((label) => (
                <Chip
                  key={label}
                  label={label === "Hot" ? "🔥 Hot" : label === "Warm" ? "🌤 Warm" : "❄ Cold"}
                  active={filterAI === label}
                  color={label === "Hot" ? "#ef4444" : label === "Warm" ? "#f97316" : "#71717a"}
                  onClick={() => setFilterAI(filterAI === label ? "All" : label)}
                />
              ))}
            </div>
          </div>

          {/* Row 2: expandable filter chips */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">Source:</span>
              {SOURCE_OPTIONS.map((s) => (
                <Chip key={s} label={s} active={filterSource === s} onClick={() => setFilterSource(s)} />
              ))}

              <div className="w-px h-4 bg-white/[0.08] mx-1" />

              <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">Status:</span>
              {STATUS_OPTIONS.map((s) => (
                <Chip key={s} label={s} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── Overview KPI cards ─────────────────────────────────────── */}
        <LeadOverviewCards leads={leads} />

        {/* ── Kanban / List view ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
              {view === "kanban" ? "Pipeline" : "All Leads"} · {filteredLeads.length} leads
            </p>
            {view === "kanban" && (
              <p className="text-[10px] text-zinc-600">Drag cards between stages · Click to open detail</p>
            )}
          </div>

          {view === "kanban" ? (
            <LeadKanban
              leads={filteredLeads}
              onSelectLead={openLead}
              onMoveLead={moveLead}
            />
          ) : (
            <LeadListView leads={filteredLeads} onSelectLead={openLead} />
          )}
        </section>

        {/* ── Source Analytics + AI Follow-Ups ─────────────────────── */}
        <LeadSourceAnalytics />

      </main>

      {/* ── Lead Detail Drawer ─────────────────────────────────────── */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateStage={moveLead}
        onUpdateExecStatus={updateExecStatus}
      />

      <AIChatAgent />
    </div>
  );
}
