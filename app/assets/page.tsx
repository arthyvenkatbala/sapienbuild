"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, X, Package, Tag, DollarSign,
  Wrench, AlertTriangle, Clock, CheckCircle, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset {
  id:                    string;
  name:                  string;
  category:              string | null;
  serial_number:         string | null;
  purchase_date:         string | null;
  purchase_value:        number | null;
  condition:             string;
  notes:                 string | null;
  created_at:            string;
  // service tracking
  last_service_date:     string | null;
  service_interval_days: number | null;
  next_service_due:      string | null;
  service_notes:         string | null;
}

type ServiceStatus = "overdue" | "due-soon" | "ok" | "none";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "camera", "lens", "lighting", "tripod", "audio",
  "drone", "vehicle", "contract", "computer", "other",
];

const CONDITIONS = ["excellent", "good", "fair", "needs-repair", "retired"];

const SERVICE_INTERVALS = [
  { label: "Monthly (30 days)",    value: 30  },
  { label: "Quarterly (90 days)",  value: 90  },
  { label: "6 months (180 days)",  value: 180 },
  { label: "Annually (365 days)",  value: 365 },
];

const CONDITION_COLORS: Record<string, string> = {
  excellent:     "bg-green-500/20 text-green-400",
  good:          "bg-teal-500/20 text-teal-400",
  fair:          "bg-yellow-500/20 text-yellow-400",
  "needs-repair":"bg-orange-500/20 text-orange-400",
  retired:       "bg-zinc-500/20 text-zinc-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getServiceStatus(asset: Asset): ServiceStatus {
  if (!asset.next_service_due) return "none";
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const due    = new Date(asset.next_service_due);
  const daysDiff = Math.floor((due.getTime() - today.getTime()) / 86_400_000);
  if (daysDiff < 0)  return "overdue";
  if (daysDiff <= 7) return "due-soon";
  return "ok";
}

