// Admin-only: list all profiles for the Team Roles panel.
// Gated by middleware (ADMIN_ONLY_PREFIXES includes /api/admin), enforced
// again here since this uses the service-role client which bypasses RLS.

import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profiles: data });
}
