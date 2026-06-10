// Mock analytics data — replace with real API calls when ready

export const kpiData = {
  totalSpend: { value: 48200, change: +12.4, unit: "₹" },
  totalClicks: { value: 24810, change: +8.7, unit: "" },
  ctr: { value: 3.82, change: +0.4, unit: "%" },
  cpl: { value: 387, change: -6.2, unit: "₹" },
  leadsGenerated: { value: 124, change: +18.3, unit: "" },
  conversionRate: { value: 4.6, change: +1.1, unit: "%" },
  roas: { value: 3.8, change: +0.6, unit: "x" },
};

export const platformClickData = [
  { date: "Jun 1",  instagram: 820, facebook: 540, google: 310, youtube: 180 },
  { date: "Jun 3",  instagram: 940, facebook: 620, google: 390, youtube: 210 },
  { date: "Jun 5",  instagram: 780, facebook: 480, google: 280, youtube: 160 },
  { date: "Jun 7",  instagram: 1100, facebook: 700, google: 450, youtube: 290 },
  { date: "Jun 9",  instagram: 1240, facebook: 760, google: 520, youtube: 340 },
  { date: "Jun 11", instagram: 980, facebook: 610, google: 390, youtube: 240 },
  { date: "Jun 13", instagram: 1380, facebook: 890, google: 610, youtube: 420 },
  { date: "Jun 15", instagram: 1520, facebook: 970, google: 680, youtube: 480 },
  { date: "Jun 17", instagram: 1290, facebook: 820, google: 570, youtube: 360 },
  { date: "Jun 19", instagram: 1640, facebook: 1040, google: 730, youtube: 510 },
];

export const sparklineData = {
  spend: [32000, 35000, 38000, 36000, 41000, 44000, 48200],
  clicks: [18000, 19200, 20500, 21300, 22800, 23900, 24810],
  cpl: [420, 415, 408, 402, 395, 391, 387],
  leads: [84, 90, 97, 104, 110, 118, 124],
};

export const topAdsData = [
  {
    id: 1,
    name: "Wedding Gold — Reel",
    platform: "Instagram",
    spend: 12400,
    clicks: 6820,
    ctr: 5.4,
    leads: 38,
    cpl: 326,
    roas: 5.1,
    badge: "top",
    thumbnail: "/mock-ad-1.jpg",
  },
  {
    id: 2,
    name: "Couple Story — Video",
    platform: "Facebook",
    spend: 8900,
    clicks: 4210,
    ctr: 4.2,
    leads: 24,
    cpl: 370,
    roas: 4.2,
    badge: "ai",
    thumbnail: "/mock-ad-2.jpg",
  },
  {
    id: 3,
    name: "Portrait Series — Carousel",
    platform: "Instagram",
    spend: 6200,
    clicks: 3490,
    ctr: 3.8,
    leads: 18,
    cpl: 344,
    roas: 3.9,
    badge: null,
    thumbnail: "/mock-ad-3.jpg",
  },
  {
    id: 4,
    name: "Destination Wedding",
    platform: "Google",
    spend: 9800,
    clicks: 5140,
    ctr: 3.1,
    leads: 22,
    cpl: 445,
    roas: 3.2,
    badge: null,
    thumbnail: "/mock-ad-4.jpg",
  },
  {
    id: 5,
    name: "Pre-Wedding BTS — Reel",
    platform: "YouTube",
    spend: 5400,
    clicks: 2890,
    ctr: 2.9,
    leads: 12,
    cpl: 450,
    roas: 2.8,
    badge: null,
    thumbnail: "/mock-ad-5.jpg",
  },
];

export const mediaData = [
  {
    id: 1,
    name: "Golden Hour Reel",
    type: "Reel",
    label: "Top Converter",
    labelColor: "purple",
    engagementScore: 94,
    clicks: 4820,
    leads: 32,
    watchTime: "1m 42s",
    saves: 1240,
    gradient: "from-purple-600 to-pink-500",
  },
  {
    id: 2,
    name: "Mandap Ceremony",
    type: "Wedding Photo",
    label: "Highest Engagement",
    labelColor: "blue",
    engagementScore: 88,
    clicks: 3610,
    leads: 24,
    watchTime: "—",
    saves: 2180,
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    id: 3,
    name: "Couple Portraits",
    type: "Carousel",
    label: "Best CPL",
    labelColor: "green",
    engagementScore: 81,
    clicks: 2940,
    leads: 21,
    watchTime: "—",
    saves: 870,
    gradient: "from-emerald-600 to-teal-500",
  },
  {
    id: 4,
    name: "Behind the Scenes",
    type: "Video Ad",
    label: null,
    labelColor: null,
    engagementScore: 76,
    clicks: 2210,
    leads: 14,
    watchTime: "2m 18s",
    saves: 540,
    gradient: "from-orange-600 to-red-500",
  },
];

