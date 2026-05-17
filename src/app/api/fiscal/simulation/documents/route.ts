import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createFiscalSimulationService } from "@/modules/fiscal/application/fiscal-simulation-service";
import { createPrismaFiscalSimulationRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-simulation-repository";
import { createSimulatedFiscalDocumentRequestSchema, toSimulatedFiscalDocumentDTO } from "@/modules/fiscal/presentation/fiscal-simulation-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const body = createSimulatedFiscalDocumentRequestSchema.parse(await request.json());
    const service = createFiscalSimulationService({ repository: createPrismaFiscalSimulationRepository(), audit });
    const idempotencyKey = request.headers.get("idempotency-key") ?? body.idempotencyKey ?? "";
    const data = await service.createSimulatedDocument({ context, ...body, idempotencyKey });

    return NextResponse.json({ data: toSimulatedFiscalDocumentDTO(data), requestId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
