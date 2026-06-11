"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, Download, Plus, X,
  FileText,
} from "lucide-react";
import {
  Quote, QuoteStatus, initialQuotes, STATUS_META,
} from "@/lib/quotes-data";
import QuoteOverviewCards   from "@/components/quotes/QuoteOverviewCards";
import QuotesTable          from "@/components/quotes/QuotesTable";
import QuoteBuilderModal    from "@/components/quotes/QuoteBuilderModal";
import QuoteDetailDrawer    from "@/components/quotes/QuoteDetailDrawer";
import AIChatAgent          from "@/components/dashboard/AIChatAgent";

// ── Filter chip ────────────────────────────────────────────────────────────────
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

// ── Status filter options ──────────────────────────────────────────────────────
const STATUS_OPTIONS: (QuoteStatus | "All")[] = [
  "All", "Draft", "Sent", "Viewed", "Approved", "Rejected", "Expired",
];

// ── Main page ──────────────────────────────────────────────────────────────────
export default function QuotesPage() {
  const [quotes,        setQuotes]        = useState<Quote[]>(initialQuotes);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [builderOpen,   setBuilderOpen]   = useState(false);
  const [editingQuote,  setEditingQuote]  = useState<Quote | null>(null);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState<QuoteStatus | "All">("All");
  const [showFilters,   setShowFilters]   = useState(false);

  const hasActiveFilters = filterStatus !== "All" || search !== "";

  // ── Filtered quotes ──────────────────────────────────────────────────────────
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const qs = search.toLowerCase();
      const matchSearch  = !qs
        || q.clientName.toLowerCase().includes(qs)
        || q.clientEmail.toLowerCase().includes(qs)
        || q.clientLocation.toLowerCase().includes(qs)
        || q.eventTypes.some((et) => et.toLowerCase().includes(qs))
        || q.venueName.toLowerCase().includes(qs);
      const matchStatus = filterStatus === "All" || q.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [quotes, search, filterStatus]);

  // ── Callbacks ────────────────────────────────────────────────────────────────
  const openQuote = useCallback((q: Quote) => {
    setSelectedQuote(q);
    setDrawerOpen(true);
  }, []);

  const openBuilder = useCallback((q?: Quote) => {
    setEditingQuote(q ?? null);
    setBuilderOpen(true);
  }, []);

  const saveQuote = useCallback((q: Quote) => {
    setQuotes((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [q, ...prev];
    });
    setSelectedQuote((prev) => (prev?.id === q.id ? q : prev));
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuote?.id === id) setDrawerOpen(false);
  }, [selectedQuote]);

  const updateStatus = useCallback((id: string, status: QuoteStatus) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status, updatedAt: new Date().toISOString().split("T")[0] } : q
      )
    );
    setSelectedQuote((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }, []);

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("All");
  };

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["ID", "Client", "Location", "Events", "Total", "Status", "Created", "Valid Until", "Follow-Ups"];
    const rows = filteredQuotes.map((q) => [
      q.id, q.clientName, q.clientLocation,
      q.eventTypes.join(";"), q.grandTotal, q.status,
      q.createdAt, q.validUntil, q.followUpCount,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "ott-quotes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Quotes &amp; Proposals</h1>
          <p className="text-xs text-zinc-500">
            AI-powered proposal engine · {filteredQuotes.length} quote{filteredQuotes.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all"
          >
            <Download size={12} /> Export CSV
          </button>
          <button
            onClick={() => openBuilder()}
            className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-xl transition-all font-medium"
          >
            <Plus size={12} /> New Proposal
          </button>

          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-6 max-w-[1600px] w-full mx-auto">

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <QuoteOverviewCards quotes={quotes} />

        {/* ── Search & Filters ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3"
        >
          {/* Row 1 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, event, location…"
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
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                <X size={12} /> Clear
              </button>
            )}

            {/* Quick status chips */}
            <div className="flex items-center gap-1.5 ml-2 flex-wrap">
              {(["Approved", "Sent", "Viewed", "Rejected"] as QuoteStatus[]).map((s) => {
                const m = STATUS_META[s];
                return (
                  <Chip
                    key={s}
                    label={s}
                    active={filterStatus === s}
                    color={m.hex}
                    onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
                  />
                );
              })}
            </div>
          </div>

          {/* Row 2: expanded filter */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">Status:</span>
              {STATUS_OPTIONS.map((s) => {
                const m = s !== "All" ? STATUS_META[s as QuoteStatus] : null;
                return (
                  <Chip
                    key={s}
                    label={s}
                    active={filterStatus === s}
                    color={m?.hex}
                    onClick={() => setFilterStatus(s)}
                  />
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* ── Quotes Table ─────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
              All Quotes · {filteredQuotes.length}
            </p>
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-zinc-600" />
              <p className="text-[10px] text-zinc-600">Click a row to open proposal details · Click column headers to sort</p>
            </div>
          </div>

          <QuotesTable
            quotes={filteredQuotes}
            onSelectQuote={openQuote}
            onEditQuote={(q) => openBuilder(q)}
            onDeleteQuote={deleteQuote}
          />
        </motion.section>

        {/* ── Empty state CTA ──────────────────────────────────────────── */}
        {filteredQuotes.length === 0 && !search && filterStatus === "All" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-zinc-600"
          >
            <FileText size={32} className="mb-4 opacity-30" />
            <p className="text-base font-medium text-zinc-500 mb-1">No quotes yet</p>
            <p className="text-sm text-zinc-600 mb-6">Create your first proposal and start converting clients</p>
            <button
              onClick={() => openBuilder()}
              className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl transition-all font-medium"
            >
              <Plus size={14} /> Create First Proposal
            </button>
          </motion.div>
        )}
      </main>

      {/* ── Modals & Drawers ──────────────────────────────────────────── */}
      <QuoteBuilderModal
        isOpen={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditingQuote(null); }}
        onSaveQuote={saveQuote}
        editingQuote={editingQuote}
      />

      <QuoteDetailDrawer
        quote={selectedQuote}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEditQuote={(q) => { setDrawerOpen(false); openBuilder(q); }}
        onUpdateStatus={updateStatus}
      />

      <AIChatAgent />
    </div>
  );
}
