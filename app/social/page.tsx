"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ChevronDown, ChevronUp, Lightbulb, Check, X,
  Send, Clock, Image, Film, Globe,
  Camera, PlayCircle, Plus, Eye, EyeOff,
  History, Sparkles, Settings,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  id:                  string;
  week_start:          string;
  day_of_week:         number;
  content_type:        "post" | "reel";
  drive_file_id:       string;
  drive_file_name:     string;
  drive_file_url:      string | null;
  drive_thumbnail_url: string | null;
  caption:             string;
  hashtags:            string[];
  suggested_time:      string;
  suggested_day_label: string;
  platforms:           string[];
  posting_reason:      string;
  content_theme:       string;
  status:              "pending" | "approved" | "edited" | "skipped" | "posted";
  approved_at:         string | null;
  caption_edited:      string | null;
  posted_at:           string | null;
  facebook_post_id:    string | null;
  youtube_video_id:    string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook:  <Globe       size={10} className="text-blue-400" />,
  instagram: <Camera      size={10} className="text-pink-400" />,
  youtube:   <PlayCircle  size={10} className="text-red-400" />,
};

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  approved: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  edited:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  skipped:  "bg-zinc-700/30 text-zinc-600 border-zinc-700/30",
  posted:   "bg-green-500/20 text-green-400 border-green-500/30",
};

const THEME_COLORS: Record<string, string> = {
  ceremony:      "bg-rose-500/15 text-rose-400 border-rose-500/25",
  portraits:     "bg-violet-500/15 text-violet-400 border-violet-500/25",
  candid:        "bg-amber-500/15 text-amber-400 border-amber-500/25",
  details:       "bg-teal-500/15 text-teal-400 border-teal-500/25",
  family:        "bg-green-500/15 text-green-400 border-green-500/25",
  reception:     "bg-pink-500/15 text-pink-400 border-pink-500/25",
  getting_ready: "bg-blue-500/15 text-blue-400 border-blue-500/25",
};

function getMondayLabel(): string {
  const now = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function getMondayDate(): string {
  const now  = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function formatIST(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone:  "Asia/Kolkata",
    day:       "numeric",
    month:     "short",
    hour:      "2-digit",
    minute:    "2-digit",
  });
}

const DAY_FULL: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday",
};

// ─── Caption Editor ───────────────────────────────────────────────────────────

