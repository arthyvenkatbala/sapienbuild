import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { suggestion_id, restore } = body as {
    suggestion_id?: string;
    restore?:       boolean;
  };

  if (!suggestion_id) {
    return NextResponse.json({ error: "suggestion_id required" }, { status: 422 });
  }

  const newStatus = restore ? "pending" : "skipped";

  const { error } = await adminSupabase
    .from("content_suggestions")
    .update({ status: newStatus })
    .eq("id", suggestion_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, status: newStatus });
}
