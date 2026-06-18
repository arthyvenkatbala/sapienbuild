"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface SocialPost {
  id:         string;
  platform:   string;
  caption:    string;
  likes:      number | null;
  comments:   number | null;
  reach:      number | null;
  created_at: string;
}

interface YoutubeData {
  connected:    boolean;
  subscribers?: number;
  views?:       number;
  videoCount?:  number;
  synced_at?:   string;
}

interface FacebookData {
  connected:        boolean;
  name?:            string;
  followers?:       number;
  reach?:           number;
  engagedUsers?:    number;
  postEngagements?: number;
  synced_at?:       string;
  error?:           string;
}

interface InstagramData {
  connected:    boolean;
  username?:    string | null;
  followers?:   number;
  mediaCount?:  number;
  reach?:       number;
  impressions?: number;
  synced_at?:   string;
  reason?:      string;
  error?:       string;
}

interface PixelData {
  configured:    boolean;
  pixelId?:      string;
  pixelName?:    string | null;
  lastFiredTime?: string | null;
  pageViews?:    number;
  leads?:        number;
  purchases?:    number;
  synced_at?:    string;
}

const PLATFORM_COLOR: Record<string, string> = {
  facebook:  "#1877f2",
  instagram: "#e91e8c",
  youtube:   "#ff0000",
};

const PLATFORM_BADGE: Record<string, string> = {
  facebook:  "bg-blue-500/10 border-blue-500/20 text-blue-400",
  instagram: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  youtube:   "bg-red-500/10 border-red-500/20 text-red-400",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-zinc-400 mb-1.5">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300">{p.name}</span>
          <span className="font-bold text-white ml-1">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function PlatformCard({
  platform, icon, stat, label, sub, connected, notConfigured,
}: {
  platform:       string;
  icon:           string;
  stat?:          string;
  label:          string;
  sub?:           string;
  connected:      boolean;
  notConfigured?: boolean;
}) {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-white capitalize">{platform}</span>
        {connected ? (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px]">
            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />Active
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-zinc-600">
            {notConfigured ? "Not connected" : "Not connected"}
          </span>
        )}
      </div>
      {connected && stat ? (
        <>
          <p className="text-xl font-bold text-white">{stat}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
        </>
      ) : (
        <p className="text-xs text-zinc-600">
          {notConfigured ? "Connect in Settings to see data" : "Connect in Settings to see data"}
        </p>
      )}
    </div>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day:      "numeric",
    month:    "short",
    hour:     "2-digit",
    minute:   "2-digit",
  }) + " IST";
}

