"use client";

import { useState } from "react";
import type { TrendAlert } from "@/lib/marketing-insights";

export default function TrendAlertsPanel({ alerts }: { alerts: TrendAlert[] }) {
  const [open, setOpen] = useState(true);

  if (alerts.length === 0) return null;

  return (
    <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
            Trend Alerts
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            {alerts.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-3">
          {alerts.map((alert, i) => {
            const isUp = alert.direction === "up";
            const arrow = isUp ? "↑" : "↓";
            const color = isUp ? "text-green-400" : "text-red-400";
            const bg    = isUp ? "bg-green-500/10" : "bg-red-500/10";
            const border = isUp ? "border-green-500/20" : "border-red-500/20";

            return (
              <div
                key={i}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${bg} ${border}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${color}`}>{arrow} {Math.abs(alert.changePct)}%</span>
                    <span className="text-sm font-medium text-white/80">{alert.metric}</span>
                    <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-white/[0.04]">
                      {alert.platform}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {alert.period1Label}: <span className="text-zinc-300">{alert.period1Value.toLocaleString("en-IN")}</span>
                    {" → "}
                    {alert.period2Label}: <span className="text-zinc-300">{alert.period2Value.toLocaleString("en-IN")}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
