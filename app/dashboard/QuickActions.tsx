"use client";

import Link from "next/link";
import { UserPlus, FolderPlus, GitBranch, FileText } from "lucide-react";

const ACTIONS = [
  {
    label: "+ New Lead",
    href:  "/crm/leads?new=true",
    icon:  UserPlus,
    cls:   "bg-pink-600 hover:bg-pink-500 text-white",
  },
  {
    label: "+ New Project",
    href:  "/projects?new=true",
    icon:  FolderPlus,
    cls:   "bg-violet-600 hover:bg-violet-500 text-white",
  },
  {
    label: "View Workflow",
    href:  "/workflow",
    icon:  GitBranch,
    cls:   "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white",
  },
  {
    label: "Generate Quote",
    href:  "/accounts?new=quote",
    icon:  FileText,
    cls:   "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-xs font-medium transition-all text-center ${a.cls}`}
            >
              <Icon size={16} />
              {a.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
