"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Search, X, FolderOpen, Calendar, User, ChevronRight,
} from "lucide-react";
import Link from "next/link";

type WorkflowStage =
  | "enquiry" | "discussion" | "quote" | "negotiation"
  | "booked" | "execution" | "feedback" | "post_production" | "delivery";

const STAGE_COLORS: Record<WorkflowStage, string> = {
  enquiry:        "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  discussion:     "bg-purple-500/20 text-purple-400 border-purple-500/30",
  quote:          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  negotiation:    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  booked:         "bg-teal-500/20 text-teal-400 border-teal-500/30",
  execution:      "bg-blue-500/20 text-blue-400 border-blue-500/30",
  feedback:       "bg-pink-500/20 text-pink-400 border-pink-500/30",
  post_production:"bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  delivery:       "bg-green-500/20 text-green-400 border-green-500/30",
};

const STAGE_LABELS: Record<WorkflowStage, string> = {
  enquiry:        "Enquiry",
  discussion:     "Discussion",
  quote:          "Quote",
  negotiation:    "Negotiation",
  booked:         "Booked",
  execution:      "Execution",
  feedback:       "Feedback",
  post_production:"Post Production",
  delivery:       "Delivery",
};

const EVENT_TYPES = ["wedding", "pre-wedding", "portrait", "event", "corporate", "other"];

interface Project {
  id: string;
  title: string;
  event_date: string | null;
  event_type: string | null;
  workflow_stage: WorkflowStage;
  budget: number | null;
  location: string | null;
  created_at: string;
  contact: { id: string; first_name: string; last_name: string; email: string | null } | null;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

function NewProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: Project) => void;
}) {
  const [form, setForm] = useState({
    title: "", contact_id: "", event_date: "", event_type: "", budget: "", location: "",
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetch("/api/contacts?type=lead")
      .then((r) => r.json())
      .then((d) => {
        fetch("/api/contacts?type=client")
          .then((r2) => r2.json())
          .then((d2) => setContacts([...(d.contacts ?? []), ...(d2.contacts ?? [])]));
      })
      .catch(console.error);
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Project title is required"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/projects", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create project"); return; }
      onAdd(data.project);
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/40 transition-all";

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
          <h2 className="text-sm font-semibold text-white">New Project</h2>
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Project Title *
            </label>
            <input
              className={inputCls}
              placeholder="Ananya & Rohan Wedding"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Client / Lead
            </label>
            <select
              className={inputCls}
              value={form.contact_id}
              onChange={(e) => setForm((f) => ({ ...f, contact_id: e.target.value }))}
            >
              <option value="">Select contact…</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Event Date
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Event Type
              </label>
              <select
                className={inputCls}
                value={form.event_type}
                onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
              >
                <option value="">Select type…</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Budget (₹)
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="150000"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Location
              </label>
              <input
                className={inputCls}
                placeholder="Chennai"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-all"
            >
              {saving ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [showNew,  setShowNew]    = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.contact ? `${p.contact.first_name} ${p.contact.last_name}`.toLowerCase().includes(q) : false) ||
      (p.location ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Projects</h1>
          <p className="text-xs text-zinc-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""} · all photography engagements
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> New Project
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-4">
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <p className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Project</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 w-24 shrink-0 hidden sm:block">Client</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 w-24 shrink-0 hidden md:block">Date</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 w-28 shrink-0">Stage</p>
            <div className="w-5 shrink-0" />
          </div>

          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.01] animate-pulse border-b border-white/[0.03]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <FolderOpen size={28} className="mb-3 opacity-30" />
              <p className="text-sm text-zinc-500">
                {search ? "No projects match your search" : "No projects yet"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowNew(true)}
                  className="mt-4 flex items-center gap-2 text-xs text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all font-medium"
                >
                  <Plus size={12} /> Create first project
                </button>
              )}
            </div>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{p.title}</p>
                  {p.event_type && (
                    <span className="text-[10px] text-zinc-600 capitalize">{p.event_type}</span>
                  )}
                </div>
                <div className="w-24 shrink-0 hidden sm:flex items-center gap-1.5 text-zinc-500">
                  <User size={11} />
                  <span className="text-[11px] truncate">
                    {p.contact
                      ? `${p.contact.first_name} ${p.contact.last_name}`
                      : "—"}
                  </span>
                </div>
                <div className="w-24 shrink-0 hidden md:flex items-center gap-1.5 text-zinc-500">
                  {p.event_date ? (
                    <>
                      <Calendar size={11} />
                      <span className="text-[11px]">
                        {new Date(p.event_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-zinc-700">—</span>
                  )}
                </div>
                <div className="w-28 shrink-0">
                  <span
                    className={`inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                      STAGE_COLORS[p.workflow_stage] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                    }`}
                  >
                    {STAGE_LABELS[p.workflow_stage] ?? p.workflow_stage}
                  </span>
                </div>
                <ChevronRight
                  size={13}
                  className="text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0"
                />
              </Link>
            ))
          )}
        </div>
      </main>

      <AnimatePresence>
        {showNew && (
          <NewProjectModal
            onClose={() => setShowNew(false)}
            onAdd={(p) => {
              setProjects((prev) => [p, ...prev]);
              setShowNew(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
