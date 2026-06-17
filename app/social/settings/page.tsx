"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Save, Play, Loader2, Check, Folder, Clock, X, Plus,
  PlayCircle, Settings2, Calendar, Search, MapPin, Users,
  BarChart2, TrendingUp, Share2, Camera, Target,
} from "lucide-react";
import { useToast } from "@/lib/toast";

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-pink-500/40 transition-all";

const labelCls = "text-[10px] font-semibold uppercase tracking-widest text-zinc-500";

function SectionHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-5">
      <Icon size={15} className="text-pink-400" />
      {title}
    </h2>
  );
}

interface Settings {
  photos_folder_id:              string;
  videos_folder_id:              string;
  caption_tone:                  string;
  always_include_hashtags:       string[];
  blackout_days:                 number[];
  min_days_between_same_wedding: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Profile {
  id:         string;
  email:      string;
  role:       "admin" | "executive" | "member";
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: "admin",     label: "Admin" },
  { value: "executive", label: "Executive" },
  { value: "member",    label: "Member (no access)" },
] as const;

function SocialSettingsContent() {
  const toast       = useToast();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<Settings>({
    photos_folder_id:              "",
    videos_folder_id:              "",
    caption_tone:                  "storytelling",
    always_include_hashtags:       ["#OneTh ousandTales","#WeddingPhotography","#Chennai","#CandidWedding","#WeddingFilm"],
    blackout_days:                 [],
    min_days_between_same_wedding: 3,
  });

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [runningAgent,  setRunningAgent]  = useState(false);
  const [lastRun,       setLastRun]       = useState<string | null>(null);
  const [ytConnected,  setYtConnected]  = useState(false);
  const [ytChannel,    setYtChannel]    = useState<string | null>(null);
  const [gscConnected, setGscConnected] = useState(false);
  const [gscSiteUrl,   setGscSiteUrl]   = useState<string | null>(null);
  const [gmbConnected,  setGmbConnected]  = useState(false);
  const [gmbLocation,   setGmbLocation]   = useState<string | null>(null);
  const [calConnected,    setCalConnected]    = useState(false);
  const [calExpiry,       setCalExpiry]       = useState<string | null>(null);
  const [ga4Connected,    setGa4Connected]    = useState(false);
  const [ga4PropertyId,   setGa4PropertyId]   = useState<string | null>(null);
  const [gadsConnected,   setGadsConnected]   = useState(false);
  const [gadsCustomerId,  setGadsCustomerId]  = useState<string | null>(null);
  const [gadsAccountName, setGadsAccountName] = useState<string | null>(null);
  const [fbConnected,     setFbConnected]     = useState(false);
  const [fbPageName,      setFbPageName]      = useState<string | null>(null);
  const [fbFollowers,     setFbFollowers]     = useState<number | null>(null);
  const [igConnected,     setIgConnected]     = useState(false);
  const [igUsername,      setIgUsername]      = useState<string | null>(null);
  const [igFollowers,     setIgFollowers]     = useState<number | null>(null);
  const [igReason,        setIgReason]        = useState<string | null>(null);
  const [pixelConfigured, setPixelConfigured] = useState(false);
  const [pixelId,         setPixelId]         = useState<string | null>(null);
  const [pixelName,       setPixelName]       = useState<string | null>(null);
  const [pixelLastFired,  setPixelLastFired]  = useState<string | null>(null);
  const [newHashtag,      setNewHashtag]      = useState("");
  const [profiles,      setProfiles]      = useState<Profile[]>([]);
  const [savingRoleId,  setSavingRoleId]  = useState<string | null>(null);

  // ── Load settings ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, runsRes, ytRes, gscRes, gmbRes, calRes, ga4Res, gadsRes, fbRes, igRes, pixelRes, profilesRes] = await Promise.all([
        fetch("/api/agent/settings"),
        fetch("/api/agent/runs?limit=1"),
        fetch("/api/youtube/status"),
        fetch("/api/gsc/status"),
        fetch("/api/gmb/status"),
        fetch("/api/calendar/status"),
        fetch("/api/ga4/status"),
        fetch("/api/google-ads/status"),
        fetch("/api/marketing/facebook?days=7"),
        fetch("/api/marketing/instagram?days=7"),
        fetch("/api/marketing/pixel?days=7"),
        fetch("/api/admin/profiles"),
      ]);

      if (settingsRes.ok) {
        const d = await settingsRes.json() as { settings?: Settings };
        if (d.settings) {
          setSettings({
            photos_folder_id:              d.settings.photos_folder_id              ?? "",
            videos_folder_id:              d.settings.videos_folder_id              ?? "",
            caption_tone:                  d.settings.caption_tone                  ?? "storytelling",
            always_include_hashtags:       d.settings.always_include_hashtags       ?? [],
            blackout_days:                 d.settings.blackout_days                 ?? [],
            min_days_between_same_wedding: d.settings.min_days_between_same_wedding ?? 3,
          });
        }
      }

      if (runsRes.ok) {
        const d = await runsRes.json() as { runs?: Array<{ created_at: string; status: string }> };
        const last = d.runs?.[0];
        if (last) setLastRun(last.created_at);
      }

      if (ytRes.ok) {
        const d = await ytRes.json() as { connected: boolean; channel_name?: string };
        setYtConnected(d.connected);
        setYtChannel(d.channel_name ?? null);
      }

      if (gscRes.ok) {
        const d = await gscRes.json() as { connected: boolean; site_url?: string };
        setGscConnected(d.connected);
        setGscSiteUrl(d.site_url ?? null);
      }

      if (gmbRes.ok) {
        const d = await gmbRes.json() as { connected: boolean; location_name?: string };
        setGmbConnected(d.connected);
        setGmbLocation(d.location_name ?? null);
      }

      if (calRes.ok) {
        const d = await calRes.json() as { connected: boolean; expiry?: string | null };
        setCalConnected(d.connected);
        setCalExpiry(d.expiry ?? null);
      }

      if (fbRes.ok) {
        const d = await fbRes.json() as { connected: boolean; name?: string; followers?: number };
        setFbConnected(d.connected);
        setFbPageName(d.name ?? null);
        setFbFollowers(d.followers ?? null);
      }

      if (igRes.ok) {
        const d = await igRes.json() as { connected: boolean; username?: string | null; followers?: number; reason?: string };
        setIgConnected(d.connected);
        setIgUsername(d.username ?? null);
        setIgFollowers(d.followers ?? null);
        setIgReason(d.reason ?? null);
      }

      if (pixelRes.ok) {
        const d = await pixelRes.json() as { configured: boolean; pixelId?: string; pixelName?: string | null; lastFiredTime?: string | null };
        setPixelConfigured(d.configured);
        setPixelId(d.pixelId ?? null);
        setPixelName(d.pixelName ?? null);
        setPixelLastFired(d.lastFiredTime ?? null);
      }

      if (ga4Res.ok) {
        const d = await ga4Res.json() as { connected: boolean; property_id?: string | null };
        setGa4Connected(d.connected);
        setGa4PropertyId(d.property_id ?? null);
      }

      if (gadsRes.ok) {
        const d = await gadsRes.json() as { connected: boolean; customer_id?: string | null; account_name?: string | null };
        setGadsConnected(d.connected);
        setGadsCustomerId(d.customer_id ?? null);
        setGadsAccountName(d.account_name ?? null);
      }

      if (profilesRes.ok) {
        const d = await profilesRes.json() as { profiles?: Profile[] };
        setProfiles(d.profiles ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const ytStatus  = searchParams.get("youtube");
    if (ytStatus === "connected") toast("YouTube connected successfully!");
    if (ytStatus === "error")     toast("YouTube connection failed", "error");

    const gscStatus = searchParams.get("gsc");
    if (gscStatus === "connected") toast("Google Search Console connected!");
    if (gscStatus === "error")     toast("Search Console connection failed", "error");

    const gmbStatus = searchParams.get("gmb");
    if (gmbStatus === "connected") toast("Google My Business connected!");
    if (gmbStatus === "error")     toast("Google My Business connection failed", "error");

    const calStatus = searchParams.get("calendar");
    if (calStatus === "connected") toast("Google Calendar connected!");
    if (calStatus === "error")     toast("Google Calendar connection failed", "error");

    const ga4Status = searchParams.get("ga4");
    if (ga4Status === "connected") toast("Google Analytics (GA4) connected!");
    if (ga4Status === "error")     toast("GA4 connection failed", "error");

    const gadsStatus = searchParams.get("google-ads");
    if (gadsStatus === "connected") toast("Google Ads connected!");
    if (gadsStatus === "error")     toast("Google Ads connection failed", "error");
  }, [loadData, searchParams, toast]);

  // ── Save settings ──────────────────────────────────────────────────────────

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/agent/settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(settings),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast(d.error ?? "Save failed", "error");
        return;
      }
      toast("Settings saved");
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Run agent ─────────────────────────────────────────────────────────────

  const runAgent = async () => {
    setRunningAgent(true);
    try {
      const res  = await fetch("/api/agent/run-weekly", {
        method:  "POST",
        headers: { "x-cron-secret": process.env.NEXT_PUBLIC_CRON_SECRET ?? "" },
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { toast(data.error ?? "Agent run failed", "error"); return; }
      toast("Agent ran — 14 suggestions generated! Go to AI Suggestions.");
      setLastRun(new Date().toISOString());
    } catch {
      toast("Network error", "error");
    } finally {
      setRunningAgent(false);
    }
  };

  // ── Team roles ────────────────────────────────────────────────────────────

  const updateRole = async (id: string, role: Profile["role"]) => {
    setSavingRoleId(id);
    const prev = profiles;
    setProfiles((ps) => ps.map((p) => (p.id === id ? { ...p, role } : p)));
    try {
      const res = await fetch(`/api/admin/profiles/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role }),
      });
      if (!res.ok) {
        setProfiles(prev);
        const d = await res.json() as { error?: string };
        toast(d.error ?? "Failed to update role", "error");
        return;
      }
      toast("Role updated");
    } catch {
      setProfiles(prev);
      toast("Network error", "error");
    } finally {
      setSavingRoleId(null);
    }
  };

  // ── Hashtag helpers ────────────────────────────────────────────────────────

  const addHashtag = () => {
    const tag = newHashtag.trim().startsWith("#")
      ? newHashtag.trim()
      : `#${newHashtag.trim()}`;
    if (!tag || tag === "#") return;
    if (!settings.always_include_hashtags.includes(tag)) {
      setSettings((s) => ({ ...s, always_include_hashtags: [...s.always_include_hashtags, tag] }));
    }
    setNewHashtag("");
  };

  const removeHashtag = (h: string) => {
    setSettings((s) => ({
      ...s,
      always_include_hashtags: s.always_include_hashtags.filter((x) => x !== h),
    }));
  };

  const toggleBlackout = (day: number) => {
    setSettings((s) => ({
      ...s,
      blackout_days: s.blackout_days.includes(day)
        ? s.blackout_days.filter((d) => d !== day)
        : [...s.blackout_days, day],
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 size={22} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Social Settings</h1>
          <p className="text-xs text-zinc-500">Configure your AI content agent</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-50 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save Settings
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-2xl w-full space-y-10">

        {/* ─── A. Content Folders ──────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Folder} title="Content Folders" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Photos Folder ID</label>
              <input
                className={inputCls}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={settings.photos_folder_id}
                onChange={(e) => setSettings((s) => ({ ...s, photos_folder_id: e.target.value }))}
              />
              <p className="text-[10px] text-zinc-600">
                Open folder in Google Drive → copy the ID from the URL (after /folders/)
              </p>
              {settings.photos_folder_id && (
                <p className="flex items-center gap-1 text-[10px] text-green-400">
                  <Check size={10} /> Folder ID set
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Videos Folder ID</label>
              <input
                className={inputCls}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={settings.videos_folder_id}
                onChange={(e) => setSettings((s) => ({ ...s, videos_folder_id: e.target.value }))}
              />
              {settings.videos_folder_id && (
                <p className="flex items-center gap-1 text-[10px] text-green-400">
                  <Check size={10} /> Folder ID set
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── B. Agent Schedule ───────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Clock} title="Agent Schedule" />
          <div className="bg-pink-500/5 border border-pink-500/15 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-zinc-300">
              Agent runs automatically every <span className="text-pink-300 font-medium">Monday at 6:00 AM IST</span> to generate the week&apos;s content plan.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Last run</p>
              <p className="text-sm text-zinc-300 mt-0.5">
                {lastRun
                  ? new Date(lastRun).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
                  : "Never run"}
              </p>
            </div>
            <button
              onClick={runAgent}
              disabled={runningAgent}
              className="flex items-center gap-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-50 px-4 py-2 rounded-xl transition-all"
            >
              {runningAgent
                ? <><Loader2 size={13} className="animate-spin" /> Running…</>
                : <><Play size={13} /> Run agent now</>}
            </button>
          </div>
        </section>

        {/* ─── C. Caption Preferences ──────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Settings2} title="Caption Preferences" />

          <div className="space-y-5">
            <div className="space-y-2">
              <label className={labelCls}>Caption Tone</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "storytelling", label: "Storytelling",  desc: "Authentic, emotional (150–250 words)" },
                  { value: "promotional",  label: "Promotional",   desc: "Benefit-focused (80–120 words)" },
                  { value: "minimal",      label: "Minimal",       desc: "Clean, poetic (under 60 words)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSettings((s) => ({ ...s, caption_tone: opt.value }))}
                    className={`px-3 py-2 rounded-xl border text-sm transition-all text-left ${
                      settings.caption_tone === opt.value
                        ? "bg-pink-500/15 border-pink-500/40 text-pink-300"
                        : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.15]"
                    }`}
                  >
                    <p className="font-medium leading-none">{opt.label}</p>
                    <p className="text-[10px] mt-1 opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Always Include Hashtags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {settings.always_include_hashtags.map((h) => (
                  <span key={h} className="flex items-center gap-1 text-xs bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2.5 py-1 rounded-lg">
                    {h}
                    <button onClick={() => removeHashtag(h)} className="hover:text-white transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="#NewHashtag"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); }}}
                />
                <button
                  onClick={addHashtag}
                  className="shrink-0 px-3 py-2 rounded-xl bg-pink-600/80 hover:bg-pink-600 text-white transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Min. days between same wedding</label>
              <input
                type="number"
                min={1}
                max={7}
                className={inputCls + " max-w-[120px]"}
                value={settings.min_days_between_same_wedding}
                onChange={(e) => setSettings((s) => ({ ...s, min_days_between_same_wedding: Number(e.target.value) || 3 }))}
              />
            </div>
          </div>
        </section>

        {/* ─── D. Blackout Days ────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Calendar} title="Blackout Days" />
          <p className="text-xs text-zinc-500 mb-4">Uncheck days to skip content suggestions on those days.</p>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, i) => {
              const dayNum = i + 1;
              const active = !settings.blackout_days.includes(dayNum);
              return (
                <button
                  key={dayNum}
                  onClick={() => toggleBlackout(dayNum)}
                  className={`w-12 py-2 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? "bg-pink-500/15 border-pink-500/40 text-pink-300"
                      : "border-white/[0.07] text-zinc-600"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── E. YouTube ──────────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={PlayCircle} title="YouTube" />
          {ytConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> YouTube connected
                </p>
                {ytChannel && (
                  <p className="text-xs text-zinc-500 mt-0.5">Channel: {ytChannel}</p>
                )}
              </div>
              <a
                href="/api/youtube/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Connect YouTube to post reels as Shorts automatically.</p>
              <a
                href="/api/youtube/auth"
                className="flex items-center gap-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all"
              >
                <PlayCircle size={13} /> Connect YouTube
              </a>
            </div>
          )}
        </section>

        {/* ─── F. Facebook Page ────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Share2} title="Facebook Page" />
          {fbConnected ? (
            <div>
              <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                <Check size={14} /> Facebook Page connected
              </p>
              {fbPageName  && <p className="text-xs text-zinc-500 mt-0.5">Page: {fbPageName}</p>}
              {fbFollowers !== null && <p className="text-xs text-zinc-600">{fbFollowers.toLocaleString()} followers</p>}
              <p className="text-xs text-zinc-600 mt-2">
                Managed via <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">META_PAGE_ID</code> and{" "}
                <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">META_PAGE_ACCESS_TOKEN</code> environment variables.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Facebook Page is not connected. Follower counts, reach, and engagement will show in the Marketing → Social tab once configured.
              </p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">How to connect</p>
                <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                  <li>Go to Meta Developer Console → your app → Page Access Tokens</li>
                  <li>Copy your Page ID and a long-lived Page Access Token with <code className="text-zinc-400">pages_read_engagement</code> permission</li>
                  <li>Add <code className="text-zinc-400">META_PAGE_ID</code> and <code className="text-zinc-400">META_PAGE_ACCESS_TOKEN</code> to Vercel Environment Variables</li>
                  <li>Redeploy or wait for the next deployment</li>
                </ol>
              </div>
            </div>
          )}
        </section>

        {/* ─── G. Instagram Business ───────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Camera} title="Instagram Business" />
          {igConnected ? (
            <div>
              <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                <Check size={14} /> Instagram Business connected
              </p>
              {igUsername  && <p className="text-xs text-zinc-500 mt-0.5">@{igUsername}</p>}
              {igFollowers !== null && <p className="text-xs text-zinc-600">{igFollowers.toLocaleString()} followers</p>}
              <p className="text-xs text-zinc-600 mt-2">
                Pulled from the Instagram Business account linked to your Facebook Page.
              </p>
            </div>
          ) : igReason === "no_ig_account" ? (
            <div className="space-y-3">
              <p className="text-sm text-amber-400/80">
                Facebook Page is connected but no Instagram Business account is linked to it.
              </p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">How to link Instagram</p>
                <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                  <li>Go to your Facebook Page → <strong className="text-zinc-400">Settings</strong> → <strong className="text-zinc-400">Linked Accounts</strong></li>
                  <li>Click <strong className="text-zinc-400">Connect account</strong> next to Instagram</li>
                  <li>Log in with your Instagram Business or Creator account</li>
                  <li>Refresh this page — Instagram data will appear automatically</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">
              Connect your Facebook Page first (section above), then link an Instagram Business account to it.
            </p>
          )}
        </section>

        {/* ─── H. FB Pixel ─────────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Target} title="Facebook Pixel" />
          {pixelConfigured ? (
            <div>
              <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                <Check size={14} /> Pixel configured
              </p>
              {pixelId   && <p className="text-xs text-zinc-500 mt-0.5">Pixel ID: {pixelId}{pixelName ? ` (${pixelName})` : ""}</p>}
              {pixelLastFired && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  Last event: {new Date(pixelLastFired).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST
                </p>
              )}
              <p className="text-xs text-zinc-600 mt-2">
                Ad-attributed page views, leads, and purchases appear in Marketing → Social tab.
                Managed via <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">META_PIXEL_ID</code> or{" "}
                <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">NEXT_PUBLIC_META_PIXEL_ID</code> environment variable.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Facebook Pixel is not configured. Set <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">META_PIXEL_ID</code> in Vercel Environment Variables to enable event tracking visibility.
              </p>
              <p className="text-xs text-zinc-600">
                The Pixel script must also be installed on your website (onethousandtales.com). If it's already installed, add the Pixel ID env var and redeploy.
              </p>
            </div>
          )}
        </section>

        {/* ─── J. Google Search Console ────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Search} title="Google Search Console" />
          {gscConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> Search Console connected
                </p>
                {gscSiteUrl && (
                  <p className="text-xs text-zinc-500 mt-0.5">Site: {gscSiteUrl}</p>
                )}
              </div>
              <a
                href="/api/gsc/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Connect to pull search performance data for your site.</p>
              <a
                href="/api/gsc/auth"
                className="flex items-center gap-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all"
              >
                <Search size={13} /> Connect Search Console
              </a>
            </div>
          )}
        </section>

        {/* ─── G. Google My Business ───────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={MapPin} title="Google My Business" />
          {gmbConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> Google My Business connected
                </p>
                {gmbLocation && (
                  <p className="text-xs text-zinc-500 mt-0.5">Location: {gmbLocation}</p>
                )}
              </div>
              <a
                href="/api/gmb/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Connect to manage reviews and posts on your Business Profile.</p>
              <a
                href="/api/gmb/auth"
                className="flex items-center gap-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all"
              >
                <MapPin size={13} /> Connect My Business
              </a>
            </div>
          )}
        </section>

        {/* ─── H. Google Calendar ──────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Calendar} title="Google Calendar" />
          {calConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> Google Calendar connected
                </p>
                {calExpiry && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Token valid until{" "}
                    {new Date(calExpiry).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
                  Team members are booked automatically when a quote is sent.
                </p>
              </div>
              <a
                href="/api/calendar/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">
                  Connect Google Calendar to automatically create and sync team bookings when a quote is approved.
                </p>
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  Only events for team members on a project are created — one all-day event per team member per project.
                </p>
              </div>
              <a
                href="/api/calendar/auth"
                className="shrink-0 flex items-center gap-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all"
              >
                <Calendar size={13} /> Connect Google Calendar
              </a>
            </div>
          )}
        </section>

        {/* ─── I. Google Analytics (GA4) ──────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={BarChart2} title="Google Analytics (GA4)" />
          {ga4Connected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> GA4 connected
                </p>
                {ga4PropertyId && (
                  <p className="text-xs text-zinc-500 mt-0.5">Property: {ga4PropertyId}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
                  Session, user, and traffic source data will appear in the Marketing → Traffic tab.
                </p>
              </div>
              <a
                href="/api/ga4/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">
                  Connect Google Analytics to pull live session and traffic data into the Marketing dashboard.
                </p>
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  Requires the Analytics Data API enabled in Google Cloud and read access to your GA4 property.
                </p>
              </div>
              <a
                href="/api/ga4/auth"
                className="shrink-0 flex items-center gap-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl transition-all"
              >
                <BarChart2 size={13} /> Connect GA4
              </a>
            </div>
          )}
        </section>

        {/* ─── J. Google Ads ───────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={TrendingUp} title="Google Ads" />
          {gadsConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <Check size={14} /> Google Ads connected
                </p>
                {gadsAccountName && (
                  <p className="text-xs text-zinc-500 mt-0.5">Account: {gadsAccountName}</p>
                )}
                {gadsCustomerId && (
                  <p className="text-xs text-zinc-600">Customer ID: {gadsCustomerId}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
                  Campaign spend, clicks, and conversions will appear in the Marketing → Ads tab.
                </p>
              </div>
              <a
                href="/api/google-ads/auth"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">
                  Connect Google Ads to pull live campaign performance data into the Marketing dashboard.
                </p>
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  Requires Google Ads API access and a developer token. Your existing Customer ID 379-721-4027 will be auto-detected.
                </p>
              </div>
              <a
                href="/api/google-ads/auth"
                className="shrink-0 flex items-center gap-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all"
              >
                <TrendingUp size={13} /> Connect Google Ads
              </a>
            </div>
          )}
        </section>

        {/* ─── L. Team Roles ───────────────────────────────────────────────── */}
        <section className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
          <SectionHead icon={Users} title="Team Roles" />
          <p className="text-xs text-zinc-500 mb-4">
            Admins have full access including Settings. Executives can access every page except
            Settings and can&apos;t trigger new agent runs. Members have no access until assigned a role.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-left">
                  <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Role</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}>
                    <td className="px-4 py-2.5 text-white/80">{p.email}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={p.role}
                        disabled={savingRoleId === p.id}
                        onChange={(e) => updateRole(p.id, e.target.value as Profile["role"])}
                        className="bg-[#0d0d10] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-pink-500/40 disabled:opacity-50 transition-all"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-xs text-zinc-600">
                      No signed-in users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Save button (bottom) */}
        <div className="pb-10">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-50 px-6 py-3 rounded-xl transition-all"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save all settings
          </button>
        </div>
      </main>
    </div>
  );
}

export default function SocialSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 size={22} className="text-zinc-600 animate-spin" />
      </div>
    }>
      <SocialSettingsContent />
    </Suspense>
  );
}
