// On-demand agent trigger for the "Run Agent Now" button.
// Returns immediately with a run_id; the pipeline runs after the response via after().
// Client polls GET /api/agent/runs?limit=1 to detect completion.

import { NextResponse } from "next/server";
import { after } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { runContentAgent, getMondayDate } from "@/lib/agent/runContentAgent";

// Allow up to 60 s for the background pipeline on Vercel Pro
export const maxDuration = 60;

export async function POST() {
  const weekStart = getMondayDate();

  // Check if a run is already in progress — guard against concurrent clicks
  const { data: running } = await adminSupabase
    .from("content_agent_runs")
    .select("id")
    .eq("status", "running")
    .limit(1);

  if (running && running.length > 0) {
    return NextResponse.json(
      { error: "A run is already in progress", run_id: running[0].id },
      { status: 409 },
    );
  }

  // Pre-create the run record so the client can start polling immediately
  const { data: runRow, error: runErr } = await adminSupabase
    .from("content_agent_runs")
    .insert({ week_start: weekStart, status: "running", generated_by: "manual" })
    .select("id")
    .single();

  if (runErr || !runRow) {
    console.error("[trigger] Failed to create run record:", runErr);
    return NextResponse.json({ error: "Failed to start run" }, { status: 500 });
  }

  const runId = runRow.id as string;

  // Run the pipeline after the response is sent
  after(async () => {
    try {
      await runContentAgent({ generatedBy: "manual", runId, weekStart });
    } catch (e) {
      // Error is already recorded inside runContentAgent
      console.error("[trigger] after() pipeline error:", e);
    }
  });

  return NextResponse.json({ success: true, run_id: runId, status: "running" });
}
