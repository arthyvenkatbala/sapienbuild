import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  let body: { suggestion_id: string; restore?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { suggestion_id, restore } = body;
  if (!suggestion_id) {
    return NextResponse.json({ error: "suggestion_id required" }, { status: 422 });
  }

  if (restore) {
    const { error } = await adminSupabase
      .from("content_suggestions")
      .update({ status: "pending", rejected_at: null })
      .eq("id", suggestion_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending" });
  }

  // Reject — record rejected_at so the agent can exclude this asset in future runs
  const { error } = await adminSupabase
    .from("content_suggestions")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", suggestion_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: "rejected" });
}
