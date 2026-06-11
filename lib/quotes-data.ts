// ── Types ─────────────────────────────────────────────────────────────────────

export type QuoteStatus = "Draft" | "Sent" | "Viewed" | "Approved" | "Rejected" | "Expired";
export type EventType   = "Wedding" | "Engagement" | "Reception" | "Birthday" | "Corporate" | "Pre-Wedding";

export interface ServiceLine {
  id:        string;
  serviceId: string;
  name:      string;
  sessions:  number;
  events:    string;
  unitPrice: number;
  subtotal:  number;
}

export interface AddOnLine {
  id:       string;
  addOnId:  string;
  name:     string;
  qty:      number;
  price:    number;
  subtotal: number;
}

export interface Quote {
  id:              string;
  clientName:      string;
  clientPhone:     string;
  clientEmail:     string;
  clientLocation:  string;
  eventTypes:      EventType[];
  eventDates:      string;
  venueName:       string;
  executiveName:   string;
  executivePhone:  string;
  executiveEmail:  string;
  services:        ServiceLine[];
  addOns:          AddOnLine[];
  discountType:    "flat" | "percent";
  discountValue:   number;
  subtotal:        number;
  discountAmount:  number;
  grandTotal:      number;
  notes:           string;
  status:          QuoteStatus;
  createdAt:       string;
  updatedAt:       string;
  validUntil:      string;
  sentAt:          string | null;
  viewedAt:        string | null;
  approvedAt:      string | null;
  signatureData:   string | null;
  followUpCount:   number;
  aiScore:         number;
  aiRecommendation: string;
}

// ── Service Catalog ────────────────────────────────────────────────────────────

export interface ServiceDef {
  id:          string;
  name:        string;
  category:    string;
  basePrice:   number;
  description: string;
  icon:        string;
}

export const SERVICE_CATALOG: ServiceDef[] = [
  { id: "trad-photo",  name: "Traditional Photography", category: "Photography",  basePrice: 10000,  description: "Classic portrait and candid coverage by experienced photographers", icon: "📸" },
  { id: "trad-video",  name: "Traditional Videography", category: "Videography",  basePrice: 10000,  description: "Full event cinematic documentation with professional editing", icon: "🎬" },
  { id: "cand-photo",  name: "Candid Photography",      category: "Photography",  basePrice: 35000,  description: "Natural, unposed moments captured with artistic precision", icon: "✨" },
  { id: "cand-video",  name: "Candid Videography",      category: "Videography",  basePrice: 35000,  description: "Cinematic storytelling with natural light and motion", icon: "🎥" },
  { id: "drone",       name: "Drone Coverage",           category: "Aerial",       basePrice: 10000,  description: "Breathtaking aerial shots and video from licensed drone operators", icon: "🚁" },
  { id: "live-stream", name: "Live Streaming",           category: "Digital",      basePrice: 10000,  description: "HD live broadcast to family and guests worldwide", icon: "📡" },
  { id: "album",       name: "Premium Album",            category: "Deliverable",  basePrice: 20000,  description: "Handcrafted luxury lay-flat album with archival printing", icon: "📖" },
  { id: "couple",      name: "Couple Shoot",             category: "Photography",  basePrice: 20000,  description: "Dedicated pre-wedding or couple portrait session", icon: "💑" },
];

// ── Add-On Catalog ────────────────────────────────────────────────────────────

export interface AddOnDef {
  id:        string;
  name:      string;
  price:     number;
  unit:      string;
}

export const ADDON_CATALOG: AddOnDef[] = [
  { id: "extra-album",    name: "Extra Album Copy",       price: 8000,  unit: "per copy" },
  { id: "highlight-reel", name: "Highlight Reel (3 min)", price: 5000,  unit: "per video" },
  { id: "same-day-edit",  name: "Same-Day Edit Video",    price: 15000, unit: "per event" },
  { id: "extra-shooter",  name: "Additional Photographer",price: 8000,  unit: "per day" },
  { id: "photo-booth",    name: "Photo Booth Setup",      price: 12000, unit: "per day" },
  { id: "hardcover-book", name: "Hardcover Coffee Book",  price: 6000,  unit: "per copy" },
];

