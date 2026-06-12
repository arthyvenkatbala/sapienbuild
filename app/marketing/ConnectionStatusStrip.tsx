"use client";

interface Platform {
  label:     string;
  connected: boolean;
  pending?:  boolean;
}

export default function ConnectionStatusStrip({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <div
          key={p.label}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            p.pending
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : p.connected
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-white/[0.03] border-white/[0.07] text-zinc-500"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              p.pending ? "bg-amber-400" : p.connected ? "bg-green-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          {p.label}
          <span className="opacity-60 ml-0.5">
            {p.pending ? "Pending" : p.connected ? "Active" : "Not connected"}
          </span>
        </div>
      ))}
    </div>
  );
}
