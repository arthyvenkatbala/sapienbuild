import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const allowed = ["status", "amount", "due_date", "notes"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      if (key === "amount") {
        update[key] = Number(body[key]);
      } else {
        update[key] = body[key] === "" ? null : body[key];
      }
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("invoices")
    .update(update)
    .eq("id", id)
    .select(`
      id, type, status, amount, due_date, notes, created_at, updated_at,
      project:projects ( id, title ),
      contact:contacts ( id, first_name, last_name )
    `)
    .single();

  if (error) {
    console.error("[PATCH /api/invoices/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}
