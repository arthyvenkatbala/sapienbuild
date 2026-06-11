// ── Lead CRM — types, config, and mock data ──────────────────────────────────

export type KanbanStage =
  | "New Lead"
  | "Contacted"
  | "Interested"
  | "Follow-Up"
  | "Negotiation"
  | "Booked"
  | "Lost";

export type ExecutiveStatus = "Not Started" | "In Progress" | "Rejected" | "Converted";
export type AiLabel        = "Hot" | "Warm" | "Cold";
export type Priority       = "High" | "Medium" | "Low";
export type LeadSource     = "Instagram" | "Facebook" | "Google" | "Referral" | "Website";
export type TimelineType   = "call" | "email" | "note" | "stage" | "meeting";

export interface TimelineEvent {
  id:          string;
  type:        TimelineType;
  title:       string;
  description: string;
  timestamp:   string;
  actor:       string;
}

export interface Lead {
  id:                string;
  name:              string;
  phone:             string;
  email:             string;
  source:            LeadSource;
  eventType:         string;
  budget:            number;
  stage:             KanbanStage;
  executiveStatus:   ExecutiveStatus;
  executiveName:     string;
  aiScore:           number;
  aiLabel:           AiLabel;
  aiReason:          string;
  dealValue:         number;
  lastActivity:      string;
  tags:              string[];
  priority:          Priority;
  createdAt:         string;
  notes:             string;
  followUpSuggestion: string;
  timeline:          TimelineEvent[];
}

// ── Stage config ──────────────────────────────────────────────────────────────
export const KANBAN_STAGES: KanbanStage[] = [
  "New Lead", "Contacted", "Interested", "Follow-Up", "Negotiation", "Booked", "Lost",
];

export const STAGE_META: Record<KanbanStage, { hex: string; tw: string; border: string }> = {
  "New Lead":    { hex: "#3b82f6", tw: "text-blue-400",   border: "border-blue-500/35"   },
  "Contacted":   { hex: "#06b6d4", tw: "text-cyan-400",   border: "border-cyan-500/35"   },
  "Interested":  { hex: "#a855f7", tw: "text-purple-400", border: "border-purple-500/35" },
  "Follow-Up":   { hex: "#eab308", tw: "text-yellow-400", border: "border-yellow-500/35" },
  "Negotiation": { hex: "#f97316", tw: "text-orange-400", border: "border-orange-500/35" },
  "Booked":      { hex: "#22c55e", tw: "text-green-400",  border: "border-green-500/35"  },
  "Lost":        { hex: "#71717a", tw: "text-zinc-400",   border: "border-zinc-600/35"   },
};

// ── AI label config ───────────────────────────────────────────────────────────
export const AI_META: Record<AiLabel, { hex: string; tw: string; badge: string; glow: string }> = {
  Hot:  { hex: "#ef4444", tw: "text-red-400",    badge: "bg-red-500/15 border-red-500/40 text-red-400",       glow: "0 0 14px rgba(239,68,68,0.55)"    },
  Warm: { hex: "#f97316", tw: "text-orange-400", badge: "bg-orange-500/15 border-orange-500/40 text-orange-400", glow: "0 0 12px rgba(249,115,22,0.45)" },
  Cold: { hex: "#71717a", tw: "text-zinc-400",   badge: "bg-zinc-700/40 border-zinc-600/40 text-zinc-400",    glow: "none"                             },
};

// ── Executive status config ───────────────────────────────────────────────────
export const EXEC_META: Record<ExecutiveStatus, { badge: string; dot: string }> = {
  "Not Started": { badge: "bg-zinc-700/40 border-zinc-600/30 text-zinc-400",  dot: "bg-zinc-500"  },
  "In Progress": { badge: "bg-blue-500/15 border-blue-500/30 text-blue-400",  dot: "bg-blue-400"  },
  "Rejected":    { badge: "bg-red-500/15 border-red-500/30 text-red-400",     dot: "bg-red-400"   },
  "Converted":   { badge: "bg-green-500/15 border-green-500/30 text-green-400", dot: "bg-green-400" },
};

// ── Priority config ───────────────────────────────────────────────────────────
export const PRIORITY_META: Record<Priority, { dot: string; label: string }> = {
  High:   { dot: "bg-red-500",    label: "text-red-400"    },
  Medium: { dot: "bg-yellow-500", label: "text-yellow-400" },
  Low:    { dot: "bg-zinc-600",   label: "text-zinc-500"   },
};

