"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const STAGE_COLORS: Record<string, string> = {
  enquiry:         "#64748b",
  discussion:      "#3b82f6",
  quote:           "#eab308",
  negotiation:     "#f97316",
  booked:          "#10b981",
  execution:       "#e91e8c",
  feedback:        "#8b5cf6",
  post_production: "#6366f1",
  delivery:        "#06b6d4",
};

const STAGE_LABELS: Record<string, string> = {
  enquiry:         "Enquiry",
  discussion:      "Discussion",
  quote:           "Quote",
  negotiation:     "Negotiation",
  booked:          "Booked",
  execution:       "Execution",
  feedback:        "Feedback",
  post_production: "Post Production",
  delivery:        "Delivery",
};

export interface StageData { stage: string; count: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
        <span className="text-zinc-300">{d.name}</span>
        <span className="font-bold text-white ml-1">{d.value}</span>
      </div>
    </div>
  );
}

export default function ProjectStatusChart({
  stages,
  total,
}: {
  stages: StageData[];
  total:  number;
}) {
  const data = stages
    .filter((s) => s.count > 0)
    .map((s) => ({
      name:  STAGE_LABELS[s.stage] ?? s.stage,
      value: s.count,
      color: STAGE_COLORS[s.stage] ?? "#64748b",
      stage: s.stage,
    }));

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 flex flex-col">
      <h2 className="text-sm font-semibold text-white">Project Status</h2>
      <p className="text-xs text-zinc-500 mt-0.5 mb-4">Distribution across workflow stages</p>

      {data.length === 0 ? (
        <div className="h-[188px] flex items-center justify-center">
          <p className="text-xs text-zinc-600">No projects yet</p>
        </div>
      ) : (
        <>
          {/* Donut with center overlay */}
          <div className="relative h-[188px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#111114"
                  paddingAngle={2}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-white leading-none">{total}</p>
                <p className="text-[10px] text-zinc-500 mt-1">projects</p>
              </div>
            </div>
          </div>

          {/* Legend grid */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {data.map((d) => (
              <div key={d.stage} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] text-zinc-400 truncate flex-1">{d.name}</span>
                <span className="text-[10px] font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
