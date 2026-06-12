"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ConnectionStatusStrip from "./ConnectionStatusStrip";

const TrafficTab = dynamic(() => import("./tabs/TrafficTab"), { ssr: false });
const AdsTab     = dynamic(() => import("./tabs/AdsTab"),     { ssr: false });
const SocialTab  = dynamic(() => import("./tabs/SocialTab"),  { ssr: false });
const LocalTab   = dynamic(() => import("./tabs/LocalTab"),   { ssr: false });

const TABS = ["Traffic", "Ads", "Social", "Local"] as const;
type Tab = typeof TABS[number];

const DATE_RANGES = [
  { label: "Last 7 days",  days: 7  },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

interface ConnectionStatus {
  gscConnected: boolean;
  gmbConnected: boolean;
  ytConnected:  boolean;
}

export default function MarketingPage() {
  const [activeTab,  setActiveTab]  = useState<Tab>("Traffic");
  const [rangeDays,  setRangeDays]  = useState(30);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>({
    gscConnected: false,
    gmbConnected: false,
    ytConnected:  false,
  });

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/gsc/status").then((r) => r.json()),
      fetch("/api/gmb/status").then((r) => r.json()),
      fetch("/api/youtube/status").then((r) => r.json()),
    ]).then(([gsc, gmb, yt]) => {
      setConnStatus({
        gscConnected: gsc.status  === "fulfilled" && (gsc.value  as { connected?: boolean }).connected  === true,
        gmbConnected: gmb.status  === "fulfilled" && (gmb.value  as { connected?: boolean }).connected  === true,
        ytConnected:  yt.status   === "fulfilled" && (yt.value   as { connected?: boolean }).connected  === true,
      });
    });
  }, []);

  const platforms = [
    { label: "Google Search Console",  connected: connStatus.gscConnected },
    { label: "Google Analytics 4",     connected: true },
    { label: "Meta Ads",               connected: true },
    { label: "Facebook & Instagram",   connected: true },
    { label: "Microsoft Clarity",      connected: true },
    { label: "FB Pixel",               connected: true },
    { label: "Google My Business",     connected: connStatus.gmbConnected },
    { label: "YouTube",                connected: connStatus.ytConnected  },
    { label: "Google Ads",             connected: true },
    { label: "LinkedIn Ads",           connected: false, pending: true    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-semibold text-white">Marketing Analytics</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Performance across all platforms</p>
          </div>
          {/* Date range selector */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {DATE_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRangeDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  rangeDays === r.days
                    ? "bg-white/[0.1] text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-5">

        {/* Connection status strip */}
        <ConnectionStatusStrip platforms={platforms} />

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Traffic" && <TrafficTab days={rangeDays} />}
        {activeTab === "Ads"     && <AdsTab     days={rangeDays} />}
        {activeTab === "Social"  && <SocialTab  />}
        {activeTab === "Local"   && <LocalTab   />}

      </main>
    </div>
  );
}
