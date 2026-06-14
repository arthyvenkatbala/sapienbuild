"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown, ChevronRight, Plus, X, Loader2, Trash2,
  IndianRupee,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id:           string;
  invoice_id:   string;
  amount:       number;
  payment_type: string;
  payment_date: string;
  method:       string | null;
  notes:        string | null;
  created_at:   string;
}

interface ProjectRow {
  projectId:    string;
  projectTitle: string;
  clientName:   string;
  invoiceTotal: number;
  totalPaid:    number;
  balance:      number;
  status:       "Pending" | "Partially Paid" | "Paid in Full";
  invoiceId:    string;
  payments:     Payment[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "2-digit",
  });
}

const PAYMENT_TYPES = ["advance", "partial", "balance", "full"] as const;
type PaymentType = typeof PAYMENT_TYPES[number];

const TYPE_LABEL: Record<string, string> = {
  advance: "Advance",
  partial: "Partial",
  balance: "Balance",
  full:    "Full Payment",
};

const METHODS = ["UPI", "Bank Transfer", "Cash", "Cheque", "Other"];

const STATUS_STYLE: Record<string, string> = {
  "Pending":        "bg-amber-500/10 border-amber-500/20 text-amber-400",
  "Partially Paid": "bg-blue-500/10 border-blue-500/20 text-blue-400",
  "Paid in Full":   "bg-green-500/10 border-green-500/20 text-green-400",
};

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({
  row,
  onClose,
  onSaved,
}: {
  row:     ProjectRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    amount:       "",
    payment_type: "advance" as PaymentType,
    payment_date: new Date().toISOString().slice(0, 10),
    method:       "",
    notes:        "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amt = Number(form.amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          invoice_id:   row.invoiceId,
          project_id:   row.projectId,
          amount:       amt,
          payment_type: form.payment_type,
          payment_date: form.payment_date,
          method:       form.method  || null,
          notes:        form.notes   || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to record payment"); return; }
      onSaved();
      onClose();
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-white">Record Payment</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {row.clientName}
              {row.projectTitle ? ` · ${row.projectTitle}` : ""}
            </p>
            <p className="text-xs text-amber-400/80 mt-1">
              Balance due: {inr(row.balance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee
                  size={12}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  autoFocus
                  className="w-full pl-7 pr-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all"
                  placeholder={String(Math.round(row.balance))}
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Date *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 outline-none focus:border-green-500/40 transition-all"
                value={form.payment_date}
                onChange={(e) => set("payment_date", e.target.value)}
              />
            </div>
          </div>

          {/* Payment type pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Payment Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("payment_type", t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.payment_type === t
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15]"
                  }`}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Method + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Method
              </label>
              <select
                className="w-full px-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 outline-none focus:border-green-500/40 transition-all"
                value={form.method}
                onChange={(e) => set("method", e.target.value)}
              >
                <option value="">Select…</option>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Reference / Notes
              </label>
              <input
                className="w-full px-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all"
                placeholder="Txn ID, cheque no…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={13} className="animate-spin" /> Saving…</>
              ) : (
                "Record Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payment Row (expanded) ───────────────────────────────────────────────────

function PaymentHistoryRow({
  payment,
  onDelete,
}: {
  payment:  Payment;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this payment entry?")) return;
    setDeleting(true);
    await fetch(`/api/payments/${payment.id}`, { method: "DELETE" });
    onDelete(payment.id);
    setDeleting(false);
  };

  return (
    <div className="grid grid-cols-[80px_1fr_96px_80px_1fr_32px] gap-2 items-center px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] group">
      <div className="text-xs text-zinc-500">{fmtDate(payment.payment_date)}</div>
      <div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 capitalize">
          {TYPE_LABEL[payment.payment_type] ?? payment.payment_type}
        </span>
      </div>
      <div className="text-right text-sm font-semibold text-green-400 tabular-nums">
        {inr(payment.amount)}
      </div>
      <div className="text-xs text-zinc-500">{payment.method ?? "—"}</div>
      <div className="text-xs text-zinc-600 truncate">{payment.notes ?? "—"}</div>
      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all disabled:opacity-50"
        >
          {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ProjectPaymentsSection() {
  const [rows,      setRows]      = useState<ProjectRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [recordFor, setRecordFor] = useState<ProjectRow | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/projects/payment-summary");
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (e) {
      console.error("[ProjectPayments]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: refresh on any payment change
  useEffect(() => {
    const ch = supabase
      .channel("project-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handlePaymentDeleted = (projectId: string, paymentId: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.projectId !== projectId) return r;
        const payments  = r.payments.filter((p) => p.id !== paymentId);
        const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
        const balance   = Math.max(0, r.invoiceTotal - totalPaid);
        const status    = totalPaid <= 0 ? "Pending" : balance <= 0 ? "Paid in Full" : "Partially Paid";
        return { ...r, payments, totalPaid, balance, status };
      }),
    );
  };

  // Totals
  const totalInvoiced  = rows.reduce((s, r) => s + r.invoiceTotal, 0);
  const totalCollected = rows.reduce((s, r) => s + r.totalPaid,    0);
  const outstanding    = rows.reduce((s, r) => s + r.balance,      0);

  return (
    <>
      <div className="space-y-4">
        {/* Section header */}
        <div>
          <h2 className="text-sm font-semibold text-white">Project Payment Tracker</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Advance, balance & payment history per project
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">
              Total Invoiced
            </p>
            <p className="text-xl font-bold text-white tabular-nums">{inr(totalInvoiced)}</p>
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">
              Total Collected
            </p>
            <p className="text-xl font-bold text-green-400 tabular-nums">{inr(totalCollected)}</p>
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">
              Outstanding
            </p>
            <p className={`text-xl font-bold tabular-nums ${outstanding > 0 ? "text-amber-400" : "text-zinc-400"}`}>
              {inr(outstanding)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[1fr_120px_120px_120px_100px_108px] gap-2 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            {["Client / Project", "Invoiced", "Advance Paid", "Balance Due", "Status", ""].map((h, i) => (
              <div
                key={i}
                className={`text-[10px] font-semibold uppercase tracking-widest text-zinc-600 ${i > 0 && i < 5 ? "text-right" : ""}`}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-1">
              <p className="text-sm text-zinc-500">No invoiced projects yet</p>
              <p className="text-xs text-zinc-600">
                Projects with quotes or invoices will appear here
              </p>
            </div>
          ) : (
            <div>
              {rows.map((row) => {
                const isOpen = expanded.has(row.projectId);
                return (
                  <div key={row.projectId} className="border-b border-white/[0.04] last:border-0">
                    {/* Main row */}
                    <div className="grid grid-cols-[1fr_120px_120px_120px_100px_108px] gap-2 items-center px-5 py-3.5 hover:bg-white/[0.015] transition-colors">
                      {/* Client + Project — also the expand toggle */}
                      <button
                        onClick={() => toggleExpand(row.projectId)}
                        className="flex items-center gap-2 text-left min-w-0"
                      >
                        {isOpen
                          ? <ChevronDown  size={13} className="text-zinc-500 shrink-0" />
                          : <ChevronRight size={13} className="text-zinc-500 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate leading-tight">
                            {row.clientName}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate leading-tight">
                            {row.projectTitle}
                          </p>
                        </div>
                      </button>

                      <div className="text-right text-sm text-zinc-300 tabular-nums">
                        {inr(row.invoiceTotal)}
                      </div>
                      <div className="text-right text-sm font-semibold text-green-400 tabular-nums">
                        {inr(row.totalPaid)}
                      </div>
                      <div className={`text-right text-sm font-bold tabular-nums ${
                        row.balance > 0 ? "text-amber-400" : "text-zinc-500"
                      }`}>
                        {inr(row.balance)}
                      </div>
                      <div className="flex justify-end">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap ${STATUS_STYLE[row.status]}`}>
                          {row.status}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {row.balance > 0 && (
                          <button
                            onClick={() => setRecordFor(row)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[11px] font-medium transition-all"
                          >
                            <Plus size={11} />
                            Record
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded payment history */}
                    {isOpen && (
                      <div className="mx-5 mb-3 bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
                        {/* History header */}
                        <div className="grid grid-cols-[80px_1fr_96px_80px_1fr_32px] gap-2 px-4 py-2 border-b border-white/[0.05] text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                          <div>Date</div>
                          <div>Type</div>
                          <div className="text-right">Amount</div>
                          <div>Method</div>
                          <div>Notes</div>
                          <div />
                        </div>

                        {row.payments.length === 0 ? (
                          <p className="text-xs text-zinc-600 text-center py-5">
                            No payments recorded yet.{" "}
                            <button
                              onClick={() => setRecordFor(row)}
                              className="text-green-500/60 hover:text-green-400 underline underline-offset-2 transition-colors"
                            >
                              Record the first one
                            </button>
                          </p>
                        ) : (
                          row.payments.map((p) => (
                            <PaymentHistoryRow
                              key={p.id}
                              payment={p}
                              onDelete={(pid) => handlePaymentDeleted(row.projectId, pid)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordFor && (
        <RecordPaymentModal
          row={recordFor}
          onClose={() => setRecordFor(null)}
          onSaved={fetchData}
        />
      )}
    </>
  );
}