function daysLabel(asset: Asset): string {
  if (!asset.next_service_due) return "";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(asset.next_service_due);
  const diff  = Math.floor((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0)  return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  return `Due in ${diff}d`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_BADGE: Record<ServiceStatus, { cls: string; icon: React.ReactNode; label: string }> = {
  overdue:   { cls: "bg-red-500/10 border-red-500/20 text-red-400",   icon: <AlertTriangle size={10} />, label: "Overdue" },
  "due-soon":{ cls: "bg-amber-500/10 border-amber-500/20 text-amber-400", icon: <Clock size={10} />, label: "Due soon" },
  ok:        { cls: "bg-green-500/10 border-green-500/20 text-green-400", icon: <CheckCircle size={10} />, label: "OK" },
  none:      { cls: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500", icon: <Wrench size={10} />, label: "No schedule" },
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/40 transition-all";

// ─── AddAssetModal ────────────────────────────────────────────────────────────

function AddAssetModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: Asset) => void }) {
  const [form, setForm] = useState({
    name: "", category: "", serial_number: "",
    purchase_date: "", purchase_value: "", condition: "good", notes: "",
    last_service_date: "", service_interval_days: "", service_notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Asset name is required"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/assets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add asset"); return; }
      onAdd(data.asset);
    } catch { setError("Network error"); }
    finally  { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Add Asset</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Asset Name *</label>
            <input className={inputCls} placeholder="Canon EOS R5" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Condition</label>
              <select className={inputCls} value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Serial Number</label>
            <input className={inputCls} placeholder="SN-123456789" value={form.serial_number} onChange={(e) => set("serial_number", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Purchase Date</label>
              <input type="date" className={inputCls} value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Value (₹)</label>
              <input type="number" className={inputCls} placeholder="350000" value={form.purchase_value} onChange={(e) => set("purchase_value", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Notes</label>
            <input className={inputCls} placeholder="Primary body for weddings…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          {/* ── Service Schedule ── */}
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
              <Wrench size={10} /> Service Schedule (optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Service Interval</label>
                <select className={inputCls} value={form.service_interval_days} onChange={(e) => set("service_interval_days", e.target.value)}>
                  <option value="">No schedule</option>
                  {SERVICE_INTERVALS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Serviced</label>
                <input type="date" className={inputCls} value={form.last_service_date} onChange={(e) => set("last_service_date", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Service Notes</label>
              <input className={inputCls} placeholder="Calibrate sensor, clean lenses…" value={form.service_notes} onChange={(e) => set("service_notes", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm font-medium text-white transition-all">
              {saving ? "Adding…" : "Add Asset"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── ServiceModal ─────────────────────────────────────────────────────────────

function ServiceModal({
  asset,
  onClose,
  onUpdate,
}: {
  asset:    Asset;
  onClose:  () => void;
  onUpdate: (a: Asset) => void;
}) {
  const [form, setForm] = useState({
    service_interval_days: String(asset.service_interval_days ?? ""),
    last_service_date:     asset.last_service_date ?? "",
    service_notes:         asset.service_notes ?? "",
  });
  const [saving,    setSaving]    = useState(false);
  const [logging,   setLogging]   = useState(false);
  const [error,     setError]     = useState("");

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const logService = async () => {
    setLogging(true); setError("");
    try {
      const res  = await fetch(`/api/assets/${asset.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "log_service" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onUpdate(data.asset);
      onClose();
    } catch { setError("Network error"); }
    finally  { setLogging(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res  = await fetch(`/api/assets/${asset.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onUpdate(data.asset);
      onClose();
    } catch { setError("Network error"); }
    finally  { setSaving(false); }
  };

  const status = getServiceStatus(asset);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-white">Service Schedule</h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{asset.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Current status */}
        {asset.next_service_due && (
          <div className={`mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${STATUS_BADGE[status].cls}`}>
            {STATUS_BADGE[status].icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{daysLabel(asset)}</p>
              <p className="text-[10px] opacity-70">Next due: {fmtDate(asset.next_service_due)}</p>
            </div>
            <button
              onClick={logService}
              disabled={logging}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600/80 hover:bg-green-600 text-white text-[10px] font-semibold transition-all disabled:opacity-50"
            >
              {logging ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
              Log service
            </button>
          </div>
        )}

        {!asset.next_service_due && (
          <div className="mx-5 mt-4 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs text-zinc-500">No service schedule configured yet.</p>
          </div>
        )}

        <form onSubmit={save} className="p-5 space-y-3 pt-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Service Interval</label>
            <select className={inputCls} value={form.service_interval_days} onChange={(e) => set("service_interval_days", e.target.value)}>
              <option value="">No schedule</option>
              {SERVICE_INTERVALS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Last Serviced</label>
            <input type="date" className={inputCls} value={form.last_service_date} onChange={(e) => set("last_service_date", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Service Notes</label>
            <input className={inputCls} placeholder="Calibrate sensor, clean lenses…" value={form.service_notes} onChange={(e) => set("service_notes", e.target.value)} />
          </div>

          {form.last_service_date && form.service_interval_days && (
            <p className="text-[10px] text-zinc-600 bg-white/[0.02] rounded-lg px-3 py-1.5">
              Next due will be set to{" "}
              <span className="text-zinc-400">
                {fmtDate((() => {
                  const d = new Date(form.last_service_date);
                  d.setDate(d.getDate() + Number(form.service_interval_days));
                  return d.toISOString().slice(0, 10);
                })())}
              </span>
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm font-medium text-white transition-all flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : "Save Schedule"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── AssetCard ────────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onLogService,
  onOpenService,
}: {
  asset:          Asset;
  onLogService:   (id: string) => void;
  onOpenService:  (a: Asset)  => void;
}) {
  const [logging, setLogging] = useState(false);
  const status = getServiceStatus(asset);
  const badge  = STATUS_BADGE[status];

  const handleLogService = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogging(true);
    await onLogService(asset.id);
    setLogging(false);
  };

  return (
    <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 hover:border-amber-500/20 transition-all flex flex-col gap-2">
      {/* Name + condition */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-white leading-tight flex-1 mr-2">{asset.name}</p>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 capitalize ${CONDITION_COLORS[asset.condition] ?? "bg-zinc-500/20 text-zinc-400"}`}>
          {asset.condition}
        </span>
      </div>

      {asset.serial_number && (
        <p className="text-[10px] text-zinc-600 font-mono">{asset.serial_number}</p>
      )}

      {asset.purchase_value !== null && (
        <div className="flex items-center gap-1 text-zinc-500">
          <DollarSign size={10} />
          <span className="text-[11px]">₹{Number(asset.purchase_value).toLocaleString("en-IN")}</span>
        </div>
      )}

      {asset.notes && (
        <p className="text-[10px] text-zinc-600 truncate">{asset.notes}</p>
      )}

      {/* ── Service section ── */}
      <div className="border-t border-white/[0.05] pt-2 mt-auto">
        {status === "none" ? (
          <button
            onClick={() => onOpenService(asset)}
            className="w-full flex items-center gap-1.5 text-[10px] text-zinc-600 hover:text-amber-400 transition-colors"
          >
            <Wrench size={10} /> Set service schedule
          </button>
        ) : (
          <div className="space-y-1.5">
            {/* Status badge row */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                {badge.icon}
                {daysLabel(asset) || badge.label}
              </span>
              <button
                onClick={() => onOpenService(asset)}
                className="text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Edit
              </button>
            </div>

            {/* Due date + last serviced */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-600">
                Next: <span className="text-zinc-400">{fmtDate(asset.next_service_due)}</span>
              </span>
              {asset.last_service_date && (
                <span className="text-zinc-700">
                  Last: {fmtDate(asset.last_service_date)}
                </span>
              )}
            </div>

            {/* Quick log button — shown for overdue/due-soon */}
            {(status === "overdue" || status === "due-soon") && (
              <button
                onClick={handleLogService}
                disabled={logging}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-600 text-white text-[10px] font-semibold transition-all disabled:opacity-50"
              >
                {logging
                  ? <><Loader2 size={10} className="animate-spin" /> Logging…</>
                  : <><CheckCircle size={10} /> Log service done</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets,      setAssets]      = useState<Asset[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showAdd,     setShowAdd]     = useState(false);
  const [serviceFor,  setServiceFor]  = useState<Asset | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/assets");
      const data = await res.json();
      setAssets(data.assets ?? []);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleLogService = async (id: string) => {
    const res  = await fetch(`/api/assets/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "log_service" }),
    });
    const data = await res.json();
    if (res.ok) {
      setAssets((prev) => prev.map((a) => (a.id === id ? data.asset : a)));
    }
  };

  const handleAssetUpdate = (updated: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const grouped = assets.reduce<Record<string, Asset[]>>((acc, a) => {
    const cat = a.category ?? "Uncategorised";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const totalValue = assets.reduce((s, a) => s + Number(a.purchase_value ?? 0), 0);

  const overdueCount  = assets.filter((a) => getServiceStatus(a) === "overdue").length;
  const dueSoonCount  = assets.filter((a) => getServiceStatus(a) === "due-soon").length;
  const serviceAlerts = overdueCount + dueSoonCount;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Assets</h1>
          <p className="text-xs text-zinc-500">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} · equipment, gear & documents
            {serviceAlerts > 0 && (
              <span className="ml-2 text-red-400">
                · {serviceAlerts} service alert{serviceAlerts !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-amber-600 hover:bg-amber-500 px-4 py-1.5 rounded-xl transition-all font-medium"
        >
          <Plus size={12} /> Add Asset
        </button>
      </header>

      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1400px] w-full mx-auto space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Total Value</p>
            <p className="text-xl font-bold text-amber-400">₹{totalValue.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Categories</p>
            <p className="text-xl font-bold text-white">{Object.keys(grouped).length}</p>
          </div>
          <div className={`border rounded-2xl p-4 ${overdueCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-[#111114] border-white/[0.07]"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Overdue Service</p>
            <p className={`text-xl font-bold ${overdueCount > 0 ? "text-red-400" : "text-zinc-500"}`}>{overdueCount}</p>
          </div>
          <div className={`border rounded-2xl p-4 ${dueSoonCount > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-[#111114] border-white/[0.07]"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Due Within 7 Days</p>
            <p className={`text-xl font-bold ${dueSoonCount > 0 ? "text-amber-400" : "text-zinc-500"}`}>{dueSoonCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#111114] border border-white/[0.05] rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Package size={32} className="mb-4 opacity-30" />
            <p className="text-sm text-zinc-500">No assets yet</p>
            <p className="text-xs mt-1 text-zinc-700">Add your cameras, lenses, and equipment to track them</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 flex items-center gap-2 text-xs text-white bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl transition-all font-medium"
            >
              <Plus size={12} /> Add first asset
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, categoryAssets]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={12} className="text-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 capitalize">{category}</p>
                  <span className="text-[10px] text-zinc-700">({categoryAssets.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {categoryAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onLogService={handleLogService}
                      onOpenService={setServiceFor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAdd && (
          <AddAssetModal
            key="add"
            onClose={() => setShowAdd(false)}
            onAdd={(a) => { setAssets((prev) => [a, ...prev]); setShowAdd(false); }}
          />
        )}
        {serviceFor && (
          <ServiceModal
            key={serviceFor.id}
            asset={serviceFor}
            onClose={() => setServiceFor(null)}
            onUpdate={(a) => { handleAssetUpdate(a); setServiceFor(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
