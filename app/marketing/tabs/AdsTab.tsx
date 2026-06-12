"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Eye, MousePointer, UserPlus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface MetaAdsData {
  totalSpend:  number;
  impressions: number;
  clicks:      number;
  leads:       number;
  campaigns:   Array<{
    id:          string;
    name:        string;
    status:      string;
    spend:       number;
    impressions: number;
    clicks:      number;
    leads:       number;
    ctr:         number;
    cpl:         number;
  }>;
}

function inrFormat(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + "L";
  if (n >= 1000)   return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n.toLocaleString("en-IN");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-white font-bold">{inrFormat(payload[0].value)}</p>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:  "bg-green-500/10 border-green-500/20 text-green-400",
  PAUSED:  "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export default function AdsTab({ days }: { days: number }) {
  const [data,    setData]    = useState<MetaAdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/marketing/meta-ads?days=${days}`)
      .then((r) => r.json())
      .then((d: MetaAdsData & { error?: string }) => {
        if (d.error) { setError(true); } else { setData(d); }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [days]);

  const statCards = [
    { title: "Total Spend",      value: data ? inrFormat(data.totalSpend)            : "—", icon: IndianRupee, color: "text-pink-400",   bg: "bg-pink-500/10"   },
    { title: "Impressions",      value: data ? data.impressions.toLocaleString()       : "—", icon: Eye,         color: "text-violet-400", bg: "bg-violet-500/10" },
    { title: "Clicks",           value: data ? data.clicks.toLocaleString()            : "—", icon: MousePointer, color: "text-blue-400",  bg: "bg-blue-500/10"   },
    { title: "Leads Generated",  value: data ? data.leads.toLocaleString()             : "—", icon: UserPlus,    color: "text-green-400",  bg: "bg-green-500/10"  },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Meta stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg }) => (
          <div key={title} className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-xl font-bold text-white">{error ? "—" : value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{title}</p>
          </div>
        ))}
      </div>

      {/* Campaign performance table */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Campaign Performance</h3>
        {error || !data?.campaigns.length ? (
          <p className="text-xs text-zinc-600">
            {error ? "Could not load Meta Ads data. Check META_PAGE_ACCESS_TOKEN and META_AD_ACCOUNT_ID." : "No campaigns found for this period."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Campaign", "Status", "Spend", "Impressions", "CTR", "Leads", "CPL"].map((h) => (
                    <th key={h} className="text-left text-zinc-500 font-medium py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 text-zinc-300 max-w-[180px] truncate">{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_STYLE[c.status] ?? "bg-white/[0.04] border-white/[0.07] text-zinc-500"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-white font-medium">{inrFormat(c.spend)}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{c.impressions.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{c.ctr}%</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{c.leads}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{c.cpl > 0 ? inrFormat(c.cpl) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Spend over time — placeholder (Meta API daily breakdown needs separate call) */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">Spend Over Time</h3>
        <p className="text-xs text-zinc-500 mb-4">Daily ad spend — last {days} days</p>
        {!data || error ? (
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-xs text-zinc-600">No data available for this period.</p>
          </div>
        ) : (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[{ day: "Total", spend: data.totalSpend }]}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="spend" name="Spend" stroke="#e91e8c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Google Ads placeholder */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Google Ads</h3>
          <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium">
            Account Ready
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-1">Customer ID: 379-721-4027</p>
        <p className="text-xs text-zinc-600 mt-3">
          No campaigns running yet. Data will appear here once campaigns are live.
        </p>
      </div>

      {/* LinkedIn Ads placeholder */}
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">LinkedIn Ads</h3>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
            Pending Approval
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-1">
          Awaiting API access approval from LinkedIn. Usually takes 1–7 business days.
        </p>
      </div>
    </div>
  );
}
