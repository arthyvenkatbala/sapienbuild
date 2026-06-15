"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ChevronDown, ChevronUp, Lightbulb, Check, X,
  Send, Clock, Image, Film, Globe,
  Camera, PlayCircle, Sparkles, Settings, AlertTriangle,
  RotateCcw, ThumbsDown, Pencil,
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
  drive_file_name:     string | null;
  drive_file_url:      string | null;
  drive_thumbnail_url: string | null;
  caption:             string;
  hashtags:            string[];
  suggested_time:      string;
  suggested_day_label: string;
  platforms:           string[];
  posting_reason:      string | null;
  content_theme:       string | null;
  status:              "pending" | "approved" | "edited" | "skipped" | "posted" | "rejected";
  approved_at:         string | null;
  caption_edited:      string | null;
  posted_at:           string | null;
  facebook_post_id:    string | null;
  youtube_video_id:    string | null;
  rejected_at:         string | null;
}

interface AgentRun {
  id:           string;
  status:       "running" | "completed" | "failed";
  generated_by: "cron" | "manual";
  created_at:   string;
  error_message?: string | null;
  suggestions_generated?: number;
}

type FilterTab = "pending" | "approved" | "posted" | "rejected";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook:  <Globe      size={10} className="text-blue-400"  />,
  instagram: <Camera     size={10} className="text-pink-400"  />,
  youtube:   <PlayCircle size={10} className="text-red-400"   />,
};

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  approved: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  edited:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  skipped:  "bg-zinc-700/30 text-zinc-600 border-zinc-700/30",
  posted:   "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
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

const FILTER_TABS: Array<{ id: FilterTab; label: string; statusIn: string }> = [
  { id: "pending",  label: "Pending Review", statusIn: "pending"           },
  { id: "approved", label: "Approved",       statusIn: "approved,edited"   },
  { id: "posted",   label: "Posted",         statusIn: "posted"            },
  { id: "rejected", label: "Rejected",       statusIn: "rejected,skipped"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIST(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day:      "numeric",
    month:    "short",
    hour:     "2-digit",
    minute:   "2-digit",
  });
}

function sourceLabel(filename: string | null): string {
  if (!filename) return "";
  // Strip extension and common timestamp suffixes for a cleaner label
  return filename.replace(/\.\w{2,4}$/, "").replace(/_\d{8,}$/, "").replace(/_/g, " ");
}

// ─── Caption Editor (inline) ──────────────────────────────────────────────────