export default function SocialTab({ days = 30 }: { days?: number }) {
  const [posts,     setPosts]     = useState<SocialPost[]>([]);
  const [youtube,   setYoutube]   = useState<YoutubeData | null>(null);
  const [facebook,  setFacebook]  = useState<FacebookData | null>(null);
  const [instagram, setInstagram] = useState<InstagramData | null>(null);
  const [pixel,     setPixel]     = useState<PixelData | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch("/api/social/posts?limit=5").then((r) => r.ok ? r.json() : { posts: [] }),
      fetch(`/api/marketing/youtube`).then((r) => r.json()),
      fetch(`/api/marketing/facebook?days=${days}`).then((r) => r.json()),
      fetch(`/api/marketing/instagram?days=${days}`).then((r) => r.json()),
      fetch(`/api/marketing/pixel?days=${days}`).then((r) => r.json()),
    ]).then(([postsRes, ytRes, fbRes, igRes, pixelRes]) => {
      if (postsRes.status  === "fulfilled") setPosts((postsRes.value as { posts?: SocialPost[] }).posts ?? []);
      if (ytRes.status     === "fulfilled") setYoutube(ytRes.value as YoutubeData);
      if (fbRes.status     === "fulfilled") setFacebook(fbRes.value as FacebookData);
      if (igRes.status     === "fulfilled") setInstagram(igRes.value as InstagramData);
      if (pixelRes.status  === "fulfilled") setPixel(pixelRes.value as PixelData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [days]);

  // Build Facebook sub-text: reach + engaged users if available
  const fbSub = facebook?.connected
    ? [
        facebook.reach        ? `${facebook.reach.toLocaleString()} reach`         : null,
        facebook.engagedUsers ? `${facebook.engagedUsers.toLocaleString()} engaged` : null,
      ].filter(Boolean).join(" · ") || `last ${days} days`
    : undefined;

  // Instagram sub-text
  const igSub = instagram?.connected
    ? [
        instagram.mediaCount ? `${instagram.mediaCount} posts` : null,
        instagram.reach       ? `${instagram.reach.toLocaleString()} reach`       : null,
      ].filter(Boolean).join(" · ") || undefined
    : instagram?.reason === "no_ig_account"
    ? "Link Instagram Business to your Facebook page in Page Settings"
    : undefined;

  // Pixel stat: show lastFiredTime if no event counts, or pageViews count
  const pixelStat = pixel?.configured
    ? (pixel.pageViews ?? 0) > 0
      ? pixel.pageViews!.toLocaleString()
      : "Active"
    : undefined;

  const pixelSub = pixel?.configured
    ? [
        pixel.pixelId ? `ID: ${pixel.pixelId}` : null,
        pixel.lastFiredTime ? `Last fired: ${fmtTime(pixel.lastFiredTime)}` : null,
        (pixel.leads ?? 0) > 0 ? `${pixel.leads} leads` : null,
      ].filter(Boolean).join(" · ") || undefined
    : undefined;

  const placeholderChartData = [
    { date: "Jun 1" }, { date: "Jun 5" }, { date: "Jun 10" }, { date: "Jun 12" },
  ];

  return (
    <div className="space-y-5">
      {/* Platform stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Facebook */}
        <PlatformCard
          platform="Facebook"
          icon="📘"
          label="Page followers"
          connected={facebook?.connected ?? false}
          stat={!loading && facebook?.connected && facebook.followers !== undefined
            ? facebook.followers.toLocaleString()
            : undefined}
          sub={!loading ? fbSub : undefined}
          notConfigured={!loading && !facebook?.connected}
        />

        {/* Instagram */}
        <PlatformCard
          platform="Instagram"
          icon="📷"
          label={instagram?.username ? `@${instagram.username}` : "Followers"}
          connected={instagram?.connected ?? false}
          stat={!loading && instagram?.connected && instagram.followers !== undefined
            ? instagram.followers.toLocaleString()
            : undefined}
          sub={!loading ? igSub : undefined}
          notConfigured={!loading && !instagram?.connected}
        />

        {/* YouTube */}
        <PlatformCard
          platform="YouTube"
          icon="▶️"
          label="Subscribers"
          connected={youtube?.connected ?? false}
          stat={youtube?.connected && youtube.subscribers !== undefined
            ? youtube.subscribers.toLocaleString()
            : undefined}
          sub={youtube?.connected && youtube.videoCount !== undefined
            ? `${youtube.videoCount} videos · ${(youtube.views ?? 0).toLocaleString()} views`
            : undefined}
          notConfigured={!loading && !youtube?.connected}
        />

        {/* FB Pixel */}
        <PlatformCard
          platform="FB Pixel"
          icon="🎯"
          label="Page views (ad-attributed)"
          connected={pixel?.configured ?? false}
          stat={!loading ? pixelStat : undefined}
          sub={!loading ? pixelSub : undefined}
          notConfigured={!loading && !pixel?.configured}
        />

      </div>

      {/* Synced timestamps row */}
      {!loading && (facebook?.synced_at || instagram?.synced_at) && (
        <p className="text-[10px] text-zinc-600">
          Social data synced:{" "}
          {fmtTime((facebook?.synced_at ?? instagram?.synced_at)!)}
          {" · "}Follower counts update in real-time from Meta API.
        </p>
      )}

      {/* Reach chart — placeholder until daily series data is available */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">Reach Over Time</h3>
        <p className="text-xs text-zinc-500 mb-4">Facebook · Instagram · YouTube</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={placeholderChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
              <Line type="monotone" dataKey="fb"  name="Facebook"  stroke={PLATFORM_COLOR.facebook}  strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="ig"  name="Instagram" stroke={PLATFORM_COLOR.instagram} strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="yt"  name="YouTube"   stroke={PLATFORM_COLOR.youtube}   strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Daily reach series requires a separate cron-cached collection (FR-31 known gap).
          Current data: follower counts and total reach for the selected period above.
        </p>
      </div>

      {/* FB/IG engagement detail — only when connected */}
      {!loading && (facebook?.connected || instagram?.connected) && (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Page Engagement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "FB Followers",  value: facebook?.connected  ? facebook.followers?.toLocaleString()          : "—" },
              { label: "FB Reach",      value: facebook?.connected  ? facebook.reach?.toLocaleString()              : "—" },
              { label: "FB Engaged",    value: facebook?.connected  ? facebook.engagedUsers?.toLocaleString()       : "—" },
              { label: "IG Followers",  value: instagram?.connected ? instagram.followers?.toLocaleString()         : instagram?.reason === "no_ig_account" ? "Not linked" : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-white mt-1">{value ?? "—"}</p>
              </div>
            ))}
          </div>
          {instagram?.reason === "no_ig_account" && (
            <p className="text-[10px] text-amber-400/70 mt-3">
              No Instagram Business account linked. Go to your Facebook Page Settings → Instagram to connect it.
            </p>
          )}
        </div>
      )}

      {/* Recent posts */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Top Performing Posts</h3>
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map((i) => <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-xs text-zinc-600">No posts found. Posts will appear here once published via the Social module.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Platform", "Caption", "Likes", "Comments", "Reach", "Date"].map((h) => (
                    <th key={h} className="text-left text-zinc-500 font-medium py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium capitalize ${PLATFORM_BADGE[post.platform.toLowerCase()] ?? "bg-white/[0.04] border-white/[0.07] text-zinc-400"}`}>
                        {post.platform}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-300 max-w-[200px] truncate">
                      {post.caption?.slice(0, 50) ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-400">{post.likes ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{post.comments ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{post.reach ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-zinc-500">
                      {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
