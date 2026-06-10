"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const SUGGESTED = [
  "Why is my Instagram CPL increasing?",
  "Which campaign should I scale?",
  "What creatives work best for weddings?",
  "How should I split my ₹50k budget?",
];

const MOCK_REPLIES: Record<string, string> = {
  default:
    "Based on your current data, Instagram Reels are delivering your lowest CPL at ₹326. I'd suggest allocating 40% of new budget there while testing a fresh creative on Facebook to address the declining conversion rate.",
};

function getReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("cpl") || lower.includes("increasing"))
    return "Your Instagram CPL rose 6% last week — the Wedding Gold creative is aged (14 days). Refreshing the hook in the first 3 seconds typically drops CPL by 10–15%. I'd A/B test a new opening shot this weekend.";
  if (lower.includes("scale") || lower.includes("campaign"))
    return "Scale 'Wedding Gold — Reel' first. It's at 5.1× ROAS with room to grow — your current daily budget of ₹1,200 has low saturation. Double it for 5 days and monitor frequency. Pause 'Destination Wedding' — it's below 3× ROAS.";
  if (lower.includes("creative") || lower.includes("wedding"))
    return "Golden-hour outdoor portraits and candid ceremony moments outperform studio setups 3:1 for wedding enquiries. Reels under 30 seconds with an emotional hook in the first 2s convert best. Avoid text-heavy carousels — swipe-through rate drops 40%.";
  if (lower.includes("budget") || lower.includes("50k") || lower.includes("split"))
    return "For ₹50,000: allocate ₹22k to Instagram Reels (top ROAS), ₹13k to Facebook retargeting warm audiences, ₹10k to Google Search (brand + wedding photography terms), and hold ₹5k as a creative testing pool. Review in 10 days.";
  return MOCK_REPLIES.default;
}

export default function AIChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI ad strategist. Ask me anything about your campaigns, creatives, or budget.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, { role: "ai", text: getReply(userMsg) }]);
    }, 1200 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          width: 52,
          height: 52,
        }}
        aria-label="AI Strategy Chat"
      >
        {open ? (
          <ChevronDown size={20} className="text-white" />
        ) : (
          <Sparkles size={20} className="text-white" />
        )}
        {/* pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-purple-500" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-[72px] right-6 z-50 w-[360px] sm:w-[420px] rounded-2xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07] bg-gradient-to-r from-purple-500/10 to-blue-500/5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Ad Strategist</p>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Online
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "ai" && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-white/10 text-white rounded-br-sm"
                        : "bg-[#1a1a1f] border border-white/[0.07] text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-[#1a1a1f] border border-white/[0.07] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    {[0, 0.15, 0.3].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-300 px-2.5 py-1.5 rounded-xl transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 bg-[#1a1a1f] border border-white/[0.08] rounded-xl px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask about your campaigns..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || typing}
                  className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
