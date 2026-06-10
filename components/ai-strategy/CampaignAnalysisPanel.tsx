"use client";

import { motion } from "framer-motion";
import { campaignScoreCards } from "@/lib/mock-data";

function ScoreRing({
  score,
  color,
  size = 72,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const strokeW = 5;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
    >
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="#ffffff08" strokeWidth={strokeW}
      />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function CampaignAnalysisPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5"
      style={{ boxShadow: "0 0 40px rgba(168,85,247,0.06)" }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Campaign Health</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">AI-scored across 4 dimensions</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {campaignScoreCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="bg-[#0d0d10] border border-white/[0.05] rounded-xl p-3 flex flex-col items-center hover:border-white/[0.1] transition-colors"
          >
            <div className="relative">
              <ScoreRing score={card.value} color={card.color} size={64} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-sm font-bold leading-none"
                  style={{ color: card.color }}
                >
                  {card.value}
                </span>
              </div>
            </div>
            <p className="text-[11px] font-medium text-zinc-300 mt-2 text-center leading-tight">
              {card.label}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1 text-center leading-tight">
              {card.note}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Overall banner */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border border-purple-500/20 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white">Composite Score</p>
          <span
            className="text-sm font-bold"
            style={{
              background: "linear-gradient(90deg, #a855f7, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            71 / 100
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "71%" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #a855f7, #6366f1)" }}
          />
        </div>
        <p className="text-[10px] text-zinc-500 mt-1.5">
          Ranked in top 22% of photography advertisers
        </p>
      </div>
    </motion.div>
  );
}
