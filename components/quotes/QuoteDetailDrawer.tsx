"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Phone, Mail, MessageCircle, Edit3, Send,
  Sparkles, Clock, CheckCircle, XCircle, Eye,
  ChevronRight, FileText, MapPin, Calendar,
} from "lucide-react";
import { Quote, QuoteStatus, STATUS_META, AI_PRICING_SUGGESTIONS } from "@/lib/quotes-data";

interface Props {
  quote:           Quote | null;
  isOpen:          boolean;
  onClose:         () => void;
  onEditQuote:     (q: Quote) => void;
  onUpdateStatus:  (id: string, status: QuoteStatus) => void;
}

type Tab = "overview" | "proposal" | "ai";

function rupee(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const STATUSES: QuoteStatus[] = ["Draft", "Sent", "Viewed", "Approved", "Rejected", "Expired"];

const activityIcons: Record<string, typeof CheckCircle> = {
  approved: CheckCircle,
  sent:     Send,
  viewed:   Eye,
  rejected: XCircle,
  created:  FileText,
};

export default function QuoteDetailDrawer({ quote, isOpen, onClose, onEditQuote, onUpdateStatus }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  if (!quote) return null;

  const meta = STATUS_META[quote.status];

  const timeline = [
    { label: "Quote Created",  date: quote.createdAt,  type: "created",  show: true },
    { label: "Proposal Sent",  date: quote.sentAt,     type: "sent",     show: !!quote.sentAt },
    { label: "Viewed by Client",date: quote.viewedAt,   type: "viewed",  show: !!quote.viewedAt },
    { label: "Approved",        date: quote.approvedAt,  type: "approved", show: !!quote.approvedAt },
  ].filter((t) => t.show);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-[#111114] border-l border-white/[0.08] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-white/[0.07] shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {quote.status}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">{quote.id.toUpperCase()}</span>
                </div>
                <h2 className="text-base font-semibold text-white truncate">{quote.clientName}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {quote.eventTypes.join(", ")} · {quote.eventDates}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all ml-3 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grand Total + Action Strip */}
            <div className="px-5 py-4 border-b border-white/[0.07] bg-[#0d0d10] shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Grand Total</p>
                  <p className="text-3xl font-bold text-white">₹{rupee(quote.grandTotal)}</p>
                  {quote.discountAmount > 0 && (
                    <p className="text-xs text-green-500 mt-0.5">−₹{rupee(quote.discountAmount)} discount applied</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">AI Score</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${quote.aiScore}%`,
                          background: quote.aiScore >= 80 ? "#22c55e" : quote.aiScore >= 60 ? "#f97316" : "#ef4444",
                        }}
                      />
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: quote.aiScore >= 80 ? "#22c55e" : quote.aiScore >= 60 ? "#f97316" : "#ef4444" }}
                    >
                      {quote.aiScore}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditQuote(quote)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-300 hover:text-white hover:border-white/[0.18] transition-all"
                >
                  <Edit3 size={11} /> Edit
                </button>
                <a
                  href={`https://wa.me/${quote.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 border border-green-500/25 text-xs text-green-400 hover:bg-green-500/20 transition-all"
                >
                  <MessageCircle size={11} /> WhatsApp
                </a>
                <a
                  href={`mailto:${quote.clientEmail}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-400 hover:bg-blue-500/20 transition-all"
                >
                  <Mail size={11} /> Email
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-white/[0.06] px-5 shrink-0">
              {(["overview", "proposal", "ai"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs px-4 py-3 font-medium capitalize border-b-2 transition-all ${
                    tab === t
                      ? "text-white border-purple-500"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  }`}
                >
                  {t === "ai" ? "AI Insights" : t === "proposal" ? "Proposal" : "Overview"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
                  {tab === "overview" && (
                    <div className="p-5 space-y-5">

                      {/* Client info */}
                      <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Client</p>
                        <div className="bg-[#0d0d10] border border-white/[0.06] rounded-xl p-4 space-y-3">
                          {[
                            [Phone,    quote.clientPhone],
                            [Mail,     quote.clientEmail],
                            [MapPin,   quote.clientLocation],
                            [Calendar, quote.eventDates],
                          ].map(([Icon, val]) => (
                            <div key={String(val)} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                                <Icon size={11} className="text-zinc-500" />
                              </div>
                              <p className="text-xs text-zinc-300">{String(val)}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Services breakdown */}
                      <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Services</p>
                        <div className="space-y-1">
                          {quote.services.map((s) => (
                            <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.025] transition-colors">
                              <div>
                                <p className="text-xs font-medium text-zinc-200">{s.name}</p>
                                <p className="text-[10px] text-zinc-600">{s.sessions} session{s.sessions > 1 ? "s" : ""} · {s.events || "—"}</p>
                              </div>
                              <p className="text-xs font-semibold text-white shrink-0 ml-3">₹{rupee(s.subtotal)}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Add-ons */}
                      {quote.addOns.length > 0 && (
                        <section>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Add-Ons</p>
                          <div className="space-y-1">
                            {quote.addOns.map((a) => (
                              <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.025] transition-colors">
                                <div>
                                  <p className="text-xs font-medium text-zinc-200">{a.name}</p>
                                  <p className="text-[10px] text-zinc-600">{a.qty}×</p>
                                </div>
                                <p className="text-xs font-semibold text-white shrink-0 ml-3">₹{rupee(a.subtotal)}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Totals */}
                      <section className="bg-[#0d0d10] border border-white/[0.06] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Subtotal</span><span>₹{rupee(quote.subtotal)}</span>
                        </div>
                        {quote.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-green-500">
                            <span>Discount {quote.discountType === "percent" ? `(${quote.discountValue}%)` : ""}</span>
                            <span>−₹{rupee(quote.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                          <span>Grand Total</span><span>₹{rupee(quote.grandTotal)}</span>
                        </div>
                      </section>

                      {/* Status updater */}
                      <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Update Status</p>
                        <div className="grid grid-cols-3 gap-2">
                          {STATUSES.map((s) => {
                            const m = STATUS_META[s];
                            return (
                              <button
                                key={s}
                                onClick={() => onUpdateStatus(quote.id, s)}
                                className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-2 rounded-xl border transition-all ${
                                  quote.status === s ? m.badge : "border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${quote.status === s ? m.dot : "bg-zinc-700"}`} />
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      {/* Timeline */}
                      <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Activity Timeline</p>
                        <div className="space-y-3">
                          {timeline.map((ev, i) => {
                            const Icon = activityIcons[ev.type] ?? FileText;
                            return (
                              <div key={ev.label} className="flex items-start gap-3">
                                <div className="relative flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0">
                                    <Icon size={10} className="text-zinc-400" />
                                  </div>
                                  {i < timeline.length - 1 && (
                                    <div className="w-px h-6 bg-white/[0.06] mt-1" />
                                  )}
                                </div>
                                <div className="pb-3">
                                  <p className="text-xs font-medium text-zinc-300">{ev.label}</p>
                                  <p className="text-[10px] text-zinc-600 mt-0.5">{ev.date}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Notes */}
                      {quote.notes && (
                        <section>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">Notes</p>
                          <p className="text-xs text-zinc-400 leading-relaxed bg-[#0d0d10] border border-white/[0.06] rounded-xl p-3">
                            {quote.notes}
                          </p>
                        </section>
                      )}
                    </div>
                  )}

                  {/* ── PROPOSAL TAB (mini preview) ────────────────────── */}
                  {tab === "proposal" && (
                    <div className="p-4">
                      <div className="transform scale-[0.6] origin-top-left" style={{ width: "166.67%", pointerEvents: "none" }}>
                        <div className="pointer-events-none select-none">
                          {/* Mini proposal — we show just the key sections inline */}
                          <div className="bg-[#F5EFE0] rounded-lg p-6 text-[#2C2C2C] font-serif overflow-hidden" style={{ maxHeight: 800 }}>
                            <div className="text-center mb-6">
                              <p className="text-[#C9A55A] text-xl tracking-widest uppercase font-light">One Thousand Tales</p>
                              <div className="w-8 h-px bg-[#C9A55A] mx-auto my-3" />
                              <p className="text-base font-medium">{quote.clientName}</p>
                              <p className="text-xs text-[#8a7a60] mt-1">{quote.eventTypes.join(", ")} · {quote.eventDates}</p>
                            </div>
                            <table className="w-full text-[11px] border-collapse">
                              <thead>
                                <tr className="bg-[#2C2C2C] text-[#C9A55A]">
                                  <th className="p-2 text-left">Service</th>
                                  <th className="p-2 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {quote.services.map((s, i) => (
                                  <tr key={s.id} className={i % 2 === 0 ? "bg-[#F5EFE0]" : "bg-[#F0E8D5]"}>
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2 text-right font-semibold">₹{rupee(s.subtotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="mt-4 flex justify-between items-center border-t-2 border-[#C9A55A] pt-3">
                              <span className="text-sm font-bold tracking-widest uppercase">Grand Total</span>
                              <span className="text-xl font-bold text-[#C9A55A]">₹{rupee(quote.grandTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-[-220px] relative z-10 flex justify-center">
                        <p className="text-xs text-zinc-600 bg-[#111114] px-4 py-1.5 rounded-full border border-white/[0.06]">
                          Open the builder to print / download full PDF
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── AI INSIGHTS TAB ──────────────────────────────────── */}
                  {tab === "ai" && (
                    <div className="p-5 space-y-4">
                      {/* AI Recommendation */}
                      <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={13} className="text-purple-400" />
                          <p className="text-xs font-semibold text-purple-400">AI Recommendation</p>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{quote.aiRecommendation}</p>
                      </div>

                      {/* Follow-up count */}
                      <div className="bg-[#0d0d10] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Follow-Ups Sent</p>
                            <p className="text-2xl font-bold text-white">{quote.followUpCount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Valid Until</p>
                            <p className="text-sm font-semibold text-zinc-300">{quote.validUntil}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI suggestions */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Smart Actions</p>
                        <div className="space-y-3">
                          {AI_PRICING_SUGGESTIONS.map((s) => {
                            const typeColor = {
                              bundle:  "text-purple-400 bg-purple-500/08 border-purple-500/20",
                              upsell:  "text-blue-400 bg-blue-500/08 border-blue-500/20",
                              discount:"text-green-400 bg-green-500/08 border-green-500/20",
                              timing:  "text-amber-400 bg-amber-500/08 border-amber-500/20",
                            }[s.type];
                            return (
                              <div key={s.id} className={`border rounded-xl p-3.5 ${typeColor}`}>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <p className="text-xs font-semibold">{s.title}</p>
                                  <span className="text-[9px] font-bold shrink-0 border px-1.5 py-0.5 rounded-md">
                                    {s.impact}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">{s.body}</p>
                                <button className="flex items-center gap-1 text-[10px] font-semibold hover:brightness-125 transition-all">
                                  {s.action} <ChevronRight size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conversion stats */}
                      <div className="bg-[#0d0d10] border border-white/[0.06] rounded-xl p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">Market Benchmarks</p>
                        {[
                          { label: "Avg. approval time",        value: "3.2 days" },
                          { label: "Avg. quote value (weddings)", value: "₹1.4L" },
                          { label: "Your conv. rate",           value: "63%" },
                          { label: "Industry conv. rate",       value: "48%" },
                        ].map((m) => (
                          <div key={m.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
                            <p className="text-xs text-zinc-500">{m.label}</p>
                            <p className="text-xs font-semibold text-zinc-200">{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