export const aiInsights = [
  {
    type: "trend",
    icon: "TrendingUp",
    title: "Instagram CPL dropped 6% this week",
    body: "Wedding Gold Reel is your top performer. Recommend increasing its daily budget by ₹500.",
    urgency: "positive",
  },
  {
    type: "alert",
    icon: "AlertTriangle",
    title: "Facebook conversion declining",
    body: "Couple Story campaign has a 38% higher CPL than average. Consider refreshing the creative.",
    urgency: "warning",
  },
  {
    type: "recommendation",
    icon: "Sparkles",
    title: "Scale Instagram Reels",
    body: "Your Reels generate 3.2× more qualified leads than static images at 40% lower CPL.",
    urgency: "info",
  },
  {
    type: "timing",
    icon: "Clock",
    title: "Peak engagement: Fri–Sun 7–9 PM",
    body: "Schedule new creatives to launch Thursday night for maximum weekend visibility.",
    urgency: "info",
  },
];

export const funnelData = [
  { stage: "Impressions", value: 648000, pct: 100 },
  { stage: "Clicks", value: 24810, pct: 3.82 },
  { stage: "Leads", value: 1240, pct: 5.0 },
  { stage: "Qualified", value: 372, pct: 30.0 },
  { stage: "Bookings", value: 87, pct: 23.4 },
];

// ─── Analytics page data ──────────────────────────────────────────────────────

export const analyticsKpiData = {
  impressions:    { value: 648000, change: +22.4 },
  clicks:         { value: 24810,  change: +8.7  },
  ctr:            { value: 3.82,   change: +0.4  },
  cpc:            { value: 1.94,   change: -5.1  },
  cpl:            { value: 387,    change: -6.2  },
  roas:           { value: 3.8,    change: +0.6  },
  conversionRate: { value: 4.6,    change: +1.1  },
  engagementRate: { value: 6.8,    change: +2.3  },
};

export const analyticsSparklines = {
  impressions:    [480000, 512000, 534000, 570000, 598000, 622000, 648000],
  clicks:         [18200, 19800, 21000, 21400, 22800, 23900, 24810],
  ctr:            [3.3, 3.5, 3.6, 3.4, 3.7, 3.8, 3.82],
  cpc:            [2.3, 2.2, 2.1, 2.05, 2.0, 1.97, 1.94],
  cpl:            [420, 415, 408, 402, 395, 391, 387],
  roas:           [2.8, 3.0, 3.2, 3.4, 3.5, 3.7, 3.8],
  conversionRate: [3.2, 3.5, 3.8, 4.0, 4.2, 4.4, 4.6],
  engagementRate: [4.2, 4.8, 5.3, 5.6, 6.0, 6.4, 6.8],
};

type MetricKey = "clicks" | "impressions" | "spend" | "leads" | "conversions";
type PlatformRow = { date: string; instagram: number; facebook: number; google: number; youtube: number };

