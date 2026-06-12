import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { readFile } from "fs/promises";
import { join } from "path";
import { adminSupabase } from "@/lib/supabase-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  name: string;
  selected: boolean;
  price: number;
  events: string;
  note: string;
  quantity: number;
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

    // 2. Read template PDF
    const templatePath = join(
      process.cwd(),
      "public",
      "templates",
      "Standard_template_for_quotes.pdf",
    );
    const templateBytes = await readFile(templatePath);

    // 3. Load PDF
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 4. Embed standard fonts (Helvetica — Latin-1 encoding, ₹ not available)
    const boldFont: PDFFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regFont:  PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 5. Target ONLY page 4 (index 3) — never touch other pages
    const page = pdfDoc.getPage(3);

    const white = rgb(1,     1,     1);     // white fill for rectangles
    const dark  = rgb(0.102, 0.102, 0.102); // #1a1a1a
    const grey  = rgb(0.4,   0.4,   0.4);   // #666666

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

    

    // ── Step 3: Write dynamic content on clean areas ─────────────────────────

    // CLIENT NAME
    const contact  = invoice.contact as { first_name?: string; last_name?: string } | null;
    const fullName = `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim();
    const savedName = invoice.client_name as string | null;
    const clientName = savedName ?? (fullName || "Client");

    drawAt(clientName, 45, 735, boldFont, 14);

    // LOCATION
    const loc =
      (invoice.location as string | null) ??
      (invoice.project as { location?: string | null } | null)?.location ??
      "";
    if (loc) drawAt(`Location:  ${loc}`, 45, 718, regFont, 10);

    // DATES
    const eventDates = invoice.event_dates as string | null;
    if (eventDates) drawAt(`Dates:      ${eventDates}`, 45, 704, regFont, 10);

    // EVENTS LIST
    const eventsList = invoice.events_list as string | null;
    if (eventsList) drawAt(`Events :   ${eventsList}`, 45, 690, regFont, 10);

    // ── SERVICE LINE ITEMS ───────────────────────────────────────────────────

    const rawItems = invoice.line_items as LineItem[] | null;
    const selected = Array.isArray(rawItems)
      ? rawItems.filter((i) => i.selected)
      : [];

    let cy = 620;

    for (const item of selected) {
      if (cy < 220) break; // safety: don't overflow into total area

      // Service name — left column
      drawAt(item.name, 45, cy, boldFont, 10);

      // Note below name (grey, smaller)
      if (item.note?.trim()) {
        drawAt(item.note.trim(), 45, cy - 13, regFont, 9, grey);
      }

      // Sessions / events — right column
      const sessions = parseInt(item.events) || 1;
      const evText   = sessions > 1 ? `Sessions - ${sessions}` : "Events - 1";
      drawAt(evText, 430, cy, regFont, 10);

      cy -= 38;
    }

    // ── TOTAL COST ───────────────────────────────────────────────────────────
    const total = Number(invoice.amount) || 0;
    drawAt(inrNumber(total), 220, 158, boldFont, 13);

    // 6. Serialise
    const pdfBytes = await pdfDoc.save();
    const base64   = Buffer.from(pdfBytes).toString("base64");

    // 7. Invoice number: QT-YYYY-XXXXXX
    const year      = new Date().getFullYear();
    const shortId   = invoice_id.replace(/-/g, "").slice(-6).toUpperCase();
    const invoiceNo = `QT-${year}-${shortId}`;

    // 8. Persist in DB
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
