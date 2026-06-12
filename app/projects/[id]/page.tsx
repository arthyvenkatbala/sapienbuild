"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, CheckCircle, ExternalLink,
  FileText, History, Plus, User, X,
} from "lucide-react";
import { STAGES, getStageColor, getStageLabel } from "@/lib/workflow";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus    = "todo" | "in_progress" | "review" | "done";
type WorkflowStage = (typeof STAGES)[number];

interface Task {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  position: number;
}

interface WorkflowEvent {
  id: string;
  from_stage: string | null;
  to_stage: string;
  notes: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  type: string;
  status: string;
  amount: number;
  due_date: string | null;
}

interface Project {
  id: string;
  title: string;
  event_date: string | null;
  event_type: string | null;
  workflow_stage: WorkflowStage;
  budget: number | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  tasks: Task[];
  events: WorkflowEvent[];
  invoices: Invoice[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: "todo",        label: "To Do",       dotColor: "bg-zinc-500" },
  { id: "in_progress", label: "In Progress", dotColor: "bg-blue-400" },
  { id: "review",      label: "Review",      dotColor: "bg-yellow-400" },
  { id: "done",        label: "Done",        dotColor: "bg-green-400" },
];

const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft:     "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  sent:      "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid:      "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const EVENT_TYPES = ["wedding", "pre-wedding", "portrait", "event", "corporate", "other"];

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500/40 transition-all";

