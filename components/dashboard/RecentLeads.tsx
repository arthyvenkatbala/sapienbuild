"use client";

import { motion } from "framer-motion";

interface Lead {
  name: string;
  source: string;
  eventtype: string;
  status: string;
}

const statusColor: Record<string, string> = {
  "New Lead":  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Contacted": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Qualified": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Booked":    "bg-green-500/15 text-green-400 border-green-500/30",
};

export default function RecentLeads({ leads }: { leads: Lead[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Recent Leads</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Latest enquiries</p>
        </div>
        <button className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
          View all →
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-zinc-600">No leads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d10] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  background: `hsl(${(i * 67) % 360}, 60%, 25%)`,
                  color: `hsl(${(i * 67) % 360}, 80%, 75%)`,
                }}
              >
                {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                <p className="text-xs text-zinc-500 truncate">{lead.source} · {lead.eventtype}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  statusColor[lead.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {lead.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
