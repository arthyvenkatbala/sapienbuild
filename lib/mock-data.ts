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

// ─── AI Strategy page data ───────────────────────────────────────────────────

export const strategyReplies: Record<string, string> = {
  scale: `**Best Scaling Opportunity: Wedding Gold — Reel**

Your data shows a clear winner ready to scale:

• ROAS: **5.1×** — 34% above your portfolio average
• Daily budget: **₹1,200** — low saturation, room to grow
• Frequency: **1.8×** — well below the 3.5× fatigue threshold
• CPL: **₹326** — 16% below your ₹390 target

**Why this is safe to scale right now:**
• CTR holding strong at 5.4% — no creative fatigue signal
• Lead quality: 68% qualification rate vs 30% average
• Audience size: 2.1M — plenty of fresh reach available

**Your action plan:**
1. Increase daily budget to **₹2,400** (double) for 7 days
2. Set automated rule: reduce by 20% if frequency exceeds 3.2×
3. Set automated rule: pause if CPL rises above ₹420

**Expected outcome:** +18–22 leads/week at projected CPL ₹340–360`,

  cpl: `**CPL Reduction Playbook — Target: ₹338**

Current blended CPL is ₹387. Here is how to bring it down 13–18%:

**Quick wins (this week):**
• Pause 'Destination Wedding' — CPL ₹450 is 16% above target
• Refresh Facebook 'Couple Story' — frequency at 4.2× (creative fatigue)
• A/B test new Instagram hook: replace static opening with motion in first 1.5s

**Medium-term (2–3 weeks):**
• Build lookalike from your top 50 converted leads — projected CPL ₹310–325
• Focus spend on 25–34 female segment — your ₹312 CPL sweet spot
• Switch Google to manual bidding with target CPA ₹380

**Budget shift:**
• Move ₹3,500 from YouTube to Instagram Reels
• Reallocate ₹1,500 from Facebook awareness to retargeting

**Expected CPL after:** ₹338–355 (13–18% reduction in 21 days)`,

  roas: `**ROAS Improvement Strategy — Target: 4.5×**

Current blended ROAS: **3.8×** | Gap to close: **0.7×**

**Platform gap analysis:**
• Instagram: 5.1× ✅ performing above target
• Facebook: 3.6× ⚠️ needs retargeting shift
• Google: 3.1× ⚠️ needs negative keyword cleanup
• YouTube: 2.8× ❌ reallocate this budget

**Action items ranked by impact:**
1. **Reallocate YouTube** — move ₹3,500 to Instagram (immediate +0.3× ROAS)
2. **Facebook to retargeting** — warm audiences convert at 4.8×
3. **Google negative keywords** — remove 'free', 'cheap', 'DIY' queries
4. **New budget split:** Instagram 46% | Facebook 29% | Google 21% | YouTube 4%

**Projected ROAS after rebalance:** 4.3–4.7× within 14 days`,

  creative: `**Creative Intelligence Report**

**What is working — keep producing:**
• Outdoor golden-hour reels (25–35 seconds)
• Candid ceremony emotion — raw, unposed
• Behind-the-scenes preparation footage
• Before/after editing transformation clips

**What is not working — stop:**
• Studio posed portrait carousels (CTR 1.2% vs 4.8% avg)
• Text-heavy informational posts
• Long-form video over 60 seconds
• Price/package promotional content

**3 Reel concepts for this weekend:**
1. "60 seconds of your wedding story" — couple highlights montage
2. "The moments between the moments" — candid BTS
3. "What you will remember vs. what you will forget" — emotional contrast

**6 proven hook templates:**
• "Your wedding deserves more than posed photos..."
• "This is what ₹50,000 in wedding photography looks like"
• "The photo your parents will hang on the wall forever"
• "Everyone films the vows. Nobody films this..."
• "POV: Your wedding day in 30 seconds"
• "This couple cried watching their film for the first time"`,

  audience: `**Audience Optimization Report**

**Your top-converting segments (focus here):**
1. **25–34 Female, Wedding Planning** — CPL ₹312, ROAS 5.8× (best segment)
2. **Engaged Couples 25–30** — CPL ₹328, ROAS 5.2×
3. **Luxury Event Planners 35–44** — lower volume, highest booking value

**Untapped opportunities:**
• **Bridal party lookalike** — build from your booked-client email list
• **Wedding venue retargeting** — target Instagram visitors of venue pages
• **Competitor audience targeting** — bridal expos, wedding blogs

**Audiences to exclude immediately:**
• Existing customers — saves 8–12% of wasted spend
• Pricing page visitors > 3 times — already decided
• Under 22 age group — 0.6% conversion vs 4.8% average

**Recommended new audiences to build this week:**
1. Lookalike (1%) from your 50 highest-value leads
2. Engaged + location: Chennai, Bangalore, Mumbai
3. Interest retargeting: people who watched 75%+ of your reels`,

  budget: `**Budget Allocation Recommendation — ₹48,200/month**

Recommended reallocation for +30% efficiency:

**Platform split:**
• Instagram: ₹22,400 → **₹26,500** (+₹4,100) — highest ROAS
• Facebook: ₹14,100 → **₹12,800** (−₹1,300) — shift to retargeting only
• Google: ₹8,200 → **₹8,200** (unchanged) — maintain brand keywords
• YouTube: ₹3,500 → **₹700** (−₹2,800) — reduce to remarketing only

**New: Testing budget ₹2,000 (4% of total):**
• ₹1,000 — Instagram Story format A/B test
• ₹1,000 — New audience segment validation

**Timeline:** Implement over 5 days, review after 14 days

**Expected outcomes:**
• CPL: ₹387 → ₹338–355 (13–18% reduction)
• Leads: 124 → 145–155/month (+17–25%)
• ROAS: 3.8× → 4.2–4.5×`,

  default: `**Marketing Intelligence Summary — Jun 2026**

Your portfolio is performing above industry average. Here are your priority actions:

**Immediate (today):**
• Double 'Wedding Gold — Reel' budget to ₹2,400/day
• Pause YouTube 'Destination Wedding' (CPL ₹450, below target)
• Set up frequency cap at 3.2× for Facebook campaigns

**This week:**
• Refresh Facebook creative — Couple Story has hit 4.2× frequency
• Build lookalike audience from your top 50 converted leads
• Schedule new reel launch for Friday 7 PM — your peak engagement window

**This month:**
• Shift ₹5k from YouTube to Instagram Reels
• Add Google negative keywords to improve quality score
• A/B test 2 new reel hooks — focus on emotional opening hooks

Your single biggest opportunity: the **25–34 female audience segment** converts at ₹312 CPL but receives only 18% of your total budget. Shifting 10% more budget here could generate 12–15 additional leads per week.`,
};

