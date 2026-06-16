// Thresholds — edit these constants to tune all analysis rules
export const CPL_GOOD = 1500;         // ₹ CPL at or below = Good
export const CPL_WATCH = 3000;        // ₹ CPL between GOOD and WATCH = Watch
export const CTR_GOOD = 1.5;          // % CTR at or above = Good
export const CTR_UNDERPERFORM = 0.3;  // % CTR below this = underperforming flag
export const GSC_POS_GOOD = 10;       // avg position ≤ 10 = first page = Good
export const GSC_POS_WATCH = 20;      // avg position ≤ 20 = second page = Watch
export const TREND_ALERT_PCT = 20;    // % change between periods triggers alert
export const SPEND_ZERO_THRESHOLD = 5000; // ₹ spend with 0 results = immediate flag
export const GMB_VIEWS_GOOD = 1000;   // profile views/30d = Good
export const GMB_VIEWS_WATCH = 200;   // profile views/30d = Watch

// ── Input types ──────────────────────────────────────────────────────────────

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  cpl: number;
}

export interface PlatformData {
  meta: {
    connected: boolean;
    totalSpend: number;
    impressions: number;
    clicks: number;
    leads: number;
    campaigns: MetaCampaign[];
  };
  gsc: {
    connected: boolean;
    clicks: number;
    impressions: number;
    rows: Array<{ date: string; clicks: number; impressions: number }>;
    queries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      position: number;
      ctr: number;
    }>;
  };
  gmb: {
    connected: boolean;
    profileViews: number;
    directionRequests: number;
    calls: number;
    websiteClicks: number;
  };
}

// ── Output types ─────────────────────────────────────────────────────────────

export interface HealthScore {
  platform: string;
  score: number;
  status: "Good" | "Watch" | "Action Needed";
  connected: boolean;
  primaryMetric: string;
  primaryValue: string;
}

export interface TrendAlert {
  platform: string;
  metric: string;
  changePct: number;
  direction: "up" | "down";
  period1Label: string;
  period2Label: string;
  period1Value: number;
  period2Value: number;
}

export interface Recommendation {
  priority: "HIGH" | "MEDIUM" | "LOW";
  rule: string;
  title: string;
  description: string;
  platform: string;
}

export interface SpendBreakdown {
  platform: string;
  spend: number;
  leads: number;
  efficiency: number | null;
}

export interface SpendSummary {
  total: number;
  breakdown: SpendBreakdown[];
}

