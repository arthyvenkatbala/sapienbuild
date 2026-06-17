import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { generatePaymentReceipt } from "@/lib/generate-receipt";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const invoiceId = searchParams.get("invoice_id");
  const projectId = searchParams.get("project_id");

  let query = adminSupabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: true });

  if (invoiceId) query = query.eq("invoice_id", invoiceId);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data ?? [] });
}

export async function POST(request: NextRequest) {
  let body: {
    invoice_id:   string;
    project_id?:  string | null;
    amount:       number;
    payment_type?: string;
    payment_date?: string;
    method?:      string | null;
    notes?:       string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { invoice_id, project_id, amount, payment_type, payment_date, method, notes } = body;

  if (!invoice_id || !amount || Number(amount) <= 0) {
    return NextResponse.json(
      { error: "invoice_id and a positive amount are required" },
      { status: 422 },
    );
  }

  const { data, error } = await adminSupabase
    .from("payments")
    .insert([{
      invoice_id,
      project_id:   project_id ?? null,
      amount:       Number(amount),
      payment_type: payment_type ?? "advance",
      payment_date: payment_date ?? new Date().toISOString().slice(0, 10),
      method:       method  ?? null,
      notes:        notes   ?? null,
    }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate receipt PDF synchronously so it is ready when the UI re-fetches
  try {
    await generatePaymentReceipt(data.id);
  } catch (receiptErr) {
    // Non-fatal — payment is already saved; receipt can be generated on demand
    console.error("[payments] Receipt generation failed:", receiptErr);
  }

  return NextResponse.json({ payment: data }, { status: 201 });
}
