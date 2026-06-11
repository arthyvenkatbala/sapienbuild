import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: { platform?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const platform = body.platform;
  if (platform !== "meta" && platform !== "google") {
    return NextResponse.json({ error: "Invalid platform. Must be 'meta' or 'google'" }, { status: 422 });
  }

  // Fetch current state
  const { data: client, error: fetchError } = await adminSupabase
    .from("clients")
    .select("connected_platforms")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const platforms: string[] = (client.connected_platforms ?? []).filter(
    (p: string) => p !== platform
  );

  const patch: Record<string, unknown> = { connected_platforms: platforms };

  if (platform === "meta") {
    patch.meta_access_token  = null;
    patch.meta_ad_account_id = null;
    patch.meta_user_id       = null;
  } else {
    patch.google_refresh_token     = null;
    patch.google_customer_id       = null;
    patch.google_ads_account_name  = null;
  }

  const { error: updateError } = await adminSupabase
    .from("clients")
    .update(patch)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, connected_platforms: platforms });
}
