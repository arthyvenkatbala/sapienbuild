"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, Search, X, Users, Mail, Phone, ArrowRightCircle, ChevronRight,
  Calendar, Tag,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast";

// ─── Stage display ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  enquiry:         "Enquiry",
  discussion:      "Discussion",
  quote:           "Quote",
  negotiation:     "Negotiation",
  booked:          "Booked",
  execution:       "Execution",
  feedback:        "Feedback",
  post_production: "Post Production",
  delivery:        "Delivery",
};

const STAGE_COLORS: Record<string, string> = {
  enquiry:         "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  discussion:      "bg-purple-500/20 text-purple-400 border-purple-500/30",
  quote:           "bg-amber-500/20 text-amber-400 border-amber-500/30",
  negotiation:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  booked:          "bg-green-500/20 text-green-400 border-green-500/30",
  execution:       "bg-blue-500/20 text-blue-400 border-blue-500/30",
  feedback:        "bg-pink-500/20 text-pink-400 border-pink-500/30",
  post_production: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  delivery:        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

// ─── Source badge ─────────────────────────────────────────────────────────────

const SOURCE_BADGE: Record<string, { label: string; cls: string; icon?: string }> = {
  meta_ads:  { label: "Meta Ad",   cls: "bg-blue-500/20 border-blue-500/30 text-blue-300",   icon: "M" },
  instagram: { label: "Instagram", cls: "bg-pink-500/20 border-pink-500/30 text-pink-300",   icon: "IG" },
  referral:  { label: "Referral",  cls: "bg-green-500/20 border-green-500/30 text-green-300" },
  website:   { label: "Website",   cls: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400" },
  "walk-in": { label: "Walk-in",   cls: "bg-amber-500/20 border-amber-500/30 text-amber-300" },
  google:    { label: "Google",    cls: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300" },
  manual:    { label: "Manual",    cls: "bg-zinc-500/20 border-zinc-500/30 text-zinc-500" },
};

function SourceBadge({ source }: { source: string | null }) {
  if (!source) return <span className="text-zinc-700 text-[11px]">—</span>;
  const cfg = SOURCE_BADGE[source];
  if (!cfg) {
    return (
      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-zinc-500 shrink-0 capitalize">
        {source}
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.cls}`}>
      {cfg.icon && <span className="font-black leading-none">{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactProject {
  id: string;
  title: string;
  event_type: string | null;
  event_date: string | null;
  workflow_stage: string;
  created_at: string;
}

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
  projects?: ContactProject[];
}

function latestProject(contact: Contact): ContactProject | null {
  if (!contact.projects?.length) return null;
  return [...contact.projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

const SOURCE_OPTIONS = ["instagram", "referral", "website", "walk-in", "google", "other"];
const EVENT_TYPES    = ["Wedding", "Pre-Wedding", "Portrait", "Event"];

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-teal-500/40 transition-all";

// ─── Add Lead Modal ───────────────────────────────────────────────────────────

function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Contact) => void }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", source: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

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
      const res  = await fetch("/api/contacts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, type: "lead" }),
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

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handle} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">First Name *</label>
              <input className={inputCls} placeholder="Arjun" value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Name</label>
              <input className={inputCls} placeholder="Sharma" value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          {[
            { key: "email", label: "Email", placeholder: "arjun@example.com", type: "email" },
            { key: "phone", label: "Phone", placeholder: "+91 98765 43210",   type: "tel"   },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
              <input type={type} className={inputCls} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Source</label>
            <select className={inputCls} value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
              <option value="">Select source…</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-medium text-white transition-all">
              {saving ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Convert Lead Slide-Over ──────────────────────────────────────────────────

function ConvertLeadSlideOver({
  lead, onClose, onConverted,
}: { lead: Contact; onClose: () => void; onConverted: (leadId: string) => void }) {
  const router = useRouter();
  const toast  = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  const [clientForm, setClientForm] = useState({
    first_name: lead.first_name,
    last_name:  lead.last_name ?? "",
    email:      lead.email ?? "",
    phone:      lead.phone ?? "",
  });
  const [projectForm, setProjectForm] = useState({
    title: "", event_type: "", event_date: "", budget: "", location: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) { setError("Project title is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/crm/convert", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lead_id: lead.id, ...clientForm, ...projectForm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Conversion failed"); return; }
      toast("Lead converted. Project created in Workflow.");
      onConverted(lead.id);
      router.push("/workflow");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#111114] border-l border-white/[0.08] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Convert Lead</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{lead.first_name} {lead.last_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.05] shrink-0">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step === n ? "bg-teal-600 text-white" : step > n ? "bg-teal-600/40 text-teal-300" : "bg-white/[0.06] text-zinc-600"
              }`}>{n}</div>
              <span className={`text-xs ${step === n ? "text-zinc-200" : "text-zinc-600"}`}>
                {n === 1 ? "Client Details" : "Project Info"}
              </span>
              {n < 2 && <ChevronRight size={12} className="text-zinc-700" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">{error}</p>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">Confirm and edit the client details before creating the project.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">First Name</label>
                  <input className={inputCls} value={clientForm.first_name}
                    onChange={(e) => setClientForm((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Name</label>
                  <input className={inputCls} value={clientForm.last_name}
                    onChange={(e) => setClientForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Email</label>
                <input type="email" className={inputCls} value={clientForm.email}
                  onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Phone</label>
                <input type="tel" className={inputCls} value={clientForm.phone}
                  onChange={(e) => setClientForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          )}
          {step === 2 && (
            <form id="convert-form" onSubmit={handleConvert}>
              <div className="space-y-4">
                <p className="text-xs text-zinc-500">Create a project for this client. It will start in the Enquiry stage.</p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Project Title *</label>
                  <input className={inputCls} placeholder="Ananya & Rohan Wedding" value={projectForm.title}
                    onChange={(e) => setProjectForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Event Type</label>
                  <select className={inputCls} value={projectForm.event_type}
                    onChange={(e) => setProjectForm((f) => ({ ...f, event_type: e.target.value }))}>
                    <option value="">Select type…</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Event Date</label>
                    <input type="date" className={inputCls} value={projectForm.event_date}
                      onChange={(e) => setProjectForm((f) => ({ ...f, event_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Budget (₹)</label>
                    <input type="number" className={inputCls} placeholder="150000" value={projectForm.budget}
                      onChange={(e) => setProjectForm((f) => ({ ...f, budget: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Location</label>
                  <input className={inputCls} placeholder="Chennai" value={projectForm.location}
                    onChange={(e) => setProjectForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.07] shrink-0 flex gap-3">
          {step === 1 ? (
            <>
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">
                Cancel
              </button>
              <button type="button" onClick={() => { setError(""); setStep(2); }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-medium text-white transition-all">
                Next →
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { setError(""); setStep(1); }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">
                ← Back
              </button>
              <button type="submit" form="convert-form" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-medium text-white transition-all">
                {saving ? "Converting…" : "Convert Lead"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────

function LeadRow({ contact, onConvert }: { contact: Contact; onConvert: (c: Contact) => void }) {
  const proj = latestProject(contact);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0">
        {(contact.first_name[0] ?? "?").toUpperCase()}
      </div>

      {/* Name + contact */}
      <div className="w-44 min-w-0 shrink-0">
        <p className="text-sm text-white font-medium truncate">
          {contact.first_name} {contact.last_name}
        </p>
        <div className="flex flex-col gap-0.5 mt-0.5">
          {contact.email && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 truncate">
              <Mail size={9} /> {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Phone size={9} /> {contact.phone}
            </span>
          )}
        </div>
      </div>

      {/* Event type */}
      <div className="w-28 shrink-0 hidden md:flex items-center gap-1.5">
        {proj?.event_type ? (
          <span className="flex items-center gap-1 text-[11px] text-zinc-400 capitalize">
            <Tag size={10} className="text-zinc-600" />
            {proj.event_type}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-700">—</span>
        )}
      </div>

      {/* Event date */}
      <div className="w-28 shrink-0 hidden md:flex items-center gap-1.5">
        {proj?.event_date ? (
          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Calendar size={10} className="text-zinc-600" />
            {new Date(proj.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-700">—</span>
        )}
      </div>

      {/* Project stage */}
      <div className="w-28 shrink-0">
        {proj ? (
          <span className={`inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
            STAGE_COLORS[proj.workflow_stage] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
          }`}>
            {STAGE_LABELS[proj.workflow_stage] ?? proj.workflow_stage}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-700">No project</span>
        )}
      </div>

      {/* Source */}
      <div className="w-20 shrink-0 hidden sm:block">
        <SourceBadge source={contact.source} />
      </div>

      {/* Convert button */}
      <button
        onClick={() => onConvert(contact)}
        className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300 transition-all shrink-0"
        title="Convert to client"
      >
        <ArrowRightCircle size={11} />
        Convert
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads,      setLeads]      = useState<Contact[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [converting, setConverting] = useState<Contact | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/contacts?type=lead&with_project=true");
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
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="w-8 shrink-0" />
            <p className="w-44 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Name</p>
            <p className="w-28 shrink-0 hidden md:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Event</p>
            <p className="w-28 shrink-0 hidden md:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Date</p>
            <p className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Stage</p>
            <p className="w-20 shrink-0 hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Source</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Action</p>
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
            filtered.map((c) => (
              <LeadRow key={c.id} contact={c} onConvert={setConverting} />
            ))
          )}
        </div>
      </main>

      <AnimatePresence>
        {showAdd && (
          <AddLeadModal
            onClose={() => setShowAdd(false)}
            onAdd={(c) => { setLeads((prev) => [c, ...prev]); setShowAdd(false); }}
          />
        )}
        {converting && (
          <ConvertLeadSlideOver
            lead={converting}
            onClose={() => setConverting(null)}
            onConverted={(id) => {
              setLeads((prev) => prev.filter((l) => l.id !== id));
              setConverting(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