export interface InsightsReport {
  generatedAt: string;
  healthScores: HealthScore[];
  topLeadCampaigns: MetaCampaign[];
  topAwarenessCampaigns: MetaCampaign[];
  underperformingCampaigns: MetaCampaign[];
  trendAlerts: TrendAlert[];
  recommendations: Recommendation[];
  spendSummary: SpendSummary;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function inr(amount: number): string {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function scoreToStatus(score: number): "Good" | "Watch" | "Action Needed" {
  if (score >= 75) return "Good";
  if (score >= 50) return "Watch";
  return "Action Needed";
}

// ── Pure analysis function ────────────────────────────────────────────────────

export function generateInsights(data: PlatformData): InsightsReport {
  // ── A. Platform Health Scores ──────────────────────────────────────────────
  const healthScores: HealthScore[] = [];

  // Meta Ads health
  if (!data.meta.connected) {
    healthScores.push({
      platform: "Meta Ads",
      score: 0,
      status: "Action Needed",
      connected: false,
      primaryMetric: "CPL",
      primaryValue: "—",
    });
  } else {
    const { totalSpend, leads, clicks, impressions } = data.meta;
    const avgCPL = leads > 0 ? totalSpend / leads : null;
    const avgCTR = impressions > 0 ? (clicks / impressions) * 100 : null;

    let cplScore = 40;
    if (avgCPL !== null) {
      if (avgCPL <= CPL_GOOD) cplScore = 90;
      else if (avgCPL <= CPL_WATCH) cplScore = 65;
      else cplScore = 30;
    }

    let ctrScore = 40;
    if (avgCTR !== null) {
      if (avgCTR >= CTR_GOOD) ctrScore = 90;
      else if (avgCTR >= 0.5) ctrScore = 65;
      else ctrScore = 30;
    }

    const score = Math.round(0.6 * cplScore + 0.4 * ctrScore);
    healthScores.push({
      platform: "Meta Ads",
      score,
      status: scoreToStatus(score),
      connected: true,
      primaryMetric: "Avg CPL",
      primaryValue: avgCPL !== null ? inr(avgCPL) : "No leads",
    });
  }

  // GSC health
  if (!data.gsc.connected) {
    healthScores.push({
      platform: "Google Search Console",
      score: 0,
      status: "Action Needed",
      connected: false,
      primaryMetric: "Avg Position",
      primaryValue: "—",
    });
  } else if (data.gsc.queries.length === 0) {
    healthScores.push({
      platform: "Google Search Console",
      score: 40,
      status: "Watch",
      connected: true,
      primaryMetric: "Avg Position",
      primaryValue: "No data",
    });
  } else {
    const totalImp = data.gsc.queries.reduce((s, q) => s + q.impressions, 0);
    const avgPosition =
      totalImp > 0
        ? data.gsc.queries.reduce((s, q) => s + q.position * q.impressions, 0) / totalImp
        : data.gsc.queries.reduce((s, q) => s + q.position, 0) / data.gsc.queries.length;

    let score: number;
    if (avgPosition <= GSC_POS_GOOD) score = 85;
    else if (avgPosition <= GSC_POS_WATCH) score = 60;
    else score = 30;

    healthScores.push({
      platform: "Google Search Console",
      score,
      status: scoreToStatus(score),
      connected: true,
      primaryMetric: "Avg Position",
      primaryValue: avgPosition.toFixed(1),
    });
  }

  // GMB health
  if (!data.gmb.connected) {
    healthScores.push({
      platform: "Google My Business",
      score: 0,
      status: "Action Needed",
      connected: false,
      primaryMetric: "Profile Views",
      primaryValue: "—",
    });
  } else {
    const { profileViews } = data.gmb;
    let score: number;
    if (profileViews >= GMB_VIEWS_GOOD) score = 85;
    else if (profileViews >= GMB_VIEWS_WATCH) score = 60;
    else score = 35;

    healthScores.push({
      platform: "Google My Business",
      score,
      status: scoreToStatus(score),
      connected: true,
      primaryMetric: "Profile Views",
      primaryValue: profileViews.toLocaleString("en-IN"),
    });
  }

  // ── B. Top Performing Campaigns ──────────────────────────────────────────
  const activeCampaigns = data.meta.campaigns.filter((c) => c.spend > 0);
  const leadCampaigns = activeCampaigns.filter((c) => c.leads > 0);
  const awarenessCampaigns = activeCampaigns.filter((c) => c.leads === 0);

  const topLeadCampaigns = [...leadCampaigns]
    .sort((a, b) => a.cpl - b.cpl)
    .slice(0, 3);

  const topAwarenessCampaigns = [...awarenessCampaigns]
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 3);

  // ── C. Underperforming Campaigns ─────────────────────────────────────────
  const avgLeadCPL =
    leadCampaigns.length > 0
      ? leadCampaigns.reduce((s, c) => s + c.cpl, 0) / leadCampaigns.length
      : null;

  const underperformingCampaigns = activeCampaigns.filter((c) => {
    const highCPL = avgLeadCPL !== null && c.leads > 0 && c.cpl > avgLeadCPL * 2;
    const lowCTR = c.ctr < CTR_UNDERPERFORM;
    const zeroResults = c.spend > SPEND_ZERO_THRESHOLD && c.leads === 0 && c.clicks === 0;
    return highCPL || lowCTR || zeroResults;
  });

  // ── D. Trend Alerts (GSC only — daily row data available) ────────────────
  const trendAlerts: TrendAlert[] = [];

  if (data.gsc.connected && data.gsc.rows.length >= 4) {
    const sorted = [...data.gsc.rows].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const mid = Math.floor(sorted.length / 2);
    const period1 = sorted.slice(0, mid);
    const period2 = sorted.slice(mid);

    const p1Label = `${period1[0].date} – ${period1[period1.length - 1].date}`;
    const p2Label = `${period2[0].date} – ${period2[period2.length - 1].date}`;

    const p1Clicks = period1.reduce((s, r) => s + r.clicks, 0);
    const p2Clicks = period2.reduce((s, r) => s + r.clicks, 0);
    const p1Impressions = period1.reduce((s, r) => s + r.impressions, 0);
    const p2Impressions = period2.reduce((s, r) => s + r.impressions, 0);

    if (p1Clicks > 0) {
      const changePct = ((p2Clicks - p1Clicks) / p1Clicks) * 100;
      if (Math.abs(changePct) >= TREND_ALERT_PCT) {
        trendAlerts.push({
          platform: "GSC",
          metric: "Organic Clicks",
          changePct: Math.round(changePct),
          direction: changePct > 0 ? "up" : "down",
          period1Label: p1Label,
          period2Label: p2Label,
          period1Value: p1Clicks,
          period2Value: p2Clicks,
        });
      }
    }

    if (p1Impressions > 0) {
      const changePct = ((p2Impressions - p1Impressions) / p1Impressions) * 100;
      if (Math.abs(changePct) >= TREND_ALERT_PCT) {
        trendAlerts.push({
          platform: "GSC",
          metric: "Impressions",
          changePct: Math.round(changePct),
          direction: changePct > 0 ? "up" : "down",
          period1Label: p1Label,
          period2Label: p2Label,
          period1Value: p1Impressions,
          period2Value: p2Impressions,
        });
      }
    }
  }

  // ── E. Optimization Recommendations (up to 5, priority-ordered) ──────────
  const recs: Recommendation[] = [];

  // HIGH: zero-engagement spend
  const zeroResultCampaigns = activeCampaigns.filter(
    (c) => c.spend > SPEND_ZERO_THRESHOLD && c.leads === 0 && c.clicks === 0
  );
  if (zeroResultCampaigns.length > 0) {
    recs.push({
      priority: "HIGH",
      rule: "ZERO_ENGAGEMENT",
      platform: "Meta Ads",
      title: `Pause ${zeroResultCampaigns.length} zero-engagement campaign${zeroResultCampaigns.length > 1 ? "s" : ""}`,
      description: `${zeroResultCampaigns.map((c) => c.name).join(", ")} ${zeroResultCampaigns.length === 1 ? "has" : "have"} spent over ${inr(SPEND_ZERO_THRESHOLD)} with zero clicks or leads. Pause and review creative/targeting immediately.`,
    });
  }

  // HIGH: CPL above watch threshold
  const highCPLCampaigns = leadCampaigns.filter((c) => c.cpl > CPL_WATCH);
  if (highCPLCampaigns.length > 0 && recs.length < 5) {
    recs.push({
      priority: "HIGH",
      rule: "HIGH_CPL",
      platform: "Meta Ads",
      title: `Optimize ${highCPLCampaigns.length} high-CPL campaign${highCPLCampaigns.length > 1 ? "s" : ""}`,
      description: `CPL exceeds ${inr(CPL_WATCH)} on: ${highCPLCampaigns.map((c) => c.name).join(", ")}. Review audience targeting, ad creative, and landing page conversion rates.`,
    });
  }

  // HIGH: critically low blended CTR
  const metaCTR =
    data.meta.impressions > 0
      ? (data.meta.clicks / data.meta.impressions) * 100
      : null;
  if (metaCTR !== null && metaCTR < 0.5 && recs.length < 5) {
    recs.push({
      priority: "HIGH",
      rule: "LOW_CTR",
      platform: "Meta Ads",
      title: "Refresh ad creative — blended CTR critically low",
      description: `Blended CTR is ${metaCTR.toFixed(2)}%, well below the ${CTR_GOOD}% benchmark. Test new visuals, headlines, and copy — run at least 3 variants per campaign.`,
    });
  }

  // MEDIUM/HIGH: poor GSC position
  if (data.gsc.connected && data.gsc.queries.length > 0 && recs.length < 5) {
    const totalImp = data.gsc.queries.reduce((s, q) => s + q.impressions, 0);
    const avgPos =
      totalImp > 0
        ? data.gsc.queries.reduce((s, q) => s + q.position * q.impressions, 0) / totalImp
        : data.gsc.queries.reduce((s, q) => s + q.position, 0) / data.gsc.queries.length;

    if (avgPos > GSC_POS_WATCH) {
      recs.push({
        priority: "MEDIUM",
        rule: "LOW_GSC_POSITION",
        platform: "Google Search",
        title: "Content strategy needed — search visibility low",
        description: `Average search position is ${avgPos.toFixed(1)}, beyond page 2. Create in-depth content targeting high-impression queries and build topical authority.`,
      });
    } else if (avgPos > GSC_POS_GOOD) {
      recs.push({
        priority: "MEDIUM",
        rule: "WATCH_GSC_POSITION",
        platform: "Google Search",
        title: "Optimize existing content for better rankings",
        description: `Average position ${avgPos.toFixed(1)} places you on page 2. Update top-impression pages with fresh content, internal links, and schema markup.`,
      });
    }
  }

  // LOW: low GMB profile views
  if (
    data.gmb.connected &&
    data.gmb.profileViews < GMB_VIEWS_WATCH &&
    recs.length < 5
  ) {
    recs.push({
      priority: "LOW",
      rule: "LOW_GMB_VIEWS",
      platform: "Google My Business",
      title: "Increase GMB posting frequency",
      description: `Profile views are ${data.gmb.profileViews.toLocaleString("en-IN")} over the last 30 days. Post 3–4 times per week with offers, photos, and updates to improve local visibility.`,
    });
  }

  // Sort HIGH → MEDIUM → LOW
  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const recommendations = recs
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 5);

  // ── F. Spend Summary ──────────────────────────────────────────────────────
  const spendSummary: SpendSummary = {
    total: data.meta.totalSpend,
    breakdown: [
      {
        platform: "Meta Ads",
        spend: data.meta.totalSpend,
        leads: data.meta.leads,
        efficiency:
          data.meta.leads > 0
            ? Math.round(data.meta.totalSpend / data.meta.leads)
            : null,
      },
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    healthScores,
    topLeadCampaigns,
    topAwarenessCampaigns,
    underperformingCampaigns,
    trendAlerts,
    recommendations,
    spendSummary,
  };
}
