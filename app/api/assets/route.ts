import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await adminSupabase
    .from("assets")
    .select("*")
    .order("category")
    .order("name");

  if (error) {
    console.error("[GET /api/assets]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assets: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    name, category, serial_number, purchase_date, purchase_value, condition, notes,
    last_service_date, service_interval_days, next_service_due, service_notes,
  } = body as Record<string, string>;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  }

  // Auto-compute next_service_due if not explicitly provided
  let computedNextDue = next_service_due || null;
  if (!computedNextDue && last_service_date && service_interval_days) {
    const base = new Date(last_service_date);
    base.setDate(base.getDate() + Number(service_interval_days));
    computedNextDue = base.toISOString().slice(0, 10);
  }

  const { data, error } = await adminSupabase
    .from("assets")
    .insert([{
      name:                  name.trim(),
      category:              category              || null,
      serial_number:         serial_number         || null,
      purchase_date:         purchase_date         || null,
      purchase_value:        purchase_value ? Number(purchase_value) : null,
      condition:             condition             || "good",
      notes:                 notes                 || null,
      last_service_date:     last_service_date     || null,
      service_interval_days: service_interval_days ? Number(service_interval_days) : null,
      next_service_due:      computedNextDue,
      service_notes:         service_notes         || null,
    }])
    .select("*")
    .single();

  if (error) {
    console.error("[POST /api/assets]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ asset: data }, { status: 201 });
}
