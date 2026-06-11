import { adminSupabase } from "@/lib/supabase-admin";
import { Users, FolderOpen, DollarSign, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

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

async function getStats() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [leadsRes, activeRes, revenueRes, pendingRes] = await Promise.allSettled([
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead"),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).neq("workflow_stage", "delivery"),
    adminSupabase.from("invoices").select("amount").eq("status", "paid").gte("created_at", start),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).eq("workflow_stage", "delivery"),
  ]);

  const totalLeads       = leadsRes.status === "fulfilled"   ? (leadsRes.value.count ?? 0) : 0;
  const activeProjects   = activeRes.status === "fulfilled"  ? (activeRes.value.count ?? 0) : 0;
  const revenue          = revenueRes.status === "fulfilled" && !revenueRes.value.error
    ? (revenueRes.value.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
    : 0;
  const pendingDelivery  = pendingRes.status === "fulfilled" ? (pendingRes.value.count ?? 0) : 0;

  return { totalLeads, activeProjects, revenue, pendingDelivery };
}

async function getRecentActivity() {
  const { data, error } = await adminSupabase
    .from("workflow_events")
    .select(`
      id, from_stage, to_stage, created_at,
      project:projects ( id, title )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return [];
  return data ?? [];
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: string;
  href: string;
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
        <ArrowRight
          size={13}
          className="text-zinc-700 group-hover:text-zinc-400 transition-colors mt-0.5"
        />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
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

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

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
            value={stats.totalLeads}
            icon={Users}
            color="bg-teal-500/20"
            href="/crm/leads"
          />
          <StatCard
            label="Active Projects"
            value={stats.activeProjects}
            icon={FolderOpen}
            color="bg-blue-500/20"
            href="/projects"
          />
          <StatCard
            label="Revenue This Month"
            value={`₹${stats.revenue.toLocaleString("en-IN")}`}
            icon={DollarSign}
            color="bg-green-500/20"
            href="/accounts"
          />
          <StatCard
            label="Pending Deliveries"
            value={stats.pendingDelivery}
            icon={Truck}
            color="bg-orange-500/20"
            href="/workflow"
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

          {activity.length === 0 ? (
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
                const project = event.project as unknown as { id: string; title: string } | null;
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 py-3 ${
                      i < activity.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {project?.title ?? "Unknown project"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {event.from_stage
                          ? `${STAGE_LABELS[event.from_stage] ?? event.from_stage} → ${STAGE_LABELS[event.to_stage] ?? event.to_stage}`
                          : `Moved to ${STAGE_LABELS[event.to_stage] ?? event.to_stage}`}
                      </p>
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
