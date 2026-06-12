import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { moveProjectToStage } from "@/lib/workflow";

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

  // Handle non-stage field updates first
  if (Object.keys(rest).length > 0) {
    const { error } = await adminSupabase
      .from("projects")
      .update(rest)
      .eq("id", id);

    if (error) {
      console.error("[PATCH /api/projects/:id] field update:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Handle stage transition via single source of truth
  if (workflow_stage && workflow_stage !== from_stage) {
    try {
      const { message, redirect_to } = await moveProjectToStage(
        adminSupabase,
        id,
        from_stage ?? null,
        workflow_stage,
        null,
      );

      const { data } = await adminSupabase
        .from("projects")
        .select(`
          id, title, event_date, event_type, workflow_stage,
          budget, location, notes, created_at, updated_at,
          contact:contacts ( id, first_name, last_name, email, phone )
        `)
        .eq("id", id)
        .single();

      return NextResponse.json({ project: data, message, redirect_to });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Stage update failed";
      console.error("[PATCH /api/projects/:id] stage move:", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const { data } = await adminSupabase
    .from("projects")
    .select(`
      id, title, event_date, event_type, workflow_stage,
      budget, location, notes, created_at, updated_at,
      contact:contacts ( id, first_name, last_name, email, phone )
    `)
    .eq("id", id)
    .single();

  return NextResponse.json({ project: data });
}
