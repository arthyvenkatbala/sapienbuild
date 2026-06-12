import { adminSupabase } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

import StatsCards, { type DashboardStats, type DashboardTrends } from "./StatsCards";
import ProjectStatusChart, { type StageData } from "./ProjectStatusChart";
import AssetChart, { type AssetCategoryData } from "./AssetChart";
import AccountsChart, { type InvoiceTypeData } from "./AccountsChart";
import UpcomingEvents, { type UpcomingProject } from "./UpcomingEvents";
import QuickActions from "./QuickActions";

const STAGE_ORDER = [
  "enquiry", "discussion", "quote", "negotiation",
  "booked", "execution", "feedback", "post_production", "delivery",
];

const INVOICE_TYPE_LABELS: Record<string, string> = {
  quote:   "Quotes",
  invoice: "Invoices",
  receipt: "Receipts",
};

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
    // ── Stats strip ──────────────────────────────────────────────────────────
    totalLeadsRes, currLeadsRes, prevLeadsRes,
    activeProjectsRes, currProjectsRes, prevProjectsRes,
    currRevenueRes, prevRevenueRes, pendingRes,
    // ── Charts ───────────────────────────────────────────────────────────────
    allProjectsRes,
    allAssetsRes,
    allInvoicesRes,
    // ── Upcoming events ───────────────────────────────────────────────────────
    upcomingRes,
  ] = await Promise.allSettled([
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead"),
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead").gte("created_at", thisMonthStart),
    adminSupabase.from("contacts").select("id", { count: "exact", head: true }).eq("type", "lead").gte("created_at", prevMonthStart).lt("created_at", thisMonthStart),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).neq("workflow_stage", "delivery"),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).gte("created_at", prevMonthStart).lt("created_at", thisMonthStart),
    adminSupabase.from("invoices").select("amount").eq("status", "paid").gte("updated_at", thisMonthStart),
    adminSupabase.from("invoices").select("amount").eq("status", "paid").gte("updated_at", prevMonthStart).lt("updated_at", thisMonthStart),
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).in("workflow_stage", ["execution", "post_production"]),
    // chart data
    adminSupabase.from("projects").select("workflow_stage"),
    adminSupabase.from("assets").select("category, purchase_value"),
    adminSupabase.from("invoices").select("type, status, amount"),
    // upcoming
    adminSupabase
      .from("projects")
      .select("id, title, event_date, event_type, workflow_stage, contact:contacts(first_name, last_name)")
      .gte("event_date", todayStr)
      .not("event_date", "is", null)
      .order("event_date", { ascending: true })
      .limit(6),
  ]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalLeads        = totalLeadsRes.status     === "fulfilled" ? (totalLeadsRes.value.count     ?? 0) : 0;
  const activeProjects    = activeProjectsRes.status === "fulfilled" ? (activeProjectsRes.value.count ?? 0) : 0;
  const pendingDeliveries = pendingRes.status        === "fulfilled" ? (pendingRes.value.count        ?? 0) : 0;

  const currRevItems = currRevenueRes.status === "fulfilled" ? (currRevenueRes.value.data ?? []) : [];
  const prevRevItems = prevRevenueRes.status === "fulfilled" ? (prevRevenueRes.value.data ?? []) : [];
  const currRevenue  = currRevItems.reduce((s, r) => s + Number((r as { amount?: unknown }).amount ?? 0), 0);
  const prevRevenue  = prevRevItems.reduce((s, r) => s + Number((r as { amount?: unknown }).amount ?? 0), 0);

  const stats: DashboardStats = { totalLeads, activeProjects, revenue: currRevenue, pendingDeliveries };

  const trends: DashboardTrends = {
    leads:    { curr: currLeadsRes.status    === "fulfilled" ? (currLeadsRes.value.count    ?? 0) : 0, prev: prevLeadsRes.status    === "fulfilled" ? (prevLeadsRes.value.count    ?? 0) : 0 },
    projects: { curr: currProjectsRes.status === "fulfilled" ? (currProjectsRes.value.count ?? 0) : 0, prev: prevProjectsRes.status === "fulfilled" ? (prevProjectsRes.value.count ?? 0) : 0 },
    revenue:  { curr: currRevenue, prev: prevRevenue },
  };

  // ── Project status chart ─────────────────────────────────────────────────────
  const allProjects = (allProjectsRes.status === "fulfilled" ? (allProjectsRes.value.data ?? []) : []) as Array<{ workflow_stage: string }>;
  const stageCounts: Record<string, number> = {};
  for (const p of allProjects) {
    const s = p.workflow_stage;
    stageCounts[s] = (stageCounts[s] ?? 0) + 1;
  }
  const stages: StageData[] = STAGE_ORDER.map((s) => ({ stage: s, count: stageCounts[s] ?? 0 }));

  // ── Asset chart ──────────────────────────────────────────────────────────────
  const allAssets = (allAssetsRes.status === "fulfilled" ? (allAssetsRes.value.data ?? []) : []) as Array<{ category: string | null; purchase_value: number | null }>;
  const assetMap: Record<string, { count: number; totalValue: number }> = {};
  for (const a of allAssets) {
    const cat = a.category?.trim() || "Other";
    assetMap[cat] ??= { count: 0, totalValue: 0 };
    assetMap[cat].count++;
    assetMap[cat].totalValue += a.purchase_value ?? 0;
  }
  const assetCategories: AssetCategoryData[] = Object.entries(assetMap)
    .map(([category, d]) => ({ category, ...d }))
    .sort((a, b) => b.count - a.count);
  const totalAssetValue = allAssets.reduce((s, a) => s + (a.purchase_value ?? 0), 0);

  // ── Accounts chart ───────────────────────────────────────────────────────────
  const allInvoices = (allInvoicesRes.status === "fulfilled" ? (allInvoicesRes.value.data ?? []) : []) as Array<{ type: string; status: string; amount: number | null }>;
  const invMap: Record<string, { count: number; value: number }> = {};
  for (const inv of allInvoices) {
    invMap[inv.type] ??= { count: 0, value: 0 };
    invMap[inv.type].count++;
    invMap[inv.type].value += inv.amount ?? 0;
  }
  const invoiceTypes: InvoiceTypeData[] = ["quote", "invoice", "receipt"].map((t) => ({
    type:  t,
    label: INVOICE_TYPE_LABELS[t] ?? t,
    count: invMap[t]?.count ?? 0,
    value: invMap[t]?.value ?? 0,
  }));
  const totalOutstanding = allInvoices
    .filter((inv) => inv.status !== "paid")
    .reduce((s, inv) => s + (inv.amount ?? 0), 0);

  // ── Upcoming events ──────────────────────────────────────────────────────────
  const upcoming = (upcomingRes.status === "fulfilled" ? (upcomingRes.value.data ?? []) : []) as unknown as UpcomingProject[];

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
            {getGreeting()}, <span className="text-white font-medium">Dilip</span>
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

        {/* Charts row — 3 equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ProjectStatusChart stages={stages} total={allProjects.length} />
          <AssetChart categories={assetCategories} totalValue={totalAssetValue} />
          <AccountsChart invoiceTypes={invoiceTypes} totalOutstanding={totalOutstanding} />
        </div>

        {/* Bottom row — Upcoming Events + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UpcomingEvents events={upcoming} />
          <QuickActions />
        </div>

      </main>
    </div>
  );
}
