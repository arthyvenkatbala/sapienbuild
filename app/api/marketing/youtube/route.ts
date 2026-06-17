import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

async function refreshAccessToken(
  refreshToken: string,
  tokenId: string,
): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.YOUTUBE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json() as { access_token: string; expires_in: number };
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await adminSupabase
    .from("youtube_tokens")
    .update({ access_token: data.access_token, expiry })
    .eq("id", tokenId);
  return data.access_token;
}

export async function GET() {
  const { data: row } = await adminSupabase
    .from("youtube_tokens")
    .select("id, access_token, refresh_token, expiry")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row?.access_token) {
    return NextResponse.json({ connected: false });
  }

  // Refresh if expiring within 60 seconds
  let accessToken = row.access_token;
  if (row.refresh_token && row.expiry && new Date(row.expiry).getTime() < Date.now() + 60_000) {
    const refreshed = await refreshAccessToken(row.refresh_token, row.id as string);
    if (refreshed) accessToken = refreshed;
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache:   "no-store",
      },
    );

    if (!res.ok) {
      console.warn("[YouTube] API returned", res.status, await res.text());
      return NextResponse.json({ connected: true, subscribers: 0, views: 0, videoCount: 0, synced_at: new Date().toISOString() });
    }

    type ChannelStats = {
      items?: Array<{
        statistics: {
          subscriberCount?: string;
          viewCount?: string;
          videoCount?: string;
          hiddenSubscriberCount?: boolean;
        };
      }>;
    };
    const data = await res.json() as ChannelStats;
    const stats = data.items?.[0]?.statistics;

    return NextResponse.json({
      connected:    true,
      subscribers:  Number(stats?.subscriberCount ?? 0),
      views:        Number(stats?.viewCount ?? 0),
      videoCount:   Number(stats?.videoCount ?? 0),
      subscriberCountHidden: stats?.hiddenSubscriberCount ?? false,
      synced_at:    new Date().toISOString(),
    });
  } catch (e) {
    console.error("[YouTube] Fetch failed:", e);
    return NextResponse.json({ connected: true, error: "Failed to fetch YouTube data" });
  }
}
