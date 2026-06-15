import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const MEMBER_SELECT = `
  id, project_id, role, calendar_event_id, synced_at, created_at,
  member:contacts (
    id, first_name, last_name, email
  )
`;

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("project_id");
  if (!projectId) {
    return NextResponse.json({ error: "project_id required" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("project_team_assignments")
    .select(MEMBER_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /api/team-assignments]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { project_id, team_member_id, role } = body as Record<string, string>;
  if (!project_id || !team_member_id) {
    return NextResponse.json({ error: "project_id and team_member_id required" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("project_team_assignments")
    .insert([{ project_id, team_member_id, role: role || null }])
    .select(MEMBER_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Member already assigned to this project" }, { status: 409 });
    }
    console.error("[POST /api/team-assignments]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignment: data }, { status: 201 });
}
