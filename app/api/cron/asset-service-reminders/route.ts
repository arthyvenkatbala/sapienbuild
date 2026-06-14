// Weekly cron: check for assets overdue or due within SERVICE_THRESHOLD_DAYS.
// Sends a summary email via Resend REST API.
// Degrades gracefully if RESEND_API_KEY or REMINDER_EMAIL is not configured.
// Schedule: Mondays at 07:00 IST (01:30 UTC) — see vercel.json

import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

const SERVICE_THRESHOLD_DAYS = 7;

function addDays(date: Date, n: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function daysLabel(iso: string, today: string): string {
  const diff = Math.floor(
    (new Date(iso).getTime() - new Date(today).getTime()) / 86_400_000,
  );
  if (diff < 0)  return `<strong style="color:#ef4444">Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}</strong>`;
  if (diff === 0) return `<strong style="color:#f59e0b">Due today</strong>`;
  return `<span style="color:#f59e0b">Due in ${diff} day${diff !== 1 ? "s" : ""}</span>`;
}

function buildEmail(
  assets: Array<{
    name:             string;
    category:         string | null;
    next_service_due: string;
    last_service_date: string | null;
    service_notes:    string | null;
  }>,
  today: string,
): { subject: string; html: string } {
  const overdue = assets.filter((a) => a.next_service_due < today);
  const upcoming = assets.filter((a) => a.next_service_due >= today);

  const rows = assets
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #27272a;font-weight:600;color:#e4e4e7">${a.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;text-transform:capitalize">${a.category ?? "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa">${fmtDate(a.next_service_due)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #27272a">${daysLabel(a.next_service_due, today)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#71717a;font-size:12px">${a.service_notes ?? "—"}</td>
      </tr>`,
    )
    .join("");

  const subject =
    overdue.length > 0
      ? `⚠️ ${overdue.length} asset${overdue.length !== 1 ? "s" : ""} overdue for service — One Thousand Tales`
      : `🔧 ${upcoming.length} asset${upcoming.length !== 1 ? "s" : ""} due for service soon — One Thousand Tales`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:680px;margin:40px auto;padding:0 20px">

    <div style="background:#111114;border:1px solid #27272a;border-radius:16px;overflow:hidden">

      <!-- Header -->
      <div style="background:#18181b;padding:24px 28px;border-bottom:1px solid #27272a">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a16207">
          One Thousand Tales
        </p>
        <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fafafa">
          Asset Service Reminder
        </h1>
        <p style="margin:4px 0 0;font-size:13px;color:#71717a">
          ${assets.length} asset${assets.length !== 1 ? "s" : ""} require attention
          ${overdue.length > 0 ? ` · <span style="color:#ef4444">${overdue.length} overdue</span>` : ""}
          ${upcoming.length > 0 ? ` · <span style="color:#f59e0b">${upcoming.length} due within ${SERVICE_THRESHOLD_DAYS} days</span>` : ""}
        </p>
      </div>

      <!-- Table -->
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#18181b">
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#52525b;border-bottom:1px solid #27272a">Asset</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#52525b;border-bottom:1px solid #27272a">Category</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#52525b;border-bottom:1px solid #27272a">Due Date</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#52525b;border-bottom:1px solid #27272a">Status</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#52525b;border-bottom:1px solid #27272a">Notes</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding:20px 28px;border-top:1px solid #27272a;background:#18181b">
        <p style="margin:0;font-size:12px;color:#52525b">
          Log completed services in the Assets module to reset the schedule.
          This email was generated automatically by the weekly service-reminder cron.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Auth: same pattern as /api/agent/run-weekly
  const secret     = process.env.CRON_SECRET;
  const headerSec  = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const cronBearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const force      = request.nextUrl.searchParams.get("force") === "1";

  if (secret && headerSec !== secret && cronBearer !== secret && !force) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today     = new Date().toISOString().slice(0, 10);
  const threshold = addDays(new Date(), SERVICE_THRESHOLD_DAYS);

  // Fetch assets overdue or due within threshold
  const { data: assets, error } = await adminSupabase
    .from("assets")
    .select("id, name, category, next_service_due, last_service_date, service_notes")
    .not("next_service_due", "is", null)
    .lte("next_service_due", threshold)
    .order("next_service_due", { ascending: true });

  if (error) {
    console.error("[asset-service-reminders] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!assets?.length) {
    console.log("[asset-service-reminders] No assets due — nothing to send");
    return NextResponse.json({ success: true, assets_due: 0 });
  }

  // ── Send email via Resend REST API ──────────────────────────────────────────

  const resendKey    = process.env.RESEND_API_KEY;
  const reminderTo   = process.env.REMINDER_EMAIL ?? process.env.FROM_EMAIL ?? "arthyvenkatbala@gmail.com";
  const fromAddress  = `One Thousand Tales <onboarding@resend.dev>`;

  if (!resendKey) {
    console.warn("[asset-service-reminders] RESEND_API_KEY not set — skipping email");
    return NextResponse.json({
      success:       true,
      skipped_email: true,
      assets_due:    assets.length,
      reason:        "RESEND_API_KEY not configured",
    });
  }

  const { subject, html } = buildEmail(
    assets as Array<{
      name:             string;
      category:         string | null;
      next_service_due: string;
      last_service_date: string | null;
      service_notes:    string | null;
    }>,
    today,
  );

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    fromAddress,
        to:      [reminderTo],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const detail = await emailRes.text();
      console.error("[asset-service-reminders] Resend error:", detail);
      // Degrade gracefully — don't fail the cron
      return NextResponse.json({
        success:        true,
        assets_due:     assets.length,
        email_error:    detail,
      });
    }

    console.log(`[asset-service-reminders] Reminder sent — ${assets.length} asset(s)`);
    return NextResponse.json({ success: true, assets_due: assets.length, email_sent: true });
  } catch (err) {
    console.error("[asset-service-reminders] Fetch error:", err);
    return NextResponse.json({
      success:     true,
      assets_due:  assets.length,
      email_error: String(err),
    });
  }
}
