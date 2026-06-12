import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await adminSupabase
    .from("youtube_tokens")
    .select("channel_name, expiry")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected:    true,
    channel_name: data.channel_name ?? null,
    expiry:       data.expiry,
  });
}
