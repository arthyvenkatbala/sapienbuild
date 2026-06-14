import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await adminSupabase
    .from("invoice_events")
    .select("id, event_name, event_date, sort_order")
    .eq("invoice_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/invoices/:id/events]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

// PUT replaces all events for this invoice in one shot.
// Body: { events: Array<{ event_name: string; event_date?: string }> }
// Events are inserted in array order; sort_order = array index + 1.
// Returns the newly-inserted rows (with DB uuids).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { events?: Array<{ event_name: string; event_date?: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const incoming = Array.isArray(body.events) ? body.events : [];

  // Delete existing events for this invoice
  await adminSupabase.from("invoice_events").delete().eq("invoice_id", id);

  if (incoming.length === 0) {
    return NextResponse.json({ events: [] });
  }

  const rows = incoming.map((e, i) => ({
    invoice_id: id,
    event_name: e.event_name?.trim() || `Event ${i + 1}`,
    event_date: e.event_date?.trim() || null,
    sort_order: i + 1,
  }));

  const { data, error } = await adminSupabase
    .from("invoice_events")
    .insert(rows)
    .select("id, event_name, event_date, sort_order");

  if (error) {
    console.error("[PUT /api/invoices/:id/events]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}
