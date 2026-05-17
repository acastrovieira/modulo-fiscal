import { NextResponse } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createFiscalSimulationService } from "@/modules/fiscal/application/fiscal-simulation-service";
import { createPrismaFiscalSimulationRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-simulation-repository";
import { toSimulatedFiscalDocumentDTO } from "@/modules/fiscal/presentation/fiscal-simulation-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();

  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    const service = createFiscalSimulationService({ repository: createPrismaFiscalSimulationRepository(), audit });
    const data = await service.simulateIssueDocument({ context, documentId: id });

    return NextResponse.json({ data: toSimulatedFiscalDocumentDTO(data), requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
