import { NextResponse } from "next/server";
import { startScheduler } from "@/lib/jobs/scheduler";

export async function GET() {
  startScheduler();
  return NextResponse.json({ message: "Scheduler started" });
}