export const strategyQuickActions = [
  { key: "scale",    label: "Scale Campaign",       color: "#a855f7", prompt: "Which campaign should I scale right now and what is the exact action plan?" },
  { key: "cpl",      label: "Reduce CPL",           color: "#22c55e", prompt: "How can I reduce my cost per lead? Give me a step-by-step action plan." },
  { key: "roas",     label: "Improve ROAS",         color: "#6366f1", prompt: "How do I improve my ROAS across all platforms? Give specific actions." },
  { key: "creative", label: "Creative Suggestions", color: "#f472b6", prompt: "What creative content should I produce this week? Give me specific reel concepts and hooks." },
  { key: "audience", label: "Audience Optimization",color: "#22d3ee", prompt: "Which audiences should I target and which should I exclude? Full optimization plan." },
  { key: "budget",   label: "Budget Allocation",    color: "#f97316", prompt: "How should I allocate my ₹48,200 monthly budget across platforms for maximum results?" },
];

export const campaignScoreCards = [
  { label: "Overall Score",   value: 74, color: "#a855f7", note: "Strong Instagram, Facebook needs attention" },
  { label: "Spend Efficiency",value: 82, color: "#6366f1", note: "CPL trending downward, on track" },
  { label: "Lead Quality",    value: 68, color: "#38bdf8", note: "30% qualification rate — room to improve" },
  { label: "Creative Health", value: 61, color: "#f97316", note: "2 of 5 creatives showing fatigue" },
];

export const strategyRecommendations = [
  {
    priority: 1,
    type: "scale",
    urgency: "positive",
    title: "Scale Wedding Gold Reel",
    detail: "5.1× ROAS, low frequency (1.8×). Double to ₹2,400/day.",
    impact: "+22 leads/week",
    confidence: 91,
  },
  {
    priority: 2,
    type: "pause",
    urgency: "warning",
    title: "Pause Destination Wedding",
    detail: "YouTube. CPL ₹450 — 16% above target. Reallocate budget.",
    impact: "−₹3,500 waste",
    confidence: 88,
  },
  {
    priority: 3,
    type: "refresh",
    urgency: "warning",
    title: "Refresh Facebook Creative",
    detail: "Couple Story frequency at 4.2×. New hook needed ASAP.",
    impact: "−28% CPL",
    confidence: 85,
  },
  {
    priority: 4,
    type: "build",
    urgency: "info",
    title: "Build Lookalike Audience",
    detail: "From top 50 leads. Projected CPL ₹310–325 (24% below avg).",
    impact: "+₹312 CPL tier",
    confidence: 76,
  },
];

