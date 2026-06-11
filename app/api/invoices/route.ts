import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  let query = adminSupabase
    .from("invoices")
    .select(`
      id, type, status, amount, due_date, notes, line_items, created_at, updated_at,
      project:projects ( id, title ),
      contact:contacts ( id, first_name, last_name )
    `)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/invoices]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, contact_id, project_id, amount, due_date, notes, line_items } =
    body as Record<string, string>;

  if (!type || !["quote", "invoice", "receipt"].includes(type)) {
    return NextResponse.json({ error: "type must be quote, invoice, or receipt" }, { status: 422 });
  }
  if (!amount || isNaN(Number(amount))) {
    return NextResponse.json({ error: "amount is required and must be a number" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("invoices")
    .insert([{
      type,
      contact_id:  contact_id || null,
      project_id:  project_id || null,
      amount:      Number(amount),
      due_date:    due_date || null,
      notes:       notes || null,
      line_items:  line_items ? JSON.parse(line_items as unknown as string) : [],
      status:      "draft",
    }])
    .select("*")
    .single();

  if (error) {
    console.error("[POST /api/invoices]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice: data }, { status: 201 });
}
