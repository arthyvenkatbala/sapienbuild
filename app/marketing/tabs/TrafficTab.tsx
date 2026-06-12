"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

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

function StatCard({
  title, value, subtitle, placeholder, badge,
}: {
  title:       string;
  value?:      string | number;
  subtitle?:   string;
  placeholder?: string;
  badge?:      string;
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

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "x5wop7s72a";

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
          badge={!gsc?.connected ? undefined : undefined}
        />
        <StatCard
          title="Clarity Sessions"
          placeholder="Live heatmap and session recordings active"
          badge={`Project: ${clarityId}`}
        />
      </div>

      {/* GSC Chart */}
      {loading ? (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-[280px] animate-pulse" />
      ) : gsc?.connected && gsc.rows.length > 0 ? (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Search Performance</h3>
          <p className="text-xs text-zinc-500 mb-4">Clicks & impressions — last {days} days</p>
          <div className="h-[220px]">
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
                <Line type="monotone" dataKey="clicks"      name="Clicks"      stroke="#e91e8c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="impressions" name="Impressions"  stroke="#7c3aed" strokeWidth={2} dot={false} />
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

      {/* Microsoft Clarity embed */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Behaviour Analytics — Microsoft Clarity</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Heatmaps & session recordings</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Active — collecting data
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-500 text-[10px] font-mono">
              {clarityId}
            </span>
          </div>
        </div>
        <iframe
          src={`https://clarity.microsoft.com/projects/view/${clarityId}`}
          height={500}
          width="100%"
          style={{ border: "none", borderRadius: 8 }}
          title="Microsoft Clarity"
        />
        <p className="text-[10px] text-zinc-600 mt-3">
          Full heatmaps and session recordings available at{" "}
          <span className="text-zinc-500">clarity.microsoft.com</span>
        </p>
      </div>
    </div>
  );
}