export const creativeIdeas = {
  reelConcepts: [
    {
      title: "The Golden Hour Story",
      hook: "POV: Your wedding photographer just found perfect light...",
      duration: "25–30 sec",
      gradient: "from-amber-500/25 to-orange-500/15",
      border: "border-amber-500/25",
      score: 94,
      tag: "Top Converter",
    },
    {
      title: "The Unseen Moments",
      hook: "Everyone films the vows. Nobody films this...",
      duration: "20–25 sec",
      gradient: "from-purple-500/25 to-pink-500/15",
      border: "border-purple-500/25",
      score: 91,
      tag: "Best CTR",
    },
    {
      title: "60 Seconds of Forever",
      hook: "This is what ₹50,000 in wedding photography looks like",
      duration: "58–62 sec",
      gradient: "from-blue-500/25 to-cyan-500/15",
      border: "border-blue-500/25",
      score: 88,
      tag: "AI Recommended",
    },
  ],
  hooks: [
    { text: "Your wedding deserves more than posed photos...", type: "Emotional",     score: 92 },
    { text: "This couple cried watching their film for the first time", type: "Social Proof", score: 94 },
    { text: "Everyone films the vows. Nobody films this...",   type: "Curiosity",    score: 90 },
    { text: "The photo your parents will hang on the wall forever", type: "Legacy",  score: 85 },
    { text: "POV: Your wedding day in 30 seconds",             type: "POV",          score: 86 },
    { text: "This is what ₹50,000 in wedding photography looks like", type: "Value", score: 88 },
  ],
  ctaTests: [
    { current: "Book Now",    suggested: "Check Your Date",     lift: "+23% CTR" },
    { current: "Learn More",  suggested: "See Our Work",        lift: "+17% CTR" },
    { current: "Get Quote",   suggested: "Tell Us Your Story",  lift: "+31% CTR" },
  ],
};

export const forecastCards = [
  {
    title: "CPL Forecast",
    value: "₹338",
    change: -12.7,
    period: "Next 30 days",
    trend: "positive",
    confidence: 84,
    sparkline: [387, 380, 372, 364, 357, 348, 338],
    description: "After creative refresh and audience optimisation",
  },
  {
    title: "Lead Growth",
    value: "+28%",
    change: 28,
    period: "Next 30 days",
    trend: "positive",
    confidence: 76,
    sparkline: [124, 128, 133, 139, 144, 151, 158],
    description: "Scaling Instagram + Google impression share gain",
  },
  {
    title: "Campaign Fatigue",
    value: "7 days",
    change: null,
    period: "Facebook alert",
    trend: "warning",
    confidence: 91,
    sparkline: null,
    description: "Couple Story will hit critical frequency threshold",
  },
  {
    title: "ROAS Projection",
    value: "4.4×",
    change: +15.8,
    period: "Next 30 days",
    trend: "positive",
    confidence: 79,
    sparkline: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4],
    description: "After budget rebalance from YouTube to Instagram",
  },
  {
    title: "Peak Window",
    value: "Fri–Sun",
    change: null,
    period: "This week",
    trend: "info",
    confidence: 88,
    sparkline: null,
    description: "Launch new creatives Friday 7–9 PM for best reach",
  },
  {
    title: "Budget Efficiency",
    value: "71/100",
    change: +8,
    period: "Score",
    trend: "warning",
    confidence: 82,
    sparkline: [58, 61, 64, 67, 68, 70, 71],
    description: "Improve by reallocating ₹3,500 from YouTube",
  },
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

// ─── Media Insights page data ─────────────────────────────────────────────────

export const mediaOverviewStats = {
  totalAssets:          { value: 24,        label: "Total Media Assets",       change: +4,    unit: "" },
  bestEngagementRate:   { value: 9.4,       label: "Best Engagement Rate",     change: +1.8,  unit: "%" },
  topReel:              { value: "Golden Hour Reel", label: "Top Performing Reel", change: null, unit: "" },
  avgWatchTime:         { value: "1m 28s",  label: "Avg Watch Time",           change: +12,   unit: "%" },
  savesAndShares:       { value: 8420,      label: "Saves & Shares",           change: +22.6, unit: "" },
  creativeConvRate:     { value: 6.8,       label: "Creative Conversion Rate", change: +0.9,  unit: "%" },
};

export const mediaSparklines = {
  totalAssets:      [18, 19, 20, 20, 21, 22, 24],
  engagementRate:   [7.1, 7.5, 7.8, 8.0, 8.4, 8.9, 9.4],
  avgWatchTime:     [72, 74, 76, 78, 80, 84, 88],
  savesAndShares:   [5200, 5900, 6400, 6800, 7200, 7900, 8420],
  creativeConvRate: [5.6, 5.8, 6.0, 6.1, 6.3, 6.6, 6.8],
};

