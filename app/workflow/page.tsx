"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Calendar, User, GitBranch, Users, X,
  Loader2, Trash2, UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkflowStage =
  | "enquiry" | "discussion" | "quote" | "negotiation" | "booked"
  | "execution" | "feedback" | "post_production" | "delivery";

interface TeamMemberLight {
  id:         string;
  first_name: string;
  last_name:  string;
  email:      string | null;
}

interface AssignmentLight {
  id:     string;
  member: TeamMemberLight | null;
  role:   string | null;
}

interface ProjectTeamRow {
  id:     string;
  member: { first_name: string; last_name: string } | null;
}

interface Project {
  id:             string;
  title:          string;
  event_date:     string | null;
  event_type:     string | null;
  workflow_stage: WorkflowStage;
  contact:        { id: string; first_name: string; last_name: string } | null;
  team:           ProjectTeamRow[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: { id: WorkflowStage; label: string; color: string }[] = [
  { id: "enquiry",         label: "Enquiry",         color: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400" },
  { id: "discussion",      label: "Discussion",      color: "bg-purple-500/20 border-purple-500/30 text-purple-400" },
  { id: "quote",           label: "Quote",           color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { id: "negotiation",     label: "Negotiation",     color: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { id: "booked",          label: "Booked",          color: "bg-teal-500/20 border-teal-500/30 text-teal-400" },
  { id: "execution",       label: "Execution",       color: "bg-blue-500/20 border-blue-500/30 text-blue-400" },
  { id: "feedback",        label: "Feedback",        color: "bg-pink-500/20 border-pink-500/30 text-pink-400" },
  { id: "post_production", label: "Post Production", color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" },
  { id: "delivery",        label: "Delivery",        color: "bg-green-500/20 border-green-500/30 text-green-400" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(m: { first_name: string; last_name?: string } | null): string {
  if (!m) return "?";
  return `${m.first_name.charAt(0)}${m.last_name?.charAt(0) ?? ""}`.toUpperCase();
}

// ─── Team Panel (slide-over) ──────────────────────────────────────────────────

function TeamPanel({
  project,
  onClose,
  onTeamChanged,
}: {
  project:       Project;
  onClose:       () => void;
  onTeamChanged: (projectId: string, team: ProjectTeamRow[]) => void;
}) {
  const [assignments,  setAssignments]  = useState<AssignmentLight[]>([]);
  const [contractors,  setContractors]  = useState<TeamMemberLight[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [adding,       setAdding]       = useState(false);
  const [selectedId,   setSelectedId]   = useState("");
  const [role,         setRole]         = useState("");
  const [saving,       setSaving]       = useState(false);
  const [removingId,   setRemovingId]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ar, cr] = await Promise.all([
        fetch(`/api/team-assignments?project_id=${project.id}`),
        fetch("/api/contacts?type=contractor"),
      ]);
      const [ad, cd] = await Promise.all([ar.json(), cr.json()]);
      setAssignments(ad.assignments ?? []);
      setContractors(cd.contacts ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [project.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const assignedIds = assignments.map((a) => a.member?.id ?? "").filter(Boolean);
  const available   = contractors.filter((c) => !assignedIds.includes(c.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/team-assignments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ project_id: project.id, team_member_id: selectedId, role: role || null }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = [...assignments, data.assignment as AssignmentLight];
        setAssignments(updated);
        onTeamChanged(project.id, updated.map((a) => ({
          id: a.id,
          member: a.member ? { first_name: a.member.first_name, last_name: a.member.last_name } : null,
        })));
        setSelectedId(""); setRole(""); setAdding(false);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await fetch(`/api/team-assignments/${id}`, { method: "DELETE" });
      const updated = assignments.filter((a) => a.id !== id);
      setAssignments(updated);
      onTeamChanged(project.id, updated.map((a) => ({
        id: a.id,
        member: a.member ? { first_name: a.member.first_name, last_name: a.member.last_name } : null,
      })));
    } catch (e) { console.error(e); }
    finally { setRemovingId(null); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="bg-[#111114] border-l border-white/[0.08] w-full max-w-xs flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-white">Team</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[180px]">{project.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-zinc-600 text-xs py-4">
              <Loader2 size={13} className="animate-spin" /> Loading…
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No team members assigned yet</p>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blue-300">{initials(a.member)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {a.member ? `${a.member.first_name} ${a.member.last_name}` : "Unknown"}
                  </p>
                  {a.role && <p className="text-[10px] text-zinc-600 truncate">{a.role}</p>}
                </div>
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={removingId === a.id}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
                >
                  {removingId === a.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />
                  }
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add member */}
        <div className="px-5 py-4 border-t border-white/[0.07] space-y-3">
          {adding ? (
            <>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500/40"
              >
                <option value="">Select contractor…</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
              <input
                className="w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/40"
                placeholder="Role (optional)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setAdding(false); setSelectedId(""); setRole(""); }}
                  className="flex-1 py-2 rounded-xl border border-white/[0.07] text-xs text-zinc-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !selectedId}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 size={11} className="animate-spin" /> : null}
                  Add
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setAdding(true)}
              disabled={available.length === 0 && !loading}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/[0.07] text-xs text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all disabled:opacity-40"
            >
              <UserPlus size={12} /> Add team member
            </button>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="block text-center text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Open full project →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  isDragging = false,
  onTeamClick,
}: {
  project:      Project;
  isDragging?:  boolean;
  onTeamClick?: () => void;
}) {
  const team = (project.team ?? []).slice(0, 3);

  return (
    <div
      className={`bg-[#111114] border rounded-xl p-3 transition-all ${
        isDragging
          ? "border-orange-500/40 shadow-2xl shadow-orange-500/10 opacity-90 scale-105"
          : "border-white/[0.07] hover:border-white/[0.14]"
      }`}
    >
      {/* Navigates to project detail */}
      <Link
        href={`/projects/${project.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="block space-y-2"
      >
        <p className="text-xs font-semibold text-white leading-tight truncate">{project.title}</p>
        {project.contact && (
          <div className="flex items-center gap-1 text-zinc-500">
            <User size={10} />
            <span className="text-[10px] truncate">
              {project.contact.first_name} {project.contact.last_name}
            </span>
          </div>
        )}
        {project.event_date && (
          <div className="flex items-center gap-1 text-zinc-500">
            <Calendar size={10} />
            <span className="text-[10px]">
              {new Date(project.event_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        )}
        {project.event_type && (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-500 capitalize">
            {project.event_type}
          </span>
        )}
      </Link>

      {/* Team footer — outside Link, stops pointer propagation so drag doesn't fire */}
      <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center -space-x-1.5">
          {team.length > 0
            ? team.map((t) => (
                <div
                  key={t.id}
                  title={t.member ? `${t.member.first_name} ${t.member.last_name}` : "?"}
                  className="w-5 h-5 rounded-full bg-blue-500/20 border border-[#111114] flex items-center justify-center"
                >
                  <span className="text-[7px] font-bold text-blue-300">{initials(t.member)}</span>
                </div>
              ))
            : <span className="text-[9px] text-zinc-700">No team</span>
          }
          {(project.team?.length ?? 0) > 3 && (
            <div className="w-5 h-5 rounded-full bg-zinc-700/50 border border-[#111114] flex items-center justify-center">
              <span className="text-[7px] text-zinc-400">+{(project.team?.length ?? 0) - 3}</span>
            </div>
          )}
        </div>
        {onTeamClick && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTeamClick(); }}
            className="flex items-center gap-1 text-[9px] text-zinc-600 hover:text-blue-400 transition-colors px-1 py-0.5 rounded"
          >
            <Users size={9} />
            {team.length > 0 ? "Edit" : "Assign"}
          </button>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  project,
  onTeamClick,
}: {
  project:     Project;
  onTeamClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:   project.id,
    data: { stage: project.workflow_stage },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity:   isDragging ? 0.4 : 1,
    cursor:    isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ProjectCard project={project} isDragging={isDragging} onTeamClick={onTeamClick} />
    </div>
  );
}

function DroppableColumn({
  stage,
  projects,
  onTeamClick,
}: {
  stage:       (typeof STAGES)[number];
  projects:    Project[];
  onTeamClick: (p: Project) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex-shrink-0 w-52">
      <div className={`flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg border ${stage.color}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</span>
        <span className="text-[10px] font-semibold opacity-60">{projects.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[120px] rounded-xl p-2 space-y-2 transition-all border ${
          isOver
            ? "bg-orange-500/05 border-orange-500/20"
            : "bg-white/[0.01] border-white/[0.04]"
        }`}
      >
        {projects.map((p) => (
          <DraggableCard key={p.id} project={p} onTeamClick={() => onTeamClick(p)} />
        ))}
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-14 text-zinc-700 text-[10px]">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [activeId,        setActiveId]        = useState<string | null>(null);
  const [teamProject,     setTeamProject]     = useState<Project | null>(null);
  const toast  = useToast();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const projectId = active.id as string;
    const newStage  = over.id as WorkflowStage;
    const project   = projects.find((p) => p.id === projectId);
    if (!project || project.workflow_stage === newStage) return;

    const oldStage = project.workflow_stage;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, workflow_stage: newStage } : p))
    );

    try {
      const res  = await fetch(`/api/projects/${projectId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ workflow_stage: newStage, from_stage: oldStage }),
      });
      const data = await res.json();
      if (data.message) toast(data.message);
      if (data.redirect_to) router.push(data.redirect_to);
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, workflow_stage: oldStage } : p))
      );
      toast("Failed to update stage — changes reverted", "error");
    }
  };

  const handleTeamChanged = (projectId: string, team: ProjectTeamRow[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, team } : p))
    );
    // Keep the panel's project reference in sync
    setTeamProject((prev) => prev && prev.id === projectId ? { ...prev, team } : prev);
  };

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Workflow</h1>
          <p className="text-xs text-zinc-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""} · drag to move between stages
          </p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-xs text-white bg-orange-600 hover:bg-orange-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> New Project
        </Link>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 overflow-x-auto">
        {loading ? (
          <div className="flex gap-4">
            {STAGES.map((s) => (
              <div
                key={s.id}
                className="flex-shrink-0 w-52 h-64 bg-[#111114] border border-white/[0.05] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <GitBranch size={32} className="mb-4 opacity-30" />
            <p className="text-sm text-zinc-500">No projects yet</p>
            <p className="text-xs mt-1 text-zinc-700">Create a project to start tracking workflow</p>
            <Link
              href="/projects"
              className="mt-4 flex items-center gap-2 text-xs text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl transition-all font-medium"
            >
              <Plus size={12} /> Create first project
            </Link>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 pb-4" style={{ minWidth: "max-content" }}>
              {STAGES.map((stage) => (
                <DroppableColumn
                  key={stage.id}
                  stage={stage}
                  projects={projects.filter((p) => p.workflow_stage === stage.id)}
                  onTeamClick={(p) => setTeamProject(p)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeProject && (
                <div className="w-52">
                  <ProjectCard project={activeProject} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Team slide-over panel */}
      <AnimatePresence>
        {teamProject && (
          <TeamPanel
            key={teamProject.id}
            project={teamProject}
            onClose={() => setTeamProject(null)}
            onTeamChanged={handleTeamChanged}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
