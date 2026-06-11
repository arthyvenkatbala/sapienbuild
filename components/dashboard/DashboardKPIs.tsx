"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import StatCard from "./StatCard";
import { useClientContext } from "@/lib/client-context";

interface Totals {
  spend: number; clicks: number; impressions: number;
  leads: number; ctr: number;   cpl: number;         roas: number;
}

interface Sparklines {
  spend: number[]; clicks: number[]; impressions: number[];
  leads: number[]; cpl:   number[];
}

interface Metrics {
  hasData:        boolean;
  syncedButEmpty: boolean;
  totals:         Totals;
  sparklines:     Sparklines;
  lastSyncedAt:   string | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export default function DashboardKPIs() {
  const { selectedClient } = useClientContext();
  const [metrics,  setMetrics]  = useState<Metrics | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [syncMsg,  setSyncMsg]  = useState("");

  const fetchMetrics = useCallback(async () => {
    if (!selectedClient) { setMetrics(null); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/clients/${selectedClient.id}/metrics`);
      const data = await res.json() as Metrics;
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  }, [selectedClient]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const handleSync = async () => {
    if (!selectedClient || syncing) return;
    setSyncing(true);
    setSyncMsg("");
    try {
      const res  = await fetch(`/api/clients/${selectedClient.id}/sync`, { method: "POST" });
      const data = await res.json() as { error?: string };
      setSyncMsg(res.ok ? "Synced!" : (data.error ?? "Sync failed"));
      if (res.ok) void fetchMetrics();
    } catch {
      setSyncMsg("Network error");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 4000);
    }
  };

  const t  = metrics?.totals;
  const sp = metrics?.sparklines;
  const convRate = t && t.clicks > 0 ? (t.leads / t.clicks) * 100 : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Performance Overview
          {selectedClient && (
            <span className="text-zinc-500 normal-case font-normal ml-2">
              · {selectedClient.business_name}
            </span>
          )}
        </p>

        <div className="flex items-center gap-3">
          {metrics?.lastSyncedAt && (
            <span className="text-[10px] text-zinc-600">
              Last sync: {new Date(metrics.lastSyncedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
          {selectedClient && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.15] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw size={10} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : syncMsg || "Sync Now"}
            </button>
          )}
        </div>
      </div>

      {/* No client selected */}
      {!selectedClient && (
        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[#111114] border border-white/[0.07] rounded-xl text-sm text-zinc-500">
          <AlertCircle size={14} className="shrink-0 text-zinc-600" />
          Select a client from the sidebar to view their ad performance.
        </div>
      )}

      {/* Loading skeleton */}
      {selectedClient && loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#111114] border border-white/[0.05] rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Never synced — prompt to sync */}
      {selectedClient && !loading && metrics && !metrics.hasData && !metrics.syncedButEmpty && (
        <div className="flex flex-col items-center gap-3 py-10 bg-[#111114] border border-white/[0.07] rounded-xl text-center">
          <AlertCircle size={20} className="text-zinc-600" />
          <p className="text-sm text-zinc-500">
            No ad metrics yet for <span className="text-zinc-300">{selectedClient.business_name}</span>.
          </p>
          <p className="text-xs text-zinc-600">
            Click <span className="text-zinc-400 font-semibold">Sync Now</span> above to pull the latest data from Meta &amp; Google.
          </p>
        </div>
      )}

      {/* Synced but no spend in this period */}
      {selectedClient && !loading && metrics?.syncedButEmpty && (
        <div className="flex items-start gap-3 px-5 py-4 bg-[#111114] border border-amber-500/20 rounded-xl">
          <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-300 font-medium">No ad spend found in the last 30 days</p>
            <p className="text-xs text-zinc-500 mt-1">
              Your Meta &amp; Google accounts are connected and sync ran successfully
              {metrics.lastSyncedAt && (
                <> on {new Date(metrics.lastSyncedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
              )}, but there was no campaign spend data returned.
              This usually means all campaigns are paused or have zero budget. Activate a campaign to start seeing data here.
            </p>
          </div>
        </div>
      )}

      {/* Real KPI cards */}
      {selectedClient && !loading && metrics?.hasData && t && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          <StatCard label="Total Spend"   value={`₹${fmt(t.spend)}`}              change={0} sparkline={sp?.spend       ?? []} color="purple" delay={0}    />
          <StatCard label="Total Clicks"  value={fmt(t.clicks)}                   change={0} sparkline={sp?.clicks      ?? []} color="blue"   delay={0.05} />
          <StatCard label="Impressions"   value={t.impressions > 999 ? `${(t.impressions / 1000).toFixed(1)}k` : fmt(t.impressions)} change={0} sparkline={sp?.impressions ?? []} color="green"  delay={0.1}  />
          <StatCard label="Cost Per Lead" value={t.cpl > 0 ? `₹${fmt(t.cpl)}` : "—"}   change={0} sparkline={sp?.cpl        ?? []} color="orange" delay={0.15} />
          <StatCard label="Leads"         value={fmt(t.leads)}                    change={0} sparkline={sp?.leads       ?? []} color="purple" delay={0.2}  />
          <StatCard label="CTR"           value={`${t.ctr.toFixed(2)}%`}          change={0} sparkline={[]}                    color="green"  delay={0.25} />
          <StatCard label="Conv. Rate"    value={`${convRate.toFixed(2)}%`}        change={0} sparkline={[]}                    color="blue"   delay={0.3}  />
        </div>
      )}
    </section>
  );
}
