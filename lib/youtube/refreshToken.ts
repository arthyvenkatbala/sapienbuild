import { adminSupabase } from "@/lib/supabase-admin";

export async function getValidYouTubeToken(): Promise<string | null> {
  const { data: row } = await adminSupabase
    .from("youtube_tokens")
    .select("access_token, refresh_token, expiry")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!row) return null;

  // Return existing token if still valid (with 2-min buffer)
  if (new Date(row.expiry).getTime() > Date.now() + 120_000) {
    return row.access_token as string;
  }

  // Refresh the token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: row.refresh_token as string,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("[YouTube] Token refresh failed:", await res.text());
    return null;
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await adminSupabase
    .from("youtube_tokens")
    .update({ access_token: data.access_token, expiry })
    .eq("refresh_token", row.refresh_token);

  return data.access_token;
}
