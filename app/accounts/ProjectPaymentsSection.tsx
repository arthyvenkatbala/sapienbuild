"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown, ChevronRight, Plus, X, Loader2, Trash2, IndianRupee,
  FileText, Download, Mail, Pencil, CheckCircle, Receipt, DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id:               string;
  invoice_id:       string;
  amount:           number;
  payment_type:     string;
  payment_date:     string;
  method:           string | null;
  notes:            string | null;
  receipt_pdf_data: string | null;
  receipt_number:   string | null;
  created_at:       string;
}

export interface ProjectDocument {
  id:             string;
  type:           "quote" | "invoice" | "receipt";
  status:         string;
  amount:         number;
  pdf_data:       string | null;
  invoice_number: string | null;
  client_name:    string | null;
  event_dates:    string | null;
  events_list:    string | null;
  location:       string | null;
  created_at:     string;
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
  quoteStatus:  string | null;
  documents:    ProjectDocument[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}

const PAYMENT_TYPES = ["advance", "partial", "balance", "full"] as const;
type PaymentType = typeof PAYMENT_TYPES[number];

const TYPE_LABEL: Record<string, string> = {
  advance: "Advance", partial: "Partial", balance: "Balance", full: "Full Payment",
};

const METHODS = ["UPI", "Bank Transfer", "Cash", "Cheque", "Other"];

const PAY_STATUS_STYLE: Record<string, string> = {
  "Pending":        "bg-amber-500/10 border-amber-500/20 text-amber-400",
  "Partially Paid": "bg-blue-500/10 border-blue-500/20 text-blue-400",
  "Paid in Full":   "bg-green-500/10 border-green-500/20 text-green-400",
};

const STAGE_COLOR: Record<string, string> = {
  enquiry:         "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  discussion:      "bg-purple-500/20 text-purple-400 border-purple-500/30",
  quote:           "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  negotiation:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  booked:          "bg-teal-500/20 text-teal-400 border-teal-500/30",
  execution:       "bg-blue-500/20 text-blue-400 border-blue-500/30",
  feedback:        "bg-pink-500/20 text-pink-400 border-pink-500/30",
  post_production: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  delivery:        "bg-green-500/20 text-green-400 border-green-500/30",
};

const STAGE_LABEL: Record<string, string> = {
  enquiry: "Enquiry", discussion: "Discussion", quote: "Quote",
  negotiation: "Negotiation", booked: "Booked", execution: "Execution",
  feedback: "Feedback", post_production: "Post Prod", delivery: "Delivery",
};

// ─── Quote Email Modal ────────────────────────────────────────────────────────

interface EmailTarget {
  clientName:     string;
  amount:         number;
  invoice_number: string | null;
  events_list:    string | null;
  event_dates:    string | null;
  location:       string | null;
}

function QuoteEmailModal({ target, onClose }: { target: EmailTarget; onClose: () => void }) {
  const toast = useToast();
  const subject = `Quote from One Thousand Tales${target.invoice_number ? ` — ${target.invoice_number}` : ""}`;
  const body = [
    `Dear ${target.clientName || "Client"},`,
    "",
    "Thank you for choosing One Thousand Tales Photography.",
    "",
    `Please find attached our quote${target.events_list ? ` for ${target.events_list}` : ""}.`,
    ...(target.event_dates ? [`Event Dates: ${target.event_dates}`] : []),
    ...(target.location    ? [`Location: ${target.location}`]      : []),
    `Total: ₹${Math.round(target.amount).toLocaleString("en-IN")}`,
    "",
    "Please review and let us know if you have any questions or would like to make changes.",
    "",
    "Warm regards,",
    "One Thousand Tales Photography",
  ].join("\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Send Quote to Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Subject</p>
            <p className="text-sm text-zinc-200 bg-white/[0.03] rounded-xl px-3 py-2.5">{subject}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Email Body</p>
            <pre className="text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">{body}</pre>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { navigator.clipboard.writeText(body); toast("Email body copied"); }}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all">
              Copy Body
            </button>
            <a href={`mailto:&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-all flex items-center justify-center gap-2">
              <Mail size={13} /> Open in Mail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({ row, onClose, onSaved }: { row: ProjectRow; onClose: () => void; onSaved: () => void }) {
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
          invoice_id: row.invoiceId, project_id: row.projectId,
          amount: amt, payment_type: form.payment_type,
          payment_date: form.payment_date,
          method: form.method || null, notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to record payment"); return; }
      onSaved(); onClose();
    } catch { setError("Network error — try again"); }
    finally   { setSaving(false); }
  };

  const inp = "w-full px-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-white">Record Payment</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{row.clientName}{row.projectTitle ? ` · ${row.projectTitle}` : ""}</p>
            <p className="text-xs text-amber-400/80 mt-1">Balance due: {inr(row.balance)}</p>
          </div>
          <button onClick={onClose} className="mt-0.5 p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount (₹) *</label>
              <div className="relative">
                <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input type="number" min="1" step="1" autoFocus
                  className="w-full pl-7 pr-3 py-2.5 bg-[#0d0d10] border border-white/[0.08] rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all"
                  placeholder={String(Math.round(row.balance))}
                  value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date *</label>
              <input type="date" className={inp} value={form.payment_date} onChange={(e) => set("payment_date", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Payment Type</label>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => set("payment_type", t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.payment_type === t
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15]"
                  }`}>
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Method</label>
              <select className={inp} value={form.method} onChange={(e) => set("method", e.target.value)}>
                <option value="">Select…</option>
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Reference / Notes</label>
              <input className={inp} placeholder="Txn ID, cheque no…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payment History Row ──────────────────────────────────────────────────────

function PaymentHistoryRow({ payment, onDelete }: { payment: Payment; onDelete: (id: string) => void }) {
  const toast    = useToast();
  const [deleting,     setDeleting]     = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this payment entry?")) return;
    setDeleting(true);
    await fetch(`/api/payments/${payment.id}`, { method: "DELETE" });
    onDelete(payment.id);
    setDeleting(false);
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      let pdfData   = payment.receipt_pdf_data;
      let rcptNumber = payment.receipt_number;

      if (!pdfData) {
        const res  = await fetch("/api/receipts", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ payment_id: payment.id }),
        });
        const data = await res.json() as { receipt_pdf_data?: string; receipt_number?: string; error?: string };
        if (!res.ok) { toast(data.error ?? "Receipt generation failed", "error"); return; }
        pdfData    = data.receipt_pdf_data ?? null;
        rcptNumber = data.receipt_number   ?? null;
      }

      if (!pdfData) { toast("Receipt not available", "error"); return; }

      const filename = `OTT-Receipt-${rcptNumber ?? payment.id.slice(-6).toUpperCase()}.pdf`;
      const link     = document.createElement("a");
      link.href      = `data:application/pdf;base64,${pdfData}`;
      link.download  = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch { toast("Download failed", "error"); }
    finally   { setDownloading(false); }
  };

  return (
    <div className="grid grid-cols-[80px_1fr_96px_80px_1fr_56px] gap-2 items-center px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] group">
      <div className="text-xs text-zinc-500">{fmtDate(payment.payment_date)}</div>
      <div><span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 capitalize">{TYPE_LABEL[payment.payment_type] ?? payment.payment_type}</span></div>
      <div className="text-right text-sm font-semibold text-green-400 tabular-nums">{inr(payment.amount)}</div>
      <div className="text-xs text-zinc-500">{payment.method ?? "—"}</div>
      <div className="text-xs text-zinc-600 truncate">{payment.notes ?? "—"}</div>
      <div className="flex justify-end items-center gap-0.5">
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          title={payment.receipt_pdf_data ? "Download Receipt" : "Generate & Download Receipt"}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-green-500/10 text-zinc-600 hover:text-green-400 transition-all disabled:opacity-50">
          {downloading ? <Loader2 size={11} className="animate-spin" /> : <Receipt size={11} />}
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all disabled:opacity-50">
          {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
        </button>
      </div>
    </div>
  );
}

