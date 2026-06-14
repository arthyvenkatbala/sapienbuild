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

    const dark = rgb(0.102, 0.102, 0.102);

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

    // Move header block up to reduce blank space at top of page
    drawAt(clientName, 45, 762, boldFont, 13);

    const loc =
      (invoice.location as string | null) ??
      (invoice.project as { location?: string | null } | null)?.location ??
      "";
    if (loc) drawAt(`Location:  ${loc}`, 45, 748, regFont, 10);

    const eventDates = invoice.event_dates as string | null;
    if (eventDates) drawAt(`Dates:      ${eventDates}`, 45, 735, regFont, 10);

    // ── SERVICE TABLE — Event | Services grid with auto-scaling rows ──────────

    const rawItems = invoice.line_items as LineItem[] | null;
    const selected = Array.isArray(rawItems)
      ? rawItems.filter((i) => i.selected)
      : [];

    const eventsToRender: DbEvent[] =
      dbEvents.length > 0
        ? dbEvents
        : [{ id: "default", event_name: "Services", event_date: null, sort_order: 1 }];

    // Build non-empty event blocks
    interface SvcRow { name: string; note: string; hasNote: boolean; }
    interface EvBlock { name: string; date: string | null; rows: SvcRow[]; }

    const blocks: EvBlock[] = [];
    for (let ei = 0; ei < eventsToRender.length; ei++) {
      const ev    = eventsToRender[ei];
      const items = selected.filter((it) => (it.event_index ?? 0) === ei);
      if (!items.length) continue;
      blocks.push({
        name: ev.event_name,
        date: ev.event_date ?? null,
        rows: items.map((it) => ({
          name:    it.name,
          note:    it.note?.trim() ?? "",
          hasNote: !!it.note?.trim(),
        })),
      });
    }

    // ── TABLE GEOMETRY ───────────────────────────────────────────────────────

    const TBL_X    = 45;
    const TBL_W    = 485;             // 530 - 45
    const COL1_W   = 120;             // width of left "Event" column
    const COL2_X   = TBL_X + COL1_W; // x where "Services" column starts
    const TBL_TOP  = 718;             // start table close below the dates line
    const TBL_FLOOR = 182;            // hard floor — template prose starts below this

    const HDR_H = 20;                 // header row height

    const total         = Number(invoice.amount)         || 0;
    const discountValue = Number(invoice.discount_value) || 0;
    const discountNote  = (invoice.discount_note as string | null) ?? "";
    const FTR_H = discountValue > 0 ? 38 : 26; // footer row height

    // Effective service-row count: notes add 50% extra height per row
    const effRows = blocks.reduce(
      (s, b) => s + b.rows.reduce((ss, r) => ss + (r.hasNote ? 1.5 : 1), 0),
      0,
    );
    // 2pt visual gap between event groups
    const interGapH = Math.max(0, blocks.length - 1) * 2;
    const dataAvail = (TBL_TOP - TBL_FLOOR) - HDR_H - FTR_H - interGapH;
    const ROW_H     = Math.min(15, Math.floor(dataAvail / Math.max(effRows, 1)));
    const NOTE_EXTRA = Math.max(0, Math.floor(ROW_H * 0.5) - 2); // extra height for note

    function svcRowH(r: SvcRow): number {
      return r.hasNote ? ROW_H + NOTE_EXTRA : ROW_H;
    }

    // Actual data height
    const dataTotalH = blocks.reduce(
      (s, b) => s + b.rows.reduce((ss, r) => ss + svcRowH(r), 0),
      0,
    ) + interGapH;

    const TABLE_H   = HDR_H + dataTotalH + FTR_H;
    const TBL_BOT   = TBL_TOP - TABLE_H; // bottom edge of table

    // ── COLOURS ──────────────────────────────────────────────────────────────

    const cBorder  = rgb(0.68, 0.68, 0.68); // grey borders
    const cDivider = rgb(0.82, 0.82, 0.82); // light inter-row lines
    const cHdrFill = rgb(0.89, 0.89, 0.89); // header background
    const cFtrFill = rgb(0.93, 0.93, 0.93); // footer background
    const cText    = rgb(0.10, 0.10, 0.10); // near-black text
    const cSub     = rgb(0.42, 0.42, 0.42); // grey sub-text (notes, dates)

    // Helper — draw a horizontal or vertical rule
    function rule(
      x1: number, y1: number, x2: number, y2: number,
      w = 0.7, col = cBorder,
    ) {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: w, color: col });
    }

    // Helper — vertically-centred text baseline inside a cell
    // cellBotY = bottom Y of cell, cellH = cell height, fs = font size
    function cellBaseline(cellBotY: number, cellH: number, fs: number): number {
      return cellBotY + cellH / 2 - fs / 3;
    }

    // ── FILLS ────────────────────────────────────────────────────────────────

    // Header fill
    page.drawRectangle({
      x:      TBL_X,
      y:      TBL_TOP - HDR_H,
      width:  TBL_W,
      height: HDR_H,
      color:  cHdrFill,
    });

    // Footer fill
    page.drawRectangle({
      x:      TBL_X,
      y:      TBL_BOT,
      width:  TBL_W,
      height: FTR_H,
      color:  cFtrFill,
    });

    // ── BORDER LINES ─────────────────────────────────────────────────────────

    // Outer border (4 sides)
    rule(TBL_X,          TBL_BOT, TBL_X,          TBL_TOP); // left
    rule(TBL_X + TBL_W,  TBL_BOT, TBL_X + TBL_W,  TBL_TOP); // right
    rule(TBL_X,          TBL_TOP, TBL_X + TBL_W,   TBL_TOP); // top
    rule(TBL_X,          TBL_BOT, TBL_X + TBL_W,   TBL_BOT); // bottom

    // Column separator (full height)
    rule(COL2_X, TBL_BOT, COL2_X, TBL_TOP);

    // Header bottom rule
    rule(TBL_X, TBL_TOP - HDR_H, TBL_X + TBL_W, TBL_TOP - HDR_H);

    // Footer top rule
    rule(TBL_X, TBL_BOT + FTR_H, TBL_X + TBL_W, TBL_BOT + FTR_H);

    // ── HEADER TEXT ───────────────────────────────────────────────────────────

    const hdrBotY  = TBL_TOP - HDR_H;
    const hdrBaseY = cellBaseline(hdrBotY, HDR_H, 9);
    // "Event" left-aligned; "Services" right-aligned to match content
    drawAt("Event", TBL_X + 7, hdrBaseY, boldFont, 9, cText);
    const svcHdrW = boldFont.widthOfTextAtSize("Services", 9);
    drawAt("Services", TBL_X + TBL_W - svcHdrW - 8, hdrBaseY, boldFont, 9, cText);

    // ── DATA ROWS ─────────────────────────────────────────────────────────────

    let curY = TBL_TOP - HDR_H; // top of current drawing position (moves down)

    for (let bi = 0; bi < blocks.length; bi++) {
      const blk = blocks[bi];

      // Heavy separator + 2pt gap between event groups
      if (bi > 0) {
        rule(TBL_X, curY, TBL_X + TBL_W, curY);
        curY -= 2;
      }

      const blkH    = blk.rows.reduce((s, r) => s + svcRowH(r), 0);
      const blkTopY = curY;
      const evFs    = blk.name.length > 18 ? 8 : 9;

      // Event name: left-aligned, vertically centred in the block
      const evBaseY = cellBaseline(blkTopY - blkH, blkH, evFs);
      drawAt(blk.name, TBL_X + 7, evBaseY, boldFont, evFs, cText);

      if (blk.date) {
        drawAt(blk.date, TBL_X + 7, evBaseY - evFs - 1, regFont, 7, cSub);
      }

      // Service rows in right column
      for (let si = 0; si < blk.rows.length; si++) {
        const r  = blk.rows[si];
        const rh = svcRowH(r);

        // Thin divider between service rows (right col only, except after last)
        if (si > 0) {
          rule(COL2_X, curY, TBL_X + TBL_W, curY, 0.25, cDivider);
        }

        const rowBotY = curY - rh;

        if (r.hasNote) {
          // Right-align name; note below at same right-edge
          const svcW  = regFont.widthOfTextAtSize(r.name,  9);
          const noteW = regFont.widthOfTextAtSize(r.note, 7.5);
          const rightEdge = TBL_X + TBL_W - 8;
          drawAt(r.name, rightEdge - svcW,  curY - ROW_H * 0.42,      regFont, 9,   cText);
          drawAt(r.note, rightEdge - noteW, curY - ROW_H * 0.42 - 10, regFont, 7.5, cSub);
        } else {
          const svcW = regFont.widthOfTextAtSize(r.name, 9);
          drawAt(r.name, TBL_X + TBL_W - svcW - 8, cellBaseline(rowBotY, rh, 9), regFont, 9, cText);
        }

        curY -= rh;
      }
    }

    // ── FOOTER (TOTAL) ────────────────────────────────────────────────────────

    const ftrTopY = TBL_BOT + FTR_H;

    drawAt(
      "Total Cost",
      TBL_X + 8,
      cellBaseline(TBL_BOT, FTR_H, 10),
      boldFont, 10, cText,
    );

    if (discountValue > 0) {
      const discLabel = discountNote
        ? `Discount (${discountNote}):  −INR ${inrNumber(discountValue)}`
        : `Discount:  −INR ${inrNumber(discountValue)}`;
      drawAt(discLabel, COL2_X + 8, ftrTopY - 12, regFont, 8, cSub);
      drawAt(`INR ${inrNumber(total)}`, COL2_X + 8, ftrTopY - 27, boldFont, 11, cText);
    } else {
      const totalStr = `INR ${inrNumber(total)}`;
      const totalStrW = boldFont.widthOfTextAtSize(totalStr, 11);
      drawAt(
        totalStr,
        TBL_X + TBL_W - totalStrW - 10,
        cellBaseline(TBL_BOT, FTR_H, 11),
        boldFont, 11, cText,
      );
    }

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
