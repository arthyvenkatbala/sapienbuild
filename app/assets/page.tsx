"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Package, Tag, DollarSign } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_value: number | null;
  condition: string;
  notes: string | null;
  created_at: string;
}

const CATEGORIES = [
  "camera", "lens", "lighting", "tripod", "audio",
  "drone", "vehicle", "contract", "computer", "other",
];

const CONDITIONS = ["excellent", "good", "fair", "needs-repair", "retired"];

const CONDITION_COLORS: Record<string, string> = {
  excellent:    "bg-green-500/20 text-green-400",
  good:         "bg-teal-500/20 text-teal-400",
  fair:         "bg-yellow-500/20 text-yellow-400",
  "needs-repair":"bg-orange-500/20 text-orange-400",
  retired:      "bg-zinc-500/20 text-zinc-400",
};

function AddAssetModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (a: Asset) => void;
}) {
  const [form, setForm] = useState({
    name: "", category: "", serial_number: "",
    purchase_date: "", purchase_value: "", condition: "good", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

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
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/40 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Asset Name *
            </label>
            <input
              className={inputCls}
              placeholder="Canon EOS R5"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Category
              </label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Condition
              </label>
              <select
                className={inputCls}
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Serial Number
            </label>
            <input
              className={inputCls}
              placeholder="SN-123456789"
              value={form.serial_number}
              onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Purchase Date
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.purchase_date}
                onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Value (₹)
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="350000"
                value={form.purchase_value}
                onChange={(e) => setForm((f) => ({ ...f, purchase_value: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Notes
            </label>
            <input
              className={inputCls}
              placeholder="Primary body for weddings…"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm font-medium text-white transition-all"
            >
              {saving ? "Adding…" : "Add Asset"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AssetsPage() {
  const [assets, setAssets]   = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/assets");
      const data = await res.json();
      setAssets(data.assets ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // Group assets by category
  const grouped = assets.reduce<Record<string, Asset[]>>((acc, a) => {
    const cat = a.category ?? "Uncategorised";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const totalValue = assets.reduce(
    (s, a) => s + Number(a.purchase_value ?? 0),
    0
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/80 backdrop-blur-md border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Assets</h1>
          <p className="text-xs text-zinc-500">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} · equipment, gear & documents
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

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              Total Asset Value
            </p>
            <p className="text-xl font-bold text-amber-400">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              Categories
            </p>
            <p className="text-xl font-bold text-white">{Object.keys(grouped).length}</p>
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
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 capitalize">
                    {category}
                  </p>
                  <span className="text-[10px] text-zinc-700">({categoryAssets.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {categoryAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-white leading-tight flex-1 mr-2">
                          {asset.name}
                        </p>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 capitalize ${
                            CONDITION_COLORS[asset.condition] ?? "bg-zinc-500/20 text-zinc-400"
                          }`}
                        >
                          {asset.condition}
                        </span>
                      </div>

                      {asset.serial_number && (
                        <p className="text-[10px] text-zinc-600 font-mono mb-1.5">
                          {asset.serial_number}
                        </p>
                      )}

                      {asset.purchase_value !== null && (
                        <div className="flex items-center gap-1 text-zinc-500 mt-2">
                          <DollarSign size={10} />
                          <span className="text-[11px]">
                            ₹{Number(asset.purchase_value).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {asset.notes && (
                        <p className="text-[10px] text-zinc-600 mt-2 truncate">{asset.notes}</p>
                      )}
                    </div>
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
            onClose={() => setShowAdd(false)}
            onAdd={(a) => {
              setAssets((prev) => [a, ...prev]);
              setShowAdd(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
