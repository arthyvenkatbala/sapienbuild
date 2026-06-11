"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, Users, CheckCircle,
  Building2, Phone, Mail, ExternalLink, Trash2, Globe,
} from "lucide-react";
import Link from "next/link";
import type { Client } from "@/lib/clients-types";

// ── Create Client Modal ────────────────────────────────────────────────────────
function CreateClientModal({
  onClose,
  onCreate,
}: { onClose: () => void; onCreate: (c: Client) => void }) {
  const [form, setForm] = useState({ business_name: "", owner_name: "", email: "", phone: "", website_url: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim()) { setError("Business name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create client"); return; }
      onCreate(data.client);
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/[0.22] transition-all";

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
          <h2 className="text-sm font-semibold text-white">New Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {[
            { key: "business_name", label: "Business Name *",       placeholder: "OTT Photography Studio" },
            { key: "owner_name",    label: "Owner / Contact Name",   placeholder: "Dilip Kumar" },
            { key: "email",         label: "Email",                  placeholder: "client@email.com" },
            { key: "phone",         label: "Phone",                  placeholder: "+91 98765 43210" },
            { key: "website_url",   label: "Website URL",            placeholder: "https://www.example.com" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
              <input
                className={inputCls}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

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
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-medium text-white transition-all"
            >
              {saving ? "Creating…" : "Create Client"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Client Card ────────────────────────────────────────────────────────────────
function ClientCard({ client, onDelete }: { client: Client; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete ${client.business_name}?`)) return;
    setDeleting(true);
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    onDelete(client.id);
  };

  const initials = (client.business_name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/clients/${client.id}`} className="block group">
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-all relative overflow-hidden">
        {/* Avatar + name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{client.business_name}</p>
              {client.owner_name && (
                <p className="text-[11px] text-zinc-500 mt-0.5">{client.owner_name}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete client"
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Contact */}
        <div className="space-y-1.5 mb-4">
          {client.email && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Mail size={11} />
              <span className="text-[11px] truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Phone size={11} />
              <span className="text-[11px]">{client.phone}</span>
            </div>
          )}
          {client.website_url && (
            <div className="flex items-center gap-2 text-zinc-500">
              <Globe size={11} />
              <span className="text-[11px] truncate">{client.website_url.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
        </div>

        {/* Platform badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {client.connected_platforms.includes("meta") ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400">
              <CheckCircle size={8} /> Meta
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border border-white/[0.06] text-zinc-600">
              Meta
            </span>
          )}

          {client.connected_platforms.includes("google") ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400">
              <CheckCircle size={8} /> Google
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border border-white/[0.06] text-zinc-600">
              Google
            </span>
          )}
        </div>

        {/* Last synced */}
        {client.last_synced_at && (
          <p className="text-[9px] text-zinc-700 mt-3">
            Synced {new Date(client.last_synced_at).toLocaleDateString()}
          </p>
        )}

        {/* Arrow hover */}
        <ExternalLink
          size={12}
          className="absolute bottom-5 right-5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all"
        />
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients]     = useState<Client[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search,  setSearch]      = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return !q
      || c.business_name.toLowerCase().includes(q)
      || c.owner_name.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q);
  });

  const handleCreate = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleDelete = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Clients</h1>
          <p className="text-xs text-zinc-500">{clients.length} client{clients.length !== 1 ? "s" : ""} · ad accounts &amp; platform connections</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> Add Client
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-[1600px] w-full mx-auto space-y-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#111114] border border-white/[0.05] rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Users size={32} className="mb-4 opacity-30" />
            <p className="text-sm font-medium text-zinc-500 mb-1">
              {search ? "No clients match your search" : "No clients yet"}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl transition-all font-medium"
              >
                <Plus size={14} /> Add your first client
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ClientCard client={client} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateClientModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>
    </div>
  );
}
