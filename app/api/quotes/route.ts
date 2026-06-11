import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import type { Quote } from "@/lib/quotes-data";

// ── DB ↔ Quote mapping ────────────────────────────────────────────────────────

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

function quoteToDb(q: Quote) {
  return {
    id:                q.id,
    client_name:       q.clientName,
    client_phone:      q.clientPhone,
    client_email:      q.clientEmail,
    client_location:   q.clientLocation,
    event_types:       q.eventTypes,
    event_dates:       q.eventDates,
    venue_name:        q.venueName,
    executive_name:    q.executiveName,
    executive_phone:   q.executivePhone,
    executive_email:   q.executiveEmail,
    services:          q.services,
    add_ons:           q.addOns,
    discount_type:     q.discountType,
    discount_value:    q.discountValue,
    subtotal:          q.subtotal,
    discount_amount:   q.discountAmount,
    grand_total:       q.grandTotal,
    notes:             q.notes,
    status:            q.status,
    valid_until:       q.validUntil,
    sent_at:           q.sentAt,
    viewed_at:         q.viewedAt,
    approved_at:       q.approvedAt,
    signature_data:    q.signatureData,
    follow_up_count:   q.followUpCount,
    ai_score:          q.aiScore,
    ai_recommendation: q.aiRecommendation,
    updated_at:        new Date().toISOString(),
  };
}

// ── GET /api/quotes ───────────────────────────────────────────────────────────

export async function GET() {
  const { data, error } = await adminSupabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/quotes]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quotes: (data ?? []).map(dbToQuote) });
}

// ── POST /api/quotes ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let quote: Quote;
  try { quote = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("quotes")
    .upsert(quoteToDb(quote), { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/quotes]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quote: dbToQuote(data) }, { status: 201 });
}
