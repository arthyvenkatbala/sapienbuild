import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    lead_id,
    first_name,
    last_name,
    email,
    phone,
    title,
    event_type,
    event_date,
    budget,
    location,
  } = body as Record<string, string>;

  if (!lead_id) return NextResponse.json({ error: "lead_id is required" }, { status: 422 });
  if (!title?.trim()) return NextResponse.json({ error: "project title is required" }, { status: 422 });

  // 1. Convert contact to client
  const { error: contactError } = await adminSupabase
    .from("contacts")
    .update({
      type:       "client",
      first_name: first_name?.trim() || undefined,
      last_name:  last_name?.trim() || undefined,
      email:      email?.trim() || undefined,
      phone:      phone?.trim() || undefined,
    })
    .eq("id", lead_id);

  if (contactError) {
    console.error("[convert] contact update:", contactError);
    return NextResponse.json({ error: contactError.message }, { status: 500 });
  }

  // 2. Create project in enquiry stage
  const { data: project, error: projectError } = await adminSupabase
    .from("projects")
    .insert([{
      contact_id:     lead_id,
      title:          title.trim(),
      event_type:     event_type || null,
      event_date:     event_date || null,
      budget:         budget ? Number(budget) : null,
      location:       location?.trim() || null,
      workflow_stage: "enquiry",
    }])
    .select("id, title")
    .single();

  if (projectError) {
    console.error("[convert] project insert:", projectError);
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  // 3. Log initial workflow event
  await adminSupabase.from("workflow_events").insert([{
    project_id: project.id,
    from_stage:  null,
    to_stage:    "enquiry",
    notes:       "Project created from lead",
  }]);

  return NextResponse.json({ project }, { status: 201 });
}
