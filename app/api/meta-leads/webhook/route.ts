/**
 * Meta Lead Ads Webhook
 *
 * GET  — webhook verification handshake required by Meta
 * POST — receives new lead notification, fetches full data from Graph API,
 *        and writes contact + project + workflow_event to Supabase.
 *
 * Required env vars (set in Vercel → Project Settings → Environment Variables):
 *   META_WEBHOOK_VERIFY_TOKEN  — any string you choose; must match what you
 *                                enter in Meta Developer Dashboard → Webhooks
 *   META_PAGE_ACCESS_TOKEN     — from Meta Developer App → your Facebook Page
 *                                → Generate Page Access Token (never NEXT_PUBLIC_)
 */

import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const GRAPH_API_VERSION = "v19.0";

// ─── Field mapping ────────────────────────────────────────────────────────────

type FieldData = { name: string; values: string[] };

interface ParsedLead {
  firstName:  string;
  lastName:   string;
  phone:      string;
  email:      string;
  eventType:  string;
  noteLines:  string[];
}

const NAME_KEYS   = new Set(["full_name", "name", "fullname", "your_name"]);
const PHONE_KEYS  = new Set(["phone", "phone_number", "mobile", "mobile_number", "phone_no", "contact_number", "whatsapp"]);
const EMAIL_KEYS  = new Set(["email", "email_address", "emailaddress"]);
const ETYPE_KEYS  = new Set(["event_type", "event", "service", "services", "wedding_type", "type_of_event", "ceremony_type"]);
const EDATE_KEYS  = new Set(["event_date", "date", "wedding_date", "event_day", "ceremony_date", "tentative_date"]);
const CITY_KEYS   = new Set(["city", "location", "venue_city", "venue"]);

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[\s\-]+/g, "_");
}

function parseFieldData(fields: FieldData[]): ParsedLead {
  let firstName = "";
  let lastName  = "";
  let phone     = "";
  let email     = "";
  let eventType = "";
  const noteLines: string[] = [];

  for (const field of fields) {
    const key = normalizeKey(field.name);
    const val = (field.values?.[0] ?? "").trim();
    if (!val) continue;

    if (NAME_KEYS.has(key)) {
      const parts = val.split(/\s+/);
      firstName   = parts[0] ?? "";
      lastName    = parts.slice(1).join(" ");
    } else if (PHONE_KEYS.has(key)) {
      phone = val;
    } else if (EMAIL_KEYS.has(key)) {
      email = val.toLowerCase();
    } else if (ETYPE_KEYS.has(key)) {
      eventType = val;
    } else if (EDATE_KEYS.has(key)) {
      noteLines.push(`Event date: ${val}`);
    } else if (CITY_KEYS.has(key)) {
      noteLines.push(`City: ${val}`);
    } else {
      noteLines.push(`${field.name}: ${val}`);
    }
  }

  return { firstName, lastName, phone, email, eventType, noteLines };
}

// ─── Supabase writes ──────────────────────────────────────────────────────────

async function createLeadInCRM(
  parsed:     ParsedLead,
  leadgenId:  string,
  adId:       string | null,
  campaignId: string | null,
  formId:     string | null,
): Promise<void> {
  const metaNotes = [
    ...parsed.noteLines,
    `Ad ID: ${adId ?? "—"}, Campaign: ${campaignId ?? "—"}, Form: ${formId ?? "—"}`,
    `Meta Lead ID: ${leadgenId}`,
  ].join("\n");

  // 1. Insert contact
  const { data: contact, error: contactErr } = await adminSupabase
    .from("contacts")
    .insert([{
      type:       "lead",
      source:     "meta_ads",
      status:     "active",
      first_name: parsed.firstName || "Meta",
      last_name:  parsed.lastName  || "Lead",
      email:      parsed.email  || null,
      phone:      parsed.phone  || null,
      notes:      metaNotes,
    }])
    .select("id")
    .single();

  if (contactErr || !contact) {
    console.error("[meta-webhook] contact insert:", contactErr);
    return;
  }

  // 2. Build project title
  const eventLabel = parsed.eventType
    ? parsed.eventType.charAt(0).toUpperCase() + parsed.eventType.slice(1)
    : null;
  const nameLabel   = parsed.firstName || "New";
  const projectTitle = eventLabel
    ? `${nameLabel}'s ${eventLabel} — from Meta Ad`
    : `${nameLabel}'s Enquiry — from Meta Ad`;

  // 3. Insert project
  const { data: project, error: projectErr } = await adminSupabase
    .from("projects")
    .insert([{
      contact_id:     contact.id,
      title:          projectTitle,
      event_type:     parsed.eventType.toLowerCase() || null,
      workflow_stage: "enquiry",
      notes:          `Auto-created from Meta Lead Ad. Lead ID: ${leadgenId}`,
    }])
    .select("id")
    .single();

  if (projectErr || !project) {
    console.error("[meta-webhook] project insert:", projectErr);
    return;
  }

  // 4. Log workflow event
  await adminSupabase.from("workflow_events").insert([{
    project_id: project.id,
    from_stage: null,
    to_stage:   "enquiry",
    notes:      "Lead auto-created from Meta Lead Ad",
  }]);
}

