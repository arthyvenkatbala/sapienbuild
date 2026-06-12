"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts";

export interface AssetCategoryData {
  category:   string;
  count:      number;
  totalValue: number;
}

function inrFormat(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + Math.round(n / 1000) + "K";
  return "₹" + n.toLocaleString("en-IN");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AssetCategoryData;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-zinc-300 font-medium mb-1">{d.category}</p>
      <p className="text-white">
        Count: <span className="font-bold">{d.count}</span>
      </p>
      {d.totalValue > 0 && (
        <p className="text-zinc-400">Value: {inrFormat(d.totalValue)}</p>
      )}
    </div>
  );
}

export default function AssetChart({
  categories,
  totalValue,
}: {
  categories: AssetCategoryData[];
  totalValue: number;
}) {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 flex flex-col">
      <h2 className="text-sm font-semibold text-white">Asset Overview</h2>
      <p className="text-xs text-zinc-500 mt-0.5 mb-4">Equipment by category</p>

      {categories.length === 0 ? (
        <div className="h-[188px] flex items-center justify-center">
          <p className="text-xs text-zinc-600">No assets recorded</p>
        </div>
      ) : (
        <div className="h-[188px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={categories}
              margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={76}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="count"
                fill="#7c3aed"
                radius={[0, 4, 4, 0]}
                barSize={14}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Total asset value</span>
          <span className="text-sm font-semibold text-violet-400">
            {inrFormat(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
