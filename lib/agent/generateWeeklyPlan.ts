// Thin wrapper kept for backward compatibility with the cron route.
// All logic now lives in runContentAgent.ts.
import { runContentAgent } from "./runContentAgent";

export async function generateWeeklyPlan(): Promise<void> {
  await runContentAgent({ generatedBy: "cron" });
}
