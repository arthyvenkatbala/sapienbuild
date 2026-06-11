"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, AlertCircle, RefreshCw, Save,
  Building2, User, Mail, Phone, Link2, ExternalLink,
  BarChart2, Clock, Unlink,
} from "lucide-react";
import Link from "next/link";
import type { Client, SyncResult } from "@/lib/clients-types";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ type, message, onDismiss }: { type: "success" | "error"; message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", damping: 24, stiffness: 300 }}
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
        type === "success"
          ? "bg-green-500/15 border-green-500/30 text-green-300"
          : "bg-red-500/15 border-red-500/30 text-red-300"
      }`}
    >
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </motion.div>
  );
}

// ── Platform connection card ──────────────────────────────────────────────────
function PlatformCard({
  name,
  platformKey,
  clientId,
  connected,
  accountId,
  accountName,
  onDisconnect,
}: {
  name:       string;
  platformKey:"meta" | "google";
  clientId:   string;
  connected:  boolean;
  accountId:  string | null;
  accountName:string | null;
  onDisconnect: (platform: string) => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);

  const connectUrl =
    platformKey === "meta"
      ? `/api/auth/meta?client_id=${clientId}`
      : `/api/auth/google?client_id=${clientId}`;

  const colorClass =
    platformKey === "meta"
      ? "from-blue-600/20 to-indigo-600/20 border-blue-500/20"
      : "from-green-600/20 to-emerald-600/20 border-green-500/20";

  const badgeClass =
    platformKey === "meta"
      ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
      : "bg-green-500/15 border-green-500/30 text-green-400";

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${name} from this client?`)) return;
    setDisconnecting(true);
    try {
      // Remove platform from connected_platforms
      const res = await fetch(`/api/clients/${clientId}/disconnect`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ platform: platformKey }),
      });
      if (res.ok) onDisconnect(platformKey);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">{name}</p>
          {connected ? (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
              <CheckCircle size={10} />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/[0.07] text-zinc-500">
              Not connected
            </span>
          )}
        </div>
        {platformKey === "meta" ? (
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/25 flex items-center justify-center">
            <span className="text-sm font-black text-blue-400">f</span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/25 flex items-center justify-center">
            <span className="text-sm font-black text-green-400">G</span>
          </div>
        )}
      </div>

      {connected && (accountId || accountName) && (
        <div className="mb-4 bg-black/20 rounded-xl p-3 space-y-1">
          {accountId && (
            <p className="text-[10px] text-zinc-500">
              Account ID: <span className="text-zinc-300 font-mono">{accountId}</span>
            </p>
          )}
          {accountName && (
            <p className="text-[10px] text-zinc-500">
              Name: <span className="text-zinc-300">{accountName}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {connected ? (
          <>
            <a
              href={connectUrl}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
            >
              <Link2 size={11} /> Reconnect
            </a>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
            >
              <Unlink size={11} />
            </button>
          </>
        ) : (
          <a
            href={connectUrl}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              platformKey === "meta"
                ? "bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30"
                : "bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30"
            }`}
          >
            <ExternalLink size={11} /> Connect {name}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Edit field ────────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, icon: Icon, type = "text",
}: {
  label:    string;
  value:    string;
  onChange: (v: string) => void;
  icon:     typeof Building2;
  type?:    string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500/50 transition-all"
      />
    </div>
  );
}

// ── Sync Result display ───────────────────────────────────────────────────────
function SyncResultCard({ result }: { result: SyncResult }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${
      result.error
        ? "bg-red-500/05 border-red-500/20"
        : "bg-green-500/05 border-green-500/20"
    }`}>
      {result.error
        ? <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
        : <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
      }
      <div>
        <p className="text-xs font-semibold text-zinc-200 capitalize">{result.platform}</p>
        {result.error ? (
          <p className="text-[11px] text-red-400 mt-0.5">{result.error}</p>
        ) : (
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {result.days_synced} days synced · ₹{result.total_spend.toFixed(2)} total spend
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [client,   setClient]   = useState<Client | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast,    setToast]    = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [syncing,  setSyncing]  = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  // Editable form state (local copy of client fields)
  const [form, setForm] = useState({ business_name: "", owner_name: "", email: "", phone: "" });

  const dismissToast = useCallback(() => setToast(null), []);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/clients/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      const c: Client = data.client;
      setClient(c);
      setForm({
        business_name: c.business_name,
        owner_name:    c.owner_name,
        email:         c.email,
        phone:         c.phone,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  // Handle OAuth callback query params
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error     = searchParams.get("error");

    if (connected === "meta") {
      setToast({ type: "success", message: "Meta Ads account connected successfully!" });
      fetchClient();
    } else if (connected === "google") {
      setToast({ type: "success", message: "Google Ads account connected successfully!" });
      fetchClient();
    } else if (error) {
      const msgs: Record<string, string> = {
        access_denied:        "Authorization denied — please try again",
        token_exchange_failed:"Token exchange failed — check your app credentials",
        db_error:             "Database error — could not save the connection",
        csrf_failed:          "Security check failed — please try again",
        unexpected_error:     "An unexpected error occurred",
      };
      setToast({ type: "error", message: msgs[error] ?? `OAuth error: ${error}` });
    }

    // Clean up search params from URL
    if (connected || error) {
      router.replace(`/clients/${id}`, { scroll: false });
    }
  }, [searchParams, id, fetchClient, router]);

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      const res  = await fetch(`/api/clients/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setToast({ type: "error", message: data.error ?? "Save failed" }); return; }
      setClient(data.client);
      setDirty(false);
      setToast({ type: "success", message: "Client info saved" });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults([]);
    try {
      const res  = await fetch(`/api/clients/${id}/sync`, { method: "POST" });
      const data = await res.json();
      setSyncResults(data.results ?? []);
      fetchClient(); // refresh last_synced_at
      setToast({ type: "success", message: "Metrics synced successfully" });
    } catch {
      setToast({ type: "error", message: "Sync failed — check console for details" });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    // Optimistic update
    if (!client) return;
    setClient({
      ...client,
      connected_platforms: client.connected_platforms.filter((p) => p !== platform),
    });
    setToast({ type: "success", message: `${platform === "meta" ? "Meta" : "Google"} disconnected` });
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4">
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
        </header>
        <main className="flex-1 px-8 py-8 max-w-4xl w-full mx-auto space-y-6">
          {[180, 240, 160].map((h, i) => (
            <div key={i} className="bg-[#111114] rounded-2xl animate-pulse" style={{ height: h }} />
          ))}
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-600">
        <p className="text-sm">Client not found</p>
        <Link href="/clients" className="mt-4 text-xs text-purple-400 hover:text-purple-300">
          ← Back to clients
        </Link>
      </div>
    );
  }

  if (!client) return null;

  const metaConnected   = client.connected_platforms.includes("meta");
  const googleConnected = client.connected_platforms.includes("google");

  return (
    <div className="flex flex-col min-h-screen">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.message} type={toast.type} message={toast.message} onDismiss={dismissToast} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/[0.14] px-3 py-1.5 rounded-xl transition-all"
          >
            <ArrowLeft size={12} /> Clients
          </Link>
          <div>
            <h1 className="text-base font-semibold text-white">{client.business_name || "Client Profile"}</h1>
            <p className="text-xs text-zinc-500">
              Created {new Date(client.created_at).toLocaleDateString()}
              {client.last_synced_at && ` · Last synced ${new Date(client.last_synced_at).toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-1.5 rounded-xl transition-all font-medium"
            >
              <Save size={12} /> {saving ? "Saving…" : "Save Changes"}
            </motion.button>
          )}

          <button
            onClick={handleSync}
            disabled={syncing || (!metaConnected && !googleConnected)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] hover:border-white/[0.18] px-3 py-1.5 rounded-xl transition-all"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-8 py-8 max-w-4xl w-full mx-auto space-y-6">

        {/* ── Business Info ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
              <Building2 size={11} className="text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Business Information</h2>
            <span className="text-[10px] text-zinc-600 ml-1">(click any field to edit)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField
              label="Business Name"
              value={form.business_name}
              onChange={handleFieldChange("business_name")}
              icon={Building2}
            />
            <EditField
              label="Owner / Contact Name"
              value={form.owner_name}
              onChange={handleFieldChange("owner_name")}
              icon={User}
            />
            <EditField
              label="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              icon={Mail}
              type="email"
            />
            <EditField
              label="Phone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
              icon={Phone}
            />
          </div>
        </motion.div>

        {/* ── Platform Connections ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Link2 size={11} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Platform Connections</h2>
          </div>

          <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
            Connect ad accounts to automatically pull metrics into the CRM. All tokens are stored securely server-side and never exposed to the browser.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PlatformCard
              name="Meta Ads"
              platformKey="meta"
              clientId={id}
              connected={metaConnected}
              accountId={client.meta_ad_account_id}
              accountName={null}
              onDisconnect={handleDisconnect}
            />
            <PlatformCard
              name="Google Ads"
              platformKey="google"
              clientId={id}
              connected={googleConnected}
              accountId={client.google_customer_id}
              accountName={client.google_ads_account_name}
              onDisconnect={handleDisconnect}
            />
          </div>
        </motion.div>

        {/* ── Sync & Metrics ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <BarChart2 size={11} className="text-green-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Metrics Sync</h2>
            </div>
            {client.last_synced_at && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Clock size={10} />
                Last sync: {new Date(client.last_synced_at).toLocaleString()}
              </div>
            )}
          </div>

          {!metaConnected && !googleConnected ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <Link2 size={22} className="mb-3 opacity-30" />
              <p className="text-sm">No platforms connected yet</p>
              <p className="text-xs mt-1 text-zinc-700">Connect Meta or Google Ads above to enable sync</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-[#0d0d10] border border-white/[0.06] rounded-xl mb-4">
                <div className="flex-1 text-xs text-zinc-400 leading-relaxed">
                  Click <span className="text-white font-medium">Sync Now</span> (top right) to pull the last 30 days of ad metrics from
                  {metaConnected && " Meta Ads"}
                  {metaConnected && googleConnected && " and"}
                  {googleConnected && " Google Ads"}
                  {" "}into the database.
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-white bg-green-600/80 hover:bg-green-600 disabled:opacity-50 px-3 py-2 rounded-lg transition-all font-medium shrink-0"
                >
                  <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing…" : "Sync Now"}
                </button>
              </div>

              {syncResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">Last Sync Results</p>
                  {syncResults.map((r) => (
                    <SyncResultCard key={r.platform} result={r} />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

      </main>
    </div>
  );
}
