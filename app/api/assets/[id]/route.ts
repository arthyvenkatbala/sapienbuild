import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

// Compute next_service_due from a base date + interval
function calcNextDue(baseDate: string, intervalDays: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().slice(0, 10);
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

  // Special action: log a completed service
  if (body.action === "log_service") {
    const today = new Date().toISOString().slice(0, 10);

    // Fetch current interval to calculate next due
    const { data: current } = await adminSupabase
      .from("assets")
      .select("service_interval_days")
      .eq("id", id)
      .single();

    const interval = current?.service_interval_days as number | null;
    const nextDue  = interval ? calcNextDue(today, interval) : null;

    const { data, error } = await adminSupabase
      .from("assets")
      .update({ last_service_date: today, next_service_due: nextDue })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[PATCH /api/assets/:id log_service]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ asset: data });
  }

  // General update — pick only the fields we allow to be changed
  const allowed: Record<string, unknown> = {};

  const fields = [
    "name", "category", "serial_number", "purchase_date",
    "purchase_value", "condition", "notes",
    "last_service_date", "service_interval_days", "service_notes",
  ] as const;

  for (const f of fields) {
    if (f in body) allowed[f] = body[f] === "" ? null : body[f];
  }

  // Auto-compute next_service_due when relevant fields change
  if ("next_service_due" in body) {
    allowed["next_service_due"] = body["next_service_due"] || null;
  } else {
    // Recalculate from last_service_date + interval if either is provided
    const base     = (allowed["last_service_date"]     ?? null) as string | null;
    const interval = (allowed["service_interval_days"] ?? null) as number | null;
    if (base && interval) {
      allowed["next_service_due"] = calcNextDue(base, interval);
    }
  }

  const { data, error } = await adminSupabase
    .from("assets")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[PATCH /api/assets/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ asset: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await adminSupabase.from("assets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
