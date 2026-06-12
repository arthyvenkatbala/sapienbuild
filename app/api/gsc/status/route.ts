import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await adminSupabase
    .from("gsc_tokens")
    .select("refresh_token, site_url, expiry")
    .eq("id", "00000000-0000-0000-0000-000000000002")
    .single();

  if (!data?.refresh_token) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    site_url:  data.site_url ?? null,
    expiry:    data.expiry,
  });
}
