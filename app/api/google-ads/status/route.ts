import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await adminSupabase
    .from("google_ads_tokens")
    .select("access_token, customer_id, account_name")
    .maybeSingle();

  return NextResponse.json({
    connected:    !!data?.access_token,
    customer_id:  data?.customer_id ?? null,
    account_name: data?.account_name ?? null,
  });
}
