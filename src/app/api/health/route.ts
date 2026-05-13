import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "vetfiscal-os",
    status: "ok"
  });
}
