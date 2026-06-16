"use client";

import type { MetaCampaign } from "@/lib/marketing-insights";

function inr(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function CampaignRow({
  campaign,
  mode,
}: {
  campaign: MetaCampaign;
  mode: "lead" | "awareness";
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm text-white/90 font-medium truncate">{campaign.name}</span>
        <span className="text-xs text-zinc-500">Spend: {inr(campaign.spend)}</span>
      </div>
      {mode === "lead" ? (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-sm font-semibold text-green-400">{inr(campaign.cpl)}</span>
          <span className="text-xs text-zinc-500">{campaign.leads} leads</span>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-sm font-semibold text-blue-400">{campaign.ctr.toFixed(2)}%</span>
          <span className="text-xs text-zinc-500">CTR</span>
        </div>
      )}
    </div>
  );
}

function UnderperformRow({ campaign }: { campaign: MetaCampaign }) {
  const flags: string[] = [];
  if (campaign.ctr < 0.3) flags.push(`CTR ${campaign.ctr.toFixed(2)}%`);
  if (campaign.spend > 5000 && campaign.leads === 0 && campaign.clicks === 0)
    flags.push("Zero results");

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-white/90 font-medium truncate">{campaign.name}</span>
        <div className="flex flex-wrap gap-1">
          {flags.map((f) => (
            <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-sm font-semibold text-red-400">{inr(campaign.spend)}</span>
        <span className="text-xs text-zinc-500">spent</span>
      </div>
    </div>
  );
}

export default function CampaignSection({
  topLeadCampaigns,
  topAwarenessCampaigns,
  underperformingCampaigns,
}: {
  topLeadCampaigns: MetaCampaign[];
  topAwarenessCampaigns: MetaCampaign[];
  underperformingCampaigns: MetaCampaign[];
}) {
  const hasTop = topLeadCampaigns.length > 0 || topAwarenessCampaigns.length > 0;
  const hasUnder = underperformingCampaigns.length > 0;

  if (!hasTop && !hasUnder) return null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top performers */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wide">
          Top Performing Campaigns
        </h2>
        {topLeadCampaigns.length > 0 && (
          <>
            <p className="text-[11px] text-zinc-600 mb-2">Lead campaigns — lowest CPL</p>
            {topLeadCampaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} mode="lead" />
            ))}
          </>
        )}
        {topAwarenessCampaigns.length > 0 && (
          <>
            <p className="text-[11px] text-zinc-600 mt-3 mb-2">Awareness campaigns — highest CTR</p>
            {topAwarenessCampaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} mode="awareness" />
            ))}
          </>
        )}
        {!hasTop && (
          <p className="text-sm text-zinc-600 mt-2">No active campaign data for this period.</p>
        )}
      </div>

      {/* Underperformers */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wide">
          Needs Attention
        </h2>
        <p className="text-[11px] text-zinc-600 mb-2">
          High CPL, low CTR, or zero results
        </p>
        {hasUnder ? (
          underperformingCampaigns.map((c) => (
            <UnderperformRow key={c.id} campaign={c} />
          ))
        ) : (
          <p className="text-sm text-zinc-500 mt-2">All active campaigns are performing within thresholds.</p>
        )}
      </div>
    </section>
  );
}
