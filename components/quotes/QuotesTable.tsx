"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Eye, Edit3, Send, Trash2, Search } from "lucide-react";
import { Quote, QuoteStatus, STATUS_META } from "@/lib/quotes-data";

type SortKey = "clientName" | "grandTotal" | "createdAt" | "status" | "aiScore";
type SortDir = "asc" | "desc";

interface Props {
  quotes:         Quote[];
  onSelectQuote:  (q: Quote) => void;
  onEditQuote:    (q: Quote) => void;
  onDeleteQuote:  (id: string) => void;
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
}

function SortIcon({ field, sortKey, dir }: { field: string; sortKey: SortKey; dir: SortDir }) {
  if (field !== sortKey) return <ChevronUp size={10} className="text-zinc-700" />;
  return dir === "asc"
    ? <ChevronUp   size={10} className="text-purple-400" />
    : <ChevronDown size={10} className="text-purple-400" />;
}

const HEADERS: { label: string; key: SortKey | null; width?: string }[] = [
  { label: "Client",       key: "clientName" },
  { label: "Event",        key: null },
  { label: "Total",        key: "grandTotal" },
  { label: "Status",       key: "status" },
  { label: "AI Score",     key: "aiScore" },
  { label: "Created",      key: "createdAt" },
  { label: "Valid Until",  key: null },
  { label: "Follow-Ups",   key: null },
  { label: "Actions",      key: null, width: "w-24" },
];

export default function QuotesTable({ quotes, onSelectQuote, onEditQuote, onDeleteQuote }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...quotes].sort((a, b) => {
    let av: string | number = a[sortKey] ?? "";
    let bv: string | number = b[sortKey] ?? "";
    if (sortKey === "grandTotal" || sortKey === "aiScore") {
      av = Number(av); bv = Number(bv);
    }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {HEADERS.map((h) => (
                <th
                  key={h.label}
                  className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ${h.width ?? ""} ${h.key ? "cursor-pointer select-none hover:text-zinc-300 transition-colors" : ""}`}
                  onClick={() => h.key && handleSort(h.key)}
                >
                  <div className="flex items-center gap-1">
                    {h.label}
                    {h.key && <SortIcon field={h.key} sortKey={sortKey} dir={sortDir} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sorted.map((q, i) => {
              const meta = STATUS_META[q.status];
              const scoreColor =
                q.aiScore >= 80 ? "#22c55e"
                : q.aiScore >= 60 ? "#f97316"
                : "#ef4444";
              return (
                <motion.tr
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelectQuote(q)}
                  className="hover:bg-white/[0.025] cursor-pointer transition-colors group"
                >
                  {/* Client */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{q.clientName}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{q.clientLocation}</p>
                  </td>

                  {/* Event */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.eventTypes.map((et) => (
                        <span key={et} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-zinc-400">
                          {et}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1 truncate max-w-[140px]">{q.eventDates}</p>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{fmt(q.grandTotal)}</p>
                    {q.discountAmount > 0 && (
                      <p className="text-[10px] text-green-500 mt-0.5">−{fmt(q.discountAmount)} disc.</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border ${meta.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {q.status}
                    </span>
                  </td>

                  {/* AI Score */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden w-12">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${q.aiScore}%`, background: scoreColor }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: scoreColor }}>{q.aiScore}</span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-zinc-500 text-xs">{q.createdAt}</td>

                  {/* Valid Until */}
                  <td className="px-4 py-3 text-zinc-500 text-xs">{q.validUntil}</td>

                  {/* Follow-Ups */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${q.followUpCount >= 3 ? "text-red-400" : q.followUpCount >= 1 ? "text-yellow-400" : "text-zinc-600"}`}>
                      {q.followUpCount === 0 ? "None" : `${q.followUpCount}×`}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="View"
                        onClick={(e) => { e.stopPropagation(); onSelectQuote(q); }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-500 hover:text-white transition-all"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        title="Edit"
                        onClick={(e) => { e.stopPropagation(); onEditQuote(q); }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-500 hover:text-blue-400 transition-all"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        title="Send"
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-500 hover:text-green-400 transition-all"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); onDeleteQuote(q.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {quotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Search size={28} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No quotes match your filters</p>
            <p className="text-xs mt-1 text-zinc-700">Try adjusting the search or status filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
