import { adminSupabase } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
import StatsCards, { type DashboardStats, type DashboardTrends } from "./StatsCards";
import ActivityFeed, { type ActivityEvent } from "./ActivityFeed";
import UpcomingEvents, { type UpcomingProject } from "./UpcomingEvents";
import QuickActions from "./QuickActions";

function getGreeting(): string {
  const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const h = nowIST.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday:  "long",
    day:      "numeric",
    month:    "long",
    year:     "numeric",
  });
}

export default async function DashboardPage() {
  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const todayStr       = now.toISOString().slice(0, 10);

  const [
    totalLeadsRes,
    currLeadsRes,
    prevLeadsRes,
    activeProjectsRes,
    currProjectsRes,
    prevProjectsRes,
    currRevenueRes,
    prevRevenueRes,
    pendingRes,
    activityRes,
    upcomingRes,
  ] = await Promise.allSettled([
    // ── Stats ──────────────────────────────────────────────────────────────────
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead"),
    // leads created this month (trend)
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead").gte("created_at", thisMonthStart),
    // leads created prev month (trend)
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead").gte("created_at", prevMonthStart).lt("created_at", thisMonthStart),
    // active projects (not in delivery stage)
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).neq("workflow_stage", "delivery"),
    // projects created this month (trend)
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
    // projects created prev month (trend)
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).gte("created_at", prevMonthStart).lt("created_at", thisMonthStart),
    // revenue paid this month
    adminSupabase.from("invoices").select("amount").eq("status", "paid").gte("updated_at", thisMonthStart),
    // revenue paid prev month
    adminSupabase.from("invoices").select("amount").eq("status", "paid").gte("updated_at", prevMonthStart).lt("updated_at", thisMonthStart),
    // pending deliveries = execution + post_production
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).in("workflow_stage", ["execution", "post_production"]),
    // ── Activity feed ──────────────────────────────────────────────────────────
    adminSupabase
      .from("workflow_events")
      .select(`
        id, from_stage, to_stage, created_at,
        project:projects(
          id, title, workflow_stage,
          contact:contacts(first_name, last_name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(15),
    // ── Upcoming events ────────────────────────────────────────────────────────
    adminSupabase
      .from("projects")
      .select(`id, title, event_date, event_type, workflow_stage, contact:contacts(first_name, last_name)`)
      .gte("event_date", todayStr)
      .not("event_date", "is", null)
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  // ── Compute stats ────────────────────────────────────────────────────────────
  const totalLeads     = totalLeadsRes.status === "fulfilled"     ? (totalLeadsRes.value.count     ?? 0) : 0;
  const activeProjects = activeProjectsRes.status === "fulfilled" ? (activeProjectsRes.value.count ?? 0) : 0;
  const pendingDeliveries = pendingRes.status === "fulfilled"     ? (pendingRes.value.count         ?? 0) : 0;

  const currRevItems = currRevenueRes.status === "fulfilled" ? (currRevenueRes.value.data ?? []) : [];
  const prevRevItems = prevRevenueRes.status === "fulfilled" ? (prevRevenueRes.value.data ?? []) : [];
  const currRevenue  = currRevItems.reduce((s, r) => s + Number((r as { amount?: unknown }).amount ?? 0), 0);
  const prevRevenue  = prevRevItems.reduce((s, r) => s + Number((r as { amount?: unknown }).amount ?? 0), 0);

  const stats: DashboardStats = {
    totalLeads,
    activeProjects,
    revenue:           currRevenue,
    pendingDeliveries,
  };

  const trends: DashboardTrends = {
    leads: {
      curr: currLeadsRes.status === "fulfilled"    ? (currLeadsRes.value.count    ?? 0) : 0,
      prev: prevLeadsRes.status === "fulfilled"    ? (prevLeadsRes.value.count    ?? 0) : 0,
    },
    projects: {
      curr: currProjectsRes.status === "fulfilled" ? (currProjectsRes.value.count ?? 0) : 0,
      prev: prevProjectsRes.status === "fulfilled" ? (prevProjectsRes.value.count ?? 0) : 0,
    },
    revenue: { curr: currRevenue, prev: prevRevenue },
  };

  const activity = (activityRes.status === "fulfilled" ? (activityRes.value.data ?? []) : []) as unknown as ActivityEvent[];
  const upcoming  = (upcomingRes.status  === "fulfilled" ? (upcomingRes.value.data  ?? []) : []) as unknown as UpcomingProject[];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Overview</h1>
          <p className="text-xs text-zinc-500">{getTodayLabel()}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-400 hidden sm:block">
            {getGreeting()},{" "}
            <span className="text-white font-medium">Dilip</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-6 md:px-8 py-8 max-w-[1400px] w-full mx-auto space-y-6">

        {/* Stats strip */}
        <StatsCards stats={stats} trends={trends} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: activity feed (2/3) */}
          <div className="lg:col-span-2">
            <ActivityFeed activity={activity} />
          </div>

          {/* Right: upcoming events + quick actions (1/3) */}
          <div className="space-y-6">
            <UpcomingEvents events={upcoming} />
            <QuickActions />
          </div>

        </div>
      </main>
    </div>
  );
}
