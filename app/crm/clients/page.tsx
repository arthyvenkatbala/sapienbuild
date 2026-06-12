"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, Users, Mail, Phone, Calendar, Tag, FolderOpen } from "lucide-react";
import Link from "next/link";

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

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  meta_ads:  { label: "Meta Ad",   cls: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
  instagram: { label: "Instagram", cls: "bg-pink-500/20 border-pink-500/30 text-pink-300" },
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
    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.cls}`}>
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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  projects?: ContactProject[];
}

function latestProject(client: Client): ContactProject | null {
  if (!client.projects?.length) return null;
  return [...client.projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

// ─── Client Row ───────────────────────────────────────────────────────────────

function ClientRow({ client }: { client: Client }) {
  const proj = latestProject(client);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
        {(client.first_name[0] ?? "?").toUpperCase()}
      </div>

      {/* Name + contact */}
      <div className="w-44 min-w-0 shrink-0">
        <p className="text-sm text-white font-medium truncate">
          {client.first_name} {client.last_name}
        </p>
        <div className="flex flex-col gap-0.5 mt-0.5">
          {client.email && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 truncate">
              <Mail size={9} /> {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Phone size={9} /> {client.phone}
            </span>
          )}
        </div>
      </div>

      {/* Project title */}
      <div className="flex-1 min-w-0 hidden lg:block">
        {proj ? (
          <Link href={`/workflow/${proj.id}`} className="text-[11px] text-zinc-400 hover:text-teal-300 transition-colors truncate block">
            <FolderOpen size={10} className="inline mr-1 text-zinc-600" />
            {proj.title}
          </Link>
        ) : (
          <span className="text-[11px] text-zinc-700">—</span>
        )}
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
        <SourceBadge source={client.source} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrmClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/contacts?type=client&with_project=true");
      const data = await res.json();
      setClients(data.contacts ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter((c) => {
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
          <h1 className="text-base font-semibold text-white">Clients</h1>
          <p className="text-xs text-zinc-500">
            {clients.length} client{clients.length !== 1 ? "s" : ""} · photography clients
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-4">
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

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="w-8 shrink-0" />
            <p className="w-44 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Name</p>
            <p className="flex-1 hidden lg:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Project</p>
            <p className="w-28 shrink-0 hidden md:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Event</p>
            <p className="w-28 shrink-0 hidden md:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Date</p>
            <p className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Stage</p>
            <p className="w-20 shrink-0 hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Source</p>
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
                {search ? "No clients match your search" : "No clients yet"}
              </p>
              {!search && (
                <p className="text-xs text-zinc-700 mt-2">
                  Clients appear here automatically when a quote is marked as sent.
                </p>
              )}
            </div>
          ) : (
            filtered.map((c) => <ClientRow key={c.id} client={c} />)
          )}
        </div>
      </main>
    </div>
  );
}
