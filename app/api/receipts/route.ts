import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { generatePaymentReceipt } from "@/lib/generate-receipt";

export async function POST(request: NextRequest) {
  let body: { payment_id?: string; force?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { payment_id, force } = body;
  if (!payment_id) {
    return NextResponse.json({ error: "payment_id is required" }, { status: 400 });
  }

  try {
    await generatePaymentReceipt(payment_id, force ?? false);
  } catch (err) {
    console.error("[receipts] Generation failed:", err);
    return NextResponse.json(
      { error: "Receipt generation failed", detail: String(err) },
      { status: 500 },
    );
  }

  // Return the stored PDF data
  const { data, error } = await adminSupabase
    .from("payments")
    .select("receipt_pdf_data, receipt_number")
    .eq("id", payment_id)
    .single();

  if (error || !data?.receipt_pdf_data) {
    return NextResponse.json({ error: "Receipt not found after generation" }, { status: 404 });
  }

  return NextResponse.json({
    receipt_pdf_data: data.receipt_pdf_data,
    receipt_number:   data.receipt_number,
  });
}
