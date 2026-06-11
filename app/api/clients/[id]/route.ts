import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/clients/[id] — fetch a single client (tokens excluded) ───────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data, error } = await adminSupabase
    .from("clients")
    .select(`
      id, business_name, owner_name, email, phone, website_url,
      meta_ad_account_id, meta_user_id,
      google_customer_id, google_ads_account_name,
      connected_platforms, last_synced_at, created_at, updated_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client: data });
}

// ── PATCH /api/clients/[id] — update basic info fields only ───────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Only allow updating the non-sensitive public fields
  const allowed = ["business_name", "owner_name", "email", "phone", "website_url"] as const;
  const patch: Record<string, string> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = String(body[key]).trim();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 422 });
  }

  const { data, error } = await adminSupabase
    .from("clients")
    .update(patch)
    .eq("id", id)
    .select(`
      id, business_name, owner_name, email, phone, website_url,
      meta_ad_account_id, meta_user_id,
      google_customer_id, google_ads_account_name,
      connected_platforms, last_synced_at, created_at, updated_at
    `)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client: data });
}

// ── DELETE /api/clients/[id] ──────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { error } = await adminSupabase.from("clients").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