export const mediaAssets = [
  {
    id: 1,
    name: "Golden Hour Reel",
    type: "Reel",
    label: "Top Converter",
    labelColor: "#a855f7",
    gradient: "from-purple-700 via-purple-600 to-pink-500",
    accentColor: "#a855f7",
    engagementScore: 94,
    clicks: 4820,
    leads: 32,
    watchTime: "1m 42s",
    saves: 1240,
    shares: 680,
    ctr: 5.4,
    platform: "Instagram",
    duration: "45s",
    sparkline: [62, 71, 78, 82, 88, 92, 94],
  },
  {
    id: 2,
    name: "Mandap Ceremony",
    type: "Wedding Video",
    label: "Highest Engagement",
    labelColor: "#38bdf8",
    gradient: "from-sky-700 via-blue-600 to-cyan-500",
    accentColor: "#38bdf8",
    engagementScore: 88,
    clicks: 3610,
    leads: 24,
    watchTime: "2m 10s",
    saves: 2180,
    shares: 940,
    ctr: 4.1,
    platform: "Facebook",
    duration: "3m 12s",
    sparkline: [70, 74, 78, 80, 84, 86, 88],
  },
  {
    id: 3,
    name: "Couple Portraits",
    type: "Carousel",
    label: "Best Wedding Creative",
    labelColor: "#22c55e",
    gradient: "from-emerald-700 via-emerald-600 to-teal-500",
    accentColor: "#22c55e",
    engagementScore: 81,
    clicks: 2940,
    leads: 21,
    watchTime: "—",
    saves: 870,
    shares: 420,
    ctr: 3.8,
    platform: "Instagram",
    duration: "6 slides",
    sparkline: [58, 63, 68, 72, 76, 79, 81],
  },
  {
    id: 4,
    name: "Behind the Scenes",
    type: "Reel",
    label: "Viral Potential",
    labelColor: "#f97316",
    gradient: "from-orange-700 via-orange-600 to-red-500",
    accentColor: "#f97316",
    engagementScore: 76,
    clicks: 2210,
    leads: 14,
    watchTime: "2m 18s",
    saves: 540,
    shares: 1820,
    ctr: 3.2,
    platform: "Instagram",
    duration: "1m 08s",
    sparkline: [50, 55, 60, 65, 70, 73, 76],
  },
  {
    id: 5,
    name: "Destination Wedding Film",
    type: "Wedding Video",
    label: "Strong CTA",
    labelColor: "#f59e0b",
    gradient: "from-amber-700 via-yellow-600 to-amber-400",
    accentColor: "#f59e0b",
    engagementScore: 84,
    clicks: 3280,
    leads: 27,
    watchTime: "3m 45s",
    saves: 1560,
    shares: 720,
    ctr: 4.4,
    platform: "YouTube",
    duration: "5m 22s",
    sparkline: [60, 66, 71, 75, 79, 82, 84],
  },
  {
    id: 6,
    name: "Pre-Wedding Cinematic",
    type: "Reel",
    label: "Top Converter",
    labelColor: "#a855f7",
    gradient: "from-violet-700 via-indigo-600 to-purple-500",
    accentColor: "#a855f7",
    engagementScore: 79,
    clicks: 2650,
    leads: 19,
    watchTime: "58s",
    saves: 740,
    shares: 390,
    ctr: 3.6,
    platform: "Instagram",
    duration: "30s",
    sparkline: [55, 60, 64, 68, 72, 76, 79],
  },
  {
    id: 7,
    name: "Reception Highlights",
    type: "Photography",
    label: null,
    labelColor: null,
    gradient: "from-rose-700 via-pink-600 to-rose-400",
    accentColor: "#f43f5e",
    engagementScore: 71,
    clicks: 1840,
    leads: 11,
    watchTime: "—",
    saves: 620,
    shares: 280,
    ctr: 2.9,
    platform: "Facebook",
    duration: "12 shots",
    sparkline: [50, 53, 57, 61, 65, 68, 71],
  },
  {
    id: 8,
    name: "Haldi Ceremony Carousel",
    type: "Carousel",
    label: "Best Wedding Creative",
    labelColor: "#22c55e",
    gradient: "from-lime-700 via-green-600 to-teal-500",
    accentColor: "#22c55e",
    engagementScore: 85,
    clicks: 3140,
    leads: 22,
    watchTime: "—",
    saves: 980,
    shares: 510,
    ctr: 4.2,
    platform: "Instagram",
    duration: "8 slides",
    sparkline: [62, 67, 72, 76, 79, 83, 85],
  },
  {
    id: 9,
    name: "Luxury Venue Showcase",
    type: "Photography",
    label: null,
    labelColor: null,
    gradient: "from-zinc-700 via-slate-600 to-zinc-500",
    accentColor: "#94a3b8",
    engagementScore: 68,
    clicks: 1560,
    leads: 9,
    watchTime: "—",
    saves: 480,
    shares: 190,
    ctr: 2.6,
    platform: "Google",
    duration: "18 shots",
    sparkline: [48, 51, 55, 59, 62, 65, 68],
  },
];

export const engagementTrends = [
  { date: "Jun 1",  reels: 7.2, weddingVideos: 6.8, carousels: 5.4, photography: 4.1 },
  { date: "Jun 3",  reels: 7.6, weddingVideos: 7.1, carousels: 5.7, photography: 4.3 },
  { date: "Jun 5",  reels: 7.4, weddingVideos: 6.9, carousels: 5.5, photography: 4.0 },
  { date: "Jun 7",  reels: 8.1, weddingVideos: 7.4, carousels: 6.0, photography: 4.5 },
  { date: "Jun 9",  reels: 8.4, weddingVideos: 7.8, carousels: 6.3, photography: 4.8 },
  { date: "Jun 11", reels: 8.0, weddingVideos: 7.5, carousels: 6.1, photography: 4.6 },
  { date: "Jun 13", reels: 8.8, weddingVideos: 8.1, carousels: 6.6, photography: 5.0 },
  { date: "Jun 15", reels: 9.2, weddingVideos: 8.5, carousels: 7.0, photography: 5.3 },
  { date: "Jun 17", reels: 8.9, weddingVideos: 8.2, carousels: 6.8, photography: 5.1 },
  { date: "Jun 19", reels: 9.4, weddingVideos: 8.8, carousels: 7.2, photography: 5.5 },
];

