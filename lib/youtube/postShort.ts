import { getValidYouTubeToken } from "./refreshToken";

const YT_UPLOAD = "https://www.googleapis.com/upload/youtube/v3/videos";
const YT_API    = "https://www.googleapis.com/youtube/v3";

export async function postYouTubeShort(
  videoUrl: string,
  title: string,
  description: string,
  hashtags: string[],
): Promise<string> {
  const token = await getValidYouTubeToken();
  if (!token) throw new Error("YouTube not connected");

  // 1. Download video buffer
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Failed to fetch video: ${videoRes.status}`);
  const videoBuffer = await videoRes.arrayBuffer();

  // 2. Initiate resumable upload
  const safeTitle       = title.length > 100 ? title.substring(0, 97) + "..." : title;
  const cleanHashtags   = hashtags.map((h) => h.replace(/^#/, ""));
  const fullDescription = `${description}\n\n${hashtags.join(" ")}`;

  const metaBody = JSON.stringify({
    snippet: {
      title:       safeTitle,
      description: fullDescription,
      tags:        cleanHashtags,
      categoryId:  "26", // How-to & Style
    },
    status: { privacyStatus: "public" },
  });

  const initRes = await fetch(
    `${YT_UPLOAD}?uploadType=resumable&part=snippet,status`,
    {
      method:  "POST",
      headers: {
        Authorization:            `Bearer ${token}`,
        "Content-Type":           "application/json",
        "X-Upload-Content-Type":  "video/*",
        "X-Upload-Content-Length": String(videoBuffer.byteLength),
      },
      body: metaBody,
    },
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`YouTube upload init failed: ${err}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) throw new Error("No upload URL from YouTube");

  // 3. Upload video bytes
  const uploadRes = await fetch(uploadUrl, {
    method:  "PUT",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "video/*",
      "Content-Length": String(videoBuffer.byteLength),
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok && uploadRes.status !== 200 && uploadRes.status !== 201) {
    throw new Error(`YouTube upload failed: ${uploadRes.status}`);
  }

  const result = await uploadRes.json() as { id?: string };
  if (!result.id) throw new Error("YouTube upload returned no video ID");
  return result.id;
}

export async function getYouTubeChannelInfo(
  token: string,
): Promise<{ channelId: string; channelName: string } | null> {
  const res = await fetch(
    `${YT_API}/channels?part=snippet&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return null;
  const data = await res.json() as {
    items?: Array<{ id: string; snippet: { title: string } }>;
  };
  const ch = data.items?.[0];
  if (!ch) return null;
  return { channelId: ch.id, channelName: ch.snippet.title };
}