// ─── Documents Panel ──────────────────────────────────────────────────────────

const DOC_ICON: Record<string, React.ElementType> = {
  quote:   DollarSign,
  invoice: FileText,
  receipt: Receipt,
};

function DocumentsPanel({
  documents,
  clientName,
  projectId,
  onEditQuote,
}: {
  documents:    ProjectDocument[];
  clientName:   string;
  projectId:    string;
  onEditQuote?: (invoiceId: string, projectId: string) => void;
}) {
  const toast = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState<EmailTarget | null>(null);

  const downloadPDF = async (doc: ProjectDocument) => {
    setDownloading(doc.id);
    try {
      let pdfData = doc.pdf_data;
      if (!pdfData) {
        const res  = await fetch("/api/generate-quote", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ invoice_id: doc.id }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error ?? "PDF generation failed", "error"); return; }
        pdfData = data.pdf_data;
      }
      const name = doc.client_name ?? clientName.replace(/\s+/g, "-") ?? "Quote";
      const link = document.createElement("a");
      link.href     = `data:application/pdf;base64,${pdfData}`;
      link.download = `OTT-Quote-${name}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch { toast("Download failed", "error"); }
    finally   { setDownloading(null); }
  };

  if (documents.length === 0) return null;

  return (
    <>
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-white/[0.05] bg-white/[0.01]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Documents</p>
        </div>
        {documents.map((doc) => {
          const Icon = DOC_ICON[doc.type] ?? FileText;
          return (
            <div key={doc.id}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
              <Icon size={12} className="text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300 capitalize">{doc.type}</span>
                  {doc.invoice_number && (
                    <span className="text-[10px] text-zinc-600">{doc.invoice_number}</span>
                  )}
                  <span className="text-[10px] font-medium text-zinc-500 tabular-nums">{inr(doc.amount)}</span>
                </div>
                <p className="text-[10px] text-zinc-700 mt-0.5">{fmtDate(doc.created_at)}</p>
              </div>
              {/* Actions — PDF available only for quotes */}
              <div className="flex items-center gap-1 shrink-0">
                {doc.type === "quote" && (
                  <>
                    <button
                      onClick={() => downloadPDF(doc)}
                      disabled={downloading === doc.id}
                      title="Download PDF"
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-600 hover:text-zinc-300 transition-all disabled:opacity-50">
                      {downloading === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    </button>
                    {onEditQuote && (
                      <button
                        onClick={() => onEditQuote(doc.id, projectId)}
                        title="Edit Quote"
                        className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-zinc-600 hover:text-yellow-400 transition-all">
                        <Pencil size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => setEmailTarget({
                        clientName:     doc.client_name ?? clientName,
                        amount:         doc.amount,
                        invoice_number: doc.invoice_number,
                        events_list:    doc.events_list,
                        event_dates:    doc.event_dates,
                        location:       doc.location,
                      })}
                      title="Send Email"
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-all">
                      <Mail size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {emailTarget && (
        <QuoteEmailModal target={emailTarget} onClose={() => setEmailTarget(null)} />
      )}
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const COLS = "grid-cols-[1fr_88px_108px_88px_108px_78px_auto]";

export function ProjectPaymentsSection({
  onEditQuote,
  refreshKey,
}: {
  onEditQuote?: (invoiceId: string, projectId: string) => void;
  refreshKey?:  number;
}) {
  const [rows,        setRows]        = useState<ProjectRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());
  const [recordFor,   setRecordFor]   = useState<ProjectRow | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/projects/payment-summary");
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (e) { console.error("[ProjectPayments]", e); }
    finally     { setLoading(false); }
  }, []);

  // Initial load + refresh when parent increments refreshKey
  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  // Realtime refresh on any payment or invoice change
  useEffect(() => {
    const ch = supabase
      .channel("project-payments-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments"  }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices"  }, fetchData)
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

  const handleMarkAsPaid = async (row: ProjectRow) => {
    if (row.balance <= 0) return;
    setMarkingPaid(row.projectId);
    try {
      const res = await fetch("/api/payments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          invoice_id:   row.invoiceId,
          project_id:   row.projectId,
          amount:       row.balance,
          payment_type: "full",
          payment_date: new Date().toISOString().slice(0, 10),
          notes:        "Marked as paid in full",
        }),
      });
      if (res.ok) await fetchData();
    } finally { setMarkingPaid(null); }
  };

  // Summary
  const totalInvoiced  = rows.reduce((s, r) => s + r.invoiceTotal, 0);
  const totalCollected = rows.reduce((s, r) => s + r.totalPaid,    0);
  const outstanding    = rows.reduce((s, r) => s + r.balance,      0);

  return (
    <>
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Invoiced",   value: inr(totalInvoiced),  cls: "text-white" },
            { label: "Total Collected",  value: inr(totalCollected), cls: "text-green-400" },
            { label: "Outstanding",      value: inr(outstanding),    cls: outstanding > 0 ? "text-amber-400" : "text-zinc-400" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">{label}</p>
              <p className={`text-xl font-bold tabular-nums ${cls}`}>{loading ? "…" : value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className={`grid ${COLS} gap-2 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Client / Project</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-right">Invoiced</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-right">Advance Paid</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-right">Balance Due</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center">Stage</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-center">Status</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 text-right">Actions</p>
          </div>

          {loading ? (
            <div>{[0, 1, 2].map((i) => <div key={i} className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]" />)}</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-1">
              <p className="text-sm text-zinc-500">No invoiced projects yet</p>
              <p className="text-xs text-zinc-600">Projects with quotes or invoices will appear here</p>
            </div>
          ) : (
            <div>
              {rows.map((row) => {
                const isOpen = expanded.has(row.projectId);
                return (
                  <div key={row.projectId} className="border-b border-white/[0.04] last:border-0">
                    {/* Main row */}
                    <div className={`grid ${COLS} gap-2 items-center px-5 py-3.5 hover:bg-white/[0.015] transition-colors`}>
                      {/* Client + Project — expand toggle */}
                      <button onClick={() => toggleExpand(row.projectId)} className="flex items-center gap-2 text-left min-w-0">
                        {isOpen
                          ? <ChevronDown  size={13} className="text-zinc-500 shrink-0" />
                          : <ChevronRight size={13} className="text-zinc-500 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate leading-tight">{row.clientName}</p>
                          <p className="text-[11px] text-zinc-500 truncate leading-tight">{row.projectTitle}</p>
                        </div>
                      </button>

                      <div className="text-right text-sm text-zinc-300 tabular-nums">{inr(row.invoiceTotal)}</div>
                      <div className="text-right text-sm font-semibold text-green-400 tabular-nums">{inr(row.totalPaid)}</div>
                      <div className={`text-right text-sm font-bold tabular-nums ${row.balance > 0 ? "text-amber-400" : "text-zinc-500"}`}>
                        {inr(row.balance)}
                      </div>

                      {/* Stage — read-only, from Workflow Kanban */}
                      <div className="flex justify-center">
                        {row.quoteStatus ? (
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap ${STAGE_COLOR[row.quoteStatus] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                            {STAGE_LABEL[row.quoteStatus] ?? row.quoteStatus}
                          </span>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap ${PAY_STATUS_STYLE[row.status]}`}>
                          {row.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 justify-end">
                        {row.balance > 0 && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(row)}
                              disabled={markingPaid === row.projectId}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 text-[11px] font-semibold transition-all disabled:opacity-50 whitespace-nowrap">
                              {markingPaid === row.projectId
                                ? <Loader2 size={10} className="animate-spin" />
                                : <CheckCircle size={10} />
                              }
                              Paid
                            </button>
                            <button
                              onClick={() => setRecordFor(row)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 text-[11px] font-medium transition-all whitespace-nowrap">
                              <Plus size={10} /> Record
                            </button>
                          </>
                        )}
                        {row.balance <= 0 && row.status === "Paid in Full" && (
                          <span className="flex items-center gap-1 px-2.5 py-1.5 text-green-500/60 text-[11px]">
                            <CheckCircle size={10} /> Done
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded: payment history + documents */}
                    {isOpen && (
                      <div className="mx-5 mb-3 space-y-2">
                        {/* Payment history */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
                          <div className="grid grid-cols-[80px_1fr_96px_80px_1fr_56px] gap-2 px-4 py-2 border-b border-white/[0.05] text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                            <div>Date</div><div>Type</div><div className="text-right">Amount</div><div>Method</div><div>Notes</div><div />
                          </div>
                          {row.payments.length === 0 ? (
                            <p className="text-xs text-zinc-600 text-center py-5">
                              No payments recorded yet.{" "}
                              <button onClick={() => setRecordFor(row)} className="text-green-500/60 hover:text-green-400 underline underline-offset-2 transition-colors">
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

                        {/* Documents */}
                        <DocumentsPanel
                          documents={row.documents}
                          clientName={row.clientName}
                          projectId={row.projectId}
                          onEditQuote={onEditQuote}
                        />
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
