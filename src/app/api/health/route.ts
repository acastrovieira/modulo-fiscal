import { NextResponse } from "next/server";
import { createHealthReport } from "@/modules/observability/application/health-report";

export function GET() {
  return NextResponse.json(createHealthReport());
}
