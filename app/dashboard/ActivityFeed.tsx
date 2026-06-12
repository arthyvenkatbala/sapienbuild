import Link from "next/link";
import { Activity } from "lucide-react";
import { getStageLabel, getStageColor } from "@/lib/workflow";

export interface ActivityEvent {
  id:         string;
  from_stage: string | null;
  to_stage:   string;
  created_at: string;
  project: {
    id:             string;
    title:          string;
    workflow_stage: string;
    contact: { first_name: string; last_name: string } | null;
  } | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Dot color per stage
const STAGE_DOT: Record<string, string> = {
  enquiry:         "bg-zinc-400",
  discussion:      "bg-purple-400",
  quote:           "bg-yellow-400",
  negotiation:     "bg-orange-400",
  booked:          "bg-teal-400",
  execution:       "bg-blue-400",
  feedback:        "bg-pink-400",
  post_production: "bg-indigo-400",
  delivery:        "bg-green-400",
};

export default function ActivityFeed({ activity }: { activity: ActivityEvent[] }) {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
        <Link
          href="/workflow"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          View kanban →
        </Link>
      </div>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Activity size={20} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">No recent activity</p>
          <p className="text-xs text-zinc-700 mt-1">Move a project through the workflow to see events here</p>
        </div>
      ) : (
        <div>
          {activity.map((event, i) => {
            const proj    = event.project;
            const contact = proj?.contact as { first_name: string; last_name: string } | null | { first_name: string; last_name: string }[];
            const contactObj = Array.isArray(contact) ? contact[0] ?? null : contact;
            const clientName = contactObj
              ? `${contactObj.first_name} ${contactObj.last_name}`.trim()
              : null;
            const dotCls  = STAGE_DOT[event.to_stage] ?? "bg-zinc-500";
            const badgeCls = getStageColor(event.to_stage);

            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 py-3 ${i < activity.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${dotCls} mt-2 shrink-0`} />
                <div className="flex-1 min-w-0">
                  {proj ? (
                    <Link
                      href={`/projects/${proj.id}`}
                      className="text-sm text-white hover:text-pink-300 transition-colors truncate block"
                    >
                      {proj.title}
                      {clientName && (
                        <span className="text-zinc-500 font-normal"> · {clientName}</span>
                      )}
                    </Link>
                  ) : (
                    <p className="text-sm text-zinc-500 truncate">Unknown project</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-600">moved to</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${badgeCls}`}>
                      {getStageLabel(event.to_stage)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-600 shrink-0 mt-0.5">{timeAgo(event.created_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
