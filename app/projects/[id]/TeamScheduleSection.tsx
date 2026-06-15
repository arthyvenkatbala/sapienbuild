"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Plus, X, Loader2, CalendarCheck, CalendarOff,
  RefreshCw, Trash2, CheckCircle, AlertTriangle, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id:         string;
  first_name: string;
  last_name:  string;
  email:      string | null;
}

interface Assignment {
  id:                string;
  project_id:        string;
  role:              string | null;
  calendar_event_id: string | null;
  synced_at:         string | null;
  created_at:        string;
  member:            TeamMember | null;
}

type SyncStatus = "synced" | "unsynced" | "no_calendar";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(m: TeamMember | null): string {
  if (!m) return "?";
  return `${m.first_name.charAt(0)}${m.last_name?.charAt(0) ?? ""}`.toUpperCase();
}

function syncStatus(a: Assignment, calConnected: boolean): SyncStatus {
  if (!calConnected)       return "no_calendar";
  if (a.calendar_event_id) return "synced";
  return "unsynced";
}

const STATUS_UI: Record<SyncStatus, { cls: string; icon: React.ReactNode; label: string }> = {
  synced:      { cls: "text-green-400 bg-green-500/10 border-green-500/20",  icon: <CalendarCheck size={9} />, label: "Synced" },
  unsynced:    { cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",  icon: <Clock size={9} />,         label: "Not synced" },
  no_calendar: { cls: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",     icon: <CalendarOff size={9} />,   label: "No calendar" },
};

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/40 transition-all";

// ─── AddMemberModal ───────────────────────────────────────────────────────────

function AddMemberModal({
  projectId,
  existing,
  onClose,
  onAdded,
}: {
  projectId: string;
  existing:  string[];
  onClose:   () => void;
  onAdded:   (a: Assignment) => void;
}) {
  const [contractors, setContractors] = useState<TeamMember[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected,    setSelected]    = useState<string>("");
  const [role,        setRole]        = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    fetch("/api/contacts?type=contractor")
      .then((r) => r.json())
      .then((d) => setContractors((d.contacts ?? []) as TeamMember[]))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const available = contractors.filter((c) => !existing.includes(c.id));

  const handleAdd = async () => {
    if (!selected) { setError("Select a team member"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/team-assignments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ project_id: projectId, team_member_id: selected, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onAdded(data.assignment as Assignment);
    } catch { setError("Network error"); }
    finally  { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Add Team Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Team Member</label>
            {loadingList ? (
              <div className="flex items-center gap-2 text-xs text-zinc-600 py-2">
                <Loader2 size={12} className="animate-spin" /> Loading team…
              </div>
            ) : available.length === 0 ? (
              <p className="text-xs text-zinc-600 py-2">
                {contractors.length === 0
                  ? "No contractors in CRM yet. Add them via CRM → Team."
                  : "All contractors already assigned."}
              </p>
            ) : (
              <select className={inputCls} value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Select contractor…</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}{c.email ? ` — ${c.email}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Role / Responsibility</label>
            <input
              className={inputCls}
              placeholder="Lead photographer, 2nd shooter…"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !selected}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={12} className="animate-spin" /> Adding…</> : "Add Member"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function TeamScheduleSection({ projectId }: { projectId: string }) {
  const [assignments,   setAssignments]   = useState<Assignment[]>([]);
  const [calConnected,  setCalConnected]  = useState<boolean | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [showAdd,       setShowAdd]       = useState(false);
  const [syncing,       setSyncing]       = useState(false);
  const [syncResult,    setSyncResult]    = useState<string | null>(null);
  const [removingId,    setRemovingId]    = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignRes, calRes] = await Promise.all([
        fetch(`/api/team-assignments?project_id=${projectId}`),
        fetch("/api/calendar/status"),
      ]);
      const [ad, cd] = await Promise.all([assignRes.json(), calRes.json()]);
      setAssignments(ad.assignments ?? []);
      setCalConnected(cd.connected ?? false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await fetch(`/api/team-assignments/${id}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) { console.error(e); }
    finally { setRemovingId(null); }
  };

  const handleSync = async () => {
    setSyncing(true); setSyncResult(null);
    try {
      const res  = await fetch("/api/calendar/book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json() as { success: boolean; booked: number; reason?: string };
      if (data.success) {
        setSyncResult(`${data.booked} event(s) synced`);
        // Refresh assignments to get updated calendar_event_id + synced_at
        const r = await fetch(`/api/team-assignments?project_id=${projectId}`);
        const d = await r.json();
        setAssignments(d.assignments ?? []);
      } else {
        setSyncResult(data.reason ?? "Sync failed");
      }
    } catch { setSyncResult("Network error"); }
    finally { setSyncing(false); }
  };

  const existingIds = assignments.map((a) => a.member?.id ?? "").filter(Boolean);

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users size={14} className="text-zinc-500" />
          Team &amp; Schedule
        </h2>
        <div className="flex items-center gap-2">
          {calConnected && assignments.length > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.15] px-3 py-1.5 rounded-xl transition-all"
            >
              {syncing
                ? <><Loader2 size={11} className="animate-spin" /> Syncing…</>
                : <><RefreshCw size={11} /> Sync Calendar</>
              }
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl transition-all font-medium"
          >
            <Plus size={11} /> Add Member
          </button>
        </div>
      </div>

      {/* Calendar connection banner */}
      {calConnected === false && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-300 font-medium">Google Calendar not connected</p>
            <p className="text-[10px] text-amber-400/70 mt-0.5">
              Team members are assigned but events won&apos;t be created until you connect in Settings.
            </p>
          </div>
          <a
            href="/social/settings"
            className="shrink-0 text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Connect →
          </a>
        </div>
      )}

      {/* Sync result flash */}
      {syncResult && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <CheckCircle size={12} className="text-blue-400" />
          <span className="text-xs text-blue-300">{syncResult}</span>
          <button onClick={() => setSyncResult(null)} className="ml-auto text-blue-500 hover:text-blue-300">
            <X size={11} />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
          <Users size={24} className="mb-2 opacity-30" />
          <p className="text-xs text-zinc-500">No team members assigned</p>
          <p className="text-[10px] mt-1 text-zinc-700">Add team members to allocate them to this project</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => {
            const member = a.member;
            const status = syncStatus(a, calConnected === true);
            const badge  = STATUS_UI[status];
            const isRemoving = removingId === a.id;

            return (
              <div
                key={a.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blue-300">{initials(member)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {member ? `${member.first_name} ${member.last_name}` : "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.role && (
                      <span className="text-[10px] text-zinc-500">{a.role}</span>
                    )}
                    {member?.email && (
                      <span className="text-[10px] text-zinc-700 truncate">{member.email}</span>
                    )}
                  </div>
                </div>

                {/* Calendar sync badge */}
                <span className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                  {badge.icon} {badge.label}
                </span>

                {/* Synced timestamp */}
                {a.synced_at && (
                  <span className="shrink-0 text-[9px] text-zinc-700 hidden sm:block">
                    {new Date(a.synced_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}

                {/* Remove */}
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={isRemoving}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all disabled:opacity-50"
                >
                  {isRemoving
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAdd && (
          <AddMemberModal
            key="add"
            projectId={projectId}
            existing={existingIds}
            onClose={() => setShowAdd(false)}
            onAdded={(a) => { setAssignments((prev) => [...prev, a]); setShowAdd(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
