import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const weekStart = searchParams.get("week_start");
  const status    = searchParams.get("status");
  const range     = searchParams.get("range") ?? "all";

  let query = adminSupabase
    .from("content_suggestions")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("content_type",  { ascending: true });

  if (weekStart) query = query.eq("week_start", weekStart);

  if (status) {
    query = query.eq("status", status);
    // Range filter for history
    if (range !== "all") {
      const now = new Date();
      if (range === "week") {
        const monday = new Date(now);
        const d = now.getDay();
        monday.setDate(now.getDate() - (d === 0 ? 6 : d - 1));
        monday.setHours(0,0,0,0);
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
