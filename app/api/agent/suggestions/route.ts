import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const weekStart  = searchParams.get("week_start");
  const status     = searchParams.get("status");        // single status (legacy)
  const statusIn   = searchParams.get("status_in");     // comma-separated statuses
  const range      = searchParams.get("range") ?? "all";

  let query = adminSupabase
    .from("content_suggestions")
    .select("*")
    .order("week_start",   { ascending: false })
    .order("day_of_week",  { ascending: true })
    .order("content_type", { ascending: true });

  if (weekStart) query = query.eq("week_start", weekStart);

  if (statusIn) {
    // e.g. status_in=approved,edited
    const statuses = statusIn.split(",").map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      query = query.eq("status", statuses[0]);
    } else if (statuses.length > 1) {
      query = query.in("status", statuses);
    }
  } else if (status) {
    query = query.eq("status", status);
    // Range filter for history views
    if (range !== "all") {
      const now = new Date();
      if (range === "week") {
        const monday = new Date(now);
        const d = now.getDay();
        monday.setDate(now.getDate() - (d === 0 ? 6 : d - 1));
        monday.setHours(0, 0, 0, 0);
        query = query.gte("posted_at", monday.toISOString());
      } else if (range === "month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte("posted_at", start);
      }
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ suggestions: data });
}
