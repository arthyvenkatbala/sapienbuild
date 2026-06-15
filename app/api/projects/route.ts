import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await adminSupabase
    .from("projects")
    .select(`
      id, title, event_date, event_type, workflow_stage,
      budget, location, notes, created_at, updated_at,
      contact:contacts ( id, first_name, last_name, email, phone ),
      team:project_team_assignments (
        id, team_member_id, role,
        member:contacts ( first_name, last_name )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, contact_id, event_date, event_type, budget, location, notes } = body as Record<string, string>;

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("projects")
    .insert([{
      title:          title.trim(),
      contact_id:     contact_id || null,
      event_date:     event_date || null,
      event_type:     event_type || null,
      budget:         budget ? Number(budget) : null,
      location:       location || null,
      notes:          notes || null,
      workflow_stage: "enquiry",
    }])
    .select(`
      id, title, event_date, event_type, workflow_stage,
      budget, location, notes, created_at, updated_at,
      contact:contacts ( id, first_name, last_name, email, phone )
    `)
    .single();

  if (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
