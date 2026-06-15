"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MousePointerClick, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GscData {
  connected:   boolean;
  clicks:      number;
  impressions: number;
  rows:        Array<{ date: string; clicks: number; impressions: number }>;
}

interface GscQuery {
  query:       string;
  clicks:      number;
  impressions: number;
  position:    number;
  ctr:         number;
}

interface ClarityPage {
  url:              string;
  traffic:          number | null;
  engagement_time:  number | null;
  scroll_depth:     number | null;
  dead_clicks:      number | null;
  rage_clicks:      number | null;
  quickback_clicks: number | null;
  excessive_scroll: number | null;
  friction_score:   number;
  fetched_at:       string | null;
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function pathLabel(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url.length > 50 ? url.slice(0, 50) + "…" : url;
  }
}

function fmtSeconds(sec: number | null): string {
  if (sec == null) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, subtitle, placeholder, badge,
}: {
  title:        string;
  value?:       string | number;
  subtitle?:    string;
  placeholder?: string;
  badge?:       string;
}) {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
      <p className="text-xs text-zinc-500 mb-1">{title}</p>
      {value !== undefined ? (
        <>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
        </>
      ) : (
        <div className="mt-2">
          {badge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {badge}
            </span>
          )}
          <p className="text-xs text-zinc-600">{placeholder}</p>
        </div>
      )}
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

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

// ─── Scroll depth bar ─────────────────────────────────────────────────────────

