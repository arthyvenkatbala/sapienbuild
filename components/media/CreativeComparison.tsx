"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react";
import { mediaAssets } from "@/lib/mock-data";

type Asset = typeof mediaAssets[number];

interface MetricDef {
  key: keyof Asset;
  label: string;
  format: (v: unknown) => string;
  higherIsBetter: boolean;
}

const METRICS: MetricDef[] = [
  { key: "engagementScore", label: "Engagement Score", format: (v) => String(v),                   higherIsBetter: true },
  { key: "clicks",          label: "Clicks",           format: (v) => Number(v).toLocaleString(),   higherIsBetter: true },
  { key: "leads",           label: "Leads",            format: (v) => String(v),                    higherIsBetter: true },
  { key: "ctr",             label: "CTR",              format: (v) => `${v}%`,                       higherIsBetter: true },
  { key: "saves",           label: "Saves",            format: (v) => Number(v).toLocaleString(),   higherIsBetter: true },
  { key: "shares",          label: "Shares",           format: (v) => Number(v).toLocaleString(),   higherIsBetter: true },
  { key: "watchTime",       label: "Watch Time",       format: (v) => String(v),                    higherIsBetter: true },
];

function AssetSelect({
  value,
  onChange,
  exclude,
}: {
  value: Asset;
  onChange: (a: Asset) => void;
  exclude: Asset;
}) {
  const [open, setOpen] = useState(false);
  const options = mediaAssets.filter((a) => a.id !== exclude.id);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-[#0d0d10] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3 py-2.5 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${value.gradient} shrink-0`} />
          <span className="text-xs font-medium text-white truncate">{value.name}</span>
          <span className="text-[10px] text-zinc-600 shrink-0">{value.type}</span>
        </div>
        <ChevronDown size={12} className={`text-zinc-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#111114] border border-white/[0.1] rounded-xl overflow-hidden shadow-xl origin-top"
          >
            {options.map((a) => (
              <button
                key={a.id}
                onClick={() => { onChange(a); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${a.gradient} shrink-0`} />
                <span className="text-xs text-zinc-300 truncate">{a.name}</span>
                <span className="text-[10px] text-zinc-600 ml-auto shrink-0">{a.type}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBar({
  label,
  aVal,
  bVal,
  aColor,
  bColor,
  higherIsBetter,
  formatFn,
}: {
  label: string;
  aVal: unknown;
  bVal: unknown;
  aColor: string;
  bColor: string;
  higherIsBetter: boolean;
  formatFn: (v: unknown) => string;
}) {
  const aNum = typeof aVal === "number" ? aVal : null;
  const bNum = typeof bVal === "number" ? bVal : null;

  const max = aNum !== null && bNum !== null ? Math.max(aNum, bNum) : 1;
  const aFrac = aNum !== null ? aNum / max : 0;
  const bFrac = bNum !== null ? bNum / max : 0;

  const aWins =
    aNum !== null && bNum !== null
      ? higherIsBetter
        ? aNum > bNum
        : aNum < bNum
      : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
        {aWins !== null && (
          aWins ? (
            <span className="text-[9px] text-green-400 flex items-center gap-0.5">
              <TrendingUp size={9} /> A wins
            </span>
          ) : (
            <span className="text-[9px] text-cyan-400 flex items-center gap-0.5">
              <TrendingUp size={9} /> B wins
            </span>
          )
        )}
      </div>

      {/* A bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white w-16 text-right shrink-0">
          {formatFn(aVal)}
        </span>
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aFrac * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: aColor }}
          />
        </div>
        <span className="text-[10px] text-zinc-600 w-3 shrink-0">A</span>
      </div>

      {/* B bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white w-16 text-right shrink-0">
          {formatFn(bVal)}
        </span>
        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bFrac * 100}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.08 }}
            className="h-full rounded-full"
            style={{ background: bColor }}
          />
        </div>
        <span className="text-[10px] text-zinc-600 w-3 shrink-0">B</span>
      </div>
    </div>
  );
}

export default function CreativeComparison() {
  const [assetA, setAssetA] = useState<Asset>(mediaAssets[0]);
  const [assetB, setAssetB] = useState<Asset>(mediaAssets[1]);

  const swap = () => {
    const tmp = assetA;
    setAssetA(assetB);
    setAssetB(tmp);
  };

  const aWinsCount = METRICS.filter((m) => {
    const av = assetA[m.key];
    const bv = assetB[m.key];
    if (typeof av !== "number" || typeof bv !== "number") return false;
    return m.higherIsBetter ? av > bv : av < bv;
  }).length;

  const bWinsCount = METRICS.filter((m) => {
    const av = assetA[m.key];
    const bv = assetB[m.key];
    if (typeof av !== "number" || typeof bv !== "number") return false;
    return m.higherIsBetter ? bv > av : bv < av;
  }).length;

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white">Creative Comparison</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">Compare two creatives side-by-side</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: assetA.accentColor }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Creative A</span>
          </div>
          <AssetSelect value={assetA} onChange={setAssetA} exclude={assetB} />
        </div>

        <button
          onClick={swap}
          className="p-2 rounded-xl border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all"
          title="Swap"
        >
          <ArrowLeftRight size={14} />
        </button>

        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Creative B</span>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: assetB.accentColor }} />
          </div>
          <AssetSelect value={assetB} onChange={setAssetB} exclude={assetA} />
        </div>
      </div>

      {/* Win counter */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0d0d10] border border-white/[0.05] p-3 text-center">
          <p className="text-2xl font-bold" style={{ color: assetA.accentColor }}>{aWinsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">A wins</p>
        </div>
        <div className="rounded-xl bg-[#0d0d10] border border-white/[0.05] p-3 text-center flex flex-col items-center justify-center">
          <p className="text-[10px] text-zinc-600">out of {METRICS.filter(m => typeof assetA[m.key] === "number").length} metrics</p>
        </div>
        <div className="rounded-xl bg-[#0d0d10] border border-white/[0.05] p-3 text-center">
          <p className="text-2xl font-bold" style={{ color: assetB.accentColor }}>{bWinsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">B wins</p>
        </div>
      </div>

      {/* Metric bars */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${assetA.id}-${assetB.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {METRICS.map((m) => (
            <MetricBar
              key={m.key as string}
              label={m.label}
              aVal={assetA[m.key]}
              bVal={assetB[m.key]}
              aColor={assetA.accentColor}
              bColor={assetB.accentColor}
              higherIsBetter={m.higherIsBetter}
              formatFn={m.format}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Verdict */}
      {aWinsCount !== bWinsCount && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 border"
          style={{
            borderColor: aWinsCount > bWinsCount
              ? `${assetA.accentColor}40`
              : `${assetB.accentColor}40`,
            background: aWinsCount > bWinsCount
              ? `${assetA.accentColor}10`
              : `${assetB.accentColor}10`,
          }}
        >
          <p className="text-xs font-semibold text-white">
            AI Verdict: {aWinsCount > bWinsCount ? assetA.name : assetB.name} wins ({Math.max(aWinsCount, bWinsCount)}/{METRICS.filter(m => typeof assetA[m.key] === "number").length} metrics)
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">
            {aWinsCount > bWinsCount
              ? `Prioritise ${assetA.name} for scaling — stronger across engagement, leads, and CTR.`
              : `Prioritise ${assetB.name} for scaling — stronger across engagement, leads, and CTR.`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