function CaptionEditor({
  suggestion,
  onSave,
  onClose,
}: {
  suggestion: Suggestion;
  onSave:     (id: string, caption: string, hashtags: string[]) => Promise<void>;
  onClose:    () => void;
}) {
  const [caption,  setCaption]  = useState(suggestion.caption_edited ?? suggestion.caption);
  const [hashtags, setHashtags] = useState<string[]>(suggestion.hashtags ?? []);
  const [newTag,   setNewTag]   = useState("");
  const [saving,   setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(suggestion.id, caption, hashtags);
    setSaving(false);
    onClose();
  };

  const addTag = () => {
    const tag = newTag.trim().startsWith("#") ? newTag.trim() : `#${newTag.trim()}`;
    if (tag !== "#" && !hashtags.includes(tag)) setHashtags((t) => [...t, tag]);
    setNewTag("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
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
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border border-white/[0.07] text-xs text-zinc-500 hover:text-white transition-all"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center justify-center gap-1"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Save &amp; Approve
        </button>
      </div>
    </motion.div>
  );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onApprove,
  onReject,
  onRestore,
  onPostNow,
  onEditSave,
}: {
  suggestion: Suggestion;
  onApprove:  (id: string) => Promise<void>;
  onReject:   (id: string) => Promise<void>;
  onRestore:  (id: string) => Promise<void>;
  onPostNow:  (id: string) => Promise<void>;
  onEditSave: (id: string, caption: string, hashtags: string[]) => Promise<void>;
}) {
  const [showReason,  setShowReason]  = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [showEditor,  setShowEditor]  = useState(false);
  const [actioning,   setActioning]   = useState<string | null>(null);

  const act = async (label: string, fn: () => Promise<void>) => {
    setActioning(label);
    await fn();
    setActioning(null);
  };

  const displayCaption = suggestion.caption_edited ?? suggestion.caption;
  const truncated      = displayCaption.length > 120;
  const visibleCaption = showCaption ? displayCaption : displayCaption.slice(0, 120) + (truncated ? "…" : "");
  const theme          = THEME_COLORS[suggestion.content_theme ?? ""] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";

  const isRejected = suggestion.status === "rejected" || suggestion.status === "skipped";
  const isPosted   = suggestion.status === "posted";
  const isApproved = suggestion.status === "approved" || suggestion.status === "edited";
  const isPending  = suggestion.status === "pending";

  const source = sourceLabel(suggestion.drive_file_name);

  return (
    <div className={`bg-[#111114] border rounded-2xl p-4 transition-all ${
      isRejected  ? "opacity-50 border-red-500/10" :
      isPosted    ? "border-green-500/20"           :
      isApproved  ? "border-amber-500/20"           :
      "border-white/[0.07]"
    }`}>
      <div className="flex gap-3">

        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          {suggestion.drive_thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={suggestion.drive_thumbnail_url} alt={suggestion.drive_file_name ?? ""} className="w-full h-full object-cover" />
          ) : (
            <div className="text-zinc-700">
              {suggestion.content_type === "post" ? <Image size={22} /> : <Film size={22} />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
              <Clock size={8} /> {suggestion.suggested_time} · {suggestion.suggested_day_label}
            </span>
            <span className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${
              suggestion.content_type === "post"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-purple-500/15 text-purple-400"
            }`}>
              {suggestion.content_type === "post" ? <Image size={8} /> : <Film size={8} />}
              {suggestion.content_type === "post" ? "Photo Post" : "Reel"}
            </span>
            <div className="flex items-center gap-0.5">
              {(suggestion.platforms ?? []).map((p) => <span key={p} title={p}>{PLATFORM_ICONS[p]}</span>)}
            </div>
            {suggestion.content_theme && (
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border capitalize ${theme}`}>
                {suggestion.content_theme.replace("_", " ")}
              </span>
            )}
            <span className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[suggestion.status]}`}>
              {suggestion.status === "posted"   ? "Posted ✓"   :
               suggestion.status === "rejected" ? "Rejected"   :
               suggestion.status === "skipped"  ? "Rejected"   :
               suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
            </span>
          </div>

          {/* Source */}
          {source && (
            <p className="text-[9px] text-zinc-600 truncate">
              Source: {source}
            </p>
          )}

          {/* Caption */}
          <div>
            <p className="text-xs text-zinc-300 leading-relaxed">{visibleCaption}</p>
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
                <span key={h} className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/8 text-pink-400/70">{h}</span>
              ))}
              {suggestion.hashtags.length > 5 && (
                <span className="text-[9px] text-zinc-600">+{suggestion.hashtags.length - 5} more</span>
              )}
            </div>
          )}

          {/* AI reason */}
          {suggestion.posting_reason && (
            <div>
              <button
                onClick={() => setShowReason((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <Lightbulb size={10} />
                {showReason ? "Hide reason" : "Why selected"}
                {showReason ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
              {showReason && (
                <p className="text-[10px] text-zinc-500 mt-1 pl-3 border-l border-white/[0.06] leading-relaxed">
                  {suggestion.posting_reason}
                </p>
              )}
            </div>
          )}

          {/* Posted timestamp */}
          {isPosted && suggestion.posted_at && (
            <p className="text-[10px] text-green-400">Posted {formatIST(suggestion.posted_at)}</p>
          )}

          {/* Rejected timestamp */}
          {isRejected && suggestion.rejected_at && (
            <p className="text-[10px] text-red-400/60">Rejected {formatIST(suggestion.rejected_at)}</p>
          )}
        </div>

        {/* Action column */}
        <div className="flex flex-col gap-1.5 shrink-0 items-end">
          {(isPending || isApproved) && (
            <>
              {isPending && (
                <button
                  onClick={() => act("approve", () => onApprove(suggestion.id))}
                  disabled={!!actioning}
                  className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-50"
                >
                  {actioning === "approve" ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                  Approve
                </button>
              )}

              {isApproved && (
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
                <Pencil size={9} />
                {showEditor ? "Close" : "Edit"}
              </button>

              <button
                onClick={() => act("reject", () => onReject(suggestion.id))}
                disabled={!!actioning}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded text-zinc-700 hover:text-red-400 transition-colors"
              >
                {actioning === "reject" ? <Loader2 size={9} className="animate-spin" /> : <ThumbsDown size={9} />}
                Reject
              </button>
            </>
          )}

          {isRejected && (
            <button
              onClick={() => act("restore", () => onRestore(suggestion.id))}
              disabled={!!actioning}
              className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-white/[0.07] text-zinc-500 hover:text-zinc-300 transition-all"
            >
              {actioning === "restore" ? <Loader2 size={9} className="animate-spin" /> : <RotateCcw size={9} />}
              Restore
            </button>
          )}
        </div>
      </div>

      {/* Inline caption editor */}
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
  dayLabel, weekStart, dayNum, items,
  onApprove, onReject, onRestore, onPostNow, onEditSave,
}: {
  dayLabel:  string;
  weekStart: string;
  dayNum:    number;
  items:     Suggestion[];
  onApprove:  (id: string) => Promise<void>;
  onReject:   (id: string) => Promise<void>;
  onRestore:  (id: string) => Promise<void>;
  onPostNow:  (id: string) => Promise<void>;
  onEditSave: (id: string, caption: string, hashtags: string[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const monday   = new Date(weekStart + "T00:00:00Z");
  monday.setUTCDate(monday.getUTCDate() + (dayNum - 1));
  const dateLabel = monday.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  const approved  = items.filter((i) => ["approved","edited","posted"].includes(i.status)).length;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 py-2.5 px-4 bg-[#111114] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
      >
        <span className="text-sm font-semibold text-white">{dayLabel}</span>
        <span className="text-xs text-zinc-600">{dateLabel}</span>
        <span className="ml-auto text-xs text-zinc-500">{approved}/{items.length} approved</span>
        {open ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
      </button>
      {open && (
        <div className="space-y-2 ml-2">
          {items.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onApprove={onApprove}
              onReject={onReject}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const toast = useToast();

  const [activeFilter, setActiveFilter]   = useState<FilterTab>("pending");
  const [suggestions,  setSuggestions]    = useState<Suggestion[]>([]);
  const [loading,      setLoading]        = useState(true);
  const [approvingAll, setApprovingAll]   = useState(false);
  const [foldersOk,    setFoldersOk]      = useState<boolean | null>(null);

  // Agent run state
  const [runStatus,    setRunStatus]      = useState<"idle" | "running" | "failed">("idle");
  const [runId,        setRunId]          = useState<string | null>(null);
  const [runError,     setRunError]       = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch suggestions by filter ──────────────────────────────────────────────

  const fetchSuggestions = useCallback(async (filter: FilterTab = activeFilter) => {
    setLoading(true);
    try {
      const tab = FILTER_TABS.find((t) => t.id === filter)!;
      const res = await fetch(`/api/agent/suggestions?status_in=${encodeURIComponent(tab.statusIn)}`);
      const d   = await res.json() as { suggestions?: Suggestion[] };
      setSuggestions(d.suggestions ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeFilter]);

  // ── Check for in-progress run on mount ──────────────────────────────────────

  const checkExistingRun = useCallback(async () => {
    try {
      const [runsRes, settingsRes] = await Promise.all([
        fetch("/api/agent/runs?limit=1"),
        fetch("/api/agent/settings"),
      ]);
      if (runsRes.ok) {
        const d = await runsRes.json() as { runs?: AgentRun[] };
        const latest = d.runs?.[0];
        if (latest?.status === "running") {
          setRunStatus("running");
          setRunId(latest.id);
        }
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json() as { settings?: { photos_folder_id?: string; videos_folder_id?: string } };
        setFoldersOk(!!(d.settings?.photos_folder_id || d.settings?.videos_folder_id));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    checkExistingRun();
    fetchSuggestions();
  }, [checkExistingRun, fetchSuggestions]);

  // ── Polling for run completion ────────────────────────────────────────────────

  useEffect(() => {
    if (runStatus !== "running") {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch("/api/agent/runs?limit=1");
        const data = await res.json() as { runs?: AgentRun[] };
        const run  = data.runs?.[0];
        if (!run) return;
        if (run.status === "completed") {
          clearInterval(pollRef.current!); pollRef.current = null;
          setRunStatus("idle");
          toast(`${run.suggestions_generated ?? 14} new suggestions generated!`);
          await fetchSuggestions("pending");
          setActiveFilter("pending");
        } else if (run.status === "failed") {
          clearInterval(pollRef.current!); pollRef.current = null;
          setRunStatus("failed");
          setRunError(run.error_message ?? "Agent run failed");
          toast("Agent run failed", "error");
        }
      } catch (e) { console.error(e); }
    }, 3_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [runStatus, toast, fetchSuggestions]);

  // ── Switch filter tab ─────────────────────────────────────────────────────────

  const switchFilter = (f: FilterTab) => {
    if (f === activeFilter) return;
    setActiveFilter(f);
    fetchSuggestions(f);
  };

  // ── Run agent now ────────────────────────────────────────────────────────────

  const handleRunAgent = async () => {
    if (runStatus === "running") return;
    setRunStatus("running");
    setRunError(null);
    try {
      const res  = await fetch("/api/agent/trigger", { method: "POST" });
      const data = await res.json() as { success?: boolean; run_id?: string; error?: string };
      if (!res.ok) {
        if (res.status === 409) {
          // Already running — start polling the existing run
          toast("Agent is already generating content — waiting for it to finish…");
          setRunId(data.run_id ?? null);
          return;
        }
        setRunStatus("failed");
        setRunError(data.error ?? "Failed to start agent");
        toast(data.error ?? "Failed to start agent", "error");
        return;
      }
      setRunId(data.run_id ?? null);
    } catch {
      setRunStatus("failed");
      setRunError("Network error");
      toast("Network error", "error");
    }
  };

  // ── Suggestion actions ────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    await fetch("/api/agent/approve", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    });
    setSuggestions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "approved" as const, approved_at: new Date().toISOString() } : s)
    );
  };

  const handleReject = async (id: string) => {
    await fetch("/api/agent/reject", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRestore = async (id: string) => {
    await fetch("/api/agent/reject", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id, restore: true }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    toast("Restored to Pending Review");
  };

  const handlePostNow = async (id: string) => {
    const res  = await fetch("/api/social/post-now", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suggestion_id: id }),
    });
    const data = await res.json() as { success: boolean; posted_to?: string[]; error?: string };
    if (!data.success) { toast(data.error ?? "Posting failed", "error"); return; }
    toast(`Posted to ${(data.posted_to ?? []).join(", ")} ✓`);
    setSuggestions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "posted" as const, posted_at: new Date().toISOString() } : s)
    );
  };

  const handleEditSave = async (id: string, caption: string, hashtags: string[]) => {
    const fullCaption = `${caption}\n\n${hashtags.join(" ")}`;
    await fetch(`/api/agent/suggestions/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ caption_edited: fullCaption, status: "approved" }),
    });
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, caption_edited: fullCaption, hashtags, status: "approved" as const, approved_at: new Date().toISOString() }
          : s
      )
    );
    toast("Caption saved and approved");
  };

  const handleApproveAll = async () => {
    const pendingIds = suggestions.filter((s) => s.status === "pending").map((s) => s.id);
    if (pendingIds.length === 0) return;
    setApprovingAll(true);
    try {
      // Use the current week's batch for the approve-all action
      const weekStart = suggestions.find((s) => s.status === "pending")?.week_start;
      if (weekStart) {
        await fetch("/api/agent/approve", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ approve_all: true, week_start: weekStart }),
        });
        setSuggestions((prev) =>
          prev.map((s) =>
            s.status === "pending" && s.week_start === weekStart
              ? { ...s, status: "approved" as const, approved_at: new Date().toISOString() }
              : s
          )
        );
        toast("All pending suggestions approved!");
      }
    } catch { toast("Error", "error"); }
    finally { setApprovingAll(false); }
  };

  // ── Group pending by day for the pending view ──────────────────────────────

  const pendingByWeekDay: Record<string, Record<number, Suggestion[]>> = {};
  if (activeFilter === "pending") {
    for (const s of suggestions) {
      if (!pendingByWeekDay[s.week_start]) pendingByWeekDay[s.week_start] = {};
      const byDay = pendingByWeekDay[s.week_start];
      (byDay[s.day_of_week] = byDay[s.day_of_week] ?? []).push(s);
    }
  }

  const pendingCount  = suggestions.filter((s) => s.status === "pending").length;
  const approvedCount = suggestions.filter((s) => ["approved","edited"].includes(s.status)).length;

  // ── Folders not configured empty state ──────────────────────────────────────

  const showFolderWarning = foldersOk === false;

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Social Content</h1>
          <p className="text-xs text-zinc-500">AI-generated suggestions for review and approval</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAgent}
            disabled={runStatus === "running"}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all"
          >
            {runStatus === "running"
              ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
              : <><Sparkles size={12} /> Run Agent Now</>
            }
          </button>
          <Link
            href="/social/settings"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 border border-white/[0.07] hover:border-white/[0.15] px-3 py-2 rounded-xl transition-all"
          >
            <Settings size={12} /> Settings
          </Link>
        </div>
      </header>

      {/* ── Generating banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {runStatus === "running" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-8 py-3 bg-pink-500/5 border-b border-pink-500/15">
              <Loader2 size={14} className="text-pink-400 animate-spin shrink-0" />
              <div>
                <p className="text-xs text-pink-300 font-medium">Generating new content suggestions…</p>
                <p className="text-[10px] text-pink-400/60">
                  Claude is scanning your Drive folders and writing captions. This usually takes 20–40 seconds.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {runStatus === "failed" && runError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-8 py-3 bg-red-500/5 border-b border-red-500/15">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{runError}</p>
              <button
                onClick={() => setRunStatus("idle")}
                className="ml-auto text-red-500 hover:text-red-300 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter tabs ───────────────────────────────────────────────────────── */}
      <div className="px-8 pt-4 border-b border-white/[0.06]">
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchFilter(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-t-xl border-b-2 transition-all ${
                activeFilter === tab.id
                  ? "text-pink-400 border-pink-400 bg-pink-500/5"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-6 md:px-8 py-6 max-w-3xl w-full mx-auto">

        {/* Folder not configured */}
        {showFolderWarning && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-pink-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Connect your Drive folders first</h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-5">
              Add your Google Drive photo and video folder IDs in Settings so the agent can scan and generate suggestions.
            </p>
            <Link
              href="/social/settings"
              className="flex items-center gap-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 px-5 py-2.5 rounded-xl transition-all"
            >
              <Settings size={13} /> Open Settings
            </Link>
          </div>
        )}

        {/* Loading */}
        {!showFolderWarning && loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={22} className="text-zinc-600 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!showFolderWarning && !loading && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-pink-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">
              {activeFilter === "pending"  ? "No suggestions pending review"  :
               activeFilter === "approved" ? "No approved suggestions yet"    :
               activeFilter === "posted"   ? "Nothing posted yet"             :
               "No rejected suggestions"}
            </h3>
            {activeFilter === "pending" && (
              <p className="text-xs text-zinc-500 max-w-xs mb-5">
                Run the agent to generate this week&apos;s content plan — Claude will select the best photos and videos and write captions.
              </p>
            )}
            {activeFilter === "pending" && (
              <button
                onClick={handleRunAgent}
                disabled={runStatus === "running"}
                className="flex items-center gap-2 text-xs font-medium text-white bg-pink-600 hover:bg-pink-500 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all"
              >
                {runStatus === "running"
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><Sparkles size={13} /> Run Agent Now</>
                }
              </button>
            )}
          </div>
        )}

        {/* Pending view — grouped by week then day */}
        {!showFolderWarning && !loading && suggestions.length > 0 && activeFilter === "pending" && (
          <div className="space-y-6">
            {/* Approve-all toolbar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {pendingCount} pending · {approvedCount} approved
              </span>
              {pendingCount > 0 && (
                <button
                  onClick={handleApproveAll}
                  disabled={approvingAll}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  {approvingAll ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  Approve all pending
                </button>
              )}
            </div>

            {/* Week groups */}
            {Object.entries(pendingByWeekDay)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([weekStart, byDay]) => (
                <div key={weekStart} className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-1">
                    Week of {new Date(weekStart + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                  </p>
                  {Object.entries(byDay)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, items]) => (
                      <DayGroup
                        key={day}
                        dayNum={Number(day)}
                        dayLabel={items[0]?.suggested_day_label ?? `Day ${day}`}
                        weekStart={weekStart}
                        items={items}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRestore={handleRestore}
                        onPostNow={handlePostNow}
                        onEditSave={handleEditSave}
                      />
                    ))}
                </div>
              ))
            }
          </div>
        )}

        {/* Flat list for approved / posted / rejected */}
        {!showFolderWarning && !loading && suggestions.length > 0 && activeFilter !== "pending" && (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onApprove={handleApprove}
                onReject={handleReject}
                onRestore={handleRestore}
                onPostNow={handlePostNow}
                onEditSave={handleEditSave}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