export const watchTimeRetention = [
  { pct: 0,   golden: 100, mandap: 100, destination: 100, bts: 100 },
  { pct: 10,  golden: 92,  mandap: 88,  destination: 91,  bts: 85 },
  { pct: 20,  golden: 86,  mandap: 82,  destination: 85,  bts: 78 },
  { pct: 30,  golden: 80,  mandap: 76,  destination: 79,  bts: 71 },
  { pct: 40,  golden: 74,  mandap: 70,  destination: 74,  bts: 65 },
  { pct: 50,  golden: 68,  mandap: 64,  destination: 68,  bts: 60 },
  { pct: 60,  golden: 62,  mandap: 59,  destination: 63,  bts: 55 },
  { pct: 70,  golden: 56,  mandap: 54,  destination: 58,  bts: 48 },
  { pct: 80,  golden: 50,  mandap: 49,  destination: 52,  bts: 40 },
  { pct: 90,  golden: 44,  mandap: 44,  destination: 47,  bts: 32 },
  { pct: 100, golden: 38,  mandap: 39,  destination: 42,  bts: 25 },
];

export const platformCreativePerf = [
  { platform: "Instagram", reels: 94, weddingVideos: 72, carousels: 68, photography: 55 },
  { platform: "Facebook",  reels: 71, weddingVideos: 88, carousels: 60, photography: 62 },
  { platform: "YouTube",   reels: 58, weddingVideos: 84, carousels: 40, photography: 38 },
  { platform: "Google",    reels: 42, weddingVideos: 46, carousels: 55, photography: 70 },
];

export const aiCreativeInsights = [
  {
    icon: "Film",
    title: "Cinematic edit style outperforms cuts by 2.4×",
    body: "Slow-motion transitions and colour-graded golden tones generate 2.4× more saves than fast-cut edits. Reels under 45s with this style average ₹312 CPL.",
    urgency: "positive",
    metric: "+2.4× saves",
    action: "Use for next reel",
  },
  {
    icon: "Heart",
    title: "Haldi & Mandap themes drive highest lead quality",
    body: "Wedding ceremony content (Haldi, Mandap, Reception entrance) generates a 68% lead qualification rate — vs 30% for portrait content alone.",
    urgency: "positive",
    metric: "68% qual rate",
    action: "Plan 3 shoots",
  },
  {
    icon: "Image",
    title: "Warm-tone couple thumbnails convert 31% better",
    body: "Thumbnails featuring a close couple shot in warm golden light have a 5.4% CTR vs 4.1% average. Avoid busy backgrounds — clean bokeh wins.",
    urgency: "info",
    metric: "+31% CTR",
    action: "Redesign 3 thumbs",
  },
  {
    icon: "Clock",
    title: "30–45s is your sweet spot for Reels",
    body: "Reels between 30–45s retain 38% of viewers to the end — twice the rate of 60–90s reels. Attention drops sharply after 48s on Instagram.",
    urgency: "info",
    metric: "38% completion",
    action: "Trim existing content",
  },
  {
    icon: "Zap",
    title: "First 3 seconds determine 80% of engagement",
    body: "Your top 3 reels all open with motion in the first frame. Static openers lose 62% of viewers before the hook. Start with the bride or couple already in motion.",
    urgency: "warning",
    metric: "3s hook rule",
    action: "Review all openers",
  },
];

// ─── Campaign Intel page data ─────────────────────────────────────────────────

export const campaignIntelKpis = {
  activeCampaigns: { value: 8,     change: +2,    sparkline: [4, 5, 6, 6, 7, 7, 8] },
  totalSpend:      { value: 48200, change: +12.4,  sparkline: [32000, 35000, 38000, 36000, 41000, 44000, 48200] },
  roas:            { value: 3.8,   change: +0.6,   sparkline: [2.9, 3.1, 3.2, 3.3, 3.5, 3.7, 3.8] },
  totalLeads:      { value: 124,   change: +18.3,  sparkline: [84, 90, 97, 104, 110, 118, 124] },
  avgCpl:          { value: 387,   change: -6.2,   sparkline: [420, 415, 408, 402, 395, 391, 387] },
  bestCampaign:    { name: "Wedding Gold — Reel", platform: "Instagram", roas: 5.1, leads: 38 },
};

export const campaignTableData = [
  { id: 1, name: "Wedding Gold — Reel",        platform: "Instagram", objective: "Lead Gen",    spend: 12400, ctr: 5.4, cpl: 326, leads: 38, roas: 5.1, status: "scaling" },
  { id: 2, name: "Couple Story — Video",        platform: "Facebook",  objective: "Conversions", spend: 8900,  ctr: 4.2, cpl: 370, leads: 24, roas: 4.2, status: "active"  },
  { id: 3, name: "Portrait Series — Carousel",  platform: "Instagram", objective: "Engagement",  spend: 6200,  ctr: 3.8, cpl: 344, leads: 18, roas: 3.9, status: "active"  },
  { id: 4, name: "Destination Wedding",         platform: "Google",    objective: "Search",      spend: 9800,  ctr: 3.1, cpl: 445, leads: 22, roas: 3.2, status: "warning" },
  { id: 5, name: "Pre-Wedding BTS — Reel",      platform: "YouTube",   objective: "Awareness",   spend: 5400,  ctr: 2.9, cpl: 450, leads: 12, roas: 2.8, status: "paused"  },
  { id: 6, name: "Wedding Planner Retarget",    platform: "Facebook",  objective: "Retargeting", spend: 3200,  ctr: 6.1, cpl: 290, leads: 11, roas: 4.8, status: "active"  },
  { id: 7, name: "Luxury Album Promo",          platform: "Instagram", objective: "Lead Gen",    spend: 1800,  ctr: 2.2, cpl: 512, leads: 4,  roas: 1.9, status: "fatigue" },
  { id: 8, name: "Engaged Couples — Search",    platform: "Google",    objective: "Search",      spend: 4200,  ctr: 4.8, cpl: 350, leads: 12, roas: 3.6, status: "active"  },
];

