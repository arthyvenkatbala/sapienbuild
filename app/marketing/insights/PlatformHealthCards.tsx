"use client";

import type { HealthScore } from "@/lib/marketing-insights";

const STATUS_COLORS = {
  "Good":          { ring: "#22c55e", text: "text-green-400",  bg: "bg-green-400/10",  badge: "bg-green-500/20 text-green-300" },
  "Watch":         { ring: "#f59e0b", text: "text-amber-400",  bg: "bg-amber-400/10",  badge: "bg-amber-500/20 text-amber-300" },
  "Action Needed": { ring: "#ef4444", text: "text-red-400",    bg: "bg-red-400/10",    badge: "bg-red-500/20 text-red-300"   },
} as const;

function ProgressRing({ score, color }: { score: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

function HealthCard({ hs }: { hs: HealthScore }) {
  const colors = STATUS_COLORS[hs.status];

  if (!hs.connected) {
    return (
      <div className="flex flex-col gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-medium text-white/80">{hs.platform}</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            Not connected
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[88px] h-[88px] shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xl font-bold">
              —
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Connect this platform to see health metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 border rounded-2xl p-5 ${colors.bg} border-white/[0.06]`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium text-white/90">{hs.platform}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
          {hs.status}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-[88px] h-[88px] shrink-0">
          <ProgressRing score={hs.score} color={colors.ring} />
          <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${colors.text}`}>
            {hs.score}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">{hs.primaryMetric}</span>
          <span className={`text-base font-semibold ${colors.text}`}>{hs.primaryValue}</span>
        </div>
      </div>
    </div>
  );
}

export default function PlatformHealthCards({ healthScores }: { healthScores: HealthScore[] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
        Platform Health
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthScores.map((hs) => (
          <HealthCard key={hs.platform} hs={hs} />
        ))}
      </div>
    </section>
  );
}
