import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  let query = adminSupabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/contacts]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contacts: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, first_name, last_name, email, phone, source, notes } = body;

  if (!first_name?.trim()) {
    return NextResponse.json({ error: "first_name is required" }, { status: 422 });
  }
  if (!type || !["lead", "client", "contractor"].includes(type)) {
    return NextResponse.json({ error: "type must be lead, client, or contractor" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("contacts")
    .insert([{
      type,
      first_name: first_name.trim(),
      last_name:  (last_name ?? "").trim(),
      email:      (email ?? "").trim().toLowerCase() || null,
      phone:      (phone ?? "").trim() || null,
      source:     (source ?? "").trim() || null,
      notes:      (notes ?? "").trim() || null,
    }])
    .select("*")
    .single();

  if (error) {
    console.error("[POST /api/contacts]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: data }, { status: 201 });
}