export const campaignHeatmapData = [
  { day: "Mon", slots: [12, 18, 24, 32, 28, 41, 38, 22] },
  { day: "Tue", slots: [10, 15, 28, 35, 30, 44, 40, 25] },
  { day: "Wed", slots: [14, 20, 30, 38, 35, 48, 42, 28] },
  { day: "Thu", slots: [18, 25, 35, 45, 42, 58, 52, 35] },
  { day: "Fri", slots: [22, 30, 40, 52, 62, 78, 72, 48] },
  { day: "Sat", slots: [35, 42, 55, 68, 82, 94, 88, 60] },
  { day: "Sun", slots: [30, 38, 50, 62, 75, 88, 80, 55] },
];
export const heatmapTimeSlots = ["9–11am", "11am–1pm", "1–3pm", "3–5pm", "5–7pm", "7–9pm", "9–11pm", "11pm+"];

export const aiCampaignAlerts = [
  { type: "fatigue",  urgency: "warning",  icon: "AlertTriangle", title: "Campaign Fatigue Detected",  campaign: "Luxury Album Promo",       body: "Frequency at 4.8× — creative fatigue causing CPL to spike 32%. Refresh creative assets immediately.", action: "Refresh Creative", metric: "Freq 4.8×",  metricColor: "text-yellow-400" },
  { type: "budget",   urgency: "warning",  icon: "DollarSign",    title: "Budget Inefficiency",         campaign: "Pre-Wedding BTS — Reel",   body: "YouTube spending ₹5,400 with 2.8× ROAS — 26% below portfolio average. Reallocate to Instagram.",    action: "Reallocate",     metric: "ROAS 2.8×",  metricColor: "text-red-400"    },
  { type: "audience", urgency: "info",     icon: "Users",         title: "Underperforming Audience",    campaign: "Destination Wedding",      body: "Male 45–54 segment has 0.8% CTR vs 3.8% avg. Narrow targeting to 25–35 female wedding planners.",   action: "Adjust Audience",metric: "CTR 0.8%",   metricColor: "text-blue-400"   },
  { type: "scale",    urgency: "positive", icon: "TrendingUp",    title: "Prime Scaling Opportunity",   campaign: "Wedding Gold — Reel",      body: "ROAS 5.1× with frequency only 1.8×. Large untapped audience — safe to double daily budget now.",      action: "Scale Now",      metric: "ROAS 5.1×",  metricColor: "text-green-400"  },
  { type: "scale",    urgency: "positive", icon: "Zap",           title: "Retargeting Win",             campaign: "Wedding Planner Retarget", body: "Retargeting at ₹290 CPL — 25% below target. Warm audience responding well, expand the pool.",         action: "Expand Audience",metric: "CPL ₹290",   metricColor: "text-purple-400" },
  { type: "budget",   urgency: "info",     icon: "BarChart2",     title: "Cross-Platform Rebalance",    campaign: "All Campaigns",            body: "Instagram outperforms Facebook by 38% on ROAS. Shift 15% of Facebook budget to Instagram Reels.",     action: "Rebalance",      metric: "+38% ROAS",  metricColor: "text-blue-400"   },
];

export const campaignTimelineEvents = [
  { date: "May 1",  type: "launch",       title: "Wedding Gold Reel Launched",  description: "Initial budget ₹800/day · Instagram",              color: "#a855f7" },
  { date: "May 8",  type: "budget",       title: "Budget Increased +50%",       description: "Wedding Gold budget → ₹1,200/day after ROAS 4.8×", color: "#22c55e" },
  { date: "May 12", type: "spike",        title: "Performance Spike +42%",      description: "Weekend surge · 18 leads in 3 days",               color: "#38bdf8" },
  { date: "May 18", type: "launch",       title: "Portrait Carousel Launched",  description: "Initial budget ₹600/day · Instagram",              color: "#a855f7" },
  { date: "May 22", type: "optimization", title: "Audience Narrowed",           description: "Removed male 45+ segment · CPL dropped 12%",       color: "#f97316" },
  { date: "May 28", type: "warning",      title: "Destination Wedding Flagged", description: "CPL crossed ₹440 threshold · under review",        color: "#f59e0b" },
  { date: "Jun 1",  type: "launch",       title: "Retargeting Campaign Live",   description: "Warm audience · Facebook + Instagram",             color: "#a855f7" },
  { date: "Jun 5",  type: "spike",        title: "All-Time Best Day",           description: "28 leads · ₹310 blended CPL",                      color: "#38bdf8" },
  { date: "Jun 8",  type: "optimization", title: "Budget Rebalanced",           description: "₹2,000 moved from YouTube → Instagram",            color: "#f97316" },
];

