import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const FULL_SELECT = `
  id, type, status, amount, due_date, notes, line_items,
  invoice_number, client_name, event_dates, events_list, location,
  discount_type, discount_value, discount_note, pdf_data,
  created_at, updated_at,
  project:projects ( id, title, location, event_date, event_type ),
  contact:contacts ( id, first_name, last_name )
`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await adminSupabase
    .from("invoices")
    .select(FULL_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ invoice: data });
}

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

  const ALLOWED_SCALARS = [
    "status", "due_date", "notes",
    "client_name", "event_dates", "events_list", "location",
    "discount_type", "discount_note",
    "invoice_number", "pdf_data",
  ];
  const ALLOWED_NUMBERS = ["amount", "discount_value"];
  const ALLOWED_JSON    = ["line_items"];

  const update: Record<string, unknown> = {};

  for (const key of ALLOWED_SCALARS) {
    if (key in body) update[key] = body[key] === "" ? null : body[key];
  }
  for (const key of ALLOWED_NUMBERS) {
    if (key in body) update[key] = Number(body[key]) || 0;
  }
  for (const key of ALLOWED_JSON) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("invoices")
    .update(update)
    .eq("id", id)
    .select(FULL_SELECT)
    .single();

  if (error) {
    console.error("[PATCH /api/invoices/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}
