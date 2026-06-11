"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Plus, Trash2,
  Sparkles, MessageCircle, Mail, Check,
  User, Calendar, Building2, MapPin,
} from "lucide-react";
import {
  Quote, QuoteStatus, ServiceLine, AddOnLine,
  SERVICE_CATALOG, ADDON_CATALOG, EVENT_TYPES, EventType,
  AI_PRICING_SUGGESTIONS, AiPricingSuggestion,
} from "@/lib/quotes-data";
import ProposalTemplateView from "./ProposalTemplateView";

// ── Utils ─────────────────────────────────────────────────────────────────────

function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function rupee(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label, children, required,
}: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "bg-[#0d0d10] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/[0.22] transition-all";

// ── Step 1: Client Details ─────────────────────────────────────────────────────

interface DetailsState {
  clientName:     string;
  clientPhone:    string;
  clientEmail:    string;
  clientLocation: string;
  eventTypes:     EventType[];
  eventDates:     string;
  venueName:      string;
  executiveName:  string;
  executivePhone: string;
  executiveEmail: string;
  notes:          string;
}

function StepDetails({
  state,
  onChange,
}: { state: DetailsState; onChange: (s: DetailsState) => void }) {
  const set = (key: keyof DetailsState) => (val: string) =>
    onChange({ ...state, [key]: val });

  const toggleEvent = (et: EventType) => {
    const has = state.eventTypes.includes(et);
    onChange({
      ...state,
      eventTypes: has
        ? state.eventTypes.filter((e) => e !== et)
        : [...state.eventTypes, et],
    });
  };

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {/* Left column */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2 mb-2">
          <User size={13} className="text-purple-400" /> Client Information
        </p>

        <Field label="Client Name" required>
          <input
            className={inputCls}
            placeholder="e.g. Priya & Rohan Sharma"
            value={state.clientName}
            onChange={(e) => set("clientName")(e.target.value)}
          />
        </Field>

        <Field label="Phone Number" required>
          <input
            className={inputCls}
            placeholder="+91 98765 43210"
            value={state.clientPhone}
            onChange={(e) => set("clientPhone")(e.target.value)}
          />
        </Field>

        <Field label="Email Address">
          <input
            className={inputCls}
            placeholder="client@email.com"
            type="email"
            value={state.clientEmail}
            onChange={(e) => set("clientEmail")(e.target.value)}
          />
        </Field>

        <Field label="Location / City" required>
          <input
            className={inputCls}
            placeholder="Chennai, Tamil Nadu"
            value={state.clientLocation}
            onChange={(e) => set("clientLocation")(e.target.value)}
          />
        </Field>

        <Field label="Special Notes">
          <textarea
            className={`${inputCls} resize-none h-20`}
            placeholder="Any special requirements, themes, or notes…"
            value={state.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </Field>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2 mb-2">
          <Calendar size={13} className="text-blue-400" /> Event Details
        </p>

        <Field label="Event Type(s)" required>
          <div className="flex flex-wrap gap-2 p-3 bg-[#0d0d10] border border-white/[0.08] rounded-xl">
            {EVENT_TYPES.map((et) => {
              const active = state.eventTypes.includes(et);
              return (
                <button
                  key={et}
                  type="button"
                  onClick={() => toggleEvent(et)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    active
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.13]"
                  }`}
                >
                  {active && <Check size={10} className="inline mr-1" />}
                  {et}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Event Date(s)" required>
          <input
            className={inputCls}
            placeholder="e.g. 15 Feb 2025 – 16 Feb 2025"
            value={state.eventDates}
            onChange={(e) => set("eventDates")(e.target.value)}
          />
        </Field>

        <Field label="Venue Name">
          <input
            className={inputCls}
            placeholder="The Leela Palace, Chennai"
            value={state.venueName}
            onChange={(e) => set("venueName")(e.target.value)}
          />
        </Field>

        <div className="pt-2">
          <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2 mb-3">
            <Building2 size={13} className="text-amber-400" /> Assigned Executive
          </p>
          <div className="space-y-3">
            <Field label="Executive Name">
              <input
                className={inputCls}
                placeholder="Arthy Venkat"
                value={state.executiveName}
                onChange={(e) => set("executiveName")(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  className={inputCls}
                  placeholder="+91 90000 12345"
                  value={state.executivePhone}
                  onChange={(e) => set("executivePhone")(e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputCls}
                  placeholder="exec@onethousandtales.com"
                  value={state.executiveEmail}
                  onChange={(e) => set("executiveEmail")(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Service Builder ────────────────────────────────────────────────────

interface BuilderState {
  services:      ServiceLine[];
  addOns:        AddOnLine[];
  discountType:  "flat" | "percent";
  discountValue: number;
}

function StepBuilder({
  state,
  onChange,
}: { state: BuilderState; onChange: (s: BuilderState) => void }) {
  const addService = () => {
    const first = SERVICE_CATALOG[0];
    const line: ServiceLine = {
      id:        genId(),
      serviceId: first.id,
      name:      first.name,
      sessions:  1,
      events:    "",
      unitPrice: first.basePrice,
      subtotal:  first.basePrice,
    };
    onChange({ ...state, services: [...state.services, line] });
  };

  const updateService = (id: string, patch: Partial<ServiceLine>) => {
    onChange({
      ...state,
      services: state.services.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        // If serviceId changed, update name and unitPrice from catalog
        if (patch.serviceId) {
          const def = SERVICE_CATALOG.find((c) => c.id === patch.serviceId);
          if (def) { updated.name = def.name; updated.unitPrice = def.basePrice; }
        }
        updated.subtotal = updated.sessions * updated.unitPrice;
        return updated;
      }),
    });
  };

  const removeService = (id: string) => {
    onChange({ ...state, services: state.services.filter((s) => s.id !== id) });
  };

  const addAddOn = () => {
    const first = ADDON_CATALOG[0];
    const line: AddOnLine = {
      id:      genId(),
      addOnId: first.id,
      name:    first.name,
      qty:     1,
      price:   first.price,
      subtotal: first.price,
    };
    onChange({ ...state, addOns: [...state.addOns, line] });
  };

  const updateAddOn = (id: string, patch: Partial<AddOnLine>) => {
    onChange({
      ...state,
      addOns: state.addOns.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...patch };
        if (patch.addOnId) {
          const def = ADDON_CATALOG.find((c) => c.id === patch.addOnId);
          if (def) { updated.name = def.name; updated.price = def.price; }
        }
        updated.subtotal = updated.qty * updated.price;
        return updated;
      }),
    });
  };

  const removeAddOn = (id: string) => {
    onChange({ ...state, addOns: state.addOns.filter((a) => a.id !== id) });
  };

  const selectCls = `${inputCls} cursor-pointer`;

  const servicesTotal = state.services.reduce((s, l) => s + l.subtotal, 0);
  const addOnsTotal   = state.addOns.reduce((s, l) => s + l.subtotal, 0);
  const subtotal      = servicesTotal + addOnsTotal;
  const discountAmt   =
    state.discountType === "percent"
      ? Math.round(subtotal * (state.discountValue / 100))
      : state.discountValue;
  const grandTotal = Math.max(0, subtotal - discountAmt);

  return (
    <div className="space-y-6">

      {/* Services Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Services</h3>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={11} /> Add Service
          </button>
        </div>

        {state.services.length === 0 ? (
          <div className="border border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center text-zinc-600">
            <Plus size={20} className="mb-2 opacity-40" />
            <p className="text-sm">No services added yet</p>
            <button
              type="button"
              onClick={addService}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Add your first service
            </button>
          </div>
        ) : (
          <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_80px_1fr_100px_100px_36px] gap-0 border-b border-white/[0.06]">
              {["Service", "Sessions", "Events Covered", "Rate (₹)", "Amount (₹)", ""].map((h) => (
                <div key={h} className="px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                  {h}
                </div>
              ))}
            </div>
            {state.services.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[2fr_80px_1fr_100px_100px_36px] gap-0 border-b border-white/[0.04] items-center hover:bg-white/[0.02]"
              >
                <div className="px-2 py-1.5">
                  <select
                    value={s.serviceId}
                    onChange={(e) => updateService(s.id, { serviceId: e.target.value })}
                    className="w-full bg-transparent text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    {SERVICE_CATALOG.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111114]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="px-2 py-1.5">
                  <input
                    type="number"
                    min={1}
                    value={s.sessions}
                    onChange={(e) => updateService(s.id, { sessions: Number(e.target.value) })}
                    className="w-full bg-[#111116] border border-white/[0.07] rounded-md px-2 py-1 text-xs text-zinc-200 outline-none focus:border-white/[0.18] text-center"
                  />
                </div>
                <div className="px-2 py-1.5">
                  <input
                    type="text"
                    value={s.events}
                    placeholder="Wedding, Reception…"
                    onChange={(e) => updateService(s.id, { events: e.target.value })}
                    className="w-full bg-[#111116] border border-white/[0.07] rounded-md px-2 py-1 text-xs text-zinc-200 outline-none focus:border-white/[0.18] placeholder:text-zinc-700"
                  />
                </div>
                <div className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    value={s.unitPrice}
                    onChange={(e) => updateService(s.id, { unitPrice: Number(e.target.value) })}
                    className="w-full bg-[#111116] border border-white/[0.07] rounded-md px-2 py-1 text-xs text-zinc-200 outline-none focus:border-white/[0.18] text-right"
                  />
                </div>
                <div className="px-3 py-1.5 text-xs font-semibold text-white text-right">
                  ₹{rupee(s.subtotal)}
                </div>
                <div className="px-1 py-1.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeService(s.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-zinc-700 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
            {/* Services Subtotal row */}
            <div className="grid grid-cols-[2fr_80px_1fr_100px_100px_36px] gap-0 bg-white/[0.03]">
              <div className="px-3 py-2 col-span-4 text-[10px] font-semibold text-zinc-500 text-right uppercase tracking-widest">
                Services Total
              </div>
              <div className="px-3 py-2 text-sm font-bold text-white text-right">₹{rupee(servicesTotal)}</div>
              <div />
            </div>
          </div>
        )}
      </div>

      {/* Add-Ons Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Add-Ons</h3>
          <button
            type="button"
            onClick={addAddOn}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={11} /> Add Extra
          </button>
        </div>

        {state.addOns.length > 0 && (
          <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_80px_100px_100px_36px] gap-0 border-b border-white/[0.06]">
              {["Add-On", "Qty", "Unit Price", "Amount", ""].map((h) => (
                <div key={h} className="px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">{h}</div>
              ))}
            </div>
            {state.addOns.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[2fr_80px_100px_100px_36px] gap-0 border-b border-white/[0.04] items-center hover:bg-white/[0.02]"
              >
                <div className="px-2 py-1.5">
                  <select
                    value={a.addOnId}
                    onChange={(e) => updateAddOn(a.id, { addOnId: e.target.value })}
                    className="w-full bg-transparent text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    {ADDON_CATALOG.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111114]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="px-2 py-1.5">
                  <input
                    type="number"
                    min={1}
                    value={a.qty}
                    onChange={(e) => updateAddOn(a.id, { qty: Number(e.target.value) })}
                    className="w-full bg-[#111116] border border-white/[0.07] rounded-md px-2 py-1 text-xs text-zinc-200 outline-none focus:border-white/[0.18] text-center"
                  />
                </div>
                <div className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    value={a.price}
                    onChange={(e) => updateAddOn(a.id, { price: Number(e.target.value) })}
                    className="w-full bg-[#111116] border border-white/[0.07] rounded-md px-2 py-1 text-xs text-zinc-200 outline-none focus:border-white/[0.18] text-right"
                  />
                </div>
                <div className="px-3 py-1.5 text-xs font-semibold text-white text-right">₹{rupee(a.subtotal)}</div>
                <div className="px-1 py-1.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeAddOn(a.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-zinc-700 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount + Grand Total */}
      <div className="grid grid-cols-2 gap-6">
        {/* Discount */}
        <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Discount</h3>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => onChange({ ...state, discountType: "flat" })}
              className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                state.discountType === "flat"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Flat ₹
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...state, discountType: "percent" })}
              className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                state.discountType === "percent"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "border-white/[0.07] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Percent %
            </button>
          </div>
          <input
            type="number"
            min={0}
            value={state.discountValue}
            onChange={(e) => onChange({ ...state, discountValue: Number(e.target.value) })}
            placeholder={state.discountType === "flat" ? "Enter ₹ amount" : "Enter %"}
            className={`${inputCls} w-full`}
          />
          {discountAmt > 0 && (
            <p className="text-xs text-green-400 mt-2">Saving ₹{rupee(discountAmt)}</p>
          )}
        </div>

        {/* Grand Total */}
        <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Summary</h3>
          <div className="space-y-1.5 text-xs">
            {addOnsTotal > 0 && (
              <>
                <div className="flex justify-between text-zinc-500">
                  <span>Services</span><span>₹{rupee(servicesTotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Add-Ons</span><span>₹{rupee(addOnsTotal)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span><span>₹{rupee(subtotal)}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span><span>−₹{rupee(discountAmt)}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-300">Grand Total</span>
            <span className="text-2xl font-bold text-white">₹{rupee(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* AI Pricing Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={13} className="text-yellow-400" />
          <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">AI Pricing Recommendations</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AI_PRICING_SUGGESTIONS.slice(0, 2).map((s) => (
            <AISuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AISuggestionCard({ suggestion: s }: { suggestion: AiPricingSuggestion }) {
  const colors = {
    bundle:  { bg: "bg-purple-500/08", border: "border-purple-500/20", text: "text-purple-400" },
    upsell:  { bg: "bg-blue-500/08",   border: "border-blue-500/20",   text: "text-blue-400"   },
    discount:{ bg: "bg-green-500/08",  border: "border-green-500/20",  text: "text-green-400"  },
    timing:  { bg: "bg-amber-500/08",  border: "border-amber-500/20",  text: "text-amber-400"  },
  } as const;
  const c = colors[s.type];
  return (
    <div className={`border rounded-xl p-3 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-xs font-semibold ${c.text}`}>{s.title}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${c.bg} ${c.text} border ${c.border} whitespace-nowrap`}>
          {s.impact}
        </span>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">{s.body}</p>
      <button className={`text-[10px] font-semibold ${c.text} hover:brightness-125 transition-all`}>
        {s.action} →
      </button>
    </div>
  );
}

// ── Step 4: Send ───────────────────────────────────────────────────────────────

function StepSend({ quote }: { quote: Partial<Quote> }) {
  const [sent, setSent] = useState<"whatsapp" | "email" | null>(null);

  const waMsg = encodeURIComponent(
    `Dear ${quote.clientName ?? "Client"},\n\nThank you for considering One Thousand Tales for your special occasion. I'm pleased to share your personalised proposal for ₹${new Intl.NumberFormat("en-IN").format(quote.grandTotal ?? 0)}.\n\nPlease review and let me know if you have any questions. Looking forward to capturing your beautiful memories!\n\nWarm regards,\n${quote.executiveName ?? "One Thousand Tales"}`
  );

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Proposal Ready!</h3>
        <p className="text-sm text-zinc-500">
          Quote for <span className="text-white">{quote.clientName}</span> · Grand Total:{" "}
          <span className="text-amber-400 font-bold">₹{new Intl.NumberFormat("en-IN").format(quote.grandTotal ?? 0)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* WhatsApp */}
        <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
            <MessageCircle size={18} className="text-green-400" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Send via WhatsApp</h4>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Open WhatsApp with a pre-filled personalised message for {quote.clientName}.
          </p>
          <div className="bg-[#111116] border border-white/[0.05] rounded-lg p-3 mb-4">
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider mb-1">Preview Message</p>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">
              Dear {quote.clientName}, Thank you for considering One Thousand Tales...
            </p>
          </div>
          <a
            href={`https://wa.me/${(quote.clientPhone ?? "").replace(/\D/g, "")}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSent("whatsapp")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/25 transition-all"
          >
            <MessageCircle size={14} />
            {sent === "whatsapp" ? "Sent!" : "Open WhatsApp"}
          </a>
        </div>

        {/* Email */}
        <div className="bg-[#0d0d10] border border-white/[0.07] rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <Mail size={18} className="text-blue-400" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Send via Email</h4>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Compose a personalised email with the proposal summary to {quote.clientEmail || "the client"}.
          </p>
          <div className="bg-[#111116] border border-white/[0.05] rounded-lg p-3 mb-4">
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider mb-1">Subject Line</p>
            <p className="text-xs text-zinc-400">
              OTT Proposal – {quote.clientName} · {quote.eventTypes?.join(", ")}
            </p>
          </div>
          <a
            href={`mailto:${quote.clientEmail}?subject=${encodeURIComponent(`OTT Proposal – ${quote.clientName}`)}&body=${encodeURIComponent(`Dear ${quote.clientName},\n\nPlease find your personalised proposal from One Thousand Tales attached.\n\nTotal: ₹${new Intl.NumberFormat("en-IN").format(quote.grandTotal ?? 0)}\n\nBest regards,\n${quote.executiveName}`)}`}
            onClick={() => setSent("email")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/25 transition-all"
          >
            <Mail size={14} />
            {sent === "email" ? "Sent!" : "Open Email"}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
        <Sparkles size={12} className="text-amber-400 shrink-0" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-amber-400 font-semibold">AI Tip: </span>
          The best time to follow up is within 48 hours of sending. Quotes viewed within 2 days convert 3× more often.
        </p>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

interface Props {
  isOpen:        boolean;
  onClose:       () => void;
  onSaveQuote:   (q: Quote) => void;
  editingQuote?: Quote | null;
}

const STEPS = ["Client Details", "Service Builder", "Preview", "Send"];

export default function QuoteBuilderModal({ isOpen, onClose, onSaveQuote, editingQuote }: Props) {
  const [step, setStep]   = useState(0);
  const [saved, setSaved] = useState(false);

  const [details, setDetails] = useState<DetailsState>({
    clientName:     editingQuote?.clientName     ?? "",
    clientPhone:    editingQuote?.clientPhone     ?? "",
    clientEmail:    editingQuote?.clientEmail     ?? "",
    clientLocation: editingQuote?.clientLocation  ?? "",
    eventTypes:     editingQuote?.eventTypes      ?? [],
    eventDates:     editingQuote?.eventDates      ?? "",
    venueName:      editingQuote?.venueName       ?? "",
    executiveName:  editingQuote?.executiveName   ?? "Arthy Venkat",
    executivePhone: editingQuote?.executivePhone  ?? "+91 90000 12345",
    executiveEmail: editingQuote?.executiveEmail  ?? "arthy@onethousandtales.com",
    notes:          editingQuote?.notes           ?? "",
  });

  const [builder, setBuilder] = useState<BuilderState>({
    services:      editingQuote?.services      ?? [],
    addOns:        editingQuote?.addOns        ?? [],
    discountType:  editingQuote?.discountType  ?? "flat",
    discountValue: editingQuote?.discountValue ?? 0,
  });

  const builtQuote = useMemo<Quote>(() => {
    const servicesTotal = builder.services.reduce((s, l) => s + l.subtotal, 0);
    const addOnsTotal   = builder.addOns.reduce((s, l) => s + l.subtotal, 0);
    const subtotal      = servicesTotal + addOnsTotal;
    const discountAmt   =
      builder.discountType === "percent"
        ? Math.round(subtotal * (builder.discountValue / 100))
        : builder.discountValue;
    const grandTotal = Math.max(0, subtotal - discountAmt);

    const today = new Date();
    const valid = new Date(today); valid.setDate(today.getDate() + 30);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    return {
      id:              editingQuote?.id       ?? `q-${genId()}`,
      ...details,
      ...builder,
      subtotal,
      discountAmount:  discountAmt,
      grandTotal,
      status:          "Draft" as QuoteStatus,
      createdAt:       editingQuote?.createdAt ?? fmt(today),
      updatedAt:       fmt(today),
      validUntil:      editingQuote?.validUntil ?? fmt(valid),
      sentAt:          editingQuote?.sentAt ?? null,
      viewedAt:        editingQuote?.viewedAt ?? null,
      approvedAt:      editingQuote?.approvedAt ?? null,
      signatureData:   editingQuote?.signatureData ?? null,
      followUpCount:   editingQuote?.followUpCount ?? 0,
      aiScore:         editingQuote?.aiScore ?? Math.floor(Math.random() * 30 + 60),
      aiRecommendation: editingQuote?.aiRecommendation ?? "Review and send this proposal within 24 hours for best conversion.",
    };
  }, [details, builder, editingQuote]);

  const handleSave = () => {
    onSaveQuote(builtQuote);
    setSaved(true);
    setStep(3);
  };

  const canProceed = () => {
    if (step === 0) return details.clientName.trim() !== "" && details.clientPhone.trim() !== "" && details.eventTypes.length > 0;
    if (step === 1) return builder.services.length > 0;
    return true;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-[#111114] border border-white/[0.08] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {editingQuote ? "Edit Proposal" : "New Proposal"}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
              </div>

              {/* Step pills */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { if (i < step || (i === step + 1 && canProceed())) setStep(i); }}
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      i === step
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : i < step
                        ? "bg-green-500/10 border-green-500/25 text-green-400"
                        : "border-white/[0.06] text-zinc-600"
                    }`}
                  >
                    {i < step && <Check size={9} />}
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 0 && <StepDetails state={details} onChange={setDetails} />}
                  {step === 1 && <StepBuilder state={builder} onChange={setBuilder} />}
                  {step === 2 && <ProposalTemplateView quote={builtQuote} />}
                  {step === 3 && <StepSend quote={builtQuote} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07] shrink-0">
              <button
                onClick={() => step > 0 ? setStep(step - 1) : onClose()}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white border border-white/[0.07] hover:border-white/[0.15] px-4 py-2 rounded-xl transition-all"
              >
                <ChevronLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
              </button>

              <div className="flex items-center gap-3">
                {/* Save as Draft (show from step 1 onwards) */}
                {step >= 1 && !saved && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.15] px-4 py-2 rounded-xl transition-all"
                  >
                    Save as Draft
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => {
                      if (step === 1 && !saved) handleSave();
                      if (canProceed()) setStep(step + 1);
                    }}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 text-sm text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-xl transition-all font-medium"
                  >
                    {step === 1 ? "Save & Preview" : "Next"} <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-white bg-green-600 hover:bg-green-500 px-5 py-2 rounded-xl transition-all font-medium"
                  >
                    <Check size={14} /> Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
