import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase-admin";
import { websiteEnquirySchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

function corsHeaders(allowedOrigin: string, requestOrigin: string | null): Record<string, string> {
  const allow =
    allowedOrigin === "*" || requestOrigin === allowedOrigin
      ? (requestOrigin ?? "*")
      : "null";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function normalizeOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url.trim();
  }
}

export async function OPTIONS(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id");
  const origin   = request.headers.get("origin");

  if (!clientId) {
    return new NextResponse(null, { status: 204, headers: corsHeaders("*", origin) });
  }

  const { data: client } = await adminSupabase
    .from("clients")
    .select("website_url")
    .eq("id", clientId)
    .maybeSingle();

  const allowed = client?.website_url ? normalizeOrigin(client.website_url) : "*";
  return new NextResponse(null, { status: 204, headers: corsHeaders(allowed, origin) });
}

export async function POST(request: NextRequest) {
  const origin   = request.headers.get("origin");
  const clientId = request.nextUrl.searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "Missing client_id parameter" }, { status: 400 });
  }

  // Load the client to validate CORS origin and confirm existence
  const { data: client, error: clientErr } = await adminSupabase
    .from("clients")
    .select("id, website_url")
    .eq("id", clientId)
    .maybeSingle();

  if (clientErr || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const allowedOrigin = client.website_url ? normalizeOrigin(client.website_url) : "*";
  const headers = corsHeaders(allowedOrigin, origin);

  // Block cross-origin requests when a website_url is configured
  if (allowedOrigin !== "*" && origin !== allowedOrigin) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403, headers });
  }

  // Rate limiting: key by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400, headers });
  }

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

  const { name, email, phone, services, eventtype, message, _honeypot } = parsed.data;

  if (_honeypot && _honeypot.length > 0) {
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  // Duplicate detection: same email + client within the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await adminSupabase
    .from("leads")
    .select("id")
    .eq("client_id", clientId)
    .eq("email", email)
    .gte("created_at", since)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true }, { status: 200, headers });
  }

  const eventTypeValue =
    services && services.length > 0 ? services.join(", ") : (eventtype?.trim() || "General Enquiry");

  const { error: insertError } = await adminSupabase.from("leads").insert([
    {
      client_id:  clientId,
      clientname: name,
      phone,
      email,
      source:     "Website Enquiry",
      eventtype:  eventTypeValue,
      campaign:   message,
      status:     "New Lead",
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
