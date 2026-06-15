import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase-admin";

export async function GET() {
  // Invoices/quotes used for payment calculations (must have amount > 0)
  const { data: invoices, error: invErr } = await adminSupabase
    .from("invoices")
    .select(`
      id, amount, type, status, project_id,
      project:projects ( id, title, workflow_stage ),
      contact:contacts ( id, first_name, last_name )
    `)
    .not("project_id", "is", null)
    .in("type", ["quote", "invoice"])
    .gt("amount", 0)
    .order("created_at", { ascending: false });

  if (invErr) {
    console.error("[payment-summary] invoices:", invErr);
    return NextResponse.json({ error: invErr.message }, { status: 500 });
  }

  // All invoice/quote/receipt documents per project for the Documents panel
  const { data: allDocs } = await adminSupabase
    .from("invoices")
    .select(
      "id, type, status, amount, pdf_data, invoice_number, client_name, event_dates, events_list, location, created_at, project_id",
    )
    .not("project_id", "is", null)
    .order("created_at", { ascending: true });

  // All payments
  const { data: payments, error: pyErr } = await adminSupabase
    .from("payments")
    .select("id, invoice_id, project_id, amount, payment_type, payment_date, method, notes, created_at")
    .order("payment_date", { ascending: true });

  if (pyErr) {
    console.error("[payment-summary] payments:", pyErr);
    return NextResponse.json({ error: pyErr.message }, { status: 500 });
  }

  // Index payments by invoice_id
  const paymentsByInvoice = new Map<string, typeof payments>();
  for (const p of payments ?? []) {
    const arr = paymentsByInvoice.get(p.invoice_id) ?? [];
    arr.push(p);
    paymentsByInvoice.set(p.invoice_id, arr);
  }

  // Index documents by project_id
  const docsByProject = new Map<string, typeof allDocs>();
  for (const d of allDocs ?? []) {
    if (!d.project_id) continue;
    const arr = docsByProject.get(d.project_id) ?? [];
    arr.push(d);
    docsByProject.set(d.project_id, arr);
  }

  // Build per-project summary (one canonical row per project)
  const projectMap = new Map<
    string,
    {
      projectId:     string;
      projectTitle:  string;
      clientName:    string;
      quoteStatus:   string | null;
      invoiceTotal:  number;
      invoiceId:     string;
      allInvoiceIds: string[];
    }
  >();

  for (const inv of invoices ?? []) {
    const projectRaw = inv.project as unknown;
    const project = Array.isArray(projectRaw)
      ? (projectRaw[0] as { id: string; title: string; workflow_stage: string | null } | undefined) ?? null
      : (projectRaw as { id: string; title: string; workflow_stage: string | null } | null);
    if (!project) continue;

    const contactRaw = inv.contact as unknown;
    const contact = Array.isArray(contactRaw)
      ? (contactRaw[0] as { first_name: string; last_name: string } | undefined) ?? null
      : (contactRaw as { first_name: string; last_name: string } | null);
    const clientName = contact
      ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim()
      : "—";

    const existing = projectMap.get(project.id);
    if (!existing) {
      projectMap.set(project.id, {
        projectId:     project.id,
        projectTitle:  project.title ?? "Untitled Project",
        clientName,
        quoteStatus:   project.workflow_stage ?? null,
        invoiceTotal:  Number(inv.amount),
        invoiceId:     inv.id,
        allInvoiceIds: [inv.id],
      });
    } else {
      existing.allInvoiceIds.push(inv.id);
      if (Number(inv.amount) > existing.invoiceTotal) {
        existing.invoiceTotal = Number(inv.amount);
        existing.invoiceId    = inv.id;
      }
    }
  }

  const rows = Array.from(projectMap.values()).map((r) => {
    const allPayments = r.allInvoiceIds.flatMap((iid) => paymentsByInvoice.get(iid) ?? []);
    const totalPaid   = allPayments.reduce((s, p) => s + Number(p.amount), 0);
    const balance     = r.invoiceTotal - totalPaid;
    const status      =
      totalPaid <= 0 ? "Pending"       :
      balance   <= 0 ? "Paid in Full"  :
                       "Partially Paid";

    return {
      projectId:    r.projectId,
      projectTitle: r.projectTitle,
      clientName:   r.clientName,
      quoteStatus:  r.quoteStatus,
      invoiceTotal: r.invoiceTotal,
      totalPaid,
      balance:      Math.max(0, balance),
      status,
      invoiceId:    r.invoiceId,
      payments:     allPayments,
      documents:    docsByProject.get(r.projectId) ?? [],
    };
  });

  const ORDER = { Pending: 0, "Partially Paid": 1, "Paid in Full": 2 } as const;
  rows.sort((a, b) => ORDER[a.status as keyof typeof ORDER] - ORDER[b.status as keyof typeof ORDER]);

  return NextResponse.json({ rows });
}
