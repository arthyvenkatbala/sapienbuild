import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await adminSupabase
    .from("projects")
    .select(`
      id, title, event_date, event_type, workflow_stage,
      budget, location, notes, created_at, updated_at,
      contact:contacts ( id, first_name, last_name, email, phone ),
      tasks:project_tasks ( * ),
      events:workflow_events ( * ),
      invoices ( id, type, status, amount, due_date )
    `)
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ project: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { workflow_stage, from_stage, ...rest } = body as Record<string, string>;

  const updateFields: Record<string, unknown> = { ...rest };
  if (workflow_stage) updateFields.workflow_stage = workflow_stage;

  const { data, error } = await adminSupabase
    .from("projects")
    .update(updateFields)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[PATCH /api/projects/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Record workflow event when stage changes
  if (workflow_stage && from_stage !== workflow_stage) {
    await adminSupabase.from("workflow_events").insert([{
      project_id: id,
      from_stage: from_stage ?? null,
      to_stage:   workflow_stage,
    }]);
  }

  return NextResponse.json({ project: data });
}
