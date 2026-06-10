import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { websiteEnquirySchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

// Set WEBSITE_ORIGIN in .env.local to your photography website's domain,
// e.g. https://www.onethousandtales.com — leave unset to allow any origin (dev only).
const ALLOWED_ORIGIN = process.env.WEBSITE_ORIGIN ?? "*";

function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    ALLOWED_ORIGIN === "*" || origin === ALLOWED_ORIGIN
      ? (origin ?? "*")
      : "null";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// Handle preflight requests from the photography website
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  // Rate limiting: key by IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const rl = checkRateLimit(`website-enquiry:${ip}`);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Parse request body
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers }
    );
  }

  // Validate with Zod
  const parsed = websiteEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed. Please check your inputs.",
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422, headers }
    );
  }

  const { name, email, phone, services, eventtype, message, _honeypot } =
    parsed.data;

  // Honeypot check — silently accept so bots don't know they were blocked
  if (_honeypot && _honeypot.length > 0) {
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  // Duplicate detection: same email + source within the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing, error: lookupError } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .eq("source", "Website Enquiry")
    .gte("created_at", since)
    .maybeSingle();

  if (lookupError) {
    console.error("[website-enquiry] duplicate check error:", lookupError);
    // Non-fatal — continue with insert
  }

  if (existing) {
    // Return success silently; don't reveal whether the email is in the DB
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  // Map website fields to the CRM leads schema
  const eventTypeValue = services && services.length > 0
    ? services.join(", ")
    : (eventtype?.trim() || "General Enquiry");

  const { error: insertError } = await supabase.from("leads").insert([
    {
      clientname: name,
      phone,
      email,
      source: "Website Enquiry",
      eventtype: eventTypeValue,
      campaign: message, // stored in campaign until a dedicated notes column is added
      status: "New Lead",
    },
  ]);

  if (insertError) {
    console.error("[website-enquiry] insert error:", insertError);
    return NextResponse.json(
      { error: "We couldn't save your enquiry. Please try again." },
      { status: 500, headers }
    );
  }

  return NextResponse.json({ success: true }, { status: 200, headers });
}
