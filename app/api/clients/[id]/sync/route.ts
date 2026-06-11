import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";
import type { SyncResult } from "@/lib/clients-types";

const GOOGLE_CLIENT_ID     = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_DEV_TOKEN     = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";
const META_GRAPH           = "https://graph.facebook.com/v21.0";

type Params = { params: Promise<{ id: string }> };

interface ClientRow {
  connected_platforms: string[];
  meta_ad_account_id:  string | null;
  meta_access_token:   string | null;
  google_customer_id:  string | null;
  google_refresh_token:string | null;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id: clientId } = await params;

  // Fetch client including tokens (admin client bypasses RLS)
  const { data: rawClient, error: fetchError } = await adminSupabase
    .from("clients")
    .select(
      "id, connected_platforms, meta_ad_account_id, meta_access_token, " +
      "google_customer_id, google_refresh_token"
    )
    .eq("id", clientId)
    .maybeSingle();

  if (fetchError || !rawClient) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = rawClient as any as ClientRow;
  const platforms: string[] = client.connected_platforms ?? [];
  const results: SyncResult[] = [];

  // ── Sync Meta ───────────────────────────────────────────────────────────────
  if (platforms.includes("meta") && client.meta_access_token && client.meta_ad_account_id) {
    const metaResult = await syncMeta(
      clientId,
      client.meta_ad_account_id as string,
      client.meta_access_token as string
    );
    results.push(metaResult);
  }

  // ── Sync Google ─────────────────────────────────────────────────────────────
  if (platforms.includes("google") && client.google_refresh_token && client.google_customer_id) {
    const googleResult = await syncGoogle(
      clientId,
      client.google_customer_id as string,
      client.google_refresh_token as string
    );
    results.push(googleResult);
  }

  // Update last_synced_at on the client record
  await adminSupabase
    .from("clients")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", clientId);

  return NextResponse.json({ results, synced_at: new Date().toISOString() });
}

// ── Meta sync helper ───────────────────────────────────────────────────────────

async function syncMeta(
  clientId: string,
  adAccountId: string,
  accessToken: string
): Promise<SyncResult> {
  try {
    const insightsUrl =
      `${META_GRAPH}/${adAccountId}/insights?` +
      new URLSearchParams({
        fields:         "date_start,spend,clicks,impressions,ctr,actions,action_values",
        date_preset:    "last_30_days",
        time_increment: "1", // daily breakdown
        access_token:   accessToken,
      });

    const res  = await fetch(insightsUrl, { cache: "no-store" });
    const json = await res.json();

    if (json.error) {
      return { platform: "meta", days_synced: 0, total_spend: 0, error: json.error.message };
    }

    const days: Record<string, unknown>[] = json.data ?? [];
    let totalSpend = 0;

    for (const day of days) {
      const spend = parseFloat(String(day.spend ?? 0));
      totalSpend += spend;

      // Extract leads from actions array
      const actions: { action_type: string; value: string }[] = (day.actions as typeof actions) ?? [];
      const leads = actions
        .filter((a) => a.action_type === "lead")
        .reduce((s, a) => s + parseInt(a.value ?? "0", 10), 0);

      const clicks      = parseInt(String(day.clicks ?? 0), 10);
      const impressions = parseInt(String(day.impressions ?? 0), 10);
      const ctr         = parseFloat(String(day.ctr ?? 0));
      const cpl         = leads > 0 ? spend / leads : 0;

      await adminSupabase.from("ad_metrics").upsert(
        {
          client_id:   clientId,
          platform:    "meta",
          date:        day.date_start as string,
          spend,
          clicks,
          impressions,
          ctr,
          leads,
          cpl,
          roas:        0, // requires revenue data — set manually
          raw_data:    day,
          synced_at:   new Date().toISOString(),
        },
        { onConflict: "client_id,platform,date" }
      );
    }

    return { platform: "meta", days_synced: days.length, total_spend: totalSpend };
  } catch (err) {
    return {
      platform:   "meta",
      days_synced: 0,
      total_spend: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Google sync helper ─────────────────────────────────────────────────────────

async function syncGoogle(
  clientId: string,
  customerId: string,
  refreshToken: string
): Promise<SyncResult> {
  if (!GOOGLE_DEV_TOKEN) {
    return {
      platform:   "google",
      days_synced: 0,
      total_spend: 0,
      error: "GOOGLE_ADS_DEVELOPER_TOKEN not configured",
    };
  }

  try {
    // Refresh access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type:    "refresh_token",
      }),
      cache: "no-store",
    });
    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;

    if (!accessToken) {
      return { platform: "google", days_synced: 0, total_spend: 0, error: "Token refresh failed" };
    }

    // Query Google Ads for daily campaign metrics
    const adsRes = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          Authorization:      `Bearer ${accessToken}`,
          "developer-token":  GOOGLE_DEV_TOKEN,
          "login-customer-id": customerId,
          "Content-Type":     "application/json",
        },
        body: JSON.stringify({
          query: `
            SELECT
              segments.date,
              metrics.cost_micros,
              metrics.clicks,
              metrics.impressions,
              metrics.ctr,
              metrics.conversions
            FROM customer
            WHERE segments.date DURING LAST_30_DAYS
            ORDER BY segments.date ASC
          `,
        }),
        cache: "no-store",
      }
    );

    const adsData = await adsRes.json();

    if (adsData.error || !adsData.results) {
      return {
        platform:   "google",
        days_synced: 0,
        total_spend: 0,
        error: adsData.error?.message ?? "No results returned",
      };
    }

    const rows: Record<string, unknown>[] = adsData.results;
    let totalSpend = 0;
    let totalDays  = 0;

    // Aggregate by date (customer-level query returns one row per day)
    const byDate = new Map<string, { spend: number; clicks: number; impressions: number; ctr: number; leads: number }>();

    for (const row of rows) {
      const metrics  = row.metrics as Record<string, number>;
      const segments = row.segments as Record<string, string>;
      const date     = segments.date;
      const spend    = (metrics.costMicros ?? 0) / 1_000_000;
      const prev     = byDate.get(date) ?? { spend: 0, clicks: 0, impressions: 0, ctr: 0, leads: 0 };

      byDate.set(date, {
        spend:       prev.spend       + spend,
        clicks:      prev.clicks      + (metrics.clicks ?? 0),
        impressions: prev.impressions + (metrics.impressions ?? 0),
        ctr:         metrics.ctr ?? prev.ctr, // latest wins
        leads:       prev.leads       + (metrics.conversions ?? 0),
      });
      totalSpend += spend;
    }

    for (const [date, agg] of byDate.entries()) {
      totalDays++;
      const cpl = agg.leads > 0 ? agg.spend / agg.leads : 0;
      await adminSupabase.from("ad_metrics").upsert(
        {
          client_id:   clientId,
          platform:    "google",
          date,
          spend:       agg.spend,
          clicks:      agg.clicks,
          impressions: agg.impressions,
          ctr:         agg.ctr,
          leads:       agg.leads,
          cpl,
          roas:        0,
          raw_data:    { rows: rows.filter((r) => (r.segments as Record<string,string>).date === date) },
          synced_at:   new Date().toISOString(),
        },
        { onConflict: "client_id,platform,date" }
      );
    }

    return { platform: "google", days_synced: totalDays, total_spend: totalSpend };
  } catch (err) {
    return {
      platform:   "google",
      days_synced: 0,
      total_spend: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