// ── Source badge colors ───────────────────────────────────────────────────────
export const SOURCE_META: Record<LeadSource, string> = {
  Instagram: "bg-pink-500/15 border-pink-500/30 text-pink-400",
  Facebook:  "bg-blue-500/15 border-blue-500/30 text-blue-400",
  Google:    "bg-green-500/15 border-green-500/30 text-green-400",
  Referral:  "bg-purple-500/15 border-purple-500/30 text-purple-400",
  Website:   "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
};

// ── Mock leads ────────────────────────────────────────────────────────────────
export const initialLeads: Lead[] = [
  {
    id: "L001", name: "Priya Sharma", phone: "+91 98765 43210", email: "priya.sharma@gmail.com",
    source: "Instagram", eventType: "Wedding Photography", budget: 150000,
    stage: "Negotiation", executiveStatus: "In Progress", executiveName: "Arjun K.",
    aiScore: 94, aiLabel: "Hot", aiReason: "High budget · fast replies · repeated engagement · shortlisted portfolio",
    dealValue: 145000, lastActivity: "Called 2h ago",
    tags: ["Wedding", "Dec 2025", "Premium"], priority: "High", createdAt: "Jun 1, 2026",
    notes: "Full day coverage + drone shots. Very engaged, prefers candid style.",
    followUpSuggestion: "Send revised quote with Dec 2025 availability — she's comparing 2 studios.",
    timeline: [
      { id: "t1", type: "call",    title: "Discovery call",    description: "30 min · discussed packages and availability", timestamp: "Jun 1 · 10am",  actor: "Arjun K." },
      { id: "t2", type: "email",   title: "Portfolio sent",    description: "Wedding gallery + pricing deck",               timestamp: "Jun 1 · 12pm",  actor: "Arjun K." },
      { id: "t3", type: "stage",   title: "Moved to Negotiation", description: "Shortlisted — comparing with 1 other studio", timestamp: "Jun 2 · 9am", actor: "Arjun K." },
      { id: "t4", type: "note",    title: "Internal note",     description: "Prefers candid style, mentioned cousin wedding", timestamp: "Jun 2 · 11am", actor: "Arjun K." },
    ],
  },
  {
    id: "L002", name: "Rahul & Meena Verma", phone: "+91 87654 32109", email: "rahul.verma@outlook.com",
    source: "Google", eventType: "Pre-Wedding + Wedding", budget: 200000,
    stage: "Booked", executiveStatus: "Converted", executiveName: "Sneha R.",
    aiScore: 98, aiLabel: "Hot", aiReason: "Signed contract · advance paid · date locked in",
    dealValue: 195000, lastActivity: "Booked yesterday",
    tags: ["Wedding", "Feb 2026", "Converted", "Premium"], priority: "High", createdAt: "May 28, 2026",
    notes: "Full day wedding + 2-day pre-wedding in Jaipur. Contract signed.",
    followUpSuggestion: "Share pre-wedding mood board and shot list template.",
    timeline: [
      { id: "t1", type: "meeting", title: "Studio consultation", description: "Reviewed albums + pricing", timestamp: "May 28 · 3pm", actor: "Sneha R." },
      { id: "t2", type: "email",   title: "Contract sent",       description: "Full contract + advance invoice", timestamp: "May 29 · 10am", actor: "Sneha R." },
      { id: "t3", type: "stage",   title: "Booked",              description: "Contract signed · ₹50k advance received", timestamp: "May 30 · 2pm", actor: "Sneha R." },
    ],
  },
  {
    id: "L003", name: "Karan Mehta", phone: "+91 76543 21098", email: "karan.mehta@gmail.com",
    source: "Instagram", eventType: "Portrait Session", budget: 25000,
    stage: "New Lead", executiveStatus: "Not Started", executiveName: "Unassigned",
    aiScore: 62, aiLabel: "Warm", aiReason: "Medium budget · responded once · active Instagram profile",
    dealValue: 22000, lastActivity: "Inquired 1h ago",
    tags: ["Portrait", "Individual"], priority: "Medium", createdAt: "Jun 11, 2026",
    notes: "Came via Instagram reel. Looking for professional headshots.",
    followUpSuggestion: "Contact within 2h — new leads contacted early convert 3.5× higher.",
    timeline: [
      { id: "t1", type: "email", title: "Form submitted", description: "Inquiry via Instagram DM", timestamp: "Jun 11 · 1h ago", actor: "System" },
    ],
  },
  {
    id: "L004", name: "Anjali & Vivek Nair", phone: "+91 65432 10987", email: "anjali.nair@gmail.com",
    source: "Referral", eventType: "Destination Wedding", budget: 120000,
    stage: "Interested", executiveStatus: "In Progress", executiveName: "Arjun K.",
    aiScore: 81, aiLabel: "Hot", aiReason: "Referral quality · budget confirmed · actively shortlisting",
    dealValue: 115000, lastActivity: "WhatsApp 5h ago",
    tags: ["Wedding", "Kasol", "Referral", "Mar 2026"], priority: "High", createdAt: "Jun 8, 2026",
    notes: "Referred by Rahul Verma. Destination wedding in Kasol.",
    followUpSuggestion: "Schedule Zoom to finalize package — destination dates are filling up.",
    timeline: [
      { id: "t1", type: "note",  title: "Referral intake",    description: "Referred by Rahul Verma (L002)", timestamp: "Jun 8 · 9am",  actor: "System" },
      { id: "t2", type: "call",  title: "Intro call",         description: "Discussed destination logistics",  timestamp: "Jun 9 · 11am", actor: "Arjun K." },
      { id: "t3", type: "email", title: "Kasol portfolio",    description: "Destination gallery sent",         timestamp: "Jun 10 · 2pm", actor: "Arjun K." },
    ],
  },
  {
    id: "L005", name: "Pooja Krishnan", phone: "+91 54321 09876", email: "pooja.k@yahoo.com",
    source: "Facebook", eventType: "Maternity Photography", budget: 35000,
    stage: "Contacted", executiveStatus: "In Progress", executiveName: "Sneha R.",
    aiScore: 73, aiLabel: "Warm", aiReason: "Positive replies · mid-range budget · 7 months pregnant — timing urgent",
    dealValue: 32000, lastActivity: "Email 1d ago",
    tags: ["Maternity", "Jul 2026", "Outdoor"], priority: "Medium", createdAt: "Jun 7, 2026",
    notes: "7 months pregnant, wants outdoor + indoor combo session.",
    followUpSuggestion: "Follow up on package — session must happen within 5 weeks.",
    timeline: [
      { id: "t1", type: "email", title: "Welcome email", description: "Intro + maternity portfolio", timestamp: "Jun 7 · 3pm",  actor: "Sneha R." },
      { id: "t2", type: "email", title: "Reply received", description: "Interested in outdoor package",  timestamp: "Jun 8 · 10am", actor: "Pooja K." },
    ],
  },
  {
    id: "L006", name: "Suresh & Lakshmi Iyer", phone: "+91 43210 98765", email: "suresh.iyer@hotmail.com",
    source: "Website", eventType: "Wedding + Reception", budget: 80000,
    stage: "Follow-Up", executiveStatus: "In Progress", executiveName: "Arjun K.",
    aiScore: 58, aiLabel: "Warm", aiReason: "Went quiet after proposal · 3d silence · re-engagement needed",
    dealValue: 75000, lastActivity: "No reply 3d ago",
    tags: ["Wedding", "Jan 2026", "Re-engage"], priority: "Medium", createdAt: "Jun 2, 2026",
    notes: "Sent proposal 3 days ago. No response. Needs follow-up.",
    followUpSuggestion: "Send gentle check-in with limited slot urgency — Jan is filling up.",
    timeline: [
      { id: "t1", type: "call",  title: "Discovery call", description: "20 min · venue confirmed as Taj",  timestamp: "Jun 2 · 10am", actor: "Arjun K." },
      { id: "t2", type: "email", title: "Proposal sent",  description: "Wedding Package B + add-ons",       timestamp: "Jun 3 · 9am",  actor: "Arjun K." },
      { id: "t3", type: "note",  title: "No response",   description: "3 days since proposal — follow up", timestamp: "Jun 6 · 9am",  actor: "Arjun K." },
    ],
  },
  {
    id: "L007", name: "Neha Gupta", phone: "+91 32109 87654", email: "neha.g@gmail.com",
    source: "Instagram", eventType: "Baby Shower", budget: 18000,
    stage: "New Lead", executiveStatus: "Not Started", executiveName: "Unassigned",
    aiScore: 45, aiLabel: "Cold", aiReason: "Low budget · single inquiry · no engagement history",
    dealValue: 15000, lastActivity: "DM 3h ago",
    tags: ["Baby Shower", "Budget"], priority: "Low", createdAt: "Jun 11, 2026",
    notes: "Inquired about baby shower packages. Very budget-sensitive.",
    followUpSuggestion: "Send mini-package options under ₹20k.",
    timeline: [
      { id: "t1", type: "note", title: "Instagram DM", description: "Asked about baby shower packages", timestamp: "Jun 11 · 3h ago", actor: "System" },
    ],
  },
  {
    id: "L008", name: "Amit & Prerna Kapoor", phone: "+91 21098 76543", email: "amit.kapoor@gmail.com",
    source: "Google", eventType: "Destination Wedding — Goa", budget: 350000,
    stage: "Negotiation", executiveStatus: "In Progress", executiveName: "Sneha R.",
    aiScore: 91, aiLabel: "Hot", aiReason: "Premium budget · Goa destination · fast communication · in-person met",
    dealValue: 320000, lastActivity: "Meeting yesterday",
    tags: ["Goa", "Destination", "Premium", "3-Day"], priority: "High", createdAt: "May 25, 2026",
    notes: "3-day Goa beach wedding — sangeet, haldi, main ceremony.",
    followUpSuggestion: "Confirm Goa dates and send final contract — peak season booking.",
    timeline: [
      { id: "t1", type: "meeting", title: "Video call",        description: "1hr Zoom · Goa portfolio review",    timestamp: "May 25 · 4pm", actor: "Sneha R." },
      { id: "t2", type: "email",   title: "Custom quote",      description: "3-day package · ₹3.5L proposal",     timestamp: "May 26 · 11am", actor: "Sneha R." },
      { id: "t3", type: "meeting", title: "In-person meeting", description: "Narrowed to 2 final packages",       timestamp: "Jun 10 · 2pm", actor: "Sneha R." },
    ],
  },
  {
    id: "L009", name: "Divya Menon", phone: "+91 10987 65432", email: "divya.menon@gmail.com",
    source: "Facebook", eventType: "Engagement Ceremony", budget: 45000,
    stage: "Contacted", executiveStatus: "Not Started", executiveName: "Unassigned",
    aiScore: 67, aiLabel: "Warm", aiReason: "Responded promptly · event 6 weeks away · urgency is real",
    dealValue: 42000, lastActivity: "Replied today",
    tags: ["Engagement", "Aug 2026", "Urgent"], priority: "Medium", createdAt: "Jun 10, 2026",
    notes: "Engagement ceremony Aug 15. Needs quick decision.",
    followUpSuggestion: "Assign to executive immediately — event is 6 weeks out.",
    timeline: [
      { id: "t1", type: "email", title: "Auto welcome",   description: "System welcome + portfolio",         timestamp: "Jun 10 · 9am", actor: "System"   },
      { id: "t2", type: "email", title: "Lead replied",   description: "Interested in evening package",      timestamp: "Jun 11 · 8am", actor: "Divya M."  },
    ],
  },
  {
    id: "L010", name: "Ravi Chandrasekaran", phone: "+91 09876 54321", email: "ravi.c@corp.com",
    source: "Referral", eventType: "Corporate Annual Day", budget: 60000,
    stage: "Interested", executiveStatus: "In Progress", executiveName: "Arjun K.",
    aiScore: 76, aiLabel: "Warm", aiReason: "Corporate repeat potential · confirmed budget · event brief received",
    dealValue: 58000, lastActivity: "Email 6h ago",
    tags: ["Corporate", "Annual Day", "Repeat Potential"], priority: "Medium", createdAt: "Jun 6, 2026",
    notes: "Annual day for 200-person tech firm. Repeat business potential.",
    followUpSuggestion: "Offer corporate retainer for quarterly events — strong upsell opportunity.",
    timeline: [
      { id: "t1", type: "email", title: "Corporate inquiry", description: "Annual day + awards ceremony",   timestamp: "Jun 6 · 11am", actor: "System"   },
      { id: "t2", type: "call",  title: "Briefing call",     description: "Event brief + delivery timeline", timestamp: "Jun 7 · 3pm",  actor: "Arjun K." },
      { id: "t3", type: "email", title: "Deck sent",         description: "Corporate event packages",        timestamp: "Jun 8 · 10am", actor: "Arjun K." },
    ],
  },
  {
    id: "L011", name: "Shreya & Rohit Das", phone: "+91 98654 21034", email: "shreya.das@gmail.com",
    source: "Instagram", eventType: "Wedding Photography", budget: 90000,
    stage: "Booked", executiveStatus: "Converted", executiveName: "Sneha R.",
    aiScore: 96, aiLabel: "Hot", aiReason: "Contract signed · advance paid · venue confirmed",
    dealValue: 88000, lastActivity: "Booked 2d ago",
    tags: ["Wedding", "Nov 2026", "Leela Palace", "Converted"], priority: "High", createdAt: "Jun 4, 2026",
    notes: "November wedding at Leela Palace. All logistics confirmed.",
    followUpSuggestion: "Share shot list template and pre-shoot checklist.",
    timeline: [
      { id: "t1", type: "meeting", title: "Studio visit",  description: "Reviewed albums + pricing",         timestamp: "Jun 4 · 4pm", actor: "Sneha R." },
      { id: "t2", type: "email",   title: "Proposal sent", description: "Package C + videography add-on",    timestamp: "Jun 5 · 9am", actor: "Sneha R." },
      { id: "t3", type: "stage",   title: "Booked",        description: "₹35k advance received",            timestamp: "Jun 9 · 2pm", actor: "Sneha R." },
    ],
  },
  {
    id: "L012", name: "Venkat Subramanian", phone: "+91 76432 10987", email: "venkat.s@yahoo.com",
    source: "Google", eventType: "Wedding Photography", budget: 40000,
    stage: "Lost", executiveStatus: "Rejected", executiveName: "Arjun K.",
    aiScore: 22, aiLabel: "Cold", aiReason: "Chose competitor · budget below minimum · no response after final quote",
    dealValue: 0, lastActivity: "Lost 5d ago",
    tags: ["Lost", "Budget mismatch"], priority: "Low", createdAt: "May 30, 2026",
    notes: "Budget too low. Went with cheaper competitor.",
    followUpSuggestion: "Add to nurture sequence — may return for next event.",
    timeline: [
      { id: "t1", type: "email", title: "Inquiry",      description: "Nov 2026 wedding",                  timestamp: "May 30 · 10am", actor: "System" },
      { id: "t2", type: "call",  title: "Discovery",    description: "Budget constraint — ₹40k max",       timestamp: "Jun 1 · 11am",  actor: "Arjun K." },
      { id: "t3", type: "stage", title: "Marked Lost",  description: "Budget mismatch · chose competitor", timestamp: "Jun 6 · 10am",  actor: "Arjun K." },
    ],
  },
  {
    id: "L013", name: "Ritika Bose", phone: "+91 65321 09876", email: "ritika.bose@gmail.com",
    source: "Website", eventType: "Fashion Portfolio", budget: 55000,
    stage: "Follow-Up", executiveStatus: "In Progress", executiveName: "Sneha R.",
    aiScore: 69, aiLabel: "Warm", aiReason: "Fashion niche · creative match · seen profile but not replied",
    dealValue: 52000, lastActivity: "Seen 2d ago",
    tags: ["Fashion", "Portfolio", "Creative"], priority: "Medium", createdAt: "Jun 5, 2026",
    notes: "Aspiring model — comp card + portfolio shoot.",
    followUpSuggestion: "Offer discounted trial session to re-engage — 5 days in Follow-Up.",
    timeline: [
      { id: "t1", type: "email", title: "Website inquiry", description: "Fashion portfolio request",   timestamp: "Jun 5 · 2pm",  actor: "System"   },
      { id: "t2", type: "email", title: "Portfolio sent",  description: "Fashion + editorial samples", timestamp: "Jun 6 · 11am", actor: "Sneha R." },
      { id: "t3", type: "note",  title: "Status check",   description: "Last seen 2d ago — no reply", timestamp: "Jun 9 · 9am",  actor: "Sneha R." },
    ],
  },
  {
    id: "L014", name: "Arun & Deepa Pillai", phone: "+91 54320 98765", email: "arun.pillai@gmail.com",
    source: "Referral", eventType: "Kerala Traditional Wedding", budget: 175000,
    stage: "Interested", executiveStatus: "In Progress", executiveName: "Arjun K.",
    aiScore: 87, aiLabel: "Hot", aiReason: "High-quality referral · premium budget · actively shortlisting",
    dealValue: 165000, lastActivity: "WhatsApp 3h ago",
    tags: ["Wedding", "Kerala", "Oct 2026", "Traditional", "Premium"], priority: "High", createdAt: "Jun 9, 2026",
    notes: "Kerala traditional wedding. Interested in our heritage coverage style.",
    followUpSuggestion: "Send Kerala portfolio and schedule Zoom — strong close opportunity.",
    timeline: [
      { id: "t1", type: "note",  title: "Referral intake",  description: "Referred by Seema J.",            timestamp: "Jun 9 · 9am",  actor: "System"   },
      { id: "t2", type: "call",  title: "Intro call",       description: "Discussed traditional coverage",  timestamp: "Jun 10 · 4pm", actor: "Arjun K." },
      { id: "t3", type: "email", title: "Kerala portfolio", description: "3 traditional wedding galleries", timestamp: "Jun 11 · 9am", actor: "Arjun K." },
    ],
  },
  {
    id: "L015", name: "Siddharth Joshi", phone: "+91 43219 87654", email: "sid.joshi@startups.in",
    source: "Instagram", eventType: "Product Photography", budget: 30000,
    stage: "New Lead", executiveStatus: "Not Started", executiveName: "Unassigned",
    aiScore: 51, aiLabel: "Warm", aiReason: "D2C startup · quick decision maker · story reply = high intent",
    dealValue: 28000, lastActivity: "Story reply 30m ago",
    tags: ["Product", "Startup", "Commercial", "D2C"], priority: "Medium", createdAt: "Jun 11, 2026",
    notes: "Skincare D2C brand. Needs product shots for website + Amazon.",
    followUpSuggestion: "Reply within 1h — story reply indicates peak intent window.",
    timeline: [
      { id: "t1", type: "note", title: "Instagram story reply", description: "Replied to product photography story", timestamp: "Jun 11 · 30m ago", actor: "System" },
    ],
  },
];

