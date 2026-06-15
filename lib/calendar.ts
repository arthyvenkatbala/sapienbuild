import { adminSupabase } from "@/lib/supabase-admin";

const CALENDAR_ID  = "primary";
const TOKEN_ROW_ID = "00000000-0000-0000-0000-000000000004";

// ─── Token helpers ────────────────────────────────────────────────────────────

async function getValidToken(): Promise<string | null> {
  const { data, error } = await adminSupabase
    .from("google_calendar_tokens")
    .select("access_token, refresh_token, expiry")
    .eq("id", TOKEN_ROW_ID)
    .single();

  if (error || !data?.access_token) return null;

  // Token valid for at least another minute
  if (data.expiry && new Date(data.expiry) > new Date(Date.now() + 60_000)) {
    return data.access_token as string;
  }

  // Expired — attempt refresh
  if (!data.refresh_token) return null;

  const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token as string,
      grant_type:    "refresh_token",
    }),
  });

  if (!refreshRes.ok) {
    console.error("[calendar] Token refresh failed:", await refreshRes.text());
    return null;
  }

  const refreshed = await refreshRes.json() as {
    access_token: string;
    expires_in:   number;
  };

  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await adminSupabase
    .from("google_calendar_tokens")
    .update({ access_token: refreshed.access_token, expiry: newExpiry })
    .eq("id", TOKEN_ROW_ID);

  return refreshed.access_token;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function safeName(raw: unknown): string {
  const obj = Array.isArray(raw)
    ? (raw[0] as { first_name?: string; last_name?: string } | undefined)
    : (raw as { first_name?: string; last_name?: string } | null);
  if (!obj) return "";
  return `${obj.first_name ?? ""} ${obj.last_name ?? ""}`.trim();
}

// ─── Core function ────────────────────────────────────────────────────────────

export async function bookCalendarForProject(projectId: string): Promise<{
  success:  boolean;
  booked:   number;
  reason?:  string;
}> {
  const token = await getValidToken();
  if (!token) {
    return { success: false, booked: 0, reason: "Google Calendar not connected" };
  }

  // Fetch project + contact
  const { data: project, error: projErr } = await adminSupabase
    .from("projects")
    .select("id, title, event_date, contact:contacts(first_name, last_name)")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return { success: false, booked: 0, reason: "Project not found" };
  }

  if (!project.event_date) {
    return { success: false, booked: 0, reason: "No event date on project" };
  }

  // Fetch team assignments with member emails
  const { data: assignments, error: aErr } = await adminSupabase
    .from("project_team_assignments")
    .select("id, calendar_event_id, member:contacts(first_name, last_name, email)")
    .eq("project_id", projectId);

  if (aErr) return { success: false, booked: 0, reason: aErr.message };
  if (!assignments?.length) return { success: true, booked: 0, reason: "No team members assigned" };

  const clientName   = safeName(project.contact) || "Client";
  const eventSummary = `${clientName} – ${project.title}`;
  const startDate    = project.event_date as string;
  const endDate      = nextDay(startDate);

  let booked = 0;

  for (const row of assignments) {
    const email = (Array.isArray(row.member)
      ? (row.member[0] as { email?: string | null })?.email
      : (row.member as { email?: string | null } | null)?.email) ?? null;

    if (!email) continue;

    const eventBody = {
      summary:     eventSummary,
      description: `Project: ${project.title}\nClient: ${clientName}`,
      start:       { date: startDate },
      end:         { date: endDate },
      attendees:   [{ email, responseStatus: "accepted" }],
      reminders:   { useDefault: true },
    };

    const existingId = row.calendar_event_id as string | null;
    let newEventId: string | null = null;

    try {
      if (existingId) {
        // Update existing event
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${existingId}?sendUpdates=all`,
          {
            method:  "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body:    JSON.stringify(eventBody),
          },
        );

        if (res.ok) {
          newEventId = ((await res.json()) as { id: string }).id;
        } else if (res.status === 404) {
          // Event deleted externally — create a new one
          const cr = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?sendUpdates=all`,
            {
              method:  "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body:    JSON.stringify(eventBody),
            },
          );
          if (cr.ok) newEventId = ((await cr.json()) as { id: string }).id;
        }
      } else {
        // Create new event
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?sendUpdates=all`,
          {
            method:  "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body:    JSON.stringify(eventBody),
          },
        );
        if (res.ok) newEventId = ((await res.json()) as { id: string }).id;
      }

      if (newEventId) {
        await adminSupabase
          .from("project_team_assignments")
          .update({ calendar_event_id: newEventId, synced_at: new Date().toISOString() })
          .eq("id", row.id);
        booked++;
      }
    } catch (e) {
      console.error("[calendar] Event sync error for assignment", row.id, e);
    }
  }

  return { success: true, booked };
}
