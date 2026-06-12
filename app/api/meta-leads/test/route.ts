/**
 * Dev-only test endpoint — simulates a Meta Lead Ad arriving via webhook.
 * Directly writes a fake lead to Supabase without calling the Graph API.
 *
 * Usage (local dev only):
 *   GET http://localhost:3000/api/meta-leads/test
 *
 * Returns 403 in production (NODE_ENV !== 'development').
 */

import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Forbidden — only available in development", { status: 403 });
  }

  const fakeFirst = "Test";
  const fakeLast  = "Lead";
  const eventType = "Wedding";

  try {
    // 1. Insert test contact
    const { data: contact, error: contactErr } = await adminSupabase
      .from("contacts")
      .insert([{
        type:       "lead",
        source:     "meta_ads",
        status:     "active",
        first_name: fakeFirst,
        last_name:  fakeLast,
        email:      "test@example.com",
        phone:      "+91 9999999999",
        notes:      [
          "City: Chennai",
          "Ad ID: test-ad-001, Campaign: test-campaign-001, Form: test-form-001",
          "Meta Lead ID: test-leadgen-id-00000",
        ].join("\n"),
      }])
      .select("id")
      .single();

    if (contactErr || !contact) {
      console.error("[meta-leads/test] contact insert:", contactErr);
      return NextResponse.json({ error: "Contact insert failed", detail: contactErr }, { status: 500 });
    }

    // 2. Insert test project
    const title = `${fakeFirst}'s ${eventType} — from Meta Ad`;
    const { data: project, error: projectErr } = await adminSupabase
      .from("projects")
      .insert([{
        contact_id:     contact.id,
        title,
        event_type:     eventType.toLowerCase(),
        workflow_stage: "enquiry",
        notes:          "Auto-created from /api/meta-leads/test (dev only). Lead ID: test-leadgen-id-00000",
      }])
      .select("id")
      .single();

    if (projectErr || !project) {
      console.error("[meta-leads/test] project insert:", projectErr);
      return NextResponse.json({ error: "Project insert failed", detail: projectErr }, { status: 500 });
    }

    // 3. Log workflow event
    await adminSupabase.from("workflow_events").insert([{
      project_id: project.id,
      from_stage: null,
      to_stage:   "enquiry",
      notes:      "Lead auto-created from test endpoint",
    }]);

    return NextResponse.json({
      success:    true,
      contact_id: contact.id,
      project_id: project.id,
      message:    `Test lead created: "${fakeFirst} ${fakeLast}" → project "${title}"`,
    });
  } catch (err) {
    console.error("[meta-leads/test] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