export const platformTimeseries: Record<MetricKey, PlatformRow[]> = {
  clicks: [
    { date: "Jun 1",  instagram: 820,  facebook: 540,  google: 310, youtube: 180 },
    { date: "Jun 5",  instagram: 940,  facebook: 620,  google: 390, youtube: 210 },
    { date: "Jun 9",  instagram: 780,  facebook: 480,  google: 280, youtube: 160 },
    { date: "Jun 13", instagram: 1100, facebook: 700,  google: 450, youtube: 290 },
    { date: "Jun 17", instagram: 1240, facebook: 760,  google: 520, youtube: 340 },
    { date: "Jun 21", instagram: 980,  facebook: 610,  google: 390, youtube: 240 },
    { date: "Jun 25", instagram: 1380, facebook: 890,  google: 610, youtube: 420 },
    { date: "Jun 29", instagram: 1520, facebook: 970,  google: 680, youtube: 480 },
    { date: "Jul 3",  instagram: 1290, facebook: 820,  google: 570, youtube: 360 },
    { date: "Jul 7",  instagram: 1640, facebook: 1040, google: 730, youtube: 510 },
  ],
  impressions: [
    { date: "Jun 1",  instagram: 22000, facebook: 18000, google: 8500,  youtube: 12000 },
    { date: "Jun 5",  instagram: 26000, facebook: 21000, google: 9800,  youtube: 14500 },
    { date: "Jun 9",  instagram: 23000, facebook: 17500, google: 8200,  youtube: 11000 },
    { date: "Jun 13", instagram: 31000, facebook: 24000, google: 11500, youtube: 17000 },
    { date: "Jun 17", instagram: 34000, facebook: 26500, google: 13000, youtube: 19500 },
    { date: "Jun 21", instagram: 28000, facebook: 22000, google: 10500, youtube: 15000 },
    { date: "Jun 25", instagram: 38000, facebook: 30000, google: 15500, youtube: 22000 },
    { date: "Jun 29", instagram: 42000, facebook: 33500, google: 17000, youtube: 25000 },
    { date: "Jul 3",  instagram: 35000, facebook: 28000, google: 14500, youtube: 21000 },
    { date: "Jul 7",  instagram: 46000, facebook: 37000, google: 19000, youtube: 28000 },
  ],
  spend: [
    { date: "Jun 1",  instagram: 1200, facebook: 900,  google: 650,  youtube: 450 },
    { date: "Jun 5",  instagram: 1400, facebook: 1050, google: 750,  youtube: 520 },
    { date: "Jun 9",  instagram: 1100, facebook: 840,  google: 580,  youtube: 390 },
    { date: "Jun 13", instagram: 1700, facebook: 1250, google: 920,  youtube: 640 },
    { date: "Jun 17", instagram: 1900, facebook: 1380, google: 1020, youtube: 720 },
    { date: "Jun 21", instagram: 1500, facebook: 1100, google: 810,  youtube: 560 },
    { date: "Jun 25", instagram: 2100, facebook: 1560, google: 1150, youtube: 800 },
    { date: "Jun 29", instagram: 2350, facebook: 1720, google: 1280, youtube: 900 },
    { date: "Jul 3",  instagram: 1980, facebook: 1450, google: 1080, youtube: 760 },
    { date: "Jul 7",  instagram: 2600, facebook: 1900, google: 1420, youtube: 990 },
  ],
  leads: [
    { date: "Jun 1",  instagram: 8,  facebook: 5,  google: 3, youtube: 2 },
    { date: "Jun 5",  instagram: 10, facebook: 6,  google: 4, youtube: 2 },
    { date: "Jun 9",  instagram: 7,  facebook: 4,  google: 3, youtube: 1 },
    { date: "Jun 13", instagram: 13, facebook: 8,  google: 5, youtube: 3 },
    { date: "Jun 17", instagram: 15, facebook: 9,  google: 6, youtube: 4 },
    { date: "Jun 21", instagram: 11, facebook: 7,  google: 4, youtube: 3 },
    { date: "Jun 25", instagram: 17, facebook: 11, google: 7, youtube: 5 },
    { date: "Jun 29", instagram: 19, facebook: 12, google: 8, youtube: 6 },
    { date: "Jul 3",  instagram: 14, facebook: 9,  google: 6, youtube: 4 },
    { date: "Jul 7",  instagram: 22, facebook: 14, google: 9, youtube: 7 },
  ],
  conversions: [
    { date: "Jun 1",  instagram: 3, facebook: 2, google: 1, youtube: 1 },
    { date: "Jun 5",  instagram: 4, facebook: 2, google: 2, youtube: 1 },
    { date: "Jun 9",  instagram: 3, facebook: 1, google: 1, youtube: 0 },
    { date: "Jun 13", instagram: 5, facebook: 3, google: 2, youtube: 1 },
    { date: "Jun 17", instagram: 6, facebook: 3, google: 2, youtube: 2 },
    { date: "Jun 21", instagram: 4, facebook: 2, google: 1, youtube: 1 },
    { date: "Jun 25", instagram: 7, facebook: 4, google: 3, youtube: 2 },
    { date: "Jun 29", instagram: 8, facebook: 5, google: 3, youtube: 2 },
    { date: "Jul 3",  instagram: 5, facebook: 3, google: 2, youtube: 1 },
    { date: "Jul 7",  instagram: 9, facebook: 6, google: 4, youtube: 3 },
  ],
};

export const ageData = [
  { group: "18–24", value: 14 },
  { group: "25–34", value: 38 },
  { group: "35–44", value: 27 },
  { group: "45–54", value: 13 },
  { group: "55–64", value: 6  },
  { group: "65+",   value: 2  },
];

export const genderData = [
  { name: "Female", value: 64, color: "#a855f7" },
  { name: "Male",   value: 34, color: "#6366f1" },
  { name: "Other",  value: 2,  color: "#22d3ee" },
];

export const deviceData = [
  { name: "Mobile",  value: 72, color: "#a855f7" },
  { name: "Desktop", value: 21, color: "#6366f1" },
  { name: "Tablet",  value: 7,  color: "#22d3ee" },
];

export const locationData = [
  { city: "Chennai",     value: 28 },
  { city: "Bangalore",   value: 22 },
  { city: "Mumbai",      value: 18 },
  { city: "Delhi",       value: 14 },
  { city: "Hyderabad",   value: 10 },
  { city: "Coimbatore",  value: 8  },
];

