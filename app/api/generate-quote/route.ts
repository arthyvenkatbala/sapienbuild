import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { readFile } from "fs/promises";
import { join } from "path";
import { adminSupabase } from "@/lib/supabase-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id:          string;
  name:        string;
  selected:    boolean;
  price:       number;
  events:      string; // session count
  note:        string;
  quantity:    number;
  event_index: number; // 0-based index into invoice_events (sort_order - 1)
}

interface DbEvent {
  id:         string;
  event_name: string;
  event_date: string | null;
  sort_order: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inrNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { invoice_id } = body as { invoice_id?: string };

    if (!invoice_id) {
      return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
    }

    // 1. Fetch invoice with project + contact
    const { data: invoice, error: invErr } = await adminSupabase
      .from("invoices")
      .select(`
        *,
        project:projects ( id, title, location, event_date, event_type ),
        contact:contacts ( id, first_name, last_name )
      `)
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Fetch events for this invoice (sorted by sort_order)
    const { data: rawEvents } = await adminSupabase
      .from("invoice_events")
      .select("id, event_name, event_date, sort_order")
      .eq("invoice_id", invoice_id)
      .order("sort_order", { ascending: true });

    const dbEvents: DbEvent[] = rawEvents ?? [];

    // 3. Read template PDF
    const templatePath = join(
      process.cwd(),
      "public",
      "templates",
      "Standard_template_for_quotes.pdf",
    );
    const templateBytes = await readFile(templatePath);

    // 4. Load PDF
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 5. Embed standard fonts (Helvetica — Latin-1 encoding)
    const boldFont: PDFFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regFont:  PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 6. Target ONLY page 4 (index 3) — never touch other pages
    const page = pdfDoc.getPage(3);

    const dark   = rgb(0.102, 0.102, 0.102); // #1a1a1a
    const grey   = rgb(0.4,   0.4,   0.4);   // #666666
    const silver = rgb(0.55,  0.55,  0.55);  // event date / separator

    function drawAt(
      text: string,
      x: number,
      y: number,
      font: PDFFont,
      size: number,
      color = dark,
    ) {
      if (!text) return;
      page.drawText(text, { x, y, font, size, color });
    }

    // ── CLIENT / EVENT HEADER ────────────────────────────────────────────────

    const contact  = invoice.contact as { first_name?: string; last_name?: string } | null;
    const fullName = `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim();
    const savedName = invoice.client_name as string | null;
    const clientName = savedName ?? (fullName || "Client");

    drawAt(clientName, 45, 735, boldFont, 14);

    const loc =
      (invoice.location as string | null) ??
      (invoice.project as { location?: string | null } | null)?.location ??
      "";
    if (loc) drawAt(`Location:  ${loc}`, 45, 718, regFont, 10);

    const eventDates = invoice.event_dates as string | null;
    if (eventDates) drawAt(`Dates:      ${eventDates}`, 45, 704, regFont, 10);

    // ── SERVICE SECTIONS — grouped by event, no per-service prices ───────────

    const rawItems = invoice.line_items as LineItem[] | null;
    const selected = Array.isArray(rawItems)
      ? rawItems.filter((i) => i.selected)
      : [];

    // Determine events to render.
    // If no DB events saved (old quote), create a synthetic "Event 1" bucket.
    const events: DbEvent[] =
      dbEvents.length > 0
        ? dbEvents
        : [{ id: "default", event_name: "Services", event_date: null, sort_order: 1 }];

    let cy = 665; // top of services area — below the header block

    for (let evIdx = 0; evIdx < events.length; evIdx++) {
      if (cy < 185) break; // leave space for discount + total

      const ev = events[evIdx];

      // Which line items belong to this event?
      // Old line items (no event_index) all fall to event 0.
      const evItems = selected.filter((item) => (item.event_index ?? 0) === evIdx);
      if (!evItems.length) continue; // skip empty events

      // ── Event separator line ────────────────────────────────────────────
      page.drawLine({
        start:     { x: 45,  y: cy + 3 },
        end:       { x: 530, y: cy + 3 },
        thickness: 0.5,
        color:     silver,
        dashArray: [3, 3],
      });
      cy -= 2;

      // ── Event name ──────────────────────────────────────────────────────
      drawAt(ev.event_name.toUpperCase(), 45, cy - 12, boldFont, 10);
      cy -= 12;

      // Event date (if set), in grey, inline after name
      if (ev.event_date) {
        const nameWidth = boldFont.widthOfTextAtSize(ev.event_name.toUpperCase(), 10);
        drawAt(`   ${ev.event_date}`, 45 + nameWidth, cy, regFont, 9, silver);
      }
      cy -= 16; // gap below event heading

      // ── Service names (no prices) ────────────────────────────────────────
      for (const item of evItems) {
        if (cy < 185) break;

        const hasNote = !!item.note?.trim();

        // Bullet + service name
        drawAt(`•  ${item.name}`, 52, cy, regFont, 10);

        // Optional note (grey, smaller)
        if (hasNote) {
          drawAt(item.note.trim(), 64, cy - 11, regFont, 9, grey);
        }

        cy -= hasNote ? 26 : 15;
      }

      cy -= 10; // gap between event sections
    }

    // ── DISCOUNT + TOTAL — placed right below the last service line ───────────

    const total         = Number(invoice.amount) || 0;
    const discountValue = Number(invoice.discount_value) || 0;
    const discountNote  = (invoice.discount_note as string | null) ?? "";

    // Thin separator above the total block
    const sepY = cy - 4;
    page.drawLine({
      start:     { x: 45,  y: sepY },
      end:       { x: 530, y: sepY },
      thickness: 0.5,
      color:     silver,
    });

    let totalCy = sepY - 18; // start writing just below the separator

    if (discountValue > 0) {
      const discLabel = discountNote
        ? `Discount (${discountNote}):  -INR ${inrNumber(discountValue)}`
        : `Discount:  -INR ${inrNumber(discountValue)}`;
      drawAt(discLabel, 45, totalCy, regFont, 10, grey);
      totalCy -= 18;
    }

    const totalText = `Total cost = INR ${inrNumber(total)}`;
    drawAt(totalText, 45, totalCy, boldFont, 13);

    // 7. Serialise
    const pdfBytes = await pdfDoc.save();
    const base64   = Buffer.from(pdfBytes).toString("base64");

    // 8. Invoice number: QT-YYYY-XXXXXX
    const year      = new Date().getFullYear();
    const shortId   = invoice_id.replace(/-/g, "").slice(-6).toUpperCase();
    const invoiceNo = `QT-${year}-${shortId}`;

    // 9. Persist in DB
    await adminSupabase
      .from("invoices")
      .update({ pdf_data: base64, invoice_number: invoiceNo })
      .eq("id", invoice_id);

    return NextResponse.json({ pdf_data: base64, invoice_number: invoiceNo });
  } catch (err) {
    console.error("[generate-quote]", err);
    return NextResponse.json(
      { error: "PDF generation failed", detail: String(err) },
      { status: 500 },
    );
  }
}