// ─── GET — Webhook verification ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const mode        = searchParams.get("hub.mode");
  const token       = searchParams.get("hub.verify_token");
  const challenge   = searchParams.get("hub.challenge");

  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expected) {
    console.error("[meta-webhook] META_WEBHOOK_VERIFY_TOKEN is not set");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  if (mode === "subscribe" && token === expected && challenge) {
    // Return the challenge as plain text — Meta requires this exact format
    return new NextResponse(challenge, {
      status:  200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST — Receive lead notification ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Always return 200 — Meta retries on any other status
  try {
    const body = await request.json();

    // Validate it's a leadgen event
    if (body.object !== "page") {
      return new NextResponse("OK", { status: 200 });
    }

    const entries  = body.entry ?? [];
    const changes  = entries.flatMap((e: Record<string, unknown>) =>
      (e.changes as Record<string, unknown>[] ?? [])
    );
    const leadgenChanges = changes.filter(
      (c: Record<string, unknown>) => c.field === "leadgen"
    );

    for (const change of leadgenChanges) {
      const value      = change.value as Record<string, string> ?? {};
      const leadgenId  = value.leadgen_id;
      const adId       = value.ad_id       ?? null;
      const campaignId = value.campaign_id ?? null;
      const formId     = value.form_id     ?? null;

      if (!leadgenId) continue;

      const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
      if (!accessToken) {
        console.error("[meta-webhook] META_PAGE_ACCESS_TOKEN is not set");
        // Still create a minimal lead so the webhook doesn't silently drop
        await createLeadInCRM(
          { firstName: "Meta", lastName: "Lead", phone: "", email: "", eventType: "", noteLines: [] },
          leadgenId, adId, campaignId, formId,
        );
        continue;
      }

      // Fetch full lead from Graph API (must complete within Meta's 5s window)
      const graphUrl = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}`);
      graphUrl.searchParams.set("fields",       "field_data,created_time,ad_id,campaign_id,form_id");
      graphUrl.searchParams.set("access_token", accessToken);

      let parsed: ParsedLead = {
        firstName: "Meta", lastName: "Lead",
        phone: "", email: "", eventType: "", noteLines: [],
      };

      try {
        const graphRes = await fetch(graphUrl.toString(), {
          signal: AbortSignal.timeout(4000), // stay well within 5s
        });

        if (graphRes.ok) {
          const graphData = await graphRes.json() as {
            field_data:   FieldData[];
            ad_id?:       string;
            campaign_id?: string;
            form_id?:     string;
          };
          parsed = parseFieldData(graphData.field_data ?? []);
        } else {
          const errText = await graphRes.text();
          console.error("[meta-webhook] Graph API error:", graphRes.status, errText);
        }
      } catch (fetchErr) {
        console.error("[meta-webhook] Graph API fetch failed:", fetchErr);
      }

      await createLeadInCRM(parsed, leadgenId, adId, campaignId, formId);
    }
  } catch (err) {
    // Catch-all — log but never let Meta see an error
    console.error("[meta-webhook] unhandled error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}
