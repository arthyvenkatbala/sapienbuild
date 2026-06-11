import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [leadsRes, activeRes, revenueRes, pendingRes, activityRes] =
    await Promise.allSettled([
      adminSupabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("type", "lead"),
      adminSupabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .neq("workflow_stage", "delivery"),
      adminSupabase
        .from("invoices")
        .select("amount")
        .eq("status", "paid")
        .gte("created_at", start),
      adminSupabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("workflow_stage", "delivery"),
      adminSupabase
        .from("workflow_events")
        .select(`
          id, from_stage, to_stage, created_at,
          project:projects ( id, title )
        `)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalLeads =
    leadsRes.status === "fulfilled" ? (leadsRes.value.count ?? 0) : 0;

  const activeProjects =
    activeRes.status === "fulfilled" ? (activeRes.value.count ?? 0) : 0;

  const revenue =
    revenueRes.status === "fulfilled" && !revenueRes.value.error
      ? (revenueRes.value.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0)
      : 0;

  const pendingDelivery =
    pendingRes.status === "fulfilled" ? (pendingRes.value.count ?? 0) : 0;

  const activity =
    activityRes.status === "fulfilled" ? (activityRes.value.data ?? []) : [];

  return NextResponse.json({ totalLeads, activeProjects, revenue, pendingDelivery, activity });
}