export const audienceIntelData = {
  demographics: [
    { label: "25–34 Female", value: 38, color: "#a855f7" },
    { label: "35–44 Female", value: 22, color: "#6366f1" },
    { label: "25–34 Male",   value: 18, color: "#38bdf8" },
    { label: "35–44 Male",   value: 12, color: "#22c55e" },
    { label: "18–24",        value: 10, color: "#f97316" },
  ],
  locations: [
    { city: "Mumbai",    leads: 42, cpl: 310, quality: 88 },
    { city: "Delhi",     leads: 28, cpl: 352, quality: 76 },
    { city: "Bangalore", leads: 22, cpl: 328, quality: 82 },
    { city: "Hyderabad", leads: 15, cpl: 398, quality: 71 },
    { city: "Chennai",   leads: 11, cpl: 415, quality: 68 },
    { city: "Pune",      leads: 9,  cpl: 340, quality: 79 },
  ],
  devices: [
    { name: "Mobile",  value: 74, cpl: 362, roas: 3.9, color: "#a855f7" },
    { name: "Desktop", value: 19, cpl: 340, roas: 4.2, color: "#6366f1" },
    { name: "Tablet",  value: 7,  cpl: 410, roas: 3.1, color: "#38bdf8" },
  ],
  conversionQuality: [
    { segment: "25–34 Female Wedding Planning", leads: 47, qualified: 32, booked: 14, cpl: 312, roas: 5.8 },
    { segment: "Engaged Couples 25–30",         leads: 38, qualified: 25, booked: 10, cpl: 328, roas: 5.2 },
    { segment: "Luxury Event Planners",         leads: 22, qualified: 18, booked: 9,  cpl: 358, roas: 6.1 },
    { segment: "General Wedding Interest",      leads: 62, qualified: 28, booked: 8,  cpl: 445, roas: 3.2 },
  ],
};

export const budgetAllocationData = {
  byPlatform: [
    { name: "Instagram", value: 20400, pct: 42, color: "#a855f7", roas: 4.8 },
    { name: "Facebook",  value: 14500, pct: 30, color: "#6366f1", roas: 3.9 },
    { name: "Google",    value: 10200, pct: 21, color: "#38bdf8", roas: 3.4 },
    { name: "YouTube",   value: 3400,  pct: 7,  color: "#f97316", roas: 2.8 },
  ] as { name: string; value: number; pct: number; color: string; roas?: number }[],
  byCampaign: [
    { name: "Wedding Gold",        value: 12400, pct: 26, color: "#a855f7" },
    { name: "Destination Wedding", value: 9800,  pct: 20, color: "#6366f1" },
    { name: "Couple Story",        value: 8900,  pct: 18, color: "#38bdf8" },
    { name: "Portrait Series",     value: 6200,  pct: 13, color: "#22c55e" },
    { name: "BTS Reel",            value: 5400,  pct: 11, color: "#f97316" },
    { name: "Engaged Search",      value: 4200,  pct: 9,  color: "#f59e0b" },
    { name: "Others",              value: 1500,  pct: 3,  color: "#3f3f46" },
  ] as { name: string; value: number; pct: number; color: string; roas?: number }[],
  byAudience: [
    { name: "25–34 Female",  value: 18200, pct: 38, color: "#a855f7" },
    { name: "35–44 Female",  value: 10600, pct: 22, color: "#6366f1" },
    { name: "25–34 Male",    value: 9600,  pct: 20, color: "#38bdf8" },
    { name: "Retargeting",   value: 5800,  pct: 12, color: "#22c55e" },
    { name: "Lookalike",     value: 3900,  pct: 8,  color: "#f97316" },
  ] as { name: string; value: number; pct: number; color: string; roas?: number }[],
};

// ── Performance Reports Mock Data ──

export const reportSpendTrendData = [
  { month: "Jan", spend: 32000, budget: 35000 },
  { month: "Feb", spend: 36400, budget: 38000 },
  { month: "Mar", spend: 41200, budget: 42000 },
  { month: "Apr", spend: 38800, budget: 40000 },
  { month: "May", spend: 44600, budget: 46000 },
  { month: "Jun", spend: 48200, budget: 50000 },
];

export const reportLeadGrowthData = [
  { month: "Jan", leads: 68,  target: 75  },
  { month: "Feb", leads: 82,  target: 80  },
  { month: "Mar", leads: 97,  target: 90  },
  { month: "Apr", leads: 89,  target: 95  },
  { month: "May", leads: 110, target: 100 },
  { month: "Jun", leads: 124, target: 110 },
];

