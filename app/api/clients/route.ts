import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

// ── GET /api/clients — list all clients (tokens excluded) ─────────────────────
export async function GET() {
  const { data, error } = await adminSupabase
    .from("clients")
    .select(`
      id, business_name, owner_name, email, phone, website_url,
      meta_ad_account_id, meta_user_id,
      google_customer_id, google_ads_account_name,
      connected_platforms, last_synced_at, created_at, updated_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/clients]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clients: data });
}

// ── POST /api/clients — create a new client ────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { business_name, owner_name, email, phone, website_url } = body;

  if (!business_name?.trim()) {
    return NextResponse.json({ error: "business_name is required" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("clients")
    .insert([{
      business_name: business_name.trim(),
      owner_name:    (owner_name ?? "").trim(),
      email:         (email ?? "").trim().toLowerCase(),
      phone:         (phone ?? "").trim(),
      website_url:   (website_url ?? "").trim() || null,
    }])
    .select(`
      id, business_name, owner_name, email, phone, website_url,
      connected_platforms, last_synced_at, created_at, updated_at
    `)
    .single();

  if (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client: data }, { status: 201 });
}
