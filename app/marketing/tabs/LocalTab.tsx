"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GmbData {
  connected:          boolean;
  profileViews:       number;
  directionRequests:  number;
  calls:              number;
  websiteClicks:      number;
}

const METRICS = [
  { key: "profileViews",      label: "Profile Views"       },
  { key: "directionRequests", label: "Direction Requests"  },
  { key: "calls",             label: "Phone Calls"         },
  { key: "websiteClicks",     label: "Website Clicks"      },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function LocalTab() {
  const router  = useRouter();
  const [data,    setData]    = useState<GmbData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketing/gmb")
      .then((r) => r.json())
      .then((d: GmbData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-64 animate-pulse" />
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
          📍
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Connect Google My Business</p>
          <p className="text-xs text-zinc-500 mt-1">
            Link your GMB account to see profile views, direction requests, calls, and website clicks.
          </p>
        </div>
        <button
          onClick={() => router.push("/social/settings")}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 transition-all"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  const chartData = METRICS.map((m) => ({
    label: m.label,
    value: data[m.key as keyof GmbData] as number,
  }));

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <div key={m.key} className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-white">
              {(data[m.key as keyof GmbData] as number).toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">last 30 days</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">GMB Engagement</h3>
        <p className="text-xs text-zinc-500 mb-4">All metrics — last 30 days</p>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