export const audienceSegments = [
  { label: "Wedding Planning 25–34 F", cpl: 312, roas: 5.8, leads: 44 },
  { label: "Couples Engaged 25–30",    cpl: 328, roas: 5.2, leads: 38 },
  { label: "Luxury Events 35–44",      cpl: 356, roas: 4.6, leads: 27 },
  { label: "Family Portraits 30–45",   cpl: 401, roas: 3.8, leads: 15 },
];

export const platformBreakdown = [
  {
    platform: "Instagram",
    color: "#a855f7",
    bgGradient: "from-purple-500/20 to-purple-500/5",
    borderColor: "border-purple-500/25",
    spend: 22400,
    leads: 52,
    ctr: 4.8,
    roas: 5.1,
    bestCampaign: "Wedding Gold — Reel",
    spendChange: 14.2,
    leadsChange: 22.6,
  },
  {
    platform: "Facebook",
    color: "#6366f1",
    bgGradient: "from-indigo-500/20 to-indigo-500/5",
    borderColor: "border-indigo-500/25",
    spend: 14100,
    leads: 31,
    ctr: 3.2,
    roas: 3.6,
    bestCampaign: "Couple Story — Video",
    spendChange: 8.4,
    leadsChange: -4.1,
  },
  {
    platform: "Google",
    color: "#22c55e",
    bgGradient: "from-green-500/20 to-green-500/5",
    borderColor: "border-green-500/25",
    spend: 8200,
    leads: 28,
    ctr: 2.8,
    roas: 3.1,
    bestCampaign: "Wedding Photography",
    spendChange: -2.1,
    leadsChange: 11.3,
  },
  {
    platform: "YouTube",
    color: "#f97316",
    bgGradient: "from-orange-500/20 to-orange-500/5",
    borderColor: "border-orange-500/25",
    spend: 3500,
    leads: 13,
    ctr: 2.1,
    roas: 2.8,
    bestCampaign: "Pre-Wedding BTS Reel",
    spendChange: 6.8,
    leadsChange: 8.9,
  },
];

export const analyticsInsights = [
  {
    icon: "Trophy",
    title: "Instagram is your #1 channel",
    body: "Delivers 52 leads at 5.1× ROAS — 43% better than your next best platform. Headroom to scale.",
    urgency: "positive",
    action: "Scale budget ₹5k",
  },
  {
    icon: "Zap",
    title: "Facebook creative fatigue",
    body: "Couple Story campaign frequency hit 4.2× — engagement dropped 28% in 7 days. Needs a fresh hook.",
    urgency: "warning",
    action: "Refresh creative",
  },
  {
    icon: "TrendingUp",
    title: "Google Search has headroom",
    body: "Brand keyword 'wedding photographer Chennai' — you're capturing only 31% impression share at 2.1× quality score.",
    urgency: "info",
    action: "Increase bids",
  },
  {
    icon: "Users",
    title: "Lookalike audience opportunity",
    body: "25–34 female segment converts at ₹312 CPL — 24% below average. Build a lookalike from top 100 leads.",
    urgency: "positive",
    action: "Create audience",
  },
  {
    icon: "Clock",
    title: "Schedule for peak hours",
    body: "Friday 7–9 PM and Saturday 8–10 PM generate 38% more clicks at 12% lower CPL across all channels.",
    urgency: "info",
    action: "Update schedule",
  },
  {
    icon: "PieChart",
    title: "Rebalance ₹5k from YouTube",
    body: "YouTube CPL at ₹450 is 16% above target. Shift ₹5k to Instagram Reels for a projected 14% CPL drop.",
    urgency: "warning",
    action: "Rebalance",
  },
];

export const analyticsFunnelData = [
  {
    stage: "Impressions",
    value: 648000,
    displayValue: "648k",
    pct: 100,
    dropOff: null,
    color: "#a855f7",
    insight: null,
  },
  {
    stage: "Clicks",
    value: 24810,
    displayValue: "24.8k",
    pct: 3.82,
    dropOff: 96.18,
    color: "#818cf8",
    insight: "Strong CTR — Instagram Reels driving most clicks",
  },
  {
    stage: "Leads",
    value: 1240,
    displayValue: "1,240",
    pct: 5.0,
    dropOff: 95.0,
    color: "#38bdf8",
    insight: "Landing page converts at 5% — industry avg is 3.2%",
  },
  {
    stage: "Qualified",
    value: 372,
    displayValue: "372",
    pct: 30.0,
    dropOff: 70.0,
    color: "#34d399",
    insight: "30% qualification rate — AI suggests improving lead form questions",
  },
  {
    stage: "Bookings",
    value: 87,
    displayValue: "87",
    pct: 23.4,
    dropOff: 76.6,
    color: "#4ade80",
    insight: "Sales close rate is strong — focus on increasing qualified leads",
  },
];
