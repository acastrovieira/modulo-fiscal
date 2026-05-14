import { NextResponse } from "next/server";
import { getAuditEvent } from "@/modules/audit/application/audit-event-queries";
import { createPrismaAuditEventRepository } from "@/modules/audit/infrastructure/prisma-audit-event-repository";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();
  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    const data = await getAuditEvent({ context, repository: createPrismaAuditEventRepository(), auditEventId: id });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
