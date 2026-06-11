"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, DollarSign, User,
  Clock, FileText, CheckSquare, GitBranch,
} from "lucide-react";

type WorkflowStage =
  | "enquiry" | "discussion" | "quote" | "negotiation"
  | "booked" | "execution" | "feedback" | "post_production" | "delivery";

const STAGE_LABELS: Record<string, string> = {
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

const STAGE_COLORS: Record<string, string> = {
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

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  due_date: string | null;
}

interface WorkflowEvent {
  id: string;
  from_stage: string | null;
  to_stage: string;
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
  contact: { id: string; first_name: string; last_name: string; email: string | null; phone: string | null } | null;
  tasks: Task[];
  events: WorkflowEvent[];
  invoices: Invoice[];
}

const TASK_STATUS_COLORS: Record<Task["status"], string> = {
  todo:        "bg-zinc-500/20 text-zinc-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  review:      "bg-yellow-500/20 text-yellow-400",
  done:        "bg-green-500/20 text-green-400",
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft:     "bg-zinc-500/20 text-zinc-400",
  sent:      "bg-blue-500/20 text-blue-400",
  paid:      "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }                          = use(params);
  const [project, setProject]           = useState<Project | null>(null);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setProject(data.project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
          <div className="h-4 w-48 bg-white/[0.06] rounded animate-pulse" />
        </header>
        <main className="flex-1 px-8 py-8 max-w-4xl w-full mx-auto space-y-6">
          {[200, 160, 240].map((h, i) => (
            <div key={i} className="bg-[#111114] rounded-2xl animate-pulse" style={{ height: h }} />
          ))}
        </main>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-600">
        <p className="text-sm">Project not found</p>
        <Link href="/projects" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center gap-4">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/[0.14] px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft size={12} /> Projects
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{project.title}</h1>
          <span
            className={`inline-flex shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
              STAGE_COLORS[project.workflow_stage] ?? ""
            }`}
          >
            {STAGE_LABELS[project.workflow_stage] ?? project.workflow_stage}
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-4xl w-full mx-auto space-y-6">

        {/* Project Info */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Project Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.contact && (
              <div className="flex items-center gap-2.5 text-zinc-400">
                <User size={14} className="text-zinc-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Client</p>
                  <p className="text-sm text-white">
                    {project.contact.first_name} {project.contact.last_name}
                  </p>
                </div>
              </div>
            )}
            {project.event_date && (
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Calendar size={14} className="text-zinc-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Event Date</p>
                  <p className="text-sm text-white">
                    {new Date(project.event_date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-2.5 text-zinc-400">
                <MapPin size={14} className="text-zinc-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-white">{project.location}</p>
                </div>
              </div>
            )}
            {project.budget !== null && (
              <div className="flex items-center gap-2.5 text-zinc-400">
                <DollarSign size={14} className="text-zinc-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Budget</p>
                  <p className="text-sm text-white">
                    ₹{Number(project.budget).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            )}
          </div>
          {project.notes && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare size={14} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">
              Tasks ({project.tasks?.length ?? 0})
            </h2>
          </div>
          {!project.tasks?.length ? (
            <p className="text-xs text-zinc-600 py-4 text-center">No tasks yet for this project</p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]"
                >
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${TASK_STATUS_COLORS[task.status]}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <p className="flex-1 text-sm text-zinc-300 truncate">{task.title}</p>
                  {task.due_date && (
                    <span className="text-[10px] text-zinc-600 shrink-0">
                      {new Date(task.due_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Invoices */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-green-400" />
              <h2 className="text-sm font-semibold text-white">
                Invoices ({project.invoices?.length ?? 0})
              </h2>
            </div>
            <Link
              href="/accounts"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          {!project.invoices?.length ? (
            <p className="text-xs text-zinc-600 py-4 text-center">No invoices linked to this project</p>
          ) : (
            <div className="space-y-2">
              {project.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        INVOICE_STATUS_COLORS[inv.status] ?? "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="text-[10px] text-zinc-500 capitalize">{inv.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    ₹{Number(inv.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow History */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={14} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-white">
              Workflow History ({project.events?.length ?? 0})
            </h2>
          </div>
          {!project.events?.length ? (
            <p className="text-xs text-zinc-600 py-4 text-center">No stage changes recorded yet</p>
          ) : (
            <div className="space-y-0">
              {[...project.events]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((ev, i) => (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-3 py-2.5 ${
                      i < project.events.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <Clock size={11} className="text-zinc-600 shrink-0" />
                    <p className="flex-1 text-xs text-zinc-400">
                      {ev.from_stage
                        ? `${STAGE_LABELS[ev.from_stage] ?? ev.from_stage} → ${STAGE_LABELS[ev.to_stage] ?? ev.to_stage}`
                        : `Set to ${STAGE_LABELS[ev.to_stage] ?? ev.to_stage}`}
                    </p>
                    <span className="text-[10px] text-zinc-600 shrink-0">{timeAgo(ev.created_at)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
