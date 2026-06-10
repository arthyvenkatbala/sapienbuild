"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Copy, Check, ArrowUpRight } from "lucide-react";
import { creativeIdeas } from "@/lib/mock-data";

const hookTypeColors: Record<string, string> = {
  "Emotional":     "#a855f7",
  "Social Proof":  "#22c55e",
  "Curiosity":     "#38bdf8",
  "Legacy":        "#f59e0b",
  "POV":           "#f472b6",
  "Value":         "#6366f1",
};

export default function CreativeIntelligence() {
  const [copiedHook, setCopiedHook] = useState<number | null>(null);

  const copyHook = (i: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(i);
    setTimeout(() => setCopiedHook(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-base font-semibold text-white">Creative Intelligence</h2>
        <p className="text-xs text-zinc-500 mt-0.5">AI-generated concepts, hooks, and CTA improvements</p>
      </div>

      {/* Reel Concepts */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3">
          Reel Concepts — This Week
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {creativeIdeas.reelConcepts.map((concept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07 }}
              className={`relative bg-gradient-to-br ${concept.gradient} border ${concept.border} rounded-2xl p-5 overflow-hidden hover:brightness-110 transition-all cursor-pointer group`}
            >
              {/* score badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-[10px] font-bold text-white">{concept.score}</span>
                <span className="text-[9px] text-zinc-400">score</span>
              </div>

              {/* tag */}
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/80 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full mb-3">
                <Lightbulb size={9} /> {concept.tag}
              </span>

              <h4 className="text-sm font-semibold text-white mb-2">{concept.title}</h4>

              <p className="text-xs text-white/70 italic leading-relaxed mb-3">
                &ldquo;{concept.hook}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {concept.duration}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-white/40 group-hover:text-white/80 transition-colors"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hooks + CTA improvements side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hook Gallery */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
            Proven Ad Hooks
          </p>
          <div className="space-y-2.5">
            {creativeIdeas.hooks.map((hook, i) => {
              const col = hookTypeColors[hook.type] ?? "#a855f7";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.06 }}
                  className="flex items-start justify-between gap-3 bg-[#0d0d10] border border-white/[0.05] rounded-xl px-3 py-2.5 group hover:border-white/[0.1] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-200 leading-relaxed">&ldquo;{hook.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ color: col, background: `${col}20` }}
                      >
                        {hook.type}
                      </span>
                      <span className="text-[10px] text-zinc-600">Score {hook.score}/100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyHook(i, hook.text)}
                    className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
                    title="Copy hook"
                  >
                    {copiedHook === i ? (
                      <Check size={13} className="text-green-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Improvements */}
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
            CTA Improvements
          </p>

          <div className="space-y-3">
            {creativeIdeas.ctaTests.map((cta, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="bg-[#0d0d10] border border-white/[0.05] rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Current</p>
                    <p className="text-sm text-zinc-400 line-through">{cta.current}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-purple-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Suggested</p>
                    <p className="text-sm font-semibold text-white">{cta.suggested}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <span className="text-[10px] text-zinc-500">Expected improvement</span>
                  <span className="text-xs font-bold text-green-400">{cta.lift}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Creative health footer */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20 p-3">
              <p className="text-xs font-medium text-white mb-1">Creative Health Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "61%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
                <span className="text-xs font-bold text-orange-400 shrink-0">61/100</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                2 of 5 creatives showing fatigue — refresh recommended
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
