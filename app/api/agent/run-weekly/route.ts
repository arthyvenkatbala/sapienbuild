// This route is called by Vercel cron every Monday 6AM IST (00:30 UTC)
// It is also callable manually from /social/settings
// Protected by x-cron-secret header
// Add CRON_SECRET to Vercel environment variables

import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyPlan } from "@/lib/agent/generateWeeklyPlan";

function getMondayDate(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const secret      = process.env.CRON_SECRET;
  const headerSec   = request.headers.get("x-cron-secret");
  const queryForce  = request.nextUrl.searchParams.get("force") === "1";

  // Allow the Vercel cron (Authorization header) or our x-cron-secret header
  const authHeader  = request.headers.get("authorization");
  const cronBearer  = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (secret && headerSec !== secret && cronBearer !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getMondayDate();

  try {
    await generateWeeklyPlan();
    return NextResponse.json({ success: true, week_start: weekStart, suggestions: 14 });
  } catch (err) {
    console.error("[run-weekly]", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 },
    );
  }
}

// Also allow POST (from the settings page "Run agent now" button)
export async function POST(request: NextRequest) {
  return GET(request);
}
