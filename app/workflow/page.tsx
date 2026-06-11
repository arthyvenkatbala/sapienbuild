"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, Calendar, User, GitBranch } from "lucide-react";
import Link from "next/link";

type WorkflowStage =
  | "enquiry"
  | "discussion"
  | "quote"
  | "negotiation"
  | "booked"
  | "execution"
  | "feedback"
  | "post_production"
  | "delivery";

const STAGES: { id: WorkflowStage; label: string; color: string }[] = [
  { id: "enquiry",        label: "Enquiry",         color: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400" },
  { id: "discussion",     label: "Discussion",      color: "bg-purple-500/20 border-purple-500/30 text-purple-400" },
  { id: "quote",          label: "Quote",           color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { id: "negotiation",    label: "Negotiation",     color: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { id: "booked",         label: "Booked",          color: "bg-teal-500/20 border-teal-500/30 text-teal-400" },
  { id: "execution",      label: "Execution",       color: "bg-blue-500/20 border-blue-500/30 text-blue-400" },
  { id: "feedback",       label: "Feedback",        color: "bg-pink-500/20 border-pink-500/30 text-pink-400" },
  { id: "post_production",label: "Post Production", color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" },
  { id: "delivery",       label: "Delivery",        color: "bg-green-500/20 border-green-500/30 text-green-400" },
];

interface Project {
  id: string;
  title: string;
  event_date: string | null;
  event_type: string | null;
  workflow_stage: WorkflowStage;
  contact: { id: string; first_name: string; last_name: string } | null;
}

function ProjectCard({
  project,
  isDragging = false,
}: {
  project: Project;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`bg-[#111114] border rounded-xl p-3 space-y-2 transition-all ${
        isDragging
          ? "border-orange-500/40 shadow-2xl shadow-orange-500/10 opacity-90 scale-105"
          : "border-white/[0.07] hover:border-white/[0.14]"
      }`}
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
            {new Date(project.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      )}
      {project.event_type && (
        <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-500 capitalize">
          {project.event_type}
        </span>
      )}
    </div>
  );
}

function DraggableCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { stage: project.workflow_stage },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ProjectCard project={project} />
    </div>
  );
}

function DroppableColumn({
  stage,
  projects,
}: {
  stage: (typeof STAGES)[number];
  projects: Project[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex-shrink-0 w-52">
      {/* Column header */}
      <div className={`flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg border ${stage.color}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</span>
        <span className="text-[10px] font-semibold opacity-60">{projects.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-[120px] rounded-xl p-2 space-y-2 transition-all border ${
          isOver
            ? "bg-orange-500/05 border-orange-500/20"
            : "bg-white/[0.01] border-white/[0.04]"
        }`}
      >
        {projects.map((p) => (
          <DraggableCard key={p.id} project={p} />
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

export default function WorkflowPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

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

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, workflow_stage: newStage } : p))
    );

    try {
      await fetch(`/api/projects/${projectId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ workflow_stage: newStage, from_stage: oldStage }),
      });
    } catch {
      // Roll back on error
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, workflow_stage: oldStage } : p))
      );
    }
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
    </div>
  );
}
