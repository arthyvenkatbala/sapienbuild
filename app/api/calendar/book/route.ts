import { NextRequest, NextResponse } from "next/server";
import { bookCalendarForProject } from "@/lib/calendar";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const projectId = body.project_id as string | undefined;
  if (!projectId) {
    return NextResponse.json({ error: "project_id required" }, { status: 422 });
  }

  const result = await bookCalendarForProject(projectId);
  return NextResponse.json(result, { status: result.success ? 200 : 422 });
}
