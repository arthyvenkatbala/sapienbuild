import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await adminSupabase
    .from("gmb_tokens")
    .select("refresh_token, account_name, location_name, location_id, expiry")
    .eq("id", "00000000-0000-0000-0000-000000000003")
    .single();

  if (!data?.refresh_token) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected:     true,
    account_name:  data.account_name  ?? null,
    location_name: data.location_name ?? null,
    location_id:   data.location_id   ?? null,
    expiry:        data.expiry,
  });
}