// ── Status Configuration ───────────────────────────────────────────────────────

export const STATUS_META: Record<QuoteStatus, { badge: string; dot: string; label: string; hex: string }> = {
  Draft:    { badge: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",    dot: "bg-zinc-500",    label: "Draft",    hex: "#71717a" },
  Sent:     { badge: "bg-blue-500/15 border-blue-500/30 text-blue-400",    dot: "bg-blue-500",    label: "Sent",     hex: "#3b82f6" },
  Viewed:   { badge: "bg-purple-500/15 border-purple-500/30 text-purple-400", dot: "bg-purple-500", label: "Viewed",  hex: "#a855f7" },
  Approved: { badge: "bg-green-500/15 border-green-500/30 text-green-400", dot: "bg-green-500",   label: "Approved", hex: "#22c55e" },
  Rejected: { badge: "bg-red-500/15 border-red-500/30 text-red-400",       dot: "bg-red-500",     label: "Rejected", hex: "#ef4444" },
  Expired:  { badge: "bg-orange-500/15 border-orange-500/30 text-orange-400", dot: "bg-orange-500", label: "Expired", hex: "#f97316" },
};

export const EVENT_TYPES: EventType[] = ["Wedding", "Engagement", "Reception", "Birthday", "Corporate", "Pre-Wedding"];

// ── AI Pricing Suggestions ────────────────────────────────────────────────────

export interface AiPricingSuggestion {
  id:       string;
  type:     "bundle" | "upsell" | "discount" | "timing";
  title:    string;
  body:     string;
  impact:   string;
  action:   string;
}

export const AI_PRICING_SUGGESTIONS: AiPricingSuggestion[] = [
  {
    id: "ai-1", type: "bundle",
    title: "Full-Day Bundle Savings",
    body:  "Adding Candid Video to this quote unlocks a ₹8,000 bundle discount on combined photo + video packages.",
    impact: "+₹27,000 package value",
    action: "Add Candid Video",
  },
  {
    id: "ai-2", type: "upsell",
    title: "Drone Aerial Coverage",
    body:  "Wedding clients in this budget bracket add drone 73% of the time. It increases approval rate by 21%.",
    impact: "+₹10,000",
    action: "Add Drone",
  },
  {
    id: "ai-3", type: "discount",
    title: "Early-Bird Discount",
    body:  "Offering a 5% early-booking discount increases conversion by 34% for events 3+ months out.",
    impact: "Higher conversion",
    action: "Apply 5% Discount",
  },
  {
    id: "ai-4", type: "timing",
    title: "Follow-Up Reminder",
    body:  "Quote was viewed 2 days ago. Best time to follow up is within 48 hours of viewing — conversion drops 40% after 72 hours.",
    impact: "3× conversion boost",
    action: "Send Follow-Up",
  },
];

// ── Delivery Timeline (template-driven) ──────────────────────────────────────

export const DELIVERY_TIMELINE = [
  { phase: "Highlights / Teaser",  days: "3–5 working days",  description: "Quick preview video and top 10 edited photographs" },
  { phase: "Edited Photographs",   days: "30 working days",   description: "Full gallery of high-resolution edited images" },
  { phase: "Cinematic Video",      days: "60 working days",   description: "Full-length event film with music and color grade" },
  { phase: "Premium Album",        days: "90 working days",   description: "Handcrafted lay-flat album after design approval" },
];

// ── Mock Quotes ────────────────────────────────────────────────────────────────

export const initialQuotes: Quote[] = [
  {
    id: "q-001",
    clientName: "Priya & Rohan Sharma",
    clientPhone: "+91 98765 43210",
    clientEmail: "priya.sharma@gmail.com",
    clientLocation: "Chennai, Tamil Nadu",
    eventTypes: ["Wedding", "Reception"],
    eventDates: "15 Feb 2025 – 16 Feb 2025",
    venueName: "The Leela Palace, Chennai",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-1", serviceId: "cand-photo",  name: "Candid Photography",  sessions: 2, events: "Wedding, Reception", unitPrice: 35000, subtotal: 70000 },
      { id: "sl-2", serviceId: "cand-video",  name: "Candid Videography",  sessions: 2, events: "Wedding, Reception", unitPrice: 35000, subtotal: 70000 },
      { id: "sl-3", serviceId: "trad-photo",  name: "Traditional Photography", sessions: 2, events: "Wedding, Reception", unitPrice: 10000, subtotal: 20000 },
      { id: "sl-4", serviceId: "drone",       name: "Drone Coverage",       sessions: 1, events: "Wedding",           unitPrice: 10000, subtotal: 10000 },
      { id: "sl-5", serviceId: "album",       name: "Premium Album",        sessions: 1, events: "—",                 unitPrice: 20000, subtotal: 20000 },
    ],
    addOns: [
      { id: "ao-1", addOnId: "same-day-edit",  name: "Same-Day Edit Video",     qty: 1, price: 15000, subtotal: 15000 },
      { id: "ao-2", addOnId: "extra-shooter",  name: "Additional Photographer", qty: 1, price: 8000,  subtotal: 8000  },
    ],
    discountType: "flat",
    discountValue: 13000,
    subtotal: 213000,
    discountAmount: 13000,
    grandTotal: 200000,
    notes: "Client requested drone shots specifically for the baraat procession. Same-day edit to be screened at reception dinner.",
    status: "Approved",
    createdAt: "2024-11-20",
    updatedAt: "2024-11-25",
    validUntil: "2024-12-20",
    sentAt: "2024-11-21",
    viewedAt: "2024-11-22",
    approvedAt: "2024-11-25",
    signatureData: "data:image/png;base64,iVBORw0KGgo=",
    followUpCount: 1,
    aiScore: 94,
    aiRecommendation: "High-value client. Consider offering complimentary couple shoot to build long-term relationship.",
  },
  {
    id: "q-002",
    clientName: "Meera & Karthik Nair",
    clientPhone: "+91 87654 32109",
    clientEmail: "meera.nair@outlook.com",
    clientLocation: "Coimbatore, Tamil Nadu",
    eventTypes: ["Engagement", "Wedding"],
    eventDates: "8 Mar 2025",
    venueName: "Kovai Residency Banquet",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-6",  serviceId: "cand-photo", name: "Candid Photography",  sessions: 1, events: "Engagement",  unitPrice: 35000, subtotal: 35000 },
      { id: "sl-7",  serviceId: "trad-photo", name: "Traditional Photography", sessions: 1, events: "Engagement", unitPrice: 10000, subtotal: 10000 },
      { id: "sl-8",  serviceId: "couple",     name: "Couple Shoot",         sessions: 1, events: "Pre-Event",   unitPrice: 20000, subtotal: 20000 },
    ],
    addOns: [],
    discountType: "percent",
    discountValue: 10,
    subtotal: 65000,
    discountAmount: 6500,
    grandTotal: 58500,
    notes: "Outdoor shoot at sunrise requested for couple session.",
    status: "Sent",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-03",
    validUntil: "2024-12-31",
    sentAt: "2024-12-02",
    viewedAt: null,
    approvedAt: null,
    signatureData: null,
    followUpCount: 0,
    aiScore: 72,
    aiRecommendation: "Quote not yet viewed. Send a personal WhatsApp follow-up within 48 hours.",
  },
  {
    id: "q-003",
    clientName: "Ananya Krishnamurthy",
    clientPhone: "+91 76543 21098",
    clientEmail: "ananya.k@gmail.com",
    clientLocation: "Bangalore, Karnataka",
    eventTypes: ["Birthday"],
    eventDates: "22 Jan 2025",
    venueName: "ITC Gardenia Rooftop",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-9",  serviceId: "cand-photo", name: "Candid Photography", sessions: 1, events: "Birthday", unitPrice: 35000, subtotal: 35000 },
      { id: "sl-10", serviceId: "cand-video", name: "Candid Videography", sessions: 1, events: "Birthday", unitPrice: 35000, subtotal: 35000 },
    ],
    addOns: [
      { id: "ao-3", addOnId: "highlight-reel", name: "Highlight Reel (3 min)", qty: 1, price: 5000, subtotal: 5000 },
    ],
    discountType: "flat",
    discountValue: 0,
    subtotal: 75000,
    discountAmount: 0,
    grandTotal: 75000,
    notes: "50th birthday celebration. Gold and ivory theme. Speeches to be clearly captured.",
    status: "Viewed",
    createdAt: "2024-11-28",
    updatedAt: "2024-12-04",
    validUntil: "2024-12-28",
    sentAt: "2024-11-29",
    viewedAt: "2024-12-04",
    approvedAt: null,
    signatureData: null,
    followUpCount: 1,
    aiScore: 81,
    aiRecommendation: "Client viewed quote yesterday. Follow up with a personalised video message.",
  },
  {
    id: "q-004",
    clientName: "Vikram & Deepa Sundaram",
    clientPhone: "+91 65432 10987",
    clientEmail: "vikram.sundaram@corp.in",
    clientLocation: "Madurai, Tamil Nadu",
    eventTypes: ["Wedding", "Engagement", "Reception"],
    eventDates: "10 Apr 2025 – 12 Apr 2025",
    venueName: "Heritage Madurai",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-11", serviceId: "cand-photo",  name: "Candid Photography",      sessions: 3, events: "Engagement, Wedding, Reception", unitPrice: 35000, subtotal: 105000 },
      { id: "sl-12", serviceId: "cand-video",  name: "Candid Videography",      sessions: 3, events: "Engagement, Wedding, Reception", unitPrice: 35000, subtotal: 105000 },
      { id: "sl-13", serviceId: "trad-photo",  name: "Traditional Photography", sessions: 3, events: "All Events",                    unitPrice: 10000, subtotal: 30000  },
      { id: "sl-14", serviceId: "trad-video",  name: "Traditional Videography", sessions: 3, events: "All Events",                    unitPrice: 10000, subtotal: 30000  },
      { id: "sl-15", serviceId: "drone",       name: "Drone Coverage",           sessions: 2, events: "Wedding, Reception",            unitPrice: 10000, subtotal: 20000  },
      { id: "sl-16", serviceId: "live-stream", name: "Live Streaming",           sessions: 1, events: "Wedding",                       unitPrice: 10000, subtotal: 10000  },
      { id: "sl-17", serviceId: "album",       name: "Premium Album",            sessions: 1, events: "—",                             unitPrice: 20000, subtotal: 20000  },
      { id: "sl-18", serviceId: "couple",      name: "Couple Shoot",             sessions: 1, events: "Pre-Event",                     unitPrice: 20000, subtotal: 20000  },
    ],
    addOns: [
      { id: "ao-4", addOnId: "same-day-edit",  name: "Same-Day Edit Video",      qty: 2, price: 15000, subtotal: 30000 },
      { id: "ao-5", addOnId: "extra-album",    name: "Extra Album Copy",         qty: 2, price: 8000,  subtotal: 16000 },
      { id: "ao-6", addOnId: "extra-shooter",  name: "Additional Photographer",  qty: 2, price: 8000,  subtotal: 16000 },
    ],
    discountType: "flat",
    discountValue: 32000,
    subtotal: 402000,
    discountAmount: 32000,
    grandTotal: 370000,
    notes: "3-day luxury wedding package. Client family well-known in Madurai. Utmost care required.",
    status: "Draft",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-05",
    validUntil: "2025-01-05",
    sentAt: null,
    viewedAt: null,
    approvedAt: null,
    signatureData: null,
    followUpCount: 0,
    aiScore: 88,
    aiRecommendation: "Largest active quote. Recommend sending as PDF with a personalised cover note by Arthy.",
  },
  {
    id: "q-005",
    clientName: "Riya Patel",
    clientPhone: "+91 54321 09876",
    clientEmail: "riya.patel@yahoo.in",
    clientLocation: "Hyderabad, Telangana",
    eventTypes: ["Corporate"],
    eventDates: "5 Feb 2025",
    venueName: "Hyderabad International Convention Centre",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-19", serviceId: "trad-photo", name: "Traditional Photography", sessions: 1, events: "Conference Day", unitPrice: 10000, subtotal: 10000 },
      { id: "sl-20", serviceId: "trad-video", name: "Traditional Videography", sessions: 1, events: "Conference Day", unitPrice: 10000, subtotal: 10000 },
      { id: "sl-21", serviceId: "live-stream",name: "Live Streaming",          sessions: 1, events: "Keynote",        unitPrice: 10000, subtotal: 10000 },
    ],
    addOns: [],
    discountType: "percent",
    discountValue: 0,
    subtotal: 30000,
    discountAmount: 0,
    grandTotal: 30000,
    notes: "Corporate annual day. Need B-roll footage of delegates for internal documentary.",
    status: "Rejected",
    createdAt: "2024-11-15",
    updatedAt: "2024-11-22",
    validUntil: "2024-12-15",
    sentAt: "2024-11-16",
    viewedAt: "2024-11-18",
    approvedAt: null,
    signatureData: null,
    followUpCount: 3,
    aiScore: 35,
    aiRecommendation: "Client rejected due to budget. Mark as lost and consider referral to partner studio.",
  },
  {
    id: "q-006",
    clientName: "Kavya & Suresh Iyer",
    clientPhone: "+91 43210 98765",
    clientEmail: "kavya.suresh@gmail.com",
    clientLocation: "Trichy, Tamil Nadu",
    eventTypes: ["Pre-Wedding"],
    eventDates: "18 Jan 2025",
    venueName: "Rockfort, Trichy",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-22", serviceId: "couple",     name: "Couple Shoot",      sessions: 1, events: "Pre-Wedding", unitPrice: 20000, subtotal: 20000 },
      { id: "sl-23", serviceId: "cand-photo", name: "Candid Photography", sessions: 1, events: "Pre-Wedding", unitPrice: 35000, subtotal: 35000 },
    ],
    addOns: [
      { id: "ao-7", addOnId: "highlight-reel", name: "Highlight Reel (3 min)", qty: 1, price: 5000, subtotal: 5000 },
    ],
    discountType: "percent",
    discountValue: 5,
    subtotal: 60000,
    discountAmount: 3000,
    grandTotal: 57000,
    notes: "Sunrise shoot at Rockfort with drone aerials. Bride prefers natural, candid editing style.",
    status: "Approved",
    createdAt: "2024-11-10",
    updatedAt: "2024-11-14",
    validUntil: "2024-12-10",
    sentAt: "2024-11-11",
    viewedAt: "2024-11-13",
    approvedAt: "2024-11-14",
    signatureData: "data:image/png;base64,iVBORw0KGgo=",
    followUpCount: 0,
    aiScore: 91,
    aiRecommendation: "Convert to full wedding package. Offer ₹5,000 credit on next booking.",
  },
  {
    id: "q-007",
    clientName: "Siddharth Menon",
    clientPhone: "+91 32109 87654",
    clientEmail: "sid.menon@startup.io",
    clientLocation: "Kochi, Kerala",
    eventTypes: ["Corporate"],
    eventDates: "14 Mar 2025",
    venueName: "Grand Hyatt Kochi Bolgatty",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-24", serviceId: "cand-photo",  name: "Candid Photography",  sessions: 1, events: "Product Launch", unitPrice: 35000, subtotal: 35000 },
      { id: "sl-25", serviceId: "cand-video",  name: "Candid Videography",  sessions: 1, events: "Product Launch", unitPrice: 35000, subtotal: 35000 },
      { id: "sl-26", serviceId: "live-stream", name: "Live Streaming",       sessions: 1, events: "Main Stage",     unitPrice: 10000, subtotal: 10000 },
    ],
    addOns: [
      { id: "ao-8", addOnId: "same-day-edit", name: "Same-Day Edit Video", qty: 1, price: 15000, subtotal: 15000 },
    ],
    discountType: "flat",
    discountValue: 5000,
    subtotal: 95000,
    discountAmount: 5000,
    grandTotal: 90000,
    notes: "Tech startup product launch. Clean, modern editing required. Social media reels needed next day.",
    status: "Sent",
    createdAt: "2024-12-08",
    updatedAt: "2024-12-08",
    validUntil: "2025-01-08",
    sentAt: "2024-12-08",
    viewedAt: null,
    approvedAt: null,
    signatureData: null,
    followUpCount: 0,
    aiScore: 68,
    aiRecommendation: "New quote. Follow up in 2 days if not viewed.",
  },
  {
    id: "q-008",
    clientName: "Lakshmi & Arjun Raghavan",
    clientPhone: "+91 21098 76543",
    clientEmail: "lakshmi.arjun@gmail.com",
    clientLocation: "Pondicherry",
    eventTypes: ["Wedding"],
    eventDates: "6 Jun 2025",
    venueName: "Dune Eco Village & Beach Resort",
    executiveName: "Arthy Venkat",
    executivePhone: "+91 90000 12345",
    executiveEmail: "arthy@onethousandtales.com",
    services: [
      { id: "sl-27", serviceId: "cand-photo",  name: "Candid Photography",      sessions: 1, events: "Wedding",  unitPrice: 35000, subtotal: 35000 },
      { id: "sl-28", serviceId: "cand-video",  name: "Candid Videography",      sessions: 1, events: "Wedding",  unitPrice: 35000, subtotal: 35000 },
      { id: "sl-29", serviceId: "trad-photo",  name: "Traditional Photography", sessions: 1, events: "Wedding",  unitPrice: 10000, subtotal: 10000 },
      { id: "sl-30", serviceId: "drone",       name: "Drone Coverage",           sessions: 1, events: "Wedding",  unitPrice: 10000, subtotal: 10000 },
      { id: "sl-31", serviceId: "couple",      name: "Couple Shoot",             sessions: 1, events: "Pre-Event",unitPrice: 20000, subtotal: 20000 },
      { id: "sl-32", serviceId: "album",       name: "Premium Album",            sessions: 1, events: "—",        unitPrice: 20000, subtotal: 20000 },
    ],
    addOns: [],
    discountType: "percent",
    discountValue: 8,
    subtotal: 130000,
    discountAmount: 10400,
    grandTotal: 119600,
    notes: "Beach wedding in June. Need water-safe equipment planning for drone. Golden-hour photos mandatory.",
    status: "Draft",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-10",
    validUntil: "2025-01-10",
    sentAt: null,
    viewedAt: null,
    approvedAt: null,
    signatureData: null,
    followUpCount: 0,
    aiScore: 79,
    aiRecommendation: "Draft ready. Add Live Streaming to increase package value by ₹10,000.",
  },
];

// ── KPI helpers ───────────────────────────────────────────────────────────────

export function computeQuoteKPIs(quotes: Quote[]) {
  const approved  = quotes.filter((q) => q.status === "Approved");
  const pending   = quotes.filter((q) => q.status === "Sent" || q.status === "Viewed");
  const rejected  = quotes.filter((q) => q.status === "Rejected");
  const total     = quotes.length;
  const convRate  = total > 0 ? Math.round((approved.length / total) * 100) : 0;
  const pipeline  = quotes.filter((q) => q.status !== "Rejected" && q.status !== "Expired").reduce((s, q) => s + q.grandTotal, 0);
  const approvedVal = approved.reduce((s, q) => s + q.grandTotal, 0);
  const pendingVal  = pending.reduce((s, q) => s + q.grandTotal, 0);
  return { total, approved: approved.length, pending: pending.length, rejected: rejected.length, convRate, pipeline, approvedVal, pendingVal };
}
