"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, FolderOpen, DollarSign, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStageLabel } from "@/lib/workflow";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalLeads:     number;
  activeProjects: number;
  revenue:        number;
  pendingDelivery:number;
}

interface ActivityEvent {
  id: string;
  from_stage: string | null;
  to_stage: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    workflow_stage: string;
    contact: { id: string; first_name: string; last_name: string } | null;
  } | null;
}

// ─── Stage badge colors for activity feed (per spec) ─────────────────────────

const ACTIVITY_STAGE_COLORS: Record<string, string> = {
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

function stageBadgeCls(stage: string): string {
  return ACTIVITY_STAGE_COLORS[stage] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

// ─── Realtime hook ────────────────────────────────────────────────────────────

function useRealtimeDashboard() {
  const toast = useToast();

  const [stats,    setStats]    = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const res  = await fetch("/api/dashboard");
      const data = await res.json();
      setStats({
        totalLeads:      data.totalLeads,
        activeProjects:  data.activeProjects,
        revenue:         data.revenue,
        pendingDelivery: data.pendingDelivery,
      });
      setActivity(data.activity ?? []);
    } catch (e) {
      console.error("[dashboard] fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("ott-dashboard")
      // contacts: inspect INSERT payload to detect Meta Ad leads
      .on<{ source: string | null }>(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          fetchAll();
          if (payload.eventType === "INSERT" && payload.new?.source === "meta_ads") {
            toast("New lead from Meta Ad");
          }
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" },        fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" },        fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "workflow_events" }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll, toast]);

  return { stats, activity, loading };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
  loading,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: string;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <ArrowRight size={13} className="text-zinc-700 group-hover:text-zinc-400 transition-colors mt-0.5" />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-white/[0.05] rounded-lg animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </Link>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { stats, activity, loading } = useRealtimeDashboard();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Overview</h1>
          <p className="text-xs text-zinc-500">One Thousand Tales · Studio Dashboard</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-[1400px] w-full mx-auto space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Leads"
            value={stats?.totalLeads ?? 0}
            icon={Users}
            color="bg-teal-500/20"
            href="/crm/leads"
            loading={loading}
          />
          <StatCard
            label="Active Projects"
            value={stats?.activeProjects ?? 0}
            icon={FolderOpen}
            color="bg-blue-500/20"
            href="/projects"
            loading={loading}
          />
          <StatCard
            label="Revenue This Month"
            value={stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "₹0"}
            icon={DollarSign}
            color="bg-green-500/20"
            href="/accounts"
            loading={loading}
          />
          <StatCard
            label="Pending Deliveries"
            value={stats?.pendingDelivery ?? 0}
            icon={Truck}
            color="bg-orange-500/20"
            href="/workflow"
            loading={loading}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Recent Workflow Activity</h2>
            <Link
              href="/workflow"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View kanban →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
              <FolderOpen size={28} className="mb-3 opacity-30" />
              <p className="text-sm text-zinc-500">No workflow events yet</p>
              <p className="text-xs mt-1 text-zinc-700">
                Move a project through the workflow to see activity here
              </p>
              <Link
                href="/projects"
                className="mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {activity.map((event, i) => {
                const project = event.project;
                const contact = project?.contact;
                const clientName = contact
                  ? `${contact.first_name} ${contact.last_name}`.trim()
                  : null;
                const currentStage = project?.workflow_stage ?? event.to_stage;

                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 py-3 ${
                      i < activity.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {project ? (
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm text-white hover:text-blue-300 transition-colors truncate block"
                        >
                          {project.title}
                          {clientName && (
                            <span className="text-zinc-500"> · {clientName}</span>
                          )}
                        </Link>
                      ) : (
                        <p className="text-sm text-white truncate">Unknown project</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${stageBadgeCls(currentStage)}`}
                        >
                          {getStageLabel(currentStage)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-600 shrink-0">
                      {timeAgo(event.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
