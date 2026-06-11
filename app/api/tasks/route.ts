import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { project_id, title, status = "todo", assigned_to, due_date, position } =
    body as Record<string, string>;

  if (!project_id) return NextResponse.json({ error: "project_id is required" }, { status: 422 });
  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 422 });

  const { data, error } = await adminSupabase
    .from("project_tasks")
    .insert([{
      project_id,
      title:       title.trim(),
      status:      status || "todo",
      assigned_to: assigned_to || null,
      due_date:    due_date || null,
      position:    position ? Number(position) : 0,
    }])
    .select("*")
    .single();

  if (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
