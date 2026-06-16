"use client";

import Link from "next/link";

const TABS = [
  { label: "Traffic", href: "/marketing" },
  { label: "Ads",     href: "/marketing" },
  { label: "Social",  href: "/marketing" },
  { label: "Local",   href: "/marketing" },
  { label: "Insights", href: "/marketing/insights" },
] as const;

export default function InsightsTabStrip() {
  return (
    <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
      {TABS.map((tab) => {
        const active = tab.label === "Insights";
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              active
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
