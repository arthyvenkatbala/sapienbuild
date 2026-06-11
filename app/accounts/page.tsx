"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Receipt, DollarSign, FileText, CheckCircle } from "lucide-react";

type InvoiceType = "quote" | "invoice" | "receipt";
type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

interface Invoice {
  id: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  project: { id: string; title: string } | null;
  contact: { id: string; first_name: string; last_name: string } | null;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Project {
  id: string;
  title: string;
}

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

function NewInvoiceModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    type: "invoice" as InvoiceType,
    contact_id: "",
    project_id: "",
    amount: "",
    due_date: "",
    notes: "",
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts?type=client").then((r) => r.json()),
      fetch("/api/contacts?type=lead").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([c1, c2, p]) => {
      setContacts([...(c1.contacts ?? []), ...(c2.contacts ?? [])]);
      setProjects(p.projects ?? []);
    }).catch(console.error);
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount))) {
      setError("Amount is required");
      return;
    }
    setSaving(true);
    try {
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

  const inputCls =
    "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all";

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
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

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

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Notes
            </label>
            <input
              className={inputCls}
              placeholder="50% advance payment…"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

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
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const TypeIcon =
    invoice.type === "invoice"
      ? FileText
      : invoice.type === "receipt"
      ? CheckCircle
      : DollarSign;

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
        <TypeIcon size={12} className="text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {invoice.contact
            ? `${invoice.contact.first_name} ${invoice.contact.last_name}`
            : "—"}
        </p>
        <p className="text-[11px] text-zinc-500 truncate">
          {invoice.project?.title ?? "No project linked"}
        </p>
      </div>
      <span className="text-[10px] text-zinc-500 hidden sm:block shrink-0">
        {invoice.due_date
          ? new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "—"}
      </span>
      <span
        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
          STATUS_COLORS[invoice.status]
        }`}
      >
        {invoice.status}
      </span>
      <span className="text-sm font-semibold text-white shrink-0 w-24 text-right">
        ₹{Number(invoice.amount).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export default function AccountsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<InvoiceType | "all">("all");
  const [showNew, setShowNew]   = useState(false);

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

  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.type === tab);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);

  const pending = invoices
    .filter((i) => i.status === "sent" || i.status === "draft")
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Accounts</h1>
          <p className="text-xs text-zinc-500">Quotes, invoices & receipts</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> New
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-5">

        {/* Summary cards */}
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
                tab === key
                  ? "bg-green-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
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
            <p className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Client / Project</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 hidden sm:block w-16">Due</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-16">Status</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-24 text-right">Amount</p>
          </div>

          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]" />
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
            filtered.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
          )}
        </div>
      </main>

      <AnimatePresence>
        {showNew && (
          <NewInvoiceModal
            onClose={() => setShowNew(false)}
            onAdd={(inv) => {
              setInvoices((prev) => [inv, ...prev]);
              setShowNew(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
