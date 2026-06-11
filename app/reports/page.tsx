"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Share2,
  Mail,
  Sparkles,
  Calendar,
  FileBarChart,
  BarChart3,
  Palette,
  Target,
  Zap,
  Clock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import ReportOverviewCards from "@/components/reports/ReportOverviewCards";
import SpendLeadCharts from "@/components/reports/SpendLeadCharts";
import PlatformCampaignSection from "@/components/reports/PlatformCampaignSection";
import CreativeFunnelSection from "@/components/reports/CreativeFunnelSection";
import AIChatAgent from "@/components/dashboard/AIChatAgent";
import { reportAISummaries } from "@/lib/mock-data";

// ── Filter options ────────────────────────────────────────────────────────────
const DATE_RANGES = ["This Week", "This Month", "Last 3 Months", "Custom"] as const;
const PLATFORMS   = ["All Platforms", "Instagram", "Facebook", "Google", "YouTube"] as const;
const MEDIA_TYPES = ["All Types", "Video", "Carousel", "Static"] as const;

// ── Template config ───────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "executive", label: "Executive Summary",  icon: FileBarChart, desc: "Board-ready overview",  summaryKey: "executive" },
  { id: "detailed",  label: "Detailed Analytics", icon: BarChart3,    desc: "Deep-dive metrics",     summaryKey: "executive" },
  { id: "creative",  label: "Creative Analysis",  icon: Palette,      desc: "Creative performance",  summaryKey: "creative"  },
  { id: "campaign",  label: "Campaign Breakdown", icon: Target,       desc: "Campaign-level data",   summaryKey: "campaign"  },
] as const;

// ── Report generator types ────────────────────────────────────────────────────
const REPORT_TYPES = [
  { id: "weekly",    label: "Weekly Report",          icon: Calendar    },
  { id: "monthly",   label: "Monthly Report",         icon: FileText    },
  { id: "campaign",  label: "Campaign Report",        icon: BarChart3   },
  { id: "platform",  label: "Platform Report",        icon: Target      },
  { id: "creative",  label: "Creative Performance",   icon: Palette     },
] as const;

export default function ReportsPage() {
  const [activeTemplate, setActiveTemplate] = useState<string>("executive");
  const [activeDateRange, setActiveDateRange] = useState<string>("This Month");
  const [activePlatform, setActivePlatform]   = useState<string>("All Platforms");
  const [activeMediaType, setActiveMediaType] = useState<string>("All Types");
  const [generatingId, setGeneratingId]       = useState<string | null>(null);
  const [doneId, setDoneId]                   = useState<string | null>(null);

  const handleGenerate = (id: string) => {
    setGeneratingId(id);
    setDoneId(null);
    setTimeout(() => {
      setGeneratingId(null);
      setDoneId(id);
    }, 1800);
  };

  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate) ?? TEMPLATES[0];
  const summaryText =
    reportAISummaries[currentTemplate.summaryKey as keyof typeof reportAISummaries];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Performance Reports</h1>
          <p className="text-xs text-zinc-500">Premium executive reporting centre · Jun 2026</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export buttons */}
          <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all">
            <Download size={12} /> PDF
          </button>
          <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all">
            <FileText size={12} /> CSV
          </button>
          <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] px-3 py-1.5 rounded-xl transition-all">
            <Share2 size={12} /> Share
          </button>
          <button className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-xl transition-all font-medium">
            <Mail size={12} /> Email Report
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 space-y-8 max-w-[1400px] w-full mx-auto">

        {/* ── Interactive filters ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mr-1">
            Filters
          </span>

          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setActiveDateRange(r)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                activeDateRange === r
                  ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
              }`}
            >
              {r}
            </button>
          ))}

          <div className="w-px h-4 bg-white/[0.08] mx-1" />

          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                activePlatform === p
                  ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
              }`}
            >
              {p}
            </button>
          ))}

          <div className="w-px h-4 bg-white/[0.08] mx-1" />

          {MEDIA_TYPES.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMediaType(m)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                activeMediaType === m
                  ? "bg-green-500/15 border-green-500/40 text-green-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
              }`}
            >
              {m}
            </button>
          ))}
        </motion.div>

        {/* ── Templates + Generator ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Report Templates */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5"
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileBarChart size={14} className="text-purple-400" />
                Report Templates
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Select your reporting format</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                const active = activeTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTemplate(t.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-purple-500/10 border-purple-500/30"
                        : "border-white/[0.06] hover:border-white/[0.13] hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={`mt-0.5 shrink-0 ${active ? "text-purple-400" : "text-zinc-500"}`}
                    />
                    <div>
                      <p className={`text-xs font-medium ${active ? "text-white" : "text-zinc-400"}`}>
                        {t.label}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Automated Generator */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
            className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5"
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" />
                Automated Generator
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Generate polished reports in one click</p>
            </div>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map((r) => {
                const Icon = r.icon;
                const isRunning = generatingId === r.id;
                const isDone    = !isRunning && doneId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleGenerate(r.id)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={13} className="text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                        {r.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isRunning && (
                        <RefreshCw size={11} className="text-purple-400 animate-spin" />
                      )}
                      {isDone && (
                        <CheckCircle2 size={11} className="text-green-400" />
                      )}
                      <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {isRunning ? "Generating…" : isDone ? "Ready" : "Generate →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Overview Cards ───────────────────────────────────────────────── */}
        <ReportOverviewCards />

        {/* ── AI Executive Summary ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="relative bg-[#111114] border border-purple-500/20 rounded-2xl p-6 overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.06] via-transparent to-blue-500/[0.04] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="relative flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-purple-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <h2 className="text-sm font-semibold text-white">AI Executive Summary</h2>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  AI Analysis
                </span>
                <span className="text-[10px] text-zinc-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                  {currentTemplate.label}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeTemplate}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-zinc-300 leading-relaxed"
                >
                  {summaryText}
                </motion.p>
              </AnimatePresence>

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                  <Clock size={10} />
                  Generated Jun 11, 2026 · 09:42 AM
                </span>
                <button className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                  <RefreshCw size={9} /> Regenerate
                </button>
                <button className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                  <Share2 size={9} /> Share insight
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Spend + Lead Charts ──────────────────────────────────────────── */}
        <SpendLeadCharts />

        {/* ── Platform + Campaign Section ──────────────────────────────────── */}
        <PlatformCampaignSection />

        {/* ── Creative + Funnel Section ────────────────────────────────────── */}
        <CreativeFunnelSection />

      </main>

      <AIChatAgent />
    </div>
  );
}
