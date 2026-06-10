import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { internalLeadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = internalLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 }
    );
  }

  const { clientname, phone, email, source, eventtype, campaign } = parsed.data;

  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        clientname,
        phone,
        email,
        source: source ?? "Internal",
        eventtype,
        campaign,
        status: "New Lead",
      },
    ])
    .select();

  if (error) {
    console.error("[leads] insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, lead: data });
}
