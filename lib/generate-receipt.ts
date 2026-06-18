import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { adminSupabase } from "@/lib/supabase-admin";

function inrFmt(n: number): string {
  return `INR ${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const TYPE_LABEL: Record<string, string> = {
  advance: "Advance",
  partial: "Partial Payment",
  balance: "Balance Payment",
  full:    "Full Payment",
};

type ContactRow  = { first_name: string | null; last_name: string | null } | null;
type ProjectRow  = { title: string | null } | null;
type InvoiceData = {
  id:             string;
  amount:         number;
  invoice_number: string | null;
  client_name:    string | null;
  project:        ProjectRow | ProjectRow[];
  contact:        ContactRow | ContactRow[];
} | null;

/**
 * Generates a receipt PDF for the given payment and stores it in payments.receipt_pdf_data.
 * Idempotent: if the payment already has a receipt, returns without regenerating.
 * Pass force=true to regenerate (e.g. admin correction).
 */
export async function generatePaymentReceipt(
  paymentId: string,
  force = false,
): Promise<void> {
  // 1. Fetch payment + linked invoice + contact + project
  const { data: payment } = await adminSupabase
    .from("payments")
    .select(`
      id, invoice_id, amount, payment_type, payment_date, method, notes, receipt_pdf_data,
      invoice:invoices (
        id, amount, invoice_number, client_name,
        project:projects ( title ),
        contact:contacts ( first_name, last_name )
      )
    `)
    .eq("id", paymentId)
    .single();

  if (!payment) return;
  if (payment.receipt_pdf_data && !force) return; // idempotency

  // 2. All payments for this invoice to compute running totals
  const { data: allPayments } = await adminSupabase
    .from("payments")
    .select("id, amount")
    .eq("invoice_id", payment.invoice_id)
    .order("payment_date", { ascending: true });

  const inv = (payment.invoice as unknown) as InvoiceData;
  const contact = inv
    ? (Array.isArray(inv.contact) ? inv.contact[0] : inv.contact)
    : null;
  const project = inv
    ? (Array.isArray(inv.project) ? inv.project[0] : inv.project)
    : null;

  const clientName =
    inv?.client_name?.trim() ||
    (contact
      ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()
      : "") ||
    "Client";
  const projectTitle  = project?.title  ?? "";
  const invoiceTotal  = Number(inv?.amount ?? 0);
  const invoiceNumber = inv?.invoice_number ?? "";

  const totalPaid = (allPayments ?? []).reduce(
    (s, p) => s + Number(p.amount), 0,
  );
  const balance = Math.max(0, invoiceTotal - totalPaid);

  // 3. Receipt number: RCPT-YYYY-XXXXXX
  const year      = new Date().getFullYear();
  const shortId   = paymentId.replace(/-/g, "").slice(-6).toUpperCase();
  const receiptNo = `RCPT-${year}-${shortId}`;

  // 4. Build single-page A4 PDF (595 × 842 pts)
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595, 842]);

  const bold: PDFFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg:  PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const dark      = rgb(0.102, 0.102, 0.102);
  const mid       = rgb(0.42,  0.42,  0.42);
  const divLine   = rgb(0.82,  0.82,  0.82);
  const thinDiv   = rgb(0.90,  0.90,  0.90);
  const fillHdr   = rgb(0.89,  0.89,  0.89);
  const greenPaid = rgb(0.15,  0.55,  0.25);
  const amber     = rgb(0.80,  0.50,  0.10);

  const M = 55;            // left margin
  const R = 595 - M;      // right edge
  const W = R - M;        // content width (485)
  const C2 = M + W * 0.55; // right-column x for two-col layout

  let y = 800;

  const draw = (
    text: string,
    x: number,
    yy: number,
    font: PDFFont,
    size: number,
    color = dark,
  ) => {
    if (!text) return;
    page.drawText(text, { x, y: yy, font, size, color });
  };

  const ruleH = (yy: number, col = divLine, th = 0.5) =>
    page.drawLine({
      start: { x: M, y: yy }, end: { x: R, y: yy },
      thickness: th, color: col,
    });

  const fillRect = (yy: number, h: number, col = fillHdr) =>
    page.drawRectangle({ x: M, y: yy, width: W, height: h, color: col });

  // ── HEADER ─────────────────────────────────────────────────────────────────
  draw("ONE THOUSAND TALES", M, y, bold, 17, dark);
  const rcptLbl  = "PAYMENT RECEIPT";
  const rcptLblW = bold.widthOfTextAtSize(rcptLbl, 11);
  draw(rcptLbl, R - rcptLblW, y, bold, 11, mid);
  y -= 14;
  draw("Premium Wedding Photography   ·   Chennai", M, y, reg, 8.5, mid);
  y -= 10;
  ruleH(y);
  y -= 20;

  // ── RECEIPT DETAILS (two-column) ───────────────────────────────────────────
  const LABEL_W = 70; // left-col label column width

  draw("Receipt No:", M, y, reg, 8.5, mid);
  draw(receiptNo, M + LABEL_W, y, bold, 8.5, dark);
  draw("Date:", C2, y, reg, 8.5, mid);
  draw(fmtDate(payment.payment_date), C2 + 35, y, bold, 8.5, dark);
  y -= 14;

  draw("Client:", M, y, reg, 8.5, mid);
  draw(clientName, M + LABEL_W, y, bold, 8.5, dark);
  if (invoiceNumber) {
    draw("Invoice:", C2, y, reg, 8.5, mid);
    draw(invoiceNumber, C2 + 48, y, bold, 8.5, dark);
  }
  y -= 14;

  if (projectTitle) {
    draw("Project:", M, y, reg, 8.5, mid);
    draw(projectTitle, M + LABEL_W, y, reg, 8.5, dark);
    y -= 14;
  }

  y -= 6;
  ruleH(y);
  y -= 20;

  // ── PAYMENT DETAILS SECTION ────────────────────────────────────────────────
  fillRect(y - 4, 18, fillHdr);
  draw("PAYMENT DETAILS", M + 7, y + 1, bold, 8.5, dark);
  y -= 24;

  // Amount paid — large and prominent
  draw("Amount Paid", M + 7, y, reg, 10, mid);
  const amtStr = inrFmt(Number(payment.amount));
  const amtW   = bold.widthOfTextAtSize(amtStr, 14);
  draw(amtStr, R - amtW, y, bold, 14, greenPaid);
  y -= 20;

  ruleH(y, thinDiv, 0.3);
  y -= 13;

  const typeStr = TYPE_LABEL[payment.payment_type as string] ?? payment.payment_type;
  draw("Payment Type", M + 7, y, reg, 8.5, mid);
  draw(typeStr, R - reg.widthOfTextAtSize(typeStr, 8.5), y, reg, 8.5, dark);
  y -= 13;

  if (payment.method) {
    draw("Payment Method", M + 7, y, reg, 8.5, mid);
    draw(payment.method, R - reg.widthOfTextAtSize(payment.method, 8.5), y, reg, 8.5, dark);
    y -= 13;
  }

  if (payment.notes) {
    const note = (payment.notes as string).length > 65
      ? (payment.notes as string).slice(0, 62) + "..."
      : (payment.notes as string);
    draw("Notes", M + 7, y, reg, 8.5, mid);
    draw(note, R - reg.widthOfTextAtSize(note, 8.5), y, reg, 8.5, dark);
    y -= 13;
  }

  y -= 8;
  ruleH(y);
  y -= 20;

  // ── ACCOUNT SUMMARY ────────────────────────────────────────────────────────
  fillRect(y - 4, 18, fillHdr);
  draw("ACCOUNT SUMMARY", M + 7, y + 1, bold, 8.5, dark);
  y -= 24;

  const summaryRows: [string, string, PDFFont, typeof dark][] = [
    ["Invoice Total",      inrFmt(invoiceTotal), reg,  mid],
    ["Total Paid to Date", inrFmt(totalPaid),    bold, greenPaid],
    ["Balance Due",        inrFmt(balance),       bold, balance > 0 ? amber : greenPaid],
  ];

  for (const [label, value, vFont, vColor] of summaryRows) {
    y -= 2;
    draw(label, M + 7, y, reg, 8.5, mid);
    draw(value, R - vFont.widthOfTextAtSize(value, 8.5), y, vFont, 8.5, vColor);
    y -= 13;
    ruleH(y, thinDiv, 0.3);
  }

  if (balance <= 0) {
    y -= 10;
    const paidMsg = "PAID IN FULL";
    const paidW   = bold.widthOfTextAtSize(paidMsg, 10);
    draw(paidMsg, (595 - paidW) / 2, y, bold, 10, greenPaid);
    y -= 8;
  }

  y -= 16;
  ruleH(y, divLine);
  y -= 16;

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  draw(
    "This is an official receipt issued by One Thousand Tales Photography.",
    M, y, reg, 7.5, mid,
  );
  y -= 11;
  draw(
    "Thank you for your payment. For queries contact dilipkumarphotography@gmail.com",
    M, y, reg, 7.5, mid,
  );

  // 5. Serialize
  const pdfBytes = await pdfDoc.save();
  const base64   = Buffer.from(pdfBytes).toString("base64");

  // 6. Persist in DB
  await adminSupabase
    .from("payments")
    .update({ receipt_pdf_data: base64, receipt_number: receiptNo })
    .eq("id", paymentId);
}
