import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import { makeFilePublic } from "@/lib/drive/scanFolder";
import { postYouTubeShort } from "@/lib/youtube/postShort";
import { getValidYouTubeToken } from "@/lib/youtube/refreshToken";

const META_GRAPH = "https://graph.facebook.com/v19.0";

async function postToFacebook(
  pageId: string,
  token: string,
  contentType: "post" | "reel",
  fileUrl: string,
  caption: string,
): Promise<string | null> {
  if (contentType === "post") {
    const res = await fetch(`${META_GRAPH}/${pageId}/photos`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: fileUrl, caption, access_token: token }),
    });
    const data = await res.json() as { id?: string; error?: { message: string } };
    if (data.error) {
      console.error("[Meta] Photo post error:", data.error.message);
      return null;
    }
    return data.id ?? null;
  } else {
    const res = await fetch(`${META_GRAPH}/${pageId}/videos`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        file_url:      fileUrl,
        description:   caption,
        published:     true,
        access_token:  token,
      }),
    });
    const data = await res.json() as { id?: string; error?: { message: string } };
    if (data.error) {
      console.error("[Meta] Video post error:", data.error.message);
      return null;
    }
    return data.id ?? null;
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { suggestion_id, caption_override } = body as {
    suggestion_id:   string;
    caption_override?: string;
  };

  if (!suggestion_id) {
    return NextResponse.json({ error: "suggestion_id required" }, { status: 422 });
  }

  // 1. Fetch suggestion
  const { data: suggestion, error: fetchErr } = await adminSupabase
    .from("content_suggestions")
    .select("*")
    .eq("id", suggestion_id)
    .single();

  if (fetchErr || !suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  if (suggestion.status === "posted" || suggestion.status === "skipped") {
    return NextResponse.json({ error: "Already posted or skipped" }, { status: 400 });
  }

  // 2. Get public Drive URL
  const fileId  = suggestion.drive_file_id as string;
  const fileUrl = await makeFilePublic(fileId).catch(() => suggestion.drive_file_url as string);

  // 3. Caption (use override or original, then caption_edited)
  const caption =
    (caption_override as string | undefined) ??
    (suggestion.caption_edited as string | null) ??
    (suggestion.caption as string);

  const pageId = process.env.META_PAGE_ID;
  const token  = process.env.META_PAGE_ACCESS_TOKEN;

  const postedTo: string[]    = [];
  let   facebookPostId: string | null = null;
  let   youtubeVideoId: string | null = null;

  // 4. Post to Facebook + Instagram
  if (pageId && token) {
    facebookPostId = await postToFacebook(
      pageId,
      token,
      suggestion.content_type as "post" | "reel",
      fileUrl,
      caption,
    );
    if (facebookPostId) {
      postedTo.push("facebook", "instagram");
    }
  }

  // 5. Post to YouTube (reels only, if connected)
  if (suggestion.content_type === "reel") {
    const ytToken = await getValidYouTubeToken().catch(() => null);
    if (ytToken) {
      try {
        const firstSentence = caption.split(/[.!?]/)[0]?.trim() ?? "Wedding Reel";
        const title         = `${firstSentence} #Shorts`;
        youtubeVideoId = await postYouTubeShort(
          fileUrl,
          title,
          caption,
          (suggestion.hashtags as string[]) ?? [],
        );
        postedTo.push("youtube");
      } catch (err) {
        console.error("[PostNow] YouTube posting failed:", err);
        // Non-fatal — still mark as posted to Meta
      }
    }
  }

  // 6. Update DB
  await adminSupabase
    .from("content_suggestions")
    .update({
      status:           "posted",
      posted_at:        new Date().toISOString(),
      facebook_post_id: facebookPostId,
      youtube_video_id: youtubeVideoId,
    })
    .eq("id", suggestion_id);

  return NextResponse.json({
    success:          true,
    posted_to:        postedTo,
    facebook_post_id: facebookPostId,
    youtube_video_id: youtubeVideoId,
  });
}
