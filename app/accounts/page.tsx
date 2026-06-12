"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, Download, ExternalLink, FileText,
  Loader2, Mail, DollarSign, Pencil, Plus, Receipt, X,
} from "lucide-react";
import { useToast } from "@/lib/toast";
import { QuoteBuilder } from "./QuoteBuilder";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceType   = "quote" | "invoice" | "receipt";
type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

interface Invoice {
  id: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  project: { id: string; title: string } | null;
  contact: { id: string; first_name: string; last_name: string } | null;
  // quote-specific
  line_items: object[] | null;
  pdf_data: string | null;
  invoice_number: string | null;
  client_name: string | null;
  event_dates: string | null;
  events_list: string | null;
  location: string | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_note: string | null;
}

interface Contact { id: string; first_name: string; last_name: string }
interface Project  { id: string; title: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft:     "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  sent:      "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid:      "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TAB_TYPES: { key: InvoiceType | "all"; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "quote",   label: "Quotes" },
  { key: "invoice", label: "Invoices" },
  { key: "receipt", label: "Receipts" },
];

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all";

// ─── New Invoice / New Quote Modal ────────────────────────────────────────────

function NewDocumentModal({
  onClose,
  onAdd,
  onOpenQuoteBuilder,
}: {
  onClose: () => void;
  onAdd:   (inv: Invoice) => void;
  onOpenQuoteBuilder: (invoiceId: string, projectId: string | null) => void;
}) {
  const [form, setForm] = useState({
    type: "invoice" as InvoiceType,
    contact_id: "", project_id: "", amount: "", due_date: "", notes: "",
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts?type=client").then((r) => r.json()),
      fetch("/api/contacts?type=lead").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([c1, c2, p]) => {
        setContacts([...(c1.contacts ?? []), ...(c2.contacts ?? [])]);
        setProjects(p.projects ?? []);
      })
      .catch(console.error);
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (form.type === "quote") {
        // Create draft invoice then open Quote Builder
        const res  = await fetch("/api/invoices", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type:       "quote",
            contact_id: form.contact_id || undefined,
            project_id: form.project_id || undefined,
            amount:     "0",
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to create quote"); return; }
        onClose();
        onOpenQuoteBuilder(data.invoice.id, form.project_id || null);
        return;
      }

      // Invoice / Receipt — require amount
      if (!form.amount || isNaN(Number(form.amount))) {
        setError("Amount is required");
        return;
      }
      const res  = await fetch("/api/invoices", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create"); return; }
      onAdd(data.invoice);
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const isQuote = form.type === "quote";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">New Document</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Type
            </label>
            <div className="flex gap-2">
              {(["quote", "invoice", "receipt"] as InvoiceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                    form.type === t
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Client
            </label>
            <select
              className={inputCls}
              value={form.contact_id}
              onChange={(e) => setForm((f) => ({ ...f, contact_id: e.target.value }))}
            >
              <option value="">Select client…</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Project
            </label>
            <select
              className={inputCls}
              value={form.project_id}
              onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Amount + due date — hidden for quotes */}
          {!isQuote && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="75000"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Due Date
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
          )}

          {!isQuote && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Notes
              </label>
              <input
                className={inputCls}
                placeholder="50% advance…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          )}

          {isQuote && (
            <p className="text-xs text-zinc-500 bg-yellow-500/[0.06] border border-yellow-500/20 rounded-xl px-3 py-2.5">
              Quotes open the Quote Builder where you can add services, set prices, and generate a
              PDF.
            </p>
          )}

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
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-medium text-white transition-all"
            >
              {saving
                ? "Creating…"
                : isQuote
                  ? "Open Quote Builder →"
                  : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

function EmailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const toast   = useToast();
  const contact = invoice.contact;
  const name    = invoice.client_name ?? (contact ? `${contact.first_name} ${contact.last_name}` : "Client");
  const amount  = `₹${Number(invoice.amount).toLocaleString("en-IN")}`;
  const subject = `Quote from One Thousand Tales${invoice.invoice_number ? ` — ${invoice.invoice_number}` : ""}`;
  const body    = [
    `Dear ${name},`,
    "",
    `Thank you for choosing One Thousand Tales Photography.`,
    "",
    `Please find attached our quote${invoice.events_list ? ` for ${invoice.events_list}` : ""}.`,
    ...(invoice.event_dates ? [`Event Dates: ${invoice.event_dates}`] : []),
    ...(invoice.location    ? [`Location: ${invoice.location}`]      : []),
    `Total: ${amount}`,
    "",
    "Please review and let us know if you have any questions or would like to make changes.",
    "",
    "Warm regards,",
    "One Thousand Tales Photography",
  ].join("\n");

  const mailtoHref = `mailto:&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Send Quote to Client</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Subject
            </p>
            <p className="text-sm text-zinc-200 bg-white/[0.03] rounded-xl px-3 py-2.5">{subject}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Email Body
            </p>
            <pre className="text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">
              {body}
            </pre>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(body);
                toast("Email body copied to clipboard");
              }}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Copy Body
            </button>
            <a
              href={mailtoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              <Mail size={13} /> Open in Mail
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Invoice Detail Panel ─────────────────────────────────────────────────────

function InvoiceDetailPanel({
  invoice,
  onClose,
  onUpdate,
  onEditQuote,
}: {
  invoice: Invoice;
  onClose: () => void;
  onUpdate: (inv: Invoice) => void;
  onEditQuote: (invoiceId: string, projectId: string | null) => void;
}) {
  const toast   = useToast();
  const [saving, setSaving] = useState<"paid" | "sent" | null>(null);
  const [downloading, setDownloading] = useState(false);

  const markAs = async (status: "paid" | "sent") => {
    setSaving(status);
    try {
      const res  = await fetch(`/api/invoices/${invoice.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Update failed", "error"); return; }
      onUpdate(data.invoice);
      toast(status === "paid" ? "Payment recorded ✓" : "Invoice marked as sent");
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(null);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      let pdfData = invoice.pdf_data;
      if (!pdfData) {
        const res  = await fetch("/api/generate-quote", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ invoice_id: invoice.id }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error ?? "PDF generation failed", "error"); return; }
        pdfData = data.pdf_data;
        onUpdate({ ...invoice, pdf_data: pdfData, invoice_number: data.invoice_number });
      }
      const name = invoice.client_name ?? (invoice.contact
        ? `${invoice.contact.first_name}-${invoice.contact.last_name}`
        : "Quote");
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfData}`;
      link.download = `OTT-Quote-${name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[#111114] border-l border-white/[0.08] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white capitalize">{invoice.type}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {invoice.invoice_number ?? (invoice.contact
                ? `${invoice.contact.first_name} ${invoice.contact.last_name}`
                : "No client")}
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Amount */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              Amount
            </p>
            <p className="text-2xl font-bold text-white">
              ₹{Number(invoice.amount).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Status
            </span>
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[invoice.status]}`}
            >
              {invoice.status}
            </span>
          </div>

          {/* Fields */}
          {[
            { label: "Type",    value: invoice.type },
            {
              label: "Due Date",
              value: invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—",
            },
            {
              label: "Created",
              value: new Date(invoice.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              }),
            },
            ...(invoice.event_dates
              ? [{ label: "Event Dates", value: invoice.event_dates }]
              : []),
            ...(invoice.events_list
              ? [{ label: "Events",      value: invoice.events_list }]
              : []),
            { label: "Notes", value: invoice.notes ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {label}
              </p>
              <p className="text-sm text-zinc-300 mt-0.5">{value}</p>
            </div>
          ))}

          {/* Linked project */}
          {invoice.project && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
                Linked Project
              </p>
              <Link
                href={`/projects/${invoice.project.id}`}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {invoice.project.title}
                <ExternalLink size={11} />
              </Link>
            </div>
          )}

          {/* Payment history — shown when paid */}
          {invoice.status === "paid" && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
                Payment History
              </p>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle size={13} />
                <span>
                  Paid on{" "}
                  {invoice.updated_at
                    ? new Date(invoice.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : new Date(invoice.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-white/[0.07] shrink-0 space-y-2">
          {/* Quote-specific actions */}
          {invoice.type === "quote" && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onEditQuote(invoice.id, invoice.project?.id ?? null);
                }}
                className="w-full py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/[0.06] hover:bg-yellow-500/[0.12] text-sm font-medium text-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <Pencil size={13} /> Edit Quote
              </button>
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="w-full py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-400 hover:text-white hover:border-white/[0.15] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {downloading
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><Download size={13} /> Download PDF</>
                }
              </button>
            </>
          )}

          {/* Mark as Paid — prominent, only for sent status */}
          {invoice.status === "sent" && (
            <button
              onClick={() => markAs("paid")}
              disabled={saving !== null}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} />
              {saving === "paid" ? "Recording payment…" : "Mark as Paid"}
            </button>
          )}

          {/* Mark as Sent — for draft */}
          {invoice.status === "draft" && (
            <button
              onClick={() => markAs("sent")}
              disabled={saving !== null}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              {saving === "sent" ? "Marking…" : "Mark as Sent"}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({
  invoice,
  onClick,
  onEditQuote,
  onDownloadPDF,
  onSendEmail,
  onStatusChange,
}: {
  invoice: Invoice;
  onClick: () => void;
  onEditQuote:    (id: string, projectId: string | null) => void;
  onDownloadPDF:  (invoice: Invoice) => void;
  onSendEmail:    (invoice: Invoice) => void;
  onStatusChange: (invoice: Invoice, status: "sent" | "paid") => void;
}) {
  const TypeIcon =
    invoice.type === "invoice" ? FileText :
    invoice.type === "receipt" ? CheckCircle :
    DollarSign;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      {/* Main clickable area */}
      <button
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
          <TypeIcon size={12} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">
            {invoice.client_name ??
              (invoice.contact
                ? `${invoice.contact.first_name} ${invoice.contact.last_name}`
                : "—")}
          </p>
          <p className="text-[11px] text-zinc-500 truncate">
            {invoice.invoice_number
              ? `${invoice.invoice_number} · ${invoice.project?.title ?? "No project"}`
              : invoice.project?.title ?? "No project linked"}
          </p>
        </div>
        <span className="text-[10px] text-zinc-600 capitalize shrink-0 hidden sm:block">
          {invoice.type}
        </span>
        <span className="text-[10px] text-zinc-500 hidden sm:block shrink-0">
          {invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short",
              })
            : "—"}
        </span>
        <span
          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_COLORS[invoice.status]}`}
        >
          {invoice.status}
        </span>
        <span className="text-sm font-semibold text-white shrink-0 w-24 text-right tabular-nums">
          ₹{Number(invoice.amount).toLocaleString("en-IN")}
        </span>
      </button>

      {/* Quote action buttons */}
      {invoice.type === "quote" && (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title="Edit Quote"
            onClick={(e) => {
              e.stopPropagation();
              onEditQuote(invoice.id, invoice.project?.id ?? null);
            }}
            className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-zinc-600 hover:text-yellow-400 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            title="Download PDF"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPDF(invoice);
            }}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-600 hover:text-zinc-300 transition-all"
          >
            <Download size={13} />
          </button>
          <button
            title="Send to Client"
            onClick={(e) => {
              e.stopPropagation();
              onSendEmail(invoice);
            }}
            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-all"
          >
            <Mail size={13} />
          </button>
        </div>
      )}

      {/* Status action buttons — all invoice types */}
      <div className="flex items-center shrink-0">
        {invoice.status === "draft" && (
          <button
            title="Mark as Sent"
            onClick={(e) => { e.stopPropagation(); onStatusChange(invoice, "sent"); }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
          >
            Mark Sent
          </button>
        )}
        {invoice.status === "sent" && (
          <button
            title="Mark as Paid"
            onClick={(e) => { e.stopPropagation(); onStatusChange(invoice, "paid"); }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
          >
            Mark Paid
          </button>
        )}
        {invoice.status === "paid" && (
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
            Paid ✓
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function AccountsContent() {
  const searchParams = useSearchParams();
  const toast        = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<InvoiceType | "all">("all");

  // Modals / panels
  const [showNew,     setShowNew]     = useState(false);
  const [selected,    setSelected]    = useState<Invoice | null>(null);
  const [emailTarget, setEmailTarget] = useState<Invoice | null>(null);

  // Quote Builder
  const [showQB,    setShowQB]    = useState(false);
  const [qbInvId,   setQbInvId]   = useState<string | null>(null);
  const [qbProjId,  setQbProjId]  = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const didInitParams = useRef(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data.invoices ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // ── URL params — auto-open QB ──────────────────────────────────────────────

  useEffect(() => {
    if (didInitParams.current) return;
    didInitParams.current = true;
    const newQuote  = searchParams.get("new_quote");
    const projectId = searchParams.get("project_id");
    const invoiceId = searchParams.get("invoice_id");
    if (newQuote === "true" && invoiceId) {
      setQbInvId(invoiceId);
      setQbProjId(projectId);
      setShowQB(true);
      // Switch to Quotes tab so the new record is visible after QB closes
      setTab("quote");
    }
  }, [searchParams]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.type === tab);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);

  const pending = invoices
    .filter((i) => i.status === "sent" || i.status === "draft")
    .reduce((s, i) => s + Number(i.amount), 0);

  const handleUpdate = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? { ...inv, ...updated } : inv)));
    setSelected((s) => (s?.id === updated.id ? { ...s, ...updated } : s));
  };

  const openQuoteBuilder = (invoiceId: string, projectId: string | null) => {
    setQbInvId(invoiceId);
    setQbProjId(projectId);
    setShowQB(true);
  };

  const handleQBSave = () => {
    setShowQB(false);
    fetchInvoices(); // Refresh so the list shows updated amount/status
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: "sent" | "paid") => {
    try {
      const res  = await fetch(`/api/invoices/${invoice.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Update failed", "error"); return; }
      handleUpdate(data.invoice);
      if (newStatus === "paid") toast("Payment recorded ✓");
      else toast("Invoice marked as sent");
    } catch {
      toast("Network error", "error");
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      let pdfData = invoice.pdf_data;
      if (!pdfData) {
        const res  = await fetch("/api/generate-quote", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ invoice_id: invoice.id }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error ?? "PDF generation failed", "error"); return; }
        pdfData = data.pdf_data;
        handleUpdate({ ...invoice, pdf_data: pdfData, invoice_number: data.invoice_number });
      }
      const name = invoice.client_name ?? (invoice.contact
        ? `${invoice.contact.first_name}-${invoice.contact.last_name}`
        : "Quote");
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfData}`;
      link.download = `OTT-Quote-${name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast("Download failed", "error");
    } finally {
      setDownloading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Accounts</h1>
          <p className="text-xs text-zinc-500">Quotes, invoices &amp; receipts</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> New
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              Revenue (Paid)
            </p>
            <p className="text-xl font-bold text-green-400">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              Outstanding
            </p>
            <p className="text-xl font-bold text-yellow-400">
              ₹{pending.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111114] border border-white/[0.07] rounded-xl p-1 w-fit">
          {TAB_TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === key ? "bg-green-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="w-7 shrink-0" />
            <p className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Client / Project
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 hidden sm:block">
              Type
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 hidden sm:block w-16">
              Due
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-16">
              Status
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-24 text-right">
              Amount
            </p>
            {/* Spacer for quote action buttons */}
            <div className="w-24 shrink-0 hidden sm:block" />
          </div>

          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Receipt size={28} className="mb-3 opacity-30" />
              <p className="text-sm text-zinc-500">
                No {tab === "all" ? "documents" : tab + "s"} yet
              </p>
              <button
                onClick={() => setShowNew(true)}
                className="mt-4 flex items-center gap-2 text-xs text-white bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl transition-all font-medium"
              >
                <Plus size={12} /> Create first
              </button>
            </div>
          ) : (
            filtered.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                onClick={() => setSelected(inv)}
                onEditQuote={openQuoteBuilder}
                onDownloadPDF={handleDownloadPDF}
                onSendEmail={(i) => setEmailTarget(i)}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </main>

      {/* ── Overlays ────────────────────────────────────────────────────────── */}

      <AnimatePresence>
        {showNew && (
          <NewDocumentModal
            key="new-doc"
            onClose={() => setShowNew(false)}
            onAdd={(inv) => {
              setInvoices((prev) => [inv, ...prev]);
              setShowNew(false);
            }}
            onOpenQuoteBuilder={(invId, projId) => {
              fetchInvoices(); // ensure new draft appears in list
              openQuoteBuilder(invId, projId);
            }}
          />
        )}

        {selected && (
          <InvoiceDetailPanel
            key="detail"
            invoice={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
            onEditQuote={(invId, projId) => {
              setSelected(null);
              openQuoteBuilder(invId, projId);
            }}
          />
        )}

        {emailTarget && (
          <EmailModal
            key="email"
            invoice={emailTarget}
            onClose={() => setEmailTarget(null)}
          />
        )}

        {showQB && qbInvId && (
          <QuoteBuilder
            key={qbInvId}
            invoiceId={qbInvId}
            projectId={qbProjId}
            onClose={() => setShowQB(false)}
            onSave={handleQBSave}
          />
        )}
      </AnimatePresence>

      {/* Downloading indicator */}
      {downloading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-xs text-white bg-[#1a1a1e] border border-white/[0.1] px-4 py-2.5 rounded-full shadow-xl">
          <Loader2 size={13} className="animate-spin text-yellow-400" />
          Generating PDF…
        </div>
      )}
    </div>
  );
}

// ─── Page (Suspense wrapper required for useSearchParams) ────────────────────

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsContent />
    </Suspense>
  );
}