export const reportPlatformData = [
  { platform: "Instagram", spend: 21200, leads: 58, cpl: 365, roas: 4.8 },
  { platform: "Facebook",  spend: 12800, leads: 32, cpl: 400, roas: 3.6 },
  { platform: "Google",    spend: 9800,  leads: 24, cpl: 408, roas: 3.2 },
  { platform: "YouTube",   spend: 4400,  leads: 10, cpl: 440, roas: 2.6 },
];

export const reportCampaignData = [
  { name: "Wedding Season 2026", platform: "Instagram", spend: 18400, leads: 52, cpl: 354, roas: 5.2, status: "active" },
  { name: "Summer Portraits",    platform: "Facebook",  spend: 9200,  leads: 28, cpl: 329, roas: 4.1, status: "active" },
  { name: "Pre-Wedding Package", platform: "Google",    spend: 7600,  leads: 22, cpl: 345, roas: 3.8, status: "active" },
  { name: "Maternity Series",    platform: "Instagram", spend: 6400,  leads: 16, cpl: 400, roas: 3.2, status: "paused" },
  { name: "Corporate Events",    platform: "LinkedIn",  spend: 4200,  leads: 8,  cpl: 525, roas: 2.4, status: "active" },
  { name: "Destination Wedding", platform: "YouTube",   spend: 2600,  leads: 6,  cpl: 433, roas: 2.8, status: "ended"  },
];

export const reportCreativeData = [
  { name: "Wedding Gold — Reel",      type: "Video",    platform: "Instagram", impressions: 148000, ctr: 5.4, leads: 38, cpl: 326, score: 94 },
  { name: "Couple Story — Video",     type: "Video",    platform: "Facebook",  impressions: 92000,  ctr: 4.2, leads: 24, cpl: 370, score: 82 },
  { name: "Portrait Series — Carousel", type: "Carousel", platform: "Instagram", impressions: 76000, ctr: 3.8, leads: 18, cpl: 344, score: 78 },
  { name: "Destination Wedding",      type: "Static",   platform: "Google",    impressions: 124000, ctr: 3.1, leads: 22, cpl: 445, score: 71 },
  { name: "Pre-Wedding BTS — Reel",   type: "Video",    platform: "YouTube",   impressions: 68000,  ctr: 2.9, leads: 12, cpl: 450, score: 65 },
  { name: "Studio Portrait — Static", type: "Static",   platform: "Instagram", impressions: 54000,  ctr: 2.6, leads: 9,  cpl: 489, score: 58 },
];

export const reportAISummaries = {
  executive: "Instagram Reels generated 42% lower CPL compared to static creatives this month. Campaign spend efficiency improved by 12.4% month-over-month, with Wedding Season 2026 delivering ₹5.20 ROAS — the highest across all active campaigns. Lead volume grew 18.3% to 124 qualified leads, with strongest momentum in the final two weeks of June.",
  platform:  "Instagram dominates with 52% spend share and 4.8× ROAS, significantly outperforming the portfolio average of 3.8×. Facebook maintains steady efficiency at 3.6× ROAS with 32 leads. Google underperforms in volume but shows strong search-intent quality. Recommend increasing Instagram budget by 20% and testing Google Performance Max for scale.",
  creative:  "Video formats outperform static creatives by 42% on CPL and 38% on CTR. Reels (short-form vertical video) lead all formats at 5.4% CTR and ₹326 CPL. Carousel creatives deliver 18% better engagement than static images. Recommend increasing Reel production cadence to 3–4 per week to capitalise on the format's efficiency advantage.",
  campaign:  "Wedding Season 2026 is the top-performing campaign at ₹5.20 ROAS with 52 leads this month. Summer Portraits shows the best CPL at ₹329. Corporate Events underperforms at 2.4× ROAS and should be reviewed for targeting refinement or budget reallocation toward higher-performing wedding verticals.",
};

export const predictiveInsightsData = [
  {
    title: "ROAS Forecast", current: 3.8,  projected: 4.5,  unit: "×", prefix: "",  confidence: 84, horizon: "30 days", trend: "up",   color: "#a855f7",
    sparkline: [3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.5],
    insight: "Budget reallocation from YouTube to Instagram will push ROAS to 4.5× within 30 days.",
  },
  {
    title: "Lead Volume",   current: 124,  projected: 162,  unit: "",  prefix: "",  confidence: 79, horizon: "30 days", trend: "up",   color: "#22c55e",
    sparkline: [124, 130, 136, 142, 149, 156, 162],
    insight: "Scaling Wedding Gold + retargeting expansion projected to deliver 162 leads/month.",
  },
  {
    title: "Avg. CPL",      current: 387,  projected: 338,  unit: "",  prefix: "₹", confidence: 76, horizon: "21 days", trend: "down", color: "#38bdf8",
    sparkline: [387, 380, 372, 364, 355, 346, 338],
    insight: "Pausing Destination Wedding + audience narrowing will bring CPL to ₹338 in 3 weeks.",
  },
  {
    title: "Spend Efficiency", current: 68, projected: 82, unit: "%", prefix: "",  confidence: 81, horizon: "30 days", trend: "up",   color: "#f97316",
    sparkline: [68, 70, 73, 75, 77, 80, 82],
    insight: "Budget rebalancing and audience pruning will improve overall spend efficiency to 82%.",
  },
];
