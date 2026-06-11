"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X, Users, Mail, Phone, Tag } from "lucide-react";

interface Contact {
  id: string;
  type: "lead" | "client" | "contractor";
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const SOURCE_OPTIONS = ["instagram", "referral", "website", "walk-in", "google", "other"];

function AddLeadModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: Contact) => void;
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    source: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address";
    if (form.phone && !/^[+\d\s\-()]{7,15}$/.test(form.phone))
      return "Enter a valid phone number";
    return "";
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "lead" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add lead"); return; }
      onAdd(data.contact);
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-teal-500/40 transition-all";

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
          <h2 className="text-sm font-semibold text-white">Add Lead</h2>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                First Name *
              </label>
              <input
                className={inputCls}
                placeholder="Arjun"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Last Name
              </label>
              <input
                className={inputCls}
                placeholder="Sharma"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>

          {[
            { key: "email", label: "Email", placeholder: "arjun@example.com", type: "email" },
            { key: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {label}
              </label>
              <input
                type={type}
                className={inputCls}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Source
            </label>
            <select
              className={inputCls}
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            >
              <option value="">Select source…</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
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
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-medium text-white transition-all"
            >
              {saving ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function LeadRow({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0">
        {(contact.first_name[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {contact.first_name} {contact.last_name}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {contact.email && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Mail size={10} /> {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Phone size={10} /> {contact.phone}
            </span>
          )}
        </div>
      </div>
      {contact.source && (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-zinc-500 shrink-0">
          <Tag size={9} />
          {contact.source}
        </span>
      )}
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
          contact.status === "active"
            ? "bg-green-500/15 text-green-400 border border-green-500/25"
            : "bg-zinc-500/15 text-zinc-500 border border-zinc-500/25"
        }`}
      >
        {contact.status}
      </span>
      <span className="text-[11px] text-zinc-600 shrink-0 hidden sm:block">
        {new Date(contact.created_at).toLocaleDateString("en-IN")}
      </span>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads]           = useState<Contact[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/contacts?type=lead");
      const data = await res.json();
      setLeads(data.contacts ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Leads</h1>
          <p className="text-xs text-zinc-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} · enquiries and prospects
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> Add Lead
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-4">
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Name</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-20">Source</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 w-16">Status</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 shrink-0 hidden sm:block w-20">Added</p>
          </div>

          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Users size={28} className="mb-3 opacity-30" />
              <p className="text-sm text-zinc-500">
                {search ? "No leads match your search" : "No leads yet"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 flex items-center gap-2 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all font-medium"
                >
                  <Plus size={12} /> Add your first lead
                </button>
              )}
            </div>
          ) : (
            filtered.map((c) => <LeadRow key={c.id} contact={c} />)
          )}
        </div>
      </main>

      <AnimatePresence>
        {showAdd && (
          <AddLeadModal
            onClose={() => setShowAdd(false)}
            onAdd={(c) => {
              setLeads((prev) => [c, ...prev]);
              setShowAdd(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