function ScrollBar({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-xs text-zinc-600">—</span>;
  }
  const pct = Math.round(value * 100);
  const color =
    pct >= 75 ? "bg-green-500"  :
    pct >= 50 ? "bg-amber-500"  :
    pct >= 25 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-zinc-400 shrink-0 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Behaviour Insights panel ─────────────────────────────────────────────────

function BehaviourInsightsPanel({ clarityId }: { clarityId: string }) {
  const [pages,     setPages]     = useState<ClarityPage[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [hasData,   setHasData]   = useState(false);

  useEffect(() => {
    fetch("/api/marketing/clarity-insights?days=7")
      .then((r) => r.ok ? r.json() : { pages: [], fetched_at: null, has_data: false })
      .then((d: { pages?: ClarityPage[]; fetched_at?: string | null; has_data?: boolean }) => {
        setPages(d.pages ?? []);
        setFetchedAt(d.fetched_at ?? null);
        setHasData(d.has_data ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const clarityUrl = `https://clarity.microsoft.com/projects/view/${clarityId}/dashboard`;
  const openLink   = (
    <a
      href={clarityUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline transition-colors"
    >
      Microsoft Clarity
      <ExternalLink size={11} />
    </a>
  );

  // Top 10 pages by scroll depth (pages with data), rest for friction table
  const scrollPages    = [...pages].filter((p) => p.scroll_depth != null).sort((a, b) => (b.scroll_depth ?? 0) - (a.scroll_depth ?? 0)).slice(0, 10);
  const frictionPages  = pages.filter((p) => p.friction_score > 0).slice(0, 15);

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">Behaviour Insights</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Scroll depth &amp; friction signals — summary from Microsoft Clarity.{" "}
            Full heatmaps &amp; recordings available in {openLink}.
          </p>
        </div>
        <a
          href={clarityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl transition-all"
        >
          <MousePointerClick size={13} />
          Open Heatmaps &amp; Recordings
          <ExternalLink size={11} />
        </a>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="text-zinc-600 animate-spin" />
        </div>
      )}

      {/* No data state — cron hasn't run yet */}
      {!loading && !hasData && (
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-4">
          <p className="text-xs text-blue-300 font-medium mb-1 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Awaiting first data fetch
          </p>
          <p className="text-xs text-zinc-500">
            The daily cron (runs at 06:00 UTC) will populate this panel once{" "}
            <code className="text-zinc-400 bg-white/[0.05] px-1 rounded">CLARITY_API_TOKEN</code>{" "}
            is set and the cron has run at least once. Until then, visit {openLink} directly for full behavioural analytics.
          </p>
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Data timestamp */}
          {fetchedAt && (
            <p className="text-[10px] text-zinc-600">
              Data as of{" "}
              {new Date(fetchedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day:      "numeric",
                month:    "short",
                hour:     "2-digit",
                minute:   "2-digit",
              })}{" "}
              IST · Updated daily · Last 7 days aggregated
            </p>
          )}

          {/* Scroll Depth per page */}
          {scrollPages.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-widest">
                Scroll Depth by Page
              </h4>
              <p className="text-[10px] text-zinc-600 mb-3">
                Approximate percentage of a page visitors reach on average.
                This is a behavioural summary, not a pixel heatmap — for precise scroll maps, open {openLink}.
              </p>
              <div className="space-y-2.5">
                {scrollPages.map((p) => (
                  <div key={p.url} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-300 truncate" title={p.url}>
                        {pathLabel(p.url)}
                      </p>
                      {p.traffic != null && (
                        <p className="text-[10px] text-zinc-600">{p.traffic.toLocaleString()} sessions</p>
                      )}
                    </div>
                    <div className="w-40">
                      <ScrollBar value={p.scroll_depth} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friction Signals table */}
          {frictionPages.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-widest">
                Friction Signals
              </h4>
              <p className="text-[10px] text-zinc-600 mb-3">
                Pages sorted by total friction events (rage clicks + dead clicks + quickback clicks).
                High friction may indicate UX problems — investigate in {openLink}.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {["Page", "Traffic", "Eng. Time", "Scroll", "Rage", "Dead", "Quickback", "Excess. Scroll"].map((h) => (
                        <th key={h} className="text-left text-zinc-500 font-medium py-2 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {frictionPages.map((p) => (
                      <tr key={p.url} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2.5 pr-4 text-zinc-300 max-w-[180px]">
                          <span className="truncate block" title={p.url}>{pathLabel(p.url)}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-400">{p.traffic?.toLocaleString() ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-zinc-400">{fmtSeconds(p.engagement_time)}</td>
                        <td className="py-2.5 pr-4">
                          {p.scroll_depth != null
                            ? <span className="text-zinc-400">{Math.round(p.scroll_depth * 100)}%</span>
                            : <span className="text-zinc-600">—</span>
                          }
                        </td>
                        <td className="py-2.5 pr-4">
                          {p.rage_clicks != null && p.rage_clicks > 0
                            ? <span className="text-red-400 font-medium">{p.rage_clicks}</span>
                            : <span className="text-zinc-600">{p.rage_clicks ?? "—"}</span>
                          }
                        </td>
                        <td className="py-2.5 pr-4">
                          {p.dead_clicks != null && p.dead_clicks > 0
                            ? <span className="text-amber-400 font-medium">{p.dead_clicks}</span>
                            : <span className="text-zinc-600">{p.dead_clicks ?? "—"}</span>
                          }
                        </td>
                        <td className="py-2.5 pr-4">
                          {p.quickback_clicks != null && p.quickback_clicks > 0
                            ? <span className="text-orange-400 font-medium">{p.quickback_clicks}</span>
                            : <span className="text-zinc-600">{p.quickback_clicks ?? "—"}</span>
                          }
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-600">{p.excessive_scroll ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All pages have zero friction */}
          {frictionPages.length === 0 && scrollPages.length > 0 && (
            <p className="text-xs text-zinc-600">
              No significant friction signals detected in the last 7 days. {openLink} for detailed recordings.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function TrafficTab({ days }: { days: number }) {
  const router = useRouter();
  const [gsc,     setGsc]     = useState<GscData | null>(null);
  const [queries, setQueries] = useState<GscQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch(`/api/marketing/gsc?days=${days}`).then((r) => r.json()),
      fetch(`/api/marketing/gsc-queries?days=${days}`).then((r) => r.json()),
    ]).then(([gscRes, queriesRes]) => {
      if (gscRes.status === "fulfilled") setGsc(gscRes.value as GscData);
      if (queriesRes.status === "fulfilled") setQueries((queriesRes.value as { queries: GscQuery[] }).queries ?? []);
      setLoading(false);
    });
  }, [days]);

  const clarityId  = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "x5wop7s72a";
  const clarityUrl = `https://clarity.microsoft.com/projects/view/${clarityId}/dashboard`;

  return (
    <div className="space-y-5">
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Website Sessions (GA4)"
          placeholder="Connect GA4 property to see session data"
          badge="Tag Active"
        />
        <StatCard
          title="Search Clicks (GSC)"
          value={loading ? undefined : gsc?.connected ? gsc.clicks.toLocaleString() : undefined}
          subtitle={gsc?.connected ? `last ${days} days` : undefined}
          placeholder={gsc?.connected === false ? "Connect Google Search Console in Settings" : undefined}
        />
        {/* Clarity stat card — no iframe, link out instead */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 mb-2">Behaviour Analytics (Clarity)</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active — collecting data
          </span>
          <p className="text-[10px] text-zinc-600 mb-3">
            Project:{" "}
            <span className="font-mono text-zinc-500">{clarityId}</span>
          </p>
          <a
            href={clarityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open Heatmaps &amp; Recordings in Microsoft Clarity
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* GSC Chart — ResponsiveContainer inside explicit h-[220px] container */}
      {loading ? (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-[280px] animate-pulse" />
      ) : gsc?.connected && gsc.rows.length > 0 ? (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Search Performance</h3>
          <p className="text-xs text-zinc-500 mb-4">Clicks &amp; impressions — last {days} days</p>
          {/* minHeight ensures ResponsiveContainer always gets a valid height */}
          <div className="h-[220px]" style={{ minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gsc.rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
                <Line type="monotone" dataKey="clicks"      name="Clicks"       stroke="#e91e8c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="impressions" name="Impressions"   stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-zinc-400">Connect Google Search Console to see search performance</p>
          <button
            onClick={() => router.push("/social/settings")}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-xs text-white transition-all"
          >
            Go to Settings
          </button>
        </div>
      )}

      {/* Top queries table */}
      {gsc?.connected && (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Search Queries</h3>
          {queries.length === 0 ? (
            <p className="text-xs text-zinc-600">No query data available for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Query", "Clicks", "Impressions", "Avg Position", "CTR"].map((h) => (
                      <th key={h} className="text-left text-zinc-500 font-medium py-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queries.map((q, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[200px] truncate">{q.query}</td>
                      <td className="py-2.5 pr-4 text-white font-medium">{q.clicks}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{q.impressions.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{q.position}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{q.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Behaviour Insights — Clarity data (no iframe, link-out only) */}
      <BehaviourInsightsPanel clarityId={clarityId} />
    </div>
  );
}