// ─── Task Kanban ──────────────────────────────────────────────────────────────

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  return (
    <div
      className={`bg-[#0d0d10] border rounded-xl p-2.5 space-y-1 transition-all ${
        isDragging
          ? "border-blue-500/40 shadow-xl opacity-90 scale-105"
          : "border-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      <p className="text-xs text-white font-medium leading-tight">{task.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {task.assigned_to && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <User size={9} /> {task.assigned_to}
          </span>
        )}
        {task.due_date && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Calendar size={9} />
            {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity:   isDragging ? 0.4 : 1,
        cursor:    isDragging ? "grabbing" : "grab",
      }}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
    </div>
  );
}

function DroppableTaskColumn({
  column,
  tasks,
  onAddTask,
}: {
  column: (typeof TASK_COLUMNS)[number];
  tasks: Task[];
  onAddTask: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [adding,   setAdding]  = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const submitAdd = () => {
    const t = newTitle.trim();
    if (!t) { setAdding(false); return; }
    onAddTask(t);
    setNewTitle("");
    setAdding(false);
  };

  return (
    <div className="flex-1 min-w-[150px]">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${column.dotColor}`} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {column.label}
        </span>
        <span className="text-[10px] text-zinc-700 ml-auto">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[80px] rounded-xl p-2 space-y-2 transition-all border ${
          isOver
            ? "bg-blue-500/05 border-blue-500/20"
            : "bg-white/[0.01] border-white/[0.04]"
        }`}
      >
        {tasks.map((t) => <DraggableTask key={t.id} task={t} />)}

        {column.id === "todo" && (
          adding ? (
            <div className="space-y-1.5">
              <input
                autoFocus
                className="w-full bg-[#0a0a0d] border border-blue-500/30 rounded-lg px-2 py-1.5 text-xs text-zinc-100 outline-none"
                placeholder="Task title…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitAdd();
                  if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
                }}
              />
              <div className="flex gap-1">
                <button
                  onClick={submitAdd}
                  className="flex-1 py-1 rounded-lg bg-blue-600/70 text-[10px] text-white hover:bg-blue-600 transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAdding(false); setNewTitle(""); }}
                  className="px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-zinc-500 hover:text-white transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 w-full px-1 py-1 transition-colors"
            >
              <Plus size={10} /> Add task
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Inline editable field ────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<void>;
  type?: "text" | "date" | "number" | "select" | "textarea";
  options?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [saving,  setSaving]  = useState(false);

  const commit = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</label>
        {type === "select" && options ? (
          <select
            autoFocus
            className={inputCls}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
          >
            <option value="">—</option>
            {options.map((o) => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            autoFocus
            rows={3}
            className={inputCls + " resize-none"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
          />
        ) : (
          <input
            autoFocus
            type={type}
            className={inputCls}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        )}
        {saving && <p className="text-[10px] text-zinc-600">Saving…</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-left w-full group"
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</p>
      <p className={`text-sm mt-0.5 group-hover:text-white transition-colors ${
        value ? "text-zinc-200" : "text-zinc-600 italic"
      }`}>
        {label === "Budget (₹)" && value
          ? `₹${Number(value).toLocaleString("en-IN")}`
          : value || "—"}
      </p>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const router  = useRouter();
  const toast   = useToast();

  const [project,     setProject]     = useState<Project | null>(null);
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      setProject(data.project);
      setTasks(
        [...(data.project.tasks ?? [])].sort(
          (a: Task, b: Task) => a.position - b.position,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Stage change
  const handleStageChange = async (newStage: string) => {
    if (!project || newStage === project.workflow_stage) return;
    const oldStage = project.workflow_stage;
    setProject((p) => p ? { ...p, workflow_stage: newStage as WorkflowStage } : p);

    try {
      const res  = await fetch(`/api/projects/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ workflow_stage: newStage, from_stage: oldStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.message) toast(data.message);
      if (data.redirect_to) {
        router.push(data.redirect_to);
      } else {
        fetchProject(); // Re-fetch to load any auto-created tasks/invoices
      }
    } catch (err) {
      setProject((p) => p ? { ...p, workflow_stage: oldStage } : p);
      toast(err instanceof Error ? err.message : "Stage change failed", "error");
    }
  };

  // Field save
  const saveField = async (field: string, value: string) => {
    const payload: Record<string, unknown> = {
      [field]: field === "budget" ? (value ? Number(value) : null) : (value || null),
    };
    const res = await fetch(`/api/projects/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json();
      toast(d.error ?? "Save failed", "error");
      return;
    }
    setProject((p) =>
      p ? { ...p, [field]: field === "budget" ? (value ? Number(value) : null) : (value || null) } : p
    );
  };

  // Task drag-and-drop
  const handleTaskDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over) return;

    const taskId    = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task      = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const oldStatus = task.status;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
      );
      toast("Failed to update task", "error");
    }
  };

  // Add task
  const handleAddTask = async (title: string) => {
    try {
      const res  = await fetch("/api/tasks", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ project_id: id, title, status: "todo" }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to add task", "error"); return; }
      setTasks((prev) => [...prev, data.task]);
    } catch {
      toast("Network error", "error");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex-1 px-8 py-8 space-y-6">
        {[140, 320, 200, 160].map((h, i) => (
          <div
            key={i}
            className="bg-[#111114] border border-white/[0.05] rounded-2xl animate-pulse"
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-600">
        <p className="text-sm text-zinc-500 mb-3">Project not found</p>
        <button
          onClick={() => router.push("/projects")}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const events = [...(project.events ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/projects")}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{project.title}</h1>
          <p className="text-xs text-zinc-500">
            {project.contact
              ? `${project.contact.first_name} ${project.contact.last_name}`
              : "No client"}
            {project.event_type ? ` · ${project.event_type}` : ""}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getStageColor(project.workflow_stage)}`}>
          {getStageLabel(project.workflow_stage)}
        </span>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-6">

        {/* ── Section 1: Project Info ─────────────────────────────────────── */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Project Info</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-6">
            <EditableField
              label="Title"
              value={project.title}
              onSave={(v) => saveField("title", v)}
            />
            <EditableField
              label="Event Type"
              value={project.event_type ?? ""}
              type="select"
              options={EVENT_TYPES}
              onSave={(v) => saveField("event_type", v)}
            />
            <EditableField
              label="Event Date"
              value={project.event_date ?? ""}
              type="date"
              onSave={(v) => saveField("event_date", v)}
            />
            <EditableField
              label="Budget (₹)"
              value={project.budget != null ? String(project.budget) : ""}
              type="number"
              onSave={(v) => saveField("budget", v)}
            />
            <EditableField
              label="Location"
              value={project.location ?? ""}
              onSave={(v) => saveField("location", v)}
            />
            <EditableField
              label="Notes"
              value={project.notes ?? ""}
              type="textarea"
              onSave={(v) => saveField("notes", v)}
            />
          </div>

          {/* Stage selector */}
          <div className="pt-4 border-t border-white/[0.05]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">
              Change Stage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    project.workflow_stage === s
                      ? getStageColor(s)
                      : "border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.12]"
                  }`}
                >
                  {getStageLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Tasks Kanban ─────────────────────────────────────── */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <CheckCircle size={14} className="text-zinc-500" />
            Tasks
            <span className="text-zinc-600 font-normal text-xs">({tasks.length})</span>
          </h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleTaskDragStart}
            onDragEnd={handleTaskDragEnd}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TASK_COLUMNS.map((col) => (
                <DroppableTaskColumn
                  key={col.id}
                  column={col}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  onAddTask={handleAddTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask && <div className="w-48"><TaskCard task={activeTask} isDragging /></div>}
            </DragOverlay>
          </DndContext>
        </div>

        {/* ── Sections 3 & 4 ──────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Section 3: Workflow History */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <History size={14} className="text-zinc-500" />
              Workflow History
            </h2>
            {events.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No events yet</p>
            ) : (
              <div className="space-y-0">
                {events.map((ev, i) => (
                  <div
                    key={ev.id}
                    className={`flex items-start gap-3 py-2.5 ${
                      i < events.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300">
                        {ev.from_stage
                          ? `${getStageLabel(ev.from_stage)} → ${getStageLabel(ev.to_stage)}`
                          : `Set to ${getStageLabel(ev.to_stage)}`}
                      </p>
                      {ev.notes && (
                        <p className="text-[10px] text-zinc-600 mt-0.5">{ev.notes}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-700 shrink-0">
                      {new Date(ev.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Linked Invoices */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={14} className="text-zinc-500" />
                Invoices &amp; Quotes
              </h2>
              <Link
                href="/accounts"
                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Open in Accounts <ExternalLink size={10} className="ml-0.5" />
              </Link>
            </div>

            {project.invoices.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No invoices linked</p>
            ) : (
              <div className="space-y-2">
                {project.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 capitalize">{inv.type}</p>
                      {inv.due_date && (
                        <p className="text-[10px] text-zinc-600">
                          Due{" "}
                          {new Date(inv.due_date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short",
                          })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                        INVOICE_STATUS_COLORS[inv.status] ??
                        "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="text-sm font-semibold text-white shrink-0">
                      ₹{Number(inv.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
