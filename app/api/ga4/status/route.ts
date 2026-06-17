import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await adminSupabase
    .from("ga4_tokens")
    .select("access_token, property_id")
    .maybeSingle();

  return NextResponse.json({
    connected:   !!data?.access_token,
    property_id: data?.property_id ?? null,
  });
}
