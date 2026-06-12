import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await adminSupabase
    .from("agent_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed = [
    "photos_folder_id",
    "videos_folder_id",
    "caption_tone",
    "always_include_hashtags",
    "blackout_days",
    "min_days_between_same_wedding",
    "use_ai_times",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await adminSupabase
    .from("agent_settings")
    .upsert({ id: SETTINGS_ID, ...update })
    .eq("id", SETTINGS_ID)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
