"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Plus, MessageSquare, Clock, ChevronRight,
  Copy, ThumbsUp, ThumbsDown, Mic,
} from "lucide-react";
import { strategyReplies, strategyQuickActions } from "@/lib/mock-data";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  ts: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  preview: string;
  active?: boolean;
}

const SESSIONS: Session[] = [
  { id: "s1", title: "Wedding Campaign Strategy", date: "Today",    preview: "Scale Wedding Gold Reel...", active: true },
  { id: "s2", title: "Instagram CPL Analysis",    date: "Yesterday",preview: "CPL dropped 6% — creative refresh..." },
  { id: "s3", title: "Budget Allocation Review",  date: "Jun 8",    preview: "Reallocate ₹5k from YouTube..." },
  { id: "s4", title: "Creative Performance",      date: "Jun 5",    preview: "Golden Hour Reel outperforms..." },
];

const SUGGESTED = [
  "Which campaign should I scale right now?",
  "Why is my Instagram CPL increasing?",
  "What creatives should I produce this week?",
  "How should I split my ₹50k monthly budget?",
];

const THINK_STEPS = [
  "Reading campaign data…",
  "Analysing performance metrics…",
  "Generating recommendations…",
];

function getReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("scale"))    return strategyReplies.scale;
  if (m.includes("cpl") || m.includes("cost per lead")) return strategyReplies.cpl;
  if (m.includes("roas"))     return strategyReplies.roas;
  if (m.includes("creative") || m.includes("reel") || m.includes("hook")) return strategyReplies.creative;
  if (m.includes("audience") || m.includes("targeting")) return strategyReplies.audience;
  if (m.includes("budget") || m.includes("alloc")) return strategyReplies.budget;
  return strategyReplies.default;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Rich text renderer ───────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function MessageContent({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-purple-400 mt-[3px] shrink-0 text-[10px]">◆</span>
              <span className="text-zinc-300">{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        const num = line.match(/^(\d+)\.\s(.+)/);
        if (num) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-purple-400 shrink-0 font-semibold text-[11px] mt-[2px] w-4">{num[1]}.</span>
              <span className="text-zinc-300">{renderInline(num[2])}</span>
            </div>
          );
        }

        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-semibold text-white mt-2 first:mt-0">
              {line.slice(2, -2)}
            </p>
          );
        }

        return <p key={i} className="text-zinc-300">{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator({ step }: { step: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="bg-[#16161e] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 0.18, 0.36].map((d) => (
            <motion.span
              key={d}
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: d }}
              className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500">{step}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: "Hello! I'm your AI Marketing Strategist. I have full visibility into your campaign data across Instagram, Facebook, Google, and YouTube.\n\nAsk me anything — or pick a quick action above to get started.",
      ts: "09:41",
    },
  ]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [thinkStep, setThinkStep] = useState(0);
  const [activeSession, setActiveSession] = useState("s1");
  const [copied, setCopied]       = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", text: trimmed, ts: now() };
    setMessages((p) => [...p, userMsg]);
    setTyping(true);
    setThinkStep(0);

    const t1 = setTimeout(() => setThinkStep(1), 600);
    const t2 = setTimeout(() => setThinkStep(2), 1200);
    const t3 = setTimeout(() => {
      setTyping(false);
      const aiMsg: Message = { id: Date.now() + 1, role: "ai", text: getReply(trimmed), ts: now() };
      setMessages((p) => [...p, aiMsg]);
    }, 2000 + Math.random() * 400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [typing]);

  const copyMessage = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-white/[0.07]"
      style={{ boxShadow: "0 0 60px rgba(168,85,247,0.07), 0 0 0 1px rgba(255,255,255,0.04)" }}
    >
      {/* ── Sessions sidebar ──────────────────────────────────────────── */}
      <div className="w-52 shrink-0 bg-[#0d0d10] border-r border-white/[0.06] flex flex-col hidden lg:flex">
        <div className="px-3 pt-4 pb-3 border-b border-white/[0.06]">
          <button
            onClick={() => { setMessages([{ id: 0, role: "ai", text: "New strategy session started. What would you like to work on today?", ts: now() }]); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium hover:bg-purple-500/22 transition-colors"
          >
            <Plus size={13} /> New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600 px-2 mb-2">Recent</p>
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                activeSession === s.id
                  ? "bg-purple-500/12 border border-purple-500/20"
                  : "hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare
                  size={12}
                  className={activeSession === s.id ? "text-purple-400 mt-0.5 shrink-0" : "text-zinc-600 mt-0.5 shrink-0"}
                />
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${activeSession === s.id ? "text-white" : "text-zinc-400"}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5">{s.preview}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={9} className="text-zinc-700" />
                    <span className="text-[9px] text-zinc-700">{s.date}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main chat area ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#0f0f14]">
        {/* Chat header */}
        <div className="shrink-0 px-5 py-3.5 border-b border-white/[0.06] bg-gradient-to-r from-purple-500/8 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.5)]">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0f0f14]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Marketing Strategist</p>
              <p className="text-[10px] text-zinc-500">Claude · Marketing Intelligence Mode · Full campaign access</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/15 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {strategyQuickActions.map((a) => (
              <button
                key={a.key}
                onClick={() => send(a.prompt)}
                disabled={typing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all hover:scale-[1.02] disabled:opacity-40"
                style={{
                  background: `${a.color}12`,
                  borderColor: `${a.color}35`,
                  color: a.color,
                }}
              >
                <ChevronRight size={10} style={{ color: a.color }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-xl transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                  <Sparkles size={11} className="text-white" />
                </div>
              )}
              <div className={`max-w-[82%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-purple-600/25 border border-purple-500/30 text-white rounded-br-sm text-sm"
                      : "bg-[#16161e] border border-white/[0.07] rounded-bl-sm"
                  }`}
                >
                  {m.role === "ai" ? <MessageContent text={m.text} /> : m.text}
                </div>

                {/* Message actions */}
                <div className={`flex items-center gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span className="text-[9px] text-zinc-700">{m.ts}</span>
                  {m.role === "ai" && (
                    <>
                      <button
                        onClick={() => copyMessage(m.id, m.text)}
                        className="text-zinc-700 hover:text-zinc-400 transition-colors"
                        title="Copy"
                      >
                        <Copy size={10} />
                      </button>
                      {copied === m.id && (
                        <span className="text-[9px] text-green-400">Copied</span>
                      )}
                      <button className="text-zinc-700 hover:text-green-400 transition-colors"><ThumbsUp size={10} /></button>
                      <button className="text-zinc-700 hover:text-red-400 transition-colors"><ThumbsDown size={10} /></button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TypingIndicator step={THINK_STEPS[thinkStep]} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 px-5 pb-5 pt-3 border-t border-white/[0.06]">
          <div
            className="flex items-end gap-3 bg-[#16161e] border border-white/[0.08] rounded-2xl px-4 py-3 transition-all focus-within:border-purple-500/40"
            style={{ boxShadow: "inset 0 0 0 0 transparent" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask about campaigns, creatives, budget, audiences…"
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none resize-none"
              disabled={typing}
            />
            <div className="flex items-center gap-2 shrink-0">
              <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <Mic size={15} />
              </button>
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center disabled:opacity-30 hover:from-purple-400 hover:to-indigo-500 transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-700 mt-2 text-center">
            AI responses are based on your live campaign data · {input.length}/2000
          </p>
        </div>
      </div>
    </div>
  );
}
