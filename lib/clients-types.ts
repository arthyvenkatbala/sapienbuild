export interface Client {
  id:                     string;
  business_name:          string;
  owner_name:             string;
  email:                  string;
  phone:                  string;
  website_url:            string | null;
  meta_ad_account_id:     string | null;
  meta_user_id:           string | null;
  google_customer_id:     string | null;
  google_ads_account_name:string | null;
  connected_platforms:    string[];
  last_synced_at:         string | null;
  created_at:             string;
  updated_at:             string;
  // tokens are never returned to the frontend
}

export interface DbLead {
  id:         string;
  client_id:  string;
  clientname: string;
  phone:      string;
  email:      string;
  source:     string;
  eventtype:  string | null;
  campaign:   string | null;
  status:     string;
  created_at: string;
}

export interface AdMetric {
  id:          string;
  client_id:   string;
  platform:    "meta" | "google";
  date:        string;
  spend:       number;
  clicks:      number;
  impressions: number;
  ctr:         number;
  leads:       number;
  cpl:         number;
  roas:        number;
  synced_at:   string;
}

export interface ClientWithMetrics extends Client {
  recent_metrics: AdMetric[];
}

export interface SyncResult {
  platform:   "meta" | "google";
  days_synced: number;
  total_spend: number;
  error?:     string;
}
