import { type SupabaseClient } from "@supabase/supabase-js";

export const STAGES = [
  "enquiry",
  "discussion",
  "quote",
  "negotiation",
  "booked",
  "execution",
  "feedback",
  "post_production",
  "delivery",
] as const;

export type WorkflowStage = (typeof STAGES)[number];

const STAGE_LABEL_MAP: Record<WorkflowStage, string> = {
  enquiry:         "Enquiry",
  discussion:      "Discussion",
  quote:           "Quote",
  negotiation:     "Negotiation",
  booked:          "Booked",
  execution:       "Execution",
  feedback:        "Feedback",
  post_production: "Post Production",
  delivery:        "Delivery",
};

const STAGE_COLOR_MAP: Record<WorkflowStage, string> = {
  enquiry:         "bg-zinc-500/20 border-zinc-500/30 text-zinc-400",
  discussion:      "bg-purple-500/20 border-purple-500/30 text-purple-400",
  quote:           "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
  negotiation:     "bg-orange-500/20 border-orange-500/30 text-orange-400",
  booked:          "bg-teal-500/20 border-teal-500/30 text-teal-400",
  execution:       "bg-blue-500/20 border-blue-500/30 text-blue-400",
  feedback:        "bg-pink-500/20 border-pink-500/30 text-pink-400",
  post_production: "bg-indigo-500/20 border-indigo-500/30 text-indigo-400",
  delivery:        "bg-green-500/20 border-green-500/30 text-green-400",
};

export function getStageLabel(stage: string): string {
  return STAGE_LABEL_MAP[stage as WorkflowStage] ?? stage;
}

export function getStageColor(stage: string): string {
  return STAGE_COLOR_MAP[stage as WorkflowStage] ?? "bg-zinc-500/20 border-zinc-500/30 text-zinc-400";
}

export function getNextStage(stage: string): WorkflowStage | null {
  const idx = STAGES.indexOf(stage as WorkflowStage);
  if (idx === -1 || idx === STAGES.length - 1) return null;
  return STAGES[idx + 1];
}

const BOOKING_TASKS = [
  "Send booking confirmation",
  "Collect advance payment",
  "Plan shot list",
  "Confirm venue and logistics",
  "Day-of shooting",
  "Upload raw files",
];

const POST_PRODUCTION_TASKS = [
  "Cull and select photos",
  "Edit selected photos",
  "Client review round 1",
  "Final edits",
  "Export final gallery",
  "Deliver to client",
];

export async function moveProjectToStage(
  supabase: SupabaseClient,
  projectId: string,
  fromStage: string | null,
  toStage: string,
  userId?: string | null,
  notes?: string,
): Promise<{ message: string }> {
  // 1. Update project stage
  const { data: project, error: updateError } = await supabase
    .from("projects")
    .update({ workflow_stage: toStage })
    .eq("id", projectId)
    .select("id, contact_id, budget")
    .single();

  if (updateError) throw updateError;

  // 2. Log workflow event
  await supabase.from("workflow_events").insert([{
    project_id: projectId,
    from_stage:  fromStage ?? null,
    to_stage:    toStage,
    changed_by:  userId ?? null,
    notes:       notes ?? null,
  }]);

  // 3. Stage-specific side effects
  if (toStage === "quote") {
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("project_id", projectId)
      .eq("type", "quote")
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("invoices").insert([{
        project_id: projectId,
        contact_id: project.contact_id ?? null,
        type:       "quote",
        status:     "draft",
        amount:     project.budget ?? 0,
      }]);
    }
    return { message: "Quote draft created in Accounts." };
  }

  if (toStage === "booked") {
    const { data: existing } = await supabase
      .from("project_tasks")
      .select("id")
      .eq("project_id", projectId)
      .eq("title", BOOKING_TASKS[0])
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("project_tasks").insert(
        BOOKING_TASKS.map((title, i) => ({
          project_id: projectId,
          title,
          status:     "todo",
          position:   i + 1,
        })),
      );
    }
    return { message: "Project booked. Default tasks created." };
  }

  if (toStage === "post_production") {
    const { data: existing } = await supabase
      .from("project_tasks")
      .select("id")
      .eq("project_id", projectId)
      .eq("title", POST_PRODUCTION_TASKS[0])
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("project_tasks").insert(
        POST_PRODUCTION_TASKS.map((title, i) => ({
          project_id: projectId,
          title,
          status:     "todo",
          position:   i + 1,
        })),
      );
    }
    return { message: "Post-production tasks created." };
  }

  if (toStage === "delivery") {
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("project_id", projectId)
      .eq("type", "quote")
      .eq("status", "draft");
    return { message: "Invoice marked as sent for delivery." };
  }

  return { message: `Moved to ${getStageLabel(toStage)}.` };
}
