"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import { Quote, DELIVERY_TIMELINE, FIXED_TEMPLATE_SERVICES, STANDARD_PROPOSAL_ADDONS } from "@/lib/quotes-data";

interface Props {
  quote:        Quote;
  showControls?: boolean;
}

const GOLD   = "#C9A55A";
const CREAM  = "#F5EFE0";
const DARK   = "#2C2C2C";
const LIGHT  = "#F0E8D5";
const BORDER = "#D4B87A";

function rupee(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

// ── OTT Bird Logo (SVG recreation) ───────────────────────────────────────────

function OTTLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="52" rx="22" ry="12" fill={GOLD} opacity="0.25" />
      <path d="M40 12 C28 22 20 32 22 44 C24 52 32 56 40 56 C48 56 56 52 58 44 C60 32 52 22 40 12Z" fill={GOLD} opacity="0.9" />
      <path d="M40 18 C36 28 30 34 30 42 C30 50 35 54 40 54 C45 54 50 50 50 42 C50 34 44 28 40 18Z" fill="#E8C87A" />
      <circle cx="36" cy="30" r="2.5" fill={DARK} />
      <path d="M40 14 C38 10 32 8 30 12 C34 12 38 14 40 14Z" fill={GOLD} />
      <path d="M40 14 C42 10 48 8 50 12 C46 12 42 14 40 14Z" fill={GOLD} />
      {/* Tail feathers */}
      <path d="M30 52 C26 58 22 64 18 68" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <path d="M35 54 C33 60 31 66 30 72" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 56 C40 62 40 68 40 74" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <path d="M45 54 C47 60 49 66 50 72" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <path d="M50 52 C54 58 58 64 62 68" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <div style={{ width: 6, height: 6, transform: "rotate(45deg)", background: GOLD, margin: "0 10px" }} />
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

export default function ProposalTemplateView({ quote, showControls = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = ref.current;
    if (!el) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = el.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Print control */}
      {showControls && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.18] px-4 py-2 rounded-xl transition-all"
          >
            <Printer size={13} /> Download / Print PDF
          </button>
        </div>
      )}

      {/* Template */}
      <div
        ref={ref}
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          background: CREAM,
          color: DARK,
          maxWidth: 800,
          margin: "0 auto",
          boxShadow: "0 8px 64px rgba(0,0,0,0.5)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >

        {/* ── Cover Page ─────────────────────────────────────────────── */}
        <div
          style={{
            background: DARK,
            color: CREAM,
            minHeight: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 48px",
            position: "relative",
            borderBottom: `4px solid ${GOLD}`,
          }}
        >
          {/* Corner decorations */}
          <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
          <div style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
          <div style={{ position: "absolute", bottom: 20, left: 20, width: 40, height: 40, borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
          <div style={{ position: "absolute", bottom: 20, right: 20, width: 40, height: 40, borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />

          <OTTLogo size={80} />

          <h1
            style={{
              fontSize: 32,
              letterSpacing: "0.25em",
              fontWeight: 400,
              color: GOLD,
              margin: "20px 0 4px",
              textTransform: "uppercase",
            }}
          >
            One Thousand Tales
          </h1>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#b0a080", textTransform: "uppercase", marginBottom: 40 }}>
            Fine Photography &amp; Cinematography
          </p>

          <div style={{ width: 60, height: 1, background: GOLD, marginBottom: 32 }} />

          <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9a9080", marginBottom: 8 }}>
            Proposal For
          </p>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: CREAM,
              letterSpacing: "0.05em",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {quote.clientName}
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {quote.eventTypes.map((et) => (
              <span
                key={et}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: GOLD,
                  border: `1px solid ${GOLD}44`,
                  padding: "4px 12px",
                  borderRadius: 2,
                }}
              >
                {et}
              </span>
            ))}
          </div>

          <p style={{ position: "absolute", bottom: 28, fontSize: 10, color: "#6a6050", letterSpacing: "0.1em" }}>
            {quote.eventDates} · {quote.venueName}
          </p>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "40px 48px" }}>

          {/* Brand Introduction */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 12,
              }}
            >
              About One Thousand Tales
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4a4030" }}>
              We are a boutique photography and cinematography studio rooted in the belief that every story deserves to be told with artistry, care, and timeless elegance. From quiet moments to grand celebrations, One Thousand Tales documents the extraordinary within the ordinary — preserving memories that endure across generations.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4a4030", marginTop: 12 }}>
              Our curated team of photographers and cinematographers bring together years of expertise in wedding, lifestyle, and event documentation — delivering work that is as much art as it is memory.
            </p>
          </section>

          <GoldDivider />

          {/* Client Details */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 16,
              }}
            >
              Client Details
            </h3>
            <div
              style={{
                background: LIGHT,
                border: `1px solid ${BORDER}55`,
                borderRadius: 4,
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 32px",
              }}
            >
              {[
                ["Client Name",  quote.clientName],
                ["Contact",      quote.clientPhone],
                ["Email",        quote.clientEmail],
                ["Location",     quote.clientLocation],
                ["Events",       quote.eventTypes.join(", ")],
                ["Event Dates",  quote.eventDates],
                ["Venue",        quote.venueName],
                ["Quote Ref.",   quote.id.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7a60", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          <GoldDivider />

          {/* Services Included — fixed descriptions, variable event coverage */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 16,
              }}
            >
              Services Included
            </h3>
            <div style={{ border: `1px solid ${BORDER}55`, borderRadius: 4, overflow: "hidden" }}>
              {FIXED_TEMPLATE_SERVICES.map((svc, i) => {
                const coverage = quote.services[i]?.events ?? "";
                return (
                  <div
                    key={svc.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 20px",
                      background: i % 2 === 0 ? CREAM : LIGHT,
                      borderBottom: i < FIXED_TEMPLATE_SERVICES.length - 1 ? `1px solid ${BORDER}33` : "none",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, flexShrink: 0, paddingTop: 2, width: 20 }}>
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 4, lineHeight: 1.4 }}>
                        {svc.name}
                      </p>
                      <p style={{ fontSize: 11, color: "#7a6a50", lineHeight: 1.65, fontStyle: "italic" }}>
                        {svc.description}
                      </p>
                    </div>
                    {coverage && (
                      <div style={{ minWidth: 160, textAlign: "right", flexShrink: 0, paddingTop: 2 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: DARK, lineHeight: 1.65 }}>
                          {coverage}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Cost */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                paddingTop: 20,
                borderTop: `2px solid ${GOLD}`,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: DARK,
                }}
              >
                Total Cost
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>
                INR {rupee(quote.grandTotal)}
              </p>
            </div>
            <p style={{ fontSize: 10, color: "#8a7a60", marginTop: 6 }}>
              * 50% advance to confirm booking · Remaining 50% before event commencement
            </p>
          </section>

          {/* Optional Add-Ons — fixed reference table */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 16,
              }}
            >
              Optional Add-Ons
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: DARK }}>
                  {["Details", "Price"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        padding: "10px 16px",
                        textAlign: h === "Price" ? "right" : "left",
                        fontWeight: 600,
                        color: GOLD,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STANDARD_PROPOSAL_ADDONS.map((a, i) => (
                  <tr key={a.name} style={{ background: i % 2 === 0 ? CREAM : LIGHT }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: DARK }}>{a.name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#7a5a30", textAlign: "right" }}>
                      {a.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <GoldDivider />

          {/* Delivery Timeline */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 16,
              }}
            >
              Delivery Timeline
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DELIVERY_TIMELINE.map((t, i) => (
                <div
                  key={t.phase}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    background: i % 2 === 0 ? LIGHT : "transparent",
                    padding: "12px 16px",
                    borderRadius: 4,
                    borderLeft: `3px solid ${GOLD}`,
                  }}
                >
                  <div style={{ minWidth: 60 }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: DARK,
                        color: GOLD,
                        fontSize: 9,
                        padding: "2px 8px",
                        borderRadius: 2,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK, marginBottom: 2 }}>{t.phase}</p>
                    <p style={{ fontSize: 11, color: "#7a6a50" }}>{t.description}</p>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#7a5a30", whiteSpace: "nowrap" }}>{t.days}</p>
                </div>
              ))}
            </div>
          </section>

          <GoldDivider />

          {/* Terms & Conditions */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 12,
              }}
            >
              Terms &amp; Conditions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Booking is confirmed only upon receipt of 50% advance payment.",
                "Balance payment to be made before commencement of the event.",
                "Cancellation within 30 days of event: 25% of total amount is non-refundable.",
                "Cancellation within 15 days of event: 50% of total amount is non-refundable.",
                "Delivery timelines are indicative and may vary based on event complexity.",
                "OTT retains artistic rights to use edited photographs and videos for portfolio purposes.",
                "This quote is valid for 30 days from the date of issue.",
                "All prices are inclusive of applicable taxes.",
              ].map((term, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: GOLD, fontSize: 12, marginTop: 2, flexShrink: 0 }}>•</span>
                  <p style={{ fontSize: 11, color: "#5a4a30", lineHeight: 1.6 }}>{term}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          {quote.notes && (
            <section style={{ marginBottom: 36 }}>
              <h3
                style={{
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: GOLD,
                  marginBottom: 8,
                }}
              >
                Special Notes
              </h3>
              <div
                style={{
                  background: LIGHT,
                  border: `1px solid ${BORDER}55`,
                  borderRadius: 4,
                  padding: "14px 18px",
                  fontSize: 12,
                  color: "#4a3a20",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                {quote.notes}
              </div>
            </section>
          )}

          <GoldDivider />

          {/* Signature & Approval */}
          <section style={{ marginBottom: 36 }}>
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 20,
              }}
            >
              Approval &amp; Signature
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7a60", marginBottom: 4 }}>
                  For One Thousand Tales
                </p>
                <div style={{ height: 48, borderBottom: `1px solid ${BORDER}`, marginBottom: 8 }}>
                  <p style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: GOLD, fontStyle: "italic", paddingTop: 8 }}>
                    {quote.executiveName}
                  </p>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{quote.executiveName}</p>
                <p style={{ fontSize: 10, color: "#7a6a50" }}>{quote.executivePhone} · {quote.executiveEmail}</p>
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7a60", marginBottom: 4 }}>
                  Client Acceptance
                </p>
                <div
                  style={{
                    height: 48,
                    borderBottom: `1px solid ${BORDER}`,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {quote.signatureData ? (
                    <p style={{ color: "#4a7a50", fontSize: 12 }}>✓ Digitally signed</p>
                  ) : (
                    <p style={{ color: "#b0a080", fontSize: 11, fontStyle: "italic" }}>Awaiting signature</p>
                  )}
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{quote.clientName}</p>
                <p style={{ fontSize: 10, color: "#7a6a50" }}>{quote.clientPhone}</p>
              </div>
            </div>
          </section>

        </div>

        {/* ── Thank You Footer ──────────────────────────────────────────── */}
        <div
          style={{
            background: DARK,
            color: CREAM,
            padding: "36px 48px",
            textAlign: "center",
            borderTop: `4px solid ${GOLD}`,
          }}
        >
          <OTTLogo size={40} />
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "0.15em",
              color: GOLD,
              margin: "16px 0 8px",
            }}
          >
            Thank You
          </p>
          <p style={{ fontSize: 12, color: "#9a8a70", lineHeight: 1.8 }}>
            We are honoured to be considered for your special occasion.<br />
            Every story we tell is crafted with love and devotion.
          </p>
          <div style={{ width: 40, height: 1, background: GOLD, margin: "20px auto 16px" }} />
          <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a5a40" }}>
            One Thousand Tales · onethousandtales.com
          </p>
          <p style={{ fontSize: 9, color: "#4a3a30", marginTop: 4 }}>Quote valid until {quote.validUntil}</p>
        </div>
      </div>
    </div>
  );
}
