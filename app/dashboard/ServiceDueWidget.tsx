import Link from "next/link";
import { Wrench, AlertTriangle, Clock } from "lucide-react";

export interface ServiceDueAsset {
  id:              string;
  name:            string;
  category:        string | null;
  next_service_due: string;
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((new Date(iso).getTime() - today.getTime()) / 86_400_000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

export default function ServiceDueWidget({ assets }: { assets: ServiceDueAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Assets Due for Service</h2>
        </div>
        <p className="text-xs text-zinc-600 py-4 text-center">All assets are up to date</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Assets Due for Service</h2>
        </div>
        <Link
          href="/assets"
          className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {assets.map((a) => {
          const days     = daysUntil(a.next_service_due);
          const overdue  = days < 0;
          const dueSoon  = days >= 0 && days <= 7;

          return (
            <Link
              key={a.id}
              href="/assets"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                overdue ? "bg-red-500/10" : "bg-amber-500/10"
              }`}>
                {overdue
                  ? <AlertTriangle size={13} className="text-red-400" />
                  : <Clock         size={13} className="text-amber-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{a.name}</p>
                <p className="text-[10px] text-zinc-600 capitalize">{a.category ?? "Equipment"}</p>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-[10px] font-semibold ${overdue ? "text-red-400" : "text-amber-400"}`}>
                  {overdue
                    ? `${Math.abs(days)}d overdue`
                    : days === 0 ? "Today"
                    : `${days}d`}
                </p>
                <p className="text-[10px] text-zinc-600">{fmtDate(a.next_service_due)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
