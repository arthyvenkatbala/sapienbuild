"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileDown, Loader2, Plus, X } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LineItemState {
  id: string;
  name: string;
  selected: boolean;
  price: number;
  events: string;
  note: string;
  quantity: number;
}

interface ProjectShape {
  id: string;
  title: string;
  location: string | null;
  event_date: string | null;
  event_type: string | null;
  contact: { id: string; first_name: string; last_name: string } | null;
}

interface InvoiceShape {
  id: string;
  amount: number;
  client_name: string | null;
  location: string | null;
  event_dates: string | null;
  events_list: string | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_note: string | null;
  line_items: LineItemState[] | null;
}

export interface QuoteBuilderProps {
  invoiceId: string;
  projectId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-yellow-500/40 transition-all";

const inlineCls =
  "w-full bg-[#0d0d10] border border-white/[0.07] rounded-lg px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-yellow-500/30";

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-zinc-500";

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function defaultItems(): LineItemState[] {
  return SERVICES.map((s) => ({
    id:       s.id,
    name:     s.name,
    selected: !!s.default,
    price:    s.price,
    events:   "",
    note:     "",
    quantity: 1,
  }));
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHead({ letter, title }: { letter: string; title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
      <span className="w-5 h-5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] flex items-center justify-center font-bold shrink-0">
        {letter}
      </span>
      {title}
    </h3>
  );
}

// ─── Quote Builder ────────────────────────────────────────────────────────────

export function QuoteBuilder({ invoiceId, projectId, onClose, onSave }: QuoteBuilderProps) {
  const toast = useToast();

  // ── Section A ──────────────────────────────────────────────────────────────
  const [clientName, setClientName] = useState("");
  const [location,   setLocation]   = useState("");
  const [eventDates, setEventDates] = useState("");
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [newEvent,   setNewEvent]   = useState("");

  // ── Section B ──────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<LineItemState[]>(defaultItems);

  // ── Section C ──────────────────────────────────────────────────────────────
  const [discountType,  setDiscountType]  = useState<"none" | "fixed" | "percentage">("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountNote,  setDiscountNote]  = useState("");

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [loadingData, setLoadingData] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [generating,  setGenerating]  = useState(false);

  const didLoad = useRef(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const subtotal = lineItems
    .filter((i) => i.selected)
    .reduce((s, i) => s + i.price * i.quantity, 0);

  const discountAmount =
    discountType === "fixed"
      ? Math.min(discountValue, subtotal)
      : discountType === "percentage"
        ? Math.round((subtotal * discountValue) / 100)
        : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const eventsList = eventNames.map((e, i) => `(${i + 1}) ${e}`).join("  ");

  // ── Load existing data ─────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (didLoad.current) return;
    didLoad.current = true;
    setLoadingData(true);
    try {
      const reqs: Promise<Response>[] = [fetch(`/api/invoices/${invoiceId}`)];
      if (projectId) reqs.push(fetch(`/api/projects/${projectId}`));
      const responses = await Promise.all(reqs);
      const [invJson, projJson] = await Promise.all(responses.map((r) => r.json()));

      const inv  = invJson.invoice  as InvoiceShape | null;
      const proj = projJson?.project as ProjectShape | null;

      // Pre-fill from project first, then override with saved invoice values
      if (proj) {
        const fullName = `${proj.contact?.first_name ?? ""} ${proj.contact?.last_name ?? ""}`.trim();
        setClientName(fullName);
        setLocation(proj.location ?? "");
        if (proj.event_date) {
          setEventDates(
            new Date(proj.event_date).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            }),
          );
        }
        if (proj.event_type) {
          setEventNames([proj.event_type.charAt(0).toUpperCase() + proj.event_type.slice(1)]);
        }
      }

      if (inv) {
        if (inv.client_name)   setClientName(inv.client_name);
        if (inv.location)      setLocation(inv.location);
        if (inv.event_dates)   setEventDates(inv.event_dates);

        if (inv.events_list) {
          const matches = inv.events_list.match(/\(\d+\)\s*([^(]+)/g);
          if (matches) {
            setEventNames(matches.map((m) => m.replace(/^\(\d+\)\s*/, "").trim()).filter(Boolean));
          }
        }

        if (inv.discount_type && inv.discount_type !== "none") {
          setDiscountType(inv.discount_type as "fixed" | "percentage");
        }
        if (inv.discount_value) setDiscountValue(Number(inv.discount_value));
        if (inv.discount_note)  setDiscountNote(inv.discount_note);

        if (Array.isArray(inv.line_items) && inv.line_items.length > 0) {
          // Merge: master list order, override with saved values per id
          setLineItems(
            SERVICES.map((s) => {
              const saved = inv.line_items!.find((l) => l.id === s.id);
              return saved
                ? { ...saved, name: s.name } // keep master name canonical
                : {
                    id: s.id, name: s.name,
                    selected: !!s.default,
                    price: s.price,
                    events: "", note: "", quantity: 1,
                  };
            }),
          );
        }
      }
    } catch (e) {
      console.error("[QuoteBuilder] load:", e);
    } finally {
      setLoadingData(false);
    }
  }, [invoiceId, projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateItem = (id: string, patch: Partial<LineItemState>) => {
    setLineItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addEvent = () => {
    const t = newEvent.trim();
    if (!t) return;
    setEventNames((prev) => [...prev, t]);
    setNewEvent("");
  };

  const removeEvent = (i: number) => {
    setEventNames((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveQuote = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:         total,
          client_name:    clientName,
          location,
          event_dates:    eventDates,
          events_list:    eventsList,
          line_items:     lineItems,
          discount_type:  discountType,
          discount_value: discountValue,
          discount_note:  discountNote,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "Failed to save quote", "error");
        return false;
      }
      return true;
    } catch {
      toast("Network error", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Generate PDF ───────────────────────────────────────────────────────────

  const generatePDF = async () => {
    const saved = await saveQuote();
    if (!saved) return;

    setGenerating(true);
    try {
      const res  = await fetch("/api/generate-quote", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ invoice_id: invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "PDF generation failed", "error"); return; }

      // Trigger browser download
      const link = document.createElement("a");
      link.href     = `data:application/pdf;base64,${data.pdf_data}`;
      link.download = `OTT-Quote-${clientName.replace(/\s+/g, "-") || "Quote"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast("Quote PDF generated and downloaded!");
      onSave();
    } catch {
      toast("PDF generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[#0e0e12] border-l border-white/[0.08] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#111114] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Quote Builder</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customise services and generate the client quote PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        {loadingData ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={22} className="text-zinc-600 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-10">

              {/* ─── Section A — Client & Event Details ─────────────────── */}
              <section>
                <SectionHead letter="A" title="Client & Event Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className={labelCls}>Client Name</label>
                    <input
                      className={inputCls}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Priya & Rahul"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Location</label>
                    <input
                      className={inputCls}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Chennai"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Event Dates</label>
                    <input
                      className={inputCls}
                      value={eventDates}
                      onChange={(e) => setEventDates(e.target.value)}
                      placeholder="15 Nov – 17 Nov 2025"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className={labelCls}>Events  (each gets a number)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {eventNames.map((ev, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-lg"
                        >
                          <span className="text-yellow-500/60 text-[10px]">({i + 1})</span>
                          {ev}
                          <button
                            onClick={() => removeEvent(i)}
                            className="ml-1 text-yellow-500/50 hover:text-yellow-300 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        value={newEvent}
                        onChange={(e) => setNewEvent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addEvent(); }
                        }}
                        placeholder="e.g. Reception, Wedding…"
                      />
                      <button
                        onClick={addEvent}
                        className="shrink-0 px-3 py-2 rounded-xl bg-yellow-600/80 hover:bg-yellow-600 text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ─── Section B — Services ────────────────────────────────── */}
              <section>
                <SectionHead letter="B" title="Services" />
                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 transition-all ${
                        item.selected
                          ? "bg-yellow-500/[0.04] border-yellow-500/20"
                          : "bg-white/[0.01] border-white/[0.05] opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { selected: !item.selected })}
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            item.selected
                              ? "bg-yellow-500 border-yellow-500 text-[#0a0a0d]"
                              : "border-white/[0.2] hover:border-white/[0.4]"
                          }`}
                        >
                          {item.selected && <Check size={11} strokeWidth={3} />}
                        </button>

                        {/* Row content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white mb-2.5 leading-snug">
                            {item.name}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-[72px_1fr_88px] gap-2">
                            <div className="space-y-1">
                              <label className={labelCls}>Events</label>
                              <input
                                className={inlineCls}
                                placeholder="1,2"
                                value={item.events}
                                disabled={!item.selected}
                                onChange={(e) => updateItem(item.id, { events: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={labelCls}>Note</label>
                              <input
                                className={inlineCls}
                                placeholder="e.g. Drone for Reception only"
                                value={item.note}
                                disabled={!item.selected}
                                onChange={(e) => updateItem(item.id, { note: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={labelCls}>Price (₹)</label>
                              <input
                                type="number"
                                className={inlineCls + " text-right"}
                                value={item.price}
                                disabled={!item.selected}
                                onChange={(e) =>
                                  updateItem(item.id, { price: Number(e.target.value) || 0 })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ─── Section C — Discount ────────────────────────────────── */}
              <section>
                <SectionHead letter="C" title="Discount" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Type</label>
                    <select
                      className={inputCls}
                      value={discountType}
                      onChange={(e) =>
                        setDiscountType(e.target.value as "none" | "fixed" | "percentage")
                      }
                    >
                      <option value="none">None</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                  {discountType !== "none" && (
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        {discountType === "percentage" ? "Percentage (%)" : "Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        className={inputCls}
                        value={discountValue || ""}
                        onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                        placeholder={discountType === "percentage" ? "10" : "5000"}
                        min={0}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Note</label>
                    <input
                      className={inputCls}
                      value={discountNote}
                      onChange={(e) => setDiscountNote(e.target.value)}
                      placeholder="Loyalty discount"
                    />
                  </div>
                </div>
              </section>

              {/* ─── Section D — Summary ─────────────────────────────────── */}
              <section>
                <SectionHead letter="D" title="Summary" />
                <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 space-y-2.5">
                  {lineItems.filter((i) => i.selected).length === 0 ? (
                    <p className="text-xs text-zinc-600 text-center py-3">
                      Select services above to see the total
                    </p>
                  ) : (
                    <>
                      {lineItems.filter((i) => i.selected).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-zinc-400 truncate">{item.name}</span>
                          <span className="text-zinc-300 shrink-0 tabular-nums">
                            {inr(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-white/[0.06] pt-2.5 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Subtotal</span>
                          <span className="text-zinc-300 tabular-nums">{inr(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">
                              Discount
                              {discountNote ? ` (${discountNote})` : ""}
                              {discountType === "percentage" ? ` — ${discountValue}%` : ""}
                            </span>
                            <span className="text-red-400 tabular-nums">
                              −{inr(discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-white/[0.06] pt-2">
                          <span className="text-sm font-semibold text-white">Total</span>
                          <span className="text-lg font-bold text-yellow-400 tabular-nums">
                            {inr(total)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

            </div>
          </div>
        )}

        {/* ─── Section E — Footer actions ───────────────────────────────── */}
        {!loadingData && (
          <div className="px-6 py-4 border-t border-white/[0.07] bg-[#111114] shrink-0 space-y-2">
            <button
              onClick={generatePDF}
              disabled={generating || saving}
              className="w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <><Loader2 size={15} className="animate-spin" /> Generating PDF…</>
              ) : (
                <><FileDown size={15} /> Generate Quote PDF</>
              )}
            </button>
            <button
              onClick={async () => {
                const ok = await saveQuote();
                if (ok) { toast("Quote saved as draft"); onSave(); }
              }}
              disabled={saving || generating}
              className="w-full py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-400 hover:text-white hover:border-white/[0.15] disabled:opacity-50 transition-all"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
