import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

type Params = { params: Promise<{ id: string }> };

// GET /api/clients/[id]/leads — list website enquiry leads for a client
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data, error } = await adminSupabase
    .from("leads")
    .select("id, client_id, clientname, phone, email, source, eventtype, campaign, status, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/clients/[id]/leads]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
