"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X, Users, Mail, Phone, Briefcase } from "lucide-react";

interface Contact {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

function AddMemberModal({
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
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setError("First name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "contractor" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add member"); return; }
      onAdd(data.contact);
      onClose();
    } catch {
      setError("Network error");
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
          <h2 className="text-sm font-semibold text-white">Add Team Member</h2>
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
                placeholder="Ravi"
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
                placeholder="Kumar"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>

          {[
            { key: "email", label: "Email",    placeholder: "ravi@example.com",    type: "email" },
            { key: "phone", label: "Phone",    placeholder: "+91 98765 43210",     type: "tel" },
            { key: "notes", label: "Role / Notes", placeholder: "2nd shooter, editor…", type: "text" },
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
              {saving ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/contacts?type=contractor");
      const data = await res.json();
      setMembers(data.contacts ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Team</h1>
          <p className="text-xs text-zinc-500">
            {members.length} member{members.length !== 1 ? "s" : ""} · contractors & collaborators
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> Add Member
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-4">
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team…"
            className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <X size={12} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#111114] border border-white/[0.05] rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Users size={28} className="mb-3 opacity-30" />
            <p className="text-sm text-zinc-500">
              {search ? "No members match your search" : "No team members yet"}
            </p>
            {!search && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 flex items-center gap-2 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all font-medium"
              >
                <Plus size={12} /> Add first member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-sm font-bold text-teal-300 shrink-0">
                    {(m.first_name[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {m.first_name} {m.last_name}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400">
                      Contractor
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {m.email && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Mail size={11} />
                      <span className="text-[11px] truncate">{m.email}</span>
                    </div>
                  )}
                  {m.phone && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Phone size={11} />
                      <span className="text-[11px]">{m.phone}</span>
                    </div>
                  )}
                  {m.notes && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Briefcase size={11} />
                      <span className="text-[11px] truncate">{m.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAdd && (
          <AddMemberModal
            onClose={() => setShowAdd(false)}
            onAdd={(c) => {
              setMembers((prev) => [c, ...prev]);
              setShowAdd(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
