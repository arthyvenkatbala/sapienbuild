import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { suggestion_id, approve_all, week_start } = body as {
    suggestion_id?: string;
    approve_all?:   boolean;
    week_start?:    string;
  };

  if (approve_all && week_start) {
    const { data, error } = await adminSupabase
      .from("content_suggestions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("week_start", week_start)
      .eq("status", "pending")
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, updated: data?.length ?? 0 });
  }

  if (!suggestion_id) {
    return NextResponse.json({ error: "suggestion_id required" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("content_suggestions")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", suggestion_id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, updated: data ? 1 : 0 });
}
