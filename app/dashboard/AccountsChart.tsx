"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export interface InvoiceTypeData {
  type:   string;
  label:  string;
  count:  number;
  value:  number; // raw ₹
}

function inrFormat(n: number): string {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return "₹" + Math.round(n / 1000) + "K";
  return "₹" + n.toLocaleString("en-IN");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1f] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-zinc-400 font-medium mb-1.5">{label}</p>
      {payload.map((p: { dataKey: string; fill: string; name: string; value: number }) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-zinc-300">{p.name}</span>
          <span className="font-bold text-white ml-1">
            {p.dataKey === "valueK" ? `₹${p.value}K` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AccountsChart({
  invoiceTypes,
  totalOutstanding,
}: {
  invoiceTypes:     InvoiceTypeData[];
  totalOutstanding: number;
}) {
  const data = invoiceTypes.map((t) => ({
    ...t,
    valueK: Math.round(t.value / 1000),
  }));

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 flex flex-col">
      <h2 className="text-sm font-semibold text-white">Accounts Summary</h2>
      <p className="text-xs text-zinc-500 mt-0.5 mb-4">Documents by type</p>

      <div className="h-[188px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
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
              name="Count"
              fill="#e91e8c"
              radius={[3, 3, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="valueK"
              name="Value (₹K)"
              fill="#7c3aed"
              radius={[3, 3, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Total outstanding</span>
          <span className="text-sm font-semibold text-amber-400">
            {inrFormat(totalOutstanding)}
          </span>
        </div>
      </div>
    </div>
  );
}
