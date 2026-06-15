"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Search, X, Users, Mail, Phone, Briefcase,
  FolderOpen, ChevronDown, Loader2, Trash2,
} from "lucide-react";

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

interface Assignment {
  id: string;
  team_member_id: string;
  role: string | null;
  project: { id: string; title: string };
}

interface Project {
  id: string;
  title: string;
  event_type: string | null;
  event_date: string | null;
  workflow_stage: string | null;
  team: { id: string; team_member_id: string; role: string | null }[];
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function AddMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Contact) => void }) {
  const [form, setForm]   = useState({ first_name: "", last_name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setError("First name is required"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type: "contractor" }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add member"); return; }
      onAdd(data.contact);
    } catch { setError("Network error"); }
    finally   { setSaving(false); }
  };

  const inp = "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-teal-500/40 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Add Team Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <form onSubmit={handle} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">First Name *</label>
              <input className={inp} placeholder="Ravi" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Name</label>
              <input className={inp} placeholder="Kumar" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          {([["email", "Email", "ravi@example.com", "email"], ["phone", "Phone", "+91 98765 43210", "tel"], ["notes", "Role / Notes", "2nd shooter, editor…", "text"]] as const).map(([key, label, ph, type]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</label>
              <input type={type} className={inp} placeholder={ph} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-medium text-white transition-all">
              {saving ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Assign to Project Modal ──────────────────────────────────────────────────

function AssignModal({
  member,
  projects,
  currentAssignments,
  onClose,
  onAssigned,
  onRemoved,
}: {
  member: Contact;
  projects: Project[];
  currentAssignments: Assignment[];
  onClose: () => void;
  onAssigned: (a: Assignment) => void;
  onRemoved: (assignmentId: string) => void;
}) {
  const [search, setSearch]     = useState("");
  const [role, setRole]         = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [saving, setSaving]     = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError]       = useState("");

  const assignedProjectIds = new Set(currentAssignments.map((a) => a.project.id));

  const filtered = projects.filter((p) =>
    !assignedProjectIds.has(p.id) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  );

  const assign = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/team-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: selected.id, team_member_id: member.id, role: role.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to assign"); return; }
      onAssigned({ id: data.assignment.id, team_member_id: member.id, role: role.trim() || null, project: { id: selected.id, title: selected.title } });
      setSelected(null);
      setRole("");
      setSearch("");
    } catch { setError("Network error"); }
    finally   { setSaving(false); }
  };

  const remove = async (assignmentId: string) => {
    setRemoving(assignmentId);
    try {
      await fetch(`/api/team-assignments/${assignmentId}`, { method: "DELETE" });
      onRemoved(assignmentId);
    } finally { setRemoving(null); }
  };

  const inp = "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-teal-500/40 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-white">Assign to Project</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{member.first_name} {member.last_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"><X size={15} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current assignments */}
          {currentAssignments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current Projects</p>
              <div className="space-y-1.5">
                {currentAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen size={12} className="text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{a.project.title}</span>
                      {a.role && <span className="text-[10px] text-zinc-600 shrink-0">· {a.role}</span>}
                    </div>
                    <button onClick={() => remove(a.id)} disabled={removing === a.id}
                      className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors shrink-0 ml-2">
                      {removing === a.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to new project */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Add to Project</p>

            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
                className="w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/40 transition-all" />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">
                  {projects.length === 0 ? "No projects exist yet" : "No unassigned projects"}
                </p>
              ) : (
                filtered.map((p) => (
                  <button key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selected?.id === p.id
                        ? "bg-teal-500/15 border border-teal-500/30 text-teal-300"
                        : "bg-white/[0.03] border border-white/[0.05] text-zinc-300 hover:bg-white/[0.06]"
                    }`}>
                    <FolderOpen size={13} className="shrink-0 opacity-60" />
                    <span className="text-sm truncate flex-1">{p.title}</span>
                    {p.event_type && <span className="text-[10px] text-zinc-600 shrink-0">{p.event_type}</span>}
                  </button>
                ))
              )}
            </div>

            {selected && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Role on this project (optional)</label>
                <input className={inp} placeholder="e.g. Photographer, Editor, Videographer…" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">
                Close
              </button>
              <button onClick={assign} disabled={!selected || saving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-sm font-medium text-white transition-all flex items-center justify-center gap-2">
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers]                     = useState<Contact[]>([]);
  const [projects, setProjects]                   = useState<Project[]>([]);
  const [assignments, setAssignments]             = useState<Record<string, Assignment[]>>({});
  const [loading, setLoading]                     = useState(true);
  const [search, setSearch]                       = useState("");
  const [showAdd, setShowAdd]                     = useState(false);
  const [assignTarget, setAssignTarget]           = useState<Contact | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/contacts?type=contractor"),
        fetch("/api/projects"),
      ]);
      const [mData, pData] = await Promise.all([mRes.json(), pRes.json()]);
      const mems: Contact[]  = mData.contacts ?? [];
      const projs: Project[] = pData.projects ?? [];
      setMembers(mems);
      setProjects(projs);

      // Build member → assignments map from project team data
      const map: Record<string, Assignment[]> = {};
      for (const p of projs) {
        for (const t of (p.team ?? [])) {
          if (!t.team_member_id) continue;
          if (!map[t.team_member_id]) map[t.team_member_id] = [];
          map[t.team_member_id].push({ id: t.id, team_member_id: t.team_member_id, role: t.role, project: { id: p.id, title: p.title } });
        }
      }
      setAssignments(map);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return !q || `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q);
  });

  const handleAssigned = (memberId: string, a: Assignment) => {
    setAssignments((prev) => ({ ...prev, [memberId]: [...(prev[memberId] ?? []), a] }));
  };

  const handleRemoved = (memberId: string, assignmentId: string) => {
    setAssignments((prev) => ({ ...prev, [memberId]: (prev[memberId] ?? []).filter((a) => a.id !== assignmentId) }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Team</h1>
          <p className="text-xs text-zinc-500">
            {members.length} member{members.length !== 1 ? "s" : ""} · contractors & collaborators
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-1.5 rounded-xl transition-all font-medium">
          <Plus size={12} /> Add Member
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1200px] w-full mx-auto space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team…"
            className="w-full bg-[#111114] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-white/[0.18] transition-all" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"><X size={12} /></button>}
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-[#111114] border border-white/[0.06] rounded-2xl overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0">
                <div className="w-9 h-9 rounded-full bg-white/[0.05] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/[0.05] rounded animate-pulse w-36" />
                  <div className="h-2.5 bg-white/[0.05] rounded animate-pulse w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Users size={28} className="mb-3 opacity-30" />
            <p className="text-sm text-zinc-500">{search ? "No members match your search" : "No team members yet"}</p>
            {!search && (
              <button onClick={() => setShowAdd(true)} className="mt-4 flex items-center gap-2 text-xs text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all font-medium">
                <Plus size={12} /> Add first member
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#111114] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-9" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contact</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Projects</p>
              <div className="w-28" />
            </div>

            {filtered.map((m, idx) => {
              const memberAssignments = assignments[m.id] ?? [];
              const initial = (m.first_name[0] ?? "?").toUpperCase();
              const colors = ["bg-teal-500/15 text-teal-300", "bg-purple-500/15 text-purple-300", "bg-amber-500/15 text-amber-300", "bg-blue-500/15 text-blue-300", "bg-pink-500/15 text-pink-300"];
              const avatarColor = colors[m.first_name.charCodeAt(0) % colors.length];

              return (
                <div key={m.id} className={`grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 ${idx < filtered.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                    {initial}
                  </div>

                  {/* Name + role */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{m.first_name} {m.last_name}</p>
                    {m.notes && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Briefcase size={10} className="text-zinc-600 shrink-0" />
                        <span className="text-xs text-zinc-500 truncate">{m.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="min-w-0 space-y-0.5">
                    {m.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={10} className="text-zinc-600 shrink-0" />
                        <span className="text-xs text-zinc-500 truncate">{m.email}</span>
                      </div>
                    )}
                    {m.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} className="text-zinc-600 shrink-0" />
                        <span className="text-xs text-zinc-500">{m.phone}</span>
                      </div>
                    )}
                    {!m.email && !m.phone && <span className="text-xs text-zinc-700">—</span>}
                  </div>

                  {/* Projects */}
                  <div className="min-w-0 flex flex-wrap gap-1.5">
                    {memberAssignments.length === 0 ? (
                      <span className="text-xs text-zinc-700">Not assigned</span>
                    ) : (
                      memberAssignments.map((a) => (
                        <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 truncate max-w-[140px]" title={a.project.title}>
                          {a.project.title}{a.role ? ` · ${a.role}` : ""}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Actions */}
                  <button onClick={() => setAssignTarget(m)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-teal-400 border border-white/[0.07] hover:border-teal-500/30 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                    <FolderOpen size={11} /> Assign Project
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAdd && (
          <AddMemberModal
            onClose={() => setShowAdd(false)}
            onAdd={(c) => { setMembers((prev) => [c, ...prev]); setShowAdd(false); }}
          />
        )}
        {assignTarget && (
          <AssignModal
            member={assignTarget}
            projects={projects}
            currentAssignments={assignments[assignTarget.id] ?? []}
            onClose={() => setAssignTarget(null)}
            onAssigned={(a) => handleAssigned(assignTarget.id, a)}
            onRemoved={(id) => handleRemoved(assignTarget.id, id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