function CaptionEditor({
  suggestion,
  onSave,
  onClose,
}: {
  suggestion: Suggestion;
  onSave: (id: string, caption: string) => Promise<void>;
  onClose: () => void;
}) {
  const [caption,  setCaption]  = useState(suggestion.caption_edited ?? suggestion.caption);
  const [hashtags, setHashtags] = useState<string[]>(suggestion.hashtags ?? []);
  const [newTag,   setNewTag]   = useState("");
  const [saving,   setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    const full = `${caption}\n\n${hashtags.join(" ")}`;
    await onSave(suggestion.id, full);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-3 p-4 bg-[#0d0d10] border border-white/[0.1] rounded-xl space-y-3"
    >
      <textarea
        className="w-full bg-transparent border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-pink-500/40 transition-all resize-none"
        rows={6}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <div>
        <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-widest font-semibold">Hashtags</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {hashtags.map((h) => (
            <span key={h} className="flex items-center gap-1 text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">
              {h}
              <button onClick={() => setHashtags((t) => t.filter((x) => x !== h))}>
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#111114] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
            placeholder="#NewTag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const tag = newTag.trim().startsWith("#") ? newTag.trim() : `#${newTag.trim()}`;
                if (tag !== "#") setHashtags((t) => [...t, tag]);
                setNewTag("");
              }
            }}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/[0.07] text-xs text-zinc-500 hover:text-white transition-all">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center justify-center gap-1"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Save & Approve
        </button>
      </div>
    </motion.div>
  );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onApprove,
  onSkip,
  onRestore,
  onPostNow,
  onEditSave,
}: {
  suggestion:  Suggestion;
  onApprove:   (id: string) => Promise<void>;
  onSkip:      (id: string) => Promise<void>;
  onRestore:   (id: string) => Promise<void>;
  onPostNow:   (id: string, captionOverride?: string) => Promise<void>;
  onEditSave:  (id: string, caption: string) => Promise<void>;
}) {
  const [showReason,   setShowReason]   = useState(false);
  const [showCaption,  setShowCaption]  = useState(false);
  const [showEditor,   setShowEditor]   = useState(false);
  const [actioning,    setActioning]    = useState<string | null>(null);

  const act = async (label: string, fn: () => Promise<void>) => {
    setActioning(label);
    await fn();
    setActioning(null);
  };

  const displayCaption = suggestion.caption_edited ?? suggestion.caption;
  const truncated      = displayCaption.length > 120;
  const visibleCaption = showCaption ? displayCaption : displayCaption.slice(0, 120) + (truncated ? "…" : "");
  const theme          = THEME_COLORS[suggestion.content_theme ?? ""] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";

  return (
    <div className={`bg-[#111114] border rounded-2xl p-4 transition-all ${
      suggestion.status === "skipped"  ? "opacity-50 border-white/[0.04]" :
      suggestion.status === "posted"   ? "border-green-500/20" :
      suggestion.status === "approved" ? "border-amber-500/20" :
      "border-white/[0.07]"
    }`}>
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          {suggestion.drive_thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={suggestion.drive_thumbnail_url}
              alt={suggestion.drive_file_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-zinc-700">
              {suggestion.content_type === "post" ? <Image size={22} /> : <Film size={22} />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
              <Clock size={8} /> {suggestion.suggested_time}
            </span>
            <span className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${
              suggestion.content_type === "post"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-purple-500/15 text-purple-400"
            }`}>
              {suggestion.content_type === "post" ? <Image size={8} /> : <Film size={8} />}
              {suggestion.content_type === "post" ? "Post" : "Reel"}
            </span>
            <div className="flex items-center gap-0.5">
              {(suggestion.platforms ?? []).map((p) => (
                <span key={p} title={p}>{PLATFORM_ICONS[p]}</span>
              ))}
            </div>
            {suggestion.content_theme && (
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border capitalize ${theme}`}>
                {suggestion.content_theme.replace("_", " ")}
              </span>
            )}
            <span className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[suggestion.status]}`}>
              {suggestion.status === "posted" ? "Posted ✓" : suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
            </span>
          </div>

          {/* Caption */}
          <div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {visibleCaption}
            </p>
            {truncated && (
              <button
                onClick={() => setShowCaption((v) => !v)}
                className="text-[10px] text-pink-400 hover:text-pink-300 mt-0.5 transition-colors"
              >
                {showCaption ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Hashtags */}
          {suggestion.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestion.hashtags.slice(0, 5).map((h) => (
                <span key={h} className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/8 text-pink-400/70">
                  {h}
                </span>
              ))}
              {suggestion.hashtags.length > 5 && (
                <span className="text-[9px] text-zinc-600">+{suggestion.hashtags.length - 5} more</span>
              )}
            </div>
          )}

          {/* AI Reason */}
          {suggestion.posting_reason && (
            <div>
              <button
                onClick={() => setShowReason((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <Lightbulb size={10} />
                {showReason ? "Hide reason" : "Why this was selected"}
                {showReason ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
              {showReason && (
                <p className="text-[10px] text-zinc-500 mt-1 pl-3 border-l border-white/[0.06] leading-relaxed">
                  {suggestion.posting_reason}
                </p>
              )}
            </div>
          )}

          {/* Posted time */}
          {suggestion.status === "posted" && suggestion.posted_at && (
            <p className="text-[10px] text-green-400">
              Posted {formatIST(suggestion.posted_at)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0 items-end">
          {(suggestion.status === "pending" || suggestion.status === "approved" || suggestion.status === "edited") && (
            <>
              {suggestion.status !== "approved" && suggestion.status !== "edited" && (
                <button
                  onClick={() => act("approve", () => onApprove(suggestion.id))}
                  disabled={!!actioning}
                  className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-50"
                >
                  {actioning === "approve" ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                  Approve
                </button>
              )}

              {(suggestion.status === "approved" || suggestion.status === "edited") && (
                <>
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Check size={10} /> Approved
                  </span>
                  <button
                    onClick={() => act("post", () => onPostNow(suggestion.id))}
                    disabled={!!actioning}
                    className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-all disabled:opacity-50"
                  >
                    {actioning === "post" ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                    Post Now
                  </button>
                </>
              )}

              <button
                onClick={() => setShowEditor((v) => !v)}
                className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-white/[0.07] text-zinc-500 hover:text-white hover:border-white/[0.2] transition-all"
              >
                {showEditor ? <EyeOff size={10} /> : <Eye size={10} />}
                {showEditor ? "Close" : "Edit"}
              </button>

              <button
                onClick={() => act("skip", () => onSkip(suggestion.id))}
                disabled={!!actioning}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Skip
              </button>
            </>
          )}

          {suggestion.status === "skipped" && (
            <button
              onClick={() => act("restore", () => onRestore(suggestion.id))}
              disabled={!!actioning}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Restore
            </button>
          )}
        </div>
      </div>

      {/* Inline editor */}
      <AnimatePresence>
        {showEditor && (
          <CaptionEditor
            suggestion={suggestion}
            onSave={onEditSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Day Group ────────────────────────────────────────────────────────────────

function DayGroup({
  dayNum, dayLabel, items, weekStart,
  onApprove, onSkip, onRestore, onPostNow, onEditSave,
}: {
  dayNum: number;
  dayLabel: string;
  weekStart: string;
  items: Suggestion[];
  onApprove:  (id: string) => Promise<void>;
  onSkip:     (id: string) => Promise<void>;
  onRestore:  (id: string) => Promise<void>;
  onPostNow:  (id: string, captionOverride?: string) => Promise<void>;
  onEditSave: (id: string, caption: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const monday   = new Date(weekStart + "T00:00:00Z");
  monday.setUTCDate(monday.getUTCDate() + (dayNum - 1));
  const dateLabel = monday.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  const approved  = items.filter((i) => i.status === "approved" || i.status === "posted" || i.status === "edited").length;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 py-2.5 px-4 bg-[#111114] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
      >
        <span className="text-sm font-semibold text-white">{dayLabel}</span>
        <span className="text-xs text-zinc-600">{dateLabel}</span>
        <span className="ml-auto text-xs text-zinc-500">
          Approved {approved}/{items.length}
        </span>
        {open ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
      </button>

      {open && (
        <div className="space-y-2 ml-2">
          {items.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onApprove={onApprove}
              onSkip={onSkip}
              onRestore={onRestore}
              onPostNow={onPostNow}
              onEditSave={onEditSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: AI Suggestions ─────────────────────────────────────────────────────

function SuggestionsTab() {
  const toast = useToast();

  const [suggestions,   setSuggestions]   = useState<Suggestion[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [generating,    setGenerating]    = useState(false);
  const [approvingAll,  setApprovingAll]  = useState(false);
  const [foldersOk,     setFoldersOk]     = useState<boolean | null>(null);

  const weekStart = getMondayDate();

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const [sugsRes, settingsRes] = await Promise.all([
        fetch(`/api/agent/suggestions?week_start=${weekStart}`),
        fetch("/api/agent/settings"),
      ]);

      if (sugsRes.ok) {
        const d = await sugsRes.json() as { suggestions?: Suggestion[] };
        setSuggestions(d.suggestions ?? []);
      }

      if (settingsRes.ok) {
        const d = await settingsRes.json() as {
          settings?: { photos_folder_id?: string; videos_folder_id?: string };
        };
        const s = d.settings;
        setFoldersOk(!!(s?.photos_folder_id || s?.videos_folder_id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const runAgent = async () => {
    setGenerating(true);
    try {
      const res  = await fetch("/api/agent/run-weekly", { method: "POST" });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { toast(data.error ?? "Failed", "error"); return; }
      toast("Content plan generated for the week!");
      await fetchSuggestions();
    } catch {
      toast("Network error", "error");
    } finally {
      setGenerating(false);
    }
  };

  const approveAll = async () => {
    setApprovingAll(true);
    try {
      await fetch("/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ approve_all: true, week_start: weekStart }),
      });
      setSuggestions((prev) =>
        prev.map((s) =>
          s.status === "pending"
            ? { ...s, status: "approved", approved_at: new Date().toISOString() }
            : s,
        ),
      );
      toast("All suggestions approved!");
    } catch {
      toast("Error", "error");
    } finally {
      setApprovingAll(false);
    }
  };

  const handleApprove = async (id: string) => {
    await fetch("/api/agent/approve", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    });
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "approved", approved_at: new Date().toISOString() } : s,
      ),
    );
  };

  const handleSkip = async (id: string) => {
    await fetch("/api/agent/skip", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    });
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status: "skipped" } : s));
  };

  const handleRestore = async (id: string) => {
    await fetch("/api/agent/skip", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id, restore: true }),
    });
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status: "pending" } : s));
  };

  const handlePostNow = async (id: string, captionOverride?: string) => {
    const res  = await fetch("/api/social/post-now", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id, caption_override: captionOverride }),
    });
    const data = await res.json() as { success: boolean; posted_to?: string[]; error?: string };
    if (!data.success) {
      toast(data.error ?? "Posting failed", "error");
      return;
    }
    toast(`Posted to ${(data.posted_to ?? []).join(", ")} ✓`);
    setSuggestions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "posted", posted_at: new Date().toISOString() } : s),
    );
  };

  const handleEditSave = async (id: string, caption: string) => {
    await fetch(`/api/agent/suggestions/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ caption_edited: caption, status: "approved" }),
    });
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, caption_edited: caption, status: "approved", approved_at: new Date().toISOString() } : s,
      ),
    );
    toast("Caption saved and approved");
  };

  const approved = suggestions.filter((s) => ["approved","edited","posted"].includes(s.status)).length;

  // Group by day
  const byDay: Record<number, Suggestion[]> = {};
  for (const s of suggestions) {
    (byDay[s.day_of_week] = byDay[s.day_of_week] ?? []).push(s);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={22} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (foldersOk === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
          <Sparkles size={24} className="text-pink-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-2">Set up your content folders</h3>
        <p className="text-xs text-zinc-500 max-w-xs mb-5">
          Add your Google Drive folder IDs to let the AI scan your photos and videos weekly.
        </p>
        <Link
          href="/social/settings"
          className="flex items-center gap-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 px-5 py-2.5 rounded-xl transition-all"
        >
          <Settings size={13} /> Go to Settings →
        </Link>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
          <Sparkles size={24} className="text-pink-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-2">No suggestions yet for this week</h3>
        <p className="text-xs text-zinc-500 max-w-xs mb-5">
          Generate this week&apos;s content plan — Claude will pick the best photos and videos and write captions.
        </p>
        <button
          onClick={runAgent}
          disabled={generating}
          className="flex items-center gap-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all"
        >
          {generating
            ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
            : <><Sparkles size={13} /> Generate week&apos;s content →</>}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 min-w-[120px] bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.round((approved / Math.max(suggestions.length, 1)) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {approved} / {suggestions.length} approved
          </span>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={approveAll}
            disabled={approvingAll}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all"
          >
            {approvingAll ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Approve all
          </button>
          <button
            onClick={runAgent}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 border border-white/[0.07] hover:border-white/[0.2] hover:text-white disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all"
          >
            {generating ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            Regenerate
          </button>
        </div>
      </div>

      {/* Day groups */}
      {Object.entries(byDay)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([day, items]) => (
          <DayGroup
            key={day}
            dayNum={Number(day)}
            dayLabel={DAY_FULL[Number(day)] ?? `Day ${day}`}
            weekStart={weekStart}
            items={items}
            onApprove={handleApprove}
            onSkip={handleSkip}
            onRestore={handleRestore}
            onPostNow={handlePostNow}
            onEditSave={handleEditSave}
          />
        ))}
    </div>
  );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const [items,   setItems]   = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agent/suggestions?status=posted&range=${filter}`)
      .then((r) => r.json())
      .then((d: { suggestions?: Suggestion[] }) => setItems(d.suggestions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["week","month","all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all capitalize ${
              filter === f
                ? "bg-pink-500/15 border-pink-500/30 text-pink-300"
                : "border-white/[0.07] text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {f === "week" ? "This week" : f === "month" ? "This month" : "All time"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={20} className="text-zinc-600 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <History size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No posted content {filter === "week" ? "this week" : filter === "month" ? "this month" : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 bg-[#111114] border border-white/[0.06] rounded-xl">
              <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                {s.drive_thumbnail_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.drive_thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <div className="text-zinc-700">{s.content_type === "post" ? <Image size={14} /> : <Film size={14} />}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">{s.caption.slice(0, 80)}…</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {(s.platforms ?? []).map((p) => <span key={p}>{PLATFORM_ICONS[p]}</span>)}
                  <span className="text-[10px] text-zinc-600">
                    {s.posted_at ? formatIST(s.posted_at) : "—"}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                Posted ✓
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "suggestions" | "history";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<Tab>("suggestions");

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "suggestions", label: "AI Suggestions", icon: <Sparkles size={13} /> },
    { id: "history",     label: "History",        icon: <History    size={13} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Social</h1>
          <p className="text-xs text-zinc-500">
            Week of {getMondayLabel()}
          </p>
        </div>
        <Link
          href="/social/settings"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 border border-white/[0.07] hover:border-white/[0.15] px-3 py-1.5 rounded-xl transition-all"
        >
          <Settings size={12} /> Settings
        </Link>
      </header>

      {/* Tabs */}
      <div className="px-8 pt-4 border-b border-white/[0.06]">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-xl border-b-2 transition-all ${
                activeTab === tab.id
                  ? "text-pink-400 border-pink-400 bg-pink-500/5"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-3xl w-full mx-auto">
        {activeTab === "suggestions" && <SuggestionsTab />}
        {activeTab === "history"     && <HistoryTab />}
      </main>
    </div>
  );
}
