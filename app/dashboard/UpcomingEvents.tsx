import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { getStageColor, getStageLabel } from "@/lib/workflow";

export interface UpcomingProject {
  id:             string;
  title:          string;
  event_date:     string;
  event_type:     string | null;
  workflow_stage: string;
  contact: { first_name: string; last_name: string } | null;
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  });
}

function daysUntil(dateStr: string): { label: string; urgent: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + "T00:00:00");
  event.setHours(0, 0, 0, 0);
  const diff = Math.round((event.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return { label: "today!",   urgent: true };
  if (diff === 1) return { label: "tomorrow", urgent: true };
  if (diff <= 3)  return { label: `in ${diff} days`, urgent: true };
  return { label: `in ${diff} days`, urgent: false };
}

export default function UpcomingEvents({ events }: { events: UpcomingProject[] }) {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Upcoming Events</h2>
        <Link
          href="/projects"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          All projects →
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <CalendarDays size={16} className="text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-500">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((ev, i) => {
            const contact = ev.contact as { first_name: string; last_name: string } | null | unknown[];
            const contactObj = Array.isArray(contact) ? (contact[0] as { first_name: string; last_name: string } | undefined) ?? null : contact as { first_name: string; last_name: string } | null;
            const clientName = contactObj
              ? `${contactObj.first_name} ${contactObj.last_name}`.trim()
              : ev.title;
            const { label: untilLabel, urgent } = daysUntil(ev.event_date);
            const badgeCls = getStageColor(ev.workflow_stage);

            return (
              <Link
                key={ev.id}
                href={`/projects/${ev.id}`}
                className={`flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-xl px-1 -mx-1 transition-all ${i < events.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                {/* Date block */}
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase leading-none">
                    {new Date(ev.event_date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-white leading-tight">
                    {new Date(ev.event_date + "T00:00:00").getDate()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{clientName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-zinc-600">
                      {formatEventDate(ev.event_date)}
                    </span>
                    {ev.event_type && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[9px] text-zinc-600 capitalize">{ev.event_type}</span>
                      </>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border capitalize mt-1 inline-block ${badgeCls}`}>
                    {getStageLabel(ev.workflow_stage)}
                  </span>
                </div>

                {/* Days until */}
                <span className={`text-[10px] font-semibold shrink-0 ${urgent ? "text-amber-400" : "text-zinc-500"}`}>
                  {untilLabel}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
