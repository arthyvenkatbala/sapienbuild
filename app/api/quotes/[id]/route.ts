import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import type { Quote } from "@/lib/quotes-data";

type Params = { params: Promise<{ id: string }> };

function dbToQuote(row: Record<string, unknown>): Quote {
  return {
    id:               row.id               as string,
    clientName:       row.client_name      as string,
    clientPhone:      row.client_phone     as string,
    clientEmail:      row.client_email     as string,
    clientLocation:   row.client_location  as string,
    eventTypes:       (row.event_types     as Quote["eventTypes"]) ?? [],
    eventDates:       row.event_dates      as string,
    venueName:        row.venue_name       as string,
    executiveName:    row.executive_name   as string,
    executivePhone:   row.executive_phone  as string,
    executiveEmail:   row.executive_email  as string,
    services:         (row.services        as Quote["services"]) ?? [],
    addOns:           (row.add_ons         as Quote["addOns"])   ?? [],
    discountType:     (row.discount_type   as "flat" | "percent"),
    discountValue:    Number(row.discount_value),
    subtotal:         Number(row.subtotal),
    discountAmount:   Number(row.discount_amount),
    grandTotal:       Number(row.grand_total),
    notes:            (row.notes           as string) ?? "",
    status:           row.status           as Quote["status"],
    createdAt:        row.created_at       as string,
    updatedAt:        row.updated_at       as string,
    validUntil:       (row.valid_until     as string) ?? "",
    sentAt:           (row.sent_at         as string | null) ?? null,
    viewedAt:         (row.viewed_at       as string | null) ?? null,
    approvedAt:       (row.approved_at     as string | null) ?? null,
    signatureData:    (row.signature_data  as string | null) ?? null,
    followUpCount:    Number(row.follow_up_count) || 0,
    aiScore:          Number(row.ai_score)         || 0,
    aiRecommendation: (row.ai_recommendation as string) ?? "",
  };
}

// ── PATCH /api/quotes/[id] ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: Partial<Quote>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Build only the columns that were sent
  const allowed: Record<string, string> = {
    clientName: "client_name", clientPhone: "client_phone", clientEmail: "client_email",
    clientLocation: "client_location", eventTypes: "event_types", eventDates: "event_dates",
    venueName: "venue_name", executiveName: "executive_name", executivePhone: "executive_phone",
    executiveEmail: "executive_email", services: "services", addOns: "add_ons",
    discountType: "discount_type", discountValue: "discount_value", subtotal: "subtotal",
    discountAmount: "discount_amount", grandTotal: "grand_total", notes: "notes",
    status: "status", validUntil: "valid_until", sentAt: "sent_at", viewedAt: "viewed_at",
    approvedAt: "approved_at", signatureData: "signature_data", followUpCount: "follow_up_count",
    aiScore: "ai_score", aiRecommendation: "ai_recommendation",
  };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, col] of Object.entries(allowed)) {
    if (key in body) patch[col] = (body as Record<string, unknown>)[key];
  }

  const { data, error } = await adminSupabase
    .from("quotes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/quotes/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quote: dbToQuote(data) });
}

// ── DELETE /api/quotes/[id] ───────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { error } = await adminSupabase
    .from("quotes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/quotes/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
