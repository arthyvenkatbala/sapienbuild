import { adminSupabase } from "@/lib/supabase-admin";
import { scanPhotoFolder, scanVideoFolder, getDriveFileUrl, getDriveThumbnailUrl } from "@/lib/drive/scanFolder";
import { getBestPostingTimes, type PostingSchedule } from "@/lib/meta/getInsights";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentSettings {
  photos_folder_id:              string | null;
  videos_folder_id:              string | null;
  caption_tone:                  string;
  always_include_hashtags:       string[];
  blackout_days:                 number[];
  min_days_between_same_wedding: number;
}

interface ClaudeSuggestion {
  day:            number;
  day_label:      string;
  type:           "post" | "reel";
  file_id:        string;
  file_name:      string;
  caption:        string;
  hashtags:       string[];
  posting_reason: string;
  content_theme:  string;
}

export interface RunContentAgentOptions {
  generatedBy:       "cron" | "manual";
  runId?:            string;     // pre-created run record id; created internally if omitted
  weekStart?:        string;     // defaults to current Monday
  triggeredByUserId?: string;
}

const DAY_KEYS = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
] as const;
type DayKey = (typeof DAY_KEYS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMondayDate(): string {
  const now  = new Date();
  const day  = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(now);
  mon.setUTCDate(now.getUTCDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function getSuggestedTime(schedule: PostingSchedule, dayIndex: number, type: "post" | "reel"): string {
  const key = DAY_KEYS[dayIndex] as DayKey;
  return type === "post" ? schedule[key].post : schedule[key].reel;
}

// ─── Core pipeline ────────────────────────────────────────────────────────────

export async function runContentAgent(options: RunContentAgentOptions): Promise<void> {
  const { generatedBy, triggeredByUserId } = options;
  const weekStart = options.weekStart ?? getMondayDate();

  // ── Load settings ────────────────────────────────────────────────────────────
  const { data: settingsRow } = await adminSupabase
    .from("agent_settings")
    .select("*")
    .limit(1)
    .single();

  const settings: AgentSettings = settingsRow ?? {
    photos_folder_id:              null,
    videos_folder_id:              null,
    caption_tone:                  "storytelling",
    always_include_hashtags:       [],
    blackout_days:                 [],
    min_days_between_same_wedding: 3,
  };

  if (!settings.photos_folder_id && !settings.videos_folder_id) {
    console.log("[Agent] Folders not configured — skipping");
    return;
  }

  // ── Cron guard: skip if plan already exists for this week ─────────────────────
  if (generatedBy === "cron") {
    const { data: existing } = await adminSupabase
      .from("content_suggestions")
      .select("id")
      .eq("week_start", weekStart)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[Agent] Cron: plan already exists for week ${weekStart} — skipping`);
      return;
    }
  }

  // ── Create or update run record ───────────────────────────────────────────────
  let runId = options.runId;
  if (!runId) {
    const { data: runRow } = await adminSupabase
      .from("content_agent_runs")
      .insert({
        week_start:             weekStart,
        status:                 "running",
        generated_by:           generatedBy,
        triggered_by_user_id:   triggeredByUserId ?? null,
      })
      .select("id")
      .single();
    runId = runRow?.id as string | undefined;
  } else {
    // Update existing record with provenance (was pre-created before `after()`)
    await adminSupabase
      .from("content_agent_runs")
      .update({ generated_by: generatedBy, triggered_by_user_id: triggeredByUserId ?? null })
      .eq("id", runId);
  }

  try {
    // ── Scan Drive folders ────────────────────────────────────────────────────
    const [photos, videos] = await Promise.all([
      scanPhotoFolder(),
      scanVideoFolder(),
    ]);

    // ── Fetch rejected file IDs (excluded from future suggestions) ─────────────
    const { data: rejectedRows } = await adminSupabase
      .from("content_suggestions")
      .select("drive_file_id")
      .eq("status", "rejected")
      .not("rejected_at", "is", null);

    const rejectedIds = new Set((rejectedRows ?? []).map((r) => r.drive_file_id as string));

    const filteredPhotos = photos.filter((p) => !rejectedIds.has(p.id));
    const filteredVideos = videos.filter((v) => !rejectedIds.has(v.id));

    // ── Get posting schedule ─────────────────────────────────────────────────
    const schedule = await getBestPostingTimes();

    // ── Build Claude prompt ──────────────────────────────────────────────────
    const toneDesc = {
      storytelling: "authentic, emotional, 150–250 words",
      promotional:  "benefit-focused, 80–120 words",
      minimal:      "clean, poetic, under 60 words",
    }[settings.caption_tone] ?? "authentic, emotional, 150–250 words";

    const hashtags = (settings.always_include_hashtags ?? []).join(" ");

    const systemPrompt = `You are a social media strategist for One Thousand Tales, a premium wedding photography studio by Dilip Kumar in Chennai, India. You select the best content for weekly Instagram, Facebook, and YouTube Shorts posts.

For photo posts: prioritise emotional candid moments, beautiful natural light, joyful reactions, intimate portraits. Avoid blurry, poorly lit, or repetitive shots.

For video/reels: prioritise clips with strong visual opening, emotional moments, movement, good composition.

Caption style: ${settings.caption_tone} — ${toneDesc}

Always include these hashtags: ${hashtags}
Add 10–15 more relevant hashtags per post.

Never schedule the same wedding on consecutive days. Minimum ${settings.min_days_between_same_wedding} days between content from the same wedding.

Vary themes across the week: do not post the same theme (e.g. couple portraits) two days in a row.

You MUST respond with ONLY valid JSON — no markdown, no code blocks, no explanation text.`;

    const userPrompt = `Plan content for week starting ${weekStart}.

Available photos (${filteredPhotos.length} files):
${filteredPhotos.slice(0, 50).map((p) => `${p.id}: ${p.name} (${p.createdTime})`).join("\n")}

Available videos (${filteredVideos.length} files):
${filteredVideos.slice(0, 30).map((v) => `${v.id}: ${v.name} (${v.createdTime})`).join("\n")}

Select exactly 7 photos (type: "post") and 7 videos (type: "reel").
One photo post and one reel per day for 7 days (day 1=Monday through day 7=Sunday).

Respond ONLY with valid JSON:
{
  "suggestions": [
    {
      "day": 1,
      "day_label": "Monday",
      "type": "post",
      "file_id": "google_drive_file_id",
      "file_name": "filename.jpg",
      "caption": "full caption text here",
      "hashtags": ["#tag1", "#tag2"],
      "posting_reason": "why this specific file was selected",
      "content_theme": "ceremony|portraits|candid|details|family|reception|getting_ready"
    }
  ]
}`;

    // ── Call Claude ───────────────────────────────────────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not set");

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 4000,
        system:     systemPrompt,
        messages:   [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      throw new Error(`Claude API error: ${claudeRes.status} ${await claudeRes.text()}`);
    }

    const claudeData = await claudeRes.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const rawText = claudeData.content.find((c) => c.type === "text")?.text ?? "";

    // ── Parse & validate ─────────────────────────────────────────────────────
    let parsed: { suggestions: ClaudeSuggestion[] };
    try {
      const clean = rawText.replace(/```(?:json)?/g, "").trim();
      parsed = JSON.parse(clean) as { suggestions: ClaudeSuggestion[] };
    } catch {
      throw new Error(`Failed to parse Claude response: ${rawText.slice(0, 200)}`);
    }

    const suggestions = parsed.suggestions;
    if (!Array.isArray(suggestions) || suggestions.length < 14) {
      throw new Error(`Expected 14 suggestions, got ${suggestions?.length ?? 0}`);
    }

    // ── Save to Supabase ─────────────────────────────────────────────────────
    const rows = suggestions.map((s) => {
      const dayIdx      = s.day - 1;
      const suggestTime = getSuggestedTime(schedule, dayIdx, s.type);
      const platforms   = s.type === "post"
        ? ["facebook", "instagram"]
        : ["facebook", "instagram", "youtube"];

      return {
        week_start:          weekStart,
        day_of_week:         s.day,
        content_type:        s.type,
        drive_file_id:       s.file_id,
        drive_file_name:     s.file_name,
        drive_file_url:      getDriveFileUrl(s.file_id),
        drive_thumbnail_url: getDriveThumbnailUrl(s.file_id),
        caption:             s.caption,
        hashtags:            s.hashtags,
        suggested_time:      suggestTime,
        suggested_day_label: s.day_label,
        platforms,
        posting_reason:      s.posting_reason,
        content_theme:       s.content_theme,
        status:              "pending",
      };
    });

    const { error: insertErr } = await adminSupabase
      .from("content_suggestions")
      .insert(rows);

    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // ── Mark run complete ─────────────────────────────────────────────────────
    if (runId) {
      await adminSupabase
        .from("content_agent_runs")
        .update({
          photos_scanned:        photos.length,
          videos_scanned:        videos.length,
          suggestions_generated: rows.length,
          status:                "completed",
        })
        .eq("id", runId);
    }

    console.log(`[Agent] ${generatedBy} run — week ${weekStart} — ${rows.length} suggestions generated`);
  } catch (err) {
    console.error("[Agent] runContentAgent error:", err);
    if (runId) {
      await adminSupabase
        .from("content_agent_runs")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", runId);
    }
    throw err;
  }
}
