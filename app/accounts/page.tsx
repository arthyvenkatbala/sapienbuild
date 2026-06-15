"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { QuoteBuilder } from "./QuoteBuilder";
import { ProjectPaymentsSection } from "./ProjectPaymentsSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceType = "quote" | "invoice" | "receipt";

interface Contact { id: string; first_name: string; last_name: string }
interface Project  { id: string; title: string }

// ─── New Document Modal ───────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-500/40 transition-all";

function NewDocumentModal({
  onClose,
  onAdd,
  onOpenQuoteBuilder,
}: {
  onClose:            () => void;
  onAdd:              () => void;
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
    ]).then(([c1, c2, p]) => {
      setContacts([...(c1.contacts ?? []), ...(c2.contacts ?? [])]);
      setProjects(p.projects ?? []);
    }).catch(console.error);
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (form.type === "quote") {
        const res  = await fetch("/api/invoices", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "quote", contact_id: form.contact_id || undefined, project_id: form.project_id || undefined, amount: "0" }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to create quote"); return; }
        onClose();
        onOpenQuoteBuilder(data.invoice.id, form.project_id || null);
        return;
      }
      if (!form.amount || isNaN(Number(form.amount))) { setError("Amount is required"); return; }
      const res  = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create"); return; }
      onAdd();
      onClose();
    } catch { setError("Network error"); }
    finally   { setSaving(false); }
  };

  const isQuote = form.type === "quote";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">New Document</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <form onSubmit={handle} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</label>
            <div className="flex gap-2">
              {(["quote", "invoice", "receipt"] as InvoiceType[]).map((t) => (
                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                    form.type === t ? "bg-green-500/20 border-green-500/40 text-green-400" : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14]"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Client</label>
            <select className={inputCls} value={form.contact_id} onChange={(e) => setForm((f) => ({ ...f, contact_id: e.target.value }))}>
              <option value="">Select client…</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Project</label>
            <select className={inputCls} value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          {!isQuote && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount (₹) *</label>
                  <input type="number" className={inputCls} placeholder="75000"
                    value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Due Date</label>
                  <input type="date" className={inputCls} value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Notes</label>
                <input className={inputCls} placeholder="50% advance…" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </>
          )}

          {isQuote && (
            <p className="text-xs text-zinc-500 bg-yellow-500/[0.06] border border-yellow-500/20 rounded-xl px-3 py-2.5">
              Quotes open the Quote Builder where you can add services, set prices, and generate a PDF.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-medium text-white transition-all flex items-center justify-center gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Creating…" : isQuote ? "Open Quote Builder →" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function AccountsContent() {
  const searchParams = useSearchParams();

  const [showNew,    setShowNew]    = useState(false);
  const [showQB,     setShowQB]     = useState(false);
  const [qbInvId,    setQbInvId]    = useState<string | null>(null);
  const [qbProjId,   setQbProjId]   = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const didInitParams = useRef(false);

  // Auto-open QuoteBuilder from URL params (e.g. from a Project page "New Quote" link)
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
    }
  }, [searchParams]);

  const openQuoteBuilder = (invoiceId: string, projectId: string | null) => {
    setQbInvId(invoiceId);
    setQbProjId(projectId);
    setShowQB(true);
  };

  const handleQBSave = () => {
    setShowQB(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Accounts</h1>
          <p className="text-xs text-zinc-500">Project payment tracker · quotes, invoices &amp; receipts</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-xl transition-all font-medium">
          <Plus size={12} /> New Document
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
        <ProjectPaymentsSection
          onEditQuote={openQuoteBuilder}
          refreshKey={refreshKey}
        />
      </main>

      <AnimatePresence>
        {showNew && (
          <NewDocumentModal
            key="new-doc"
            onClose={() => setShowNew(false)}
            onAdd={() => setRefreshKey((k) => k + 1)}
            onOpenQuoteBuilder={(invId, projId) => {
              setShowNew(false);
              openQuoteBuilder(invId, projId);
            }}
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
