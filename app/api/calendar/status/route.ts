import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000004";

export async function GET() {
  const { data, error } = await adminSupabase
    .from("google_calendar_tokens")
    .select("access_token, expiry")
    .eq("id", TOKEN_ROW_ID)
    .single();

  if (error || !data?.access_token) {
    return NextResponse.json({ connected: false });
  }

  const expired = data.expiry ? new Date(data.expiry) < new Date() : false;
  return NextResponse.json({ connected: !expired, expiry: data.expiry ?? null });
}
