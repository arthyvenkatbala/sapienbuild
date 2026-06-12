"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, IndianRupee, Clock,
  TrendingUp, TrendingDown, RefreshCw, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  totalLeads:        number;
  activeProjects:    number;
  revenue:           number;
  pendingDeliveries: number;
}

export interface DashboardTrends {
  leads:    { curr: number; prev: number };
  projects: { curr: number; prev: number };
  revenue:  { curr: number; prev: number };
}

function inrFormat(n: number): string {
  if (n >= 100000) {
    return "₹" + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + "L";
  }
  return "₹" + n.toLocaleString("en-IN");
}

function trendInfo(curr: number, prev: number): { pct: number; up: boolean } | null {
  if (curr === 0 && prev === 0) return null;
  if (prev === 0) return { pct: 100, up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

function TrendBadge({ curr, prev }: { curr: number; prev: number }) {
  const t = trendInfo(curr, prev);
  if (!t) return <span className="text-[10px] text-zinc-600">no data</span>;
  const Icon = t.up ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${t.up ? "text-green-400" : "text-red-400"}`}>
      <Icon size={10} />
      {t.pct}% vs last month
    </span>
  );
}

interface StatCardProps {
  label:   string;
  value:   string | number;
  icon:    typeof Users;
  iconBg:  string;
  href:    string;
  trend?:  React.ReactNode;
}

function StatCard({ label, value, icon: Icon, iconBg, href, trend }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.16] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={17} className="text-white" />
        </div>
        <ArrowRight size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors mt-1" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      {trend && <div className="mt-2">{trend}</div>}
    </Link>
  );
}

export default function StatsCards({
  stats,
  trends,
}: {
  stats:  DashboardStats;
  trends: DashboardTrends;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const refresh = () => startTransition(() => router.refresh());

    const channel = supabase
      .channel("dashboard-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" },        refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" },        refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" },        refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "workflow_events" }, refresh)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          onClick={() => startTransition(() => router.refresh())}
          disabled={isPending}
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-300 disabled:opacity-40 transition-colors"
        >
          <RefreshCw size={11} className={isPending ? "animate-spin" : ""} />
          {isPending ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          iconBg="bg-pink-500/20"
          href="/crm/leads"
          trend={<TrendBadge curr={trends.leads.curr} prev={trends.leads.prev} />}
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={Briefcase}
          iconBg="bg-violet-500/20"
          href="/projects"
          trend={<TrendBadge curr={trends.projects.curr} prev={trends.projects.prev} />}
        />
        <StatCard
          label="Revenue This Month"
          value={inrFormat(stats.revenue)}
          icon={IndianRupee}
          iconBg="bg-emerald-500/20"
          href="/accounts"
          trend={<TrendBadge curr={trends.revenue.curr} prev={trends.revenue.prev} />}
        />
        <StatCard
          label="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon={Clock}
          iconBg="bg-amber-500/20"
          href="/workflow"
        />
      </div>
    </div>
  );
}