// ── Source analytics ──────────────────────────────────────────────────────────
export const sourceAnalytics = [
  { source: "Instagram", leads: 52, converted: 18, cpl: 850,  revenue: 2340000, convRate: 34.6, color: "#e1306c" },
  { source: "Facebook",  leads: 28, converted: 8,  cpl: 1200, revenue: 980000,  convRate: 28.6, color: "#1877f2" },
  { source: "Google",    leads: 36, converted: 14, cpl: 980,  revenue: 1820000, convRate: 38.9, color: "#4285f4" },
  { source: "Referral",  leads: 18, converted: 11, cpl: 0,    revenue: 1540000, convRate: 61.1, color: "#22c55e" },
  { source: "Website",   leads: 14, converted: 5,  cpl: 640,  revenue: 620000,  convRate: 35.7, color: "#a855f7" },
];

export const sourceMonthlyTrend = [
  { month: "Jan", instagram: 28, facebook: 16, google: 20, referral: 6,  website: 8  },
  { month: "Feb", instagram: 34, facebook: 18, google: 24, referral: 8,  website: 10 },
  { month: "Mar", instagram: 40, facebook: 22, google: 28, referral: 10, website: 11 },
  { month: "Apr", instagram: 38, facebook: 20, google: 26, referral: 12, website: 9  },
  { month: "May", instagram: 46, facebook: 25, google: 32, referral: 15, website: 12 },
  { month: "Jun", instagram: 52, facebook: 28, google: 36, referral: 18, website: 14 },
];

// ── AI follow-up suggestions ──────────────────────────────────────────────────
export const aiFollowUps = [
  {
    id: "f1", leadId: "L006", leadName: "Suresh Iyer", urgency: "urgent",
    message: "Went quiet 3 days after proposal. Send a limited-slot urgency message — Jan is filling up fast.",
    action: "Send Follow-Up",
  },
  {
    id: "f2", leadId: "L003", leadName: "Karan Mehta", urgency: "hot",
    message: "New lead inquired 1h ago. Response within 2h converts at 3.5× the average — contact now.",
    action: "Contact Now",
  },
  {
    id: "f3", leadId: "L008", leadName: "Amit Kapoor", urgency: "upsell",
    message: "Premium Goa client in negotiation — upsell drone + same-day edit for ₹25k additional value.",
    action: "Generate Upsell",
  },
  {
    id: "f4", leadId: "L013", leadName: "Ritika Bose", urgency: "reminder",
    message: "Fashion lead in Follow-Up for 5 days. Offer a discounted trial session to re-spark interest.",
    action: "Schedule Reminder",
  },
];
