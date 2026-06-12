import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const todayStr       = now.toISOString().slice(0, 10);

  const [
    leadsRes, currLeadsRes, prevLeadsRes,
    activeRes, currProjectsRes, prevProjectsRes,
    currRevenueRes, prevRevenueRes,
    pendingRes,
    activityRes,
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
    // pending = execution + post_production (actively being worked on)
    adminSupabase.from("projects").select("id", { count: "exact", head: true }).in("workflow_stage", ["execution", "post_production"]),
    adminSupabase
      .from("workflow_events")
      .select(`id, from_stage, to_stage, created_at, project_id, project:projects(id, title, workflow_stage, contact:contacts(id, first_name, last_name))`)
      .order("created_at", { ascending: false })
      .limit(15),
    adminSupabase
      .from("projects")
      .select(`id, title, event_date, event_type, workflow_stage, contact:contacts(first_name, last_name)`)
      .gte("event_date", todayStr)
      .not("event_date", "is", null)
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  const totalLeads     = leadsRes.status === "fulfilled"   ? (leadsRes.value.count   ?? 0) : 0;
  const activeProjects = activeRes.status === "fulfilled"  ? (activeRes.value.count  ?? 0) : 0;
  const pendingDeliveries = pendingRes.status === "fulfilled" ? (pendingRes.value.count ?? 0) : 0;

  const currRevList = currRevenueRes.status === "fulfilled" ? (currRevenueRes.value.data ?? []) : [];
  const prevRevList = prevRevenueRes.status === "fulfilled" ? (prevRevenueRes.value.data ?? []) : [];
  const currRevenue = currRevList.reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const prevRevenue = prevRevList.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const trends = {
    leads:    { curr: currLeadsRes.status    === "fulfilled" ? (currLeadsRes.value.count    ?? 0) : 0, prev: prevLeadsRes.status    === "fulfilled" ? (prevLeadsRes.value.count    ?? 0) : 0 },
    projects: { curr: currProjectsRes.status === "fulfilled" ? (currProjectsRes.value.count ?? 0) : 0, prev: prevProjectsRes.status === "fulfilled" ? (prevProjectsRes.value.count ?? 0) : 0 },
    revenue:  { curr: currRevenue, prev: prevRevenue },
  };

  const activity = activityRes.status === "fulfilled" ? (activityRes.value.data ?? []) : [];
  const upcoming  = upcomingRes.status  === "fulfilled" ? (upcomingRes.value.data  ?? []) : [];

  return NextResponse.json({
    totalLeads, activeProjects, revenue: currRevenue, pendingDeliveries,
    trends, activity, upcoming,
  });
}
