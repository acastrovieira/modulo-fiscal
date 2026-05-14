import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listAuditEvents } from "@/modules/audit/application/audit-event-queries";
import { createPrismaAuditEventRepository } from "@/modules/audit/infrastructure/prisma-audit-event-repository";
import { parseAuditEventQuery } from "@/modules/audit/presentation/audit-event-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export async function GET(request: NextRequest) {
  const requestId = createCorrelationId();
  try {
    const context = await createCommandContext({ correlationId: requestId });
    const filters = parseAuditEventQuery(request.nextUrl.searchParams);
    const data = await listAuditEvents({ context, repository: createPrismaAuditEventRepository(), filters });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

