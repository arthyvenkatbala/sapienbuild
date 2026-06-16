// Admin-only: update a profile's role. Gated by middleware; re-validated here
// since this uses the service-role client which bypasses RLS.

import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const VALID_ROLES = ["admin", "executive", "member"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json() as { role?: string };

  if (!body.role || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: body.role })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
