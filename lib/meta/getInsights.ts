// Meta Graph API — peak posting times analysis

export interface DaySchedule {
  post: string; // HH:MM
  reel: string; // HH:MM
}

export interface PostingSchedule {
  monday:    DaySchedule;
  tuesday:   DaySchedule;
  wednesday: DaySchedule;
  thursday:  DaySchedule;
  friday:    DaySchedule;
  saturday:  DaySchedule;
  sunday:    DaySchedule;
}

const INDUSTRY_DEFAULTS: PostingSchedule = {
  monday:    { post: "10:00", reel: "18:00" },
  tuesday:   { post: "09:00", reel: "19:00" },
  wednesday: { post: "10:00", reel: "18:00" },
  thursday:  { post: "09:00", reel: "20:00" },
  friday:    { post: "08:00", reel: "19:00" },
  saturday:  { post: "08:00", reel: "20:00" },
  sunday:    { post: "09:00", reel: "19:00" },
};

const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;

function peakHourToTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function analysePeakHours(fansByHour: Record<number, number>): { postHour: number; reelHour: number } {
  const hours = Object.entries(fansByHour).map(([h, v]) => ({ h: Number(h), v }));
  hours.sort((a, b) => b.v - a.v);

  // Top peak = reel time, second peak (or +4h) = post time
  const reelHour = hours[0]?.h ?? 18;
  const postPeak = hours.find((x) => Math.abs(x.h - reelHour) >= 3);
  const postHour = postPeak?.h ?? (reelHour >= 12 ? 10 : 18);

  return { postHour, reelHour };
}

export async function getBestPostingTimes(): Promise<PostingSchedule> {
  const pageId  = process.env.META_PAGE_ID;
  const token   = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    console.warn("[Meta] PAGE_ID or ACCESS_TOKEN not set — using industry defaults");
    return INDUSTRY_DEFAULTS;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/insights?metric=page_fans_online_per_day&access_token=${token}`;
    const res  = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.warn("[Meta] Insights API error — using industry defaults");
      return INDUSTRY_DEFAULTS;
    }

    const json = await res.json() as {
      data?: Array<{ name: string; values: Array<{ value: Record<string, number>; end_time: string }> }>;
    };

    const insight = json.data?.find((d) => d.name === "page_fans_online_per_day");
    if (!insight?.values?.length) return INDUSTRY_DEFAULTS;

    // Aggregate across all data points by weekday
    const byDayAndHour: Record<number, Record<number, number>> = {};
    for (const entry of insight.values) {
      const date    = new Date(entry.end_time);
      const weekday = (date.getDay() + 6) % 7; // 0=Monday … 6=Sunday
      byDayAndHour[weekday] = byDayAndHour[weekday] ?? {};
      for (const [hour, count] of Object.entries(entry.value ?? {})) {
        const h = Number(hour);
        byDayAndHour[weekday][h] = (byDayAndHour[weekday][h] ?? 0) + (count as number);
      }
    }

    const schedule = {} as PostingSchedule;
    DAY_KEYS.forEach((key, i) => {
      const hours = byDayAndHour[i];
      if (!hours || Object.keys(hours).length === 0) {
        schedule[key] = INDUSTRY_DEFAULTS[key];
        return;
      }
      const { postHour, reelHour } = analysePeakHours(hours);
      schedule[key] = {
        post: peakHourToTime(postHour),
        reel: peakHourToTime(reelHour),
      };
    });

    return schedule;
  } catch (err) {
    console.error("[Meta] getInsights error:", err);
    return INDUSTRY_DEFAULTS;
  }
}
